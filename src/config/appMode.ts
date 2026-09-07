/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppMode = 'user' | 'admin';

export type UserRole = 'beta_tester' | 'breeder' | 'veterinarian' | 'association' | 'commercial';
export type AdminRole = 'super_admin' | 'admin' | 'support' | 'auditor';
export type SystemRole = UserRole | AdminRole;

export const BUILD_ID = "BA-V1.3.6-RC4";
export const BUILD_VERSION_NAME = "1.3.6-RC4";
export const BUILD_VERSION_CODE = 17;
export const BUILD_RELEASE_CHANNEL = "Pre-External QA (Windows-PreExternalUX-Fix-01)";

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
  const metaDev = (import.meta as any)?.env?.DEV;
  if (typeof metaDev === 'boolean') return metaDev;
  const metaMode = (import.meta as any)?.env?.MODE;
  if (metaMode) return metaMode !== 'production';
  return typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production';
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
