/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari } from '../../../types';
import { DataQualityResult, DataQualityIssue } from '../types';

export class DataQualityEngine {
  static analyze(birds: Canari[]): DataQualityResult {
    const issues: DataQualityIssue[] = [];
    const checkedCount = birds.length;

    if (checkedCount === 0) {
      return {
        score: 100,
        issues: [],
        checkedCount: 0
      };
    }

    let penaltyPoints = 0;

    birds.forEach(bird => {
      // 1. Missing Ring (Critical identification)
      if (!bird.bague || bird.bague.trim().length <= 3) {
        penaltyPoints += 15;
        issues.push({
          id: `dq-ring-${bird.id}`,
          birdId: bird.id,
          birdName: bird.nom,
          birdRing: bird.bague,
          type: 'missing_ring',
          severity: 'high',
          description: `L'oiseau "${bird.nom || 'Sans nom'}" ne possède pas de numéro de bague valide.`,
          recommendation: "Ajoutez un numéro de bague officiel ou d'identification permanente pour assurer la traçabilité."
        });
      }

      // 2. Missing photo
      if (!bird.photo && (!bird.photos || bird.photos.length === 0)) {
        penaltyPoints += 5;
        issues.push({
          id: `dq-photo-${bird.id}`,
          birdId: bird.id,
          birdName: bird.nom,
          birdRing: bird.bague,
          type: 'missing_photo',
          severity: 'low',
          description: `Aucun visuel ou photo n'est enregistré pour l'oiseau "${bird.nom || bird.bague}".`,
          recommendation: "Prenez en photo l'oiseau de profil ou de face pour enrichir son dossier phénotypique."
        });
      }

      // 3. Unknown Parents (not registered as acquisition)
      if (!bird.acquisition && !bird.pere_id && !bird.mere_id) {
        penaltyPoints += 10;
        issues.push({
          id: `dq-parents-${bird.id}`,
          birdId: bird.id,
          birdName: bird.nom,
          birdRing: bird.bague,
          type: 'unknown_parents',
          severity: 'medium',
          description: `L'oiseau "${bird.nom || bird.bague}" est né à l'élevage mais ses parents (père et mère) ne sont pas déclarés.`,
          recommendation: "Renseignez les ascendants directs (père/mère) pour que le moteur de consanguinité puisse fonctionner."
        });
      }

      // 4. Incomplete direct fields
      if (!bird.date_naissance || !bird.race || !bird.sexe) {
        penaltyPoints += 8;
        issues.push({
          id: `dq-fields-${bird.id}`,
          birdId: bird.id,
          birdName: bird.nom,
          birdRing: bird.bague,
          type: 'missing_field',
          severity: 'medium',
          description: `Champs cruciaux manquants (date de naissance, race ou sexe) pour "${bird.nom || bird.bague}".`,
          recommendation: "Complétez la date de naissance précise, la race de référence, et le sexe exact de l'oiseau."
        });
      }

      // 5. Date incoherency
      if (bird.date_naissance) {
        const birthDate = new Date(bird.date_naissance);
        const today = new Date();
        if (birthDate > today) {
          penaltyPoints += 20;
          issues.push({
            id: `dq-future-date-${bird.id}`,
            birdId: bird.id,
            birdName: bird.nom,
            birdRing: bird.bague,
            type: 'inconsistent_dates',
            severity: 'high',
            description: `La date de naissance (${bird.date_naissance}) de "${bird.nom || bird.bague}" est dans le futur.`,
            recommendation: "Rectifiez la date de naissance de l'oiseau dans ses paramètres."
          });
        }
      }
    });

    // Calculate score (out of 100)
    // Scale penalty points based on size of the flock to avoid extremely low score for large flocks with minor issues
    const averagePenalty = penaltyPoints / Math.max(1, checkedCount * 0.15);
    const score = Math.max(0, Math.min(100, Math.round(100 - averagePenalty)));

    return {
      score,
      issues,
      checkedCount
    };
  }
}
