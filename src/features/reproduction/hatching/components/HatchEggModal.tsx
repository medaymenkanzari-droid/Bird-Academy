/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';
import { HatchingService } from '../services/HatchingService';
import { useLanguage } from '../../../../context/LanguageContext';
import { BIO_TRANSLATIONS } from '../../utils/bioTranslations';
import { 
  AppModal, AppButton, AppInput, AppSelect 
} from '../../../../components/design-system';

interface HatchEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  eggId: string;
  eggNumber: number;
  onSuccess: () => void;
}

export default function HatchEggModal({ isOpen, onClose, eggId, eggNumber, onSuccess }: HatchEggModalProps) {
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

  const [hatchDate, setHatchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [birthWeight, setBirthWeight] = useState('1.5');
  const [assistance, setAssistance] = useState<'none' | 'light' | 'full'>('none');
  const [obs, setObs] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const w = parseFloat(birthWeight);
    if (isNaN(w) || w <= 0) {
      setError("Veuillez saisir un poids valide.");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = HatchingService.hatchEgg(eggId, hatchDate, w, assistance, obs);
      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors du processus de فقس.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('hatchAssistantTitle')}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans">
        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex gap-2.5 items-start">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 leading-relaxed">
            Vous enregistrez l'éclosion de <strong>{t('eggNumber', { number: eggNumber })}</strong>. 
            Le système créera automatiquement un profil de poussin lié et un historique reproductif complet sans aucune double saisie.
          </div>
        </div>

        {error && (
          <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
            {t('hatchDateLabel')}
          </label>
          <AppInput
            type="date"
            value={hatchDate}
            onChange={(e) => setHatchDate(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
              {t('birthWeightLabel')}
            </label>
            <input
              type="number"
              step="0.01"
              value={birthWeight}
              onChange={(e) => setBirthWeight(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
              {t('assistanceLabel')}
            </label>
            <AppSelect
              value={assistance}
              onChange={(e) => setAssistance(e.target.value as any)}
              options={[
                { value: 'none', label: t('assistanceNone') },
                { value: 'light', label: t('assistanceLight') },
                { value: 'full', label: t('assistanceFull') },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
            Observations / Anomalies constatées
          </label>
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ex: Légère fragilité de coquille, vitalité excellente..."
            rows={3}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/30 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <AppButton variant="outline" onClick={onClose} disabled={isSubmitting} className="text-xs">
            Annuler
          </AppButton>
          <AppButton type="submit" variant="success" disabled={isSubmitting} className="text-xs">
            {isSubmitting ? "Enregistrement..." : "Confirmer l'éclosion"}
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
}
