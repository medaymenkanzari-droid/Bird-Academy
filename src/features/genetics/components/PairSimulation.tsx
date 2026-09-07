/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Canari } from '../../../types';
import { GeneticsEngine } from '../engines/GeneticsEngine';
import { HealthEngine } from '../../../business/HealthEngine';
import { useLanguage } from '../../../context/LanguageContext';
import { translateGenetics } from '../utils/geneticsTranslations';
import { 
  HeartHandshake, ShieldCheck, AlertOctagon, Users, Sparkles, 
  Dna, Search, X, Check, ArrowRight, Activity, Percent 
} from 'lucide-react';
import { 
  AppAvatar, 
  SpeciesBadge, 
  WrightConsanguinityGauge, 
  AppModal,
  AppBadge
} from '../../../components/design-system';

interface PairSimulationProps {
  birds: Canari[];
}

export const PairSimulation: React.FC<PairSimulationProps> = ({ birds }) => {
  const { language, isRtl } = useLanguage();
  const gt = (key: string, variables?: Record<string, string | number>) => translateGenetics(language, key, variables);
  
  const [maleId, setMaleId] = useState<number | ''>(() => {
    try {
      const stored = localStorage.getItem('ba_selected_pair_bird');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id && (parsed.sexe === 'Mâle' || parsed.sexe === 'Male')) {
          return parsed.id;
        }
      }
    } catch {}
    return '';
  });

  const [femaleId, setFemaleId] = useState<number | ''>(() => {
    try {
      const stored = localStorage.getItem('ba_selected_pair_bird');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.id && (parsed.sexe === 'Femelle' || parsed.sexe === 'Female')) {
          return parsed.id;
        }
      }
    } catch {}
    return '';
  });
  const [malePickerOpen, setMalePickerOpen] = useState(false);
  const [femalePickerOpen, setFemalePickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract active males & females
  const males = useMemo(() => {
    return birds.filter(b => ((b.sexe as string) === 'Mâle' || (b.sexe as string) === 'Male') && HealthEngine.isEligiblePatient(b));
  }, [birds]);

  const females = useMemo(() => {
    return birds.filter(b => ((b.sexe as string) === 'Femelle' || (b.sexe as string) === 'Female') && HealthEngine.isEligiblePatient(b));
  }, [birds]);

  // Execute pairing simulation if both selected
  const simulationResult = useMemo(() => {
    if (!maleId || !femaleId) return null;
    return GeneticsEngine.simulatePairing(Number(maleId), Number(femaleId), birds);
  }, [maleId, femaleId, birds]);

  const maleBird = useMemo(() => {
    return birds.find(b => b.id === Number(maleId)) || null;
  }, [birds, maleId]);

  const femaleBird = useMemo(() => {
    return birds.find(b => b.id === Number(femaleId)) || null;
  }, [birds, femaleId]);

  // Filter lists for modal pickers
  const filteredMales = useMemo(() => {
    if (!searchQuery) return males;
    const q = searchQuery.toLowerCase();
    return males.filter(m => (m.nom && m.nom.toLowerCase().includes(q)) || m.bague.toLowerCase().includes(q) || (m.mutation && m.mutation.toLowerCase().includes(q)));
  }, [males, searchQuery]);

  const filteredFemales = useMemo(() => {
    if (!searchQuery) return females;
    const q = searchQuery.toLowerCase();
    return females.filter(f => (f.nom && f.nom.toLowerCase().includes(q)) || f.bague.toLowerCase().includes(q) || (f.mutation && f.mutation.toLowerCase().includes(q)));
  }, [females, searchQuery]);

  // Format common ancestors for WrightConsanguinityGauge
  const gaugeCommonAncestors = useMemo(() => {
    if (!simulationResult?.wrightResult.commonAncestors) return [];
    return simulationResult.wrightResult.commonAncestors.map(anc => ({
      name: anc.nom,
      ringNumber: anc.bague,
      contribution: anc.contribution,
      paths: anc.paths,
    }));
  }, [simulationResult]);

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      
      {/* Banner */}
      <div className="p-6 bg-linear-to-r from-slate-900 via-slate-950 to-indigo-950 text-white rounded-3xl border border-slate-800 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-lg font-black tracking-tight flex items-center gap-2 mb-1.5">
            <HeartHandshake className="w-5 h-5 text-indigo-400" />
            <span>{gt('genetics.pair.title')}</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {gt('genetics.pair.subtitle')}
          </p>
        </div>
      </div>

      {/* PAIR SELECTOR: Large Touch-Friendly Slots (Sire x Dam) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Sire (Male) Selection Slot */}
        <div 
          onClick={() => {
            setSearchQuery('');
            setMalePickerOpen(true);
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer select-none relative group min-h-[120px] flex flex-col justify-between ${
            maleBird 
              ? 'bg-slate-900 border-sky-500/40 hover:border-sky-400/80 shadow-md ring-1 ring-sky-500/20' 
              : 'bg-slate-900/60 border-dashed border-slate-700/80 hover:border-sky-500/60 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>♂ {gt('genetics.pair.male')} (Père)</span>
            </span>
            {maleBird && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMaleId('');
                }}
                className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Désélectionner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {maleBird ? (
            <div className="flex items-center gap-3.5 my-1">
              <AppAvatar name={maleBird.nom || maleBird.bague} variant="male" size="lg" />
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-sm text-white truncate">{maleBird.nom || 'Sans nom'}</div>
                <div className="text-[11px] font-mono text-slate-400 truncate">Bague : <span className="text-slate-200">{maleBird.bague}</span></div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {maleBird.race && <span className="text-[9px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">{maleBird.race}</span>}
                  {maleBird.mutation && <span className="text-[9px] font-bold text-sky-300 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded-md">{maleBird.mutation}</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-3 text-center text-slate-400 group-hover:text-sky-300 transition-colors">
              <span className="text-xs font-bold block">+ Choisir un mâle reproducteur (♂)</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{males.length} mâle(s) disponible(s)</span>
            </div>
          )}

          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 mt-1">
            <span>{maleBird ? `${maleBird.couleur || 'Couleur standard'}` : 'Emplacement Sire'}</span>
            <span className="text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform">Changer ➔</span>
          </div>
        </div>

        {/* Dam (Female) Selection Slot */}
        <div 
          onClick={() => {
            setSearchQuery('');
            setFemalePickerOpen(true);
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer select-none relative group min-h-[120px] flex flex-col justify-between ${
            femaleBird 
              ? 'bg-slate-900 border-pink-500/40 hover:border-pink-400/80 shadow-md ring-1 ring-pink-500/20' 
              : 'bg-slate-900/60 border-dashed border-slate-700/80 hover:border-pink-500/60 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <span>♀ {gt('genetics.pair.female')} (Mère)</span>
            </span>
            {femaleBird && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFemaleId('');
                }}
                className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
                title="Désélectionner"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {femaleBird ? (
            <div className="flex items-center gap-3.5 my-1">
              <AppAvatar name={femaleBird.nom || femaleBird.bague} variant="female" size="lg" />
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-sm text-white truncate">{femaleBird.nom || 'Sans nom'}</div>
                <div className="text-[11px] font-mono text-slate-400 truncate">Bague : <span className="text-slate-200">{femaleBird.bague}</span></div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {femaleBird.race && <span className="text-[9px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">{femaleBird.race}</span>}
                  {femaleBird.mutation && <span className="text-[9px] font-bold text-pink-300 bg-pink-950/60 border border-pink-800/60 px-2 py-0.5 rounded-md">{femaleBird.mutation}</span>}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-3 text-center text-slate-400 group-hover:text-pink-300 transition-colors">
              <span className="text-xs font-bold block">+ Choisir une femelle reproductrice (♀)</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{females.length} femelle(s) disponible(s)</span>
            </div>
          )}

          <div className="text-[9px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 mt-1">
            <span>{femaleBird ? `${femaleBird.couleur || 'Couleur standard'}` : 'Emplacement Dam'}</span>
            <span className="text-pink-400 font-bold group-hover:translate-x-0.5 transition-transform">Changer ➔</span>
          </div>
        </div>

      </div>

      {/* SIMULATION RESULTS & PREDICTIONS VIEW */}
      {simulationResult ? (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Row: Consanguinity Gauge & Direct Evaluation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Wright Consanguinity Gauge Component */}
            <div className="lg:col-span-1">
              <WrightConsanguinityGauge
                coefficient={simulationResult.wrightResult.coefficient}
                commonAncestors={gaugeCommonAncestors}
                coverage={simulationResult.wrightResult.pedigreeCoverage}
                depth={simulationResult.wrightResult.pedigreeDepth}
                title="Consanguinité de Wright"
                subtitle="Analyse prédictive de la nichée"
                showScaleGuide={true}
              />
            </div>

            {/* Opportunities vs Risks & Recommendations */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Opportunities and Risks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opportunities */}
                <div className="p-4 bg-slate-900 border border-emerald-500/20 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wide text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{gt('genetics.pair.opportunities')}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {simulationResult.advantages.map((adv, i) => (
                      <li key={i} className="leading-relaxed list-disc list-inside text-slate-300">
                        {gt(adv.code, adv.variables)}
                      </li>
                    ))}
                    {simulationResult.advantages.length === 0 && (
                      <p className="text-xs text-slate-400 italic">{gt('genetics.pair.noAdvantages')}</p>
                    )}
                  </ul>
                </div>

                {/* Risks */}
                <div className="p-4 bg-slate-900 border border-rose-500/20 rounded-2xl space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wide text-rose-400 flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span>{gt('genetics.pair.risks')}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {simulationResult.risks.map((risk, i) => (
                      <li key={i} className="leading-relaxed list-disc list-inside text-slate-300">
                        {gt(risk.code, risk.variables)}
                      </li>
                    ))}
                    {simulationResult.risks.length === 0 && (
                      <p className="text-xs text-slate-400 italic">{gt('genetics.pair.noRisks')}</p>
                    )}
                  </ul>
                </div>
              </div>

              {/* Recommendation summary card */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{gt('genetics.pair.recommendation')}</span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300 font-medium">
                  {gt(simulationResult.summary.code, simulationResult.summary.variables)}
                </p>
              </div>

            </div>

          </div>

          {/* OFFSPRING OUTCOME PREDICTIONS SECTION */}
          {simulationResult.predictions && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-xl">
              
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                    <Dna className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Prédictions Génétiques de la Descendance
                    </h3>
                    <p className="text-xs text-slate-400">
                      Probabilités mendéliennes des phénotypes visibles et porteurs (F1)
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-slate-300">
                  Mendel Pro 2.0
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Phenotypes Probabilities */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-sky-400 flex items-center justify-between">
                    <span>Phénotypes Visuels Attendus</span>
                    <span className="text-[10px] font-mono text-slate-400">Total 100%</span>
                  </h4>

                  <div className="space-y-3">
                    {simulationResult.predictions.phenotypes.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2"
                      >
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-white flex items-center gap-2">
                            {item.sexCondition === 'female' && <span className="text-pink-400 font-mono">♀ Femelles</span>}
                            {item.sexCondition === 'male' && <span className="text-sky-400 font-mono">♂ Mâles</span>}
                            {item.name}
                          </span>
                          <span className="font-mono text-indigo-400 font-black text-sm">
                            {item.probability}%
                          </span>
                        </div>

                        {/* Visual Percentage Bar */}
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className="h-full rounded-full bg-linear-to-r from-indigo-500 to-sky-400 transition-all duration-700"
                            style={{ width: `${item.probability}%` }}
                          />
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Carrier Genotypes (Porteurs / Splits) */}
                <div className="space-y-3.5">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-amber-400 flex items-center justify-between">
                    <span>Génotypes Porteurs (Splits)</span>
                    <span className="text-[10px] font-mono text-slate-400">Allèles masqués</span>
                  </h4>

                  <div className="space-y-3">
                    {simulationResult.predictions.carriers.length > 0 ? (
                      simulationResult.predictions.carriers.map((item) => (
                        <div 
                          key={item.id} 
                          className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2"
                        >
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-amber-300 flex items-center gap-2">
                              {item.name}
                            </span>
                            <span className="font-mono text-amber-400 font-black text-sm">
                              {item.probability}%
                            </span>
                          </div>

                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className="h-full rounded-full bg-linear-to-r from-amber-500 to-orange-400 transition-all duration-700"
                              style={{ width: `${item.probability}%` }}
                            />
                          </div>

                          {item.description && (
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-6 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-400 space-y-1">
                        <p className="font-semibold text-slate-300">Aucun portage récessif attendu</p>
                        <p className="text-[11px]">Les deux géniteurs n'induisent pas de mutation portée connue.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Summary Notes */}
              {simulationResult.predictions.summaryNotes.length > 0 && (
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-indigo-500/20 text-xs text-slate-300 space-y-1.5">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Synthèse de l'accouplement
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                    {simulationResult.predictions.summaryNotes.map((note, nIdx) => (
                      <li key={nIdx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-3">
          <HeartHandshake className="w-10 h-10 text-indigo-400 animate-pulse" />
          <h4 className="text-sm font-bold text-white">
            {maleId || femaleId
              ? 'Sélectionnez le second partenaire pour lancer la simulation.'
              : gt('genetics.pair.ready')}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            {gt('genetics.pair.readyDesc')}
          </p>
        </div>
      )}

      {/* MALE PICKER MODAL */}
      <AppModal
        isOpen={malePickerOpen}
        onClose={() => setMalePickerOpen(false)}
        title="Sélectionner le Mâle Reproducteur (♂)"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher nom, bague, mutation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {filteredMales.length > 0 ? (
              filteredMales.map((m) => {
                const isSelected = maleId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      setMaleId(m.id);
                      setMalePickerOpen(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-sky-950/40 border-sky-500 text-white' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AppAvatar name={m.nom || m.bague} variant="male" size="md" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{m.nom || 'Sans nom'}</div>
                        <div className="text-[10px] font-mono text-slate-400">Bague : {m.bague}</div>
                        <div className="text-[10px] text-slate-400">{m.race} • {m.mutation || m.couleur || 'Standard'}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">Aucun mâle disponible trouvé.</p>
            )}
          </div>
        </div>
      </AppModal>

      {/* FEMALE PICKER MODAL */}
      <AppModal
        isOpen={femalePickerOpen}
        onClose={() => setFemalePickerOpen(false)}
        title="Sélectionner la Femelle Reproductrice (♀)"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher nom, bague, mutation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {filteredFemales.length > 0 ? (
              filteredFemales.map((f) => {
                const isSelected = femaleId === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      setFemaleId(f.id);
                      setFemalePickerOpen(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-pink-950/40 border-pink-500 text-white' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AppAvatar name={f.nom || f.bague} variant="female" size="md" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate">{f.nom || 'Sans nom'}</div>
                        <div className="text-[10px] font-mono text-slate-400">Bague : {f.bague}</div>
                        <div className="text-[10px] text-slate-400">{f.race} • {f.mutation || f.couleur || 'Standard'}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-pink-400 shrink-0" />}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">Aucune femelle disponible trouvée.</p>
            )}
          </div>
        </div>
      </AppModal>

    </div>
  );
};

export default PairSimulation;
