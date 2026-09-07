/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { License, LicenseStats, AuditLogEntry } from '../types/licensing';
import { LicensingService } from '../services/LicensingService';
import { GenerateLicenseOptions } from '../engines/LicenseGenerator';

export function useLicenseAdmin() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [stats, setStats] = useState<LicenseStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const service = LicensingService.getInstance();
      const all = await service.getAllLicenses();
      const currentStats = await service.getStats();
      const logs = await service.getAuditLogs();
      setLicenses(all);
      setStats(currentStats);
      setAuditLogs(logs);
    } catch (e) {
      console.error('Failed to load LMSE admin data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  const createLicense = async (options: GenerateLicenseOptions): Promise<License> => {
    const service = LicensingService.getInstance();
    const created = await service.createLicense(options);
    await refreshAdminData();
    return created;
  };

  const revokeLicense = async (id: string, reason: string): Promise<License | null> => {
    const service = LicensingService.getInstance();
    const revoked = await service.revokeLicense(id, reason);
    await refreshAdminData();
    return revoked;
  };

  const deactivateDevice = async (licenseId: string, deviceId: string): Promise<boolean> => {
    const service = LicensingService.getInstance();
    const res = await service.deactivateDevice(licenseId, deviceId);
    await refreshAdminData();
    return res;
  };

  const exportData = async (): Promise<string> => {
    const service = LicensingService.getInstance();
    return await service.exportLicensingData();
  };

  const importData = async (jsonStr: string) => {
    const service = LicensingService.getInstance();
    const res = await service.importLicensingData(jsonStr);
    await refreshAdminData();
    return res;
  };

  return {
    licenses,
    stats,
    auditLogs,
    loading,
    refreshAdminData,
    createLicense,
    revokeLicense,
    deactivateDevice,
    exportData,
    importData,
  };
}
