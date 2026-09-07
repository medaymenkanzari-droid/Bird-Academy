/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE LIST TABLE
 * Rich data table with commercial tiers, status indicators, device counts, and quick actions.
 */

import React from 'react';
import { License } from '../../types/licensing';
import { SubscriptionTierResolver } from '../../../subscription/services/SubscriptionTierResolver';
import { LicenseTierBadge } from './LicenseTierBadge';
import { LicenseStatusBadge } from './LicenseStatusBadge';
import { LicenseKeyDisplay } from './LicenseKeyDisplay';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppTable,
  AppButton,
  AppEmptyState
} from '../../../../components/design-system';
import {
  Key,
  Eye,
  Download,
  QrCode,
  RefreshCw,
  RotateCcw,
  ArrowUpCircle,
  ArrowDownCircle,
  PauseCircle,
  Ban,
  Laptop
} from 'lucide-react';

export interface LicenseListProps {
  licenses: License[];
  onInspect: (license: License) => void;
  onExport: (license: License) => void;
  onShowQr: (license: License) => void;
  onRenew: (license: License) => void;
  onReplace: (license: License) => void;
  onUpgrade: (license: License) => void;
  onDowngrade: (license: License) => void;
  onSuspend: (license: License) => void;
  onRevoke: (license: License) => void;
  onCreateOpen: () => void;
}

export const LicenseList: React.FC<LicenseListProps> = ({
  licenses,
  onInspect,
  onExport,
  onShowQr,
  onRenew,
  onReplace,
  onUpgrade,
  onDowngrade,
  onSuspend,
  onRevoke,
  onCreateOpen,
}) => {
  const { t, isRtl } = useLanguage();

  if (licenses.length === 0) {
    return (
      <AppEmptyState
        icon={<Key className="w-12 h-12 text-slate-400" />}
        title="Aucune licence trouvée"
        description="Aucune licence ne correspond à vos critères de recherche ou de filtre."
        action={
          <AppButton variant="primary" size="sm" onClick={onCreateOpen}>
            Créer une Licence
          </AppButton>
        }
      />
    );
  }

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-list-container">
      <AppTable<License>
        columns={[
          {
            key: 'holder',
            header: 'Titulaire & ID',
            render: (lic) => (
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white block text-xs">
                  {lic.holderName}
                </span>
                {lic.holderEmail && (
                  <span className="text-[11px] text-slate-400 block">{lic.holderEmail}</span>
                )}
                <span className="text-[10px] font-mono text-slate-400 block">{lic.id}</span>
              </div>
            ),
          },
          {
            key: 'tier',
            header: 'Tier Commercial',
            render: (lic) => {
              const tier = SubscriptionTierResolver.resolve(lic);
              return <LicenseTierBadge tier={tier} size="sm" />;
            },
          },
          {
            key: 'status',
            header: 'Statut LMSE',
            render: (lic) => <LicenseStatusBadge status={lic.status} size="sm" />,
          },
          {
            key: 'key',
            header: 'Clé de Licence',
            render: (lic) => <LicenseKeyDisplay licenseKey={lic.key} masked={false} />,
          },
          {
            key: 'validity',
            header: 'Validité',
            render: (lic) => (
              <div className="text-xs space-y-0.5">
                <div className="text-slate-500">
                  Émise : <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(lic.issuedAt).toLocaleDateString()}</span>
                </div>
                <div className="text-slate-500">
                  Expire : <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {lic.expiresAt ? new Date(lic.expiresAt).toLocaleDateString() : 'Permanente'}
                  </span>
                </div>
              </div>
            ),
          },
          {
            key: 'devices',
            header: 'Appareils',
            render: (lic) => (
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <Laptop className="w-3.5 h-3.5 text-indigo-500" />
                <span>{lic.activations?.length || 0} / {lic.policy?.maxDevices || 1}</span>
              </div>
            ),
          },
          {
            key: 'actions',
            header: 'Actions',
            render: (lic) => {
              const tier = SubscriptionTierResolver.resolve(lic);
              return (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onInspect(lic)}
                    title="Inspecter détails"
                    aria-label="Inspecter détails"
                    data-testid={`inspect-license-${lic.id}`}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onExport(lic)}
                    title="Exporter .lmse"
                    aria-label="Exporter .lmse"
                    data-testid={`export-license-${lic.id}`}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onShowQr(lic)}
                    title="QR Code"
                    aria-label="QR Code"
                    data-testid={`qr-license-${lic.id}`}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRenew(lic)}
                    title="Renouveler"
                    aria-label="Renouveler"
                    data-testid={`renew-license-${lic.id}`}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>

                  {tier !== 'PRO' && (
                    <button
                      type="button"
                      onClick={() => onUpgrade(lic)}
                      title="Upgrade"
                      aria-label="Upgrade"
                      data-testid={`upgrade-license-${lic.id}`}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                    </button>
                  )}

                  {tier !== 'FREE' && (
                    <button
                      type="button"
                      onClick={() => onDowngrade(lic)}
                      title="Downgrade"
                      aria-label="Downgrade"
                      data-testid={`downgrade-license-${lic.id}`}
                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSuspend(lic)}
                    title={lic.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
                    aria-label={lic.status === 'suspended' ? 'Réactiver' : 'Suspendre'}
                    data-testid={`suspend-license-${lic.id}`}
                    className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                  >
                    <PauseCircle className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onReplace(lic)}
                    title="Remplacer"
                    aria-label="Remplacer"
                    data-testid={`replace-license-${lic.id}`}
                    className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {lic.status !== 'revoked' && (
                    <button
                      type="button"
                      onClick={() => onRevoke(lic)}
                      title="Révoquer définitivement"
                      aria-label="Révoquer définitivement"
                      data-testid={`revoke-license-${lic.id}`}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            },
          },
        ]}
        data={licenses}
        keyExtractor={(lic) => lic.id}
      />
    </div>
  );
};
