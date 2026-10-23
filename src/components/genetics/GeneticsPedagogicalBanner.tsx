/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT GeneticsPedagogicalBanner
 * Mission V1.9.4 : Clarification pédagogique stricte : Phénotype / Génotype / Porteur.
 * 
 * GARANTIES SCIENTIFIQUES & ÉPISTÉMIQUES :
 * 1. Distinction fondamentale : Phénotype (observé) ≠ Génotype (connu/confirmé) ≠ Porteur (récessif masqué).
 * 2. Aide contextuelle explicite : « Un phénotype observé ne permet pas toujours de déterminer le génotype. »
 * 3. Zéro inférence biologique : Purement pédagogique et explicatif.
 * 4. Respect de la règle ZW : Une femelle Z/W ne peut pas être porteuse liée au sexe.
 * 5. Multi-langue complet : FR, EN, AR (RTL), ES, IT.
 */

import React, { useState } from 'react';
import { Eye, Dna, ShieldCheck, AlertCircle, HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import type { Language } from '../../utils/translations';
import { translateEpistemic } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';

export interface GeneticsPedagogicalBannerProps {
  language?: Language;
  className?: string;
  isCompact?: boolean;
  speciesId?: string;
  sex?: string;
  onOpenAssistant?: () => void;
  'data-testid'?: string;
}

export function GeneticsPedagogicalBanner({
  language: explicitLanguage,
  className = '',
  isCompact = false,
  speciesId,
  sex,
  onOpenAssistant,
  'data-testid': testId = 'genetics-pedagogical-banner'
}: GeneticsPedagogicalBannerProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);
  const [isExpanded, setIsExpanded] = useState(!isCompact);

  const isFemale = sex === 'FEMALE' || sex === 'F' || sex === 'Femelle';

  return (
    <div
      className={`rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/70 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 p-4 transition-all shadow-xs ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid={testId}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Dna className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{language === 'ar' ? "دليل الفهم الجيني (المظهر • النمط • الحامل)" : language === 'en' ? "Genetic Understanding Guide (Phenotype • Genotype • Carrier)" : "Comprendre la génétique (Phénotype • Génotype • Porteur)"}</span>
            </h4>
            <p className="text-3xs sm:text-xs text-slate-500 dark:text-slate-400">
              {translateEpistemic(language, 'pedagogy.phenotype_not_genotype_warning')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenAssistant && (
            <button
              type="button"
              onClick={onOpenAssistant}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-3xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              title="Poser une question à l'Assistant IA"
              data-testid="pedagogical-banner-assistant-btn"
            >
              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{language === 'ar' ? "مساعد IA" : "Assistant IA"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={isExpanded ? "Réduire" : "Développer"}
            data-testid="pedagogical-banner-toggle"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded content with the 3 pillars */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* 1. PHÉNOTYPE */}
            <div
              className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-1.5"
              data-testid="pedagogical-card-phenotype"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                  {translateEpistemic(language, 'pedagogy.phenotype_title')}
                </span>
              </div>
              <p className="text-xs text-amber-950/90 dark:text-amber-200/90 leading-relaxed font-medium">
                « {translateEpistemic(language, 'pedagogy.phenotype_desc')} »
              </p>
            </div>

            {/* 2. GÉNOTYPE */}
            <div
              className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-1.5"
              data-testid="pedagogical-card-genotype"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                  <Dna className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  {translateEpistemic(language, 'pedagogy.genotype_title')}
                </span>
              </div>
              <p className="text-xs text-emerald-950/90 dark:text-emerald-200/90 leading-relaxed font-medium">
                « {translateEpistemic(language, 'pedagogy.genotype_desc')} »
              </p>
            </div>

            {/* 3. PORTEUR */}
            <div
              className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200/70 dark:border-indigo-900/40 space-y-1.5"
              data-testid="pedagogical-card-carrier"
            >
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                  {translateEpistemic(language, 'pedagogy.carrier_title')}
                </span>
              </div>
              <p className="text-xs text-indigo-950/90 dark:text-indigo-200/90 leading-relaxed font-medium">
                « {translateEpistemic(language, 'pedagogy.carrier_desc')} »
              </p>
            </div>
          </div>

          {/* Règle ZW si femelle */}
          {isFemale && (
            <div
              className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-start gap-2 text-3xs sm:text-xs text-purple-950 dark:text-purple-300"
              data-testid="pedagogical-banner-zw-notice"
            >
              <AlertCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <span>{translateEpistemic(language, 'pedagogy.zw_female_notice')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GeneticsPedagogicalBanner;
