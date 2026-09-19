const { chromium } = require('playwright');

async function checkPages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const routes = [
    { name: 'Accueil', url: 'https://bird-academy-public-test.onrender.com/?view=website' },
    { name: 'Tarifs', url: 'https://bird-academy-public-test.onrender.com/?view=website#pricing' },
    { name: 'Éditions & Produits', url: 'https://bird-academy-public-test.onrender.com/?view=website#editions' },
    { name: 'Centre de Téléchargement', url: 'https://bird-academy-public-test.onrender.com/?view=website#download' },
    { name: 'Support / Contact', url: 'https://bird-academy-public-test.onrender.com/?view=website#support' },
    { name: 'FAQ', url: 'https://bird-academy-public-test.onrender.com/?view=website#faq' },
  ];

  for (const route of routes) {
    await page.goto(route.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(500);
    const text = await page.textContent('body');

    console.log(`=== Page: ${route.name} (${route.url}) ===`);
    console.log(' - Contient 49,00 / 49.00 / 49 €:', /49[,.]00|49\s*€|€\s*49/.test(text));
    console.log(' - Contient 119,00 / 119.00 / 119 €:', /119[,.]00|119\s*€|€\s*119/.test(text));
    console.log(' - Contient 249,00 / 249.00 / 249 €:', /249[,.]00|249\s*€|€\s*249/.test(text));
    console.log(' - Contient "tarifs indiqués sont fermes":', text.includes('tarifs indiqués sont fermes'));
    console.log(' - Contient "prix définitifs":', text.includes('prix définitifs'));
    console.log(' - Contient "Tarif en préparation":', text.includes('Tarif en préparation'));
  }

  await browser.close();
}

checkPages().catch(console.error);
