/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Calendar, Egg as EggIcon, User, Sparkles, Check, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { ClutchService } from '../services/ClutchService';
import { EggService } from '../../eggs/services/EggService';
import { IncubationService } from '../../incubation/services/IncubationService';
import { ReproductionEngine } from '../../engines/ReproductionEngine';
import { ReproductionService } from '../../services/ReproductionService';
import { useLanguage } from '../../../../context/LanguageContext';
import { BIO_TRANSLATIONS } from '../../utils/bioTranslations';
import { 
  AppCard, AppButton, AppBadge, AppInput, AppSelect, AppAlert, AppModal 
} from '../../../../components/design-system';

interface ClutchWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clutchId: string) => void;
  preSelectedPairId?: string | null;
}

export default function ClutchWizard({ isOpen, onClose, onSuccess, preSelectedPairId }: ClutchWizardProps) {
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

  // Wizard Steps: 1, 2, 3, 4, 5
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Active couples list
  const activeCouples = useMemo(() => {
    const all = ReproductionService.getPairs();
    return all.filter(p => p.status === 'active' && !p.archived);
  }, []);

  // Wizard States
  const [selectedPairId, setSelectedPairId] = useState<string>(preSelectedPairId || '');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [observations, setObservations] = useState('');
  const [eggCount, setEggCount] = useState<number>(4);
  const [incubationMode, setIncubationMode] = useState<'naturelle' | 'artificielle' | 'assistee'>('naturelle');

  // Set default couple if only one or pre-selected
  React.useEffect(() => {
    if (preSelectedPairId) {
      setSelectedPairId(preSelectedPairId);
    } else if (activeCouples.length > 0 && !selectedPairId) {
      setSelectedPairId(activeCouples[0].id);
    }
  }, [preSelectedPairId, activeCouples, selectedPairId]);

  // Forecast milestones based on Clutch start date
  const forecasts = useMemo(() => {
    if (!startDate) return null;
    return ReproductionEngine.calculateIncubationCalendar(startDate);
  }, [startDate]);

  const handleNext = () => {
    if (step === 1 && !selectedPairId) return;
    if (step === 2 && !startDate) return;
    setStep((prev) => (prev + 1) as any);
  };

  const handlePrev = () => {
    setStep((prev) => (prev - 1) as any);
  };

  const handleFinalSave = () => {
    try {
      // 1. Create Clutch
      const clutch = ClutchService.createClutch(selectedPairId, startDate, observations);

      // 2. Add Eggs
      const baseDate = new Date(startDate);
      for (let i = 1; i <= eggCount; i++) {
        const eggLayingDate = new Date(baseDate);
        eggLayingDate.setDate(baseDate.getDate() + (i - 1));
        const dateStr = eggLayingDate.toISOString().split('T')[0];

        EggService.addEgg(
          clutch.id,
          dateStr,
          `Nid - Position ${i}`,
          1.5, // default estimated egg weight
          `Œuf de ponte initiale #${i}`
        );
      }

      // 3. Start Incubation
      IncubationService.startIncubation(clutch.id, startDate, incubationMode);

      onSuccess(clutch.id);
      onClose();
      // Reset Wizard state
      setStep(1);
      setObservations('');
      setEggCount(4);
    } catch (err: any) {
      alert(err.message || "Erreur de création globale");
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('clutchWizardTitle')}
      size="lg"
    >
      <div className="space-y-6 font-sans text-left">
        {/* Step progress bar */}
        <div className="grid grid-cols-5 gap-2 border-b border-slate-100 pb-4">
          {[1, 2, 3, 4, 5].map((s) => {
            const isActive = step === s;
            const isPassed = step > s;
            let label = '';
            if (s === 1) label = "Couple";
            if (s === 2) label = "Ponte";
            if (s === 3) label = "Œufs";
            if (s === 4) label = "Résumé";
            if (s === 5) label = "Validation";

            return (
              <div 
                key={s} 
                className={`text-center pb-2 border-b-2 transition-all ${
                  isActive 
                    ? 'border-amber-500 text-amber-600 font-extrabold text-xs' 
                    : isPassed 
                      ? 'border-emerald-500 text-emerald-600 text-xs' 
                      : 'border-slate-100 text-slate-400 text-xs'
                }`}
              >
                <span className="block text-[10px] uppercase tracking-wider opacity-60">Étape {s}</span>
                <span className="truncate block font-bold mt-0.5">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Wizard content router */}
        <div className="min-h-[220px]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  {t('wizardPairSelect')}
                </label>
                {activeCouples.length === 0 ? (
                  <AppAlert type="warning">
                    Aucun couple actif n'est disponible pour recevoir une ponte. Veuillez d'abord former un couple reproducteur.
                  </AppAlert>
                ) : (
                  <AppSelect
                    value={selectedPairId}
                    onChange={(e) => setSelectedPairId(e.target.value)}
                    options={activeCouples.map(p => ({
                      value: p.id,
                      label: `${p.name} (M: #${p.maleId} x F: #${p.femaleId})`
                    }))}
                  />
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  {t('wizardClutchDate')}
                </label>
                <AppInput
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                  Observations de départ
                </label>
                <AppInput
                  type="text"
                  placeholder="Ex: Température stable, nid bien garni..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    {t('wizardEggAddCount')}
                  </label>
                  <AppSelect
                    value={eggCount.toString()}
                    onChange={(e) => setEggCount(parseInt(e.target.value))}
                    options={Array.from({ length: 10 }, (_, i) => ({
                      value: (i + 1).toString(),
                      label: `${i + 1} œufs`
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
                    {t('incubationModeLabel')}
                  </label>
                  <AppSelect
                    value={incubationMode}
                    onChange={(e) => setIncubationMode(e.target.value as any)}
                    options={[
                      { value: 'naturelle', label: t('incubationNaturelle') },
                      { value: 'assistee', label: t('incubationAssistee') },
                      { value: 'artificielle', label: t('incubationArtificielle') },
                    ]}
                  />
                </div>
              </div>

              <AppAlert type="info" className="text-xs">
                Une ponte de départ à <strong>{eggCount} œufs</strong> sera initialisée. Leurs dates de ponte seront incrémentées séquentiellement à partir de la date de début pour simuler le cycle biologique normal du canari.
              </AppAlert>
            </div>
          )}

          {step === 4 && forecasts && (
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 mb-2">
                Résumé des calculs biologiques prévisionnels
              </h4>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3 text-xs text-slate-700">
                <div className="flex justify-between pb-2 border-b border-slate-200/50">
                  <span className="font-semibold">Commencement (Ponte)</span>
                  <span className="font-bold text-slate-900">{forecasts.layingDate}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/50">
                  <span className="font-semibold">{t('candlingLabel')}</span>
                  <span className="font-bold text-amber-600">{forecasts.candlingDate}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/50">
                  <span className="font-semibold">{t('controlLabel')}</span>
                  <span className="font-bold text-slate-900">{forecasts.controlDate}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200/50">
                  <span className="font-semibold">{t('expectedHatchLabel')}</span>
                  <span className="font-bold text-emerald-600">{forecasts.expectedHatchDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t('endIncubLabel')}</span>
                  <span className="font-bold text-slate-900">{forecasts.endIncubationDate}</span>
                </div>
              </div>

              <AppAlert type="success" className="text-xs">
                Ces dates théoriques guideront vos alertes quotidiennes de mirage et de contrôle d'incubation.
              </AppAlert>
            </div>
          )}

          {step === 5 && (
            <div className="text-center space-y-3 py-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border border-emerald-100">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-800 text-lg">Prêt pour l'enregistrement</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {t('wizardValidationSuccess')}
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl text-left border border-slate-100 text-xs text-slate-600 space-y-1 max-w-md mx-auto">
                <div>• Couple cible : <strong>#{selectedPairId}</strong></div>
                <div>• Nombre d'œufs : <strong>{eggCount}</strong></div>
                <div>• Date de ponte : <strong>{startDate}</strong></div>
                <div>• Mode d'incubation : <strong className="text-amber-600 font-bold">{t(`incubation${incubationMode.charAt(0).toUpperCase() + incubationMode.slice(1)}`)}</strong></div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation actions */}
        <div className="flex justify-between border-t border-slate-100 pt-4">
          <div>
            {step > 1 && (
              <AppButton variant="text" onClick={handlePrev} size="sm" className="text-xs">
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Précédent
              </AppButton>
            )}
          </div>

          <div className="flex gap-2">
            <AppButton variant="text" onClick={onClose} size="sm" className="text-xs text-slate-400">
              Annuler
            </AppButton>

            {step < 5 ? (
              <AppButton 
                variant="success" 
                onClick={handleNext} 
                disabled={step === 1 && !selectedPairId}
                size="sm"
                className="text-xs"
              >
                Suivant
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </AppButton>
            ) : (
              <AppButton variant="success" onClick={handleFinalSave} size="sm" className="text-xs">
                Enregistrer & Démarrer
              </AppButton>
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
}
