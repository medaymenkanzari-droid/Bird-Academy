/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL CUSTOMER DETAILS MODAL
 * Inspector drawer for a customer profile, showing order history and licenses.
 */

import React from 'react';
import { CustomerReference } from '../types/customerReference';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppModal,
  AppButton,
  AppCard,
  AppBadge,
} from '../../../../components/design-system';
import {
  Users,
  Mail,
  Globe,
  ShoppingBag,
  Key,
  Calendar,
  FileText,
} from 'lucide-react';

export interface CommercialCustomerDetailsModalProps {
  customer: CustomerReference | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CommercialCustomerDetailsModal: React.FC<CommercialCustomerDetailsModalProps> = ({
  customer,
  isOpen,
  onClose,
}) => {
  const { isRtl } = useLanguage();
  if (!customer) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Profil Client — ${customer.commercialRef}`}
      size="md"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="commercial-customer-details-modal">
        {/* Customer Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              {customer.commercialRef}
            </h4>
            <span className="font-mono text-xs text-slate-400">
              {customer.customerId}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <AppCard className="p-3 space-y-1">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Email</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {customer.email || 'Non renseigné'}
            </span>
          </AppCard>
          <AppCard className="p-3 space-y-1">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Pays / Langue</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 uppercase">
              {customer.country || 'FR'} ({customer.language})
            </span>
          </AppCard>
        </div>

        {/* Orders & Licenses Counts */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <AppCard className="p-3 space-y-1 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40">
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold block text-[10px] uppercase">Commandes Passées</span>
            <span className="text-base font-black text-indigo-900 dark:text-indigo-200">
              {customer.orderIds.length}
            </span>
          </AppCard>
          <AppCard className="p-3 space-y-1 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold block text-[10px] uppercase">Licences Associées</span>
            <span className="text-base font-black text-emerald-900 dark:text-emerald-200">
              {customer.licenseIds.length}
            </span>
          </AppCard>
        </div>

        {/* Notes */}
        {customer.notes && (
          <AppCard className="p-3 text-xs space-y-1">
            <span className="text-slate-400 font-semibold block text-[10px] uppercase">Notes Commerciales</span>
            <p className="text-slate-600 dark:text-slate-300 italic">{customer.notes}</p>
          </AppCard>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <AppButton variant="outline" size="sm" onClick={onClose}>
            Fermer
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
