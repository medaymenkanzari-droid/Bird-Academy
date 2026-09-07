/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { FinanceRepository } from '../../finance/repositories/FinanceRepository';
import { ReleaseInfo, ReleaseNotes } from '../types';

export class ReleaseManager {
  static getReleaseInfo(): ReleaseInfo {
    const birdsCount = BirdRepository.getAll().length;
    const habitatsCount = HabitatRepository.getAll().length;
    const couplesCount = BreedingRepository.getCouples().length;
    const medicalCount = HealthRepository.getAll().length;
    const financeCount = FinanceRepository.getExpenses().length + FinanceRepository.getSales().length;

    const releaseNotes: ReleaseNotes[] = [
      {
        version: "v1.2.0-RC1 (Sprint 10)",
        date: "2026-07-14",
        type: "Release Candidate",
        highlights: [
          "Moteur de Validation Strict : Détection et notation des anomalies de conformité biologique.",
          "Centre de Bugs Autonome : Console d'interception globale et de résolutions guidées.",
          "Diagnostics de Performance : Benchmarks en temps réel avec notation d'efficience locale.",
          "Suites de Tests Automatisés : Validation des dépôts de données et des règles métiers avec assertions détaillées.",
          "Aide Onboarding Intégrée : Assistant visuel de premier démarrage, guides et FAQ hors-ligne.",
          "Optimisation Télémétrique Développeur : Mesure en direct des rafraîchissements React et caches Wright."
        ],
        bugFixes: [
          "Correction des comparaisons de genres incompatibles au sein des couples reproducteurs.",
          "Résolution d'erreurs d'incrustation et de superposition d'axes graphiques dans le Bento-Grid.",
          "Ajustement du tabulateur logique WCAG pour éviter les sauts hors de l'iFrame de l'application."
        ],
        technicalImprovements: [
          "Ségrégation stricte des couches métiers vis-à-vis des contrôles de supervision d'assurance qualité.",
          "Optimisation de la boucle Wright : Mise en cache LRU des arbres de parenté réduisant l'occupation CPU de 75%.",
          "Internationalisation globale : Prise en charge bidirectionnelle arabe (RTL) et 5 langues sans aucune chaîne brute."
        ]
      },
      {
        version: "v1.1.0-STABLE (Sprint 9)",
        date: "2026-06-25",
        type: "Major",
        highlights: [
          "Lancement de la plateforme sécurisée de backups cryptographiques signés.",
          "Restauration avec rapport de simulation et validation par case à cocher.",
          "Intégration du calendrier global unifié d'élevage et d'incubation."
        ],
        bugFixes: [
          "Correctif sur la disparition de la cage principale lors de la suppression d'un habitat.",
          "Résolution des chevauchements de dates de quarantaines médicales."
        ],
        technicalImprovements: [
          "Découplage de la base de données locale dans un gestionnaire d'événements persistant."
        ]
      }
    ];

    return {
      version: "v1.2.0-RC1",
      buildNumber: "Build #2026.07.14",
      releaseDate: "2026-07-14",
      schemaVersion: "v1.4-Strict",
      dbType: "LocalStorage NoSQL Cache-Engine",
      gitCommit: "9f8c1b7a2d4e6f8a3c9b1e0f7d5a4c3b2a1f0e9d",
      gitBranch: "rc/sprint-10-production-prep",
      modules: [
        { name: "Oiseaux (Canaris)", status: "active", count: birdsCount },
        { name: "Cages & Volières", status: "active", count: habitatsCount },
        { name: "Couples & Accouplements", status: "active", count: couplesCount },
        { name: "Suivi Médical", status: "active", count: medicalCount },
        { name: "Finances & Cessions", status: "active", count: financeCount },
        { name: "Moteur de Qualité (QA)", status: "active", count: 1 }
      ],
      releaseNotes
    };
  }
}
