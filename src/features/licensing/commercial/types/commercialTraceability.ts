/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL TRACEABILITY & EVENT TYPES
 * Full audit trail for commercial and licensing operations.
 */

import { SubscriptionTier } from '../../../subscription/types/subscription';

export type CommercialEventType =
  | 'LICENSE_CREATED'
  | 'LICENSE_GENERATED'
  | 'LICENSE_ASSIGNED'
  | 'LICENSE_ACTIVATED'
  | 'LICENSE_RENEWED'
  | 'LICENSE_UPGRADED'
  | 'LICENSE_DOWNGRADED'
  | 'LICENSE_REPLACED'
  | 'LICENSE_SUSPENDED'
  | 'LICENSE_REACTIVATED'
  | 'LICENSE_REVOKED'
  | 'LICENSE_EXPIRED'
  | 'ORDER_CREATED'
  | 'ORDER_PAID'
  | 'ORDER_COMPLETED'
  | 'ORDER_CANCELLED'
  | 'ORDER_REFUNDED'
  | 'DELIVERY_PACKAGE_GENERATED'
  | 'CUSTOMER_CREATED'
  | 'CUSTOMER_UPDATED';

export interface CommercialTraceabilityEvent {
  eventId: string;
  timestamp: string;
  eventType: CommercialEventType;
  licenseId?: string;
  licenseKey?: string;
  orderId?: string;
  customerId?: string;
  tier?: SubscriptionTier;
  previousState?: string;
  newState?: string;
  source: string;
  reason?: string;
  details: string;
  performedBy?: string;
  success: boolean;
}
