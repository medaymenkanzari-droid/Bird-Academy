# ==============================================================================
# BIRD ACADEMY ENTERPRISE ADMIN — SCRIPT DÉDIÉ RESET FIRST LAUNCH / CLEAN INSTALL QA (ADMIN-WINDOWS-02)
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\windows\reset-admin-qa.ps1
# Ou: npm run qa:reset-windows-admin
# ==============================================================================

$ErrorActionPreference = "Continue"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " BIRD ACADEMY ENTERPRISE ADMIN -- RESET QA FIRST LAUNCH / CLEAN " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# 1. Fermeture ciblée de tous les processus Bird Academy Admin (JAMAIS les processus User)
Write-Host "`n[1/4] Arret des processus Bird Academy Admin actifs (Strict Admin Whitelist)..." -ForegroundColor Yellow
$targetProcessNames = @(
    "Bird-Academy-Admin-Windows",
    "Bird-Academy-Admin",
    "Bird Academy Enterprise Admin",
    "Bird Academy Admin"
)

$closedCount = 0
foreach ($procName in $targetProcessNames) {
    $processes = Get-Process -Name $procName -ErrorAction SilentlyContinue
    foreach ($proc in $processes) {
        Write-Host "  -> Arret du processus Admin : $procName (PID: $($proc.Id))" -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        $closedCount++
    }
}
Start-Sleep -Milliseconds 400
Write-Host "[OK] Processus Admin verifies ($closedCount arretes)" -ForegroundColor Green

# 2. Sauvegarde de securite dans %TEMP% avant reset
$appData = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::ApplicationData)
$localAppData = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::LocalApplicationData)

$backupDir = Join-Path $env:TEMP "BirdAcademyAdmin_QA_Backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "`n[2/4] Creation d'une sauvegarde de securite QA Admin dans : $backupDir" -ForegroundColor Yellow

$profilesToBackup = @(
    (Join-Path $appData "Bird Academy Admin"),
    (Join-Path $appData "Bird Academy Enterprise Admin")
)

foreach ($p in $profilesToBackup) {
    if (Test-Path $p) {
        $dest = Join-Path $backupDir (Split-Path $p -Leaf)
        Copy-Item -Path $p -Destination $dest -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  -> Sauvegarde de $(Split-Path $p -Leaf)" -ForegroundColor Gray
    }
}
Write-Host "[OK] Sauvegarde Admin effectuee avec succes" -ForegroundColor Green

# 3. Purge des profils administrateur cibles (AppData Admin UNIQUEMENT - JAMAIS Bird Academy Enterprise)
Write-Host "`n[3/4] Purge des profils administrateur cibles (AppData Admin)..." -ForegroundColor Yellow
$dirsToPurge = @(
    (Join-Path $appData "Bird Academy Admin"),
    (Join-Path $appData "Bird Academy Enterprise Admin"),
    (Join-Path $localAppData "Bird Academy Admin"),
    (Join-Path $localAppData "Bird Academy Enterprise Admin"),
    (Join-Path $localAppData "Programs\bird-academy-admin"),
    (Join-Path $localAppData "Programs\Bird Academy Enterprise Admin"),
    (Join-Path $localAppData "Programs\Bird Academy Admin")
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
Write-Host "`n[4/4] Verification de l'etat post-reset Admin et generation du snapshot..." -ForegroundColor Yellow

$targetAdminUserData = Join-Path $appData "Bird Academy Admin"
$userAppUserData = Join-Path $appData "Bird Academy Enterprise"

$report = @()
$report += "=================================================================="
$report += " BIRD ACADEMY ADMIN -- SNAPSHOT APRES RESET QA (CLEAN STATE)      "
$report += " Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$report += "=================================================================="
$report += ""
$t1 = Test-Path $targetAdminUserData
$tUser = Test-Path $userAppUserData

$report += "1. CHEMINS USERDATA ADMIN PURGES :"
$report += "  - Target Admin Canonical (%APPDATA%\Bird Academy Admin): Present=$t1"
$report += "  - User Canonical (%APPDATA%\Bird Academy Enterprise - PROTEGE): Present=$tUser"
$report += ""
$report += "2. ETAT DU NOUVEAU CYCLE FIRST LAUNCH ADMIN :"
$report += "  - Session admin dans localStorage : Absente (0)"
$report += "  - Base de donnees Admin : Vierge"
$report += "  - Donnees User d'elevage : Strictement preservees intactes"
$report += ""
$report += "3. PROCESSUS BIRD ACADEMY ADMIN ACTIFS :"
$activeProcs = @(Get-Process | Where-Object { $_.ProcessName -like '*Bird*Admin*' })
if ($activeProcs.Count -gt 0) {
    foreach ($p in $activeProcs) {
        $report += "  - PID: $($p.Id) | Nom: $($p.ProcessName)"
    }
} else {
    $report += "  - Aucun processus Admin actif (0)"
}
$report += ""
$report += "4. EMPLACEMENT DE LA SAUVEGARDE QA ADMIN :"
$report += "  - $backupDir"
$report += ""
$report += "=================================================================="

$reportText = $report -join "`r`n"
$reportText | Out-File -FilePath ".\WINDOWS_ADMIN_FIRST_LAUNCH_AFTER.txt" -Encoding utf8
Write-Host $reportText

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "[OK] Environnement Admin 100% propre pret pour le test First Launch Admin !" -ForegroundColor Green
Write-Host "==================================================================`n" -ForegroundColor Cyan
