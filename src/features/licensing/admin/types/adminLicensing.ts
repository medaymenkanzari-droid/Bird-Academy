/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE COMMERCIAL ADMIN TYPES
 * Data structures, filter criteria, and workflow models for the Admin Console.
 */

import { License, LicenseStatus, LicenseType } from '../../types/licensing';
import { SubscriptionTier } from '../../../subscription/types/subscription';

export type CommercialTierFilter = 'ALL' | SubscriptionTier;

export type CommercialStatusFilter = 'ALL' | LicenseStatus;

export interface CommercialAdminStats {
  totalLicenses: number;
  tierBreakdown: Record<SubscriptionTier, number>;
  statusBreakdown: Record<LicenseStatus, number>;
  typeBreakdown: Record<LicenseType, number>;
  totalActivatedDevices: number;
  expiringSoonCount: number; // Expiring within 30 days
  recentlyCreatedCount: number; // Created within 7 days
  recentlyActivatedCount: number; // Activated within 7 days
  lastAuditTimestamp: string;
}

export interface LicenseCreationFormValues {
  tier: SubscriptionTier;
  type: LicenseType;
  holderName: string;
  holderEmail?: string;
  durationDays: number | null; // null for permanent
  maxDevices: number;
  customFeatures: string[];
  notes?: string;
  isOfflineOnly?: boolean;
}

export interface RenewalDialogValues {
  licenseId: string;
  durationDays: number | null;
  notes?: string;
}

export interface ReplacementDialogValues {
  oldLicenseId: string;
  targetTier: SubscriptionTier;
  holderName: string;
  holderEmail?: string;
  durationDays: number | null;
  reason: string;
}

export interface RevocationDialogValues {
  licenseId: string;
  reason: string;
  confirmUnderstood: boolean;
}

export interface SuspensionDialogValues {
  licenseId: string;
  action: 'SUSPEND' | 'REACTIVATE';
  reason?: string;
}

export interface TierChangeDialogValues {
  licenseId: string;
  currentTier: SubscriptionTier;
  targetTier: SubscriptionTier;
  durationDays?: number | null;
  reason?: string;
}

export interface LicenseFilterState {
  searchQuery: string;
  tierFilter: CommercialTierFilter;
  statusFilter: CommercialStatusFilter;
  typeFilter: 'ALL' | LicenseType;
  sortBy: 'issuedAt' | 'expiresAt' | 'holderName' | 'status' | 'tier';
  sortOrder: 'asc' | 'desc';
}
