/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WeaningRepository } from '../repositories/WeaningRepository';
import { Weaning } from '../types';
import { ChickRepository } from '../../chicks/repositories/ChickRepository';
import { ChickService } from '../../chicks/services/ChickService';
import { BirdService } from '../../../birds/services/BirdService';
import { ReproductionRepository } from '../../repositories/ReproductionRepository';
import { ActivityLogger, EventType } from '../../../../storage/ActivityLogger';
import { EggService } from '../../eggs/services/EggService';
import { Canari } from '../../../../types';

export class WeaningService {
  static getWeanings(): Weaning[] {
    return WeaningRepository.getAll();
  }

  static getWeaningByChick(chickId: string): Weaning | undefined {
    return WeaningRepository.getByChick(chickId);
  }

  /**
   * Finalizes the weaning process of a chick
   */
  static finalizeWeaning(
    chickId: string,
    date: string,
    weight: number,
    status: 'success' | 'abandoned' | 'failed',
    observations: string
  ): { success: boolean; weaning?: Weaning; message: string } {
    const chick = ChickRepository.getById(chickId);
    if (!chick) {
      return { success: false, message: "Poussin introuvable." };
    }

    if (chick.status === 'weaned' || chick.status === 'independent') {
      return { success: false, message: "Ce poussin est déjà sevré." };
    }

    const age = ChickService.calculateAgeInDays(chick.hatchDate);
    const success = status === 'success';

    // 1. Create Weaning record
    const weaning = WeaningRepository.create({
      chickId,
      date,
      age,
      weight,
      status,
      success,
      observations,
    });

    // 2. Update Chick Status
    const nextStatus = success ? 'weaned' : (status === 'failed' ? 'deceased' : 'weaning');
    ChickService.updateStatus(chickId, nextStatus, `Fin du sevrage : ${status}`);

    // 3. Add timeline event
    if (success) {
      ChickService.addEvent(
        chickId,
        'weaning_complete',
        `Sevrage réussi à J+${age} ! Poids au sevrage : ${weight}g. Le poussin est désormais prêt à être bagué et promu en tant qu'oiseau indépendant.`,
        observations
      );

      // Log activity
      ActivityLogger.log(
        EventType.JEUNE_WEAN,
        `Sevrage réussi pour le poussin "${chick.name}" [${chick.provisionalNumber}] à J+${age}.`,
        { chickId, age, weight }
      );
    } else {
      ChickService.addEvent(
        chickId,
        status === 'failed' ? 'death' : 'weaning_start',
        `Tentative de sevrage clôturée avec statut : ${status}.`,
        observations
      );
    }

    return {
      success: true,
      weaning,
      message: success 
        ? "Sevrage réussi et enregistré. Le poussin peut maintenant être promu en oiseau indépendant."
        : "Sevrage finalisé avec échec ou abandon.",
    };
  }

  /**
   * Promotes a successfully weaned chick to a full Independent Bird in the academy register.
   * Copies genetics, species, mutation, and records biological lineage.
   */
  static promoteToIndependentBird(
    chickId: string,
    customRingNumber: string,
    cageId: number,
    customName?: string
  ): { success: boolean; bird?: Canari; message: string } {
    const chick = ChickRepository.getById(chickId);
    if (!chick) {
      return { success: false, message: "Poussin introuvable." };
    }

    if (chick.status !== 'weaned') {
      return { success: false, message: "Seul un poussin ayant terminé son sevrage avec succès peut être promu en oiseau." };
    }

    const weaning = WeaningRepository.getByChick(chickId);
    if (!weaning) {
      return { success: false, message: "Dossier de sevrage manquant pour ce poussin." };
    }

    // Retrieve breeding pair and parents
    const pair = ReproductionRepository.getById(chick.pairId);
    let species = "canari";
    let category = "canari_couleur";
    let breed = "Canari de Couleur";
    let mutation = "Classique";
    let baseColor = "Jaune";
    let factor = "Intense";
    let fatherId: number | null = null;
    let motherId: number | null = null;

    if (pair) {
      fatherId = pair.maleId;
      motherId = pair.femaleId;

      // Try to fetch parent details to inherit lineage phenotypic attributes
      const fatherBird = BirdService.getById(fatherId);
      const motherBird = BirdService.getById(motherId);

      if (fatherBird) {
        species = fatherBird.espece || species;
        category = fatherBird.categorie || category;
        breed = fatherBird.race || breed;
        mutation = fatherBird.mutation || mutation;
        baseColor = fatherBird.couleur_base || baseColor;
        factor = fatherBird.facteur || factor;
      } else if (motherBird) {
        species = motherBird.espece || species;
        category = motherBird.categorie || category;
        breed = motherBird.race || breed;
        mutation = motherBird.mutation || mutation;
        baseColor = motherBird.couleur_base || baseColor;
        factor = motherBird.facteur || factor;
      }
    }

    // Inherit documents and photos placeholder from egg inspections or parents if wanted
    const egg = EggService.getEggById(chick.eggId);
    const remarks = `Oiseau issu du cycle de reproduction de la ponte #${chick.clutchId.split('-')[1] || '6.3'}. Tracé complet depuis l'œuf n°${egg?.number || 'indéterminé'}.`;

    // 5. Create new Bird in central registry
    const birdResponse = BirdService.create({
      bague: customRingNumber,
      nom: customName || chick.name || `Jeune [${customRingNumber}]`,
      sexe: chick.gender,
      espece: species,
      categorie: category,
      race: breed,
      mutation,
      couleur_base: baseColor,
      facteur: factor,
      couleur: `${baseColor} ${factor}`,
      date_naissance: chick.hatchDate,
      cage_id: cageId,
      pere_id: fatherId,
      mere_id: motherId,
      observations: remarks,
      archived: false,
      photos: [],
      documents: []
    });

    if (!birdResponse.success || !birdResponse.data) {
      return { 
        success: false, 
        message: birdResponse.message || "Impossible de créer l'oiseau dans le registre principal (Vérifiez l'unicité de la bague)." 
      };
    }

    const createdBird = birdResponse.data;

    // 6. Update weaning dossier with final bird link
    weaning.finalBirdId = createdBird.id;
    WeaningRepository.update(weaning);

    // 7. Mark chick status as independent (fully integrated)
    chick.status = 'independent';
    ChickRepository.update(chick);

    // 8. Add timeline tracking event
    ChickService.addEvent(
      chickId,
      'bird_creation',
      `Promotion accomplie ! Le poussin est désormais un oiseau autonome enregistré sous la bague : ${customRingNumber}. ID Registre : #${createdBird.id}.`
    );

    ActivityLogger.log(
      EventType.BIRD_ADD,
      `Intégration réussie de l'oiseau bagué ${customRingNumber} depuis le cycle biologique d'éclosion.`,
      { birdId: createdBird.id, bague: customRingNumber }
    );

    return {
      success: true,
      bird: createdBird,
      message: `Félicitations ! Le poussin a été promu avec succès en oiseau indépendant bagué [${customRingNumber}].`,
    };
  }
}
