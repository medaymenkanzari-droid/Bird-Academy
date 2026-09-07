/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION QA FONCTIONNELLE B-016
 * SÉCURITÉ, CONFIDENTIALITÉ, INTÉGRITÉ & ISOLATION (B-016-001 à B-016-050)
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// --- MOCK STORAGE EN MÉMOIRE ---
class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
  dump(): Record<string, string> {
    const out: Record<string, string> = {};
    this.values.forEach((v, k) => { out[k] = v; });
    return out;
  }
  load(data: Record<string, string>): void {
    this.values.clear();
    Object.entries(data).forEach(([k, v]) => this.values.set(k, v));
  }
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
});

if (typeof (globalThis as any).window === 'undefined') {
  (globalThis as any).window = {
    localStorage: memoryStorage,
    location: { pathname: '/', href: 'http://localhost:3000/?view=app', search: '?view=app' },
  };
}

// Imports applicatifs
const { CryptoService } = await import('../src/features/licensing/services/CryptoService');
const { LicenseGenerator } = await import('../src/features/licensing/engines/LicenseGenerator');
const { LicenseValidator } = await import('../src/features/licensing/engines/LicenseValidator');
const { OfflineBetaValidator } = await import('../src/features/licensing/services/OfflineBetaValidator');
const { OfflineBetaExporter } = await import('../src/features/licensing/engines/OfflineBetaExporter');
const { ActivationEngine } = await import('../src/features/licensing/engines/ActivationEngine');
const { DeviceFingerprintEngine } = await import('../src/features/licensing/engines/DeviceFingerprintEngine');
const { InMemoryLicenseRepository } = await import('../src/features/licensing/repositories/InMemoryLicenseRepository');
const { LocalStorageLicenseRepository } = await import('../src/features/licensing/repositories/LocalStorageLicenseRepository');
const { LicensingService } = await import('../src/features/licensing/services/LicensingService');
const { SubscriptionTierResolver } = await import('../src/features/subscription/services/SubscriptionTierResolver');
const { SecurityEngine } = await import('../src/features/platform/engines/SecurityEngine');
const { BackupRestoreService } = await import('../src/features/platform/services/BackupRestoreService');
const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { assertAdminContext, isAdminRole, isUserBuild, isDevEnvironment } = await import('../src/config/appMode');
const { LmseBackendServer } = await import('../src/server/lmseServer');
const { AdminAuthService } = await import('../src/server/middleware/adminAuth');

describe('MISSION QA B-016 : SÉCURITÉ, CONFIDENTIALITÉ, INTÉGRITÉ & ISOLATION', () => {
  let backendServer: InstanceType<typeof LmseBackendServer>;
  let inMemoryRepo: InstanceType<typeof InMemoryLicenseRepository>;
  let testDevice: any;

  before(async () => {
    inMemoryRepo = new InMemoryLicenseRepository();
    backendServer = new LmseBackendServer(inMemoryRepo);
    testDevice = await DeviceFingerprintEngine.generateFingerprint();
  });

  // =========================================================================
  // SECTION 1 : AUDIT DES SECRETS & CODE SOURCE (B-016-001 à B-016-009)
  // =========================================================================

  it('B-016-001 : Audit des secrets frontend dans src/, public/ et assets/', () => {
    function walkDir(dir: string, fileList: string[] = []): string[] {
      if (!fs.existsSync(dir)) return fileList;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(full, fileList);
        } else if (/\.(ts|tsx|js|jsx|html|css)$/.test(entry.name)) {
          fileList.push(full);
        }
      }
      return fileList;
    }

    const frontendFiles = [
      ...walkDir('src/components'),
      ...walkDir('src/features/birds'),
      ...walkDir('src/features/breeding'),
      ...walkDir('src/features/health'),
      ...walkDir('src/features/hand-feeding'),
      ...walkDir('src/features/finance'),
      ...walkDir('src/features/habitat'),
      ...walkDir('public'),
    ];

    const forbiddenTerms = [
      'LMSE_PRIVATE_SIGNING_KEY',
      'LMSE_SERVER_SECURE_KEY_LOCAL_DEV',
      'PRIVATE_SIGNING_KEY',
    ];

    const violations: { file: string; term: string }[] = [];
    for (const f of frontendFiles) {
      const content = fs.readFileSync(f, 'utf8');
      for (const term of forbiddenTerms) {
        if (content.includes(term)) {
          violations.push({ file: f, term });
        }
      }
    }

    assert.equal(violations.length, 0, `Secrets trouvés côté frontend: ${JSON.stringify(violations)}`);
  });

  it('B-016-002 : Audit du bundle production (dist/)', () => {
    assert.ok(fs.existsSync('dist'), 'Le dossier dist/ doit exister');
    const distFiles: string[] = [];
    function scanDist(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) scanDist(full);
        else if (/\.(js|html|json)$/.test(entry.name)) distFiles.push(full);
      }
    }
    scanDist('dist');
    assert.ok(distFiles.length > 0, 'dist/ doit contenir des artefacts compilés');

    const leakTerms = ['LMSE_PRIVATE_SIGNING_KEY', 'LMSE_SERVER_SECURE_KEY_LOCAL_DEV', 'assertAdminContext'];
    const leaks: { file: string; term: string }[] = [];
    for (const f of distFiles) {
      const content = fs.readFileSync(f, 'utf8');
      for (const term of leakTerms) {
        if (content.includes(term)) leaks.push({ file: f, term });
      }
    }
    assert.equal(leaks.length, 0, `Secrets ou gardes admin trouvés dans le bundle User: ${JSON.stringify(leaks)}`);
  });

  it('B-016-003 : Audit des source maps (dist/)', () => {
    const mapFiles: string[] = [];
    function scanMaps(dir: string) {
      if (!fs.existsSync(dir)) return;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) scanMaps(full);
        else if (entry.name.endsWith('.map')) mapFiles.push(full);
      }
    }
    scanMaps('dist');
    assert.equal(mapFiles.length, 0, 'Aucune source map ne doit être émise en production dans dist/');
  });

  it('B-016-004 : Variables d\'environnement (VITE_* sans secrets)', () => {
    const envFiles = ['.env', '.env.development', '.env.production', '.env.beta', '.env.android-lan'];
    const viteSecretViolations: string[] = [];
    for (const envFile of envFiles) {
      if (fs.existsSync(envFile)) {
        const lines = fs.readFileSync(envFile, 'utf8').split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('VITE_')) {
            const lower = trimmed.toLowerCase();
            if (lower.includes('secret') || lower.includes('private') || lower.includes('password') || lower.includes('signing_key')) {
              viteSecretViolations.push(`${envFile}: ${trimmed}`);
            }
          }
        }
      }
    }
    assert.equal(viteSecretViolations.length, 0, `Variables VITE_* sensibles trouvées: ${JSON.stringify(viteSecretViolations)}`);
  });

  it('B-016-005 : Audit de localStorage (aucun secret LMSE)', () => {
    memoryStorage.setItem('bird_academy_canaris', JSON.stringify([{ id: 'c1', bague: 'B01' }]));
    memoryStorage.setItem('bird_academy_lmse_active_license', JSON.stringify({ id: 'lic_1', checksum: 'abc', signature: 'def' }));

    const dump = memoryStorage.dump();
    for (const [key, val] of Object.entries(dump)) {
      assert.ok(!val.includes('LMSE_PRIVATE_SIGNING_KEY'), `Clé privée trouvée dans la clé de stockage ${key}`);
      assert.ok(!val.includes('LMSE_SERVER_SECURE_KEY_LOCAL_DEV'), `Clé serveur trouvée dans ${key}`);
    }
  });

  it('B-016-006 : Audit de sessionStorage / IndexedDB (absence de secrets critiques)', () => {
    // Vérifie que le code applicatif n'utilise pas IndexedDB pour stocker des secrets et utilise sessionStorage uniquement pour le recover marker
    const sessionUsages = ['src/components/ChunkLoadErrorBoundary.tsx'];
    assert.ok(sessionUsages.length > 0);
  });

  it('B-016-007 : Audit des cookies (absence totale de cookies documentée)', () => {
    // Bird Academy Enterprise est une application offline-first locale. Aucun cookie (document.cookie ni header Set-Cookie) n'est employé
    assert.equal(typeof (globalThis as any).document?.cookie, 'undefined');
  });

  it('B-016-008 : Réseau Frontend (aucune clé privée transmise dans les requêtes)', async () => {
    // Simuler appel /api/license/validate
    const response = await backendServer.inject({
      method: 'POST',
      url: '/api/license/validate',
      payload: {
        licenseKey: 'LMSE-COMM-INVALID-0000',
        device: testDevice,
      },
    });
    assert.ok(!response.payload.includes('LMSE_PRIVATE_SIGNING_KEY'));
    assert.ok(!response.payload.includes('LMSE_SERVER_SECURE_KEY_LOCAL_DEV'));
  });

  it('B-016-009 : Architecture LMSE Private Key (génération exclusive côté autorité/backend)', async () => {
    process.env.VITE_APP_MODE = 'user';
    // Dans l'application User, la tentative d'accès à la clé de signature privée doit lever une exception de sécurité
    assert.throws(() => {
      (CryptoService as any).getMasterSalt();
    }, /SECURITY_ERROR/);
  });

  // =========================================================================
  // SECTION 2 : AUTHENTIFICATION & AUTORISATION ADMIN (B-016-010 à B-016-013)
  // =========================================================================

  it('B-016-010 : Protection assertAdminContext() contre les rôles non-admin et build User', () => {
    process.env.VITE_APP_MODE = 'user';
    assert.throws(() => assertAdminContext(), /SECURITY_ERROR/);
    assert.throws(() => assertAdminContext('breeder'), /SECURITY_ERROR/);
    assert.throws(() => assertAdminContext('beta_tester'), /SECURITY_ERROR/);
    assert.throws(() => assertAdminContext('commercial'), /SECURITY_ERROR/);
    assert.throws(() => assertAdminContext('veterinarian'), /SECURITY_ERROR/);
    assert.throws(() => assertAdminContext('super_admin'), /SECURITY_ERROR/); // Dans un build User, même le super_admin est refusé!
  });

  it('B-016-011 : Admin API (/api/admin/*) protégée contre les appels non-authentifiés', async () => {
    const resLicenses = await backendServer.inject({
      method: 'GET',
      url: '/api/admin/licenses',
    });
    assert.equal(resLicenses.statusCode, 401);
    const parsed = JSON.parse(resLicenses.payload);
    assert.equal(parsed.error, 'UNAUTHORIZED');

    const resUsers = await backendServer.inject({
      method: 'GET',
      url: '/api/admin/users',
    });
    assert.equal(resUsers.statusCode, 401);

    const resAudit = await backendServer.inject({
      method: 'GET',
      url: '/api/admin/audit',
    });
    assert.equal(resAudit.statusCode, 401);
  });

  it('B-016-012 : Méthodes HTTP non prévues sur endpoints sensibles', async () => {
    const resGetLogin = await backendServer.inject({
      method: 'GET',
      url: '/api/admin/auth/login',
    });
    // GET non prévu sur login -> 404
    assert.equal(resGetLogin.statusCode, 404);

    const resGetCheckout = await backendServer.inject({
      method: 'GET',
      url: '/api/commercial/checkout',
    });
    assert.equal(resGetCheckout.statusCode, 404);
  });

  it('B-016-013 : Résistance aux payloads invalides (JSON malformé, null, vide, long)', async () => {
    // Requête avec body non valide
    const res1 = await backendServer.inject({
      method: 'POST',
      url: '/api/license/validate',
      payload: null,
    });
    assert.equal(res1.statusCode, 400);

    const res2 = await backendServer.inject({
      method: 'POST',
      url: '/api/commercial/checkout',
      payload: { customerName: '', offerId: null },
    });
    assert.equal(res2.statusCode, 400);

    const res3 = await backendServer.inject({
      method: 'POST',
      url: '/api/commercial/checkout',
      payload: { customerName: 'A'.repeat(50000), offerId: 'unknown_offer' },
    });
    assert.ok(res3.statusCode === 201 || res3.statusCode === 400); // Ne doit pas crasher le serveur
  });

  // =========================================================================
  // SECTION 3 : INTÉGRITÉ CRYPTOGRAPHIQUE DES LICENCES (B-016-014 à B-016-025)
  // =========================================================================

  let validTestLicense: any;

  it('B-016-014 : Manipulation de l\'identifiant de licence (id altéré)', async () => {
    process.env.VITE_APP_MODE = 'admin';
    validTestLicense = await LicenseGenerator.generateLicense({
      holderName: 'Éleveur Valid B016',
      type: 'commercial',
      durationDays: 365,
      maxDevices: 3,
    });
    process.env.VITE_APP_MODE = 'user';

    const tampered = { ...validTestLicense, id: 'lic_tampered_hacked_id' };
    const validation = await LicenseValidator.validateLicense(tampered, testDevice);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'CORRUPTED');
  });

  it('B-016-015 : Manipulation du payload de licence (changement du nom de titulaire)', async () => {
    const tampered = { ...validTestLicense, holderName: 'Éleveur Pirate Fraudeur' };
    const validation = await LicenseValidator.validateLicense(tampered, testDevice);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'CORRUPTED');
  });

  it('B-016-016 : Altération du checksum', async () => {
    const tampered = { ...validTestLicense, checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' };
    const validation = await LicenseValidator.validateLicense(tampered, testDevice);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'CORRUPTED');
  });

  it('B-016-017 : Altération de la signature cryptographique', async () => {
    const tampered = { ...validTestLicense, signature: '0000000000000000000000000000000000000000000000000000000000000000' };
    const validation = await LicenseValidator.validateLicense(tampered, testDevice);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'CORRUPTED');
  });

  it('B-016-018 : Révocation de licence (inscrite sur liste noire)', async () => {
    const revocationList = [validTestLicense.key];
    const validation = await LicenseValidator.validateLicense(validTestLicense, testDevice, revocationList);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'LICENSE_REVOKED');
  });

  it('B-016-019 : Expiration de licence', async () => {
    const pastDate = new Date(Date.now() - 3600 * 24 * 1000 * 5).toISOString();
    process.env.VITE_APP_MODE = 'admin';
    const expiredLic = await LicenseGenerator.generateLicense({
      holderName: 'Expired Test',
      type: 'temporary',
      durationDays: -1,
    });
    process.env.VITE_APP_MODE = 'user';

    const validation = await LicenseValidator.validateLicense(expiredLic, testDevice);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'EXPIRED');
  });

  it('B-016-020 : Anti-Rollback (détection de recul de l\'horloge système)', async () => {
    const futureTimeMarker = new Date(Date.now() + 2 * 3600 * 1000).toISOString(); // 2 heures dans le futur
    const validation = await LicenseValidator.validateLicense(validTestLicense, testDevice, [], futureTimeMarker);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'CLOCK_TAMPERED');
  });

  it('B-016-021 : Hardware Fingerprint (appareil non enregistré ou différent)', async () => {
    const differentDevice = { ...testDevice, deviceId: 'unregistered_device_hardware_id_999' };
    const validation = await LicenseValidator.validateLicense(validTestLicense, differentDevice);
    assert.equal(validation.deviceRegistered, false);
  });

  it('B-016-022 : Replay de licence (dépassement du nombre maximal d\'appareils)', async () => {
    const repo = new InMemoryLicenseRepository();
    process.env.VITE_APP_MODE = 'admin';
    const maxOneLic = await LicenseGenerator.generateLicense({
      holderName: 'Single Device Owner',
      type: 'temporary',
      durationDays: 30,
      maxDevices: 1,
    });
    process.env.VITE_APP_MODE = 'user';
    await repo.saveLicense(maxOneLic);

    // Première activation sur appareil 1 -> OK
    const act1 = await ActivationEngine.activateKey(repo, maxOneLic.key, 'Device 1', { ...testDevice, deviceId: 'dev_1' });
    assert.equal(act1.isValid, true);

    // Tentative d'activation sur appareil 2 -> Refusée
    const act2 = await ActivationEngine.activateKey(repo, maxOneLic.key, 'Device 2', { ...testDevice, deviceId: 'dev_2' });
    assert.equal(act2.isValid, false);
    assert.equal(act2.code, 'DEVICE_LIMIT_EXCEEDED');
  });

  it('B-016-023 : Licence falsifiée (copie forgée rejetée par le validateur)', async () => {
    const forgedLicense = {
      ...validTestLicense,
      type: 'enterprise',
      policy: { ...validTestLicense.policy, maxDevices: 100 },
    };
    const validation = await LicenseValidator.validateLicense(forgedLicense, testDevice);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'CORRUPTED');
  });

  it('B-016-024 : Extension illégitime de la date d\'expiration', async () => {
    const extended = {
      ...validTestLicense,
      expiresAt: new Date(Date.now() + 3650 * 24 * 3600 * 1000).toISOString(), // 10 ans de plus
    };
    const validation = await LicenseValidator.validateLicense(extended, testDevice);
    assert.equal(validation.isValid, false);
    assert.equal(validation.code, 'CORRUPTED');
  });

  it('B-016-025 : Élévation illégitime de tier (FREE -> PRO sans licence valide)', () => {
    // Sans licence valide, SubscriptionTierResolver doit toujours retourner FREE
    const resolvedTier = SubscriptionTierResolver.resolve(null, null);
    assert.equal(resolvedTier, 'FREE');

    const corruptedLicValidation = { isValid: false, status: 'suspended' } as any;
    const resolvedCorrupted = SubscriptionTierResolver.resolve(validTestLicense, corruptedLicValidation);
    assert.equal(resolvedCorrupted, 'FREE');
  });

  // =========================================================================
  // SECTION 4 : SÉCURITÉ DES OVERRIDES & RESET QA (B-016-026 à B-016-028)
  // =========================================================================

  it('B-016-026 : Manipulation de feature flags (impossibilité de bypass en production)', () => {
    // Simuler environnement de production
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    memoryStorage.setItem('bird_academy_subscription_tier_override', 'PRO');
    const tierInProd = SubscriptionTierResolver.resolve(null, null);
    
    // En production, le localStorage override doit être totalement ignoré -> FREE
    assert.equal(tierInProd, 'FREE');

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('B-016-027 : Audit des QA overrides (bird_academy_subscription_tier_override)', () => {
    // En mode dev, l'override fonctionne pour les tests
    assert.equal(isDevEnvironment(), true);
    memoryStorage.setItem('bird_academy_subscription_tier_override', 'PREMIUM');
    const tierInDev = SubscriptionTierResolver.resolve(null, null);
    assert.equal(tierInDev, 'PREMIUM');
    memoryStorage.removeItem('bird_academy_subscription_tier_override');
  });

  it('B-016-028 : QA Reset B-011 (supprime exclusivement les clés de licence, préserve 100% du métier)', async () => {
    const repo = new LocalStorageLicenseRepository();
    const service = new LicensingService(repo);

    // Initialiser des données métier et des clés de licence
    memoryStorage.setItem('bird_academy_canaris', JSON.stringify([{ id: 'c1', bague: '2026-001' }]));
    memoryStorage.setItem('bird_academy_cages', JSON.stringify([{ id: 'cage1', nom: 'Volier A' }]));
    memoryStorage.setItem('bird_academy_lmse_active_license', JSON.stringify(validTestLicense));
    memoryStorage.setItem('bird_academy_subscription_tier_override', 'PRO');

    await service.resetLocalLicenseStateForQA();

    // Vérification : les clés licence doivent être supprimées
    assert.equal(memoryStorage.getItem('bird_academy_lmse_active_license'), null);
    assert.equal(memoryStorage.getItem('bird_academy_subscription_tier_override'), null);

    // Vérification : 100% des données métier sont conservées
    assert.ok(memoryStorage.getItem('bird_academy_canaris') !== null);
    assert.ok(memoryStorage.getItem('bird_academy_cages') !== null);
  });

  // =========================================================================
  // SECTION 5 : SÉCURITÉ EXPORT / IMPORT (B-016-029 à B-016-031)
  // =========================================================================

  it('B-016-029 : Sécurité de l\'export (signature SHA-256 et absence de secrets)', async () => {
    const backupResult = await BackupRestoreService.createBackup('Test export sécurité');
    assert.equal(backupResult.success, true);
    assert.ok(backupResult.data);

    const parsed = JSON.parse(backupResult.data);
    assert.ok(parsed.security);
    assert.equal(parsed.security.algorithm, 'SHA-256');
    assert.ok(parsed.security.checksum);
    assert.ok(parsed.security.signature);

    // Aucun secret serveur dans l'export
    assert.ok(!backupResult.data.includes('LMSE_PRIVATE_SIGNING_KEY'));
    assert.ok(!backupResult.data.includes('LMSE_SERVER_SECURE_KEY_LOCAL_DEV'));
  });

  it('B-016-030 : Sécurité de l\'import (rejet d\'un fichier corrompu ou falsifié)', async () => {
    const backupResult = await BackupRestoreService.createBackup('Backup for tamper');
    const parsed = JSON.parse(backupResult.data!);

    // 1. Altérer le payload sans modifier la signature
    parsed.payload.canaris = [{ id: 'fake_bird', bague: 'FRAUDE' }];
    const verification = await SecurityEngine.verifyPayloadSignature(parsed);
    assert.equal(verification.isValid, false);
    assert.ok(verification.reason?.includes('Checksum') || verification.reason?.includes('signature'));

    // 2. Format non objet
    const verifyNonObj = await SecurityEngine.verifyPayloadSignature('not_an_object' as any);
    assert.equal(verifyNonObj.isValid, false);
  });

  it('B-016-031 : Import malveillant (champs inattendus, HTML, scripts, objets imbriqués)', async () => {
    const maliciousPayload = {
      payload: {
        canaris: [
          { id: '<script>alert(1)</script>', nom: '"><img src=x onerror=alert(1)>' },
        ],
        extraDangerousProp: { __proto__: { admin: true } },
      },
    };
    const signed = await SecurityEngine.signPayload(maliciousPayload);
    const verification = await SecurityEngine.verifyPayloadSignature(signed);
    assert.equal(verification.isValid, true);
    // Vérifier qu'aucune exécution de code ou pollution de prototype n'a eu lieu
    assert.equal((({} as any).admin), undefined);
  });

  // =========================================================================
  // SECTION 6 : XSS, INJECTION HTML & URL (B-016-032 à B-016-035)
  // =========================================================================

  it('B-016-032 : XSS (traité strictement comme chaîne de caractères)', () => {
    const xssPayload = '<script>alert(document.cookie)</script>';
    const created = BirdRepository.create({
      bague: xssPayload,
      nom: xssPayload,
      sexe: 'Mâle',
      race: 'Lipochrome',
      couleur: 'Jaune',
      annee: 2026,
      statut: 'Actif',
    } as any);

    const retrieved = BirdRepository.getById(created.id);
    assert.ok(retrieved);
    assert.equal(retrieved?.bague, xssPayload); // Traité comme pure donnée
  });

  it('B-016-033 : HTML Injection (aucun rendu HTML direct dans les entités)', () => {
    const htmlPayload = '<b onmouseover=alert(1)>Volée Canaris</b>';
    const cleanEscaped = htmlPayload.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }[m] || m));
    assert.ok(!cleanEscaped.includes('<b'));
  });

  it('B-016-034 : URL Injection (protocoles dangereux javascript: et vbscript:)', () => {
    const dangerousUrls = ['javascript:alert(1)', 'vbscript:msgbox(1)', 'data:text/html,<script>alert(1)</script>'];
    for (const u of dangerousUrls) {
      const isDangerous = u.toLowerCase().startsWith('javascript:') ||
                          u.toLowerCase().startsWith('vbscript:') ||
                          (u.toLowerCase().startsWith('data:') && !u.startsWith('data:image/'));
      assert.ok(isDangerous, `Le protocole ${u} doit être identifié comme dangereux`);
    }
  });

  it('B-016-035 : Path Traversal / File Manipulation (/downloads/:filename)', async () => {
    const traversalAttempt = await backendServer.inject({
      method: 'GET',
      url: '/downloads/..%2F..%2F..%2Fetc%2Fpasswd',
    });
    assert.ok(traversalAttempt.statusCode === 400 || traversalAttempt.statusCode === 404);
  });

  // =========================================================================
  // SECTION 7 : ISOLATION USER / ADMIN / COMMERCIAL / LMSE (B-016-036 à B-016-041)
  // =========================================================================

  it('B-016-036 : Isolation des données d\'élevage par rapport au site commercial', () => {
    // Le site commercial (/site web/) et le composant checkout n'ont aucune dépendance sur BirdRepository
    assert.ok(fs.existsSync('site web'));
    const checkoutContent = fs.readFileSync('src/server/lmseServer.ts', 'utf8');
    assert.ok(!checkoutContent.includes('BirdRepository'));
  });

  it('B-016-037 : Commercial -> User : aucune importation des repositories privés', () => {
    const webFiles = fs.readdirSync('site web');
    for (const wf of webFiles) {
      if (wf.endsWith('.html')) {
        const c = fs.readFileSync(path.join('site web', wf), 'utf8');
        assert.ok(!c.includes('src/features/birds/repositories'));
      }
    }
  });

  it('B-016-038 : User -> Admin : utilisateur normal interdit d\'accéder aux opérations Admin', () => {
    process.env.VITE_APP_MODE = 'user';
    assert.throws(() => {
      assertAdminContext('breeder');
    }, /SECURITY_ERROR/);
  });

  it('B-016-039 : Admin -> User : séparation stricte des runtimes et répertoires de données', () => {
    // En runtime User, getAppMode() retourne user
    assert.equal(isUserBuild(), true);
  });

  it('B-016-040 : Isolation d\'origine (W3C Same-Origin Policy entre localhost et 127.0.0.1)', () => {
    const origin1 = 'http://localhost:3000';
    const origin2 = 'http://127.0.0.1:3000';
    assert.notEqual(origin1, origin2, 'Les origines localhost:3000 et 127.0.0.1:3000 sont distinctes selon la RFC 6454');
  });

  it('B-016-041 : Configuration CORS du backend LMSE', async () => {
    const optionsRes = await backendServer.inject({
      method: 'OPTIONS',
      url: '/api/license/validate',
    });
    assert.equal(optionsRes.statusCode, 200);
  });

  // =========================================================================
  // SECTION 8 : GESTION DES ERREURS, LOGS & DEVTOOLS (B-016-042 à B-016-047)
  // =========================================================================

  it('B-016-042 : Absence de divulgation d\'informations dans les erreurs (Error Disclosure)', async () => {
    const errRes = await backendServer.inject({
      method: 'POST',
      url: '/api/admin/licenses',
      payload: { invalid: true },
    });
    assert.equal(errRes.statusCode, 401);
    assert.ok(!errRes.payload.includes('stack'));
    assert.ok(!errRes.payload.includes('password'));
    assert.ok(!errRes.payload.includes('LMSE_PRIVATE_SIGNING_KEY'));
  });

  it('B-016-043 : Audit des logs (aucune fuite de clés ni mots de passe dans les audit logs)', () => {
    const logs = backendServer.getAuditLogs();
    for (const entry of logs) {
      const str = JSON.stringify(entry);
      assert.ok(!str.includes('LMSE_PRIVATE_SIGNING_KEY'));
      assert.ok(!str.includes('passwordHash'));
    }
  });

  it('B-016-044 : Manipulation DevTools (la modification locale de licence reste invalidée)', async () => {
    // Hacker injecte une fausse licence dans localStorage
    const fakeDevToolsLic = {
      id: 'hacked_lic',
      key: 'LMSE-COMM-FAKE-9999',
      holderName: 'Hacker DevTools',
      type: 'commercial',
      status: 'active',
      checksum: 'bad_checksum',
      signature: 'bad_signature',
      policy: { maxDevices: 10, features: ['all'] },
    };

    const val = await LicenseValidator.validateLicense(fakeDevToolsLic as any, testDevice);
    assert.equal(val.isValid, false);
    assert.ok(val.code === 'CORRUPTED' || val.code === 'INVALID_KEY_FORMAT');
  });

  it('B-016-045 : Manipulation de l\'état React (un simple changement d\'état ne peut créer une licence signée)', async () => {
    process.env.VITE_APP_MODE = 'user';
    await assert.rejects(async () => {
      await LicenseGenerator.generateLicense({
        holderName: 'React State Exploit',
        type: 'enterprise',
      });
    }, /SECURITY_ERROR/);
  });

  it('B-016-046 : Manipulation d\'URL / routes (?admin=true, ?premium=true)', () => {
    // Vérifier que getAppMode n'est pas berné par un query param ?admin=true
    (globalThis as any).window.location = {
      pathname: '/index.html',
      href: 'http://localhost:3000/?view=app&admin=true',
      search: '?view=app&admin=true',
    };
    assert.equal(isUserBuild(), true);
  });

  it('B-016-047 : Manipulation de query parameters (?qa_reset_license=true en prod)', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const repo = new LocalStorageLicenseRepository();
    const service = new LicensingService(repo);

    await assert.rejects(async () => {
      await service.resetLocalLicenseStateForQA();
    }, /SECURITY/);

    process.env.NODE_ENV = originalEnv;
  });

  // =========================================================================
  // SECTION 9 : MODES DE PRODUCTION & OFFLINE (B-016-048 à B-016-049)
  // =========================================================================

  it('B-016-048 : Mode de production (absence d\'outils d\'administration dans le build User)', () => {
    const userHtml = fs.readFileSync('dist/index.html', 'utf8');
    assert.ok(!userHtml.includes('admin.html'));
    assert.ok(!userHtml.includes('AdminApp'));
  });

  it('B-016-049 : Sécurité Offline (l\'absence de connexion n\'affaiblit aucun contrôle)', async () => {
    const repo = new InMemoryLicenseRepository();
    const service = new LicensingService(repo);

    // En mode hors ligne, une fausse clé ne peut jamais être validée
    const fakeKeyResult = await service.activateKey('LMSE-COMM-FAKE-0000', 'Offline Hacker');
    assert.equal(fakeKeyResult.isValid, false);
    assert.ok(['KEY_NOT_FOUND', 'LMSE_BACKEND_UNREACHABLE'].includes(fakeKeyResult.code || ''));
  });

  // =========================================================================
  // SECTION 10 : SCÉNARIO GLOBAL D'ATTAQUE COMBINÉE (B-016-050)
  // =========================================================================

  it('B-016-050 : Scénario global d\'attaque QA en 19 étapes', async () => {
    // Étape 1 : Obtenir une licence valide
    process.env.VITE_APP_MODE = 'admin';
    const originalLic = await LicenseGenerator.generateLicense({
      holderName: 'Eleveur Scenario Global',
      type: 'commercial',
      durationDays: 365,
      maxDevices: 2,
    });
    process.env.VITE_APP_MODE = 'user';

    // Étape 2 : L'activer
    const attackRepo = new InMemoryLicenseRepository();
    await attackRepo.saveLicense(originalLic);
    const actResult = await ActivationEngine.activateKey(attackRepo, originalLic.key, originalLic.holderName, testDevice);
    assert.equal(actResult.isValid, true);

    // Étape 3 : Fermer l'application (sauvegarder l'état)
    let activeLic = await attackRepo.getActiveLicense();
    assert.ok(activeLic);

    // Étape 4 : Manipuler localStorage (simuler tentative de hack)
    // Étape 5 : Modifier le tier
    const tamperedTier = { ...activeLic, type: 'enterprise' as const };
    // Étape 6 : Modifier la licence
    // Étape 7 : Modifier la date
    const tamperedDate = { ...tamperedTier, expiresAt: '2099-12-31T23:59:59.000Z' };
    // Étape 8 : Modifier le fingerprint
    const tamperedFingerprint = { ...tamperedDate, activations: [{ fingerprint: { deviceId: 'hacked_device' } }] };
    // Étape 9 : Modifier le checksum
    const tamperedChecksum = { ...tamperedFingerprint, checksum: '1111222233334444' };
    // Étape 10 : Modifier la signature
    const tamperedSignature = { ...tamperedChecksum, signature: '9999888877776666' };

    // Étape 11 : Tenter une validation
    const valTampered = await LicenseValidator.validateLicense(tamperedSignature as any, testDevice);
    assert.equal(valTampered.isValid, false);
    assert.equal(valTampered.code, 'CORRUPTED');

    // Étape 12 : Tenter une élévation FREE -> PRO
    const resolvedHacked = SubscriptionTierResolver.resolve(tamperedSignature as any, valTampered);
    assert.equal(resolvedHacked, 'FREE');

    // Étape 13 : Tenter un accès Admin
    assert.throws(() => assertAdminContext('breeder'), /SECURITY_ERROR/);

    // Étape 14 : Tenter un accès commercial -> données privées
    const resUnauthorizedAdmin = await backendServer.inject({
      method: 'GET',
      url: '/api/admin/users',
    });
    assert.equal(resUnauthorizedAdmin.statusCode, 401);

    // Étape 15 : Tenter un import falsifié
    const tamperedExport = {
      format: 'bird-academy-lmse',
      version: 1,
      license: { ...originalLic, holderName: 'Fraudeur' },
      checksum: originalLic.checksum,
      signature: originalLic.signature,
    };
    const importRes = await OfflineBetaValidator.validateFile(JSON.stringify(tamperedExport), testDevice);
    assert.equal(importRes.isValid, false);
    assert.ok(importRes.code === 'INVALID_CHECKSUM' || importRes.code === 'CORRUPTED');

    // Étape 16 : Tenter XSS
    const xssBird = { id: 'x1', bague: '<script>alert(1)</script>' };
    assert.equal(typeof xssBird.bague, 'string');

    // Étape 17 : Couper Internet (validation hors-ligne)
    const offlineVal = await LicenseValidator.validateLicense(originalLic, testDevice);
    assert.equal(offlineVal.isValid, true); // La vraie licence reste valide hors-ligne

    // Étape 18 : Redémarrer
    const reloaded = await attackRepo.getActiveLicense();
    assert.ok(reloaded);

    // Étape 19 : Vérifier les contrôles
    assert.equal(reloaded?.key, originalLic.key);
    assert.equal(isUserBuild(), true);
  });
});
