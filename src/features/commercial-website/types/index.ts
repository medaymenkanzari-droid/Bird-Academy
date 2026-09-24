/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL WEBSITE PLATFORM 01
 * Type definitions for public commercial website, routing, i18n, checkout, and download center.
 */

import { SubscriptionTier } from '../../subscription/types/subscription';
import { CommercialOffer } from '../../licensing/commercial/types/commercialOffer';
import { CommercialOrder, OrderStatus } from '../../licensing/commercial/types/commercialOrder';
import { CustomerReference } from '../../licensing/commercial/types/customerReference';
import { DeliveryPackage } from '../../licensing/commercial/types/deliveryPackage';

export type WebLocale = 'fr' | 'en' | 'ar' | 'es' | 'it';

export type WebRoute = 
  | 'home'
  | 'products'
  | 'product-free'
  | 'product-premium'
  | 'product-pro'
  | 'pricing'
  | 'checkout'
  | 'order-confirmation'
  | 'orders'
  | 'download'
  | 'download-doc'
  | 'license'
  | 'faq'
  | 'support'
  | 'account';

export interface WebNavigationItem {
  id: WebRoute;
  labelKey: string;
  href: string;
  isPrimary?: boolean;
  badgeKey?: string;
}

export interface PaymentProviderResult {
  success: boolean;
  transactionId: string;
  paymentMethod: string;
  paidAmount: number;
  currency: string;
  paidAt: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface PaymentProvider {
  providerId: string;
  providerName: string;
  isAvailable: boolean;
  isDemoMode: boolean;
  processPayment(
    amount: number,
    currency: string,
    orderId: string,
    customerDetails: { name: string; email: string; country?: string }
  ): Promise<PaymentProviderResult>;
  createCheckout?(order: {
    orderId: string;
    amount: number;
    currency: string;
    customerName: string;
    customerEmail?: string;
    offerId: string;
  }): Promise<{ checkoutSessionId: string; paymentUrl: string; status: string }>;
  verifyPayment?(
    orderId: string,
    paymentId?: string
  ): Promise<{
    status: 'PAID' | 'FAILED' | 'PENDING';
    transactionId?: string;
    paidAmount?: number;
    currency?: string;
    errorMessage?: string;
  }>;
  handleWebhook?(
    payload: any,
    signature: string
  ): Promise<{
    verified: boolean;
    eventType: string;
    orderId: string;
    paymentId: string;
    amount: number;
    currency: string;
    error?: string;
  }>;
  refundPayment?(
    orderId: string,
    paymentId: string,
    reason?: string
  ): Promise<{ refunded: boolean; refundId: string; refundedAmount: number }>;
}

export interface DownloadArtifact {
  platform: 'windows' | 'android' | 'documentation' | 'kit';
  name: string;
  filename: string;
  version: string;
  buildId?: string;
  sizeBytes: number;
  sizeMB: string;
  sha256: string;
  releaseDate: string;
  downloadUrl: string;
  architecture?: string;
  minOsVersion?: string;
  isAvailable: boolean;
  descriptionKey: string;
  warning?: string;
  isTestDistribution?: boolean;
  releaseTag?: string;
}

export interface SupportTicketSubmission {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  category: 'licensing' | 'activation' | 'downloads' | 'technical' | 'commercial' | 'general';
  message: string;
  createdAt: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export interface FAQItem {
  id: string;
  category: 'general' | 'pricing' | 'licensing' | 'offline' | 'ai' | 'security' | 'data' | 'downloads' | 'troubleshooting';
  questionKey: string;
  answerKey: string;
}
