/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class LicensingError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'LicensingError';
  }
}

export class InvalidLicenseKeyError extends LicensingError {
  constructor(message = 'Format de clé de licence invalide.') {
    super(message, 'INVALID_LICENSE_KEY');
    this.name = 'InvalidLicenseKeyError';
  }
}

export class LicenseExpiredError extends LicensingError {
  constructor(message = 'La licence a expiré.') {
    super(message, 'LICENSE_EXPIRED');
    this.name = 'LicenseExpiredError';
  }
}

export class DeviceLimitExceededError extends LicensingError {
  constructor(message = 'Le nombre maximal d\'appareils autorisés a été atteint.') {
    super(message, 'DEVICE_LIMIT_EXCEEDED');
    this.name = 'DeviceLimitExceededError';
  }
}

export class ClockTamperedError extends LicensingError {
  constructor(message = 'Une modification suspecte de l\'horloge système a été détectée.') {
    super(message, 'CLOCK_TAMPERED');
    this.name = 'ClockTamperedError';
  }
}

export class SignatureVerificationError extends LicensingError {
  constructor(message = 'La signature numérique de la licence est corrompue ou invalide.') {
    super(message, 'SIGNATURE_INVALID');
    this.name = 'SignatureVerificationError';
  }
}

export class LicenseRevokedError extends LicensingError {
  constructor(message = 'Cette licence a été révoquée par l\'administrateur.') {
    super(message, 'LICENSE_REVOKED');
    this.name = 'LicenseRevokedError';
  }
}

export class DeviceMismatchError extends LicensingError {
  constructor(message = 'Cet appareil n\'est pas enregistré sur cette licence.') {
    super(message, 'DEVICE_MISMATCH');
    this.name = 'DeviceMismatchError';
  }
}
