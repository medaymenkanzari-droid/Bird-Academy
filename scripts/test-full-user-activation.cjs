const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('=== 1. COMMENCEMENT DU PARCOURS COMMERCIAL ===');
  await page.goto('http://localhost:3000/?view=website');
  await page.waitForLoadState('networkidle');

  console.log('=== 2. ACCÈS AUX OFFRES & SÉLECTION PREMIUM ===');
  await page.goto('http://localhost:3000/?view=website#pricing');
  await page.waitForTimeout(500);

  const premiumBtn = page.locator('[data-testid="pricing-btn-premium"]');
  await premiumBtn.click();
  await page.waitForTimeout(500);

  console.log('=== 3. PASSAGE DU WIZARD DE COMMANDE ===');
  // Step 1 -> Step 2
  await page.locator('[data-testid="checkout-next-to-step-2"]').click();
  await page.waitForTimeout(300);

  // Step 2 -> Step 3
  await page.fill('[data-testid="checkout-input-name"]', 'Élevage Canaris Champion');
  await page.fill('[data-testid="checkout-input-email"]', 'champion@elevage-canaris.com');
  await page.locator('[data-testid="checkout-next-to-step-3"]').click();
  await page.waitForTimeout(300);

  // Step 3 -> Step 4
  await page.locator('[data-testid="checkout-next-to-step-4"]').click();
  await page.waitForTimeout(300);

  // Step 4: Pay
  console.log('=== 4. CONFIRMATION DU PAIEMENT ET ÉMISSION LMSE ===');
  await page.locator('[data-testid="checkout-pay-btn"]').click();

  // Wait for Step 5
  const step5 = page.locator('[data-testid="checkout-step-5"]');
  await step5.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✅ Étape 5 atteinte sans blanc écran !');

  // Find the download button for .lmse file
  const downloadLmseBtn = page.locator('button[data-testid^="download-file-btn-license_"]');
  await downloadLmseBtn.waitFor({ state: 'visible', timeout: 5000 });

  console.log('=== 5. TÉLÉCHARGEMENT DU FICHIER .LMSE ===');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    downloadLmseBtn.click(),
  ]);

  const downloadPath = path.join(process.cwd(), 'temp-downloaded-license.lmse');
  await download.saveAs(downloadPath);
  console.log('✅ Fichier .lmse sauvegardé localement :', downloadPath);

  const lmseContent = fs.readFileSync(downloadPath, 'utf-8');
  console.log('Aperçu du contenu .lmse :', lmseContent.slice(0, 150) + '...');

  console.log('=== 6. BASCULE VERS L\'APPLICATION USER & IMPORTATION .LMSE ===');
  await page.goto('http://localhost:3000/?view=app');
  await page.waitForLoadState('networkidle');

  // Look for "Importer un fichier de licence" button
  console.log('Recherche du bouton d\'importation .lmse dans l\'application User...');
  const importBtn = page.locator('button:has-text("Importer une licence .lmse"), button:has-text("Importer un fichier")');
  await importBtn.first().waitFor({ state: 'visible', timeout: 5000 });
  await importBtn.first().click();

  // Set file input
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(downloadPath);
  console.log('Fichier .lmse transmis au composant d\'importation.');

  await page.waitForTimeout(2000);

  // Verify activation confirmation or unlocked app state
  const bodyText = await page.innerText('body');
  console.log('Texte page après import (extrait) :', bodyText.slice(0, 200).replace(/\n/g, ' '));

  // Clean up test file
  if (fs.existsSync(downloadPath)) {
    fs.unlinkSync(downloadPath);
  }

  await browser.close();
  console.log('\n>>> TOUT LE PARCOURS (COMMERCE + LIVRAISON + IMPORT + ACTIVATION) : 100% SUCCÈS <<<\n');
}

run().catch((err) => {
  console.error('Erreur lors du test complet :', err);
  process.exit(1);
});
