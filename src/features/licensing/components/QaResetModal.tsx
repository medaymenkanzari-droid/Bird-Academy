/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — QA TEST ENVIRONMENT RESET CONFIRMATION MODAL
 * Mission QA-FREE-CLEAN-001
 * 
 * Displays strict confirmation before removing QA license state,
 * guarantees breeding data & preferences are 100% preserved,
 * and executes clean application reload to native FREE mode.
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useLicensing } from '../hooks/useLicensing';
import { AppModal, AppButton, AppLoader } from '../../../components/design-system';
import { FlaskConical, ShieldCheck } from 'lucide-react';

export interface QaResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QaResetModal: React.FC<QaResetModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t, isRtl } = useLanguage();
  const { resetLicenseForQA } = useLicensing();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await resetLicenseForQA();
      if (onSuccess) {
        onSuccess();
      }
      if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
        try {
          window.location.reload();
        } catch {
          onClose();
        }
      } else {
        onClose();
      }
    } catch (err) {
      console.error('[QA RESET] Error executing QA reset:', err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-amber-500">
          <FlaskConical className="w-5 h-5" />
          <span>{t('qaResetConfirmTitle') || "Réinitialiser l'environnement de test ?"}</span>
        </div>
      }
      size="md"
    >
      <div className="space-y-4 text-xs" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
          <p className="text-slate-800 dark:text-slate-200 font-medium whitespace-pre-line leading-relaxed">
            {t('qaResetConfirmDesc') || "Cette action supprimera uniquement les données de licence et de test QA.\nVos oiseaux et vos données d'élevage seront conservés."}
          </p>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{t('sysInfoDataIntegrityOk') || "Données d'élevage et préférences préservées."}</span>
          </div>
        </div>

        <p className="font-bold text-slate-900 dark:text-white text-sm">
          {t('qaResetConfirmPrompt') || "Continuer ?"}
        </p>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <AppButton
            variant="secondary"
            onClick={onClose}
            type="button"
            data-testid="qa-reset-cancel-btn"
            disabled={loading}
          >
            {t('cancel') || "Annuler"}
          </AppButton>
          <AppButton
            variant="danger"
            onClick={handleConfirm}
            type="button"
            data-testid="qa-reset-confirm-btn"
            disabled={loading}
          >
            {loading ? <AppLoader /> : (t('qaResetConfirmAction') || "Réinitialiser")}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
