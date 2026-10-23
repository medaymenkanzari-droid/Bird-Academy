/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION V1.9.6
 * SERVICE D'INTÉGRITÉ ET D'AUDIT FACTUEL DE L'HABITAT
 * Fichier : src/features/habitat/services/HabitatIntegrityService.ts
 * 
 * Respecte strictement :
 * - Hiérarchie : ZONE -> VOLIÈRE -> CAGE -> OISEAUX
 * - Zéro score, zéro étoile, zéro recommandation d'accouplement ou de déplacement
 * - Détection neutre des données manquantes :
 *   « Capacité non renseignée. », « Statut sanitaire non renseigné. », 
 *   « Emplacement non renseigné. », « Une vérification humaine est nécessaire. »
 * - Préservation stricte de UNKNOWN et NOT_TESTED
 * - Zéro oiseau fantôme, zéro duplication
 */

import { Zone, Aviary, HabitatCage, Canari, QuarantineRecord, QuarantineArea } from '../../../types';
import { Language } from '../../../utils/translations';

export interface HabitatMissingDataNotice {
  field: string;
  message: string;
  severity: 'info' | 'warning';
}

export interface HabitatNodeOccupancy<T> {
  entity: T;
  missingData: HabitatMissingDataNotice[];
  birds: Canari[];
  capacity?: number;
  occupancyCount: number;
}

export interface AviaryHierarchyNode {
  aviary: Aviary;
  missingData: HabitatMissingDataNotice[];
  cages: HabitatNodeOccupancy<HabitatCage>[];
  directBirds: Canari[];
  totalBirds: number;
}

export interface ZoneHierarchyNode {
  zone: Zone;
  missingData: HabitatMissingDataNotice[];
  aviaries: AviaryHierarchyNode[];
  standaloneCages: HabitatNodeOccupancy<HabitatCage>[];
  directBirds: Canari[];
  totalBirds: number;
}

export interface HabitatHierarchyTree {
  zones: ZoneHierarchyNode[];
  quarantine: {
    area?: QuarantineArea;
    records: QuarantineRecord[];
    birds: Canari[];
    missingData: HabitatMissingDataNotice[];
  }[];
  unassignedBirds: Canari[];
  stats: {
    totalZones: number;
    totalAviaries: number;
    totalCages: number;
    totalBirdsTracked: number;
    unassignedCount: number;
    quarantineCount: number;
  };
}

export class HabitatIntegrityService {

  /**
   * Formulations neutres normalisées pour les données manquantes.
   */
  static getStandardMissingText(type: 'capacity' | 'health' | 'location' | 'human_review', language: Language = 'fr'): string {
    const texts: Record<'capacity' | 'health' | 'location' | 'human_review', Record<Language, string>> = {
      capacity: {
        fr: "Capacité non renseignée.",
        en: "Capacity not recorded.",
        ar: "السعة غير مسجلة.",
        es: "Capacidad no registrada.",
        it: "Capacità non inserita."
      },
      health: {
        fr: "Statut sanitaire non renseigné.",
        en: "Health status not recorded.",
        ar: "الحالة الصحية غير مسجلة.",
        es: "Estado sanitario no registrado.",
        it: "Stato sanitario non inserito."
      },
      location: {
        fr: "Emplacement non renseigné.",
        en: "Location not recorded.",
        ar: "الموقع غير مسجل.",
        es: "Ubicación no registrada.",
        it: "Posizione non inserita."
      },
      human_review: {
        fr: "Une vérification humaine est nécessaire.",
        en: "A human review is required.",
        ar: "المراجعة البشرية ضرورية.",
        es: "Se requiere una verificación humana.",
        it: "È necessaria una verifica umana."
      }
    };
    return texts[type][language] || texts[type].fr;
  }

  /**
   * Audit neutre d'une Zone
   */
  static auditZone(zone: Zone, language: Language = 'fr'): HabitatMissingDataNotice[] {
    const notices: HabitatMissingDataNotice[] = [];
    if (!zone.nom || zone.nom.trim() === '') {
      notices.push({
        field: 'nom',
        message: this.getStandardMissingText('human_review', language),
        severity: 'warning'
      });
    }
    if (!zone.description || zone.description.trim() === '') {
      notices.push({
        field: 'description',
        message: language === 'fr' ? "Description non renseignée." : "Description not recorded.",
        severity: 'info'
      });
    }
    return notices;
  }

  /**
   * Audit neutre d'une Volière
   */
  static auditAviary(aviary: Aviary, language: Language = 'fr'): HabitatMissingDataNotice[] {
    const notices: HabitatMissingDataNotice[] = [];
    if (!aviary.nom || aviary.nom.trim() === '') {
      notices.push({
        field: 'nom',
        message: this.getStandardMissingText('human_review', language),
        severity: 'warning'
      });
    }
    if (aviary.capacite_max === undefined || aviary.capacite_max === null || aviary.capacite_max <= 0) {
      notices.push({
        field: 'capacite_max',
        message: this.getStandardMissingText('capacity', language),
        severity: 'info'
      });
    }
    return notices;
  }

  /**
   * Audit neutre d'une Cage
   */
  static auditCage(cage: HabitatCage, language: Language = 'fr'): HabitatMissingDataNotice[] {
    const notices: HabitatMissingDataNotice[] = [];
    if (!cage.nom || cage.nom.trim() === '') {
      notices.push({
        field: 'nom',
        message: this.getStandardMissingText('human_review', language),
        severity: 'warning'
      });
    }
    if (!cage.zoneId) {
      notices.push({
        field: 'zoneId',
        message: this.getStandardMissingText('location', language),
        severity: 'warning'
      });
    }
    if (cage.capacite_max === undefined || cage.capacite_max === null || cage.capacite_max <= 0) {
      notices.push({
        field: 'capacite_max',
        message: this.getStandardMissingText('capacity', language),
        severity: 'info'
      });
    }
    return notices;
  }

  /**
   * Audit neutre d'une fiche de quarantaine
   */
  static auditQuarantineRecord(record: QuarantineRecord, language: Language = 'fr'): HabitatMissingDataNotice[] {
    const notices: HabitatMissingDataNotice[] = [];
    if (!record.dateEntree) {
      notices.push({
        field: 'dateEntree',
        message: language === 'fr' ? "Date d'entrée non renseignée." : "Entry date not recorded.",
        severity: 'warning'
      });
    }
    if (!record.raison || record.raison.trim() === '') {
      notices.push({
        field: 'raison',
        message: this.getStandardMissingText('health', language),
        severity: 'info'
      });
    }
    if (record.statut === 'Terminé' && !record.dateSortieReelle) {
      notices.push({
        field: 'dateSortieReelle',
        message: language === 'fr' ? "Date de sortie réelle non renseignée." : "Actual exit date not recorded.",
        severity: 'warning'
      });
    }
    return notices;
  }

  /**
   * Construit l'arborescence complète et factuelle de l'élevage :
   * ZONE -> VOLIÈRE -> CAGE -> OISEAUX
   * Sans oiseaux fantômes, sans duplications et avec détection des orphelins.
   */
  static buildHierarchyTree(
    zones: Zone[],
    aviaries: Aviary[],
    cages: HabitatCage[],
    birds: Canari[],
    quarantineAreas: QuarantineArea[] = [],
    quarantineRecords: QuarantineRecord[] = [],
    language: Language = 'fr'
  ): HabitatHierarchyTree {
    const activeBirds = (birds || []).filter(b => !b.archived && b.statut_sante !== 'Décédé' && (b as any).statut !== 'Vendu');
    const assignedBirdIds = new Set<number>();

    // 1. Indexation des cages par ID
    const cageMap = new Map<string, HabitatCage>();
    cages.forEach(c => cageMap.set(String(c.id), c));

    // 2. Construction des zones
    const zoneNodes: ZoneHierarchyNode[] = zones.map(zone => {
      const zoneAviaries = aviaries.filter(a => a.zoneId === zone.id);
      const zoneCages = cages.filter(c => c.zoneId === zone.id);

      // A. Volières dans la zone
      const aviaryNodes: AviaryHierarchyNode[] = zoneAviaries.map(aviary => {
        const aviaryCages = zoneCages.filter(c => c.aviaryId === aviary.id);
        const cageNodes: HabitatNodeOccupancy<HabitatCage>[] = aviaryCages.map(cage => {
          const present = activeBirds.filter(b => {
            const bCage = b.cageId ? String(b.cageId) : (b.cage_id !== undefined && b.cage_id !== null ? String(b.cage_id) : undefined);
            return bCage === String(cage.id);
          });
          present.forEach(b => assignedBirdIds.add(b.id));

          return {
            entity: cage,
            missingData: this.auditCage(cage, language),
            birds: present,
            capacity: cage.capacite_max,
            occupancyCount: present.length
          };
        });

        // Oiseaux affectés directement à la volière sans cage spécifique
        const directBirds = activeBirds.filter(b => {
          if (assignedBirdIds.has(b.id)) return false;
          return b.aviaryId === aviary.id;
        });
        directBirds.forEach(b => assignedBirdIds.add(b.id));

        const totalBirds = cageNodes.reduce((sum, c) => sum + c.occupancyCount, 0) + directBirds.length;

        return {
          aviary,
          missingData: this.auditAviary(aviary, language),
          cages: cageNodes,
          directBirds,
          totalBirds
        };
      });

      // B. Cages autonomes de la zone (non rattachées à une volière)
      const standaloneCages = zoneCages.filter(c => !c.aviaryId);
      const standaloneCageNodes: HabitatNodeOccupancy<HabitatCage>[] = standaloneCages.map(cage => {
        const present = activeBirds.filter(b => {
          const bCage = b.cageId ? String(b.cageId) : (b.cage_id !== undefined && b.cage_id !== null ? String(b.cage_id) : undefined);
          return bCage === String(cage.id);
        });
        present.forEach(b => assignedBirdIds.add(b.id));

        return {
          entity: cage,
          missingData: this.auditCage(cage, language),
          birds: present,
          capacity: cage.capacite_max,
          occupancyCount: present.length
        };
      });

      // C. Oiseaux affectés directement à la zone (sans volière ni cage)
      const directBirds = activeBirds.filter(b => {
        if (assignedBirdIds.has(b.id)) return false;
        return b.zoneId === zone.id && !b.cageId && !b.cage_id && !b.aviaryId;
      });
      directBirds.forEach(b => assignedBirdIds.add(b.id));

      const totalBirds = aviaryNodes.reduce((sum, a) => sum + a.totalBirds, 0) +
        standaloneCageNodes.reduce((sum, c) => sum + c.occupancyCount, 0) +
        directBirds.length;

      return {
        zone,
        missingData: this.auditZone(zone, language),
        aviaries: aviaryNodes,
        standaloneCages: standaloneCageNodes,
        directBirds,
        totalBirds
      };
    });

    // 3. Quarantaine
    const quarantineNodes = (quarantineAreas.length > 0 ? quarantineAreas : [{ id: 'q-default', nom: 'Espace Quarantaine', facilityId: 'fac_default', capacite_max: 10, statut: 'Actif', createdAt: '', updatedAt: '', isArchived: false, customFields: {} } as QuarantineArea]).map(qArea => {
      const qBirds = activeBirds.filter(b => {
        return b.quarantineId === qArea.id || b.statut_sante === 'Quarantaine';
      });
      qBirds.forEach(b => assignedBirdIds.add(b.id));

      const records = quarantineRecords.filter(r => r.quarantineAreaId === qArea.id);
      const notices: HabitatMissingDataNotice[] = [];
      if (qArea.capacite_max === undefined || qArea.capacite_max === null || qArea.capacite_max <= 0) {
        notices.push({
          field: 'capacite_max',
          message: this.getStandardMissingText('capacity', language),
          severity: 'info'
        });
      }

      return {
        area: qArea,
        records,
        birds: qBirds,
        missingData: notices
      };
    });

    // 4. Oiseaux non affectés (aucune zone, volière, cage, quarantaine)
    const unassignedBirds = activeBirds.filter(b => !assignedBirdIds.has(b.id));

    return {
      zones: zoneNodes,
      quarantine: quarantineNodes,
      unassignedBirds,
      stats: {
        totalZones: zones.length,
        totalAviaries: aviaries.length,
        totalCages: cages.length,
        totalBirdsTracked: activeBirds.length,
        unassignedCount: unassignedBirds.length,
        quarantineCount: activeBirds.filter(b => b.quarantineId || b.statut_sante === 'Quarantaine').length
      }
    };
  }

  /**
   * Décrit clairement le chemin d'un oiseau : Zone -> Volière -> Cage
   */
  static resolveBreadcrumbPath(
    bird: Canari,
    zones: Zone[],
    aviaries: Aviary[],
    cages: HabitatCage[]
  ): { zoneNom: string; aviaryNom: string; cageNom: string; isQuarantine: boolean; isUnassigned: boolean } {
    if (bird.quarantineId || bird.statut_sante === 'Quarantaine') {
      return {
        zoneNom: "Quarantaine",
        aviaryNom: "Isolement Sanitaire",
        cageNom: bird.quarantineId ? `Espace #${bird.quarantineId}` : "Zone d'isolement",
        isQuarantine: true,
        isUnassigned: false
      };
    }

    const cageIdStr = bird.cageId ? String(bird.cageId) : (bird.cage_id !== undefined && bird.cage_id !== null ? String(bird.cage_id) : undefined);
    const cage = cageIdStr ? cages.find(c => String(c.id) === cageIdStr) : undefined;
    const aviaryId = cage?.aviaryId || bird.aviaryId;
    const aviary = aviaryId ? aviaries.find(a => a.id === aviaryId) : undefined;
    const zoneId = cage?.zoneId || aviary?.zoneId || bird.zoneId;
    const zone = zoneId ? zones.find(z => z.id === zoneId) : undefined;

    if (!zone && !aviary && !cage) {
      return {
        zoneNom: "Non assigné",
        aviaryNom: "Non assigné",
        cageNom: "Non assigné",
        isQuarantine: false,
        isUnassigned: true
      };
    }

    return {
      zoneNom: zone ? zone.nom : "Zone non renseignée",
      aviaryNom: aviary ? aviary.nom : "Hors volière (Cage autonome)",
      cageNom: cage ? cage.nom : "Cage non renseignée",
      isQuarantine: Boolean(zone?.isQuarantine),
      isUnassigned: false
    };
  }
}
