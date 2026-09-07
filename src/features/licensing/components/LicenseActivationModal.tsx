/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useLicensing } from '../hooks/useLicensing';
import { LicensingService } from '../services/LicensingService';
import {
  AppModal,
  AppCard,
  AppInput,
  AppButton,
  AppAlert,
  AppBadge,
  AppTabs,
  AppLoader
} from '../../../components/design-system';
import { Key, ShieldCheck, Cpu, CheckCircle2, AlertCircle, Copy, Check, QrCode } from 'lucide-react';
import { QrCodeScannerModal } from './QrCodeScannerModal';

export interface LicenseActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({ isOpen, onClose }) => {
  const { t, isRtl } = useLanguage();
  const { activeLicense, refresh, activateKey } = useLicensing();
  
  const [activeTab, setActiveTab] = useState<'online' | 'offline' | 'qr' | 'info'>('online');
  const [licenseKey, setLicenseKey] = useState('');
  const [holderName, setHolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning' | 'info'; title: string; message: string } | null>(null);

  // Offline Challenge State
  const [challengeCode, setChallengeCode] = useState('');
  const [offlineResponseCode, setOfflineResponseCode] = useState('');
  const [copiedChallenge, setCopiedChallenge] = useState(false);

  useEffect(() => {
    if (activeLicense) {
      setHolderName(activeLicense.holderName || '');
      setLicenseKey(activeLicense.key || '');
    }
  }, [activeLicense]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) {
      setAlert({ type: 'danger', title: t('error') || 'Erreur', message: t('keyNotFoundError') });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await activateKey(licenseKey.trim(), holderName.trim() || 'Titulaire Enterprise');
      if (res.isValid) {
        setAlert({ type: 'success', title: t('success') || 'Succès', message: `${t('activeStatus')} - ${res.message}` });
        await refresh();
      } else {
        setAlert({ type: 'danger', title: t('error') || 'Erreur', message: res.message || t('keyNotFoundError') });
      }
    } catch (err) {
      setAlert({ type: 'danger', title: t('error') || 'Erreur', message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChallenge = async () => {
    if (!licenseKey.trim()) {
      setAlert({ type: 'danger', title: t('error') || 'Erreur', message: `${t('licenseKey')} ${t('required') || 'requis'}.` });
      return;
    }
    setLoading(true);
    try {
      const service = LicensingService.getInstance();
      const code = await service.generateOfflineChallenge(licenseKey.trim());
      setChallengeCode(code);
      setAlert({ type: 'warning', title: t('hardwareChallengeCode'), message: t('challengeInstructions') || 'Transmettez ce Code Défi à votre administrateur pour obtenir le code de réponse.' });
    } catch (e) {
      setAlert({ type: 'danger', title: t('error') || 'Erreur', message: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeCode || !offlineResponseCode.trim()) {
      setAlert({ type: 'danger', title: t('error') || 'Erreur', message: t('enterOfflineResponseCode') || 'Veuillez saisir le code de réponse hors ligne.' });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      const service = LicensingService.getInstance();
      const res = await service.activateOffline(
        licenseKey.trim(),
        holderName.trim() || 'Titulaire Enterprise',
        challengeCode,
        offlineResponseCode.trim()
      );
      if (res.isValid) {
        setAlert({ type: 'success', title: t('success') || 'Succès', message: t('offlineActivationSuccess') || 'Activation hors ligne réussie !' });
        await refresh();
      } else {
        setAlert({ type: 'danger', title: t('error') || 'Erreur', message: res.message });
      }
    } catch (err) {
      setAlert({ type: 'danger', title: t('error') || 'Erreur', message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleQrScanned = async (payload: string) => {
    setLoading(true);
    setAlert(null);
    try {
      const service = LicensingService.getInstance();
      const result = await service.importOfflineBetaLicense(payload);
      if (result.isValid) {
        setAlert({ type: 'success', title: t('success') || 'Succès', message: t('qrLicenseActivatedSuccess') || 'Licence QR activée avec succès !' });
        await refresh();
      } else {
        setAlert({ type: 'danger', title: t('qrActivationError') || 'Erreur d\'activation QR', message: result.message || t('invalidQrCode') });
      }
    } catch (err: any) {
      setAlert({ type: 'danger', title: t('error') || 'Erreur', message: err.message || t('invalidQrCode') });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChallenge(true);
    setTimeout(() => setCopiedChallenge(false), 2000);
  };

  const tabs = [
    { id: 'online', label: t('activateLicense'), icon: Key },
    { id: 'qr', label: 'Scanner QR', icon: QrCode },
    { id: 'offline', label: t('offlineActivationTitle'), icon: Cpu },
    { id: 'info', label: t('licensingStatusTitle'), icon: ShieldCheck },
  ];

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('licensingTitle')}
      size="lg"
    >
      <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <AppTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab as any);
            setAlert(null);
          }}
        />

        {alert && (
          <AppAlert type={alert.type} title={alert.title}>
            {alert.message}
          </AppAlert>
        )}

        {/* ONLINE ACTIVATION TAB */}
        {activeTab === 'online' && (
          <form onSubmit={handleActivate} className="space-y-4">
            <AppCard className="space-y-4 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-500" />
                {t('activateLicense')}
              </h3>

              <AppInput
                label={t('licenseKey')}
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="LMSE-XXXX-XXXX-XXXX-XXXX"
                required
              />

              <AppInput
                label={t('holderName')}
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Ex: Elevage Canari Pro"
              />

              {activeLicense && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('licenseType')}:</span>
                    <AppBadge variant="accent" className="uppercase">{activeLicense.type}</AppBadge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('status')}:</span>
                    <AppBadge variant={activeLicense.status === 'active' ? 'success' : 'warning'}>
                      {activeLicense.status}
                    </AppBadge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('expirationDate')}:</span>
                    <span>{activeLicense.expiresAt ? new Date(activeLicense.expiresAt).toLocaleDateString() : 'Illimitée'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('devicesCount')}:</span>
                    <span>{activeLicense.activations.length} / {activeLicense.policy.maxDevices}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <AppButton variant="secondary" onClick={onClose} type="button">
                  {t('cancel')}
                </AppButton>
                <AppButton variant="primary" type="submit" disabled={loading}>
                  {loading ? <AppLoader /> : t('activateBtn')}
                </AppButton>
              </div>
            </AppCard>
          </form>
        )}

        {/* OFFLINE ACTIVATION TAB */}
        {activeTab === 'offline' && (
          <div className="space-y-4">
            <AppCard className="space-y-4 p-5">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-500" />
                {t('offlineActivationTitle')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Générez votre Code Défi unique sur cet appareil hors ligne, transmettez-le pour obtenir votre code de réponse, puis validez.
              </p>

              <AppInput
                label={t('licenseKey')}
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="LMSE-XXXX-XXXX-XXXX-XXXX"
              />

              <AppButton variant="secondary" onClick={handleGenerateChallenge} disabled={loading} className="w-full">
                {loading ? <AppLoader /> : '1. Générer le Code Défi Matériel'}
              </AppButton>

              {challengeCode && (
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
                  <span className="text-xs text-slate-400 block">{t('hardwareChallengeCode')}:</span>
                  <div className="flex items-center justify-between font-mono text-lg text-amber-400 font-bold">
                    <span>{challengeCode}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(challengeCode)}
                      className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Copier le code défi"
                    >
                      {copiedChallenge ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleOfflineActivate} className="space-y-3 pt-2">
                <AppInput
                  label={t('offlineActivationCode')}
                  value={offlineResponseCode}
                  onChange={(e) => setOfflineResponseCode(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  required
                />

                <div className="flex justify-end gap-3 pt-2">
                  <AppButton variant="secondary" onClick={onClose} type="button">
                    {t('cancel')}
                  </AppButton>
                  <AppButton variant="primary" type="submit" disabled={loading || !challengeCode}>
                    {loading ? <AppLoader /> : '2. Valider l\'Activation Hors Ligne'}
                  </AppButton>
                </div>
              </form>
            </AppCard>
          </div>
        )}

        {/* QR SCANNER TAB */}
        {activeTab === 'qr' && (
          <div className="space-y-4">
            <AppCard className="p-5 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-indigo-500" />
                Scannez votre licence QR
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Utilisez votre caméra ou importez une photo/image QR pour activer directement votre licence hors ligne.
              </p>
              <div className="pt-2">
                <QrCodeScannerModal
                  onScanSuccess={(payload) => {
                    handleQrScanned(payload);
                  }}
                  onCancel={() => setActiveTab('online')}
                  onFallbackToFile={() => setActiveTab('offline')}
                  onFallbackToKey={() => setActiveTab('online')}
                />
              </div>
            </AppCard>
          </div>
        )}

        {/* LICENSE INFO TAB */}
        {activeTab === 'info' && (
          <AppCard className="space-y-4 p-5">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              {t('licensingStatusTitle')}
            </h3>

            {activeLicense ? (
              <div className="space-y-3 text-sm">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Licence Active et Intègre</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Signée numériquement (SHA-256 / AES-256) avec protection anti-rollback de l'horloge.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-500 dark:text-slate-400 block">{t('holderName')}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{activeLicense.holderName}</span>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-500 dark:text-slate-400 block">{t('licenseType')}</span>
                    <span className="font-semibold text-slate-900 dark:text-white uppercase">{activeLicense.type}</span>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-500 dark:text-slate-400 block">{t('devicesCount')}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {activeLicense.activations.length} / {activeLicense.policy.maxDevices} appareils
                    </span>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-500 dark:text-slate-400 block">{t('expirationDate')}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {activeLicense.expiresAt ? new Date(activeLicense.expiresAt).toLocaleDateString() : 'Permanente'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Clé Active :</span>
                  <div className="font-mono text-xs p-2 bg-slate-900 text-amber-400 rounded-lg break-all">
                    {activeLicense.key}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
                <p>{t('noLicenseFound')}</p>
              </div>
            )}
          </AppCard>
        )}
      </div>
    </AppModal>
  );
};
