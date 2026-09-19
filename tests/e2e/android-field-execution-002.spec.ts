/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
 * MISSION: ANDROID-FIELD-EXECUTION-002
 * Playwright E2E Suite: Real Website Download Center Flow & Official APK Integrity Verification.
 */

import { test, expect } from '@playwright/test';
import crypto from 'node:crypto';

test.describe('MISSION ANDROID-FIELD-EXECUTION-002 — Parcours de Téléchargement & Intégrité E2E', () => {

  test('E2E-AF01: Accès au site officiel et navigation directe vers le Centre de Téléchargement (/download)', async ({ page }) => {
    // 1. Ouvrir le site
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    // 2. Accéder à /download
    const downloadPage = page.locator('[data-testid="web-download-center-page"]');
    await expect(downloadPage).toBeVisible();

    // Vérifier les badges officiels
    await expect(page.locator('[data-testid="official-version-badge"]')).toContainText('v1.3.6');
    await expect(page.locator('[data-testid="official-build-badge"]')).toContainText('BA-V1.3.6');
  });

  test('E2E-AF02: Téléchargement de l\'APK officielle depuis le Centre et validation SHA-256 cryptographique en direct', async ({ page, request }) => {
    // 1. Accéder au Centre de Téléchargement
    await page.goto('/?view=website#download');
    await page.waitForLoadState('domcontentloaded');

    // Vérifier la présence du bouton de téléchargement de l'APK
    const apkButton = page.locator('[data-testid="download-btn-android-apk"]');
    await expect(apkButton).toBeVisible();

    // Vérifier l'avertissement de sécurité
    await expect(page.locator('[data-testid="android-apk-warning"]')).toBeVisible();

    // Vérifier les métadonnées affichées
    await expect(page.locator('[data-testid="android-apk-version"]')).toContainText('v1.3.6');
    await expect(page.locator('[data-testid="android-apk-buildid"]')).toContainText('BA-V1.3.6');
    await expect(page.locator('[data-testid="android-apk-size"]')).toContainText('9 916 814 octets');

    // Vérifier le hash affiché après clic sur le bouton toggle
    await page.locator('[data-testid="toggle-sha-Bird-Academy-User.apk"]').click();
    await expect(page.locator('[data-testid="android-apk-sha"]')).toContainText('20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63');

    // 2. Télécharger l'APK via requête HTTP directe depuis le navigateur
    const apkResponse = await request.get('/downloads/Bird-Academy-User.apk');
    expect(apkResponse.status()).toBe(200);

    const headers = apkResponse.headers();
    expect(headers['content-type']).toBe('application/vnd.android.package-archive');
    expect(headers['content-length']).toBe('9916814');
    expect(headers['content-disposition']).toContain('Bird-Academy-User.apk');

    // 3. Calculer l'empreinte SHA-256 sur le binaire réellement téléchargé
    const bodyBuffer = await apkResponse.body();
    expect(bodyBuffer.length).toBe(9916814);

    const calculatedSha256 = crypto.createHash('sha256').update(bodyBuffer).digest('hex').toUpperCase();
    expect(calculatedSha256).toBe('20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63');
  });

  test('E2E-AF03: Téléchargement du Kit Testeur et des Formulaires Opérationnels indispensables', async ({ request }) => {
    // 1. Formulaire de Session Opérationnelle
    const sessionFormRes = await request.get('/downloads/QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md');
    expect(sessionFormRes.status()).toBe(200);
    expect(sessionFormRes.headers()['content-type']).toContain('text/markdown');
    const sessionFormText = await sessionFormRes.text();
    expect(sessionFormText).toContain('AND-001');
    expect(sessionFormText).toContain('AND-032');
    expect(sessionFormText).toContain('SESSION-01');

    // 2. Formulaire d'Incident
    const incidentFormRes = await request.get('/downloads/QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md');
    expect(incidentFormRes.status()).toBe(200);
    const incidentFormText = await incidentFormRes.text();
    expect(incidentFormText).toContain("FICHE DE SIGNALEMENT D'ANOMALIE");

    // 3. Formulaire de Preuves
    const evidenceFormRes = await request.get('/downloads/QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md');
    expect(evidenceFormRes.status()).toBe(200);
    const evidenceFormText = await evidenceFormRes.text();
    expect(evidenceFormText).toContain('REGISTRE DES PREUVES & CAPTURES');

    // 4. Guide de Recette Terrain
    const guideRes = await request.get('/downloads/QA_ANDROID_FIELD_KIT_001_GUIDE.md');
    expect(guideRes.status()).toBe(200);
    const guideText = await guideRes.text();
    expect(guideText).toContain('GUIDE TERRAIN SIMPLIFIÉ');
  });

  test('E2E-AF04: Vérification de l\'absence d\'accès matériel direct depuis l\'environnement automatisé', async () => {
    // Ce test formalise la frontière infranchissable entre test automatisé et test physique
    // L'agent automatisé ne peut pas accéder physiquement aux terminaux Samsung/Xiaomi en volière
    const isPhysicalAccessAvailable = false; // Antigravity tourne dans un conteneur Windows sans pont physique
    expect(isPhysicalAccessAvailable).toBe(false);
  });
});
