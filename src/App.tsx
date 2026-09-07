/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { 
  Home, Bird, Heart, Egg, Grid, Activity, Calendar, 
  TrendingDown, TrendingUp, BarChart3, Settings, Wheat, Menu, X, Bell, BookOpen, BrainCircuit, Dna, ShieldCheck, ShieldAlert, Database, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOTION_VARIANTS } from './theme';

// Type declarations
import { 
  Canari, Cage, HabitatCage, Couple, Reproduction, Ponte, Jeune, Sante, Alimentation, Depense, Vente 
} from './types';

// Default data sets
import { 
  INITIAL_CAGES, INITIAL_CANARIS, INITIAL_COUPLES, INITIAL_REPRODUCTIONS, 
  INITIAL_PONTES, INITIAL_JEUNES, INITIAL_SANTE, INITIAL_ALIMENTATION, 
  INITIAL_DEPENSES, INITIAL_VENTES 
} from './data/defaultData';

import { isUserBuild, isAdminBuild, BUILD_ID } from './config/appMode';

// Modular Components
import { useLanguage } from './context/LanguageContext';
import { LanguageSelector } from './components/LanguageSelector';
import { AppPage, AppSkeleton, AppLogo, AppIcon, BrandLogoIcon } from './components/design-system';
import { ChunkLoadErrorBoundary } from './components/ChunkLoadErrorBoundary';
import { ComponentErrorBoundary } from './components/ComponentErrorBoundary';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Canaris = lazy(() => import('./components/Canaris'));
const Couples = lazy(() => import('./components/Couples'));
const ReproductionComponent = lazy(() => import('./components/Reproduction'));
const SanteComponent = lazy(() => import('./components/Sante'));
const AlimentationComponent = lazy(() => import('./components/Alimentation'));
const CalendrierComponent = lazy(() => import('./components/Calendrier'));
const Depenses = lazy(() => import('./components/Depenses'));
const Ventes = lazy(() => import('./components/Ventes'));
const AnalyticsDashboard = lazy(() => import('./features/analytics/components/AnalyticsDashboard'));
const Parametres = lazy(() => import('./components/Parametres'));
const ReferenceBiologique = lazy(() => import('./components/ReferenceBiologique'));
const HabitatComponent = lazy(() => import('./features/habitat/components').then(module => ({ default: module.HabitatComponent })));
const IntelligenceDashboard = lazy(() => import('./features/intelligence/components').then(module => ({ default: module.IntelligenceDashboard })));
const GeneticsDashboard = lazy(() => import('./features/genetics/components').then(module => ({ default: module.GeneticsDashboard })));
const DemoModeTab = lazy(() => import('./features/quality/components/DemoModeTab').then(module => ({ default: module.DemoModeTab })));
const WelcomeWizard = lazy(() => import('./features/quality/components/WelcomeWizard').then(module => ({ default: module.WelcomeWizard })));
const AssistantView = lazy(() => import('./features/assistant/components/AssistantView'));
import { LicenseStatusBadge } from './features/licensing/components/LicenseStatusBadge';
import { LicenseActivationModal } from './features/licensing/components/LicenseActivationModal';
import { FirstLaunchActivationScreen } from './features/licensing/components/FirstLaunchActivationScreen';
import { useLicensing } from './features/licensing/hooks/useLicensing';
import { useSubscription } from './features/subscription/hooks/useSubscription';
import { FeatureLockedCard } from './features/subscription/components/FeatureLockedCard';
import { UpgradeModal } from './features/subscription/components/UpgradeModal';
import { DesktopSidebar } from './components/ui/DesktopSidebar';
import { DesktopTopBar } from './components/ui/DesktopTopBar';

// Storage and Decoupled Layers
import { appStorage } from './storage';
import { ActivityLogger, EventType } from './storage/ActivityLogger';
import { BirdService } from './features/birds/services/BirdService';
import { BirdRepository } from './features/birds/repositories/BirdRepository';
import { BreedingService } from './features/breeding/services/BreedingService';
import { BreedingRepository } from './features/breeding/repositories/BreedingRepository';
import { HabitatRepository } from './features/habitat/repositories/HabitatRepository';
import { HealthService } from './features/health/services/HealthService';
import { HealthRepository } from './features/health/repositories/HealthRepository';
import { HandFeedingService } from './features/hand-feeding/services/HandFeedingService';
import { HandFeedingRepository } from './features/hand-feeding/repositories/HandFeedingRepository';
import { FinanceService } from './features/finance/services/FinanceService';
import { FinanceRepository } from './features/finance/repositories/FinanceRepository';

export default function App() {
  const { t, isRtl } = useLanguage();
  const { licenseState, activeLicense, refresh: refreshLicensing } = useLicensing();
  const { hasCapability, currentTier } = useSubscription();
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [licenseConfirmed, setLicenseConfirmed] = useState<boolean>(false);

  useEffect(() => {
    console.log(`[BOOT-03] App mounted: BUILD_ID=${BUILD_ID} | time=${new Date().toISOString()} | licenseState=${licenseState}`);
  }, []);

  // Navigation
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWizard, setShowWizard] = useState<boolean>(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);

  // Check onboarding on initial boot ONLY if license is valid
  useEffect(() => {
    if (licenseState !== 'LICENSE_VALID') return;
    const isCompleted = localStorage.getItem('bird_academy_wizard_completed') === 'true';
    if (!isCompleted) {
      setShowWizard(true);
    }
  }, [licenseState]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const getFocusableElements = (): HTMLElement[] => {
      const nodes = mobileDrawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      return nodes ? Array.from(nodes) : [];
    };
    const frame = window.requestAnimationFrame(() => getFocusableElements()[0]?.focus());
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const elements = getFocusableElements();
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyboard);
      mobileMenuButtonRef.current?.focus();
    };
  }, [mobileMenuOpen]);

  // Database State
  const [canaris, setCanaris] = useState<Canari[]>([]);
  const [cages, setCages] = useState<any[]>([]);
  const [couples, setCouples] = useState<Couple[]>([]);
  const [reproductions, setReproductions] = useState<Reproduction[]>([]);
  const [pontes, setPontes] = useState<Ponte[]>([]);
  const [jeunes, setJeunes] = useState<Jeune[]>([]);
  const [sante, setSante] = useState<Sante[]>([]);
  const [alimentation, setAlimentation] = useState<Alimentation[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);

  // Trigger quick forms from dashboard
  const [quickAddCanariOpen, setQuickAddCanariOpen] = useState(false);
  const [quickAddDepenseOpen, setQuickAddDepenseOpen] = useState(false);
  const [quickAddCoupleOpen, setQuickAddCoupleOpen] = useState(false);

  // 1. Load database from Repositories on initialization ONLY if license is valid
  useEffect(() => {
    if (licenseState !== 'LICENSE_VALID') return;
    console.log(`[BOOT-11] database hydration started: BUILD_ID=${BUILD_ID} | time=${new Date().toISOString()}`);

    const cachedCanaris = BirdRepository.getAll();
    const cachedCages = HabitatRepository.getAll<HabitatCage>('cage');
    const isDbInitialized = localStorage.getItem('bird_academy_db_initialized') === 'true';
    const hasExistingData = cachedCanaris.length > 0 || cachedCages.length > 0;

    if (isDbInitialized || hasExistingData) {
      // Existing installation or upgraded installation: preserve all user data
      setCanaris(cachedCanaris);
      setCages(cachedCages);
      setCouples(BreedingService.getCouples());
      setReproductions(BreedingService.getReproductions());
      setPontes(BreedingService.getPontes());
      setJeunes(BreedingService.getJeunes());
      setSante(HealthService.getRecords());
      setAlimentation(HandFeedingService.getAllPlans());
      setDepenses(FinanceService.getExpenses());
      setVentes(FinanceService.getSales());
      if (!isDbInitialized) {
        localStorage.setItem('bird_academy_db_initialized', 'true');
      }
    } else {
      // Fresh installation
      const isDemoEnv = localStorage.getItem('bird_academy_demo_active') === 'true';
      if (isDemoEnv) {
        // Initialize with pre-populated demo data only if explicitly in demo sandbox
        BirdRepository.saveAll(INITIAL_CANARIS);
        HabitatRepository.saveAll(INITIAL_CAGES);
        BreedingRepository.saveCouples(INITIAL_COUPLES);
        BreedingRepository.saveReproductions(INITIAL_REPRODUCTIONS);
        BreedingRepository.savePontes(INITIAL_PONTES);
        BreedingRepository.saveJeunes(INITIAL_JEUNES);
        HealthRepository.saveAll(INITIAL_SANTE);
        HandFeedingRepository.saveAll(INITIAL_ALIMENTATION);
        FinanceRepository.saveExpenses(INITIAL_DEPENSES);
        FinanceRepository.saveSales(INITIAL_VENTES);

        setCanaris(INITIAL_CANARIS);
        setCages(INITIAL_CAGES);
        setCouples(INITIAL_COUPLES);
        setReproductions(INITIAL_REPRODUCTIONS);
        setPontes(INITIAL_PONTES);
        setJeunes(INITIAL_JEUNES);
        setSante(INITIAL_SANTE);
        setAlimentation(INITIAL_ALIMENTATION);
        setDepenses(INITIAL_DEPENSES);
        setVentes(INITIAL_VENTES);

        ActivityLogger.log(EventType.DB_RESET, "Initialisation de l'élevage avec les données de démonstration");
      } else {
        // Fresh User installation -> Empty business database (0 birds, 0 couples, 0 cages, 0 sales, 0 expenses)
        BirdRepository.saveAll([]);
        HabitatRepository.saveAll([]);
        BreedingRepository.saveCouples([]);
        BreedingRepository.saveReproductions([]);
        BreedingRepository.savePontes([]);
        BreedingRepository.saveJeunes([]);
        HealthRepository.saveAll([]);
        HandFeedingRepository.saveAll([]);
        FinanceRepository.saveExpenses([]);
        FinanceRepository.saveSales([]);

        setCanaris([]);
        setCages([]);
        setCouples([]);
        setReproductions([]);
        setPontes([]);
        setJeunes([]);
        setSante([]);
        setAlimentation([]);
        setDepenses([]);
        setVentes([]);

        ActivityLogger.log(EventType.DB_RESET, "Initialisation d'une nouvelle base de données utilisateur vierge");
      }
      localStorage.setItem('bird_academy_db_initialized', 'true');
    }
    console.log(`[BOOT-12] database hydration completed: BUILD_ID=${BUILD_ID} | time=${new Date().toISOString()}`);
  }, [licenseState]);

  // State Modifiers with Rules validation

  // ADD CANARI
  const onAddCanari = (newBird: Omit<Canari, 'id'>): boolean | string => {
    const result = BirdService.addBird(newBird);
    if (result.success) {
      setCanaris(BirdService.getBirds());
      return true;
    }
    return result.message || "Erreur lors de l'ajout.";
  };

  // EDIT CANARI
  const onEditCanari = (updatedBird: Canari): boolean | string => {
    const result = BirdService.editBird(updatedBird);
    if (result.success) {
      setCanaris(BirdService.getBirds());
      return true;
    }
    return result.message || "Erreur lors de la modification.";
  };

  // DELETE CANARI
  const onDeleteCanari = (id: number): boolean | string => {
    const result = BirdService.deleteBird(id);
    if (result.success) {
      setCanaris(BirdService.getBirds());
      return true;
    }
    return result.message || "Erreur lors de la suppression.";
  };

  const refreshCanaris = () => {
    setCanaris(BirdService.getBirds());
  };

  // ADD COUPLE
  const onAddCouple = (maleId: number, femelleId: number): boolean | string => {
    const result = BreedingService.addCouple(maleId, femelleId);
    if (result.success) {
      setCouples(BreedingService.getCouples());
      return true;
    }
    return result.message || "Erreur lors de la formation du couple.";
  };

  // DISSOLVE COUPLE
  const onDissolveCouple = (id: number) => {
    BreedingService.dissolveCouple(id);
    setCouples(BreedingService.getCouples());
  };

  // START REPRODUCTION CYCLE
  const onStartReproduction = (coupleId: number) => {
    BreedingService.startReproduction(coupleId);
    setReproductions(BreedingService.getReproductions());
    setCurrentTab('reproduction');
  };

  // ADD PONTE / LAYING (Rule 5: must belong to a reproduction)
  const onAddPonte = (reproductionId: number, date: string, oeufs: number) => {
    BreedingService.addPonte(reproductionId, date, oeufs);
    setPontes(BreedingService.getPontes());
  };

  // UPDATE PONTE STATS
  const onUpdatePonteStats = (ponteId: number, fecondes: number, eclosions: number, sevrages: number) => {
    BreedingService.updatePonteStats(ponteId, fecondes, eclosions, sevrages);
    setPontes(BreedingService.getPontes());
  };

  // CLOSE REPRODUCTION CYCLE
  const onCloseReproduction = (id: number) => {
    BreedingService.closeReproduction(id);
    setReproductions(BreedingService.getReproductions());
  };

  // ADD JEUNE CHICK
  const onAddJeune = (ponteId: number, bague: string, dateNaissance: string) => {
    BreedingService.addJeune(ponteId, bague, dateNaissance);
    setJeunes(BreedingService.getJeunes());
  };

  // WEAN JEUNE CHICK (Converts chick to Canari with lineage inherit, Rule 4)
  const onWeanJeuneToCanari = (jeuneId: number, nom: string, cageId: number, race: string, couleur: string) => {
    BreedingService.weanJeuneToCanari(jeuneId, nom, cageId, race, couleur, (newBirdPayload) => {
      BirdRepository.add(newBirdPayload);
      setCanaris(BirdRepository.getAll());
    });
    setJeunes(BreedingService.getJeunes());
    setPontes(BreedingService.getPontes());
  };

  // CAGES MODIFIERS
  const onAddCage = (nom: string, description: string, capacite_max: number) => {
    HabitatRepository.add({ nom, description, capacite_max });
    setCages(HabitatRepository.getAll());
    ActivityLogger.log(EventType.CAGE_ADD, `Ajout de la cage : ${nom}`, { nom });
  };

  const onEditCage = (id: number, nom: string, description: string, capacite_max: number) => {
    HabitatRepository.update({ id, nom, description, capacite_max });
    setCages(HabitatRepository.getAll());
    ActivityLogger.log(EventType.CAGE_EDIT, `Modification de la cage : ${nom}`, { id, nom });
  };

  const onDeleteCage = (id: number): boolean | string => {
    const residentsCount = canaris.filter(bird => bird.cage_id === id).length;
    if (residentsCount > 0) {
      return `Impossible de supprimer cette cage car elle contient encore ${residentsCount} canari${residentsCount > 1 ? 's' : ''}. Veuillez transférer les canaris vers d'autres cages avant de la supprimer.`;
    }
    
    if (cages.length <= 1) {
      return "Impossible de supprimer la dernière cage du système. L'élevage doit posséder au moins une cage.";
    }

    const target = HabitatRepository.getById(id);
    const cageName = target ? target.nom : `${id}`;
    const success = HabitatRepository.delete(id);
    if (success) {
      setCages(HabitatRepository.getAll());
      ActivityLogger.log(EventType.CAGE_DELETE, `Suppression de la cage : ${cageName}`, { id });
      return true;
    }
    return "Cage introuvable.";
  };

  const onTransferCanari = (canariId: number, targetCageId: number) => {
    const bird = BirdRepository.getById(canariId);
    if (bird) {
      bird.cage_id = targetCageId;
      BirdRepository.update(bird);
      setCanaris(BirdRepository.getAll());
      
      const cage = HabitatRepository.getById(targetCageId);
      const cageName = cage ? cage.nom : `${targetCageId}`;
      ActivityLogger.log(
        EventType.BIRD_EDIT,
        `Transfert du canari ${bird.nom} vers la cage ${cageName}`,
        { canariId, targetCageId }
      );
    }
  };

  // SANTE RECORD MODIFIERS
  const onAddSanteRecord = (
    canariId: number, 
    date: string, 
    traitement: string, 
    categorie: Sante['categorie'], 
    description: string, 
    statut: Sante['statut'] = 'Terminé'
  ): true | string => {
    const result = HealthService.addRecord({ canari_id: canariId, date, traitement, categorie, description, statut });
    if (!result.success) return result.message || "Impossible d'enregistrer le soin.";
    setSante(HealthService.getRecords());
    return true;
  };

  const onCompleteSanteRecord = (id: number): true | string => {
    const result = HealthService.completeRecord(id);
    if (!result.success) return result.message || "Impossible de terminer le soin.";
    setSante(HealthService.getRecords());
    return true;
  };

  const onDeleteSanteRecord = (id: number): true | string => {
    const result = HealthService.deleteRecord(id);
    if (!result.success) return result.message || "Impossible de supprimer le soin.";
    setSante(HealthService.getRecords());
    return true;
  };

  // ALIMENTATION PLAN UPDATE
  const onUpdateAlimentation = (id: number, type_aliment: string, quantite: string, planning: string, stock: number) => {
    HandFeedingService.updatePlan(id, type_aliment, quantite, planning, stock);
    setAlimentation(HandFeedingService.getAllPlans());
  };

  // ADD EXPENSE (DEPENSE)
  const onAddDepense = (date: string, montant: number, categorie: Depense['categorie'], description: string): true | string => {
    const result = FinanceService.addExpense(date, montant, categorie, description);
    if (!result.success) return result.message || "Impossible d'enregistrer la dépense.";
    setDepenses(FinanceService.getExpenses());
    return true;
  };

  // ADD SALE (VENTE)
  const onAddVente = (canariId: number, prix: number, date: string, acheteur: string, description: string): true | string => {
    const result = FinanceService.addSale(canariId, prix, date, acheteur, description);
    if (!result.success) return result.message || "Impossible d'enregistrer la vente.";
    setVentes(FinanceService.getSales());
    setCanaris(BirdService.getBirds());
    return true;
  };

  // EXPORT BACKUP
  const onExportBackup = () => {
    const backupData = {
      canaris: BirdRepository.getAll(),
      cages: HabitatRepository.getAll(),
      couples: BreedingRepository.getCouples(),
      reproductions: BreedingRepository.getReproductions(),
      pontes: BreedingRepository.getPontes(),
      jeunes: BreedingRepository.getJeunes(),
      sante: HealthRepository.getAll(),
      alimentation: HandFeedingRepository.getAll(),
      depenses: FinanceRepository.getExpenses(),
      ventes: FinanceRepository.getSales()
    };

    const text = JSON.stringify(backupData, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `elevage_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // IMPORT BACKUP
  const onImportBackup = (backupJson: string): boolean | string => {
    try {
      const data = JSON.parse(backupJson);
      
      if (!data.canaris || !data.cages) {
        return "Le fichier importé n'est pas une sauvegarde valide de Bird Academy.";
      }

      BirdRepository.saveAll(data.canaris);
      HabitatRepository.saveAll(data.cages);
      BreedingRepository.saveCouples(data.couples || []);
      BreedingRepository.saveReproductions(data.reproductions || []);
      BreedingRepository.savePontes(data.pontes || []);
      BreedingRepository.saveJeunes(data.jeunes || []);
      HealthRepository.saveAll(data.sante || []);
      HandFeedingRepository.saveAll(data.alimentation || []);
      FinanceRepository.saveExpenses(data.depenses || []);
      FinanceRepository.saveSales(data.ventes || []);

      // Refresh state
      setCanaris(BirdRepository.getAll());
      setCages(HabitatRepository.getAll());
      setCouples(BreedingRepository.getCouples());
      setReproductions(BreedingRepository.getReproductions());
      setPontes(BreedingRepository.getPontes());
      setJeunes(BreedingRepository.getJeunes());
      setSante(HealthRepository.getAll());
      setAlimentation(HandFeedingRepository.getAll());
      setDepenses(FinanceRepository.getExpenses());
      setVentes(FinanceRepository.getSales());

      ActivityLogger.log(EventType.DB_IMPORT, "Restauration complète de la base de données depuis une sauvegarde", { count: data.canaris.length });
      return true;
    } catch (e) {
      return "Fichier JSON invalide ou illisible.";
    }
  };

  // RESET DATABASE
  const onResetDatabase = (toEmpty: boolean) => {
    if (toEmpty) {
      BirdRepository.saveAll([]);
      HabitatRepository.saveAll(INITIAL_CAGES.slice(0, 2));
      BreedingRepository.saveCouples([]);
      BreedingRepository.saveReproductions([]);
      BreedingRepository.savePontes([]);
      BreedingRepository.saveJeunes([]);
      HealthRepository.saveAll([]);
      HandFeedingRepository.saveAll([]);
      FinanceRepository.saveExpenses([]);
      FinanceRepository.saveSales([]);

      // Refresh state
      setCanaris([]);
      setCages(INITIAL_CAGES.slice(0, 2));
      setCouples([]);
      setReproductions([]);
      setPontes([]);
      setJeunes([]);
      setSante([]);
      setAlimentation([]);
      setDepenses([]);
      setVentes([]);

      ActivityLogger.log(EventType.DB_RESET, "Remise à zéro complète de l'élevage (Base vide)", {});
    } else {
      BirdRepository.saveAll(INITIAL_CANARIS);
      HabitatRepository.saveAll(INITIAL_CAGES);
      BreedingRepository.saveCouples(INITIAL_COUPLES);
      BreedingRepository.saveReproductions(INITIAL_REPRODUCTIONS);
      BreedingRepository.savePontes(INITIAL_PONTES);
      BreedingRepository.saveJeunes(INITIAL_JEUNES);
      HealthRepository.saveAll(INITIAL_SANTE);
      HandFeedingRepository.saveAll(INITIAL_ALIMENTATION);
      FinanceRepository.saveExpenses(INITIAL_DEPENSES);
      FinanceRepository.saveSales(INITIAL_VENTES);

      // Refresh state
      setCanaris(INITIAL_CANARIS);
      setCages(INITIAL_CAGES);
      setCouples(INITIAL_COUPLES);
      setReproductions(INITIAL_REPRODUCTIONS);
      setPontes(INITIAL_PONTES);
      setJeunes(INITIAL_JEUNES);
      setSante(INITIAL_SANTE);
      setAlimentation(INITIAL_ALIMENTATION);
      setDepenses(INITIAL_DEPENSES);
      setVentes(INITIAL_VENTES);

      ActivityLogger.log(EventType.DB_RESET, "Réinitialisation de l'élevage avec les données de démonstration", {});
    }
  };

  // Tabs layout configuration
  const allNavigationItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'canaris', label: t('canaris'), icon: Bird },
    { id: 'couples', label: t('couples'), icon: Heart },
    { id: 'reproduction', label: t('reproduction'), icon: Egg },
    { id: 'cages', label: t('cages'), icon: Grid },
    { id: 'sante', label: t('sante'), icon: Activity },
    { id: 'alimentation', label: t('alimentation'), icon: Wheat },
    { id: 'calendrier', label: t('calendrier'), icon: Calendar },
    { id: 'depenses', label: t('depenses'), icon: TrendingDown },
    { id: 'ventes', label: t('ventes'), icon: TrendingUp },
    { id: 'assistant', label: t('assistant') || 'Assistant IA', icon: Sparkles },
    { id: 'statistiques', label: t('statistiques'), icon: BarChart3 },
    { id: 'intelligence', label: t('intelligence'), icon: BrainCircuit },
    { id: 'genetics', label: t('genetics'), icon: Dna },
    { id: 'reference_biologique', label: t('bioReference'), icon: BookOpen },
    { id: 'parametres', label: t('parametres'), icon: Settings },
    { id: 'demo_shortcut', label: t('demoSandbox'), icon: Sparkles },
  ];

  const navigationItems = allNavigationItems;

  if (licenseState === 'INITIALIZING' || licenseState === 'LICENSE_CHECKING') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center gap-4">
        <AppIcon className="w-16 h-16 animate-pulse" variant="glow" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Vérification de la licence en cours...</span>
      </div>
    );
  }

  if (licenseState === 'LICENSE_REQUIRED' || licenseState === 'LICENSE_INVALID' || licenseState !== 'LICENSE_VALID') {
    return (
      <FirstLaunchActivationScreen
        onActivationSuccess={() => {
          refreshLicensing();
        }}
      />
    );
  }

  return (
    <div className={`h-screen max-h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#030712] flex flex-col lg:flex-row antialiased ${isRtl ? 'rtl' : 'ltr'}`}>
      <a
        href="#main-content"
        className="fixed top-2 start-2 z-[100] -translate-y-20 focus:translate-y-0 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-transform shadow-md"
      >
        {t('skipToContent')}
      </a>
      
      {/* Mobile Top Header Navigation */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <AppLogo size="sm" variant="dark" sublineText="AVIAN ERP" />
        
        <div className="flex items-center gap-3">
          <LanguageSelector variant="dark" />
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-200 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl cursor-pointer"
            aria-label={mobileMenuOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar Navigation (lg:flex) */}
      <DesktopSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenActivationModal={() => setIsActivationModalOpen(true)}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
      />

      {/* Mobile Drawer Navigation (Slide-in drawer with backdrop overlay) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className={`fixed inset-0 z-50 lg:hidden flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
            {/* Dark Backdrop Overlay */}
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out Drawer Panel */}
            <motion.aside
              ref={mobileDrawerRef}
              id="mobile-navigation-drawer"
              variants={isRtl ? MOTION_VARIANTS.drawerRight : MOTION_VARIANTS.drawerLeft}
              initial="initial"
              animate="animate"
              exit="exit"
              className={`relative w-72 max-w-[80vw] bg-slate-900 text-slate-300 h-full flex flex-col justify-between shadow-2xl z-10 ${isRtl ? 'border-l' : 'border-r'} border-slate-800`}
              role="dialog"
              aria-modal="true"
              aria-label={t('navigation')}
            >
              <div className="p-5 flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Header branding */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-4 gap-2">
                  <AppLogo size="md" variant="dark" sublineText={t('appTagline') || 'AVIAN ERP'} />
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label={t('closeMenu')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Language Selector Widget */}
                <div className="mb-4">
                  <LanguageSelector variant="dark" />
                </div>

                {/* Navigation Items */}
                <nav className="space-y-1 overflow-y-auto flex-1 pr-1 scrollbar-thin" aria-label={t('navigation')}>
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-start cursor-pointer group min-h-[44px]
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 font-bold' 
                            : 'hover:bg-slate-800 hover:text-white text-slate-300'
                          }
                        `}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Footer */}
              <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 text-center text-[10px] text-slate-400 font-medium">
                <span>Bird Academy Enterprise</span>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>


      {/* Main Content & Desktop Top Bar Wrapper */}
      <div className="flex-1 flex flex-col h-full min-w-0 max-w-full overflow-hidden">
        <DesktopTopBar
          currentTab={currentTab}
          onOpenActivationModal={() => setIsActivationModalOpen(true)}
          onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        />

        {/* Main Content Area */}
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto min-h-0 p-4 md:p-6 lg:p-8 w-full max-w-[1850px] mx-auto min-w-0">
        {/* Render Active Tab Component */}
        <AppPage>
          <ChunkLoadErrorBoundary
            resetKey={currentTab}
            title={t('appUpdateRequired')}
            message={t('appUpdateMessage')}
            reloadLabel={t('reloadApplication')}
          >
          <Suspense fallback={<AppSkeleton height={180} count={3} />}>
          {(() => {
          switch (currentTab) {
            case 'dashboard':
              return (
                <Dashboard 
                  canaris={canaris}
                  cages={cages}
                  couples={couples}
                  reproductions={reproductions}
                  pontes={pontes}
                  sante={sante}
                  depenses={depenses}
                  ventes={ventes}
                  setCurrentTab={setCurrentTab}
                  onCompleteSanteRecord={onCompleteSanteRecord}
                  onQuickAddCanari={() => {
                    setQuickAddCanariOpen(true);
                    setCurrentTab('canaris');
                  }}
                  onQuickAddCouple={() => {
                    setQuickAddCoupleOpen(true);
                    setCurrentTab('couples');
                  }}
                  onQuickAddDepense={() => {
                    setQuickAddDepenseOpen(true);
                    setCurrentTab('depenses');
                  }}
                />
              );
            case 'canaris':
              return (
                <Canaris 
                  canaris={canaris}
                  cages={cages}
                  onAddCanari={onAddCanari}
                  onEditCanari={onEditCanari}
                  onDeleteCanari={onDeleteCanari}
                  onBirdsChanged={refreshCanaris}
                  quickAddOpen={quickAddCanariOpen}
                  setQuickAddOpen={setQuickAddCanariOpen}
                  setCurrentTab={setCurrentTab}
                  onNavigateToSimulator={() => setCurrentTab('genetics')}
                />
              );
            case 'couples':
              return (
                <ComponentErrorBoundary moduleName="Couples">
                  <Couples couples={couples} canaris={canaris} reproductions={reproductions} onAddCouple={onAddCouple} onDissolveCouple={onDissolveCouple} onStartReproduction={onStartReproduction} quickAddOpen={quickAddCoupleOpen} setQuickAddOpen={setQuickAddCoupleOpen} />
                </ComponentErrorBoundary>
              );
            case 'reproduction':
              return (
                <ReproductionComponent 
                  reproductions={reproductions}
                  couples={couples}
                  canaris={canaris}
                  pontes={pontes}
                  jeunes={jeunes}
                  onAddPonte={onAddPonte}
                  onUpdatePonteStats={onUpdatePonteStats}
                  onCloseReproduction={onCloseReproduction}
                  onAddJeune={onAddJeune}
                  onWeanJeuneToCanari={onWeanJeuneToCanari}
                  cagesList={cages.map(c => ({ id: c.id, nom: c.nom }))}
                />
              );
            case 'cages':
              return (
                <ComponentErrorBoundary moduleName="Cages & Habitat">
                  <HabitatComponent canaris={canaris} cages={cages} />
                </ComponentErrorBoundary>
              );
            case 'sante':
              return (
                <SanteComponent 
                  sante={sante}
                  canaris={canaris}
                  onAddSanteRecord={onAddSanteRecord}
                  onCompleteSanteRecord={onCompleteSanteRecord}
                  onDeleteSanteRecord={onDeleteSanteRecord}
                />
              );
            case 'alimentation':
              return (
                <AlimentationComponent 
                  alimentation={alimentation}
                  onUpdateAlimentation={onUpdateAlimentation}
                />
              );
            case 'calendrier':
              return (
                <CalendrierComponent 
                  pontes={pontes}
                  sante={sante}
                  canaris={canaris}
                  couples={couples}
                  reproductions={reproductions}
                />
              );
            case 'depenses':
              return (
                <Depenses 
                  depenses={depenses}
                  onAddDepense={onAddDepense}
                  quickAddOpen={quickAddDepenseOpen}
                  setQuickAddOpen={setQuickAddDepenseOpen}
                />
              );
            case 'ventes':
              return (
                <Ventes 
                  ventes={ventes}
                  canaris={canaris}
                  onAddVente={onAddVente}
                />
              );
            case 'statistiques':
              return (
                <AnalyticsDashboard />
              );
            case 'assistant':
              return (
                <ComponentErrorBoundary moduleName="Assistant IA">
                  <AssistantView />
                </ComponentErrorBoundary>
              );
            case 'intelligence':
              if (!hasCapability('INTELLIGENCE_FULL_ENGINE')) {
                return (
                  <div className="max-w-4xl mx-auto px-4 py-8">
                    <FeatureLockedCard
                      featureTitle={t('intelligence') || 'Bird Intelligence'}
                      requiredTier="PRO"
                      onUpgrade={() => setIsUpgradeModalOpen(true)}
                    />
                  </div>
                );
              }
              return (
                <IntelligenceDashboard />
              );
            case 'genetics':
              return (
                <GeneticsDashboard />
              );
            case 'reference_biologique':
              return (
                <ReferenceBiologique />
              );
            case 'demo_shortcut':
              return (
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <DemoModeTab />
                </div>
              );
            case 'parametres':
              return (
                <Parametres 
                  onExportBackup={onExportBackup}
                  onImportBackup={onImportBackup}
                  onResetDatabase={onResetDatabase}
                  setCurrentTab={setCurrentTab}
                />
              );
            default:
              return <div className="text-slate-500 font-semibold">Module non trouvé</div>;
          }
        })()}
          </Suspense>
          </ChunkLoadErrorBoundary>
        </AppPage>
      </main>
      </div>

      {/* Welcome Onboarding Wizard Modal */}
      {showWizard && (
        <Suspense fallback={null}>
          <WelcomeWizard 
            isOpen={showWizard}
            onClose={() => setShowWizard(false)} 
            onComplete={() => {
              const cachedCanaris = BirdRepository.getAll();
              setCanaris(cachedCanaris);
              const cachedCages = HabitatRepository.getAllLegacy();
              setCages(cachedCages);
            }} 
          />
        </Suspense>
      )}

      {/* LMSE License Activation Modal */}
      <LicenseActivationModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
      />

      {/* Commercial Subscription Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onOpenActivation={() => setIsActivationModalOpen(true)}
      />
    </div>
  );
}
