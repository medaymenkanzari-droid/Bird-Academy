import { test, expect } from '@playwright/test';

const LOCALES = [
  { code: 'fr', title: 'Installation en 3 étapes :', s1: "1. Téléchargez l'APK.", s2: "2. Ouvrez le fichier", s3: "3. Si Android le demande", dir: 'ltr' },
  { code: 'en', title: 'Installation in 3 steps:', s1: '1. Download the APK.', s2: '2. Open the file', s3: '3. If prompted by Android', dir: 'ltr' },
  { code: 'es', title: 'Instalación en 3 pasos:', s1: '1. Descargue el archivo APK.', s2: '2. Abra el archivo', s3: '3. Si Android lo solicita', dir: 'ltr' },
  { code: 'it', title: 'Installazione in 3 passaggi:', s1: '1. Scarica il file APK.', s2: '2. Apri il file', s3: '3. Se richiesto da Android', dir: 'ltr' },
  { code: 'ar', title: 'التثبيت في 3 خطوات:', s1: '1. حمّل ملف APK.', s2: '2. افتح الملف', s3: '3. إذا طُلب منك', dir: 'rtl' },
];

test.describe('MISSION ANDROID-INSTALL-GUIDANCE-V1 — E2E & Multi-Language Verification', () => {

  test('Guidance block is present, unique per card, and preserves warning notice on Landing Page', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const downloadSection = page.locator('[data-testid="download-section"]');
    await downloadSection.scrollIntoViewIfNeeded();

    // Exactly one guidance block in the download section
    const guidanceBlocks = downloadSection.locator('[data-testid="android-install-guidance"]');
    await expect(guidanceBlocks).toHaveCount(1);
    await expect(guidanceBlocks).toBeVisible();

    // Verify warning is still present and intact
    const warningText = await downloadSection.innerText();
    expect(warningText).toContain('Installation manuelle APK');
    expect(warningText).toContain('versionCode 22');

    // Verify download APK button is intact and clickable
    const apkBtn = downloadSection.locator('[data-testid="download-btn-android-apk"]');
    await expect(apkBtn).toBeVisible();
    await expect(apkBtn).toHaveText(/Télécharger l'APK/i);
    const box = await apkBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  for (const loc of LOCALES) {
    test(`Locale [${loc.code.toUpperCase()}]: 3-step guidance correctly rendered (dir=${loc.dir})`, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 800 });
      await page.goto('/');

      // Switch language
      const langSelect = page.locator('[data-testid="language-selector"]').first();
      await langSelect.selectOption(loc.code);
      await page.waitForTimeout(400);

      const downloadSection = page.locator('[data-testid="download-section"]');
      await downloadSection.scrollIntoViewIfNeeded();

      const guidance = downloadSection.locator('[data-testid="android-install-guidance"]');
      await expect(guidance).toBeVisible();

      const text = await guidance.innerText();
      expect(text).toContain(loc.title);
      expect(text).toContain(loc.s1);
      expect(text).toContain(loc.s2);
      expect(text).toContain(loc.s3);

      // Verify HTML and App dir
      const appContainer = page.locator('[data-testid="commercial-website-app"]');
      await expect(appContainer).toHaveAttribute('dir', loc.dir);
    });
  }

  const MOBILE_VIEWPORTS = [320, 375, 414];
  for (const w of MOBILE_VIEWPORTS) {
    test(`Mobile viewport ${w}px: zero horizontal overflow and readable guidance`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 750 });
      await page.goto('/');

      const downloadSection = page.locator('[data-testid="download-section"]');
      await downloadSection.scrollIntoViewIfNeeded();

      const guidance = downloadSection.locator('[data-testid="android-install-guidance"]');
      await expect(guidance).toBeVisible();

      // Check overflow
      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);

      // Check tap targets in the Android card
      const apkBtn = downloadSection.locator('[data-testid="download-btn-android-apk"]');
      const box = await apkBtn.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });
  }

  test('Download Center page (/download): guidance block present, unique, and warning preserved', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto('/#download');

    const guidance = page.locator('[data-testid="android-install-guidance"]');
    await expect(guidance).toHaveCount(1);
    await expect(guidance).toBeVisible();

    const warning = page.locator('[data-testid="android-apk-warning"]');
    await expect(warning).toBeVisible();
    await expect(warning).toContainText('Installation manuelle APK');
  });

});
