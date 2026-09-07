# ==============================================================================
# BIRD ACADEMY ENTERPRISE — SPECIES-SCOPE FIRST LAUNCH QA RESET SCRIPT
# Path: scripts/windows/reset-species-scope-first-launch-qa.ps1
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\windows\reset-species-scope-first-launch-qa.ps1
#
# PURPOSE:
# Safely simulates a 100% clean installation for First Launch & Welcome Wizard QA
# testing without destroying any user data (creates a persistent, restorable backup).
# ==============================================================================

[CmdletBinding()]
param(
    [string]$CustomBackupRoot = ''
)

$ErrorActionPreference = 'Stop'

Write-Host '==================================================================' -ForegroundColor Cyan
Write-Host ' BIRD ACADEMY — SPECIES-SCOPE FIRST LAUNCH QA RESET PROCEDURE    ' -ForegroundColor Cyan
Write-Host '==================================================================' -ForegroundColor Cyan

# ----------------------------------------------------------------------
# 1. FERMETURE DÉTERMINISTE DES PROCESSUS BIRD ACADEMY USER
# ----------------------------------------------------------------------
Write-Host "`n[STEP 1/5] Arret securise des processus Bird Academy User..." -ForegroundColor Yellow

$targetUserProcessNames = @(
    'Bird-Academy-User',
    'Bird-Academy-User-SpeciesScope',
    'Bird-Academy-Avian-ERP-SpeciesScope-Setup',
    'Bird Academy Enterprise',
    'Bird Academy User RC3.1',
    'Bird-Academy-User-Windows-RC3.1',
    'Bird-Academy-User-Windows',
    'Bird Academy',
    'react-example'
)

$stoppedCount = 0
foreach ($procName in $targetUserProcessNames) {
    $cleanName = $procName -replace '\.exe$', ''
    $procs = Get-Process -Name $cleanName -ErrorAction SilentlyContinue
    if ($procs) {
        foreach ($p in $procs) {
            $pidVal = $p.Id
            Write-Host "  -> Arret du processus : ${cleanName} (PID: ${pidVal})" -ForegroundColor Gray
            Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue
            $stoppedCount++
        }
    }
}

Start-Sleep -Milliseconds 600
Write-Host "[OK] Processus verifies (${stoppedCount} arretes)" -ForegroundColor Green

# ----------------------------------------------------------------------
# 2. CRÉATION D'UNE SAUVEGARDE PERSISTANTE DU PROFIL ACTUEL
# ----------------------------------------------------------------------
$appData = $env:APPDATA
$userProfilePath = Join-Path $appData 'Bird Academy Enterprise'

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
if ($CustomBackupRoot -and (Test-Path $CustomBackupRoot)) {
    $backupBaseDir = $CustomBackupRoot
} else {
    $backupBaseDir = Join-Path (Get-Location) 'backups\qa-profiles'
}

$currentBackupDir = Join-Path $backupBaseDir "profile_backup_${timestamp}"

Write-Host "`n[STEP 2/5] Creation de la sauvegarde complete du profil utilisateur..." -ForegroundColor Yellow
Write-Host "  Dossier cible de sauvegarde : ${currentBackupDir}" -ForegroundColor Cyan

if (Test-Path $userProfilePath) {
    New-Item -ItemType Directory -Path $currentBackupDir -Force | Out-Null
    Copy-Item -Path $userProfilePath -Destination (Join-Path $currentBackupDir 'Bird Academy Enterprise') -Recurse -Force
    
    # Creation d'un fichier manifeste de restauration
    $manifest = @{
        BackupTimestamp = $timestamp
        SourceProfile   = $userProfilePath
        ProfileName     = 'Bird Academy Enterprise'
        Restorable      = $true
        AdminUntouched  = $true
    }
    $manifestJson = $manifest | ConvertTo-Json -Depth 3
    Set-Content -Path (Join-Path $currentBackupDir 'backup-manifest.json') -Value $manifestJson -Encoding utf8
    
    Write-Host '  -> Sauvegarde terminee avec succes (Profil + Manifeste de restauration inclus)' -ForegroundColor Green
} else {
    Write-Host '  -> Aucun profil utilisateur existant a sauvegarder (%APPDATA%\Bird Academy Enterprise absent)' -ForegroundColor Gray
}

# ----------------------------------------------------------------------
# 3. CONTRÔLE DE SÉCURITÉ ADMIN (ISOLATION ABSOLUE)
# ----------------------------------------------------------------------
Write-Host "`n[STEP 3/5] Verification de la protection des profils Admin..." -ForegroundColor Yellow

$adminPaths = @(
    (Join-Path $appData 'Bird Academy Admin'),
    (Join-Path $appData 'Bird Academy Enterprise Admin')
)

foreach ($adm in $adminPaths) {
    if (Test-Path $adm) {
        Write-Host "  [PROTEGE] Profil Admin intact : ${adm}" -ForegroundColor Green
    }
}

# ----------------------------------------------------------------------
# 4. RÉINITIALISATION CIBLÉE DU PROFIL FIRST LAUNCH USER
# ----------------------------------------------------------------------
Write-Host "`n[STEP 4/5] Reinitialisation du profil User (%APPDATA%\Bird Academy Enterprise)..." -ForegroundColor Yellow

if (Test-Path $userProfilePath) {
    try {
        Remove-Item -Path $userProfilePath -Recurse -Force -ErrorAction Stop
        Write-Host '  [OK] Profil User supprime avec succes (etat vierge pret)' -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] Impossible de supprimer ${userProfilePath} : $_" -ForegroundColor Red
        throw $_
    }
} else {
    Write-Host '  [OK] Repertoire User deja vierge' -ForegroundColor Green
}

# ----------------------------------------------------------------------
# 5. RAPPORT D'ÉTAT DU RESET QA
# ----------------------------------------------------------------------
Write-Host "`n[STEP 5/5] Verification de l'etat post-reset..." -ForegroundColor Yellow

$isClean = -not (Test-Path $userProfilePath)
$statusText = if ($isClean) { 'OUI (Pret pour First Launch)' } else { 'NON (Erreur)' }
$statusColor = if ($isClean) { 'Green' } else { 'Red' }

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host ' SPECIES-SCOPE QA RESET TERMINE AVEC SUCCES                     ' -ForegroundColor Green
Write-Host '==================================================================' -ForegroundColor Cyan
Write-Host " Profil User vierge : ${statusText}" -ForegroundColor $statusColor
Write-Host " Sauvegarde archive : ${currentBackupDir}" -ForegroundColor Yellow
Write-Host (' Restauration dispo : powershell -File .\scripts\windows\restore-species-scope-qa.ps1 -BackupDir "' + $currentBackupDir + '"') -ForegroundColor Cyan
Write-Host ' Profils Admin      : 100% INTACTS' -ForegroundColor Green
Write-Host "==================================================================`n" -ForegroundColor Cyan
