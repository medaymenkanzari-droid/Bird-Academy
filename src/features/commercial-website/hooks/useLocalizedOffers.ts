/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LOCALIZED OFFERS HOOK & RESOLVER
 * Resolves commercial offers with 100% reactive i18n and multi-currency formatting.
 */

import { useMemo } from 'react';
import { CommercialOffer } from '../../licensing/commercial/types/commercialOffer';
import { CommercialOffersService } from '../../licensing/commercial/services/CommercialOffersService';
import { useWebLanguage } from '../i18n';
import { useWebCurrency } from '../context/CommercialCurrencyContext';
import { Shield, Zap, Crown, Infinity, LucideIcon } from 'lucide-react';
import { WebRoute } from '../types';

export interface LocalizedOfferViewModel {
  offer: CommercialOffer;
  id: string;
  code: string;
  tier: 'FREE' | 'PREMIUM' | 'PRO';
  isLifetime: boolean;
  name: string;
  badge: string;
  period: string;
  description: string;
  features: string[];
  advantages: string[];
  limits: string[];
  ctaLabel: string;
  ctaRoute: WebRoute;
  detailsRoute: WebRoute;
  icon: LucideIcon;
  color: string;
  priceFormatted: string;
  priceValueInEur: number;
  convertedPriceValue: number;
  isPopular?: boolean;
}

export function useLocalizedOffers() {
  const { t, locale, isRtl } = useWebLanguage();
  const { formatPrice, convertPrice } = useWebCurrency();
  const offersService = CommercialOffersService.getInstance();
  const allOffers = offersService.getAllOffers();

  const getOfferKey = (offerId: string): 'free' | 'premium' | 'proAnnual' | 'proLifetime' => {
    if (offerId === 'OFFER-FREE-COMMUNITY' || offerId.includes('FREE')) return 'free';
    if (offerId === 'OFFER-PREMIUM-ANNUAL-2026' || offerId.includes('PREMIUM')) return 'premium';
    if (offerId === 'OFFER-PRO-ENTERPRISE-LIFETIME' || offerId.includes('LIFE')) return 'proLifetime';
    return 'proAnnual';
  };

  const getLocalizedOffer = (offer: CommercialOffer): LocalizedOfferViewModel => {
    const key = getOfferKey(offer.id);
    const isLifetime = offer.id === 'OFFER-PRO-ENTERPRISE-LIFETIME' || offer.durationDays === null;
    
    // Resolve localized strings with fallbacks
    const name = t(`offers.${key}.name`) || offer.name;
    const badge = t(`offers.${key}.badge`) || (isLifetime ? 'À Vie' : offer.tier);
    const period = t(`offers.${key}.period`) || (offer.durationDays ? `${offer.durationDays} jours` : 'Permanent');
    const description = t(`offers.${key}.description`) || offer.description;
    
    // Features array
    let features: string[] = [];
    const featRaw = t(`offers.${key}.features`);
    if (Array.isArray(featRaw)) {
      features = featRaw;
    } else {
      features = offer.features || [];
    }

    // Advantages array
    let advantages: string[] = [];
    const advRaw = t(`offers.${key}.advantages`);
    if (Array.isArray(advRaw)) {
      advantages = advRaw;
    } else {
      advantages = features;
    }

    // Limits array
    let limits: string[] = [];
    const limRaw = t(`offers.${key}.limits`);
    if (Array.isArray(limRaw)) {
      limits = limRaw;
    }

    const ctaLabel = t(`offers.${key}.ctaLabel`) || (key === 'free' ? 'Télécharger' : 'Commander');

    let icon = Shield;
    let color = 'indigo';
    let detailsRoute: WebRoute = 'product-free';
    let ctaRoute: WebRoute = 'checkout';

    if (key === 'free') {
      icon = Shield;
      color = 'indigo';
      detailsRoute = 'product-free';
      ctaRoute = 'download';
    } else if (key === 'premium') {
      icon = Zap;
      color = 'indigo';
      detailsRoute = 'product-premium';
      ctaRoute = 'checkout';
    } else if (key === 'proAnnual') {
      icon = Crown;
      color = 'amber';
      detailsRoute = 'product-pro';
      ctaRoute = 'checkout';
    } else if (key === 'proLifetime') {
      icon = Infinity;
      color = 'amber';
      detailsRoute = 'product-pro';
      ctaRoute = 'checkout';
    }

    const priceFormatted = formatPrice(offer.price);
    const convertedPriceValue = convertPrice(offer.price);

    return {
      offer,
      id: offer.id,
      code: offer.code,
      tier: offer.tier as 'FREE' | 'PREMIUM' | 'PRO',
      isLifetime,
      name,
      badge,
      period,
      description,
      features,
      advantages,
      limits,
      ctaLabel,
      ctaRoute,
      detailsRoute,
      icon,
      color,
      priceFormatted,
      priceValueInEur: offer.price,
      convertedPriceValue,
      isPopular: offer.isPopular || key === 'premium',
    };
  };

  const localizedOffers = useMemo(() => {
    return allOffers.map(getLocalizedOffer);
  }, [allOffers, locale, formatPrice, convertPrice]);

  return {
    offers: localizedOffers,
    getLocalizedOfferById: (offerId: string): LocalizedOfferViewModel | undefined => {
      const off = offersService.getOfferById(offerId);
      return off ? getLocalizedOffer(off) : undefined;
    },
    getLocalizedOffer,
    isRtl,
  };
}
