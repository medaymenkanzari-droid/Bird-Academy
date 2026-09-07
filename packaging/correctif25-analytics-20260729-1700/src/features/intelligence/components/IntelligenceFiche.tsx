/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Canari } from '../../../types';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { IntelligenceService } from '../services/IntelligenceService';
import { ProgressScore, ConfidenceBadge } from '../widgets/Widgets';
import { AppButton } from '../../../components/design-system';
import { Bird, ShieldAlert, Award, AlertCircle, Heart, Zap, FileText } from 'lucide-react';

export const IntelligenceFiche: React.FC = () => {
  const [birds, setBirds] = useState<Canari[]>([]);
  const [selectedBirdId, setSelectedBirdId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    const list = BirdRepository.getAll();
    setBirds(list);
    if (list.length > 0) {
      setSelectedBirdId(list[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedBirdId !== null) {
      const result = IntelligenceService.getBirdFiche(selectedBirdId);
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  }, [selectedBirdId]);

  const activeBird = birds.find(b => b.id === selectedBirdId);

  return (
    <div className="space-y-6">
      {/* Selection row */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Fiche d'Analyse Individuelle</h3>
          <p className="text-[11px] text-slate-500">Sélectionnez un oiseau pour diagnostiquer ses performances reproductives, sa fiabilité et sa santé.</p>
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedBirdId || ''}
            onChange={(e) => setSelectedBirdId(Number(e.target.value) || null)}
            className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">-- Choisir un oiseau --</option>
            {birds.map(b => (
              <option key={b.id} value={b.id}>
                {b.nom ? `${b.nom} (${b.bague})` : b.bague} - {b.sexe}
              </option>
            ))}
          </select>
        </div>
      </div>

      {activeBird && analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main profile card */}
          <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center shadow-xs">
            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 relative overflow-hidden">
              {activeBird.photo ? (
                <img src={activeBird.photo} alt={activeBird.nom} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Bird className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">{activeBird.nom || 'Sans nom'}</h4>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{activeBird.bague}</p>

            <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-bold">
                {activeBird.sexe}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-bold">
                {activeBird.race}
              </span>
            </div>

            <div className="w-full border-t border-slate-100 dark:border-slate-800 my-4 pt-4 space-y-3 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Âge calculé</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{analysis.ageMonths} mois</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Cycles de repro</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{analysis.breedingCount} accouplements</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Descendance directe</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{analysis.offspringCount} oisillons</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Alertes médicales</span>
                <span className={`font-bold ${analysis.healthIncidentCount > 0 ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {analysis.healthIncidentCount} incident(s)
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-left">
              <ProgressScore score={analysis.dataCompleteness} />
              <div className="flex justify-between items-center mt-2.5">
                <span className="text-[10px] text-slate-500 font-bold">Fiabilité généalogique</span>
                <ConfidenceBadge level={analysis.dataCompleteness >= 80 ? 'high' : analysis.dataCompleteness >= 50 ? 'medium' : 'low'} />
              </div>
            </div>
          </div>

          {/* Diagnostics and recommendations */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Strengths & Weaknesses */}
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4">Profil de performances d'élevage</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Strengths */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                    <Award className="w-4 h-4" />
                    <span>Forces & Atouts</span>
                  </div>
                  {analysis.strengths.length > 0 ? (
                    <div className="space-y-1.5">
                      {analysis.strengths.map((str: string, idx: number) => (
                        <div key={idx} className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed">
                          ✓ {str}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">Aucune force reproductive ou biologique majeure documentée.</p>
                  )}
                </div>

                {/* Weaknesses */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Points de vigilance</span>
                  </div>
                  {analysis.weaknesses.length > 0 ? (
                    <div className="space-y-1.5">
                      {analysis.weaknesses.map((weak: string, idx: number) => (
                        <div key={idx} className="p-2.5 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 font-semibold leading-relaxed">
                          ⚠ {weak}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">Aucun facteur de risque ou vulnérabilité critique signalé.</p>
                  )}
                </div>

              </div>
            </div>

            {/* Decision Support Recommendations */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl border border-slate-800 text-white shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Plan d'Accompagnement DSS Préconisé</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-4">
                Ces préconisations sont générées de façon déterministe et locale en croisant l'âge du sujet, son historique de ponte, et sa stabilité clinique sur les 12 derniers mois.
              </p>
              <div className="space-y-2">
                {analysis.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="p-3 bg-white/5 dark:bg-slate-900/40 border border-white/10 rounded-xl flex items-start gap-2.5">
                    <div className="p-1 bg-amber-500 rounded text-slate-950 mt-0.5">
                      <AlertCircle className="w-3 h-3" />
                    </div>
                    <p className="text-[11px] text-slate-100 font-semibold leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500">Aucun oiseau n'est disponible pour l'analyse.</p>
        </div>
      )}
    </div>
  );
};
