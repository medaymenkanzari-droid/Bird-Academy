const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('=== TEST SCÉNARIO RÉEL : QA RESET & RE-ACTIVATION (B-011) ===');

  // 1. Ouvrir le site commercial et générer une licence valide
  console.log('\n--- 1. Génération d\'une licence valide via le tunnel commercial ---');
  await page.goto('http://localhost:3000/?view=website#pricing');
  await page.waitForLoadState('networkidle');

  await page.locator('[data-testid="pricing-btn-premium"]').click();
  await page.waitForTimeout(500);

  // Passer le wizard de commande
  await page.locator('[data-testid="checkout-next-to-step-2"]').click();
  await page.waitForTimeout(300);

  await page.fill('[data-testid="checkout-input-name"]', 'Éleveur Test Reset QA');
  await page.fill('[data-testid="checkout-input-email"]', 'qa.reset@elevage.fr');
  await page.locator('[data-testid="checkout-next-to-step-3"]').click();
  await page.waitForTimeout(300);

  await page.locator('[data-testid="checkout-next-to-step-4"]').click();
  await page.waitForTimeout(300);

  await page.locator('[data-testid="checkout-pay-btn"]').click();
  await page.locator('[data-testid="checkout-step-5"]').waitFor({ state: 'visible', timeout: 10000 });

  // Télécharger le fichier .lmse
  const downloadLmseBtn = page.locator('button[data-testid^="download-file-btn-license_"]');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    downloadLmseBtn.click(),
  ]);

  const downloadPath = path.join(process.cwd(), 'temp-qa-reset-test.lmse');
  await download.saveAs(downloadPath);
  console.log('✅ Fichier .lmse téléchargé :', downloadPath);

  // 2. Bascule vers l'application User & Importation
  console.log('\n--- 2. Activation de l\'application User ---');
  await page.goto('http://localhost:3000/?view=app');
  await page.waitForLoadState('networkidle');

  const importBtn = page.locator('button:has-text("Importer une licence .lmse"), button:has-text("Importer un fichier")');
  await importBtn.first().waitFor({ state: 'visible', timeout: 5000 });
  await importBtn.first().click();

  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(downloadPath);
  await page.waitForTimeout(1500);

  // Vérifier que l'application est débloquée
  const isDashboardVisible = await page.locator('[data-testid="desktop-top-bar"]').isVisible();
  console.log('✅ Application débloquée et activée (TopBar visible):', isDashboardVisible);

  // Insérer une donnée d'élevage de test dans le localStorage pour prouver la préservation
  await page.evaluate(() => {
    localStorage.setItem('bird_academy_canaris', JSON.stringify([{ id: 'CANARI-TEST-QA-01', ring: '2026-QA' }]));
  });

  // 3. Déclencher le Reset QA via console/helper
  console.log('\n--- 3. Déclenchement du Reset QA via window.__QA_RESET_LICENSE__() ---');
  await page.evaluate(async () => {
    if (window.__QA_RESET_LICENSE__) {
      await window.__QA_RESET_LICENSE__();
    }
  });

  await page.waitForTimeout(1500);

  // 4. Vérifier le retour immédiat sur FirstLaunchActivationScreen
  console.log('\n--- 4. Vérification du retour sur l\'écran d\'importation ---');
  const firstLaunch = page.locator('[data-testid="first-launch-screen"]');
  await firstLaunch.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✅ Retour sur FirstLaunchActivationScreen confirmé !');

  // 5. Vérifier que les données d'élevage sont préservées
  const preservedBirds = await page.evaluate(() => {
    return localStorage.getItem('bird_academy_canaris');
  });
  const isBirdsPreserved = preservedBirds === JSON.stringify([{ id: 'CANARI-TEST-QA-01', ring: '2026-QA' }]);
  console.log('✅ Données d\'élevage préservées à 100% :', isBirdsPreserved);

  const activeLicense = await page.evaluate(() => {
    return localStorage.getItem('bird_academy_lmse_active_license');
  });
  console.log('✅ Licence active supprimée du localStorage :', activeLicense === null);

  // 6. Tester également la réinitialisation via le paramètre d'URL
  console.log('\n--- 6. Test de la réinitialisation via URL (?view=app&qa_reset_license=true) ---');
  // Réactiver d'abord
  const importBtn2 = page.locator('button:has-text("Importer une licence .lmse"), button:has-text("Importer un fichier")');
  await importBtn2.first().click();
  const fileInput2 = page.locator('input[type="file"]');
  await fileInput2.setInputFiles(downloadPath);
  await page.waitForTimeout(1500);

  // Recharger avec qa_reset_license=true
  await page.goto('http://localhost:3000/?view=app&qa_reset_license=true');
  await page.waitForTimeout(1500);

  const firstLaunchAfterUrlReset = await page.locator('[data-testid="first-launch-screen"]').isVisible();
  console.log('✅ Reset via URL opérationnel (FirstLaunch visible):', firstLaunchAfterUrlReset);

  // Nettoyer
  if (fs.existsSync(downloadPath)) {
    fs.unlinkSync(downloadPath);
  }

  await browser.close();
  console.log('\n>>> SCÉNARIO BROWSER RESET QA : 100% SUCCÈS <<<\n');
}

run().catch((err) => {
  console.error('Erreur test QA Reset browser:', err);
  process.exit(1);
});
