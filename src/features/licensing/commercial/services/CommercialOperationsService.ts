/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL OPERATIONS SERVICE
 * Core business logic and offline persistence for commercial customers, orders,
 * fulfillment, delivery package generation, and full traceability.
 */

import { assertAdminContext } from '../../../../config/appMode';
import { SubscriptionTier } from '../../../subscription/types/subscription';
import { SubscriptionTierResolver } from '../../../subscription/services/SubscriptionTierResolver';
import { License } from '../../types/licensing';
import { ILicenseRepository } from '../../repositories/ILicenseRepository';
import { LocalStorageLicenseRepository } from '../../repositories/LocalStorageLicenseRepository';
import { CommercialLicenseAdminService } from '../../admin/services/CommercialLicenseAdminService';
import { CommercialOffersService } from './CommercialOffersService';
import { LicenseDeliveryPackageGenerator } from './LicenseDeliveryPackageGenerator';
import {
  CustomerReference,
  CustomerCreationInput,
  CommercialOrder,
  OrderCreationInput,
  OrderStatus,
  OrderFilterState,
  CommercialTraceabilityEvent,
  CommercialEventType,
  LicenseDeliveryPackage,
} from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'bird_academy_commercial_customers',
  ORDERS: 'bird_academy_commercial_orders',
  EVENTS: 'bird_academy_commercial_events',
};

export interface CommercialOperationsStats {
  totalOrders: number;
  totalRevenue: number;
  paidOrdersCount: number;
  completedOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  refundedOrdersCount: number;
  totalCustomers: number;
  totalGeneratedLicenses: number;
  tierRevenueBreakdown: Record<SubscriptionTier, number>;
  orderTierBreakdown: Record<SubscriptionTier, number>;
  fulfillmentRatePercentage: number;
}

export class CommercialOperationsService {
  private static instance: CommercialOperationsService | null = null;
  private licenseRepository: ILicenseRepository;
  private offersService: CommercialOffersService;
  private adminLicenseService: CommercialLicenseAdminService;

  private constructor(licenseRepo?: ILicenseRepository) {
    this.licenseRepository = licenseRepo || new LocalStorageLicenseRepository();
    this.offersService = CommercialOffersService.getInstance();
    this.adminLicenseService = CommercialLicenseAdminService.getInstance(this.licenseRepository);
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

  public static setInstance(instance: CommercialOperationsService): void {
    this.instance = instance;
  }

  public static getInstance(licenseRepo?: ILicenseRepository): CommercialOperationsService {
    if (!this.instance || (licenseRepo && this.instance.licenseRepository !== licenseRepo)) {
      this.instance = new CommercialOperationsService(licenseRepo);
    }
    return this.instance;
  }

  public static resetInstance(): void {
    this.instance = null;
  }

  public getAllOrdersSync(): CommercialOrder[] {
    const storage = this.getStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.ORDERS) : null;
    return raw ? JSON.parse(raw) : [];
  }

  public getLicenseSync(licenseId: string): License | null {
    return (this.licenseRepository as any).getLicenseByIdSync ? (this.licenseRepository as any).getLicenseByIdSync(licenseId) : null;
  }

  // =========================================================================
  // 1. CUSTOMER MANAGEMENT
  // =========================================================================

  public async listCustomers(): Promise<CustomerReference[]> {
    assertAdminContext();
    const storage = this.getStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.CUSTOMERS) : null;
    return raw ? JSON.parse(raw) : [];
  }

  private async saveCustomers(customers: CustomerReference[]): Promise<void> {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }
  }

  public async getCustomer(customerId: string): Promise<CustomerReference | null> {
    const customers = await this.listCustomers();
    return customers.find(c => c.customerId === customerId) || null;
  }

  public async createCustomer(input: CustomerCreationInput): Promise<CustomerReference> {
    assertAdminContext();
    const customers = await this.listCustomers();
    const nowIso = new Date().toISOString();

    const newCustomer: CustomerReference = {
      customerId: `CUST-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      commercialRef: input.commercialRef.trim(),
      email: input.email ? input.email.trim() : undefined,
      country: input.country || 'FR',
      language: input.language || 'fr',
      notes: input.notes,
      createdAt: nowIso,
      updatedAt: nowIso,
      orderIds: [],
      licenseIds: [],
    };

    customers.unshift(newCustomer);
    await this.saveCustomers(customers);

    await this.logCommercialEvent({
      eventType: 'CUSTOMER_CREATED',
      customerId: newCustomer.customerId,
      details: `Création du client commercial "${newCustomer.commercialRef}"`,
      source: 'ADMIN_CONSOLE',
      success: true,
    });

    return newCustomer;
  }

  public async updateCustomer(
    customerId: string,
    input: Partial<CustomerCreationInput>
  ): Promise<CustomerReference> {
    assertAdminContext();
    const customers = await this.listCustomers();
    const index = customers.findIndex(c => c.customerId === customerId);
    if (index === -1) throw new Error(`Client ${customerId} introuvable.`);

    const nowIso = new Date().toISOString();
    const existing = customers[index];

    const updated: CustomerReference = {
      ...existing,
      commercialRef: input.commercialRef ? input.commercialRef.trim() : existing.commercialRef,
      email: input.email !== undefined ? input.email?.trim() : existing.email,
      country: input.country !== undefined ? input.country : existing.country,
      language: input.language !== undefined ? input.language : existing.language,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      updatedAt: nowIso,
    };

    customers[index] = updated;
    await this.saveCustomers(customers);

    await this.logCommercialEvent({
      eventType: 'CUSTOMER_UPDATED',
      customerId: updated.customerId,
      details: `Mise à jour du profil client "${updated.commercialRef}"`,
      source: 'ADMIN_CONSOLE',
      success: true,
    });

    return updated;
  }

  public async searchCustomers(query: string): Promise<CustomerReference[]> {
    const customers = await this.listCustomers();
    const q = query.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter(c => 
      c.commercialRef.toLowerCase().includes(q) ||
      c.customerId.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  }

  public async getCustomerById(customerId: string): Promise<CustomerReference | null> {
    return this.getCustomer(customerId);
  }

  public async findCustomerByEmailOrRef(query: string): Promise<CustomerReference | null> {
    const customers = await this.listCustomers();
    const q = query.trim().toLowerCase();
    return customers.find(c => 
      c.commercialRef.toLowerCase() === q || 
      (c.email && c.email.toLowerCase() === q)
    ) || null;
  }

  public async getAllCustomers(): Promise<CustomerReference[]> {
    return this.listCustomers();
  }

  // =========================================================================
  // 2. ORDER MANAGEMENT & COMMERCIAL WORKFLOWS
  // =========================================================================

  public async listOrders(filter?: Partial<OrderFilterState>): Promise<CommercialOrder[]> {
    assertAdminContext();
    const storage = this.getStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.ORDERS) : null;
    let orders: CommercialOrder[] = raw ? JSON.parse(raw) : [];

    if (!filter) return orders;

    if (filter.tier && filter.tier !== 'ALL') {
      orders = orders.filter(o => o.tier === filter.tier);
    }
    if (filter.status && filter.status !== 'ALL') {
      orders = orders.filter(o => o.status === filter.status);
    }
    if (filter.source && filter.source !== 'ALL') {
      orders = orders.filter(o => o.source === filter.source);
    }
    if (filter.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      orders = orders.filter(o => 
        o.orderId.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerId.toLowerCase().includes(q) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
        o.licenseIds.some(lid => lid.toLowerCase().includes(q))
      );
    }

    if (filter.sortBy) {
      orders.sort((a, b) => {
        let valA: any = a[filter.sortBy!];
        let valB: any = b[filter.sortBy!];
        if (typeof valA === 'string') {
          return filter.sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return filter.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
    }

    return orders;
  }

  private async saveOrders(orders: CommercialOrder[]): Promise<void> {
    const storage = this.getStorage();
    if (storage) {
      storage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  }

  public async getOrder(orderId: string): Promise<CommercialOrder | null> {
    const orders = await this.listOrders();
    return orders.find(o => o.orderId === orderId) || null;
  }

  public async getOrderById(orderId: string): Promise<CommercialOrder | null> {
    return this.getOrder(orderId);
  }

  public async getAllOrders(): Promise<CommercialOrder[]> {
    return this.listOrders();
  }

  public async getOrdersByCustomerId(customerId: string): Promise<CommercialOrder[]> {
    const orders = await this.listOrders();
    return orders.filter(o => o.customerId === customerId);
  }

  public async getOrdersByStatus(status: OrderStatus): Promise<CommercialOrder[]> {
    return this.listOrders({ status });
  }

  public async createOrder(input: OrderCreationInput): Promise<CommercialOrder> {
    assertAdminContext();
    const offer = this.offersService.getOfferById(input.offerId);
    if (!offer) throw new Error(`Offre commerciale ${input.offerId} introuvable.`);

    let customerId = input.customerId;
    let customerName = input.customerName ? input.customerName.trim() : '';

    // Auto-create customer if customerId not provided or doesn't exist
    if (customerId) {
      const existingCust = await this.getCustomer(customerId);
      if (existingCust && !customerName) {
        customerName = existingCust.commercialRef;
      }
    } else if (input.customerEmail) {
      const existingCust = await this.findCustomerByEmailOrRef(input.customerEmail);
      if (existingCust) {
        customerId = existingCust.customerId;
        if (!customerName) customerName = existingCust.commercialRef;
      } else {
        if (!customerName) customerName = 'Client Anonyme';
        const newCust = await this.createCustomer({
          commercialRef: customerName,
          email: input.customerEmail,
        });
        customerId = newCust.customerId;
      }
    } else {
      if (!customerName) {
        customerName = 'Client Anonyme';
      }
      const newCust = await this.createCustomer({
        commercialRef: customerName,
        email: input.customerEmail,
      });
      customerId = newCust.customerId;
    }

    const nowIso = new Date().toISOString();
    const qty = input.quantity && input.quantity > 0 ? input.quantity : 1;
    const totalAmount = offer.price * qty;

    const newOrder: CommercialOrder = {
      orderId: `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      customerId,
      customerName,
      customerEmail: input.customerEmail ? input.customerEmail.trim() : undefined,
      offerId: offer.id,
      productId: `BIRD-ACADEMY-${offer.tier}`,
      tier: offer.tier,
      quantity: qty,
      currency: offer.currency,
      amount: totalAmount,
      status: 'PENDING',
      createdAt: nowIso,
      updatedAt: nowIso,
      licenseIds: [],
      notes: input.notes,
      source: input.source || 'ADMIN_MANUAL',
    };

    const orders = await this.listOrders();
    orders.unshift(newOrder);
    await this.saveOrders(orders);

    // Link order to customer
    const customers = await this.listCustomers();
    const custIdx = customers.findIndex(c => c.customerId === customerId);
    if (custIdx !== -1) {
      customers[custIdx].orderIds.push(newOrder.orderId);
      customers[custIdx].updatedAt = nowIso;
      await this.saveCustomers(customers);
    }

    await this.logCommercialEvent({
      eventType: 'ORDER_CREATED',
      orderId: newOrder.orderId,
      customerId: newOrder.customerId,
      tier: newOrder.tier,
      details: `Création de la commande ${newOrder.orderId} pour l'offre ${offer.name} (${totalAmount} ${offer.currency})`,
      source: newOrder.source || 'commercial-portal',
      success: true,
    });

    if (input.autoFulfill) {
      await this.markOrderPaid(newOrder.orderId);
      const fulfilled = await this.fulfillOrderAndGenerateLicense(newOrder.orderId);
      return fulfilled.order;
    }

    return newOrder;
  }

  public async markOrderPaid(orderId: string): Promise<CommercialOrder> {
    assertAdminContext();
    const orders = await this.listOrders();
    const index = orders.findIndex(o => o.orderId === orderId);
    if (index === -1) throw new Error(`Commande ${orderId} introuvable.`);

    const nowIso = new Date().toISOString();
    const order = orders[index];

    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
      throw new Error(`Impossible de marquer payée une commande avec le statut "${order.status}".`);
    }

    order.status = 'PAID';
    order.paidAt = nowIso;
    order.updatedAt = nowIso;

    orders[index] = order;
    await this.saveOrders(orders);

    await this.logCommercialEvent({
      eventType: 'ORDER_PAID',
      orderId: order.orderId,
      customerId: order.customerId,
      tier: order.tier,
      details: `Paiement enregistré pour la commande ${order.orderId} (${order.amount} ${order.currency})`,
      source: 'ADMIN_CONSOLE',
      success: true,
    });

    return order;
  }

  public async payOrder(
    orderId: string,
    paymentMethod?: any,
    paymentReference?: string
  ): Promise<CommercialOrder> {
    assertAdminContext();
    const orders = await this.listOrders();
    const index = orders.findIndex(o => o.orderId === orderId);
    if (index === -1) throw new Error(`Commande ${orderId} introuvable.`);

    const nowIso = new Date().toISOString();
    const order = orders[index];

    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
      throw new Error(`Impossible de marquer payée une commande avec le statut "${order.status}".`);
    }

    order.status = 'PAID';
    order.paidAt = nowIso;
    order.updatedAt = nowIso;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (paymentReference) order.paymentReference = paymentReference;

    orders[index] = order;
    await this.saveOrders(orders);

    await this.logCommercialEvent({
      eventType: 'ORDER_PAID',
      orderId: order.orderId,
      customerId: order.customerId,
      tier: order.tier,
      details: `Paiement enregistré pour la commande ${order.orderId} (${order.amount} ${order.currency})`,
      source: 'ADMIN_CONSOLE',
      success: true,
    });

    return order;
  }

  public async fulfillOrder(orderId: string): Promise<CommercialOrder> {
    const res = await this.fulfillOrderAndGenerateLicense(orderId);
    return res.order;
  }

  public async fulfillOrderAndGenerateLicense(
    orderId: string
  ): Promise<{ order: CommercialOrder; licenses: License[] }> {
    assertAdminContext();
    const orders = await this.listOrders();
    const index = orders.findIndex(o => o.orderId === orderId);
    if (index === -1) throw new Error(`Commande ${orderId} introuvable.`);

    const order = orders[index];
    const offer = this.offersService.getOfferById(order.offerId);
    if (!offer) throw new Error(`Offre associée ${order.offerId} introuvable.`);

    const generatedLicenses: License[] = [];
    const nowIso = new Date().toISOString();

    for (let i = 0; i < order.quantity; i++) {
      const lic = await this.adminLicenseService.createCommercialLicense({
        tier: offer.tier,
        type: offer.licenseType,
        holderName: order.customerName,
        holderEmail: order.customerEmail,
        durationDays: offer.durationDays,
        maxDevices: offer.maxDevices,
        customFeatures: offer.features,
        notes: `Commande: ${order.orderId} | Offre: ${offer.code}`,
      });

      generatedLicenses.push(lic);
      order.licenseIds.push(lic.id);

      await this.logCommercialEvent({
        eventType: 'LICENSE_ASSIGNED',
        orderId: order.orderId,
        customerId: order.customerId,
        licenseId: lic.id,
        licenseKey: lic.key,
        tier: offer.tier,
        details: `Licence ${lic.key} générée et assignée à la commande ${order.orderId}`,
        source: 'ADMIN_CONSOLE',
        success: true,
      });
    }

    order.status = 'COMPLETED';
    order.completedAt = nowIso;
    order.updatedAt = nowIso;
    order.deliveryPackageGenerated = true;

    orders[index] = order;
    await this.saveOrders(orders);

    // Update customer license list
    const customers = await this.listCustomers();
    const custIdx = customers.findIndex(c => c.customerId === order.customerId);
    if (custIdx !== -1) {
      customers[custIdx].licenseIds.push(...generatedLicenses.map(l => l.id));
      customers[custIdx].updatedAt = nowIso;
      await this.saveCustomers(customers);
    }

    await this.logCommercialEvent({
      eventType: 'ORDER_COMPLETED',
      orderId: order.orderId,
      customerId: order.customerId,
      tier: order.tier,
      details: `Commande ${order.orderId} complétée avec succès (${generatedLicenses.length} licence(s) délivrée(s))`,
      source: 'ADMIN_CONSOLE',
      success: true,
    });

    return { order, licenses: generatedLicenses };
  }

  public async cancelOrder(orderId: string, reason?: string): Promise<CommercialOrder> {
    assertAdminContext();
    const orders = await this.listOrders();
    const index = orders.findIndex(o => o.orderId === orderId);
    if (index === -1) throw new Error(`Commande ${orderId} introuvable.`);

    const order = orders[index];
    if (order.status === 'PAID' || order.status === 'COMPLETED') {
      throw new Error(`Impossible d'annuler une commande déjà payée ou complétée. Veuillez procéder à un remboursement.`);
    }

    const nowIso = new Date().toISOString();

    // If licenses were generated, revoke them
    if (order.licenseIds && order.licenseIds.length > 0) {
      for (const licId of order.licenseIds) {
        try {
          await this.adminLicenseService.revokeLicense(
            licId,
            `Annulation de la commande ${orderId}: ${reason || 'Annulation administrative'}`
          );
        } catch {
          // ignore if already revoked
        }
      }
    }

    order.status = 'CANCELLED';
    order.updatedAt = nowIso;
    if (reason) {
      order.notes = order.notes ? `${order.notes} | Motif annulation: ${reason}` : `Motif annulation: ${reason}`;
    }

    orders[index] = order;
    await this.saveOrders(orders);

    await this.logCommercialEvent({
      eventType: 'ORDER_CANCELLED',
      orderId: order.orderId,
      customerId: order.customerId,
      tier: order.tier,
      details: `Annulation de la commande ${order.orderId}. Motif: ${reason || 'Non spécifié'}`,
      source: 'ADMIN_CONSOLE',
      reason,
      success: true,
    });

    return order;
  }

  public async refundOrder(orderId: string, reason?: string): Promise<CommercialOrder> {
    assertAdminContext();
    const orders = await this.listOrders();
    const index = orders.findIndex(o => o.orderId === orderId);
    if (index === -1) throw new Error(`Commande ${orderId} introuvable.`);

    const order = orders[index];
    if (order.status !== 'PAID' && order.status !== 'COMPLETED') {
      throw new Error(`Seules les commandes payées ou complétées peuvent être remboursées.`);
    }

    const nowIso = new Date().toISOString();

    // Revoke generated licenses upon refund
    if (order.licenseIds && order.licenseIds.length > 0) {
      for (const licId of order.licenseIds) {
        try {
          await this.adminLicenseService.revokeLicense(
            licId,
            `Remboursement de la commande ${orderId}: ${reason || 'Remboursement client'}`
          );
        } catch {
          // ignore
        }
      }
    }

    order.status = 'REFUNDED';
    order.updatedAt = nowIso;
    if (reason) {
      order.notes = order.notes ? `${order.notes} | Motif remboursement: ${reason}` : `Motif remboursement: ${reason}`;
    }

    orders[index] = order;
    await this.saveOrders(orders);

    await this.logCommercialEvent({
      eventType: 'ORDER_REFUNDED',
      orderId: order.orderId,
      customerId: order.customerId,
      tier: order.tier,
      details: `Remboursement de la commande ${order.orderId} (${order.amount} ${order.currency}). Motif: ${reason || 'Non spécifié'}`,
      source: 'ADMIN_CONSOLE',
      reason,
      success: true,
    });

    return order;
  }

  // =========================================================================
  // 3. DELIVERY PACKAGE GENERATION
  // =========================================================================

  public async generateDeliveryPackageForLicense(
    licenseId: string,
    orderId?: string
  ): Promise<LicenseDeliveryPackage> {
    assertAdminContext();
    const license = await this.licenseRepository.getLicenseById(licenseId);
    if (!license) throw new Error(`Licence ${licenseId} introuvable pour la génération du package.`);

    let order: CommercialOrder | undefined;
    if (orderId) {
      order = (await this.getOrder(orderId)) || undefined;
    } else {
      // Look up order referencing this license
      const allOrders = await this.listOrders();
      order = allOrders.find(o => o.licenseIds.includes(licenseId));
    }

    const deliveryPkg = LicenseDeliveryPackageGenerator.generatePackage(license, order);
    const tier = SubscriptionTierResolver.resolve(license);

    await this.logCommercialEvent({
      eventType: 'DELIVERY_PACKAGE_GENERATED',
      licenseId: license.id,
      licenseKey: license.key,
      orderId: order?.orderId,
      customerId: order?.customerId,
      tier,
      details: `Package commercial de livraison généré (${deliveryPkg.files.length} fichiers, ${deliveryPkg.totalSizeBytes} octets)`,
      source: 'ADMIN_CONSOLE',
      success: true,
    });

    return deliveryPkg;
  }

  public async generateDeliveryPackage(
    licenseId: string,
    orderId?: string
  ): Promise<LicenseDeliveryPackage> {
    return this.generateDeliveryPackageForLicense(licenseId, orderId);
  }

  // =========================================================================
  // 4. TRACEABILITY & AUDIT LOGGING
  // =========================================================================

  public async listTraceabilityEvents(limit: number = 100): Promise<CommercialTraceabilityEvent[]> {
    assertAdminContext();
    const storage = this.getStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.EVENTS) : null;
    const events: CommercialTraceabilityEvent[] = raw ? JSON.parse(raw) : [];
    return events.slice(0, limit);
  }

  public async getTraceabilityEvents(limit: number = 100): Promise<CommercialTraceabilityEvent[]> {
    return this.listTraceabilityEvents(limit);
  }

  public async logCommercialEvent(
    eventInput: Omit<CommercialTraceabilityEvent, 'eventId' | 'timestamp'>
  ): Promise<CommercialTraceabilityEvent> {
    const storage = this.getStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.EVENTS) : null;
    const events: CommercialTraceabilityEvent[] = raw ? JSON.parse(raw) : [];

    const newEvent: CommercialTraceabilityEvent = {
      ...eventInput,
      eventId: `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };

    events.unshift(newEvent);
    // Keep last 500 events
    const trimmed = events.slice(0, 500);
    if (storage) {
      storage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(trimmed));
    }

    return newEvent;
  }

  // =========================================================================
  // 5. COMMERCIAL DASHBOARD STATISTICS & KPIS
  // =========================================================================

  public async getOperationsStats(): Promise<CommercialOperationsStats> {
    assertAdminContext();
    const orders = await this.listOrders();
    const customers = await this.listCustomers();
    const allLicenses = await this.licenseRepository.getAllLicenses();

    let totalRevenue = 0;
    let paidOrdersCount = 0;
    let completedOrdersCount = 0;
    let pendingOrdersCount = 0;
    let cancelledOrdersCount = 0;
    let refundedOrdersCount = 0;

    const tierRevenueBreakdown: Record<SubscriptionTier, number> = {
      FREE: 0,
      PREMIUM: 0,
      PRO: 0,
    };

    const orderTierBreakdown: Record<SubscriptionTier, number> = {
      FREE: 0,
      PREMIUM: 0,
      PRO: 0,
    };

    for (const ord of orders) {
      if (orderTierBreakdown[ord.tier] !== undefined) {
        orderTierBreakdown[ord.tier] += ord.quantity;
      }

      if (ord.status === 'PAID' || ord.status === 'COMPLETED') {
        totalRevenue += ord.amount;
        if (tierRevenueBreakdown[ord.tier] !== undefined) {
          tierRevenueBreakdown[ord.tier] += ord.amount;
        }
      }

      if (ord.status === 'PAID') paidOrdersCount++;
      else if (ord.status === 'COMPLETED') completedOrdersCount++;
      else if (ord.status === 'PENDING') pendingOrdersCount++;
      else if (ord.status === 'CANCELLED') cancelledOrdersCount++;
      else if (ord.status === 'REFUNDED') refundedOrdersCount++;
    }

    const totalOrders = orders.length;
    const fulfilledOrders = paidOrdersCount + completedOrdersCount;
    const fulfillmentRatePercentage = totalOrders > 0 
      ? Math.round((fulfilledOrders / totalOrders) * 100) 
      : 100;

    return {
      totalOrders,
      totalRevenue,
      paidOrdersCount,
      completedOrdersCount,
      pendingOrdersCount,
      cancelledOrdersCount,
      refundedOrdersCount,
      totalCustomers: customers.length,
      totalGeneratedLicenses: allLicenses.length,
      tierRevenueBreakdown,
      orderTierBreakdown,
      fulfillmentRatePercentage,
    };
  }

  public async calculateOperationsStats(): Promise<CommercialOperationsStats> {
    return this.getOperationsStats();
  }

  // =========================================================================
  // 6. BACKUP, EXPORT & RESTORE
  // =========================================================================

  public async exportCommercialArchive(): Promise<string> {
    assertAdminContext();
    const customers = await this.listCustomers();
    const orders = await this.listOrders();
    const events = await this.listTraceabilityEvents(500);

    const payload = {
      schemaVersion: '1.3.6',
      exportVersion: 'LMSE_COMMERCIAL_ARCHIVE_V1',
      exportedAt: new Date().toISOString(),
      customers,
      orders,
      events,
    };

    return JSON.stringify(payload, null, 2);
  }

  public async importCommercialArchive(
    jsonStr: string
  ): Promise<{ success: boolean; message: string; customersCount?: number; ordersCount?: number; eventsCount?: number }> {
    try {
      assertAdminContext();
      const parsed = JSON.parse(jsonStr);
      if (!parsed || !parsed.customers || !parsed.orders) {
        return { success: false, message: 'Format d\'archive commerciale invalide: clients ou commandes manquants.' };
      }

      await this.saveCustomers(parsed.customers);
      await this.saveOrders(parsed.orders);
      const storage = this.getStorage();
      if (parsed.events && storage) {
        storage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(parsed.events));
      }

      return {
        success: true,
        message: 'Archive commerciale importée avec succès.',
        customersCount: parsed.customers.length,
        ordersCount: parsed.orders.length,
        eventsCount: parsed.events ? parsed.events.length : 0,
      };
    } catch (e) {
      return {
        success: false,
        message: `Erreur lors de l'importation de l'archive: ${(e as Error).message || 'JSON invalide'}`,
      };
    }
  }

  public async clearAllCommercialData(): Promise<void> {
    const storage = this.getStorage();
    if (storage) {
      storage.removeItem(STORAGE_KEYS.CUSTOMERS);
      storage.removeItem(STORAGE_KEYS.ORDERS);
      storage.removeItem(STORAGE_KEYS.EVENTS);
    }
  }

  public async clearAllData(): Promise<void> {
    return this.clearAllCommercialData();
  }
}
