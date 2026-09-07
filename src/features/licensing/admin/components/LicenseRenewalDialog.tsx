/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE RENEWAL DIALOG
 * Workflow to extend license validity period with audit trail preservation.
 */

import React, { useState } from 'react';
import { License } from '../../types/licensing';
import { LicenseKeyDisplay } from './LicenseKeyDisplay';
import { LicenseTierBadge } from './LicenseTierBadge';
import { SubscriptionTierResolver } from '../../../subscription/services/SubscriptionTierResolver';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppModal,
  AppButton,
  AppCard,
  AppInput,
  AppSelect,
  AppAlert,
  AppLoader
} from '../../../../components/design-system';
import { Calendar, RefreshCw, ShieldCheck } from 'lucide-react';

export interface LicenseRenewalDialogProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onRenew: (licenseId: string, durationDays: number | null, notes?: string) => Promise<void>;
}

export const LicenseRenewalDialog: React.FC<LicenseRenewalDialogProps> = ({
  license,
  isOpen,
  onClose,
  onRenew,
}) => {
  const { t, isRtl } = useLanguage();
  const [durationOption, setDurationOption] = useState<string>('365');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!license) return null;

  const tier = SubscriptionTierResolver.resolve(license);
  const currentExpiry = license.expiresAt
    ? new Date(license.expiresAt).toLocaleDateString()
    : 'Illimitée (Permanente)';

  const durationDays = durationOption === 'permanent' ? null : parseInt(durationOption, 10);

  const calculateNewExpiry = (): string => {
    if (durationDays === null) return 'Illimitée (Permanente)';
    const base = license.expiresAt && new Date(license.expiresAt).getTime() > Date.now()
      ? new Date(license.expiresAt).getTime()
      : Date.now();
    const newExp = new Date(base + durationDays * 24 * 60 * 60 * 1000);
    return newExp.toLocaleDateString();
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onRenew(license.id, durationDays, notes.trim() || undefined);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Renouvellement de Licence — ${license.holderName}`}
      size="md"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-renewal-dialog">
        {error && <AppAlert type="danger" title="Erreur">{error}</AppAlert>}

        <AppCard className="p-4 space-y-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Tier Commercial :</span>
            <LicenseTierBadge tier={tier} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Clé actuelle :</span>
            <LicenseKeyDisplay licenseKey={license.key} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500">Expiration actuelle :</span>
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{currentExpiry}</span>
          </div>
        </AppCard>

        <div className="space-y-3">
          <AppSelect
            label="Période de Prolongation"
            value={durationOption}
            onChange={(e) => setDurationOption(e.target.value)}
            options={[
              { value: '30', label: '+30 jours (1 mois)' },
              { value: '90', label: '+90 jours (3 mois)' },
              { value: '180', label: '+180 jours (6 mois)' },
              { value: '365', label: '+365 jours (1 an)' },
              { value: '730', label: '+730 jours (2 ans)' },
              { value: 'permanent', label: 'Illimitée (Conversion permanente)' },
            ]}
          />

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Nouvelle date d'expiration :</span>
            </div>
            <span className="text-xs font-black text-indigo-700 dark:text-indigo-300" data-testid="new-expiry-display">
              {calculateNewExpiry()}
            </span>
          </div>

          <AppInput
            label="Notes administratives (Optionnel)"
            placeholder="Ex: Renouvellement annuel validé avec bon de commande #BC-2026-99"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <AppButton variant="secondary" onClick={onClose} disabled={loading}>
            {t('cancel') || 'Annuler'}
          </AppButton>
          <AppButton
            variant="primary"
            onClick={handleConfirm}
            disabled={loading}
            data-testid="confirm-renew-btn"
          >
            {loading ? <AppLoader /> : (
              <>
                <RefreshCw className="w-4 h-4 mr-1" />
                Confirmer le Renouvellement
              </>
            )}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
