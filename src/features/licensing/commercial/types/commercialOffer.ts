/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL OFFER TYPES
 * Definitions for commercial packages (FREE / PREMIUM / PRO).
 */

import { SubscriptionTier, SubscriptionCapability } from '../../../subscription/types/subscription';
import { LicenseType } from '../../types/licensing';

export type OfferStatus = 'ACTIVE' | 'ARCHIVED' | 'PROMOTIONAL' | 'INTERNAL';

export interface CommercialOffer {
  id: string; // Unique offer identifier, e.g., 'OFFER-PRO-ANNUAL-2026'
  name: string; // e.g. 'Bird Academy Pro Enterprise'
  code: string; // e.g. 'PRO-ENT-1Y'
  tier: SubscriptionTier; // 'FREE' | 'PREMIUM' | 'PRO'
  licenseType: LicenseType; // 'enterprise' | 'commercial' | 'temporary' | etc.
  description: string;
  durationDays: number | null; // null for permanent
  price: number;
  currency: string; // 'EUR' | 'USD' | 'DZD' | etc.
  maxDevices: number;
  aiDailyQuota: number | null; // null = unlimited
  capabilities: SubscriptionCapability[];
  features: string[];
  status: OfferStatus;
  version: string;
  isPopular?: boolean;
  notes?: string;
}

export interface OfferFilterState {
  tier: 'ALL' | SubscriptionTier;
  status: 'ALL' | OfferStatus;
  searchQuery: string;
}
