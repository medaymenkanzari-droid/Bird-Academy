/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — ORDER CONFIRMATION & LOOKUP PAGE
 */

import React, { useState, useEffect } from 'react';
import { useWebLanguage } from '../i18n';
import { WebRoute } from '../types';
import { WebOrderCheckoutService } from '../services/WebOrderCheckoutService';
import { CommercialOrder } from '../../licensing/commercial/types/commercialOrder';
import { DeliveryPackage } from '../../licensing/commercial/types/deliveryPackage';
import { DeliveryKitDownloader } from '../components/checkout/DeliveryKitDownloader';
import { Search, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export interface WebOrderConfirmationPageProps {
  orderId?: string;
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebOrderConfirmationPage: React.FC<WebOrderConfirmationPageProps> = ({
  orderId: initialOrderId,
  onNavigate,
}) => {
  const { t, isRtl } = useWebLanguage();
  const checkoutService = WebOrderCheckoutService.getInstance();

  const [searchId, setSearchId] = useState(initialOrderId || '');
  const [order, setOrder] = useState<CommercialOrder | null>(null);
  const [deliveryPackage, setDeliveryPackage] = useState<DeliveryPackage | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      handleLookup(initialOrderId);
    }
  }, [initialOrderId]);

  const handleLookup = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const foundOrder = await checkoutService.getOrder(idToSearch.trim());
      if (foundOrder) {
        setOrder(foundOrder);
        if (foundOrder.licenseIds && foundOrder.licenseIds.length > 0) {
          const pkg = await checkoutService.getDeliveryPackage(
            foundOrder.licenseIds[0],
            foundOrder.orderId
          );
          setDeliveryPackage(pkg);
        }
      } else {
        setOrder(null);
        setDeliveryPackage(null);
      }
    } catch (e) {
      console.error(e);
      setOrder(null);
      setDeliveryPackage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10"
      data-testid="web-order-confirmation-page"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
          Suivi de Commande & Livraison
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Rechercher une Commande & Télécharger le Kit
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Saisissez votre numéro de commande pour récupérer votre kit de licence LMSE 5 fichiers.
        </p>
      </div>

      {/* Lookup Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLookup(searchId);
        }}
        className="flex gap-2 max-w-lg mx-auto"
      >
        <input
          type="text"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Ex: ORD-20260830-XXXX"
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          data-testid="order-lookup-input"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          data-testid="order-lookup-btn"
        >
          <Search className="w-4 h-4" />
          <span>Rechercher</span>
        </button>
      </form>

      {loading && (
        <div className="text-center text-xs text-slate-500 py-6">{t('common.loading')}</div>
      )}

      {/* Result: Order Found */}
      {!loading && order && deliveryPackage && (
        <div className="space-y-6" data-testid="order-lookup-result-found">
          <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                  Commande N° {order.orderId}
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-300">
                  Statut : {order.status} • Montant : {order.amount.toFixed(2)} {order.currency}
                </span>
              </div>
            </div>
          </div>

          <DeliveryKitDownloader
            deliveryPackage={deliveryPackage}
            licenseKey={order.notes}
          />
        </div>
      )}

      {/* Result: Not Found */}
      {!loading && searched && !order && (
        <div
          className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-3"
          data-testid="order-lookup-result-not-found"
        >
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Aucune commande trouvée pour cette référence
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Vérifiez l'identifiant saisi ou passez une nouvelle commande pour obtenir une licence.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('pricing')}
            className="mt-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer"
          >
            Voir les offres
          </button>
        </div>
      )}
    </div>
  );
};
