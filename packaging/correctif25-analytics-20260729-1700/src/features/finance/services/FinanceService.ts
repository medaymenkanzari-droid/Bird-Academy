/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Depense, Vente } from '../../../types';
import { FinanceRepository } from '../repositories/FinanceRepository';
import { ActivityLogger, EventType } from '../../../storage/ActivityLogger';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { BirdService } from '../../birds/services/BirdService';
import { ReproductionRepository } from '../../reproduction/repositories/ReproductionRepository';
import { FinanceEngine } from '../../../business/FinanceEngine';

export interface FinanceServiceResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}

export class FinanceService {
  static getExpenses(): Depense[] {
    return FinanceRepository.getExpenses();
  }

  static getSales(): Vente[] {
    return FinanceRepository.getSales();
  }

  private static isValidCompletedOperationDate(date: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const parsed = new Date(`${date}T00:00:00.000Z`);
    return !Number.isNaN(parsed.getTime())
      && parsed.toISOString().slice(0, 10) === date
      && date <= new Date().toISOString().slice(0, 10);
  }

  private static isBirdInActivePair(canariId: number): boolean {
    return ReproductionRepository.filter({ archived: false, status: 'active' })
      .some(pair => pair.maleId === canariId || pair.femaleId === canariId);
  }

  static isBirdEligibleForSale(canariId: number): boolean {
    const bird = BirdRepository.getById(canariId);
    if (!bird) return false;

    const soldBirdIds = new Set(FinanceRepository.getSales().map(sale => sale.canari_id));
    return FinanceEngine.isEligibleForSale(bird, soldBirdIds)
      && !this.isBirdInActivePair(canariId);
  }

  static addExpense(date: string, montant: number, categorie: Depense['categorie'], description: string): FinanceServiceResponse<Depense> {
    const categories: Depense['categorie'][] = ['Alimentation', 'Santé', 'Matériel', 'Cages', 'Autre'];
    if (!this.isValidCompletedOperationDate(date)) {
      return { success: false, message: 'La date de dépense est invalide ou située dans le futur.' };
    }
    if (!FinanceEngine.isValidCurrencyAmount(montant)) {
      return { success: false, message: 'Le montant de la dépense doit être positif et limité à trois décimales.' };
    }
    if (!categories.includes(categorie)) {
      return { success: false, message: 'La catégorie de dépense est invalide.' };
    }
    if (!description.trim()) {
      return { success: false, message: 'La description de la dépense est obligatoire.' };
    }

    const normalizedDescription = description.trim();
    const added = FinanceRepository.addExpense({ date, montant, categorie, description: normalizedDescription });
    ActivityLogger.log(
      EventType.DEPENSE_ADD,
      `Dépense enregistrée : ${normalizedDescription} (${montant} DT - ${categorie})`,
      { id: added.id, montant, categorie }
    );
    return { success: true, data: added };
  }

  static addSale(canariId: number, prix: number, date: string, buyer: string, description: string): FinanceServiceResponse<Vente> {
    const bird = BirdRepository.getById(canariId);
    const soldBirdIds = new Set(FinanceRepository.getSales().map(sale => sale.canari_id));
    if (!bird) {
      return { success: false, message: "L'oiseau sélectionné est introuvable." };
    }
    if (soldBirdIds.has(canariId)) {
      return { success: false, message: 'Une vente existe déjà pour cet oiseau.' };
    }
    if (!FinanceEngine.isEligibleForSale(bird)) {
      return { success: false, message: "L'oiseau sélectionné est indisponible pour une vente." };
    }
    if (!this.isValidCompletedOperationDate(date)) {
      return { success: false, message: 'La date de vente est invalide ou située dans le futur.' };
    }
    if (!FinanceEngine.isValidCurrencyAmount(prix)) {
      return { success: false, message: 'Le prix de vente doit être positif et limité à trois décimales.' };
    }
    if (!buyer.trim()) {
      return { success: false, message: "Le nom de l'acheteur est obligatoire." };
    }
    if (this.isBirdInActivePair(canariId)) {
      return { success: false, message: "Dissolvez le couple actif de cet oiseau avant d'enregistrer sa vente." };
    }
    const normalizedBuyer = buyer.trim();
    const added = FinanceRepository.addSale({
      canari_id: canariId,
      prix,
      date,
      acheteur: normalizedBuyer,
      description: description.trim()
    });
    const archiveResult = BirdService.archive(canariId);
    if (!archiveResult.success) {
      FinanceRepository.deleteSale(added.id);
      return { success: false, message: "La vente n'a pas été conservée car l'oiseau n'a pas pu être archivé." };
    }
    ActivityLogger.log(
      EventType.VENTE_ADD,
      `Vente enregistrée : Oiseau ID ${canariId} vendu à ${normalizedBuyer} pour ${prix} DT`,
      { id: added.id, canariId, prix }
    );
    return { success: true, data: added };
  }
}
