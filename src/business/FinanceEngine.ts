/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari, Depense, Vente } from '../types';

export class FinanceEngine {
  static isValidCurrencyAmount(value: number): boolean {
    if (!Number.isFinite(value) || value <= 0) return false;
    const millimes = Math.round(value * 1000);
    return Number.isSafeInteger(millimes) && Math.abs(value - (millimes / 1000)) < 1e-9;
  }

  static isEligibleForSale(bird: Canari, soldBirdIds: ReadonlySet<number> = new Set()): boolean {
    const healthStatus = bird.statut_sante?.trim().toLocaleLowerCase('fr') ?? '';
    const unavailableStatuses = ['décédé', 'mort', 'vendu', 'quarantaine', 'en quarantaine'];
    return !bird.archived
      && !soldBirdIds.has(bird.id)
      && !bird.quarantineId
      && !unavailableStatuses.includes(healthStatus);
  }

  static getExpenseTotalsByCategory(expenses: Depense[]): Record<string, number> {
    const totals: Record<string, number> = {};
    expenses.forEach(e => {
      totals[e.categorie] = (totals[e.categorie] || 0) + e.montant;
    });
    return totals;
  }

  static getSalesTotal(sales: Vente[]): number {
    return sales.reduce((sum, s) => sum + s.prix, 0);
  }

  static getExpensesTotal(expenses: Depense[]): number {
    return expenses.reduce((sum, e) => sum + e.montant, 0);
  }

  static getFinancialSummary(expenses: Depense[], sales: Vente[]): {
    totalExpenses: number;
    totalSales: number;
    netBalance: number;
    roiPercentage: number;
  } {
    const totalExpenses = this.getExpensesTotal(expenses);
    const totalSales = this.getSalesTotal(sales);
    const netBalance = totalSales - totalExpenses;
    const roiPercentage = totalExpenses > 0 ? Math.round((netBalance / totalExpenses) * 100) : 0;

    return {
      totalExpenses,
      totalSales,
      netBalance,
      roiPercentage
    };
  }
}
