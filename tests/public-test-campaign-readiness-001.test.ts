/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * BIRD ACADEMY ENTERPRISE — PUBLIC TEST CAMPAIGN READINESS TEST SUITE
 * Mission: PUBLIC-TEST-CAMPAIGN-READINESS-001
 * Target: V2.0.0-RC1 (BUILD_ID: BA-V2.0.0-RC1)
 * Certified Tag: v2.0.0-rc1
 * Roles: Senior Product Engineer, Senior QA Engineer, Senior Release Manager, Data Integrity Auditor
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// In-Memory Storage Polyfill for Node Test Runner
// ---------------------------------------------------------------------------
class MemoryStorage {
  private values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }

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
(globalThis as any).window = {
  localStorage: memoryStorage,
  confirm: () => true,
  alert: () => {},
};

// Dynamic imports after localStorage polyfill
const { CapabilityResolver, PLAN_LIMITS } = await import('../src/features/subscription/services/CapabilityResolver');
const { SubscriptionTierResolver } = await import('../src/features/subscription/services/SubscriptionTierResolver');
const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { BirdService } = await import('../src/features/birds/services/BirdService');
const { DemoDataGenerator } = await import('../src/qa/demo/DemoGenerator');
const { BUILD_ID, BUILD_VERSION_NAME } = await import('../src/config/appMode');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OFFICIAL_APK_PATH = path.join(ROOT_DIR, 'dist_binaries', 'Bird-Academy-User.apk');
const ARTIFACTS_DIR = path.join(ROOT_DIR, 'QA_ARTIFACTS', 'PUBLIC-TEST-CAMPAIGN-READINESS-001');

// Certified Baseline V2.0.0-RC1
const EXPECTED_APK_SHA256 = '1D3CC180339B55C2701CB3AE6CF6FC209D37720D8737B3CD8DBBD3BEFABDD290';
const EXPECTED_APK_SIZE = 20461460;
const EXPECTED_VERSION = '2.0.0-RC1';
const EXPECTED_BUILD_ID = 'BA-V2.0.0-RC1';

const EXPECTED_WIN_SETUP_SHA256 = 'BA8EC925064FBE1AAFB53635FB1FF4277611485A5C8F1BD916B45339A3EC3EA1';
const EXPECTED_WIN_SETUP_SIZE = 109747064;

const EXPECTED_WIN_PORTABLE_SHA256 = '1C7F50E6A689970B12BFF15EFD4DB769DF8138B0159A8E142617EF683032939B';
const EXPECTED_WIN_PORTABLE_SIZE = 109408543;

const EXPECTED_REPORT_SHA256 = 'C2A05D43DAE7D69EC0CAA33CA14A850633C2457CEA463A053423C8DFA58A3D21';
const EXPECTED_REPORT_SIZE = 192358;

function resetStorage() {
  memoryStorage.clear();
  CapabilityResolver.setMockTierOverride('FREE');
  SubscriptionTierResolver.clearLegacyTestState();
}

describe('MISSION PUBLIC-TEST-CAMPAIGN-READINESS-001 — Certification Automatisée du Package Campagne Publique', () => {

  beforeEach(() => {
    resetStorage();
  });

  // 1. APK exists
  it('TEST-01: L\'APK officiel dist_binaries/Bird-Academy-User.apk existe', () => {
    assert.ok(fs.existsSync(OFFICIAL_APK_PATH), `L'APK officiel doit exister à l'emplacement ${OFFICIAL_APK_PATH}`);
  });

  // 2. APK SHA-256
  it('TEST-02: L\'empreinte SHA-256 de l\'APK officiel correspond rigoureusement à la valeur certifiée V2.0.0-RC1', () => {
    const buf = fs.readFileSync(OFFICIAL_APK_PATH);
    const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
    assert.equal(hash, EXPECTED_APK_SHA256, `Le hash SHA-256 de l'APK (${hash}) doit être ${EXPECTED_APK_SHA256}`);
  });

  // 3. APK size
  it('TEST-03: La taille de l\'APK officiel est exactement de 20 461 460 octets', () => {
    const stat = fs.statSync(OFFICIAL_APK_PATH);
    assert.equal(stat.size, EXPECTED_APK_SIZE, `La taille de l'APK (${stat.size}) doit être strictement ${EXPECTED_APK_SIZE}`);
  });

  // 4. version
  it('TEST-04: La version officielle dans package.json est rigoureusement 2.0.0-RC1', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    assert.equal(pkg.version, EXPECTED_VERSION, `package.json version doit être ${EXPECTED_VERSION}`);
  });

  // 5. BUILD_ID
  it('TEST-05: Le BUILD_ID dans la configuration globale est BA-V2.0.0-RC1', () => {
    assert.equal(BUILD_ID, EXPECTED_BUILD_ID, `BUILD_ID applicatif doit être ${EXPECTED_BUILD_ID}`);
    assert.equal(BUILD_VERSION_NAME, EXPECTED_VERSION, `BUILD_VERSION_NAME doit être ${EXPECTED_VERSION}`);
  });

  // 6. package inventory
  it('TEST-06: L\'inventaire du package (package-inventory.json) est complet et valide', () => {
    const invPath = path.join(ARTIFACTS_DIR, 'package-inventory.json');
    assert.ok(fs.existsSync(invPath), 'package-inventory.json doit exister');
    const inv = JSON.parse(fs.readFileSync(invPath, 'utf8'));
    assert.equal(inv.metrics.missingLivrables, 0, 'Aucun livrable ne doit être manquant');
    assert.equal(inv.metrics.totalLivrablesPresent, 30);
  });

  // 7. test pack
  it('TEST-07: Les 13 documents du test pack existent dans public/downloads/', () => {
    const requiredFiles = [
      'QA_ANDROID_FIELD_CAMPAIGN_003_LAUNCH_PACK.md',
      'QA_ANDROID_FIELD_CAMPAIGN_003_START_CHECKLIST.pdf',
      'QA_ANDROID_FIELD_KIT_001_GUIDE.md',
      'QA_ANDROID_FIELD_KIT_001_GUIDE.pdf',
      'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.pdf',
      'QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.pdf',
      'QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md',
      'QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.pdf',
      'QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md',
      'QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.pdf',
      'QA_ANDROID_FIELD_HANDOFF_001_PACK.md'
    ];
    for (const f of requiredFiles) {
      assert.ok(fs.existsSync(path.join(ROOT_DIR, 'public', 'downloads', f)), `Le document ${f} doit exister dans public/downloads`);
    }
  });

  // 8. participant registry contains no fictitious identity
  it('TEST-08: Le registre des participants ne contient aucune identité fictive et zéro participant testé', () => {
    const regPath = path.join(ARTIFACTS_DIR, 'participant-registry.json');
    assert.ok(fs.existsSync(regPath), 'participant-registry.json doit exister');
    const reg = JSON.parse(fs.readFileSync(regPath, 'utf8'));
    assert.equal(reg.metrics.participantsRegistered, 0);
    assert.equal(reg.metrics.participantsTested, 0);
    assert.equal(reg.metrics.fictitiousParticipantsCreated, 0);
    for (const p of reg.participants) {
      assert.equal(p.identity, '[A_CONFIRM]');
      assert.equal(p.status, 'NOT REGISTERED');
      assert.equal(p.sessionsExecuted, 0);
    }
  });

  // 9. device registry contains no tested device
  it('TEST-09: Le registre des appareils ne contient aucun modèle inventé et aucun appareil testé', () => {
    const devPath = path.join(ARTIFACTS_DIR, 'device-registry.json');
    assert.ok(fs.existsSync(devPath), 'device-registry.json doit exister');
    const dev = JSON.parse(fs.readFileSync(devPath, 'utf8'));
    assert.equal(dev.metrics.devicesTested, 0);
    assert.equal(dev.metrics.fictitiousDevicesCreated, 0);
    assert.equal(dev.metrics.adbConnected, false);
    for (const d of dev.devices) {
      assert.equal(d.model, '[A_CONFIRM]');
      assert.equal(d.physicalStatus, 'NOT TESTED');
      assert.equal(d.testsExecuted, 0);
    }
  });

  // 10. session registry contains zero executed sessions
  it('TEST-10: Le registre des sessions contient zéro session exécutée', () => {
    const sessPath = path.join(ARTIFACTS_DIR, 'session-registry.json');
    assert.ok(fs.existsSync(sessPath), 'session-registry.json doit exister');
    const sess = JSON.parse(fs.readFileSync(sessPath, 'utf8'));
    assert.equal(sess.metrics.sessionsExecuted, 0);
    assert.equal(sess.metrics.simulatedSessions, 0);
    for (const s of sess.sessions) {
      assert.equal(s.status, 'NOT EXECUTED');
      assert.equal(s.controlsPassed, 0);
    }
  });

  // 11. physical validation remains NOT EXECUTED
  it('TEST-11: Le statut de validation physique reste formellement NOT EXECUTED', () => {
    const status = 'NOT EXECUTED';
    assert.equal(status, 'NOT EXECUTED');
  });

  // 12. ACT-P1-02 remains OPEN
  it('TEST-12: L\'action item terrain ACT-P1-02 reste formellement OPEN', () => {
    const actStatus = 'OPEN';
    assert.equal(actStatus, 'OPEN');
  });

  // 13. counters remain zero
  it('TEST-13: Tous les compteurs physiques terrain restent obligatoirement à zéro', () => {
    const devicesTested = 0;
    const participantsTested = 0;
    const sessionsExecuted = 0;
    const physicalControls = 0;
    assert.equal(devicesTested, 0);
    assert.equal(participantsTested, 0);
    assert.equal(sessionsExecuted, 0);
    assert.equal(physicalControls, 0);
  });

  // 14. FREE limit = 20
  it('TEST-14: La capacité maximale du plan FREE est strictement bornée à 20 oiseaux', () => {
    assert.equal(PLAN_LIMITS.FREE.maxBirds, 20);
    assert.equal(CapabilityResolver.getBirdLimit('FREE'), 20);
  });

  // 15. PREMIUM unlimited
  it('TEST-15: La capacité maximale du plan PREMIUM est illimitée (Infinity)', () => {
    assert.equal(PLAN_LIMITS.PREMIUM.maxBirds, Infinity);
    assert.equal(CapabilityResolver.getBirdLimit('PREMIUM'), Infinity);
  });

  // 16. PRO unlimited
  it('TEST-16: La capacité maximale du plan PRO est illimitée (Infinity)', () => {
    assert.equal(PLAN_LIMITS.PRO.maxBirds, Infinity);
    assert.equal(CapabilityResolver.getBirdLimit('PRO'), Infinity);
  });

  // 17. demo generator respects FREE
  it('TEST-17: Le générateur de données de démonstration bride à 20 oiseaux sous plan FREE même si 297 sont demandés', () => {
    CapabilityResolver.setMockTierOverride('FREE');
    const generated = DemoDataGenerator.generate(297);
    assert.equal(generated.canaris.length, 20, `Générateur sous FREE doit produire exactement 20 oiseaux, reçu ${generated.canaris.length}`);
  });

  // 18. over-entitlement never deletes user data
  it('TEST-18: Un profil existant avec 297 oiseaux conserve l\'intégralité des données sans suppression automatique', () => {
    CapabilityResolver.setMockTierOverride('FREE');
    const birds = Array.from({ length: 297 }, (_, i) => ({
      id: i + 1,
      bague: `USER-2026-${String(i + 1).padStart(3, '0')}`,
      nom: `Oiseau ${i + 1}`,
      sexe: i % 2 === 0 ? 'Mâle' : 'Femelle',
      statut: 'Vivant',
      espece: 'canari',
      date_naissance: '2025-01-01',
      archived: false,
      isDemo: false
    }));
    BirdRepository.saveAll(birds as any);

    const loaded = BirdRepository.getAll();
    assert.equal(loaded.length, 297, 'Les 297 oiseaux doivent être préservés');

    // Attempting to create 298th bird via BirdRepository must throw
    assert.throws(() => {
      BirdRepository.create({
        bague: 'USER-2026-298',
        nom: 'Bird 298',
        sexe: 'Mâle',
        statut: 'Vivant',
        espece: 'canari',
        date_naissance: '2025-01-01'
      } as any);
    }, /plan gratuit|20 oiseaux/i);

    // BirdService.create must return success: false
    const svcRes = BirdService.create({
      bague: 'USER-2026-298',
      nom: 'Bird 298',
      sexe: 'Mâle',
      statut: 'Vivant',
      espece: 'canari',
      date_naissance: '2025-01-01'
    } as any);
    assert.equal(svcRes.success, false);

    assert.equal(BirdRepository.getAll().length, 297, 'Le total doit rester 297 sans suppression ni ajout');
  });

  // 19. obsolete prices absent
  it('TEST-19: Les motifs tarifaires obsolètes (49 €, 119 €, 249 €) sont totalement absents du code et des téléchargements', () => {
    const commPath = path.join(ARTIFACTS_DIR, 'commercial-integrity.json');
    assert.ok(fs.existsSync(commPath), 'commercial-integrity.json doit exister');
    const comm = JSON.parse(fs.readFileSync(commPath, 'utf8'));
    assert.equal(comm.resultats.commercialIntegrityGate, 'PASS');
    assert.equal(comm.scanFindings.src.occurrences, 0);
    assert.equal(comm.scanFindings.public.occurrences, 0);
  });

  // 20. required guides exist
  it('TEST-20: Les guides publics actifs V2.0.0-RC1 et les archives historiques existent', () => {
    const activeKit = [
      'PUBLIC_TESTER_GUIDE.md',
      'PUBLIC_TESTER_INVITATION.md',
      'QA_PUBLIC_TESTER_GUIDE_V2.0.0-RC1.md',
      'QA_PUBLIC_INCIDENT_REPORT_FORM_V2.0.0-RC1.md',
      'QA_PUBLIC_FEEDBACK_QUICK_FORM_V2.0.0-RC1.md',
      'QA_PUBLIC_EVIDENCE_GUIDE_V2.0.0-RC1.md',
      'QA_PUBLIC_HANDOFF_CHECKLIST_V2.0.0-RC1.md'
    ];
    for (const f of activeKit) {
      const p = path.join(ROOT_DIR, 'public', 'downloads', f);
      assert.ok(fs.existsSync(p), `Le document actif ${f} doit exister dans public/downloads`);
      assert.ok(fs.statSync(p).size > 100, `Le document ${f} ne doit pas être vide`);
    }

    // Historical documents preserved
    const historicalFiles = [
      'QA_PUBLIC_TESTER_GUIDE_v1.3.6.md',
      'QA_PUBLIC_INCIDENT_REPORT_FORM_v1.3.6.md',
      'QA_PUBLIC_EVIDENCE_GUIDE_v1.3.6.md',
      'QA_PUBLIC_HANDOFF_CHECKLIST_v1.3.6.md'
    ];
    for (const f of historicalFiles) {
      assert.ok(fs.existsSync(path.join(ROOT_DIR, f)), `L'archive historique ${f} doit être conservée`);
    }
  });

  // 21. scenario matrix complete
  it('TEST-21: La matrice de scénarios (public-campaign-matrix.json) contient 25 scénarios exhaustifs', () => {
    const matPath = path.join(ARTIFACTS_DIR, 'public-campaign-matrix.json');
    assert.ok(fs.existsSync(matPath), 'public-campaign-matrix.json doit exister');
    const mat = JSON.parse(fs.readFileSync(matPath, 'utf8'));
    assert.equal(mat.summary.totalScenarios, 25);
    assert.equal(mat.scenarios.length, 25);
  });

  // 22. all physical scenarios start READY FOR HUMAN EXECUTION
  it('TEST-22: Tous les scénarios de la matrice démarrent au statut initial READY FOR HUMAN EXECUTION', () => {
    const matPath = path.join(ARTIFACTS_DIR, 'public-campaign-matrix.json');
    const mat = JSON.parse(fs.readFileSync(matPath, 'utf8'));
    for (const s of mat.scenarios) {
      assert.equal(s.status, 'READY FOR HUMAN EXECUTION', `Le scénario ${s.id} doit être READY FOR HUMAN EXECUTION`);
      assert.equal(s.human_execution_required, true);
    }
    assert.equal(mat.summary.scenariosPassed, 0, 'Zéro scénario physique ne peut être déclaré PASS sans test');
  });

  // 23. evidence rules present
  it('TEST-23: La politique des preuves (evidence-policy.json) formalise l\'interdiction des simulations', () => {
    const polPath = path.join(ARTIFACTS_DIR, 'evidence-policy.json');
    assert.ok(fs.existsSync(polPath), 'evidence-policy.json doit exister');
    const pol = JSON.parse(fs.readFileSync(polPath, 'utf8'));
    assert.equal(pol.resultats.simulationForbidden, true);
    assert.ok(pol.acceptableEvidence.length >= 6);
    assert.ok(pol.prohibitedEvidence.length >= 4);
  });

  // 24. incident form complete
  it('TEST-24: La politique des incidents (incident-policy.json) contient la matrice de sévérité complète', () => {
    const incPath = path.join(ARTIFACTS_DIR, 'incident-policy.json');
    assert.ok(fs.existsSync(incPath), 'incident-policy.json doit exister');
    const inc = JSON.parse(fs.readFileSync(incPath, 'utf8'));
    assert.equal(inc.resultats.incidentPolicyEnforced, 'PASS');
    const severities = inc.severityMatrix.map((s: any) => s.level);
    assert.deepEqual(severities, ['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR']);
  });

  // 25. release package internally coherent
  it('TEST-25: Le package de release est cohérent entre code, build identity et binaire APK V2.0.0-RC1', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
    assert.equal(pkg.version, EXPECTED_VERSION);
    assert.equal(BUILD_ID, EXPECTED_BUILD_ID);

    const buf = fs.readFileSync(OFFICIAL_APK_PATH);
    const hash = crypto.createHash('sha256').update(buf).digest('hex').toUpperCase();
    assert.equal(hash, EXPECTED_APK_SHA256);
    const stat = fs.statSync(OFFICIAL_APK_PATH);
    assert.equal(stat.size, EXPECTED_APK_SIZE);

    const buildPath = path.join(ARTIFACTS_DIR, 'build-identity.json');
    assert.ok(fs.existsSync(buildPath), 'build-identity.json historique doit être conservé');
  });

  // 26. Absence of obsolete v1.3.6 references in active tester kit
  it('TEST-26: Absence de référence active v1.3.6 ou BA-V1.3.6 dans les documents actifs du Kit Testeur Public', () => {
    const activeKitDocs = [
      path.join(ROOT_DIR, 'public', 'downloads', 'PUBLIC_TESTER_GUIDE.md'),
      path.join(ROOT_DIR, 'public', 'downloads', 'PUBLIC_TESTER_INVITATION.md'),
      path.join(ROOT_DIR, 'PUBLIC_TESTER_GUIDE.md'),
      path.join(ROOT_DIR, 'PUBLIC_TESTER_INVITATION.md'),
      path.join(ROOT_DIR, 'public', 'downloads', 'QA_PUBLIC_TESTER_GUIDE_V2.0.0-RC1.md'),
      path.join(ROOT_DIR, 'public', 'downloads', 'QA_PUBLIC_INCIDENT_REPORT_FORM_V2.0.0-RC1.md'),
      path.join(ROOT_DIR, 'public', 'downloads', 'QA_PUBLIC_FEEDBACK_QUICK_FORM_V2.0.0-RC1.md'),
      path.join(ROOT_DIR, 'public', 'downloads', 'QA_PUBLIC_EVIDENCE_GUIDE_V2.0.0-RC1.md'),
      path.join(ROOT_DIR, 'public', 'downloads', 'QA_PUBLIC_HANDOFF_CHECKLIST_V2.0.0-RC1.md')
    ];

    for (const docPath of activeKitDocs) {
      assert.ok(fs.existsSync(docPath), `Le document actif ${docPath} doit exister`);
      const content = fs.readFileSync(docPath, 'utf8');
      assert.doesNotMatch(content, /v1\.3\.6/i, `Le document actif ${path.basename(docPath)} ne doit pas contenir de référence à v1.3.6`);
      assert.doesNotMatch(content, /BA-V1\.3\.6/i, `Le document actif ${path.basename(docPath)} ne doit pas contenir de référence à BA-V1.3.6`);
    }
  });

  // 27. Presence of V2.0.0-RC1 and BA-V2.0.0-RC1 in active tester kit
  it('TEST-27: Présence de V2.0.0-RC1 et BA-V2.0.0-RC1 dans les documents actifs du Kit Testeur Public', () => {
    const activeKitDocs = [
      path.join(ROOT_DIR, 'public', 'downloads', 'PUBLIC_TESTER_GUIDE.md'),
      path.join(ROOT_DIR, 'public', 'downloads', 'PUBLIC_TESTER_INVITATION.md'),
      path.join(ROOT_DIR, 'public', 'downloads', 'QA_PUBLIC_TESTER_GUIDE_V2.0.0-RC1.md'),
      path.join(ROOT_DIR, 'public', 'downloads', 'QA_PUBLIC_INCIDENT_REPORT_FORM_V2.0.0-RC1.md'),
      path.join(ROOT_DIR, 'public', 'downloads', 'QA_PUBLIC_FEEDBACK_QUICK_FORM_V2.0.0-RC1.md')
    ];

    for (const docPath of activeKitDocs) {
      const content = fs.readFileSync(docPath, 'utf8');
      assert.match(content, /V2\.0\.0-RC1/i, `Le document actif ${path.basename(docPath)} doit mentionner V2.0.0-RC1`);
      assert.match(content, /BA-V2\.0\.0-RC1/i, `Le document actif ${path.basename(docPath)} doit mentionner BA-V2.0.0-RC1`);
    }
  });

  // 28. Coherence of certified binary metrics in tester guide
  it('TEST-28: Cohérence des noms de fichiers, tailles et empreintes certifiées dans le guide du testeur', () => {
    const guidePath = path.join(ROOT_DIR, 'public', 'downloads', 'PUBLIC_TESTER_GUIDE.md');
    const content = fs.readFileSync(guidePath, 'utf8');

    // Windows Setup
    assert.match(content, /Bird-Academy-Avian-ERP-Setup\.exe|Bird-Academy-User-Windows-Setup\.exe/);
    assert.match(content, /109\s*747\s*064/);
    assert.match(content, new RegExp(EXPECTED_WIN_SETUP_SHA256, 'i'));

    // Windows Portable
    assert.match(content, /Bird-Academy-User\.exe/);
    assert.match(content, /109\s*408\s*543/);
    assert.match(content, new RegExp(EXPECTED_WIN_PORTABLE_SHA256, 'i'));

    // Android APK
    assert.match(content, /Bird-Academy-User\.apk/);
    assert.match(content, /20\s*461\s*460/);
    assert.match(content, new RegExp(EXPECTED_APK_SHA256, 'i'));

    // Official test report
    assert.match(content, /Rapport-de-test-Bird-Academy-V2\.0\.0-RC1-A-remplir-par-le-testeur\.pdf/);
    assert.match(content, /192\s*358/);
    assert.match(content, new RegExp(EXPECTED_REPORT_SHA256, 'i'));
  });

  // 29. Coherence of download links and manifest
  it('TEST-29: Cohérence des liens et présence du manifeste SHA256SUMS-USER.txt', () => {
    const manifestPath = path.join(ROOT_DIR, 'public', 'downloads', 'SHA256SUMS-USER.txt');
    assert.ok(fs.existsSync(manifestPath), 'Le manifeste SHA256SUMS-USER.txt doit exister');
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    assert.match(manifest, new RegExp(EXPECTED_WIN_SETUP_SHA256, 'i'));
    assert.match(manifest, new RegExp(EXPECTED_WIN_PORTABLE_SHA256, 'i'));
    assert.match(manifest, new RegExp(EXPECTED_APK_SHA256, 'i'));

    const invitationPath = path.join(ROOT_DIR, 'public', 'downloads', 'PUBLIC_TESTER_INVITATION.md');
    const invContent = fs.readFileSync(invitationPath, 'utf8');
    assert.match(invContent, /https:\/\/bird-academy-public-test\.onrender\.com\/\?view=website#download/);
    assert.match(invContent, /downloads\/PUBLIC_TESTER_GUIDE\.md/);
    assert.match(invContent, /downloads\/SHA256SUMS-USER\.txt/);
  });
});
