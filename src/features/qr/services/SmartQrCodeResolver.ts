/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Service de Résolution Déterministe Locale pour Smart QR Codes (Chantier 2)
 * 
 * Contrat :
 * QR généré par Bird Academy -> Scanner -> Décoder -> Identifier le type d'objet ->
 * Résoudre localement (offline) -> Renvoyer la donnée et la cible de navigation.
 */

import { QRCodeManager } from '../../habitat/services/QRCodeManager';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import type { Canari, HabitatCage } from '../../../types';
import type { QRCodeType } from '../../../types/habitat';

export type SmartQrEntityType = QRCodeType;

export interface SmartQrResolutionSuccess<T = any> {
  success: true;
  rawCode: string;
  entityType: SmartQrEntityType;
  entityId: string;
  data: T;
  targetTab: 'canaris' | 'cages' | 'ventes';
  label: string;
  message: string;
}

export interface SmartQrResolutionFailure {
  success: false;
  rawCode: string;
  errorType: 'INVALID_FORMAT' | 'NOT_FOUND' | 'UNSUPPORTED_TYPE';
  entityType?: string;
  entityId?: string;
  message: string;
}

export type SmartQrResolutionResult = SmartQrResolutionSuccess | SmartQrResolutionFailure;

export class SmartQrCodeResolver {
  /**
   * Résout localement (100% offline) n'importe quel code QR scanné généré par Bird Academy.
   * Ne crée jamais d'objet arbitraire.
   * Ne crash jamais en cas de payload vide, corrompu ou inconnu.
   */
  static resolve(rawCode: string): SmartQrResolutionResult {
    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return {
        success: false,
        rawCode: '',
        errorType: 'INVALID_FORMAT',
        message: 'Contenu du QR Code vide ou illisible.'
      };
    }

    const clean = rawCode.trim();

    // 1. Vérification du préfixe officiel Bird Academy
    if (!clean.startsWith('BA:')) {
      return {
        success: false,
        rawCode: clean,
        errorType: 'INVALID_FORMAT',
        message: 'QR code non reconnu : ce code ne provient pas de Bird Academy ou son format est invalide.'
      };
    }

    // 2. Découpage et validation de structure
    const parsed = QRCodeManager.parseCode(clean);
    if (!parsed || !parsed.entityType || !parsed.entityId) {
      return {
        success: false,
        rawCode: clean,
        errorType: 'INVALID_FORMAT',
        message: 'Format QR Code Bird Academy incomplet ou corrompu.'
      };
    }

    const { entityType, entityId, extra } = parsed;

    // 3. Résolution OISEAU (BIRD)
    if (entityType === 'BIRD') {
      const allBirds = BirdRepository.getAll(true);
      const cleanEntityId = entityId.trim().toUpperCase();

      // Recherche prioritaire par numéro de bague, puis par identifiant numérique ou nom
      const bird = allBirds.find(b => {
        const ringMatch = b.bague && b.bague.trim().toUpperCase() === cleanEntityId;
        const idMatch = String(b.id) === entityId.trim();
        const nomMatch = b.nom && b.nom.trim().toUpperCase() === cleanEntityId;
        return ringMatch || idMatch || nomMatch;
      });

      if (bird) {
        return {
          success: true,
          rawCode: clean,
          entityType: 'BIRD',
          entityId: String(bird.id),
          data: bird,
          targetTab: 'canaris',
          label: `${bird.nom || 'Oiseau'} (${bird.bague || bird.id})`,
          message: 'Oiseau identifié avec succès.'
        };
      }

      return {
        success: false,
        rawCode: clean,
        errorType: 'NOT_FOUND',
        entityType: 'BIRD',
        entityId,
        message: `QR code reconnu (Oiseau : ${entityId}), mais aucun oiseau correspondant n'a été trouvé sur cet appareil.`
      };
    }

    // 4. Résolution CAGE
    if (entityType === 'CAGE') {
      const v2Cages = HabitatRepository.getAll<HabitatCage>('cage');
      const legacyCages = HabitatRepository.getAllLegacy();
      const cleanEntityId = entityId.trim().toLowerCase();

      const cage = v2Cages.find(c => c.id === entityId || (c.nom && c.nom.toLowerCase() === cleanEntityId))
        || legacyCages.find(c => String(c.id) === entityId || (c.nom && c.nom.toLowerCase() === cleanEntityId));

      if (cage) {
        return {
          success: true,
          rawCode: clean,
          entityType: 'CAGE',
          entityId: String(cage.id),
          data: cage,
          targetTab: 'cages',
          label: cage.nom || `Cage #${cage.id}`,
          message: 'Cage identifiée avec succès.'
        };
      }

      return {
        success: false,
        rawCode: clean,
        errorType: 'NOT_FOUND',
        entityType: 'CAGE',
        entityId,
        message: `QR code reconnu (Cage : ${entityId}), mais aucune cage correspondante n'a été trouvée sur cet appareil.`
      };
    }

    // 5. Résolution AUTRES ÉLÉMENTS HABITAT (AVIARY, ZONE, COMPARTMENT, QUARANTINE, FACILITY)
    const habitatEntityMap: Record<string, string> = {
      AVIARY: 'aviary',
      ZONE: 'zone',
      COMPARTMENT: 'compartment',
      QUARANTINE: 'quarantineArea',
      FACILITY: 'facility'
    };

    if (habitatEntityMap[entityType]) {
      const repoType = habitatEntityMap[entityType] as any;
      const item = HabitatRepository.getById(repoType, entityId);
      if (item) {
        return {
          success: true,
          rawCode: clean,
          entityType,
          entityId,
          data: item,
          targetTab: 'cages',
          label: (item as any).nom || `${entityType} #${entityId}`,
          message: `${entityType} identifié(e) avec succès.`
        };
      }

      return {
        success: false,
        rawCode: clean,
        errorType: 'NOT_FOUND',
        entityType,
        entityId,
        message: `QR code reconnu (${entityType} : ${entityId}), mais aucun élément correspondant n'a été trouvé sur cet appareil.`
      };
    }

    // 6. Résolution CERTIFICAT DE CESSION (CERT)
    if (entityType === 'CERT') {
      const allBirds = BirdRepository.getAll(true);
      const cleanEntityId = entityId.toUpperCase();
      const extraUpper = extra ? extra.toUpperCase() : undefined;

      const bird = allBirds.find(b => {
        const ringMatch = b.bague && (b.bague.toUpperCase() === cleanEntityId || (extraUpper && b.bague.toUpperCase() === extraUpper));
        const idMatch = String(b.id) === entityId || (extra && String(b.id) === extra);
        return ringMatch || idMatch;
      });

      if (bird) {
        return {
          success: true,
          rawCode: clean,
          entityType: 'BIRD',
          entityId: String(bird.id),
          data: bird,
          targetTab: 'canaris',
          label: `Certificat ${entityId} : ${bird.nom || 'Oiseau'} (${bird.bague || bird.id})`,
          message: 'Certificat de cession vérifié : oiseau identifié.'
        };
      }

      return {
        success: false,
        rawCode: clean,
        errorType: 'NOT_FOUND',
        entityType: 'CERT',
        entityId,
        message: `Certificat de cession ${entityId} reconnu, mais l'oiseau associé est introuvable sur cet appareil.`
      };
    }

    // 7. Type d'entité non supporté
    return {
      success: false,
      rawCode: clean,
      errorType: 'UNSUPPORTED_TYPE',
      entityType,
      entityId,
      message: `Type d'élément (${entityType}) non pris en charge par le scanner.`
    };
  }
}
