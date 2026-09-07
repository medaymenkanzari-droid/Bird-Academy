/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari } from '../types';

/**
 * Calculates the age of a canary and formats it in a readable string (e.g. "1 an et 2 mois", "5 mois", "12 jours").
 */
export function calculateAgeString(
  dateStr: string,
  t?: (key: any, variables?: any) => string
): string {
  if (!dateStr) return t ? t('ageUnknown') : 'Âge inconnu';
  const birthDate = new Date(dateStr);
  const now = new Date();
  
  if (isNaN(birthDate.getTime())) return t ? t('ageUnknown') : 'Date invalide';
  
  let years = now.getFullYear() - birthDate.getFullYear();
  let months = now.getMonth() - birthDate.getMonth();
  let days = now.getDate() - birthDate.getDate();
  
  if (days < 0) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years > 0) {
    if (months > 0) {
      if (t) {
        return t('ageYearsMonths', {
          years,
          yPlural: years > 1 ? 's' : '',
          months,
          mPlural: months > 1 ? 's' : ''
        });
      }
      return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
    }
    if (t) {
      return t('ageYears', {
        years,
        yPlural: years > 1 ? 's' : ''
      });
    }
    return `${years} an${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    if (t) {
      return t('ageMonths', {
        months,
        mPlural: months > 1 ? 's' : ''
      });
    }
    return `${months} mois`;
  } else {
    const diffTime = Math.abs(now.getTime() - birthDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
      return t ? t('ageToday') : `Aujourd'hui`;
    }
    if (t) {
      return t('ageDays', { days: diffDays });
    }
    return `${diffDays} jours`;
  }
}

export interface PedigreeNode {
  id?: number;
  nom: string;
  bague?: string;
  sexe?: 'Mâle' | 'Femelle' | 'Indéterminé';
  couleur?: string;
  pere?: PedigreeNode | null;
  mere?: PedigreeNode | null;
}

/**
 * Calculates the pedigree heights (generations depth from founders) of all birds.
 * Founders (no parents) have height 0.
 * Children have height 1 + max(height(father), height(mother)).
 */
export function calculatePedigreeHeights(canaris: Canari[]): Record<number, number> {
  const heights: Record<number, number> = {};
  const birdMap = new Map<number, Canari>(canaris.map(c => [c.id, c]));

  function getHeight(id: number): number {
    if (heights[id] !== undefined) {
      return heights[id];
    }

    const bird = birdMap.get(id);
    if (!bird) {
      heights[id] = 0;
      return 0;
    }

    const pereId = bird.pere_id;
    const mereId = bird.mere_id;

    let pereHeight = 0;
    let mereHeight = 0;

    if (pereId && birdMap.has(pereId)) {
      pereHeight = getHeight(pereId);
    }
    if (mereId && birdMap.has(mereId)) {
      mereHeight = getHeight(mereId);
    }

    const h = (pereId || mereId) ? 1 + Math.max(pereHeight, mereHeight) : 0;
    heights[id] = h;
    return h;
  }

  for (const bird of canaris) {
    getHeight(bird.id);
  }

  return heights;
}

/**
 * Calculates the kinship coefficient f(id1, id2) between two individuals recursively.
 * Wright's Coefficient of Inbreeding (COI) of a child is equal to the kinship coefficient of its parents.
 */
export function calculateKinship(
  id1: number | null | undefined,
  id2: number | null | undefined,
  canaris: Canari[],
  heights: Record<number, number>,
  memo: Map<string, number> = new Map()
): number {
  if (!id1 || !id2) return 0;

  // Ensure unique memo key by sorting IDs
  const key = id1 < id2 ? `${id1}_${id2}` : `${id2}_${id1}`;
  if (memo.has(key)) {
    return memo.get(key)!;
  }

  const birdMap = new Map<number, Canari>(canaris.map(c => [c.id, c]));

  if (id1 === id2) {
    // f(A, A) = 0.5 * (1 + f(P_A, M_A))
    const bird = birdMap.get(id1);
    if (!bird || (!bird.pere_id && !bird.mere_id)) {
      memo.set(key, 0.5);
      return 0.5;
    }
    const fParents = calculateKinship(bird.pere_id, bird.mere_id, canaris, heights, memo);
    const result = 0.5 * (1 + fParents);
    memo.set(key, result);
    return result;
  }

  // If A !== B, expand the one with the higher pedigree height
  const h1 = heights[id1] || 0;
  const h2 = heights[id2] || 0;

  if (h1 >= h2) {
    const bird1 = birdMap.get(id1);
    if (!bird1 || (!bird1.pere_id && !bird1.mere_id)) {
      memo.set(key, 0);
      return 0;
    }
    // f(A, B) = 0.5 * (f(P_A, B) + f(M_A, B))
    const fPere = bird1.pere_id ? calculateKinship(bird1.pere_id, id2, canaris, heights, memo) : 0;
    const fMere = bird1.mere_id ? calculateKinship(bird1.mere_id, id2, canaris, heights, memo) : 0;
    const result = 0.5 * (fPere + fMere);
    memo.set(key, result);
    return result;
  } else {
    const bird2 = birdMap.get(id2);
    if (!bird2 || (!bird2.pere_id && !bird2.mere_id)) {
      memo.set(key, 0);
      return 0;
    }
    // f(A, B) = 0.5 * (f(A, P_B) + f(A, M_B))
    const fPere = bird2.pere_id ? calculateKinship(id1, bird2.pere_id, canaris, heights, memo) : 0;
    const fMere = bird2.mere_id ? calculateKinship(id1, bird2.mere_id, canaris, heights, memo) : 0;
    const result = 0.5 * (fPere + fMere);
    memo.set(key, result);
    return result;
  }
}

/**
 * Calculates the estimated Coefficient of Inbreeding (COI) of a potential offspring of a male and female.
 * Returns value as a percentage (e.g. 12.5 for 12.5%).
 */
export function calculateInbreedingCOI(maleId: number, femaleId: number, canaris: Canari[]): number {
  const heights = calculatePedigreeHeights(canaris);
  const kinship = calculateKinship(maleId, femaleId, canaris, heights);
  // COI = kinship coefficient of parents * 100
  return kinship * 100;
}

export interface InbreedingCategory {
  coi: number;
  level: 'Aucun' | 'Faible' | 'Modéré' | 'Élevé' | 'Très élevé';
  recommendation: 'Recommandé' | 'Acceptable' | 'Prudence' | 'Déconseillé' | 'À éviter';
  badgeClass: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  iconColor: string;
}

/**
 * Gets the consanguinity category details based on the COI percentage.
 */
export function getInbreedingCategory(coi: number): InbreedingCategory {
  if (coi === 0) {
    return {
      coi,
      level: 'Aucun',
      recommendation: 'Recommandé',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      bgClass: 'bg-emerald-50/50',
      borderClass: 'border-emerald-100',
      textClass: 'text-emerald-800',
      iconColor: 'text-emerald-500'
    };
  } else if (coi > 0 && coi <= 6.25) {
    return {
      coi,
      level: 'Faible',
      recommendation: 'Acceptable',
      badgeClass: 'bg-green-100 text-green-800 border-green-200',
      bgClass: 'bg-green-50/40',
      borderClass: 'border-green-100',
      textClass: 'text-green-800',
      iconColor: 'text-green-500'
    };
  } else if (coi > 6.25 && coi <= 12.5) {
    return {
      coi,
      level: 'Modéré',
      recommendation: 'Prudence',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
      bgClass: 'bg-amber-50/55',
      borderClass: 'border-amber-100',
      textClass: 'text-amber-800',
      iconColor: 'text-amber-500'
    };
  } else if (coi > 12.5 && coi <= 25) {
    return {
      coi,
      level: 'Élevé',
      recommendation: 'Déconseillé',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
      bgClass: 'bg-orange-50/40',
      borderClass: 'border-orange-100',
      textClass: 'text-orange-800',
      iconColor: 'text-orange-500'
    };
  } else {
    return {
      coi,
      level: 'Très élevé',
      recommendation: 'À éviter',
      badgeClass: 'bg-red-100 text-red-800 border-red-200',
      bgClass: 'bg-red-50/50',
      borderClass: 'border-red-100',
      textClass: 'text-red-800',
      iconColor: 'text-red-500'
    };
  }
}

/**
 * Builds a structured, complete 3-generation genealogy tree for a selected canary.
 */
export function buildGenealogyTree(birdId: number, canaris: Canari[]): PedigreeNode | null {
  const birdMap = new Map<number, Canari>(canaris.map(c => [c.id, c]));

  function buildNode(id: number | null | undefined, currentDepth: number): PedigreeNode | null {
    if (!id) return null;
    const bird = birdMap.get(id);
    if (!bird) return null;

    // Standard properties
    const node: PedigreeNode = {
      id: bird.id,
      nom: bird.nom,
      bague: bird.bague,
      sexe: bird.sexe,
      couleur: bird.couleur
    };

    // We restrict visual tree building to 3 generations (depth 0, 1, 2)
    if (currentDepth < 2) {
      const pereNode = bird.pere_id ? buildNode(bird.pere_id, currentDepth + 1) : null;
      const mereNode = bird.mere_id ? buildNode(bird.mere_id, currentDepth + 1) : null;
      node.pere = pereNode;
      node.mere = mereNode;
    }

    return node;
  }

  return buildNode(birdId, 0);
}

/**
 * Helper to identify relationships between two birds for friendly alerts.
 */
export function getRelationshipLabel(maleId: number, femaleId: number, canaris: Canari[], t?: (key: string) => string): string {
  const tr = (key: string, fallback: string) => t ? t(key) : fallback;
  const male = canaris.find(c => c.id === maleId);
  const female = canaris.find(c => c.id === femaleId);
  if (!male || !female) return tr('rel_none', "Aucun lien connu");

  // Identical parent checks
  const mPere = male.pere_id;
  const mMere = male.mere_id;
  const fPere = female.pere_id;
  const fMere = female.mere_id;

  if (mPere && mMere && fPere && fMere) {
    if (mPere === fPere && mMere === fMere) {
      return tr('rel_brother_sister', "frère/sœur");
    }
  }

  if (mPere && fPere && mPere === fPere) {
    if (mMere !== fMere) return tr('rel_half_sibling_father', "demi-frère/demi-sœur (même père)");
  }

  if (mMere && fMere && mMere === fMere) {
    if (mPere !== fPere) return tr('rel_half_sibling_mother', "demi-frère/demi-sœur (même mère)");
  }

  // Parent-offspring relationship
  if (male.id === fPere) return tr('rel_father_daughter', "père/fille");
  if (female.id === mPere) return tr('rel_father_daughter', "père/fille"); // biologically male is father
  if (female.id === mMere) return tr('rel_mother_son', "mère/fils");
  if (male.id === fMere) return tr('rel_mother_son', "mère/fils"); // biologically female is mother

  // Grandparent-offspring
  const heights = calculatePedigreeHeights(canaris);
  const mHeights = heights[maleId] || 0;
  const fHeights = heights[femaleId] || 0;

  // Check if one is grandparent of the other
  const mParents = [mPere, mMere].filter(Boolean);
  const fParents = [fPere, fMere].filter(Boolean);

  // Is male grandparent of female?
  const maleMap = new Map<number, Canari>(canaris.map(c => [c.id, c]));
  const fP = female.pere_id ? maleMap.get(female.pere_id) : null;
  const fM = female.mere_id ? maleMap.get(female.mere_id) : null;
  if (fP && (fP.pere_id === maleId || fP.mere_id === maleId)) return tr('rel_grandfather_granddaughter', "grand-père/petite-fille");
  if (fM && (fM.pere_id === maleId || fM.mere_id === maleId)) return tr('rel_grandfather_granddaughter', "grand-père/petite-fille");

  // Is female grandmother of male?
  const mP = male.pere_id ? maleMap.get(male.pere_id) : null;
  const mM = male.mere_id ? maleMap.get(male.mere_id) : null;
  if (mP && (mP.pere_id === femaleId || mP.mere_id === femaleId)) return tr('rel_grandmother_grandson', "grand-mère/petit-fils");
  if (mM && (mM.pere_id === femaleId || mM.mere_id === femaleId)) return tr('rel_grandmother_grandson', "grand-mère/petit-fils");

  // Cousin / Uncle check
  // Check if they share at least one grandparent
  const getGrandparents = (id: number): number[] => {
    const b = maleMap.get(id);
    if (!b) return [];
    const gps: number[] = [];
    if (b.pere_id) {
      const p = maleMap.get(b.pere_id);
      if (p) {
        if (p.pere_id) gps.push(p.pere_id);
        if (p.mere_id) gps.push(p.mere_id);
      }
    }
    if (b.mere_id) {
      const m = maleMap.get(b.mere_id);
      if (m) {
        if (m.pere_id) gps.push(m.pere_id);
        if (m.mere_id) gps.push(m.mere_id);
      }
    }
    return gps;
  };

  const mGps = getGrandparents(maleId);
  const fGps = getGrandparents(femaleId);
  const sharedGps = mGps.filter(id => fGps.includes(id));
  if (sharedGps.length > 0) {
    return tr('rel_cousins', "cousin/cousine");
  }

  // Uncle-Niece
  // Is male a brother or half-brother of female's parents?
  const isSibling = (id1: number, id2: number): boolean => {
    const b1 = maleMap.get(id1);
    const b2 = maleMap.get(id2);
    if (!b1 || !b2) return false;
    return (b1.pere_id !== undefined && b1.pere_id !== null && b1.pere_id === b2.pere_id) ||
           (b1.mere_id !== undefined && b1.mere_id !== null && b1.mere_id === b2.mere_id);
  };

  if (female.pere_id && isSibling(maleId, female.pere_id)) return tr('rel_uncle_niece', "oncle/nièce");
  if (female.mere_id && isSibling(maleId, female.mere_id)) return tr('rel_uncle_niece', "oncle/nièce");

  // Aunt-Nephew
  if (male.pere_id && isSibling(femaleId, male.pere_id)) return tr('rel_aunt_nephew', "tante/neveu");
  if (male.mere_id && isSibling(femaleId, male.mere_id)) return tr('rel_aunt_nephew', "tante/neveu");

  return tr('rel_related', "apparentés");
}
