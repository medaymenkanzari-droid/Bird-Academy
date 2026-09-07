/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Depense, Vente } from '../types';

export class FinanceModel {
  static getExpenseCategories(): string[] {
    return ['Alimentation', 'Santé', 'Matériel', 'Cages', 'Autre'];
  }

  static calculateNetBalance(expenses: Depense[], sales: Vente[]): number {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.montant, 0);
    const totalSales = sales.reduce((sum, s) => sum + s.prix, 0);
    return totalSales - totalExpenses;
  }
}
