/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — ACCOUNT PAGE
 */

import React, { useState, useEffect } from 'react';
import { useWebLanguage } from '../i18n';
import { WebRoute } from '../types';
import { WebOrderCheckoutService } from '../services/WebOrderCheckoutService';
import { CommercialOrder } from '../../licensing/commercial/types/commercialOrder';
import { DeliveryPackage } from '../../licensing/commercial/types/deliveryPackage';
import { DeliveryKitDownloader } from '../components/checkout/DeliveryKitDownloader';
import { LanguageSelector } from '../components/layout/LanguageSelector';
import { CurrencySelector } from '../components/layout/CurrencySelector';
import { 
  User, ShoppingBag, Key, Download, CheckCircle2, 
  Clock, ShieldCheck, ArrowRight, ArrowLeft, HardDrive 
} from 'lucide-react';

export interface WebAccountPageProps {
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebAccountPage: React.FC<WebAccountPageProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const checkoutService = WebOrderCheckoutService.getInstance();
  const [orders, setOrders] = useState<CommercialOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CommercialOrder | null>(null);
  const [deliveryPackage, setDeliveryPackage] = useState<DeliveryPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const allOrders = await checkoutService.getAllOrders();
        setOrders(allOrders);
        if (allOrders.length > 0) {
          const first = allOrders[0];
          setSelectedOrder(first);
          if (first.licenseIds && first.licenseIds.length > 0) {
            const pkg = await checkoutService.getDeliveryPackage(
              first.licenseIds[0],
              first.orderId
            );
            setDeliveryPackage(pkg);
          }
        }
      } catch (e) {
        console.error('Error loading account orders:', e);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleSelectOrder = async (ord: CommercialOrder) => {
    setSelectedOrder(ord);
    if (ord.licenseIds && ord.licenseIds.length > 0) {
      const pkg = await checkoutService.getDeliveryPackage(
        ord.licenseIds[0],
        ord.orderId
      );
      setDeliveryPackage(pkg);
    } else {
      setDeliveryPackage(null);
    }
  };

  return (
    <div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12"
      data-testid="web-account-page"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('accountPage.title')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('accountPage.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Préférences :</span>
          <LanguageSelector variant="header" />
          <CurrencySelector />
        </div>
      </div>

      {/* Account Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Orders List */}
        <div className="space-y-4 lg:col-span-1">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-500" />
            <span>{t('accountPage.myOrders')} ({orders.length})</span>
          </h2>

          {loading ? (
            <div className="text-xs text-slate-500">{t('common.loading')}</div>
          ) : orders.length === 0 ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <p className="text-xs text-slate-500">{t('accountPage.noOrders')}</p>
              <button
                type="button"
                onClick={() => onNavigate('pricing')}
                className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Découvrir les offres
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {orders.map((ord) => {
                const isSelected = selectedOrder?.orderId === ord.orderId;
                return (
                  <div
                    key={ord.orderId}
                    onClick={() => handleSelectOrder(ord)}
                    className={`p-4 rounded-2xl border transition cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    data-testid={`account-order-item-${ord.orderId}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {ord.orderId}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
                        {ord.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {ord.amount.toFixed(2)} {ord.currency}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Order Details & Delivery Kit */}
        <div className="space-y-6 lg:col-span-2">
          {selectedOrder && deliveryPackage ? (
            <div className="space-y-6" data-testid="account-selected-order-details">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Commande {selectedOrder.orderId}
                    </h3>
                    <span className="text-xs text-slate-500">
                      Client : {selectedOrder.customerName} ({selectedOrder.customerEmail})
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedOrder.amount.toFixed(2)} {selectedOrder.currency}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Offre</span>
                    <span className="font-bold">{selectedOrder.offerId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Statut de Paiement</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedOrder.status}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('accountPage.date') || 'Date'}</span>
                    <span className="font-bold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <DeliveryKitDownloader
                deliveryPackage={deliveryPackage}
                licenseKey={selectedOrder.notes}
              />
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
              Sélectionnez une commande pour afficher et télécharger son package de livraison.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
