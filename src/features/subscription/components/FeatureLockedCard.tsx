/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — FEATURE LOCKED CARD
 * Clean, informative UI explaining tier requirements and upgrade paths.
 */

import React from 'react';
import { Lock, Crown, Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { SubscriptionTier } from '../types/subscription';
import { useLanguage } from '../../../context/LanguageContext';
import { TierBadge } from './TierBadge';

export interface FeatureLockedCardProps {
  featureTitle: string;
  requiredTier: SubscriptionTier;
  description?: string;
  benefits?: string[];
  onUpgrade?: () => void;
}

export const FeatureLockedCard: React.FC<FeatureLockedCardProps> = ({
  featureTitle,
  requiredTier,
  description,
  benefits = [],
  onUpgrade
}) => {
  const { t, isRtl } = useLanguage();

  const getDefaultDescription = () => {
    if (requiredTier === 'PRO') {
      return t('featureLockedProDesc') || 
        "Cette fonctionnalité d'analyse avancée et d'intelligence décisionnelle est réservée aux utilisateurs du plan PRO.";
    }
    return t('featureLockedPremiumDesc') || 
      "Cette fonctionnalité de gestion avancée nécessite le plan PREMIUM ou PRO.";
  };

  const getDefaultBenefits = (): string[] => {
    if (benefits.length > 0) return benefits;
    if (requiredTier === 'PRO') {
      return [
        t('benefit_bird_intelligence') || "Moteur complet Bird Intelligence & scores prédictifs",
        t('benefit_ai_unlimited') || "Assistant IA 100% hors-ligne illimité avec analyses de généalogie",
        t('benefit_pro_reports') || "Rapports d'élevage avancés et alertes sanitaires intelligentes"
      ];
    }
    return [
      t('benefit_unlimited_birds') || "Gestion complète et cheptel illimité",
      t('benefit_breeding_advanced') || "Suivi automatisé du baguage, nurserie et sevrage",
      t('benefit_wright_consanguinity') || "Calcul de consanguinité de Wright et compatibilité des couples"
    ];
  };

  return (
    <div
      data-testid="feature-locked-card"
      className="max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl text-center relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Lock / Tier Icon */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-4">
          <Lock className="w-7 h-7" />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <TierBadge tier={requiredTier} size="md" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          {featureTitle}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed mb-6">
          {description || getDefaultDescription()}
        </p>

        {/* Key Benefits List */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 text-left mb-6 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
            {t('includedWithTier') || 'Inclus avec'} {requiredTier === 'PRO' ? 'PRO' : 'PREMIUM'} :
          </div>
          {getDefaultBenefits().map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Upgrade / Activation Call to Action */}
        {onUpgrade && (
          <button
            type="button"
            data-testid="locked-card-upgrade-btn"
            onClick={onUpgrade}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{t('upgradeOrActivate') || 'Mettre à niveau ou Activer une licence'}</span>
            <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        )}

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t('offlinePrivacyGuaranteed') || '100% Hors-ligne • Vos données restent sur cet appareil'}</span>
        </div>
      </div>
    </div>
  );
};
