/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION V1.9.7
 * DASHBOARD & STATISTICS INTELLIGENCE SERVICE
 * 
 * PRINCIPES ABSOLUS :
 * 1. Zéro création ou modification de vérité biologique ou génétique.
 * 2. Zéro invention de donnée, d'oiseau, de ponte ou de dépense.
 * 3. Zéro score global d'élevage, zéro étoile (★), zéro classement d'oiseaux/couples.
 * 4. Zéro transformation d'UNKNOWN ou de NOT_TESTED en valeur connue.
 * 5. Présentation explicite de toute statistique partielle ("X oiseaux avec date connue").
 * 6. Lecture seule stricte : aucune consultation ne mute le localStorage.
 * 7. Support multilingue complet : FR, EN, AR (RTL), ES, IT.
 */

import { Canari, Couple, Ponte, Sante, Depense, Vente, Cage, HabitatCage, Zone, Aviary, QuarantineArea, QuarantineRecord } from '../../../types';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { ReproductionRepository } from '../../reproduction/repositories/ReproductionRepository';
import { ClutchRepository } from '../../reproduction/clutches/repositories/ClutchRepository';
import { ChickRepository } from '../../reproduction/chicks/repositories/ChickRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { FinanceRepository } from '../../finance/repositories/FinanceRepository';
import { StatisticsEngine } from '../../../business/StatisticsEngine';
import { Language } from '../../../utils/translations';

export interface SpeciesDistributionItem {
  species: string;
  count: number;
  percentage: number;
}

export interface AgeDistributionStats {
  knownCount: number;
  missingCount: number;
  youngUnder1Year: number;
  adult1To4Years: number;
  seniorOver4Years: number;
}

export interface FlockDemographics {
  totalBirds: number;
  malesCount: number;
  femalesCount: number;
  unknownSexCount: number;
  activeCount: number;
  archivedCount: number;
  quarantineCount: number;
  unassignedCount: number;
  speciesDistribution: SpeciesDistributionItem[];
  ageDistribution: AgeDistributionStats;
}

export interface FlockReproductionStats {
  totalPairs: number;
  activePairs: number;
  totalClutches: number;
  activeClutches: number;
  totalEggs: number;
  fertilizedEggs: number;
  knownFertilityEggs: number;
  fertilityRate: number | null;
  hatchedEggs: number;
  knownHatchFertilizedEggs: number;
  hatchRate: number | null;
  weanedChicks: number;
  knownSurvivalHatchedEggs: number;
  survivalRate: number | null;
  activeIncubations: number;
  nurseryCount: number;
}

export interface FlockHabitatStats {
  totalZones: number;
  totalAviaries: number;
  totalCages: number;
  occupiedCagesCount: number;
  emptyCagesCount: number;
  cagesWithoutCapacityCount: number;
  quarantineAreasCount: number;
  quarantineActiveBirdsCount: number;
  unassignedBirdsCount: number;
}

export interface RecentEventItem {
  id: string;
  type: 'bird_add' | 'clutch' | 'hatch' | 'health' | 'quarantine';
  title: string;
  description: string;
  date: string;
  badgeText: string;
  badgeVariant: 'info' | 'success' | 'warning' | 'danger';
}

export interface MissingDataAuditItem {
  id: string;
  category: 'bird' | 'habitat' | 'health' | 'reproduction';
  field: string;
  message: string;
  affectedCount: number;
  severity: 'low' | 'medium' | 'high';
}

export interface FlockStatisticsSnapshot {
  timestamp: string;
  demographics: FlockDemographics;
  reproduction: FlockReproductionStats;
  habitat: FlockHabitatStats;
  recentEvents: RecentEventItem[];
  missingDataAudits: MissingDataAuditItem[];
  intelligenceSummary: {
    statusSummary: string;
    highlights: string[];
    missingDataNotices: string[];
  };
}

export class DashboardStatisticsService {

  /**
   * Extrait et compile un snapshot analytique 100% déterministe et en lecture seule.
   * Ne modifie aucun stockage local.
   */
  static computeSnapshot(
    customBirds?: Canari[],
    customClutches?: Ponte[],
    customCouples?: Couple[],
    customHealth?: Sante[],
    language: Language = 'fr'
  ): FlockStatisticsSnapshot {
    const birds = customBirds || BirdRepository.getAll(true);
    const activeBirds = birds.filter(b => !b.archived && b.statut_sante?.toLowerCase() !== 'décédé');
    const archivedBirds = birds.filter(b => b.archived);

    // 1. DÉMOGRAPHIE & POPULATION
    const totalBirds = activeBirds.length;
    let malesCount = 0;
    let femalesCount = 0;
    let unknownSexCount = 0;
    let quarantineCount = 0;
    let unassignedCount = 0;

    const speciesCounts: Record<string, number> = {};
    let birthDateKnownCount = 0;
    let birthDateMissingCount = 0;
    let youngUnder1Year = 0;
    let adult1To4Years = 0;
    let seniorOver4Years = 0;

    const now = new Date();

    for (const bird of activeBirds) {
      // Sexe
      if (bird.sexe === 'Mâle') {
        malesCount++;
      } else if (bird.sexe === 'Femelle') {
        femalesCount++;
      } else {
        unknownSexCount++; // Préserve 'Indéterminé', 'UNKNOWN', ou vide
      }

      // Quarantaine
      if (bird.statut_sante?.toLowerCase() === 'quarantaine' || bird.quarantineId) {
        quarantineCount++;
      }

      // Non assigné
      const hasCage = bird.cageId !== undefined && bird.cageId !== '' || bird.cage_id !== undefined && bird.cage_id !== null;
      const hasZone = bird.zoneId !== undefined && bird.zoneId !== '';
      const hasAviary = bird.aviaryId !== undefined && bird.aviaryId !== '';
      const hasQuarantine = bird.quarantineId !== undefined && bird.quarantineId !== '';
      if (!hasCage && !hasZone && !hasAviary && !hasQuarantine) {
        unassignedCount++;
      }

      // Espèce
      const rawSp = bird.espece?.trim();
      const isUndeterminedSp = !rawSp || rawSp === '' || rawSp.toUpperCase() === 'UNKNOWN' || rawSp.toLowerCase() === 'indéterminé' || rawSp.toLowerCase() === 'indéterminée' || rawSp.toLowerCase() === 'non spécifiée';
      const spKey = isUndeterminedSp
        ? 'Non spécifiée'
        : (rawSp === 'colombe' || rawSp === 'colombe-diamant' ? 'colombe_diamant' : rawSp);
      speciesCounts[spKey] = (speciesCounts[spKey] || 0) + 1;

      // Âge
      if (bird.date_naissance && /^\d{4}-\d{2}-\d{2}$/.test(bird.date_naissance)) {
        const bDate = new Date(bird.date_naissance);
        if (!isNaN(bDate.getTime())) {
          birthDateKnownCount++;
          const diffMs = now.getTime() - bDate.getTime();
          const ageYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
          if (ageYears < 1) {
            youngUnder1Year++;
          } else if (ageYears <= 4) {
            adult1To4Years++;
          } else {
            seniorOver4Years++;
          }
        } else {
          birthDateMissingCount++;
        }
      } else {
        birthDateMissingCount++;
      }
    }

    const speciesDistribution: SpeciesDistributionItem[] = Object.entries(speciesCounts).map(([species, count]) => ({
      species,
      count,
      percentage: totalBirds > 0 ? Math.round((count / totalBirds) * 100) : 0
    }));

    // 2. REPRODUCTION & ÉLEVAGE
    const couples = customCouples || ReproductionRepository.getAll().map((p, idx) => ({
      id: typeof p.id === 'number' ? p.id : (parseInt(String(p.id).replace('bp-', '')) || (idx + 1)),
      male_id: p.maleId,
      femelle_id: p.femaleId,
      date_creation: p.dateCreated,
      statut: p.status === 'active' ? 'Actif' : 'Dissous'
    }));

    const activePairs = couples.filter(c => c.statut === 'Actif').length;

    // Récupération des pontes homologuées
    let clutches: Ponte[] = [];
    if (customClutches) {
      clutches = customClutches;
    } else {
      const v2Clutches = ClutchRepository.getAll();
      if (v2Clutches.length > 0) {
        clutches = v2Clutches.map((c, idx) => ({
          id: idx + 1,
          reproduction_id: parseInt(c.pairId.replace('bp-', '')) || (idx + 1),
          date: c.startDate,
          oeufs: c.eggCount,
          oeufs_fecondes: c.fertilizedCount ?? undefined,
          eclosions: c.hatchedCount ?? undefined,
          sevrages: undefined
        }));
      } else {
        clutches = BreedingRepository.getPontes();
      }
    }

    const expenses = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();
    const statsResult = StatisticsEngine.calculate(activeBirds, clutches, expenses, sales);

    const chicks = ChickRepository.getAll();
    const nurseryCount = chicks.filter(c => c.status === 'growth' || c.status === 'weaning' || c.status === 'hatching').length;

    const reproStats: FlockReproductionStats = {
      totalPairs: couples.length,
      activePairs,
      totalClutches: clutches.length,
      activeClutches: clutches.filter(c => {
        const d = new Date(c.date);
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 35;
      }).length,
      totalEggs: statsResult.totalEggs,
      fertilizedEggs: statsResult.fertilizedEggs,
      knownFertilityEggs: statsResult.knownFertilityEggs,
      fertilityRate: statsResult.knownFertilityEggs > 0 ? statsResult.fertilityRate : null,
      hatchedEggs: statsResult.hatchedEggs,
      knownHatchFertilizedEggs: statsResult.knownHatchFertilizedEggs,
      hatchRate: statsResult.knownHatchFertilizedEggs > 0 ? statsResult.hatchRate : null,
      weanedChicks: statsResult.weanedChicks,
      knownSurvivalHatchedEggs: statsResult.knownSurvivalHatchedEggs,
      survivalRate: statsResult.knownSurvivalHatchedEggs > 0 ? statsResult.survivalRate : null,
      activeIncubations: clutches.filter(c => {
        const d = new Date(c.date);
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 14;
      }).length,
      nurseryCount
    };

    // 3. HABITAT
    const rawZones = HabitatRepository.getAll<Zone>('zone');
    const rawAviaries = HabitatRepository.getAll<Aviary>('aviary');
    const rawCages = HabitatRepository.getAll<HabitatCage>('cage');
    const rawQAreas = HabitatRepository.getAll<QuarantineArea>('quarantineArea');

    const occupiedCageIds = new Set<string>();
    activeBirds.forEach(b => {
      if (b.cageId) occupiedCageIds.add(String(b.cageId));
      if (b.cage_id !== undefined && b.cage_id !== null) occupiedCageIds.add(String(b.cage_id));
    });

    const occupiedCagesCount = rawCages.filter(c => occupiedCageIds.has(String(c.id))).length;
    const emptyCagesCount = Math.max(0, rawCages.length - occupiedCagesCount);
    const cagesWithoutCapacityCount = rawCages.filter(c => !c.capacite_max).length;

    const habitatStats: FlockHabitatStats = {
      totalZones: rawZones.length,
      totalAviaries: rawAviaries.length,
      totalCages: rawCages.length,
      occupiedCagesCount,
      emptyCagesCount,
      cagesWithoutCapacityCount,
      quarantineAreasCount: rawQAreas.length,
      quarantineActiveBirdsCount: quarantineCount,
      unassignedBirdsCount: unassignedCount
    };

    // 4. CHRONOLOGIE / ÉVÉNEMENTS RÉCENTS (Uniquement événements réels documentés)
    const recentEvents: RecentEventItem[] = [];

    const getBirdEventTitle = (name: string): string => {
      const map: Record<Language, string> = {
        fr: `Enregistrement : ${name}`,
        en: `Record: ${name}`,
        ar: `تسجيل طائر: ${name}`,
        es: `Registro: ${name}`,
        it: `Registrazione: ${name}`
      };
      return map[language] || map.fr;
    };

    const getBirdBadgeText = (): string => {
      const map: Record<Language, string> = {
        fr: 'Oiseau', en: 'Bird', ar: 'طائر', es: 'Ave', it: 'Uccello'
      };
      return map[language] || map.fr;
    };

    const getClutchEventTitle = (eggs: number): string => {
      const map: Record<Language, string> = {
        fr: `Ponte (${eggs} œuf(s))`,
        en: `Clutch (${eggs} egg(s))`,
        ar: `وضع بيض (${eggs} بيضة)`,
        es: `Puesta (${eggs} huevo(s))`,
        it: `Cova (${eggs} uovo/a)`
      };
      return map[language] || map.fr;
    };

    const getClutchEventDesc = (): string => {
      const map: Record<Language, string> = {
        fr: 'Incubation enregistrée',
        en: 'Incubation recorded',
        ar: 'الحضانة جارية',
        es: 'Incubación registrada',
        it: 'Incubazione registrata'
      };
      return map[language] || map.fr;
    };

    const getClutchBadgeText = (): string => {
      const map: Record<Language, string> = {
        fr: 'Ponte', en: 'Clutch', ar: 'بيض', es: 'Puesta', it: 'Cova'
      };
      return map[language] || map.fr;
    };

    const getHealthEventTitle = (treatment: string): string => {
      const map: Record<Language, string> = {
        fr: `Traitement : ${treatment}`,
        en: `Treatment: ${treatment}`,
        ar: `علاج: ${treatment}`,
        es: `Tratamiento: ${treatment}`,
        it: `Trattamento: ${treatment}`
      };
      return map[language] || map.fr;
    };

    const getHealthDefaultDesc = (): string => {
      const map: Record<Language, string> = {
        fr: 'Soin sanitaire',
        en: 'Health care',
        ar: 'رعاية بيطرية',
        es: 'Cuidado sanitario',
        it: 'Cura sanitaria'
      };
      return map[language] || map.fr;
    };

    const getHealthBadgeText = (): string => {
      const map: Record<Language, string> = {
        fr: 'Santé', en: 'Health', ar: 'صحة', es: 'Salud', it: 'Salute'
      };
      return map[language] || map.fr;
    };

    // Naissances / acquisitions récentes
    activeBirds
      .filter(b => b.date_naissance)
      .slice(-5)
      .forEach(b => {
        const rawSp = b.espece?.trim();
        const isUndeterminedSp = !rawSp || rawSp === '' || rawSp.toUpperCase() === 'UNKNOWN' || rawSp.toLowerCase() === 'indéterminé' || rawSp.toLowerCase() === 'indéterminée' || rawSp.toLowerCase() === 'non spécifiée';
        const displaySp = isUndeterminedSp
          ? 'Non spécifiée'
          : (rawSp === 'colombe' || rawSp === 'colombe-diamant' ? 'colombe_diamant' : rawSp);
        recentEvents.push({
          id: `bird-${b.id}`,
          type: 'bird_add',
          title: getBirdEventTitle(b.nom || b.bague),
          description: `${displaySp} • ${b.sexe || 'Indéterminé'}`,
          date: b.date_naissance!,
          badgeText: getBirdBadgeText(),
          badgeVariant: 'info'
        });
      });

    // Pontes récentes
    clutches.slice(-5).forEach(c => {
      recentEvents.push({
        id: `clutch-${c.id}`,
        type: 'clutch',
        title: getClutchEventTitle(c.oeufs),
        description: getClutchEventDesc(),
        date: c.date,
        badgeText: getClutchBadgeText(),
        badgeVariant: 'success'
      });
    });

    // Soins de santé récents
    const healthList = customHealth || HealthRepository.getAll();
    healthList.slice(-5).forEach(h => {
      recentEvents.push({
        id: `health-${h.id}`,
        type: 'health',
        title: getHealthEventTitle(h.traitement),
        description: h.description || getHealthDefaultDesc(),
        date: h.date,
        badgeText: getHealthBadgeText(),
        badgeVariant: 'warning'
      });
    });

    // Tri chronologique réel (du plus récent au plus ancien)
    recentEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 5. AUDIT DES DONNÉES MANQUANTES
    const missingDataAudits: MissingDataAuditItem[] = [];

    if (birthDateMissingCount > 0) {
      const msgMap: Record<Language, string> = {
        fr: `${birthDateMissingCount} oiseau(x) sans date de naissance renseignée.`,
        en: `${birthDateMissingCount} bird(s) without recorded birth date.`,
        ar: `${birthDateMissingCount} طائر/طيور بدون تاريخ ميلاد مسجل.`,
        es: `${birthDateMissingCount} ave(s) sin fecha de nacimiento registrada.`,
        it: `${birthDateMissingCount} uccello/i senza data di nascita registrata.`
      };
      missingDataAudits.push({
        id: 'missing-birth-date',
        category: 'bird',
        field: 'date_naissance',
        message: msgMap[language] || msgMap.fr,
        affectedCount: birthDateMissingCount,
        severity: 'medium'
      });
    }

    if (unknownSexCount > 0) {
      const msgMap: Record<Language, string> = {
        fr: `${unknownSexCount} oiseau(x) de sexe non déterminé (UNKNOWN).`,
        en: `${unknownSexCount} bird(s) with undetermined sex (UNKNOWN).`,
        ar: `${unknownSexCount} طائر/طيور بجنس غير محدد (UNKNOWN).`,
        es: `${unknownSexCount} ave(s) con sexo no determinado (UNKNOWN).`,
        it: `${unknownSexCount} uccello/i con sesso non determinato (UNKNOWN).`
      };
      missingDataAudits.push({
        id: 'missing-sex',
        category: 'bird',
        field: 'sexe',
        message: msgMap[language] || msgMap.fr,
        affectedCount: unknownSexCount,
        severity: 'low'
      });
    }

    if (unassignedCount > 0) {
      const msgMap: Record<Language, string> = {
        fr: `${unassignedCount} oiseau(x) non assigné(s) à un hébergement.`,
        en: `${unassignedCount} bird(s) not assigned to any housing.`,
        ar: `${unassignedCount} طائر/طيور غير مخصصة لأي قفص أو سلاكة.`,
        es: `${unassignedCount} ave(s) no asignada(s) a ningún alojamiento.`,
        it: `${unassignedCount} uccello/i non assegnato/i ad alcun alloggio.`
      };
      missingDataAudits.push({
        id: 'missing-habitat',
        category: 'habitat',
        field: 'cageId',
        message: msgMap[language] || msgMap.fr,
        affectedCount: unassignedCount,
        severity: 'high'
      });
    }

    if (cagesWithoutCapacityCount > 0) {
      const msgMap: Record<Language, string> = {
        fr: `${cagesWithoutCapacityCount} cage(s) sans capacité maximale renseignée.`,
        en: `${cagesWithoutCapacityCount} cage(s) without maximum capacity recorded.`,
        ar: `${cagesWithoutCapacityCount} قفص بدون تحديد السعة القصوى.`,
        es: `${cagesWithoutCapacityCount} jaula(s) sin capacidad máxima registrada.`,
        it: `${cagesWithoutCapacityCount} gabbia/e senza capacità massima registrata.`
      };
      missingDataAudits.push({
        id: 'missing-cage-capacity',
        category: 'habitat',
        field: 'capacite_max',
        message: msgMap[language] || msgMap.fr,
        affectedCount: cagesWithoutCapacityCount,
        severity: 'low'
      });
    }

    // 6. SYNTHÈSE BIRD INTELLIGENCE (Neutre, didactique, sans prédiction)
    const highlights: string[] = [];
    const missingDataNotices: string[] = [];

    if (totalBirds > 0) {
      const hMap: Record<Language, string> = {
        fr: `L'effectif compte ${totalBirds} oiseau(x) actif(s) (${malesCount} mâle(s), ${femalesCount} femelle(s), ${unknownSexCount} indéterminé(s)).`,
        en: `Flock contains ${totalBirds} active bird(s) (${malesCount} male(s), ${femalesCount} female(s), ${unknownSexCount} undetermined).`,
        ar: `القطيع يضم ${totalBirds} طائر نشط (${malesCount} ذكور، ${femalesCount} إناث، ${unknownSexCount} غير محدد).`,
        es: `La parvada cuenta con ${totalBirds} ave(s) activa(s) (${malesCount} macho(s), ${femalesCount} hembra(s), ${unknownSexCount} indeterminado(s)).`,
        it: `L'effettivo conta ${totalBirds} uccello/i attivo/i (${malesCount} maschio/i, ${femalesCount} femmina/e, ${unknownSexCount} indeterminato/i).`
      };
      highlights.push(hMap[language] || hMap.fr);
    } else {
      const hEmpty: Record<Language, string> = {
        fr: 'Aucun oiseau actif enregistré dans la base locale.',
        en: 'No active birds recorded in the local database.',
        ar: 'لا توجد طيور مسجلة حالياً في قاعدة البيانات المحلية.',
        es: 'No hay aves activas registradas en la base local.',
        it: 'Nessun uccello attivo registrato nel database locale.'
      };
      highlights.push(hEmpty[language] || hEmpty.fr);
    }

    if (activePairs > 0) {
      const pairMap: Record<Language, string> = {
        fr: `${activePairs} couple(s) actif(s) avec un total de ${reproStats.totalEggs} œuf(s) consigné(s).`,
        en: `${activePairs} active pair(s) with a total of ${reproStats.totalEggs} recorded egg(s).`,
        ar: `${activePairs} زوج نشط قيد التكاثر مع ${reproStats.totalEggs} بيضة مسجلة.`,
        es: `${activePairs} pareja(s) activa(s) con un total de ${reproStats.totalEggs} huevo(s) registrado(s).`,
        it: `${activePairs} coppia/e attiva/e con un totale di ${reproStats.totalEggs} uovo/a registrato/e.`
      };
      highlights.push(pairMap[language] || pairMap.fr);
    }

    if (quarantineCount > 0) {
      const qMap: Record<Language, string> = {
        fr: `${quarantineCount} oiseau(x) hébergé(s) dans l'espace d'isolement sanitaire.`,
        en: `${quarantineCount} bird(s) housed in the sanitary quarantine space.`,
        ar: `${quarantineCount} طائر في مساحة الحجر الصحي المستقلة.`,
        es: `${quarantineCount} ave(s) alojada(s) en el espacio de aislamiento sanitario.`,
        it: `${quarantineCount} uccello/i ospitato/i nello spazio di isolamento sanitario.`
      };
      highlights.push(qMap[language] || qMap.fr);
    }

    if (birthDateMissingCount > 0) {
      const bMap: Record<Language, string> = {
        fr: `Données partielles : ${birthDateMissingCount} oiseau(x) sans date de naissance, calcul d'âge basé uniquement sur les sujets datés.`,
        en: `Partial data: ${birthDateMissingCount} bird(s) without birth date, age distribution computed only on dated subjects.`,
        ar: `تنبيه دقة: ${birthDateMissingCount} طائر يفتقر لتاريخ الميلاد، مما يجعل حساب الأعمار جزئياً.`,
        es: `Datos parciales: ${birthDateMissingCount} ave(s) sin fecha de nacimiento, cálculo de edad basado solo en sujetos fechados.`,
        it: `Dati parziali: ${birthDateMissingCount} uccello/i senza data di nascita, calcolo dell'età basato solo su soggetti datati.`
      };
      missingDataNotices.push(bMap[language] || bMap.fr);
    }

    if (unassignedCount > 0) {
      const uMap: Record<Language, string> = {
        fr: `Vérification requise : ${unassignedCount} oiseau(x) sans emplacement de cage défini.`,
        en: `Review required: ${unassignedCount} bird(s) without defined cage location.`,
        ar: `تنبيه توطين: ${unassignedCount} طائر بدون قفص مخصص. يلزم التعيين اليدوي.`,
        es: `Verificación requerida: ${unassignedCount} ave(s) sin ubicación de jaula definida.`,
        it: `Verifica richiesta: ${unassignedCount} uccello/i senza posizione gabbia definita.`
      };
      missingDataNotices.push(uMap[language] || uMap.fr);
    }

    const summaryMap: Record<Language, string> = {
      fr: `Synthèse factuelle et descriptive : votre élevage compte ${totalBirds} sujet(s) et ${rawCages.length} cage(s). Toutes les statistiques sont issues des enregistrements locaux.`,
      en: `Descriptive factual overview: your flock includes ${totalBirds} bird(s) and ${rawCages.length} cage(s). All metrics are directly extracted from local records.`,
      ar: `تحليل وصفي دقيق ومستقل: يضم مأواك ${totalBirds} طائراً و${rawCages.length} قفصاً. جميع الأرقام مستخرجة مباشرة من السجلات المحلية.`,
      es: `Síntesis factual y descriptiva: su criadero cuenta con ${totalBirds} ave(s) y ${rawCages.length} jaula(s). Todas las estadísticas provienen de registros locales.`,
      it: `Sintesi fattuale e descrittiva: il tuo allevamento conta ${totalBirds} uccello/i e ${rawCages.length} gabbia/e. Tutte le statistiche provengono da registri locali.`
    };
    const statusSummary = summaryMap[language] || summaryMap.fr;

    return {
      timestamp: now.toISOString(),
      demographics: {
        totalBirds,
        malesCount,
        femalesCount,
        unknownSexCount,
        activeCount: totalBirds,
        archivedCount: archivedBirds.length,
        quarantineCount,
        unassignedCount,
        speciesDistribution,
        ageDistribution: {
          knownCount: birthDateKnownCount,
          missingCount: birthDateMissingCount,
          youngUnder1Year,
          adult1To4Years,
          seniorOver4Years
        }
      },
      reproduction: reproStats,
      habitat: habitatStats,
      recentEvents,
      missingDataAudits,
      intelligenceSummary: {
        statusSummary,
        highlights,
        missingDataNotices
      }
    };
  }
}
