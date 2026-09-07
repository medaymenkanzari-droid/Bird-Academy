/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — USE COMMERCIAL LICENSE ADMIN HOOK
 * Master React hook managing commercial licensing states, filters, modal triggers, and actions.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { License, AuditLogEntry } from '../../types/licensing';
import { SubscriptionTier } from '../../../subscription/types/subscription';
import {
  CommercialAdminStats,
  LicenseCreationFormValues,
  LicenseFilterState,
  RenewalDialogValues,
  ReplacementDialogValues,
  TierChangeDialogValues
} from '../types/adminLicensing';
import { CommercialLicenseAdminService } from '../services/CommercialLicenseAdminService';
import { LicensingService } from '../../services/LicensingService';

export function useCommercialLicenseAdmin() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState<CommercialAdminStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger' | 'warning' | 'info'; title: string; message: string } | null>(null);

  // Filter State
  const [filterState, setFilterState] = useState<LicenseFilterState>({
    searchQuery: '',
    tierFilter: 'ALL',
    statusFilter: 'ALL',
    typeFilter: 'ALL',
    sortBy: 'issuedAt',
    sortOrder: 'desc',
  });

  // Active Dialog Targets
  const [inspectLicense, setInspectLicense] = useState<License | null>(null);
  const [exportLicense, setExportLicense] = useState<License | null>(null);
  const [qrLicense, setQrLicense] = useState<License | null>(null);
  const [renewLicense, setRenewLicense] = useState<License | null>(null);
  const [replaceLicense, setReplaceLicense] = useState<License | null>(null);
  const [upgradeLicense, setUpgradeLicense] = useState<License | null>(null);
  const [downgradeLicense, setDowngradeLicense] = useState<License | null>(null);
  const [suspendLicense, setSuspendLicense] = useState<License | null>(null);
  const [revokeLicense, setRevokeLicense] = useState<License | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const adminService = CommercialLicenseAdminService.getInstance();
      const licService = LicensingService.getInstance();
      const all = await licService.getAllLicenses();
      const computedStats = await adminService.getCommercialStats();
      const logs = await licService.getAuditLogs();

      setLicenses(all);
      setStats(computedStats);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load commercial admin data', err);
      setAlert({
        type: 'danger',
        title: 'Erreur de chargement',
        message: (err as Error).message || 'Impossible de charger les données administratives.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Filtered & Sorted Licenses
  const filteredLicenses = useMemo(() => {
    const adminService = CommercialLicenseAdminService.getInstance();
    return adminService.filterLicenses(licenses, filterState);
  }, [licenses, filterState]);

  const updateFilterState = (partial: Partial<LicenseFilterState>) => {
    setFilterState(prev => ({ ...prev, ...partial }));
  };

  // Actions
  const handleCreateLicense = async (values: LicenseCreationFormValues): Promise<License> => {
    const adminService = CommercialLicenseAdminService.getInstance();
    const created = await adminService.createCommercialLicense(values);
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Licence Générée',
      message: `Licence ${values.tier} générée et signée cryptographiquement pour ${created.holderName}.`,
    });
    return created;
  };

  const handleRenewLicense = async (licenseId: string, durationDays: number | null, notes?: string) => {
    const adminService = CommercialLicenseAdminService.getInstance();
    await adminService.renewLicense({ licenseId, durationDays, notes });
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Licence Renouvelée',
      message: 'La licence a été renouvelée avec succès.',
    });
  };

  const handleReplaceLicense = async (
    oldLicenseId: string,
    targetTier: SubscriptionTier,
    holderName: string,
    holderEmail: string | undefined,
    durationDays: number | null,
    reason: string
  ) => {
    const adminService = CommercialLicenseAdminService.getInstance();
    await adminService.replaceLicense({
      oldLicenseId,
      targetTier,
      holderName,
      holderEmail,
      durationDays,
      reason,
    });
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Licence Remplacée',
      message: `L'ancienne licence a été archivée (REPLACED) et la nouvelle licence ${targetTier} est active.`,
    });
  };

  const handleUpgradeLicense = async (
    licenseId: string,
    currentTier: SubscriptionTier,
    targetTier: SubscriptionTier,
    durationDays: number | null,
    reason?: string
  ) => {
    const adminService = CommercialLicenseAdminService.getInstance();
    await adminService.upgradeLicense({
      licenseId,
      currentTier,
      targetTier,
      durationDays,
      reason,
    });
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Upgrade Réussi',
      message: `La licence a été promue vers le plan ${targetTier}.`,
    });
  };

  const handleDowngradeLicense = async (
    licenseId: string,
    currentTier: SubscriptionTier,
    targetTier: SubscriptionTier,
    durationDays: number | null,
    reason?: string
  ) => {
    const adminService = CommercialLicenseAdminService.getInstance();
    await adminService.downgradeLicense({
      licenseId,
      currentTier,
      targetTier,
      durationDays,
      reason,
    });
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Downgrade Réussi',
      message: `La licence a été basculée vers ${targetTier}. 100% des données d'élevage sont préservées.`,
    });
  };

  const handleSuspendLicense = async (licenseId: string, reason: string) => {
    const adminService = CommercialLicenseAdminService.getInstance();
    await adminService.suspendLicense(licenseId, reason);
    await refreshData();
    setAlert({
      type: 'warning',
      title: 'Licence Suspendue',
      message: 'La licence a été suspendue avec succès.',
    });
  };

  const handleReactivateLicense = async (licenseId: string) => {
    const adminService = CommercialLicenseAdminService.getInstance();
    await adminService.reactivateLicense(licenseId);
    await refreshData();
    setAlert({
      type: 'success',
      title: 'Licence Réactivée',
      message: 'La licence a été réactivée en mode ACTIVE.',
    });
  };

  const handleRevokeLicense = async (licenseId: string, reason: string) => {
    const adminService = CommercialLicenseAdminService.getInstance();
    await adminService.revokeLicense(licenseId, reason);
    await refreshData();
    setAlert({
      type: 'danger',
      title: 'Licence Révoquée',
      message: 'La licence a été définitivement révoquée et inscrite sur la liste de révocation.',
    });
  };

  const exportAllData = async (): Promise<string> => {
    const licService = LicensingService.getInstance();
    return await licService.exportLicensingData();
  };

  const importAllData = async (jsonStr: string) => {
    const licService = LicensingService.getInstance();
    const res = await licService.importLicensingData(jsonStr);
    await refreshData();
    return res;
  };

  return {
    licenses,
    filteredLicenses,
    stats,
    auditLogs,
    loading,
    alert,
    setAlert,
    filterState,
    updateFilterState,
    refreshData,
    // Dialog triggers
    inspectLicense,
    setInspectLicense,
    exportLicense,
    setExportLicense,
    qrLicense,
    setQrLicense,
    renewLicense,
    setRenewLicense,
    replaceLicense,
    setReplaceLicense,
    upgradeLicense,
    setUpgradeLicense,
    downgradeLicense,
    setDowngradeLicense,
    suspendLicense,
    setSuspendLicense,
    revokeLicense,
    setRevokeLicense,
    isCreateOpen,
    setIsCreateOpen,
    // Action handlers
    handleCreateLicense,
    handleRenewLicense,
    handleReplaceLicense,
    handleUpgradeLicense,
    handleDowngradeLicense,
    handleSuspendLicense,
    handleReactivateLicense,
    handleRevokeLicense,
    exportAllData,
    importAllData,
  };
}
