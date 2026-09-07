/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL ORDER TYPES
 * Data structures for order management, invoicing references, and license generation links.
 */

import { SubscriptionTier } from '../../../subscription/types/subscription';

export type OrderStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'FAILED';

export type OrderSource = 
  | 'DIRECT' 
  | 'PARTNER' 
  | 'WEB' 
  | 'INTERNAL_TEST' 
  | 'ADMIN_MANUAL';

export interface CommercialOrder {
  orderId: string; // e.g. 'ORD-2026-0042'
  customerId: string;
  customerName: string;
  customerEmail?: string;
  offerId: string;
  productId: string; // e.g. 'BIRD-ACADEMY-PRO'
  tier: SubscriptionTier;
  quantity: number;
  currency: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  completedAt?: string;
  licenseIds: string[];
  notes?: string;
  source?: OrderSource;
  paymentMethod?: string;
  paymentReference?: string;
  deliveryPackageGenerated?: boolean;
}

export interface OrderCreationInput {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  offerId: string;
  quantity?: number;
  source?: OrderSource;
  notes?: string;
  autoFulfill?: boolean;
}

export interface OrderFilterState {
  searchQuery: string;
  tier: 'ALL' | SubscriptionTier;
  status: 'ALL' | OrderStatus;
  source: 'ALL' | OrderSource;
  sortBy: 'createdAt' | 'amount' | 'customerName' | 'status';
  sortOrder: 'asc' | 'desc';
}
