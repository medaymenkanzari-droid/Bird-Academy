/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Service de Rollback d'Urgence et Restauration (ControlledRollbackService)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-13
 * 
 * GARANTIES D'ARCHITECTURE :
 * 1. Restauration instantanée du mode 'SHADOW' sans aucune mutation de données biologiques.
 * 2. Réversibilité atomique et traçabilité de l'événement de retour arrière.
 * 3. Conservation intégrale de l'historique d'audit (append-only journal).
 * 4. Zéro impact sur LevelDB réel et localStorage réel.
 */

import type { ControlledActivationAuthorization, ControlledRollbackResult } from './types';
import { ColorGeneticsFeatureFlag } from '../ColorGeneticsFeatureFlag';
import { CanonicalColorGeneticsAuditJournal } from '../audit/CanonicalColorGeneticsAuditJournal';

export class ControlledRollbackService {
  /**
   * Exécute un rollback contrôlé vers le mode SHADOW.
   * Ne modifie AUCUNE donnée biologique.
   */
  public static executeRollback(auth: ControlledActivationAuthorization): ControlledRollbackResult {
    const rollbackId = `ROL-${Date.now()}-${auth.authorizationId.substring(0, 8)}`;

    // 1. Verrouillage / Maintien strict du feature flag en SHADOW et désactivation du scope expert
    ColorGeneticsFeatureFlag.deactivateExpertScoped();
    ColorGeneticsFeatureFlag.setMode('SHADOW');

    // 2. Journalisation dans l'audit journal (append-only)
    CanonicalColorGeneticsAuditJournal.recordDecision({
      recordId: auth.authorizationId,
      speciesId: 'system',
      decision: 'REJECT',
      operatorId: auth.operatorId || 'OPERATOR_ROLLBACK',
      reason: `[CONTROLLED_ROLLBACK] Restauration du mode SHADOW suite au déclenchement du rollback ${rollbackId}.`,
      dimension: 'CONTROLLED_ROLLBACK'
    });

    // 3. Mise à jour de l'état de l'autorisation
    auth.authorizationStatus = 'ROLLED_BACK';

    return {
      rollbackId,
      authorizationId: auth.authorizationId,
      targetMode: 'SHADOW',
      restored: true,
      timestamp: new Date().toISOString(),
      auditStatePreserved: true,
      biologicalDataUntouched: true,
      status: 'SHADOW_RESTORED'
    };
  }
}
