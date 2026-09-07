/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari } from '../types';
import { SPECIES_REGISTRY, getSpeciesById } from '../data/speciesRegistry';
import { calculateAgeString, calculateInbreedingCOI, getInbreedingCategory } from '../utils/genealogy';

export interface BirdValidationError {
  field: string;
  message: string;
}

export interface BirdValidationResult {
  isValid: boolean;
  errors: BirdValidationError[];
}

export interface BirdDeletionReference {
  type: string;
  count: number;
}

export class BirdEngine {
  /**
   * Validates that the bird's ring number is unique in the system.
   */
  static validateBagueUnique(bague: string, existingBirds: Canari[], excludeId?: number): boolean {
    if (!bague) return false;
    const uppercaseBague = bague.toUpperCase().trim();
    return !existingBirds.some(b => b.bague.toUpperCase().trim() === uppercaseBague && b.id !== excludeId);
  }

  /**
   * Checks if species is valid.
   */
  static validateSpecies(espece?: string): boolean {
    if (!espece) return false;
    return SPECIES_REGISTRY.some(s => s.id === espece);
  }

  /**
   * Checks if breed/race is compatible with species and category.
   */
  static validateBreed(espece: string, category: string, race: string): boolean {
    if (!espece || !category || !race) return false;
    const speciesInfo = getSpeciesById(espece);
    if (!speciesInfo) return false;
    
    const catInfo = speciesInfo.categories.find(c => c.id === category);
    if (!catInfo) return false;

    // Standard check if breed exists in list, or allow custom breed if it is a non-empty string.
    return race.trim().length > 0;
  }

  /**
   * Checks if sex is a valid option.
   */
  static validateSexe(sexe: string): boolean {
    return ['Mâle', 'Femelle', 'Indéterminé'].includes(sexe);
  }

  /**
   * Checks if date of birth is coherent (not in the future).
   */
  static validateDateNaissance(dateStr: string): boolean {
    if (!dateStr) return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const d = new Date(`${dateStr}T00:00:00.000Z`);
    if (isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dateStr) return false;
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('-');
    return dateStr <= today;
  }

  /**
   * Completes the quarantine proposal for an externally acquired bird.
   * No habitat is selected automatically: cage assignment remains a manual choice.
   */
  static prepareForCreation(bird: Omit<Canari, 'id'>): Omit<Canari, 'id'> {
    const prepared = { ...bird };
    if (!prepared.acquisition) return prepared;

    const allowedDurations = [7, 14, 21, 30];
    const duration = allowedDurations.includes(prepared.quarantaine?.duree_recommandee ?? 30)
      ? prepared.quarantaine?.duree_recommandee ?? 30
      : 30;
    const today = new Date().toISOString().slice(0, 10);
    const entryDate = prepared.quarantaine?.date_entree || today;
    const endDate = new Date(`${entryDate}T00:00:00.000Z`);
    endDate.setUTCDate(endDate.getUTCDate() + duration);

    prepared.quarantaine = {
      date_entree: entryDate,
      duree_recommandee: duration,
      date_fin_estimee: endDate.toISOString().slice(0, 10)
    };
    prepared.statut_sante = 'Quarantaine';
    return prepared;
  }

  /**
   * Automatically calculates age string and age in months.
   */
  static calculateAge(dateStr: string, t?: (key: any, vars?: any) => string): { stringVal: string; months: number } {
    if (!dateStr) {
      return { stringVal: t ? t('ageUnknown') : 'Âge inconnu', months: 0 };
    }
    const birthDate = new Date(dateStr);
    const now = new Date();
    
    if (isNaN(birthDate.getTime())) {
      return { stringVal: t ? t('ageUnknown') : 'Date invalide', months: 0 };
    }

    const yearsDiff = now.getFullYear() - birthDate.getFullYear();
    const monthsDiff = now.getMonth() - birthDate.getMonth();
    const totalMonths = yearsDiff * 12 + monthsDiff;
    const months = totalMonths < 0 ? 0 : totalMonths;

    const stringVal = calculateAgeString(dateStr, t);
    return { stringVal, months };
  }

  /**
   * Prepared validation for consanguinity (inbreeding), currently inactive for blocking but ready for notifications.
   */
  static checkConsanguinity(
    maleId: number | null | undefined,
    femaleId: number | null | undefined,
    existingBirds: Canari[]
  ): { isConsanguineous: boolean; coi: number; level: string; recommendation: string; message?: string } {
    if (!maleId || !femaleId) {
      return { isConsanguineous: false, coi: 0, level: 'Aucun', recommendation: 'Recommandé' };
    }

    try {
      const coi = calculateInbreedingCOI(maleId, femaleId, existingBirds);
      const cat = getInbreedingCategory(coi);
      
      return {
        isConsanguineous: coi > 0,
        coi,
        level: cat.level,
        recommendation: cat.recommendation,
        message: coi > 0 ? `Taux de consanguinité estimé : ${coi.toFixed(2)}% (${cat.level}). Recommandation : ${cat.recommendation}` : undefined
      };
    } catch (e) {
      return { isConsanguineous: false, coi: 0, level: 'Aucun', recommendation: 'Recommandé' };
    }
  }

  /**
   * Validates biological parent references and prevents pedigree cycles.
   */
  static validateParentRelations(
    bird: Partial<Canari>,
    existingBirds: Canari[],
    excludeId?: number
  ): BirdValidationError[] {
    const errors: BirdValidationError[] = [];
    const birdId = bird.id ?? excludeId;
    const fatherId = bird.pere_id ?? null;
    const motherId = bird.mere_id ?? null;
    const birdsById = new Map(existingBirds.map(existing => [existing.id, existing]));

    if (fatherId && motherId && fatherId === motherId) {
      errors.push({
        field: 'mere_id',
        message: 'Le père biologique et la mère biologique doivent être deux oiseaux distincts.'
      });
    }

    const createsCycle = (parentId: number): boolean => {
      if (!birdId) return false;

      const visited = new Set<number>();
      const pending = [parentId];

      while (pending.length > 0) {
        const currentId = pending.pop()!;
        if (currentId === birdId) return true;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const current = birdsById.get(currentId);
        if (!current) continue;
        if (current.pere_id) pending.push(current.pere_id);
        if (current.mere_id) pending.push(current.mere_id);
      }

      return false;
    };

    const childBirth = bird.date_naissance ? new Date(bird.date_naissance) : null;
    const childBirthTime = childBirth && !isNaN(childBirth.getTime()) ? childBirth.getTime() : null;

    const validateParent = (
      parentId: number | null,
      field: 'pere_id' | 'mere_id',
      expectedSex: 'Mâle' | 'Femelle',
      label: 'père' | 'mère'
    ) => {
      if (!parentId) return;

      if (birdId && parentId === birdId) {
        errors.push({
          field,
          message: `Un oiseau ne peut pas être son propre ${label} biologique.`
        });
        return;
      }

      const parent = birdsById.get(parentId);
      if (!parent) {
        errors.push({
          field,
          message: `Le ${label} biologique sélectionné n'existe pas dans l'élevage.`
        });
        return;
      }

      if (parent.sexe !== expectedSex) {
        errors.push({
          field,
          message: `Le ${label} biologique doit être déclaré ${expectedSex}.`
        });
      }

      if (childBirthTime !== null) {
        const parentBirth = new Date(parent.date_naissance);
        if (!isNaN(parentBirth.getTime()) && parentBirth.getTime() >= childBirthTime) {
          errors.push({
            field,
            message: `La date de naissance du ${label} doit être antérieure à celle de l'oiseau.`
          });
        }
      }

      if (createsCycle(parentId)) {
        errors.push({
          field,
          message: `Cette sélection créerait un cycle généalogique avec le ${label} biologique.`
        });
      }
    };

    validateParent(fatherId, 'pere_id', 'Mâle', 'père');
    validateParent(motherId, 'mere_id', 'Femelle', 'mère');

    return errors;
  }

  /**
   * Run full validation suite on bird data before creation/update.
   */
  static validateBird(
    bird: Partial<Canari>,
    existingBirds: Canari[],
    excludeId?: number
  ): BirdValidationResult {
    const errors: BirdValidationError[] = [];

    // Ring number validation
    if (!bird.bague || bird.bague.trim().length === 0) {
      errors.push({ field: 'bague', message: 'Le numéro de bague est requis.' });
    } else if (bird.bague.trim().length < 3) {
      errors.push({ field: 'bague', message: 'La bague doit comporter au moins 3 caractères.' });
    } else if (!this.validateBagueUnique(bird.bague, existingBirds, excludeId)) {
      errors.push({ field: 'bague', message: 'Ce numéro de bague existe déjà dans votre élevage.' });
    }

    // Name validation
    if (!bird.nom || bird.nom.trim().length === 0) {
      errors.push({ field: 'nom', message: "Le nom de l'oiseau est requis." });
    }

    // Sex validation
    if (!bird.sexe || !this.validateSexe(bird.sexe)) {
      errors.push({ field: 'sexe', message: 'Le sexe de l’oiseau doit être Mâle, Femelle ou Indéterminé.' });
    }

    // Species validation
    if (!bird.espece || !this.validateSpecies(bird.espece)) {
      errors.push({ field: 'espece', message: 'Espèce non valide.' });
    }

    // Category / Breed validation
    if (!bird.categorie || bird.categorie.trim().length === 0) {
      errors.push({ field: 'categorie', message: 'La catégorie est obligatoire.' });
    }
    if (!bird.race || bird.race.trim().length === 0) {
      errors.push({ field: 'race', message: 'La race est obligatoire.' });
    } else if (bird.espece && bird.categorie && !this.validateBreed(bird.espece, bird.categorie, bird.race)) {
      errors.push({ field: 'race', message: 'La race est incompatible avec cette espèce ou cette catégorie.' });
    }

    // Color validation
    if (!bird.couleur_base || bird.couleur_base.trim().length === 0) {
      errors.push({ field: 'couleur_base', message: 'La couleur de base est requise.' });
    }

    // Date validation
    if (!bird.date_naissance) {
      errors.push({ field: 'date_naissance', message: 'La date de naissance ou d’acquisition est requise.' });
    } else if (!this.validateDateNaissance(bird.date_naissance)) {
      errors.push({ field: 'date_naissance', message: 'La date de naissance ne peut pas être dans le futur.' });
    }

    // A new resident bird must be assigned manually. External acquisitions may
    // remain unassigned while the quarantine protocol is being prepared.
    if (excludeId === undefined && !bird.acquisition && !bird.cage_id) {
      errors.push({ field: 'cage_id', message: 'Choisissez manuellement une cage ou une volière.' });
    }

    errors.push(...this.validateParentRelations(bird, existingBirds, excludeId));

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static canDeleteBird(
    id: number,
    existingBirds: Canari[],
    externalReferences: BirdDeletionReference[] = []
  ): { success: boolean; message?: string } {
    const isParent = existingBirds.some(b => b.pere_id === id || b.mere_id === id);
    if (isParent) {
      return {
        success: false,
        message: "Impossible de supprimer cet oiseau : il est référencé comme parent d'un autre oiseau de l'élevage."
      };
    }
    const blockingReferences = externalReferences.filter(reference => reference.count > 0);
    if (blockingReferences.length > 0) {
      const details = blockingReferences
        .map(reference => `${reference.type} (${reference.count})`)
        .join(', ');
      return {
        success: false,
        message: `Impossible de supprimer définitivement cet oiseau : des données liées existent encore — ${details}. Archivez-le pour préserver l'historique.`
      };
    }
    return { success: true };
  }
}
