/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY USER - FIRST LAUNCH ACTIVATION SCREEN
 * Multi-mode activation screen supporting key entry, .lmse file import, and QR code scanning.
 * Operates 100% offline without public server dependency.
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { LanguageSelector } from '../../../components/LanguageSelector';
import { useLicensing } from '../hooks/useLicensing';
import { LicensingService } from '../services/LicensingService';
import {
  AppCard,
  AppInput,
  AppButton,
  AppAlert,
  AppBadge,
  AppLoader,
  AppLogo,
  BrandLogoIcon
} from '../../../components/design-system';
import { Key, ShieldCheck, CheckCircle2, AlertCircle, Cpu, Wifi, WifiOff, ArrowRight, Copy, Check, Upload, QrCode, FileText } from 'lucide-react';
import { QrCodeScannerModal } from './QrCodeScannerModal';
import { motion, AnimatePresence } from 'motion/react';
import { isQaMode } from '../../../config/appMode';
import { QaResetModal } from './QaResetModal';
import { brandAssets } from '../../../config/brandAssets';

export interface FirstLaunchActivationScreenProps {
  onActivationSuccess: () => void;
}

export const FirstLaunchActivationScreen: React.FC<FirstLaunchActivationScreenProps> = ({ onActivationSuccess }) => {
  const { t, isRtl } = useLanguage();
  const { activeLicense, validation, refresh, activateKey, resetLicenseForQA } = useLicensing();

  const [method, setMethod] = useState<'key' | 'file' | 'qr'>('file');
  const [isQaResetModalOpen, setIsQaResetModalOpen] = useState(false);
  const [licenseKey, setLicenseKey] = useState('');
  const [holderName, setHolderName] = useState('');
  const [qrContent, setQrContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // UI step: 'input' | 'success' | 'offline_challenge'
  const [mode, setMode] = useState<'input' | 'success' | 'offline_challenge'>('input');

  // Error alert state
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning' | 'info'; title: string; message: string } | null>(null);

  // Offline Challenge State
  const [challengeCode, setChallengeCode] = useState('');
  const [offlineResponseCode, setOfflineResponseCode] = useState('');
  const [copiedChallenge, setCopiedChallenge] = useState(false);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update mode based on current validation status
  useEffect(() => {
    if (validation?.isValid && activeLicense) {
      setMode('success');
    }
  }, [validation, activeLicense]);

  const handleActivateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = licenseKey.trim().toUpperCase();

    if (!cleanKey) {
      setAlert({
        type: 'danger',
        title: t('invalidLicense'),
        message: t('keyNotFoundError'),
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await activateKey(cleanKey, holderName.trim() || 'Utilisateur Bird Academy');
      if (res.isValid) {
        setAlert({
          type: 'success',
          title: t('licenseActivatedTitle'),
          message: res.message,
        });
        setMode('success');
        await refresh();
        if (onActivationSuccess) onActivationSuccess();
      } else {
        let errTitle = t('invalidLicense');
        if (res.code === 'EXPIRED') errTitle = t('licenseExpiredTitle');
        if (res.code === 'LICENSE_REVOKED') errTitle = t('licenseRevokedTitle');
        if (res.code === 'DEVICE_LIMIT_EXCEEDED') errTitle = t('deviceNotAuthorized');
        if (res.code === 'LMSE_BACKEND_UNREACHABLE') errTitle = 'Connexion au serveur de licence impossible (LMSE_BACKEND_UNREACHABLE)';
        if (res.code === 'INVALID_API_CONFIGURATION') errTitle = 'Configuration d\'URL API Invalide (INVALID_API_CONFIGURATION)';

        setAlert({
          type: 'danger',
          title: errTitle,
          message: res.message || t('invalidLicense'),
        });
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        title: t('invalidLicense'),
        message: (err as Error).message || t('keyNotFoundError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setAlert(null);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const content = evt.target?.result as string;
        const service = LicensingService.getInstance();
        const res = await service.importOfflineBetaLicense(content);

        if (res.isValid) {
          setAlert({
            type: 'success',
            title: t('licenseActivatedTitle'),
            message: res.message,
          });
          setMode('success');
          await refresh();
          if (onActivationSuccess) onActivationSuccess();
        } else {
          setAlert({
            type: 'danger',
            title: t('invalidLicense'),
            message: res.message,
          });
        }
        setLoading(false);
      };
      reader.readAsText(file);
    } catch (err: any) {
      setAlert({
        type: 'danger',
        title: t('invalidLicense'),
        message: err.message || t('invalidLicense'),
      });
      setLoading(false);
    }
  };

  const handleQrScanned = async (rawPayload: string) => {
    if (!rawPayload || !rawPayload.trim()) return;

    setLoading(true);
    setAlert(null);

    try {
      const service = LicensingService.getInstance();
      const res = await service.importOfflineBetaLicense(rawPayload.trim());

      if (res.isValid) {
        setAlert({
          type: 'success',
          title: t('licenseActivatedTitle'),
          message: res.message,
        });
        setMode('success');
        await refresh();
        if (onActivationSuccess) onActivationSuccess();
      } else {
        let errTitle = t('invalidLicense');
        let errMessage = res.message;

        if (res.code === 'INVALID_JSON_FORMAT' || res.code === 'INVALID_FILE') {
          errMessage = t('invalidQrCode');
        } else if (res.code === 'UNSUPPORTED_FORMAT' || res.code === 'UNSUPPORTED_VERSION' || res.code === 'CORRUPTED') {
          errMessage = t('incompatibleQrCode');
        } else if (res.code === 'INVALID_SIGNATURE') {
          errMessage = t('invalidSignature');
        } else if (res.code === 'INVALID_CHECKSUM') {
          errMessage = t('invalidChecksum');
        } else if (res.code === 'EXPIRED') {
          errTitle = t('licenseExpiredTitle');
          errMessage = t('licenseExpiredTitle');
        } else if (res.code === 'DEVICE_LIMIT_EXCEEDED') {
          errTitle = t('deviceNotAuthorized');
          errMessage = t('deviceLimitError');
        }

        setAlert({
          type: 'danger',
          title: errTitle,
          message: errMessage,
        });
      }
    } catch (err: any) {
      setAlert({
        type: 'danger',
        title: t('invalidLicense'),
        message: err.message || t('invalidQrCode'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChallenge = async () => {
    const cleanKey = licenseKey.trim().toUpperCase();
    if (!cleanKey) {
      setAlert({
        type: 'danger',
        title: t('invalidLicense'),
        message: `${t('licenseKey')} est requis pour générer le code défi.`,
      });
      return;
    }
    setLoading(true);
    try {
      const service = LicensingService.getInstance();
      const code = await service.generateOfflineChallenge(cleanKey);
      setChallengeCode(code);
      setAlert({
        type: 'warning',
        title: t('hardwareChallengeCode'),
        message: 'Transmettez ce Code Défi à votre administrateur pour obtenir votre code de réponse.',
      });
    } catch (e) {
      setAlert({
        type: 'danger',
        title: t('invalidLicense'),
        message: (e as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeCode || !offlineResponseCode.trim()) {
      setAlert({
        type: 'danger',
        title: t('invalidLicense'),
        message: 'Veuillez remplir le code défi et le code de réponse.',
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const service = LicensingService.getInstance();
      const res = await service.activateOffline(
        licenseKey.trim().toUpperCase(),
        holderName.trim() || 'Utilisateur Bird Academy',
        challengeCode,
        offlineResponseCode.trim()
      );

      if (res.isValid) {
        setAlert({
          type: 'success',
          title: t('licenseActivatedTitle'),
          message: res.message,
        });
        setMode('success');
        await refresh();
      } else {
        setAlert({
          type: 'danger',
          title: t('invalidLicense'),
          message: res.message,
        });
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        title: t('invalidLicense'),
        message: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedChallenge(true);
      setTimeout(() => setCopiedChallenge(false), 2000);
    }
  };

  return (
    <div 
      data-testid="first-launch-screen"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 border-b border-slate-800/60 mb-6">
        <div className="flex items-center gap-3">
          <img src={brandAssets.logoIcon} alt="Bird Academy" className="w-9 h-9 object-contain inline-block" />
          <div className="flex flex-col justify-center leading-tight">
            <span className="tracking-tight font-black uppercase font-sans text-base text-white">
              Bird Academy
            </span>
            <span className="font-mono font-bold uppercase text-[9px] tracking-widest text-amber-400">
              AVIAN ERP • SUITE PROFESSIONNELLE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-medium">{t('onlineStatus')}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-medium">{t('offlineStatus')}</span>
              </>
            )}
          </div>

          <LanguageSelector />
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-xl mx-auto my-auto py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-6 md:p-8 bg-slate-900 border border-slate-800 shadow-2xl backdrop-blur-md rounded-2xl space-y-6 text-slate-100">

            {/* Alert Banner */}
            <AnimatePresence>
              {alert && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AppAlert type={alert.type} title={alert.title}>
                    {alert.message}
                  </AppAlert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* MODE 1: Input Options */}
            {mode === 'input' && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-7 h-7 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{t('welcomeTitle')}</h2>
                  <p className="text-sm text-slate-400">{t('welcomeSub')}</p>
                </div>

                {!isOnline && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-300 text-xs">
                    <WifiOff className="w-4 h-4 shrink-0" />
                    <span>{t('offlineBetaMode')} : {t('localLicenseValid')} (100% Autonome).</span>
                  </div>
                )}

                {/* 3 Main Method Selector Tabs */}
                <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setMethod('file'); setAlert(null); }}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      method === 'file' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t('importLmseFile')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMethod('qr'); setAlert(null); }}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      method === 'qr' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{t('scanQrCode')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setMethod('key'); setAlert(null); }}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      method === 'key' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{t('licenseKey')}</span>
                  </button>
                </div>

                {/* OPTION 1: File Import (.lmse) */}
                {method === 'file' && (
                  <div className="space-y-4 text-center py-4">
                    <label className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-900/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="font-bold text-white block text-sm">{t('importLmseFile')}</span>
                        <span className="text-xs text-slate-400 block mt-1">Sélectionnez le fichier BirdAcademy-License-[ID].lmse</span>
                        <span className="text-[10px] text-indigo-300 block mt-1">
                          (Tous les fichiers autorisés sur Android — *.lmse, *.json, tout fichier)
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="*/*,.lmse,.json,application/json,text/plain"
                        onChange={handleFileUpload}
                        disabled={loading}
                        className="hidden"
                      />
                    </label>

                    <div className="pt-2">
                      <details className="text-left text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        <summary className="font-semibold text-slate-300 cursor-pointer hover:text-white">
                          Le fichier .lmse n'apparaît pas dans votre sélecteur Android ?
                        </summary>
                        <div className="mt-2 space-y-2 text-[11px] text-slate-400 border-t border-slate-800 pt-2">
                          <p>
                            Sur certains téléphones Android, le sélecteur masque les extensions personnalisées. 
                            Activez l'option <strong>« Afficher tous les fichiers (*/*) »</strong> dans votre gestionnaire de fichiers Android, 
                            ou collez le contenu textuel de la licence ci-dessous :
                          </p>
                          <textarea
                            placeholder='Collez ici le contenu du fichier .lmse ({"format":"bird-academy-lmse", ...})'
                            rows={3}
                            onChange={(e) => {
                              if (e.target.value.trim().startsWith('{')) {
                                const service = LicensingService.getInstance();
                                service.importOfflineBetaLicense(e.target.value.trim()).then((res) => {
                                  if (res.isValid) {
                                    setAlert({ type: 'success', title: t('licenseActivatedTitle'), message: res.message });
                                    setMode('success');
                                    refresh();
                                  } else {
                                    setAlert({ type: 'danger', title: t('invalidLicense'), message: res.message });
                                  }
                                });
                              }
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[10px] text-amber-300 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </details>
                    </div>

                    {loading && (
                      <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs">
                        <AppLoader />
                        <span>Validation cryptographique locale en cours...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* OPTION 2: Live QR Code Scanner */}
                {method === 'qr' && (
                  <QrCodeScannerModal
                    onScanSuccess={(scannedData) => handleQrScanned(scannedData)}
                    onCancel={() => setMethod('file')}
                    onFallbackToFile={() => { setMethod('file'); setAlert(null); }}
                    onFallbackToKey={() => { setMethod('key'); setAlert(null); }}
                  />
                )}

                {/* OPTION 3: Standard Key Entry */}
                {method === 'key' && (
                  <form onSubmit={handleActivateKey} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {t('licenseKey')} <span className="text-red-400">*</span>
                      </label>
                      <AppInput
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        placeholder="LMSE-BETA-XXXX-XXXX"
                        className="font-mono uppercase text-center text-sm tracking-wider bg-slate-950 border-slate-800 text-amber-300"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        {t('holderName')} (Optionnel)
                      </label>
                      <AppInput
                        value={holderName}
                        onChange={(e) => setHolderName(e.target.value)}
                        placeholder="Ex: Elevage Canari Pro"
                        className="bg-slate-950 border-slate-800 text-sm text-slate-200"
                        disabled={loading}
                      />
                    </div>

                    <div className="pt-2 space-y-3">
                      <AppButton
                        variant="primary"
                        type="submit"
                        disabled={loading || !licenseKey.trim()}
                        className="w-full py-3 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 rounded-xl"
                      >
                        {loading ? <AppLoader /> : t('activateAppBtn')}
                      </AppButton>

                      <button
                        type="button"
                        onClick={() => { setAlert(null); setMode('offline_challenge'); }}
                        className="w-full text-center text-xs text-indigo-400 hover:text-indigo-300 font-medium py-2 cursor-pointer"
                      >
                        {t('offlineActivationTitle')} (Code Défi / Réponse)
                      </button>
                    </div>
                  </form>
                )}

                <div className="text-center pt-3 border-t border-slate-800/60 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Statut : <strong className="text-amber-400">{t('pendingStatus')}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.search = '?view=website';
                      }}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
                      data-testid="link-to-commercial-website"
                    >
                      Site Officiel & Tarifs →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODE 2: Offline Challenge / Response */}
            {mode === 'offline_challenge' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white flex items-center gap-2 text-base">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    {t('offlineActivationTitle')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => { setAlert(null); setMode('input'); }}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Retour
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {t('licenseKey')}
                    </label>
                    <AppInput
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      placeholder="LMSE-XXXX-XXXX-XXXX"
                      className="font-mono uppercase bg-slate-950 border-slate-800 text-sm text-amber-300"
                    />
                  </div>

                  <AppButton
                    variant="secondary"
                    onClick={handleGenerateChallenge}
                    disabled={loading || !licenseKey.trim()}
                    className="w-full text-xs py-2 bg-slate-800 hover:bg-slate-700 text-slate-200"
                  >
                    {loading ? <AppLoader /> : '1. Générer le Code Défi Matériel'}
                  </AppButton>

                  {challengeCode && (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                      <span className="text-xs text-slate-400 block">{t('hardwareChallengeCode')} :</span>
                      <div className="flex items-center justify-between font-mono text-base text-amber-400 font-bold">
                        <span>{challengeCode}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(challengeCode)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          {copiedChallenge ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleOfflineActivate} className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {t('offlineActivationCode')}
                      </label>
                      <AppInput
                        value={offlineResponseCode}
                        onChange={(e) => setOfflineResponseCode(e.target.value)}
                        placeholder="XXXX-XXXX-XXXX-XXXX"
                        className="font-mono uppercase bg-slate-950 border-slate-800 text-sm text-white"
                        required
                      />
                    </div>

                    <AppButton
                      variant="primary"
                      type="submit"
                      disabled={loading || !challengeCode || !offlineResponseCode.trim()}
                      className="w-full py-2.5 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
                    >
                      {loading ? <AppLoader /> : '2. Valider l\'Activation Hors Ligne'}
                    </AppButton>
                  </form>
                </div>
              </div>
            )}

            {/* MODE 3: Activation Success Confirmation */}
            {mode === 'success' && activeLicense && (
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-white">{t('licenseActivatedTitle')}</h2>
                  <p className="text-sm text-slate-400 mt-1">{t('localLicenseValid')} (OFFLINE BETA)</p>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 text-left dir-ltr text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-400 font-semibold">{t('holderName')} :</span>
                    <span className="font-bold text-white">{activeLicense.holderName}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">{t('licenseType')} :</span>
                    <AppBadge variant="accent" className="uppercase font-mono bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                      {activeLicense.type} (OFFLINE BETA)
                    </AppBadge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">{t('expirationDate')} :</span>
                    <span className="font-mono text-slate-200">
                      {activeLicense.expiresAt ? new Date(activeLicense.expiresAt).toLocaleDateString() : 'Illimitée'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-semibold">{t('devicesCount')} :</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {activeLicense.activations.length} / {activeLicense.policy.maxDevices}
                    </span>
                  </div>
                </div>

                <AppButton
                  variant="primary"
                  onClick={onActivationSuccess}
                  className="w-full py-3 text-base font-semibold bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 rounded-xl text-white flex items-center justify-center gap-2"
                >
                  <span>{t('continueToApp')}</span>
                  <ArrowRight className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                </AppButton>
              </div>
            )}

          </div>
        </motion.div>
      </main>

      {/* Bottom Footer */}
      <footer className="w-full max-w-5xl mx-auto text-center py-4 text-xs text-slate-500 border-t border-slate-800/40 mt-6 flex flex-col items-center gap-2">
        <span>Bird Academy Enterprise © {new Date().getFullYear()} — License Protection LMSE (Offline Beta)</span>
        {isQaMode() && (
          <>
            <button
              type="button"
              data-testid="qa-reset-license-btn"
              onClick={() => setIsQaResetModalOpen(true)}
              className="text-[11px] text-amber-400/80 hover:text-amber-300 font-mono underline cursor-pointer bg-amber-950/30 border border-amber-800/40 px-3 py-1 rounded-full"
            >
              {t('qaResetTestEnvironment') || "🧪 Réinitialiser l'environnement de test"}
            </button>
            <QaResetModal
              isOpen={isQaResetModalOpen}
              onClose={() => setIsQaResetModalOpen(false)}
            />
          </>
        )}
      </footer>
    </div>
  );
};
