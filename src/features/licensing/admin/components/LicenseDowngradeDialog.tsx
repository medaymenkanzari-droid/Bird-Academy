/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE DOWNGRADE DIALOG
 * Workflow to downgrade commercial tier (PRO -> PREMIUM, PRO -> FREE, PREMIUM -> FREE)
 * with formal guarantee of 100% data retention.
 */

import React, { useState } from 'react';
import { License } from '../../types/licensing';
import { SubscriptionTier } from '../../../subscription/types/subscription';
import { SubscriptionTierResolver } from '../../../subscription/services/SubscriptionTierResolver';
import { LicenseTierBadge } from './LicenseTierBadge';
import { LicenseKeyDisplay } from './LicenseKeyDisplay';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppModal,
  AppButton,
  AppCard,
  AppSelect,
  AppInput,
  AppAlert,
  AppLoader
} from '../../../../components/design-system';
import { ArrowDownCircle, ShieldCheck, Lock } from 'lucide-react';

export interface LicenseDowngradeDialogProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onDowngrade: (licenseId: string, currentTier: SubscriptionTier, targetTier: SubscriptionTier, durationDays: number | null, reason?: string) => Promise<void>;
}

export const LicenseDowngradeDialog: React.FC<LicenseDowngradeDialogProps> = ({
  license,
  isOpen,
  onClose,
  onDowngrade,
}) => {
  const { t, isRtl } = useLanguage();
  const [targetTier, setTargetTier] = useState<SubscriptionTier>('PREMIUM');
  const [durationOption, setDurationOption] = useState('365');
  const [reason, setReason] = useState('Ajustement commercial ou fin de période PRO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!license) return null;

  const currentTier = SubscriptionTierResolver.resolve(license);

  const availableDowngradeTiers: { value: SubscriptionTier; label: string }[] = [];
  if (currentTier === 'PRO') {
    availableDowngradeTiers.push({ value: 'PREMIUM', label: 'Plan PREMIUM (Verrouille Bird Intelligence & IA illimitée)' });
    availableDowngradeTiers.push({ value: 'FREE', label: 'Plan FREE (Niveau de base standard)' });
  } else if (currentTier === 'PREMIUM') {
    availableDowngradeTiers.push({ value: 'FREE', label: 'Plan FREE (Niveau de base standard)' });
  }

  const durationDays = durationOption === 'permanent' ? null : parseInt(durationOption, 10);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onDowngrade(license.id, currentTier, targetTier, durationDays, reason.trim());
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
      title={`Downgrade Commercial — ${license.holderName}`}
      size="md"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-downgrade-dialog">
        {error && <AppAlert type="danger" title="Erreur">{error}</AppAlert>}

        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              Garantie Absolue de Rétention des Données
            </h4>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              Aucune donnée d'élevage (oiseaux, couvées, cages, santé, génétique, finances) ne sera supprimée. Les fonctionnalités avancées seront verrouillées jusqu'au prochain ré-upgrade.
            </p>
          </div>
        </div>

        <AppCard className="p-4 space-y-2 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Tier Actuel :</span>
            <LicenseTierBadge tier={currentTier} size="sm" />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Titulaire :</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{license.holderName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Clé :</span>
            <LicenseKeyDisplay licenseKey={license.key} />
          </div>
        </AppCard>

        {availableDowngradeTiers.length === 0 ? (
          <AppAlert type="warning" title="Déjà au Tier Minimal">
            Cette licence est déjà au niveau <strong>FREE</strong>.
          </AppAlert>
        ) : (
          <div className="space-y-3">
            <AppSelect
              label="Sélectionner le Tier Cible"
              value={targetTier}
              onChange={(e) => setTargetTier(e.target.value as SubscriptionTier)}
              options={availableDowngradeTiers}
            />

            <AppSelect
              label="Durée de la Licence Downgradée"
              value={durationOption}
              onChange={(e) => setDurationOption(e.target.value)}
              options={[
                { value: '30', label: '30 jours' },
                { value: '90', label: '90 jours' },
                { value: '365', label: '365 jours (1 an)' },
                { value: '730', label: '730 jours (2 ans)' },
                { value: 'permanent', label: 'Illimitée (Permanente)' },
              ]}
            />

            <AppInput
              label="Motif du Downgrade (Optionnel)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <AppButton variant="secondary" onClick={onClose} disabled={loading}>
            {t('cancel') || 'Annuler'}
          </AppButton>
          <AppButton
            variant="secondary"
            onClick={handleConfirm}
            disabled={loading || availableDowngradeTiers.length === 0}
            data-testid="confirm-downgrade-btn"
          >
            {loading ? <AppLoader /> : (
              <>
                <ArrowDownCircle className="w-4 h-4 mr-1" />
                Confirmer le Downgrade
              </>
            )}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
