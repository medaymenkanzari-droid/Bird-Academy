/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CapturedError, SeverityLevel } from '../types';

export class GlobalErrorEngine {
  private static STORAGE_KEY = 'bird_academy_captured_errors';

  static getErrors(): CapturedError[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // safe fallback
    }
    return [];
  }

  static capture(
    module: string,
    message: string,
    errorObj?: Error | unknown,
    customSeverity?: SeverityLevel
  ): CapturedError {
    const errors = this.getErrors();
    const isError = errorObj instanceof Error;
    
    // Auto classification
    let classification = 'Système / Runtime';
    if (message.toLowerCase().includes('conjoint') || message.toLowerCase().includes('sexe') || message.toLowerCase().includes('couple')) {
      classification = 'Biologique / Reproduction';
    } else if (message.toLowerCase().includes('storage') || message.toLowerCase().includes('quota') || message.toLowerCase().includes('localstorage')) {
      classification = 'Stockage / Espace Disque';
    } else if (message.toLowerCase().includes('finance') || message.toLowerCase().includes('montant') || message.toLowerCase().includes('euro')) {
      classification = 'Financier / Encodage';
    } else if (message.toLowerCase().includes('index') || message.toLowerCase().includes('null') || message.toLowerCase().includes('undefined')) {
      classification = 'Pointeur Null / Référence';
    }

    // Auto severity mapping
    let severity: SeverityLevel = customSeverity || 'minor';
    if (!customSeverity) {
      if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('crash') || message.toLowerCase().includes('fatale')) {
        severity = 'critical';
      } else if (message.toLowerCase().includes('sexe') || message.toLowerCase().includes('incohérence') || message.toLowerCase().includes('dépass')) {
        severity = 'warning';
      } else if (message.toLowerCase().includes('info') || message.toLowerCase().includes('courant')) {
        severity = 'info';
      }
    }

    // Suggestions map
    let suggestion = "Vérifiez la validité de la saisie utilisateur et rechargez l'application.";
    if (classification === 'Biologique / Reproduction') {
      suggestion = "Modifiez les rôles mâle/femelle ou séparez le couple fautif depuis le module Reproduction.";
    } else if (classification === 'Stockage / Espace Disque') {
      suggestion = "Effectuez une sauvegarde complète externe puis videz le registre d'audit historique pour libérer de l'espace.";
    } else if (classification === 'Financier / Encodage') {
      suggestion = "Ajustez le montant ou la quantité pour obtenir une valeur strictement supérieure ou égale à zéro.";
    } else if (classification === 'Pointeur Null / Référence') {
      suggestion = "Exécutez l'Intégrité des Données pour réparer automatiquement les clés orphelines.";
    }

    const newError: CapturedError = {
      id: `err-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      module,
      classification,
      severity,
      message,
      stack: isError ? errorObj.stack : undefined,
      suggestion
    };

    errors.unshift(newError);
    
    // Limit to last 100 errors for performance
    if (errors.length > 100) {
      errors.pop();
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(errors));
    } catch {
      // ignore storage quota errors here
    }

    return newError;
  }

  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // safe fallback
    }
  }

  static removeError(id: string): void {
    const errors = this.getErrors().filter(e => e.id !== id);
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(errors));
    } catch {
      // safe fallback
    }
  }
}
