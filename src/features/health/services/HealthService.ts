/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sante } from '../../../types';
import { HealthRepository } from '../repositories/HealthRepository';
import { ActivityLogger, EventType } from '../../../storage/ActivityLogger';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { HealthEngine } from '../../../business/HealthEngine';

export interface HealthServiceResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}

export class HealthService {
  static getRecords(): Sante[] {
    return HealthRepository.getAll();
  }

  static addRecord(record: Omit<Sante, 'id'>): HealthServiceResponse<Sante> {
    const bird = BirdRepository.getById(record.canari_id);
    if (!bird || !HealthEngine.isEligiblePatient(bird)) {
      return { success: false, message: "L'oiseau sélectionné est introuvable ou indisponible." };
    }
    const categories: Sante['categorie'][] = ['Traitement', 'Vaccin', 'Visite Vétérinaire', 'Symptôme'];
    if (!categories.includes(record.categorie)) {
      return { success: false, message: "La catégorie médicale sélectionnée est invalide." };
    }
    if (!record.traitement?.trim()) {
      return { success: false, message: "La nature du soin ou du traitement est obligatoire." };
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
      return { success: false, message: "La date du soin est invalide." };
    }
    const parsedDate = new Date(`${record.date}T00:00:00.000Z`);
    if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== record.date) {
      return { success: false, message: "La date du soin est invalide." };
    }
    const statuses: NonNullable<Sante['statut']>[] = ['En attente', 'Terminé'];
    const status = record.statut || 'Terminé';
    if (!statuses.includes(status)) {
      return { success: false, message: "L'état de réalisation du soin est invalide." };
    }
    if (record.date < bird.date_naissance) {
      return { success: false, message: "Un soin ne peut pas être antérieur à la naissance ou à l'acquisition de l'oiseau." };
    }
    if (status === 'Terminé' && record.date > new Date().toISOString().slice(0, 10)) {
      return { success: false, message: "Un soin terminé ne peut pas être daté dans le futur." };
    }

    const added = HealthRepository.add({
      ...record,
      traitement: record.traitement.trim(),
      description: record.description?.trim(),
      statut: status
    });
    ActivityLogger.log(
      EventType.SANTE_ADD,
      `Nouveau dossier de santé (${record.categorie}) déclaré pour le canari ID ${record.canari_id}`,
      { id: added.id, canariId: record.canari_id }
    );
    return { success: true, data: added };
  }

  static completeRecord(id: number): HealthServiceResponse {
    const record = HealthRepository.getById(id);
    if (!record) {
      return { success: false, message: 'Fiche médicale introuvable.' };
    }
    if (record.statut === 'Terminé') {
      return { success: true };
    }
    if (record.date > new Date().toISOString().slice(0, 10)) {
      return { success: false, message: "Ce soin est planifié dans le futur et ne peut pas encore être terminé." };
    }
    record.statut = 'Terminé';
    if (!HealthRepository.update(record)) {
      return { success: false, message: 'Impossible de mettre à jour la fiche médicale.' };
    }
    ActivityLogger.log(
      EventType.SANTE_COMPLETE,
      `Soin/Traitement marqué terminé pour le canari ID ${record.canari_id}`,
      { id }
    );
    return { success: true };
  }

  static deleteRecord(id: number): HealthServiceResponse {
    if (!HealthRepository.delete(id)) {
      return { success: false, message: 'Fiche médicale introuvable.' };
    }
    ActivityLogger.log(
      EventType.SANTE_DELETE,
      `Suppression de la fiche médicale de santé ID ${id}`,
      { id }
    );
    return { success: true };
  }
}
