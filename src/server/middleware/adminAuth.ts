/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Admin Authentication & Session Security Middleware for LMSE Backend API
 */

import { Request, Response, NextFunction } from 'express';
import { ADMIN_ROLES, AdminRole, isAdminRole } from '../../config/appMode';

export interface AdminSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: AdminRole;
  createdAt: number;
  expiresAt: number;
  mfaVerified: boolean;
}

export class AdminAuthService {
  private static sessions: Map<string, AdminSession> = new Map();
  private static mfaSecrets: Map<string, string> = new Map();

  /**
   * Resets sessions (useful for tests)
   */
  public static clearSessions(): void {
    AdminAuthService.sessions.clear();
    AdminAuthService.mfaSecrets.clear();
  }

  /**
   * Creates a authenticated session for an administrator account
   */
  public static createSession(user: { id: string; email: string; name: string; role: AdminRole }): AdminSession {
    if (!isAdminRole(user.role)) {
      throw new Error(`SECURITY_ERROR: Role "${user.role}" is not an authorized administrative role.`);
    }

    const token = `lmse_adm_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const now = Date.now();
    const session: AdminSession = {
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: now,
      expiresAt: now + 8 * 60 * 60 * 1000, // 8 hours validity
      mfaVerified: true,
    };

    AdminAuthService.sessions.set(token, session);
    return session;
  }

  /**
   * Validates an admin token
   */
  public static getSession(token: string): AdminSession | null {
    const session = AdminAuthService.sessions.get(token);
    if (!session) return null;
    if (Date.now() > session.expiresAt) {
      AdminAuthService.sessions.delete(token);
      return null;
    }
    return session;
  }

  /**
   * Revokes an admin session
   */
  public static revokeSession(token: string): boolean {
    return AdminAuthService.sessions.delete(token);
  }

  /**
   * Generates a TOTP secret placeholder for MFA setup
   */
  public static setupMfa(userId: string): { secret: string; qrCodePlaceholder: string } {
    const secret = `MFA_${userId}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    AdminAuthService.mfaSecrets.set(userId, secret);
    return {
      secret,
      qrCodePlaceholder: `otpauth://totp/BirdAcademy:${userId}?secret=${secret}&issuer=BirdAcademyEnterprise`,
    };
  }

  /**
   * Express middleware to enforce Admin authentication & RBAC
   */
  public static requireAdmin(requiredRoles?: AdminRole[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Accès refusé. Jeton d\'authentification administrateur requis.',
        });
      }

      const token = authHeader.substring(7);
      const session = AdminAuthService.getSession(token);

      if (!session) {
        return res.status(401).json({
          error: 'INVALID_TOKEN',
          message: 'Session d\'administration invalide ou expirée.',
        });
      }

      if (!isAdminRole(session.role)) {
        return res.status(403).json({
          error: 'FORBIDDEN_ROLE',
          message: `Le rôle "${session.role}" n'est pas autorisé à accéder aux fonctions d'administration.`,
        });
      }

      if (requiredRoles && !requiredRoles.includes(session.role)) {
        return res.status(403).json({
          error: 'INSUFFICIENT_PERMISSIONS',
          message: 'Privilèges insuffisants pour exécuter cette opération.',
        });
      }

      // Attach session to request object
      (req as any).adminSession = session;
      return next();
    };
  }
}
