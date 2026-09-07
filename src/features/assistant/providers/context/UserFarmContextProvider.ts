/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BirdRepository } from '../../../birds/repositories/BirdRepository';
import { ReproductionRepository } from '../../../reproduction/repositories/ReproductionRepository';
import { HabitatRepository } from '../../../habitat/repositories/HabitatRepository';
import { HealthRepository } from '../../../health/repositories/HealthRepository';
import { FinanceRepository } from '../../../finance/repositories/FinanceRepository';
import { HabitatCage } from '../../../../types';
import { 
  BirdContext, 
  BreedingPairContext, 
  BreedingContext, 
  HealthContext, 
  HabitatContext, 
  GenealogyContext, 
  FinanceContext,
  HealthRecordSummary
} from '../../types/context';

export class UserFarmContextProvider {
  /**
   * Retrieves minimal necessary bird context for a single bird.
   */
  static getBirdContext(birdId: number): BirdContext | null {
    if (!birdId) return null;
    const bird = BirdRepository.getById(birdId);
    if (!bird) return null;

    let ageMonths: number | undefined;
    if (bird.date_naissance) {
      const birth = new Date(bird.date_naissance);
      const now = new Date();
      if (!isNaN(birth.getTime())) {
        ageMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
        if (ageMonths < 0) ageMonths = 0;
      }
    }

    let cageNom: string | undefined;
    const rawCageId = bird.cageId || (bird.cage_id !== undefined && bird.cage_id !== null ? String(bird.cage_id) : undefined);
    if (rawCageId) {
      const cage = HabitatRepository.getById<HabitatCage>('cage', rawCageId);
      cageNom = cage?.nom;
    }

    return {
      id: bird.id,
      nom: bird.nom,
      bague: bird.bague,
      sexe: bird.sexe,
      espece: bird.espece,
      race: bird.race,
      couleur: bird.couleur,
      dateNaissance: bird.date_naissance,
      ageMonths,
      statutSante: bird.statut_sante,
      cageId: bird.cageId || bird.cage_id,
      cageNom,
      pereId: bird.pere_id,
      mereId: bird.mere_id,
      archived: bird.archived
    };
  }

  /**
   * Finds minimal bird context by name or ring matching.
   */
  static findBirdByNameOrRing(query: string): BirdContext | null {
    if (!query) return null;
    const normalized = query.trim().toLowerCase();
    const birds = BirdRepository.getAll();

    const matched = birds.find(b => 
      (b.nom && b.nom.toLowerCase().includes(normalized)) ||
      (b.bague && b.bague.toLowerCase().includes(normalized))
    );

    return matched ? this.getBirdContext(matched.id) : null;
  }

  /**
   * Retrieves selective breeding context for a specific pair or active clutches.
   */
  static getBreedingContext(pairId?: string | number): BreedingContext | null {
    const pairs = ReproductionRepository.getAll();
    const activePairs = pairs.filter(p => p.status === 'active');

    let pairContext: BreedingPairContext | undefined;
    if (pairId !== undefined) {
      const targetPair = pairs.find(p => String(p.id) === String(pairId));
      if (targetPair) {
        const male = BirdRepository.getById(targetPair.maleId);
        const female = BirdRepository.getById(targetPair.femaleId);

        pairContext = {
          id: targetPair.id,
          maleId: targetPair.maleId,
          maleNom: male?.nom,
          maleBague: male?.bague,
          femelleId: targetPair.femaleId,
          femelleNom: female?.nom,
          femelleBague: female?.bague,
          dateCreation: targetPair.dateCreated || '',
          statut: targetPair.status,
          totalEggsLaid: targetPair.statistics?.totalEggs,
          totalChicksHatched: targetPair.statistics?.hatchedEggs
        };
      }
    }

    return {
      pair: pairContext,
      totalActivePairs: activePairs.length
    };
  }

  /**
   * Retrieves selective health records for a specific bird or high-level health metrics.
   */
  static getHealthContext(birdId?: number): HealthContext | null {
    const allRecords = HealthRepository.getAll();
    const targetRecords = birdId 
      ? allRecords.filter(r => r.canari_id === birdId)
      : allRecords.slice(0, 5);

    const recordsSummary: HealthRecordSummary[] = targetRecords.map(r => ({
      id: r.id,
      birdId: r.canari_id,
      date: r.date,
      traitement: r.traitement,
      categorie: r.categorie,
      description: r.description,
      statut: r.statut
    }));

    const activeTreatmentsCount = allRecords.filter(r => r.statut === 'En attente').length;
    const birds = BirdRepository.getAll();
    const quarantineCount = birds.filter(b => Boolean(b.quarantaine && b.quarantaine.date_entree)).length;

    return {
      birdId,
      records: recordsSummary,
      activeTreatmentsCount,
      quarantineCount
    };
  }

  /**
   * Retrieves selective habitat context.
   */
  static getHabitatContext(cageId?: string | number): HabitatContext | null {
    const cages = HabitatRepository.getAll<HabitatCage>('cage');

    if (cageId !== undefined) {
      const cageIdStr = String(cageId);
      const cage = cages.find(c => String(c.id) === cageIdStr);
      if (cage) {
        const birds = BirdRepository.getAll();
        const occupants = birds.filter(b => String(b.cageId || b.cage_id) === cageIdStr);

        return {
          cageId: cage.id,
          cageNom: cage.nom,
          capaciteMax: cage.capacite_max,
          currentOccupancy: occupants.length,
          isOvercrowded: occupants.length > cage.capacite_max,
          totalCagesCount: cages.length
        };
      }
    }

    return {
      totalCagesCount: cages.length
    };
  }

  /**
   * Retrieves selective genealogy context for a bird.
   */
  static getGenealogyContext(birdId: number): GenealogyContext | null {
    const bird = BirdRepository.getById(birdId);
    if (!bird) return null;

    let pere: { id: number; nom: string; bague: string } | undefined;
    let mere: { id: number; nom: string; bague: string } | undefined;

    if (bird.pere_id) {
      const p = BirdRepository.getById(bird.pere_id);
      if (p) pere = { id: p.id, nom: p.nom, bague: p.bague };
    }

    if (bird.mere_id) {
      const m = BirdRepository.getById(bird.mere_id);
      if (m) mere = { id: m.id, nom: m.nom, bague: m.bague };
    }

    return {
      birdId: bird.id,
      nom: bird.nom,
      bague: bird.bague,
      pere,
      mere
    };
  }

  /**
   * Retrieves selective finance summary context.
   */
  static getFinanceSummaryContext(): FinanceContext | null {
    const expenses = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();

    const totalExpenses = expenses.reduce((sum, e) => sum + (Number.isFinite(e.montant) && e.montant >= 0 ? e.montant : 0), 0);
    const totalRevenue = sales.reduce((sum, s) => sum + (Number.isFinite(s.prix) && s.prix >= 0 ? s.prix : 0), 0);
    const netBalance = totalRevenue - totalExpenses;

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netBalance: Number(netBalance.toFixed(2)),
      currency: 'DT',
      recentExpensesCount: expenses.length,
      recentSalesCount: sales.length
    };
  }
}
