/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE CREATION WORKFLOW
 * Multi-step guided creation with pre-generation summary review,
 * cryptographic signing, and immediate post-generation validation.
 */

import React, { useState } from 'react';
import { SubscriptionTier } from '../../../subscription/types/subscription';
import { LicenseType, License } from '../../types/licensing';
import { LicenseCreationFormValues } from '../types/adminLicensing';
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
  AppBadge,
  AppLoader
} from '../../../../components/design-system';
import {
  ShieldPlus,
  Crown,
  Sparkles,
  Feather,
  CheckCircle2,
  Lock,
  Download,
  QrCode,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export interface LicenseCreateWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (values: LicenseCreationFormValues) => Promise<License>;
  onExport: (license: License) => void;
  onShowQr: (license: License) => void;
}

export const LicenseCreateWorkflow: React.FC<LicenseCreateWorkflowProps> = ({
  isOpen,
  onClose,
  onCreate,
  onExport,
  onShowQr,
}) => {
  const { t, isRtl } = useLanguage();

  const [step, setStep] = useState<'tier' | 'config' | 'summary' | 'success'>('tier');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('PRO');
  const [type, setType] = useState<LicenseType>('commercial');
  const [holderName, setHolderName] = useState('');
  const [holderEmail, setHolderEmail] = useState('');
  const [durationOption, setDurationOption] = useState<string>('365');
  const [maxDevices, setMaxDevices] = useState<string>('5');
  const [notes, setNotes] = useState('');
  const [isOfflineOnly, setIsOfflineOnly] = useState(true);
  const [createdLicense, setCreatedLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setStep('tier');
    setSelectedTier('PRO');
    setType('commercial');
    setHolderName('');
    setHolderEmail('');
    setDurationOption('365');
    setMaxDevices('5');
    setNotes('');
    setCreatedLicense(null);
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const durationDays = durationOption === 'permanent' ? null : parseInt(durationOption, 10);

  const handleSelectTier = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    if (tier === 'PRO') {
      setType('enterprise');
      setMaxDevices('25');
    } else if (tier === 'PREMIUM') {
      setType('commercial');
      setMaxDevices('3');
    } else {
      setType('temporary');
      setMaxDevices('1');
    }
    setStep('config');
  };

  const handleValidateConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName.trim()) {
      setError('Veuillez renseigner le nom du titulaire.');
      return;
    }
    setError(null);
    setStep('summary');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const created = await onCreate({
        tier: selectedTier,
        type,
        holderName: holderName.trim(),
        holderEmail: holderEmail.trim() || undefined,
        durationDays,
        maxDevices: parseInt(maxDevices, 10) || 1,
        customFeatures: [],
        notes: notes.trim() || undefined,
        isOfflineOnly,
      });
      setCreatedLicense(created);
      setStep('success');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Générateur Commercial de Licences LMSE"
      size="lg"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-create-workflow">
        {error && <AppAlert type="danger" title="Erreur">{error}</AppAlert>}

        {/* STEP 1: SELECT TIER */}
        {step === 'tier' && (
          <div className="space-y-4" data-testid="step-select-tier">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choisissez le niveau d'abonnement commercial à attribuer à cette licence :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* PRO TIER */}
              <div
                onClick={() => handleSelectTier('PRO')}
                data-testid="select-tier-pro-card"
                className="p-4 rounded-2xl border-2 border-amber-500/60 hover:border-amber-500 bg-gradient-to-b from-amber-500/10 to-orange-500/5 cursor-pointer space-y-3 transition-all hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start">
                  <LicenseTierBadge tier="PRO" />
                  <Crown className="w-5 h-5 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Édition PRO</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Accès complet : Bird Intelligence, Arbre généalogique illimité, IA illimitée, Multi-appareils.
                  </p>
                </div>
              </div>

              {/* PREMIUM TIER */}
              <div
                onClick={() => handleSelectTier('PREMIUM')}
                data-testid="select-tier-premium-card"
                className="p-4 rounded-2xl border-2 border-indigo-500/60 hover:border-indigo-500 bg-gradient-to-b from-indigo-500/10 to-purple-500/5 cursor-pointer space-y-3 transition-all hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start">
                  <LicenseTierBadge tier="PREMIUM" />
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Édition PREMIUM</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Élevage avancé, génétique standard, 100 requêtes IA / jour, rapports d'élevage.
                  </p>
                </div>
              </div>

              {/* FREE TIER */}
              <div
                onClick={() => handleSelectTier('FREE')}
                data-testid="select-tier-free-card"
                className="p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50 dark:bg-slate-800/40 cursor-pointer space-y-3 transition-all hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start">
                  <LicenseTierBadge tier="FREE" />
                  <Feather className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Édition FREE</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Fonctionnalités essentielles, 10 requêtes IA / jour, fonctionnalités avancées verrouillées.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIG FORM */}
        {step === 'config' && (
          <form onSubmit={handleValidateConfig} className="space-y-4" data-testid="step-config-form">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Tier sélectionné :</span>
                <LicenseTierBadge tier={selectedTier} />
              </div>
              <AppButton variant="secondary" size="sm" onClick={() => setStep('tier')} type="button">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Changer de tier
              </AppButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <AppInput
                label="Nom complet du titulaire *"
                placeholder="Ex: Omar Al-Farouq / Association Aviaire"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                required
                data-testid="holder-name-input"
              />

              <AppInput
                label="Email de contact (Optionnel)"
                placeholder="eleveur@domain.com"
                value={holderEmail}
                onChange={(e) => setHolderEmail(e.target.value)}
                type="email"
                data-testid="holder-email-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <AppSelect
                label="Type de licence"
                value={type}
                onChange={(e) => setType(e.target.value as LicenseType)}
                options={[
                  { value: 'commercial', label: 'Commerciale Standard' },
                  { value: 'enterprise', label: 'Enterprise / Master' },
                  { value: 'permanent', label: 'Permanente à Vie' },
                  { value: 'temporary', label: 'Temporaire' },
                  { value: 'beta', label: 'Bêta Testeur Privé' },
                  { value: 'association', label: 'Club / Association' },
                  { value: 'veterinary', label: 'Clinique Vétérinaire' },
                ]}
              />

              <AppSelect
                label="Durée de validité"
                value={durationOption}
                onChange={(e) => setDurationOption(e.target.value)}
                options={[
                  { value: '30', label: '30 jours (Essai/Court)' },
                  { value: '90', label: '90 jours (Trimestriel)' },
                  { value: '365', label: '365 jours (1 an)' },
                  { value: '730', label: '730 jours (2 ans)' },
                  { value: 'permanent', label: 'Illimitée (Permanente)' },
                ]}
              />

              <AppInput
                label="Nombre maximal d'appareils"
                type="number"
                value={maxDevices}
                onChange={(e) => setMaxDevices(e.target.value)}
                min="1"
                max="100"
              />
            </div>

            <AppInput
              label="Notes administratives (Optionnel)"
              placeholder="Ex: Facture #FA-2026-8832, Client VIP Maroc"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-between items-center pt-2">
              <AppButton variant="secondary" onClick={() => setStep('tier')} type="button">
                Précédent
              </AppButton>
              <AppButton variant="primary" type="submit" data-testid="next-summary-btn">
                Vérifier le résumé
                <ArrowRight className="w-4 h-4 ml-1" />
              </AppButton>
            </div>
          </form>
        )}

        {/* STEP 3: PRE-GENERATION SUMMARY REVIEW */}
        {step === 'summary' && (
          <div className="space-y-4" data-testid="step-summary-review">
            <AppAlert type="info" title="Vérification Avant Signature">
              Vérifiez attentivement les informations ci-dessous. Le moteur cryptographique signera ces paramètres de manière inviolable.
            </AppAlert>

            <AppCard className="p-5 space-y-3 bg-slate-900 text-white border border-slate-800">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Tier Commercial :</span>
                  <LicenseTierBadge tier={selectedTier} size="lg" />
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Produit & Version :</span>
                  <span className="font-bold text-xs text-amber-400">Bird Academy Enterprise v1.3.6-RC4</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Titulaire :</span>
                  <span className="font-bold text-slate-200">{holderName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Email :</span>
                  <span className="font-bold text-slate-200">{holderEmail || 'Non spécifié'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Type :</span>
                  <span className="font-bold text-slate-200 uppercase">{type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Validité :</span>
                  <span className="font-bold text-slate-200">
                    {durationOption === 'permanent' ? 'Illimitée (Permanente)' : `${durationOption} jours`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Appareils Autorisés :</span>
                  <span className="font-bold text-slate-200">{maxDevices} appareil(s)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Mode de Sécurité :</span>
                  <span className="font-bold text-emerald-400">100% Offline ECDSA/SHA-256</span>
                </div>
              </div>

              {notes && (
                <div className="pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 block">Notes :</span>
                  <span className="text-slate-300 italic">{notes}</span>
                </div>
              )}
            </AppCard>

            <div className="flex justify-between items-center pt-2">
              <AppButton variant="secondary" onClick={() => setStep('config')} disabled={loading}>
                Modifier
              </AppButton>
              <AppButton
                variant="primary"
                onClick={handleGenerate}
                disabled={loading}
                data-testid="confirm-generate-license-btn"
              >
                {loading ? <AppLoader /> : (
                  <>
                    <Lock className="w-4 h-4 mr-1" />
                    Signer & Générer la Licence
                  </>
                )}
              </AppButton>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'success' && createdLicense && (
          <div className="space-y-4 text-center" data-testid="step-success">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Licence Générée et Validée Cryptographiquement !
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                La licence pour <strong>{createdLicense.holderName}</strong> est prête pour l'exportation et l'activation immédiate.
              </p>
            </div>

            <AppCard className="p-4 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">ID Licence :</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{createdLicense.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Tier :</span>
                <LicenseTierBadge tier={selectedTier} size="sm" />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Clé :</span>
                <LicenseKeyDisplay licenseKey={createdLicense.key} />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Checksum SHA-256 :</span>
                <span className="font-mono text-[10px] text-slate-400">{createdLicense.checksum.slice(0, 16)}...</span>
              </div>
            </AppCard>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <AppButton
                variant="primary"
                size="sm"
                onClick={() => onExport(createdLicense)}
                data-testid="success-export-btn"
              >
                <Download className="w-4 h-4 mr-1" />
                Exporter la Licence (.lmse)
              </AppButton>
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => onShowQr(createdLicense)}
                data-testid="success-qr-btn"
              >
                <QrCode className="w-4 h-4 mr-1 text-emerald-500" />
                Afficher QR Code
              </AppButton>
              <AppButton variant="secondary" size="sm" onClick={handleClose} data-testid="success-finish-btn">
                Terminer
              </AppButton>
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
};
