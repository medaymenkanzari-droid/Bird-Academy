/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProtocolRepository } from '../repositories/ProtocolRepository';
import { FeedingProtocol, FeedingSchedule } from '../types';

export class ProtocolService {
  static getProtocols(): FeedingProtocol[] {
    return ProtocolRepository.getProtocols();
  }

  static getProtocolById(id: string): FeedingProtocol | undefined {
    return ProtocolRepository.getProtocolById(id);
  }

  static getProtocolBySpecies(species: string): FeedingProtocol | undefined {
    return ProtocolRepository.getProtocolBySpecies(species);
  }

  static saveProtocol(protocol: FeedingProtocol): FeedingProtocol {
    const now = new Date().toISOString();
    protocol.updatedAt = now;
    if (!protocol.timeline) protocol.timeline = [];
    protocol.timeline.push({
      id: `prot-ev-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: now,
      type: 'protocol_updated',
      description: `Protocole "${protocol.name}" mis à jour.`
    });
    return ProtocolRepository.saveProtocol(protocol);
  }

  static createProtocol(species: string, name: string, remarks?: string, schedules: FeedingSchedule[] = []): FeedingProtocol {
    const now = new Date().toISOString();
    const newProtocol: FeedingProtocol = {
      id: `prot-${Math.random().toString(36).substring(2, 11)}`,
      species,
      name,
      isActive: true,
      remarks,
      schedules,
      timeline: [
        {
          id: `prot-ev-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: now,
          type: 'protocol_created',
          description: `Protocole d'alimentation "${name}" créé pour l'espèce "${species}"`
        }
      ],
      createdAt: now,
      updatedAt: now
    };
    return ProtocolRepository.saveProtocol(newProtocol);
  }

  static getScheduleForAge(species: string, ageDays: number): FeedingSchedule | null {
    const protocol = this.getProtocolBySpecies(species);
    if (!protocol) return null;
    
    const schedule = protocol.schedules.find(s => ageDays >= s.minAgeDays && ageDays <= s.maxAgeDays);
    return schedule || null;
  }
}
