const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: d }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== AUDIT DU NOUVEAU SITE DÉPLOYÉ SUR RENDER ===');
  console.log('URL: https://bird-academy-public-test.onrender.com');

  // 1. Récupérer le HTML racine
  const root = await fetch('https://bird-academy-public-test.onrender.com/?ts=' + Date.now());
  const match = root.body.match(/src="\.\/assets\/(index-[^"]+\.js)"/);
  const bundleName = match ? match[1] : 'unknown';
  console.log('Live Bundle Name:', bundleName);

  if (bundleName === 'unknown') {
    console.error('Bundle non trouvé dans le HTML');
    return;
  }

  // 2. Télécharger le bundle JS
  const bundle = await fetch(`https://bird-academy-public-test.onrender.com/assets/${bundleName}`);
  const d = bundle.body;
  console.log('Taille du Bundle téléchargé :', d.length, 'octets');

  // 3. Vérification des versions
  const vMatches = d.match(/v?1\.3\.6[\w\.-]*/gi) || [];
  console.log('\n--- VERSIONS DÉTECTÉES ---');
  console.log('Versions :', [...new Set(vMatches)].slice(0, 10));
  const bMatches = d.match(/BA-V1\.3\.6[\w\.-]*/gi) || [];
  console.log('Build IDs :', [...new Set(bMatches)]);

  // 4. Vérification stricte de l'absence des prix commerciaux
  console.log('\n--- VÉRIFICATION DU MASQUAGE DES PRIX ---');
  const prices = ['49,00', '49.00', '49 €', '€49.00', '119,00', '119.00', '119 €', '€119.00', '249,00', '249.00', '249 €', '€249.00'];
  for (const p of prices) {
    console.log(`Contient "${p}":`, d.includes(p));
  }

  // 5. Textes commerciaux neutres
  console.log('\n--- FORMULATIONS COMMERCIALES ---');
  console.log('"tarifs indiqués sont fermes":', d.includes('tarifs indiqués sont fermes'));
  console.log('"Tarif en préparation" (FR):', d.includes('Tarif en préparation'));
  console.log('"Pricing in preparation" (EN):', d.includes('Pricing in preparation'));
  console.log('"Tarifa en preparación" (ES):', d.includes('Tarifa en preparación'));
  console.log('"Tariffa in preparazione" (IT):', d.includes('Tariffa in preparazione'));
  console.log('"الأسعار قيد الإعداد" (AR):', d.includes('الأسعار قيد الإعداد'));

  // 6. Présence du Kit Testeur dans le bundle
  console.log('\n--- CENTRE DE TÉLÉCHARGEMENT DANS LE BUNDLE ---');
  console.log('Contient "QA_ANDROID_FIELD_KIT_001_GUIDE.md":', d.includes('QA_ANDROID_FIELD_KIT_001_GUIDE.md'));
  console.log('Contient "QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md":', d.includes('QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md'));
  console.log('Contient hash APK officiel 20AD96...:', d.includes('20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63'));
  console.log('Contient warning Android:', d.includes('Installation manuelle APK destinée au programme de test'));

  // 7. Vérification des téléchargements réels HTTP sur Render
  console.log('\n--- VÉRIFICATION DES TÉLÉCHARGEMENTS HTTP SUR RENDER ---');
  const filesToTest = [
    'QA_ANDROID_FIELD_KIT_001_GUIDE.md',
    'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md',
    'QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md',
    'QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md',
    'LMSE_OWNER_GUIDE.pdf',
    'Bird-Academy-User.apk'
  ];

  for (const f of filesToTest) {
    const res = await fetch(`https://bird-academy-public-test.onrender.com/downloads/${f}`);
    console.log(`GET /downloads/${f} -> Status: ${res.status}, Type: ${res.headers['content-type']}, Length: ${res.headers['content-length'] || 'N/A'}, Location: ${res.headers['location'] || 'N/A'}`);
  }
}

run().catch(console.error);
