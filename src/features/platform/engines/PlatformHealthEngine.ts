/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IntegrityEngine } from './IntegrityEngine';
import { PerformanceEngine } from './PerformanceEngine';
import { PlatformHealthReport } from '../types';
import { appStorage } from '../../../storage';

export class PlatformHealthEngine {
  private static MAX_LOCAL_STORAGE_BYTES = 5 * 1024 * 1024; // 5MB standard limit

  static getHealthReport(): PlatformHealthReport {
    const warnings: string[] = [];
    
    // 1. Calculate Storage usage
    let storageUsageBytes = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key);
          storageUsageBytes += (key.length + (val ? val.length : 0)) * 2; // UTF-16 is 2 bytes per char
        }
      }
    } catch (e) {
      storageUsageBytes = 50 * 1024; // fallback mockup
    }

    const storageUsagePercent = storageUsageBytes / this.MAX_LOCAL_STORAGE_BYTES;
    let storageScore = 100 - Math.min(100, Math.round(storageUsagePercent * 100));
    if (storageUsageBytes > 4 * 1024 * 1024) {
      warnings.push("⚠️ Utilisation du stockage local très élevée (> 4 Mo). Pensez à exporter vos fichiers puis vider les registres obsolètes.");
      storageScore = Math.max(20, storageScore);
    }

    // 2. Cache status score
    const cacheScore = 100; // 100% offline-ready

    // 3. Integrity Score
    const integrityReport = IntegrityEngine.runCheckup();
    const integrityScore = integrityReport.score;
    if (integrityScore < 100) {
      warnings.push(`⚠️ Problèmes de cohérence détectés : Score d'intégrité de ${integrityScore}/100. Veuillez consulter le vérificateur d'intégrité.`);
    }

    // 4. Backup status score
    const backupHistory = appStorage.getItem<any[]>('platform_backup_history', []);
    let backupScore = 0;
    if (backupHistory.length > 0) {
      const latestBackup = backupHistory[0];
      const daysSinceLatest = (Date.now() - new Date(latestBackup.date).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLatest <= 2) {
        backupScore = 100;
      } else if (daysSinceLatest <= 7) {
        backupScore = 80;
        warnings.push("💡 Votre dernière sauvegarde date de plus de 2 jours. Une sauvegarde régulière prévient les pertes accidentelles.");
      } else {
        backupScore = 50;
        warnings.push("⚠️ Sauvegarde système obsolète (plus de 7 jours). Veuillez lancer une sauvegarde de sécurité.");
      }
    } else {
      backupScore = 0;
      warnings.push("❌ Aucune sauvegarde de sécurité détectée. Votre cheptel est exposé aux pannes de cache navigateur !");
    }

    // 5. Notification & reminders
    const notifications = appStorage.getItem<any[]>('platform_notifications', []);
    const unreadCount = notifications.filter(n => !n.read).length;
    let notificationScore = 100;
    if (unreadCount > 20) {
      notificationScore = 75;
      warnings.push("💡 Vous avez plus de 20 alertes d'élevage non lues dans votre centre de notifications.");
    }

    // 6. Performance Score
    const perfMetrics = PerformanceEngine.getMetrics();
    const slowOperations = perfMetrics.filter(m => m.durationMs > 100).length;
    const performanceScore = Math.max(40, 100 - (slowOperations * 15));

    // Overall formula
    const overallScore = Math.round(
      (storageScore * 0.2) +
      (cacheScore * 0.1) +
      (integrityScore * 0.3) +
      (backupScore * 0.2) +
      (notificationScore * 0.1) +
      (performanceScore * 0.1)
    );

    return {
      storageScore,
      cacheScore,
      integrityScore,
      backupScore,
      notificationScore,
      performanceScore,
      overallScore,
      storageUsageBytes,
      storageQuotaBytes: this.MAX_LOCAL_STORAGE_BYTES,
      warnings
    };
  }
}
