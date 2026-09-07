/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari, Cage, Couple, Reproduction, Ponte, Jeune, Sante, Depense, Vente } from '../../../types';
import { AnalyticsFilters, AnalyticsSettings, KPIDefinition } from '../types';
import { WrightCoefficientEngine } from '../../genetics/engines/WrightCoefficientEngine';
import { StatisticsEngine } from '../../../business/StatisticsEngine';
import { SpeciesProfileService } from '../../species/services/SpeciesProfileService';

export class AnalyticsEngine {
  
  /**
   * Filter birds list based on global analytics filters
   */
  static filterBirds(birds: Canari[], filters: AnalyticsFilters): Canari[] {
    return birds.filter(bird => {
      if (filters.species) {
        if (bird.espece !== filters.species) return false;
      } else if (bird.espece && !SpeciesProfileService.isSpeciesActive(bird.espece)) {
        return false;
      }
      if (filters.breed && bird.race !== filters.breed) return false;
      if (filters.mutation && bird.mutation !== filters.mutation) return false;
      if (filters.sex && bird.sexe !== filters.sex) return false;
      
      // Installation/Zone filter check
      if (filters.zone && bird.zone !== filters.zone) return false;
      if (filters.aviary && bird.voliere !== filters.aviary) return false;
      if (filters.cage && String(bird.cage_id) !== filters.cage) return false;
      
      // Date filter check
      if (bird.date_naissance) {
        if (filters.startDate && bird.date_naissance < filters.startDate) return false;
        if (filters.endDate && bird.date_naissance > filters.endDate) return false;
      }
      
      // Origin check
      if (filters.origin === 'internal' && bird.acquisition) return false;
      if (filters.origin === 'external' && !bird.acquisition) return false;
      
      // Status check
      if (filters.status) {
        if (filters.status === 'archived' && !bird.archived) return false;
        if (filters.status === 'active' && bird.archived) return false;
        if (filters.status === 'deceased' && bird.statut_sante?.toLowerCase() !== 'décédé') return false;
      }

      return true;
    });
  }

  /**
   * Filter financial records based on period dates
   */
  static filterFinances<T extends { date: string }>(items: T[], filters: AnalyticsFilters): T[] {
    return items.filter(item => {
      if (filters.startDate && item.date < filters.startDate) return false;
      if (filters.endDate && item.date > filters.endDate) return false;
      return true;
    });
  }

  /**
   * Core execution of the analytical calculations
   */
  static computeAllKPIs(
    rawBirds: Canari[],
    rawCages: Cage[],
    rawPairs: Couple[],
    rawClutches: Ponte[],
    rawHealth: Sante[],
    rawExpenses: Depense[],
    rawSales: Vente[],
    settings: AnalyticsSettings,
    filters: AnalyticsFilters
  ): Record<string, KPIDefinition> {
    
    // Apply filters
    const birds = this.filterBirds(rawBirds, filters);
    const deceasedBirds = birds.filter(b => b.statut_sante?.toLowerCase() === 'décédé' || b.statut_sante?.toLowerCase() === 'mort');
    const soldIds = new Set(rawSales.map(sale => sale.canari_id));
    const soldBirds = birds.filter(b => b.statut_sante?.toLowerCase() === 'vendu' || soldIds.has(b.id));
    const archivedBirds = birds.filter(b => b.archived);
    const unavailableIds = new Set([...deceasedBirds, ...soldBirds].map(bird => bird.id));
    const activeBirds = birds.filter(b => !b.archived && !unavailableIds.has(b.id));

    const expenses = this.filterFinances(rawExpenses, filters);
    const sales = this.filterFinances(rawSales, filters);
    const health = this.filterFinances(rawHealth, filters);

    // 1. POPULATION KPIs
    const totalBirdsCount = birds.length;
    const activeBirdsCount = activeBirds.length;
    const deceasedBirdsCount = deceasedBirds.length;
    const soldBirdsCount = soldBirds.length;
    const archivedBirdsCount = archivedBirds.length;

    // Species, Breed and Mutation distributions
    const speciesMap: Record<string, number> = {};
    const breedMap: Record<string, number> = {};
    const mutationMap: Record<string, number> = {};
    let maleCount = 0;
    let femaleCount = 0;
    let indetCount = 0;

    birds.forEach(b => {
      const sp = b.espece || 'Canari';
      speciesMap[sp] = (speciesMap[sp] || 0) + 1;
      
      const br = b.race || 'Canari de couleur';
      breedMap[br] = (breedMap[br] || 0) + 1;

      const mt = b.mutation || 'Classique';
      mutationMap[mt] = (mutationMap[mt] || 0) + 1;

      if (b.sexe === 'Mâle') maleCount++;
      else if (b.sexe === 'Femelle') femaleCount++;
      else indetCount++;
    });

    const uniqueSpeciesCount = Object.keys(speciesMap).length;
    const uniqueBreedsCount = Object.keys(breedMap).length;
    const uniqueMutationsCount = Object.keys(mutationMap).length;

    // Average age calculation (in days)
    let totalAgeDays = 0;
    let ageCount = 0;
    const nowMs = Date.now();
    birds.forEach(b => {
      if (b.date_naissance) {
        const birthMs = Date.parse(b.date_naissance);
        if (!isNaN(birthMs)) {
          const ageDays = Math.max(0, (nowMs - birthMs) / (1000 * 60 * 60 * 24));
          totalAgeDays += ageDays;
          ageCount++;
        }
      }
    });
    const avgAgeYears = ageCount > 0 ? Number((totalAgeDays / ageCount / 365).toFixed(1)) : 0;

    // 2. REPRODUCTION KPIs
    const statistics = StatisticsEngine.calculate(birds, rawClutches, expenses, sales);
    const totalEggs = statistics.totalEggs;
    const fertileEggs = statistics.fertilizedEggs;
    const hatchedEggs = statistics.hatchedEggs;
    const weanedYoungs = statistics.weanedChicks;
    const clutchesCount = rawClutches.length;
    const fertilityRate = Number(statistics.fertilityRate.toFixed(1));
    const hatchingRate = Number(statistics.hatchRate.toFixed(1));
    const weaningRate = Number(statistics.survivalRate.toFixed(1));
    const avgBreedingTime = 35; // Standard biological cycle of canary nesting + fledging (35 days)

    // 3. HABITAT KPIs
    const totalCagesCount = rawCages.length;
    const occupiedCages = new Set(activeBirds.map(b => b.cage_id).filter(id => id && id > 0));
    const occupiedCagesCount = occupiedCages.size;
    const occupancyRate = totalCagesCount > 0 ? Math.round((occupiedCagesCount / totalCagesCount) * 100) : 0;
    const availableCagesCount = Math.max(0, totalCagesCount - occupiedCagesCount);

    // Calculate bird density per cage
    const cageOccupants: Record<number, number> = {};
    activeBirds.forEach(b => {
      if (b.cage_id) cageOccupants[b.cage_id] = (cageOccupants[b.cage_id] || 0) + 1;
    });

    let overOccupiedCagesCount = 0;
    rawCages.forEach(c => {
      const occupantsCount = cageOccupants[c.id] || 0;
      if (occupantsCount > c.capacite_max) overOccupiedCagesCount++;
    });

    const quarantineBirdsCount = activeBirds.filter(b => b.statut_sante?.toLowerCase() === 'quarantaine').length;
    const cageRotationFactor = rawPairs.length > 0 && totalCagesCount > 0 ? Number((rawPairs.length / totalCagesCount).toFixed(2)) : 0;

    // 4. FINANCE KPIs
    const totalRevenueAmount = statistics.totalSales;
    const totalExpensesAmount = statistics.totalExpenses;
    let feedExpenses = 0;
    let medicalExpenses = 0;
    let cagesExpenses = 0;

    expenses.forEach(e => {
      const amount = Number.isFinite(e.montant) && e.montant > 0 ? e.montant : 0;
      if (e.categorie === 'Alimentation') feedExpenses += amount;
      else if (e.categorie === 'Santé') medicalExpenses += amount;
      else if (e.categorie === 'Cages' || e.categorie === 'Matériel') cagesExpenses += amount;
    });

    const netCashFlow = totalRevenueAmount - totalExpensesAmount;
    const profitMargin = totalRevenueAmount > 0 ? Number(((netCashFlow / totalRevenueAmount) * 100).toFixed(1)) : 0;
    const costPerChick = weanedYoungs > 0 ? Number((totalExpensesAmount / weanedYoungs).toFixed(2)) : 0;

    // 5. SANTE KPIs
    const diseasesCount = health.filter(h => h.categorie === 'Symptôme').length;
    const activeTreatmentsCount = health.filter(h => h.categorie === 'Traitement' && h.statut !== 'Terminé').length;
    const totalTreatmentsCount = health.filter(h => h.categorie === 'Traitement').length;
    const completedTreatmentsCount = health.filter(h => h.categorie === 'Traitement' && h.statut === 'Terminé').length;
    
    const recoveryRate = totalTreatmentsCount > 0 ? Math.round((completedTreatmentsCount / totalTreatmentsCount) * 100) : 100;
    
    // Medical mortality (deceased subjects who had active disease records)
    const medicalDeceasedCount = deceasedBirds.filter(db => health.some(h => h.canari_id === db.id)).length;
    const healthMortalityRate = activeBirdsCount > 0 ? Number(((medicalDeceasedCount / activeBirdsCount) * 100).toFixed(1)) : 0;
    
    const vaccinatedCount = health.filter(h => h.categorie === 'Vaccin').map(h => h.canari_id);
    const uniqueVaccinatedCount = new Set(vaccinatedCount).size;
    const vaccinationCoverage = activeBirdsCount > 0 ? Math.round((uniqueVaccinatedCount / activeBirdsCount) * 100) : 100;

    // 6. GENETICS KPIs
    // Calculate Wright inbreeding coefficient average for birds with parents
    let inbreedingSum = 0;
    let birdsWithParentsCount = 0;

    activeBirds.forEach(b => {
      if (b.pere_id && b.mere_id) {
        const coef = WrightCoefficientEngine.calculateInbreeding(b.pere_id, b.mere_id, rawBirds).coefficient;
        if (coef !== null) {
          inbreedingSum += coef;
          birdsWithParentsCount++;
        }
      }
    });

    const averageInbreeding = birdsWithParentsCount > 0 ? Number(((inbreedingSum / birdsWithParentsCount) * 100).toFixed(2)) : 0;
    
    // Find unique founder lines
    const founders = new Set<number>();
    const findFounders = (birdId: number) => {
      const b = rawBirds.find(x => x.id === birdId);
      if (!b) return;
      if (!b.pere_id && !b.mere_id) {
        founders.add(birdId);
      } else {
        if (b.pere_id) findFounders(b.pere_id);
        if (b.mere_id) findFounders(b.mere_id);
      }
    };

    activeBirds.forEach(b => findFounders(b.id));
    const uniqueFoundersCount = founders.size;

    // Simulated active line branches
    const activeBranchesCount = uniqueFoundersCount > 0 ? Math.max(1, Math.min(8, Math.round(uniqueFoundersCount / 1.5))) : 0;
    const geneticDiversity = Math.max(45, Math.min(100, Math.round(100 - averageInbreeding * 4)));
    const geneticQualityScore = Math.max(50, Math.min(100, Math.round(geneticDiversity * 0.9 + (uniqueFoundersCount > 3 ? 10 : 0))));

    // 7. DATA QUALITY KPIs
    let totalFilledFields = 0;
    let totalPossibleFields = 0;
    let birdsWithPhoto = 0;
    let birdsWithRing = 0;
    let birdsWithFiliation = 0;

    birds.forEach(b => {
      // Ring
      if (b.bague && b.bague !== 'Sans bague') {
        birdsWithRing++;
        totalFilledFields++;
      }
      totalPossibleFields++;

      // Photo
      if (b.photo || (b.photos && b.photos.length > 0)) {
        birdsWithPhoto++;
        totalFilledFields++;
      }
      totalPossibleFields++;

      // Parents/Filiation
      if (b.pere_id || b.mere_id) {
        birdsWithFiliation++;
        totalFilledFields += (b.pere_id ? 1 : 0) + (b.mere_id ? 1 : 0);
      }
      totalPossibleFields += 2;

      // Color/Race/Species details
      if (b.race) totalFilledFields++;
      totalPossibleFields++;
      if (b.couleur) totalFilledFields++;
      totalPossibleFields++;
      if (b.espece) totalFilledFields++;
      totalPossibleFields++;
      if (b.mutation) totalFilledFields++;
      totalPossibleFields++;
    });

    const dataQualityIndex = totalPossibleFields > 0 ? Math.round((totalFilledFields / totalPossibleFields) * 100) : 100;
    const withPhotoPct = totalBirdsCount > 0 ? Math.round((birdsWithPhoto / totalBirdsCount) * 100) : 0;
    const withRingPct = totalBirdsCount > 0 ? Math.round((birdsWithRing / totalBirdsCount) * 100) : 0;
    const withParentsPct = totalBirdsCount > 0 ? Math.round((birdsWithFiliation / totalBirdsCount) * 100) : 0;
    const missingInfoCount = (totalPossibleFields - totalFilledFields);

    // Build the final dictionary mapping
    const result: Record<string, KPIDefinition> = {
      // Population Group
      total_birds: {
        id: 'total_birds',
        name: 'Total des oiseaux',
        value: totalBirdsCount,
        category: 'population',
        description: 'Totalité des sujets enregistrés dans le cheptel',
        status: totalBirdsCount > 20 ? 'success' : 'info'
      },
      active_birds: {
        id: 'active_birds',
        name: 'Oiseaux actifs',
        value: activeBirdsCount,
        category: 'population',
        description: 'Sujets vivants actuellement présents à l\'élevage',
        status: 'success'
      },
      deceased_birds: {
        id: 'deceased_birds',
        name: 'Oiseaux décédés',
        value: deceasedBirdsCount,
        category: 'population',
        description: 'Total cumulé des décès enregistrés',
        status: deceasedBirdsCount > 5 ? 'danger' : 'success'
      },
      sold_birds: {
        id: 'sold_birds',
        name: 'Oiseaux vendus',
        value: soldBirdsCount,
        category: 'population',
        description: 'Sujets cédés ou commercialisés',
        status: 'info'
      },
      archived_birds: {
        id: 'archived_birds',
        name: 'Sujets archivés',
        value: archivedBirdsCount,
        category: 'population',
        description: 'Historiques d\'oiseaux archivés',
        status: 'info'
      },
      unique_species: {
        id: 'unique_species',
        name: 'Espèces uniques',
        value: uniqueSpeciesCount,
        category: 'population',
        description: 'Nombre d\'espèces ornithologiques distinctes',
        status: 'info'
      },
      unique_breeds: {
        id: 'unique_breeds',
        name: 'Races représentées',
        value: uniqueBreedsCount,
        category: 'population',
        description: 'Nombre de sous-races de canaris suivies',
        status: 'info'
      },
      unique_mutations: {
        id: 'unique_mutations',
        name: 'Mutations actives',
        value: uniqueMutationsCount,
        category: 'population',
        description: 'Variations phénotypiques enregistrées',
        status: 'info'
      },
      average_age: {
        id: 'average_age',
        name: 'Âge moyen',
        value: avgAgeYears,
        unit: 'ans',
        category: 'population',
        description: 'Moyenne d\'âge théorique du troupeau',
        status: 'info'
      },

      // Reproduction Group
      fertility_rate: {
        id: 'fertility_rate',
        name: 'Taux de fertilité',
        value: fertilityRate,
        unit: '%',
        category: 'reproduction',
        description: 'Ratio d\'œufs fécondés sur le total pondu',
        status: fertilityRate >= settings.fertilityTarget ? 'success' : 'warning'
      },
      hatching_rate: {
        id: 'hatching_rate',
        name: 'Taux d\'éclosion',
        value: hatchingRate,
        unit: '%',
        category: 'reproduction',
        description: 'Ratio d\'éclosion d\'œufs fertiles',
        status: hatchingRate >= settings.hatchingTarget ? 'success' : 'warning'
      },
      weaning_rate: {
        id: 'weaning_rate',
        name: 'Taux de sevrage',
        value: weaningRate,
        unit: '%',
        category: 'reproduction',
        description: 'Ratio d\'oisillons sevrés ayant survécu',
        status: weaningRate >= settings.weaningTarget ? 'success' : 'warning'
      },
      clutches_count: {
        id: 'clutches_count',
        name: 'Nombre de pontes',
        value: clutchesCount,
        category: 'reproduction',
        description: 'Total de couvées démarrées',
        status: 'info'
      },
      total_eggs: {
        id: 'total_eggs',
        name: 'Total des œufs',
        value: totalEggs,
        category: 'reproduction',
        description: 'Nombre total d\'œufs pondus',
        status: 'info'
      },
      total_chicks: {
        id: 'total_chicks',
        name: 'Frais d\'oisillons',
        value: hatchedEggs,
        category: 'reproduction',
        description: 'Nombre d\'oisillons nés',
        status: 'info'
      },
      weaned_count: {
        id: 'weaned_count',
        name: 'Jeunes sevrés',
        value: weanedYoungs,
        category: 'reproduction',
        description: 'Nombre total de jeunes de l\'année sevrés',
        status: 'success'
      },
      avg_breeding_time: {
        id: 'avg_breeding_time',
        name: 'Temps de cycle',
        value: avgBreedingTime,
        unit: 'jours',
        category: 'reproduction',
        description: 'Durée moyenne de reproduction théorique d\'une ponte',
        status: 'info'
      },

      // Habitat Group
      occupancy_rate: {
        id: 'occupancy_rate',
        name: 'Taux d\'occupation',
        value: occupancyRate,
        unit: '%',
        category: 'habitat',
        description: 'Proportion de logements occupés par au moins un oiseau',
        status: occupancyRate > 90 ? 'warning' : 'success'
      },
      available_cages: {
        id: 'available_cages',
        name: 'Cages vacantes',
        value: availableCagesCount,
        category: 'habitat',
        description: 'Nombre de cages actuellement libres pour accueil',
        status: availableCagesCount > 0 ? 'success' : 'warning'
      },
      overoccupied_cages: {
        id: 'overoccupied_cages',
        name: 'Surcharges d\'occupation',
        value: overOccupiedCagesCount,
        category: 'habitat',
        description: 'Nombre de cages dépassant leur capacité d\'accueil maximale',
        status: overOccupiedCagesCount > 0 ? 'danger' : 'success'
      },
      cage_rotation: {
        id: 'cage_rotation',
        name: 'Facteur de rotation',
        value: cageRotationFactor,
        category: 'habitat',
        description: 'Rotation des couples par cage active',
        status: 'info'
      },
      quarantine_count: {
        id: 'quarantine_count',
        name: 'En quarantaine',
        value: quarantineBirdsCount,
        category: 'habitat',
        description: 'Nombre d\'oiseaux placés à l\'isolement sanitaire',
        status: quarantineBirdsCount > 0 ? 'warning' : 'success'
      },

      // Finances Group
      total_revenue: {
        id: 'total_revenue',
        name: 'Recettes globales',
        value: totalRevenueAmount,
        unit: settings.currency,
        category: 'finance',
        description: 'Montant total des cessions d\'oiseaux',
        status: totalRevenueAmount >= settings.revenueTarget ? 'success' : 'info'
      },
      total_expenses: {
        id: 'total_expenses',
        name: 'Dépenses globales',
        value: totalExpensesAmount,
        unit: settings.currency,
        category: 'finance',
        description: 'Total des charges (nourriture, soins, matériel)',
        status: 'info'
      },
      net_cashflow: {
        id: 'net_cashflow',
        name: 'Cash-Flow Net',
        value: netCashFlow,
        unit: settings.currency,
        category: 'finance',
        description: 'Solde financier net consolidé',
        status: netCashFlow >= 0 ? 'success' : 'danger'
      },
      profit_margin: {
        id: 'profit_margin',
        name: 'Marge de profit',
        value: profitMargin,
        unit: '%',
        category: 'finance',
        description: 'Rentabilité relative de l\'activité d\'élevage',
        status: profitMargin > 15 ? 'success' : 'info'
      },
      cost_per_chick: {
        id: 'cost_per_chick',
        name: 'Coût unitaire de sevrage',
        value: costPerChick,
        unit: settings.currency,
        category: 'finance',
        description: 'Dépenses moyennes investies par jeune sevré',
        status: costPerChick < 20 ? 'success' : 'warning'
      },
      feed_cost: {
        id: 'feed_cost',
        name: 'Budget Alimentation',
        value: feedExpenses,
        unit: settings.currency,
        category: 'finance',
        description: 'Somme cumulée allouée à l\'alimentation',
        status: 'info'
      },

      // Health Group
      disease_incidence: {
        id: 'disease_incidence',
        name: 'Cas de pathologies',
        value: diseasesCount,
        category: 'health',
        description: 'Nombre de symptômes déclarés sur la période',
        status: diseasesCount > 3 ? 'warning' : 'success'
      },
      active_treatments: {
        id: 'active_treatments',
        name: 'Traitements en cours',
        value: activeTreatmentsCount,
        category: 'health',
        description: 'Nombre de protocoles médicaux actifs',
        status: activeTreatmentsCount > 0 ? 'warning' : 'success'
      },
      health_mortality_rate: {
        id: 'health_mortality_rate',
        name: 'Mortalité sanitaire',
        value: healthMortalityRate,
        unit: '%',
        category: 'health',
        description: 'Taux de décès liés directement à des pathologies',
        status: healthMortalityRate > 5 ? 'danger' : 'success'
      },
      recovery_rate: {
        id: 'recovery_rate',
        name: 'Taux de guérison',
        value: recoveryRate,
        unit: '%',
        category: 'health',
        description: 'Proportion de traitements achevés avec succès',
        status: recoveryRate >= 90 ? 'success' : 'warning'
      },
      vaccination_rate: {
        id: 'vaccination_rate',
        name: 'Couverture vaccinale',
        value: vaccinationCoverage,
        unit: '%',
        category: 'health',
        description: 'Sujets actifs immunisés ou vaccinés',
        status: vaccinationCoverage >= 80 ? 'success' : 'info'
      },

      // Genetics Group
      average_inbreeding: {
        id: 'average_inbreeding',
        name: 'Consanguinité moyenne',
        value: averageInbreeding,
        unit: '%',
        category: 'genetics',
        description: 'Coefficient de Wright (COI) moyen de l\'élevage',
        status: averageInbreeding < 6.25 ? 'success' : averageInbreeding < 12.5 ? 'warning' : 'danger'
      },
      genetic_diversity: {
        id: 'genetic_diversity',
        name: 'Indice de diversité',
        value: geneticDiversity,
        unit: '%',
        category: 'genetics',
        description: 'Pourcentage de conservation de l\'hétérogénéité',
        status: geneticDiversity >= 80 ? 'success' : 'warning'
      },
      unique_founders: {
        id: 'unique_founders',
        name: 'Lignes fondatrices',
        value: uniqueFoundersCount,
        category: 'genetics',
        description: 'Nombre d\'ancêtres originels distincts à la base des lignées',
        status: uniqueFoundersCount >= 4 ? 'success' : 'warning'
      },
      active_branches: {
        id: 'active_branches',
        name: 'Rameaux généalogiques',
        value: activeBranchesCount,
        category: 'genetics',
        description: 'Branches collatérales actives actuellement',
        status: 'info'
      },
      genetic_quality_score: {
        id: 'genetic_quality_score',
        name: 'Qualité du patrimoine',
        value: geneticQualityScore,
        unit: '/100',
        category: 'genetics',
        description: 'Score synthétique d\'intégrité génétique globale',
        status: geneticQualityScore >= 75 ? 'success' : 'warning'
      },

      // Data Quality Group
      data_quality_index: {
        id: 'data_quality_index',
        name: 'Indice DQI',
        value: dataQualityIndex,
        unit: '%',
        category: 'data_quality',
        description: 'Complétude globale des fiches d\'identité des canaris',
        status: dataQualityIndex >= 90 ? 'success' : dataQualityIndex >= 70 ? 'warning' : 'danger'
      },
      with_photo_pct: {
        id: 'with_photo_pct',
        name: 'Avec photo',
        value: withPhotoPct,
        unit: '%',
        category: 'data_quality',
        description: 'Proportion de canaris possédant une illustration photo',
        status: 'info'
      },
      with_ring_pct: {
        id: 'with_ring_pct',
        name: 'Bagués',
        value: withRingPct,
        unit: '%',
        category: 'data_quality',
        description: 'Proportion d\'oiseaux bagués officiellement',
        status: withRingPct >= 95 ? 'success' : 'warning'
      },
      with_parents_pct: {
        id: 'with_parents_pct',
        name: 'Pedigree rempli',
        value: withParentsPct,
        unit: '%',
        category: 'data_quality',
        description: 'Proportion de sujets possédant père et/ou mère déclarés',
        status: withParentsPct >= 75 ? 'success' : 'warning'
      },
      missing_info_count: {
        id: 'missing_info_count',
        name: 'Attributs manquants',
        value: missingInfoCount,
        category: 'data_quality',
        description: 'Total cumulé des champs recommandés non complétés',
        status: missingInfoCount === 0 ? 'success' : 'info'
      },
    };

    return result;
  }
}
