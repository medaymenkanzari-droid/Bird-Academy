/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, Eye, Sparkles, Award, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface IncubationMilestone {
  dayOffset: number;
  key: 'laying' | 'candling' | 'hatching' | 'banding';
  icon: React.FC<{ className?: string }>;
  actionKey?: string;
}

export interface IncubationTimelineProps {
  clutchStartDate: string | Date;
  currentDate?: string | Date;
  onActionClick?: (actionKey: string) => void;
  onCandlingAction?: () => void;
  onHatchingAction?: () => void;
  onBandingAction?: () => void;
  hatchDate?: string | Date;
  className?: string;
}

const MILESTONES: IncubationMilestone[] = [
  {
    dayOffset: 0,
    key: 'laying',
    icon: CheckCircle2,
  },
  {
    dayOffset: 6,
    key: 'candling',
    icon: Eye,
    actionKey: 'candling',
  },
  {
    dayOffset: 13,
    key: 'hatching',
    icon: Sparkles,
    actionKey: 'hatching',
  },
  {
    dayOffset: 19,
    key: 'banding',
    icon: Award,
    actionKey: 'banding',
  },
];

export const IncubationTimeline: React.FC<IncubationTimelineProps> = ({
  clutchStartDate,
  currentDate,
  onActionClick,
  onCandlingAction,
  onHatchingAction,
  onBandingAction,
  className = '',
}) => {
  const { currentLanguage, isRtl } = useLanguage();
  const startDate = new Date(clutchStartDate);
  const now = currentDate ? new Date(currentDate) : new Date();

  // Reset time portions for accurate day differences
  startDate.setHours(0, 0, 0, 0);
  const compNow = new Date(now);
  compNow.setHours(0, 0, 0, 0);

  const diffMs = compNow.getTime() - startDate.getTime();
  const elapsedDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  const handleAction = (milestone: IncubationMilestone) => {
    if (milestone.actionKey === 'candling' && onCandlingAction) {
      onCandlingAction();
      return;
    }
    if (milestone.actionKey === 'hatching' && onHatchingAction) {
      onHatchingAction();
      return;
    }
    if (milestone.actionKey === 'banding' && onBandingAction) {
      onBandingAction();
      return;
    }
    if (milestone.actionKey && onActionClick) {
      onActionClick(milestone.actionKey);
    }
  };

  const getMilestoneI18n = (key: 'laying' | 'candling' | 'hatching' | 'banding') => {
    switch (key) {
      case 'laying':
        return {
          title: currentLanguage === 'ar' ? 'بدء الحضانة' : currentLanguage === 'en' ? 'Incubation Start' : currentLanguage === 'es' ? 'Inicio de Incubación' : currentLanguage === 'it' ? 'Inizio Cova' : 'Début Couvaison',
          subtitle: currentLanguage === 'ar' ? 'اكتمال البيض والحضانة نشطة' : currentLanguage === 'en' ? 'Full clutch & active incubation' : currentLanguage === 'es' ? 'Puesta completa e incubación activa' : currentLanguage === 'it' ? 'Deposizione completa e cova attiva' : 'Ponte complète & incubation active',
          actionLabel: undefined,
        };
      case 'candling':
        return {
          title: currentLanguage === 'ar' ? 'الفحص الضوئي الإجباري' : currentLanguage === 'en' ? 'Mandatory Candling' : currentLanguage === 'es' ? 'Miraje obligatorio' : currentLanguage === 'it' ? 'Speratura obbligatoria' : 'Mirage obligatoire',
          subtitle: currentLanguage === 'ar' ? 'فحص خصوبة البيض والأوعية الدموية' : currentLanguage === 'en' ? 'Fertility check & blood vessels detection' : currentLanguage === 'es' ? 'Verificación de fertilidad y vasos sanguíneos' : currentLanguage === 'it' ? 'Verifica fertilità e vasi sanguigni' : 'Vérification de fécondité des œufs & vaisseaux sanguins',
          actionLabel: currentLanguage === 'ar' ? 'إجراء الفحص الضوئي' : currentLanguage === 'en' ? 'Perform Candling' : currentLanguage === 'es' ? 'Realizar miraje' : currentLanguage === 'it' ? 'Esegui speratura' : 'Effectuer le mirage',
        };
      case 'hatching':
        return {
          title: currentLanguage === 'ar' ? 'الفقس المتوقع' : currentLanguage === 'en' ? 'Expected Hatching' : currentLanguage === 'es' ? 'Eclosión prevista' : currentLanguage === 'it' ? 'Schiusa prevista' : 'Éclosion prévue',
          subtitle: currentLanguage === 'ar' ? 'مراقبة بداية النقر والرطوبة' : currentLanguage === 'en' ? 'Monitor initial pipping & nest humidity' : currentLanguage === 'es' ? 'Monitorear picado inicial y humedad' : currentLanguage === 'it' ? 'Monitoraggio prime schiuse e umidità' : 'Surveillance des premiers béchages & humidité',
          actionLabel: currentLanguage === 'ar' ? 'تسجيل المواليد' : currentLanguage === 'en' ? 'Declare Hatchings' : currentLanguage === 'es' ? 'Declarar nacimientos' : currentLanguage === 'it' ? 'Dichiara nascite' : 'Déclarer les naissances',
        };
      case 'banding':
        return {
          title: currentLanguage === 'ar' ? 'تحجيل الفراخ' : currentLanguage === 'en' ? 'Chick Banding' : currentLanguage === 'es' ? 'Anillado de polluelos' : currentLanguage === 'it' ? 'Anellamento pulli' : 'Baguage des oisillons',
          subtitle: currentLanguage === 'ar' ? 'تركيب الحلقات الرسمية المغلقة (اليوم 6 بعد الفقس)' : currentLanguage === 'en' ? 'Official closed rings fitting (D+6 post-hatch)' : currentLanguage === 'es' ? 'Colocación de anillas cerradas oficiales (D+6 post-eclosión)' : currentLanguage === 'it' ? 'Applicazione anelli chiusi ufficiali (G+6 post-schiusa)' : 'Pose des bagues officielles fermées (J+6 post-éclosion)',
          actionLabel: currentLanguage === 'ar' ? 'تسجيل الحلقات' : currentLanguage === 'en' ? 'Register Bands' : currentLanguage === 'es' ? 'Registrar anillas' : currentLanguage === 'it' ? 'Registra anelli' : 'Enregistrer les bagues',
        };
    }
  };

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-md ${className}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header with Incubation Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Clock className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-black text-slate-100 tracking-tight flex items-center gap-2">
              <span>
                {currentLanguage === 'ar' ? 'الجدول الزمني للحضانة' : currentLanguage === 'en' ? 'Incubation Timeline' : currentLanguage === 'es' ? 'Cronología de Incubación' : currentLanguage === 'it' ? 'Cronologia di Incubazione' : "Chronologie d'Incubation"}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/80">
                {currentLanguage === 'ar' ? `يوم +${elapsedDays}` : `J+${elapsedDays}`}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {currentLanguage === 'ar' ? 'البداية في ' : currentLanguage === 'en' ? 'Started on ' : currentLanguage === 'es' ? 'Inicio el ' : currentLanguage === 'it' ? 'Iniziato il ' : 'Début le '}
              <span className="text-slate-300 font-medium">{startDate.toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : currentLanguage === 'en' ? 'en-US' : currentLanguage === 'es' ? 'es-ES' : currentLanguage === 'it' ? 'it-IT' : 'fr-FR')}</span>
            </p>
          </div>
        </div>

        {/* Global Status Chip */}
        <div className="flex items-center gap-1.5">
          {elapsedDays < 6 ? (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-950/60 text-blue-300 border border-blue-800/60 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {currentLanguage === 'ar' ? 'حضانة أولية' : currentLanguage === 'en' ? 'Initial incubation' : currentLanguage === 'es' ? 'Incubación inicial' : currentLanguage === 'it' ? 'Incubazione iniziale' : 'Incubation initiale'}
            </span>
          ) : elapsedDays <= 8 ? (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {currentLanguage === 'ar' ? 'فترة الفحص الضوئي نشطة' : currentLanguage === 'en' ? 'Candling window active' : currentLanguage === 'es' ? 'Ventana de miraje activa' : currentLanguage === 'it' ? 'Finestra speratura attiva' : 'Fenêtre de mirage active'}
            </span>
          ) : elapsedDays < 13 ? (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              {currentLanguage === 'ar' ? 'تطور الجنين' : currentLanguage === 'en' ? 'Embryonic development' : currentLanguage === 'es' ? 'Desarrollo embrionario' : currentLanguage === 'it' ? 'Sviluppo embrionale' : 'Développement embryonnaire'}
            </span>
          ) : elapsedDays <= 15 ? (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {currentLanguage === 'ar' ? 'فترة الفقس' : currentLanguage === 'en' ? 'Hatching period' : currentLanguage === 'es' ? 'Período de eclosión' : currentLanguage === 'it' ? 'Periodo di schiusa' : "Période d'éclosion"}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-950/60 text-purple-300 border border-purple-800/60 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              {currentLanguage === 'ar' ? 'تربية الفراخ' : currentLanguage === 'en' ? 'Chick rearing' : currentLanguage === 'es' ? 'Cría de polluelos' : currentLanguage === 'it' ? 'Allevamento pulli' : 'Élevage des oisillons'}
            </span>
          )}
        </div>
      </div>

      {/* Vertical Milestones Timeline */}
      <div className="pt-6 pb-2 relative">
        {/* Timeline connector line */}
        <div className={`absolute ${isRtl ? 'right-[19px]' : 'left-[19px]'} top-8 bottom-8 w-0.5 bg-slate-800`} />

        <div className="space-y-6 relative">
          {MILESTONES.map((milestone) => {
            const i18n = getMilestoneI18n(milestone.key);
            const milestoneDate = new Date(startDate);
            milestoneDate.setDate(startDate.getDate() + milestone.dayOffset);

            const isPast = elapsedDays > milestone.dayOffset;
            const isTodayOrActive = 
              milestone.dayOffset === 0 
                ? elapsedDays === 0
                : milestone.dayOffset === 6
                ? elapsedDays >= 6 && elapsedDays <= 8
                : milestone.dayOffset === 13
                ? elapsedDays >= 13 && elapsedDays <= 15
                : elapsedDays >= 19 && elapsedDays <= 22;

            const Icon = milestone.icon;

            // Status theme styles
            let iconBoxClass = 'bg-slate-950 border-slate-700 text-slate-500';
            let cardBgClass = 'bg-slate-950/40 border-slate-800/80';
            let titleClass = 'text-slate-400 font-semibold';
            let dateBadgeClass = 'bg-slate-800 text-slate-400 border-slate-700';

            if (isPast) {
              iconBoxClass = 'bg-emerald-950 border-emerald-500/80 text-emerald-400 shadow-emerald-500/10 shadow-sm';
              cardBgClass = 'bg-slate-900/60 border-slate-800';
              titleClass = 'text-slate-200 font-bold';
              dateBadgeClass = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
            } else if (isTodayOrActive) {
              iconBoxClass = 'bg-amber-950 border-amber-500 text-amber-300 ring-4 ring-amber-500/20 shadow-amber-500/20 shadow-md';
              cardBgClass = 'bg-amber-950/15 border-amber-500/50 shadow-amber-500/5 shadow-md';
              titleClass = 'text-amber-200 font-black';
              dateBadgeClass = 'bg-amber-950/80 text-amber-300 border-amber-700 font-bold';
            }

            return (
              <div key={milestone.key} className="flex items-start gap-4 group">
                {/* Node Icon */}
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 z-10 transition-transform group-hover:scale-105 ${iconBoxClass}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content Card */}
                <div className={`flex-1 p-3.5 rounded-2xl border transition-all ${cardBgClass}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60">
                        {currentLanguage === 'ar' ? `يوم +${milestone.dayOffset}` : `J+${milestone.dayOffset}`}
                      </span>
                      <h4 className={`text-sm ${titleClass}`}>
                        {i18n.title}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${dateBadgeClass} self-start sm:self-auto`}>
                      {milestoneDate.toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : currentLanguage === 'en' ? 'en-US' : currentLanguage === 'es' ? 'es-ES' : currentLanguage === 'it' ? 'it-IT' : 'fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-1">
                    {i18n.subtitle}
                  </p>

                  {/* Highlighted Action Callout when Active */}
                  {isTodayOrActive && i18n.actionLabel && (
                    <div className="mt-3 pt-2.5 border-t border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        {currentLanguage === 'ar' ? 'إجراء موصى به لهذه المرحلة' : currentLanguage === 'en' ? 'Recommended action for this stage' : currentLanguage === 'es' ? 'Acción recomendada para esta etapa' : currentLanguage === 'it' ? 'Azione raccomandata per questa fase' : 'Action recommandée pour ce stade'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAction(milestone)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer select-none self-start sm:self-auto"
                      >
                        <span>{i18n.actionLabel}</span>
                        <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
