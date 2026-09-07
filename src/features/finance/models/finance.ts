/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Depense, Vente, Canari } from '../../../types';

export type TransactionType = 'sale' | 'expense';

export type PaymentMethod = 'Espèces' | 'Virement Bancaire' | 'Carte Bancaire' | 'Chèque' | 'Autre';

export interface UnifiedTransaction {
  id: string; // e.g. 'sale-1' or 'exp-2'
  originalId: number;
  type: TransactionType;
  date: string;
  reference: string;
  category: string;
  description: string;
  partyName: string; // Buyer name or Supplier name
  amount: number; // Positive value
  paymentMethod?: PaymentMethod;
  linkedBirdId?: number;
  linkedBird?: Canari;
  status: 'completed' | 'pending';
}

export interface MonthlyCashFlowPoint {
  monthKey: string; // '2026-01'
  monthLabel: string; // 'Janv.'
  salesAmount: number;
  expensesAmount: number;
  netMargin: number;
}

export interface CategoryExpenseBreakdown {
  category: Depense['categorie'];
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface TransferCertificateData {
  certificateNumber: string;
  issueDate: string;
  seller: {
    name: string;
    affix?: string;
    stammNumber?: string;
    phone?: string;
    address?: string;
  };
  buyer: {
    name: string;
    phone?: string;
    address?: string;
  };
  bird: {
    id: number;
    bague: string;
    nom?: string;
    species: string;
    race?: string;
    sexe: string;
    mutation?: string;
    date_naissance?: string;
    healthStatus: string;
  };
  price: number;
  paymentMethod: string;
  specialConditions?: string;
}
