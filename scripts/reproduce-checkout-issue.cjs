const { chromium } = require('playwright');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('[BROWSER LOG]', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('[BROWSER UNCAUGHT ERROR]', err));
  page.on('request', req => console.log('[HTTP REQ]', req.method(), req.url()));
  page.on('response', res => console.log('[HTTP RES]', res.status(), res.url()));

  console.log('--- 1. Navigating to Commercial Website ---');
  await page.goto('http://localhost:3000/?view=website');
  await page.waitForLoadState('networkidle');

  console.log('--- 2. Navigating to Pricing ---');
  const getLicenseBtn = page.locator('[data-testid="header-btn-get-license"]');
  await getLicenseBtn.click();
  await page.waitForTimeout(1000);

  console.log('--- 3. Clicking on Premium Order Button ---');
  const premiumBtn = page.locator('[data-testid="pricing-btn-premium"]');
  await premiumBtn.click();
  await page.waitForTimeout(1000);

  console.log('Current URL:', page.url());
  const wizard = page.locator('[data-testid="checkout-wizard"]');
  await wizard.waitFor({ state: 'visible', timeout: 5000 });

  console.log('--- 4. Step 1: Confirm Plan & Continue ---');
  const next1 = page.locator('[data-testid="checkout-next-to-step-2"]');
  await next1.click();
  await page.waitForTimeout(500);

  console.log('--- 5. Step 2: Fill Client Info ---');
  await page.fill('[data-testid="checkout-input-name"]', 'Élevage des Pins');
  await page.fill('[data-testid="checkout-input-email"]', 'pins@elevage-canaris.com');
  const next2 = page.locator('[data-testid="checkout-next-to-step-3"]');
  await next2.click();
  await page.waitForTimeout(500);

  console.log('--- 6. Step 3: Review Order & Proceed to Payment ---');
  const next3 = page.locator('[data-testid="checkout-next-to-step-4"]');
  await next3.click();
  await page.waitForTimeout(500);

  console.log('--- 7. Step 4: Confirm & Pay (Demo Mode) ---');
  const payBtn = page.locator('[data-testid="checkout-pay-btn"]');
  await payBtn.click();

  console.log('--- 8. Waiting for Order Processing and Step 5 ---');
  const step5 = page.locator('[data-testid="checkout-step-5"]');
  await step5.waitFor({ state: 'visible', timeout: 10000 });

  console.log('--- Step 5 Confirmation Rendered Successfully! ---');
  console.log('Final URL:', page.url());

  const deliveryFiles = page.locator('[data-testid^="delivery-file-"]');
  const filesCount = await deliveryFiles.count();
  console.log('Total Delivery Files Rendered:', filesCount);

  for (let i = 0; i < filesCount; i++) {
    const text = await deliveryFiles.nth(i).innerText();
    console.log(` - File [${i + 1}]:`, text.replace(/\n/g, ' '));
  }

  const zipBtn = page.locator('[data-testid="download-complete-kit-btn"]');
  const hasZipBtn = (await zipBtn.count()) > 0;
  console.log('Download complete ZIP button present:', hasZipBtn);

  await browser.close();
  console.log('\n>>> BROWSER CHECKOUT TEST: 100% SUCCESS <<<\n');
}

run().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
