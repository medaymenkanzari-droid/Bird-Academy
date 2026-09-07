/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { Canari } from '../../../types';
import { GeneticsEngine } from '../engines/GeneticsEngine';
import { WrightCoefficientEngine } from '../engines/WrightCoefficientEngine';
import { HealthEngine } from '../../../business/HealthEngine';
import { useLanguage } from '../../../context/LanguageContext';
import { translateGenetics } from '../utils/geneticsTranslations';
import { 
  Binary, Compass, Search, Info, Award, ShieldAlert, GitMerge 
} from 'lucide-react';
import { FounderStatistics, InbreedingGauge } from '../widgets/GeneticsWidgets';

interface LineageAnalysisProps {
  birds: Canari[];
}

export const LineageAnalysis: React.FC<LineageAnalysisProps> = ({ birds }) => {
  const { language } = useLanguage();
  const gt = (key: string, variables?: Record<string, string | number>) => translateGenetics(language, key, variables);
  const [selectedBirdId, setSelectedBirdId] = useState<number | null>(() => {
    const active = birds.filter(HealthEngine.isEligiblePatient);
    return active.length > 0 ? active[0].id : birds.length > 0 ? birds[0].id : null;
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedBirdId !== null || birds.length === 0) return;
    const firstEligible = birds.find(HealthEngine.isEligiblePatient);
    setSelectedBirdId(firstEligible?.id ?? null);
  }, [birds, selectedBirdId]);

  // Find selected bird
  const selectedBird = useMemo(() => {
    return birds.find(b => b.id === selectedBirdId) || null;
  }, [birds, selectedBirdId]);

  // Compute lineage analysis
  const lineageAnalysis = useMemo(() => {
    if (!selectedBirdId) return null;
    return GeneticsEngine.getLineageAnalysis(selectedBirdId, birds, 5);
  }, [selectedBirdId, birds]);

  // Compute individual Wright coefficient
  const individualWrightResult = useMemo(() => {
    if (!selectedBird) return null;
    // Wright coefficient of a single bird is calculated by simulating its parents mating
    if (selectedBird.pere_id && selectedBird.mere_id) {
      return WrightCoefficientEngine.calculateInbreeding(selectedBird.pere_id, selectedBird.mere_id, birds);
    }
    return WrightCoefficientEngine.calculateInbreeding(null, null, birds);
  }, [selectedBird, birds]);

  // Filter birds
  const filteredBirds = useMemo(() => {
    const active = birds.filter(HealthEngine.isEligiblePatient);
    if (!searchQuery) return active;
    const lowerQuery = searchQuery.toLowerCase();
    return active.filter(
      b => 
        (b.nom && b.nom.toLowerCase().includes(lowerQuery)) || 
        b.bague.toLowerCase().includes(lowerQuery)
    );
  }, [birds, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Bird Selector */}
        <div className="lg:col-span-1 p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col h-[600px] shadow-2xs">
          <div className="flex items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <Compass className="w-4.5 h-4.5 text-indigo-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">{gt('genetics.lineage.select')}</h3>
          </div>

          <div className="relative mb-3.5">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={gt('genetics.lineage.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Birds List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredBirds.map((b) => {
              const isSelected = b.id === selectedBirdId;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBirdId(b.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-950 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-300 font-bold'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold truncate max-w-[110px]">{b.nom || gt('genetics.noName')}</span>
                    <span className={`text-[8px] px-1.5 py-0.2 rounded-md ${
                      b.sexe === 'Mâle' ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/30' : 'bg-pink-50 text-pink-600 dark:bg-pink-950/30'
                    }`}>
                      {b.sexe}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {b.bague}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right column: Lineage analysis widgets and results */}
        <div className="lg:col-span-3 space-y-6">
          {selectedBird && lineageAnalysis && individualWrightResult ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Header card */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-2xs">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                    {gt('genetics.lineage.file')}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {gt('genetics.lineage.analysisFor', { name: selectedBird.nom || gt('genetics.noName'), ring: selectedBird.bague })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 block">{gt('genetics.lineage.coverageIndex')}</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{lineageAnalysis.pedigreeCompleteness}%</span>
                </div>
              </div>

              {/* Grid of Gauges & Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InbreedingGauge wrightResult={individualWrightResult} />
                <FounderStatistics analysis={lineageAnalysis} />
              </div>

              {/* Lineage Analysis Details */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
                <div className="flex items-center gap-1.5 border-b border-slate-50 dark:border-slate-800 pb-2">
                  <GitMerge className="w-4.5 h-4.5 text-indigo-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {gt('genetics.lineage.details')}
                  </h4>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Main Branches */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{gt('genetics.lineage.parentBranches')} :</span>
                    <div className="flex flex-wrap gap-2">
                      {lineageAnalysis.mainBranches.map((br, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-100/40 dark:border-indigo-900/40 font-semibold text-[10px]">
                          {gt(idx === 0 ? 'genetics.lineage.paternal' : 'genetics.lineage.maternal', { name: br })}
                        </span>
                      ))}
                      {lineageAnalysis.mainBranches.length === 0 && (
                        <span className="text-slate-400 italic">{gt('genetics.lineage.none')}</span>
                      )}
                    </div>
                  </div>

                  {/* Narrow/Critical Branches */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{gt('genetics.lineage.narrow')} :</span>
                    <div className="flex flex-wrap gap-2">
                      {lineageAnalysis.lostBranches.map((br, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-100/40 dark:border-amber-900/40 font-semibold text-[10px] flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>{gt('genetics.lineage.branch', { name: br })}</span>
                        </span>
                      ))}
                      {lineageAnalysis.lostBranches.length === 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          ✓ {gt('genetics.lineage.noNarrow')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Narrative Interpretation */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl leading-relaxed text-slate-600 dark:text-slate-400">
                    <p className="font-medium text-[11px]">
                      {gt(`genetics.lineage.${lineageAnalysis.explanationCode}`, {
                        ancestors: lineageAnalysis.ancestorCount,
                        founders: lineageAnalysis.founderCount,
                        coverage: lineageAnalysis.pedigreeCompleteness,
                      })}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-2 h-72">
              <Compass className="w-10 h-10 text-slate-300 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 font-black">{gt('genetics.tab.lineage')}</h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {gt('genetics.lineage.empty')}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
