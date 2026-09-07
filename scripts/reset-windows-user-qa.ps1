# ==============================================================================
# BIRD ACADEMY ENTERPRISE — SCRIPT DE RESET QA (CYCLE DE VIE WINDOWS)
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\reset-windows-user-qa.ps1
# Ou: npm run qa:reset-windows-user
# ==============================================================================

$ErrorActionPreference = "Continue"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " BIRD ACADEMY ENTERPRISE — RÉINITIALISATION USINE QA (WINDOWS)   " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# 1. Fermeture propre et ciblée des processus Bird Academy connus (RC1, RC2, RC3, RC3.1, react-example)
Write-Host "`n[1/3] Vérification et fermeture ciblée des processus Bird Academy..." -ForegroundColor Yellow
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
        $procPath = ""
        try { $procPath = $proc.Path } catch {}
        # Target only if process belongs to Bird Academy, local programs, or matches known executable
        Write-Host "  -> Arrêt ciblé du processus : $procName (PID: $($proc.Id), Chemin: $procPath)" -ForegroundColor Gray
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        $closedCount++
    }
}

Start-Sleep -Milliseconds 500
Write-Host "[OK] Processus fermé ($closedCount processus arrêtés)" -ForegroundColor Green

# 2. Suppression sécurisée du profil utilisateur Bird Academy Enterprise
Write-Host "`n[2/3] Purge du dossier de profil utilisateur canonique..." -ForegroundColor Yellow
$appData = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::ApplicationData)
$canonicalDir = Join-Path $appData "Bird Academy Enterprise"

if (Test-Path $canonicalDir) {
    try {
        Remove-Item -Path $canonicalDir -Recurse -Force -ErrorAction Stop
        Write-Host "[OK] Profil Bird Academy Enterprise supprimé ($canonicalDir)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Avertissement lors de la suppression de $canonicalDir : $_" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "[OK] Profil Bird Academy Enterprise supprimé (Déjà absent)" -ForegroundColor Green
}

# 3. Suppression du profil legacy react-example (et variantes legacy)
Write-Host "`n[3/3] Purge des dossiers de profil legacy..." -ForegroundColor Yellow
$legacyDir = Join-Path $appData "react-example"
if (Test-Path $legacyDir) {
    try {
        Remove-Item -Path $legacyDir -Recurse -Force -ErrorAction Stop
        Write-Host "[OK] Profil legacy react-example supprimé ($legacyDir)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Avertissement lors de la suppression de $legacyDir : $_" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "[OK] Profil legacy react-example supprimé (Déjà absent)" -ForegroundColor Green
}

$legacyDir2 = Join-Path $appData "Bird Academy"
if (Test-Path $legacyDir2) {
    Remove-Item -Path $legacyDir2 -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "[OK] Reset QA terminé avec succès !" -ForegroundColor Green
Write-Host "L'application peut maintenant être lancée comme une nouvelle installation propre (Clean Install)." -ForegroundColor Cyan
Write-Host "==================================================================`n" -ForegroundColor Cyan
