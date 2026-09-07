/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE DETAILS MODAL
 * Complete forensic inspection of license metadata, activations,
 * cryptographic signatures, device fingerprints, and lifecycle history.
 */

import React, { useState } from 'react';
import { License } from '../../types/licensing';
import { SubscriptionTierResolver } from '../../../subscription/services/SubscriptionTierResolver';
import { LicenseTierBadge } from './LicenseTierBadge';
import { LicenseStatusBadge } from './LicenseStatusBadge';
import { LicenseKeyDisplay } from './LicenseKeyDisplay';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppModal,
  AppButton,
  AppCard,
  AppTabs,
  AppBadge
} from '../../../../components/design-system';
import {
  ShieldCheck,
  Key,
  Laptop,
  Activity,
  Download,
  RotateCcw,
  RefreshCw,
  Ban,
  PauseCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  QrCode,
  Calendar,
  Lock,
  Cpu
} from 'lucide-react';

export interface LicenseDetailsModalProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onExport: (license: License) => void;
  onShowQr: (license: License) => void;
  onRenew: (license: License) => void;
  onReplace: (license: License) => void;
  onRevoke: (license: License) => void;
  onSuspend: (license: License) => void;
  onUpgrade: (license: License) => void;
  onDowngrade: (license: License) => void;
}

export const LicenseDetailsModal: React.FC<LicenseDetailsModalProps> = ({
  license,
  isOpen,
  onClose,
  onExport,
  onShowQr,
  onRenew,
  onReplace,
  onRevoke,
  onSuspend,
  onUpgrade,
  onDowngrade,
}) => {
  const { t, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<'info' | 'devices' | 'history' | 'crypto'>('info');

  if (!license) return null;

  const tier = SubscriptionTierResolver.resolve(license);

  const tabs = [
    { id: 'info', label: 'Général & Droits', icon: Key },
    { id: 'devices', label: 'Appareils', icon: Laptop, badge: license.activations?.length || 0 },
    { id: 'history', label: 'Cycle de Vie', icon: Activity },
    { id: 'crypto', label: 'Sécurité & Hash', icon: Lock },
  ];

  const lifecycleHistory: Array<{ timestamp: string; action: string; from?: string; to?: string; details?: string; reason?: string }> =
    license.metadata?.lifecycleHistory || [];

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails de Licence — ${license.holderName}`}
      size="lg"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-details-modal">
        {/* HEADER SUMMARY CARD */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <LicenseTierBadge tier={tier} size="lg" />
              <LicenseStatusBadge status={license.status} />
            </div>
            <span className="text-[10px] font-mono text-slate-400">ID: {license.id}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Titulaire :</span>
              <span className="font-bold text-sm text-slate-100">{license.holderName}</span>
              {license.holderEmail && <span className="text-xs text-slate-400 block">{license.holderEmail}</span>}
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Clé de Licence :</span>
              <LicenseKeyDisplay licenseKey={license.key} />
            </div>
          </div>
        </div>

        {/* TABS */}
        <AppTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tId) => setActiveTab(tId as any)}
        />

        {/* TAB 1: GENERAL INFO & POLICY */}
        {activeTab === 'info' && (
          <div className="space-y-3 text-xs" data-testid="details-tab-info">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AppCard className="p-3 space-y-1">
                <span className="text-slate-400 block">Type de Licence</span>
                <span className="font-bold text-slate-900 dark:text-white uppercase">{license.type}</span>
              </AppCard>
              <AppCard className="p-3 space-y-1">
                <span className="text-slate-400 block">Émise le</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {new Date(license.issuedAt).toLocaleDateString()}
                </span>
              </AppCard>
              <AppCard className="p-3 space-y-1">
                <span className="text-slate-400 block">Date d'Expiration</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'Illimitée (Permanente)'}
                </span>
              </AppCard>
              <AppCard className="p-3 space-y-1">
                <span className="text-slate-400 block">Limite Appareils</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {license.activations?.length || 0} / {license.policy?.maxDevices || 1}
                </span>
              </AppCard>
              <AppCard className="p-3 space-y-1">
                <span className="text-slate-400 block">Mode Hors-Ligne</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Autorisé (Offline-First)</span>
              </AppCard>
              <AppCard className="p-3 space-y-1">
                <span className="text-slate-400 block">Produit</span>
                <span className="font-bold text-slate-900 dark:text-white">Bird Academy</span>
              </AppCard>
            </div>

            <AppCard className="p-4 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">Permissions & Capabilities Incluses</span>
              <div className="flex flex-wrap gap-1.5">
                {(license.policy?.features || []).map((feat, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono text-[10px] border border-indigo-200 dark:border-indigo-800"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </AppCard>

            {license.revocationReason && (
              <AppCard className="p-3 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 space-y-1">
                <span className="font-bold text-red-700 dark:text-red-300 block">Motif de Révocation :</span>
                <p className="text-red-600 dark:text-red-400">{license.revocationReason}</p>
              </AppCard>
            )}
          </div>
        )}

        {/* TAB 2: REGISTERED DEVICES */}
        {activeTab === 'devices' && (
          <div className="space-y-3" data-testid="details-tab-devices">
            {(!license.activations || license.activations.length === 0) ? (
              <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                Aucun appareil actuellement enregistré pour cette licence.
              </div>
            ) : (
              <div className="space-y-2">
                {license.activations.map((act) => (
                  <AppCard key={act.id} className="p-3 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-indigo-500" />
                        <span className="font-bold text-slate-900 dark:text-white">{act.fingerprint.os} Device</span>
                        <AppBadge variant={act.isOffline ? 'accent' : 'success'}>
                          {act.isOffline ? 'Hors-Ligne' : 'En Ligne'}
                        </AppBadge>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {act.fingerprint.deviceId.slice(0, 16)}...
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div>Activé le : {new Date(act.activatedAt).toLocaleString()}</div>
                      <div>Dernière vérif : {new Date(act.lastVerifiedAt).toLocaleString()}</div>
                    </div>
                  </AppCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LIFECYCLE HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3" data-testid="details-tab-history">
            {lifecycleHistory.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">CREATION INITIALE</span>
                  <span>{new Date(license.issuedAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  Licence générée et signée pour {license.holderName}.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lifecycleHistory.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">{item.action}</span>
                      <span className="text-slate-400 text-[10px]">{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    {item.from && item.to && (
                      <div className="text-[11px] text-slate-500">
                        Transition : <span className="font-semibold text-slate-700 dark:text-slate-300">{item.from}</span> → <span className="font-semibold text-slate-700 dark:text-slate-300">{item.to}</span>
                      </div>
                    )}
                    {item.reason && (
                      <p className="text-slate-600 dark:text-slate-300 italic">{item.reason}</p>
                    )}
                    {item.details && (
                      <p className="text-slate-600 dark:text-slate-300">{item.details}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CRYPTOGRAPHY & SECURITY */}
        {activeTab === 'crypto' && (
          <div className="space-y-3 text-xs" data-testid="details-tab-crypto">
            <AppCard className="p-4 space-y-2 bg-slate-900 text-white border border-slate-800">
              <span className="font-bold text-amber-400 block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Empreinte Numérique SHA-256 (Checksum)
              </span>
              <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 break-all select-all">
                {license.checksum}
              </div>
            </AppCard>

            <AppCard className="p-4 space-y-2 bg-slate-900 text-white border border-slate-800">
              <span className="font-bold text-amber-400 block flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-400" />
                Signature Numérique ECDSA
              </span>
              <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 break-all select-all">
                {license.signature}
              </div>
            </AppCard>
          </div>
        )}

        {/* ACTION BAR */}
        <div className="flex flex-wrap justify-between items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => onExport(license)}
              data-testid="details-export-btn"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Exporter (.lmse)
            </AppButton>
            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => onShowQr(license)}
              data-testid="details-qr-btn"
            >
              <QrCode className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              QR Code
            </AppButton>
            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => onRenew(license)}
              data-testid="details-renew-btn"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1 text-indigo-500" />
              Renouveler
            </AppButton>
          </div>

          <div className="flex flex-wrap gap-2">
            {tier !== 'PRO' && (
              <AppButton
                variant="primary"
                size="sm"
                onClick={() => onUpgrade(license)}
                data-testid="details-upgrade-btn"
              >
                <ArrowUpCircle className="w-3.5 h-3.5 mr-1" />
                Upgrade
              </AppButton>
            )}

            {tier !== 'FREE' && (
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => onDowngrade(license)}
                data-testid="details-downgrade-btn"
              >
                <ArrowDownCircle className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Downgrade
              </AppButton>
            )}

            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => onSuspend(license)}
              data-testid="details-suspend-btn"
            >
              <PauseCircle className="w-3.5 h-3.5 mr-1 text-amber-500" />
              {license.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
            </AppButton>

            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => onReplace(license)}
              data-testid="details-replace-btn"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1 text-purple-500" />
              Remplacer
            </AppButton>

            {license.status !== 'revoked' && (
              <AppButton
                variant="danger"
                size="sm"
                onClick={() => onRevoke(license)}
                data-testid="details-revoke-btn"
              >
                <Ban className="w-3.5 h-3.5 mr-1" />
                Révoquer
              </AppButton>
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
};
