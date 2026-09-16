/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppMode = 'user' | 'admin';

export type UserRole = 'beta_tester' | 'breeder' | 'veterinarian' | 'association' | 'commercial';
export type AdminRole = 'super_admin' | 'admin' | 'support' | 'auditor';
export type SystemRole = UserRole | AdminRole;

export const BUILD_ID = "BA-V1.3.6";
export const BUILD_VERSION_NAME = "1.3.6";
export const BUILD_VERSION_CODE = 21;
export const BUILD_RELEASE_CHANNEL = "Stable Candidate";

/**
 * Checks if the current execution environment is an explicit Electron QA session.
 * Active ONLY when running in Electron desktop runtime with the explicit '--qa-mode' flag passed.
 * Strictly returns false in web browsers (Chrome, Edge, Firefox) and in Electron without '--qa-mode'.
 */
export function isQaMode(): boolean {
  const win = typeof window !== 'undefined' ? window : ((typeof globalThis !== 'undefined') ? (globalThis as any) : null);
  if (win?.electron) {
    return win.electron.isElectron === true && win.electron.qaMode === true;
  }
  return false;
}

export const ADMIN_ROLES: AdminRole[] = ['super_admin', 'admin', 'support', 'auditor'];
export const USER_ROLES: UserRole[] = ['beta_tester', 'breeder', 'veterinarian', 'association', 'commercial'];

/**
 * Returns the current application mode based on environment variables or current window location.
 */
export function getAppMode(): AppMode {
  const metaEnv = (import.meta as any)?.env?.VITE_APP_MODE;
  const processEnv = typeof process !== 'undefined' ? process.env?.VITE_APP_MODE : undefined;
  const mode = metaEnv || processEnv;
  
  if (mode === 'admin') {
    return 'admin';
  }
  if (mode === 'user') {
    return 'user';
  }

  if (typeof window !== 'undefined' && window.location) {
    const p = window.location.pathname.toLowerCase();
    const h = window.location.href.toLowerCase();
    if (p.endsWith('admin.html') || p.includes('/admin') || h.includes('admin.html')) {
      return 'admin';
    }
  }

  return 'user';
}

export function isUserBuild(): boolean {
  return getAppMode() === 'user';
}

export function isAdminBuild(): boolean {
  return getAppMode() === 'admin';
}

export function isDevEnvironment(): boolean {
  try {
    const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any)?.env) ? (import.meta as any).env : null;
    if (metaEnv?.DEV === true) return true;
    if (metaEnv?.MODE && metaEnv.MODE !== 'production') return true;
  } catch {}

  if (typeof process !== 'undefined') {
    return process.env?.NODE_ENV !== 'production';
  }

  if (typeof window !== 'undefined') {
    if ((window as any).__QA_DEV_ENV__ === true) return true;
    const host = window.location?.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1') {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a given role is an authorized administrative role.
 */
export function isAdminRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role.toLowerCase() as AdminRole);
}

/**
 * Security Guard: Ensures the current execution environment is in Admin mode and the role is administrative.
 * Throws a SecurityError if executed inside a User build or by a non-admin role.
 */
export function assertAdminContext(role?: string | null): void {
  if (isUserBuild()) {
    throw new Error('SECURITY_ERROR: Access to administrative functionality is disabled in the User application build.');
  }
  if (role && !isAdminRole(role)) {
    throw new Error(`SECURITY_ERROR: Role "${role}" is not authorized for administrative operations.`);
  }
}
