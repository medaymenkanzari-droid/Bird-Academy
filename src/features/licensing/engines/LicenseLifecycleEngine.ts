/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LMSE LICENSE LIFECYCLE ENGINE
 * Mission: LMSE-COMMERCIAL-LICENSE-LIFECYCLE-02
 * 
 * Manages the deterministic lifecycle state machine for LMSE commercial licenses:
 * PENDING_ACTIVATION → ACTIVE → (UPGRADE / DOWNGRADE / RENEWAL / EXPIRATION / SUSPENSION / REPLACEMENT / REVOCATION)
 */

import { License, LicenseStatus, DeviceFingerprint, ActivationRecord } from '../types/licensing';
import { LicenseEntity } from '../domain/entities/License';

export interface LifecycleTransitionRecord {
  fromStatus: LicenseStatus;
  toStatus: LicenseStatus;
  timestamp: string;
  reason?: string;
  metadata?: Record<string, any>;
}

export class LicenseLifecycleEngine {
  /**
   * Formal state transition matrix.
   * Defines every legal transition between license lifecycle states.
   */
  public static readonly ALLOWED_TRANSITIONS: Record<LicenseStatus, LicenseStatus[]> = {
    pending_activation: ['active', 'invalid', 'revoked', 'expired', 'trial', 'OFFLINE_BETA', 'suspended', 'replaced'],
    active: ['expired', 'revoked', 'suspended', 'replaced', 'active'],
    trial: ['active', 'expired', 'revoked', 'replaced'],
    OFFLINE_BETA: ['active', 'expired', 'replaced', 'revoked'],
    expired: ['active', 'replaced', 'revoked'],
    suspended: ['active', 'revoked', 'expired'],
    invalid: ['pending_activation', 'revoked', 'replaced'],
    replaced: [], // Terminal state for the archived license
    revoked: [],  // Terminal state
  };

  /**
   * Verifies if a lifecycle transition is allowed by the formal state machine.
   */
  public static canTransition(from: LicenseStatus, to: LicenseStatus): boolean {
    if (from === to && from === 'active') return true; // Renewal/re-verification within active state
    const allowed = this.ALLOWED_TRANSITIONS[from];
    return Array.isArray(allowed) && allowed.includes(to);
  }

  /**
   * Evaluates the current operational status of a license based on dates, revocations, and policies.
   */
  public static evaluateLifecycleStatus(license: License, now: Date = new Date()): LicenseStatus {
    if (license.status === 'revoked' || license.revokedAt) {
      return 'revoked';
    }
    if (license.status === 'replaced') {
      return 'replaced';
    }
    if (license.status === 'suspended') {
      return 'suspended';
    }
    if (license.status === 'invalid') {
      return 'invalid';
    }

    // Check expiration for temporary, commercial, or bounded licenses
    if (license.expiresAt && license.type !== 'permanent') {
      const expTime = new Date(license.expiresAt).getTime();
      if (expTime < now.getTime()) {
        return 'expired';
      }
    }

    if (license.status === 'OFFLINE_BETA') {
      return 'OFFLINE_BETA';
    }
    if (license.status === 'trial') {
      return 'trial';
    }
    if (license.status === 'pending_activation') {
      return license.activations && license.activations.length > 0 ? 'active' : 'pending_activation';
    }

    return 'active';
  }

  /**
   * Executes a state transition on a license with audit logging.
   */
  public static transition(
    license: License,
    toStatus: LicenseStatus,
    reason?: string,
    metadata?: Record<string, any>
  ): License {
    const fromStatus = license.status;

    if (!this.canTransition(fromStatus, toStatus)) {
      throw new Error(
        `[LIFECYCLE_ERROR] Transition illégale de l'état "${fromStatus}" vers "${toStatus}".`
      );
    }

    const nowIso = new Date().toISOString();
    const transitionRecord: LifecycleTransitionRecord = {
      fromStatus,
      toStatus,
      timestamp: nowIso,
      reason,
      metadata,
    };

    const existingHistory: LifecycleTransitionRecord[] = 
      license.metadata?.lifecycleHistory || [];

    const updatedLicense: License = {
      ...license,
      status: toStatus,
      metadata: {
        ...license.metadata,
        lifecycleHistory: [...existingHistory, transitionRecord],
        lastStatusChange: nowIso,
      },
    };

    if (toStatus === 'revoked') {
      updatedLicense.revokedAt = nowIso;
      updatedLicense.revocationReason = reason || 'Révocation administrative';
    }

    return updatedLicense;
  }

  /**
   * Activates a license for a specific device.
   */
  public static activate(
    license: License,
    device: DeviceFingerprint,
    isOffline: boolean = true
  ): License {
    const nowIso = new Date().toISOString();
    const entity = new LicenseEntity(license);

    if (entity.isRevoked()) {
      throw new Error('[LIFECYCLE_ERROR] Impossible d\'activer une licence révoquée.');
    }
    if (entity.isExpired()) {
      throw new Error('[LIFECYCLE_ERROR] Impossible d\'activer une licence expirée.');
    }

    const newActivation: ActivationRecord = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      licenseId: license.id,
      licenseKey: license.key,
      fingerprint: device,
      activatedAt: nowIso,
      lastVerifiedAt: nowIso,
      isOffline,
    };

    entity.bindDevice(newActivation);

    const activatedLicense: License = {
      ...license,
      status: 'active',
      activations: entity.activations,
    };

    return this.transition(
      activatedLicense,
      'active',
      `Activation sur le périphérique ${device.deviceId}`,
      { deviceId: device.deviceId, isOffline }
    );
  }

  /**
   * Replaces an existing license with a new license (e.g. key replacement or plan upgrade/downgrade).
   * The old license is archived into REPLACED state; the new license is activated.
   */
  public static replace(
    currentLicense: License,
    newLicense: License,
    reason: string = 'Remplacement de licence'
  ): { activeLicense: License; archivedLicense: License } {
    // 1. Archive previous license into 'replaced' state
    const archived = this.transition(
      currentLicense,
      'replaced',
      reason,
      { replacedByLicenseId: newLicense.id, replacedByLicenseKey: newLicense.key }
    );

    // 2. Ensure new license is active or pending
    const active = this.transition(
      newLicense,
      'active',
      `Licence active en remplacement de ${currentLicense.id}`,
      { previousLicenseId: currentLicense.id }
    );

    return {
      activeLicense: active,
      archivedLicense: archived,
    };
  }

  /**
   * Renews an expired or expiring license with a new valid license.
   */
  public static renew(
    expiredOrCurrentLicense: License,
    renewalLicense: License
  ): { activeLicense: License; archivedLicense: License } {
    return this.replace(
      expiredOrCurrentLicense,
      renewalLicense,
      `Renouvellement de licence (${expiredOrCurrentLicense.key} -> ${renewalLicense.key})`
    );
  }

  /**
   * Upgrades commercial tier (FREE -> PREMIUM, FREE -> PRO, PREMIUM -> PRO).
   */
  public static upgrade(
    currentLicense: License,
    targetTierLicense: License
  ): { activeLicense: License; archivedLicense: License } {
    return this.replace(
      currentLicense,
      targetTierLicense,
      `Mise à niveau de licence (${currentLicense.type} -> ${targetTierLicense.type})`
    );
  }

  /**
   * Downgrades commercial tier (PRO -> PREMIUM, PRO -> FREE, PREMIUM -> FREE).
   * Guarantees 0 data loss.
   */
  public static downgrade(
    currentLicense: License,
    targetTierLicense: License
  ): { activeLicense: License; archivedLicense: License } {
    return this.replace(
      currentLicense,
      targetTierLicense,
      `Rétrogradation de licence (${currentLicense.type} -> ${targetTierLicense.type}) - Conservation des données garantie`
    );
  }

  /**
   * Marks a license as expired.
   */
  public static expire(license: License): License {
    return this.transition(
      license,
      'expired',
      'Expiration de la période de validité'
    );
  }

  /**
   * Revokes a license immediately.
   */
  public static revoke(license: License, reason: string): License {
    return this.transition(
      license,
      'revoked',
      reason
    );
  }

  /**
   * Suspends a license temporarily.
   */
  public static suspend(license: License, reason: string): License {
    return this.transition(
      license,
      'suspended',
      reason
    );
  }

  /**
   * Reactivates a suspended license.
   */
  public static reactivate(license: License): License {
    return this.transition(
      license,
      'active',
      'Réactivation de la licence'
    );
  }
}
