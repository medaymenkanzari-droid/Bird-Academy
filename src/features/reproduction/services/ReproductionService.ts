/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BreedingPair, PairHistory, BreedingSeason, CompatibilityResult } from '../types';
import { ReproductionRepository } from '../repositories/ReproductionRepository';
import { ReproductionEngine } from '../engines/ReproductionEngine';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { ActivityLogger, EventType } from '../../../storage/ActivityLogger';
import { appStorage } from '../../../storage';

export class ReproductionService {
  private static getActivationError(maleId: number, femaleId: number, excludePairId?: string): string | null {
    const male = BirdRepository.getById(maleId);
    const female = BirdRepository.getById(femaleId);

    if (!male || !female) return 'Impossible de former ce couple : un des oiseaux est introuvable.';
    if (male.sexe !== 'Mâle' || female.sexe !== 'Femelle') {
      return "Impossible de former ce couple : sélectionnez un mâle et une femelle.";
    }
    if (male.archived || female.archived || male.statut_sante === 'Décédé' || female.statut_sante === 'Décédé') {
      return "Impossible de former ce couple : un oiseau archivé ou décédé ne peut pas être activé.";
    }

    const activePairs = ReproductionRepository.filter({ archived: false, status: 'active' });
    const maleBusy = activePairs.some(pair =>
      pair.id !== excludePairId && (pair.maleId === maleId || pair.femaleId === maleId)
    );
    const femaleBusy = activePairs.some(pair =>
      pair.id !== excludePairId && (pair.maleId === femaleId || pair.femaleId === femaleId)
    );
    if (maleBusy || femaleBusy) {
      return "Impossible de former ce couple : un des oiseaux appartient déjà à un couple actif.";
    }
    return null;
  }

  /**
   * Get all active/separated breeding pairs
   */
  static getPairs(includeArchived = false): BreedingPair[] {
    ReproductionRepository.migrate();
    return ReproductionRepository.filter({ archived: includeArchived ? undefined : false });
  }

  /**
   * Get single breeding pair by ID
   */
  static getPairById(id: string): BreedingPair | undefined {
    return ReproductionRepository.getById(id);
  }

  /**
   * Get compatibility score & validations before creating a couple
   */
  static getCompatibility(maleId: number, femaleId: number, t?: (key: string, vars?: any) => string): CompatibilityResult {
    const male = BirdRepository.getById(maleId);
    const female = BirdRepository.getById(femaleId);
    
    if (!male || !female) {
      return {
        score: 1,
        validations: [{
          type: 'risk',
          rule: 'REPRO_BIRDS_EXISTS',
          passed: false,
          message: t ? t('repro_error_not_found', { defaultValue: 'Oiseaux introuvables.' }) : 'Oiseaux introuvables.'
        }],
        recommendations: []
      };
    }

    const activePairs = ReproductionRepository.filter({ archived: false, status: 'active' });
    return ReproductionEngine.getCompatibility(male, female, activePairs, t);
  }

  /**
   * Create a new breeding pair
   */
  static createPair(maleId: number, femaleId: number, name?: string, notes?: string): BreedingPair {
    const activationError = this.getActivationError(maleId, femaleId);
    if (activationError) throw new Error(activationError);

    const male = BirdRepository.getById(maleId);
    const female = BirdRepository.getById(femaleId);

    const maleName = male ? (male.nom || male.bague) : `#${maleId}`;
    const femaleName = female ? (female.nom || female.bague) : `#${femaleId}`;
    const defaultName = `Couple ${maleName} x ${femaleName}`;

    const newPair: Omit<BreedingPair, 'id'> = {
      maleId,
      femaleId,
      name: name || defaultName,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'active',
      notes: notes || '',
      statistics: {
        pairId: '', // updated by repository
        reproductionsCount: 0,
        totalEggs: 0,
        fertileEggs: 0,
        hatchedEggs: 0,
        weanedChicks: 0,
        successRate: 0,
      }
    };

    const created = ReproductionRepository.create(newPair);
    
    // Add to Pair History timeline
    ReproductionRepository.addHistory({
      pairId: created.id,
      type: 'creation',
      description: `Formation du couple : ${created.name}`,
      details: { maleId, femaleId, maleName, femaleName }
    });

    // Log globally
    ActivityLogger.log(
      EventType.COUPLE_ADD,
      `Création du couple reproducteur : ${created.name}`,
      { pairId: created.id, maleId, femaleId }
    );

    return created;
  }

  /**
   * Update an existing pair (name, notes, etc)
   */
  static updatePair(pair: BreedingPair): BreedingPair {
    if (pair.status === 'active' && !pair.archived) {
      const activationError = this.getActivationError(pair.maleId, pair.femaleId, pair.id);
      if (activationError) throw new Error(activationError);
    }
    const updated = ReproductionRepository.update(pair);

    // Add to history
    ReproductionRepository.addHistory({
      pairId: pair.id,
      type: 'modification',
      description: `Modification des informations du couple : ${pair.name}`,
      details: { name: pair.name, notes: pair.notes }
    });

    return updated;
  }

  /**
   * Separate/Dissolve a pair
   */
  static dissolvePair(id: string): boolean {
    const pair = ReproductionRepository.getById(id);
    if (!pair) return false;

    pair.status = 'separated';
    pair.dateSeparated = new Date().toISOString().split('T')[0];
    ReproductionRepository.update(pair);

    // Add to history
    ReproductionRepository.addHistory({
      pairId: id,
      type: 'separation',
      description: `Séparation du couple : ${pair.name}`,
      details: { dateSeparated: pair.dateSeparated }
    });

    // Log globally
    ActivityLogger.log(
      EventType.COUPLE_DISSOLVE,
      `Séparation du couple reproducteur : ${pair.name}`,
      { pairId: id }
    );

    return true;
  }

  /**
   * Reactivate a separated pair
   */
  static reactivatePair(id: string): boolean {
    const pair = ReproductionRepository.getById(id);
    if (!pair) return false;

    const activationError = this.getActivationError(pair.maleId, pair.femaleId, id);
    if (activationError) throw new Error(activationError);

    pair.status = 'active';
    delete pair.dateSeparated;
    ReproductionRepository.update(pair);

    // Add to history
    ReproductionRepository.addHistory({
      pairId: id,
      type: 'reactivation',
      description: `Réactivation du couple : ${pair.name}`
    });

    // Log globally
    ActivityLogger.log(
      EventType.BIRD_REPRODUCTION,
      `Réactivation du couple reproducteur : ${pair.name}`,
      { pairId: id }
    );

    return true;
  }

  /**
   * Archive a pair
   */
  static archivePair(id: string): boolean {
    const pair = ReproductionRepository.getById(id);
    if (!pair) return false;

    const success = ReproductionRepository.archive(id);
    if (success) {
      // Add to history
      ReproductionRepository.addHistory({
        pairId: id,
        type: 'archived',
        description: `Archivage du couple : ${pair.name}`
      });

      // Log globally
      ActivityLogger.log(
        EventType.BIRD_ARCHIVE,
        `Archivage du couple reproducteur : ${pair.name}`,
        { pairId: id }
      );
    }
    return success;
  }

  /**
   * Restore an archived pair
   */
  static restorePair(id: string): boolean {
    const pair = ReproductionRepository.getById(id);
    if (!pair) return false;

    if (pair.status === 'active') {
      const activationError = this.getActivationError(pair.maleId, pair.femaleId, id);
      if (activationError) throw new Error(activationError);
    }

    const success = ReproductionRepository.restore(id);
    if (success) {
      // Add to history
      ReproductionRepository.addHistory({
        pairId: id,
        type: 'restored',
        description: `Restauration du couple archivé : ${pair.name}`
      });

      // Log globally
      ActivityLogger.log(
        EventType.BIRD_RESTORE,
        `Restauration du couple reproducteur : ${pair.name}`,
        { pairId: id }
      );
    }
    return success;
  }

  /**
   * Get timeline history for a specific pair
   */
  static getPairHistory(pairId: string): PairHistory[] {
    return ReproductionRepository.getHistory(pairId);
  }

  /**
   * Calculate all aggregate statistics for a pair
   */
  static getPairStatistics(pairId: string): BreedingPair['statistics'] {
    const pair = ReproductionRepository.getById(pairId);
    if (!pair) {
      return {
        pairId,
        reproductionsCount: 0,
        totalEggs: 0,
        fertileEggs: 0,
        hatchedEggs: 0,
        weanedChicks: 0,
        successRate: 0
      };
    }

    // Read reproductions from legacy tables to build up to date stats
    let legacyCoupleId: number | null = null;
    if (pairId.startsWith('bp-')) {
      legacyCoupleId = parseInt(pairId.replace('bp-', ''), 10);
    } else {
      legacyCoupleId = parseInt(pairId, 10);
    }

    const legacyReproductions = appStorage.getItem<any[]>('reproductions', []);
    const pairReproductions = legacyReproductions.filter(r => r.couple_id === legacyCoupleId);
    const reproIds = pairReproductions.map(r => r.id);

    const legacyPontes = appStorage.getItem<any[]>('pontes', []);
    const pairPontes = legacyPontes.filter(p => reproIds.includes(p.reproduction_id));

    let totalEggs = 0;
    let fertileEggs = 0;
    let hatchedEggs = 0;
    let weanedChicks = 0;

    pairPontes.forEach(p => {
      totalEggs += p.oeufs || 0;
      fertileEggs += p.oeufs_fecondes || 0;
      hatchedEggs += p.eclosions || 0;
      weanedChicks += p.sevrages || 0;
    });

    const successRate = totalEggs > 0 ? Math.round((weanedChicks / totalEggs) * 100) : 0;

    return {
      pairId,
      reproductionsCount: pairReproductions.length,
      totalEggs,
      fertileEggs,
      hatchedEggs,
      weanedChicks,
      successRate
    };
  }
}
