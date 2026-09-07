/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE AUDIT HISTORY
 * Chronological view of all administrative and cryptographic licensing events.
 */

import React, { useState } from 'react';
import { AuditLogEntry } from '../../types/licensing';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppCard,
  AppInput,
  AppButton,
  AppBadge
} from '../../../../components/design-system';
import { Activity, Search, ShieldCheck, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export interface LicenseAuditHistoryProps {
  auditLogs: AuditLogEntry[];
  onRefresh: () => void;
}

export const LicenseAuditHistory: React.FC<LicenseAuditHistoryProps> = ({
  auditLogs,
  onRefresh,
}) => {
  const { t, isRtl } = useLanguage();
  const [search, setSearch] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      (log.licenseId || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.licenseKey || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 text-left" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-audit-history">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="w-full sm:w-72">
          <AppInput
            placeholder="Filtrer journal d'audit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {filteredLogs.length} événement(s) enregistré(s)
        </span>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
          Aucun événement d'audit ne correspond à vos critères.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {filteredLogs.map((log) => (
            <AppCard key={log.id} className="p-3 text-xs space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {log.success ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span className="font-bold text-slate-900 dark:text-white uppercase font-mono">
                    {log.action}
                  </span>
                  {log.licenseId && (
                    <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                      {log.licenseId}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 pl-5">{log.details}</p>

              {log.licenseKey && (
                <div className="pl-5 text-[10px] font-mono text-slate-400">
                  Clé associée : {log.licenseKey}
                </div>
              )}
            </AppCard>
          ))}
        </div>
      )}
    </div>
  );
};
