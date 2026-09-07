/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE UPGRADE DIALOG
 * Workflow to elevate commercial tier (FREE -> PREMIUM, FREE -> PRO, PREMIUM -> PRO)
 * with immediate capability expansion and 100% data preservation.
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
import { ArrowUpCircle, Sparkles, Crown } from 'lucide-react';

export interface LicenseUpgradeDialogProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (licenseId: string, currentTier: SubscriptionTier, targetTier: SubscriptionTier, durationDays: number | null, reason?: string) => Promise<void>;
}

export const LicenseUpgradeDialog: React.FC<LicenseUpgradeDialogProps> = ({
  license,
  isOpen,
  onClose,
  onUpgrade,
}) => {
  const { t, isRtl } = useLanguage();
  const [targetTier, setTargetTier] = useState<SubscriptionTier>('PRO');
  const [durationOption, setDurationOption] = useState('365');
  const [reason, setReason] = useState('Souscription à l\'édition supérieure');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!license) return null;

  const currentTier = SubscriptionTierResolver.resolve(license);

  const availableUpgradeTiers: { value: SubscriptionTier; label: string }[] = [];
  if (currentTier === 'FREE') {
    availableUpgradeTiers.push({ value: 'PREMIUM', label: 'Plan PREMIUM (Élevage Avancé & Génétique)' });
    availableUpgradeTiers.push({ value: 'PRO', label: 'Plan PRO (Intelligence, Pédigrée & IA Illimitée)' });
  } else if (currentTier === 'PREMIUM') {
    availableUpgradeTiers.push({ value: 'PRO', label: 'Plan PRO (Intelligence, Pédigrée & IA Illimitée)' });
  }

  const durationDays = durationOption === 'permanent' ? null : parseInt(durationOption, 10);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await onUpgrade(license.id, currentTier, targetTier, durationDays, reason.trim());
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
      title={`Upgrade Commercial — ${license.holderName}`}
      size="md"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-upgrade-dialog">
        {error && <AppAlert type="danger" title="Erreur">{error}</AppAlert>}

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

        {availableUpgradeTiers.length === 0 ? (
          <AppAlert type="warning" title="Déjà au Tier Maximum">
            Cette licence bénéficie déjà du plan <strong>PRO</strong> le plus élevé.
          </AppAlert>
        ) : (
          <div className="space-y-3">
            <AppSelect
              label="Sélectionner le Nouveau Tier"
              value={targetTier}
              onChange={(e) => setTargetTier(e.target.value as SubscriptionTier)}
              options={availableUpgradeTiers}
            />

            <AppSelect
              label="Durée de la Licence Upgradée"
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
              label="Raison de l'Upgrade (Optionnel)"
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
            variant="primary"
            onClick={handleConfirm}
            disabled={loading || availableUpgradeTiers.length === 0}
            data-testid="confirm-upgrade-btn"
          >
            {loading ? <AppLoader /> : (
              <>
                <ArrowUpCircle className="w-4 h-4 mr-1" />
                Valider l'Upgrade Commercial
              </>
            )}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
