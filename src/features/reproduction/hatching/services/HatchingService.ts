/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HatchingRepository } from '../repositories/HatchingRepository';
import { Hatching } from '../types';
import { EggService } from '../../eggs/services/EggService';
import { ClutchService } from '../../clutches/services/ClutchService';
import { ChickRepository } from '../../chicks/repositories/ChickRepository';
import { ChickService } from '../../chicks/services/ChickService';
import { GrowthRepository } from '../../growth/repositories/GrowthRepository';
import { ActivityLogger, EventType } from '../../../../storage/ActivityLogger';
import { ReproductionEngine } from '../../engines/ReproductionEngine';

export class HatchingService {
  static getHatchings(): Hatching[] {
    return HatchingRepository.getAll();
  }

  static getHatchingByEgg(eggId: string): Hatching | undefined {
    return HatchingRepository.getByEgg(eggId);
  }

  /**
   * Promotes an Egg to Hatched status and automatically instantiates a new Chick
   */
  static hatchEgg(
    eggId: string,
    hatchDate: string,
    birthWeight: number,
    assistance: 'none' | 'light' | 'full',
    observations: string
  ): { success: boolean; chickId?: string; message: string } {
    const egg = EggService.getEggById(eggId);
    if (!egg) {
      return { success: false, message: "Œuf introuvable" };
    }

    if (egg.status === 'Éclos') {
      return { success: false, message: "Cet œuf a déjà éclos." };
    }
    if (HatchingRepository.getByEgg(eggId)) {
      return { success: false, message: "Un résultat d’éclosion existe déjà pour cet œuf." };
    }
    if (!ReproductionEngine.isValidHistoricalDate(hatchDate) || hatchDate < egg.layingDate) {
      return { success: false, message: "La date d’éclosion est invalide, future ou antérieure à la ponte." };
    }
    if (!Number.isFinite(birthWeight) || birthWeight <= 0) {
      return { success: false, message: "Le poids de naissance doit être strictement positif." };
    }

    const clutch = ClutchService.getClutches().find(c => c.id === egg.clutchId);
    if (!clutch) {
      return { success: false, message: "Ponte introuvable." };
    }

    // 1. Update egg status to Éclos
    EggService.updateEggStatus(eggId, 'Éclos', `Éclosion le ${hatchDate}.`);

    // 2. Create the Hatching event
    const hatch = HatchingRepository.create({
      eggId,
      clutchId: egg.clutchId,
      pairId: clutch.pairId,
      hatchDate,
      weight: birthWeight,
      assistance,
      status: 'success',
      observations,
    });

    // 3. Create provisional ring/number & temp name
    const clutchNum = egg.clutchId.split('-')[1] || egg.clutchId.slice(-4);
    const provisionalNumber = `PROV-${clutchNum}-${egg.number}`;
    const tempName = `Poussin n°${egg.number} (${clutchNum})`;

    // 4. Create the Chick record
    const chick = ChickRepository.create({
      eggId,
      clutchId: egg.clutchId,
      pairId: clutch.pairId,
      name: tempName,
      provisionalNumber,
      hatchDate,
      birthWeight,
      status: 'growth',
      gender: 'Indéterminé',
      observations: observations || "Éclosion standard enregistrée.",
    });

    // 5. Link Chick back to Hatching record
    hatch.chickId = chick.id;
    HatchingRepository.update(hatch);

    // 6. Record birth weight in Growth weights
    GrowthRepository.addWeightRecord({
      chickId: chick.id,
      date: hatchDate,
      weight: birthWeight,
      notes: "Poids de naissance enregistré automatiquement.",
    });

    // 7. Add hatching timeline event
    ChickService.addEvent(
      chick.id,
      'hatch',
      `Éclosion de l'œuf n°${egg.number}. Poids à la naissance : ${birthWeight}g. Mode d'assistance : ${assistance}`,
      observations
    );

    // 8. Log with ActivityLogger
    ActivityLogger.log(
      EventType.JEUNE_ADD,
      `Félicitations ! Éclosion réussie de l'œuf n°${egg.number} de la ponte [Ponte #${clutchNum}]. Poussin [${provisionalNumber}] initialisé.`,
      { chickId: chick.id, provisionalNumber }
    );

    return {
      success: true,
      chickId: chick.id,
      message: `L'œuf n°${egg.number} a éclos avec succès. Poussin [${provisionalNumber}] initialisé.`,
    };
  }

  /**
   * Registers a failed hatching (dead in shell or during hatching)
   */
  static failHatching(eggId: string, date: string, reason: string): { success: boolean; message: string } {
    const egg = EggService.getEggById(eggId);
    if (!egg) {
      return { success: false, message: "Œuf introuvable" };
    }
    if (HatchingRepository.getByEgg(eggId)) {
      return { success: false, message: "Un résultat d’éclosion existe déjà pour cet œuf." };
    }
    if (!ReproductionEngine.isValidHistoricalDate(date) || date < egg.layingDate) {
      return { success: false, message: "La date d’échec est invalide, future ou antérieure à la ponte." };
    }

    const clutch = ClutchService.getClutches().find(c => c.id === egg.clutchId);
    if (!clutch) {
      return { success: false, message: "Ponte introuvable." };
    }

    // Update egg status
    EggService.updateEggStatus(eggId, 'Mort', `Mort dans la coquille / Échec d'éclosion le ${date}.`);

    // Create failed hatching record
    HatchingRepository.create({
      eggId,
      clutchId: egg.clutchId,
      pairId: clutch.pairId,
      hatchDate: date,
      weight: 0,
      assistance: 'none',
      status: 'failed',
      observations: reason || "Échec d'éclosion.",
    });

    return { success: true, message: "Échec de l'éclosion enregistré." };
  }
}
