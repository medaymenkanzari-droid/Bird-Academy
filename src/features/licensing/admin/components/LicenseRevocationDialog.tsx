/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE REVOCATION DIALOG
 * Irreversible administrative revocation with mandatory reason and security audit logging.
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
  AppAlert,
  AppLoader
} from '../../../../components/design-system';
import { Ban, AlertTriangle, ShieldAlert } from 'lucide-react';

export interface LicenseRevocationDialogProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onRevoke: (licenseId: string, reason: string) => Promise<void>;
}

export const LicenseRevocationDialog: React.FC<LicenseRevocationDialogProps> = ({
  license,
  isOpen,
  onClose,
  onRevoke,
}) => {
  const { t, isRtl } = useLanguage();
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!license) return null;

  const tier = SubscriptionTierResolver.resolve(license);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Veuillez spécifier le motif de révocation.');
      return;
    }
    if (!confirmed) {
      setError('Veuillez cocher la case confirmant la compréhension du caractère irréversible.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onRevoke(license.id, reason.trim());
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
      title={`Révocation Définitive — ${license.holderName}`}
      size="md"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-revocation-dialog">
        {error && <AppAlert type="danger" title="Erreur">{error}</AppAlert>}

        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-black text-sm">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            ATTENTION — ACTION IRRÉVERSIBLE
          </div>
          <p className="text-xs text-red-600 dark:text-red-400">
            La révocation placera immédiatement cette clé sur la liste locale de révocation (CRL). L'application passera en mode FREE sans supprimer les données d'élevage de l'utilisateur.
          </p>
        </div>

        <AppCard className="p-4 space-y-2 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">ID Licence :</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{license.id}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Titulaire :</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{license.holderName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Tier :</span>
            <LicenseTierBadge tier={tier} size="sm" />
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Clé :</span>
            <LicenseKeyDisplay licenseKey={license.key} />
          </div>
        </AppCard>

        <div className="space-y-3">
          <AppInput
            label="Motif obligatoire de révocation"
            placeholder="Ex: Fraude détectée, non-paiement, demande formelle du client"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            data-testid="revoke-reason-input"
          />

          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 cursor-pointer text-xs select-none">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 rounded text-red-600 focus:ring-red-500"
              data-testid="confirm-revoke-checkbox"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Je confirme vouloir révoquer définitivement cette licence LMSE et l'inscrire sur la liste des clés interdites.
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <AppButton variant="secondary" onClick={onClose} disabled={loading}>
            {t('cancel') || 'Annuler'}
          </AppButton>
          <AppButton
            variant="danger"
            onClick={handleConfirm}
            disabled={loading || !confirmed || !reason.trim()}
            data-testid="confirm-revoke-btn"
          >
            {loading ? <AppLoader /> : (
              <>
                <Ban className="w-4 h-4 mr-1" />
                Révoquer Définitivement
              </>
            )}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
