/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Crown, Sparkles, Shield } from 'lucide-react';
import { SubscriptionTier } from '../types/subscription';
import { useLanguage } from '../../../context/LanguageContext';

export interface TierBadgeProps {
  tier: SubscriptionTier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'md',
  showIcon = true,
  className = ''
}) => {
  const { t } = useLanguage();

  const getStyle = () => {
    switch (tier) {
      case 'PRO':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20 border-purple-400/30';
      case 'PREMIUM':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm shadow-blue-500/20 border-blue-400/30';
      case 'FREE':
      default:
        return 'bg-slate-700 text-slate-200 border-slate-600';
    }
  };

  const getLabel = () => {
    switch (tier) {
      case 'PRO': return t('tierPro') || 'Plan PRO';
      case 'PREMIUM': return t('tierPremium') || 'Plan PREMIUM';
      case 'FREE':
      default:
        return t('tierFree') || 'Plan GRATUIT';
    }
  };

  const getIcon = () => {
    if (!showIcon) return null;
    switch (tier) {
      case 'PRO': return <Crown className="w-3 h-3 text-amber-300" />;
      case 'PREMIUM': return <Sparkles className="w-3 h-3 text-cyan-200" />;
      case 'FREE':
      default:
        return <Shield className="w-3 h-3 text-slate-400" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'text-[10px] px-2 py-0.5 gap-1';
      case 'lg': return 'text-xs px-3 py-1.5 gap-1.5';
      case 'md':
      default:
        return 'text-[11px] px-2.5 py-1 gap-1';
    }
  };

  return (
    <span
      data-testid={`subscription-tier-badge-${tier.toLowerCase()}`}
      className={`inline-flex items-center font-black uppercase tracking-wider rounded-full border ${getStyle()} ${getSizeClasses()} ${className}`}
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </span>
  );
};
