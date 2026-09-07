/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL ORDER LIST COMPONENT
 * Interactive table displaying orders with status management, fulfillment, and packaging.
 */

import React from 'react';
import { CommercialOrder, OrderStatus } from '../types/commercialOrder';
import { LicenseTierBadge } from '../../admin/components/LicenseTierBadge';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppCard,
  AppButton,
  AppBadge,
} from '../../../../components/design-system';
import {
  ShoppingBag,
  CheckCircle,
  CreditCard,
  PackageCheck,
  FileBox,
  Eye,
  XCircle,
  RotateCcw,
  Clock,
  AlertCircle,
  User,
} from 'lucide-react';

export interface CommercialOrderListProps {
  orders: CommercialOrder[];
  onInspectOrder: (order: CommercialOrder) => void;
  onPayOrder: (orderId: string) => void;
  onFulfillOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onRefundOrder: (orderId: string) => void;
  onOpenDeliveryPackage: (licenseId: string, orderId: string) => void;
}

export const CommercialOrderList: React.FC<CommercialOrderListProps> = ({
  orders,
  onInspectOrder,
  onPayOrder,
  onFulfillOrder,
  onCancelOrder,
  onRefundOrder,
  onOpenDeliveryPackage,
}) => {
  const { isRtl } = useLanguage();

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <AppBadge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1 inline" />COMPLÉTÉE</AppBadge>;
      case 'PAID':
        return <AppBadge variant="accent" size="sm"><CreditCard className="w-3 h-3 mr-1 inline" />PAYÉE</AppBadge>;
      case 'PENDING':
        return <AppBadge variant="warning" size="sm"><Clock className="w-3 h-3 mr-1 inline" />EN ATTENTE</AppBadge>;
      case 'CANCELLED':
        return <AppBadge variant="danger" size="sm"><XCircle className="w-3 h-3 mr-1 inline" />ANNULÉE</AppBadge>;
      case 'REFUNDED':
        return <AppBadge variant="danger" size="sm"><RotateCcw className="w-3 h-3 mr-1 inline" />REMBOURSÉE</AppBadge>;
      case 'FAILED':
        return <AppBadge variant="danger" size="sm"><AlertCircle className="w-3 h-3 mr-1 inline" />ÉCHEC</AppBadge>;
      default:
        return <AppBadge variant="secondary" size="sm">{status}</AppBadge>;
    }
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="commercial-order-list">
      {orders.length === 0 ? (
        <AppCard className="p-8 text-center" data-testid="orders-empty-state">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
            Aucune commande enregistrée
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Les commandes commerciales créées ou passées apparaîtront dans cette liste.
          </p>
        </AppCard>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Commande</th>
              <th className="px-4 py-3">Client / Titulaire</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Licences</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((order) => (
              <tr
                key={order.orderId}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                data-testid={`order-row-${order.orderId}`}
              >
                {/* Order ID */}
                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                  {order.orderId}
                </td>

                {/* Customer */}
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {order.customerName}
                  </div>
                  {order.customerEmail && (
                    <div className="text-[11px] text-slate-400">
                      {order.customerEmail}
                    </div>
                  )}
                </td>

                {/* Tier */}
                <td className="px-4 py-3">
                  <LicenseTierBadge tier={order.tier} size="sm" />
                </td>

                {/* Amount */}
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                  {order.amount.toFixed(2)} {order.currency}
                  {order.quantity > 1 && (
                    <span className="text-[10px] text-slate-400 block">
                      (Qté: {order.quantity})
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {getStatusBadge(order.status)}
                </td>

                {/* Licenses */}
                <td className="px-4 py-3 font-mono text-[11px]">
                  {order.licenseIds.length > 0 ? (
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {order.licenseIds.length} générée(s)
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap text-[11px]">
                  {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    {/* Pay button for PENDING */}
                    {order.status === 'PENDING' && (
                      <AppButton
                        variant="secondary"
                        size="sm"
                        onClick={() => onPayOrder(order.orderId)}
                        data-testid={`pay-order-${order.orderId}`}
                        title="Marquer Payée"
                      >
                        <CreditCard className="w-3.5 h-3.5 mr-1" />
                        Payer
                      </AppButton>
                    )}

                    {/* Fulfill button for PENDING or PAID */}
                    {(order.status === 'PENDING' || order.status === 'PAID') && (
                      <AppButton
                        variant="primary"
                        size="sm"
                        onClick={() => onFulfillOrder(order.orderId)}
                        data-testid={`fulfill-order-${order.orderId}`}
                        title="Délivrer et Générer la Licence"
                      >
                        <PackageCheck className="w-3.5 h-3.5 mr-1" />
                        Délivrer
                      </AppButton>
                    )}

                    {/* Delivery Package Button */}
                    {order.licenseIds.length > 0 && (
                      <AppButton
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenDeliveryPackage(order.licenseIds[0], order.orderId)}
                        data-testid={`delivery-pkg-order-${order.orderId}`}
                        title="Kit de Livraison"
                      >
                        <FileBox className="w-3.5 h-3.5 text-indigo-500" />
                      </AppButton>
                    )}

                    {/* Inspect Details */}
                    <AppButton
                      variant="outline"
                      size="sm"
                      onClick={() => onInspectOrder(order)}
                      data-testid={`inspect-order-${order.orderId}`}
                      title="Inspecter la Commande"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                    </AppButton>

                    {/* Cancel / Refund */}
                    {order.status === 'PENDING' && (
                      <AppButton
                        variant="outline"
                        size="sm"
                        onClick={() => onCancelOrder(order.orderId)}
                        data-testid={`cancel-order-${order.orderId}`}
                        title="Annuler"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      </AppButton>
                    )}

                    {(order.status === 'PAID' || order.status === 'COMPLETED') && (
                      <AppButton
                        variant="outline"
                        size="sm"
                        onClick={() => onRefundOrder(order.orderId)}
                        data-testid={`refund-order-${order.orderId}`}
                        title="Rembourser"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                      </AppButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
};
