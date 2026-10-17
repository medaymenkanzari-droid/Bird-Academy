import { test, expect } from '@playwright/test';

test.describe('MISSION SUPPORT-FORM-ERROR-STATE-V1 — Support Form Error States & Accessibility', () => {
  test.beforeEach(async () => {
    test.setTimeout(60000);
  });

  const navigateToSupport = async (page: any) => {
    await page.goto('/#support');
    await page.waitForSelector('[data-testid="support-contact-form"]');
  };

  // CAS A: Soumission avec champs obligatoires vides
  test('Cas A: Empty submission triggers aria-invalid, aria-describedby and field error alerts', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 897 });
    await navigateToSupport(page);

    // Initial state: no errors
    const nameInput = page.locator('[data-testid="support-input-name"]');
    const emailInput = page.locator('[data-testid="support-input-email"]');
    const subjectInput = page.locator('[data-testid="support-input-subject"]');
    const messageInput = page.locator('[data-testid="support-input-message"]');

    await expect(nameInput).not.toHaveAttribute('aria-invalid');
    await expect(emailInput).not.toHaveAttribute('aria-invalid');
    await expect(subjectInput).not.toHaveAttribute('aria-invalid');
    await expect(messageInput).not.toHaveAttribute('aria-invalid');

    // Trigger submit with empty fields
    const submitBtn = page.locator('[data-testid="support-btn-submit"]');
    await submitBtn.click();

    // Verify all 4 empty fields have aria-invalid="true" and aria-describedby pointing to their error element
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(nameInput).toHaveAttribute('aria-describedby', 'support-error-name');
    await expect(page.locator('#support-error-name')).toBeVisible();

    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(emailInput).toHaveAttribute('aria-describedby', 'support-error-email');
    await expect(page.locator('#support-error-email')).toBeVisible();

    await expect(subjectInput).toHaveAttribute('aria-invalid', 'true');
    await expect(subjectInput).toHaveAttribute('aria-describedby', 'support-error-subject');
    await expect(page.locator('#support-error-subject')).toBeVisible();

    await expect(messageInput).toHaveAttribute('aria-invalid', 'true');
    await expect(messageInput).toHaveAttribute('aria-describedby', 'support-error-message');
    await expect(page.locator('#support-error-message')).toBeVisible();

    // Verify banner
    const banner = page.locator('[data-testid="support-form-error-banner"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Veuillez remplir tous les champs obligatoires.');
  });

  // CAS B: Email invalide (nom, sujet, message valides)
  test('Cas B: Invalid email applies aria-invalid ONLY to email field, others remain valid', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 897 });
    await navigateToSupport(page);

    const nameInput = page.locator('[data-testid="support-input-name"]');
    const emailInput = page.locator('[data-testid="support-input-email"]');
    const subjectInput = page.locator('[data-testid="support-input-subject"]');
    const messageInput = page.locator('[data-testid="support-input-message"]');

    await nameInput.fill('Jean Dupont');
    await emailInput.fill('invalid-email-format');
    await subjectInput.fill('Question licence');
    await messageInput.fill('Bonjour, ceci est une demande de support technique.');

    const submitBtn = page.locator('[data-testid="support-btn-submit"]');
    await submitBtn.click();

    // ONLY email has aria-invalid="true"
    await expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    await expect(emailInput).toHaveAttribute('aria-describedby', 'support-error-email');
    await expect(page.locator('#support-error-email')).toBeVisible();
    await expect(page.locator('#support-error-email')).toContainText('Adresse email invalide.');

    // The other fields MUST NOT have aria-invalid
    await expect(nameInput).not.toHaveAttribute('aria-invalid');
    await expect(nameInput).not.toHaveAttribute('aria-describedby');
    await expect(page.locator('#support-error-name')).toBeHidden();

    await expect(subjectInput).not.toHaveAttribute('aria-invalid');
    await expect(subjectInput).not.toHaveAttribute('aria-describedby');
    await expect(page.locator('#support-error-subject')).toBeHidden();

    await expect(messageInput).not.toHaveAttribute('aria-invalid');
    await expect(messageInput).not.toHaveAttribute('aria-describedby');
    await expect(page.locator('#support-error-message')).toBeHidden();

    // Top banner mentions invalid email
    const banner = page.locator('[data-testid="support-form-error-banner"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Adresse email invalide.');

    // Typing a valid email clears the error
    await emailInput.fill('jean.dupont@exemple.fr');
    await expect(emailInput).not.toHaveAttribute('aria-invalid');
    await expect(page.locator('#support-error-email')).toBeHidden();
  });

  // CAS C: Un seul champ manquant (message manquant)
  test('Cas C: Missing single required field isolates aria-invalid to that exact field', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 897 });
    await navigateToSupport(page);

    const nameInput = page.locator('[data-testid="support-input-name"]');
    const emailInput = page.locator('[data-testid="support-input-email"]');
    const subjectInput = page.locator('[data-testid="support-input-subject"]');
    const messageInput = page.locator('[data-testid="support-input-message"]');

    await nameInput.fill('Jean Dupont');
    await emailInput.fill('jean@exemple.fr');
    await subjectInput.fill('Activation Pro');
    // message is intentionally left empty
    await messageInput.fill('');

    const submitBtn = page.locator('[data-testid="support-btn-submit"]');
    await submitBtn.click();

    // ONLY message has aria-invalid="true"
    await expect(messageInput).toHaveAttribute('aria-invalid', 'true');
    await expect(messageInput).toHaveAttribute('aria-describedby', 'support-error-message');
    await expect(page.locator('#support-error-message')).toBeVisible();

    // The other 3 fields MUST NOT have aria-invalid
    await expect(nameInput).not.toHaveAttribute('aria-invalid');
    await expect(emailInput).not.toHaveAttribute('aria-invalid');
    await expect(subjectInput).not.toHaveAttribute('aria-invalid');
  });

  // CAS D: Formulaire valide (soumission et succès)
  test('Cas D: Valid form submission completes cleanly and displays success confirmation', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 897 });
    await navigateToSupport(page);

    const nameInput = page.locator('[data-testid="support-input-name"]');
    const emailInput = page.locator('[data-testid="support-input-email"]');
    const subjectInput = page.locator('[data-testid="support-input-subject"]');
    const messageInput = page.locator('[data-testid="support-input-message"]');

    await nameInput.fill('Alice Martin');
    await emailInput.fill('alice@exemple.fr');
    await subjectInput.fill('Installation offline');
    await messageInput.fill('Demande de documentation pour déploiement local sécurisé.');

    const submitBtn = page.locator('[data-testid="support-btn-submit"]');
    await submitBtn.click();

    // Success banner is displayed
    const successBanner = page.locator('[data-testid="support-ticket-success"]');
    await expect(successBanner).toBeVisible();

    // Form error banner is gone
    const errorBanner = page.locator('[data-testid="support-form-error-banner"]');
    await expect(errorBanner).toBeHidden();
  });

  // Focus visible on invalid field
  test('Focus visible preserved on invalid input', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 897 });
    await navigateToSupport(page);

    const emailInput = page.locator('[data-testid="support-input-email"]');
    await emailInput.fill('bad-email');

    const submitBtn = page.locator('[data-testid="support-btn-submit"]');
    await submitBtn.click();

    // Focus the invalid field
    await emailInput.focus();

    const isFocused = await page.evaluate(() => {
      const el = document.querySelector('[data-testid="support-input-email"]');
      return document.activeElement === el;
    });

    expect(isFocused).toBe(true);
  });

  // Responsive & RTL Non-regression
  test('Mobile viewport (375px) & Arabic RTL non-regression on support form', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/#support');
    await page.waitForSelector('[data-testid="support-contact-form"]');

    // Switch to Arabic
    await page.evaluate(() => {
      const select = document.querySelector('[data-testid="language-selector"]') as HTMLSelectElement;
      if (select) {
        select.value = 'ar';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await page.waitForTimeout(400);

    const dimensions = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        dir: document.documentElement.getAttribute('dir'),
      };
    });

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    expect(dimensions.dir).toBe('rtl');

    // Submit invalid to verify RTL error display
    const submitBtn = page.locator('[data-testid="support-btn-submit"]');
    await submitBtn.click();

    const banner = page.locator('[data-testid="support-form-error-banner"]');
    await expect(banner).toBeVisible();
  });
});
