/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { LicenseType } from '../types/licensing';
import { GenerateLicenseOptions } from '../engines/LicenseGenerator';
import {
  AppModal,
  AppCard,
  AppInput,
  AppSelect,
  AppButton,
  AppAlert,
  AppLoader
} from '../../../components/design-system';
import { ShieldPlus } from 'lucide-react';

export interface LicenseCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (options: GenerateLicenseOptions) => Promise<any>;
}

export const LicenseCreationModal: React.FC<LicenseCreationModalProps> = ({ isOpen, onClose, onCreate }) => {
  const { t, isRtl } = useLanguage();

  const [holderName, setHolderName] = useState('');
  const [holderEmail, setHolderEmail] = useState('');
  const [type, setType] = useState<LicenseType>('commercial');
  const [durationDays, setDurationDays] = useState<string>('365');
  const [maxDevices, setMaxDevices] = useState<string>('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName.trim()) {
      setError('Veuillez spécifier le nom du titulaire.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isPermanent = type === 'permanent' || durationDays === '0';
      await onCreate({
        holderName: holderName.trim(),
        holderEmail: holderEmail.trim() || undefined,
        type,
        durationDays: isPermanent ? null : parseInt(durationDays, 10),
        maxDevices: parseInt(maxDevices, 10),
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { value: 'beta', label: `${t('betaLabel')} (90 jours, 2 appareils)` },
    { value: 'commercial', label: `${t('commercialLabel')} (365 jours, 3 appareils)` },
    { value: 'permanent', label: `${t('permanentLabel')} (Illimitée, 5 appareils)` },
    { value: 'temporary', label: `${t('temporaryLabel')} (30 jours, 1 appareil)` },
    { value: 'enterprise', label: `${t('enterpriseLabel')} (365 jours, 25 appareils)` },
    { value: 'association', label: `${t('associationLabel')} (365 jours, 10 appareils)` },
    { value: 'veterinary', label: `${t('veterinaryLabel')} (365 jours, 15 appareils)` },
  ];

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title={t('createLicenseTitle')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
        {error && <AppAlert type="danger" title="Erreur">{error}</AppAlert>}

        <AppCard className="space-y-4 p-5">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldPlus className="w-5 h-5 text-indigo-500" />
            Paramètres de la Licence
          </h3>

          <AppInput
            label={t('holderName')}
            value={holderName}
            onChange={(e) => setHolderName(e.target.value)}
            placeholder="Ex: Club Ornithologique de Paris"
            required
          />

          <AppInput
            label={t('holderEmail')}
            value={holderEmail}
            onChange={(e) => setHolderEmail(e.target.value)}
            placeholder="contact@ornitho.org"
            type="email"
          />

          <AppSelect
            label={t('licenseType')}
            value={type}
            onChange={(e) => setType(e.target.value as LicenseType)}
            options={typeOptions}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AppInput
              label="Durée (jours - 0 pour illimitée)"
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              disabled={type === 'permanent'}
            />
            <AppInput
              label={t('devicesCount')}
              type="number"
              value={maxDevices}
              onChange={(e) => setMaxDevices(e.target.value)}
            />
          </div>
        </AppCard>

        <div className="flex justify-end gap-3 pt-2">
          <AppButton variant="secondary" onClick={onClose} type="button">
            {t('cancel')}
          </AppButton>
          <AppButton variant="primary" type="submit" disabled={loading}>
            {loading ? <AppLoader /> : t('save')}
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
};
