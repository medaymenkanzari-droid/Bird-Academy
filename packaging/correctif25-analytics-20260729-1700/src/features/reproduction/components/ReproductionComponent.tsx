/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Heart, Plus, Search, HeartCrack, Check, X, ShieldAlert, History, 
  ArrowRight, User, Info, Star, Archive, RotateCcw, AlertTriangle, Trash2, Calendar
} from 'lucide-react';
import { Canari } from '../../../types';
import { BreedingPair, PairHistory, CompatibilityResult, PairStatus } from '../types';
import { ReproductionService } from '../services/ReproductionService';
import { ReproductionEngine } from '../engines/ReproductionEngine';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { useLanguage } from '../../../context/LanguageContext';
import { REPRODUCTION_TRANSLATIONS } from '../utils/translations';
import { 
  AppCard, AppButton, AppBadge, AppInput, AppSelect, 
  AppModal, AppTable, AppEmptyState, AppAlert 
} from '../../../components/design-system';
import ReproductionDashboard from './ReproductionDashboard';
import BiologicalLifecycleManager from '../clutches/components/BiologicalLifecycleManager';
import NurseryDashboard from '../nursery/components/NurseryDashboard';

export default function ReproductionComponent() {
  const { language, isRtl } = useLanguage();

  // Local helper for translating
  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    const dict = REPRODUCTION_TRANSLATIONS[language] || REPRODUCTION_TRANSLATIONS['fr'];
    let text = dict[key] || REPRODUCTION_TRANSLATIONS['fr'][key] || String(key);

    if (variables) {
      Object.entries(variables).forEach(([k, val]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(val));
      });
    }
    return text;
  }, [language]);

  // --- STATE ---
  const [mainTab, setMainTab] = useState<'couples' | 'dashboard' | 'nursery'>('dashboard');
  const [leftSubTab, setLeftSubTab] = useState<'couples' | 'biological'>('couples');
  const [pairs, setPairs] = useState<BreedingPair[]>(() => ReproductionService.getPairs(true));
  const [selectedPairId, setSelectedPairId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PairStatus>('all');
  
  // Wizard State
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMaleId, setSelectedMaleId] = useState<number | null>(null);
  const [selectedFemaleId, setSelectedFemaleId] = useState<number | null>(null);
  const [pairName, setPairName] = useState('');
  const [pairNotes, setPairNotes] = useState('');

  // --- REFRESH DATA ---
  const refreshPairs = useCallback(() => {
    setPairs(ReproductionService.getPairs(true));
  }, []);

  // --- BIRDS DATA ---
  const allBirds = useMemo(() => BirdRepository.getAll(), []);
  
  const males = useMemo(() => {
    return allBirds.filter(b => b.sexe === 'Mâle');
  }, [allBirds]);

  const females = useMemo(() => {
    return allBirds.filter(b => b.sexe === 'Femelle');
  }, [allBirds]);

  // Free birds for creation (not in an active couple)
  const activePairs = useMemo(() => {
    return pairs.filter(p => p.status === 'active' && !p.archived);
  }, [pairs]);

  const freeMales = useMemo(() => {
    return males.filter(m => !activePairs.some(p => p.maleId === m.id));
  }, [males, activePairs]);

  const freeFemales = useMemo(() => {
    return females.filter(f => !activePairs.some(p => p.femaleId === f.id));
  }, [females, activePairs]);

  // --- COMPATIBILITY CALCULATION FOR WIZARD ---
  const wizardCompatibility: CompatibilityResult | null = useMemo(() => {
    if (selectedMaleId !== null && selectedFemaleId !== null) {
      return ReproductionService.getCompatibility(selectedMaleId, selectedFemaleId, t);
    }
    return null;
  }, [selectedMaleId, selectedFemaleId, t]);

  // --- FILTERED PAIRS ---
  const filteredPairs = useMemo(() => {
    let result = pairs;

    // Filter by archived status
    if (statusFilter === 'archived') {
      result = result.filter(p => !!p.archived);
    } else {
      result = result.filter(p => !p.archived);
      if (statusFilter !== 'all') {
        result = result.filter(p => p.status === statusFilter);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const customName = p.name ? p.name.toLowerCase() : '';
        const idMatch = p.id.toLowerCase().includes(q);
        
        // Lookup bird names or rings
        const maleBird = allBirds.find(b => b.id === p.maleId);
        const femaleBird = allBirds.find(b => b.id === p.femaleId);
        
        const maleMatch = maleBird ? (maleBird.nom.toLowerCase().includes(q) || maleBird.bague.toLowerCase().includes(q)) : false;
        const femaleMatch = femaleBird ? (femaleBird.nom.toLowerCase().includes(q) || femaleBird.bague.toLowerCase().includes(q)) : false;

        return customName.includes(q) || idMatch || maleMatch || femaleMatch;
      });
    }

    return result;
  }, [pairs, statusFilter, searchQuery, allBirds]);

  // --- CURRENT SELECTED PAIR DETAILS ---
  const selectedPair = useMemo(() => {
    if (!selectedPairId) return null;
    return pairs.find(p => p.id === selectedPairId) || null;
  }, [pairs, selectedPairId]);

  const selectedPairHistory = useMemo(() => {
    if (!selectedPairId) return [];
    return ReproductionService.getPairHistory(selectedPairId);
  }, [selectedPairId]);

  const selectedPairStats = useMemo(() => {
    if (!selectedPairId) return null;
    return ReproductionService.getPairStatistics(selectedPairId);
  }, [selectedPairId]);

  // --- AGGREGATE SYSTEM STATS ---
  const statsSummary = useMemo(() => {
    const nonArchived = pairs.filter(p => !p.archived);
    const active = nonArchived.filter(p => p.status === 'active');
    
    // Average compatibility score of non-archived couples
    let totalScore = 0;
    let countedScores = 0;
    nonArchived.forEach(p => {
      const maleBird = allBirds.find(b => b.id === p.maleId);
      const femaleBird = allBirds.find(b => b.id === p.femaleId);
      if (maleBird && femaleBird) {
        const comp = ReproductionEngine.getCompatibility(maleBird, femaleBird, [], t);
        totalScore += comp.score;
        countedScores++;
      }
    });
    const avgScore = countedScores > 0 ? (totalScore / countedScores).toFixed(1) : "0.0";

    // Global successes
    let eggs = 0;
    let weaned = 0;
    nonArchived.forEach(p => {
      const s = ReproductionService.getPairStatistics(p.id);
      eggs += s.totalEggs;
      weaned += s.weanedChicks;
    });
    const successRate = eggs > 0 ? Math.round((weaned / eggs) * 100) : 0;

    return {
      total: nonArchived.length,
      active: active.length,
      avgCompatibility: avgScore,
      globalSuccessRate: successRate
    };
  }, [pairs, allBirds, t]);

  // --- OPERATIONS ---
  const handleCreatePair = useCallback(() => {
    if (selectedMaleId === null || selectedFemaleId === null) return;
    
    try {
      const created = ReproductionService.createPair(selectedMaleId, selectedFemaleId, pairName, pairNotes);
      refreshPairs();
      setSelectedPairId(created.id);
      
      // Reset Wizard
      setIsWizardOpen(false);
      setWizardStep(1);
      setSelectedMaleId(null);
      setSelectedFemaleId(null);
      setPairName('');
      setPairNotes('');
    } catch (e: any) {
      alert(e.message || "Erreur de création.");
    }
  }, [selectedMaleId, selectedFemaleId, pairName, pairNotes, refreshPairs]);

  const handleDissolvePair = useCallback((id: string) => {
    if (confirm(t('dissolveConfirm'))) {
      ReproductionService.dissolvePair(id);
      refreshPairs();
    }
  }, [refreshPairs, t]);

  const handleReactivatePair = useCallback((id: string) => {
    try {
      ReproductionService.reactivatePair(id);
      refreshPairs();
    } catch (e: any) {
      alert(e.message || "Erreur lors de la réactivation.");
    }
  }, [refreshPairs]);

  const handleArchivePair = useCallback((id: string) => {
    ReproductionService.archivePair(id);
    refreshPairs();
  }, [refreshPairs]);

  const handleRestorePair = useCallback((id: string) => {
    try {
      ReproductionService.restorePair(id);
      refreshPairs();
    } catch (e: any) {
      alert(e.message || "Erreur lors de la restauration.");
    }
  }, [refreshPairs]);

  // --- WIZARD NAVIGATION HANDLERS ---
  const nextWizardStep = useCallback(() => {
    if (wizardStep === 1 && selectedMaleId === null) return;
    if (wizardStep === 2 && selectedFemaleId === null) return;
    
    if (wizardStep === 3) {
      // Pre-fill default name
      const mBird = allBirds.find(b => b.id === selectedMaleId);
      const fBird = allBirds.find(b => b.id === selectedFemaleId);
      const mName = mBird ? (mBird.nom || mBird.bague) : `#${selectedMaleId}`;
      const fName = fBird ? (fBird.nom || fBird.bague) : `#${selectedFemaleId}`;
      setPairName(`Couple ${mName} x ${fName}`);
      setWizardStep(4);
    } else {
      setWizardStep((prev) => (prev + 1) as any);
    }
  }, [wizardStep, selectedMaleId, selectedFemaleId, allBirds]);

  const prevWizardStep = useCallback(() => {
    setWizardStep((prev) => (prev - 1) as any);
  }, []);

  // --- RENDER HEADING COMPATIBILITY STARS ---
  const renderStars = (score: number, className = "w-4 h-4") => {
    return (
      <div className="flex items-center gap-0.5 text-amber-500">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star 
            key={s} 
            className={`${className} ${s <= score ? 'fill-current' : 'text-slate-200'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header section with title and button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800">
            {t('couplesTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            {t('couplesSub')}
          </p>
        </div>
        <AppButton 
          variant="primary" 
          onClick={() => {
            setWizardStep(1);
            setSelectedMaleId(null);
            setSelectedFemaleId(null);
            setPairName('');
            setPairNotes('');
            setIsWizardOpen(true);
          }}
          className="flex items-center gap-2 cursor-pointer py-2 px-4 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('formCoupleButton')}</span>
        </AppButton>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-100/80">
        <button
          onClick={() => setMainTab('dashboard')}
          className={`pb-3 text-xs font-bold border-b-2 px-6 transition-all ${
            mainTab === 'dashboard' 
              ? 'border-amber-500 text-amber-600 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Performance & Alertes
        </button>
        <button
          onClick={() => setMainTab('couples')}
          className={`pb-3 text-xs font-bold border-b-2 px-6 transition-all ${
            mainTab === 'couples' 
              ? 'border-amber-500 text-amber-600 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Gestion des Couples de Reproducteurs V2
        </button>
        <button
          onClick={() => setMainTab('nursery')}
          className={`pb-3 text-xs font-bold border-b-2 px-6 transition-all ${
            mainTab === 'nursery' 
              ? 'border-amber-500 text-amber-600 font-extrabold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Nurserie & Élevage Manuel
        </button>
      </div>

      {mainTab === 'dashboard' ? (
        <ReproductionDashboard onSelectCouple={(pairId) => { setSelectedPairId(pairId); setMainTab('couples'); setLeftSubTab('biological'); }} />
      ) : mainTab === 'nursery' ? (
        <NurseryDashboard />
      ) : (
        <>
          {/* Statistics dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AppCard padding="sm" className="bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <History className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{t('couplesListTitle')}</p>
              <h4 className="text-lg font-extrabold text-slate-800">{statsSummary.total}</h4>
            </div>
          </div>
        </AppCard>

        <AppCard padding="sm" className="bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{t('statusActive')}</p>
              <h4 className="text-lg font-extrabold text-slate-800">{statsSummary.active}</h4>
            </div>
          </div>
        </AppCard>

        <AppCard padding="sm" className="bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{t('compatibilityScore')}</p>
              <h4 className="text-lg font-extrabold text-slate-800">{statsSummary.avgCompatibility} ★</h4>
            </div>
          </div>
        </AppCard>

        <AppCard padding="sm" className="bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">{t('statSuccessRate')}</p>
              <h4 className="text-lg font-extrabold text-slate-800">{statsSummary.globalSuccessRate}%</h4>
            </div>
          </div>
        </AppCard>
      </div>

      {/* Main Grid: Filters & Lists on Left, Fiche Couple on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col: Lists, Filters & Search */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Sub Tabs for Left Col if couple selected */}
          {selectedPairId && (
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setLeftSubTab('couples')}
                className={`pb-2.5 text-xs font-bold border-b-2 px-5 transition-all ${
                  leftSubTab === 'couples' 
                    ? 'border-amber-500 text-amber-600 font-extrabold' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Liste des Couples
              </button>
              <button
                onClick={() => setLeftSubTab('biological')}
                className={`pb-2.5 text-xs font-bold border-b-2 px-5 transition-all ${
                  leftSubTab === 'biological' 
                    ? 'border-amber-500 text-amber-600 font-extrabold' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Suivi Biologique (Pontes & Incubations)
              </button>
            </div>
          )}

          {(!selectedPairId || leftSubTab === 'couples') ? (
            <>
              {/* Controls Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
            
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters Tabs */}
            <div className="flex gap-1.5 p-1 bg-slate-50 rounded-lg w-full sm:w-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  statusFilter === 'active'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('statusActive')}
              </button>
              <button
                onClick={() => setStatusFilter('separated')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  statusFilter === 'separated'
                    ? 'bg-white text-amber-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('statusSeparated')}
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                  statusFilter === 'archived'
                    ? 'bg-white text-slate-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t('statusArchived')}
              </button>
            </div>
          </div>

          {/* TABLEVIEW - DESKTOP */}
          <div className="hidden md:block">
            <AppTable<BreedingPair>
              data={filteredPairs}
              keyExtractor={(p) => p.id}
              hoverable={true}
              selectedRowId={selectedPairId || undefined}
              onRowClick={(row) => setSelectedPairId(row.id)}
              onClearSelection={() => setSelectedPairId(null)}
              emptyState={
                <AppEmptyState
                  title={t('noCoupleFormed')}
                  description={t('noCoupleFormedDesc')}
                />
              }
              columns={[
                {
                  key: 'id',
                  header: 'ID / Nom',
                  render: (p) => {
                    return (
                      <div>
                        <span className="block font-bold text-slate-700">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">#{p.id}</span>
                      </div>
                    );
                  }
                },
                {
                  key: 'male',
                  header: '♂ Mâle',
                  render: (p) => {
                    const bird = allBirds.find(b => b.id === p.maleId);
                    return bird ? (
                      <div>
                        <span className="block text-slate-700 font-bold">{bird.nom || bird.bague}</span>
                        <span className="text-xs text-slate-400">{bird.race}</span>
                      </div>
                    ) : <span className="text-slate-400">{t('unknownMale')}</span>;
                  }
                },
                {
                  key: 'female',
                  header: '♀ Femelle',
                  render: (p) => {
                    const bird = allBirds.find(b => b.id === p.femaleId);
                    return bird ? (
                      <div>
                        <span className="block text-slate-700 font-bold">{bird.nom || bird.bague}</span>
                        <span className="text-xs text-slate-400">{bird.race}</span>
                      </div>
                    ) : <span className="text-slate-400">{t('unknownFemale')}</span>;
                  }
                },
                {
                  key: 'compatibility',
                  header: 'Compatibilité',
                  render: (p) => {
                    const maleBird = allBirds.find(b => b.id === p.maleId);
                    const femaleBird = allBirds.find(b => b.id === p.femaleId);
                    if (maleBird && femaleBird) {
                      const comp = ReproductionEngine.getCompatibility(maleBird, femaleBird, [], t);
                      return renderStars(comp.score);
                    }
                    return renderStars(3);
                  }
                },
                {
                  key: 'status',
                  header: 'Statut',
                  render: (p) => {
                    if (p.archived) {
                      return <AppBadge variant="text" className="bg-slate-100 text-slate-600 border-slate-200">{t('statusArchived')}</AppBadge>;
                    }
                    if (p.status === 'active') {
                      return <AppBadge variant="success" size="sm">{t('statusActive')}</AppBadge>;
                    }
                    return <AppBadge variant="warning" size="sm">{t('statusSeparated')}</AppBadge>;
                  }
                }
              ]}
            />
          </div>

          {/* CARDVIEW - MOBILE */}
          <div className="block md:hidden space-y-3">
            {filteredPairs.length === 0 ? (
              <AppEmptyState
                title={t('noCoupleFormed')}
                description={t('noCoupleFormedDesc')}
              />
            ) : (
              filteredPairs.map((p) => {
                const maleBird = allBirds.find(b => b.id === p.maleId);
                const femaleBird = allBirds.find(b => b.id === p.femaleId);
                const comp = (maleBird && femaleBird) ? ReproductionEngine.getCompatibility(maleBird, femaleBird, [], t) : { score: 3 };
                const isSelected = p.id === selectedPairId;

                return (
                  <AppCard 
                    key={p.id} 
                    padding="md"
                    borderColor={isSelected ? 'border-amber-400 ring-1 ring-amber-400' : 'border-slate-100'}
                    onClick={() => setSelectedPairId(p.id)}
                    className="relative cursor-pointer hover:border-slate-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">#{p.id}</span>
                      </div>
                      {p.archived ? (
                        <AppBadge variant="text" size="sm" className="bg-slate-100 text-slate-600">{t('statusArchived')}</AppBadge>
                      ) : p.status === 'active' ? (
                        <AppBadge variant="success" size="sm">{t('statusActive')}</AppBadge>
                      ) : (
                        <AppBadge variant="warning" size="sm">{t('statusSeparated')}</AppBadge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3 border-b border-slate-50 pb-2.5">
                      <div>
                        <span className="text-slate-400 block">{t('maleLabel')}</span>
                        <span className="font-semibold text-slate-800">{maleBird ? (maleBird.nom || maleBird.bague) : t('unknownMale')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{t('femaleLabel')}</span>
                        <span className="font-semibold text-slate-800">{femaleBird ? (femaleBird.nom || femaleBird.bague) : t('unknownFemale')}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{t('formedOnLabel')} {p.dateCreated}</span>
                      {renderStars(comp.score, "w-3.5 h-3.5")}
                    </div>
                  </AppCard>
                );
              })
            )}
          </div>
          </>
          ) : (
            <BiologicalLifecycleManager pairId={selectedPairId} />
          )}
        </div>

        {/* Right Col: Couple Card Detail view ("Fiche Couple moderne") */}
        <div className="xl:col-span-1">
          {selectedPair ? (
            <div className="space-y-4">
              
              {/* Couple Identification Panel */}
              <AppCard 
                title={selectedPair.name}
                subtitle={`ID: ${selectedPair.id}`}
                extra={
                  selectedPair.archived ? (
                    <AppBadge variant="outline" className="bg-slate-100 text-slate-600">{t('statusArchived')}</AppBadge>
                  ) : selectedPair.status === 'active' ? (
                    <AppBadge variant="success">{t('statusActive')}</AppBadge>
                  ) : (
                    <AppBadge variant="warning">{t('statusSeparated')}</AppBadge>
                  )
                }
              >
                
                {/* Partners Profiles */}
                <div className="space-y-3.5 pb-4 border-b border-slate-100">
                  
                  {/* Male profile summary */}
                  {(() => {
                    const bird = allBirds.find(b => b.id === selectedPair.maleId);
                    return bird ? (
                      <div className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50">
                        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold shrink-0">
                          ♂
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider">{t('maleLabel')}</span>
                          <span className="block text-sm font-bold text-slate-800 truncate">{bird.nom || bird.bague}</span>
                          <span className="block text-xs text-slate-500 truncate">{bird.race} • {ReproductionEngine.calculateAgeInMonths(bird.date_naissance)} mois</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs italic">{t('unknownMale')}</div>
                    );
                  })()}

                  {/* Female profile summary */}
                  {(() => {
                    const bird = allBirds.find(b => b.id === selectedPair.femaleId);
                    return bird ? (
                      <div className="flex items-center gap-3 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50">
                        <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 font-bold shrink-0">
                          ♀
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider">{t('femaleLabel')}</span>
                          <span className="block text-sm font-bold text-slate-800 truncate">{bird.nom || bird.bague}</span>
                          <span className="block text-xs text-slate-500 truncate">{bird.race} • {ReproductionEngine.calculateAgeInMonths(bird.date_naissance)} mois</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-400 text-xs italic">{t('unknownFemale')}</div>
                    );
                  })()}

                </div>

                {/* Compatibility Stars */}
                {(() => {
                  const mBird = allBirds.find(b => b.id === selectedPair.maleId);
                  const fBird = allBirds.find(b => b.id === selectedPair.femaleId);
                  if (mBird && fBird) {
                    const comp = ReproductionEngine.getCompatibility(mBird, fBird, [], t);
                    return (
                      <div className="py-4 border-b border-slate-100 space-y-1.5">
                        <h5 className="text-[11px] uppercase font-extrabold tracking-wider text-slate-500">
                          {t('compatibilityScore')}
                        </h5>
                        <div className="flex items-center justify-between">
                          {renderStars(comp.score, "w-4.5 h-4.5")}
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                            {comp.score} / 5
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Couple metadata dates */}
                <div className="py-4 border-b border-slate-100 grid grid-cols-2 gap-3 text-xs text-slate-600">
                  <div>
                    <span className="block text-slate-400">{t('formedOnLabel')}</span>
                    <span className="font-bold text-slate-700">{selectedPair.dateCreated}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">{t('repro_pair_seniority', { defaultValue: "Ancienneté" })}</span>
                    <span className="font-bold text-slate-700">
                      {ReproductionEngine.calculatePairSeniority(selectedPair.dateCreated, selectedPair.dateSeparated, t)}
                    </span>
                  </div>
                </div>

                {/* Micro Statistics overview */}
                {selectedPairStats && (
                  <div className="py-4 border-b border-slate-100 space-y-2">
                    <h5 className="text-[11px] uppercase font-extrabold tracking-wider text-slate-500">
                      {t('statsTitle')}
                    </h5>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="block text-[10px] text-slate-400">{t('statCycles')}</span>
                        <span className="block text-sm font-black text-slate-700">{selectedPairStats.reproductionsCount}</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="block text-[10px] text-slate-400">{t('statEggs')}</span>
                        <span className="block text-sm font-black text-slate-700">{selectedPairStats.totalEggs}</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="block text-[10px] text-slate-400">{t('statWeaned')}</span>
                        <span className="block text-sm font-black text-slate-700">{selectedPairStats.weanedChicks}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons Panel */}
                <div className="pt-4 flex flex-wrap gap-2">
                  {!selectedPair.archived ? (
                    <>
                      {selectedPair.status === 'active' ? (
                        <AppButton
                          variant="outline"
                          onClick={() => handleDissolvePair(selectedPair.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 cursor-pointer py-1.5 border-amber-200/50"
                        >
                          <HeartCrack className="w-3.5 h-3.5" />
                          <span>{t('actionSeparate')}</span>
                        </AppButton>
                      ) : (
                        <AppButton
                          variant="success"
                          onClick={() => handleReactivatePair(selectedPair.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs cursor-pointer py-1.5"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span>{t('actionReactivate')}</span>
                        </AppButton>
                      )}
                      
                      <AppButton
                        variant="text"
                        onClick={() => handleArchivePair(selectedPair.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs hover:bg-slate-50 hover:text-slate-700 text-slate-500 cursor-pointer py-1.5"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>{t('actionArchive')}</span>
                      </AppButton>
                    </>
                  ) : (
                    <AppButton
                      variant="outline"
                      onClick={() => handleRestorePair(selectedPair.id)}
                      className="w-full flex items-center justify-center gap-1.5 text-xs cursor-pointer py-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('actionRestore')}</span>
                    </AppButton>
                  )}
                </div>

              </AppCard>

              {/* TIMELINE - HISTORIC EVENTS (Part 10) */}
              <AppCard title={t('pairHistoryTitle')} padding="md">
                {selectedPairHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">{t('historyNoEvents')}</p>
                ) : (
                  <div className="relative border-l border-slate-100 pl-4 py-2 space-y-4">
                    {selectedPairHistory.map((h) => (
                      <div key={h.id} className="relative">
                        {/* Circle Bullet icon marker */}
                        <span className="absolute -left-[21px] top-1 bg-white p-0.5 rounded-full ring-1 ring-slate-100 text-slate-500">
                          <span className="block w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                        </span>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {new Date(h.timestamp).toLocaleDateString(language, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="block text-xs font-bold text-slate-700">
                            {t(`history_${h.type}`) || h.description}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {h.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AppCard>

            </div>
          ) : (
            <AppCard padding="lg" className="border-dashed bg-slate-50/50 text-center py-12">
              <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-600 text-sm">{t('placeholderTitle', { defaultValue: "Détails d'un couple" })}</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {t('placeholderDesc', { defaultValue: "Sélectionnez un couple dans la liste pour voir l'historique complet de ses cycles de reproduction, ses descendants ou y associer un nid." })}
              </p>
            </AppCard>
          )}
        </div>

      </div>
      </>
      )}

      {/* PAIRING ASSISTANT MODAL (WIZARD - Parts 6, 7 & 8) */}
      <AppModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title={t('formCoupleTitle')}
        size="lg"
      >
        <div className="space-y-6 font-sans">
          
          {/* Steps Progress Header indicators */}
          <div className="grid grid-cols-4 gap-2 border-b border-slate-100 pb-4">
            {[1, 2, 3, 4].map((step) => {
              const isActive = wizardStep === step;
              const isPassed = wizardStep > step;
              let label = '';
              if (step === 1) label = t('stepMale');
              if (step === 2) label = t('stepFemale');
              if (step === 3) label = t('stepSummary');
              if (step === 4) label = t('stepValidation');

              return (
                <div 
                  key={step} 
                  className={`text-center pb-2 border-b-2 transition-all ${
                    isActive 
                      ? 'border-amber-500 text-amber-600 font-extrabold' 
                      : isPassed 
                        ? 'border-slate-300 text-slate-600 font-bold' 
                        : 'border-transparent text-slate-400'
                  }`}
                >
                  <span className="block text-[10px] uppercase font-mono tracking-wider">Étape {step}</span>
                  <span className="block text-xs truncate mt-0.5">{label}</span>
                </div>
              );
            })}
          </div>

          {/* STEP 1: SELECT MALE */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700">{t('chooseMaleOption')}</h3>
              
              {freeMales.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t('noMaleAvailable')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {freeMales.map((m) => {
                    const isSelected = selectedMaleId === m.id;
                    const age = ReproductionEngine.calculateAgeInMonths(m.date_naissance);
                    const isReady = age >= 10;

                    return (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMaleId(m.id)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500/20' 
                            : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0">
                          ♂
                        </div>
                        <div className="min-w-0 flex-1 text-xs">
                          <span className="block font-bold text-slate-800 truncate">{m.nom || m.bague}</span>
                          <span className="block text-slate-400 truncate">{m.race} • {age}m</span>
                          {!isReady && (
                            <span className="inline-block text-[9px] font-black text-rose-500 mt-0.5">
                              ⚠️ Trop jeune ({age}/10 mois)
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SELECT FEMALE */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-700">{t('chooseFemaleOption')}</h3>
              
              {freeFemales.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{t('noFemaleAvailable')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {freeFemales.map((f) => {
                    const isSelected = selectedFemaleId === f.id;
                    const age = ReproductionEngine.calculateAgeInMonths(f.date_naissance);
                    const isReady = age >= 9;

                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFemaleId(f.id)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected 
                            ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500/20' 
                            : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center font-bold text-xs shrink-0">
                          ♀
                        </div>
                        <div className="min-w-0 flex-1 text-xs">
                          <span className="block font-bold text-slate-800 truncate">{f.nom || f.bague}</span>
                          <span className="block text-slate-400 truncate">{f.race} • {age}m</span>
                          {!isReady && (
                            <span className="inline-block text-[9px] font-black text-rose-500 mt-0.5">
                              ⚠️ Trop jeune ({age}/9 mois)
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: SUMMARY & SCIENTIFIC ANALYTICS */}
          {wizardStep === 3 && wizardCompatibility && (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              
              {/* Stars rating banner */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">{t('compatibilityScore')}</span>
                  {renderStars(wizardCompatibility.score, "w-6 h-6 mt-1")}
                </div>
                <span className="text-lg font-black text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                  {wizardCompatibility.score} / 5
                </span>
              </div>

              {/* Checklist checkpoints points */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>{t('scientificChecks')}</span>
                </h4>
                <div className="space-y-1.5">
                  {wizardCompatibility.validations.map((v, idx) => {
                    let alertBg = 'bg-slate-50 text-slate-700 border-slate-100';
                    let Icon = Check;
                    let iconColor = 'text-green-500';

                    if (!v.passed) {
                      if (v.type === 'risk') {
                        alertBg = 'bg-red-50 text-red-800 border-red-100';
                        Icon = X;
                        iconColor = 'text-red-600';
                      } else {
                        alertBg = 'bg-amber-50 text-amber-800 border-amber-100';
                        Icon = AlertTriangle;
                        iconColor = 'text-amber-600';
                      }
                    } else {
                      iconColor = 'text-emerald-500';
                    }

                    return (
                      <div 
                        key={idx} 
                        className={`p-2.5 border rounded-lg text-xs flex items-start gap-2 ${alertBg}`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                        <span>{v.message}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              {wizardCompatibility.recommendations.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{t('scientificRecommendations')}</span>
                  </h4>
                  <ul className="list-disc list-inside text-xs text-amber-800 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50 space-y-1">
                    {wizardCompatibility.recommendations.map((rec, rIdx) => (
                      <li key={rIdx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

          {/* STEP 4: FINAL VALIDATION */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t('optionalName')}
                  </label>
                  <AppInput
                    placeholder={t('pairNamePlaceholder')}
                    value={pairName}
                    onChange={(e: any) => setPairName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                    {t('optionalNotes')}
                  </label>
                  <textarea
                    placeholder={t('pairNotesPlaceholder')}
                    value={pairNotes}
                    onChange={(e) => setPairNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Scientific Warning Disclaimer */}
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-blue-800 text-[11px] leading-relaxed">
                ⚖️ <strong>Note scientifique :</strong> Le moteur d'accouplement de Bird Academy calcule et suggère, mais ne bloque jamais la création. La décision finale et souveraine d'élevage appartient toujours à l'éleveur.
              </div>

            </div>
          )}

          {/* NAVIGATION FOOTER */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <AppButton
              variant="text"
              onClick={prevWizardStep}
              disabled={wizardStep === 1}
              className={`text-xs font-bold py-1.5 px-3 cursor-pointer ${wizardStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              {t('backBtn')}
            </AppButton>

            {wizardStep < 4 ? (
              <AppButton
                variant="primary"
                onClick={nextWizardStep}
                disabled={
                  (wizardStep === 1 && selectedMaleId === null) ||
                  (wizardStep === 2 && selectedFemaleId === null)
                }
                className="text-xs font-bold py-1.5 px-4 cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <span>{t('nextBtn')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </AppButton>
            ) : (
              <AppButton
                variant="success"
                onClick={handleCreatePair}
                className="text-xs font-bold py-1.5 px-5 cursor-pointer shadow-sm"
              >
                {t('finishBtn')}
              </AppButton>
            )}
          </div>

        </div>
      </AppModal>

    </div>
  );
}
