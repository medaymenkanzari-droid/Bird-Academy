import fs from 'node:fs';
import path from 'node:path';

const distUserDir = path.join(process.cwd(), 'dist_user');
console.log('--- ÉTAPE 4: INSPECTION BUNDLE ANDROID FINAL ---');
console.log('Dossier analysé:', distUserDir);

if (!fs.existsSync(distUserDir)) {
  console.error('Erreur: dist_user introuvable.');
  process.exit(1);
}

const files = fs.readdirSync(path.join(distUserDir, 'assets'));
const jsFiles = files.filter(f => f.endsWith('.js'));

console.log(`Fichiers JS trouvés (${jsFiles.length}):`, jsFiles);

const keywords = ['localhost', '127.0.0.1', '0.0.0.0', '192.168.', '10.', 'http://localhost:3001', 'http://localhost:3000'];

for (const file of jsFiles) {
  const content = fs.readFileSync(path.join(distUserDir, 'assets', file), 'utf-8');
  for (const kw of keywords) {
    if (content.includes(kw)) {
      console.log(`[ALERTE] Trouvé "${kw}" dans dist_user/assets/${file}`);
    }
  }
}
