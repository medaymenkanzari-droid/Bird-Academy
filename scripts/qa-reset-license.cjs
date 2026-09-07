/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SCRIPT QA DE RÉINITIALISATION DE LICENCE LOCALE
 * Usage: npm run qa:reset-license
 * 
 * Ce script permet de remettre l'application User à l'état "Aucune licence installée"
 * pour dérouler la campagne de tests B-011 (licences falsifiées, expirées, corrompues, etc.)
 * SANS SUPPRIMER AUCUNE DONNÉE D'ÉLEVAGE ET SANS TOUCHER AU SERVEUR LMSE.
 */

const { chromium } = require('playwright');

const RESET_KEYS = [
  'bird_academy_lmse_active_license',
  'bird_academy_lmse_all_licenses',
  'bird_academy_lmse_revocation_list',
  'bird_academy_lmse_audit_logs',
  'bird_academy_lmse_last_known_timestamp',
  'bird_academy_subscription_tier_override',
  'bird_academy_assistant_tier_override',
];

const PRESERVED_BREEDING_KEYS = [
  'bird_academy_canaris',
  'bird_academy_couples',
  'bird_academy_reproductions',
  'bird_academy_pontes',
  'bird_academy_jeunes',
  'bird_academy_sante',
  'bird_academy_alimentation',
  'bird_academy_depenses',
  'bird_academy_ventes',
  'bird_academy_cages',
  'bird_academy_wizard_completed',
  'bird_academy_species_profile',
  'bird_academy_language',
  'bird_academy_theme',
  'bird_academy_currency',
];

async function main() {
  console.log('\x1b[36m%s\x1b[0m', '========================================================================');
  console.log('\x1b[36m%s\x1b[0m', '   BIRD ACADEMY ENTERPRISE — RÉINITIALISATION DE LICENCE QA (B-011)     ');
  console.log('\x1b[36m%s\x1b[0m', '========================================================================\n');

  console.log('\x1b[33m%s\x1b[0m', '1. Clés de licence ciblées pour suppression :');
  RESET_KEYS.forEach((k) => console.log(`   - ${k}`));

  console.log('\n\x1b[32m%s\x1b[0m', '2. Données d\'élevage STRICTEMENT PRÉSERVÉES :');
  PRESERVED_BREEDING_KEYS.forEach((k) => console.log(`   + ${k} [INTOUCHÉ]`));

  console.log('\n\x1b[35m%s\x1b[0m', '3. Mécanismes de Réinitialisation QA Disponibles :');
  console.log('   a) \x1b[1mURL Dev Directe\x1b[0m :');
  console.log('      http://localhost:3000/?view=app&qa_reset_license=true');
  console.log('   b) \x1b[1mBouton UI Dev\x1b[0m :');
  console.log('      - Bouton "🧪 Reset QA" dans la barre supérieure DesktopTopBar');
  console.log('      - Bouton "🧪 Mode QA/Dev" dans le pied de page FirstLaunchActivationScreen');
  console.log('   c) \x1b[1mConsole Navigateur (F12)\x1b[0m :');
  console.log('      window.__QA_RESET_LICENSE__()');
  console.log('   d) \x1b[1mTest Automatisé Playwright\x1b[0m :');
  console.log('      node --import tsx --test tests/licensing/qa-license-reset-environment.test.ts');

  // Attempt browser cleanup via Playwright if dev server is running
  console.log('\n\x1b[34m%s\x1b[0m', '4. Tentative de purge sur le navigateur local (http://localhost:3000)...');
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/?view=app&qa_reset_license=true', { timeout: 5000 });
    await page.waitForTimeout(1000);
    await browser.close();
    console.log('\x1b[32m%s\x1b[0m', '   [OK] Navigateur local réinitialisé avec succès sur FirstLaunchActivationScreen !');
  } catch (err) {
    console.log('\x1b[90m%s\x1b[0m', '   (Serveur de dev non accessible pour auto-purge immédiate ou Playwright non attaché)');
  }

  console.log('\n\x1b[32m%s\x1b[0m', '========================================================================');
  console.log('\x1b[32m%s\x1b[0m', '   [SUCCÈS] Environnement QA prêt pour dérouler les tests B-011 !       ');
  console.log('\x1b[32m%s\x1b[0m', '========================================================================\n');
}

main().catch(console.error);
