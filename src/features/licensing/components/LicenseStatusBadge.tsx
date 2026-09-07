/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLicenseStatus } from '../hooks/useLicenseStatus';
import { ShieldCheck, ShieldAlert, AlertTriangle, Key } from 'lucide-react';
import { AppBadge } from '../../../components/design-system';

export interface LicenseStatusBadgeProps {
  onOpenActivation?: () => void;
  showDetails?: boolean;
}

export const LicenseStatusBadge: React.FC<LicenseStatusBadgeProps> = ({ onOpenActivation, showDetails = false }) => {
  const { activeLicense, label, isExpired, isNearExpiration, loading } = useLicenseStatus();

  if (loading) {
    return <AppBadge variant="outline">LMSE...</AppBadge>;
  }

  if (!activeLicense) {
    return (
      <button
        onClick={onOpenActivation}
        className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold hover:bg-amber-500/20 transition-all cursor-pointer"
      >
        <Key className="w-3.5 h-3.5" />
        <span>Activer la Licence</span>
      </button>
    );
  }

  const getVariant = (): 'success' | 'danger' | 'warning' => {
    if (activeLicense.status === 'revoked' || isExpired) return 'danger';
    if (isNearExpiration || activeLicense.status === 'trial') return 'warning';
    return 'success';
  };

  const getIcon = () => {
    if (activeLicense.status === 'revoked' || isExpired) return <ShieldAlert className="w-3.5 h-3.5" />;
    if (isNearExpiration) return <AlertTriangle className="w-3.5 h-3.5" />;
    return <ShieldCheck className="w-3.5 h-3.5" />;
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={onOpenActivation}
        className="cursor-pointer focus:outline-none"
        title="Cliquez pour afficher les détails de la licence"
      >
        <AppBadge variant={getVariant()}>
          <span className="flex items-center gap-1">
            {getIcon()}
            <span className="capitalize font-bold">{activeLicense.type}</span>
            {showDetails && <span className="opacity-75">• {label}</span>}
          </span>
        </AppBadge>
      </button>
    </div>
  );
};
