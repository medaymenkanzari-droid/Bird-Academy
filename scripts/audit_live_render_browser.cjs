const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  console.log('===============================================================');
  console.log(' MISSION WEB-COMMERCIAL-VERIFY-004 : AUDIT LIVE DU SITE RENDER');
  console.log(' URL cible : https://bird-academy-public-test.onrender.com');
  console.log('===============================================================\n');

  // 1. Accès direct à la page d'accueil
  await page.goto('https://bird-academy-public-test.onrender.com/?view=website', { waitUntil: 'networkidle', timeout: 60000 });
  console.log('1. Page d\'accueil chargée. Titre :', await page.title());

  // 2. Inspection de la page Tarifs (#pricing)
  await page.goto('https://bird-academy-public-test.onrender.com/?view=website#pricing', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);
  const pricingText = await page.textContent('body');

  console.log('\n--- AUDIT PAGE TARIFS (FRANÇAIS) ---');
  console.log('Contient "49,00 €" :', pricingText.includes('49,00 €') || pricingText.includes('49,00'));
  console.log('Contient "119,00 €" :', pricingText.includes('119,00 €') || pricingText.includes('119,00'));
  console.log('Contient "249,00 €" :', pricingText.includes('249,00 €') || pricingText.includes('249,00'));
  console.log('Contient "Tous les tarifs indiqués sont fermes" :', pricingText.includes('Tous les tarifs indiqués sont fermes') || pricingText.includes('sont fermes'));
  console.log('Contient "Tarif en préparation" :', pricingText.includes('Tarif en préparation'));

  // 3. Inspection des langues disponibles
  const langs = [
    { code: 'en', label: 'English', prepText: 'Pricing in preparation', p49: '€49.00' },
    { code: 'es', label: 'Español', prepText: 'Tarifa en preparación', p49: '49,00 €' },
    { code: 'it', label: 'Italiano', prepText: 'Tariffa in preparazione', p49: '49,00 €' },
    { code: 'ar', label: 'العربية', prepText: 'الأسعار قيد الإعداد', p49: '49.00 €' },
  ];

  console.log('\n--- AUDIT MULTILINGUE (EN / ES / IT / AR) ---');
  for (const l of langs) {
    try {
      // Switch language using the dropdown button and item or select element
      const selectorBtn = page.locator('[data-testid="language-selector-btn"]').first();
      if (await selectorBtn.isVisible()) {
        await selectorBtn.click();
        await page.waitForTimeout(300);
        const itemBtn = page.locator(`[data-testid="select-lang-${l.code}"]`).first();
        if (await itemBtn.isVisible()) {
          await itemBtn.click();
        }
      } else {
        await page.locator('[data-testid="language-selector"]').first().selectOption(l.code);
      }
      await page.waitForTimeout(800);
    } catch (e) {
      console.error('Error switching language to ' + l.code, e.message);
    }

    const curText = await page.textContent('body');
    const has49 = curText.includes('49,00') || curText.includes('49.00') || curText.includes('€49');
    const hasPrep = curText.includes(l.prepText);
    console.log(`Langue [${l.label}] - Contient encore prix (${l.p49}) : ${has49} | Contient texte neutre (${l.prepText}) : ${hasPrep}`);
  }

  // 4. Inspection du Centre de Téléchargement (#download)
  await page.goto('https://bird-academy-public-test.onrender.com/?view=website#download', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);
  const dlText = await page.textContent('body');

  console.log('\n--- AUDIT DU CENTRE DE TÉLÉCHARGEMENT ---');
  console.log('Affiche v1.3.6 :', dlText.includes('v1.3.6') || dlText.includes('1.3.6'));
  console.log('Affiche BA-V1.3.6 :', dlText.includes('BA-V1.3.6'));
  console.log('Affiche warning Android :', dlText.includes('Installation manuelle APK destinée au programme de test'));
  console.log('Affiche Kit testeur (11 docs) :', dlText.includes('Kit testeur') || dlText.includes('QA_ANDROID_FIELD_KIT_001_GUIDE'));
  console.log('Taille APK affichée :', dlText.includes('9 916 814') ? '9 916 814 octets' : (dlText.includes('11.49 MB') || dlText.includes('12 043 947') ? '11.49 MB (ancienne taille)' : 'Inconnue'));

  await browser.close();
}

run().catch(console.error);
