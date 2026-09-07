/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Clock, AlertCircle, Sparkles, HelpCircle, Flame, Footprints } from 'lucide-react';
import { Incubation, IncubationMode, IncubationEvent } from '../types';
import { IncubationService } from '../services/IncubationService';
import { ReproductionEngine } from '../../engines/ReproductionEngine';
import { useLanguage } from '../../../../context/LanguageContext';
import { BIO_TRANSLATIONS } from '../../utils/bioTranslations';
import { 
  AppCard, AppButton, AppBadge, AppInput, AppSelect, AppAlert, AppEmptyState 
} from '../../../../components/design-system';

interface IncubationCalendarViewProps {
  clutchId: string;
  onRefreshClutches?: () => void;
}

export default function IncubationCalendarView({ clutchId, onRefreshClutches }: IncubationCalendarViewProps) {
  const { language } = useLanguage();

  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    const dict = BIO_TRANSLATIONS[language] || BIO_TRANSLATIONS['fr'];
    let text = dict[key] || BIO_TRANSLATIONS['fr'][key] || String(key);
    if (variables) {
      Object.entries(variables).forEach(([k, val]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(val));
      });
    }
    return text;
  }, [language]);

  const incubation = useMemo(() => {
    return IncubationService.getIncubationByClutch(clutchId);
  }, [clutchId]);

  // Launch Form state
  const [isLaunchOpen, setIsLaunchOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState<IncubationMode>('Naturelle');

  const handleStart = () => {
    if (!startDate) return;
    IncubationService.startIncubation(clutchId, startDate, mode);
    setIsLaunchOpen(false);
    if (onRefreshClutches) onRefreshClutches();
  };

  const calendarData = useMemo(() => {
    if (!incubation) return null;
    return ReproductionEngine.calculateIncubationCalendar(incubation.startDate);
  }, [incubation]);

  const progressPercent = useMemo(() => {
    if (!calendarData) return 0;
    return calendarData.progressPercent;
  }, [calendarData]);

  if (!incubation) {
    return (
      <div className="space-y-4">
        <AppCard className="border-dashed bg-slate-50/50 text-center py-8">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-600 text-sm">
            Incubation non démarrée
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            L'incubation biologique permet de programmer et de suivre précisément les phases critiques de développement des embryons.
          </p>

          {!isLaunchOpen ? (
            <AppButton 
              variant="success" 
              onClick={() => setIsLaunchOpen(true)}
              className="mt-4 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              {t('startIncubationBtn')}
            </AppButton>
          ) : (
            <div className="mt-6 max-w-sm mx-auto p-4 bg-white border border-slate-200 rounded-xl text-left space-y-4 shadow-sm">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Date de début d'incubation
                </label>
                <AppInput
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  {t('incubationModeLabel')}
                </label>
                <AppSelect
                  value={mode}
                  onChange={(e) => setMode(e.target.value as IncubationMode)}
                  options={[
                    { value: 'naturelle', label: t('incubationNaturelle') },
                    { value: 'assistee', label: t('incubationAssistee') },
                    { value: 'artificielle', label: t('incubationArtificielle') },
                  ]}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <AppButton variant="text" size="sm" onClick={() => setIsLaunchOpen(false)}>
                  Annuler
                </AppButton>
                <AppButton variant="success" size="sm" onClick={handleStart}>
                  Démarrer
                </AppButton>
              </div>
            </div>
          )}
        </AppCard>
      </div>
    );
  }

  // Define calendar milestone colors and markers
  const milestones = [
    { key: 'laying', label: 'Ponte & Incubation', date: calendarData?.startDate },
    { key: 'candling', label: t('candlingLabel'), date: calendarData?.candlingDate },
    { key: 'control', label: t('controlLabel'), date: calendarData?.controlDate },
    { key: 'expectedHatch', label: t('expectedHatchLabel'), date: calendarData?.expectedHatchDate },
    { key: 'endIncubation', label: t('endIncubLabel'), date: calendarData?.endIncubationDate },
  ];

  return (
    <div className="space-y-4 text-left font-sans">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            {t('calendarTab')}
          </h4>
          <span className="text-[10px] text-slate-400">
            Mode : {t(`incubation${incubation.mode.charAt(0).toUpperCase() + incubation.mode.slice(1)}`)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">
            {t('durationRemaining')} : {calendarData?.daysRemaining} {t('daysPlural')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 font-bold">Progression de l'incubation</span>
          <span className="font-extrabold text-amber-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Delay Warning */}
      {calendarData && calendarData.delayDays > 0 && (
        <AppAlert type="warning" className="border-amber-200 bg-amber-50 text-amber-800">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <p className="text-xs font-semibold leading-relaxed">
              {t('overdueWarning')} ({calendarData.delayDays} {t('daysPlural')} de retard)
            </p>
          </div>
        </AppAlert>
      )}

      {/* Milestones Vertical List */}
      <div className="relative border-l border-slate-100 pl-4 py-2 space-y-5">
        {milestones.map((m, idx) => {
          // Calculate if this milestone date is past or today
          const nowStr = new Date().toISOString().split('T')[0];
          const mDateStr = m.date || '';
          const isPassed = nowStr >= mDateStr;
          const isToday = nowStr === mDateStr;

          return (
            <div key={idx} className="relative">
              {/* Bullet indicator */}
              <span className={`absolute -left-[21px] top-1 p-0.5 rounded-full ring-2 ${
                isToday 
                  ? 'bg-amber-500 ring-amber-200 text-white' 
                  : isPassed 
                    ? 'bg-emerald-500 ring-emerald-100 text-white' 
                    : 'bg-slate-200 ring-white text-slate-500'
              }`}>
                <span className="block w-2.5 h-2.5 rounded-full bg-current" />
              </span>

              <div className="flex justify-between items-start">
                <div>
                  <span className={`block text-xs font-bold ${
                    isToday ? 'text-amber-600 font-black' : isPassed ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {m.label}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                    {m.date ? new Date(m.date).toLocaleDateString(language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                  </span>
                </div>
                {isToday && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded-full border border-amber-200 uppercase tracking-wider animate-pulse">
                    Aujourd'hui
                  </span>
                )}
                {isPassed && !isToday && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded-full">
                    Passé
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Incubation Events / Logs */}
      <div className="pt-4 border-t border-slate-100">
        <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Footprints className="w-4 h-4 text-slate-400" />
          Événements d'incubation
        </h5>

        {((incubation as any).events || []).length === 0 ? (
          <p className="text-xs text-slate-400 italic">Aucun événement enregistré.</p>
        ) : (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 max-h-[160px] overflow-y-auto">
            {((incubation as any).events || []).map((e: IncubationEvent) => (
              <div key={e.id} className="text-xs flex justify-between border-b border-slate-200/40 pb-1.5 last:border-0 last:pb-0">
                <span className="font-semibold text-slate-700">{e.description}</span>
                <span className="text-[10px] text-slate-400 font-mono">{new Date(e.timestamp).toLocaleDateString(language)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
