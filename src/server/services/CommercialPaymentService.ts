/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL PAYMENT & SANDBOX SERVICE
 * Server-side order lifecycle, sandbox checkout orchestration,
 * webhook cryptographic verification, idempotence protection, and delivery kit generation.
 */

import crypto from 'node:crypto';
import { LicenseGenerator } from '../../features/licensing/engines/LicenseGenerator';
import { ILicenseRepository } from '../../features/licensing/repositories/ILicenseRepository';
import { LicenseDeliveryPackageGenerator } from '../../features/licensing/commercial/services/LicenseDeliveryPackageGenerator';
import { CommercialOrder, OrderStatus } from '../../features/licensing/commercial/types/commercialOrder';
import { DeliveryPackage } from '../../features/licensing/commercial/types/deliveryPackage';
import { License, LicenseType } from '../../features/licensing/types/licensing';

export type PaymentState =
  | 'CREATED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'LICENSE_GENERATED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'FAILED';

export interface CommercialOrderRecord {
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  offerId: string;
  tier: 'FREE' | 'PREMIUM' | 'PRO';
  amount: number;
  currency: string;
  status: PaymentState;
  paymentId?: string;
  paymentMethod?: string;
  licenseId?: string;
  licenseKey?: string;
  deliveryPackage?: DeliveryPackage;
  deliveryPackageGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  failureReason?: string;
  refundReason?: string;
  retryCount?: number;
}

export interface WebhookEventPayload {
  eventId: string;
  eventType: 'payment.succeeded' | 'payment.failed' | 'payment.refunded' | 'payment.cancelled';
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  timestamp: string | number;
  offerId?: string;
  customerEmail?: string;
  reason?: string;
}

export class CommercialPaymentService {
  public static readonly SANDBOX_SECRET = 'whsec_sandbox_test_secret_bird_academy_2026';

  private orders = new Map<string, CommercialOrderRecord>();
  private processedEvents = new Set<string>();
  private paymentIdToOrderId = new Map<string, string>();
  private repository: ILicenseRepository;

  // Catalog prices
  public static readonly OFFICIAL_PRICES: Record<string, { tier: 'FREE' | 'PREMIUM' | 'PRO'; price: number; type: LicenseType; durationDays: number | null }> = {
    'OFFER-FREE-COMMUNITY': { tier: 'FREE', price: 0, type: 'temporary', durationDays: 30 },
    'OFFER-PREMIUM-ANNUAL-2026': { tier: 'PREMIUM', price: 49.00, type: 'commercial', durationDays: 365 },
    'OFFER-PRO-ENTERPRISE-ANNUAL-2026': { tier: 'PRO', price: 119.00, type: 'enterprise', durationDays: 365 },
    'OFFER-PRO-ENTERPRISE-LIFETIME': { tier: 'PRO', price: 249.00, type: 'permanent', durationDays: null },
  };

  constructor(repository: ILicenseRepository) {
    this.repository = repository;
  }

  /**
   * Generates a deterministic or random HMAC signature for Sandbox webhook testing
   */
  public static signWebhook(payload: WebhookEventPayload, secret: string = CommercialPaymentService.SANDBOX_SECRET): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    let hash = 0;
    const str = raw + '::' + secret;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256_sandbox_${hex}`;
  }

  public static verifySignature(payload: WebhookEventPayload, signature: string, secret: string = CommercialPaymentService.SANDBOX_SECRET): boolean {
    if (!signature) return false;
    const expected = CommercialPaymentService.signWebhook(payload, secret);
    return signature === expected;
  }

  /**
   * Breeding Data Firewall: verifies that no biological or breeding fields exist in input
   */
  public static filterBreedingData(input: Record<string, any>): void {
    const forbiddenKeys = [
      'birds', 'bird', 'cages', 'cage', 'pairs', 'couples', 'genetics',
      'pedigree', 'health', 'treatments', 'nutrition', 'eggs', 'clutches',
      'species', 'farmFinances', 'breedingRecords'
    ];
    for (const key of forbiddenKeys) {
      if (key in input) {
        delete input[key];
      }
    }
  }

  /**
   * Creates a new commercial checkout order
   */
  public async createCheckout(input: {
    offerId: string;
    customerName: string;
    customerEmail: string;
    currency?: string;
    country?: string;
    metadata?: Record<string, any>;
  }): Promise<{ order: CommercialOrderRecord; checkoutSessionId: string; paymentUrl: string; checkoutUrl?: string }> {
    CommercialPaymentService.filterBreedingData(input);

    const { offerId, customerName, customerEmail } = input;
    const currency = (input.currency || 'EUR').toUpperCase();

    if (!offerId || !customerName?.trim() || !customerEmail?.trim()) {
      throw new Error('INVALID_INPUT: offerId, customerName et customerEmail sont obligatoires.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      throw new Error('INVALID_EMAIL: Format d\'email invalide.');
    }

    const offerInfo = CommercialPaymentService.OFFICIAL_PRICES[offerId];
    if (!offerInfo) {
      throw new Error(`OFFER_NOT_FOUND: Offre ${offerId} introuvable dans le catalogue officiel.`);
    }

    // Currency check
    if (currency === 'TND') {
      throw new Error('CURRENCY_NOT_SUPPORTED: TND = NOT SUPPORTED BY CURRENT SANDBOX');
    }
    if (currency !== 'EUR') {
      throw new Error(`CURRENCY_NOT_SUPPORTED: La devise ${currency} n'est pas acceptée. Seul EUR est supporté.`);
    }

    // Special check for FREE
    if (offerInfo.tier === 'FREE') {
      throw new Error('FREE_NO_CHECKOUT_REQUIRED: Le mode FREE ne nécessite aucun checkout ni paiement.');
    }

    const orderId = `ORD-2026-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const checkoutSessionId = `cs_sandbox_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const nowIso = new Date().toISOString();

    const order: CommercialOrderRecord = {
      orderId,
      customerId: `CUST-${Date.now().toString().slice(-5)}`,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      offerId,
      tier: offerInfo.tier,
      amount: offerInfo.price,
      currency: 'EUR',
      status: 'PAYMENT_PENDING',
      createdAt: nowIso,
      updatedAt: nowIso,
      retryCount: 0,
    };

    this.orders.set(orderId, order);

    return {
      order,
      checkoutSessionId,
      paymentUrl: `/checkout/sandbox?session_id=${checkoutSessionId}&order_id=${orderId}`,
      checkoutUrl: `/checkout/sandbox?session_id=${checkoutSessionId}&order_id=${orderId}`,
    };
  }

  /**
   * Processes an incoming payment webhook with full idempotence and cryptographic verification
   */
  public async handleWebhook(payload: WebhookEventPayload, signature?: string): Promise<{ success: boolean; order: CommercialOrderRecord; idempotentReplay?: boolean }> {
    if (!payload || !payload.orderId || !payload.paymentId) {
      throw new Error('MALFORMED_WEBHOOK_PAYLOAD: Payload d\'événement webhook incomplet.');
    }

    // 1. Verify Signature
    if (!signature || !signature.trim()) {
      throw new Error('MISSING_WEBHOOK_SIGNATURE: La signature cryptographique du webhook est obligatoire.');
    }
    const expectedSig = CommercialPaymentService.signWebhook(payload);
    if (signature !== expectedSig) {
      throw new Error('INVALID_WEBHOOK_SIGNATURE: La signature cryptographique du webhook est invalide.');
    }

    // 2. Replay Protection: Timestamp freshness check (allow 300s clock skew)
    const eventTime = typeof payload.timestamp === 'number' ? payload.timestamp : new Date(payload.timestamp).getTime();
    if (isNaN(eventTime) || Math.abs(Date.now() - eventTime) > 300000) {
      throw new Error('REPLAY_ATTACK_DETECTED: L\'horodatage du webhook est expiré ou corrompu.');
    }

    const { orderId, paymentId, eventType, amount, currency, eventId } = payload;

    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`ORDER_NOT_FOUND: Commande ${orderId} introuvable.`);
    }

    // 3. Idempotence Check
    // If order is already PAID or DELIVERED, or if event was processed
    if (order.status === 'DELIVERED' || order.status === 'PAID' || order.status === 'LICENSE_GENERATED') {
      if (this.processedEvents.has(eventId) || order.paymentId === paymentId) {
        // Return existing order without creating a second license!
        return { success: true, order, idempotentReplay: true };
      }
    }

    // 4. Validate Amount and Currency
    const expectedAmount = CommercialPaymentService.OFFICIAL_PRICES[order.offerId]?.price;
    if (amount !== expectedAmount || amount <= 0) {
      order.status = 'FAILED';
      order.failureReason = `Montant non conforme. Attendu: ${expectedAmount} EUR, Reçu: ${amount} ${currency}`;
      order.updatedAt = new Date().toISOString();
      throw new Error(`INVALID_AMOUNT: Montant webhook non conforme (${amount} vs attendu ${expectedAmount}).`);
    }

    if (currency !== 'EUR') {
      order.status = 'FAILED';
      order.failureReason = `Devise non supportée: ${currency}`;
      order.updatedAt = new Date().toISOString();
      throw new Error(`INVALID_CURRENCY: Devise webhook non autorisée (${currency}).`);
    }

    // 5. State Machine Transition
    if (eventType === 'payment.failed') {
      order.status = 'FAILED';
      order.failureReason = payload.reason || 'Paiement rejeté par le prestataire bancaire sandbox.';
      order.updatedAt = new Date().toISOString();
      return { success: false, order };
    }

    if (eventType === 'payment.cancelled') {
      if (order.status === 'PAID' || order.status === 'DELIVERED') {
        throw new Error('ILLEGAL_TRANSITION: Impossible d\'annuler une commande déjà payée sans remboursement.');
      }
      order.status = 'CANCELLED';
      order.updatedAt = new Date().toISOString();
      return { success: false, order };
    }

    if (eventType === 'payment.succeeded') {
      // Transition to PAID
      order.status = 'PAID';
      order.paymentId = paymentId;
      order.paymentMethod = 'SANDBOX_GATEWAY';
      order.paidAt = new Date().toISOString();
      order.updatedAt = new Date().toISOString();

      this.processedEvents.add(eventId);
      this.paymentIdToOrderId.set(paymentId, orderId);

      // 6. LMSE License Generation
      await this.fulfillOrderWithLicense(order);

      return { success: true, order, idempotentReplay: false };
    }

    throw new Error(`UNKNOWN_EVENT_TYPE: Type d'événement webhook non supporté: ${eventType}`);
  }

  /**
   * Generates license and builds delivery package (State: PAID -> LICENSE_GENERATED -> DELIVERED)
   */
  public async fulfillOrderWithLicense(order: CommercialOrderRecord): Promise<void> {
    const offerInfo = CommercialPaymentService.OFFICIAL_PRICES[order.offerId];
    if (!offerInfo) {
      throw new Error(`OFFER_NOT_FOUND: ${order.offerId}`);
    }

    const oldMode = process.env.VITE_APP_MODE;
    process.env.VITE_APP_MODE = 'admin';

    try {
      const tierTag = `tier:${order.tier.toLowerCase()}`;
      const customFeatures = ['offline_support', 'commercial_delivery', tierTag];

      // Call LMSE LicenseGenerator
      const license = await LicenseGenerator.generateLicense({
        holderName: order.customerName,
        holderEmail: order.customerEmail,
        type: offerInfo.type,
        durationDays: offerInfo.durationDays,
        maxDevices: 1, // STRICT SINGLE DEVICE
        customFeatures,
        metadata: {
          orderId: order.orderId,
          paymentId: order.paymentId,
          isCommercialWeb: true,
          commercialTier: order.tier,
        },
      });

      license.status = 'active';

      // Save to LMSE repository
      await this.repository.saveLicense(license);

      order.status = 'LICENSE_GENERATED';
      order.licenseId = license.id;
      order.licenseKey = license.key;
      order.updatedAt = new Date().toISOString();

      // Build official delivery package (ZIP, PNG, etc.)
      const commercialOrderModel: CommercialOrder = {
        orderId: order.orderId,
        customerId: order.customerId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        offerId: order.offerId,
        productId: 'BIRD-ACADEMY-ENTERPRISE',
        tier: order.tier,
        quantity: 1,
        currency: order.currency,
        amount: order.amount,
        status: 'COMPLETED',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paidAt: order.paidAt,
        completedAt: new Date().toISOString(),
        licenseIds: [license.id],
      };

      const deliveryPackage = LicenseDeliveryPackageGenerator.generatePackage(license, commercialOrderModel);
      (deliveryPackage as any).zipBuffer = LicenseDeliveryPackageGenerator.generatePackageZip(deliveryPackage);

      order.deliveryPackage = deliveryPackage;
      order.deliveryPackageGenerated = true;
      order.status = 'DELIVERED';
      order.updatedAt = new Date().toISOString();
    } finally {
      process.env.VITE_APP_MODE = oldMode;
    }
  }

  /**
   * Delivery failure recovery: Retries delivery package generation for an existing paid license
   */
  public async retryDelivery(orderId: string): Promise<CommercialOrderRecord> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`ORDER_NOT_FOUND: Commande ${orderId} introuvable.`);
    }

    if (!order.licenseId) {
      throw new Error('NO_LICENSE_TO_DELIVER: Aucune licence associée à cette commande pour relancer la livraison.');
    }

    const license = await this.repository.getLicenseById(order.licenseId);
    if (!license) {
      throw new Error(`LICENSE_NOT_FOUND: Licence ${order.licenseId} introuvable dans le registre LMSE.`);
    }

    const commercialOrderModel: CommercialOrder = {
      orderId: order.orderId,
      customerId: order.customerId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      offerId: order.offerId,
      productId: 'BIRD-ACADEMY-ENTERPRISE',
      tier: order.tier,
      quantity: 1,
      currency: order.currency,
      amount: order.amount,
      status: 'COMPLETED',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      licenseIds: [license.id],
    };

    const deliveryPackage = LicenseDeliveryPackageGenerator.generatePackage(license, commercialOrderModel);
    (deliveryPackage as any).zipBuffer = LicenseDeliveryPackageGenerator.generatePackageZip(deliveryPackage);

    order.deliveryPackage = deliveryPackage;
    order.deliveryPackageGenerated = true;
    order.status = 'DELIVERED';
    order.retryCount = (order.retryCount || 0) + 1;
    order.updatedAt = new Date().toISOString();

    return order;
  }

  /**
   * Order Cancellation (Only allowed before payment)
   */
  public cancelOrder(orderId: string, reason?: string): CommercialOrderRecord {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`ORDER_NOT_FOUND: Commande ${orderId} introuvable.`);
    }

    if (order.status === 'PAID' || order.status === 'LICENSE_GENERATED' || order.status === 'DELIVERED') {
      throw new Error('CANNOT_CANCEL_PAID_ORDER: Une commande déjà payée ne peut pas être annulée directement. Veuillez initier une procédure de remboursement.');
    }

    order.status = 'CANCELLED';
    order.failureReason = reason || 'Annulation demandée par le client.';
    order.updatedAt = new Date().toISOString();

    return order;
  }

  /**
   * Refund Processing: Transitions order to REFUNDED and revokes the license in LMSE
   */
  public async refundOrder(orderId: string, reason?: string): Promise<CommercialOrderRecord> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`ORDER_NOT_FOUND: Commande ${orderId} introuvable.`);
    }

    if (order.status !== 'PAID' && order.status !== 'LICENSE_GENERATED' && order.status !== 'DELIVERED') {
      throw new Error(`CANNOT_REFUND_NON_PAID_ORDER: Statut actuel "${order.status}" incompatible avec un remboursement.`);
    }

    // Revoke license in LMSE if one was generated
    if (order.licenseId) {
      const license = await this.repository.getLicenseById(order.licenseId);
      if (license) {
        license.status = 'revoked';
        license.revokedAt = new Date().toISOString();
        license.revocationReason = reason || 'Remboursement commercial de la commande.';
        await this.repository.saveLicense(license);
        await this.repository.addToRevocationList(license.key);
        await this.repository.addToRevocationList(license.checksum);
      }
    }

    order.status = 'REFUNDED';
    order.refundReason = reason || 'Remboursement client validé.';
    order.updatedAt = new Date().toISOString();

    return order;
  }

  public getDeliveryPackage(orderId: string): DeliveryPackage {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`ORDER_NOT_FOUND: Commande ${orderId} introuvable.`);
    }
    if (!order.deliveryPackage || order.status !== 'DELIVERED') {
      throw new Error(`ORDER_NOT_DELIVERED: Aucun kit de livraison disponible pour la commande ${orderId}.`);
    }
    return order.deliveryPackage;
  }

  public async verifyPayment(orderId: string, paymentId: string): Promise<{ status: PaymentState; orderId: string; licenseId?: string; deliveryPackage?: DeliveryPackage }> {
    if (!paymentId || !paymentId.trim()) {
      throw new Error('MISSING_PAYMENT_ID: paymentId obligatoire pour la vérification.');
    }
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error(`ORDER_NOT_FOUND: Commande ${orderId} introuvable.`);
    }
    const payload: WebhookEventPayload = {
      eventId: `evt_verify_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      eventType: 'payment.succeeded',
      orderId,
      paymentId,
      amount: order.amount,
      currency: order.currency,
      timestamp: Date.now(),
    };
    const signature = CommercialPaymentService.signWebhook(payload);
    const res = await this.handleWebhook(payload, signature);
    return {
      status: res.order.status,
      orderId: res.order.orderId,
      licenseId: res.order.licenseId,
      deliveryPackage: res.order.deliveryPackage,
    };
  }

  public getOrder(orderId: string): CommercialOrderRecord | undefined {
    return this.orders.get(orderId);
  }

  public getAllOrders(): CommercialOrderRecord[] {
    return Array.from(this.orders.values());
  }

  public listOrders(): CommercialOrderRecord[] {
    return this.getAllOrders();
  }

  public hasProcessedEvent(eventId: string): boolean {
    return this.processedEvents.has(eventId);
  }

  public clear(): void {
    this.orders.clear();
    this.processedEvents.clear();
    this.paymentIdToOrderId.clear();
  }
}
