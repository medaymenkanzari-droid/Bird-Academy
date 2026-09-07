/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL OFFERS CATALOG
 * Visual grid and matrix of commercial offers for FREE / PREMIUM / PRO.
 */

import React from 'react';
import { CommercialOffer } from '../types/commercialOffer';
import { LicenseTierBadge } from '../../admin/components/LicenseTierBadge';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppCard,
  AppButton,
  AppBadge,
} from '../../../../components/design-system';
import {
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Laptop,
  Clock,
} from 'lucide-react';

export interface CommercialOffersCatalogProps {
  offers: CommercialOffer[];
  onSelectOffer: (offer: CommercialOffer) => void;
}

export const CommercialOffersCatalog: React.FC<CommercialOffersCatalogProps> = ({
  offers,
  onSelectOffer,
}) => {
  const { isRtl } = useLanguage();

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'} data-testid="commercial-offers-catalog">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-500" />
            Catalogue des Offres Commerciales
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Éditions officielles FREE / PREMIUM / PRO avec matrice des fonctionnalités et quotas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {offers.map((offer) => {
          const isPro = offer.tier === 'PRO';
          const isPremium = offer.tier === 'PREMIUM';

          return (
            <AppCard
              key={offer.id}
              className={`p-5 flex flex-col justify-between relative transition-all hover:shadow-lg border ${
                offer.isPopular
                  ? 'border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
              data-testid={`offer-card-${offer.id}`}
            >
              {offer.isPopular && (
                <div className="absolute -top-3 right-4">
                  <AppBadge variant="accent" size="sm" className="bg-indigo-600 text-white font-bold uppercase tracking-wider text-[10px] px-2.5 py-0.5 shadow-sm">
                    ★ Recommandé
                  </AppBadge>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <LicenseTierBadge tier={offer.tier} size="md" />
                  <span className="text-xs font-mono text-slate-400 font-semibold">
                    {offer.code}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">
                    {offer.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {offer.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {offer.price === 0 ? 'Gratuit' : `${offer.price.toFixed(2)} €`}
                    </span>
                    {offer.durationDays && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        / {offer.durationDays}j
                      </span>
                    )}
                    {offer.durationDays === null && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        / À vie
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Laptop className="w-3.5 h-3.5 text-slate-400" />
                    <span>{offer.maxDevices} poste(s)</span>
                  </div>
                </div>

                {/* AI Quota & Specs */}
                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>
                      Quota IA :{' '}
                      <strong>
                        {offer.aiDailyQuota === null ? 'Illimité' : `${offer.aiDailyQuota} req/jour`}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>
                      Validité :{' '}
                      <strong>
                        {offer.durationDays ? `${offer.durationDays} jours` : 'Perpétuelle (Permanente)'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Inclus dans l'offre :
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {offer.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                <AppButton
                  variant={isPro ? 'primary' : isPremium ? 'secondary' : 'outline'}
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => onSelectOffer(offer)}
                  data-testid={`order-offer-btn-${offer.id}`}
                >
                  <ShoppingBag className="w-4 h-4 mr-1.5" />
                  Créer une Commande
                </AppButton>
              </div>
            </AppCard>
          );
        })}
      </div>
    </div>
  );
};
