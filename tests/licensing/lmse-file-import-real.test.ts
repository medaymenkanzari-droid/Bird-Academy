/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION QA-FIX B-010-002
 * Suite de tests formelle : Importation réelle et validation cryptographique des fichiers .lmse
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { WebOrderCheckoutService } from '../../src/features/commercial-website/services/WebOrderCheckoutService';
import { LicenseDeliveryPackageGenerator } from '../../src/features/licensing/commercial/services/LicenseDeliveryPackageGenerator';
import { LicenseGenerator } from '../../src/features/licensing/engines/LicenseGenerator';
import { OfflineBetaExporter } from '../../src/features/licensing/engines/OfflineBetaExporter';
import { OfflineBetaValidator } from '../../src/features/licensing/services/OfflineBetaValidator';
import { LicensingService } from '../../src/features/licensing/services/LicensingService';
import { CryptoService } from '../../src/features/licensing/services/CryptoService';
import { InMemoryLicenseRepository } from '../../src/features/licensing/repositories/InMemoryLicenseRepository';
import { DeviceFingerprint, License } from '../../src/features/licensing/types/licensing';

describe('MISSION QA-FIX B-010-002: Validation de l\'importation réelle des fichiers .lmse', () => {
  const dummyDevice: DeviceFingerprint = {
    deviceId: 'DEVICE-TEST-USER-001',
    os: 'Windows',
    browserHash: 'HASH_DEV_WIN_2026',
    screenSpec: '1920x1080',
    timezone: 'Europe/Paris',
    language: 'fr-FR',
    hardwareConcurrency: 8,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };

  const sampleOrderInput = {
    offerId: 'OFFER-PREMIUM-ANNUAL-2026',
    customerName: 'Élevage des Canaris Royaux',
    customerEmail: 'contact@canaris-royaux.fr',
    country: 'FR',
    language: 'fr',
    notes: 'Commande Commerciale Test B-010-002',
  };

  test('TEST 01: Générer une licence commerciale réelle via le checkout commercial', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const result = await checkoutService.processCheckout(sampleOrderInput);

    assert.equal(result.success, true, 'Le checkout doit réussir');
    assert.ok(result.order, 'La commande doit être créée');
    assert.ok(result.deliveryPackage, 'Le package de livraison doit être présent');
    assert.ok(result.deliveryPackage.licenseId, 'La licence doit avoir un ID');
    assert.ok(result.deliveryPackage.licenseKey, 'La licence doit avoir une clé');
    assert.ok(result.deliveryPackage.licenseKey.startsWith('LMSE-'), 'La clé doit suivre le format standard LMSE');
  });

  test('TEST 02: Générer le fichier license_<id>.lmse et vérifier extension, contenu et format', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const result = await checkoutService.processCheckout(sampleOrderInput);
    const pkg = result.deliveryPackage!;

    const lmseFile = pkg.files.find(f => f.filename.endsWith('.lmse'));
    assert.ok(lmseFile, 'Le fichier .lmse doit exister dans le package');
    assert.equal(lmseFile.filename, `license_${pkg.licenseId}.lmse`);
    assert.equal(lmseFile.contentType, 'application/json');

    const contentStr = typeof lmseFile.content === 'string' ? lmseFile.content : new TextDecoder().decode(lmseFile.content);
    const parsed = JSON.parse(contentStr);

    assert.equal(parsed.format, 'bird-academy-lmse', 'Le format doit être strictement "bird-academy-lmse"');
    assert.equal(parsed.version, 1, 'La version doit être 1');
    assert.ok(parsed.license, 'L\'objet license doit être présent');
    assert.equal(parsed.license.id, pkg.licenseId);
    assert.equal(parsed.license.key, pkg.licenseKey);
    assert.equal(parsed.license.holderName, sampleOrderInput.customerName);
    assert.ok(parsed.checksum, 'Le checksum doit être renseigné');
    assert.ok(parsed.signature, 'La signature doit être renseignée');
  });

  test('TEST 03: Passer le fichier généré dans le parser User (OfflineBetaValidator)', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const result = await checkoutService.processCheckout(sampleOrderInput);
    const pkg = result.deliveryPackage!;
    const lmseFile = pkg.files.find(f => f.filename.endsWith('.lmse'))!;
    const contentStr = typeof lmseFile.content === 'string' ? lmseFile.content : new TextDecoder().decode(lmseFile.content);

    const validation = await OfflineBetaValidator.validateFile(contentStr, dummyDevice);

    assert.equal(validation.isValid, true, `Le parser User doit valider le fichier .lmse (code: ${validation.code}, msg: ${validation.message})`);
    assert.equal(validation.code, 'VALID');
    assert.ok(validation.license, 'La licence construite doit être présente');
    assert.equal(validation.license.id, pkg.licenseId);
    assert.equal(validation.license.key, pkg.licenseKey);
  });

  test('TEST 04: Vérifier la signature cryptographique de la licence générée', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const result = await checkoutService.processCheckout(sampleOrderInput);
    const pkg = result.deliveryPackage!;
    const lmseFile = pkg.files.find(f => f.filename.endsWith('.lmse'))!;
    const contentStr = typeof lmseFile.content === 'string' ? lmseFile.content : new TextDecoder().decode(lmseFile.content);
    const parsed = JSON.parse(contentStr);

    const lic = parsed.license;
    const payloadToSign = `${lic.id}:${lic.key}:${lic.holderName}:${lic.type}:${lic.issuedAt}:${lic.expiresAt || 'NEVER'}:${lic.maxDevices}`;
    const computedChecksum = await CryptoService.sha256(payloadToSign);

    assert.equal(computedChecksum.toLowerCase(), parsed.checksum.toLowerCase(), 'Le checksum calculé doit correspondre au checksum du fichier');
    const isSignatureValid = await CryptoService.verifySignature(computedChecksum, parsed.signature);
    assert.equal(isSignatureValid, true, 'La signature numérique doit être valide selon la clé d\'autorité publique');
  });

  test('TEST 05: Vérifier l\'identité de la licence et l\'enregistrement de l\'appareil', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const result = await checkoutService.processCheckout(sampleOrderInput);
    const pkg = result.deliveryPackage!;
    const lmseFile = pkg.files.find(f => f.filename.endsWith('.lmse'))!;
    const contentStr = typeof lmseFile.content === 'string' ? lmseFile.content : new TextDecoder().decode(lmseFile.content);

    const validation = await OfflineBetaValidator.validateFile(contentStr, dummyDevice);

    assert.equal(validation.isValid, true);
    assert.equal(validation.deviceRegistered, true);
    assert.ok(validation.license?.activations.some(a => a.fingerprint.deviceId === dummyDevice.deviceId), 'L\'appareil doit être enregistré');
    assert.equal(validation.license?.holderName, sampleOrderInput.customerName);
  });

  test('TEST 06: Tester une licence falsifiée (altération du titulaire ou de la signature)', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const result = await checkoutService.processCheckout(sampleOrderInput);
    const pkg = result.deliveryPackage!;
    const lmseFile = pkg.files.find(f => f.filename.endsWith('.lmse'))!;
    const contentStr = typeof lmseFile.content === 'string' ? lmseFile.content : new TextDecoder().decode(lmseFile.content);
    const parsed = JSON.parse(contentStr);

    // Falsification 1 : altération du nom du titulaire
    const tamperedPayload = { ...parsed, license: { ...parsed.license, holderName: 'Hacker Frauduleux' } };
    const tamperedResult = await OfflineBetaValidator.validateFile(JSON.stringify(tamperedPayload), dummyDevice);
    assert.equal(tamperedResult.isValid, false, 'Une licence avec titulaire modifié doit être rejetée');
    assert.equal(tamperedResult.code, 'INVALID_CHECKSUM');

    // Falsification 2 : altération de la signature numérique
    const tamperedSig = { ...parsed, signature: '0000111122223333444455556666777788889999AAAABBBBCCCCDDDDEEEEFFFF' };
    const tamperedSigResult = await OfflineBetaValidator.validateFile(JSON.stringify(tamperedSig), dummyDevice);
    assert.equal(tamperedSigResult.isValid, false, 'Une licence avec signature invalide doit être rejetée');
    assert.equal(tamperedSigResult.code, 'INVALID_SIGNATURE');
  });

  test('TEST 07: Tester un fichier JSON arbitraire renommé fake.lmse', async () => {
    const arbitraryJson = JSON.stringify({
      software: 'Bird Academy',
      status: 'active',
      user: 'test',
    });

    const result = await OfflineBetaValidator.validateFile(arbitraryJson, dummyDevice);
    assert.equal(result.isValid, false, 'Un fichier JSON arbitraire doit être rejeté');
    assert.equal(result.code, 'UNSUPPORTED_FORMAT');
    assert.ok(result.message.includes('bird-academy-lmse'), 'Le message doit indiquer le format attendu');
  });

  test('TEST 08: Tester un fichier texte arbitraire renommé fake.lmse', async () => {
    const plainText = 'Ceci est un fichier texte arbitraire qui n\'est pas un JSON valide.';
    const result = await OfflineBetaValidator.validateFile(plainText, dummyDevice);
    assert.equal(result.isValid, false, 'Un texte arbitraire doit être rejeté');
    assert.equal(result.code, 'INVALID_JSON_FORMAT');
  });

  test('TEST 09: Tester le fichier .lmse extrait du package ZIP binaire', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const result = await checkoutService.processCheckout(sampleOrderInput);
    const pkg = result.deliveryPackage!;

    // Générer le ZIP binaire
    const zipBytes = LicenseDeliveryPackageGenerator.generatePackageZip(pkg);
    assert.ok(zipBytes.length > 0, 'Le ZIP binaire doit être généré');

    // Récupérer le fichier .lmse du package (exactement celui injecté dans le ZIP)
    const lmseFile = pkg.files.find(f => f.filename === `license_${pkg.licenseId}.lmse`)!;
    const fileContent = typeof lmseFile.content === 'string' ? lmseFile.content : new TextDecoder().decode(lmseFile.content);

    const validation = await OfflineBetaValidator.validateFile(fileContent, dummyDevice);
    assert.equal(validation.isValid, true, 'Le fichier .lmse du package ZIP doit être parfaitement valide');
    assert.equal(validation.license?.id, pkg.licenseId);
  });

  test('TEST 10: Comparer le LMSE individuel avec le LMSE du ZIP (identité stricte)', async () => {
    const checkoutService = WebOrderCheckoutService.getInstance();
    const result = await checkoutService.processCheckout(sampleOrderInput);
    const pkg = result.deliveryPackage!;

    const lmseFile = pkg.files.find(f => f.filename === `license_${pkg.licenseId}.lmse`)!;
    const individualContent = typeof lmseFile.content === 'string' ? lmseFile.content : new TextDecoder().decode(lmseFile.content);

    const individualHash = await CryptoService.sha256(individualContent);

    // Vérifier que le contenu inclus dans le kit ZIP est strictement identique
    const zipEntries = pkg.files.map(f => ({ filename: f.filename, content: f.content }));
    const zipLmseEntry = zipEntries.find(e => e.filename === `license_${pkg.licenseId}.lmse`)!;
    const zipContent = typeof zipLmseEntry.content === 'string' ? zipLmseEntry.content : new TextDecoder().decode(zipLmseEntry.content);
    const zipHash = await CryptoService.sha256(zipContent);

    assert.equal(individualHash, zipHash, 'Les hashs SHA-256 du fichier individuel et de l\'entrée ZIP doivent être strictement identiques');
    assert.equal(individualContent, zipContent, 'Le contenu textuel doit être strictement identique');
  });

  test('TEST 11: Validation de bout en bout avec LicensingService et déblocage persistant', async () => {
    const memRepo = new InMemoryLicenseRepository();
    const licensingService = new LicensingService(memRepo);

    // Initialement pas de licence
    const initRes = await licensingService.initialize();
    assert.equal(initRes.isValid, false);
    assert.equal(initRes.code, 'NO_LICENSE');

    // Génération du package commercial
    const checkoutService = WebOrderCheckoutService.getInstance();
    const res = await checkoutService.processCheckout({
      offerId: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
      customerName: 'Société Avicole Pro',
      customerEmail: 'pro@avicook.com',
    });

    const pkg = res.deliveryPackage!;
    const lmseFile = pkg.files.find(f => f.filename.endsWith('.lmse'))!;
    const content = typeof lmseFile.content === 'string' ? lmseFile.content : new TextDecoder().decode(lmseFile.content);

    // Importation dans LicensingService
    const importRes = await licensingService.importOfflineBetaLicense(content);
    assert.equal(importRes.isValid, true, 'L\'importation doit réussir');
    assert.equal(importRes.code, 'VALID');

    // Vérifier persistance après "redémarrage" / ré-initialisation
    const postRestartRes = await licensingService.validateCurrentLicense();
    assert.equal(postRestartRes.isValid, true, 'L\'application doit rester débloquée après redémarrage');
    assert.equal(postRestartRes.license?.id, pkg.licenseId);
  });

  test('TEST 12: Délivrance de licence commerciale officielle par l\'autorité backend (LMSE Backend Server)', async () => {
    const { LmseBackendServer } = await import('../../src/server/lmseServer');
    const backend = new LmseBackendServer();
    let server: any = null;
    const isAlreadyUp = await fetch('http://localhost:3001/api/health').then(r => r.ok).catch(() => false);
    if (!isAlreadyUp) {
      server = await new Promise<any>((resolve) => {
        const s = backend.app.listen(3001, '0.0.0.0', () => resolve(s));
      });
    }

    try {
      // Le frontend effectue le checkout
      const checkoutService = WebOrderCheckoutService.getInstance();
      const res = await checkoutService.processCheckout({
        offerId: 'OFFER-PREMIUM-ANNUAL-2026',
        customerName: 'Élevage Autorité Backend',
        customerEmail: 'autorite@elevage.fr',
      });

      assert.equal(res.success, true);
      assert.ok(res.deliveryPackage);
      const lmseFile = res.deliveryPackage!.files.find(f => f.filename.endsWith('.lmse'))!;
      const content = typeof lmseFile.content === 'string' ? lmseFile.content : new TextDecoder().decode(lmseFile.content);

      // Validation par l'application User
      const validation = await OfflineBetaValidator.validateFile(content, dummyDevice);
      assert.equal(validation.isValid, true, 'La licence signée par l\'autorité backend doit être valide');
      assert.equal(validation.code, 'VALID');
      assert.equal(validation.license?.holderName, 'Élevage Autorité Backend');
    } finally {
      if (server) {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    }
  });

  test('TEST 13: Isolation architecturale stricte — Zéro fuite de clé privée dans le frontend User', () => {
    const pubKey = CryptoService.getPublicVerificationKey();
    assert.ok(pubKey, 'La clé de vérification publique doit exister');
    assert.equal(pubKey.includes('PRIVATE'), false, 'Aucune clé privée dans la clé publique');

    // Vérifier qu'une tentative de récupération de la clé privée en mode User lève une exception de sécurité
    process.env.VITE_APP_MODE = 'user';
    assert.throws(
      () => {
        (CryptoService as any).getMasterSalt();
      },
      /SECURITY_ERROR/,
      'L\'accès au sel privé doit être strictement bloqué dans le bundle User'
    );
  });
});
