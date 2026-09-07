/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL ORDER DETAILS MODAL
 * Forensic and operational drawer displaying complete order information and linked licenses.
 */

import React from 'react';
import { CommercialOrder } from '../types/commercialOrder';
import { LicenseTierBadge } from '../../admin/components/LicenseTierBadge';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppModal,
  AppButton,
  AppCard,
  AppBadge,
} from '../../../../components/design-system';
import {
  ShoppingBag,
  CreditCard,
  PackageCheck,
  FileBox,
  Key,
  User,
  Calendar,
  DollarSign,
  XCircle,
  RotateCcw,
} from 'lucide-react';

export interface CommercialOrderDetailsModalProps {
  order: CommercialOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onPayOrder: (orderId: string) => void;
  onFulfillOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onRefundOrder: (orderId: string) => void;
  onOpenDeliveryPackage: (licenseId: string, orderId: string) => void;
}

export const CommercialOrderDetailsModal: React.FC<CommercialOrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onPayOrder,
  onFulfillOrder,
  onCancelOrder,
  onRefundOrder,
  onOpenDeliveryPackage,
}) => {
  const { isRtl } = useLanguage();
  if (!order) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Détails Commande — ${order.orderId}`}
      size="lg"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="commercial-order-details-modal">
        {/* Header Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-slate-900 dark:text-white font-mono text-sm">
                  {order.orderId}
                </h4>
                <LicenseTierBadge tier={order.tier} size="sm" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Client : <strong>{order.customerName}</strong>
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {order.amount.toFixed(2)} {order.currency}
            </span>
            <span className="text-xs text-slate-400 block font-semibold">
              Statut : {order.status}
            </span>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <AppCard className="p-3 space-y-1.5 bg-white dark:bg-slate-900">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Informations Commerciales
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Produit</span>
              <span className="font-semibold text-slate-900 dark:text-white">{order.productId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Offre ID</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{order.offerId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Quantité</span>
              <span className="font-semibold text-slate-900 dark:text-white">{order.quantity} licence(s)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Canal</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{order.source}</span>
            </div>
          </AppCard>

          <AppCard className="p-3 space-y-1.5 bg-white dark:bg-slate-900">
            <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              Horodatage & Suivi
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Date Création</span>
              <span className="font-semibold text-slate-900 dark:text-white">{new Date(order.createdAt).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Date Paiement</span>
              <span className="font-semibold text-slate-900 dark:text-white">{order.paidAt ? new Date(order.paidAt).toLocaleString('fr-FR') : 'Non payée'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Date Complétion</span>
              <span className="font-semibold text-slate-900 dark:text-white">{order.completedAt ? new Date(order.completedAt).toLocaleString('fr-FR') : 'En attente'}</span>
            </div>
          </AppCard>
        </div>

        {/* Associated Licenses */}
        <div className="space-y-2">
          <h5 className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
            <Key className="w-4 h-4 text-indigo-500" />
            Licences Cryptographiques Associées ({order.licenseIds.length})
          </h5>

          {order.licenseIds.length > 0 ? (
            <div className="space-y-2">
              {order.licenseIds.map((licId, idx) => (
                <AppCard key={idx} className="p-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 font-mono text-xs text-slate-900 dark:text-white font-bold">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{licId}</span>
                  </div>
                  <AppButton
                    variant="primary"
                    size="sm"
                    onClick={() => onOpenDeliveryPackage(licId, order.orderId)}
                    data-testid={`open-pkg-btn-${licId}`}
                  >
                    <FileBox className="w-3.5 h-3.5 mr-1" />
                    Kit de Livraison
                  </AppButton>
                </AppCard>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Aucune licence n'a encore été générée pour cette commande.
            </p>
          )}
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex gap-2">
            {order.status === 'PENDING' && (
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => { onPayOrder(order.orderId); onClose(); }}
                data-testid="modal-pay-order-btn"
              >
                <CreditCard className="w-4 h-4 mr-1.5" />
                Marquer Payée
              </AppButton>
            )}

            {(order.status === 'PENDING' || order.status === 'PAID') && (
              <AppButton
                variant="primary"
                size="sm"
                onClick={() => { onFulfillOrder(order.orderId); onClose(); }}
                data-testid="modal-fulfill-order-btn"
              >
                <PackageCheck className="w-4 h-4 mr-1.5" />
                Délivrer Licences
              </AppButton>
            )}

            {order.status === 'PENDING' && (
              <AppButton
                variant="outline"
                size="sm"
                onClick={() => { onCancelOrder(order.orderId); onClose(); }}
                data-testid="modal-cancel-order-btn"
              >
                <XCircle className="w-4 h-4 mr-1 text-rose-500" />
                Annuler
              </AppButton>
            )}

            {(order.status === 'PAID' || order.status === 'COMPLETED') && (
              <AppButton
                variant="outline"
                size="sm"
                onClick={() => { onRefundOrder(order.orderId); onClose(); }}
                data-testid="modal-refund-order-btn"
              >
                <RotateCcw className="w-4 h-4 mr-1 text-amber-500" />
                Rembourser
              </AppButton>
            )}
          </div>

          <AppButton variant="outline" size="sm" onClick={onClose}>
            Fermer
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
