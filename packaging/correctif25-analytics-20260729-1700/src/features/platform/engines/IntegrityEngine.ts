/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { BreedingService } from '../../breeding/services/BreedingService';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { FinanceRepository } from '../../finance/repositories/FinanceRepository';
import { IntegrityReport, IntegrityIssue, Severity } from '../types';

export class IntegrityEngine {
  
  static runCheckup(): IntegrityReport {
    const issues: IntegrityIssue[] = [];
    
    // Retrieve repositories
    // Archived birds remain valid historical entities for pedigrees and relations.
    const birds = BirdRepository.getAll(true);
    const cages = HabitatRepository.getAll();
    const couples = BreedingRepository.getCouples();
    const reproductions = BreedingRepository.getReproductions();
    const pontes = BreedingRepository.getPontes();
    const healthRecords = HealthRepository.getAll();
    const expenses = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();

    const birdIds = new Set(birds.map(b => b.id));
    const cageIds = new Set(cages.map(c => Number(c.id)));
    const coupleIds = new Set(couples.map(c => c.id));
    const reproductionIds = new Set(reproductions.map(r => r.id));

    // --- ID DUPLICATION & VALIDITY ---
    const rawBirdIds: number[] = [];
    birds.forEach(b => {
      if (rawBirdIds.includes(b.id)) {
        issues.push({
          id: `dup-bird-${b.id}`,
          category: 'id',
          severity: 'critical',
          description: `ID de canari dupliqué : #${b.id}`,
          details: `Le canari nommé "${b.nom}" partage l'ID #${b.id} avec un autre canari de la base.`,
          suggestedFix: "Réattribuer un identifiant unique incrémental pour résoudre le conflit.",
          canFixAuto: false
        });
      } else {
        rawBirdIds.push(b.id);
      }

      // Check UUID / ID validity
      if (b.id <= 0 || isNaN(b.id)) {
        issues.push({
          id: `invalid-id-${b.id}`,
          category: 'uuid',
          severity: 'warning',
          description: `Identifiant numérique invalide : #${b.id}`,
          details: `Le canari "${b.nom}" possède un identifiant de format non valide ou négatif.`,
          suggestedFix: "Régénérer un ID positif auto-incrémenté.",
          canFixAuto: false
        });
      }
    });

    // --- PARENTS INEXISTANTS ---
    birds.forEach(b => {
      if (b.pere_id && !birdIds.has(b.pere_id)) {
        issues.push({
          id: `parent-missing-father-${b.id}`,
          category: 'parent',
          severity: 'warning',
          description: `Père inexistant pour "${b.nom}" (ID #${b.id})`,
          details: `L'oiseau référence le père ID #${b.pere_id} qui est introuvable dans le cheptel.`,
          suggestedFix: "Supprimer la liaison paternelle ou recréer la fiche du père.",
          canFixAuto: true
        });
      }
      if (b.mere_id && !birdIds.has(b.mere_id)) {
        issues.push({
          id: `parent-missing-mother-${b.id}`,
          category: 'parent',
          severity: 'warning',
          description: `Mère inexistante pour "${b.nom}" (ID #${b.id})`,
          details: `L'oiseau référence la mère ID #${b.mere_id} qui est introuvable dans le cheptel.`,
          suggestedFix: "Supprimer la liaison maternelle ou recréer la fiche de la mère.",
          canFixAuto: true
        });
      }
    });

    // --- CAGES SUPPRIMÉES ---
    birds.forEach(b => {
      if (b.cage_id && !cageIds.has(Number(b.cage_id))) {
        // Find default cage to suggest
        const defaultCageId = cages[0]?.id || 1;
        issues.push({
          id: `cage-missing-${b.id}`,
          category: 'cage',
          severity: 'critical',
          description: `Cage inexistante pour "${b.nom}" (ID #${b.id})`,
          details: `Le canari est affecté à la cage ID #${b.cage_id} qui n'existe plus ou a été supprimée.`,
          suggestedFix: `Transférer l'oiseau vers la cage principale existante #${defaultCageId}.`,
          canFixAuto: true
        });
      }
    });

    // --- COUPLES INVALIDES ---
    couples.forEach(c => {
      const male = birds.find(b => b.id === c.male_id);
      const female = birds.find(b => b.id === c.femelle_id);

      if (!male) {
        issues.push({
          id: `couple-missing-male-${c.id}`,
          category: 'couple',
          severity: 'critical',
          description: `Mâle inexistant dans le couple #${c.id}`,
          details: `Le couple référence le partenaire mâle ID #${c.male_id} qui est introuvable.`,
          suggestedFix: "Dissoudre le couple ou réattribuer un nouveau partenaire mâle valide.",
          canFixAuto: true
        });
      } else if (male.sexe !== 'Mâle') {
        issues.push({
          id: `couple-wrong-sex-male-${c.id}`,
          category: 'couple',
          severity: 'warning',
          description: `Sexe invalide pour le mâle du couple #${c.id}`,
          details: `Le partenaire mâle "${male.nom}" est enregistré avec le sexe "${male.sexe}".`,
          suggestedFix: "Corriger le sexe du partenaire dans sa fiche ou dissoudre le couple.",
          canFixAuto: false
        });
      }

      if (!female) {
        issues.push({
          id: `couple-missing-female-${c.id}`,
          category: 'couple',
          severity: 'critical',
          description: `Femelle inexistante dans le couple #${c.id}`,
          details: `Le couple référence le partenaire femelle ID #${c.femelle_id} qui est introuvable.`,
          suggestedFix: "Dissoudre le couple ou réattribuer un nouveau partenaire femelle valide.",
          canFixAuto: true
        });
      } else if (female.sexe !== 'Femelle') {
        issues.push({
          id: `couple-wrong-sex-female-${c.id}`,
          category: 'couple',
          severity: 'warning',
          description: `Sexe invalide pour la femelle du couple #${c.id}`,
          details: `La partenaire femelle "${female.nom}" est enregistrée avec le sexe "${female.sexe}".`,
          suggestedFix: "Corriger le sexe du partenaire dans sa fiche ou dissoudre le couple.",
          canFixAuto: false
        });
      }
    });

    // --- RÉFÉRENCES CASSÉES (REPRODUCTION ET PONTES) ---
    reproductions.forEach(r => {
      if (!coupleIds.has(r.couple_id)) {
        issues.push({
          id: `repro-missing-couple-${r.id}`,
          category: 'reference',
          severity: 'critical',
          description: `Couple introuvable pour la reproduction #${r.id}`,
          details: `Le cycle de reproduction est rattaché au couple ID #${r.couple_id} qui n'existe plus.`,
          suggestedFix: "Clôturer et archiver ce cycle de reproduction orphelin.",
          canFixAuto: true
        });
      }
    });

    pontes.forEach(p => {
      if (!reproductionIds.has(p.reproduction_id)) {
        issues.push({
          id: `ponte-missing-repro-${p.id}`,
          category: 'reference',
          severity: 'critical',
          description: `Ponte orpheline #${p.id}`,
          details: `La ponte référence un cycle de reproduction ID #${p.reproduction_id} introuvable.`,
          suggestedFix: "Supprimer la ponte orpheline pour restaurer la cohérence de l'historique.",
          canFixAuto: true
        });
      }

      // --- STATISTIQUES INCOHÉRENTES ---
      if (p.oeufs_fecondes > p.oeufs) {
        issues.push({
          id: `ponte-stat-inc-fecondes-${p.id}`,
          category: 'stats',
          severity: 'warning',
          description: `Statistiques de ponte incohérentes sur le nid #${p.id}`,
          details: `Le nombre d'œufs fécondés (${p.oeufs_fecondes}) dépasse le nombre d'œufs pondus (${p.oeufs}).`,
          suggestedFix: "Ajuster le nombre d'œufs fécondés pour qu'il soit inférieur ou égal aux œufs pondus.",
          canFixAuto: true
        });
      }

      if (p.eclosions > p.oeufs_fecondes) {
        issues.push({
          id: `ponte-stat-inc-eclosions-${p.id}`,
          category: 'stats',
          severity: 'warning',
          description: `Taux d'éclosion incohérent sur le nid #${p.id}`,
          details: `Le nombre d'oisillons nés (${p.eclosions}) dépasse le nombre d'œufs fécondés (${p.oeufs_fecondes}).`,
          suggestedFix: "Harmoniser le nombre d'éclosions avec la fécondation du nid.",
          canFixAuto: true
        });
      }
    });

    // Calculate score
    let criticalCount = 0;
    let warningCount = 0;
    let infoCount = 0;

    issues.forEach(iss => {
      if (iss.severity === 'critical') criticalCount++;
      else if (iss.severity === 'warning') warningCount++;
      else infoCount++;
    });

    const totalDeduction = (criticalCount * 25) + (warningCount * 10) + (infoCount * 2);
    const score = Math.max(0, 100 - totalDeduction);

    return {
      timestamp: new Date().toISOString(),
      score,
      issuesCount: {
        critical: criticalCount,
        warning: warningCount,
        info: infoCount
      },
      issues
    };
  }

  /**
   * Applies corrective actions for specific issues.
   * "Jamais automatiques" - User initiates this individually.
   */
  static applyFix(issueId: string): boolean {
    const checkup = this.runCheckup();
    const issue = checkup.issues.find(iss => iss.id === issueId);
    if (!issue || !issue.canFixAuto) return false;

    // Retrieve and process data modifications strictly and non-destructively
    if (issueId.startsWith('parent-missing-')) {
      const birdId = parseInt(issueId.split('-').pop() || '0');
      const birds = BirdRepository.getAll();
      const b = birds.find(x => x.id === birdId);
      if (b) {
        if (issueId.includes('father')) {
          b.pere_id = undefined;
        } else {
          b.mere_id = undefined;
        }
        BirdRepository.update(b);
        return true;
      }
    }

    if (issueId.startsWith('cage-missing-')) {
      const birdId = parseInt(issueId.split('-').pop() || '0');
      const birds = BirdRepository.getAll();
      const cages = HabitatRepository.getAll();
      const b = birds.find(x => x.id === birdId);
      const firstCage = cages[0];
      if (b && firstCage) {
        b.cage_id = Number(firstCage.id);
        BirdRepository.update(b);
        return true;
      }
    }

    if (issueId.startsWith('couple-missing-')) {
      const coupleId = parseInt(issueId.split('-').pop() || '0');
      BreedingService.dissolveCouple(coupleId);
      return true;
    }

    if (issueId.startsWith('repro-missing-couple-')) {
      const reproId = parseInt(issueId.split('-').pop() || '0');
      BreedingService.closeReproduction(reproId);
      return true;
    }

    if (issueId.startsWith('ponte-missing-repro-')) {
      const ponteId = parseInt(issueId.split('-').pop() || '0');
      const pontes = BreedingRepository.getPontes();
      const filtered = pontes.filter(p => p.id !== ponteId);
      BreedingRepository.savePontes(filtered);
      return true;
    }

    if (issueId.startsWith('ponte-stat-inc-')) {
      const ponteId = parseInt(issueId.split('-').pop() || '0');
      const pontes = BreedingRepository.getPontes();
      const p = pontes.find(x => x.id === ponteId);
      if (p) {
        if (issueId.includes('fecondes')) {
          p.oeufs_fecondes = p.oeufs;
        } else if (issueId.includes('eclosions')) {
          p.eclosions = p.oeufs_fecondes;
        }
        BreedingRepository.savePontes(pontes);
        return true;
      }
    }

    return false;
  }
}
