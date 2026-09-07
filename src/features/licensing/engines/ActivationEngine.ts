/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { License, ActivationRecord, DeviceFingerprint, LicenseValidationResult } from '../types/licensing';
import { ILicenseRepository } from '../repositories/ILicenseRepository';
import { LicenseValidator } from './LicenseValidator';

export class ActivationEngine {
  /**
   * Activates a license key on the current device
   */
  static async activateKey(
    repository: ILicenseRepository,
    key: string,
    holderName: string,
    currentDevice: DeviceFingerprint
  ): Promise<LicenseValidationResult> {
    const cleanKey = key.trim().toUpperCase();
    let license = await repository.getLicenseByKey(cleanKey);

    if (!license) {
      await repository.addAuditLog({
        action: 'ACTIVATE',
        licenseKey: cleanKey,
        deviceId: currentDevice.deviceId,
        details: 'Échec d\'activation: Clé introuvable dans le système local.',
        success: false,
      });
      return {
        isValid: false,
        status: 'pending_activation',
        license: null,
        code: 'KEY_NOT_FOUND',
        message: 'Clé de licence introuvable.',
        remainingDays: null,
        deviceRegistered: false,
      };
    }

    const revocations = await repository.getRevocationList();
    const lastTime = await repository.getMonotonicTimeMarker();
    
    // Initial validation check
    const validation = await LicenseValidator.validateLicense(license, currentDevice, revocations, lastTime);
    if (!validation.isValid && validation.code !== 'PENDING_ACTIVATION' && validation.code !== 'UNBOUND_DEVICE') {
      return validation;
    }

    // Check device capacity
    const isAlreadyBound = license.activations.some(a => a.fingerprint.deviceId === currentDevice.deviceId);
    if (!isAlreadyBound && license.activations.length >= license.policy.maxDevices) {
      await repository.addAuditLog({
        action: 'ACTIVATE',
        licenseId: license.id,
        licenseKey: license.key,
        deviceId: currentDevice.deviceId,
        details: `Limite d'appareils atteinte (${license.activations.length}/${license.policy.maxDevices}).`,
        success: false,
      });
      return {
        isValid: false,
        status: 'suspended',
        license,
        code: 'DEVICE_LIMIT_EXCEEDED',
        message: `Nombre maximal d'appareils atteint (${license.policy.maxDevices} appareils).`,
        remainingDays: validation.remainingDays,
        deviceRegistered: false,
      };
    }

    // Bind current device
    const now = new Date().toISOString();
    if (!license.holderName && holderName && holderName.trim()) {
      license.holderName = holderName.trim();
    }

    if (isAlreadyBound) {
      license.activations = license.activations.map(a =>
        a.fingerprint.deviceId === currentDevice.deviceId ? { ...a, lastVerifiedAt: now } : a
      );
    } else {
      const record: ActivationRecord = {
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        licenseId: license.id,
        licenseKey: license.key,
        fingerprint: currentDevice,
        activatedAt: now,
        lastVerifiedAt: now,
        isOffline: false,
      };
      license.activations.push(record);
    }

    license.status = 'active';
    await repository.saveActiveLicense(license);
    await repository.setMonotonicTimeMarker(now);

    await repository.addAuditLog({
      action: 'ACTIVATE',
      licenseId: license.id,
      licenseKey: license.key,
      deviceId: currentDevice.deviceId,
      details: `Licence activée avec succès pour ${license.holderName} sur ${currentDevice.os} (${currentDevice.deviceId}).`,
      success: true,
    });

    return {
      isValid: true,
      status: 'active',
      license,
      code: 'ACTIVATION_SUCCESS',
      message: 'Licence activée avec succès.',
      remainingDays: validation.remainingDays,
      deviceRegistered: true,
    };
  }

  /**
   * Deactivates / unbinds a device slot from a license
   */
  static async deactivateDevice(
    repository: ILicenseRepository,
    licenseId: string,
    targetDeviceId: string
  ): Promise<boolean> {
    const license = await repository.getLicenseById(licenseId);
    if (!license) return false;

    const initialCount = license.activations.length;
    license.activations = license.activations.filter(a => a.fingerprint.deviceId !== targetDeviceId);

    if (license.activations.length === initialCount) return false;

    if (license.activations.length === 0 && license.status === 'active') {
      license.status = 'pending_activation';
    }

    await repository.saveLicense(license);
    const active = await repository.getActiveLicense();
    if (active && active.id === licenseId) {
      await repository.saveActiveLicense(license);
    }

    await repository.addAuditLog({
      action: 'DEACTIVATE',
      licenseId: license.id,
      licenseKey: license.key,
      deviceId: targetDeviceId,
      details: `Appareil ${targetDeviceId} désassocié de la licence.`,
      success: true,
    });

    return true;
  }
}
