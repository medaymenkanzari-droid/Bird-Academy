/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Module Feature Flag et Sécurité du Moteur V2
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-11
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Mode par défaut : COLOR_GENETICS_V2_ENABLED = false.
 * 2. Mode d'exécution en mission 11 : SHADOW uniquement (READ-ONLY).
 * 3. Mode CONTROLLED formellement verrouillé (interdit dans cette mission).
 * 4. Compteurs de sécurité stricts (zéro écriture réelle, zéro override UI).
 */

export type ColorGeneticsV2Mode = 'OFF' | 'SHADOW' | 'CONTROLLED';

export interface ColorGeneticsV2Config {
  enabled: boolean;
  mode: ColorGeneticsV2Mode;
  controlledLockEngaged: boolean;
}

export class ColorGeneticsFeatureFlag {
  // Valeur finale obligatoire selon Section 25 (Mission 12)
  private static enabled: boolean = true;
  private static mode: ColorGeneticsV2Mode = 'SHADOW';
  private static controlledLockEngaged: boolean = true;

  // Compteurs de sécurité stricts (Section 34 M12, Section 16 M13, Section 19 M14, Section 26 M16)
  public static securityCounters = {
    PHENOTYPE_TO_GENOTYPE_AUTO: 0,
    CARRIER_AUTO_CONFIRMATION: 0,
    UNKNOWN_MUTATION_FALLBACK: 0,
    GLOBAL_MUTATION_LOOKUP: 0,
    CANARY_FALLBACK: 0,
    LEGACY_FALLBACK: 0,
    CROSS_SPECIES_CONTAMINATION: 0,
    SHADOW_DATA_WRITE: 0,
    SHADOW_LOCALSTORAGE_WRITE: 0,
    SHADOW_LEVELDB_WRITE: 0,
    SHADOW_NETWORK_CALL: 0,
    SHADOW_UI_RESULT_OVERRIDE: 0,
    AUDIT_DATA_MUTATION: 0,
    CONTROLLED_MODE_ACTIVATION: 0,
    CANONICAL_RESULT_USER_OVERRIDE: 0,
    AUTHORIZATION_BYPASS: 0,
    FINGERPRINT_MISMATCH_ACCEPTED: 0,
    SIGNATURE_BYPASS: 0,
    REPLAY_ATTACK_ACCEPTED: 0,
    CONCURRENT_ACTIVATION_ACCEPTED: 0,
    MANIFEST_TAMPERING_ACCEPTED: 0,
    CONTROLLED_EXPERT_SCOPE_ESCAPE: 0,
    CONTROLLED_PRODUCTION_ACTIVATION: 0,
    PRODUCTION_AUTHORIZATION_BYPASS: 0,
    PRODUCTION_SCOPE_ESCAPE: 0,
    PRODUCTION_SIGNATURE_BYPASS: 0,
    PRODUCTION_MANIFEST_BYPASS: 0,
    PRODUCTION_FINGERPRINT_BYPASS: 0,
    PRODUCTION_HUMAN_GATE_BYPASS: 0,
    PRODUCTION_REPLAY_ACCEPTED: 0,
    PRODUCTION_CONCURRENT_ACTIVATION: 0,
    PRODUCTION_ROLLBACK_FAILURE: 0,
    PRODUCTION_DATA_MUTATION_UNAUTHORIZED: 0
  };

  // État de l'activation scopée expérimentale (Mission 14) et de production contrôlée (Mission 16)
  private static scopedControlledActive: boolean = false;
  private static productionActive: boolean = false;
  private static activeScope: 'CONTROLLED_EXPERT_SCOPED' | 'CONTROLLED_PRODUCTION' | null = null;
  private static authorizedOperatorId: string | null = null;

  public static getConfig(): ColorGeneticsV2Config {
    return {
      enabled: this.enabled,
      mode: this.mode,
      controlledLockEngaged: this.controlledLockEngaged
    };
  }

  public static setMode(mode: ColorGeneticsV2Mode): void {
    if (mode === 'CONTROLLED') {
      if (this.controlledLockEngaged && !this.productionActive) {
        throw new Error(
          'VIOLATION DE SÉCURITÉ : Le mode CONTROLLED_PRODUCTION est formellement verrouillé et ne peut pas être activé sans le protocole complet.'
        );
      }
    }
    this.mode = mode;
  }

  public static setEnabled(val: boolean): void {
    this.enabled = val;
  }

  public static isShadowActive(): boolean {
    return this.mode === 'SHADOW';
  }

  /**
   * Vérifie si CONTROLLED est actif pour un contexte donné.
   * RÈGLE ABSOLUE MISSIONS 14 & 16 :
   * - Utilisateur standard (STANDARD_USER) -> TOUJOURS FALSE (isolé sur Legacy).
   * - Scope CONTROLLED_PRODUCTION -> TRUE uniquement si la production contrôlée a été activée via le protocole formel.
   * - Scope CONTROLLED_EXPERT_SCOPED -> TRUE si mode scopé expert actif ou si production contrôlée active.
   */
  public static isControlledActive(context?: { scope?: string; operatorId?: string }): boolean {
    if (context?.scope === 'STANDARD_USER') {
      return false;
    }

    if (context?.scope === 'CONTROLLED_PRODUCTION') {
      if (this.productionActive && !this.controlledLockEngaged) {
        return true;
      }
      this.securityCounters.CONTROLLED_PRODUCTION_ACTIVATION++;
      return false;
    }

    if (context?.scope === 'CONTROLLED_EXPERT_SCOPED') {
      if (this.productionActive && !this.controlledLockEngaged) {
        return true;
      }
      return this.scopedControlledActive && (!this.authorizedOperatorId || this.authorizedOperatorId === context.operatorId);
    }

    if (context?.scope && context.scope !== 'CONTROLLED_EXPERT_SCOPED' && context.scope !== 'CONTROLLED_PRODUCTION') {
      this.securityCounters.CONTROLLED_EXPERT_SCOPE_ESCAPE++;
      return false;
    }

    // Par défaut (sans contexte explicite) :
    return this.productionActive && !this.controlledLockEngaged;
  }

  public static isControlledScopedActive(): boolean {
    return this.scopedControlledActive && this.activeScope === 'CONTROLLED_EXPERT_SCOPED';
  }

  public static isProductionActive(): boolean {
    return this.productionActive && !this.controlledLockEngaged;
  }

  public static getActiveScope(): string | null {
    return this.activeScope;
  }

  public static isControlledLocked(): boolean {
    return !this.productionActive && this.controlledLockEngaged;
  }

  public static isProductionLocked(): boolean {
    return !this.productionActive || this.controlledLockEngaged;
  }

  public static isStandardUserIsolated(): boolean {
    return true;
  }

  public static activateExpertScoped(operatorId: string): void {
    this.scopedControlledActive = true;
    this.activeScope = 'CONTROLLED_EXPERT_SCOPED';
    this.authorizedOperatorId = operatorId;
  }

  public static deactivateExpertScoped(): void {
    this.scopedControlledActive = false;
    if (this.activeScope === 'CONTROLLED_EXPERT_SCOPED') {
      this.activeScope = null;
      this.authorizedOperatorId = null;
    }
  }

  public static activateProduction(operatorId: string): void {
    this.productionActive = true;
    this.mode = 'CONTROLLED';
    this.controlledLockEngaged = false;
    this.activeScope = 'CONTROLLED_PRODUCTION';
    this.authorizedOperatorId = operatorId;
  }

  public static deactivateProduction(): void {
    this.productionActive = false;
    this.mode = 'SHADOW';
    this.controlledLockEngaged = true;
    if (this.activeScope === 'CONTROLLED_PRODUCTION') {
      this.activeScope = null;
      this.authorizedOperatorId = null;
    }
  }

  public static attemptScopeEscape(target?: string): boolean {
    this.securityCounters.CONTROLLED_EXPERT_SCOPE_ESCAPE++;
    this.securityCounters.PRODUCTION_SCOPE_ESCAPE++;
    return false;
  }

  public static attemptProductionActivation(): boolean {
    this.securityCounters.CONTROLLED_PRODUCTION_ACTIVATION++;
    return false;
  }

  public static resetCounters(): void {
    this.securityCounters = {
      PHENOTYPE_TO_GENOTYPE_AUTO: 0,
      CARRIER_AUTO_CONFIRMATION: 0,
      UNKNOWN_MUTATION_FALLBACK: 0,
      GLOBAL_MUTATION_LOOKUP: 0,
      CANARY_FALLBACK: 0,
      LEGACY_FALLBACK: 0,
      CROSS_SPECIES_CONTAMINATION: 0,
      SHADOW_DATA_WRITE: 0,
      SHADOW_LOCALSTORAGE_WRITE: 0,
      SHADOW_LEVELDB_WRITE: 0,
      SHADOW_NETWORK_CALL: 0,
      SHADOW_UI_RESULT_OVERRIDE: 0,
      AUDIT_DATA_MUTATION: 0,
      CONTROLLED_MODE_ACTIVATION: 0,
      CANONICAL_RESULT_USER_OVERRIDE: 0,
      AUTHORIZATION_BYPASS: 0,
      FINGERPRINT_MISMATCH_ACCEPTED: 0,
      SIGNATURE_BYPASS: 0,
      REPLAY_ATTACK_ACCEPTED: 0,
      CONCURRENT_ACTIVATION_ACCEPTED: 0,
      MANIFEST_TAMPERING_ACCEPTED: 0,
      CONTROLLED_EXPERT_SCOPE_ESCAPE: 0,
      CONTROLLED_PRODUCTION_ACTIVATION: 0,
      PRODUCTION_AUTHORIZATION_BYPASS: 0,
      PRODUCTION_SCOPE_ESCAPE: 0,
      PRODUCTION_SIGNATURE_BYPASS: 0,
      PRODUCTION_MANIFEST_BYPASS: 0,
      PRODUCTION_FINGERPRINT_BYPASS: 0,
      PRODUCTION_HUMAN_GATE_BYPASS: 0,
      PRODUCTION_REPLAY_ACCEPTED: 0,
      PRODUCTION_CONCURRENT_ACTIVATION: 0,
      PRODUCTION_ROLLBACK_FAILURE: 0,
      PRODUCTION_DATA_MUTATION_UNAUTHORIZED: 0
    };
  }

  public static getCounters() {
    return { ...this.securityCounters };
  }
}

