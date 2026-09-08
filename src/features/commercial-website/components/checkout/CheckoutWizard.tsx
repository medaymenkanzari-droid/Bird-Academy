/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — CHECKOUT WIZARD
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../../i18n';
import { useWebCurrency } from '../../context/CommercialCurrencyContext';
import { useLocalizedOffers } from '../../hooks/useLocalizedOffers';
import { WebRoute } from '../../types';
import { CommercialOffersService } from '../../../licensing/commercial/services/CommercialOffersService';
import { CommercialOffer } from '../../../licensing/commercial/types/commercialOffer';
import { CommercialOrder } from '../../../licensing/commercial/types/commercialOrder';
import { DeliveryPackage } from '../../../licensing/commercial/types/deliveryPackage';
import { WebOrderCheckoutService } from '../../services/WebOrderCheckoutService';
import { OrderSummaryCard } from './OrderSummaryCard';
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { DeliveryKitDownloader } from './DeliveryKitDownloader';
import { 
  ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, 
  ShoppingBag, Sparkles, User, CreditCard, Download, HelpCircle 
} from 'lucide-react';

export interface CheckoutWizardProps {
  initialOfferId?: string;
  onNavigate: (route: WebRoute) => void;
}

export const CheckoutWizard: React.FC<CheckoutWizardProps> = ({
  initialOfferId = 'OFFER-PREMIUM-ANNUAL-2026',
  onNavigate,
}) => {
  const { t, locale, isRtl } = useWebLanguage();
  const { formatPrice } = useWebCurrency();
  const { offers, getLocalizedOfferById } = useLocalizedOffers();
  const offersService = CommercialOffersService.getInstance();
  const checkoutService = WebOrderCheckoutService.getInstance();

  // Wizard state: 1: Plan, 2: Info, 3: Review, 4: Payment, 5: Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedOfferId, setSelectedOfferId] = useState<string>(initialOfferId);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [country, setCountry] = useState('FR');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentProviderId, setPaymentProviderId] = useState('DEMO_SIMULATOR');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CommercialOrder | null>(null);
  const [completedDeliveryPackage, setCompletedDeliveryPackage] = useState<DeliveryPackage | null>(null);

  const selectedOffer: CommercialOffer = 
    offersService.getOfferById(selectedOfferId) || 
    offersService.getAllOffers()[0] || ({
      id: 'OFFER-PREMIUM-ANNUAL-2026',
      name: 'Bird Academy Premium',
      code: 'PREM-1Y',
      tier: 'PREMIUM',
      licenseType: 'commercial',
      description: 'Édition Passion',
      price: 49.00,
      currency: 'EUR',
      durationDays: 365,
      maxDevices: 3,
      aiDailyQuota: 100,
      capabilities: [],
      features: [],
      status: 'ACTIVE',
      version: '2026.1',
    } as CommercialOffer);

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const handleNextFromInfo = () => {
    setErrorMessage(null);
    if (!customerName.trim()) {
      setErrorMessage(t('checkout.clientName') + ' est obligatoire.');
      return;
    }
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      setErrorMessage(t('checkout.clientEmail') + ' est invalide.');
      return;
    }
    setCurrentStep(3);
  };

  const handleExecutePayment = async () => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);

      const res = await checkoutService.processCheckout({
        offerId: selectedOfferId,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        country,
        language: locale,
        notes: customerNotes.trim(),
        paymentProviderId,
      });

      setIsProcessing(false);

      if (res.success && res.order && res.deliveryPackage) {
        setCompletedOrder(res.order);
        setCompletedDeliveryPackage(res.deliveryPackage);
        setCurrentStep(5);
      } else {
        setErrorMessage(res.errorMessage || t('checkout.errorProcessing') || 'Le traitement de la commande a échoué.');
      }
    } catch (err: any) {
      console.error('[CheckoutWizard] Payment execution error:', err);
      setIsProcessing(false);
      setErrorMessage(err?.message || 'Une erreur inattendue est survenue lors du paiement.');
    }
  };

  return (
    <div 
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
      data-testid="checkout-wizard"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
          {t('checkout.step' + currentStep)}
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {currentStep === 5 ? t('checkout.successTitle') : t('checkout.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {currentStep === 5 ? t('checkout.successMsg') : t('checkout.subtitle')}
        </p>
      </div>

      {/* Wizard Step Indicators */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs font-bold">
        {[1, 2, 3, 4, 5].map((step) => {
          const isPassed = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs transition ${
                  isPassed
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step}
              </div>
              {step < 5 && <div className="w-4 sm:w-8 h-0.5 bg-slate-200 dark:bg-slate-700"></div>}
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* STEP 1: Select Plan */}
      {currentStep === 1 && (
        <div className="space-y-6" data-testid="checkout-step-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offers.map((off) => {
              const isSelected = off.id === selectedOfferId;
              return (
                <div
                  key={off.id}
                  onClick={() => setSelectedOfferId(off.id)}
                  className={`p-5 rounded-3xl border-2 cursor-pointer transition flex flex-col justify-between space-y-4 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'
                  }`}
                  data-testid={`checkout-offer-card-${off.id}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {off.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {off.priceFormatted}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{off.description}</p>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {off.period} • {off.offer.maxDevices} appareil
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
              data-testid="checkout-next-to-step-2"
            >
              <span>Continuer</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Customer Information */}
      {currentStep === 2 && (
        <div className="space-y-6" data-testid="checkout-step-2">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t('checkout.clientName')} *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('checkout.clientNamePlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  data-testid="checkout-input-name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t('checkout.clientEmail')} *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t('checkout.clientEmailPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  data-testid="checkout-input-email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t('checkout.clientCountry')}
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  data-testid="checkout-select-country"
                >
                  <option value="FR">France (FR)</option>
                  <option value="TN">Tunisie (TN)</option>
                  <option value="BE">Belgique (BE)</option>
                  <option value="DZ">Algérie (DZ)</option>
                  <option value="MA">Maroc (MA)</option>
                  <option value="ES">Espagne (ES)</option>
                  <option value="IT">Italie (IT)</option>
                  <option value="CA">Canada (CA)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t('checkout.clientNotes')}
                </label>
                <input
                  type="text"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Ex: Club Ornithologique / Facture pro"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  data-testid="checkout-input-notes"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={handleNextFromInfo}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
              data-testid="checkout-next-to-step-3"
            >
              <span>Vérifier la Commande</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Summary */}
      {currentStep === 3 && (
        <div className="space-y-6" data-testid="checkout-step-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrderSummaryCard offer={selectedOffer} />
            
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
                Informations du Bénéficiaire
              </h3>
              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div><strong>Nom :</strong> {customerName}</div>
                <div><strong>Email :</strong> {customerEmail}</div>
                <div><strong>Pays :</strong> {country}</div>
                {customerNotes && <div><strong>Notes :</strong> {customerNotes}</div>}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Modifier mes informations
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer"
              data-testid="checkout-next-to-step-4"
            >
              <span>Passer au Paiement</span>
              <ArrowIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Payment Selection & Execution */}
      {currentStep === 4 && (
        <div className="space-y-6" data-testid="checkout-step-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PaymentMethodSelector
              selectedProvider={paymentProviderId}
              onSelectProvider={setPaymentProviderId}
            />
            <OrderSummaryCard offer={selectedOffer} />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition cursor-pointer"
            >
              Retour
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExecutePayment}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer"
              data-testid="checkout-pay-btn"
            >
              <CreditCard className="w-4 h-4" />
              <span>{isProcessing ? t('checkout.paymentProcessing') : 'Confirmer et Payer (Mode Démo)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Confirmation & Delivery Kit Download */}
      {currentStep === 5 && completedDeliveryPackage && (
        <div className="space-y-6" data-testid="checkout-step-5">
          <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  {t('checkout.orderIdLabel')} : {completedOrder?.orderId}
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-300">
                  Paiement validé avec succès • Licence prête
                </span>
              </div>
            </div>
          </div>

          <DeliveryKitDownloader
            deliveryPackage={completedDeliveryPackage}
            licenseKey={completedOrder?.notes}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onNavigate('license')}
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t('checkout.activationHelp')}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('account')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
            >
              Voir mon espace client
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
