/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Egg, Plus, Check, Play, Square, AlertCircle, Info, Calendar, Sparkles, CheckCircle, ArrowRight, X, Trash2 } from 'lucide-react';
import { Couple, Canari, Reproduction, Ponte, Jeune } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { SpeciesBadge } from './design-system';

interface ReproductionProps {
  reproductions: Reproduction[];
  couples: Couple[];
  canaris: Canari[];
  pontes: Ponte[];
  jeunes: Jeune[];
  onAddPonte: (reproductionId: number, date: string, oeufs: number) => void;
  onUpdatePonteStats: (ponteId: number, fecondes: number, eclosions: number, sevrages: number) => void;
  onCloseReproduction: (id: number) => void;
  onAddJeune: (ponteId: number, bague: string, dateNaissance: string) => void;
  onWeanJeuneToCanari: (jeuneId: number, nom: string, cageId: number, race: string, couleur: string) => void;
  cagesList: Array<{ id: number, nom: string }>;
}

const LOCAL_LABELS: Record<string, Record<string, string>> = {
  fr: {
    race: "Race",
    couleur: "Couleur",
    targetCage: "Cage de destination"
  },
  en: {
    race: "Breed",
    couleur: "Color",
    targetCage: "Destination cage"
  },
  ar: {
    race: "السلالة",
    couleur: "اللون",
    targetCage: "قفص الوجهة"
  },
  es: {
    race: "Raza",
    couleur: "Color",
    targetCage: "Jaula de destino"
  },
  it: {
    race: "Razza",
    couleur: "Colore",
    targetCage: "Gabbia di destinazione"
  }
};

export default function ReproductionComponent({
  reproductions,
  couples,
  canaris,
  pontes,
  jeunes,
  onAddPonte,
  onUpdatePonteStats,
  onCloseReproduction,
  onAddJeune,
  onWeanJeuneToCanari,
  cagesList
}: ReproductionProps) {
  const { t, currentLanguage } = useLanguage();
  // Navigation tabs inside reproduction: Active Cycles vs All
  const [activeCycleTab, setActiveCycleTab] = useState<'En cours' | 'Clôturé'>('En cours');
  const [selectedReproId, setSelectedReproId] = useState<number | null>(null);

  // Laying Form
  const [showPonteForm, setShowPonteForm] = useState(false);
  const [ponteDate, setPonteDate] = useState('2026-07-08');
  const [oeufsCount, setOeufsCount] = useState<number>(4);

  // Birth/Hatching declaration form
  const [showHatchForm, setShowHatchForm] = useState(false);
  const [hatchPonteId, setHatchPonteId] = useState<number | null>(null);
  const [eggsFecondes, setEggsFecondes] = useState<number>(4);
  const [eggsEclos, setEggsEclos] = useState<number>(3);

  // Weaning Form
  const [weaningJeuneId, setWeaningJeuneId] = useState<number | null>(null);
  const [weanNom, setWeanNom] = useState('');
  const [weanCageId, setWeanCageId] = useState<number>(cagesList[0]?.id || 1);
  const [weanRace, setWeanRace] = useState('Gloster Fancy');
  const [weanCouleur, setWeanCouleur] = useState('');

  // Selected reproduction and related models
  const selectedRepro = reproductions.find(r => r.id === selectedReproId);
  const relatedCouple = selectedRepro ? couples.find(c => c.id === selectedRepro.couple_id) : null;
  const maleBird = relatedCouple ? canaris.find(b => b.id === relatedCouple.male_id) : null;
  const femaleBird = relatedCouple ? canaris.find(b => b.id === relatedCouple.femelle_id) : null;

  // Filter layings (pontes) for selected cycle
  const currentPontes = selectedReproId 
    ? pontes.filter(p => p.reproduction_id === selectedReproId)
    : [];

  // Filter young birds (jeunes) born from these layings
  const currentPonteIds = currentPontes.map(p => p.id);
  const currentJeunes = jeunes.filter(j => currentPonteIds.includes(j.ponte_id));

  const labels = LOCAL_LABELS[currentLanguage] || LOCAL_LABELS.fr;

  const handlePonteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReproId && oeufsCount > 0) {
      onAddPonte(selectedReproId, ponteDate, oeufsCount);
      setShowPonteForm(false);
    }
  };

  const handleHatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hatchPonteId !== null) {
      // 1. Update stats in the laying object
      onUpdatePonteStats(hatchPonteId, eggsFecondes, eggsEclos, 0);
      
      // 2. Insert Jeune chick entries into database (pre-weaning)
      const targetPonte = pontes.find(p => p.id === hatchPonteId);
      const birthDate = targetPonte ? targetPonte.date : '2026-07-08';
      
      // Calculate hatching date (roughly 13 days after laying)
      const hatchEst = new Date(birthDate);
      hatchEst.setDate(hatchEst.getDate() + 13);
      const formattedHatchDate = hatchEst.toISOString().split('T')[0];

      for (let i = 0; i < eggsEclos; i++) {
        onAddJeune(hatchPonteId, '', formattedHatchDate);
      }

      setShowHatchForm(false);
      setHatchPonteId(null);
    }
  };

  const handleWeanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weaningJeuneId !== null) {
      onWeanJeuneToCanari(weaningJeuneId, weanNom, weanCageId, weanRace, weanCouleur);
      
      // Reset
      setWeaningJeuneId(null);
      setWeanNom('');
      setWeanCouleur('');
    }
  };

  const openHatchDeclaration = (p: Ponte) => {
    setHatchPonteId(p.id);
    setEggsFecondes(p.oeufs_fecondes || p.oeufs);
    setEggsEclos(p.eclosions || 0);
    setShowHatchForm(true);
  };

  const openWeaningForm = (j: Jeune) => {
    setWeaningJeuneId(j.id);
    
    // Auto-detect parents breed/color for prepopulating
    if (maleBird) {
      setWeanRace(maleBird.race);
      setWeanCouleur(maleBird.couleur + " & " + (femaleBird?.couleur || "panaché"));
    }
    const defaultWeanName = currentLanguage === 'ar'
      ? `فرخ من ${maleBird?.nom || "أب"} x ${femaleBird?.nom || "أم"}`
      : currentLanguage === 'en'
      ? `Young of ${maleBird?.nom || "Father"} x ${femaleBird?.nom || "Mother"}`
      : `Jeune de ${maleBird?.nom || "Père"} x ${femaleBird?.nom || "Mère"}`;

    setWeanNom(defaultWeanName);
    setWeanCageId(cagesList[0]?.id || 1);
  };

  // Filter cycles list based on active/clôturé filter tab
  const filteredRepros = reproductions.filter(r => r.statut === activeCycleTab);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t('reproductionTitle')}</h2>
        <p className="text-xs text-slate-500">
          {t('reproductionSub')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left columns: Cycles filtering & Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <div className="flex gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold mb-4 w-fit">
              {(['En cours', 'Clôturé'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveCycleTab(tab);
                    setSelectedReproId(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    activeCycleTab === tab ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t('cyclesTab', { status: tab === 'En cours' ? t('pendingLabel') : t('doneLabel') })}
                </button>
              ))}
            </div>

            {filteredRepros.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <Egg className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">
                  {t('noCycle', { status: activeCycleTab === 'En cours' ? t('pendingLabel').toLowerCase() : t('doneLabel').toLowerCase() })}
                </p>
                <p className="text-xs mt-1">
                  {activeCycleTab === 'En cours' 
                    ? t('noCycleInProgressDesc')
                    : t('noCycleClosedDesc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredRepros.map((repro) => {
                  const couple = couples.find(c => c.id === repro.couple_id);
                  const m = couple ? canaris.find(b => b.id === couple.male_id) : null;
                  const f = couple ? canaris.find(b => b.id === couple.femelle_id) : null;
                  const countEggs = pontes.filter(p => p.reproduction_id === repro.id).reduce((sum, p) => sum + p.oeufs, 0);
                  const countChicks = pontes.filter(p => p.reproduction_id === repro.id).reduce((sum, p) => sum + (p.eclosions || 0), 0);
                  const isSelected = selectedReproId === repro.id;

                  return (
                    <div
                      key={repro.id}
                      onClick={() => setSelectedReproId(repro.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected 
                          ? 'bg-yellow-50 border-yellow-300 shadow-xs' 
                          : 'bg-white border-slate-100 hover:border-slate-200 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="font-mono text-slate-400 font-bold">Repro #{repro.id}</span>
                          <span className="text-slate-500">{t('openedOn', { date: repro.date_debut })}</span>
                        </div>
                        
                        {/* Parent Names */}
                        <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-1">
                          <span className="text-blue-600 flex items-center gap-1">♂ {m ? m.nom : "—"} {m && <SpeciesBadge speciesId={m.espece} size="sm" showLabel={false} />}</span>
                          <span className="text-slate-300">x</span>
                          <span className="text-rose-600 font-semibold flex items-center gap-1">♀ {f ? f.nom : "—"} {f && <SpeciesBadge speciesId={f.espece} size="sm" showLabel={false} />}</span>
                        </div>
                      </div>

                      {/* Nest Summary Stats */}
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-100 flex justify-between items-center text-xs text-slate-600 mt-2">
                        <span className="flex items-center gap-1"><Egg className="w-3.5 h-3.5 text-yellow-500" /> {t('nestSummaryEggs', { count: countEggs })}</span>
                        <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-blue-500" /> {t('nestSummaryHatches', { count: countChicks })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Reproduction detail panel with egg tracking & baby weaning */}
        <div>
          {selectedReproId && selectedRepro ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
              {/* Couple Header */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Cycle #{selectedRepro.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedRepro.statut === 'En cours' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedRepro.statut === 'En cours' ? t('pendingLabel') : t('doneLabel')}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 text-sm mt-1.5">
                  {t('nestOf', { male: maleBird?.nom || "♂", female: femaleBird?.nom || "♀" })}
                </h3>
              </div>

              {/* Nest Layings Tracker */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('cycleLayingTitle')}</h4>
                  {selectedRepro.statut === 'En cours' && !showPonteForm && (
                    <button
                      onClick={() => {
                        setPonteDate(new Date().toISOString().split('T')[0]);
                        setShowPonteForm(true);
                      }}
                      className="text-xs font-semibold text-yellow-600 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t('registerPonte')}
                    </button>
                  )}
                </div>

                {/* Ponte adding Form */}
                {showPonteForm && (
                  <form onSubmit={handlePonteSubmit} className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-yellow-800 mb-1">{t('registerPonteTitle')}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">{t('dateLaying')}</label>
                        <input
                          type="date"
                          required
                          value={ponteDate}
                          onChange={(e) => setPonteDate(e.target.value)}
                          className="w-full bg-white p-1.5 border border-slate-200 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">{t('eggsNumber')}</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={10}
                          value={oeufsCount}
                          onChange={(e) => setOeufsCount(Number(e.target.value))}
                          className="w-full bg-white p-1.5 border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPonteForm(false)}
                        className="px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded text-xs cursor-pointer font-semibold"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-yellow-600 text-white rounded text-xs cursor-pointer font-bold"
                      >
                        {t('save')}
                      </button>
                    </div>
                  </form>
                )}

                {/* Layings list */}
                {currentPontes.length === 0 ? (
                  <p className="text-xs italic text-slate-400 py-3 text-center bg-slate-50 rounded-xl border">
                    {t('noPonteDeclared')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {currentPontes.map((p) => {
                      // Estimate hatch date (Laying date + 13 days)
                      const lDate = new Date(p.date);
                      const hatchEst = new Date(lDate);
                      hatchEst.setDate(lDate.getDate() + 13);
                      const formattedHatch = hatchEst.toLocaleDateString(currentLanguage, { day: 'numeric', month: 'short' });

                      return (
                        <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                          <div className="flex justify-between items-start font-semibold">
                            <span className="text-slate-800">{t('layingOfDate', { date: p.date })}</span>
                            <span className="bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                              {t('eggsCountBadge', { count: p.oeufs })}
                            </span>
                          </div>
                          
                          {/* Timings */}
                          <div className="mt-2 text-slate-500 space-y-1">
                            <div className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {t('estimatedHatching', { date: formattedHatch })}
                            </div>
                            
                            {p.eclosions !== undefined && p.eclosions > 0 ? (
                              <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] mt-1.5">
                                <CheckCircle className="w-3.5 h-3.5" /> {t('chicksBorn', { eclosions: p.eclosions, fecondes: p.oeufs_fecondes || 0 })}
                              </div>
                            ) : (
                              <div className="text-amber-600 font-semibold text-[10px] mt-1.5 flex items-center gap-1">
                                <Info className="w-3.5 h-3.5" /> {t('incubationInProgress')}
                              </div>
                            )}
                          </div>

                          {/* Hatch declaration button */}
                          {selectedRepro.statut === 'En cours' && (!p.eclosions || p.eclosions === 0) && (
                            <button
                              type="button"
                              onClick={() => openHatchDeclaration(p)}
                              className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-2.5 rounded text-[10px] cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> {t('declareBirth')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hatchings Births Declaration Modal / Overlay inside panel */}
              {showHatchForm && (
                <form onSubmit={handleHatchSubmit} className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> {t('declareBirthTitle')}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {t('declareBirthDesc')}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{t('eggsFecondes')}</label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={10}
                        value={eggsFecondes}
                        onChange={(e) => setEggsFecondes(Number(e.target.value))}
                        className="w-full bg-white p-1.5 border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{t('eggsEclos')}</label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={eggsFecondes}
                        value={eggsEclos}
                        onChange={(e) => setEggsEclos(Number(e.target.value))}
                        className="w-full bg-white p-1.5 border border-slate-200 rounded"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowHatchForm(false)}
                      className="px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded text-xs cursor-pointer font-semibold"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs cursor-pointer font-bold"
                    >
                      {t('validateBirth')}
                    </button>
                  </div>
                </form>
              )}

              {/* Young chicks before weaning tracking (Pre-Weaning) */}
              {currentJeunes.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('chicksFollowUp', { count: currentJeunes.length })}</h4>
                  
                  <div className="space-y-2">
                    {currentJeunes.map((j) => (
                      <div key={j.id} className="p-2.5 bg-yellow-50/40 rounded-xl border border-yellow-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-amber-950">{t('chickBadge', { id: j.id })}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{t('bornOn', { date: j.date_naissance })}</span>
                        </div>

                        {j.statut === 'En sevrage' && selectedRepro.statut === 'En cours' ? (
                          <button
                            onClick={() => openWeaningForm(j)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer flex items-center gap-0.5 font-sans"
                          >
                            {t('weanAndSeparate')} <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            {j.statut}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaning form overlay */}
              {weaningJeuneId && (
                <form onSubmit={handleWeanSubmit} className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-amber-800 flex items-center justify-between">
                    <span>{t('convertChickToAdult')}</span>
                    <button type="button" onClick={() => setWeaningJeuneId(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {t('weanChickDesc')}
                  </p>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{t('usualName')}</label>
                      <input
                        type="text"
                        required
                        value={weanNom}
                        onChange={(e) => setWeanNom(e.target.value)}
                        className="w-full bg-white p-2 border border-slate-200 rounded"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">{labels.race}</label>
                        <input
                          type="text"
                          required
                          value={weanRace}
                          onChange={(e) => setWeanRace(e.target.value)}
                          className="w-full bg-white p-2 border border-slate-200 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">{labels.couleur}</label>
                        <input
                          type="text"
                          required
                          value={weanCouleur}
                          onChange={(e) => setWeanCouleur(e.target.value)}
                          className="w-full bg-white p-2 border border-slate-200 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{labels.targetCage}</label>
                      <select
                        value={weanCageId}
                        onChange={(e) => setWeanCageId(Number(e.target.value))}
                        className="w-full bg-white p-2 border border-slate-200 rounded"
                      >
                        {cagesList.map(c => (
                          <option key={c.id} value={c.id}>{c.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded text-xs cursor-pointer mt-1"
                  >
                    {t('weanAndRegister')}
                  </button>
                </form>
              )}

              {/* Close cycle button */}
              {selectedRepro.statut === 'En cours' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t('closeReproConfirm'))) {
                      onCloseReproduction(selectedRepro.id);
                    }
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <Square className="w-3.5 h-3.5" /> {t('closeReproCycle')}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 flex flex-col justify-center items-center h-full min-h-[300px]">
              <Egg className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">{t('nestDetails')}</p>
              <p className="text-xs mt-1">{t('nestDetailsDesc')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
