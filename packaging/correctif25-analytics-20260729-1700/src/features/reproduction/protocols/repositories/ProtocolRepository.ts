/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../../storage';
import { FeedingProtocol } from '../types';

export class ProtocolRepository {
  private static PROTOCOLS_KEY = 'ba_nursery_protocols';

  static getProtocols(): FeedingProtocol[] {
    const list = appStorage.getItem<FeedingProtocol[]>(this.PROTOCOLS_KEY, []);
    
    if (list.length === 0) {
      const defaultCanaryProtocol: FeedingProtocol = {
        id: 'protocol-canary-standard',
        species: 'Canari',
        name: 'Protocole Standard Canari',
        isActive: true,
        remarks: 'Protocole biologique de référence basé sur les rythmes circadiens d\'alimentation du canari.',
        timeline: [
          {
            id: 'p-init-1',
            timestamp: new Date().toISOString(),
            type: 'system',
            description: 'Création du protocole d\'élevage manuel du Canari.'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schedules: [
          {
            id: 'sched-1',
            minAgeDays: 0,
            maxAgeDays: 2,
            frequencyPerDay: 10,
            suggestedVolumeMl: 0.2,
            suggestedTempC: 39.5,
            notes: 'Pâtée très liquide (90% eau). Nourrir dès que le jabot est vide.'
          },
          {
            id: 'sched-2',
            minAgeDays: 2,
            maxAgeDays: 5,
            frequencyPerDay: 8,
            suggestedVolumeMl: 0.5,
            suggestedTempC: 39.5,
            notes: 'Pâtée légèrement plus consistante (80% eau). Digestion rapide.'
          },
          {
            id: 'sched-3',
            minAgeDays: 5,
            maxAgeDays: 10,
            frequencyPerDay: 6,
            suggestedVolumeMl: 1.2,
            suggestedTempC: 39.0,
            notes: 'Épaississement de la pâtée (70% eau). Les yeux commencent à s\'ouvrir.'
          },
          {
            id: 'sched-4',
            minAgeDays: 10,
            maxAgeDays: 15,
            frequencyPerDay: 5,
            suggestedVolumeMl: 2.2,
            suggestedTempC: 39.0,
            notes: 'Développement des plumes de couverture. Espacement des séances.'
          },
          {
            id: 'sched-5',
            minAgeDays: 15,
            maxAgeDays: 21,
            frequencyPerDay: 4,
            suggestedVolumeMl: 3.5,
            suggestedTempC: 38.5,
            notes: 'Pâtée épaisse. Sortie du nid imminente. Présentation d\'eau et de graines de sevrage.'
          }
        ]
      };

      const defaultBudgieProtocol: FeedingProtocol = {
        id: 'protocol-budgie-standard',
        species: 'Perruche',
        name: 'Protocole Standard Perruche Ondulée',
        isActive: true,
        remarks: 'Pour les perruches ondulées et petits psittacidae.',
        timeline: [
          {
            id: 'p-init-2',
            timestamp: new Date().toISOString(),
            type: 'system',
            description: 'Création du protocole d\'élevage manuel de la Perruche.'
          }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schedules: [
          {
            id: 'sched-p1',
            minAgeDays: 0,
            maxAgeDays: 3,
            frequencyPerDay: 8,
            suggestedVolumeMl: 0.4,
            suggestedTempC: 39.0,
            notes: 'Nourrissage régulier jour et nuit.'
          },
          {
            id: 'sched-p2',
            minAgeDays: 3,
            maxAgeDays: 8,
            frequencyPerDay: 6,
            suggestedVolumeMl: 1.0,
            suggestedTempC: 39.0,
            notes: 'Jabot très extensible.'
          },
          {
            id: 'sched-p3',
            minAgeDays: 8,
            maxAgeDays: 15,
            frequencyPerDay: 5,
            suggestedVolumeMl: 3.0,
            suggestedTempC: 38.5,
            notes: 'Apparition des premiers tubes de plumes.'
          },
          {
            id: 'sched-p4',
            minAgeDays: 15,
            maxAgeDays: 25,
            frequencyPerDay: 4,
            suggestedVolumeMl: 5.0,
            suggestedTempC: 38.5,
            notes: 'Introduction progressive d\'aliments solides dans la cage.'
          }
        ]
      };

      const defaults = [defaultCanaryProtocol, defaultBudgieProtocol];
      appStorage.setItem(this.PROTOCOLS_KEY, defaults);
      return defaults;
    }

    return list;
  }

  static getProtocolById(id: string): FeedingProtocol | undefined {
    return this.getProtocols().find(p => p.id === id);
  }

  static getProtocolBySpecies(species: string): FeedingProtocol | undefined {
    return this.getProtocols().find(p => p.species.toLowerCase() === species.toLowerCase() && p.isActive);
  }

  static saveProtocol(record: FeedingProtocol): FeedingProtocol {
    const list = this.getProtocols();
    const index = list.findIndex(p => p.id === record.id);
    if (index !== -1) {
      list[index] = record;
    } else {
      list.push(record);
    }
    appStorage.setItem(this.PROTOCOLS_KEY, list);
    return record;
  }
}
