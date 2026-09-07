/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — UPGRADE MODAL
 * Multi-tier comparison and license activation modal.
 */

import React from 'react';
import { X, Check, Crown, Sparkles, Shield, KeyRound, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionTier } from '../types/subscription';
import { TierBadge } from './TierBadge';

export interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenActivation?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onOpenActivation
}) => {
  const { t, isRtl } = useLanguage();
  const { currentTier, setTierOverride } = useSubscription();

  if (!isOpen) return null;

  const plans: {
    tier: SubscriptionTier;
    title: string;
    description: string;
    features: string[];
    highlight?: boolean;
  }[] = [
    {
      tier: 'FREE',
      title: t('tierFree') || 'Plan GRATUIT',
      description: t('tierFreeDesc') || 'Fonctions fondamentales pour débuter votre élevage',
      features: [
        t('subFeatureBirdsEssential'),
        t('subFeatureClutchesBasic'),
        t('subFeatureHealthIndividual'),
        t('subFeatureBioRef'),
        t('subFeatureAiLimited')
      ]
    },
    {
      tier: 'PREMIUM',
      title: t('tierPremium') || 'Plan PREMIUM',
      description: t('tierPremiumDesc') || 'Gestion avancée et cheptel illimité pour éleveurs passionnés',
      features: [
        t('subFeatureAllFree'),
        t('subFeatureUnlimitedFlock'),
        t('subFeatureNurseryBanding'),
        t('subFeatureWrightInbreeding'),
        t('subFeatureBatchHealth'),
        t('subFeatureAiMedium')
      ]
    },
    {
      tier: 'PRO',
      title: t('tierPro') || 'Plan PRO',
      description: t('tierProDesc') || 'Intelligence artificielle complète, généalogie et rapports décisionnels',
      features: [
        t('subFeatureAllPremium'),
        t('subFeatureBirdIntelligence'),
        t('subFeatureMultiGenPedigree'),
        t('subFeatureHealthPredictive'),
        t('subFeatureAiUnlimited'),
        t('subFeatureReportsFinance')
      ],
      highlight: true
    }
  ];

  const handleSelectTier = (tier: SubscriptionTier) => {
    setTierOverride(tier);
    onClose();
  };

  return (
    <div 
      data-testid="upgrade-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
    >
      <div 
        data-testid="upgrade-modal-container"
        className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span>{t('subscriptionPlansTitle') || 'Plans & Éditions Bird Academy'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('subscriptionPlansSub') || 'Choisissez l\'édition adaptée à vos besoins d\'élevage.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = currentTier === plan.tier;
            return (
              <div
                key={plan.tier}
                data-testid={`plan-card-${plan.tier.toLowerCase()}`}
                className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                  plan.highlight
                    ? 'bg-gradient-to-b from-purple-500/5 to-indigo-500/5 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-500/40 shadow-lg shadow-purple-500/10'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <TierBadge tier={plan.tier} size="sm" />
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
                        {t('currentPlan') || 'Actif'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">
                    {plan.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 min-h-[32px]">
                    {plan.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  data-testid={`select-plan-btn-${plan.tier.toLowerCase()}`}
                  onClick={() => handleSelectTier(plan.tier)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-default'
                      : plan.highlight
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:brightness-110 shadow-md shadow-purple-500/20'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                  }`}
                >
                  <span>{isCurrent ? (t('currentPlan') || 'Plan Actuel') : (t('selectThisPlan') || 'Choisir ce plan')}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer with LMSE License Activation */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>{t('haveOfficialLicenseKey') || 'Vous possédez une clé de licence LMSE officielle ?'}</span>
          </div>

          {onOpenActivation && (
            <button
              type="button"
              data-testid="upgrade-modal-activate-license-btn"
              onClick={() => {
                onClose();
                onOpenActivation();
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{t('activateLicenseKey') || 'Activer une clé de licence'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
