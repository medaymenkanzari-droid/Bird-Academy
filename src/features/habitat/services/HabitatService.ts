/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HabitatRepository } from '../repositories/HabitatRepository';
import { HabitatEngine } from '../../../business/HabitatEngine';
import { BirdService } from '../../birds/services/BirdService';
import { ActivityLogger, EventType } from '../../../storage/ActivityLogger';
import { 
  Canari, DeplacementRecord, QuarantineRecord, Facility, Zone, Aviary, 
  HabitatCage, Compartment, QuarantineArea 
} from '../../../types';

export interface BirdLocationSummary {
  type: 'cage' | 'aviary' | 'quarantineArea' | 'compartment' | 'zone' | 'facility' | 'unknown';
  typeLabelKey: string;
  id?: string;
  nom: string;
  zoneId?: string;
  zoneNom?: string;
  facilityId?: string;
  facilityNom?: string;
  capaciteMax?: number;
  isQuarantine: boolean;
  compartmentNom?: string;
  dateEntree?: string;
}

export class HabitatService {
  private static resolveBirdOrigin(bird: Canari): Pick<DeplacementRecord, 'origineType' | 'origineId' | 'origineNom'> {
    let origineType: DeplacementRecord['origineType'] = 'Inconnu';
    let origineId = 'Inconnu';

    if (bird.quarantineId) {
      origineType = 'Quarantine';
      origineId = bird.quarantineId;
    } else if (bird.compartmentId) {
      origineType = 'Compartment';
      origineId = bird.compartmentId;
    } else if (bird.cageId || bird.cage_id) {
      origineType = 'Cage';
      origineId = bird.cageId ? String(bird.cageId) : String(bird.cage_id);
    } else if (bird.aviaryId) {
      origineType = 'Aviary';
      origineId = bird.aviaryId;
    } else if (bird.zoneId) {
      origineType = 'Zone';
      origineId = bird.zoneId;
    } else if (bird.facilityId) {
      origineType = 'Facility';
      origineId = bird.facilityId;
    }

    if (origineId === 'Inconnu') {
      return { origineType, origineId, origineNom: 'Origine Inconnue' };
    }
    const repositoryType = origineType === 'Quarantine'
      ? 'quarantineArea'
      : origineType.charAt(0).toLowerCase() + origineType.slice(1);
    return {
      origineType,
      origineId,
      origineNom: this.getLocationName(repositoryType, origineId)
    };
  }

  /**
   * Helper to format human-readable names for locations
   */
  static getLocationName(type: string, id: string): string {
    if (!id || id === 'Inconnu') return 'Non spécifié';
    try {
      const item = HabitatRepository.getById<any>(type as any, id);
      return item ? item.nom : `${type} #${id}`;
    } catch {
      return `${type} #${id}`;
    }
  }

  /**
   * Resolves complete hierarchical location summary for a bird across all habitat types.
   */
  static getBirdLocationSummary(bird: Canari | null | undefined): BirdLocationSummary {
    if (!bird) {
      return {
        type: 'unknown',
        typeLabelKey: 'locationTypeUnknown',
        nom: 'Non assigné',
        isQuarantine: false
      };
    }

    // 1. Check Quarantine
    if (bird.quarantineId) {
      const qArea = HabitatRepository.getById<QuarantineArea>('quarantineArea', bird.quarantineId);
      const facility = qArea?.facilityId ? HabitatRepository.getById<Facility>('facility', qArea.facilityId) : undefined;
      return {
        type: 'quarantineArea',
        typeLabelKey: 'locationTypeQuarantine',
        id: bird.quarantineId,
        nom: qArea ? qArea.nom : `Quarantaine #${bird.quarantineId}`,
        facilityId: qArea?.facilityId,
        facilityNom: facility?.nom,
        capaciteMax: qArea?.capacite_max,
        isQuarantine: true,
        dateEntree: bird.quarantaine?.date_entree
      };
    }

    // 2. Check Compartment
    if (bird.compartmentId) {
      const comp = HabitatRepository.getById<Compartment>('compartment', bird.compartmentId);
      const cage = comp?.cageId ? HabitatRepository.getById<HabitatCage>('cage', comp.cageId) : undefined;
      const zone = cage?.zoneId ? HabitatRepository.getById<Zone>('zone', cage.zoneId) : undefined;
      const facility = zone?.facilityId ? HabitatRepository.getById<Facility>('facility', zone.facilityId) : undefined;
      return {
        type: 'compartment',
        typeLabelKey: 'locationTypeCompartment',
        id: bird.compartmentId,
        nom: comp ? comp.nom : `Compartiment #${bird.compartmentId}`,
        compartmentNom: comp?.nom,
        zoneId: cage?.zoneId,
        zoneNom: zone?.nom,
        facilityId: zone?.facilityId,
        facilityNom: facility?.nom,
        capaciteMax: comp?.capacite_max,
        isQuarantine: false
      };
    }

    // 3. Check Cage (V2 & Legacy)
    if (bird.cageId || (bird.cage_id !== undefined && bird.cage_id !== null)) {
      const cageIdStr = bird.cageId ? String(bird.cageId) : String(bird.cage_id);
      const cage = HabitatRepository.getById<HabitatCage>('cage', cageIdStr);
      const legacy = !cage ? HabitatRepository.getAllLegacy().find(c => String(c.id) === cageIdStr) : undefined;
      const zoneId = cage?.zoneId || bird.zoneId;
      const zone = zoneId ? HabitatRepository.getById<Zone>('zone', zoneId) : undefined;
      const facilityId = zone?.facilityId || bird.facilityId;
      const facility = facilityId ? HabitatRepository.getById<Facility>('facility', facilityId) : undefined;

      return {
        type: 'cage',
        typeLabelKey: 'locationTypeCage',
        id: cageIdStr,
        nom: cage ? cage.nom : (legacy ? legacy.nom : `Cage #${cageIdStr}`),
        zoneId,
        zoneNom: zone?.nom,
        facilityId,
        facilityNom: facility?.nom,
        capaciteMax: cage?.capacite_max || legacy?.capacite_max,
        isQuarantine: false
      };
    }

    // 4. Check Aviary
    if (bird.aviaryId) {
      const aviary = HabitatRepository.getById<Aviary>('aviary', bird.aviaryId);
      const zoneId = aviary?.zoneId || bird.zoneId;
      const zone = zoneId ? HabitatRepository.getById<Zone>('zone', zoneId) : undefined;
      const facilityId = zone?.facilityId || bird.facilityId;
      const facility = facilityId ? HabitatRepository.getById<Facility>('facility', facilityId) : undefined;

      return {
        type: 'aviary',
        typeLabelKey: 'locationTypeAviary',
        id: bird.aviaryId,
        nom: aviary ? aviary.nom : `Volière #${bird.aviaryId}`,
        zoneId,
        zoneNom: zone?.nom,
        facilityId,
        facilityNom: facility?.nom,
        capaciteMax: aviary?.capacite_max,
        isQuarantine: false
      };
    }

    // 5. Check Zone
    if (bird.zoneId) {
      const zone = HabitatRepository.getById<Zone>('zone', bird.zoneId);
      const facilityId = zone?.facilityId || bird.facilityId;
      const facility = facilityId ? HabitatRepository.getById<Facility>('facility', facilityId) : undefined;

      return {
        type: 'zone',
        typeLabelKey: 'locationTypeZone',
        id: bird.zoneId,
        nom: zone ? zone.nom : `Zone #${bird.zoneId}`,
        zoneId: bird.zoneId,
        zoneNom: zone?.nom,
        facilityId,
        facilityNom: facility?.nom,
        isQuarantine: Boolean(zone?.isQuarantine)
      };
    }

    // 6. Check Facility
    if (bird.facilityId) {
      const facility = HabitatRepository.getById<Facility>('facility', bird.facilityId);
      return {
        type: 'facility',
        typeLabelKey: 'locationTypeFacility',
        id: bird.facilityId,
        nom: facility ? facility.nom : `Élevage #${bird.facilityId}`,
        facilityId: bird.facilityId,
        facilityNom: facility?.nom,
        isQuarantine: false
      };
    }

    // Fallback: Unknown / Unassigned
    return {
      type: 'unknown',
      typeLabelKey: 'locationTypeUnknown',
      nom: 'Non assigné',
      isQuarantine: false
    };
  }

  /**
   * Retrieves all displacement records for a specific bird sorted chronologically (newest first).
   */
  static getBirdDeplacements(birdId: number): DeplacementRecord[] {
    if (!birdId) return [];
    const all = HabitatRepository.getAll<DeplacementRecord>('deplacementRecord');
    return all
      .filter(d => d.birdId === birdId)
      .sort((a, b) => {
        const timeA = new Date(a.date || a.createdAt || 0).getTime();
        const timeB = new Date(b.date || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }

  /**
   * Moves a bird to a new habitat with full validations and logging
   */
  static moveBird(
    birdId: number,
    destinationType: 'facility' | 'zone' | 'aviary' | 'cage' | 'compartment' | 'quarantineArea',
    destinationId: string,
    motif: string,
    user: string,
    commentaire?: string
  ): { success: boolean; message: string; error?: string } {
    const bird = BirdService.getById(birdId);
    if (!bird) {
      return { success: false, message: "L'oiseau spécifié n'existe pas." };
    }

    const allBirds = BirdService.getBirds(true);

    // 1. Run validations via HabitatEngine
    const validationErrors = HabitatEngine.validateBirdAssignment(
      bird,
      destinationType,
      destinationId,
      allBirds
    );

    if (validationErrors.length > 0) {
      return { 
        success: false, 
        message: "Échec de la validation du déplacement.", 
        error: validationErrors[0].message 
      };
    }

    // 2. Identify Origin Container
    const { origineType, origineId, origineNom } = this.resolveBirdOrigin(bird);

    // 3. Update bird location properties
    const updatedBird = { ...bird };

    // Clear previous location hierarchy
    updatedBird.facilityId = undefined;
    updatedBird.zoneId = undefined;
    updatedBird.aviaryId = undefined;
    updatedBird.cageId = undefined;
    updatedBird.compartmentId = undefined;
    updatedBird.quarantineId = undefined;
    updatedBird.cage_id = undefined;

    // Apply destination
    if (destinationType === 'compartment') {
      updatedBird.compartmentId = destinationId;
      const comp = HabitatRepository.getById<Compartment>('compartment', destinationId);
      if (comp) {
        updatedBird.cageId = comp.cageId;
        const cage = HabitatRepository.getById<HabitatCage>('cage', comp.cageId);
        if (cage) {
          updatedBird.zoneId = cage.zoneId;
          updatedBird.aviaryId = cage.aviaryId;
          const zone = HabitatRepository.getById<Zone>('zone', cage.zoneId);
          if (zone) updatedBird.facilityId = zone.facilityId;
        }
      }
    } else if (destinationType === 'cage') {
      updatedBird.cageId = destinationId;
      // Also write numeric for old page compatibility
      const numId = parseInt(destinationId, 10);
      if (!isNaN(numId)) {
        updatedBird.cage_id = numId;
      }
      
      const cage = HabitatRepository.getById<HabitatCage>('cage', destinationId);
      if (cage) {
        updatedBird.zoneId = cage.zoneId;
        updatedBird.aviaryId = cage.aviaryId;
        const zone = HabitatRepository.getById<Zone>('zone', cage.zoneId);
        if (zone) updatedBird.facilityId = zone.facilityId;
      }
    } else if (destinationType === 'aviary') {
      updatedBird.aviaryId = destinationId;
      const aviary = HabitatRepository.getById<Aviary>('aviary', destinationId);
      if (aviary) {
        updatedBird.zoneId = aviary.zoneId;
        const zone = HabitatRepository.getById<Zone>('zone', aviary.zoneId);
        if (zone) updatedBird.facilityId = zone.facilityId;
      }
    } else if (destinationType === 'zone') {
      updatedBird.zoneId = destinationId;
      const zone = HabitatRepository.getById<Zone>('zone', destinationId);
      if (zone) updatedBird.facilityId = zone.facilityId;
    } else if (destinationType === 'facility') {
      updatedBird.facilityId = destinationId;
    } else if (destinationType === 'quarantineArea') {
      updatedBird.quarantineId = destinationId;
      updatedBird.statut_sante = 'Quarantaine';
    }

    // Save Bird
    const saveResp = BirdService.update(updatedBird);
    if (!saveResp.success) {
      return { success: false, message: "Impossible de mettre à jour la localisation de l'oiseau.", error: saveResp.message };
    }

    // 4. Create Deplacement Record
    const destNom = this.getLocationName(destinationType === 'quarantineArea' ? 'quarantineArea' : destinationType, destinationId);
    const deplacement: DeplacementRecord = HabitatRepository.create<DeplacementRecord>('deplacementRecord', {
      birdId,
      origineType,
      origineId,
      origineNom,
      destinationType: destinationType === 'quarantineArea' ? 'Quarantine' : destinationType.charAt(0).toUpperCase() + destinationType.slice(1) as any,
      destinationId,
      destinationNom: destNom,
      date: new Date().toISOString().split('T')[0],
      motif,
      utilisateur: user,
      commentaire
    });

    // 5. Activity Log
    ActivityLogger.log(
      EventType.HABITAT_MOVE,
      `Déplacement de ${bird.nom} (${bird.bague}) : de ${origineNom} vers ${destNom}. Motif : ${motif}`,
      { deplacementId: deplacement.id, birdId, user }
    );

    return { success: true, message: `Oiseau déplacé avec succès vers ${destNom}.` };
  }

  /**
   * Starts quarantine for a bird
   */
  static startQuarantine(
    birdId: number,
    quarantineAreaId: string,
    dureePrevue: number, // in days
    raison: string,
    traitements: string,
    observations: string,
    user: string
  ): { success: boolean; message: string; error?: string } {
    const bird = BirdService.getById(birdId);
    if (!bird) {
      return { success: false, message: "L'oiseau spécifié n'existe pas." };
    }

    if (![7, 14, 21, 30].includes(dureePrevue)) {
      return { success: false, message: 'La durée de quarantaine doit être de 7, 14, 21 ou 30 jours.' };
    }
    const activeRecord = HabitatRepository.getAll<QuarantineRecord>('quarantineRecord')
      .find(record => record.birdId === birdId && record.statut !== 'Terminé' && !record.isArchived);
    if (activeRecord) {
      return { success: false, message: 'Cet oiseau possède déjà une quarantaine active.' };
    }

    const allBirds = BirdService.getBirds(true);

    // Validate quarantine area space
    const validationErrors = HabitatEngine.validateBirdAssignment(
      bird,
      'quarantineArea',
      quarantineAreaId,
      allBirds
    );

    if (validationErrors.length > 0) {
      return { success: false, message: "Validation de quarantaine échouée.", error: validationErrors[0].message };
    }

    // Dates
    const entryDate = new Date();
    const entryStr = entryDate.toISOString().split('T')[0];
    const estExitDate = new Date();
    estExitDate.setDate(entryDate.getDate() + dureePrevue);
    const estExitStr = estExitDate.toISOString().split('T')[0];
    const origin = this.resolveBirdOrigin(bird);

    // Move bird into quarantine area
    const qArea = HabitatRepository.getById<QuarantineArea>('quarantineArea', quarantineAreaId);
    const qAreaNom = qArea ? qArea.nom : `Quarantaine #${quarantineAreaId}`;

    // Update bird fields
    const updatedBird = {
      ...bird,
      facilityId: undefined,
      zoneId: undefined,
      aviaryId: undefined,
      cageId: undefined,
      cage_id: undefined,
      compartmentId: undefined,
      quarantineId: quarantineAreaId,
      statut_sante: 'Quarantaine',
      quarantaine: {
        date_entree: entryStr,
        duree_recommandee: dureePrevue,
        date_fin_estimee: estExitStr
      }
    };
    const saveResult = BirdService.update(updatedBird);
    if (!saveResult.success) {
      return { success: false, message: "Impossible de mettre à jour l'oiseau.", error: saveResult.message };
    }

    const record = HabitatRepository.create<QuarantineRecord>('quarantineRecord', {
      birdId,
      quarantineAreaId,
      dateEntree: entryStr,
      dureePrevue,
      dateSortieEstimee: estExitStr,
      raison,
      traitements,
      observations,
      statut: 'En cours'
    });

    // Create a movement record automatically
    HabitatRepository.create<DeplacementRecord>('deplacementRecord', {
      birdId,
      origineType: origin.origineType,
      origineId: origin.origineId,
      origineNom: origin.origineNom,
      destinationType: 'Quarantine',
      destinationId: quarantineAreaId,
      destinationNom: qAreaNom,
      date: entryStr,
      motif: `Mise en quarantaine: ${raison}`,
      utilisateur: user,
      commentaire: observations
    });

    // Log Activity
    ActivityLogger.log(
      EventType.QUARANTINE_START,
      `Mise en quarantaine de ${bird.nom} (${bird.bague}) dans ${qAreaNom}. Raison : ${raison}. Durée : ${dureePrevue} jours`,
      { recordId: record.id, birdId, user }
    );

    return { success: true, message: `Quarantaine démarrée pour ${bird.nom} (${dureePrevue} jours).` };
  }

  /**
   * Concludes or prolongs a quarantine session
   */
  static endQuarantine(
    recordId: string,
    action: 'release' | 'prolong',
    prolongDays = 0,
    observations = '',
    targetCageId?: string, // where to place the bird on release
    user = 'Éleveur'
  ): { success: boolean; message: string } {
    const record = HabitatRepository.getById<QuarantineRecord>('quarantineRecord', recordId);
    if (!record) {
      return { success: false, message: "Fiche de quarantaine introuvable." };
    }

    const bird = BirdService.getById(record.birdId);
    if (!bird) {
      return { success: false, message: "Oiseau de la quarantaine introuvable." };
    }
    if (record.statut === 'Terminé') {
      return { success: false, message: 'Cette quarantaine est déjà terminée.' };
    }

    if (action === 'release') {
      // Validate and apply the optional destination before closing the medical record.
      if (targetCageId) {
        const moveResult = this.moveBird(
          bird.id,
          'cage',
          targetCageId,
          "Sortie de quarantaine - Réintégration",
          user,
          observations
        );
        if (!moveResult.success) {
          return { success: false, message: moveResult.error || moveResult.message };
        }
      }

      const currentBird = BirdService.getById(bird.id) || bird;
      const updatedBird = {
        ...currentBird,
        quarantineId: undefined,
        quarantaine: undefined,
        statut_sante: 'Sain'
      };
      const saveResult = BirdService.update(updatedBird);
      if (!saveResult.success) {
        return { success: false, message: saveResult.message || "Impossible de finaliser la sortie de quarantaine." };
      }

      record.statut = 'Terminé';
      record.dateSortieReelle = new Date().toISOString().split('T')[0];
      record.observations = record.observations + '\n[Sortie] ' + observations;
      HabitatRepository.update('quarantineRecord', record);

      // Log activity
      ActivityLogger.log(
        EventType.QUARANTINE_END,
        `Fin de quarantaine pour ${bird.nom} (${bird.bague}). Sortie autorisée.`,
        { recordId, birdId: bird.id, user }
      );

      return { success: true, message: `Quarantaine terminée avec succès pour ${bird.nom}.` };

    } else {
      // Prolong
      if (!Number.isInteger(prolongDays) || prolongDays <= 0) {
        return { success: false, message: 'La prolongation doit être un nombre entier de jours supérieur à zéro.' };
      }
      const estExitDate = new Date(record.dateSortieEstimee);
      estExitDate.setDate(estExitDate.getDate() + prolongDays);
      
      record.dureePrevue = record.dureePrevue + prolongDays;
      record.dateSortieEstimee = estExitDate.toISOString().split('T')[0];
      record.statut = 'Prolongé';
      record.observations = record.observations + `\n[Prolongation] +${prolongDays} jours. Motif : ${observations}`;
      
      HabitatRepository.update('quarantineRecord', record);

      ActivityLogger.log(
        EventType.QUARANTINE_END,
        `Quarantaine prolongée de +${prolongDays} jours pour ${bird.nom} (${bird.bague})`,
        { recordId, birdId: bird.id, user }
      );

      return { success: true, message: `Quarantaine prolongée de ${prolongDays} jours.` };
    }
  }
}
