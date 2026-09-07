/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari } from '../../../types';
import { CompatibilityResult, ScientificValidation, ValidationSeverity, BreedingPair } from '../types';
import { ReproductionRepository } from '../repositories/ReproductionRepository';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { IncubationBiologicalCalendar } from '../incubation/types';
import { Egg, EggStatus } from '../eggs/types';

export class ReproductionEngine {
  static isValidHistoricalDate(dateStr: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const parsed = new Date(`${dateStr}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dateStr) return false;
    return dateStr <= new Date().toISOString().slice(0, 10);
  }

  static canTransitionEggStatus(from: EggStatus, to: EggStatus): boolean {
    if (from === to) return true;
    if (from === 'Éclos' || from === 'Retiré') return false;
    if (from === 'Cassé' || from === 'Mort') return to === 'Retiré';
    if (from === 'Arrêt de développement') return to === 'Mort' || to === 'Retiré';
    return true;
  }

  /**
   * Helper to calculate age in months from a birthdate string
   */
  static calculateAgeInMonths(birthDateStr: string): number {
    if (!birthDateStr) return 0;
    const birth = new Date(birthDateStr);
    const now = new Date();
    if (isNaN(birth.getTime())) return 0;

    const yearsDiff = now.getFullYear() - birth.getFullYear();
    const monthsDiff = now.getMonth() - birth.getMonth();
    const daysDiff = now.getDate() - birth.getDate();

    let totalMonths = yearsDiff * 12 + monthsDiff;
    if (daysDiff < 0) {
      totalMonths--;
    }
    return Math.max(0, totalMonths);
  }

  /**
   * Helper to calculate age in days
   */
  static calculateAgeInDays(birthDateStr: string): number {
    if (!birthDateStr) return 0;
    const birth = new Date(birthDateStr);
    const now = new Date();
    if (isNaN(birth.getTime())) return 0;
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Checks if a bird has reached the minimum reproductive age.
   * Standard: 9 months for females, 10 months for males.
   */
  static isReproductiveAge(sex: 'Mâle' | 'Femelle' | 'Indéterminé', birthDateStr: string): {
    ready: boolean;
    ageMonths: number;
    requiredMonths: number;
  } {
    const ageMonths = this.calculateAgeInMonths(birthDateStr);
    const requiredMonths = sex === 'Mâle' ? 10 : 9;
    return {
      ready: ageMonths >= requiredMonths,
      ageMonths,
      requiredMonths,
    };
  }

  /**
   * Calculates the seniority of a couple (e.g. "5 mois", "1 an et 2 mois", or "Actif depuis 12 jours")
   */
  static calculatePairSeniority(dateCreatedStr: string, dateSeparatedStr?: string, t?: (key: string, vars?: any) => string): string {
    if (!dateCreatedStr) return t ? t('unknown') : 'Inconnue';
    const start = new Date(dateCreatedStr);
    const end = dateSeparatedStr ? new Date(dateSeparatedStr) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return t ? t('unknown') : 'Inconnue';

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

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
        return t('ageYears', { years, yPlural: years > 1 ? 's' : '' });
      }
      return `${years} an${years > 1 ? 's' : ''}`;
    }

    if (months > 0) {
      if (t) {
        return t('ageMonths', { months, mPlural: months > 1 ? 's' : '' });
      }
      return `${months} mois`;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (t) {
      return t('ageDays', { days: diffDays, dPlural: diffDays > 1 ? 's' : '' });
    }
    return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  }

  /**
   * Retrieves the number of reproduction cycles (sessions) from history or live structures for a pair
   */
  static getReproductionsCountForPair(pairId: string): number {
    // We map string pair ID (e.g. "bp-5") to its legacy numeric representation or find matches in legacy reproductions
    let numericId: number | null = null;
    if (pairId.startsWith('bp-')) {
      numericId = parseInt(pairId.replace('bp-', ''), 10);
    } else {
      numericId = parseInt(pairId, 10);
    }

    const legacyReproductions = BreedingRepository.getReproductions();
    return legacyReproductions.filter(r => r.couple_id === numericId).length;
  }

  /**
   * Performs automated scientific compatibility checks and calculates stars (1-5) and validations.
   */
  static getCompatibility(
    male: Canari,
    female: Canari,
    activePairs: BreedingPair[] = [],
    t: (key: string, vars?: any) => string = (k) => k
  ): CompatibilityResult {
    const validations: ScientificValidation[] = [];
    const recommendations: string[] = [];
    let score = 5; // Start with max 5 stars

    // --- RULE 1: Sex Coherence ---
    const isMaleCoherent = male.sexe === 'Mâle';
    const isFemaleCoherent = female.sexe === 'Femelle';
    const sexCoherent = isMaleCoherent && isFemaleCoherent;

    validations.push({
      type: sexCoherent ? 'info' : 'risk',
      rule: 'REPRO_SEX_COHERENCE',
      passed: sexCoherent,
      message: sexCoherent
        ? t('repro_val_sex_ok', { defaultValue: 'Sexe des partenaires cohérent (Mâle ♂ et Femelle ♀).' })
        : t('repro_val_sex_error', { defaultValue: 'Incohérence des sexes : le couple doit être composé d\'un Mâle et d\'une Femelle.' })
    });
    if (!sexCoherent) {
      score -= 2;
    }

    // --- RULE 2: Species Matching ---
    const speciesMatch = male.espece === female.espece;
    validations.push({
      type: speciesMatch ? 'info' : 'warning',
      rule: 'REPRO_SPECIES_MATCH',
      passed: speciesMatch,
      message: speciesMatch
        ? t('repro_val_species_ok', { defaultValue: `Même espèce d'oiseau (${male.espece || 'Canari'}).` })
        : t('repro_val_species_warning', { defaultValue: `Espèces différentes : Risque d'hybridation (ex: Canari x Chardonneret). Descendants généralement stériles.` })
    });
    if (!speciesMatch) {
      score -= 2;
      recommendations.push(t('repro_rec_hybrid', { defaultValue: 'Attention aux hybridations : les mulets qui en résultent sont souvent stériles.' }));
    }

    // --- RULE 3: Breed Compatibility ---
    // Breed compatibility within the same species
    if (speciesMatch) {
      const breedMatch = male.race === female.race;
      if (!breedMatch) {
        // Different breeds of the same species
        validations.push({
          type: 'warning',
          rule: 'REPRO_BREED_MATCH',
          passed: false,
          message: t('repro_val_breed_mismatch', {
            defaultValue: `Races distinctes (${male.race} x ${female.race}). Risque de dilution du standard de la race.`
          })
        });
        score -= 1;
        recommendations.push(t('repro_rec_breed', { defaultValue: 'Il est préférable d\'accoupler des oiseaux de même race pour conserver la pureté de la lignée.' }));
      } else {
        validations.push({
          type: 'info',
          rule: 'REPRO_BREED_MATCH',
          passed: true,
          message: t('repro_val_breed_ok', { defaultValue: `Excellente compatibilité de race (${male.race}).` })
        });
      }
    }

    // --- RULE 4: Birds Alive Check ---
    const maleAlive = !male.archived && male.statut_sante !== 'Décédé';
    const femaleAlive = !female.archived && female.statut_sante !== 'Décédé';
    const bothAlive = maleAlive && femaleAlive;

    validations.push({
      type: bothAlive ? 'info' : 'risk',
      rule: 'REPRO_BIRDS_ALIVE',
      passed: bothAlive,
      message: bothAlive
        ? t('repro_val_alive_ok', { defaultValue: 'Les deux oiseaux sont vivants.' })
        : t('repro_val_alive_error', { defaultValue: 'Un ou plusieurs oiseaux sélectionnés sont archivés ou déclarés décédés.' })
    });
    if (!bothAlive) {
      score -= 3;
    }

    // --- RULE 5: Birds Availability Check (not in active couple) ---
    const isMaleBusy = activePairs.some(p => p.status === 'active' && p.maleId === male.id && !p.archived);
    const isFemaleBusy = activePairs.some(p => p.status === 'active' && p.femaleId === female.id && !p.archived);
    const bothAvailable = !isMaleBusy && !isFemaleBusy;

    validations.push({
      type: bothAvailable ? 'info' : 'risk',
      rule: 'REPRO_BIRDS_AVAILABLE',
      passed: bothAvailable,
      message: bothAvailable
        ? t('repro_val_available_ok', { defaultValue: 'Les deux oiseaux sont disponibles pour l\'accouplement.' })
        : t('repro_val_available_error', {
            defaultValue: `Disponibilité : ${isMaleBusy ? 'Le mâle' : ''}${isMaleBusy && isFemaleBusy ? ' et ' : ''}${isFemaleBusy ? 'la femelle' : ''} fait déjà partie d'un couple actif.`
          })
    });
    if (!bothAvailable) {
      score -= 1;
      recommendations.push(t('repro_rec_dissolve', { defaultValue: 'Dissolvez le couple existant d\'un oiseau avant de l\'accoupler à nouveau.' }));
    }

    // --- RULE 6: Minimum Reproductive Age Check ---
    const maleAgeCheck = this.isReproductiveAge('Mâle', male.date_naissance);
    const femaleAgeCheck = this.isReproductiveAge('Femelle', female.date_naissance);
    const ageValid = maleAgeCheck.ready && femaleAgeCheck.ready;

    let ageMessage = '';
    if (ageValid) {
      ageMessage = t('repro_val_age_ok', { defaultValue: 'Âge de maturité reproductive atteint pour les deux partenaires.' });
    } else {
      const parts: string[] = [];
      if (!maleAgeCheck.ready) {
        parts.push(t('repro_val_age_male_young', {
          defaultValue: `le mâle est trop jeune (${maleAgeCheck.ageMonths}/${maleAgeCheck.requiredMonths} mois)`
        }));
      }
      if (!femaleAgeCheck.ready) {
        parts.push(t('repro_val_age_female_young', {
          defaultValue: `la femelle est trop jeune (${femaleAgeCheck.ageMonths}/${femaleAgeCheck.requiredMonths} mois)`
        }));
      }
      ageMessage = t('repro_val_age_error', {
        defaultValue: `Maturité reproductive insuffisante : ${parts.join(' et ')}.`
      });
    }

    validations.push({
      type: ageValid ? 'info' : 'warning',
      rule: 'REPRO_MIN_AGE',
      passed: ageValid,
      message: ageMessage
    });
    if (!ageValid) {
      score -= 1;
      recommendations.push(t('repro_rec_age', { defaultValue: 'Un accouplement trop précoce peut provoquer une rétention d\'œuf ou des pontes claires.' }));
    }

    // --- RULE 7: Health Status ---
    const maleHealthy = male.statut_sante !== 'Malade';
    const femaleHealthy = female.statut_sante !== 'Malade';
    const healthy = maleHealthy && femaleHealthy;

    validations.push({
      type: healthy ? 'info' : 'risk',
      rule: 'REPRO_HEALTH_STATUS',
      passed: healthy,
      message: healthy
        ? t('repro_val_health_ok', { defaultValue: 'État de santé général des partenaires optimal.' })
        : t('repro_val_health_warning', { defaultValue: 'Alerte Sanitaire : l\'un des oiseaux sélectionnés fait l\'objet d\'un suivi médical.' })
    });
    if (!healthy) {
      score -= 1;
      recommendations.push(t('repro_rec_health', { defaultValue: 'Il est vivement déconseillé de reproduire un oiseau en cours de traitement médical ou affaibli.' }));
    }

    // Ensure score is between 1 and 5
    score = Math.max(1, Math.min(5, score));

    return {
      score,
      validations,
      recommendations
    };
  }

  /**
   * Calculates the age of an egg in days based on its laying date
   */
  static calculateEggAgeInDays(layingDate: string): number {
    if (!layingDate) return 0;
    const laying = new Date(layingDate);
    const today = new Date();
    // Normalize to midnight to avoid hours mismatch
    laying.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - laying.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  /**
   * Computes biological milestones for an incubation period
   */
  static calculateIncubationCalendar(
    startDate: string,
    theoreticalDuration: number = 13
  ): IncubationBiologicalCalendar {
    if (!startDate) {
      const nowStr = new Date().toISOString().split('T')[0];
      startDate = nowStr;
    }

    const start = new Date(startDate);
    const candling = new Date(start);
    candling.setDate(start.getDate() + 6); // Mirage conseillé à J+6

    const control = new Date(start);
    control.setDate(start.getDate() + 10); // Contrôle à J+10

    const hatch = new Date(start);
    hatch.setDate(start.getDate() + theoreticalDuration); // Éclosion prévue à J+theoreticalDuration

    const endIncub = new Date(start);
    endIncub.setDate(start.getDate() + theoreticalDuration + 2); // Fin d'incubation (sécurité J+theoreticalDuration+2)

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    hatch.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);

    const totalDurationMs = hatch.getTime() - start.getTime();
    const elapsedMs = today.getTime() - start.getTime();
    
    let progressPercent = 0;
    if (totalDurationMs > 0) {
      progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100)));
    }

    const daysRemaining = Math.max(0, Math.ceil((hatch.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // If overdue, delayDays is the positive difference
    let delayDays = 0;
    if (today.getTime() > hatch.getTime()) {
      delayDays = Math.floor((today.getTime() - hatch.getTime()) / (1000 * 60 * 60 * 24));
    }

    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    return {
      startDate,
      candlingDate: formatDate(candling),
      controlDate: formatDate(control),
      expectedHatchDate: formatDate(hatch),
      endIncubationDate: formatDate(endIncub),
      daysRemaining,
      delayDays,
      progressPercent,
    };
  }

  /**
   * Calculate fertility rate
   */
  static calculateFertilityRate(totalEggs: number, fertileEggs: number): number {
    if (totalEggs <= 0) return 0;
    return Math.round((fertileEggs / totalEggs) * 100);
  }

  /**
   * Calculates predicted hatch rate (percentage of fertile eggs that hatch or are expected to)
   */
  static calculateForecastHatchRate(fertileEggs: number, hatchedEggs: number, failedCount: number): number {
    if (fertileEggs <= 0) return 0;
    const predictedHatch = Math.max(0, fertileEggs - failedCount);
    return Math.round((predictedHatch / fertileEggs) * 100);
  }

  /**
   * Calculates overall failure rate (clear, lost, and dead eggs as percentage of total eggs)
   */
  static calculateFailureRate(totalEggs: number, clearEggs: number, lostEggs: number, deadEggs: number): number {
    if (totalEggs <= 0) return 0;
    const totalFailed = clearEggs + lostEggs + deadEggs;
    return Math.min(100, Math.round((totalFailed / totalEggs) * 100));
  }

  /**
   * Evaluates if a foster pair is compatible with a candidate chick
   */
  static analyzeFosterCompatibility(
    chick: { id: string; hatchDate: string; species?: string; ageDays?: number },
    fosterPair: { id: string; maleId: number; femaleId: number },
    fosterRecord?: { capacity: number; currentFosterCount: number },
    fosterBiologicalChicks: { hatchDate: string }[] = [],
    t: (key: string, vars?: any) => string = (k) => k
  ): CompatibilityResult {
    const validations: ScientificValidation[] = [];
    const recommendations: string[] = [];
    let score = 5;

    const chickAge = chick.ageDays !== undefined ? chick.ageDays : this.calculateAgeInDays(chick.hatchDate);

    // 1. Nest load check
    const currentAdoptedCount = fosterRecord ? fosterRecord.currentFosterCount : 0;
    const currentBiologicalCount = fosterBiologicalChicks.length;
    const totalCurrentChicks = currentAdoptedCount + currentBiologicalCount;
    const capacity = fosterRecord ? fosterRecord.capacity : 4;
    const willOverload = totalCurrentChicks >= capacity;

    validations.push({
      type: willOverload ? 'warning' : 'info',
      rule: 'FOSTER_NEST_LOAD',
      passed: !willOverload,
      message: willOverload
        ? t('foster_val_load_warning', { defaultValue: `Alerte Surcharge : le nid contient déjà ${totalCurrentChicks}/${capacity} oisillons.` })
        : t('foster_val_load_ok', { defaultValue: `Charge de nid acceptable : ${totalCurrentChicks}/${capacity} oisillons actuellement.` })
    });
    if (willOverload) {
      score -= 1;
      recommendations.push(t('foster_rec_load', { defaultValue: 'Divisez la nichée ou augmentez la surveillance pour éviter les écrasements.' }));
    }

    // 2. Age sync check (age of foster's own chicks vs candidate chick)
    if (fosterBiologicalChicks.length > 0) {
      const fosterChicksAges = fosterBiologicalChicks.map(c => this.calculateAgeInDays(c.hatchDate));
      const averageFosterAge = fosterChicksAges.reduce((sum, a) => sum + a, 0) / fosterChicksAges.length;
      const ageDiff = Math.abs(chickAge - averageFosterAge);
      const isAgeSync = ageDiff <= 4;

      validations.push({
        type: isAgeSync ? 'info' : 'risk',
        rule: 'FOSTER_AGE_SYNC',
        passed: isAgeSync,
        message: isAgeSync
          ? t('foster_val_age_ok', { defaultValue: `Synchronisation des âges optimale (différence de ${Math.round(ageDiff)} jours).` })
          : t('foster_val_age_error', { defaultValue: `Incompatibilité d'âge : écart de ${Math.round(ageDiff)} jours. Risque de trampling ou d'exclusion alimentaire.` })
      });
      if (!isAgeSync) {
        score -= 2;
        recommendations.push(t('foster_rec_age', { defaultValue: 'Placer des oisillons d\'âges trop différents comporte un risque de mort pour le plus petit.' }));
      }
    } else {
      validations.push({
        type: 'info',
        rule: 'FOSTER_AGE_SYNC',
        passed: true,
        message: t('foster_val_no_bio_chicks', { defaultValue: "Aucun jeune biologique dans le nid hôte. Adoption sans concurrence directe." })
      });
    }

    score = Math.max(1, Math.min(5, score));
    return {
      score,
      validations,
      recommendations
    };
  }

  /**
   * Computes the nest occupancy load and identifies overloaded nests
   */
  static getNestLoads(
    activeChicks: { id: string; pairId: string; fosterPairId?: string }[],
    fosterRecords: { pairId: string; capacity: number }[]
  ): { pairId: string; load: number; capacity: number; isOverloaded: boolean }[] {
    const pairLoads: Record<string, { load: number; capacity: number }> = {};

    activeChicks.forEach(chick => {
      const currentParentPairId = chick.fosterPairId || chick.pairId;
      if (!pairLoads[currentParentPairId]) {
        const fosterRec = fosterRecords.find(f => f.pairId === currentParentPairId);
        pairLoads[currentParentPairId] = {
          load: 0,
          capacity: fosterRec ? fosterRec.capacity : 4
        };
      }
      pairLoads[currentParentPairId].load += 1;
    });

    return Object.entries(pairLoads).map(([pairId, info]) => ({
      pairId,
      load: info.load,
      capacity: info.capacity,
      isOverloaded: info.load > info.capacity
    }));
  }

  /**
   * Scans hand feeding schedules and alerts if feeding is overdue or crop issues are found
   */
  static analyzeHandFeedingAlerts(
    chick: { id: string; name: string; provisionalNumber: string; ageDays: number; species: string },
    sessions: { date: string; time: string; cropAfter?: string; cropBefore?: string }[],
    cropInspections: { timestamp: string; statusBefore: string; statusAfter: string }[],
    suggestedSchedules: { minAgeDays: number; maxAgeDays: number; frequencyPerDay: number }[]
  ): {
    isFeedingOverdue: boolean;
    isCropStagnant: boolean;
    lastFedHoursAgo: number;
    hoursBetweenFeeds: number;
    message: string;
    severity: 'none' | 'warning' | 'critical';
  } {
    const today = new Date();
    let frequency = 6;
    const schedule = suggestedSchedules.find(s => chick.ageDays >= s.minAgeDays && chick.ageDays <= s.maxAgeDays);
    if (schedule) {
      frequency = schedule.frequencyPerDay;
    }
    const hoursBetweenFeeds = 24 / frequency;

    let lastFedHoursAgo = 999;
    if (sessions.length > 0) {
      const lastSession = sessions[0];
      const lastSessionTime = new Date(`${lastSession.date}T${lastSession.time}:00`);
      if (!isNaN(lastSessionTime.getTime())) {
        const diffMs = Math.abs(today.getTime() - lastSessionTime.getTime());
        lastFedHoursAgo = diffMs / (1000 * 60 * 60);
      }
    }

    const isFeedingOverdue = lastFedHoursAgo > hoursBetweenFeeds + 1;

    let isCropStagnant = false;
    if (cropInspections.length > 0) {
      const lastInspect = cropInspections[0]; // sorted latest first
      if (lastInspect.statusBefore === 'stagnant' || lastInspect.statusBefore === 'acidic') {
        isCropStagnant = true;
      }
    }

    let severity: 'none' | 'warning' | 'critical' = 'none';
    let message = 'Nourrissage à jour.';

    if (isCropStagnant) {
      severity = 'critical';
      message = `ALERTE CRITIQUE : Blocage de jabot détecté chez ${chick.name} (${chick.provisionalNumber}) !`;
    } else if (isFeedingOverdue) {
      severity = lastFedHoursAgo > hoursBetweenFeeds + 3 ? 'critical' : 'warning';
      message = `Retard Nourrissage : ${chick.name} (${chick.provisionalNumber}) n'a pas été nourri depuis ${Math.round(lastFedHoursAgo)}h (idéal: ${Math.round(hoursBetweenFeeds)}h).`;
    }

    return {
      isFeedingOverdue,
      isCropStagnant,
      lastFedHoursAgo: lastFedHoursAgo === 999 ? -1 : lastFedHoursAgo,
      hoursBetweenFeeds,
      message,
      severity
    };
  }
}
