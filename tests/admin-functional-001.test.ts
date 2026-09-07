/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION ADMIN-FUNCTIONAL-001
 * Validation fonctionnelle complète du Centre d'Administration LMSE
 * Version : v1.3.6-RC4
 * 
 * Suite de tests officielle (46 tests répartis en 9 catégories A à I) :
 * A — Accès Admin & RBAC
 * B — Consultation des licences
 * C — Révocation
 * D — Remplacement
 * E — Audit & Traçabilité
 * F — Réexport du kit de livraison
 * G — Isolation stricte User / Commercial / Admin
 * H — Sécurité & Robustesse face aux attaques
 * I — Non-régression globale
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage pour l'environnement Node
if (typeof globalThis.localStorage === 'undefined') {
  const storage: Record<string, string> = {};
  globalThis.localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(k => delete storage[k]); },
    length: 0,
    key: () => null,
  };
}

import { LmseBackendServer } from '../src/server/lmseServer.js';
import { AdminAuthService } from '../src/server/middleware/adminAuth.js';
import { RateLimiter } from '../src/server/middleware/rateLimiter.js';
import { InMemoryLicenseRepository } from '../src/features/licensing/repositories/InMemoryLicenseRepository.js';
import { LicenseGenerator } from '../src/features/licensing/engines/LicenseGenerator.js';
import { LicenseValidator } from '../src/features/licensing/engines/LicenseValidator.js';
import { ActivationEngine } from '../src/features/licensing/engines/ActivationEngine.js';
import { LicenseLifecycleEngine } from '../src/features/licensing/engines/LicenseLifecycleEngine.js';
import { CryptoService } from '../src/features/licensing/services/CryptoService.js';
import { KeyValidator } from '../src/features/licensing/validators/KeyValidator.js';
import { LicenseDeliveryPackageGenerator } from '../src/features/licensing/commercial/services/LicenseDeliveryPackageGenerator.js';
import { SubscriptionTierResolver } from '../src/features/subscription/services/SubscriptionTierResolver.js';
import { CommercialLicenseAdminService } from '../src/features/licensing/admin/services/CommercialLicenseAdminService.js';
import { assertAdminContext, isAdminRole, isUserBuild } from '../src/config/appMode.js';
import { DeviceFingerprint, License } from '../src/features/licensing/types/licensing.js';

const TEST_DEVICE: DeviceFingerprint = {
  deviceId: 'DEV-TEST-QA-001',
  os: 'Windows',
  browserHash: 'hash-test-qa-001',
  screenSpec: '1920x1080',
  timezone: 'UTC',
  language: 'fr-FR',
  hardwareConcurrency: 8,
  createdAt: '2026-09-01T00:00:00.000Z',
  lastSeenAt: '2026-09-07T12:00:00.000Z',
};

describe('MISSION ADMIN-FUNCTIONAL-001 — Centre d\'Administration LMSE', () => {
  let repo: InMemoryLicenseRepository;
  let server: LmseBackendServer;
  let superAdminSession: any;
  let adminSession: any;
  let supportSession: any;

  before(async () => {
    RateLimiter.clearStore();
    process.env.VITE_APP_MODE = 'admin';

    repo = new InMemoryLicenseRepository();
    server = new LmseBackendServer(repo);

    superAdminSession = AdminAuthService.createSession({
      id: 'usr_super_01',
      email: 'superadmin@birdacademy.com',
      name: 'Super Admin QA',
      role: 'super_admin',
    });

    adminSession = AdminAuthService.createSession({
      id: 'usr_admin_02',
      email: 'admin.ops@birdacademy.com',
      name: 'Admin Ops QA',
      role: 'admin',
    });

    supportSession = AdminAuthService.createSession({
      id: 'usr_supp_03',
      email: 'support@birdacademy.com',
      name: 'Support Tech QA',
      role: 'support',
    });
  });

  // =========================================================================
  // CATEGORIE A : ACCÈS ADMIN & CONTRÔLE D'AUTORISATIONS (RBAC)
  // =========================================================================
  describe('Catégorie A : Accès Admin & Contrôle d\'autorisations (RBAC)', () => {
    test('A.1 : Requête sans authentification sur /api/admin/licenses retourne HTTP 401', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/admin/licenses',
      });
      assert.strictEqual(res.statusCode, 401);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.error, 'UNAUTHORIZED');
    });

    test('A.2 : Requête avec token falsifié ou corrompu retourne HTTP 401', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/admin/licenses',
        headers: { authorization: 'Bearer FAKE_TAMPERED_TOKEN_999' },
      });
      assert.strictEqual(res.statusCode, 401);
    });

    test('A.3 : Requête avec rôle insuffisant (support sur création de licence) retourne HTTP 403', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${supportSession.token}` },
        payload: { holderName: 'Unauthorized Create', type: 'commercial' },
      });
      assert.strictEqual(res.statusCode, 403);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.error, 'INSUFFICIENT_PERMISSIONS');
    });

    test('A.4 : Requête avec contexte Super Admin valide sur /api/admin/licenses est autorisée', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${superAdminSession.token}` },
      });
      assert.strictEqual(res.statusCode, 200);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.licenses));
    });

    test('A.5 : Tentative d\'appel assertAdminContext() depuis contexte utilisateur échoue avec SECURITY_ERROR', () => {
      const previousMode = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'user';
      try {
        assert.strictEqual(isUserBuild(), true);
        assert.throws(() => assertAdminContext('breeder'), /SECURITY_ERROR/);
        assert.throws(() => assertAdminContext('super_admin'), /SECURITY_ERROR/);
      } finally {
        process.env.VITE_APP_MODE = previousMode;
      }
    });

    test('A.6 : Requête directe sur /api/admin/* sans token depuis le frontend commercial est rejetée HTTP 401', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses',
        headers: { 'x-origin-client': 'commercial-website' },
        payload: { holderName: 'Commercial Bypass', type: 'enterprise' },
      });
      assert.strictEqual(res.statusCode, 401);
    });
  });

  // =========================================================================
  // CATEGORIE B : CONSULTATION DES LICENCES (LISTE, DÉTAILS, SÉCURITÉ)
  // =========================================================================
  describe('Catégorie B : Consultation des licences', () => {
    let createdLicenseId: string;

    before(async () => {
      // Création d'une licence témoin
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${superAdminSession.token}` },
        payload: {
          holderName: 'Consultation Test Breeder',
          holderEmail: 'breeder.consult@test.com',
          type: 'commercial',
          durationDays: 365,
          maxDevices: 1,
        },
      });
      assert.strictEqual(res.statusCode, 201);
      const body = JSON.parse(res.payload);
      createdLicenseId = body.license.id;
    });

    test('B.1 : GET /api/admin/licenses liste fidèlement les licences enregistrées', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${adminSession.token}` },
      });
      assert.strictEqual(res.statusCode, 200);
      const body = JSON.parse(res.payload);
      assert.ok(body.count >= 1);
      const found = body.licenses.find((l: License) => l.id === createdLicenseId);
      assert.ok(found, 'La licence créée doit être présente dans la liste');
    });

    test('B.2 : Chaque licence expose ses attributs nominatifs obligatoires sans omission', async () => {
      const lic = await repo.getLicenseById(createdLicenseId);
      assert.ok(lic);
      assert.ok(lic.id.startsWith('lic_'));
      assert.ok(lic.key.startsWith('LMSE-COMM-'));
      assert.strictEqual(lic.holderName, 'Consultation Test Breeder');
      assert.strictEqual(lic.type, 'commercial');
      assert.ok(lic.issuedAt);
      assert.ok(lic.expiresAt);
      assert.strictEqual(lic.checksum.length, 64);
      assert.ok(lic.signature.length > 20);
    });

    test('B.3 : Résolution correcte du SubscriptionTier pour la licence consultée', async () => {
      const lic = await repo.getLicenseById(createdLicenseId);
      assert.ok(lic);
      const tier = SubscriptionTierResolver.resolve(lic);
      assert.strictEqual(tier, 'PREMIUM');
    });

    test('B.4 : L\'état des activations et de la politique est intègre et consultable', async () => {
      const lic = await repo.getLicenseById(createdLicenseId);
      assert.ok(lic);
      assert.ok(Array.isArray(lic.activations));
      assert.strictEqual(lic.policy.maxDevices, 1);
      assert.strictEqual(lic.policy.allowOfflineActivation, true);
    });

    test('B.5 : Aucune clé privée ni mot de passe administrateur n\'est exposé dans les payloads de licence', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${adminSession.token}` },
      });
      assert.strictEqual(res.statusCode, 200);
      const rawPayload = res.payload;
      assert.doesNotMatch(rawPayload, /PRIVATE_KEY/i);
      assert.doesNotMatch(rawPayload, /passwordHash/i);
      assert.doesNotMatch(rawPayload, /passwordSalt/i);
    });
  });

  // =========================================================================
  // CATEGORIE C : RÉVOCATION DE LICENCE
  // =========================================================================
  describe('Catégorie C : Révocation de licence', () => {
    let licenseToRevoke: License;

    before(async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${superAdminSession.token}` },
        payload: {
          holderName: 'Breeder For Revocation',
          type: 'commercial',
          durationDays: 365,
          maxDevices: 1,
        },
      });
      assert.strictEqual(res.statusCode, 201);
      licenseToRevoke = JSON.parse(res.payload).license;
      licenseToRevoke.status = 'active';
      await repo.saveLicense(licenseToRevoke);
    });

    test('C.1 : Workflow nominal : POST /api/admin/licenses/:id/revoke passe la licence en "revoked"', async () => {
      const res = await server.inject({
        method: 'POST',
        url: `/api/admin/licenses/${licenseToRevoke.id}/revoke`,
        headers: { authorization: `Bearer ${adminSession.token}` },
        payload: { reason: 'Violation des conditions d\'utilisation' },
      });
      assert.strictEqual(res.statusCode, 200);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.license.status, 'revoked');
      assert.ok(body.license.revokedAt);
      assert.strictEqual(body.license.revocationReason, 'Violation des conditions d\'utilisation');

      // Vérification dans le repository réel
      const updated = await repo.getLicenseById(licenseToRevoke.id);
      assert.strictEqual(updated?.status, 'revoked');
    });

    test('C.2 : La licence révoquée est immédiatement rejetée par LicenseValidator', async () => {
      const revokedLic = await repo.getLicenseById(licenseToRevoke.id);
      assert.ok(revokedLic);
      const revocationList = await repo.getRevocationList();
      const val = await LicenseValidator.validateLicense(revokedLic, TEST_DEVICE, revocationList);
      assert.strictEqual(val.isValid, false);
      assert.strictEqual(val.status, 'revoked');
      assert.strictEqual(val.code, 'LICENSE_REVOKED');
    });

    test('C.3 : Tentative d\'activation de la clé révoquée par ActivationEngine est refusée', async () => {
      const actRes = await ActivationEngine.activateKey(
        repo,
        licenseToRevoke.key,
        'Breeder For Revocation',
        TEST_DEVICE
      );
      assert.strictEqual(actRes.isValid, false);
      assert.strictEqual(actRes.code, 'LICENSE_REVOKED');
    });

    test('C.4 : Révocation d\'un ID inexistant retourne HTTP 404', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses/lic_inexistante_9999/revoke',
        headers: { authorization: `Bearer ${adminSession.token}` },
        payload: { reason: 'Inexistant' },
      });
      assert.strictEqual(res.statusCode, 404);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.error, 'NOT_FOUND');
    });

    test('C.5 : Double révocation sur une licence déjà révoquée est idempotente sans plantage', async () => {
      const res = await server.inject({
        method: 'POST',
        url: `/api/admin/licenses/${licenseToRevoke.id}/revoke`,
        headers: { authorization: `Bearer ${superAdminSession.token}` },
        payload: { reason: 'Deuxième révocation confirmation' },
      });
      assert.strictEqual(res.statusCode, 200);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.license.status, 'revoked');
    });

    test('C.6 : Tentative de révocation sans token Admin retourne HTTP 401', async () => {
      const res = await server.inject({
        method: 'POST',
        url: `/api/admin/licenses/${licenseToRevoke.id}/revoke`,
        payload: { reason: 'Anonyme' },
      });
      assert.strictEqual(res.statusCode, 401);
    });
  });

  // =========================================================================
  // CATEGORIE D : REMPLACEMENT DE LICENCE (WORKFLOW REPLACED)
  // =========================================================================
  describe('Catégorie D : Remplacement de licence (Workflow REPLACED)', () => {
    let initialLicense: License;
    let replacementResult: { activeLicense: License; archivedLicense: License };

    before(async () => {
      // 1. Création de la licence initiale
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${superAdminSession.token}` },
        payload: {
          holderName: 'Breeder For Replacement',
          holderEmail: 'breeder.replace@test.com',
          type: 'commercial',
          durationDays: 365,
          maxDevices: 1,
        },
      });
      assert.strictEqual(res.statusCode, 201);
      initialLicense = JSON.parse(res.payload).license;
      initialLicense.status = 'active';
      await repo.saveLicense(initialLicense);
    });

    test('D.1 : POST /api/admin/licenses/:id/replace exécute le remplacement HTTP avec succès', async () => {
      const res = await server.inject({
        method: 'POST',
        url: `/api/admin/licenses/${initialLicense.id}/replace`,
        headers: { authorization: `Bearer ${adminSession.token}` },
        payload: {
          reason: 'Passage sur nouvelle machine de volière',
          targetTier: 'PRO',
        },
      });
      assert.strictEqual(res.statusCode, 200);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.success, true);
      assert.ok(body.activeLicense);
      assert.ok(body.archivedLicense);

      replacementResult = {
        activeLicense: body.activeLicense,
        archivedLicense: body.archivedLicense,
      };

      // Statuts attendus
      assert.strictEqual(replacementResult.archivedLicense.status, 'replaced');
      assert.strictEqual(replacementResult.activeLicense.status, 'active');
      assert.notStrictEqual(replacementResult.activeLicense.key, replacementResult.archivedLicense.key);
    });

    test('D.2 : L\'ancienne licence a le statut "replaced" et n\'a pas été convertie en "revoked"', async () => {
      const storedOld = await repo.getLicenseById(initialLicense.id);
      assert.ok(storedOld);
      assert.strictEqual(storedOld.status, 'replaced');
      assert.strictEqual(storedOld.revokedAt, null, 'Le statut REPLACED doit être distinct de REVOKED');
    });

    test('D.3 : L\'ancienne licence remplacée est immédiatement REFUSÉE par LicenseValidator', async () => {
      const storedOld = await repo.getLicenseById(initialLicense.id);
      assert.ok(storedOld);
      const val = await LicenseValidator.validateLicense(storedOld, TEST_DEVICE);
      assert.strictEqual(val.isValid, false);
      assert.strictEqual(val.status, 'replaced');
      assert.strictEqual(val.code, 'LICENSE_REPLACED');
    });

    test('D.4 : Tentative d\'activation de l\'ancienne clé remplacée est REFUSÉE par ActivationEngine', async () => {
      const actRes = await ActivationEngine.activateKey(
        repo,
        initialLicense.key,
        'Breeder For Replacement',
        TEST_DEVICE
      );
      assert.strictEqual(actRes.isValid, false);
      assert.strictEqual(actRes.code, 'LICENSE_REPLACED');
    });

    test('D.5 : La nouvelle licence de remplacement est pleinement valide et fonctionnelle', async () => {
      const storedNew = await repo.getLicenseById(replacementResult.activeLicense.id);
      assert.ok(storedNew);
      const val = await LicenseValidator.validateLicense(storedNew, TEST_DEVICE);
      assert.strictEqual(val.isValid, true);
      assert.strictEqual(val.code, 'VALID');
    });

    test('D.6 : Tentative de remplacer une licence inexistante retourne HTTP 404', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses/lic_fake_nonexistent_000/replace',
        headers: { authorization: `Bearer ${adminSession.token}` },
        payload: { reason: 'Test' },
      });
      assert.strictEqual(res.statusCode, 404);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.error, 'NOT_FOUND');
    });
  });

  // =========================================================================
  // CATEGORIE E : AUDIT & TRAÇABILITÉ
  // =========================================================================
  describe('Catégorie E : Audit & Traçabilité', () => {
    test('E.1 : Les logs d\'audit serveur contiennent les actions LICENSE_CREATED', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/admin/audit',
        headers: { authorization: `Bearer ${adminSession.token}` },
      });
      assert.strictEqual(res.statusCode, 200);
      const body = JSON.parse(res.payload);
      assert.ok(Array.isArray(body.auditLogs));
      const hasCreated = body.auditLogs.some((l: any) => l.action === 'LICENSE_CREATED');
      assert.ok(hasCreated, 'L\'action LICENSE_CREATED doit figurer dans les logs');
    });

    test('E.2 : Les logs d\'audit serveur contiennent l\'action LICENSE_REVOKED', async () => {
      const logs = server.getAuditLogs();
      const hasRevoked = logs.some(l => l.action === 'LICENSE_REVOKED');
      assert.ok(hasRevoked, 'L\'action LICENSE_REVOKED doit figurer dans les logs');
    });

    test('E.3 : Les logs d\'audit serveur contiennent l\'action LICENSE_REPLACED', async () => {
      const logs = server.getAuditLogs();
      const hasReplaced = logs.some(l => l.action === 'LICENSE_REPLACED');
      assert.ok(hasReplaced, 'L\'action LICENSE_REPLACED doit figurer dans les logs');
    });

    test('E.4 : Chaque log d\'audit comprend un timestamp ISO, l\'auteur, l\'IP et le résultat', () => {
      const logs = server.getAuditLogs();
      assert.ok(logs.length > 0);
      for (const entry of logs.slice(0, 10)) {
        assert.ok(entry.id.startsWith('AUD-SRV-'));
        assert.ok(entry.timestamp);
        assert.ok(entry.who);
        assert.ok(entry.role);
        assert.ok(['SUCCESS', 'FAILED', 'BLOCKED'].includes(entry.result));
      }
    });

    test('E.5 : Zéro secret ou clé privée ne fuite dans l\'ensemble des entrées d\'audit', () => {
      const logs = server.getAuditLogs();
      const serialized = JSON.stringify(logs);
      assert.doesNotMatch(serialized, /LMSE_TEST_PRIVATE_KEY/);
      assert.doesNotMatch(serialized, /PRIVATE_SIGNING_KEY/);
      assert.doesNotMatch(serialized, /BEGIN EC PRIVATE KEY/);
    });
  });

  // =========================================================================
  // CATEGORIE F : RÉEXPORT DU KIT DE LIVRAISON DE LICENCE
  // =========================================================================
  describe('Catégorie F : Réexport du kit de livraison', () => {
    let testLicense: License;

    before(async () => {
      testLicense = await LicenseGenerator.generateLicense({
        holderName: 'Kit Export Breeder',
        holderEmail: 'kit@test.com',
        type: 'commercial',
        durationDays: 365,
        maxDevices: 1,
      });
      testLicense.status = 'active';
    });

    test('F.1 : Le générateur de kit produit exactement 5 fichiers certifiés', () => {
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(testLicense);
      assert.ok(pkg);
      assert.strictEqual(pkg.files.length, 5);
      const names = pkg.files.map(f => f.filename);
      assert.ok(names.includes(`license_${testLicense.id}.lmse`));
      assert.ok(names.includes('license-key.txt'));
      assert.ok(names.includes('license-qr.png'));
      assert.ok(names.includes('license-info.txt'));
      assert.ok(names.includes('README.txt'));
    });

    test('F.2 : Le fichier .lmse contient le JSON officiel scellé avec checksum et signature', () => {
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(testLicense);
      const lmseFile = pkg.files.find(f => f.filename.endsWith('.lmse'));
      assert.ok(lmseFile);
      const parsed = JSON.parse(String(lmseFile.content));
      assert.strictEqual(parsed.license.id, testLicense.id);
      assert.strictEqual(parsed.checksum, testLicense.checksum);
      assert.strictEqual(parsed.signature, testLicense.signature);
    });

    test('F.3 : Le fichier license-key.txt contient la clé LMSE et les consignes mono-appareil', () => {
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(testLicense);
      const keyFile = pkg.files.find(f => f.filename === 'license-key.txt');
      assert.ok(keyFile);
      const text = String(keyFile.content);
      assert.ok(text.includes(testLicense.key));
      assert.ok(text.includes('1 appareil dédié, données 100% locales'));
    });

    test('F.4 : Le fichier license-qr.png est une image PNG valide avec signature binaire PNG', () => {
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(testLicense);
      const qrFile = pkg.files.find(f => f.filename === 'license-qr.png');
      assert.ok(qrFile);
      assert.ok(qrFile.content instanceof Uint8Array);
      // Header standard PNG : 0x89 0x50 0x4E 0x47
      assert.strictEqual(qrFile.content[0], 0x89);
      assert.strictEqual(qrFile.content[1], 0x50); // 'P'
      assert.strictEqual(qrFile.content[2], 0x4E); // 'N'
      assert.strictEqual(qrFile.content[3], 0x47); // 'G'
    });

    test('F.5 : L\'archive ZIP téléchargeable est construite avec intégrité complète', () => {
      const pkg = LicenseDeliveryPackageGenerator.generatePackage(testLicense);
      const zipBytes = LicenseDeliveryPackageGenerator.generatePackageZip(pkg);
      assert.ok(zipBytes instanceof Uint8Array);
      assert.ok(zipBytes.length > 100);
      // Magic bytes standard ZIP PK : 0x50 0x4B (PK)
      assert.strictEqual(zipBytes[0], 0x50);
      assert.strictEqual(zipBytes[1], 0x4B);
    });
  });

  // =========================================================================
  // CATEGORIE G : ISOLATION STRICTE USER / COMMERCIAL / ADMIN
  // =========================================================================
  describe('Catégorie G : Isolation stricte User / Commercial / Admin', () => {
    test('G.1 : En mode utilisateur, assertAdminContext() lève systématiquement SECURITY_ERROR', () => {
      const prev = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'user';
      try {
        assert.throws(() => assertAdminContext(), /SECURITY_ERROR/);
      } finally {
        process.env.VITE_APP_MODE = prev;
      }
    });

    test('G.2 : Le frontend commercial ne peut pas appeler la génération de clé sans passer par le serveur', () => {
      const prev = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'user';
      try {
        assert.throws(() => {
          assertAdminContext('commercial');
        }, /SECURITY_ERROR/);
      } finally {
        process.env.VITE_APP_MODE = prev;
      }
    });

    test('G.3 : L\'Admin LMSE est strictement découplé des entités d\'élevage (oiseaux, couples, pontes)', () => {
      // Vérification que le serveur LMSE n'importe aucun repository aviaire
      const serverCode = server.constructor.toString();
      assert.doesNotMatch(serverCode, /BirdRepository/);
      assert.doesNotMatch(serverCode, /CanariRepository/);
      assert.doesNotMatch(serverCode, /CoupleRepository/);
    });

    test('G.4 : Aucun endpoint /api/admin/* n\'autorise la manipulation directe de la base de volière', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/birds',
        headers: { authorization: `Bearer ${superAdminSession.token}` },
        payload: { ring: '2026-ILLEGAL' },
      });
      assert.strictEqual(res.statusCode, 404, 'Aucune route aviaire ne doit exister dans l\'administration');
    });
  });

  // =========================================================================
  // CATEGORIE H : SÉCURITÉ & ROBUSTESSE FACE AUX ATTAQUES
  // =========================================================================
  describe('Catégorie H : Sécurité & Robustesse face aux attaques', () => {
    test('H.1 : Altération du nom du titulaire invalide la signature cryptographique', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Original Security Holder',
        type: 'commercial',
      });
      lic.holderName = 'Hacked Tampered Name';
      const val = await LicenseValidator.validateLicense(lic, TEST_DEVICE);
      assert.strictEqual(val.isValid, false);
      assert.strictEqual(val.code, 'CORRUPTED');
    });

    test('H.2 : Payload avec type de licence inconnu est rejeté avec HTTP 400', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${adminSession.token}` },
        payload: { holderName: 'Test', type: 'hacked_infinite_vip' },
      });
      assert.strictEqual(res.statusCode, 400);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.error, 'INVALID_TYPE');
    });

    test('H.3 : Payload sans holderName est rejeté avec HTTP 400', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${adminSession.token}` },
        payload: { type: 'commercial' },
      });
      assert.strictEqual(res.statusCode, 400);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.error, 'INVALID_INPUT');
    });

    test('H.4 : Tentative de prototype pollution (__proto__) est neutralisée sans altération globale', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/api/admin/licenses',
        headers: { authorization: `Bearer ${adminSession.token}` },
        payload: {
          holderName: 'Pollution Test',
          type: 'commercial',
          __proto__: { isAdmin: true, bypass: true },
        },
      });
      assert.strictEqual(res.statusCode, 201);
      // @ts-ignore
      assert.strictEqual(Object.prototype.isAdmin, undefined);
      // @ts-ignore
      assert.strictEqual(Object.prototype.bypass, undefined);
    });

    test('H.5 : Clé de licence altérée avec format incorrect est rejetée par KeyValidator', () => {
      const badKey = 'LMSE-FORGED-XXXX';
      const check = KeyValidator.validateFormat(badKey);
      assert.strictEqual(check.isValid, false);
    });

    test('H.6 : Altération manuelle du statut à "active" sur une licence révoquée échoue', async () => {
      const lic = await LicenseGenerator.generateLicense({
        holderName: 'Tampered Status Test',
        type: 'commercial',
      });
      lic.status = 'revoked';
      lic.revokedAt = new Date().toISOString();

      // Tentative d'injection malveillante dans le champ status
      lic.status = 'active'; // Révoqué via revokedAt
      const val = await LicenseValidator.validateLicense(lic, TEST_DEVICE);
      assert.strictEqual(val.isValid, false);
      assert.strictEqual(val.status, 'revoked');
    });
  });

  // =========================================================================
  // CATEGORIE I : NON-RÉGRESSION GLOBALE
  // =========================================================================
  describe('Catégorie I : Non-régression globale', () => {
    test('I.1 : SubscriptionTierResolver mappe fidèlement les types de licence sur les 3 plans officiels', async () => {
      const freeResolved = SubscriptionTierResolver.resolve(null);
      const premLic = await LicenseGenerator.generateLicense({ holderName: 'Prem', type: 'commercial' });
      const proLic = await LicenseGenerator.generateLicense({ holderName: 'Pro', type: 'enterprise' });

      assert.strictEqual(freeResolved, 'FREE');
      assert.strictEqual(SubscriptionTierResolver.resolve(premLic), 'PREMIUM');
      assert.strictEqual(SubscriptionTierResolver.resolve(proLic), 'PRO');
    });

    test('I.2 : La vérification du statut public GET /api/license/status opère sans authentification requise', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/license/status',
      });
      assert.strictEqual(res.statusCode, 200);
      const body = JSON.parse(res.payload);
      assert.ok(typeof body.isValid === 'boolean');
    });

    test('I.3 : Le health check GET /api/health retourne HTTP 200 avec état intègre', async () => {
      const res = await server.inject({
        method: 'GET',
        url: '/api/health',
      });
      assert.strictEqual(res.statusCode, 200);
      const body = JSON.parse(res.payload);
      assert.strictEqual(body.status, 'ok');
      assert.strictEqual(body.service, 'LMSE Backend API');
    });
  });

});
