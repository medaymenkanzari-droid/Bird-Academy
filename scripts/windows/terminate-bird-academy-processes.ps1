<#
.SYNOPSIS
    BIRD ACADEMY ENTERPRISE — PROCESS TREE TERMINATION & PRE-INSTALL CLEANUP
    Safely and deterministically terminates all Bird Academy processes and orphaned child processes
    prior to uninstallation and installation steps, and ensures legacy directories do not block setup.
#>

$ErrorActionPreference = 'SilentlyContinue'

$logPath = [System.IO.Path]::Combine($env:TEMP, "BirdAcademyInstallerDebug.log")

function Write-InstallerLog {
    param([string]$Message)
    $timestamp = (Get-Date -Format 'yyyy-MM-dd HH:mm:ss.fff')
    $entry = "$timestamp $Message"
    try {
        $entry | Out-File -FilePath $logPath -Append -Encoding utf8 -ErrorAction SilentlyContinue
    } catch {}
}

Write-InstallerLog "[FIX4-INIT] Bird Academy Process Termination Started"

# Whitelist of recognized Bird Academy application binary names
$whitelistedNames = @(
    "Bird-Academy-User.exe",
    "Bird Academy Enterprise.exe",
    "Bird Academy User RC3.1.exe",
    "Bird-Academy-User-Windows-RC3.1.exe",
    "Bird Academy User RC3.exe",
    "Bird-Academy-User-Windows-RC3.exe",
    "Bird Academy User RC2.exe",
    "Bird-Academy-User-Windows-RC2.exe",
    "Bird-Academy-User-Windows-RC1.exe",
    "Bird Academy.exe",
    "react-example.exe"
)

# Whitelist of recognized Bird Academy installation directory path keywords
$whitelistedPathKeywords = @(
    "Programs\bird-academy-user",
    "Programs\react-example",
    "Programs\Bird Academy Enterprise",
    "Programs\Bird Academy User",
    "Programs\Bird Academy",
    "Temp\3IET",
    "Temp\test_pid_tree"
)

Write-InstallerLog "[FIX4-SCAN] Scanning active processes using CIM / Win32_Process..."

$allProcesses = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)

$myPid = $PID
$myProc = Get-CimInstance Win32_Process -Filter "ProcessId = $myPid" -ErrorAction SilentlyContinue
$parentPid = if ($myProc -and $myProc.ParentProcessId) { [int]$myProc.ParentProcessId } else { 0 }
Write-InstallerLog "[FIX4-INIT] PowerShell PID=$myPid Parent PID=$parentPid"

$rootPids = [System.Collections.Generic.HashSet[int]]::new()
$allTargetPids = [System.Collections.Generic.HashSet[int]]::new()
$processInfoMap = @{}

# Phase 1: Identify all root Bird Academy processes
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
        Write-InstallerLog "[FIX4-PROCESS] Name=$name PID=$pidNum ParentPID=$ppidNum Path=$path"
        if ($cmd) {
            Write-InstallerLog "[FIX4-CMD] PID=$pidNum CommandLine=$cmd"
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
            Write-InstallerLog "[FIX4-CHILD] PID=$pidNum ParentPID=$ppidNum Name=$name Type=$procType Path=$path"
        }
    }
}

Write-InstallerLog "[FIX4-SCAN] Total Target PIDs Identified (Roots + Children): $($allTargetPids.Count)"

# Phase 3: Graceful window closure attempt for interactive processes
foreach ($pidNum in $rootPids) {
    try {
        $p = [System.Diagnostics.Process]::GetProcessById($pidNum)
        if ($p -and $p.MainWindowHandle -ne [System.IntPtr]::Zero) {
            Write-InstallerLog "[FIX4-GRACEFUL] Requesting CloseMainWindow on PID=$pidNum"
            $null = $p.CloseMainWindow()
        }
    } catch {}
}

Start-Sleep -Milliseconds 150

# Phase 4: Deterministic PID-First termination
# Terminate children first, then root parents
$sortedPids = @($allTargetPids | Sort-Object { if ($processInfoMap[$_].IsChild) { 0 } else { 1 } })

foreach ($pidNum in $sortedPids) {
    Write-InstallerLog "[FIX4-FORCE] Force Killing PID=$pidNum"
    try {
        & "$env:SystemRoot\System32\taskkill.exe" /F /PID $pidNum 2>&1 | Out-Null
    } catch {}
    try {
        Stop-Process -Id $pidNum -Force -ErrorAction SilentlyContinue
    } catch {}
    Write-InstallerLog "[FIX4-FORCE-RESULT] PID=$pidNum Termination Command Dispatched"
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
        Write-InstallerLog "[FIX4-RESIDUAL] Residual Process Found: PID=$pidNum Name=$name Path=$path -> Terminating"
        try {
            & "$env:SystemRoot\System32\taskkill.exe" /F /PID $pidNum | Out-Null
        } catch {}
        try {
            Stop-Process -Id $pidNum -Force -ErrorAction SilentlyContinue
        } catch {}
    }
}

if ($residualCount -eq 0) {
    Write-InstallerLog "[FIX4-VERIFY] Clean State Confirmed: 0 Residual Bird Academy Processes"
} else {
    Write-InstallerLog "[FIX4-VERIFY] Resolved $residualCount residual processes"
}

# Phase 6: Pre-emptive legacy directory & registry cleanup (react-example migration)
$legacyDir = [System.IO.Path]::Combine($env:LOCALAPPDATA, "Programs", "react-example")
if (Test-Path $legacyDir) {
    Write-InstallerLog "[FIX4-LEGACY] Found legacy directory $legacyDir -> Cleaning"
    try {
        Remove-Item -Path $legacyDir -Recurse -Force -ErrorAction SilentlyContinue
        Write-InstallerLog "[FIX4-LEGACY] Legacy directory cleaned successfully"
    } catch {
        Write-InstallerLog "[FIX4-LEGACY] Error cleaning legacy directory: $_"
    }
}

# Ensure legacy uninstaller registry key pointing to react-example does not trigger uninstaller loop
$uninstallRegKey = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\d7f58838-56a5-5d90-8f7a-f393864b0e80"
try {
    $item = Get-ItemProperty -Path $uninstallRegKey -ErrorAction SilentlyContinue
    if ($item -and $item.UninstallString -like "*react-example*") {
        Write-InstallerLog "[FIX4-LEGACY] Removing legacy registry key pointing to react-example"
        Remove-Item -Path $uninstallRegKey -Force -ErrorAction SilentlyContinue
    }
} catch {}

Write-InstallerLog "[FIX4-COMPLETE] PID-First Process Tree Termination Finished Successfully"
exit 0
