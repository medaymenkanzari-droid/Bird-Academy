/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — PAYMENT METHOD SELECTOR
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { Sparkles, CreditCard, Building2, ShieldCheck, AlertCircle } from 'lucide-react';

export interface PaymentMethodSelectorProps {
  selectedProvider: string;
  onSelectProvider: (providerId: string) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedProvider,
  onSelectProvider,
}) => {
  const { t, isRtl } = useWebLanguage();

  return (
    <div className="space-y-4" data-testid="payment-method-selector" dir={isRtl ? 'rtl' : 'ltr'}>
      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
        {t('checkout.paymentTitle')}
      </h3>

      <div className="space-y-3">
        
        {/* 1. Demo Mode Simulator (Default / Instant) */}
        <label
          className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            selectedProvider === 'DEMO_SIMULATOR'
              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
          }`}
          data-testid="payment-option-demo"
        >
          <input
            type="radio"
            name="payment_method"
            value="DEMO_SIMULATOR"
            checked={selectedProvider === 'DEMO_SIMULATOR'}
            onChange={() => onSelectProvider('DEMO_SIMULATOR')}
            className="mt-1 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                {t('checkout.paymentDemoBtn')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Immédiat & Test
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('checkout.paymentDemoNotice')}
            </p>
          </div>
        </label>

        {/* 2. Stripe Stub */}
        <label
          className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer opacity-70 ${
            selectedProvider === 'STRIPE_INTERNATIONAL'
              ? 'border-indigo-600 bg-indigo-50/30'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
          }`}
          data-testid="payment-option-stripe"
        >
          <input
            type="radio"
            name="payment_method"
            value="STRIPE_INTERNATIONAL"
            checked={selectedProvider === 'STRIPE_INTERNATIONAL'}
            onChange={() => onSelectProvider('STRIPE_INTERNATIONAL')}
            className="mt-1 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                {t('checkout.paymentCardStub')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                Ouverture Prochaine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Visa, Mastercard, American Express via passerelle sécurisée Stripe.
            </p>
          </div>
        </label>

        {/* 3. Tunisia Local Stub */}
        <label
          className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer opacity-70 ${
            selectedProvider === 'TUNISIA_GATEWAY'
              ? 'border-indigo-600 bg-indigo-50/30'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
          }`}
          data-testid="payment-option-tunisia"
        >
          <input
            type="radio"
            name="payment_method"
            value="TUNISIA_GATEWAY"
            checked={selectedProvider === 'TUNISIA_GATEWAY'}
            onChange={() => onSelectProvider('TUNISIA_GATEWAY')}
            className="mt-1 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                {t('checkout.paymentTunisiaStub')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                Ouverture Prochaine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Paiement direct en Dinar Tunisien via D17 de La Poste Tunisienne, Flouci ou Virement bancaire.
            </p>
          </div>
        </label>

      </div>
    </div>
  );
};
