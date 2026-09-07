/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GenealogyExplorer } from './GenealogyExplorer';
import { PairSimulation } from './PairSimulation';
import { LineageAnalysis } from './LineageAnalysis';
import { GeneticsParameters } from './GeneticsParameters';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { Canari } from '../../../types';
import { 
  Dna, GitBranch, HeartHandshake, Compass, Settings, AlertTriangle, ShieldCheck, HelpCircle 
} from 'lucide-react';

export const GeneticsDashboard: React.FC = () => {
  const [birds, setBirds] = useState<Canari[]>([]);
  const [activeTab, setActiveTab] = useState<'explorer' | 'simulation' | 'lineage' | 'settings'>('explorer');

  // Load all birds on mount
  useEffect(() => {
    const allBirds = BirdRepository.getAll();
    setBirds(allBirds);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Top Heading Banner */}
      <div className="p-6 bg-linear-to-r from-slate-900 via-slate-950 to-indigo-950 rounded-3xl border border-slate-800 text-white shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-0.5 bg-indigo-500 rounded-full text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1">
              <Dna className="w-2.5 h-2.5" />
              <span>Génétique & Consanguinité</span>
            </div>
          </div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 mt-1">
            <Dna className="w-6 h-6 text-indigo-400 animate-pulse" />
            <span>Moteur Génétique Intégré</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Module de calcul déterministe de consanguinité de Wright et de traçabilité généalogique. Analysez vos lignées et planifiez vos couples en protégeant la vigueur de votre cheptel de façon 100% hors-ligne.
          </p>
        </div>

        {/* Small metric */}
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl h-fit z-10 text-center md:text-right shrink-0">
          <div className="text-2xl font-black text-indigo-400">{birds.filter(b => !b.archived).length}</div>
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Oiseaux actifs suivis</div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('explorer')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'explorer' 
              ? 'border-indigo-500 text-slate-900 dark:text-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Explorateur Généalogique</span>
        </button>
        <button
          onClick={() => setActiveTab('simulation')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'simulation' 
              ? 'border-indigo-500 text-slate-900 dark:text-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Simulateur d'Accouplement</span>
        </button>
        <button
          onClick={() => setActiveTab('lineage')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'lineage' 
              ? 'border-indigo-500 text-slate-900 dark:text-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Analyse de Lignée</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'settings' 
              ? 'border-indigo-500 text-slate-900 dark:text-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Paramètres Génétiques</span>
        </button>
      </div>

      {/* Render sub-view */}
      <div className="mt-6">
        {activeTab === 'explorer' && <GenealogyExplorer birds={birds} />}
        {activeTab === 'simulation' && <PairSimulation birds={birds} />}
        {activeTab === 'lineage' && <LineageAnalysis birds={birds} />}
        {activeTab === 'settings' && <GeneticsParameters />}
      </div>

    </div>
  );
};
