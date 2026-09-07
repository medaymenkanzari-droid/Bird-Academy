/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari } from '../../../types';
import { appStorage } from '../../../storage';
import { BirdModel } from '../../../models/Bird';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';

export interface BirdFilterCriteria {
  nom?: string;
  bague?: string;
  espece?: string;
  categorie?: string;
  race?: string;
  mutation?: string;
  couleur?: string;
  sexe?: 'Mâle' | 'Femelle' | 'Indéterminé' | '';
  ageMin?: number; // in months
  ageMax?: number; // in months
  statut?: string;
  cage_id?: number | '';
  repro_dispo?: boolean;
  quarantaine?: boolean;
}

export class BirdRepository {
  private static KEY = 'canaris';

  static getAll(includeArchived = false): Canari[] {
    const list = appStorage.getItem<Canari[]>(this.KEY, []);
    if (!Array.isArray(list)) {
      return [];
    }
    if (includeArchived) {
      return list;
    }
    return list.filter(b => !b.archived);
  }

  static saveAll(birds: Canari[]): void {
    appStorage.setItem(this.KEY, birds);
  }

  static getById(id: number): Canari | undefined {
    const list = appStorage.getItem<Canari[]>(this.KEY, []);
    return list.find(b => b.id === id);
  }

  static create(bird: Omit<Canari, 'id'>): Canari {
    const birds = appStorage.getItem<Canari[]>(this.KEY, []);
    const nextId = birds.length > 0 ? Math.max(...birds.map(b => b.id)) + 1 : 1;
    const newBird: Canari = {
      ...bird,
      id: nextId,
      archived: false,
      photos: bird.photos || (bird.photo ? [bird.photo] : []),
      documents: bird.documents || []
    };
    birds.push(newBird);
    this.saveAll(birds);
    return newBird;
  }

  // Backwards compatibility with standard 'add' method
  static add(bird: Omit<Canari, 'id'>): Canari {
    return this.create(bird);
  }

  static update(updatedBird: Canari): boolean {
    const birds = appStorage.getItem<Canari[]>(this.KEY, []);
    const index = birds.findIndex(b => b.id === updatedBird.id);
    if (index !== -1) {
      birds[index] = {
        ...updatedBird,
        photos: updatedBird.photos || (updatedBird.photo ? [updatedBird.photo] : []),
        documents: updatedBird.documents || []
      };
      this.saveAll(birds);
      return true;
    }
    return false;
  }

  static archive(id: number): void {
    const birds = appStorage.getItem<Canari[]>(this.KEY, []);
    const index = birds.findIndex(b => b.id === id);
    if (index !== -1) {
      birds[index].archived = true;
      this.saveAll(birds);
    }
  }

  static restore(id: number): void {
    const birds = appStorage.getItem<Canari[]>(this.KEY, []);
    const index = birds.findIndex(b => b.id === id);
    if (index !== -1) {
      birds[index].archived = false;
      this.saveAll(birds);
    }
  }

  static deleteLogically(id: number): void {
    this.archive(id);
  }

  static delete(id: number): boolean {
    const birds = appStorage.getItem<Canari[]>(this.KEY, []);
    const filtered = birds.filter(b => b.id !== id);
    if (filtered.length !== birds.length) {
      this.saveAll(filtered);
      return true;
    }
    return false;
  }

  static duplicate(id: number): Canari {
    const source = this.getById(id);
    if (!source) {
      throw new Error(`Oiseau avec l'id ${id} introuvable pour duplication.`);
    }

    const { id: _, bague: sourceBague, nom: sourceNom, ...rest } = source;
    let duplicateIndex = 1;
    let copyBague = `${sourceBague}-DUP-${duplicateIndex}`;
    const allRings = new Set(this.getAll(true).map(bird => bird.bague.toUpperCase().trim()));
    while (allRings.has(copyBague.toUpperCase())) {
      duplicateIndex += 1;
      copyBague = `${sourceBague}-DUP-${duplicateIndex}`;
    }
    const copyNom = `${sourceNom ? sourceNom : 'Oiseau'} Copie`;

    return this.create({
      ...rest,
      bague: copyBague,
      nom: copyNom,
      cage_id: undefined,
      facilityId: undefined,
      zoneId: undefined,
      aviaryId: undefined,
      cageId: undefined,
      compartmentId: undefined,
      quarantineId: undefined,
      archived: false,
      photos: source.photos ? [...source.photos] : (source.photo ? [source.photo] : []),
      documents: source.documents ? [...source.documents] : []
    });
  }

  static search(query: string, includeArchived = false): Canari[] {
    const birds = this.getAll(includeArchived);
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return birds;

    return birds.filter(b =>
      (b.nom && b.nom.toLowerCase().includes(cleanQuery)) ||
      (b.bague && b.bague.toLowerCase().includes(cleanQuery)) ||
      (b.race && b.race.toLowerCase().includes(cleanQuery)) ||
      (b.couleur && b.couleur.toLowerCase().includes(cleanQuery)) ||
      (b.espece && b.espece.toLowerCase().includes(cleanQuery)) ||
      (b.mutation && b.mutation.toLowerCase().includes(cleanQuery))
    );
  }

  static filter(criteria: BirdFilterCriteria, includeArchived = false): Canari[] {
    const birds = this.getAll(includeArchived);

    return birds.filter(b => {
      if (criteria.nom && !b.nom?.toLowerCase().includes(criteria.nom.toLowerCase())) {
        return false;
      }
      if (criteria.bague && !b.bague?.toLowerCase().includes(criteria.bague.toLowerCase())) {
        return false;
      }
      if (criteria.espece && b.espece !== criteria.espece) {
        return false;
      }
      if (criteria.categorie && b.categorie !== criteria.categorie) {
        return false;
      }
      if (criteria.race && b.race !== criteria.race) {
        return false;
      }
      if (criteria.mutation && b.mutation !== criteria.mutation) {
        return false;
      }
      if (criteria.couleur && !b.couleur?.toLowerCase().includes(criteria.couleur.toLowerCase()) && !b.couleur_base?.toLowerCase().includes(criteria.couleur.toLowerCase())) {
        return false;
      }
      if (criteria.sexe && b.sexe !== criteria.sexe) {
        return false;
      }
      if (criteria.statut) {
        const isArchivedStatus = criteria.statut.toLowerCase() === 'archivé';
        if (isArchivedStatus !== Boolean(b.archived) && b.statut_sante !== criteria.statut) {
          return false;
        }
      }
      if (criteria.cage_id !== undefined && criteria.cage_id !== '') {
        if (b.cage_id !== Number(criteria.cage_id)) {
          return false;
        }
      }
      if (criteria.repro_dispo !== undefined) {
        const canBreed = BirdModel.canBreed(b) && b.sexe !== 'Indéterminé';
        if (criteria.repro_dispo !== canBreed) {
          return false;
        }
      }
      if (criteria.quarantaine !== undefined) {
        const today = new Date().toISOString().slice(0, 10);
        const isQuarantine = b.statut_sante === 'Quarantaine'
          || Boolean(b.quarantineId)
          || Boolean(b.quarantaine && (!b.quarantaine.date_fin_estimee || b.quarantaine.date_fin_estimee >= today))
          || Boolean(b.nom?.toLowerCase().includes('quarantaine'))
          || Boolean(b.facteur?.toLowerCase().includes('quarantaine'));
        if (criteria.quarantaine !== isQuarantine) {
          return false;
        }
      }
      if (criteria.ageMin !== undefined || criteria.ageMax !== undefined) {
        const ageMonths = BirdModel.getAgeInMonths(b.date_naissance);
        if (criteria.ageMin !== undefined && ageMonths < criteria.ageMin) {
          return false;
        }
        if (criteria.ageMax !== undefined && ageMonths > criteria.ageMax) {
          return false;
        }
      }
      return true;
    });
  }

  static migrate(): void {
    const birds = appStorage.getItem<Canari[]>(this.KEY, []);
    let changed = false;
    const v2Cages = HabitatRepository.getAll<any>('cage');
    const migrated = birds.map(b => {
      let updated = { ...b };
      if (!updated.espece) {
        updated.espece = 'canari';
        changed = true;
      }
      if (!updated.photos) {
        updated.photos = updated.photo ? [updated.photo] : [];
        changed = true;
      }
      if (!updated.documents) {
        updated.documents = [];
        changed = true;
      }
      if (updated.archived === undefined) {
        updated.archived = false;
        changed = true;
      }
      if ((updated.cage_id !== undefined || updated.cageId !== undefined) && (!updated.cageId || !updated.zoneId)) {
        const cNum = updated.cage_id !== undefined && updated.cage_id !== null ? Number(updated.cage_id) : undefined;
        const cStr = updated.cageId !== undefined && updated.cageId !== null ? String(updated.cageId) : undefined;
        const match = v2Cages.find((c: any) => 
          (cStr && (c.id === cStr || c.id.toLowerCase() === cStr.toLowerCase())) || 
          (cNum !== undefined && !isNaN(cNum) && (c.id === String(cNum) || parseInt(c.id, 10) === cNum))
        );
        if (match) {
          updated.cageId = match.id;
          updated.zoneId = match.zoneId || 'zone_default';
          const zone = HabitatRepository.getById<any>('zone', updated.zoneId || 'zone_default');
          updated.facilityId = zone ? (zone.facilityId || 'fac_default') : 'fac_default';
          changed = true;
        } else if (cNum !== undefined && !isNaN(cNum)) {
          updated.cageId = String(cNum);
          updated.zoneId = 'zone_default';
          updated.facilityId = 'fac_default';
          changed = true;
        }
      }
      return updated;
    });
    if (changed) {
      this.saveAll(migrated);
    }
  }
}
