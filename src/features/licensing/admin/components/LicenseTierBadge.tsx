/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE TIER BADGE
 * Visual indicator for commercial tiers (FREE / PREMIUM / PRO).
 */

import React from 'react';
import { SubscriptionTier } from '../../../subscription/types/subscription';
import { Crown, Sparkles, Feather } from 'lucide-react';

export interface LicenseTierBadgeProps {
  tier: SubscriptionTier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const LicenseTierBadge: React.FC<LicenseTierBadgeProps> = ({
  tier,
  size = 'md',
  showIcon = true,
}) => {
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

  switch (tier) {
    case 'PRO':
      return (
        <span
          data-testid="tier-badge-pro"
          className={`inline-flex items-center font-black rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-sm shadow-amber-500/20 border border-amber-400/40 uppercase tracking-wider ${sizeClasses[size]}`}
        >
          {showIcon && <Crown className={`${iconSizes[size]} text-amber-100 fill-amber-200`} />}
          PRO
        </span>
      );

    case 'PREMIUM':
      return (
        <span
          data-testid="tier-badge-premium"
          className={`inline-flex items-center font-black rounded-lg bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-sm shadow-indigo-500/20 border border-indigo-400/40 uppercase tracking-wider ${sizeClasses[size]}`}
        >
          {showIcon && <Sparkles className={`${iconSizes[size]} text-indigo-100 fill-indigo-200`} />}
          PREMIUM
        </span>
      );

    case 'FREE':
    default:
      return (
        <span
          data-testid="tier-badge-free"
          className={`inline-flex items-center font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 uppercase tracking-wider ${sizeClasses[size]}`}
        >
          {showIcon && <Feather className={`${iconSizes[size]} text-slate-400`} />}
          FREE
        </span>
      );
  }
};
