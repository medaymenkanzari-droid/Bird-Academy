/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — MISSION V1.9.2
 * COMPOSANT UI : DECISION SUPPORT VIEWER (ASSISTANCE À LA DÉCISION)
 */

import React, { useState } from 'react';
import { 
  DecisionSupportItem, 
  AssistanceLevel, 
  EpistemicStatus 
} from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  Info, 
  HelpCircle, 
  AlertTriangle, 
  FileQuestion, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DecisionSupportViewerProps {
  items: DecisionSupportItem[];
  title?: string;
  subtitle?: string;
  defaultExpanded?: boolean;
}

export const DecisionSupportViewer: React.FC<DecisionSupportViewerProps> = ({
  items,
  title,
  subtitle,
  defaultExpanded = true
}) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [selectedLevel, setSelectedLevel] = useState<AssistanceLevel | 'ALL'>('ALL');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach(it => { initial[it.id] = defaultExpanded; });
    return initial;
  });

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredItems = selectedLevel === 'ALL' 
    ? items 
    : items.filter(it => it.level === selectedLevel);

  const getLevelBadge = (level: AssistanceLevel) => {
    switch (level) {
      case 'INFORMATION':
        return {
          label: t('intelLevelInfo') || 'Information',
          bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: Info
        };
      case 'INTERPRETATION':
        return {
          label: t('intelLevelInterp') || 'Interprétation',
          bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          icon: HelpCircle
        };
      case 'VIGILANCE':
        return {
          label: t('intelLevelVigilance') || 'Point de vigilance',
          bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: AlertTriangle
        };
      case 'MISSING_DATA':
        return {
          label: t('intelLevelMissing') || 'Donnée manquante',
          bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: FileQuestion
        };
      case 'USER_ACTION':
        return {
          label: t('intelLevelAction') || 'Action utilisateur',
          bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: CheckCircle2
        };
    }
  };

  const getStatusBadgeClass = (status?: EpistemicStatus) => {
    if (!status) return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    switch (status) {
      case 'CONFIRMED':
      case 'GENETICALLY_CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'PROVISIONAL':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'BLOCKED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'UNKNOWN':
      case 'NOT_TESTED':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      case 'POSSIBLE_SET':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header bar if title provided */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{title}</span>
            </h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>

          {/* Level filter tabs */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedLevel('ALL')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                selectedLevel === 'ALL'
                  ? 'bg-amber-500 text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Tous ({items.length})
            </button>
            {(['VIGILANCE', 'MISSING_DATA', 'USER_ACTION', 'INTERPRETATION', 'INFORMATION'] as AssistanceLevel[]).map(lvl => {
              const count = items.filter(i => i.level === lvl).length;
              if (count === 0) return null;
              const badge = getLevelBadge(lvl);
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    selectedLevel === lvl
                      ? `${badge.bg} ring-2 ring-amber-500/50`
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {badge.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Items list */}
      {filteredItems.length === 0 ? (
        <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
          {t('intelNoDecisionAlerts') || "Aucun point de vigilance critique détecté."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(item => {
            const badge = getLevelBadge(item.level);
            const Icon = badge.icon;
            const isExpanded = expandedItems[item.id] ?? defaultExpanded;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-amber-400/50 transition-all space-y-4"
              >
                {/* Header row: title, badges, expand toggle */}
                <div 
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Level badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border ${badge.bg}`}>
                        <Icon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </span>

                      {/* Source of truth badge */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        <Layers className="w-2.5 h-2.5 text-slate-400" />
                        <span>Source : {item.source.engineOrTable}</span>
                      </span>

                      {/* Epistemic status badge if available */}
                      {item.epistemicStatus && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getStatusBadgeClass(item.epistemicStatus)}`}>
                          {item.epistemicStatus}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {item.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Toggle details"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Structured Content (6 Sections) */}
                {isExpanded && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 animate-fade-in text-xs">
                    
                    {/* 1. SITUATION */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Info className="w-3 h-3 text-slate-400" />
                        <span>{t('intelSituation') || "Ce que l'on sait"}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                        {item.situation}
                      </p>
                    </div>

                    {/* 2. RÉSULTAT OFFICIEL */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        <span>{t('intelOfficialResult') || "Résultat officiel"}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                        {item.result}
                      </p>
                    </div>

                    {/* 3. CE QUE CELA SIGNIFIE */}
                    <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-1 md:col-span-2">
                      <div className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        <span>{t('intelMeaning') || "Ce que cela signifie"}</span>
                      </div>
                      <p className="text-blue-900 dark:text-blue-200 leading-relaxed">
                        {item.meaning}
                      </p>
                    </div>

                    {/* 4. POINTS DE VIGILANCE */}
                    {item.vigilancePoints.length > 0 && (
                      <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
                        <div className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{t('intelVigilancePoints') || "Points de vigilance"}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-amber-900 dark:text-amber-200">
                          {item.vigilancePoints.map((pt, idx) => (
                            <li key={idx} className="leading-relaxed">{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 5. INFORMATIONS MANQUANTES */}
                    {item.missingData.length > 0 && (
                      <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200/60 dark:border-purple-900/40 space-y-1.5">
                        <div className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1">
                          <FileQuestion className="w-3 h-3" />
                          <span>{t('intelMissingDataSection') || "Ce qui manque"}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 text-purple-900 dark:text-purple-200">
                          {item.missingData.map((md, idx) => (
                            <li key={idx} className="leading-relaxed">{md}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 6. PROCHAINE VÉRIFICATION POSSIBLE */}
                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-1 md:col-span-2">
                      <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" />
                        <span>{t('intelNextVerification') || "À vérifier"}</span>
                      </div>
                      <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed font-semibold">
                        {item.nextVerification}
                      </p>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
