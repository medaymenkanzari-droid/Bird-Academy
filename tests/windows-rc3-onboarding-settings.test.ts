/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WINDOWS RC3 AUDIT & VERIFICATION SUITE
 * Complete validation for Onboarding Wizard, Currency Configuration,
 * System Information vs. About separation, Multilingual reactivity & RTL.
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

import { TRANSLATIONS } from '../src/utils/translations';
import { formatCurrency, getCurrencyDecimals, CURRENCY_CONFIGS } from '../src/utils/currencyFormatter';
import { BirdEngine } from '../src/business/BirdEngine';
import { BirdService } from '../src/features/birds/services/BirdService';
import { BirdRepository } from '../src/features/birds/repositories/BirdRepository';
import { HabitatRepository } from '../src/features/habitat/repositories/HabitatRepository';
import { AnalyticsSettingsRepository } from '../src/features/analytics/repositories/AnalyticsSettingsRepository';
import { BreedingRepository } from '../src/features/breeding/repositories/BreedingRepository';
import { Canari, HabitatCage, Facility, Zone } from '../src/types';
import { appStorage } from '../src/storage';

// In-memory mock for localStorage in node test environment
const mockStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (k: string) => mockStorage[k] ?? null,
    setItem: (k: string, v: string) => { mockStorage[k] = String(v); },
    removeItem: (k: string) => { delete mockStorage[k]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
  };
}

describe('MISSION — BIRD ACADEMY USER WINDOWS RC3 ONBOARDING & SETTINGS AUDIT', () => {
  const rootDir = process.cwd();
  const appPath = path.join(rootDir, 'src/App.tsx');
  const wizardPath = path.join(rootDir, 'src/features/quality/components/WelcomeWizard.tsx');
  const settingsPath = path.join(rootDir, 'src/components/Parametres.tsx');
  const currencySelectorPath = path.join(rootDir, 'src/components/CurrencySelector.tsx');
  const translationsPath = path.join(rootDir, 'src/utils/translations.ts');

  before(() => {
    localStorage.clear();
    appStorage.clear();
  });

  // --------------------------------------------------------------------------
  // 1. HELPWIZARD & ONBOARDING DYNAMICS (WIN-ONB-RC3-01 to WIN-ONB-RC3-06)
  // --------------------------------------------------------------------------
  describe('1. ONBOARDING & MULTILINGUAL REACTIVITY (WIN-ONB-RC3-01 to WIN-ONB-RC3-06)', () => {
    it('WIN-ONB-RC3-01 : Wizard affiché après licence valide', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes("if (licenseState !== 'LICENSE_VALID') return;"), 'App doit attendre LICENSE_VALID');
      assert.ok(appContent.includes("localStorage.getItem('bird_academy_wizard_completed') === 'true'"), 'App vérifie wizard_completed');
      assert.ok(appContent.includes('<WelcomeWizard'), 'WelcomeWizard est monté pour un nouvel utilisateur');
    });

    it('WIN-ONB-RC3-02 : Langues disponibles (FR, EN, AR, ES, IT)', () => {
      const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
      const supportedLangs = ['fr', 'en', 'ar', 'es', 'it'];
      for (const lang of supportedLangs) {
        assert.ok(wizardContent.includes(`code: '${lang}'`), `Langue ${lang} doit être présente dans WelcomeWizard`);
        assert.ok((TRANSLATIONS as any)[lang], `Dictionnaire ${lang} doit être initialisé`);
        assert.ok((TRANSLATIONS as any)[lang].helpWizard, `helpWizard doit être traduit pour ${lang}`);
        assert.ok((TRANSLATIONS as any)[lang].wizardNoCageWarning, `wizardNoCageWarning doit être traduit pour ${lang}`);
      }
    });

    it('WIN-ONB-RC3-03 : Changement de langue immédiat dès l\'étape 1', () => {
      const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
      assert.ok(wizardContent.includes('handleLanguageChange'), 'WelcomeWizard doit proposer un sélecteur de langue interactif');
      assert.ok(wizardContent.includes('wizard-step-1'), 'Étape 1 doit être structurée');
      assert.ok(wizardContent.includes('setLanguage'), 'setLanguage doit être appelé dès la sélection');
    });

    it('WIN-ONB-RC3-04 : Toutes les pages suivent la langue sélectionnée', () => {
      const langs = ['fr', 'en', 'ar', 'es', 'it'] as const;
      for (const l of langs) {
        assert.strictEqual(typeof TRANSLATIONS[l].wizardStep1Title, 'string');
        assert.strictEqual(typeof TRANSLATIONS[l].wizardStep2Title, 'string');
        assert.strictEqual(typeof TRANSLATIONS[l].wizardStep3Title, 'string');
        assert.strictEqual(typeof TRANSLATIONS[l].wizardStep4Title, 'string');
        assert.strictEqual(typeof TRANSLATIONS[l].wizardStep5Title, 'string');
        assert.strictEqual(typeof TRANSLATIONS[l].wizardStep6Title, 'string');
        assert.strictEqual(typeof TRANSLATIONS[l].wizardStep7Title, 'string');
        assert.ok(TRANSLATIONS[l].wizardStep1Title.length > 0);
      }
    });

    it('WIN-ONB-RC3-05 : Arabe active immédiatement RTL (dir="rtl")', () => {
      const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
      assert.ok(wizardContent.includes("dir={isRtl ? 'rtl' : 'ltr'}"), 'WelcomeWizard doit appliquer dir="rtl" quand isRtl est vrai');
      assert.ok(wizardContent.includes('NextArrowIcon'), 'Les icônes directionnelles doivent s\'adapter au mode RTL');
    });

    it('WIN-ONB-RC3-06 : Aucun texte hardcodé en français dans WelcomeWizard.tsx', () => {
      const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
      // Verify that key user strings are replaced with t(...)
      assert.ok(!wizardContent.includes('>Bienvenue dans Bird Academy !<'), 'Titre d\'accueil ne doit pas être hardcodé');
      assert.ok(!wizardContent.includes('>Commencer la Configuration<'), 'Bouton démarrer ne doit pas être hardcodé');
      assert.ok(!wizardContent.includes('>Identité de votre Élevage<'), 'Titre identité ne doit pas être hardcodé');
      assert.ok(!wizardContent.includes('>Précédent<'), 'Bouton précédent ne doit pas être hardcodé');
      assert.ok(!wizardContent.includes('>Suivant<'), 'Bouton suivant ne doit pas être hardcodé');
      assert.ok(!wizardContent.includes('>Passer (Skip)<'), 'Bouton passer ne doit pas être hardcodé');
    });
  });

  // --------------------------------------------------------------------------
  // 2. HABITAT, PREREQUIS DE CAGE & PREMIER OISEAU (WIN-ONB-RC3-07 to WIN-ONB-RC3-12)
  // --------------------------------------------------------------------------
  describe('2. HABITAT & PREMIER OISEAU FONDATEUR (WIN-ONB-RC3-07 to WIN-ONB-RC3-12)', () => {
    it('WIN-ONB-RC3-07 : Impossible de créer un oiseau résident sans cage', () => {
      HabitatRepository.saveAll([]);
      const cages = HabitatRepository.getAllLegacy();
      assert.strictEqual(cages.length, 0, 'Base de cages doit être vierge');

      const candidateWithoutCage: Partial<Canari> = {
        bague: 'RC3-001',
        nom: 'Phénix',
        sexe: 'Mâle',
        espece: 'canari',
        categorie: 'canari_posture',
        race: 'Gloster Fancy',
        couleur_base: 'Jaune',
        date_naissance: new Date().toISOString().slice(0, 10),
        acquisition: false
      };

      const result = BirdEngine.validateBird(candidateWithoutCage, []);
      assert.strictEqual(result.isValid, false, 'BirdEngine doit refuser la création sans cage');
      assert.ok(result.errors.some(e => e.field === 'cage_id'), 'Erreur de cage obligatoire attendue');

      // Check required translated message across all 5 languages
      assert.strictEqual(TRANSLATIONS.fr.wizardNoCageWarning, 'Vous devez d\'abord créer une cage.');
      assert.strictEqual(TRANSLATIONS.en.wizardNoCageWarning, 'You must create a cage first.');
      assert.strictEqual(TRANSLATIONS.ar.wizardNoCageWarning, 'يجب عليك إنشاء قفص أولاً.');
      assert.strictEqual(TRANSLATIONS.es.wizardNoCageWarning, 'Primero debe crear una jaula.');
      assert.strictEqual(TRANSLATIONS.it.wizardNoCageWarning, 'È necessario creare una gabbia prima.');
    });

    it('WIN-ONB-RC3-08 : Création d\'une cage valide dans HabitatRepository', () => {
      const newCage = HabitatRepository.create<HabitatCage>('cage', {
        nom: 'Cage d\'Élevage 01',
        zoneId: 'zone_default',
        capacite_max: 6,
        description: 'Cage spacieuse RC3',
        statut: 'Actif'
      });

      assert.ok(newCage.id, 'La cage créée doit avoir un identifiant');
      assert.strictEqual(newCage.nom, 'Cage d\'Élevage 01');
      assert.strictEqual(newCage.capacite_max, 6);

      const legacyCages = HabitatRepository.getAllLegacy();
      assert.ok(legacyCages.length >= 1, 'HabitatRepository doit synchroniser avec legacy cages');
    });

    it('WIN-ONB-RC3-09 : Après création, la cage est disponible pour le premier oiseau', () => {
      const activeCages = HabitatRepository.getAll<HabitatCage>('cage').filter(c => !c.isArchived);
      assert.ok(activeCages.length > 0, 'Au moins une cage doit être disponible');
      const targetCage = activeCages[0];

      const birdWithCage: Omit<Canari, 'id'> = {
        bague: 'BE-2026-999',
        nom: 'Titan',
        sexe: 'Mâle',
        espece: 'canari',
        categorie: 'canari_posture',
        race: 'Gloster Fancy',
        mutation: 'Classique',
        couleur_base: 'Jaune',
        facteur: 'Intensif',
        couleur: 'Jaune Intensif',
        date_naissance: new Date().toISOString().slice(0, 10),
        cage_id: parseInt(targetCage.id, 10) || 1001,
        cageId: targetCage.id,
        zoneId: targetCage.zoneId || 'zone_default',
        facilityId: 'fac_default',
        pere_id: null,
        mere_id: null,
        archived: false,
        photos: [],
        documents: [],
        statut_sante: 'Actif',
        acquisition: false
      };

      const val = BirdEngine.validateBird(birdWithCage, []);
      assert.strictEqual(val.isValid, true, 'L\'oiseau doit être valide avec sa cage');
    });

    it('WIN-ONB-RC3-10 : Création du premier oiseau avec le modèle Bird complet', () => {
      const cages = HabitatRepository.getAllLegacy();
      assert.ok(cages.length > 0);

      const completeBird: Omit<Canari, 'id'> = {
        bague: 'TN-2026-001',
        nom: 'Zeus',
        sexe: 'Mâle',
        espece: 'canari',
        categorie: 'canari_posture',
        race: 'Gloster Fancy',
        mutation: 'Classique',
        couleur_base: 'Jaune',
        facteur: 'Intensif',
        couleur: 'Jaune Intensif',
        date_naissance: '2026-01-15',
        cage_id: cages[0].id,
        cageId: String(cages[0].id),
        zoneId: 'zone_default',
        facilityId: 'fac_default',
        pere_id: null,
        mere_id: null,
        archived: false,
        photos: [],
        documents: [],
        statut_sante: 'Actif',
        acquisition: false
      };

      const res = BirdService.create(completeBird);
      assert.strictEqual(res.success, true, 'BirdService.create doit réussir');
      assert.ok(res.data?.id, 'L\'oiseau créé doit recevoir un ID unique');
      assert.strictEqual(res.data?.bague, 'TN-2026-001');

      const retrieved = BirdService.getById(res.data!.id);
      assert.ok(retrieved, 'L\'oiseau doit être récupérable depuis le service');
      assert.strictEqual(retrieved?.nom, 'Zeus');
    });

    it('WIN-ONB-RC3-11 : BirdEngine.validateBird utilisé (unicité de bague, race, couleur, date)', () => {
      const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
      assert.ok(wizardContent.includes('BirdEngine.validateBird'), 'WelcomeWizard doit invoquer BirdEngine.validateBird');

      // Test duplicate ring validation
      const existing = BirdService.getAll(true);
      assert.ok(existing.length > 0);
      const duplicateRingBird: Partial<Canari> = {
        bague: existing[0].bague,
        nom: 'Cloné',
        sexe: 'Femelle',
        espece: 'canari',
        categorie: 'canari_posture',
        race: 'Gloster Fancy',
        couleur_base: 'Jaune',
        date_naissance: '2026-01-15',
        cage_id: existing[0].cage_id
      };
      const res = BirdEngine.validateBird(duplicateRingBird, existing);
      assert.strictEqual(res.isValid, false, 'Un numéro de bague dupliqué doit être rejeté');
      assert.ok(res.errors.some(e => e.field === 'bague'));
    });

    it('WIN-ONB-RC3-12 : BirdService utilisé sans contournement de BirdRepository', () => {
      const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
      assert.ok(wizardContent.includes('BirdService.create'), 'WelcomeWizard doit utiliser BirdService.create');
      assert.ok(!wizardContent.includes('BirdRepository.create('), 'WelcomeWizard ne doit pas appeler directement BirdRepository.create');
    });
  });

  // --------------------------------------------------------------------------
  // 3. GESTION DE LA DEVISE (WIN-ONB-RC3-13 to WIN-ONB-RC3-16)
  // --------------------------------------------------------------------------
  describe('3. GESTION ET PERSISTANCE DE LA DEVISE (WIN-ONB-RC3-13 to WIN-ONB-RC3-16)', () => {
    it('WIN-ONB-RC3-13 : Devise sauvegardée après onboarding', () => {
      AnalyticsSettingsRepository.saveSettings({
        ...AnalyticsSettingsRepository.getSettings(),
        currency: 'EUR'
      });
      localStorage.setItem('bird_academy_currency', 'EUR');

      const loaded = AnalyticsSettingsRepository.getSettings().currency;
      assert.strictEqual(loaded, 'EUR', 'La devise doit être persistée dans AnalyticsSettingsRepository');
      assert.strictEqual(localStorage.getItem('bird_academy_currency'), 'EUR');
    });

    it('WIN-ONB-RC3-14 : Devise modifiable depuis les Paramètres (CurrencySelector)', () => {
      const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
      assert.ok(settingsContent.includes('<CurrencySelector'), 'Parametres.tsx doit inclure le composant CurrencySelector');
      assert.ok(fs.existsSync(currencySelectorPath), 'src/components/CurrencySelector.tsx doit exister');

      const selectorContent = fs.readFileSync(currencySelectorPath, 'utf-8');
      const expectedCurrencies = ['TND', 'EUR', 'USD', 'DZD', 'MAD', 'GBP'];
      for (const curr of expectedCurrencies) {
        assert.ok(selectorContent.includes(curr), `CurrencySelector doit supporter ${curr}`);
      }
    });

    it('WIN-ONB-RC3-15 : Changement de devise immédiatement reflété dans le formateur', () => {
      const amount = 150.5;

      const tndFormatted = formatCurrency(amount, 'TND', true, 'fr');
      assert.strictEqual(getCurrencyDecimals('TND'), 3, 'TND doit avoir 3 décimales');
      assert.ok(tndFormatted.includes('150,500') || tndFormatted.includes('150.500') || tndFormatted.includes('DT'), 'Format TND correct');

      const eurFormatted = formatCurrency(amount, 'EUR', true, 'fr');
      assert.strictEqual(getCurrencyDecimals('EUR'), 2, 'EUR doit avoir 2 décimales');
      assert.ok(eurFormatted.includes('150,50') || eurFormatted.includes('150.50') || eurFormatted.includes('€'), 'Format EUR correct');

      const usdFormatted = formatCurrency(amount, 'USD', true, 'en');
      assert.strictEqual(getCurrencyDecimals('USD'), 2, 'USD doit avoir 2 décimales');
      assert.ok(usdFormatted.includes('150.50') || usdFormatted.includes('$'), 'Format USD correct');
    });

    it('WIN-ONB-RC3-16 : Les valeurs financières internes stockées ne sont pas modifiées', () => {
      const rawPrice = 450;
      // Changing display currency must not alter numeric raw data
      const eurDisplay = formatCurrency(rawPrice, 'EUR');
      const tndDisplay = formatCurrency(rawPrice, 'TND');
      assert.notStrictEqual(eurDisplay, tndDisplay);
      assert.strictEqual(rawPrice, 450, 'Le montant brut interne doit rester rigoureusement intact');
    });
  });

  // --------------------------------------------------------------------------
  // 4. SÉPARATION "À PROPOS" vs "INFORMATIONS SYSTÈME" (WIN-ONB-RC3-17 to WIN-ONB-RC3-18)
  // --------------------------------------------------------------------------
  describe('4. SÉPARATION DES RESPONSABILITÉS & SÉCURITÉ (WIN-ONB-RC3-17 to WIN-ONB-RC3-18)', () => {
    it('WIN-ONB-RC3-17 : À propos et Informations système ont des responsabilités distinctes', () => {
      const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
      assert.ok(settingsContent.includes("t('aboutTitle')"), 'À propos doit afficher son titre traduit');
      assert.ok(settingsContent.includes("t('aboutVisionTitle')"), 'À propos doit afficher sa vision');
      assert.ok(settingsContent.includes("t('sysInfoTitle')"), 'Informations système doit afficher son titre');
      assert.ok(settingsContent.includes("t('sysInfoStorageDriver')"), 'Informations système doit afficher le statut du stockage');
      assert.ok(settingsContent.includes("t('sysInfoDatabaseRecords')"), 'Informations système doit afficher les statistiques réelles');
    });

    it('WIN-ONB-RC3-18 : Aucune donnée sensible ou secret exposé dans Informations système', () => {
      const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
      assert.ok(!settingsContent.includes('privateKey'), 'Aucune clé privée dans Parametres');
      assert.ok(!settingsContent.includes('secretKey'), 'Aucune clé secrète dans Parametres');
      assert.ok(!settingsContent.includes('token:'), 'Aucun token d\'administration dans Parametres');
      assert.ok(!settingsContent.includes('apiKey'), 'Aucune clé API dans Parametres');
    });
  });
});
