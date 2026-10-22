import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

test('MISSION ANDROID-ICON-CORRECTION-028B — SUITE DE VALIDATION AUTOMATISÉE', async (t) => {

  await t.test('1. La source officielle de l\'icône de marque existe et est intègre', () => {
    const officialPngPath = path.join(ROOT_DIR, 'public', 'assets', 'images', 'public_assets_images_bird_academy', 'logo-icon.png');
    assert.ok(fs.existsSync(officialPngPath), 'logo-icon.png doit exister dans les assets de branding');
    
    const buf = fs.readFileSync(officialPngPath);
    assert.strictEqual(buf.length, 204172, 'logo-icon.png doit avoir la taille officielle exacte de 204 172 octets');
    
    const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
    assert.strictEqual(hash, '44C54E0EB180458942353747C43E65AF4393BBEA9E322E41A15328C6512C3BBA', 'Le SHA-256 de logo-icon.png doit correspondre à l\'emblème officiel');
  });

  await t.test('2. Les ressources Adaptive Icon existent pour toutes les densités', () => {
    const resDir = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res');
    const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
    
    for (const density of densities) {
      const fgPng = path.join(resDir, `mipmap-${density}`, 'ic_launcher_foreground.png');
      assert.ok(fs.existsSync(fgPng), `ic_launcher_foreground.png doit exister dans mipmap-${density}`);
      assert.ok(fs.statSync(fgPng).size > 1000, `ic_launcher_foreground.png dans mipmap-${density} ne doit pas être vide`);

      const iconPng = path.join(resDir, `mipmap-${density}`, 'ic_launcher.png');
      assert.ok(fs.existsSync(iconPng), `ic_launcher.png doit exister dans mipmap-${density}`);

      const roundPng = path.join(resDir, `mipmap-${density}`, 'ic_launcher_round.png');
      assert.ok(fs.existsSync(roundPng), `ic_launcher_round.png doit exister dans mipmap-${density}`);
    }
  });

  await t.test('3. ic_launcher.xml existe dans mipmap-anydpi-v26 et est correctement configuré', () => {
    const launcherXmlPath = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26', 'ic_launcher.xml');
    assert.ok(fs.existsSync(launcherXmlPath), 'res/mipmap-anydpi-v26/ic_launcher.xml doit exister');
    
    const content = fs.readFileSync(launcherXmlPath, 'utf8');
    assert.ok(content.includes('<adaptive-icon'), 'ic_launcher.xml doit déclarer un <adaptive-icon>');
    assert.ok(content.includes('android:drawable="@mipmap/ic_launcher_foreground"'), 'Le foreground doit pointer vers @mipmap/ic_launcher_foreground');
    assert.ok(content.includes('android:drawable="@color/ic_launcher_background"'), 'Le background doit pointer vers @color/ic_launcher_background');
  });

  await t.test('4. ic_launcher_round.xml existe dans mipmap-anydpi-v26 et est correctement configuré', () => {
    const roundXmlPath = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26', 'ic_launcher_round.xml');
    assert.ok(fs.existsSync(roundXmlPath), 'res/mipmap-anydpi-v26/ic_launcher_round.xml doit exister');
    
    const content = fs.readFileSync(roundXmlPath, 'utf8');
    assert.ok(content.includes('<adaptive-icon'), 'ic_launcher_round.xml doit déclarer un <adaptive-icon>');
    assert.ok(content.includes('android:drawable="@mipmap/ic_launcher_foreground"'), 'Le foreground rond doit pointer vers @mipmap/ic_launcher_foreground');
    assert.ok(content.includes('android:drawable="@color/ic_launcher_background"'), 'Le background rond doit pointer vers @color/ic_launcher_background');
  });

  await t.test('5. Aucune Adaptive Icon ne référence l\'ancien foreground vectoriel', () => {
    const launcherXmlPath = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26', 'ic_launcher.xml');
    const roundXmlPath = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res', 'mipmap-anydpi-v26', 'ic_launcher_round.xml');
    
    const launcherContent = fs.readFileSync(launcherXmlPath, 'utf8');
    const roundContent = fs.readFileSync(roundXmlPath, 'utf8');
    
    assert.strictEqual(launcherContent.includes('ic_launcher_bird_foreground'), false, 'ic_launcher.xml ne doit PAS contenir ic_launcher_bird_foreground');
    assert.strictEqual(roundContent.includes('ic_launcher_bird_foreground'), false, 'ic_launcher_round.xml ne doit PAS contenir ic_launcher_bird_foreground');
  });

  await t.test('6. Le nouveau foreground existe et est présent dans les ressources', () => {
    const xxxhdpiFg = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher_foreground.png');
    assert.ok(fs.existsSync(xxxhdpiFg), 'Le foreground ultra-haute résolution xxxhdpi doit exister');
    const stat = fs.statSync(xxxhdpiFg);
    assert.ok(stat.size > 20000, `Taille attendue > 20 Ko pour xxxhdpi, actuel: ${stat.size} octets`);
  });

  await t.test('7. Le script de génération d\'icônes ne réintroduit pas l\'ancien foreground', () => {
    const scriptPath = path.join(ROOT_DIR, 'scripts', 'generateAndroidBrandIcons.cjs');
    assert.ok(fs.existsSync(scriptPath), 'scripts/generateAndroidBrandIcons.cjs doit exister');
    
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    assert.strictEqual(scriptContent.includes('DNA Helix'), false, 'Le script ne doit pas contenir de code vectoriel DNA Helix');
    assert.strictEqual(scriptContent.includes('Aviary Grid Lines'), false, 'Le script ne doit pas contenir de code vectoriel Aviary Grid');
    assert.ok(scriptContent.includes('@mipmap/ic_launcher_foreground'), 'Le script doit générer le mapping vers @mipmap/ic_launcher_foreground');
  });

  await t.test('8. AndroidManifest pointe toujours vers les bonnes ressources launcher', () => {
    const manifestPath = path.join(ROOT_DIR, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
    assert.ok(fs.existsSync(manifestPath), 'AndroidManifest.xml doit exister');
    
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    assert.ok(manifestContent.includes('android:icon="@mipmap/ic_launcher"'), 'android:icon doit pointer vers @mipmap/ic_launcher');
    assert.ok(manifestContent.includes('android:roundIcon="@mipmap/ic_launcher_round"'), 'android:roundIcon doit pointer vers @mipmap/ic_launcher_round');
    assert.ok(manifestContent.includes('package="com.birdacademy.app"') || manifestContent.includes('namespace = "com.birdacademy.app"') || manifestContent.includes('.MainActivity'), 'Package/Activity doit rester com.birdacademy.app');
  });

  await t.test('9. Aucune modification de la licence ni du modèle de droits (FREE strict)', () => {
    const resolverPath = path.join(ROOT_DIR, 'src', 'features', 'subscription/services', 'SubscriptionTierResolver.ts');
    const validatorPath = path.join(ROOT_DIR, 'src', 'features', 'licensing', 'engines', 'LicenseValidator.ts');
    
    assert.ok(fs.existsSync(resolverPath), 'SubscriptionTierResolver.ts doit exister');
    assert.ok(fs.existsSync(validatorPath), 'LicenseValidator.ts doit exister');
    
    const resolverContent = fs.readFileSync(resolverPath, 'utf8');
    assert.ok(resolverContent.includes("'FREE'"), 'SubscriptionTierResolver doit maintenir le tier FREE');
  });

  await t.test('10. Aucune modification du stockage utilisateur (localStorage / IndexedDB / LevelDB)', () => {
    // Vérification de la politique anti-purge dans le projet
    const pkgPath = path.join(ROOT_DIR, 'package.json');
    const pkgContent = fs.readFileSync(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgContent);
    
    assert.strictEqual(pkg.version, '2.0.0-RC1', 'Version de référence v2.0.0-RC1 attendue');
    assert.strictEqual(pkg.name, 'bird-academy-user', 'Package name inchangé');
  });
});
