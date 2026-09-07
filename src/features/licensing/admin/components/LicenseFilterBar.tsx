/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE FILTER BAR
 * Multi-attribute search, commercial tier pills, status filters, and sorting controls.
 */

import React from 'react';
import { SubscriptionTier } from '../../../subscription/types/subscription';
import { LicenseStatus, LicenseType } from '../../types/licensing';
import { CommercialTierFilter, CommercialStatusFilter, LicenseFilterState } from '../types/adminLicensing';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppInput,
  AppSelect,
  AppButton
} from '../../../../components/design-system';
import { Search, Plus, RefreshCw, Filter, SlidersHorizontal } from 'lucide-react';

export interface LicenseFilterBarProps {
  filterState: LicenseFilterState;
  onFilterChange: (newState: Partial<LicenseFilterState>) => void;
  onRefresh: () => void;
  onCreateOpen: () => void;
  totalCount: number;
  filteredCount: number;
}

export const LicenseFilterBar: React.FC<LicenseFilterBarProps> = ({
  filterState,
  onFilterChange,
  onRefresh,
  onCreateOpen,
  totalCount,
  filteredCount,
}) => {
  const { t, isRtl } = useLanguage();

  const tierPills: { id: CommercialTierFilter; label: string; countColor: string }[] = [
    { id: 'ALL', label: 'Toutes les Licences', countColor: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' },
    { id: 'PRO', label: 'Plan PRO', countColor: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' },
    { id: 'PREMIUM', label: 'Plan PREMIUM', countColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300' },
    { id: 'FREE', label: 'Plan FREE', countColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
  ];

  return (
    <div className="space-y-3" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-filter-bar">
      {/* TOP ROW: SEARCH & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex-1 max-w-md">
          <AppInput
            placeholder="Rechercher par titulaire, clé, ID..."
            value={filterState.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            startIcon={<Search className="w-4 h-4 text-slate-400" />}
            data-testid="search-licenses-input"
          />
        </div>

        <div className="flex items-center gap-2">
          <AppButton
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            title="Rafraîchir les données"
            data-testid="refresh-licenses-btn"
          >
            <RefreshCw className="w-4 h-4" />
          </AppButton>

          <AppButton
            variant="primary"
            size="sm"
            onClick={onCreateOpen}
            data-testid="open-create-license-btn"
          >
            <Plus className="w-4 h-4 mr-1" />
            Créer une Licence
          </AppButton>
        </div>
      </div>

      {/* BOTTOM ROW: TIER PILLS & STATUS/SORT DROPDOWNS */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* TIER PILLS */}
        <div className="flex flex-wrap items-center gap-1.5" data-testid="tier-filter-pills">
          {tierPills.map((pill) => {
            const isSelected = filterState.tierFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onFilterChange({ tierFilter: pill.id })}
                data-testid={`filter-tier-${pill.id.toLowerCase()}`}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm ring-2 ring-indigo-500/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* STATUS & SORT DROPDOWNS */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-36">
            <AppSelect
              value={filterState.statusFilter}
              onChange={(e) => onFilterChange({ statusFilter: e.target.value as CommercialStatusFilter })}
              options={[
                { value: 'ALL', label: 'Tous statuts' },
                { value: 'active', label: 'Active' },
                { value: 'expired', label: 'Expirée' },
                { value: 'suspended', label: 'Suspendue' },
                { value: 'revoked', label: 'Révoquée' },
                { value: 'replaced', label: 'Remplacée' },
                { value: 'trial', label: 'Essai / Bêta' },
                { value: 'pending_activation', label: 'En attente' },
                { value: 'OFFLINE_BETA', label: 'Offline Beta' },
                { value: 'invalid', label: 'Invalide' },
              ]}
              data-testid="status-filter-select"
            />
          </div>

          <div className="w-36">
            <AppSelect
              value={filterState.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
              options={[
                { value: 'issuedAt', label: 'Date d\'émission' },
                { value: 'expiresAt', label: 'Date d\'expiration' },
                { value: 'holderName', label: 'Nom titulaire' },
                { value: 'status', label: 'Statut' },
                { value: 'tier', label: 'Tier commercial' },
              ]}
              data-testid="sort-licenses-select"
            />
          </div>

          <span className="text-xs text-slate-400 pl-1 font-mono">
            {filteredCount} / {totalCount}
          </span>
        </div>
      </div>
    </div>
  );
};
