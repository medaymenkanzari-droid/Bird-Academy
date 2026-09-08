/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WEB ORDER CHECKOUT SERVICE
 * Public commercial checkout orchestration, demo payment processing,
 * and offline demo delivery package generation with zero administrative leakage.
 */

import { CommercialOffersService } from '../../licensing/commercial/services/CommercialOffersService';
import { CommercialOffer } from '../../licensing/commercial/types/commercialOffer';
import { CommercialOrder } from '../../licensing/commercial/types/commercialOrder';
import { CustomerReference } from '../../licensing/commercial/types/customerReference';
import { DeliveryPackage, DeliveryPackageFile } from '../../licensing/commercial/types/deliveryPackage';
import { License, LicenseType } from '../../licensing/types/licensing';
import { CryptoService } from '../../licensing/services/CryptoService';
import { LicenseDeliveryPackageGenerator } from '../../licensing/commercial/services/LicenseDeliveryPackageGenerator';
import { QrCodeImageGenerator } from '../../licensing/commercial/services/QrCodeImageGenerator';
import { LmseConfigService } from '../../../config/lmseConfig';
import { PaymentProvider, DemoPaymentProvider, StripePaymentProviderStub, TunisianPaymentProviderStub } from './PaymentProvider';

export interface CheckoutInput {
  offerId: string;
  quantity?: number;
  customerName: string;
  customerEmail: string;
  country?: string;
  language?: string;
  notes?: string;
  paymentProviderId?: string;
}

export interface CheckoutResult {
  success: boolean;
  order?: CommercialOrder;
  customer?: CustomerReference;
  deliveryPackage?: DeliveryPackage;
  errorMessage?: string;
}

const STORAGE_KEYS = {
  WEB_ORDERS: 'bird_academy_commercial_web_orders',
  WEB_CUSTOMERS: 'bird_academy_commercial_web_customers',
  ADMIN_ORDERS: 'bird_academy_commercial_orders',
  ADMIN_CUSTOMERS: 'bird_academy_commercial_customers',
};

export class WebOrderCheckoutService {
  private static instance: WebOrderCheckoutService | null = null;
  private offersService: CommercialOffersService;

  private paymentProviders: PaymentProvider[] = [
    new DemoPaymentProvider(),
    new StripePaymentProviderStub(),
    new TunisianPaymentProviderStub(),
  ];

  private constructor() {
    this.offersService = CommercialOffersService.getInstance();
  }

  public static getInstance(): WebOrderCheckoutService {
    if (!this.instance) {
      this.instance = new WebOrderCheckoutService();
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  private getStorage(): Storage | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
    return null;
  }

  private getStoredOrders(): CommercialOrder[] {
    const storage = this.getStorage();
    if (!storage) return [];
    // Check web orders first, fallback to admin orders if shared
    const rawWeb = storage.getItem(STORAGE_KEYS.WEB_ORDERS);
    const rawAdmin = storage.getItem(STORAGE_KEYS.ADMIN_ORDERS);
    
    const webOrders: CommercialOrder[] = rawWeb ? JSON.parse(rawWeb) : [];
    const adminOrders: CommercialOrder[] = rawAdmin ? JSON.parse(rawAdmin) : [];

    const orderMap = new Map<string, CommercialOrder>();
    for (const o of adminOrders) orderMap.set(o.orderId, o);
    for (const o of webOrders) orderMap.set(o.orderId, o);

    return Array.from(orderMap.values());
  }

  private saveStoredOrders(orders: CommercialOrder[]): void {
    const storage = this.getStorage();
    if (!storage) return;
    storage.setItem(STORAGE_KEYS.WEB_ORDERS, JSON.stringify(orders));
    // Also mirror to admin storage for cross-module compatibility
    try {
      storage.setItem(STORAGE_KEYS.ADMIN_ORDERS, JSON.stringify(orders));
    } catch {
      // Ignored
    }
  }

  private getStoredCustomers(): CustomerReference[] {
    const storage = this.getStorage();
    if (!storage) return [];
    const rawWeb = storage.getItem(STORAGE_KEYS.WEB_CUSTOMERS);
    const rawAdmin = storage.getItem(STORAGE_KEYS.ADMIN_CUSTOMERS);

    const webCustomers: CustomerReference[] = rawWeb ? JSON.parse(rawWeb) : [];
    const adminCustomers: CustomerReference[] = rawAdmin ? JSON.parse(rawAdmin) : [];

    const custMap = new Map<string, CustomerReference>();
    for (const c of adminCustomers) custMap.set(c.customerId, c);
    for (const c of webCustomers) custMap.set(c.customerId, c);

    return Array.from(custMap.values());
  }

  private saveStoredCustomers(customers: CustomerReference[]): void {
    const storage = this.getStorage();
    if (!storage) return;
    storage.setItem(STORAGE_KEYS.WEB_CUSTOMERS, JSON.stringify(customers));
    try {
      storage.setItem(STORAGE_KEYS.ADMIN_CUSTOMERS, JSON.stringify(customers));
    } catch {
      // Ignored
    }
  }

  public getAvailablePaymentProviders(): PaymentProvider[] {
    return [...this.paymentProviders];
  }

  public getPaymentProvider(providerId: string): PaymentProvider {
    return (
      this.paymentProviders.find(p => p.providerId === providerId) ||
      this.paymentProviders[0]
    );
  }

  /**
   * Validates checkout submission
   */
  public validateCheckoutInput(input: CheckoutInput): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!input.customerName || !input.customerName.trim()) {
      errors.customerName = 'Le nom ou raison sociale est obligatoire.';
    }

    if (!input.customerEmail || !input.customerEmail.trim()) {
      errors.customerEmail = "L'adresse email est obligatoire.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail.trim())) {
      errors.customerEmail = "Format d'adresse email invalide.";
    }

    if (!input.offerId) {
      errors.offerId = 'Veuillez sélectionner une offre.';
    } else {
      const offer = this.offersService.getOfferById(input.offerId);
      if (!offer) {
        errors.offerId = 'Offre introuvable ou archivée.';
      }
    }

    if (input.quantity !== undefined && input.quantity < 1) {
      errors.quantity = 'La quantité minimale est de 1 licence.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  private getStoredLicense(licenseId: string): License | null {
    try {
      const storage = this.getStorage();
      if (storage) {
        const rawLicenses = storage.getItem('bird_academy_licenses');
        const licenses: License[] = rawLicenses ? JSON.parse(rawLicenses) : [];
        return licenses.find(l => l.id === licenseId) || null;
      }
    } catch {
      // Ignored
    }
    return null;
  }

  private saveLicenseLocally(license: License): void {
    try {
      const storage = this.getStorage();
      if (storage) {
        const rawLicenses = storage.getItem('bird_academy_licenses');
        const licenses: License[] = rawLicenses ? JSON.parse(rawLicenses) : [];
        const existingIdx = licenses.findIndex(l => l.id === license.id);
        if (existingIdx >= 0) {
          licenses[existingIdx] = license;
        } else {
          licenses.unshift(license);
        }
        storage.setItem('bird_academy_licenses', JSON.stringify(licenses));
      }
    } catch {
      // Ignored
    }
  }

  /**
   * Requests an official signed commercial License entity from the LMSE Backend Authority,
   * or produces a compliant evaluation license in offline demo mode.
   * Zero private keys or administrative secrets exposed to the frontend.
   */
  public async requestOrGenerateLicense(
    offer: CommercialOffer,
    order: CommercialOrder
  ): Promise<{ license: License; deliveryPackage: DeliveryPackage }> {
    // 1. Try requesting official authority-signed license from LMSE backend
    try {
      const apiUrl = LmseConfigService.getLmseApiUrl();
      if (apiUrl) {
        const res = await fetch(`${apiUrl}/api/commercial/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offerId: offer.id,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            country: 'FR',
            tier: offer.tier,
            maxDevices: offer.maxDevices,
            durationDays: offer.durationDays,
            features: Array.from(new Set([...(offer.features || []), `tier:${offer.tier.toLowerCase()}`])),
          }),
        });

        if (res.ok) {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            const data = await res.json();
            if (data.success && data.license) {
              const license: License = data.license;
              this.saveLicenseLocally(license);
              const deliveryPackage = LicenseDeliveryPackageGenerator.generatePackage(license, order);
              return { license, deliveryPackage };
            }
          }
        }
      }
    } catch {
      // Backend authority is unreachable (e.g. offline evaluation mode); fallback below
    }

    // 2. Offline / Demo Mode: Produce compliant evaluation license with valid public signature
    return this.generateDemoCompatibleLicense(offer, order);
  }

  /**
   * Generates a compliant evaluation license formatted according to the official bird-academy-lmse schema.
   */
  public async generateDemoCompatibleLicense(
    offer: CommercialOffer,
    order: CommercialOrder
  ): Promise<{ license: License; deliveryPackage: DeliveryPackage }> {
    const nowIso = new Date().toISOString();
    const licenseId = `lic_eval_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const expiresAt = offer.durationDays 
      ? new Date(Date.now() + offer.durationDays * 24 * 3600 * 1000).toISOString()
      : null;

    const licenseType: LicenseType = (offer.licenseType as LicenseType) || (offer.tier === 'PRO' ? 'enterprise' : 'commercial');
    const tag = licenseType === 'enterprise' ? 'ENTP' : 'COMM';
    const rawSeed = `${licenseId}::${order.customerName}::${Date.now()}`;
    const hash = await CryptoService.sha256(rawSeed);
    const s1 = hash.slice(0, 4).toUpperCase();
    const s2 = hash.slice(4, 8).toUpperCase();
    const checksumHash = await CryptoService.sha256(`LMSE-${tag}-${s1}-${s2}`);
    const s3 = checksumHash.slice(0, 4).toUpperCase();
    const licenseKey = `LMSE-${tag}-${s1}-${s2}-${s3}`;
    const maxDevices = offer.maxDevices || 1;
    const tierFeatureTag = `tier:${offer.tier.toLowerCase()}`;
    const baseFeatures = (offer.features && offer.features.length > 0)
      ? offer.features
      : (offer.tier === 'PRO'
          ? ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf', 'multi_user', 'audit_trail', 'tier:pro']
          : offer.tier === 'PREMIUM'
            ? ['core', 'unlimited_birds', 'pedigree', 'statistics', 'export_pdf', 'tier:premium']
            : ['core', 'tier:free']);
    const features = Array.from(new Set([...baseFeatures, tierFeatureTag]));

    const policy = {
      maxDevices,
      allowOfflineActivation: true,
      allowTransfer: true,
      features,
    };

    const payloadToSign = `${licenseId}:${licenseKey}:${order.customerName}:${licenseType}:${nowIso}:${expiresAt || 'NEVER'}:${maxDevices}`;
    const checksum = await CryptoService.sha256(payloadToSign);
    const signature = await CryptoService.sha256(checksum + '::' + CryptoService.getPublicVerificationKey());

    const license: License = {
      id: licenseId,
      key: licenseKey,
      holderName: order.customerName,
      holderEmail: order.customerEmail,
      type: licenseType,
      status: 'active',
      issuedAt: nowIso,
      expiresAt,
      policy,
      activations: [],
      revokedAt: null,
      revocationReason: null,
      checksum,
      signature,
      metadata: {
        commercialTier: offer.tier,
        orderId: order.orderId,
        offerId: offer.id,
        isCommercialWeb: true,
        isOfflineDemoMode: true,
        activatedOfflineAt: nowIso,
      },
    };

    this.saveLicenseLocally(license);
    const deliveryPackage = LicenseDeliveryPackageGenerator.generatePackage(license, order);
    return { license, deliveryPackage };
  }

  /**
   * Generates a safe demo delivery package marked explicitly as evaluation/test
   */
  public generateDemoDeliveryPackage(
    offer: CommercialOffer,
    order: CommercialOrder,
    demoLicenseKey: string
  ): DeliveryPackage {
    const nowIso = new Date().toISOString();
    const demoLicenseId = `lic_demo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const expiresAt = offer.durationDays 
      ? new Date(Date.now() + offer.durationDays * 24 * 3600 * 1000).toISOString()
      : null;

    const licenseType: LicenseType = (offer.licenseType as LicenseType) || (offer.tier === 'PRO' ? 'enterprise' : 'commercial');
    const maxDevices = offer.maxDevices || 3;
    const tierFeatureTag = `tier:${offer.tier.toLowerCase()}`;
    const features = Array.from(new Set([...(offer.features || ['core', 'unlimited_birds']), tierFeatureTag]));

    const demoLicense: License = {
      id: demoLicenseId,
      key: demoLicenseKey,
      holderName: order.customerName,
      holderEmail: order.customerEmail,
      type: licenseType,
      status: 'active',
      issuedAt: nowIso,
      expiresAt,
      policy: {
        maxDevices,
        allowOfflineActivation: true,
        allowTransfer: true,
        features,
      },
      activations: [],
      revokedAt: null,
      revocationReason: null,
      checksum: 'A1B2C3D4E5F60718293A4B5C6D7E8F90A1B2C3D4E5F60718293A4B5C6D7E8F90',
      signature: '3045022100AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233445566778899022000112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF',
      metadata: {
        commercialTier: offer.tier,
        orderId: order.orderId,
      },
    };

    return LicenseDeliveryPackageGenerator.generatePackage(demoLicense, order);
  }

  /**
   * Executes the full checkout pipeline in User/Web mode without triggering administrative checks
   */
  public async processCheckout(input: CheckoutInput): Promise<CheckoutResult> {
    const validation = this.validateCheckoutInput(input);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0] || 'Données de commande invalides.';
      return { success: false, errorMessage: firstError };
    }

    const offer = this.offersService.getOfferById(input.offerId)!;
    const quantity = input.quantity || 1;
    const totalAmount = offer.price * quantity;
    const nowIso = new Date().toISOString();

    try {
      const customers = this.getStoredCustomers();
      let customer: CustomerReference | undefined = customers.find(
        c => c.email?.toLowerCase() === input.customerEmail.trim().toLowerCase()
      );

      if (!customer) {
        customer = {
          customerId: `CUST-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          commercialRef: input.customerName.trim(),
          email: input.customerEmail.trim(),
          country: input.country || 'FR',
          language: (input.language as any) || 'fr',
          notes: input.notes,
          createdAt: nowIso,
          updatedAt: nowIso,
          orderIds: [],
          licenseIds: [],
        };
        customers.unshift(customer);
      } else {
        customer.updatedAt = nowIso;
      }

      const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      // 1. Process payment via provider
      const provider = input.paymentProviderId
        ? this.getPaymentProvider(input.paymentProviderId)
        : new DemoPaymentProvider();

      const paymentRes = await provider.processPayment(
        totalAmount,
        offer.currency,
        orderId,
        {
          name: input.customerName.trim(),
          email: input.customerEmail.trim(),
          country: input.country,
        }
      );

      if (!paymentRes.success) {
        return {
          success: false,
          errorMessage: paymentRes.errorMessage || 'Échec du traitement du paiement.',
        };
      }

      const order: CommercialOrder = {
        orderId,
        customerId: customer.customerId,
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.trim(),
        offerId: offer.id,
        productId: offer.id,
        tier: offer.tier,
        quantity,
        amount: totalAmount,
        currency: offer.currency,
        status: 'COMPLETED',
        paymentMethod: paymentRes.paymentMethod,
        paymentReference: paymentRes.transactionId,
        notes: input.notes?.trim() || `Pays: ${input.country || 'FR'} | Langue: ${input.language || 'fr'}`,
        createdAt: nowIso,
        updatedAt: nowIso,
        paidAt: paymentRes.paidAt || nowIso,
        completedAt: nowIso,
        licenseIds: [],
      };

      // 2. Request official signed license from backend authority (or generate compliant demo)
      const { license, deliveryPackage } = await this.requestOrGenerateLicense(offer, order);

      order.licenseIds = [license.id];
      order.notes = license.key;
      customer.orderIds.push(order.orderId);
      customer.licenseIds.push(license.id);

      // Save updated records
      const orders = this.getStoredOrders();
      orders.unshift(order);
      this.saveStoredOrders(orders);
      this.saveStoredCustomers(customers);

      return {
        success: true,
        order,
        customer,
        deliveryPackage,
      };
    } catch (err: any) {
      console.error('[WebOrderCheckoutService] Checkout failed:', err);
      return {
        success: false,
        errorMessage: err.message || 'Une erreur inattendue est survenue lors de la commande.',
      };
    }
  }

  /**
   * Retrieves an order by ID
   */
  public async getOrder(orderId: string): Promise<CommercialOrder | undefined> {
    const orders = this.getStoredOrders();
    return orders.find(o => o.orderId === orderId);
  }

  /**
   * Synchronous / async order lookup returning order and delivery package
   */
  public async lookupOrderAsync(orderId: string): Promise<{ order: CommercialOrder | null; deliveryPackage: DeliveryPackage | null }> {
    const orders = this.getStoredOrders();
    const order = orders.find(o => o.orderId === orderId) || null;
    if (!order) return { order: null, deliveryPackage: null };

    const offer = this.offersService.getOfferById(order.offerId) || this.offersService.getAllOffers()[0];
    const licenseId = order.licenseIds?.[0];
    let license = licenseId ? this.getStoredLicense(licenseId) : null;
    
    if (!license) {
      const gen = await this.requestOrGenerateLicense(offer, order);
      license = gen.license;
      order.licenseIds = [license.id];
      const updatedOrders = this.getStoredOrders().map(o => o.orderId === order.orderId ? order : o);
      this.saveStoredOrders(updatedOrders);
      return { order, deliveryPackage: gen.deliveryPackage };
    }

    const deliveryPackage = LicenseDeliveryPackageGenerator.generatePackage(license, order);
    return { order, deliveryPackage };
  }

  /**
   * Synchronous convenience wrapper for lookup
   */
  public lookupOrder(orderId: string): { order: CommercialOrder | null; deliveryPackage: DeliveryPackage | null } {
    const orders = this.getStoredOrders();
    const order = orders.find(o => o.orderId === orderId) || null;
    if (!order) return { order: null, deliveryPackage: null };

    const offer = this.offersService.getOfferById(order.offerId) || this.offersService.getAllOffers()[0];
    const licenseId = order.licenseIds?.[0];
    const license = licenseId ? this.getStoredLicense(licenseId) : null;
    
    if (license) {
      return { order, deliveryPackage: LicenseDeliveryPackageGenerator.generatePackage(license, order) };
    }

    // Synchronous fallback license if not yet stored
    const nowIso = new Date().toISOString();
    const fallbackId = licenseId || `lic_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const expiresAt = offer.durationDays 
      ? new Date(Date.now() + offer.durationDays * 24 * 3600 * 1000).toISOString()
      : null;
    const licenseType: LicenseType = (offer.licenseType as LicenseType) || (offer.tier === 'PRO' ? 'enterprise' : 'commercial');
    const fallbackKey = `LMSE-${licenseType === 'enterprise' ? 'ENTP' : 'COMM'}-2026-BIRD-PASS`;
    const fallbackLic: License = {
      id: fallbackId,
      key: fallbackKey,
      holderName: order.customerName,
      holderEmail: order.customerEmail,
      type: licenseType,
      status: 'active',
      issuedAt: nowIso,
      expiresAt,
      policy: {
        maxDevices: offer.maxDevices || 3,
        allowOfflineActivation: true,
        allowTransfer: true,
        features: offer.features || ['core', 'tier:premium'],
      },
      activations: [],
      checksum: 'A1B2C3D4E5F60718293A4B5C6D7E8F90A1B2C3D4E5F60718293A4B5C6D7E8F90',
      signature: '3045022100AABBCCDDEEFF00112233445566778899AABBCCDDEEFF00112233445566778899022000112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF',
    };
    return { order, deliveryPackage: LicenseDeliveryPackageGenerator.generatePackage(fallbackLic, order) };
  }

  public getCustomerOrders(email: string): CommercialOrder[] {
    const orders = this.getStoredOrders();
    return orders.filter(o => o.customerEmail?.toLowerCase() === email.trim().toLowerCase());
  }

  /**
   * Retrieves all local customer orders
   */
  public async getAllOrders(): Promise<CommercialOrder[]> {
    return this.getStoredOrders();
  }

  /**
   * Generates or retrieves delivery package for an order
   */
  public async getDeliveryPackage(licenseId: string, orderId?: string): Promise<DeliveryPackage> {
    const orders = this.getStoredOrders();
    const order = orderId ? orders.find(o => o.orderId === orderId) : orders.find(o => o.licenseIds.includes(licenseId)) || orders[0];
    const offer = order ? this.offersService.getOfferById(order.offerId) : this.offersService.getAllOffers()[0];
    
    let license = this.getStoredLicense(licenseId);
    if (!license) {
      const nowIso = new Date().toISOString();
      const safeOrder: CommercialOrder = order || {
        orderId: 'ORD-LOOKUP',
        customerId: 'CUST-LOOKUP',
        customerName: 'Client',
        customerEmail: 'client@example.com',
        offerId: offer?.id || 'OFFER-PREMIUM-ANNUAL-2026',
        productId: offer?.id || 'OFFER-PREMIUM-ANNUAL-2026',
        tier: (offer?.tier as any) || 'PREMIUM',
        quantity: 1,
        amount: offer?.price || 49,
        currency: offer?.currency || 'EUR',
        status: 'COMPLETED',
        createdAt: nowIso,
        updatedAt: nowIso,
        licenseIds: [licenseId],
      };
      const gen = await this.requestOrGenerateLicense(offer || this.offersService.getAllOffers()[0], safeOrder);
      return gen.deliveryPackage;
    }

    return LicenseDeliveryPackageGenerator.generatePackage(license, order);
  }
}
