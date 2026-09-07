/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../storage';
import { AnalyticsService } from '../../analytics/services/AnalyticsService';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { PerformanceMetric } from '../types';

export class PerformanceEngine {
  private static STORAGE_KEY = 'platform_performance_metrics';

  static getMetrics(): PerformanceMetric[] {
    return appStorage.getItem<PerformanceMetric[]>(this.STORAGE_KEY, []);
  }

  static recordMetric(name: string, durationMs: number): void {
    const metrics = this.getMetrics();
    metrics.unshift({
      id: Math.random().toString(36).substring(2, 9),
      name,
      durationMs,
      timestamp: new Date().toISOString(),
    });
    if (metrics.length > 50) metrics.length = 50;
    appStorage.setItem(this.STORAGE_KEY, metrics);
  }

  static runBenchmark(): void {
    const measure = (name: string, operation: () => void): void => {
      const start = performance.now();
      operation();
      this.recordMetric(name, Number((performance.now() - start).toFixed(2)));
    };

    measure('Chargement du registre des oiseaux', () => BirdRepository.getAll(true));
    measure('Calcul KPI global', () => AnalyticsService.getKPIs({}));
    measure('Recherche multicritère', () => BirdRepository.search('a', true));
    measure('Sérialisation du registre', () => {
      JSON.stringify(BirdRepository.getAll(true));
    });
  }

  static getRecommendations(birdsCount: number, logsCount: number): string[] {
    const recommendations: string[] = [];

    if (birdsCount > 150) {
      recommendations.push("💡 Cheptel volumineux détecté : désactivez les miniatures globales si la mémoire devient insuffisante.");
    } else {
      recommendations.push('✅ Taille de cheptel optimale : le chargement en mémoire est immédiat.');
    }

    if (logsCount > 150) {
      recommendations.push("💡 Registre d'audit dense : archivez les entrées anciennes pour préserver la réactivité.");
    } else {
      recommendations.push("✅ Journalisation équilibrée : l'indexation locale est performante.");
    }

    const metrics = this.getMetrics();
    if (metrics.length === 0) {
      recommendations.push("ℹ️ Aucun benchmark réel n'a encore été exécuté sur cet appareil.");
    } else {
      const slowestOperation = Math.max(...metrics.map(metric => metric.durationMs));
      if (slowestOperation > 200) {
        recommendations.push(`⚠️ Une opération mesurée dépasse 200 ms (${slowestOperation.toFixed(1)} ms).`);
      } else {
        recommendations.push(`✅ Les opérations mesurées restent sous 200 ms (maximum ${slowestOperation.toFixed(1)} ms).`);
      }
    }

    return recommendations;
  }
}
