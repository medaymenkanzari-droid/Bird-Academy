/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ADMIN / LMSE ENTERPRISE — REPOSITORY DES COMPTES ADMINISTRATEURS
 */

import fs from 'node:fs';
import path from 'node:path';
import { PasswordCrypto } from '../utils/passwordCrypto';

export type AdminAccountRole = 'super_admin' | 'admin' | 'support' | 'auditor';

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  role: AdminAccountRole;
  permissions: string[];
  status: 'active' | 'suspended' | 'revoked';
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
  lastLoginAt?: string;
  organizationName?: string;
}

export class AdminUserRepository {
  private static instance: AdminUserRepository | null = null;
  private filePath: string;
  private accounts: Map<string, AdminAccount> = new Map();
  private lastLoadedTime: number = 0;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'admin-users.json');
    this.loadFromFile();
  }

  public static getInstance(filePath?: string): AdminUserRepository {
    if (!AdminUserRepository.instance) {
      AdminUserRepository.instance = new AdminUserRepository(filePath);
    } else if (filePath && AdminUserRepository.instance.filePath !== filePath) {
      AdminUserRepository.instance = new AdminUserRepository(filePath);
    }
    return AdminUserRepository.instance;
  }

  public static resetInstance(): void {
    AdminUserRepository.instance = null;
  }

  private loadFromFile(): void {
    try {
      if (!fs.existsSync(this.filePath)) {
        return;
      }
      const stats = fs.statSync(this.filePath);
      if (stats.mtimeMs <= this.lastLoadedTime && this.accounts.size > 0) {
        return;
      }
      const raw = fs.readFileSync(this.filePath, 'utf-8');
      const parsed: AdminAccount[] = JSON.parse(raw);
      this.accounts.clear();
      for (const acc of parsed) {
        this.accounts.set(acc.id, acc);
        this.accounts.set(acc.email.toLowerCase(), acc);
      }
      this.lastLoadedTime = stats.mtimeMs;
    } catch (e) {
      // Fallback in-memory
    }
  }

  private saveToFile(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const uniqueAccounts = Array.from(new Set(this.accounts.values()));
      fs.writeFileSync(this.filePath, JSON.stringify(uniqueAccounts, null, 2), 'utf-8');
      if (fs.existsSync(this.filePath)) {
        this.lastLoadedTime = fs.statSync(this.filePath).mtimeMs;
      }
    } catch (e) {
      // Fallback in-memory
    }
  }

  public hasSuperAdmin(): boolean {
    this.loadFromFile();
    for (const acc of this.accounts.values()) {
      if (acc.role === 'super_admin' && acc.status === 'active') {
        return true;
      }
    }
    return false;
  }

  public findByEmail(email: string): AdminAccount | null {
    this.loadFromFile();
    const normalized = email.trim().toLowerCase();
    return this.accounts.get(normalized) || null;
  }

  public findById(id: string): AdminAccount | null {
    this.loadFromFile();
    return this.accounts.get(id) || null;
  }

  public getAllAccounts(): AdminAccount[] {
    this.loadFromFile();
    return Array.from(new Set(this.accounts.values()));
  }

  public createSuperAdmin(data: {
    email: string;
    name: string;
    password: string;
    organizationName?: string;
  }): AdminAccount {
    this.loadFromFile();
    if (this.hasSuperAdmin()) {
      throw new Error('BOOTSTRAP_ERROR: Un compte Super Admin existe déjà dans le système.');
    }

    const { hash, salt } = PasswordCrypto.hashPassword(data.password);

    const newAccount: AdminAccount = {
      id: `USR-SA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      role: 'super_admin',
      permissions: ['*'],
      status: 'active',
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      organizationName: data.organizationName || 'Bird Academy HQ',
    };

    this.accounts.set(newAccount.id, newAccount);
    this.accounts.set(newAccount.email, newAccount);
    this.saveToFile();

    return newAccount;
  }

  public createSecondaryAdmin(data: {
    email: string;
    name: string;
    role: AdminAccountRole;
    permissions: string[];
    password: string;
    organizationName?: string;
  }): AdminAccount {
    this.loadFromFile();
    const { hash, salt } = PasswordCrypto.hashPassword(data.password);

    const newAccount: AdminAccount = {
      id: `USR-ADM-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      email: data.email.trim().toLowerCase(),
      name: data.name.trim(),
      role: data.role,
      permissions: data.permissions,
      status: 'active',
      passwordHash: hash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      organizationName: data.organizationName || 'Bird Academy Enterprise',
    };

    this.accounts.set(newAccount.id, newAccount);
    this.accounts.set(newAccount.email, newAccount);
    this.saveToFile();

    return newAccount;
  }

  public updateAccount(id: string, updates: Partial<AdminAccount>): AdminAccount | null {
    this.loadFromFile();
    const account = this.accounts.get(id);
    if (!account) return null;

    const updated = { ...account, ...updates };
    this.accounts.set(account.id, updated);
    this.accounts.set(account.email.toLowerCase(), updated);
    this.saveToFile();

    return updated;
  }

  public resetForTesting(): void {
    this.accounts.clear();
    this.lastLoadedTime = 0;
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
      const defaultPath = path.join(process.cwd(), 'data', 'admin-users.json');
      if (fs.existsSync(defaultPath)) {
        fs.unlinkSync(defaultPath);
      }
    } catch (e) {
      // Ignore
    }
  }
}
