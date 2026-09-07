/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdminUserProfile, AdminRole } from '../types/admin.types';
import { AdminAuditService } from './AdminAuditService';

const USERS_STORAGE_KEY = 'bird_academy_admin_users';

export class AdminUserStore {
  public static getAll(): AdminUserProfile[] {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
      if (!data) return this.getInitialSeedUsers();
      return JSON.parse(data);
    } catch {
      return this.getInitialSeedUsers();
    }
  }

  public static saveUsers(users: AdminUserProfile[]): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save admin users:', e);
    }
  }

  public static addUser(user: Omit<AdminUserProfile, 'id' | 'createdAt' | 'lastLoginAt' | 'deviceCount'>): AdminUserProfile {
    const users = this.getAll();
    const newUser: AdminUserProfile = {
      ...user,
      id: 'USR-' + Date.now().toString(36).toUpperCase(),
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      deviceCount: 1,
    };

    users.unshift(newUser);
    this.saveUsers(users);

    AdminAuditService.logAction({
      action: 'Création d un utilisateur',
      category: 'user',
      target: `${newUser.name} (${newUser.email})`,
      details: `Attribution du rôle ${newUser.role} avec ${newUser.permissions.length} permissions`,
      status: 'success',
    });

    return newUser;
  }

  public static updateUser(id: string, updates: Partial<AdminUserProfile>): AdminUserProfile | null {
    const users = this.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    const updated = { ...users[index], ...updates };
    users[index] = updated;
    this.saveUsers(users);

    AdminAuditService.logAction({
      action: 'Mise à jour d un utilisateur',
      category: 'user',
      target: `${updated.name} (${updated.email})`,
      details: `Champs mis à jour : ${Object.keys(updates).join(', ')}`,
      status: 'success',
    });

    return updated;
  }

  public static toggleStatus(id: string): AdminUserProfile | null {
    const user = this.getAll().find(u => u.id === id);
    if (!user) return null;

    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const updated = this.updateUser(id, { status: nextStatus });

    if (updated) {
      AdminAuditService.logAction({
        action: nextStatus === 'suspended' ? 'Suspension d utilisateur' : 'Réactivation d utilisateur',
        category: 'user',
        target: `${updated.name} (${updated.email})`,
        details: `Statut modifié de ${user.status} à ${nextStatus}`,
        status: nextStatus === 'suspended' ? 'warning' : 'success',
      });
    }

    return updated;
  }

  public static deleteUser(id: string): boolean {
    const users = this.getAll();
    const user = users.find(u => u.id === id);
    if (!user) return false;

    const filtered = users.filter(u => u.id !== id);
    this.saveUsers(filtered);

    AdminAuditService.logAction({
      action: 'Suppression d un utilisateur',
      category: 'user',
      target: `${user.name} (${user.email})`,
      details: `Suppression définitive du compte utilisateur ${id}`,
      status: 'warning',
    });

    return true;
  }

  private static getInitialSeedUsers(): AdminUserProfile[] {
    return [
      {
        id: 'USR-MASTER-01',
        email: 'owner@birdacademy.com',
        name: 'Éleveur Principal Enterprise',
        role: 'super_admin',
        permissions: ['manage_users', 'manage_licenses', 'manage_orgs', 'manage_species', 'view_security', 'view_qa', 'manage_support', 'manage_settings', 'export_reporting'],
        status: 'active',
        organizationName: 'Fédération Ornitologique Enterprise',
        createdAt: '2026-01-01T00:00:00.000Z',
        lastLoginAt: new Date().toISOString(),
        deviceCount: 2,
      },
      {
        id: 'USR-SUPP-02',
        email: 'support.martin@bird-academy.fr',
        name: 'Jean Martin (Support Technique)',
        role: 'support',
        permissions: ['manage_species', 'view_security', 'manage_support'],
        status: 'active',
        organizationName: 'Bird Academy Support',
        createdAt: '2026-02-10T10:00:00.000Z',
        lastLoginAt: '2026-08-05T14:20:00.000Z',
        deviceCount: 1,
      },
      {
        id: 'USR-AUDIT-03',
        email: 'auditor@bird-academy.org',
        name: 'Cabinet Audit Security',
        role: 'auditor',
        permissions: ['view_security', 'export_reporting'],
        status: 'active',
        organizationName: 'Audit & Compliance Enterprise',
        createdAt: '2026-03-15T09:30:00.000Z',
        lastLoginAt: '2026-08-06T11:45:00.000Z',
        deviceCount: 2,
      },
      {
        id: 'USR-ADMIN-04',
        email: 'admin.dupont@bird-academy.com',
        name: 'Marc Dupont (Admin Opérationnel)',
        role: 'admin',
        permissions: ['manage_users', 'manage_licenses', 'manage_support'],
        status: 'active',
        organizationName: 'Bird Academy Ops',
        createdAt: '2026-06-01T08:00:00.000Z',
        lastLoginAt: '2026-08-07T04:10:00.000Z',
        deviceCount: 1,
      }
    ];
  }
}
