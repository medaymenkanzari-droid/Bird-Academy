/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Depense, Vente } from '../../../types';
import { appStorage } from '../../../storage';

export class FinanceRepository {
  private static EXPENSES_KEY = 'depenses';
  private static SALES_KEY = 'ventes';

  // --- EXPENSES ---
  static getExpenses(): Depense[] {
    return appStorage.getItem<Depense[]>(this.EXPENSES_KEY, []);
  }

  static saveExpenses(expenses: Depense[]): void {
    appStorage.setItem(this.EXPENSES_KEY, expenses);
  }

  static addExpense(expense: Omit<Depense, 'id'>): Depense {
    const list = this.getExpenses();
    const nextId = list.length > 0 ? Math.max(...list.map(d => d.id)) + 1 : 1;
    const newExpense = { ...expense, id: nextId };
    list.push(newExpense);
    this.saveExpenses(list);
    return newExpense;
  }

  static deleteExpense(id: number): boolean {
    const list = this.getExpenses();
    const filtered = list.filter(d => d.id !== id);
    if (filtered.length !== list.length) {
      this.saveExpenses(filtered);
      return true;
    }
    return false;
  }

  // --- SALES ---
  static getSales(): Vente[] {
    return appStorage.getItem<Vente[]>(this.SALES_KEY, []);
  }

  static saveSales(sales: Vente[]): void {
    appStorage.setItem(this.SALES_KEY, sales);
  }

  static addSale(sale: Omit<Vente, 'id'>): Vente {
    const list = this.getSales();
    const nextId = list.length > 0 ? Math.max(...list.map(v => v.id)) + 1 : 1;
    const newSale = { ...sale, id: nextId };
    list.push(newSale);
    this.saveSales(list);
    return newSale;
  }

  static deleteSale(id: number): boolean {
    const list = this.getSales();
    const filtered = list.filter(v => v.id !== id);
    if (filtered.length !== list.length) {
      this.saveSales(filtered);
      return true;
    }
    return false;
  }

  // --- GENERIC ---
  static searchExpenses(query: string): Depense[] {
    const list = this.getExpenses();
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(d => 
      d.description.toLowerCase().includes(q) || 
      d.categorie.toLowerCase().includes(q)
    );
  }

  static searchSales(query: string): Vente[] {
    const list = this.getSales();
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter(s => 
      s.acheteur?.toLowerCase().includes(q) || 
      (s.description && s.description.toLowerCase().includes(q))
    );
  }

  static migrate(): void {
    if (!appStorage.getItem(this.EXPENSES_KEY, null)) {
      appStorage.setItem(this.EXPENSES_KEY, []);
    }
    if (!appStorage.getItem(this.SALES_KEY, null)) {
      appStorage.setItem(this.SALES_KEY, []);
    }
  }
}
