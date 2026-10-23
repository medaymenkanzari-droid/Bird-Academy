/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Liaison Canonique du Fingerprint Réel (CanonicalFingerprintBinding)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-13
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Zéro lecture depuis localStorage, variables de configuration, URL ou inputs client.
 * 2. Calcul programmatique direct sur le stockage physique LevelDB réel.
 * 3. Double checkpoint obligatoire (Checkpoint A à la préparation, Checkpoint B à l'activation).
 * 4. Rejet immédiat si A !== B (ACTIVATION_DENIED_STORAGE_CHANGED).
 */

import {
  CANONICAL_REAL_LEVELDB_PATH,
  calculateLevelDbHash
} from '../../genetics/migration/services/MigrationCanonicalFingerprintService';
import { ColorGeneticsFeatureFlag } from '../ColorGeneticsFeatureFlag';

export class CanonicalFingerprintBinding {
  /**
   * Obtient directement et de manière autoritaire l'empreinte physique du stockage réel.
   * RÈGLE ABSOLUE : N'accepte aucun argument provenant de l'UI ou du réseau.
   */
  public static getAuthoritativeRealFingerprint(): string {
    const realHash = calculateLevelDbHash(CANONICAL_REAL_LEVELDB_PATH);
    if (!realHash || realHash === 'NO_REAL_LEVELDB_DIR') {
      throw new Error('SÉCURITÉ CRITIQUE : Impossible d\'accéder au stockage réel LevelDB.');
    }
    return realHash;
  }

  /**
   * Vérifie la conformité d'un fingerprint candidat contre le fingerprint physique recalculé sur place.
   */
  public static verifyCandidateAgainstRealStorage(candidateFingerprint: string): {
    matched: boolean;
    realFingerprint: string;
    candidateFingerprint: string;
    error?: string;
  } {
    if (!candidateFingerprint || typeof candidateFingerprint !== 'string') {
      return {
        matched: false,
        realFingerprint: this.getAuthoritativeRealFingerprint(),
        candidateFingerprint: candidateFingerprint || '',
        error: 'CANDIDATE_FINGERPRINT_INVALID: Fingerprint candidat manquant ou de format incorrect.'
      };
    }

    const realFingerprint = this.getAuthoritativeRealFingerprint();
    const matched = candidateFingerprint.trim().toLowerCase() === realFingerprint.trim().toLowerCase();

    if (!matched) {
      return {
        matched: false,
        realFingerprint,
        candidateFingerprint,
        error: `SOURCE_FINGERPRINT_MISMATCH: Le fingerprint candidat (${candidateFingerprint}) ne correspond pas au fingerprint réel recalculé (${realFingerprint}).`
      };
    }

    return {
      matched: true,
      realFingerprint,
      candidateFingerprint
    };
  }

  /**
   * Exécute la vérification du double checkpoint (Checkpoint A à la préparation, Checkpoint B juste avant activation).
   */
  public static executeDoubleCheckpoint(checkpointAFingerprint: string): {
    valid: boolean;
    checkpointA: string;
    checkpointB: string;
    error?: string;
  } {
    const checkpointB = this.getAuthoritativeRealFingerprint();

    if (!checkpointAFingerprint || checkpointAFingerprint.trim() === '') {
      return {
        valid: false,
        checkpointA: '',
        checkpointB,
        error: 'ACTIVATION_DENIED_MISSING_CHECKPOINT_A: Checkpoint A absent.'
      };
    }

    if (checkpointAFingerprint.trim().toLowerCase() !== checkpointB.trim().toLowerCase()) {
      return {
        valid: false,
        checkpointA: checkpointAFingerprint,
        checkpointB,
        error: `ACTIVATION_DENIED_STORAGE_CHANGED: Le stockage réel a été modifié entre le Checkpoint A (${checkpointAFingerprint}) et le Checkpoint B (${checkpointB}).`
      };
    }

    return {
      valid: true,
      checkpointA: checkpointAFingerprint,
      checkpointB
    };
  }
}
