/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Couple, Reproduction, Ponte, Jeune, Canari } from '../../../types';
import { BreedingRepository } from '../repositories/BreedingRepository';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { BreedingEngine } from '../../../business/BreedingEngine';
import { ActivityLogger, EventType } from '../../../storage/ActivityLogger';

export class BreedingService {
  static getCouples(): Couple[] {
    return BreedingRepository.getCouples();
  }

  static getReproductions(): Reproduction[] {
    return BreedingRepository.getReproductions();
  }

  static getPontes(): Ponte[] {
    return BreedingRepository.getPontes();
  }

  static getJeunes(): Jeune[] {
    return BreedingRepository.getJeunes();
  }

  static addCouple(maleId: number, femelleId: number): { success: boolean; message?: string; data?: Couple } {
    const birds = BirdRepository.getAll();
    const couples = BreedingRepository.getCouples();

    const validation = BreedingEngine.validateCoupleFormation(maleId, femelleId, birds, couples);
    if (!validation.success) {
      return validation;
    }

    const male = birds.find(b => b.id === maleId)!;
    const female = birds.find(b => b.id === femelleId)!;

    const added = BreedingRepository.addCouple({
      male_id: maleId,
      femelle_id: femelleId,
      date_creation: new Date().toISOString().split('T')[0],
      statut: 'Actif'
    });

    ActivityLogger.log(
      EventType.COUPLE_ADD,
      `Création du couple : Mâle ${male.nom} x Femelle ${female.nom}`,
      { id: added.id, maleId, femelleId }
    );

    return { success: true, data: added };
  }

  static dissolveCouple(id: number): void {
    const couples = BreedingRepository.getCouples();
    const updated = couples.map(c => {
      if (c.id === id) {
        ActivityLogger.log(EventType.COUPLE_DISSOLVE, `Dissolution du couple ID ${id}`, { id });
        return { ...c, statut: 'Dissous' as const };
      }
      return c;
    });
    BreedingRepository.saveCouples(updated);
  }

  static startReproduction(coupleId: number): Reproduction {
    const added = BreedingRepository.addReproduction({
      couple_id: coupleId,
      date_debut: new Date().toISOString().split('T')[0],
      statut: 'En cours'
    });

    ActivityLogger.log(
      EventType.REPRO_START,
      `Début du cycle de reproduction pour le couple ID ${coupleId}`,
      { id: added.id, coupleId }
    );

    return added;
  }

  static addPonte(reproductionId: number, date: string, oeufs: number): Ponte {
    const added = BreedingRepository.addPonte({
      reproduction_id: reproductionId,
      date,
      oeufs,
      oeufs_fecondes: 0,
      eclosions: 0,
      sevrages: 0
    });

    ActivityLogger.log(
      EventType.PONTE_ADD,
      `Déclaration d'une ponte de ${oeufs} œufs pour la reproduction ID ${reproductionId}`,
      { id: added.id, reproductionId, oeufs }
    );

    return added;
  }

  static updatePonteStats(ponteId: number, fecondes: number, eclosions: number, sevrages: number): void {
    const pontes = BreedingRepository.getPontes();
    const updated = pontes.map(p => {
      if (p.id === ponteId) {
        return {
          ...p,
          oeufs_fecondes: fecondes,
          eclosions: eclosions,
          sevrages: sevrages > 0 ? sevrages : p.sevrages
        };
      }
      return p;
    });
    BreedingRepository.savePontes(updated);

    ActivityLogger.log(
      EventType.PONTE_UPDATE,
      `Mise à jour des statistiques de la ponte ID ${ponteId} : Fécondés=${fecondes}, Éclosions=${eclosions}`,
      { ponteId }
    );
  }

  static closeReproduction(id: number): void {
    const list = BreedingRepository.getReproductions();
    const updated = list.map(r => {
      if (r.id === id) {
        return { ...r, statut: 'Clôturé' as const };
      }
      return r;
    });
    BreedingRepository.saveReproductions(updated);

    ActivityLogger.log(
      EventType.REPRO_CLOSE,
      `Clôture du cycle de reproduction ID ${id}`,
      { id }
    );
  }

  static addJeune(ponteId: number, bague: string, dateNaissance: string): Jeune {
    const added = BreedingRepository.addJeune({
      ponte_id: ponteId,
      bague: bague || undefined,
      statut: 'En sevrage',
      date_naissance: dateNaissance
    });

    ActivityLogger.log(
      EventType.JEUNE_ADD,
      `Ajout d'un oisillon en sevrage (Bague: ${bague || 'Aucune'})`,
      { id: added.id, ponteId }
    );

    return added;
  }

  static weanJeuneToCanari(
    jeuneId: number, 
    nom: string, 
    cageId: number, 
    race: string, 
    couleur: string,
    addCanariFn: (bird: Omit<Canari, 'id'>) => any
  ): void {
    const jeunes = BreedingRepository.getJeunes();
    const targetJeune = jeunes.find(j => j.id === jeuneId);
    if (!targetJeune) return;

    const pontes = BreedingRepository.getPontes();
    const reproductions = BreedingRepository.getReproductions();
    const couples = BreedingRepository.getCouples();

    const targetPonte = pontes.find(p => p.id === targetJeune.ponte_id);
    const targetRepro = targetPonte ? reproductions.find(r => r.id === targetPonte.reproduction_id) : null;
    const targetCouple = targetRepro ? couples.find(c => c.id === targetRepro.couple_id) : null;

    const fatherId = targetCouple ? targetCouple.male_id : null;
    const motherId = targetCouple ? targetCouple.femelle_id : null;

    const nextBagueNum = `FR-2026-${Math.floor(Math.random() * 800) + 200}`;
    const newCanariPayload: Omit<Canari, 'id'> = {
      bague: targetJeune.bague || nextBagueNum,
      nom: nom || `Bébé de ${nextBagueNum}`,
      sexe: 'Indéterminé',
      categorie: 'Couleur',
      race: race || 'Canari de Couleur',
      mutation: 'Classique',
      couleur_base: couleur || 'Jaune',
      facteur: 'Intensif',
      couleur: couleur || 'Jaune',
      date_naissance: targetJeune.date_naissance,
      cage_id: cageId,
      pere_id: fatherId,
      mere_id: motherId
    };

    addCanariFn(newCanariPayload);

    const updatedJeunes = jeunes.map(j => 
      j.id === jeuneId 
        ? { ...j, statut: 'Sevré' as const, bague: targetJeune.bague || nextBagueNum } 
        : j
    );
    BreedingRepository.saveJeunes(updatedJeunes);

    if (targetPonte) {
      const currentSevragesCount = updatedJeunes.filter(j => j.ponte_id === targetPonte.id && j.statut === 'Sevré').length;
      this.updatePonteStats(targetPonte.id, targetPonte.oeufs_fecondes || 0, targetPonte.eclosions || 0, currentSevragesCount);
    }

    ActivityLogger.log(
      EventType.JEUNE_WEAN,
      `Serrage/Sevrage réussi pour l'oisillon ID ${jeuneId} (Bague définitive: ${newCanariPayload.bague})`,
      { jeuneId }
    );
  }
}
