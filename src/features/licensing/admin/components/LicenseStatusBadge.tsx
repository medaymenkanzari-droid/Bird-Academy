/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE STATUS BADGE
 * Visual indicator for all 9 LMSE lifecycle states.
 */

import React from 'react';
import { LicenseStatus } from '../../types/licensing';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  CheckCircle2,
  Clock,
  Ban,
  PauseCircle,
  FlaskConical,
  Hourglass,
  AlertTriangle,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

export interface LicenseStatusBadgeProps {
  status: LicenseStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const LicenseStatusBadge: React.FC<LicenseStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-black',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  switch (status) {
    case 'active':
      return (
        <span
          data-testid="status-badge-active"
          className={`inline-flex items-center font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 ${sizeClasses[size]}`}
        >
          {showIcon && <CheckCircle2 className={`${iconSizes[size]} text-emerald-600 dark:text-emerald-400`} />}
          {t('activeStatus') || 'Active'}
        </span>
      );

    case 'expired':
      return (
        <span
          data-testid="status-badge-expired"
          className={`inline-flex items-center font-bold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 ${sizeClasses[size]}`}
        >
          {showIcon && <Clock className={`${iconSizes[size]} text-rose-600 dark:text-rose-400`} />}
          {t('expiredStatus') || 'Expirée'}
        </span>
      );

    case 'revoked':
      return (
        <span
          data-testid="status-badge-revoked"
          className={`inline-flex items-center font-bold rounded-lg bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-400 dark:border-red-800 ${sizeClasses[size]}`}
        >
          {showIcon && <Ban className={`${iconSizes[size]} text-red-600`} />}
          {t('revokedStatus') || 'Révoquée'}
        </span>
      );

    case 'suspended':
      return (
        <span
          data-testid="status-badge-suspended"
          className={`inline-flex items-center font-bold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 ${sizeClasses[size]}`}
        >
          {showIcon && <PauseCircle className={`${iconSizes[size]} text-amber-600`} />}
          {t('suspendedStatus') || 'Suspendue'}
        </span>
      );

    case 'trial':
      return (
        <span
          data-testid="status-badge-trial"
          className={`inline-flex items-center font-bold rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 ${sizeClasses[size]}`}
        >
          {showIcon && <FlaskConical className={`${iconSizes[size]} text-purple-600`} />}
          {t('trialStatus') || 'Essai / Bêta'}
        </span>
      );

    case 'pending_activation':
      return (
        <span
          data-testid="status-badge-pending"
          className={`inline-flex items-center font-bold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 ${sizeClasses[size]}`}
        >
          {showIcon && <Hourglass className={`${iconSizes[size]} text-blue-600`} />}
          {t('pendingStatus') || 'En attente'}
        </span>
      );

    case 'OFFLINE_BETA':
      return (
        <span
          data-testid="status-badge-offline-beta"
          className={`inline-flex items-center font-bold rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-800 ${sizeClasses[size]}`}
        >
          {showIcon && <ShieldCheck className={`${iconSizes[size]} text-teal-600`} />}
          {t('offlineBetaLabel') || 'Offline Beta'}
        </span>
      );

    case 'replaced':
      return (
        <span
          data-testid="status-badge-replaced"
          className={`inline-flex items-center font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 ${sizeClasses[size]}`}
        >
          {showIcon && <RotateCcw className={`${iconSizes[size]} text-slate-500`} />}
          {t('replacedStatus') || 'Remplacée'}
        </span>
      );

    case 'invalid':
    default:
      return (
        <span
          data-testid="status-badge-invalid"
          className={`inline-flex items-center font-bold rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-800 ${sizeClasses[size]}`}
        >
          {showIcon && <AlertTriangle className={`${iconSizes[size]} text-orange-600`} />}
          {t('invalidLicense') || 'Invalide'}
        </span>
      );
  }
};
