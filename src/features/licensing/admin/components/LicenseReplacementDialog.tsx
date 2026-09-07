/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE REPLACEMENT DIALOG
 * Secure workflow to replace a compromised, corrupted or upgraded license
 * while archiving the old license state and preserving full audit logs.
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
  AppInput,
  AppSelect,
  AppAlert,
  AppLoader
} from '../../../../components/design-system';
import { RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export interface LicenseReplacementDialogProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onReplace: (oldLicenseId: string, targetTier: SubscriptionTier, holderName: string, holderEmail: string | undefined, durationDays: number | null, reason: string) => Promise<void>;
}

export const LicenseReplacementDialog: React.FC<LicenseReplacementDialogProps> = ({
  license,
  isOpen,
  onClose,
  onReplace,
}) => {
  const { t, isRtl } = useLanguage();
  const [targetTier, setTargetTier] = useState<SubscriptionTier>('PRO');
  const [holderName, setHolderName] = useState('');
  const [holderEmail, setHolderEmail] = useState('');
  const [durationOption, setDurationOption] = useState('365');
  const [reason, setReason] = useState('Remplacement de clé de sécurité');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (license) {
      setTargetTier(SubscriptionTierResolver.resolve(license));
      setHolderName(license.holderName);
      setHolderEmail(license.holderEmail || '');
    }
  }, [license]);

  if (!license) return null;

  const currentTier = SubscriptionTierResolver.resolve(license);
  const durationDays = durationOption === 'permanent' ? null : parseInt(durationOption, 10);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Veuillez spécifier la raison du remplacement.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onReplace(
        license.id,
        targetTier,
        holderName.trim() || license.holderName,
        holderEmail.trim() || undefined,
        durationDays,
        reason.trim()
      );
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
      title={`Remplacement de Licence — ${license.holderName}`}
      size="md"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-replacement-dialog">
        {error && <AppAlert type="danger" title="Erreur">{error}</AppAlert>}

        <AppAlert type="warning" title="Archive & Remplacement">
          L'ancienne licence (ID: {license.id}) passera irréversiblement en statut <strong>REPLACED</strong> et sera archivée. La nouvelle licence générée sera signée cryptographiquement et prendra le relais.
        </AppAlert>

        <AppCard className="p-4 space-y-2 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Licence Source :</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{license.id}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Tier Actuel :</span>
            <LicenseTierBadge tier={currentTier} size="sm" />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Clé :</span>
            <LicenseKeyDisplay licenseKey={license.key} />
          </div>
        </AppCard>

        <div className="space-y-3">
          <AppSelect
            label="Tier de la Nouvelle Licence"
            value={targetTier}
            onChange={(e) => setTargetTier(e.target.value as SubscriptionTier)}
            options={[
              { value: 'FREE', label: 'Plan FREE' },
              { value: 'PREMIUM', label: 'Plan PREMIUM' },
              { value: 'PRO', label: 'Plan PRO' },
            ]}
          />

          <AppInput
            label="Nom du Titulaire"
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            required
          />

          <AppInput
            label="Email du Titulaire (Optionnel)"
            value={holderEmail}
            onChange={(e) => setHolderEmail(e.target.value)}
            type="email"
          />

          <AppSelect
            label="Durée de la Nouvelle Licence"
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
            label="Motif du Remplacement"
            placeholder="Ex: Clé compromise, rotation de certificat, changement de machine"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
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
            data-testid="confirm-replace-btn"
          >
            {loading ? <AppLoader /> : (
              <>
                <RotateCcw className="w-4 h-4 mr-1" />
                Générer la Licence de Remplacement
              </>
            )}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
