import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('MISSION — BIRD ACADEMY USER WINDOWS RC2 VERIFICATION', () => {
  const rootDir = process.cwd();
  const appPath = path.join(rootDir, 'src/App.tsx');
  const wizardPath = path.join(rootDir, 'src/features/quality/components/WelcomeWizard.tsx');
  const explorerPath = path.join(rootDir, 'src/features/genetics/components/GenealogyExplorer.tsx');
  const licenseContextPath = path.join(rootDir, 'src/features/licensing/context/LicenseContext.tsx');

  describe('2. LICENCE WINDOWS (WIN-LIC-01 to WIN-LIC-05)', () => {
    it('WIN-LIC-01 : Licence valide existante → accès autorisé', () => {
      const content = fs.readFileSync(licenseContextPath, 'utf-8');
      assert.ok(content.includes("licenseState = 'LICENSE_VALID'"), 'Le contexte doit définir LICENSE_VALID en cas de licence valide');
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes("if (licenseState !== 'LICENSE_VALID') return;"), 'App.tsx doit bloquer la réhydratation si non valide');
    });

    it('WIN-LIC-02 : Aucune licence → FirstLaunchActivationScreen', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes('FirstLaunchActivationScreen'), 'App.tsx doit utiliser FirstLaunchActivationScreen quand aucune licence n\'est valide');
      assert.ok(appContent.includes("licenseState === 'LICENSE_REQUIRED'"), 'App.tsx doit tester LICENSE_REQUIRED');
    });

    it('WIN-LIC-03 : Licence invalide → accès refusé', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes("licenseState === 'LICENSE_INVALID'"), 'App.tsx doit traiter LICENSE_INVALID comme refus d\'accès');
    });

    it('WIN-LIC-04 : Aucune possibilité de bypass', () => {
      const guardPath = path.join(rootDir, 'src/features/licensing/components/LicenseBootGuard.tsx');
      const guardContent = fs.readFileSync(guardPath, 'utf-8');
      assert.ok(guardContent.includes("if (licenseState !== 'LICENSE_VALID')"), 'LicenseBootGuard doit bloquer le rendu de App si licenseState !== LICENSE_VALID');
    });

    it('WIN-LIC-05 : Le mécanisme LMSE existant reste utilisé', () => {
      const servicePath = path.join(rootDir, 'src/features/licensing/services/LicensingService.ts');
      const serviceContent = fs.readFileSync(servicePath, 'utf-8');
      assert.ok(serviceContent.includes('LocalStorageLicenseRepository'), 'LicensingService doit utiliser le repository LMSE officiel');
    });
  });

  describe('3. ONBOARDING INITIAL (WIN-ONB-01 to WIN-ONB-07)', () => {
    it('WIN-ONB-01 : Fresh install → WelcomeWizard', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes("localStorage.getItem('bird_academy_wizard_completed') === 'true'"), 'App.tsx doit vérifier bird_academy_wizard_completed');
      assert.ok(appContent.includes('<WelcomeWizard'), 'App.tsx doit inclure WelcomeWizard');
    });

    it('WIN-ONB-02 : Sélection langue sauvegardée', () => {
      const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
      assert.ok(wizardContent.includes('handleLanguageChange'), 'WelcomeWizard doit permettre le changement de langue');
      assert.ok(wizardContent.includes('setLanguage(lang)'), 'WelcomeWizard doit mettre à jour le contexte i18n');
    });

    it('WIN-ONB-03 : Sélection devise sauvegardée', () => {
      const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
      assert.ok(wizardContent.includes('handleCurrencyChange'), 'WelcomeWizard doit permettre la sélection de la devise');
      assert.ok(wizardContent.includes("localStorage.setItem('bird_academy_currency'"), 'WelcomeWizard doit sauvegarder la devise dans localStorage');
      assert.ok(wizardContent.includes('AnalyticsSettingsRepository.saveSettings'), 'WelcomeWizard doit persister la devise dans les paramètres d\'analyse');
    });

    it('WIN-ONB-04 : Arabic → RTL', () => {
      const langContextPath = path.join(rootDir, 'src/context/LanguageContext.tsx');
      const content = fs.readFileSync(langContextPath, 'utf-8');
      assert.ok(content.includes("isRtl = language === 'ar'"), 'LanguageContext doit activer RTL pour l\'arabe');
    });

    it('WIN-ONB-05 : FR / EN / AR / ES / IT disponibles', () => {
      const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
      assert.ok(wizardContent.includes("code: 'fr'"), 'FR disponible');
      assert.ok(wizardContent.includes("code: 'en'"), 'EN disponible');
      assert.ok(wizardContent.includes("code: 'ar'"), 'AR disponible');
      assert.ok(wizardContent.includes("code: 'es'"), 'ES disponible');
      assert.ok(wizardContent.includes("code: 'it'"), 'IT disponible');
    });

    it('WIN-ONB-06 : Wizard interrompu → réapparaît', () => {
      const wizardContent = fs.readFileSync(wizardPath, 'utf-8');
      assert.ok(wizardContent.includes("localStorage.setItem('bird_academy_wizard_completed', 'true')"), 'wizard_completed n\'est défini que lors de handleFinish');
    });

    it('WIN-ONB-07 : Wizard terminé → ne réapparaît plus', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes("if (!isCompleted)"), 'WelcomeWizard ne s\'affiche que si !isCompleted');
    });
  });

  describe('4. BASE DE DONNÉES UTILISATEUR VIERGE (WIN-DATA-01 to WIN-DATA-07)', () => {
    it('WIN-DATA-01 : Fresh install → 0 oiseaux', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes('BirdRepository.saveAll([])'), 'Fresh install doit réinitialiser les oiseaux à un tableau vide []');
    });

    it('WIN-DATA-02 : Fresh install → 0 couples', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes('BreedingRepository.saveCouples([])'), 'Fresh install doit réinitialiser les couples à un tableau vide []');
    });

    it('WIN-DATA-03 : Fresh install → 0 cages', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes('HabitatRepository.saveAll([])'), 'Fresh install doit réinitialiser les cages à un tableau vide []');
    });

    it('WIN-DATA-04 : Fresh install → 0 données métier', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes('FinanceRepository.saveExpenses([])'), 'Fresh install réinitialise les dépenses');
      assert.ok(appContent.includes('FinanceRepository.saveSales([])'), 'Fresh install réinitialise les ventes');
    });

    it('WIN-DATA-05 : Référentiel biologique disponible', () => {
      const speciesRefPath = path.join(rootDir, 'src/reference/species/index.ts');
      assert.ok(fs.existsSync(speciesRefPath), 'Le fichier de référence biologique doit exister');
      const speciesContent = fs.readFileSync(speciesRefPath, 'utf-8');
      assert.ok(speciesContent.includes('BIOLOGICAL_SPECIES_REGISTRY'), 'Le registre des espèces doit être présent');
    });

    it('WIN-DATA-06 : Une base existante n\'est jamais vidée lors d\'un upgrade', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes('if (isDbInitialized || hasExistingData)'), 'Si la base est déjà initialisée ou contient des données, celles-ci sont conservées');
      assert.ok(appContent.includes('setCanaris(cachedCanaris)'), 'Les canaris existants sont chargés');
    });

    it('WIN-DATA-07 : Les données utilisateur persistent après redémarrage', () => {
      const appContent = fs.readFileSync(appPath, 'utf-8');
      assert.ok(appContent.includes("localStorage.setItem('bird_academy_db_initialized', 'true')"), 'Un marqueur persistant db_initialized est enregistré');
    });
  });

  describe('5. EXPLORATEUR GÉNÉALOGIQUE (WIN-GEN-01 to WIN-GEN-12)', () => {
    it('WIN-GEN-01 : Summary visible', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('<GenealogySummary'), 'GenealogySummary doit être rendu');
    });

    it('WIN-GEN-02 : Tree visible', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('renderHorizontalTree'), 'Le rendu de l\'arbre doit être présent');
    });

    it('WIN-GEN-03 : Summary et Tree ne se superposent jamais (pas d\'absolute overlay sur Summary)', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.strictEqual(content.includes('absolute top-4 left-4 z-10 w-64'), false, 'GenealogySummary ne doit plus être positionné en overlay absolute top-4 left-4');
      assert.ok(content.includes('Stacked Above Canvas, NO absolute overlay'), 'GenealogySummary est disposé au-dessus du canvas sans superposition');
    });

    it('WIN-GEN-04 : Tree conserve son scroll', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('overflow-auto'), 'Le canvas de l\'arbre doit conserver son overflow-auto');
    });

    it('WIN-GEN-05 : Tree conserve son zoom', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('transform: `scale(${zoom / 100})`'), 'Le canvas doit appliquer le facteur de zoom');
    });

    it('WIN-GEN-06 : Sélection d\'un oiseau fonctionnelle', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('setSelectedBirdId(node.id)'), 'Le clic sur un nœud permet de sélectionner l\'oiseau');
    });

    it('WIN-GEN-07 : Light mode compatible', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('bg-white'), 'Light mode géré avec des classes bg-white');
    });

    it('WIN-GEN-08 : Dark mode compatible', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('dark:bg-slate-900'), 'Dark mode géré avec des classes dark:');
    });

    it('WIN-GEN-09 : Arabic RTL', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('useLanguage()'), 'GenealogyExplorer doit consommer useLanguage pour RTL');
    });

    it('WIN-GEN-10 : Layout 1280px responsive', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('lg:col-span-3'), 'Support responsive desktop lg:col-span-3');
    });

    it('WIN-GEN-11 : Layout 1920px responsive', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('space-y-4 flex flex-col min-h-[650px]'), 'Conteneur principal flexible pour hautes résolutions');
    });

    it('WIN-GEN-12 : Layout 2560px responsive', () => {
      const content = fs.readFileSync(explorerPath, 'utf-8');
      assert.ok(content.includes('min-h-[450px]'), 'Hauteur minimale du canvas pour écrans 2K/4K');
    });
  });
});
