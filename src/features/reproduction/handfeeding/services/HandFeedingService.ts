/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HandFeedingRepository } from '../repositories/HandFeedingRepository';
import { Formula, CropInspection, HandFeedingSession, CropStatus } from '../types';
import { ChickRepository } from '../../chicks/repositories/ChickRepository';
import { ChickService } from '../../chicks/services/ChickService';
import { NurseryRepository } from '../../nursery/repositories/NurseryRepository';
import { NurseryRecord } from '../../nursery/types';
import { ActivityLogger, EventType } from '../../../../storage/ActivityLogger';

export class HandFeedingService {
  static getFormulas(): Formula[] {
    return HandFeedingRepository.getFormulas();
  }

  static getFormulaById(id: string): Formula | undefined {
    return HandFeedingRepository.getFormulaById(id);
  }

  static saveFormula(formula: Formula): Formula {
    const now = new Date().toISOString();
    formula.updatedAt = now;
    if (!formula.timeline) formula.timeline = [];
    formula.timeline.push({
      id: `form-ev-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: now,
      type: 'formula_updated',
      description: `Formule mise à jour : ${formula.name}`
    });
    return HandFeedingRepository.saveFormula(formula);
  }

  static getSessionsByChick(chickId: string): HandFeedingSession[] {
    return HandFeedingRepository.getSessionsByChick(chickId).sort((a, b) => {
      const dateTimeA = `${a.date}T${a.time}`;
      const dateTimeB = `${b.date}T${b.time}`;
      return dateTimeB.localeCompare(dateTimeA); // latest sessions first
    });
  }

  static logSession(sessionData: {
    chickId: string;
    date: string;
    time: string;
    formulaId: string;
    volumeMl: number;
    temperatureC: number;
    cropBefore: CropStatus;
    cropAfter: CropStatus;
    observations: string;
    operator?: string;
  }): HandFeedingSession {
    const chick = ChickRepository.getById(sessionData.chickId);
    if (!chick) {
      throw new Error(`Poussin introuvable : ${sessionData.chickId}`);
    }

    const now = new Date().toISOString();
    const sessionId = `hfs-${Math.random().toString(36).substring(2, 11)}`;

    const formula = this.getFormulaById(sessionData.formulaId);
    const formulaName = formula ? formula.name : sessionData.formulaId;

    const session: HandFeedingSession = {
      id: sessionId,
      ...sessionData,
      timeline: [
        {
          id: `hfs-ev-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: now,
          type: 'session_logged',
          description: `Séance EAM enregistrée par ${sessionData.operator || 'Éleveur'} (${sessionData.volumeMl}ml)`
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    HandFeedingRepository.saveSession(session);

    // Create a companion crop inspection record automatically
    const inspection: CropInspection = {
      id: `ci-${Math.random().toString(36).substring(2, 11)}`,
      chickId: sessionData.chickId,
      timestamp: `${sessionData.date}T${sessionData.time}:00Z`,
      statusBefore: sessionData.cropBefore,
      statusAfter: sessionData.cropAfter,
      fluidity: 'normal',
      notes: sessionData.observations,
      timeline: [
        {
          id: `ci-ev-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: now,
          type: 'auto_inspection',
          description: `Examen de jabot associé à la séance de nourrissage ${sessionId}`
        }
      ],
      createdAt: now,
      updatedAt: now
    };
    HandFeedingRepository.saveInspection(inspection);

    // Update / Create Nursery Record to reflect Handfeeding
    let nurseryRec = NurseryRepository.getNurseryRecordByChick(sessionData.chickId);
    if (nurseryRec) {
      if (nurseryRec.mode === 'biological_parents' || nurseryRec.mode === 'foster_parents') {
        nurseryRec.mode = 'mixed'; // mixed if already with parents
      } else {
        nurseryRec.mode = 'hand_feeding';
      }
      nurseryRec.updatedAt = now;
      nurseryRec.timeline.push({
        id: `nurs-ev-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: now,
        type: 'handfeeding_logged',
        description: `Nourrissage manuel enregistré. Mode : ${nurseryRec.mode}`
      });
      NurseryRepository.saveNurseryRecord(nurseryRec);
    } else {
      const newNurseryRec: NurseryRecord = {
        id: `nr-${Math.random().toString(36).substring(2, 11)}`,
        chickId: sessionData.chickId,
        status: 'active',
        entryDate: sessionData.date,
        mode: 'hand_feeding',
        timeline: [
          {
            id: `nurs-ev-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: now,
            type: 'nursery_entered',
            description: `Entrée en nurserie suite à un démarrage d'alimentation manuelle`
          }
        ],
        createdAt: now,
        updatedAt: now
      };
      NurseryRepository.saveNurseryRecord(newNurseryRec);
    }

    // Add event to chick biological timeline
    ChickService.addEvent(
      sessionData.chickId, 
      'feeding', 
      `Seringue EAM: ${sessionData.volumeMl}ml (${formulaName}, ${sessionData.temperatureC}°C). Jabot: ${sessionData.cropBefore} -> ${sessionData.cropAfter}`,
      sessionData.observations,
      sessionData.operator
    );

    ActivityLogger.log(
      EventType.ALIM_UPDATE,
      `Nourrissage EAM pour "${chick.name}" : ${sessionData.volumeMl}ml de ${formulaName}`
    );

    return session;
  }
}
