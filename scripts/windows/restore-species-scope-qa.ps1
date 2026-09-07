# ==============================================================================
# BIRD ACADEMY ENTERPRISE — SPECIES-SCOPE QA PROFILE RESTORATION SCRIPT
# Path: scripts/windows/restore-species-scope-qa.ps1
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\windows\restore-species-scope-qa.ps1 [-BackupDir "path/to/backup"]
#
# PURPOSE:
# Restores a previously backed up User profile (Bird Academy Enterprise)
# completely reinstating licenses, birds, cages, breeding pairs, and settings.
# ==============================================================================

[CmdletBinding()]
param(
    [string]$BackupDir = ''
)

$ErrorActionPreference = 'Stop'

Write-Host '==================================================================' -ForegroundColor Cyan
Write-Host ' BIRD ACADEMY — RESTAURATION DU PROFIL UTILISATEUR QA            ' -ForegroundColor Cyan
Write-Host '==================================================================' -ForegroundColor Cyan

# 1. Identifier la sauvegarde a restaurer
$backupBaseDir = Join-Path (Get-Location) 'backups\qa-profiles'

if (-not $BackupDir) {
    if (Test-Path $backupBaseDir) {
        $latestBackup = Get-ChildItem -Path $backupBaseDir -Directory | Sort-Object CreationTime -Descending | Select-Object -First 1
        if ($latestBackup) {
            $BackupDir = $latestBackup.FullName
            Write-Host "Derniere sauvegarde detectee automatiquement : ${BackupDir}" -ForegroundColor Yellow
        }
    }
}

if (-not $BackupDir -or -not (Test-Path $BackupDir)) {
    Write-Host "[ERREUR] Repertoire de sauvegarde introuvable : ${BackupDir}" -ForegroundColor Red
    Write-Host 'Veuillez specifier un dossier via : -BackupDir "C:\chemin\vers\backup"' -ForegroundColor Gray
    exit 1
}

$sourceProfileToRestore = Join-Path $BackupDir 'Bird Academy Enterprise'
if (-not (Test-Path $sourceProfileToRestore)) {
    # Check if BackupDir itself is the profile folder
    if (Test-Path (Join-Path $BackupDir 'Local Storage')) {
        $sourceProfileToRestore = $BackupDir
    } else {
        Write-Host '[ERREUR] Le dossier de sauvegarde ne contient pas de profil valide (Bird Academy Enterprise ou Local Storage absent).' -ForegroundColor Red
        exit 1
    }
}

# 2. Fermer les processus Bird Academy User
Write-Host "`n[STEP 1/3] Arret des processus Bird Academy actifs..." -ForegroundColor Yellow
$targetUserProcessNames = @(
    'Bird-Academy-User',
    'Bird-Academy-User-SpeciesScope',
    'Bird Academy Enterprise',
    'react-example'
)

foreach ($procName in $targetUserProcessNames) {
    $cleanName = $procName -replace '\.exe$', ''
    $procs = Get-Process -Name $cleanName -ErrorAction SilentlyContinue
    if ($procs) {
        foreach ($p in $procs) {
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
Start-Sleep -Milliseconds 500

# 3. Restaurer le profil dans %APPDATA%
$appData = $env:APPDATA
$userProfilePath = Join-Path $appData 'Bird Academy Enterprise'

Write-Host "`n[STEP 2/3] Restauration du profil vers : ${userProfilePath}" -ForegroundColor Yellow

if (Test-Path $userProfilePath) {
    Remove-Item -Path $userProfilePath -Recurse -Force -ErrorAction SilentlyContinue
}

Copy-Item -Path $sourceProfileToRestore -Destination $userProfilePath -Recurse -Force

# 4. Confirmation
Write-Host "`n[STEP 3/3] Verification de la restauration..." -ForegroundColor Yellow
$hasRestoredStorage = Test-Path (Join-Path $userProfilePath 'Local Storage')
$statusDbText = if ($hasRestoredStorage) { 'PRESENTE (Restauree)' } else { 'ABSENTE' }
$statusDbColor = if ($hasRestoredStorage) { 'Green' } else { 'Red' }

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host ' RESTAURATION DU PROFIL UTILISATEUR EFFECTUEE AVEC SUCCES       ' -ForegroundColor Green
Write-Host '==================================================================' -ForegroundColor Cyan
Write-Host " Profil restaure  : ${userProfilePath}" -ForegroundColor Yellow
Write-Host " Base de donnees  : ${statusDbText}" -ForegroundColor $statusDbColor
Write-Host "==================================================================`n" -ForegroundColor Cyan
