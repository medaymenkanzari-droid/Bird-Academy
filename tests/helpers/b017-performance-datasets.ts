/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — B-017 DATASETS DE PERFORMANCE (P1, P2, P3, P4)
 * Générateur déterministe et contrôlé de volumétries massives pour benchmarks QA.
 */

import { Canari, Couple, Reproduction, Ponte, Jeune, Sante, Alimentation, Depense, Vente, HabitatCage } from '../../src/types';
import { BreedingPair } from '../../src/features/reproduction/types';
import { Clutch } from '../../src/features/reproduction/clutches/types';
import { Chick } from '../../src/features/reproduction/chicks/types';

export interface PerformanceDataset {
  size: 'P1' | 'P2' | 'P3' | 'P4';
  birds: Canari[];
  pairs: Couple[];
  breedingPairs: BreedingPair[];
  reproductions: Reproduction[];
  clutches: Ponte[];
  v2Clutches: Clutch[];
  chicks: Jeune[];
  v2Chicks: Chick[];
  health: Sante[];
  nutrition: Alimentation[];
  expenses: Depense[];
  sales: Vente[];
  cages: HabitatCage[];
  metadata: {
    birdsCount: number;
    pairsCount: number;
    reproCount: number;
    eggsCount: number;
    chicksCount: number;
    healthCount: number;
    nutritionCount: number;
    financeCount: number;
    generatedAt: string;
    generationTimeMs: number;
    estimatedJsonBytes: number;
  };
}

export class PerformanceDatasetGenerator {
  static generate(size: 'P1' | 'P2' | 'P3' | 'P4'): PerformanceDataset {
    const t0 = performance.now();
    let birdsCount = 10;
    let pairsCount = 5;
    let reproCount = 10;
    let eggsCount = 25;
    let chicksCount = 20;
    let healthCount = 10;
    let nutritionCount = 10;
    let financeCount = 10;

    if (size === 'P2') {
      birdsCount = 100;
      pairsCount = 50;
      reproCount = 200;
      eggsCount = 500;
      chicksCount = 300;
      healthCount = 500;
      nutritionCount = 500;
      financeCount = 500;
    } else if (size === 'P3') {
      birdsCount = 500;
      pairsCount = 250;
      reproCount = 1000;
      eggsCount = 3000;
      chicksCount = 2000;
      healthCount = 5000;
      nutritionCount = 5000;
      financeCount = 5000;
    } else if (size === 'P4') {
      birdsCount = 1000;
      pairsCount = 500;
      reproCount = 3000;
      eggsCount = 10000;
      chicksCount = 5000;
      healthCount = 10000;
      nutritionCount = 10000;
      financeCount = 10000;
    }

    // 1. Cages
    const numCages = Math.max(5, Math.ceil(birdsCount / 10));
    const cages: HabitatCage[] = [];
    for (let c = 1; c <= numCages; c++) {
      cages.push({
        id: `cage-${c}`,
        zoneId: 'zone_default',
        nom: `Cage ${String(c).padStart(3, '0')}`,
        description: `Emplacement volière n°${c}`,
        statut: 'Actif',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        isArchived: false,
        capacite_max: 12,
        customFields: { type: 'standard' }
      });
    }

    // 2. Oiseaux
    const races = ['Gloster', 'Lipochrome', 'Harz', 'Border', 'Yorkshire', 'Fife Fancy'];
    const couleurs = ['Jaune', 'Blanc', 'Rouge', 'Agathe', 'Isabelle', 'Brun'];
    const categories = ['Postures', 'Couleur', 'Chant'];
    const birds: Canari[] = [];

    for (let i = 1; i <= birdsCount; i++) {
      const isMale = i % 2 === 1;
      const race = races[i % 5];
      const couleur = couleurs[i % couleurs.length];
      const categorie = categories[i % categories.length];
      const cageId = (i % numCages) + 1;

      // Création d'une généalogie cohérente
      let pereId: number | undefined;
      let mereId: number | undefined;
      if (i > 10) {
        pereId = (i % 5) + 1; // Un mâle fondateur
        mereId = (i % 5) + 6; // Une femelle fondatrice
      }

      birds.push({
        id: i,
        bague: `FR-2025-${String(i).padStart(4, '0')}`,
        nom: `Oiseau-${String(i).padStart(4, '0')}`,
        sexe: isMale ? 'Mâle' : 'Femelle',
        espece: 'Canari',
        categorie,
        race,
        mutation: 'Classique',
        couleur_base: couleur,
        facteur: 'Sans facteur',
        couleur,
        date_naissance: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
        statut_sante: i % 25 === 0 ? 'En observation' : 'Sain',
        cage_id: cageId,
        cageId: `cage-${cageId}`,
        pere_id: pereId,
        mere_id: mereId,
        archived: false
      });
    }

    // 3. Couples & Breeding Pairs
    const pairs: Couple[] = [];
    const breedingPairs: BreedingPair[] = [];
    for (let p = 1; p <= pairsCount; p++) {
      const maleIndex = ((p * 2) - 1) % birdsCount || 1;
      const femaleIndex = (p * 2) % birdsCount || 2;
      const pairCageId = (p % numCages) + 1;

      pairs.push({
        id: p,
        male_id: maleIndex,
        femelle_id: femaleIndex,
        date_creation: '2025-01-10',
        statut: 'Actif'
      });

      breedingPairs.push({
        id: `bp-${p}`,
        maleId: maleIndex,
        femaleId: femaleIndex,
        dateCreated: '2025-01-10',
        status: 'active',
        seasonId: '2025',
        statistics: {
          pairId: `bp-${p}`,
          reproductionsCount: Math.ceil(reproCount / pairsCount),
          totalEggs: Math.ceil(eggsCount / pairsCount),
          fertileEggs: Math.ceil((eggsCount * 0.8) / pairsCount),
          hatchedEggs: Math.ceil(chicksCount / pairsCount),
          weanedChicks: Math.ceil((chicksCount * 0.9) / pairsCount),
          successRate: 90
        }
      });
    }

    // 4. Reproductions
    const reproductions: Reproduction[] = [];
    for (let r = 1; r <= reproCount; r++) {
      const pId = (r % pairsCount) + 1;
      reproductions.push({
        id: r,
        couple_id: pId,
        statut: 'En cours',
        date_debut: '2025-02-15'
      });
    }

    // 5. Pontes / Clutches
    const clutches: Ponte[] = [];
    const v2Clutches: Clutch[] = [];
    const eggsPerRepro = Math.max(1, Math.floor(eggsCount / reproCount));
    const chicksPerRepro = Math.max(0, Math.floor(chicksCount / reproCount));

    for (let c = 1; c <= reproCount; c++) {
      const pairId = (c % pairsCount) + 1;
      const fert = Math.min(eggsPerRepro, Math.max(0, Math.floor(eggsPerRepro * 0.85)));
      const hatch = Math.min(fert, Math.max(0, chicksPerRepro));
      const weaned = Math.min(hatch, Math.max(0, Math.floor(hatch * 0.9)));

      clutches.push({
        id: c,
        reproduction_id: c,
        date: '2025-03-01',
        oeufs: eggsPerRepro,
        oeufs_fecondes: fert,
        eclosions: hatch,
        sevrages: weaned
      });

      v2Clutches.push({
        id: `clutch-${c}`,
        pairId: `bp-${pairId}`,
        startDate: '2025-03-01',
        eggCount: eggsPerRepro,
        fertilizedCount: fert,
        clearCount: Math.max(0, eggsPerRepro - fert),
        hatchedCount: hatch,
        lostCount: 0,
        observations: 'Couvée standard',
        status: 'active',
        createdAt: '2025-03-01T00:00:00.000Z',
        updatedAt: '2025-03-01T00:00:00.000Z'
      });
    }

    // 6. Jeunes / Chicks
    const chicks: Jeune[] = [];
    const v2Chicks: Chick[] = [];
    for (let j = 1; j <= chicksCount; j++) {
      const cId = (j % reproCount) + 1;
      const pId = (cId % pairsCount) + 1;
      const isWeaned = j % 10 !== 0;

      chicks.push({
        id: j,
        ponte_id: cId,
        bague: `J-2025-${String(j).padStart(4, '0')}`,
        statut: isWeaned ? 'Sevré' : 'En sevrage',
        date_naissance: '2025-03-20'
      });

      v2Chicks.push({
        id: `chick-${j}`,
        eggId: `egg-${j}`,
        clutchId: `clutch-${cId}`,
        pairId: `bp-${pId}`,
        name: `Poussin ${j}`,
        provisionalNumber: `PROV-${j}`,
        birthWeight: 1.5,
        hatchDate: '2025-03-20',
        status: isWeaned ? 'weaned' : 'growth',
        gender: j % 2 === 0 ? 'Mâle' : 'Femelle',
        observations: 'Canari en nurserie',
        createdAt: '2025-03-20T00:00:00.000Z',
        updatedAt: '2025-03-20T00:00:00.000Z'
      });
    }

    // 7. Santé
    const healthCategories: ('Traitement' | 'Vaccin' | 'Visite Vétérinaire' | 'Symptôme')[] = ['Traitement', 'Vaccin', 'Visite Vétérinaire', 'Symptôme'];
    const health: Sante[] = [];
    for (let h = 1; h <= healthCount; h++) {
      const bId = (h % birdsCount) + 1;
      const cat = healthCategories[h % healthCategories.length];
      health.push({
        id: h,
        canari_id: bId,
        categorie: cat,
        traitement: `${cat} préventif #${h}`,
        date: `2025-04-${String((h % 28) + 1).padStart(2, '0')}`,
        statut: 'Terminé',
        description: 'Examen de routine satisfaisant'
      });
    }

    // 8. Nutrition / Alimentation
    const aliments = ['Alpiste pur', 'Mélange élevage', 'Pâtée aux œufs', 'Graines germées', 'Vitamines hydrosolubles'];
    const periodes: ('Mue' | 'Reproduction' | 'Repos')[] = ['Mue', 'Reproduction', 'Repos'];
    const nutrition: Alimentation[] = [];
    for (let n = 1; n <= nutritionCount; n++) {
      nutrition.push({
        id: n,
        periode: periodes[n % periodes.length],
        type_aliment: aliments[n % aliments.length],
        quantite: `${Number((1.5 + (n % 10) * 0.5).toFixed(1))} kg`,
        planning_distribution: 'Quotidien',
        stock_actuel_kg: 10
      });
    }

    // 9. Finance (Dépenses & Ventes)
    const expenseCount = Math.ceil(financeCount * 0.6);
    const salesCount = Math.floor(financeCount * 0.4);
    const expenses: Depense[] = [];
    const expenseCategories: ('Alimentation' | 'Santé' | 'Matériel' | 'Cages' | 'Autre')[] = ['Alimentation', 'Santé', 'Matériel', 'Cages', 'Autre'];

    for (let e = 1; e <= expenseCount; e++) {
      expenses.push({
        id: e,
        date: `2025-05-${String((e % 28) + 1).padStart(2, '0')}`,
        categorie: expenseCategories[e % expenseCategories.length],
        montant: Number((15.0 + (e % 50) * 2.5).toFixed(2)),
        description: `Facture dépense #${e}`
      });
    }

    const sales: Vente[] = [];
    for (let s = 1; s <= salesCount; s++) {
      const bId = (s % birdsCount) + 1;
      sales.push({
        id: s,
        date: `2025-06-${String((s % 28) + 1).padStart(2, '0')}`,
        canari_id: bId,
        prix: Number((35.0 + (s % 40) * 5.0).toFixed(2)),
        acheteur: `Éleveur Partenaire #${s}`,
        description: `FR-2025-${String(bId).padStart(4, '0')}`
      });
    }

    const genMs = Number((performance.now() - t0).toFixed(2));

    // Calcul de l'empreinte JSON
    const samplePayload = {
      birds, pairs, breedingPairs, reproductions, clutches, v2Clutches, chicks, v2Chicks, health, nutrition, expenses, sales, cages
    };
    const estimatedJsonBytes = JSON.stringify(samplePayload).length * 2; // UTF-16 in memory

    return {
      size,
      birds,
      pairs,
      breedingPairs,
      reproductions,
      clutches,
      v2Clutches,
      chicks,
      v2Chicks,
      health,
      nutrition,
      expenses,
      sales,
      cages,
      metadata: {
        birdsCount,
        pairsCount,
        reproCount,
        eggsCount,
        chicksCount,
        healthCount,
        nutritionCount,
        financeCount,
        generatedAt: new Date().toISOString(),
        generationTimeMs: genMs,
        estimatedJsonBytes
      }
    };
  }

  /**
   * Charge complètement un dataset dans le stockage applicatif
   */
  static populateStorage(dataset: PerformanceDataset, appStorageInstance: any): void {
    appStorageInstance.setItem('canaris', dataset.birds);
    appStorageInstance.setItem('couples', dataset.pairs);
    appStorageInstance.setItem('ba_breeding_pairs', dataset.breedingPairs);
    appStorageInstance.setItem('reproductions', dataset.reproductions);
    appStorageInstance.setItem('pontes', dataset.clutches);
    appStorageInstance.setItem('ba_clutches', dataset.v2Clutches);
    appStorageInstance.setItem('jeunes', dataset.chicks);
    appStorageInstance.setItem('ba_repro_chicks', dataset.v2Chicks);
    appStorageInstance.setItem('sante', dataset.health);
    appStorageInstance.setItem('alimentation', dataset.nutrition);
    appStorageInstance.setItem('depenses', dataset.expenses);
    appStorageInstance.setItem('ventes', dataset.sales);
    appStorageInstance.setItem('ba_cages_v2', dataset.cages);
    appStorageInstance.setItem('ba_habitat_migration_done', true);
  }
}
