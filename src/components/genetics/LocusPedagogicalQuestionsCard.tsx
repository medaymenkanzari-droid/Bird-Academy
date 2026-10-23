/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT LocusPedagogicalQuestionsCard
 * Mission V1.9.4 : Étape 2 — Simplifier la compréhension via les 8 questions fondamentales.
 * 
 * QUESTIONS COUVERTES :
 * 1. QU'EST-CE QUE C'EST ?
 * 2. QU'EST-CE QUI EST OBSERVÉ ?
 * 3. QU'EST-CE QUI EST CERTAIN ?
 * 4. QU'EST-CE QUI EST INCONNU ?
 * 5. QU'EST-CE QUI N'A PAS ÉTÉ TESTÉ ?
 * 6. D'OÙ VIENT L'INFORMATION ?
 * 7. QUEL EST SON NIVEAU DE CONFIANCE ?
 * 8. UNE VÉRIFICATION HUMAINE EST-ELLE NÉCESSAIRE ?
 */

import React, { useState } from 'react';
import { 
  HelpCircle, Eye, CheckCircle2, AlertTriangle, 
  Clock, BookOpen, ShieldCheck, UserCheck, ChevronDown, ChevronUp, Sparkles, AlertOctagon 
} from 'lucide-react';
import type { Language } from '../../utils/translations';
import type { CanonicalLocusItem } from './CanonicalGeneticsSummaryCard';
import { translateEpistemic, getEpistemicStatusPresentation } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';

export interface LocusPedagogicalQuestionsCardProps {
  locus: CanonicalLocusItem;
  language?: Language;
  className?: string;
  onOpenAssistant?: (question?: string) => void;
  'data-testid'?: string;
}

export function LocusPedagogicalQuestionsCard({
  locus,
  language: explicitLanguage,
  className = '',
  onOpenAssistant,
  'data-testid': testId = 'locus-pedagogical-questions-card'
}: LocusPedagogicalQuestionsCardProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);
  const [isExpanded, setIsExpanded] = useState(true);

  const statusKey =
    locus.epistemic?.status ||
    locus.epistemicStatus ||
    locus.status ||
    locus.determination ||
    'UNKNOWN';

  const presentation = getEpistemicStatusPresentation(statusKey, language);

  const locusName = locus.displayName || locus.locusId || locus.locus || 'Locus';
  const isConfirmed = statusKey === 'GENETICALLY_CONFIRMED' || statusKey === 'CONFIRMED' || locus.determination === 'CONFIRMED';
  const isPossibleSet = statusKey === 'POSSIBLE_SET' || locus.determination === 'POSSIBLE_SET' || Boolean(locus.possibleSet?.length) || Boolean(locus.hypotheses?.length);
  const isUnknown = statusKey === 'UNKNOWN' && !isPossibleSet && !isConfirmed;
  const isNotTested = statusKey === 'NOT_TESTED';
  const isBlocked = locus.isBlocked || locus.blocked || statusKey === 'BLOCKED';
  const isProvisional = locus.isProvisional || statusKey === 'PROVISIONAL';
  const isConflict = statusKey === 'CONFLICT_REVIEW' || statusKey === 'CONFLICTING';
  const requiresReview = Boolean(
    locus.humanReviewRequired ||
    locus.epistemic?.humanReviewRequired ||
    isProvisional ||
    isBlocked ||
    isConflict
  );

  // 1. Qu'est-ce que c'est ?
  let whatIsItText = `${locusName} — `;
  if (locus.transmission === 'Z_LINKED') {
    whatIsItText += `${translateEpistemic(language, 'transmission.Z_LINKED')}. `;
  } else if (locus.transmission === 'AUTOSOMAL') {
    whatIsItText += `${translateEpistemic(language, 'transmission.AUTOSOMAL')}. `;
  }
  if (isBlocked) {
    whatIsItText += `${translateEpistemic(language, 'status.BLOCKED')}.`;
  } else if (isProvisional) {
    whatIsItText += `${translateEpistemic(language, 'status.PROVISIONAL')}.`;
  } else {
    whatIsItText += presentation.canonicalText;
  }

  // 2. Qu'est-ce qui est observé ?
  let observedText = '';
  if (locus.rationale) {
    observedText = locus.rationale;
  } else if (statusKey === 'OBSERVED') {
    observedText = translateEpistemic(language, 'editor.mode_observed');
  } else if (locus.carrierState === 'CONFIRMED_CARRIER') {
    observedText = translateEpistemic(language, 'carrier.CONFIRMED_CARRIER');
  } else if (locus.carrierState === 'POSSIBLE_CARRIER') {
    observedText = translateEpistemic(language, 'carrier.POSSIBLE_CARRIER');
  } else {
    observedText = language === 'ar' ? "لا توجد ملاحظة بصرية مسجلة تخص هذا الموقع." : language === 'en' ? "No visual observation explicitly recorded for this locus." : "Aucune observation visuelle explicitement consignée pour ce locus.";
  }

  // 3. Qu'est-ce qui est certain ?
  let certainText = '';
  if (isConfirmed && locus.alleles) {
    certainText = `${translateEpistemic(language, 'drawer.confirmed_genotype')} : ${Array.isArray(locus.alleles) ? locus.alleles.filter(Boolean).join(' / ') : String(locus.alleles)}`;
  } else {
    certainText = language === 'ar' ? "لا يوجد يقين جيني مؤكد حالياً (غير مثبت مخبرياً)." : language === 'en' ? "No genetic certainty established at this stage (not molecularly proven)." : "Aucune certitude génétique arrêtée à ce stade (non prouvé par ADN ou descendance certifiée).";
  }

  // 4. Qu'est-ce qui est inconnu ?
  let unknownText = '';
  if (isUnknown) {
    unknownText = translateEpistemic(language, 'drawer.unknown_description');
  } else if (isPossibleSet) {
    unknownText = language === 'ar' ? "النمط الجيني الدقيق غير محدد بين الفرضيات المتعددة القائمة." : language === 'en' ? "The exact underlying genotype is not determined among the existing alternative hypotheses." : "Le génotype exact sous-jacent n'est pas départagé parmi les hypothèses alternatives compatibles.";
  } else if (!isConfirmed) {
    unknownText = language === 'ar' ? "النمط الوراثي الحقيقي غير مثبت رسمياً." : language === 'en' ? "The true molecular genotype is not formally proven." : "Le génotype moléculaire réel n'est pas formellement certifié.";
  } else {
    unknownText = language === 'ar' ? "المعلومات الأساسية محددة." : language === 'en' ? "Key information is established." : "L'information principale est arrêtée.";
  }

  // 5. Qu'est-ce qui n'a pas été testé ?
  let notTestedText = '';
  if (isNotTested) {
    notTestedText = translateEpistemic(language, 'drawer.not_tested_description');
  } else {
    notTestedText = language === 'ar' ? "فحص الحمض النووي المخبري الشامل لم يُسجل." : language === 'en' ? "Comprehensive molecular DNA test not recorded." : "Test ADN moléculaire complet non enregistré.";
  }

  // 6. D'où vient l'information ?
  let sourceText = '';
  const src = (typeof locus.epistemic?.provenance === 'string' ? locus.epistemic.provenance : undefined) || locus.source || locus.provenance;
  if (src) {
    const srcKey = `source.${src}` as any;
    sourceText = translateEpistemic(language, srcKey);
  } else {
    sourceText = language === 'ar' ? "تصريح المربي أو سجل محلي." : language === 'en' ? "Breeder declaration or local record." : "Déclaration de l'éleveur ou registre local.";
  }

  // 7. Quel est son niveau de confiance ?
  let confidenceText = '';
  const conf = locus.epistemic?.confidence || locus.confidence;
  if (conf) {
    const confKey = `confidence.${conf}` as any;
    confidenceText = translateEpistemic(language, confKey);
  } else {
    confidenceText = translateEpistemic(language, 'confidence.UNKNOWN');
  }

  // 8. Une vérification humaine est-elle nécessaire ?
  let reviewText = '';
  if (requiresReview) {
    if (isBlocked) {
      reviewText = language === 'ar' ? "نعم — الموقع محجوب بسبب خلاف علمي ويتطلب مراجعة بشرية." : language === 'en' ? "Yes — Locus is blocked due to scientific controversy and requires human review." : "Oui — Locus bloqué en raison d'une controverse scientifique, vérification humaine nécessaire.";
    } else if (isProvisional) {
      reviewText = language === 'ar' ? "نعم — الإطار المرجعي مؤقت ويتطلب تحققاً بشرياً." : language === 'en' ? "Yes — Reference framework is provisional and requires human verification." : "Oui — Référentiel provisoire, vérification humaine nécessaire.";
    } else if (isConflict) {
      reviewText = language === 'ar' ? "نعم — تم اكتشاف تعارض في المعلومات ويتطلب حسماً بشرياً." : language === 'en' ? "Yes — Conflicting information detected, human review required." : "Oui — Informations contradictoires détectées, arbitrage humain nécessaire.";
    } else {
      reviewText = translateEpistemic(language, 'review.REQUIRED');
    }
  } else {
    reviewText = language === 'ar' ? "لا — لا يوجد تعارض معلن." : language === 'en' ? "No — No conflict reported." : "Non — Aucun conflit signalé.";
  }

  const questionsList = [
    {
      id: 'q1',
      title: translateEpistemic(language, 'pedagogy.q_what_is_it'),
      content: whatIsItText,
      icon: <HelpCircle className="w-4 h-4 text-blue-500" />
    },
    {
      id: 'q2',
      title: translateEpistemic(language, 'pedagogy.q_what_is_observed'),
      content: observedText,
      icon: <Eye className="w-4 h-4 text-amber-500" />
    },
    {
      id: 'q3',
      title: translateEpistemic(language, 'pedagogy.q_what_is_certain'),
      content: certainText,
      icon: <CheckCircle2 className={`w-4 h-4 ${isConfirmed ? 'text-emerald-500' : 'text-slate-400'}`} />
    },
    {
      id: 'q4',
      title: translateEpistemic(language, 'pedagogy.q_what_is_unknown'),
      content: unknownText,
      icon: <HelpCircle className="w-4 h-4 text-slate-400" />
    },
    {
      id: 'q5',
      title: translateEpistemic(language, 'pedagogy.q_what_is_not_tested'),
      content: notTestedText,
      icon: <Clock className="w-4 h-4 text-slate-400" />
    },
    {
      id: 'q6',
      title: translateEpistemic(language, 'pedagogy.q_where_does_it_come_from'),
      content: sourceText,
      icon: <BookOpen className="w-4 h-4 text-indigo-500" />
    },
    {
      id: 'q7',
      title: translateEpistemic(language, 'pedagogy.q_what_is_confidence'),
      content: confidenceText,
      icon: <ShieldCheck className="w-4 h-4 text-teal-500" />
    },
    {
      id: 'q8',
      title: translateEpistemic(language, 'pedagogy.q_is_review_needed'),
      content: reviewText,
      icon: requiresReview ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <UserCheck className="w-4 h-4 text-emerald-500" />
    }
  ];

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid={testId}
    >
      <div 
        className="p-3.5 bg-slate-50/80 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="locus-questions-header"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
            {language === 'ar' ? "الأسئلة البيداغوجية الثمانية لفهم هذا الموقع" : language === 'en' ? "8 Pedagogical Questions to Understand this Locus" : "8 questions pour comprendre simplement ce locus"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAssistant && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenAssistant("Explique-moi ce statut.");
              }}
              className="px-2 py-0.5 rounded text-3xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer inline-flex items-center gap-1"
              data-testid="questions-card-ask-ai-btn"
            >
              <Sparkles className="w-3 h-3" />
              <span>{language === 'ar' ? "شرح" : "Expliquer"}</span>
            </button>
          )}

          <button
            type="button"
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label={isExpanded ? "Réduire" : "Développer"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 sm:p-4 divide-y divide-slate-100 dark:divide-slate-800/60 text-xs" data-testid="locus-questions-body">
          {questionsList.map((q) => (
            <div key={q.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5" data-testid={`locus-question-${q.id}`}>
              <span className="shrink-0 mt-0.5" aria-hidden="true">{q.icon}</span>
              <div className="space-y-0.5 min-w-0 flex-1">
                <span className="font-black text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  {q.title}
                </span>
                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  {q.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LocusPedagogicalQuestionsCard;
