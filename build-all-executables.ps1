# Script d'automatisation des compilations des deux applications (Bird Academy & Bird Academy Admin)
# Usage: .\build-all-executables.ps1

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " 1. Compilation Web Bird Academy (Utilisateur)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
npm run build:user

if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: Echec de la compilation Web Utilisateur." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host " 2. Empaquetage Executable Windows Utilisateur (release-user/)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
npx electron-builder --win --config.directories.output=release-user --config.productName="Bird Academy"

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Executable Windows Utilisateur genere dans: release-user/win-unpacked/" -ForegroundColor Green
} else {
    Write-Host "WARNING: Erreur lors de l'empaquetage Windows Utilisateur." -ForegroundColor Yellow
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host " 3. Compilation Web Bird Academy Admin (Console)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
npm run build:admin

if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: Echec de la compilation Web Admin." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host " 4. Empaquetage Executable Windows Admin (release-admin/)" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
npx electron-builder --win --config.directories.output=release-admin --config.productName="Bird Academy Admin"

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS: Executable Windows Admin genere dans: release-admin/win-unpacked/" -ForegroundColor Green
} else {
    Write-Host "WARNING: Erreur lors de l'empaquetage Windows Admin." -ForegroundColor Yellow
}

Write-Host "`n=========================================" -ForegroundColor Cyan
Write-Host " Processus de génération d'exécutables terminé!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
