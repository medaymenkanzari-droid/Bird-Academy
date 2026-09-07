import { execSync } from 'node:child_process';
import fs from 'node:fs';

console.log('==================================================');
console.log(' BIRD ACADEMY ENTERPRISE — GENERATION EXÉCUTABLES ');
console.log('==================================================');

// 1. Build Bird Academy (User Application)
console.log('\n[1/3] Génération de l\'application Utilisateur (Bird Academy)...');
execSync('node scripts/buildApp.js user', { stdio: 'inherit' });

console.log('\n[1/3] Empaquetage de l\'exécutable Windows Utilisateur (release-user/)...');
try {
  execSync('npx electron-builder --win --config.directories.output=release-user --config.productName="Bird Academy"', { stdio: 'inherit' });
  console.log('✅ EXÉCUTABLE UTILISATEUR GÉNÉRÉ DANS : release-user/');
} catch (e) {
  console.error('⚠️ Warning lors de l\'empaquetage Electron User:', e.message);
}

// 2. Build Bird Academy Admin
console.log('\n[2/3] Génération de l\'application Admin (Bird Academy Admin)...');
execSync('node scripts/buildApp.js admin', { stdio: 'inherit' });

console.log('\n[2/3] Empaquetage de l\'exécutable Windows Admin (release-admin/)...');
try {
  execSync('npx electron-builder --win --config.directories.output=release-admin --config.productName="Bird Academy Admin"', { stdio: 'inherit' });
  console.log('✅ EXÉCUTABLE ADMIN GÉNÉRÉ DANS : release-admin/');
} catch (e) {
  console.error('⚠️ Warning lors de l\'empaquetage Electron Admin:', e.message);
}

// 3. Android APK (if android environment ready)
console.log('\n[3/3] Génération du package Android Mobile...');
try {
  execSync('npx cap sync android', { stdio: 'inherit' });
  console.log('✅ SYNCHRONISATION CAPACITOR ANDROID REUSSIE.');
} catch (e) {
  console.log('⚠️ Capacitor Android non disponible dans cet environnement (nécessite Android SDK).');
}

console.log('\n==================================================');
console.log(' GÉNÉRATION TERMINÉE DES EXÉCUTABLES ! ');
console.log('==================================================');
