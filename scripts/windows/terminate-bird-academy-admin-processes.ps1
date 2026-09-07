<#
.SYNOPSIS
    BIRD ACADEMY ENTERPRISE ADMIN — PROCESS TREE TERMINATION & PRE-INSTALL CLEANUP (ADMIN-WINDOWS-02)
    Safely and deterministically terminates all Bird Academy Admin processes and orphaned child processes
    prior to uninstallation and installation steps, with ZERO interference with Bird Academy User processes.
#>

$ErrorActionPreference = 'SilentlyContinue'

$logPath = [System.IO.Path]::Combine($env:TEMP, "BirdAcademyAdminInstallerDebug.log")

function Write-InstallerLog {
    param([string]$Message)
    $timestamp = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff')
    $entry = "$timestamp $Message"
    try {
        $entry | Out-File -FilePath $logPath -Append -Encoding utf8 -ErrorAction SilentlyContinue
    } catch {}
}

Write-InstallerLog "[ADMIN-FIX4-INIT] Bird Academy Admin Process Termination Started (Strict Admin Whitelist)"

# Whitelist of recognized Bird Academy Admin application binary names (NEVER includes User binaries)
$whitelistedNames = @(
    "Bird Academy Enterprise Admin.exe",
    "Bird Academy Admin.exe",
    "Bird-Academy-Admin-Windows.exe",
    "Bird-Academy-Admin.exe"
)

# Whitelist of recognized Bird Academy Admin installation directory path keywords
$whitelistedPathKeywords = @(
    "Programs\bird-academy-admin",
    "Programs\Bird Academy Enterprise Admin",
    "Programs\Bird Academy Admin"
)

Write-InstallerLog "[ADMIN-FIX4-SCAN] Scanning active processes using CIM / Win32_Process..."

$allProcesses = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)

$myPid = $PID
$myProc = Get-CimInstance Win32_Process -Filter "ProcessId = $myPid" -ErrorAction SilentlyContinue
$parentPid = if ($myProc -and $myProc.ParentProcessId) { [int]$myProc.ParentProcessId } else { 0 }
Write-InstallerLog "[ADMIN-FIX4-INIT] PowerShell PID=$myPid Parent PID=$parentPid"

$rootPids = [System.Collections.Generic.HashSet[int]]::new()
$allTargetPids = [System.Collections.Generic.HashSet[int]]::new()
$processInfoMap = @{}

# Phase 1: Identify all root Bird Academy Admin processes
foreach ($proc in $allProcesses) {
    if (-not $proc -or -not $proc.ProcessId) { continue }
    $pidNum = [int]$proc.ProcessId
    $ppidNum = [int]$proc.ParentProcessId
    $name = [string]$proc.Name
    $path = [string]$proc.ExecutablePath
    $cmd = [string]$proc.CommandLine

    # Protect own process, parent installer process, and any setup/installer executables
    if ($pidNum -eq $myPid -or $pidNum -eq $parentPid) { continue }
    if ($name -like "*Setup.exe" -or $name -like "*Installer.exe" -or $name -like "*Uninstall*.exe" -or $name -eq "powershell.exe" -or $name -eq "conhost.exe" -or $name -eq "cmd.exe") { continue }

    $isTarget = $false

    # Match Criterion 1: Binary Name whitelist
    if ($name -and ($whitelistedNames -contains $name)) {
        $isTarget = $true
    }

    # Match Criterion 2: Install Path keywords
    if (-not $isTarget -and $path) {
        foreach ($kw in $whitelistedPathKeywords) {
            if ($path.IndexOf($kw, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                $isTarget = $true
                break
            }
        }
    }

    if ($isTarget) {
        $null = $rootPids.Add($pidNum)
        $null = $allTargetPids.Add($pidNum)
        $processInfoMap[$pidNum] = @{
            Name = $name
            PPID = $ppidNum
            Path = $path
            Cmd  = $cmd
            IsChild = $false
        }
        Write-InstallerLog "[ADMIN-FIX4-PROCESS] Name=$name PID=$pidNum ParentPID=$ppidNum Path=$path"
        Write-InstallerLog "[ADMIN-FIX4-PID] Target Admin Root PID Registered: $pidNum"
        if ($cmd) {
            Write-InstallerLog "[ADMIN-FIX4-CMD] PID=$pidNum CommandLine=$cmd"
        }
    }
}

# Phase 2: Recursively identify all child processes belonging to target roots
$addedNewChild = $true
while ($addedNewChild) {
    $addedNewChild = $false
    foreach ($proc in $allProcesses) {
        if (-not $proc -or -not $proc.ProcessId) { continue }
        $pidNum = [int]$proc.ProcessId
        $ppidNum = [int]$proc.ParentProcessId
        $name = [string]$proc.Name
        $path = [string]$proc.ExecutablePath
        $cmd = [string]$proc.CommandLine

        if ($pidNum -eq $myPid -or $pidNum -eq $parentPid) { continue }
        if ($name -like "*Setup.exe" -or $name -like "*Installer.exe") { continue }

        if ($allTargetPids.Contains($ppidNum) -and -not $allTargetPids.Contains($pidNum)) {
            $null = $allTargetPids.Add($pidNum)
            $addedNewChild = $true
            
            # Determine process role/type (e.g. gpu-process, renderer, utility, crashpad_handler)
            $procType = "child-process"
            if ($cmd -match '--type=gpu-process') {
                $procType = "gpu-process"
            } elseif ($cmd -match '--type=renderer') {
                $procType = "renderer"
            } elseif ($cmd -match '--type=utility') {
                $procType = "utility"
            } elseif ($cmd -match '--type=([a-zA-Z0-9_-]+)') {
                $procType = $matches[1]
            } elseif ($name -match 'crashpad') {
                $procType = "crashpad_handler"
            }

            $processInfoMap[$pidNum] = @{
                Name = $name
                PPID = $ppidNum
                Path = $path
                Cmd  = $cmd
                IsChild = $true
                Type = $procType
            }
            Write-InstallerLog "[ADMIN-FIX4-CHILD] PID=$pidNum ParentPID=$ppidNum Name=$name Type=$procType Path=$path"
        }
    }
}

Write-InstallerLog "[ADMIN-FIX4-SCAN] Total Admin Target PIDs Identified (Roots + Children): $($allTargetPids.Count)"

# Phase 3: Graceful window closure attempt for interactive processes
foreach ($pidNum in $rootPids) {
    try {
        $p = [System.Diagnostics.Process]::GetProcessById($pidNum)
        if ($p -and $p.MainWindowHandle -ne [System.IntPtr]::Zero) {
            Write-InstallerLog "[ADMIN-FIX4-GRACEFUL] Requesting CloseMainWindow on Admin PID=$pidNum"
            $null = $p.CloseMainWindow()
        }
    } catch {}
}

Start-Sleep -Milliseconds 150

# Phase 4: Deterministic PID-First termination
# Terminate children first, then root parents
$sortedPids = @($allTargetPids | Sort-Object { if ($processInfoMap[$_].IsChild) { 0 } else { 1 } })

foreach ($pidNum in $sortedPids) {
    Write-InstallerLog "[ADMIN-FIX4-FORCE] Force Killing Admin PID=$pidNum"
    try {
        & "$env:SystemRoot\System32\taskkill.exe" /F /PID $pidNum 2>&1 | Out-Null
    } catch {}
    try {
        Stop-Process -Id $pidNum -Force -ErrorAction SilentlyContinue
    } catch {}
    Write-InstallerLog "[ADMIN-FIX4-FORCE-RESULT] Admin PID=$pidNum Termination Command Dispatched"
}

Start-Sleep -Milliseconds 250

# Phase 5: Verification scan
$residualCount = 0
$checkProcesses = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)

foreach ($proc in $checkProcesses) {
    if (-not $proc -or -not $proc.ProcessId) { continue }
    $pidNum = [int]$proc.ProcessId
    $name = [string]$proc.Name
    $path = [string]$proc.ExecutablePath

    if ($pidNum -eq $myPid -or $pidNum -eq $parentPid) { continue }
    if ($name -like "*Setup.exe" -or $name -like "*Installer.exe" -or $name -like "*Uninstall*.exe" -or $name -eq "powershell.exe" -or $name -eq "conhost.exe") { continue }

    $isResidual = $false
    if ($name -and ($whitelistedNames -contains $name)) {
        $isResidual = $true
    }
    if (-not $isResidual -and $path) {
        foreach ($kw in $whitelistedPathKeywords) {
            if ($path.IndexOf($kw, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                $isResidual = $true
                break
            }
        }
    }

    if ($isResidual) {
        $residualCount++
        Write-InstallerLog "[ADMIN-FIX4-RESIDUAL] Residual Admin Process Found: PID=$pidNum Name=$name Path=$path -> Terminating"
        try {
            & "$env:SystemRoot\System32\taskkill.exe" /F /PID $pidNum | Out-Null
        } catch {}
        try {
            Stop-Process -Id $pidNum -Force -ErrorAction SilentlyContinue
        } catch {}
    }
}

if ($residualCount -eq 0) {
    Write-InstallerLog "[ADMIN-FIX4-VERIFY] Clean State Confirmed: 0 Residual Admin Processes"
} else {
    Write-InstallerLog "[ADMIN-FIX4-VERIFY] Resolved $residualCount residual admin processes"
}

Write-InstallerLog "[ADMIN-FIX4-COMPLETE] PID-First Admin Process Tree Termination Finished Successfully"
exit 0
