/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE SUSPENSION / REACTIVATION DIALOG
 * Workflow to temporarily suspend or reactivate a license.
 */

import React, { useState } from 'react';
import { License } from '../../types/licensing';
import { LicenseKeyDisplay } from './LicenseKeyDisplay';
import { LicenseStatusBadge } from './LicenseStatusBadge';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppModal,
  AppButton,
  AppCard,
  AppInput,
  AppAlert,
  AppLoader
} from '../../../../components/design-system';
import { PauseCircle, PlayCircle } from 'lucide-react';

export interface LicenseSuspensionDialogProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onSuspend: (licenseId: string, reason: string) => Promise<void>;
  onReactivate: (licenseId: string) => Promise<void>;
}

export const LicenseSuspensionDialog: React.FC<LicenseSuspensionDialogProps> = ({
  license,
  isOpen,
  onClose,
  onSuspend,
  onReactivate,
}) => {
  const { t, isRtl } = useLanguage();
  const [reason, setReason] = useState('Audit de conformité en cours');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!license) return null;

  const isSuspended = license.status === 'suspended';

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSuspended) {
        await onReactivate(license.id);
      } else {
        if (!reason.trim()) {
          setError('Veuillez renseigner un motif de suspension.');
          setLoading(false);
          return;
        }
        await onSuspend(license.id, reason.trim());
      }
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
      title={isSuspended ? `Réactivation — ${license.holderName}` : `Suspension — ${license.holderName}`}
      size="md"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-suspension-dialog">
        {error && <AppAlert type="danger" title="Erreur">{error}</AppAlert>}

        <AppCard className="p-4 space-y-2 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">Statut Actuel :</span>
            <LicenseStatusBadge status={license.status} size="sm" />
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

        {isSuspended ? (
          <p className="text-xs text-slate-600 dark:text-slate-300">
            La réactivation restituera immédiatement le statut <strong>ACTIVE</strong> et réactivera les droits d'accès correspondants à cette licence.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              La suspension désactive temporairement les capacités commerciales sans révoquer définitivement la licence.
            </p>
            <AppInput
              label="Motif de la Suspension"
              placeholder="Ex: Vérification administrative, non-réponse du contact"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              data-testid="suspend-reason-input"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <AppButton variant="secondary" onClick={onClose} disabled={loading}>
            {t('cancel') || 'Annuler'}
          </AppButton>
          <AppButton
            variant={isSuspended ? 'primary' : 'secondary'}
            onClick={handleConfirm}
            disabled={loading}
            data-testid="confirm-suspension-btn"
          >
            {loading ? <AppLoader /> : isSuspended ? (
              <>
                <PlayCircle className="w-4 h-4 mr-1" />
                Réactiver la Licence
              </>
            ) : (
              <>
                <PauseCircle className="w-4 h-4 mr-1" />
                Suspendre la Licence
              </>
            )}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
