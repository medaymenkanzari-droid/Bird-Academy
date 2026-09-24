/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — TESTER FEEDBACK SERVICE
 * Offline-first tester feedback repository, report formatter, and storage.
 * Respects strict user privacy: never includes or requests breeding data.
 */

import { TesterFeedback, FeedbackType, FeedbackSeverity } from '../types';
import { BUILD_ID, BUILD_VERSION_NAME } from '../../../config/appMode';

const STORAGE_KEY = 'bird_academy_tester_feedback';

export class FeedbackService {
  /**
   * Detects the operating system in a privacy-preserving and reliable manner.
   */
  public static detectOS(): string {
    if (typeof window === 'undefined') return 'Windows 11 / Desktop';
    const ua = window.navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows (Desktop)';
    if (ua.includes('Macintosh') || ua.includes('Mac OS')) return 'macOS (Desktop)';
    if (ua.includes('Linux') && !ua.includes('Android')) return 'Linux (Desktop)';
    if (ua.includes('Android')) return 'Android (Mobile)';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS (Mobile)';
    return 'Système inconnu / Web';
  }

  /**
   * Retrieves all previously saved tester feedback reports from local storage.
   */
  public static getAll(): TesterFeedback[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('Failed to parse tester feedback from storage:', e);
      return [];
    }
  }

  /**
   * Saves a new tester feedback report locally.
   */
  public static save(input: {
    type: FeedbackType;
    severity: FeedbackSeverity;
    module: string;
    description: string;
    licenseType?: string;
    screenshotName?: string;
    screenshotBase64?: string;
    contactEmail?: string;
  }): TesterFeedback {
    const feedback: TesterFeedback = {
      id: `FDBK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      type: input.type,
      severity: input.severity,
      module: input.module || 'Général',
      version: `v${BUILD_VERSION_NAME || '1.3.6'}`,
      buildId: BUILD_ID || 'BA-V1.3.6',
      os: this.detectOS(),
      licenseType: input.licenseType || 'TEST',
      description: input.description.trim(),
      screenshotName: input.screenshotName,
      screenshotBase64: input.screenshotBase64,
      contactEmail: input.contactEmail?.trim(),
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const existing = this.getAll();
        existing.unshift(feedback);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      } catch (e) {
        console.warn('Failed to persist tester feedback to storage:', e);
      }
    }

    return feedback;
  }

  /**
   * Formats a feedback report into human-readable text suitable for copying into email.
   */
  public static getFormattedReport(f: TesterFeedback): string {
    const typeLabels: Record<FeedbackType, string> = {
      bug: 'Bug / Anomalie',
      question: 'Question',
      ux: 'Problème UX / Ergonomie',
      suggestion: 'Suggestion',
      missing_feature: 'Fonctionnalité manquante',
    };

    const severityLabels: Record<FeedbackSeverity, string> = {
      blocker: 'Bloquant (empêche l\'utilisation)',
      important: 'Important (gêne le travail)',
      minor: 'Mineur (détail cosmétique)',
      idea: 'Idée / Amélioration future',
    };

    return [
      `=== RAPPORT DE RETOUR TESTEUR — BIRD ACADEMY ===`,
      `ID Référence   : ${f.id}`,
      `Date           : ${new Date(f.createdAt).toLocaleString('fr-FR')}`,
      `Type           : ${typeLabels[f.type] || f.type}`,
      `Gravité        : ${severityLabels[f.severity] || f.severity}`,
      `Module         : ${f.module}`,
      `Version App    : ${f.version} (BUILD_ID: ${f.buildId})`,
      `Système        : ${f.os}`,
      `Type Licence   : ${f.licenseType}`,
      f.contactEmail ? `Contact Email  : ${f.contactEmail}` : null,
      f.screenshotName ? `Capture d'écran: ${f.screenshotName}` : null,
      ``,
      `--- DESCRIPTION ---`,
      f.description,
      ``,
      `=== FIN DU RAPPORT (Aucune donnée d'élevage incluse) ===`,
    ].filter(Boolean).join('\n');
  }

  /**
   * Exports all feedback as a downloadable JSON string.
   */
  public static exportJson(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }
}
