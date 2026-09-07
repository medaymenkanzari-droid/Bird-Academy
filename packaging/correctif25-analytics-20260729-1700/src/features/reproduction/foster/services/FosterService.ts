/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FosterRepository } from '../repositories/FosterRepository';
import { FosterParents, TransferRecord } from '../types';
import { ChickRepository } from '../../chicks/repositories/ChickRepository';
import { ChickService } from '../../chicks/services/ChickService';
import { NurseryRepository } from '../../nursery/repositories/NurseryRepository';
import { NurseryRecord } from '../../nursery/types';
import { ActivityLogger, EventType } from '../../../../storage/ActivityLogger';

export class FosterService {
  static getFosterParents(): FosterParents[] {
    return FosterRepository.getFosterParents();
  }

  static getFosterParentsById(id: string): FosterParents | undefined {
    return FosterRepository.getFosterParentsById(id);
  }

  static getFosterParentsByPair(pairId: string): FosterParents | undefined {
    return FosterRepository.getFosterParentsByPair(pairId);
  }

  static toggleFosterStatus(pairId: string, capacity: number = 4): FosterParents {
    const existing = this.getFosterParentsByPair(pairId);
    const now = new Date().toISOString();
    
    if (existing) {
      existing.status = existing.status === 'resting' ? 'available' : 'resting';
      existing.capacity = capacity;
      existing.updatedAt = now;
      existing.timeline.push({
        id: `fost-ev-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: now,
        type: 'status_changed',
        description: `Statut modifié en "${existing.status}"`
      });
      return FosterRepository.saveFosterParents(existing);
    } else {
      const newFoster: FosterParents = {
        id: `fp-${Math.random().toString(36).substring(2, 11)}`,
        pairId,
        status: 'available',
        capacity,
        currentFosterCount: 0,
        timeline: [
          {
            id: `fost-ev-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: now,
            type: 'foster_parents_initialized',
            description: `Couple ${pairId} enregistré comme parents nourriciers potentiels (Capacité: ${capacity})`
          }
        ],
        createdAt: now,
        updatedAt: now
      };
      return FosterRepository.saveFosterParents(newFoster);
    }
  }

  static transferChick(chickId: string, destinationPairId: string, reason: string): TransferRecord {
    const chick = ChickRepository.getById(chickId);
    if (!chick) {
      throw new Error(`Poussin introuvable : ${chickId}`);
    }

    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // Maintain biological parent coupling
    const originalPairId = chick.pairId;
    const originalClutchId = chick.clutchId;

    // 1. Update Chick foster fields
    chick.fosterPairId = destinationPairId;
    if (!chick.parentHistory) {
      chick.parentHistory = [
        {
          timestamp: chick.createdAt || now,
          type: 'biological',
          pairId: originalPairId,
          description: 'Éclosion chez les parents biologiques'
        }
      ];
    }
    chick.parentHistory.push({
      timestamp: now,
      type: 'foster',
      pairId: destinationPairId,
      description: `Transféré vers les parents nourriciers (Couple: ${destinationPairId}). Motif : ${reason}`
    });
    ChickRepository.update(chick);

    // 2. Increment foster parent count
    let fosterParent = this.getFosterParentsByPair(destinationPairId);
    if (!fosterParent) {
      fosterParent = this.toggleFosterStatus(destinationPairId);
    }
    fosterParent.currentFosterCount += 1;
    fosterParent.status = 'active';
    fosterParent.timeline.push({
      id: `fost-ev-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: now,
      type: 'chick_received',
      description: `Adoption du poussin ${chick.name} (${chick.provisionalNumber})`
    });
    FosterRepository.saveFosterParents(fosterParent);

    // 3. Create Transfer Record
    const transfer: TransferRecord = {
      id: `tr-${Math.random().toString(36).substring(2, 11)}`,
      chickId,
      sourceClutchId: originalClutchId,
      sourcePairId: originalPairId,
      destinationPairId,
      transferDate: today,
      reason,
      status: 'active',
      timeline: [
        {
          id: `tr-ev-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: now,
          type: 'transfer_started',
          description: `Transfert initié vers le couple ${destinationPairId}`
        }
      ],
      createdAt: now,
      updatedAt: now
    };
    FosterRepository.saveTransfer(transfer);

    // 4. Update / Create Nursery Record
    let nurseryRec = NurseryRepository.getNurseryRecordByChick(chickId);
    if (nurseryRec) {
      nurseryRec.mode = nurseryRec.mode === 'hand_feeding' ? 'mixed' : 'foster_parents';
      nurseryRec.fosterPairId = destinationPairId;
      nurseryRec.updatedAt = now;
      nurseryRec.timeline.push({
        id: `nurs-ev-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: now,
        type: 'foster_assigned',
        description: `Bascule en mode adoptif avec le couple ${destinationPairId}`
      });
      NurseryRepository.saveNurseryRecord(nurseryRec);
    } else {
      const newNurseryRec: NurseryRecord = {
        id: `nr-${Math.random().toString(36).substring(2, 11)}`,
        chickId,
        status: 'active',
        entryDate: today,
        mode: 'foster_parents',
        fosterPairId: destinationPairId,
        timeline: [
          {
            id: `nurs-ev-${Math.random().toString(36).substring(2, 9)}`,
            timestamp: now,
            type: 'nursery_entered',
            description: `Entrée en nurserie sous parents nourriciers (Couple ${destinationPairId})`
          }
        ],
        createdAt: now,
        updatedAt: now
      };
      NurseryRepository.saveNurseryRecord(newNurseryRec);
    }

    // 5. Add Chick timeline event & audit log
    ChickService.addEvent(chickId, 'feeding', `Placé en adoption sous le couple nourricier [${destinationPairId}]. Motif: ${reason}`);
    
    ActivityLogger.log(
      EventType.JEUNE_ADD,
      `Poussin "${chick.name}" (${chick.provisionalNumber}) transféré aux parents nourriciers (Couple ${destinationPairId})`
    );

    return transfer;
  }

  static returnChickToBiologicalParents(chickId: string): boolean {
    const chick = ChickRepository.getById(chickId);
    if (!chick || !chick.fosterPairId) return false;

    const fosterPairId = chick.fosterPairId;
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // 1. Update Chick
    chick.fosterPairId = undefined;
    if (chick.parentHistory) {
      chick.parentHistory.push({
        timestamp: now,
        type: 'biological',
        pairId: chick.pairId,
        description: 'Retourné aux parents biologiques d\'origine.'
      });
    }
    ChickRepository.update(chick);

    // 2. Decrement foster count
    const fosterParent = this.getFosterParentsByPair(fosterPairId);
    if (fosterParent) {
      fosterParent.currentFosterCount = Math.max(0, fosterParent.currentFosterCount - 1);
      if (fosterParent.currentFosterCount === 0 && fosterParent.status === 'active') {
        fosterParent.status = 'available';
      }
      fosterParent.timeline.push({
        id: `fost-ev-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: now,
        type: 'chick_returned',
        description: `Poussin ${chick.name} retourné à ses parents biologiques.`
      });
      FosterRepository.saveFosterParents(fosterParent);
    }

    // 3. Mark Transfer Record as completed/returned
    const activeTransfers = FosterRepository.getTransfersByChick(chickId).filter(t => t.status === 'active');
    activeTransfers.forEach(t => {
      t.status = 'returned';
      t.returnDate = today;
      t.updatedAt = now;
      t.timeline.push({
        id: `tr-ev-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: now,
        type: 'transfer_ended_return',
        description: 'Retour opéré vers le nid biologique.'
      });
      FosterRepository.saveTransfer(t);
    });

    // 4. Update Nursery Record
    const nurseryRec = NurseryRepository.getNurseryRecordByChick(chickId);
    if (nurseryRec) {
      nurseryRec.mode = nurseryRec.mode === 'mixed' ? 'hand_feeding' : 'biological_parents';
      nurseryRec.fosterPairId = undefined;
      nurseryRec.updatedAt = now;
      nurseryRec.timeline.push({
        id: `nurs-ev-${Math.random().toString(36).substring(2, 9)}`,
        timestamp: now,
        type: 'foster_removed',
        description: `Parents nourriciers retirés. Retour au nid biologique.`
      });
      NurseryRepository.saveNurseryRecord(nurseryRec);
    }

    // 5. Timeline Event & Audit
    ChickService.addEvent(chickId, 'feeding', 'Retourné chez ses parents biologiques');
    ActivityLogger.log(
      EventType.JEUNE_ADD,
      `Poussin "${chick.name}" (${chick.provisionalNumber}) retourné à ses parents biologiques`
    );

    return true;
  }
}
