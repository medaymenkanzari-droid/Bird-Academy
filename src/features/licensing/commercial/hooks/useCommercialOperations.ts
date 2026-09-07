/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — USE COMMERCIAL OPERATIONS HOOK
 * Master React hook managing state, real-time filtering, and modals for commercial operations.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  CommercialOrder,
  OrderCreationInput,
  OrderFilterState,
  CustomerReference,
  CustomerCreationInput,
  CommercialOffer,
  CommercialTraceabilityEvent,
  LicenseDeliveryPackage,
} from '../types';
import { CommercialOperationsService, CommercialOperationsStats } from '../services/CommercialOperationsService';
import { CommercialOffersService } from '../services/CommercialOffersService';

export function useCommercialOperations() {
  const [orders, setOrders] = useState<CommercialOrder[]>([]);
  const [customers, setCustomers] = useState<CustomerReference[]>([]);
  const [offers, setOffers] = useState<CommercialOffer[]>([]);
  const [events, setEvents] = useState<CommercialTraceabilityEvent[]>([]);
  const [stats, setStats] = useState<CommercialOperationsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    type: 'success' | 'warning' | 'danger' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Dialog & Inspection States
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [inspectOrder, setInspectOrder] = useState<CommercialOrder | null>(null);
  const [inspectCustomer, setInspectCustomer] = useState<CustomerReference | null>(null);
  const [deliveryPackage, setDeliveryPackage] = useState<LicenseDeliveryPackage | null>(null);

  // Order Filters State
  const [orderFilter, setOrderFilter] = useState<OrderFilterState>({
    searchQuery: '',
    tier: 'ALL',
    status: 'ALL',
    source: 'ALL',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Customer Filter Query
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const opsService = CommercialOperationsService.getInstance();
      const offersService = CommercialOffersService.getInstance();

      const [allOrders, allCustomers, allEvents, opStats] = await Promise.all([
        opsService.listOrders(orderFilter),
        opsService.listCustomers(),
        opsService.listTraceabilityEvents(100),
        opsService.getOperationsStats(),
      ]);

      setOrders(allOrders);
      setCustomers(allCustomers);
      setEvents(allEvents);
      setStats(opStats);
      setOffers(offersService.getAllOffers());
    } catch (err) {
      console.error('[COMMERCIAL_OPS_ERROR] Refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }, [orderFilter]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Order Actions
  const handleCreateOrder = async (input: OrderCreationInput) => {
    const opsService = CommercialOperationsService.getInstance();
    const created = await opsService.createOrder(input);
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Commande Créée',
      message: `La commande ${created.orderId} pour ${created.customerName} a été enregistrée.`,
    });
    return created;
  };

  const handlePayOrder = async (orderId: string) => {
    const opsService = CommercialOperationsService.getInstance();
    const paid = await opsService.markOrderPaid(orderId);
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Paiement Enregistré',
      message: `La commande ${paid.orderId} est marquée PAYÉE.`,
    });
    return paid;
  };

  const handleFulfillOrder = async (orderId: string) => {
    const opsService = CommercialOperationsService.getInstance();
    const result = await opsService.fulfillOrderAndGenerateLicense(orderId);
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Commande Délivrée',
      message: `${result.licenses.length} licence(s) générée(s) pour la commande ${orderId}.`,
    });
    // Automatically open delivery package modal
    const pkg = await opsService.generateDeliveryPackageForLicense(result.licenses[0].id, orderId);
    setDeliveryPackage(pkg);
    return result;
  };

  const handleCancelOrder = async (orderId: string, reason?: string) => {
    const opsService = CommercialOperationsService.getInstance();
    const cancelled = await opsService.cancelOrder(orderId, reason);
    await refreshData();
    setAlert({
      type: 'warning',
      title: 'Commande Annulée',
      message: `La commande ${cancelled.orderId} a été annulée.`,
    });
    return cancelled;
  };

  const handleRefundOrder = async (orderId: string, reason?: string) => {
    const opsService = CommercialOperationsService.getInstance();
    const refunded = await opsService.refundOrder(orderId, reason);
    await refreshData();
    setAlert({
      type: 'danger',
      title: 'Commande Remboursée',
      message: `La commande ${refunded.orderId} a été remboursée et les licences révoquées.`,
    });
    return refunded;
  };

  // Customer Actions
  const handleCreateCustomer = async (input: CustomerCreationInput) => {
    const opsService = CommercialOperationsService.getInstance();
    const created = await opsService.createCustomer(input);
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Client Enregistré',
      message: `Le client ${created.commercialRef} a été créé.`,
    });
    return created;
  };

  const handleUpdateCustomer = async (customerId: string, input: Partial<CustomerCreationInput>) => {
    const opsService = CommercialOperationsService.getInstance();
    const updated = await opsService.updateCustomer(customerId, input);
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Profil Client Mis à Jour',
      message: `Les informations de ${updated.commercialRef} ont été actualisées.`,
    });
    return updated;
  };

  // Delivery Package Actions
  const handleGenerateDeliveryPackage = async (licenseId: string, orderId?: string) => {
    const opsService = CommercialOperationsService.getInstance();
    const pkg = await opsService.generateDeliveryPackageForLicense(licenseId, orderId);
    setDeliveryPackage(pkg);
    return pkg;
  };

  // Backup Actions
  const handleExportCommercialArchive = async () => {
    const opsService = CommercialOperationsService.getInstance();
    const jsonStr = await opsService.exportCommercialArchive();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lmse_commercial_ops_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setAlert({
      type: 'success',
      title: 'Exportation Réussie',
      message: 'L\'archive des opérations commerciales a été téléchargée.',
    });
  };

  const handleImportCommercialArchive = async (jsonStr: string) => {
    const opsService = CommercialOperationsService.getInstance();
    const res = await opsService.importCommercialArchive(jsonStr);
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Importation Réussie',
      message: `${res.ordersCount} commandes et ${res.customersCount} clients importés.`,
    });
  };

  // Filtered Customers
  const filteredCustomers = customers.filter(c => {
    if (!customerSearchQuery.trim()) return true;
    const q = customerSearchQuery.trim().toLowerCase();
    return (
      c.commercialRef.toLowerCase().includes(q) ||
      c.customerId.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  return {
    orders,
    customers,
    filteredCustomers,
    offers,
    events,
    stats,
    loading,
    alert,
    setAlert,
    orderFilter,
    setOrderFilter,
    customerSearchQuery,
    setCustomerSearchQuery,
    refreshData,
    isCreateOrderOpen,
    setIsCreateOrderOpen,
    inspectOrder,
    setInspectOrder,
    inspectCustomer,
    setInspectCustomer,
    deliveryPackage,
    setDeliveryPackage,
    handleCreateOrder,
    handlePayOrder,
    handleFulfillOrder,
    handleCancelOrder,
    handleRefundOrder,
    handleCreateCustomer,
    handleUpdateCustomer,
    handleGenerateDeliveryPackage,
    handleExportCommercialArchive,
    handleImportCommercialArchive,
  };
}
