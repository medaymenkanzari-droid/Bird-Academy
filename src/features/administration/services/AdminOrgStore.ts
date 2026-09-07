/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Organization } from '../types/admin.types';
import { AdminAuditService } from './AdminAuditService';

const ORGS_STORAGE_KEY = 'bird_academy_admin_orgs';

export class AdminOrgStore {
  public static getAll(): Organization[] {
    try {
      const data = localStorage.getItem(ORGS_STORAGE_KEY);
      if (!data) return this.getInitialSeedOrgs();
      return JSON.parse(data);
    } catch {
      return this.getInitialSeedOrgs();
    }
  }

  public static saveOrgs(orgs: Organization[]): void {
    try {
      localStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(orgs));
    } catch (e) {
      console.error('Failed to save organizations:', e);
    }
  }

  public static addOrg(org: Omit<Organization, 'id' | 'createdAt'>): Organization {
    const orgs = this.getAll();
    const newOrg: Organization = {
      ...org,
      id: 'ORG-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
    };

    orgs.unshift(newOrg);
    this.saveOrgs(orgs);

    AdminAuditService.logAction({
      action: 'Création d une organisation',
      category: 'org',
      target: `${newOrg.name} (${newOrg.type})`,
      details: `Inscrit avec N° enregistrement ${newOrg.registrationNumber}`,
      status: 'success',
    });

    return newOrg;
  }

  public static updateOrg(id: string, updates: Partial<Organization>): Organization | null {
    const orgs = this.getAll();
    const index = orgs.findIndex(o => o.id === id);
    if (index === -1) return null;

    const updated = { ...orgs[index], ...updates };
    orgs[index] = updated;
    this.saveOrgs(orgs);

    AdminAuditService.logAction({
      action: 'Mise à jour d organisation',
      category: 'org',
      target: updated.name,
      details: `Mise à jour des informations de l organisation ${id}`,
      status: 'success',
    });

    return updated;
  }

  public static deleteOrg(id: string): boolean {
    const orgs = this.getAll();
    const org = orgs.find(o => o.id === id);
    if (!org) return false;

    const filtered = orgs.filter(o => o.id !== id);
    this.saveOrgs(filtered);

    AdminAuditService.logAction({
      action: 'Suppression d organisation',
      category: 'org',
      target: org.name,
      details: `Suppression définitive de l organisation ${id}`,
      status: 'warning',
    });

    return true;
  }

  private static getInitialSeedOrgs(): Organization[] {
    return [
      {
        id: 'ORG-001',
        name: 'Fédération Ornitologique Enterprise',
        type: 'association',
        registrationNumber: 'FED-2026-8891',
        country: 'France',
        city: 'Paris',
        memberCount: 450,
        contactEmail: 'contact@federation-ornitho.fr',
        contactPhone: '+33 1 42 68 00 00',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'ORG-002',
        name: 'Clinique Aviaire Nationale',
        type: 'vet_clinic',
        registrationNumber: 'VET-FR-9912',
        country: 'France',
        city: 'Lyon',
        memberCount: 18,
        contactEmail: 'urgences@clinique-aviaire.fr',
        contactPhone: '+33 4 72 00 11 22',
        status: 'active',
        createdAt: '2026-02-01T10:00:00.000Z',
      },
      {
        id: 'ORG-003',
        name: 'Club Canari Posture & Couleur',
        type: 'club',
        registrationNumber: 'CLUB-2026-0442',
        country: 'Belgique',
        city: 'Bruxelles',
        memberCount: 120,
        contactEmail: 'sec@canari-club-be.org',
        contactPhone: '+32 2 555 01 99',
        status: 'active',
        createdAt: '2026-03-10T14:00:00.000Z',
      }
    ];
  }
}
