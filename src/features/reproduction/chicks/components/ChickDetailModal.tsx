/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { 
  Scale, Calendar, Apple, HelpCircle, AlertTriangle, 
  ShieldCheck, TrendingUp, Plus, Info, Clock, Activity, Edit3, User
} from 'lucide-react';
import { Chick, LifeCycleEvent } from '../types';
import { ChickService } from '../services/ChickService';
import { GrowthService } from '../../growth/services/GrowthService';
import { WeaningService } from '../../weaning/services/WeaningService';
import { useLanguage } from '../../../../context/LanguageContext';
import { BIO_TRANSLATIONS } from '../../utils/bioTranslations';
import { 
  AppModal, AppButton, AppInput, AppSelect, AppBadge, AppCard 
} from '../../../../components/design-system';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface ChickDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  chick: Chick;
  onRefresh: () => void;
}

export default function ChickDetailModal({ isOpen, onClose, chick, onRefresh }: ChickDetailModalProps) {
  const { language } = useLanguage();

  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    const dict = BIO_TRANSLATIONS[language] || BIO_TRANSLATIONS['fr'];
    let text = dict[key] || BIO_TRANSLATIONS['fr'][key] || String(key);
    if (variables) {
      Object.entries(variables).forEach(([k, val]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(val));
      });
    }
    return text;
  }, [language]);

  // States
  const [activeSubTab, setActiveSubTab] = useState<'evolution' | 'feeding' | 'weaning'>('evolution');
  const [showLogWeight, setShowLogWeight] = useState(false);
  const [showLogGrowth, setShowLogGrowth] = useState(false);
  const [showLogFeeding, setShowLogFeeding] = useState(false);
  const [showWean, setShowWean] = useState(false);
  const [showPromote, setShowPromote] = useState(false);

  // Edit fields
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState(chick.name);
  const [editRing, setEditRing] = useState(chick.provisionalNumber);
  const [editGender, setEditGender] = useState(chick.gender);
  const [editObs, setEditObs] = useState(chick.observations);

  // Log weight fields
  const [wtDate, setWtDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [wtWeight, setWtWeight] = useState('');
  const [wtNotes, setWtNotes] = useState('');

  // Log growth fields
  const [grDate, setGrDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [grWeight, setGrWeight] = useState('');
  const [grEyes, setGrEyes] = useState(false);
  const [grFeathers, setGrFeathers] = useState(false);
  const [grNest, setGrNest] = useState(false);
  const [grAutoFeed, setGrAutoFeed] = useState(false);
  const [grStatus, setGrStatus] = useState<'normal' | 'slow' | 'abnormal'>('normal');
  const [grObs, setGrObs] = useState('');

  // Log feeding fields
  const [fdDate, setFdDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fdType, setFdType] = useState<'parents' | 'eam' | 'mixte'>('parents');
  const [fdFormula, setFdFormula] = useState('');
  const [fdFrequency, setFdFrequency] = useState('');
  const [fdQty, setFdQty] = useState('');
  const [fdNotes, setFdNotes] = useState('');

  // Wean fields
  const [weanDate, setWeanDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [weanWeight, setWeanWeight] = useState('');
  const [weanStatus, setWeanStatus] = useState<'success' | 'abandoned' | 'failed'>('success');
  const [weanObs, setWeanObs] = useState('');

  // Promote fields
  const [finalRing, setFinalRing] = useState('');
  const [finalCage, setFinalCage] = useState('1');
  const [finalName, setFinalName] = useState(chick.name);

  // Data fetching
  const weights = useMemo(() => {
    return GrowthService.getWeightRecords(chick.id);
  }, [chick.id, showLogWeight, showLogGrowth]);

  const feedings = useMemo(() => {
    return GrowthService.getFeedingRecords(chick.id);
  }, [chick.id, showLogFeeding]);

  const timeline = useMemo(() => {
    return ChickService.getTimeline(chick.id);
  }, [chick.id, showLogWeight, showLogGrowth, showLogFeeding, showWean, showPromote, isEditingInfo]);

  const stats = useMemo(() => {
    return ChickService.getStatistics(chick.id);
  }, [chick.id, weights]);

  // Chart Data preparation
  const chartData = useMemo(() => {
    const rawBirthDate = new Date(chick.hatchDate);
    const list = weights.map(w => {
      const dateW = new Date(w.date);
      const ageDays = Math.max(0, Math.round((dateW.getTime() - rawBirthDate.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        age: ageDays,
        actual: w.weight,
        expected: parseFloat(ChickService.getExpectedWeightByAge(ageDays).toFixed(1)),
      };
    }).sort((a, b) => a.age - b.age);

    // If empty, put birth weight
    if (list.length === 0) {
      return [{
        age: 0,
        actual: chick.birthWeight,
        expected: 1.5
      }];
    }
    return list;
  }, [chick, weights]);

  // Save info edit
  const handleSaveInfo = () => {
    const updated = {
      ...chick,
      name: editName,
      provisionalNumber: editRing,
      gender: editGender as any,
      observations: editObs
    };
    ChickService.updateChick(updated);
    setIsEditingInfo(false);
    onRefresh();
  };

  // Handlers
  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(wtWeight);
    if (!isNaN(w) && w > 0) {
      GrowthService.addWeight(chick.id, wtDate, w, wtNotes);
      setWtWeight('');
      setWtNotes('');
      setShowLogWeight(false);
      onRefresh();
    }
  };

  const handleLogGrowth = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(grWeight);
    if (!isNaN(w) && w > 0) {
      GrowthService.addGrowthRecord(
        chick.id,
        grDate,
        w,
        grEyes,
        grFeathers,
        grNest,
        grAutoFeed,
        grObs,
        grStatus
      );
      setGrWeight('');
      setGrObs('');
      setShowLogGrowth(false);
      onRefresh();
    }
  };

  const handleLogFeeding = (e: React.FormEvent) => {
    e.preventDefault();
    GrowthService.addFeeding(
      chick.id,
      fdDate,
      fdType,
      fdFormula || undefined,
      fdFrequency ? parseInt(fdFrequency) : undefined,
      fdQty || undefined,
      fdNotes || undefined
    );
    setFdFormula('');
    setFdFrequency('');
    setFdQty('');
    setFdNotes('');
    setShowLogFeeding(false);
    onRefresh();
  };

  const handleFinalizeWeaning = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weanWeight);
    if (!isNaN(w) && w > 0) {
      WeaningService.finalizeWeaning(chick.id, weanDate, w, weanStatus, weanObs);
      setWeanWeight('');
      setWeanObs('');
      setShowWean(false);
      onRefresh();
    }
  };

  const handlePromote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalRing) return;
    const result = WeaningService.promoteToIndependentBird(
      chick.id,
      finalRing,
      parseInt(finalCage),
      finalName
    );
    if (result.success) {
      setShowPromote(false);
      onRefresh();
    } else {
      alert(result.message);
    }
  };

  // Helpers
  const getStatusLabelAndColor = (status: string) => {
    switch (status) {
      case 'hatching':
        return { label: "Éclosion", color: "bg-blue-50 text-blue-700 border-blue-100" };
      case 'growth':
        return { label: "Croissance", color: "bg-amber-50 text-amber-700 border-amber-100" };
      case 'weaning':
        return { label: "Sevrage", color: "bg-indigo-50 text-indigo-700 border-indigo-100" };
      case 'weaned':
        return { label: "Sevré", color: "bg-emerald-50 text-emerald-700 border-emerald-100 font-extrabold" };
      case 'deceased':
        return { label: "Décédé", color: "bg-red-50 text-red-700 border-red-100" };
      case 'independent':
        return { label: "Oiseau Indépendant", color: "bg-purple-50 text-purple-700 border-purple-100 font-extrabold" };
      default:
        return { label: status, color: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fiche Biologique : ${chick.name}`}
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-sans">
        {/* Left Column: Stats and core identity card */}
        <div className="lg:col-span-1 space-y-4">
          <AppCard padding="md" className="border-slate-200/60 bg-slate-50/20">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500">
                Identité du Poussin
              </h4>
              {!isEditingInfo && (
                <button 
                  onClick={() => setIsEditingInfo(true)} 
                  className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isEditingInfo ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nom</label>
                  <AppInput value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Numéro provisoire</label>
                  <AppInput value={editRing} onChange={(e) => setEditRing(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Sexe estimé</label>
                  <AppSelect
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value as any)}
                    options={[
                      { value: 'Indéterminé', label: 'Indéterminé' },
                      { value: 'Mâle', label: 'Mâle' },
                      { value: 'Femelle', label: 'Femelle' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Observations</label>
                  <textarea
                    value={editObs}
                    onChange={(e) => setEditObs(e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  />
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <AppButton size="sm" variant="outline" onClick={() => setIsEditingInfo(false)}>Annuler</AppButton>
                  <AppButton size="sm" variant="success" onClick={handleSaveInfo}>Sauvegarder</AppButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 text-xs">Statut</span>
                  <AppBadge variant="outline" className={getStatusLabelAndColor(chick.status).color}>
                    {getStatusLabelAndColor(chick.status).label}
                  </AppBadge>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 text-xs">Bague provisoire</span>
                  <span className="font-bold text-slate-700">{chick.provisionalNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 text-xs">Date d'éclosion</span>
                  <span className="font-semibold text-slate-700">{chick.hatchDate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 text-xs">Âge biologique</span>
                  <span className="font-bold text-amber-600">{stats?.ageDays} jours</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 text-xs">Poids de naissance</span>
                  <span className="font-semibold text-slate-700">{chick.birthWeight}g</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 text-xs">Sexe</span>
                  <span className="font-bold text-slate-700">{chick.gender}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase tracking-wider">Observations initiales</span>
                  <p className="text-xs text-slate-600 mt-0.5 italic">"{chick.observations || 'Aucune observation.'}"</p>
                </div>
              </div>
            )}
          </AppCard>

          {/* Biological Growth Summary */}
          {stats && (
            <AppCard padding="md" className="border-amber-100 bg-amber-50/10">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Diagnostic Biologique
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Vitesse de croissance</span>
                    <span className="font-extrabold text-slate-700 text-sm">+{stats.growthRate}g / jour</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>

                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Écart à la courbe idéale</span>
                    <span className={`font-extrabold text-sm ${stats.deviationPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {stats.deviationPercent >= 0 ? `+${stats.deviationPercent}%` : `${stats.deviationPercent}%`}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Idéal: {stats.expectedWeightForAge}g</div>
                </div>

                {stats.deviationPercent < -15 && (
                  <div className="p-2 bg-rose-50 text-rose-800 rounded-lg flex gap-1.5 items-start border border-rose-100">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Retard de croissance suspecté</p>
                      <p className="text-[10px] leading-snug mt-0.5">Le poids est inférieur à 15% de la moyenne idéale. Envisagez un complément EAM.</p>
                    </div>
                  </div>
                )}

                {stats.deviationPercent >= -15 && (
                  <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg flex gap-1.5 items-start border border-emerald-100">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Vigueur biologique optimale</p>
                      <p className="text-[10px] leading-snug mt-0.5">La dynamique de croissance est parfaitement sur la trajectoire scientifique.</p>
                    </div>
                  </div>
                )}
              </div>
            </AppCard>
          )}
        </div>

        {/* Right Column: Interactive panels */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sub-Tabs */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('evolution')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'evolution' 
                  ? 'bg-white shadow-xs text-amber-600 border border-slate-200/40' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
              Courbe de Croissance & Timeline
            </button>
            <button
              onClick={() => setActiveSubTab('feeding')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'feeding' 
                  ? 'bg-white shadow-xs text-amber-600 border border-slate-200/40' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Apple className="w-3.5 h-3.5 inline mr-1" />
              Suivi Alimentaire
            </button>
            <button
              onClick={() => setActiveSubTab('weaning')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'weaning' 
                  ? 'bg-white shadow-xs text-amber-600 border border-slate-200/40' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
              Sevrage & Promotion
            </button>
          </div>

          {/* Sub-Tab content */}
          <div className="min-h-[380px] space-y-4">
            {activeSubTab === 'evolution' && (
              <div className="space-y-4">
                {/* Weight graph */}
                <AppCard padding="sm" className="bg-white">
                  <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    Courbe pondérale comparée (g / Jours)
                  </h5>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="age" tick={{ fontSize: 9 }} stroke="#94a3b8" label={{ value: 'Âge (jours)', position: 'insideBottom', offset: -2, fontSize: 8 }} />
                        <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Line type="monotone" dataKey="actual" stroke="#f59e0b" name="Poids Réel (g)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="expected" stroke="#94a3b8" strokeDasharray="5 5" name="Modèle Idéal (g)" strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </AppCard>

                {/* Quick actions for evolution */}
                <div className="flex gap-2 justify-end">
                  <AppButton size="sm" variant="outline" onClick={() => setShowLogWeight(true)}>
                    <Scale className="w-3.5 h-3.5 mr-1" />
                    Enregistrer Pesée seule
                  </AppButton>
                  <AppButton size="sm" variant="success" onClick={() => setShowLogGrowth(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Ajouter Bilan de Croissance
                  </AppButton>
                </div>

                {/* Growth Record Logs */}
                <AppCard padding="sm">
                  <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    Timeline du Cycle de Vie (Historique)
                  </h5>

                  <div className="relative border-l border-slate-100 pl-4 py-1 space-y-3.5 max-h-[180px] overflow-y-auto">
                    {timeline.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Aucun événement enregistré.</p>
                    ) : (
                      timeline.map((ev) => (
                        <div key={ev.id} className="relative">
                          <span className="absolute -left-[21px] top-1 bg-white p-0.5 rounded-full ring-1 ring-slate-100">
                            <span className={`block w-2.5 h-2.5 rounded-full ${
                              ev.type === 'hatch' ? 'bg-blue-500' :
                              ev.type === 'weight' ? 'bg-amber-500' :
                              ev.type === 'weaning_complete' ? 'bg-emerald-500' :
                              ev.type === 'bird_creation' ? 'bg-purple-500' : 'bg-slate-400'
                            }`}></span>
                          </span>
                          <div>
                            <span className="block text-[8px] text-slate-400 font-mono">
                              {new Date(ev.timestamp).toLocaleString(language, { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                            </span>
                            <span className="block text-xs font-bold text-slate-700 leading-snug">
                              {ev.description}
                            </span>
                            {ev.notes && (
                              <p className="text-[10px] text-slate-500 mt-0.5 italic bg-slate-50 p-1.5 rounded-md">
                                "{ev.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </AppCard>
              </div>
            )}

            {activeSubTab === 'feeding' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Apple className="w-4 h-4 text-amber-500" />
                    Régimes & Nourrissage ({feedings.length} logs)
                  </h5>
                  <AppButton size="sm" variant="success" onClick={() => setShowLogFeeding(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Loguer Nourrissage
                  </AppButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {feedings.length === 0 ? (
                    <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center bg-slate-50/10">
                      <Apple className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-xs text-slate-400 font-bold">Aucun log alimentaire enregistré.</p>
                      <p className="text-[10px] text-slate-400 mt-1">Saisissez les régimes (nourrissage parents, mixte ou assistance EAM).</p>
                    </div>
                  ) : (
                    feedings.map((f) => (
                      <AppCard key={f.id} padding="sm" className="border-slate-100 bg-slate-50/20 text-left">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-1 mb-2">
                          <span className="text-[9px] font-mono text-slate-400">{f.date}</span>
                          <AppBadge variant="outline" className={
                            f.type === 'parents' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            f.type === 'eam' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                          }>
                            {f.type === 'parents' ? 'Parents' : f.type === 'eam' ? 'EAM (Main)' : 'Mixte'}
                          </AppBadge>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600">
                          {f.formula && <div><span className="text-slate-400">Pâtée :</span> <strong className="text-slate-700">{f.formula}</strong></div>}
                          {f.frequency && <div><span className="text-slate-400">Fréquence :</span> <strong className="text-slate-700">{f.frequency}x / jour</strong></div>}
                          {f.quantity && <div><span className="text-slate-400">Quantité :</span> <strong className="text-slate-700">{f.quantity}</strong></div>}
                          {f.notes && <p className="text-[10px] bg-white p-1 rounded border border-slate-100 italic mt-1.5">"{f.notes}"</p>}
                        </div>
                      </AppCard>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeSubTab === 'weaning' && (
              <div className="space-y-4">
                <AppCard padding="md" className="border-indigo-100 bg-indigo-50/5">
                  <h5 className="font-extrabold text-xs uppercase tracking-wider text-indigo-700 mb-2">
                    Cycle Biologique du Sevrage
                  </h5>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Le sevrage d'un canari débute généralement vers le 28e ou 30e jour, une fois qu'il a quitté le nid et commence à piquer les graines de lui-même. 
                    Finaliser le sevrage clôture officiellement son cycle "Poussin" et le qualifie pour intégrer le registre principal de l'académie en oiseau autonome.
                  </p>
                </AppCard>

                {chick.status !== 'weaned' && chick.status !== 'independent' ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200/60 rounded-2xl flex flex-col items-center justify-center bg-slate-50/30">
                    <ShieldCheck className="w-10 h-10 text-indigo-400 mb-2" />
                    <p className="text-xs font-bold text-slate-600">Poussin en cours de croissance</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs mb-4">
                      Âge recommandé de sevrage : 28 jours ou plus. Âge actuel : {stats?.ageDays} jours.
                    </p>
                    <AppButton size="sm" variant="success" onClick={() => setShowWean(true)}>
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      Lancer / Déclarer le Sevrage Complet
                    </AppButton>
                  </div>
                ) : chick.status === 'weaned' ? (
                  <div className="p-8 text-center border border-emerald-200 bg-emerald-50/20 rounded-2xl flex flex-col items-center justify-center">
                    <ShieldCheck className="w-12 h-12 text-emerald-500 mb-2" />
                    <p className="text-sm font-extrabold text-emerald-800">Sevrage finalisé avec succès !</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
                      Le poussin est sevré et vigoureux. Vous pouvez maintenant le promouvoir officiellement dans le registre de Bird Academy. 
                      Ses caractéristiques biologiques (espèce, race, mutation) et sa lignée parentale seront transférées automatiquement.
                    </p>
                    <AppButton size="sm" variant="success" onClick={() => setShowPromote(true)} className="animate-pulse shadow-md">
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Créer & Enregistrer l'Oiseau Indépendant
                    </AppButton>
                  </div>
                ) : (
                  <div className="p-8 text-center border border-purple-200 bg-purple-50/20 rounded-2xl flex flex-col items-center justify-center">
                    <User className="w-12 h-12 text-purple-500 mb-2" />
                    <p className="text-sm font-extrabold text-purple-800">Oiseau Indépendant Promu !</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Ce poussin a achevé son cycle de vie de ponte. Il est désormais enregistré de manière permanente comme un oiseau autonome dans le registre principal de l'académie. 
                      La traçabilité de sa descendance est garantie de bout en bout.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUB-MODALS */}

      {/* Log Weight Modal */}
      <AppModal isOpen={showLogWeight} onClose={() => setShowLogWeight(false)} title="Enregistrer une pesée" size="sm">
        <form onSubmit={handleLogWeight} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date</label>
            <AppInput type="date" value={wtDate} onChange={(e) => setWtDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Poids mesuré (g)</label>
            <input
              type="number"
              step="0.01"
              value={wtWeight}
              onChange={(e) => setWtWeight(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Remarques</label>
            <AppInput value={wtNotes} onChange={(e) => setWtNotes(e.target.value)} placeholder="Ex: Pesée du matin" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <AppButton size="sm" variant="outline" onClick={() => setShowLogWeight(false)}>Annuler</AppButton>
            <AppButton size="sm" type="submit" variant="success">Confirmer</AppButton>
          </div>
        </form>
      </AppModal>

      {/* Log Growth Modal */}
      <AppModal isOpen={showLogGrowth} onClose={() => setShowLogGrowth(false)} title="Nouveau Bilan de Croissance" size="md">
        <form onSubmit={handleLogGrowth} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date</label>
              <AppInput type="date" value={grDate} onChange={(e) => setGrDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Poids (g)</label>
              <input
                type="number"
                step="0.01"
                value={grWeight}
                onChange={(e) => setGrWeight(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">État de développement général</label>
            <AppSelect
              value={grStatus}
              onChange={(e) => setGrStatus(e.target.value as any)}
              options={[
                { value: 'normal', label: 'Développement normal' },
                { value: 'slow', label: 'Développement ralenti' },
                { value: 'abnormal', label: 'Anomalie / Urgence' },
              ]}
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-2.5">
            <h6 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Jalons & Organes observés</h6>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                <input type="checkbox" checked={grEyes} onChange={(e) => setGrEyes(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                Yeux ouverts
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                <input type="checkbox" checked={grFeathers} onChange={(e) => setGrFeathers(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                Plumes visibles
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                <input type="checkbox" checked={grNest} onChange={(e) => setGrNest(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                Sorti du nid
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                <input type="checkbox" checked={grAutoFeed} onChange={(e) => setGrAutoFeed(e.target.checked)} className="rounded text-amber-500 focus:ring-amber-500" />
                Alimentation autonome
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Observations qualitatives</label>
            <textarea
              value={grObs}
              onChange={(e) => setGrObs(e.target.value)}
              placeholder="Vitalité, fiente, comportement, demandes de pâtée..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <AppButton size="sm" variant="outline" onClick={() => setShowLogGrowth(false)}>Annuler</AppButton>
            <AppButton size="sm" type="submit" variant="success">Sauvegarder</AppButton>
          </div>
        </form>
      </AppModal>

      {/* Log Feeding Modal */}
      <AppModal isOpen={showLogFeeding} onClose={() => setShowLogFeeding(false)} title="Log de Nourrissage" size="md">
        <form onSubmit={handleLogFeeding} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date</label>
              <AppInput type="date" value={fdDate} onChange={(e) => setFdDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Type de nourrissage</label>
              <AppSelect
                value={fdType}
                onChange={(e) => setFdType(e.target.value as any)}
                options={[
                  { value: 'parents', label: 'Par les parents uniquement' },
                  { value: 'eam', label: 'EAM (Élevage à la main complet)' },
                  { value: 'mixte', label: 'Complémentation mixte' },
                ]}
              />
            </div>
          </div>

          {fdType !== 'parents' && (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Formule / Pâtée</label>
                <AppInput value={fdFormula} onChange={(e) => setFdFormula(e.target.value)} placeholder="Ex: NutriBird" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fréquence (/j)</label>
                <AppInput type="number" value={fdFrequency} onChange={(e) => setFdFrequency(e.target.value)} placeholder="Ex: 5" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Quantité (ml)</label>
                <AppInput value={fdQty} onChange={(e) => setFdQty(e.target.value)} placeholder="Ex: 1.5ml" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Notes complémentaires</label>
            <textarea
              value={fdNotes}
              onChange={(e) => setFdNotes(e.target.value)}
              placeholder="Satiété, digestion du jabot, température de la pâtée..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <AppButton size="sm" variant="outline" onClick={() => setShowLogFeeding(false)}>Annuler</AppButton>
            <AppButton size="sm" type="submit" variant="success">Enregistrer</AppButton>
          </div>
        </form>
      </AppModal>

      {/* Wean Modal */}
      <AppModal isOpen={showWean} onClose={() => setShowWean(false)} title="Finaliser le Sevrage Biologique" size="md">
        <form onSubmit={handleFinalizeWeaning} className="space-y-4 text-left">
          <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl text-xs leading-relaxed border border-indigo-100">
            Assurez-vous que le canari est pleinement capable de décortiquer les graines sèches par lui-même avant de finaliser le sevrage.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Date d'effet</label>
              <AppInput type="date" value={weanDate} onChange={(e) => setWeanDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Poids final de sevrage (g)</label>
              <input
                type="number"
                step="0.01"
                value={weanWeight}
                onChange={(e) => setWeanWeight(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Issue / Statut final</label>
            <AppSelect
              value={weanStatus}
              onChange={(e) => setWeanStatus(e.target.value as any)}
              options={[
                { value: 'success', label: 'Sevrage Réussi avec succès' },
                { value: 'abandoned', label: 'Sevrage abandonné (poursuite croissance)' },
                { value: 'failed', label: 'Échec de sevrage (Décès de l\'oiseau)' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Observations du Sevrage</label>
            <textarea
              value={weanObs}
              onChange={(e) => setWeanObs(e.target.value)}
              placeholder="Régime transitoire, musculation des ailes, comportement social..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <AppButton size="sm" variant="outline" onClick={() => setShowWean(false)}>Annuler</AppButton>
            <AppButton size="sm" type="submit" variant="success">Finaliser le Sevrage</AppButton>
          </div>
        </form>
      </AppModal>

      {/* Promote Modal */}
      <AppModal isOpen={showPromote} onClose={() => setShowPromote(false)} title="Promotion en Oiseau Autonome" size="md">
        <form onSubmit={handlePromote} className="space-y-4 text-left">
          <div className="p-3 bg-purple-50 text-purple-800 rounded-xl text-xs leading-relaxed border border-purple-100">
            L'oiseau sera automatiquement enregistré dans l'inventaire principal. Il héritera de l'arbre généalogique des parents reproducteurs (Père #{chick.pairId} et Mère) ainsi que de l'espèce et de la race.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nom Permanent</label>
            <AppInput value={finalName} onChange={(e) => setFinalName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Numéro de Bague Officiel (Unique)</label>
              <AppInput value={finalRing} onChange={(e) => setFinalRing(e.target.value)} placeholder="Ex: FR-2026-98765" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cage d'affectation</label>
              <AppSelect
                value={finalCage}
                onChange={(e) => setFinalCage(e.target.value)}
                options={[
                  { value: '1', label: 'Cage de volière n°1' },
                  { value: '2', label: 'Cage d\'élevage n°2' },
                  { value: '3', label: 'Cage de quarantaine' },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <AppButton size="sm" variant="outline" onClick={() => setShowPromote(false)}>Annuler</AppButton>
            <AppButton size="sm" type="submit" variant="success">Inscrire au Registre Officiel</AppButton>
          </div>
        </form>
      </AppModal>

    </AppModal>
  );
}
