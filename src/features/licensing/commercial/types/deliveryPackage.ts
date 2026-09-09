/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE DELIVERY PACKAGE TYPES
 * Represents the offline delivery kit generated for end users and commercial testers.
 */

import { License } from '../../types/licensing';
import { CommercialOrder } from './commercialOrder';

export interface DeliveryPackageFile {
  filename: string;
  contentType: string;
  content: string | Uint8Array;
  sizeBytes: number;
  dataUrl?: string;
}

export interface LicenseDeliveryPackage {
  packageId: string;
  licenseId: string;
  licenseKey: string;
  orderId?: string;
  customerName: string;
  tier: string;
  generatedAt: string;
  files: DeliveryPackageFile[];
  totalSizeBytes: number;
  zipBuffer?: Uint8Array;
}

export type DeliveryPackage = LicenseDeliveryPackage;
