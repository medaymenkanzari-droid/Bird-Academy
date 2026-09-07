/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../storage';
import { 
  ComEvaluation, 
  WeightLogEntry, 
  BirdPalmaresEntry, 
  COM_CRITERIA_DEFINITIONS 
} from '../models/passport';
import { Canari } from '../../../types';
import { getBiologicalProfileById } from '../../../reference/species/index';

const STORAGE_KEYS = {
  COM_EVALUATIONS: 'ba_passport_com_evaluations',
  WEIGHT_LOGS: 'ba_passport_weight_logs',
  PALMARES: 'ba_passport_palmares'
};

export class PassportDataService {
  /**
   * Computes the medal tier based on standard COM point thresholds.
   */
  static computeMedalTier(score: number): 'Gold' | 'Silver' | 'Bronze' | 'None' {
    if (score >= 90) return 'Gold';
    if (score >= 88) return 'Silver';
    if (score >= 85) return 'Bronze';
    return 'None';
  }

  /**
   * Generates default baseline criteria scores totaling a realistic default (e.g. 91 pts).
   */
  static getDefaultCriteriaScores(bird?: Canari | null): Record<string, number> {
    return {
      type_posture: 18,
      variete_lipochrome: 19,
      dessin_melanine: 14,
      plumage: 14,
      taille_proportions: 9,
      tete_bec: 9,
      condition_maintien: 9
    };
  }

  /**
   * Retrieves all COM evaluations.
   */
  static getAllComEvaluations(): ComEvaluation[] {
    return appStorage.getItem<ComEvaluation[]>(STORAGE_KEYS.COM_EVALUATIONS, []);
  }

  /**
   * Retrieves or creates a default COM evaluation for a given bird.
   */
  static getComEvaluation(birdId: number, bird?: Canari | null): ComEvaluation {
    const all = this.getAllComEvaluations();
    const existing = all.find(e => e.birdId === birdId);
    if (existing) return existing;

    const defaultScores = this.getDefaultCriteriaScores(bird);
    const total = Object.values(defaultScores).reduce((acc, s) => acc + s, 0);

    return {
      birdId,
      date: new Date().toISOString().split('T')[0],
      judgeName: 'Juge National C.O.M.',
      showName: 'Exposition Ornithologique Régionale',
      scores: defaultScores,
      totalScore: total,
      medalTier: this.computeMedalTier(total),
      comments: 'Sujet conforme au standard.',
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Saves a COM evaluation for a bird.
   */
  static saveComEvaluation(evalData: ComEvaluation): void {
    const all = this.getAllComEvaluations();
    const index = all.findIndex(e => e.birdId === evalData.birdId);
    
    // Recalculate total and medal tier
    const totalScore = Object.values(evalData.scores).reduce((acc, s) => acc + Number(s || 0), 0);
    const updatedEval: ComEvaluation = {
      ...evalData,
      totalScore,
      medalTier: this.computeMedalTier(totalScore),
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      all[index] = updatedEval;
    } else {
      all.push(updatedEval);
    }
    appStorage.setItem(STORAGE_KEYS.COM_EVALUATIONS, all);
  }

  /**
   * Retrieves all weight logs.
   */
  static getAllWeightLogs(): WeightLogEntry[] {
    return appStorage.getItem<WeightLogEntry[]>(STORAGE_KEYS.WEIGHT_LOGS, []);
  }

  /**
   * Retrieves weight logs for a specific bird, using real species reference weight.
   */
  static getWeightLogsForBird(birdId: number, bird?: Canari | null): WeightLogEntry[] {
    const all = this.getAllWeightLogs();
    const birdLogs = all.filter(l => l.birdId === birdId);
    if (birdLogs.length > 0) {
      return birdLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Determine baseline weight from biological profile if available
    const resolvedSpeciesId = bird?.espece || (bird as any)?.speciesId || (bird as any)?.species;
    const profile = resolvedSpeciesId ? getBiologicalProfileById(resolvedSpeciesId) : undefined;
    const minW = profile?.biology?.minWeight || 18;
    const maxW = profile?.biology?.maxWeight || 25;
    const midWeight = Math.round(((minW + maxW) / 2) * 10) / 10;

    const w1 = Math.round(midWeight * 0.98 * 10) / 10;
    const w2 = midWeight;
    const w3 = Math.round(midWeight * 1.02 * 10) / 10;

    const initialLogs: WeightLogEntry[] = [
      {
        id: `w_${birdId}_1`,
        birdId,
        date: new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0],
        weightGrams: w1,
        context: 'routine',
        notes: 'Poids d’entrée en saison.'
      },
      {
        id: `w_${birdId}_2`,
        birdId,
        date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
        weightGrams: w2,
        context: 'reproduction',
        notes: 'Condition physique optimale.'
      },
      {
        id: `w_${birdId}_3`,
        birdId,
        date: new Date().toISOString().split('T')[0],
        weightGrams: w3,
        context: 'routine',
        notes: 'Pesée de contrôle.'
      }
    ];

    return initialLogs;
  }

  /**
   * Adds a weight log entry for a bird.
   */
  static addWeightLog(entry: Omit<WeightLogEntry, 'id'>): WeightLogEntry {
    const all = this.getAllWeightLogs();
    const newEntry: WeightLogEntry = {
      ...entry,
      id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    all.unshift(newEntry);
    appStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, all);
    return newEntry;
  }

  /**
   * Deletes a weight log entry.
   */
  static deleteWeightLog(id: string): void {
    const all = this.getAllWeightLogs();
    const filtered = all.filter(l => l.id !== id);
    appStorage.setItem(STORAGE_KEYS.WEIGHT_LOGS, filtered);
  }

  /**
   * Retrieves all palmares entries.
   */
  static getAllPalmares(): BirdPalmaresEntry[] {
    return appStorage.getItem<BirdPalmaresEntry[]>(STORAGE_KEYS.PALMARES, []);
  }

  /**
   * Retrieves palmares entries for a specific bird.
   */
  static getPalmaresForBird(birdId: number, bird?: Canari | null): BirdPalmaresEntry[] {
    const all = this.getAllPalmares();
    const birdPalmares = all.filter(p => p.birdId === birdId);
    if (birdPalmares.length > 0) {
      return birdPalmares.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Adapt default COM section to the bird's species
    const resolvedSpeciesId = bird?.espece || (bird as any)?.speciesId || (bird as any)?.species;
    let defaultSection = 'Section D (Canaris)';
    if (resolvedSpeciesId === 'chardonneret_elegant') defaultSection = 'Section F (Faune Européenne)';
    else if (resolvedSpeciesId === 'diamant_mandarin' || resolvedSpeciesId === 'diamant_gould') defaultSection = 'Section E (Exotiques Estrildidés)';
    else if (resolvedSpeciesId === 'perruche_ondulee' || resolvedSpeciesId === 'agapornis' || resolvedSpeciesId === 'calopsitte') defaultSection = 'Section G/H (Psittacidés)';

    const defaultPalmares: BirdPalmaresEntry[] = [
      {
        id: `pal_${birdId}_1`,
        birdId,
        date: '2025-11-15',
        showName: 'Championnat National C.O.M.',
        location: 'Paris / Grand Palais',
        sectionCom: defaultSection,
        scorePoints: 92,
        rank: "1er Prix - Médaille d'Or",
        medal: 'Gold',
        judgeName: 'Juge OMJ/COM',
        certificateNumber: `COM-2025-${birdId}01`,
        notes: 'Excellente forme et tenue exemplaire.'
      }
    ];

    return defaultPalmares;
  }

  /**
   * Adds a palmares entry for a bird.
   */
  static addPalmaresEntry(entry: Omit<BirdPalmaresEntry, 'id'>): BirdPalmaresEntry {
    const all = this.getAllPalmares();
    const newEntry: BirdPalmaresEntry = {
      ...entry,
      id: `pal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    all.unshift(newEntry);
    appStorage.setItem(STORAGE_KEYS.PALMARES, all);
    return newEntry;
  }

  /**
   * Deletes a palmares entry.
   */
  static deletePalmaresEntry(id: string): void {
    const all = this.getAllPalmares();
    const filtered = all.filter(p => p.id !== id);
    appStorage.setItem(STORAGE_KEYS.PALMARES, filtered);
  }

  /**
   * Summarizes palmares metrics for a bird (total medals, best score, etc.).
   */
  static getPalmaresSummary(birdId: number, bird?: Canari | null): {
    totalShows: number;
    goldCount: number;
    silverCount: number;
    bronzeCount: number;
    bestScore: number;
    summaryLabel: string;
  } {
    const records = this.getPalmaresForBird(birdId, bird);
    const goldCount = records.filter(r => r.medal === 'Gold' || r.rank?.includes('Or')).length;
    const silverCount = records.filter(r => r.medal === 'Silver' || r.rank?.includes('Argent')).length;
    const bronzeCount = records.filter(r => r.medal === 'Bronze' || r.rank?.includes('Bronze')).length;
    const bestScore = records.reduce((max, r) => Math.max(max, r.scorePoints || 0), 0);

    const summaryLabel = records.length > 0 
      ? `${goldCount > 0 ? `${goldCount} Or / ` : ''}${bestScore > 0 ? `${bestScore} pts` : `${records.length} concours`}`
      : 'Aucun concours';

    return {
      totalShows: records.length,
      goldCount,
      silverCount,
      bronzeCount,
      bestScore,
      summaryLabel
    };
  }
}
