/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Canari } from '../../../types';
import { GeneticsEngine } from '../engines/GeneticsEngine';
import { 
  HeartHandshake, ShieldCheck, AlertOctagon, Info, Flame, Users, Sparkles, AlertTriangle 
} from 'lucide-react';
import { InbreedingGauge } from '../widgets/GeneticsWidgets';

interface PairSimulationProps {
  birds: Canari[];
}

export const PairSimulation: React.FC<PairSimulationProps> = ({ birds }) => {
  const [maleId, setMaleId] = useState<number | ''>('');
  const [femaleId, setFemaleId] = useState<number | ''>('');

  // Extract active males & females
  const males = useMemo(() => {
    return birds.filter(b => b.sexe === 'Mâle' && !b.archived);
  }, [birds]);

  const females = useMemo(() => {
    return birds.filter(b => b.sexe === 'Femelle' && !b.archived);
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

  return (
    <div className="space-y-6">
      <div className="p-6 bg-linear-to-r from-indigo-900 to-indigo-950 text-white rounded-3xl border border-indigo-800 shadow-md">
        <h2 className="text-lg font-black tracking-tight flex items-center gap-2 mb-1.5">
          <HeartHandshake className="w-5 h-5 text-pink-400" />
          <span>Simulateur d'Accouplements Prédictif</span>
        </h2>
        <p className="text-xs text-indigo-200 max-w-2xl leading-relaxed">
          Sélectionnez un couple potentiel pour évaluer instantanément son coefficient de consanguinité de Wright, recenser ses ancêtres communs directs et analyser ses opportunités esthétiques ou risques biologiques.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Selection panels */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800">
              Sélection des Partenaires
            </h3>

            {/* Male selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wide text-sky-600 block">♂ Mâle reproducteur</label>
              <select
                value={maleId}
                onChange={(e) => setMaleId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Sélectionner un mâle...</option>
                {males.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.nom || 'Sans nom'} - {m.bague} {m.mutation ? `(${m.mutation})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Female selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wide text-pink-600 block">♀ Femelle reproductrice</label>
              <select
                value={femaleId}
                onChange={(e) => setFemaleId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Sélectionner une femelle...</option>
                {females.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.nom || 'Sans nom'} - {f.bague} {f.mutation ? `(${f.mutation})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Stats overview */}
          {maleBird && femaleBird && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs space-y-2.5">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[9px] text-slate-400">Synthèse phénotypique</h4>
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Race Mâle :</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{maleBird.race || 'Canari commun'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Race Femelle :</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{femaleBird.race || 'Canari commun'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Couleur Mâle :</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{maleBird.couleur || 'Non spécifié'}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Couleur Femelle :</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{femaleBird.couleur || 'Non spécifié'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Area: Results representation */}
        <div className="lg:col-span-2 space-y-6">
          {simulationResult ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              
              {/* Gauge Column */}
              <div className="md:col-span-1">
                <InbreedingGauge wrightResult={simulationResult.wrightResult} />
              </div>

              {/* Analysis & Lists Columns */}
              <div className="md:col-span-2 space-y-6">
                
                {/* Advantages vs Risks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Advantages */}
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/60 dark:border-emerald-900/60 rounded-xl space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-wide text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Opportunités & Vigueur</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {simulationResult.advantages.map((adv, i) => (
                        <li key={i} className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed list-disc list-inside">
                          {adv}
                        </li>
                      ))}
                      {simulationResult.advantages.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">Aucun avantage de vigueur identifié.</p>
                      )}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="p-4 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/60 dark:border-rose-900/60 rounded-xl space-y-2">
                    <h4 className="text-[10px] font-black uppercase tracking-wide text-rose-700 dark:text-rose-400 flex items-center gap-1">
                      <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                      <span>Risques & Vulnérabilités</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {simulationResult.risks.map((risk, i) => (
                        <li key={i} className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed list-disc list-inside">
                          {risk}
                        </li>
                      ))}
                      {simulationResult.risks.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">Aucun risque génétique élevé recensé.</p>
                      )}
                    </ul>
                  </div>
                </div>

                {/* DSS Recommendations and summary */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800/80 pb-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">Recommandation du Système Expert</h4>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {simulationResult.summary}
                  </p>
                </div>

                {/* Common Ancestors Paths */}
                {simulationResult.wrightResult.commonAncestors.length > 0 && (
                  <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3">
                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <Users className="w-4 h-4 text-indigo-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Ancêtres Communs Répertoriés ({simulationResult.wrightResult.commonAncestors.length})
                      </h4>
                    </div>

                    <div className="space-y-2.5 max-h-48 overflow-y-auto">
                      {simulationResult.wrightResult.commonAncestors.map((anc) => (
                        <div key={anc.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100/60 dark:border-slate-800/40 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{anc.nom} ({anc.bague})</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 font-mono font-bold text-[9px]">
                              Contrib: +{(anc.contribution * 100).toFixed(3)}%
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {anc.paths.slice(0, 2).map((path, pIdx) => (
                              <div key={pIdx} className="text-[9px] text-slate-400 font-mono leading-relaxed truncate">
                                → {path}
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
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-2">
              <HeartHandshake className="w-10 h-10 text-slate-300 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Prêt pour la simulation</h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Veuillez sélectionner un mâle et une femelle reproducteurs dans la colonne de gauche pour débuter l'analyse.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
