/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useLicensing } from './useLicensing';
import { ExpirationEngine } from '../engines/ExpirationEngine';

export function useLicenseStatus() {
  const { activeLicense, validation, loading, refresh } = useLicensing();
  const [statusInfo, setStatusInfo] = useState<{
    label: string;
    isExpired: boolean;
    isNearExpiration: boolean;
    remainingDays: number | null;
  }>({
    label: 'Chargement...',
    isExpired: false,
    isNearExpiration: false,
    remainingDays: null,
  });

  useEffect(() => {
    if (activeLicense) {
      const evalRes = ExpirationEngine.evaluateExpiration(activeLicense);
      setStatusInfo({
        label: evalRes.statusLabel,
        isExpired: evalRes.isExpired,
        isNearExpiration: evalRes.isNearExpiration,
        remainingDays: evalRes.remainingDays,
      });
    } else if (validation) {
      setStatusInfo({
        label: validation.message,
        isExpired: validation.code === 'EXPIRED',
        isNearExpiration: false,
        remainingDays: validation.remainingDays,
      });
    }
  }, [activeLicense, validation]);

  return {
    ...statusInfo,
    activeLicense,
    loading,
    refresh,
  };
}
