/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL OFFERS SERVICE
 * Official commercial catalog and package definitions for FREE / PREMIUM / PRO.
 */

import { CommercialOffer } from '../types/commercialOffer';
import { SubscriptionTier } from '../../../subscription/types/subscription';

export class CommercialOffersService {
  private static instance: CommercialOffersService | null = null;

  public static getInstance(): CommercialOffersService {
    if (!this.instance) {
      this.instance = new CommercialOffersService();
    }
    return this.instance;
  }

  private offers: CommercialOffer[] = [
    // 1. FREE TIER OFFERS
    {
      id: 'OFFER-FREE-COMMUNITY',
      name: 'Bird Academy Community (Gratuit)',
      code: 'FREE-COMM-01',
      tier: 'FREE',
      licenseType: 'temporary',
      description: 'Accès découverte et gestion de base pour éleveurs amateurs.',
      durationDays: 30,
      price: 0,
      currency: 'EUR',
      maxDevices: 1,
      aiDailyQuota: 10,
      capabilities: [
        'BIRD_VIEW',
        'BIRD_CREATE_EDIT',
        'HABITAT_VIEW',
        'HABITAT_MANAGE',
        'COUPLE_VIEW',
        'COUPLE_MANAGE',
        'BREEDING_VIEW',
        'BREEDING_RECORD',
        'HEALTH_VIEW',
        'HEALTH_RECORD',
        'FEEDING_VIEW',
        'CALENDAR_VIEW',
        'BIO_REFERENCE_ACCESS',
        'FINANCE_VIEW',
        'ANALYTICS_BASIC',
        'GENETICS_BASIC',
        'INTELLIGENCE_VIEW_BASIC',
        'AI_ASSISTANT_GENERAL_BIO',
        'AI_ASSISTANT_QUOTA_10',
      ],
      features: [
        'Gestion jusqu\'à 20 oiseaux',
        'Gestion des cages & couples',
        'Registre des pontes',
        'Assistant IA 10 requêtes/jour',
      ],
      status: 'ACTIVE',
      version: '1.3.6',
      notes: 'Offre gratuite d\'entrée',
    },

    // 2. PREMIUM TIER OFFERS
    {
      id: 'OFFER-PREMIUM-ANNUAL-2026',
      name: 'Bird Academy Passion (Premium Annuel)',
      code: 'PREM-ANN-2026',
      tier: 'PREMIUM',
      licenseType: 'commercial',
      description: 'Gestion avancée complète pour éleveurs passionnés et semi-professionnels.',
      durationDays: 365,
      price: 49.00,
      currency: 'EUR',
      maxDevices: 1,
      aiDailyQuota: 100,
      capabilities: [
        'BIRD_VIEW',
        'BIRD_CREATE_EDIT',
        'BIRD_UNLIMITED',
        'BIRD_ADVANCED_RECORD',
        'HABITAT_VIEW',
        'HABITAT_MANAGE',
        'HABITAT_ADVANCED',
        'COUPLE_VIEW',
        'COUPLE_MANAGE',
        'BREEDING_VIEW',
        'BREEDING_RECORD',
        'BREEDING_ADVANCED_TRACKING',
        'HEALTH_VIEW',
        'HEALTH_RECORD',
        'HEALTH_BATCH_TREATMENTS',
        'FEEDING_VIEW',
        'FEEDING_MANAGE',
        'CALENDAR_VIEW',
        'CALENDAR_FULL_SYNC',
        'BIO_REFERENCE_ACCESS',
        'FINANCE_VIEW',
        'FINANCE_MANAGE',
        'FINANCE_ADVANCED_REPORTS',
        'ANALYTICS_BASIC',
        'ANALYTICS_ADVANCED',
        'GENETICS_BASIC',
        'GENETICS_WRIGHT_INBREEDING',
        'INTELLIGENCE_VIEW_BASIC',
        'INTELLIGENCE_DIAGNOSTIC_FICHES',
        'AI_ASSISTANT_GENERAL_BIO',
        'AI_ASSISTANT_FARM_CONTEXT',
        'AI_ASSISTANT_QUOTA_100',
      ],
      features: [
        'Oiseaux & cages illimités',
        'Calcul de consanguinité de Wright',
        'Traitements par lot & alertes de santé',
        'Gestion financière & bilans complets',
        'Assistant IA 100 requêtes/jour',
        'Licence mono-appareil (données 100% locales)',
      ],
      status: 'ACTIVE',
      version: '1.3.6',
      isPopular: true,
      notes: 'Best-seller élevage individuel',
    },

    // 3. PRO TIER OFFERS
    {
      id: 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
      name: 'Bird Academy Enterprise (Pro Annuel)',
      code: 'PRO-ENT-ANN-2026',
      tier: 'PRO',
      licenseType: 'enterprise',
      description: 'Plateforme complète d\'intelligence aviaire, arbres généalogiques infinis et IA illimitée.',
      durationDays: 365,
      price: 119.00,
      currency: 'EUR',
      maxDevices: 1,
      aiDailyQuota: null, // Unlimited
      capabilities: [
        'BIRD_VIEW',
        'BIRD_CREATE_EDIT',
        'BIRD_UNLIMITED',
        'BIRD_ADVANCED_RECORD',
        'BIRD_QR_EXPORT',
        'HABITAT_VIEW',
        'HABITAT_MANAGE',
        'HABITAT_ADVANCED',
        'COUPLE_VIEW',
        'COUPLE_MANAGE',
        'COUPLE_COMPATIBILITY_GENETICS',
        'BREEDING_VIEW',
        'BREEDING_RECORD',
        'BREEDING_ADVANCED_TRACKING',
        'BREEDING_PREDICTIVE_ANALYTICS',
        'HEALTH_VIEW',
        'HEALTH_RECORD',
        'HEALTH_BATCH_TREATMENTS',
        'HEALTH_INTELLIGENCE_ALERTS',
        'FEEDING_VIEW',
        'FEEDING_MANAGE',
        'CALENDAR_VIEW',
        'CALENDAR_FULL_SYNC',
        'BIO_REFERENCE_ACCESS',
        'FINANCE_VIEW',
        'FINANCE_MANAGE',
        'FINANCE_ADVANCED_REPORTS',
        'ANALYTICS_BASIC',
        'ANALYTICS_ADVANCED',
        'ANALYTICS_PRO_EXPORT',
        'GENETICS_BASIC',
        'GENETICS_WRIGHT_INBREEDING',
        'GENETICS_ADVANCED_TREE',
        'INTELLIGENCE_VIEW_BASIC',
        'INTELLIGENCE_DIAGNOSTIC_FICHES',
        'INTELLIGENCE_FULL_ENGINE',
        'AI_ASSISTANT_GENERAL_BIO',
        'AI_ASSISTANT_FARM_CONTEXT',
        'AI_ASSISTANT_INTELLIGENCE_GENEALOGY',
        'AI_ASSISTANT_QUOTA_UNLIMITED',
      ],
      features: [
        'Moteur Bird Intelligence complet',
        'Arbres généalogiques & simulation prédictive',
        'Exports professionnels PDF / CSV / QR',
        'Assistant IA Illimité contextuel',
        'Licence mono-appareil (données 100% locales)',
      ],
      status: 'ACTIVE',
      version: '1.3.6',
      notes: 'Édition professionnelle et clubs',
    },

    // 4. PRO PERMANENT / LIFETIME OFFER
    {
      id: 'OFFER-PRO-ENTERPRISE-LIFETIME',
      name: 'Bird Academy Enterprise (Licence Permanente Pro)',
      code: 'PRO-ENT-LIFE',
      tier: 'PRO',
      licenseType: 'permanent',
      description: 'Licence perpétuelle sans abonnement pour élevages professionnels et centres vétérinaires.',
      durationDays: null, // Permanent
      price: 249.00,
      currency: 'EUR',
      maxDevices: 1,
      aiDailyQuota: null,
      capabilities: [
        'BIRD_VIEW',
        'BIRD_CREATE_EDIT',
        'BIRD_UNLIMITED',
        'BIRD_ADVANCED_RECORD',
        'BIRD_QR_EXPORT',
        'HABITAT_VIEW',
        'HABITAT_MANAGE',
        'HABITAT_ADVANCED',
        'COUPLE_VIEW',
        'COUPLE_MANAGE',
        'COUPLE_COMPATIBILITY_GENETICS',
        'BREEDING_VIEW',
        'BREEDING_RECORD',
        'BREEDING_ADVANCED_TRACKING',
        'BREEDING_PREDICTIVE_ANALYTICS',
        'HEALTH_VIEW',
        'HEALTH_RECORD',
        'HEALTH_BATCH_TREATMENTS',
        'HEALTH_INTELLIGENCE_ALERTS',
        'FEEDING_VIEW',
        'FEEDING_MANAGE',
        'CALENDAR_VIEW',
        'CALENDAR_FULL_SYNC',
        'BIO_REFERENCE_ACCESS',
        'FINANCE_VIEW',
        'FINANCE_MANAGE',
        'FINANCE_ADVANCED_REPORTS',
        'ANALYTICS_BASIC',
        'ANALYTICS_ADVANCED',
        'ANALYTICS_PRO_EXPORT',
        'GENETICS_BASIC',
        'GENETICS_WRIGHT_INBREEDING',
        'GENETICS_ADVANCED_TREE',
        'INTELLIGENCE_VIEW_BASIC',
        'INTELLIGENCE_DIAGNOSTIC_FICHES',
        'INTELLIGENCE_FULL_ENGINE',
        'AI_ASSISTANT_GENERAL_BIO',
        'AI_ASSISTANT_FARM_CONTEXT',
        'AI_ASSISTANT_INTELLIGENCE_GENEALOGY',
        'AI_ASSISTANT_QUOTA_UNLIMITED',
      ],
      features: [
        'Validité permanente à vie sans renouvellement',
        'Toutes les fonctionnalités Pro débloquées',
        'Licence mono-appareil (données 100% locales)',
        'Assistant IA Illimité',
      ],
      status: 'ACTIVE',
      version: '1.3.6',
      notes: 'Offre perpétuelle haut de gamme',
    },
  ];

  private aliasMap: Record<string, string> = {
    'OFFER-FREE-COMM': 'OFFER-FREE-COMMUNITY',
    'FREE-COMM': 'OFFER-FREE-COMMUNITY',
    'OFFER-FREE': 'OFFER-FREE-COMMUNITY',
    'OFFER-PREMIUM-ANNUAL': 'OFFER-PREMIUM-ANNUAL-2026',
    'PREM-ANN': 'OFFER-PREMIUM-ANNUAL-2026',
    'OFFER-PREMIUM': 'OFFER-PREMIUM-ANNUAL-2026',
    'OFFER-PRO-ANNUAL': 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
    'PRO-ENT-ANN': 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
    'OFFER-PRO': 'OFFER-PRO-ENTERPRISE-ANNUAL-2026',
    'OFFER-PRO-LIFETIME': 'OFFER-PRO-ENTERPRISE-LIFETIME',
    'PRO-ENT-LIFE': 'OFFER-PRO-ENTERPRISE-LIFETIME',
  };

  public static resetInstance(): void {
    this.instance = null;
  }

  public getAllOffers(): CommercialOffer[] {
    return [...this.offers];
  }

  public getActiveOffers(): CommercialOffer[] {
    return this.offers.filter(o => o.status === 'ACTIVE');
  }

  public getOffers(filter?: { tier?: string; status?: string; searchQuery?: string }): CommercialOffer[] {
    let list = [...this.offers];
    if (!filter) return list;

    if (filter.tier && filter.tier !== 'ALL') {
      list = list.filter(o => o.tier === filter.tier);
    }
    if (filter.status && filter.status !== 'ALL') {
      list = list.filter(o => o.status === filter.status);
    }
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      list = list.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getOfferById(offerId: string): CommercialOffer | undefined {
    if (!offerId) return undefined;
    if (this.aliasMap[offerId]) {
      return this.offers.find(o => o.id === this.aliasMap[offerId]);
    }
    const direct = this.offers.find(o => o.id === offerId || o.code === offerId);
    if (direct) return direct;

    const normalized = offerId.toUpperCase().replace(/[-_]/g, '');
    return this.offers.find(o => {
      const normId = o.id.toUpperCase().replace(/[-_]/g, '');
      const normCode = o.code.toUpperCase().replace(/[-_]/g, '');
      return normId.includes(normalized) || normalized.includes(normId) ||
             normCode.includes(normalized) || normalized.includes(normCode);
    });
  }

  public getOffersByTier(tier: SubscriptionTier): CommercialOffer[] {
    return this.offers.filter(o => o.tier === tier);
  }
}
