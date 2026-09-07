/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL ORDER CREATION DIALOG
 * Modal wizard to create and optionally fulfill a new commercial license order.
 */

import React, { useState } from 'react';
import { CommercialOffer } from '../types/commercialOffer';
import { CustomerReference } from '../types/customerReference';
import { OrderCreationInput, OrderSource } from '../types/commercialOrder';
import { LicenseTierBadge } from '../../admin/components/LicenseTierBadge';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppModal,
  AppButton,
  AppCard,
  AppInput,
  AppAlert,
  AppLoader,
} from '../../../../components/design-system';
import { ShoppingBag, PackageCheck, User, ShieldCheck } from 'lucide-react';

export interface CommercialOrderCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  offers: CommercialOffer[];
  customers: CustomerReference[];
  selectedOffer?: CommercialOffer | null;
  onCreateOrder: (input: OrderCreationInput) => Promise<any>;
}

export const CommercialOrderCreateDialog: React.FC<CommercialOrderCreateDialogProps> = ({
  isOpen,
  onClose,
  offers,
  customers,
  selectedOffer,
  onCreateOrder,
}) => {
  const { isRtl } = useLanguage();
  const [offerId, setOfferId] = useState<string>(selectedOffer?.id || (offers[0]?.id || ''));
  const [customerId, setCustomerId] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [source, setSource] = useState<OrderSource>('DIRECT');
  const [notes, setNotes] = useState<string>('');
  const [autoFulfill, setAutoFulfill] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync selectedOffer if changed from parent
  React.useEffect(() => {
    if (selectedOffer) {
      setOfferId(selectedOffer.id);
    } else if (offers.length > 0 && !offerId) {
      setOfferId(offers[0].id);
    }
  }, [selectedOffer, offers]);

  const activeOffer = offers.find(o => o.id === offerId);

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    const existing = customers.find(c => c.customerId === id);
    if (existing) {
      setCustomerName(existing.commercialRef);
      setCustomerEmail(existing.email || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Veuillez spécifier le nom du client ou titulaire.');
      return;
    }
    if (!offerId) {
      setError('Veuillez sélectionner une offre commerciale.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onCreateOrder({
        customerId: customerId || undefined,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        offerId,
        quantity,
        source,
        notes: notes.trim() || undefined,
        autoFulfill,
      });
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Créer une Nouvelle Commande Commerciale"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="commercial-order-create-dialog">
        {error && (
          <AppAlert type="danger" title="Erreur">
            {error}
          </AppAlert>
        )}

        {/* 1. Offer Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Offre Commerciale
          </label>
          <select
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            value={offerId}
            onChange={(e) => setOfferId(e.target.value)}
            data-testid="order-offer-select"
          >
            {offers.map((off) => (
              <option key={off.id} value={off.id}>
                {off.name} — {off.price === 0 ? 'Gratuit' : `${off.price.toFixed(2)} ${off.currency}`} ({off.tier})
              </option>
            ))}
          </select>
        </div>

        {/* Offer Summary Card */}
        {activeOffer && (
          <AppCard className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LicenseTierBadge tier={activeOffer.tier} size="sm" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {activeOffer.name}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-slate-900 dark:text-white">
                {(activeOffer.price * quantity).toFixed(2)} {activeOffer.currency}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {activeOffer.durationDays ? `${activeOffer.durationDays}j` : 'À vie'}
              </span>
            </div>
          </AppCard>
        )}

        {/* 2. Customer Selection / Input */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {customers.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Client Existant (Optionnel)
              </label>
              <select
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                value={customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                data-testid="order-customer-select"
              >
                <option value="">-- Nouveau Client / Saisie Manuelle --</option>
                {customers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.commercialRef} {c.email ? `(${c.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Nom ou Référence du Titulaire *
              </label>
              <AppInput
                placeholder="Ex: Élevage Jean Dupont"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                data-testid="order-customer-name-input"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Email de Contact (Optionnel)
              </label>
              <AppInput
                type="email"
                placeholder="client@exemple.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                data-testid="order-customer-email-input"
              />
            </div>
          </div>
        </div>

        {/* 3. Quantity & Source */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Quantité de Licences
            </label>
            <AppInput
              type="number"
              min="1"
              max="50"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              data-testid="order-quantity-input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Canal de Vente
            </label>
            <select
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
              value={source}
              onChange={(e) => setSource(e.target.value as OrderSource)}
              data-testid="order-source-select"
            >
              <option value="DIRECT">Vente Directe / Facturation</option>
              <option value="WEB">Boutique Web</option>
              <option value="PARTNER">Partenaire / Club Aviaire</option>
              <option value="INTERNAL_TEST">Test Interne / Bêta</option>
              <option value="ADMIN_MANUAL">Manuel Administrateur</option>
            </select>
          </div>
        </div>

        {/* 4. Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Notes Commerciales & Référence Externe
          </label>
          <AppInput
            placeholder="Ex: Facture FAC-2026-081, Virement bancaire reçu"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            data-testid="order-notes-input"
          />
        </div>

        {/* 5. Auto Fulfill Checkbox */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-indigo-900 dark:text-indigo-200">
            <input
              type="checkbox"
              checked={autoFulfill}
              onChange={(e) => setAutoFulfill(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              data-testid="order-auto-fulfill-checkbox"
            />
            <span>
              Marquer payée et générer immédiatement la licence cryptographique
            </span>
          </label>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <AppButton variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Annuler
          </AppButton>
          <AppButton
            variant="primary"
            size="sm"
            type="submit"
            disabled={loading || !customerName.trim()}
            data-testid="submit-create-order-btn"
          >
            {loading ? <AppLoader size="sm" /> : <ShoppingBag className="w-4 h-4 mr-1.5" />}
            Enregistrer la Commande
          </AppButton>
        </div>
      </form>
    </AppModal>
  );
};
