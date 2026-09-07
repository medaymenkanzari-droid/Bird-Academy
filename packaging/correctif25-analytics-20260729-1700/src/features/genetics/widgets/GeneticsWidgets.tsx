/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Sparkles, AlertTriangle, Users, GitBranch, Binary, Info } from 'lucide-react';
import { WrightResult, LineageAnalysisResult } from '../types';

// --- GENETIC SCORE CARD ---
interface GeneticScoreCardProps {
  score: number;
  label: 'excellent' | 'good' | 'medium' | 'poor' | 'critical';
  summary: string;
  explanation: string;
  confidence: 'high' | 'medium' | 'low';
}

export const GeneticScoreCard: React.FC<GeneticScoreCardProps> = ({
  score,
  label,
  summary,
  explanation,
  confidence,
}) => {
  const styles = {
    excellent: {
      border: 'border-emerald-100 dark:border-emerald-900',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/10',
      text: 'text-emerald-700 dark:text-emerald-400',
      pill: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      labelStr: 'Excellent'
    },
    good: {
      border: 'border-teal-100 dark:border-teal-900',
      bg: 'bg-teal-50/50 dark:bg-teal-950/10',
      text: 'text-teal-700 dark:text-teal-400',
      pill: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      labelStr: 'Bon'
    },
    medium: {
      border: 'border-amber-100 dark:border-amber-900',
      bg: 'bg-amber-50/50 dark:bg-amber-950/10',
      text: 'text-amber-700 dark:text-amber-400',
      pill: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      labelStr: 'Moyen'
    },
    poor: {
      border: 'border-orange-100 dark:border-orange-900',
      bg: 'bg-orange-50/50 dark:bg-orange-950/10',
      text: 'text-orange-700 dark:text-orange-400',
      pill: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      labelStr: 'Faible'
    },
    critical: {
      border: 'border-rose-100 dark:border-rose-900',
      bg: 'bg-rose-50/50 dark:bg-rose-950/10',
      text: 'text-rose-700 dark:text-rose-400',
      pill: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      labelStr: 'Critique'
    }
  };

  const current = styles[label] || styles.medium;

  return (
    <div className={`p-5 bg-white dark:bg-slate-900 rounded-2xl border ${current.border} shadow-xs hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${current.bg} ${current.text}`}>
          <Shield className="w-5 h-5" />
        </div>
        <div className="text-right">
          <div className={`text-2xl font-black ${current.text}`}>{score}%</div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400`}>
            Fiabilité : {confidence === 'high' ? 'Élevée' : confidence === 'medium' ? 'Moyenne' : 'Faible'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Qualité Génétique</h3>
        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${current.pill}`}>
          {current.labelStr}
        </span>
      </div>
      <p className="text-[11px] font-semibold text-slate-500 mb-2">{summary}</p>
      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{explanation}</p>
    </div>
  );
};


// --- INBREEDING GAUGE ---
interface InbreedingGaugeProps {
  wrightResult: WrightResult;
}

export const InbreedingGauge: React.FC<InbreedingGaugeProps> = ({ wrightResult }) => {
  const { coefficient, level } = wrightResult;

  const colorMap = {
    none: { stroke: 'stroke-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Nulle' },
    low: { stroke: 'stroke-teal-500', text: 'text-teal-500', bg: 'bg-teal-500/10', label: 'Très Faible' },
    moderate: { stroke: 'stroke-amber-500', text: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Modérée' },
    high: { stroke: 'stroke-orange-500', text: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Élevée' },
    critical: { stroke: 'stroke-rose-500', text: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Critique' },
  };

  const style = colorMap[level] || colorMap.none;

  // Gauge calculation
  // Max scale to display beautifully is 25% (very high inbreeding)
  const displayPercentage = Math.min(100, (coefficient / 25) * 100);
  const strokeDashoffset = 251.2 - (251.2 * displayPercentage) / 100;

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Consanguinité de Wright</h3>
      
      <div className="relative w-32 h-32 mb-3">
        {/* SVG Circle Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            className="stroke-slate-100 dark:stroke-slate-800 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            className={`${style.stroke} fill-none transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-800 dark:text-slate-100">{coefficient}%</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        </div>
      </div>

      <div className="flex gap-2 items-start bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 text-left w-full">
        <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-slate-500 leading-relaxed">
          {wrightResult.explanation}
        </p>
      </div>
    </div>
  );
};


// --- GENEALOGY SUMMARY ---
interface GenealogySummaryProps {
  birdName: string;
  birdRing: string;
  completeness: number; // 0 to 100 %
  depth: number;
}

export const GenealogySummary: React.FC<GenealogySummaryProps> = ({
  birdName,
  birdRing,
  completeness,
  depth,
}) => {
  const getCompletenessColor = (val: number) => {
    if (val >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (val >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-3.5">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
          <GitBranch className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Résumé de l'Arbre</h3>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{birdName} ({birdRing})</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100/60 dark:border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 block mb-1">Profondeur</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100">{depth} <span className="text-xs font-normal text-slate-500">générations</span></span>
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100/60 dark:border-slate-800/60">
          <span className="text-[10px] font-semibold text-slate-400 block mb-1">Complétude</span>
          <span className={`text-lg font-black ${getCompletenessColor(completeness)}`}>{completeness}%</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[11px] text-slate-500 font-medium">
          <span>Précision d'évaluation</span>
          <span>{completeness >= 80 ? 'Haute' : completeness >= 40 ? 'Modérée' : 'Insuffisante'}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-700 ${
              completeness >= 80 ? 'bg-emerald-500' : completeness >= 40 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>
    </div>
  );
};


// --- FOUNDER STATISTICS ---
interface FounderStatisticsProps {
  analysis: LineageAnalysisResult;
}

export const FounderStatistics: React.FC<FounderStatisticsProps> = ({ analysis }) => {
  const { founderCount, diversityIndex, renewalIndex } = analysis;

  return (
    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statistiques des Fondateurs</h3>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Vivier génétique originel</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60 text-xs">
          <span className="text-slate-500 font-medium">Fondateurs de lignée</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{founderCount}</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60 text-xs">
          <span className="text-slate-500 font-medium">Indice de diversité</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{diversityIndex}%</span>
        </div>
        <div className="flex justify-between items-center py-1.5 text-xs">
          <span className="text-slate-500 font-medium">Taux de renouvellement</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400">{renewalIndex}%</span>
        </div>
      </div>

      <div className="mt-4 p-2.5 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/40 rounded-xl flex gap-2">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-indigo-700 dark:text-indigo-300 leading-relaxed font-semibold">
          {founderCount < 3 
            ? "Vivier de fondateurs trop faible. Risque de dérive génétique rapide. Introduisez de nouveaux sujets externes." 
            : "Vivier de fondateurs adéquat pour maintenir une sélection stable sur plusieurs générations."}
        </p>
      </div>
    </div>
  );
};
