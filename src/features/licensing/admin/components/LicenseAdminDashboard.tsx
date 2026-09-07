/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE COMMERCIAL DASHBOARD
 * Executive metrics, tier distributions, lifecycle states, and expiration alerts computed 100% locally.
 */

import React from 'react';
import { License } from '../../types/licensing';
import { CommercialAdminStats } from '../types/adminLicensing';
import { LicenseTierBadge } from './LicenseTierBadge';
import { LicenseStatusBadge } from './LicenseStatusBadge';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppCard,
  AppButton,
  AppBadge
} from '../../../../components/design-system';
import {
  BarChart3,
  Crown,
  Sparkles,
  Feather,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Laptop,
  Activity,
  Plus,
  RefreshCw
} from 'lucide-react';

export interface LicenseAdminDashboardProps {
  stats: CommercialAdminStats | null;
  licenses: License[];
  onRenew: (license: License) => void;
  onInspect: (license: License) => void;
  onCreateOpen: () => void;
  onRefresh: () => void;
}

export const LicenseAdminDashboard: React.FC<LicenseAdminDashboardProps> = ({
  stats,
  licenses,
  onRenew,
  onInspect,
  onCreateOpen,
  onRefresh,
}) => {
  const { t, isRtl } = useLanguage();

  if (!stats) return null;

  const now = Date.now();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  const expiringSoonLicenses = licenses.filter((l) => {
    if (!l.expiresAt || l.status !== 'active') return false;
    const exp = new Date(l.expiresAt).getTime();
    return exp > now && exp - now <= thirtyDaysMs;
  });

  return (
    <div className="space-y-6 text-left" dir={isRtl ? 'rtl' : 'ltr'} data-testid="commercial-admin-dashboard">
      {/* TOP METRIC CARDS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* TOTAL */}
        <AppCard className="p-4 space-y-1 border-l-4 border-l-slate-700 bg-white dark:bg-slate-900 shadow-sm" data-testid="metric-total-licenses">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">
            Total Licences
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white" data-testid="metric-total-value">
            {stats.totalLicenses}
          </span>
        </AppCard>

        {/* PRO */}
        <AppCard className="p-4 space-y-1 border-l-4 border-l-amber-500 bg-white dark:bg-slate-900 shadow-sm" data-testid="metric-tier-pro">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
              Plan PRO
            </span>
            <Crown className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400" data-testid="metric-pro-value">
            {stats.tierBreakdown.PRO}
          </span>
        </AppCard>

        {/* PREMIUM */}
        <AppCard className="p-4 space-y-1 border-l-4 border-l-indigo-500 bg-white dark:bg-slate-900 shadow-sm" data-testid="metric-tier-premium">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
              Plan PREMIUM
            </span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400" data-testid="metric-premium-value">
            {stats.tierBreakdown.PREMIUM}
          </span>
        </AppCard>

        {/* FREE */}
        <AppCard className="p-4 space-y-1 border-l-4 border-l-slate-400 bg-white dark:bg-slate-900 shadow-sm" data-testid="metric-tier-free">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Plan FREE
            </span>
            <Feather className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <span className="text-2xl font-black text-slate-700 dark:text-slate-300" data-testid="metric-free-value">
            {stats.tierBreakdown.FREE}
          </span>
        </AppCard>

        {/* ACTIVES */}
        <AppCard className="p-4 space-y-1 border-l-4 border-l-emerald-500 bg-white dark:bg-slate-900 shadow-sm" data-testid="metric-status-active">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase tracking-wider">
            Actives
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400" data-testid="metric-active-value">
            {stats.statusBreakdown.active}
          </span>
        </AppCard>

        {/* EXPIRING SOON */}
        <AppCard className="p-4 space-y-1 border-l-4 border-l-rose-500 bg-white dark:bg-slate-900 shadow-sm" data-testid="metric-expiring-soon">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">
              Expirant &lt; 30j
            </span>
            <Clock className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <span className="text-2xl font-black text-rose-600 dark:text-rose-400" data-testid="metric-expiring-soon-value">
            {stats.expiringSoonCount}
          </span>
        </AppCard>
      </div>

      {/* DETAILED STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. DISTRIBUTION PAR TIER COMMERCIAL */}
        <AppCard className="p-5 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Crown className="w-4 h-4 text-amber-500" />
            Répartition par Tier Commercial
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs p-2.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
              <span className="font-bold text-amber-800 dark:text-amber-300">Plan PRO</span>
              <span className="font-black text-amber-600 dark:text-amber-400">{stats.tierBreakdown.PRO}</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200/50 dark:border-indigo-900/40">
              <span className="font-bold text-indigo-800 dark:text-indigo-300">Plan PREMIUM</span>
              <span className="font-black text-indigo-600 dark:text-indigo-400">{stats.tierBreakdown.PREMIUM}</span>
            </div>
            <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-bold text-slate-700 dark:text-slate-300">Plan FREE</span>
              <span className="font-black text-slate-700 dark:text-slate-300">{stats.tierBreakdown.FREE}</span>
            </div>
          </div>
        </AppCard>

        {/* 2. ÉTATS DU CYCLE DE VIE (9 ÉTATS) */}
        <AppCard className="p-5 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-emerald-500" />
            États du Cycle de Vie LMSE
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between">
              <span className="text-slate-500">Active :</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.statusBreakdown.active}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between">
              <span className="text-slate-500">Expirée :</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{stats.statusBreakdown.expired}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between">
              <span className="text-slate-500">Suspendue :</span>
              <span className="font-bold text-amber-600">{stats.statusBreakdown.suspended}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between">
              <span className="text-slate-500">Révoquée :</span>
              <span className="font-bold text-red-600">{stats.statusBreakdown.revoked}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between">
              <span className="text-slate-500">Remplacée :</span>
              <span className="font-bold text-slate-600 dark:text-slate-400">{stats.statusBreakdown.replaced}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex justify-between">
              <span className="text-slate-500">En attente :</span>
              <span className="font-bold text-blue-600">{stats.statusBreakdown.pending_activation}</span>
            </div>
          </div>
        </AppCard>

        {/* 3. ALERTES EXPIRATION PROCHE */}
        <AppCard className="p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Alertes d'Expiration
            </h3>
            <AppBadge variant={expiringSoonLicenses.length > 0 ? 'accent' : 'success'}>
              {expiringSoonLicenses.length}
            </AppBadge>
          </div>

          {expiringSoonLicenses.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
              Aucune licence n'expire dans les 30 prochains jours.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {expiringSoonLicenses.map((lic) => {
                const daysLeft = Math.ceil(
                  (new Date(lic.expiresAt!).getTime() - now) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={lic.id}
                    className="p-2.5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{lic.holderName}</span>
                      <span className="text-[10px] text-rose-600 dark:text-rose-400">Expire dans {daysLeft} jour(s)</span>
                    </div>
                    <AppButton
                      variant="secondary"
                      size="sm"
                      onClick={() => onRenew(lic)}
                      data-testid={`quick-renew-${lic.id}`}
                    >
                      Renouveler
                    </AppButton>
                  </div>
                );
              })}
            </div>
          )}
        </AppCard>
      </div>
    </div>
  );
};
