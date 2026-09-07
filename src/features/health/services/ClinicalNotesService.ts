/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../storage';
import { ClinicalNote } from '../models/health';

const STORAGE_KEY = 'ba_health_clinical_notes';

export class ClinicalNotesService {
  /**
   * Retrieves all clinical notes.
   */
  static getAll(): ClinicalNote[] {
    return appStorage.getItem<ClinicalNote[]>(STORAGE_KEY, []);
  }

  /**
   * Retrieves clinical notes for a given bird.
   */
  static getNotesForBird(birdId: number): ClinicalNote[] {
    const all = this.getAll();
    const birdNotes = all.filter(n => n.birdId === birdId);
    if (birdNotes.length > 0) {
      return birdNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Default sample clinical notes for pre-existing birds
    const defaultNotes: ClinicalNote[] = [
      {
        id: `note_${birdId}_1`,
        birdId,
        date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
        author: 'Dr. Vétérinaire Aviaire',
        title: 'Bilan de santé saisonnier & Plumage',
        content: 'Examen général satisfaisant. Plumes de vol intactes, sous-ventre propre sans congestion hépatomégalique. Bonne dynamique au perchoir.',
        severity: 'normal',
        tags: ['Examen annuel', 'Plumage', 'Conforme'],
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
      },
      {
        id: `note_${birdId}_2`,
        birdId,
        date: new Date(Date.now() - 45 * 86400000).toISOString().split('T')[0],
        author: 'Éleveur Référent',
        title: 'Contrôle pré-reproduction',
        content: 'Cloaque prêt, comportement de chant très actif. Poids et bréchet vérifiés (stade 3/5 idéal).',
        severity: 'normal',
        tags: ['Reproduction', 'Pesée', 'Vigueur'],
        createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
      }
    ];

    return defaultNotes;
  }

  /**
   * Adds a clinical note.
   */
  static addNote(note: Omit<ClinicalNote, 'id' | 'createdAt'>): ClinicalNote {
    const all = this.getAll();
    const newNote: ClinicalNote = {
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    all.unshift(newNote);
    appStorage.setItem(STORAGE_KEY, all);
    return newNote;
  }

  /**
   * Deletes a clinical note.
   */
  static deleteNote(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter(n => n.id !== id);
    if (filtered.length !== all.length) {
      appStorage.setItem(STORAGE_KEY, filtered);
      return true;
    }
    return false;
  }
}
