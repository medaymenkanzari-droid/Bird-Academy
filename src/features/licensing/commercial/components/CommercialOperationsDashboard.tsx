/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL OPERATIONS DASHBOARD
 * Executive metrics for commercial revenue, order fulfillment, customer volume, and sales by tier.
 */

import React from 'react';
import { CommercialOperationsStats } from '../services/CommercialOperationsService';
import { CommercialOrder } from '../types/commercialOrder';
import { LicenseTierBadge } from '../../admin/components/LicenseTierBadge';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppCard,
  AppButton,
  AppBadge,
} from '../../../../components/design-system';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Key,
  CheckCircle,
  Clock,
  TrendingUp,
  Percent,
  Plus,
  PackageCheck,
  UserPlus,
} from 'lucide-react';

export interface CommercialOperationsDashboardProps {
  stats: CommercialOperationsStats | null;
  recentOrders: CommercialOrder[];
  onOpenCreateOrder: () => void;
  onOpenCreateCustomer: () => void;
  onInspectOrder: (order: CommercialOrder) => void;
}

export const CommercialOperationsDashboard: React.FC<CommercialOperationsDashboardProps> = ({
  stats,
  recentOrders,
  onOpenCreateOrder,
  onOpenCreateCustomer,
  onInspectOrder,
}) => {
  const { isRtl } = useLanguage();

  if (!stats) return null;

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'} data-testid="commercial-operations-dashboard">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Tableau de Bord des Opérations Commerciales
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Suivi des ventes, délivrance de licences et gestion de la clientèle.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AppButton
            variant="primary"
            size="sm"
            onClick={onOpenCreateOrder}
            data-testid="dashboard-create-order-btn"
          >
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            Nouvelle Commande
          </AppButton>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Revenue */}
        <AppCard className="p-4 flex items-center justify-between border-l-4 border-l-emerald-500 bg-white dark:bg-slate-900" data-testid="kpi-total-revenue">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Chiffre d'Affaires
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalRevenue.toFixed(2)} €
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
              {stats.paidOrdersCount + stats.completedOrdersCount} commande(s) payée(s)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </AppCard>

        {/* 2. Total Orders */}
        <AppCard className="p-4 flex items-center justify-between border-l-4 border-l-indigo-500 bg-white dark:bg-slate-900" data-testid="kpi-total-orders">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Commandes Totales
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalOrders}
            </div>
            <span className="text-[11px] text-slate-400">
              {stats.pendingOrdersCount} en attente | {stats.completedOrdersCount} traitée(s)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </AppCard>

        {/* 3. Customers */}
        <AppCard className="p-4 flex items-center justify-between border-l-4 border-l-blue-500 bg-white dark:bg-slate-900" data-testid="kpi-total-customers">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Clients Enregistrés
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.totalCustomers}
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">
              Base clients 100% isolée
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </AppCard>

        {/* 4. Fulfillment Rate */}
        <AppCard className="p-4 flex items-center justify-between border-l-4 border-l-purple-500 bg-white dark:bg-slate-900" data-testid="kpi-fulfillment-rate">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Taux de Délivrance
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.fulfillmentRatePercentage} %
            </div>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
              {stats.totalGeneratedLicenses} licence(s) générée(s)
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </AppCard>
      </div>

      {/* Tier Revenue & Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* PRO */}
        <AppCard className="p-4 space-y-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <LicenseTierBadge tier="PRO" size="md" />
            <span className="text-xs font-mono font-bold text-slate-400">
              {stats.orderTierBreakdown.PRO} cmd
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {stats.tierRevenueBreakdown.PRO.toFixed(2)} €
          </div>
          <p className="text-[11px] text-slate-500">
            Édition Enterprise & Intelligence Aviaire complète
          </p>
        </AppCard>

        {/* PREMIUM */}
        <AppCard className="p-4 space-y-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <LicenseTierBadge tier="PREMIUM" size="md" />
            <span className="text-xs font-mono font-bold text-slate-400">
              {stats.orderTierBreakdown.PREMIUM} cmd
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {stats.tierRevenueBreakdown.PREMIUM.toFixed(2)} €
          </div>
          <p className="text-[11px] text-slate-500">
            Édition Éleveur Confirmé & Registre étendu
          </p>
        </AppCard>

        {/* FREE */}
        <AppCard className="p-4 space-y-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <LicenseTierBadge tier="FREE" size="md" />
            <span className="text-xs font-mono font-bold text-slate-400">
              {stats.orderTierBreakdown.FREE} cmd
            </span>
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            0.00 €
          </div>
          <p className="text-[11px] text-slate-500">
            Édition Découverte & Essai communautaire
          </p>
        </AppCard>
      </div>

      {/* Recent Orders Preview */}
      {recentOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Commandes Récentes ({recentOrders.slice(0, 5).length})
            </h4>
          </div>

          <div className="space-y-2">
            {recentOrders.slice(0, 5).map((ord) => (
              <AppCard
                key={ord.orderId}
                className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => onInspectOrder(ord)}
                data-testid={`recent-order-${ord.orderId}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    {ord.orderId}
                  </span>
                  <LicenseTierBadge tier={ord.tier} size="sm" />
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    {ord.customerName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {ord.amount.toFixed(2)} {ord.currency}
                  </span>
                  <AppBadge variant={ord.status === 'COMPLETED' ? 'success' : ord.status === 'PAID' ? 'accent' : 'warning'} size="sm">
                    {ord.status}
                  </AppBadge>
                </div>
              </AppCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
