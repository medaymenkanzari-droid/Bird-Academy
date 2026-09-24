/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — ORDER SUMMARY CARD
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { useWebCurrency } from '../../context/CommercialCurrencyContext';
import { useLocalizedOffers } from '../../hooks/useLocalizedOffers';
import { CommercialOffer } from '../../../licensing/commercial/types/commercialOffer';
import { Clock, Monitor } from 'lucide-react';

export interface OrderSummaryCardProps {
  offer: CommercialOffer;
  quantity?: number;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({ offer, quantity = 1 }) => {
  const { t, isRtl } = useWebLanguage();
  const { formatPrice } = useWebCurrency();
  const { getLocalizedOffer } = useLocalizedOffers();
  const localized = getLocalizedOffer(offer);

  const subtotalEur = offer.price * quantity;
  const taxEur = 0; // Tax included
  const totalEur = subtotalEur + taxEur;

  const Icon = localized.icon;

  return (
    <div
      className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-6"
      data-testid="order-summary-card"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
          {t('checkout.orderSummary')}
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
          {offer.id}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
              <Icon className="w-4 h-4 text-indigo-500" />
              <span>{localized.name}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{localized.description}</p>
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
            {localized.priceFormatted}
          </span>
        </div>

        <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3 text-indigo-500" />
            {localized.period}
          </span>
          <span className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            <Monitor className="w-3 h-3 text-emerald-500" />
            {t('checkout.deviceBadge') || `${offer.maxDevices} appareil (Mono-poste)`}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{t('checkout.subtotal')}</span>
          <span>{offer.tier === 'FREE' ? (t('pricing.freePrice') || 'Gratuit') : (t('pricing.pricePending') || 'Tarif en préparation')}</span>
        </div>
        <div className="flex justify-between text-slate-600 dark:text-slate-400">
          <span>{t('checkout.tax')}</span>
          <span>(Incluses)</span>
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between font-black text-sm text-slate-900 dark:text-white">
          <span>{t('checkout.total')}</span>
          <span className="text-indigo-600 dark:text-indigo-400">
            {offer.tier === 'FREE' ? (t('pricing.freePrice') || 'Gratuit') : (t('pricing.pricePending') || 'Tarif en préparation')}
          </span>
        </div>
      </div>
    </div>
  );
};
