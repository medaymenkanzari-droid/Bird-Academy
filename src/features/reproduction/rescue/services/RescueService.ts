/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RescueRepository } from '../repositories/RescueRepository';
import { RescueCase } from '../types';
import { ChickRepository } from '../../chicks/repositories/ChickRepository';
import { ChickService } from '../../chicks/services/ChickService';
import { ActivityLogger, EventType } from '../../../../storage/ActivityLogger';

export class RescueService {
  static getRescueCases(): RescueCase[] {
    return RescueRepository.getRescueCases();
  }

  static getRescueCaseById(id: string): RescueCase | undefined {
    return RescueRepository.getRescueCaseById(id);
  }

  static getRescueCaseByChick(chickId: string): RescueCase | undefined {
    return RescueRepository.getRescueCaseByChick(chickId);
  }

  static openRescueCase(data: {
    chickId: string;
    admissionWeight: number;
    reason: 'abandon' | 'injury' | 'orphaned' | 'illness' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    temperatureMaintained: boolean;
    humidityLevel: number;
    treatmentNotes?: string;
  }): RescueCase {
    const chick = ChickRepository.getById(data.chickId);
    if (!chick) {
      throw new Error(`Poussin introuvable : ${data.chickId}`);
    }

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    const rescueRecord: RescueCase = {
      id: `rc-${Math.random().toString(36).substring(2, 11)}`,
      ...data,
      status: 'active',
      admissionDate: today,
      timeline: [
        {
          id: `rc-ev-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: now,
          type: 'admission',
          description: `Admis en sauvetage d'urgence. Poids : ${data.admissionWeight}g. Raison : ${data.reason}.`
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    RescueRepository.saveRescueCase(rescueRecord);

    // Add health biological event
    ChickService.addEvent(
      data.chickId,
      'growth',
      `SAUVETAGE INITIÉ (Gravité: ${data.severity}, Motif: ${data.reason}). Poids: ${data.admissionWeight}g`,
      data.treatmentNotes
    );

    ActivityLogger.log(
      EventType.SANTE_ADD,
      `Nouveau cas de sauvetage ouvert pour "${chick.name}" (${data.reason})`
    );

    return rescueRecord;
  }

  static resolveRescueCase(id: string, status: 'recovered' | 'deceased' | 'transferred', resolutionNotes?: string): RescueCase {
    const record = this.getRescueCaseById(id);
    if (!record) {
      throw new Error(`Cas de sauvetage introuvable : ${id}`);
    }

    const chick = ChickRepository.getById(record.chickId);
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    record.status = status;
    record.resolvedDate = today;
    record.treatmentNotes = resolutionNotes || record.treatmentNotes;
    record.updatedAt = now;
    record.timeline.push({
      id: `rc-ev-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: now,
      type: 'resolution',
      description: `Sauvetage clôturé. Statut final : ${status}. Notes : ${resolutionNotes || ''}`
    });

    RescueRepository.saveRescueCase(record);

    if (chick) {
      // If chick deceased, we can update health status or archive it
      if (status === 'deceased') {
        chick.status = 'deceased';
        chick.observations += `\nDécédé lors du sauvetage le ${today}.`;
        ChickRepository.update(chick);
        
        ChickService.addEvent(record.chickId, 'death', 'Sauvetage clôturé par Décès');
        ActivityLogger.log(
          EventType.BIRD_DECEASED,
          `Oisillon "${chick.name}" décédé pendant le sauvetage.`
        );
      } else {
        ChickService.addEvent(
          record.chickId,
          'growth',
          `SAUVETAGE RÉSOLU (${status === 'recovered' ? 'Rétablissement complet' : 'Transféré'}).`,
          resolutionNotes
        );
        ActivityLogger.log(
          EventType.SANTE_COMPLETE,
          `Sauvetage résolu (${status}) pour "${chick.name}"`
        );
      }
    }

    return record;
  }
}
