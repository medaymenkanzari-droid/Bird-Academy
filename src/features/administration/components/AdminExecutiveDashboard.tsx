/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslation } from '../utils/adminTranslations';
import { AdminAuditService } from '../services/AdminAuditService';
import { AdminUserStore } from '../services/AdminUserStore';
import { AdminOrgStore } from '../services/AdminOrgStore';
import { 
  AppCard, AppTable, AppBadge, AppKpiCard, AppSelect 
} from '../../../components/design-system';
import { 
  Users, Key, Building2, Activity, ShieldCheck, HardDrive, 
  FileText, CheckCircle, AlertTriangle, XCircle, Filter
} from 'lucide-react';

export const AdminExecutiveDashboard: React.FC = () => {
  const { language } = useLanguage();
  const t = (key: string) => getAdminTranslation(language, key);

  const [categoryFilter, setCategoryFilter] = useState('all');

  const usersCount = useMemo(() => AdminUserStore.getAll().length, []);
  const orgsCount = useMemo(() => AdminOrgStore.getAll().length, []);
  const auditLogs = useMemo(() => AdminAuditService.getAll(), []);

  const filteredLogs = useMemo(() => {
    return AdminAuditService.filter(categoryFilter, '');
  }, [categoryFilter]);

  const getStatusBadge = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <AppBadge variant="success" icon={<CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}>Succès</AppBadge>;
      case 'warning':
        return <AppBadge variant="warning" icon={<AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />}>Attention</AppBadge>;
      case 'error':
        return <AppBadge variant="danger" icon={<XCircle className="w-3 h-3 text-red-600 dark:text-red-400" />}>Erreur</AppBadge>;
    }
  };

  const columns = [
    {
      key: 'actor',
      header: t('actorHeader'),
      sortable: true,
      sortAccessor: (log: any) => log.actorName,
      render: (log: any) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{log.actorName}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{log.role} ({log.actorId})</div>
        </div>
      )
    },
    {
      key: 'action',
      header: t('actionHeader'),
      sortable: true,
      render: (log: any) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{log.action}</span>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">{log.target}</div>
        </div>
      )
    },
    {
      key: 'details',
      header: t('detailsHeader'),
      render: (log: any) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 font-normal">{log.details}</span>
      )
    },
    {
      key: 'timestamp',
      header: t('timestampHeader'),
      sortable: true,
      render: (log: any) => (
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
          {new Date(log.timestamp).toLocaleString(language)}
        </span>
      )
    },
    {
      key: 'status',
      header: t('statusHeader'),
      sortable: true,
      render: (log: any) => getStatusBadge(log.status)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Standard Executive KPIs Grid: grid-cols-1 md:grid-cols-3 lg:grid-cols-6 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <AppKpiCard
          title={t('kpiTotalUsers')}
          value={usersCount}
          subtitle="Comptes actifs"
          icon={Users}
          variant="primary"
        />

        <AppKpiCard
          title={t('kpiActiveLicenses')}
          value="128"
          subtitle="Signatures RSA"
          icon={Key}
          variant="success"
        />

        <AppKpiCard
          title={t('kpiTotalOrgs')}
          value={orgsCount}
          subtitle="Clubs & Fédérations"
          icon={Building2}
          variant="warning"
        />

        <AppKpiCard
          title={t('kpiSystemHealth')}
          value="100%"
          subtitle="Télémétrie nominale"
          icon={Activity}
          variant="success"
        />

        <AppKpiCard
          title={t('kpiSecurityAudits')}
          value={auditLogs.length}
          subtitle="Événements tracés"
          icon={ShieldCheck}
          variant="info"
        />

        <AppKpiCard
          title={t('kpiStorageUsed')}
          value="1.8 MB"
          subtitle="Base chiffrée"
          icon={HardDrive}
          variant="primary"
        />
      </div>

      {/* Audit Log Table Header & Controls */}
      <AppCard padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('recentActivityTitle')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Historisation complète avec horodatage, intervenant, action, motif et résultat certifié.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AppSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: 'all', label: t('filterCategoryAll') },
                { value: 'user', label: t('filterCategoryUser') },
                { value: 'license', label: t('filterCategoryLicense') },
                { value: 'org', label: t('filterCategoryOrg') },
                { value: 'security', label: t('filterCategorySecurity') },
                { value: 'system', label: t('filterCategorySystem') },
              ]}
              containerClassName="w-48"
            />
          </div>
        </div>

        <AppTable
          columns={columns}
          data={filteredLogs}
          keyExtractor={(item) => item.id}
          searchable
          searchPlaceholder="Rechercher action, intervenant..."
          searchKeys={['actorName', 'action', 'target', 'details']}
        />
      </AppCard>
    </div>
  );
};

export default AdminExecutiveDashboard;
