/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL CUSTOMER LIST COMPONENT
 * Client directory adhering strictly to "Minimum Necessary Data" rules.
 */

import React, { useState } from 'react';
import { CustomerReference, CustomerCreationInput } from '../types/customerReference';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppCard,
  AppButton,
  AppInput,
  AppModal,
  AppBadge,
} from '../../../../components/design-system';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Mail,
  Globe,
  ShoppingBag,
  Key,
} from 'lucide-react';

export interface CommercialCustomerListProps {
  customers: CustomerReference[];
  onInspectCustomer: (customer: CustomerReference) => void;
  onCreateCustomer: (input: CustomerCreationInput) => Promise<any>;
}

export const CommercialCustomerList: React.FC<CommercialCustomerListProps> = ({
  customers,
  onInspectCustomer,
  onCreateCustomer,
}) => {
  const { isRtl } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [commercialRef, setCommercialRef] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('FR');
  const [language, setLanguage] = useState<'fr' | 'en' | 'ar' | 'es' | 'it'>('fr');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const filtered = customers.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      c.commercialRef.toLowerCase().includes(q) ||
      c.customerId.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commercialRef.trim()) return;

    setLoading(true);
    try {
      await onCreateCustomer({
        commercialRef: commercialRef.trim(),
        email: email.trim() || undefined,
        country,
        language,
        notes: notes.trim() || undefined,
      });
      setIsAddModalOpen(false);
      setCommercialRef('');
      setEmail('');
      setNotes('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="commercial-customer-list">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <AppInput
            placeholder="Rechercher par nom, email, ID client..."
            className="pl-9 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="customer-search-input"
          />
        </div>

        <AppButton
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          data-testid="open-create-customer-btn"
        >
          <UserPlus className="w-4 h-4 mr-1.5" />
          Nouveau Client
        </AppButton>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <AppCard className="p-8 text-center" data-testid="customers-empty-state">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
            Aucun client trouvé
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Les clients créés automatiquement lors des commandes apparaîtront ici.
          </p>
        </AppCard>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300 border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Client ID</th>
                <th className="px-4 py-3">Nom / Référence</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Pays / Langue</th>
                <th className="px-4 py-3">Commandes</th>
                <th className="px-4 py-3">Licences</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((cust) => (
                <tr
                  key={cust.customerId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  data-testid={`customer-row-${cust.customerId}`}
                >
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                    {cust.customerId}
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {cust.commercialRef}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {cust.email ? (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {cust.email}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Non renseigné</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {cust.country || 'FR'} ({(cust.language || 'fr').toUpperCase()})
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
                      {(cust.orderIds || []).length}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-emerald-500" />
                      {(cust.licenseIds || []).length}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AppButton
                      variant="outline"
                      size="sm"
                      onClick={() => onInspectCustomer(cust)}
                      data-testid={`inspect-customer-${cust.customerId}`}
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                    </AppButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Customer Modal */}
      <AppModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Créer une Référence Client"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4" data-testid="create-customer-form">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nom Commercial ou Raison Sociale *
            </label>
            <AppInput
              placeholder="Ex: Élevage du Sud"
              value={commercialRef}
              onChange={(e) => setCommercialRef(e.target.value)}
              required
              data-testid="customer-name-input"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Email de Contact
            </label>
            <AppInput
              type="email"
              placeholder="contact@elevage.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="customer-email-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pays
              </label>
              <AppInput
                placeholder="FR, BE, DZ, ES, IT..."
                value={country}
                onChange={(e) => setCountry(e.target.value.toUpperCase())}
                data-testid="customer-country-input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Langue
              </label>
              <select
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                data-testid="customer-language-select"
              >
                <option value="fr">Français (FR)</option>
                <option value="en">English (EN)</option>
                <option value="ar">العربية (AR)</option>
                <option value="es">Español (ES)</option>
                <option value="it">Italiano (IT)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Notes Commerciales
            </label>
            <AppInput
              placeholder="Notes de suivi commercial"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              data-testid="customer-notes-input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <AppButton variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Annuler
            </AppButton>
            <AppButton
              variant="primary"
              size="sm"
              type="submit"
              disabled={loading || !commercialRef.trim()}
              data-testid="submit-create-customer-btn"
            >
              Enregistrer
            </AppButton>
          </div>
        </form>
      </AppModal>
    </div>
  );
};
