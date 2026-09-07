/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — CUSTOMER REFERENCE TYPES
 * Strictly limited to "Minimum Necessary Data" for commercial relationship & support.
 * ABSOLUTE RULE: Zero biological or avicultural breeding data!
 */

export interface CustomerReference {
  customerId: string; // e.g. 'CUST-2026-8821'
  commercialRef: string; // e.g. 'Élevage Canaris Passion' or 'Jean Dupont'
  email?: string;
  country?: string;
  language?: 'fr' | 'en' | 'ar' | 'es' | 'it';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  orderIds: string[];
  licenseIds: string[];
}

export interface CustomerCreationInput {
  commercialRef: string;
  email?: string;
  country?: string;
  language?: 'fr' | 'en' | 'ar' | 'es' | 'it';
  notes?: string;
}

export interface CustomerFilterState {
  searchQuery: string;
  country: string;
  language: string;
}
