import { test, expect } from '@playwright/test';
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

test.describe('MISSION TESTER-REPORT-PDF-REDESIGN-V1 — E2E & Verification', () => {

  test('Download Center: Tester report card and download button are visible and functional', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/#download', { waitUntil: 'domcontentloaded' });

    // Navigate to docs section
    const docsSection = page.locator('#section-docs, [data-testid="section-docs"]');
    await docsSection.scrollIntoViewIfNeeded();
    await expect(docsSection).toBeVisible();

    // Verify card exists
    const card = page.locator('[data-testid="download-test-report-card"]');
    await expect(card).toBeVisible();

    // Verify badge text (case-insensitive due to CSS uppercase)
    const badgeText = await card.locator('span').first().innerText();
    expect(badgeText.toLowerCase()).toContain('formulaire de testeur');
    expect(badgeText).toContain('V2.0.0-RC1');

    // Verify card title & description
    const cardText = await card.innerText();
    expect(cardText).toContain('Rapport de testeur V2.0.0-RC1 (PDF)');
    expect(cardText).toContain('Formulaire officiel d\'évaluation et de retour terrain');

    // Verify download button
    const dlBtn = page.locator('[data-testid="download-test-report-btn"]');
    await expect(dlBtn).toBeVisible();
    await expect(dlBtn).toHaveText(/Télécharger le rapport de testeur/i);

    // Trigger download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      dlBtn.click()
    ]);

    const filename = download.suggestedFilename();
    expect(filename).toBe('Rapport-de-test-Bird-Academy-V2.0.0-RC1.pdf');

    // Verify downloaded file is valid and non-empty
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    if (downloadPath) {
      const stats = fs.statSync(downloadPath);
      expect(stats.size).toBeGreaterThan(50000); // PDF is ~191 KB

      const buffer = fs.readFileSync(downloadPath);
      expect(buffer.subarray(0, 4).toString()).toBe('%PDF');

      // Verify metadata title in binary PDF
      const str = buffer.toString('latin1');
      const idx = str.indexOf('/Title');
      expect(idx).toBeGreaterThan(-1);
      const endIdx = str.indexOf('>', idx);
      const hex = str.substring(idx + 7, endIdx).replace(/^<FEFF/, '');
      const b = Buffer.from(hex, 'hex');
      b.swap16();
      const decodedTitle = b.toString('utf16le');
      expect(decodedTitle).toContain('RAPPORT DE TESTEUR');
      expect(decodedTitle).toContain('V2.0.0-RC1');
      expect(decodedTitle).toContain('BA-V2.0.0-RC1');
    }
  });

  test('Multi-Language: Card updates across FR, EN, ES, IT, AR', async ({ page }) => {
    const LANG_DATA = [
      { code: 'fr', btn: 'Télécharger le rapport de testeur', title: 'Rapport de testeur', dir: 'ltr' },
      { code: 'en', btn: 'Download Tester Form', title: 'Tester Report', dir: 'ltr' },
      { code: 'es', btn: 'Descargar formulario de probador', title: 'Informe de probador', dir: 'ltr' },
      { code: 'it', btn: 'Scarica il modulo del tester', title: 'Rapporto del tester', dir: 'ltr' },
      { code: 'ar', btn: 'تنزيل استمارة المختبر', title: 'تقرير واستمارة المختبر', dir: 'rtl' },
    ];

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/#download', { waitUntil: 'domcontentloaded' });

    for (const lang of LANG_DATA) {
      const langSelect = page.locator('[data-testid="language-selector"]').first();
      await langSelect.selectOption(lang.code);
      await page.waitForTimeout(400);

      const card = page.locator('[data-testid="download-test-report-card"]');
      await expect(card).toBeVisible();

      const cardText = await card.innerText();
      expect(cardText).toContain(lang.title);

      const btn = page.locator('[data-testid="download-test-report-btn"]');
      await expect(btn).toBeVisible();
      const btnText = await btn.innerText();
      expect(btnText).toContain(lang.btn);

      // Verify triggered download file
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        btn.click()
      ]);

      const expectedFilename = lang.code === 'fr'
        ? 'Rapport-de-test-Bird-Academy-V2.0.0-RC1.pdf'
        : `Rapport-de-test-Bird-Academy-V2.0.0-RC1-${lang.code}.pdf`;

      expect(download.suggestedFilename()).toBe(expectedFilename);
    }
  });

  test('PDF Content Structure: Verify all 8 required sections and absence of old technical report data', async ({ page }) => {
    const { buildHtml, LOCALES } = require('../../scripts/generateTestReportPdf.cjs');
    
    // Check French (default)
    const frHtml = buildHtml(LOCALES.fr);
    await page.setContent(frHtml);

    const fullText = await page.evaluate(() => document.body.innerText);

    // 1. Titles & Headers
    expect(fullText).toContain('RAPPORT DE TESTEUR');
    expect(fullText).toContain('V2.0.0-RC1');
    expect(fullText).toContain('BA-V2.0.0-RC1');
    expect(fullText).toContain('formulaire d\'évaluation terrain destiné au testeur');

    // 2. SECTION A — INFORMATIONS DU TESTEUR
    expect(fullText).toContain('SECTION A — INFORMATIONS DU TESTEUR');
    expect(fullText).toContain('Nom / pseudonyme :');
    expect(fullText).toContain('Date du test :');
    expect(fullText).toContain('Système utilisé :');
    expect(fullText).toContain('Windows 10 / 11');
    expect(fullText).toContain('Android (Smartphone / Tablette)');

    // 3. SECTION B — INSTALLATION ET PREMIÈRE UTILISATION
    expect(fullText).toContain('SECTION B — INSTALLATION ET PREMIÈRE UTILISATION');
    expect(fullText).toContain('Installation réussie');
    expect(fullText).toContain('Application démarrée correctement');
    expect(fullText).toContain('Première utilisation comprise facilement');
    expect(fullText).toContain('Navigation comprise facilement');
    expect(fullText).toContain('Première impression générale :');

    // 4. SECTION C — TESTS FONCTIONNELS
    expect(fullText).toContain('SECTION C — TESTS FONCTIONNELS');
    expect(fullText).toContain('Gestion des oiseaux');
    expect(fullText).toContain('Fiche oiseau');
    expect(fullText).toContain('Recherche & Filtres');
    expect(fullText).toContain('Reproduction');
    expect(fullText).toContain('Couples');
    expect(fullText).toContain('Œufs & Incubation');
    expect(fullText).toContain('Élevage manuel / EAM');
    expect(fullText).toContain('Habitat & Cages');
    expect(fullText).toContain('Santé & Soins');
    expect(fullText).toContain('Scanner & Codes QR');
    expect(fullText).toContain('Intelligence & Analyses');
    expect(fullText).toContain('Sauvegarde locale & Téléchargements');

    // 5. SECTION D — SIGNALER UN PROBLÈME
    expect(fullText).toContain('SECTION D — SIGNALER UN PROBLÈME');
    expect(fullText).toContain('J\'AI RENCONTRÉ UN PROBLÈME');
    expect(fullText).toContain('Que s\'est-il passé ?');
    expect(fullText).toContain('Étapes pour reproduire le problème :');
    expect(fullText).toContain('Résultat attendu :');
    expect(fullText).toContain('Résultat obtenu :');
    expect(fullText).toContain('Gravité ressentie :');
    expect(fullText).toContain('Capture d\'écran disponible :');

    // 6. SECTION E — EXPÉRIENCE UTILISATEUR
    expect(fullText).toContain('SECTION E — EXPÉRIENCE UTILISATEUR');
    expect(fullText).toContain('Comprendre l\'application');
    expect(fullText).toContain('Ajouter un oiseau');
    expect(fullText).toContain('Ce que j\'ai particulièrement apprécié :');
    expect(fullText).toContain('Ce qui m\'a semblé difficile ou confus :');

    // 7. SECTION F — SUGGESTIONS DU TESTEUR
    expect(fullText).toContain('SECTION F — SUGGESTIONS DU TESTEUR');
    expect(fullText).toContain('Quelle fonctionnalité faudrait-il améliorer en priorité ?');
    expect(fullText).toContain('Quelle fonctionnalité aimeriez-vous voir ajoutée ?');
    expect(fullText).toContain('Autres suggestions :');

    // 8. SECTION G — ÉVALUATION GÉNÉRALE
    expect(fullText).toContain('SECTION G — ÉVALUATION GÉNÉRALE');
    expect(fullText).toContain('Facilité d\'utilisation :');
    expect(fullText).toContain('Utilité pour un éleveur :');
    expect(fullText).toContain('Satisfaction générale :');
    expect(fullText).toContain('Après ce test, recommanderiez-vous Bird Academy à un autre éleveur ?');

    // 9. SECTION H — COMMENTAIRES DU TESTEUR
    expect(fullText).toContain('SECTION H — COMMENTAIRES DU TESTEUR');

    // 10. NO TECHNICAL PASS CLAIMS
    expect(fullText).not.toContain('Passage en mode souverain local vérifié');
    expect(fullText).not.toContain('Validation Technique — Android');
    expect(fullText).not.toContain('Synchronisation Capacitor');
  });

  test('Arabic RTL: PDF template renders in RTL with proper typography and right-aligned structure', async ({ page }) => {
    const { buildHtml, LOCALES } = require('../../scripts/generateTestReportPdf.cjs');
    const arHtml = buildHtml(LOCALES.ar);
    await page.setContent(arHtml);

    const htmlDir = await page.getAttribute('html', 'dir');
    expect(htmlDir).toBe('rtl');

    const bodyDir = await page.evaluate(() => window.getComputedStyle(document.body).direction);
    expect(bodyDir).toBe('rtl');

    const arText = await page.evaluate(() => document.body.innerText);
    expect(arText).toContain('تقرير واستمارة المختبر');
    expect(arText).toContain('القسم أ — معلومات المختبر');
    expect(arText).toContain('القسم ب — التثبيت وبدء الاستخدام الأول');
    expect(arText).toContain('القسم ج — الاختبارات الوظيفية');
    expect(arText).toContain('القسم د — الإبلاغ عن مشكلة');
    expect(arText).toContain('القسم هـ — تجربة المستخدم');
    expect(arText).toContain('القسم و — مقترحات المختبر');
    expect(arText).toContain('القسم ز — التقييم العام');
    expect(arText).toContain('القسم ح — تعليقات وملاحظات حرة');
  });

  const VIEWPORTS = [320, 375, 414];
  for (const w of VIEWPORTS) {
    test(`Responsive mobile ${w}px: Download Center zero horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 750 });
      await page.goto('/#download', { waitUntil: 'domcontentloaded' });

      const docsSection = page.locator('#section-docs, [data-testid="section-docs"]');
      await docsSection.scrollIntoViewIfNeeded();

      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });

      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

      // Verify button minimum touch target >= 44px
      const btn = page.locator('[data-testid="download-test-report-btn"]');
      const box = await btn.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });
  }

});
