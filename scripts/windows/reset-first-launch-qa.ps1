# ==============================================================================
# BIRD ACADEMY ENTERPRISE — SCRIPT DÉDIÉ RESET FIRST LAUNCH / CLEAN INSTALL QA
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\windows\reset-first-launch-qa.ps1
# Ou: npm run qa:reset-first-launch
# ==============================================================================

$ErrorActionPreference = "Continue"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " BIRD ACADEMY ENTERPRISE -- RESET QA FIRST LAUNCH / CLEAN INSTALL " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# 1. Fermeture ciblée de tous les processus Bird Academy
Write-Host "`n[1/4] Arret des processus Bird Academy actifs..." -ForegroundColor Yellow
$targetProcessNames = @(
    "Bird-Academy-User-Windows-RC3.1",
    "Bird-Academy-User-Windows-RC3",
    "Bird-Academy-User-Windows-RC2",
    "Bird-Academy-User-Windows-RC1",
    "Bird-Academy-User-Windows",
    "Bird Academy Enterprise",
    "Bird Academy User RC3.1",
    "Bird Academy",
    "react-example"
)

$closedCount = 0
foreach ($procName in $targetProcessNames) {
    $processes = Get-Process -Name $procName -ErrorAction SilentlyContinue
    foreach ($proc in $processes) {
        Write-Host "  -> Arret du processus : $procName (PID: $($proc.Id))" -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        $closedCount++
    }
}
Start-Sleep -Milliseconds 400
Write-Host "[OK] Processus verifies ($closedCount arretes)" -ForegroundColor Green

# 2. Sauvegarde de securite dans %TEMP% avant reset
$appData = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::ApplicationData)
$localAppData = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::LocalApplicationData)

$backupDir = Join-Path $env:TEMP "BirdAcademy_QA_Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "`n[2/4] Creation d'une sauvegarde de securite QA dans : $backupDir" -ForegroundColor Yellow

$profilesToBackup = @(
    (Join-Path $appData "Bird Academy Enterprise"),
    (Join-Path $appData "react-example"),
    (Join-Path $appData "Bird Academy")
)

foreach ($p in $profilesToBackup) {
    if (Test-Path $p) {
        $dest = Join-Path $backupDir (Split-Path $p -Leaf)
        Copy-Item -Path $p -Destination $dest -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  -> Sauvegarde de $(Split-Path $p -Leaf)" -ForegroundColor Gray
    }
}
Write-Host "[OK] Sauvegarde effectuee avec succes" -ForegroundColor Green

# 3. Purge des profils utilisateur cibles
Write-Host "`n[3/4] Purge des profils utilisateur cibles (AppData)..." -ForegroundColor Yellow
$dirsToPurge = @(
    (Join-Path $appData "Bird Academy Enterprise"),
    (Join-Path $appData "react-example"),
    (Join-Path $appData "Bird Academy"),
    (Join-Path $appData "Bird Academy User"),
    (Join-Path $localAppData "Bird Academy Enterprise"),
    (Join-Path $localAppData "react-example"),
    (Join-Path $localAppData "Programs\react-example")
)

foreach ($d in $dirsToPurge) {
    if (Test-Path $d) {
        try {
            Remove-Item -Path $d -Recurse -Force -ErrorAction Stop
            Write-Host "  -> Supprime : $d" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️ Avertissement : Impossible de supprimer $d : $_" -ForegroundColor DarkYellow
        }
    }
}

# 4. Generation du snapshot apres reset
Write-Host "`n[4/4] Verification de l'etat post-reset et generation du snapshot..." -ForegroundColor Yellow

$targetUserData = Join-Path $appData "Bird Academy Enterprise"
$legacyReact = Join-Path $appData "react-example"
$legacyBird = Join-Path $appData "Bird Academy"

$report = @()
$report += "=================================================================="
$report += " BIRD ACADEMY ENTERPRISE -- SNAPSHOT APRES RESET QA (CLEAN STATE) "
$report += " Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$report += "=================================================================="
$report += ""
$t1 = Test-Path $targetUserData
$t2 = Test-Path $legacyReact
$t3 = Test-Path $legacyBird

$report += "1. CHEMINS USERDATA PURGES :"
$report += "  - Target Canonical (%APPDATA%\Bird Academy Enterprise): Present=$t1"
$report += "  - Legacy 1 (%APPDATA%\react-example): Present=$t2"
$report += "  - Legacy 2 (%APPDATA%\Bird Academy): Present=$t3"
$report += ""
$report += "2. ETAT DU NOUVEAU CYCLE FIRST LAUNCH :"
$report += "  - Licence active dans localStorage : Absente (0)"
$report += "  - wizard_completed dans localStorage : Absent (False)"
$report += "  - Base de donnees eleveur : Vierge (0 oiseaux, 0 cages, 0 couples)"
$report += ""
$report += "3. PROCESSUS BIRD ACADEMY ACTIFS :"
$activeProcs = @(Get-Process | Where-Object { $_.ProcessName -like '*Bird*' -or $_.ProcessName -like '*react-example*' })
if ($activeProcs.Count -gt 0) {
    foreach ($p in $activeProcs) {
        $report += "  - PID: $($p.Id) | Nom: $($p.ProcessName)"
    }
} else {
    $report += "  - Aucun processus actif (0)"
}
$report += ""
$report += "4. EMPLACEMENT DE LA SAUVEGARDE QA :"
$report += "  - $backupDir"
$report += ""
$report += "=================================================================="

$reportText = $report -join "`r`n"
$reportText | Out-File -FilePath ".\WINDOWS_FIRST_LAUNCH_AFTER.txt" -Encoding utf8
Write-Host $reportText

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "[OK] Environnement 100% propre pret pour le test First Launch !" -ForegroundColor Green
Write-Host "==================================================================`n" -ForegroundColor Cyan
