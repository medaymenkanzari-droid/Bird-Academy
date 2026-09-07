/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, Plus, Activity, Heart, Calendar, TrendingUp, Syringe, 
  FileSpreadsheet, UserCheck, Baby, CheckCircle, Clock, Frown, Smile, 
  ArrowLeftRight, LifeBuoy, AlertTriangle, Scale, Thermometer, User, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';

import { 
  AppCard, AppButton, AppBadge, AppModal, AppTable, 
  AppInput, AppSelect, AppEmptyState, AppAlert 
} from '../../../../components/design-system';

import { NurseryService } from '../services/NurseryService';
import { FosterService } from '../../foster/services/FosterService';
import { FosterRepository } from '../../foster/repositories/FosterRepository';
import { HandFeedingService } from '../../handfeeding/services/HandFeedingService';
import { RescueService } from '../../rescue/services/RescueService';
import { ProtocolService } from '../../protocols/services/ProtocolService';
import { ReproductionEngine } from '../../engines/ReproductionEngine';
import { BirdRepository } from '../../../birds/repositories/BirdRepository';
import { ReproductionRepository } from '../../repositories/ReproductionRepository';
import { ChickRepository } from '../../chicks/repositories/ChickRepository';
import { useLanguage } from '../../../../context/LanguageContext';

export default function NurseryDashboard() {
  const { language, isRtl } = useLanguage();
  
  // Localized string translation helper
  const t = (key: string, defaultVal: string) => defaultVal;

  // Tabs: 'overview' | 'foster' | 'handfeeding' | 'rescue' | 'protocols'
  const [activeTab, setActiveTab] = useState<'overview' | 'foster' | 'handfeeding' | 'rescue' | 'protocols'>('overview');

  // Trigger state updates
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const doRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Loaders / stats computed on trigger
  const stats = useMemo(() => NurseryService.getStatistics(), [refreshTrigger]);
  const alerts = useMemo(() => NurseryService.getActiveNurseryAlerts(), [refreshTrigger]);
  const activeChicks = useMemo(() => ChickRepository.getAll().filter(c => c.status !== 'weaned' && c.status !== 'deceased'), [refreshTrigger]);
  const allChicks = useMemo(() => ChickRepository.getAll(), [refreshTrigger]);
  const fosterParents = useMemo(() => FosterService.getFosterParents(), [refreshTrigger]);
  const rescueCases = useMemo(() => RescueService.getRescueCases(), [refreshTrigger]);
  const protocols = useMemo(() => ProtocolService.getProtocols(), [refreshTrigger]);
  const formulas = useMemo(() => HandFeedingService.getFormulas(), [refreshTrigger]);
  const allPairs = useMemo(() => ReproductionRepository.getAll(), [refreshTrigger]);

  // Modal states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState(false);
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);

  // --- 1. TRANSFER WIZARD STATE ---
  const [transferChickId, setTransferChickId] = useState('');
  const [transferFosterPairId, setTransferFosterPairId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const selectedTransferChick = useMemo(() => {
    return activeChicks.find(c => c.id === transferChickId);
  }, [transferChickId, activeChicks]);

  const selectedTransferFosterPair = useMemo(() => {
    return fosterParents.find(f => f.pairId === transferFosterPairId);
  }, [transferFosterPairId, fosterParents]);

  // Interactive Scientific Compatibility rating
  const transferCompatibility = useMemo(() => {
    if (!selectedTransferChick || !transferFosterPairId) return null;
    
    // Find biological chicks of foster parents
    const bioChicksOfFoster = activeChicks.filter(c => c.pairId === transferFosterPairId && !c.fosterPairId);
    const capacity = selectedTransferFosterPair ? selectedTransferFosterPair.capacity : 4;
    const currentFosterCount = selectedTransferFosterPair ? selectedTransferFosterPair.currentFosterCount : 0;

    return ReproductionEngine.analyzeFosterCompatibility(
      {
        id: selectedTransferChick.id,
        hatchDate: selectedTransferChick.hatchDate,
        ageDays: ReproductionEngine.calculateAgeInDays(selectedTransferChick.hatchDate)
      },
      {
        id: transferFosterPairId,
        maleId: 0,
        femaleId: 0
      },
      { capacity, currentFosterCount },
      bioChicksOfFoster
    );
  }, [selectedTransferChick, transferFosterPairId, selectedTransferFosterPair, activeChicks]);

  // --- 2. HAND FEEDING DIALOG STATE ---
  const [feedChickId, setFeedChickId] = useState('');
  const [feedVolume, setFeedVolume] = useState(1.5);
  const [feedTemp, setFeedTemp] = useState(39.5);
  const [feedFormulaId, setFeedFormulaId] = useState('formula-a21');
  const [cropBefore, setCropBefore] = useState<'empty' | 'medium' | 'full' | 'stagnant' | 'acidic'>('empty');
  const [cropAfter, setCropAfter] = useState<'empty' | 'medium' | 'full' | 'stagnant' | 'acidic'>('full');
  const [feedObs, setFeedObs] = useState('');
  const [feedOperator, setFeedOperator] = useState('');

  // --- 3. RESCUE CASES STATE ---
  const [rescueChickId, setRescueChickId] = useState('');
  const [rescueWeight, setRescueWeight] = useState(4);
  const [rescueReason, setRescueReason] = useState<'abandon' | 'injury' | 'orphaned' | 'illness' | 'other'>('abandon');
  const [rescueSeverity, setRescueSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [rescueNotes, setRescueNotes] = useState('');
  const [rescueTempControlled, setRescueTempControlled] = useState(true);
  const [rescueHumidity, setRescueHumidity] = useState(60);

  // --- 4. PROTOCOL DIALOG STATE ---
  const [newProtoSpecies, setNewProtoSpecies] = useState('Canari');
  const [newProtoName, setNewProtoName] = useState('');
  const [newProtoRemarks, setNewProtoRemarks] = useState('');

  // Selected chick for charting / details
  const [chartChickId, setChartChickId] = useState<string>('');
  useEffect(() => {
    if (activeChicks.length > 0 && !chartChickId) {
      setChartChickId(activeChicks[0].id);
    }
  }, [activeChicks, chartChickId]);

  const growthData = useMemo(() => {
    if (!chartChickId) return [];
    return NurseryService.getGrowthCurveData(chartChickId);
  }, [chartChickId, refreshTrigger]);

  // --- ACTIONS ---
  const handleTransferSubmit = () => {
    if (!transferChickId || !transferFosterPairId || !transferReason) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      FosterService.transferChick(transferChickId, transferFosterPairId, transferReason);
      setIsTransferModalOpen(false);
      setTransferChickId('');
      setTransferFosterPairId('');
      setTransferReason('');
      doRefresh();
    } catch (e: any) {
      alert(e.message || "Erreur de transfert.");
    }
  };

  const handleReturnToBio = (chickId: string) => {
    if (confirm("Voulez-vous retourner cet oisillon auprès de ses parents biologiques d'origine ?")) {
      FosterService.returnChickToBiologicalParents(chickId);
      doRefresh();
    }
  };

  const handleFeedSubmit = () => {
    if (!feedChickId || !feedFormulaId || !feedVolume) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      HandFeedingService.logSession({
        chickId: feedChickId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        formulaId: feedFormulaId,
        volumeMl: Number(feedVolume),
        temperatureC: Number(feedTemp),
        cropBefore,
        cropAfter,
        observations: feedObs,
        operator: feedOperator
      });
      setIsFeedModalOpen(false);
      setFeedChickId('');
      setFeedVolume(1.5);
      setFeedObs('');
      doRefresh();
    } catch (e: any) {
      alert(e.message || "Erreur lors de l'enregistrement de la séance.");
    }
  };

  const handleRescueSubmit = () => {
    if (!rescueChickId || !rescueWeight) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    try {
      RescueService.openRescueCase({
        chickId: rescueChickId,
        admissionWeight: Number(rescueWeight),
        reason: rescueReason,
        severity: rescueSeverity,
        temperatureMaintained: rescueTempControlled,
        humidityLevel: Number(rescueHumidity),
        treatmentNotes: rescueNotes
      });
      setIsRescueModalOpen(false);
      setRescueChickId('');
      setRescueWeight(4);
      setRescueNotes('');
      doRefresh();
    } catch (e: any) {
      alert(e.message || "Erreur d'admission.");
    }
  };

  const handleResolveRescue = (rescueId: string, status: 'recovered' | 'deceased' | 'transferred') => {
    const notes = prompt("Notes complémentaires sur la résolution du cas (médicaments, bilan de santé) :");
    if (notes !== null) {
      RescueService.resolveRescueCase(rescueId, status, notes);
      doRefresh();
    }
  };

  const handleProtocolSubmit = () => {
    if (!newProtoName || !newProtoSpecies) {
      alert("Veuillez donner un nom et une espèce pour le protocole.");
      return;
    }
    try {
      ProtocolService.createProtocol(newProtoSpecies, newProtoName, newProtoRemarks, [
        { id: `sch-${Math.random()}`, minAgeDays: 0, maxAgeDays: 5, frequencyPerDay: 8, suggestedVolumeMl: 0.5, suggestedTempC: 39.5, notes: "Phase néonatale." },
        { id: `sch-${Math.random()}`, minAgeDays: 5, maxAgeDays: 15, frequencyPerDay: 5, suggestedVolumeMl: 2.0, suggestedTempC: 39.0, notes: "Phase de croissance." }
      ]);
      setIsProtocolModalOpen(false);
      setNewProtoName('');
      setNewProtoRemarks('');
      doRefresh();
    } catch (e: any) {
      alert(e.message || "Erreur de protocole.");
    }
  };

  const handleRegisterFosterPair = (pairId: string) => {
    const capacity = prompt("Saisir la capacité maximale de poussins pour ce couple (par défaut 4) :", "4");
    if (capacity !== null) {
      FosterService.toggleFosterStatus(pairId, Number(capacity) || 4);
      doRefresh();
    }
  };

  const handleToggleFosterRest = (pairId: string) => {
    FosterService.toggleFosterStatus(pairId);
    doRefresh();
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-6 rounded-2xl border border-amber-200/40 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Gestion de la Nurserie Scientifique</h2>
              <p className="text-xs text-slate-500 mt-0.5">Suivi des portées adoptives, de l'élevage à la main (EAM), des soins intensifs et de la régulation thermique.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <AppButton size="sm" variant="outline" onClick={() => setIsTransferModalOpen(true)} className="flex items-center gap-1.5 cursor-pointer text-xs">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transférer un oisillon</span>
          </AppButton>
          <AppButton size="sm" variant="success" onClick={() => setIsFeedModalOpen(true)} className="flex items-center gap-1.5 cursor-pointer text-xs">
            <Syringe className="w-3.5 h-3.5" />
            <span>Nourrir un oisillon</span>
          </AppButton>
          <AppButton size="sm" variant="primary" onClick={() => setIsRescueModalOpen(true)} className="flex items-center gap-1.5 cursor-pointer text-xs">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>Admettre en sauvetage</span>
          </AppButton>
        </div>
      </div>

      {/* Real-time Alerts Panel */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span className="text-xs font-bold uppercase tracking-wider">Alertes critiques et urgences biologiques ({alerts.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {alerts.map((al, idx) => (
              <div 
                key={idx} 
                className={`p-3.5 border rounded-xl flex items-start gap-3 shadow-sm transition-all ${
                  al.severity === 'critical' 
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900 ring-1 ring-rose-200/30' 
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${al.severity === 'critical' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight">{al.message}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono opacity-80 uppercase bg-white/55 px-1.5 py-0.5 rounded">
                    {al.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Jeunes Biologiques", value: stats.biologicalCount, icon: Baby, color: "bg-blue-50 text-blue-600" },
          { label: "Adoptés", value: stats.adoptedCount, icon: Heart, color: "bg-pink-50 text-pink-600" },
          { label: "Élevés à la main", value: stats.handFedCount, icon: Syringe, color: "bg-amber-50 text-amber-600" },
          { label: "Nids Surchargés", value: stats.overloadedNestsCount, icon: AlertTriangle, color: stats.overloadedNestsCount > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-50 text-slate-400" },
          { label: "Nourriciers Actifs", value: stats.activeFosterParentsCount, icon: UserCheck, color: "bg-green-50 text-green-600" },
          { label: "Taux de Survie", value: `${stats.survivalRate}%`, icon: TrendingUp, color: "bg-purple-50 text-purple-600" }
        ].map((kpi, index) => (
          <AppCard key={index} padding="sm" className="bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg shrink-0 ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-slate-500 font-bold leading-tight truncate">{kpi.label}</span>
                <span className="block text-base font-black text-slate-800 mt-0.5">{kpi.value}</span>
              </div>
            </div>
          </AppCard>
        ))}
      </div>

      {/* Main Tabs Container */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        
        {/* Nav tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {[
            { id: 'overview', label: "Vue Générale & Croissance", icon: Activity },
            { id: 'foster', label: "Parents Nourriciers (Ado)", icon: Heart },
            { id: 'handfeeding', label: "Élevage à la main (EAM)", icon: Syringe },
            { id: 'rescue', label: "Sauvetages d'Urgence", icon: LifeBuoy },
            { id: 'protocols', label: "Protocoles d'Alimentation", icon: FileSpreadsheet }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'border-amber-500 text-amber-600 font-extrabold bg-amber-50/20' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Panels */}
        <div className="p-6">
          
          {/* TAB 1: OVERVIEW & GROW CURVE */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Growth Curve */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-700">Courbe de Croissance Biologique</h3>
                    <p className="text-[11px] text-slate-500">Comparez le poids mesuré de l'oisillon avec la courbe théorique de référence.</p>
                  </div>
                  <div className="w-44">
                    <AppSelect
                      value={chartChickId}
                      onChange={(e) => setChartChickId(e.target.value)}
                      options={activeChicks.map(c => ({ value: c.id, label: `${c.name} (${c.provisionalNumber})` }))}
                    />
                  </div>
                </div>

                <div className="h-64 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  {growthData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.05}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="ageDays" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} unit="g" />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36} iconSize={10} style={{ fontSize: '11px' }} />
                        <Area name="Poids Réel (g)" type="monotone" dataKey="weight" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActual)" />
                        <Area name="Courbe Théorique (g)" type="monotone" dataKey="expectedWeight" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorExpected)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 text-xs italic">
                      Aucune donnée de croissance disponible.
                    </div>
                  )}
                </div>
              </div>

              {/* Active Nursery List */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-sm font-bold text-slate-700">Oisillons en Nurserie ({activeChicks.length})</h3>
                <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                  {activeChicks.map((chick) => {
                    const nurseryRec = stats.protocolPerformance ? NurseryService.getNurseryRecordByChick(chick.id) : null;
                    const mode = nurseryRec ? nurseryRec.mode : 'biological_parents';
                    const age = ReproductionEngine.calculateAgeInDays(chick.hatchDate);
                    
                    return (
                      <div 
                        key={chick.id}
                        onClick={() => setChartChickId(chick.id)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                          chartChickId === chick.id 
                            ? 'border-amber-400 bg-amber-50/20' 
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="block font-bold text-xs text-slate-800 truncate">{chick.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5"># {chick.provisionalNumber} • {age} jours</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {chick.fosterPairId && (
                            <AppBadge variant="accent" size="sm">Adopté</AppBadge>
                          )}
                          {mode === 'hand_feeding' && (
                            <AppBadge variant="warning" size="sm">EAM</AppBadge>
                          )}
                          {mode === 'mixed' && (
                            <AppBadge variant="secondary" size="sm">Mixte</AppBadge>
                          )}
                          {!chick.fosterPairId && mode !== 'hand_feeding' && mode !== 'mixed' && (
                            <AppBadge variant="success" size="sm">Parental</AppBadge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {activeChicks.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-6">Aucun oisillon en nurserie pour le moment.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FOSTER PARENTS & ADOPTIONS */}
          {activeTab === 'foster' && (
            <div className="space-y-6">
              
              {/* Active Foster Parents */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-700">Couples Nourriciers Enregistrés</h3>
                  <div className="w-56">
                    <AppSelect
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleRegisterFosterPair(e.target.value);
                        }
                      }}
                      options={[
                        { value: "", label: "Enregistrer un nouveau couple..." },
                        ...allPairs.filter(p => p.status === 'active' && !fosterParents.some(fp => fp.pairId === p.id)).map(p => ({ value: p.id, label: p.name }))
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fosterParents.map((fp) => {
                    const isOverloaded = fp.currentFosterCount >= fp.capacity;
                    return (
                      <div key={fp.id} className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm hover:border-slate-200 transition-colors flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-800">Couple : {fp.pairId}</h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>Capacité de nid : <strong>{fp.capacity} oisillons</strong></span>
                            <span>•</span>
                            <span className={isOverloaded ? 'text-rose-600 font-bold' : ''}>Occupés : <strong>{fp.currentFosterCount}</strong></span>
                          </div>
                          <div className="pt-2 flex items-center gap-1.5">
                            {fp.status === 'available' && <AppBadge variant="success" size="sm">Disponible</AppBadge>}
                            {fp.status === 'active' && <AppBadge variant="warning" size="sm">Actif</AppBadge>}
                            {fp.status === 'resting' && <AppBadge variant="text" size="sm" className="bg-slate-100 text-slate-500">En repos</AppBadge>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <AppButton size="sm" variant="outline" onClick={() => handleToggleFosterRest(fp.pairId)} className="text-[10px] cursor-pointer">
                            {fp.status === 'resting' ? "Remettre disponible" : "Mettre en repos"}
                          </AppButton>
                        </div>
                      </div>
                    );
                  })}
                  {fosterParents.length === 0 && (
                    <div className="md:col-span-2 py-8 text-center text-slate-400 text-xs italic">
                      Aucun couple nourricier enregistré pour le moment.
                    </div>
                  )}
                </div>
              </div>

              {/* Active adopted chicks history */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-700">Oisillons adoptés actifs</h3>
                <div className="overflow-x-auto">
                  <AppTable<any>
                    data={activeChicks.filter(c => c.fosterPairId)}
                    keyExtractor={(c) => c.id}
                    emptyState={
                      <div className="p-6 text-center text-slate-400 italic">
                        Aucune adoption active actuellement.
                      </div>
                    }
                    columns={[
                      {
                        key: 'oisillon',
                        header: 'Oisillon',
                        render: (chick) => (
                          <div>
                            <span className="block font-bold text-slate-700">{chick.name}</span>
                            <span className="block text-[10px] text-slate-400 font-mono"># {chick.provisionalNumber}</span>
                          </div>
                        )
                      },
                      {
                        key: 'bio',
                        header: 'Saison / Nid Biologique',
                        render: (chick) => <span className="text-slate-600">Couple {chick.pairId}</span>
                      },
                      {
                        key: 'foster',
                        header: 'Nid Adoptif (Foster)',
                        render: (chick) => <span className="font-bold text-amber-600">Couple {chick.fosterPairId}</span>
                      },
                      {
                        key: 'motif',
                        header: 'Motif de transfert',
                        className: 'text-slate-500',
                        render: (chick) => {
                          const activeTransfer = FosterRepository.getTransfersByChick(chick.id).find(t => t.status === 'active');
                          return activeTransfer ? activeTransfer.reason : "Transfert manuel";
                        }
                      },
                      {
                        key: 'actions',
                        header: 'Actions',
                        className: 'text-right',
                        headerClassName: 'text-right',
                        render: (chick) => (
                          <div className="flex justify-end">
                            <AppButton size="sm" variant="outline" onClick={() => handleReturnToBio(chick.id)} className="text-[10px] hover:text-rose-600 hover:border-rose-200 cursor-pointer">
                              Retourner au nid bio
                            </AppButton>
                          </div>
                        )
                      }
                    ]}
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: HAND FEEDING (EAM) */}
          {activeTab === 'handfeeding' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Feeding Log History list */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-sm font-bold text-slate-700">Sélectionner un oisillon</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {activeChicks.map(c => {
                    const sessions = HandFeedingService.getSessionsByChick(c.id);
                    const lastFed = sessions.length > 0 ? `${sessions[0].date} à ${sessions[0].time}` : 'Jamais';
                    
                    return (
                      <div 
                        key={c.id} 
                        onClick={() => setFeedChickId(c.id)}
                        className={`p-3 border rounded-xl cursor-pointer transition-all ${
                          feedChickId === c.id ? 'border-amber-400 bg-amber-50/20' : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <span className="block font-bold text-xs text-slate-800">{c.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono mt-0.5"># {c.provisionalNumber}</span>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-50 pt-1.5">
                          <span>Dernier repas :</span>
                          <span className="font-bold text-slate-700">{lastFed}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feedings historical timeline for selected chick */}
              <div className="lg:col-span-2 space-y-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                {feedChickId ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Historique des nourrissages (EAM)</h4>
                        <p className="text-[11px] text-slate-500">Visualisez les séances d'élevage manuel enregistrées pour cet oisillon.</p>
                      </div>
                      <AppButton size="sm" variant="success" onClick={() => setIsFeedModalOpen(true)} className="flex items-center gap-1 cursor-pointer">
                        <Plus className="w-3 h-3" />
                        <span>Enregistrer un nourrissage</span>
                      </AppButton>
                    </div>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {HandFeedingService.getSessionsByChick(feedChickId).map(s => {
                        const form = formulas.find(f => f.id === s.formulaId);
                        const formName = form ? form.name : s.formulaId;
                        return (
                          <div key={s.id} className="p-3 border border-slate-100 bg-white rounded-xl shadow-xs flex justify-between items-center gap-4">
                            <div>
                              <span className="block text-[10px] font-mono text-slate-400">{s.date} à {s.time}</span>
                              <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                                <span className="font-bold text-slate-700">{s.volumeMl}ml</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-600">{formName}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-600">{s.temperatureC}°C</span>
                              </div>
                              {s.observations && (
                                <p className="text-[10px] text-slate-500 italic mt-1 bg-slate-50 p-1 rounded">"{s.observations}"</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="block text-[10px] text-slate-400">Jabot</span>
                              <AppBadge variant={s.cropBefore === 'stagnant' || s.cropBefore === 'acidic' ? 'danger' : 'outline'} size="sm" className="mt-0.5">
                                {s.cropBefore} ➔ {s.cropAfter}
                              </AppBadge>
                            </div>
                          </div>
                        );
                      })}
                      {HandFeedingService.getSessionsByChick(feedChickId).length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center py-8">Aucune séance d'EAM enregistrée pour cet oisillon.</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full items-center justify-center text-center py-12 text-slate-400">
                    <Syringe className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs italic">Sélectionnez un oisillon à gauche pour visualiser ou enregistrer ses séances de nourrissage d'élevage manuel (EAM).</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: EMERGENCY RESCUE CASES */}
          {activeTab === 'rescue' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700">Cas de Sauvetage Actifs ({rescueCases.filter(r => r.status === 'active').length})</h3>
                <AppButton size="sm" variant="primary" onClick={() => setIsRescueModalOpen(true)} className="flex items-center gap-1 cursor-pointer text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau sauvetage d'urgence</span>
                </AppButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rescueCases.filter(r => r.status === 'active').map(rc => {
                  const chick = allChicks.find(c => c.id === rc.chickId);
                  return (
                    <div key={rc.id} className="p-4 border border-slate-100 rounded-2xl bg-white shadow-sm flex flex-col justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{chick ? chick.name : 'Oisillon'}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">Admission le {rc.admissionDate} • Poids: {rc.admissionWeight}g</span>
                          </div>
                          <AppBadge variant={rc.severity === 'critical' || rc.severity === 'high' ? 'danger' : 'warning'} size="sm">
                            {rc.severity}
                          </AppBadge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                          <div>
                            <span className="block text-slate-400">Raison d'admission</span>
                            <span className="font-bold text-slate-700 uppercase">{rc.reason}</span>
                          </div>
                          <div>
                            <span className="block text-slate-400">Contrôle Thermique</span>
                            <span className="font-bold text-slate-700">{rc.temperatureMaintained ? ' Incubateur ACTIF' : 'Temp. ambiante'}</span>
                          </div>
                          <div className="col-span-2 pt-1 border-t border-slate-200/50">
                            <span className="block text-slate-400">Notes médicales :</span>
                            <p className="text-[10px] text-slate-500 italic mt-0.5">"{rc.treatmentNotes || 'Aucune note'}"</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-slate-100 pt-3">
                        <AppButton size="sm" variant="success" onClick={() => handleResolveRescue(rc.id, 'recovered')} className="flex-1 cursor-pointer text-[10px]">
                          Rétabli complet
                        </AppButton>
                        <AppButton size="sm" variant="outline" onClick={() => handleResolveRescue(rc.id, 'deceased')} className="flex-1 cursor-pointer text-[10px] text-rose-600 border-rose-100 hover:bg-rose-50">
                          Déclarer Décès
                        </AppButton>
                        <AppButton size="sm" variant="text" onClick={() => handleResolveRescue(rc.id, 'transferred')} className="flex-1 cursor-pointer text-[10px] text-slate-500">
                          Transférer
                        </AppButton>
                      </div>
                    </div>
                  );
                })}
                {rescueCases.filter(r => r.status === 'active').length === 0 && (
                  <div className="md:col-span-2 py-8 text-center text-slate-400 text-xs italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Aucun oisillon en sauvetage intensif actuellement. Tout est sous contrôle !
                  </div>
                )}
              </div>

              {/* Resolved history rescue cases */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-bold text-slate-700">Historique des sauvetages clôturés</h3>
                <div className="overflow-x-auto">
                  <AppTable
                  data={rescueCases.filter(r => r.status !== 'active')}
                  keyExtractor={(rc: any) => rc.id}
                  columns={[
                    { key: 'oisillon', header: 'Oisillon', render: (rc: any) => { const chick = allChicks.find(c => c.id === rc.chickId); return <span className="block font-bold text-slate-700">{chick ? chick.name : 'Oisillon'}</span>; } },
                    { key: 'dates', header: 'Admission / Clôture', render: (rc: any) => <div><span className="block">{rc.admissionDate}</span><span className="block text-[10px] text-slate-400">Clôturé : {rc.resolvedDate}</span></div> },
                    { key: 'motif', header: "Motif d'urgence", render: (rc: any) => <span className="uppercase font-semibold text-slate-500">{rc.reason}</span> },
                    { key: 'statut', header: 'Statut final', render: (rc: any) => (
                      <div>
                        {rc.status === 'recovered' && <AppBadge variant="success" size="sm">Rétabli</AppBadge>}
                        {rc.status === 'deceased' && <AppBadge variant="danger" size="sm">Décédé</AppBadge>}
                        {rc.status === 'transferred' && <AppBadge variant="warning" size="sm">Transféré</AppBadge>}
                      </div>
                    )},
                    { key: 'observations', header: 'Observations de traitement', render: (rc: any) => <span className="italic text-slate-400">{rc.treatmentNotes || 'Aucune note'}</span> }
                  ]}
                />
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: DIETARY PROTOCOLS LIBRARY */}
          {activeTab === 'protocols' && (
            <div className="space-y-6">
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">Bibliothèque extensible de protocoles d'élevage</h3>
                  <p className="text-[11px] text-slate-500">Gérez les guides de sevrage, d'hydratation et les fréquences d'alimentation par espèce.</p>
                </div>
                <AppButton size="sm" variant="outline" onClick={() => setIsProtocolModalOpen(true)} className="flex items-center gap-1 cursor-pointer text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nouveau protocole d'espèce</span>
                </AppButton>
              </div>

              <div className="space-y-6">
                {protocols.map(p => (
                  <div key={p.id} className="p-5 border border-slate-100 rounded-2xl bg-white shadow-xs space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider">{p.species}</h4>
                        <span className="block text-sm font-bold text-slate-800">{p.name}</span>
                        {p.remarks && <p className="text-[11px] text-slate-500 mt-1">"{p.remarks}"</p>}
                      </div>
                      <AppBadge variant={p.isActive ? 'success' : 'outline'}>{p.isActive ? 'Actif' : 'Désactivé'}</AppBadge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {p.schedules.map((sch, sIdx) => (
                        <div key={sIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600">
                          <span className="block font-bold text-slate-800 bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full w-fit">
                            Ages : {sch.minAgeDays} ➔ {sch.maxAgeDays} jours
                          </span>
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between">
                              <span>Fréquence :</span>
                              <strong className="text-slate-800">{sch.frequencyPerDay} repas / jour</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Volume suggéré :</span>
                              <strong className="text-slate-800">{sch.suggestedVolumeMl} ml</strong>
                            </div>
                            <div className="flex justify-between">
                              <span>Température :</span>
                              <strong className="text-slate-800">{sch.suggestedTempC} °C</strong>
                            </div>
                          </div>
                          {sch.notes && (
                            <p className="text-[10px] text-slate-400 border-t border-slate-200/50 pt-1 mt-1 italic">"{sch.notes}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </div>

      {/* --- 1. BIOLOGICAL TRANSFER WIZARD DIALOG --- */}
      <AppModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Assistant de Transfert Biologique (Adoption)"
        size="lg"
      >
        <div className="space-y-4 font-sans">
          
          <AppAlert type="info">
            Cette opération place l'oisillon sous la tutelle adoptive d'un autre nid. Les liens biologiques parentaux initiaux restent scellés et inaltérables dans la base de données.
          </AppAlert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600">Sélectionner l'oisillon candidat</label>
              <AppSelect
                value={transferChickId}
                onChange={(e) => setTransferChickId(e.target.value)}
                options={[
                  { value: "", label: "-- Sélectionner un oisillon --" },
                  ...activeChicks.filter(c => !c.fosterPairId).map(c => ({ value: c.id, label: `${c.name} (${c.provisionalNumber})` }))
                ]}
              />

              {selectedTransferChick && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                  <div><span>Saison / Couple d'origine :</span> <strong className="text-slate-700">Couple {selectedTransferChick.pairId}</strong></div>
                  <div><span>Date d'éclosion :</span> <strong className="text-slate-700">{selectedTransferChick.hatchDate}</strong></div>
                  <div><span>Age actuel :</span> <strong className="text-slate-700">{ReproductionEngine.calculateAgeInDays(selectedTransferChick.hatchDate)} jours</strong></div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600">Sélectionner le couple nourricier hôte</label>
              <AppSelect
                value={transferFosterPairId}
                onChange={(e) => setTransferFosterPairId(e.target.value)}
                options={[
                  { value: "", label: "-- Sélectionner un couple hôte --" },
                  ...fosterParents.filter(fp => fp.status === 'available').map(fp => ({ value: fp.pairId, label: `Couple ${fp.pairId} (Occ: ${fp.currentFosterCount}/${fp.capacity})` }))
                ]}
              />

              {transferFosterPairId && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                  <div><span>Capacité max autorisée :</span> <strong className="text-slate-700">{selectedTransferFosterPair ? selectedTransferFosterPair.capacity : 4} oisillons</strong></div>
                  <div><span>Adoptions en cours :</span> <strong className="text-slate-700">{selectedTransferFosterPair ? selectedTransferFosterPair.currentFosterCount : 0}</strong></div>
                </div>
              )}
            </div>

          </div>

          {/* Interactive compatibility result */}
          {transferCompatibility && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-600">Indice de compatibilité adoptive</span>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={`text-sm ${s <= transferCompatibility.score ? 'text-amber-500' : 'text-slate-200'}`}>★</span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                {transferCompatibility.validations.map((v, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-xs text-slate-600">
                    <span className={v.passed ? 'text-green-600 font-bold' : 'text-rose-500 font-bold'}>
                      {v.passed ? '✓' : '⚠'}
                    </span>
                    <p className="leading-tight">{v.message}</p>
                  </div>
                ))}
              </div>

              {transferCompatibility.recommendations.map((r, rIdx) => (
                <p key={rIdx} className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 italic leading-tight">
                  Conseil d'expert : {r}
                </p>
              ))}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-600">Motif de transfert (obligatoire)</label>
            <AppInput
              type="text"
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              placeholder="Ex: Abandon parental, maladie de la femelle, nid trop chargé..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <AppButton variant="outline" onClick={() => setIsTransferModalOpen(false)} className="cursor-pointer">Annuler</AppButton>
            <AppButton variant="primary" onClick={handleTransferSubmit} className="cursor-pointer">Confirmer le transfert</AppButton>
          </div>

        </div>
      </AppModal>

      {/* --- 2. HAND FEEDING (EAM) DIALOG --- */}
      <AppModal
        isOpen={isFeedModalOpen}
        onClose={() => setIsFeedModalOpen(false)}
        title="Enregistrer un Nourrissage d'Élevage à la Main"
        size="md"
      >
        <div className="space-y-4 font-sans text-xs">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Oisillon à nourrir</label>
              <AppSelect
                value={feedChickId}
                onChange={(e) => setFeedChickId(e.target.value)}
                options={[
                  { value: "", label: "-- Choisir l'oisillon --" },
                  ...activeChicks.map(c => ({ value: c.id, label: `${c.name} (${c.provisionalNumber})` }))
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Formule / Pâtée utilisée</label>
              <AppSelect
                value={feedFormulaId}
                onChange={(e) => setFeedFormulaId(e.target.value)}
                options={formulas.map(f => ({ value: f.id, label: `${f.brand} - ${f.name}` }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Volume injecté (ml)</label>
              <AppInput
                type="number"
                step="0.1"
                value={feedVolume}
                onChange={(e) => setFeedVolume(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Température de la pâtée (°C)</label>
              <AppInput
                type="number"
                step="0.1"
                value={feedTemp}
                onChange={(e) => setFeedTemp(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">État du jabot (Avant repas)</label>
              <AppSelect
                value={cropBefore}
                onChange={(e) => setCropBefore(e.target.value as any)}
                options={[
                  { value: "empty", label: "Vide (Recommandé)" },
                  { value: "medium", label: "Moyennement rempli" },
                  { value: "full", label: "Plein" },
                  { value: "stagnant", label: "Bloqué / Stagnant (Danger)" },
                  { value: "acidic", label: "Jabot acide (Urgence)" }
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">État du jabot (Après repas)</label>
              <AppSelect
                value={cropAfter}
                onChange={(e) => setCropAfter(e.target.value as any)}
                options={[
                  { value: "empty", label: "Vide" },
                  { value: "medium", label: "Moyennement rempli" },
                  { value: "full", label: "Plein (Idéal après repas)" }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Opérateur / Éleveur</label>
              <AppInput
                type="text"
                value={feedOperator}
                onChange={(e) => setFeedOperator(e.target.value)}
                placeholder="Initiales ou nom du soigneur"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Observations / Texture</label>
              <AppInput
                type="text"
                value={feedObs}
                onChange={(e) => setFeedObs(e.target.value)}
                placeholder="Dilution liquide, comportement d'agressivité au repas..."
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <AppButton variant="outline" onClick={() => setIsFeedModalOpen(false)} className="cursor-pointer">Annuler</AppButton>
            <AppButton variant="success" onClick={handleFeedSubmit} className="cursor-pointer">Enregistrer le nourrissage</AppButton>
          </div>

        </div>
      </AppModal>

      {/* --- 3. RESCUE ADMISSION DIALOG --- */}
      <AppModal
        isOpen={isRescueModalOpen}
        onClose={() => setIsRescueModalOpen(false)}
        title="Admission d'un oisillon en Sauvetage Critique"
        size="md"
      >
        <div className="space-y-4 font-sans text-xs">
          
          <AppAlert type="warning">
            L'admission en sauvetage déclenche un plan de soins intensifs (régulation thermique et hygrométrique forcée, monitoring du poids et de la déglutition).
          </AppAlert>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Oisillon en détresse</label>
              <AppSelect
                value={rescueChickId}
                onChange={(e) => setRescueChickId(e.target.value)}
                options={[
                  { value: "", label: "-- Sélectionner --" },
                  ...activeChicks.filter(c => !RescueService.getRescueCaseByChick(c.id)).map(c => ({ value: c.id, label: `${c.name} (${c.provisionalNumber})` }))
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Poids à l'admission (g)</label>
              <AppInput
                type="number"
                step="0.1"
                value={rescueWeight}
                onChange={(e) => setRescueWeight(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Raison médicale / Incident</label>
              <AppSelect
                value={rescueReason}
                onChange={(e) => setRescueReason(e.target.value as any)}
                options={[
                  { value: "abandon", label: "Abandon parental" },
                  { value: "injury", label: "Blessure physique / Chute" },
                  { value: "orphaned", label: "Orphelin (Décès parents)" },
                  { value: "illness", label: "Pathologie / Maladie" },
                  { value: "other", label: "Autre cause" }
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Niveau de sévérité</label>
              <AppSelect
                value={rescueSeverity}
                onChange={(e) => setRescueSeverity(e.target.value as any)}
                options={[
                  { value: "low", label: "Bénin (Surveillance simple)" },
                  { value: "medium", label: "Modéré" },
                  { value: "high", label: "Sévère (Soins requis)" },
                  { value: "critical", label: "Critique (Urgence vitale)" }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Chambre chaude / Incubateur (°C)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="checkbox"
                  checked={rescueTempControlled}
                  onChange={(e) => setRescueTempControlled(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-200"
                />
                <span className="text-[11px] text-slate-500">Maintenir à 37.5°C</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-600">Hygrométrie cible (%)</label>
              <AppInput
                type="number"
                value={rescueHumidity}
                onChange={(e) => setRescueHumidity(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-600">Symptômes, traitement & diagnostics de départ</label>
            <AppInput
              type="text"
              value={rescueNotes}
              onChange={(e) => setRescueNotes(e.target.value)}
              placeholder="Ex: Hydratation forcée au sérum physiologique, massage du jabot..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <AppButton variant="outline" onClick={() => setIsRescueModalOpen(false)} className="cursor-pointer">Annuler</AppButton>
            <AppButton variant="primary" onClick={handleRescueSubmit} className="cursor-pointer">Admettre en réanimation</AppButton>
          </div>

        </div>
      </AppModal>

      {/* --- 4. PROTOCOL DIALOG --- */}
      <AppModal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
        title="Créer un Protocole Alimentaire par Espèce"
        size="md"
      >
        <div className="space-y-4 font-sans text-xs">
          
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-600">Espèce de l'oiseau</label>
            <AppSelect
              value={newProtoSpecies}
              onChange={(e) => setNewProtoSpecies(e.target.value)}
              options={[
                { value: "Canari", label: "Canari" },
                { value: "Perruche", label: "Perruche" },
                { value: "Chardonneret", label: "Chardonneret" },
                { value: "Exotique", label: "Moineau du Japon / Diamant" }
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-600">Nom du protocole d'élevage manuel</label>
            <AppInput
              type="text"
              value={newProtoName}
              onChange={(e) => setNewProtoName(e.target.value)}
              placeholder="Ex: Protocole canari intensif J0-J21"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-600">Remarques, consignes & avertissements</label>
            <AppInput
              type="text"
              value={newProtoRemarks}
              onChange={(e) => setNewProtoRemarks(e.target.value)}
              placeholder="Ex: Attention à l'asphyxie par gavage précoce, surveiller l'humidité..."
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <AppButton variant="outline" onClick={() => setIsProtocolModalOpen(false)} className="cursor-pointer">Annuler</AppButton>
            <AppButton variant="primary" onClick={handleProtocolSubmit} className="cursor-pointer">Générer le protocole</AppButton>
          </div>

        </div>
      </AppModal>

    </div>
  );
}
