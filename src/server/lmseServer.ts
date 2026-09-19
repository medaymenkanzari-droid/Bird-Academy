/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * LMSE Enterprise Secure Backend API Server
 */

import express, { Request, Response, Express } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { AdminAuthService } from './middleware/adminAuth';
import { RateLimiter } from './middleware/rateLimiter';
import { LicenseGenerator } from '../features/licensing/engines/LicenseGenerator';
import { LicenseValidator } from '../features/licensing/engines/LicenseValidator';
import { LicenseAuditEngine } from '../features/licensing/engines/LicenseAuditEngine';
import { ActivationEngine } from '../features/licensing/engines/ActivationEngine';
import { LicenseLifecycleEngine } from '../features/licensing/engines/LicenseLifecycleEngine';
import { FileLicenseRepository } from '../features/licensing/repositories/FileLicenseRepository';
import { InMemoryLicenseRepository } from '../features/licensing/repositories/InMemoryLicenseRepository';
import { ILicenseRepository } from '../features/licensing/repositories/ILicenseRepository';
import { LicenseType } from '../features/licensing/types/licensing';
import { AdminRole, isAdminRole } from '../config/appMode';
import { AdminUserRepository } from './repositories/AdminUserRepository';
import { PasswordCrypto } from './utils/passwordCrypto';
import { CommercialPaymentService } from './services/CommercialPaymentService';

export interface AuditServerLog {
  id: string;
  timestamp: string;
  who: string;
  role: string;
  action: string;
  target: string;
  ip: string;
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  details?: string;
}

export class LmseBackendServer {
  private repository: ILicenseRepository;
  private auditLogs: AuditServerLog[] = [];
  public commercialPaymentService: CommercialPaymentService;
  public app: Express;

  constructor(repository?: ILicenseRepository) {
    this.repository = repository || new FileLicenseRepository();
    this.commercialPaymentService = new CommercialPaymentService(this.repository);
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    // CORS & Preflight OPTIONS Middleware
    this.app.use((req: Request, res: Response, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      next();
    });

    this.app.use((req: Request, res: Response, next) => {
      if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        return next();
      }
      express.json()(req, res, next);
    });

    // Global Audit Logging Middleware
    this.app.use((req: Request, res: Response, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
        if (req.path.startsWith('/api/')) {
          this.recordAudit({
            who: (req as any).adminSession?.email || 'ANONYMOUS',
            role: (req as any).adminSession?.role || 'NONE',
            action: `${req.method} ${req.path}`,
            target: req.originalUrl,
            ip,
            result: res.statusCode < 400 ? 'SUCCESS' : (res.statusCode === 429 ? 'BLOCKED' : 'FAILED'),
            details: `HTTP ${res.statusCode} (${Date.now() - start}ms)`,
          });
        }
      });
      next();
    });
  }

  public recordAudit(entry: Omit<AuditServerLog, 'id' | 'timestamp'>): AuditServerLog {
    const fullEntry: AuditServerLog = {
      id: `AUD-SRV-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.push(fullEntry);
    return fullEntry;
  }

  public async inject(options: { method: string; url: string; headers?: Record<string, string>; payload?: any }): Promise<{ statusCode: number; payload: string }> {
    return new Promise((resolve) => {
      const { method, url, headers = {}, payload } = options;
      const normalizedHeaders: Record<string, string> = { 'content-type': 'application/json' };
      if (headers) {
        for (const [key, val] of Object.entries(headers)) {
          normalizedHeaders[key.toLowerCase()] = val;
        }
      }
      const req: any = {
        method: method.toUpperCase(),
        url,
        originalUrl: url,
        path: url.split('?')[0],
        headers: normalizedHeaders,
        body: payload || {},
        ip: '127.0.0.1',
        _readableState: {
          pipes: [],
          pipesCount: 0,
          flowing: false,
          ended: true,
          endEmitted: true,
          reading: false,
          length: 0,
        },
        on: (event: string, cb?: any) => {
          if (event === 'end' && typeof cb === 'function') {
            setTimeout(() => cb(), 0);
          }
          return req;
        },
        once: (event: string, cb?: any) => {
          if (event === 'end' && typeof cb === 'function') {
            setTimeout(() => cb(), 0);
          }
          return req;
        },
        emit: () => true,
        removeListener: () => req,
        removeAllListeners: () => req,
        addListener: () => req,
        pipe: () => req,
        unpipe: () => req,
        resume: () => req,
        pause: () => req,
      };

      const resHeaders: Record<string, any> = {};
      let statusCode = 200;
      let bodyData = '';

      const res: any = {
        statusCode: 200,
        _headers: resHeaders,
        getHeader: (name: string) => resHeaders[name.toLowerCase()],
        setHeader: (name: string, value: any) => {
          resHeaders[name.toLowerCase()] = value;
        },
        removeHeader: (name: string) => {
          delete resHeaders[name.toLowerCase()];
        },
        status: (code: number) => {
          statusCode = code;
          res.statusCode = code;
          return res;
        },
        json: (data: any) => {
          bodyData = JSON.stringify(data);
          resolve({ statusCode: res.statusCode, payload: bodyData });
        },
        send: (data: any) => {
          bodyData = typeof data === 'string' ? data : JSON.stringify(data);
          resolve({ statusCode: res.statusCode, payload: bodyData });
        },
        end: (data?: any) => {
          if (data) bodyData = typeof data === 'string' ? data : JSON.stringify(data);
          resolve({ statusCode: res.statusCode, payload: bodyData });
        },
        on: () => {},
      };

      this.app(req, res);
    });
  }

  public getAuditLogs(): AuditServerLog[] {
    return [...this.auditLogs];
  }

  public clearAuditLogs(): void {
    this.auditLogs = [];
  }

  private setupRoutes() {
    // Rate Limiting Middlewares
    const loginLimiter = RateLimiter.createMiddleware({
      windowMs: 60 * 1000,
      max: 5,
      message: 'Trop de tentatives de connexion administrateur.',
    });

    const userLimiter = RateLimiter.createMiddleware({
      windowMs: 60 * 1000,
      max: 60,
      message: 'Limite de requêtes atteinte pour l\'API de validation.',
    });

    const adminLimiter = RateLimiter.createMiddleware({
      windowMs: 60 * 1000,
      max: 30,
      message: 'Limite de requêtes d\'administration atteinte.',
    });

    // GET /api/health — System & Backend Health Check
    this.app.get('/api/health', (req: Request, res: Response) => {
      return res.json({
        status: 'ok',
        service: 'LMSE Backend API',
        timestamp: new Date().toISOString(),
        hasSuperAdmin: AdminUserRepository.getInstance().hasSuperAdmin(),
      });
    });

    // ==========================================
    // 1. ADMIN ENDPOINTS (/api/admin/*)
    // ==========================================

    // POST /api/admin/auth/login
    this.app.post('/api/admin/auth/login', loginLimiter, async (req: Request, res: Response) => {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email et mot de passe administrateur requis.' });
      }

      const repo = AdminUserRepository.getInstance();

      if (!repo.hasSuperAdmin()) {
        return res.status(400).json({
          error: 'NO_SUPER_ADMIN',
          message: 'Aucun compte Super Admin n\'a encore été initialisé. Veuillez exécuter "npm run admin:bootstrap" dans votre terminal.'
        });
      }

      const user = repo.findByEmail(email);

      if (!user || user.status !== 'active') {
        this.recordAudit({
          who: email,
          role: 'NONE',
          action: 'ADMIN_LOGIN_FAILED',
          target: '/api/admin/auth/login',
          ip: req.ip || '127.0.0.1',
          result: 'FAILED',
          details: 'Tentative de connexion avec des identifiants invalides ou un compte suspendu.',
        });
        return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Identifiants administrateur invalides.' });
      }

      const isValidPassword = PasswordCrypto.verifyPassword(password, user.passwordHash, user.passwordSalt);
      if (!isValidPassword) {
        this.recordAudit({
          who: email,
          role: user.role,
          action: 'ADMIN_LOGIN_FAILED',
          target: '/api/admin/auth/login',
          ip: req.ip || '127.0.0.1',
          result: 'FAILED',
          details: 'Mot de passe administrateur incorrect.',
        });
        return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Identifiants administrateur invalides.' });
      }

      user.lastLoginAt = new Date().toISOString();
      repo.updateAccount(user.id, { lastLoginAt: user.lastLoginAt });

      const session = AdminAuthService.createSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      this.recordAudit({
        who: user.email,
        role: user.role,
        action: 'ADMIN_LOGIN',
        target: '/api/admin/auth/login',
        ip: req.ip || '127.0.0.1',
        result: 'SUCCESS',
        details: `Authentification réussie pour le compte ${user.name} (${user.role}).`,
      });

      return res.json({
        success: true,
        session,
      });
    });

    // GET /api/admin/users — List Admin Accounts (Admin only)
    this.app.get('/api/admin/users', adminLimiter, AdminAuthService.requireAdmin(), async (req: Request, res: Response) => {
      const repo = AdminUserRepository.getInstance();
      const accounts = repo.getAllAccounts().map(({ passwordHash, passwordSalt, ...safe }) => safe);
      return res.json({ success: true, count: accounts.length, users: accounts });
    });

    // POST /api/admin/users — Create Secondary Admin (Super Admin only)
    this.app.post('/api/admin/users', adminLimiter, AdminAuthService.requireAdmin(['super_admin']), async (req: Request, res: Response) => {
      try {
        const { email, name, role, permissions, password, organizationName } = req.body;
        if (!email || !name || !role || !password) {
          return res.status(400).json({ error: 'INVALID_INPUT', message: 'Email, nom, rôle et mot de passe sont obligatoires.' });
        }

        const repo = AdminUserRepository.getInstance();
        const newAdmin = repo.createSecondaryAdmin({
          email,
          name,
          role,
          permissions: permissions || [],
          password,
          organizationName,
        });

        this.recordAudit({
          who: (req as any).adminSession.email,
          role: (req as any).adminSession.role,
          action: 'ADMIN_USER_CREATED',
          target: newAdmin.id,
          ip: req.ip || '127.0.0.1',
          result: 'SUCCESS',
          details: `Création du compte administrateur [${newAdmin.role}] pour ${newAdmin.name} (${newAdmin.email}).`,
        });

        const { passwordHash, passwordSalt, ...safeAdmin } = newAdmin;
        return res.status(201).json({ success: true, user: safeAdmin });
      } catch (err: any) {
        return res.status(400).json({ error: 'CREATION_FAILED', message: err.message });
      }
    });

    // POST /api/admin/licenses — Create and Sign License (Super Admin & Admin only)
    this.app.post('/api/admin/licenses', adminLimiter, AdminAuthService.requireAdmin(['super_admin', 'admin']), async (req: Request, res: Response) => {
      try {
        const { holderName, holderEmail, type, durationDays, maxDevices, customFeatures, metadata } = req.body || {};
        if (!holderName || typeof holderName !== 'string' || !holderName.trim()) {
          return res.status(400).json({ error: 'INVALID_INPUT', message: 'Le nom du titulaire (holderName) est obligatoire.' });
        }

        let targetType = String(type).trim().toLowerCase();
        if (targetType === 'beta_tester') targetType = 'beta';

        const validTypes = ['beta', 'commercial', 'permanent', 'temporary', 'enterprise', 'association', 'veterinary'];
        if (!validTypes.includes(targetType)) {
          return res.status(400).json({ error: 'INVALID_TYPE', message: 'Le type de licence est invalide.' });
        }

        if (durationDays !== undefined && durationDays !== null && (typeof durationDays !== 'number' || durationDays < 0)) {
          return res.status(400).json({ error: 'INVALID_DURATION', message: 'La durée de la licence doit être un nombre positif ou nul.' });
        }

        if (maxDevices !== undefined && maxDevices !== null && (typeof maxDevices !== 'number' || maxDevices <= 0)) {
          return res.status(400).json({ error: 'INVALID_DEVICE_LIMIT', message: 'Le nombre maximal d\'appareils doit être d\'au moins 1.' });
        }

        // Set process.env.VITE_APP_MODE = 'admin' for server execution context
        const oldMode = process.env.VITE_APP_MODE;
        process.env.VITE_APP_MODE = 'admin';

        const license = await LicenseGenerator.generateLicense({
          holderName: holderName.trim(),
          holderEmail: holderEmail ? String(holderEmail).trim() : undefined,
          type: targetType as any,
          durationDays,
          maxDevices,
          customFeatures,
          metadata,
        });

        process.env.VITE_APP_MODE = oldMode;

        await this.repository.saveLicense(license);

        this.recordAudit({
          who: (req as any).adminSession.email,
          role: (req as any).adminSession.role,
          action: 'LICENSE_CREATED',
          target: license.id,
          ip: req.ip || '127.0.0.1',
          result: 'SUCCESS',
          details: `Création de licence [${license.type}] pour ${license.holderName}.`,
        });

        return res.status(201).json({ success: true, license });
      } catch (err: any) {
        return res.status(500).json({ error: 'CREATION_FAILED', message: err.message });
      }
    });

    // GET /api/admin/licenses — List All Licenses (Admin only)
    this.app.get('/api/admin/licenses', adminLimiter, AdminAuthService.requireAdmin(), async (req: Request, res: Response) => {
      const licenses = await this.repository.getAllLicenses();
      return res.json({ success: true, count: licenses.length, licenses });
    });

    // POST /api/admin/licenses/:id/revoke — Revoke License (Super Admin & Admin only)
    this.app.post('/api/admin/licenses/:id/revoke', adminLimiter, AdminAuthService.requireAdmin(['super_admin', 'admin']), async (req: Request, res: Response) => {
      const { id } = req.params;
      const { reason } = req.body || {};

      const license = await this.repository.getLicenseById(id);
      if (!license) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Licence introuvable.' });
      }

      license.status = 'revoked';
      license.revokedAt = new Date().toISOString();
      license.revocationReason = reason || 'Révoquée par l\'administrateur.';

      await this.repository.saveLicense(license);
      await this.repository.addToRevocationList(license.key);
      await this.repository.addToRevocationList(license.checksum);

      this.recordAudit({
        who: (req as any).adminSession.email,
        role: (req as any).adminSession.role,
        action: 'LICENSE_REVOKED',
        target: license.id,
        ip: req.ip || '127.0.0.1',
        result: 'SUCCESS',
        details: `Révocation de licence key [${license.key}]. Motifs: ${license.revocationReason}`,
      });

      return res.json({ success: true, license });
    });

    // POST /api/admin/licenses/:id/renew — Renew License (Super Admin & Admin only)
    this.app.post('/api/admin/licenses/:id/renew', adminLimiter, AdminAuthService.requireAdmin(['super_admin', 'admin']), async (req: Request, res: Response) => {
      const { id } = req.params;
      const { additionalDays } = req.body || {};

      const license = await this.repository.getLicenseById(id);
      if (!license) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Licence introuvable.' });
      }

      const daysToAdd = additionalDays || 365;
      const currentExp = license.expiresAt ? new Date(license.expiresAt).getTime() : Date.now();
      const newExp = new Date(Math.max(currentExp, Date.now()) + daysToAdd * 24 * 60 * 60 * 1000);

      license.expiresAt = newExp.toISOString();
      license.status = 'active';

      await this.repository.saveLicense(license);

      this.recordAudit({
        who: (req as any).adminSession.email,
        role: (req as any).adminSession.role,
        action: 'LICENSE_RENEWED',
        target: license.id,
        ip: req.ip || '127.0.0.1',
        result: 'SUCCESS',
        details: `Renouvellement de licence pour ${daysToAdd} jours. Nouvelle expiration: ${license.expiresAt}`,
      });

      return res.json({ success: true, license });
    });

    // POST /api/admin/licenses/:id/replace — Replace License (Super Admin & Admin only)
    this.app.post('/api/admin/licenses/:id/replace', adminLimiter, AdminAuthService.requireAdmin(['super_admin', 'admin']), async (req: Request, res: Response) => {
      const { id } = req.params;
      const { reason, targetTier, durationDays } = req.body || {};

      const oldLic = await this.repository.getLicenseById(id);
      if (!oldLic) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Licence introuvable.' });
      }

      if (!LicenseLifecycleEngine.canTransition(oldLic.status, 'replaced')) {
        return res.status(400).json({
          error: 'ILLEGAL_TRANSITION',
          message: `Impossible de remplacer une licence avec le statut "${oldLic.status}".`,
        });
      }

      const oldMode = process.env.VITE_APP_MODE;
      process.env.VITE_APP_MODE = 'admin';

      try {
        const newLic = await LicenseGenerator.generateLicense({
          holderName: oldLic.holderName,
          holderEmail: oldLic.holderEmail,
          type: oldLic.type,
          durationDays: durationDays !== undefined ? durationDays : (oldLic.expiresAt ? 365 : null),
          maxDevices: oldLic.policy?.maxDevices || 1,
          customFeatures: oldLic.policy?.features || [],
          metadata: {
            ...oldLic.metadata,
            replacedLicenseId: oldLic.id,
            targetTier: targetTier || 'PRO',
          },
        });

        const { activeLicense, archivedLicense } = LicenseLifecycleEngine.replace(
          oldLic,
          newLic,
          reason || 'Remplacement administratif'
        );

        process.env.VITE_APP_MODE = oldMode;

        await this.repository.saveLicense(archivedLicense);
        await this.repository.saveLicense(activeLicense);

        this.recordAudit({
          who: (req as any).adminSession.email,
          role: (req as any).adminSession.role,
          action: 'LICENSE_REPLACED',
          target: activeLicense.id,
          ip: req.ip || '127.0.0.1',
          result: 'SUCCESS',
          details: `Remplacement de la licence ${oldLic.id} par ${activeLicense.id}. Raison: ${reason || 'Remplacement administratif'}`,
        });

        return res.json({ success: true, activeLicense, archivedLicense });
      } catch (err: any) {
        process.env.VITE_APP_MODE = oldMode;
        return res.status(500).json({ error: 'REPLACEMENT_FAILED', message: err.message });
      }
    });

    // GET /api/admin/audit — Retrieve Audit Logs (Admin only)
    this.app.get('/api/admin/audit', adminLimiter, AdminAuthService.requireAdmin(), async (req: Request, res: Response) => {
      return res.json({ success: true, auditLogs: this.getAuditLogs() });
    });

    // GET /api/admin/stats — Retrieve Stats (Admin only)
    this.app.get('/api/admin/stats', adminLimiter, AdminAuthService.requireAdmin(), async (req: Request, res: Response) => {
      const stats = await LicenseAuditEngine.generateStats(this.repository);
      return res.json({ success: true, stats });
    });

    // ==========================================
    // 2. USER ENDPOINTS (/api/license/*)
    // ==========================================

    // POST /api/license/validate — Online Validation & Device Activation
    this.app.post('/api/license/validate', userLimiter, async (req: Request, res: Response) => {
      const { licenseKey, device, holderName } = req.body || {};

      if (!licenseKey || typeof licenseKey !== 'string') {
        return res.status(400).json({ isValid: false, code: 'MISSING_KEY', message: 'Clé de licence absente.' });
      }

      const cleanKey = licenseKey.trim().toUpperCase();
      const license = await this.repository.getLicenseByKey(cleanKey);

      if (!license) {
        return res.status(404).json({
          isValid: false,
          status: 'pending_activation',
          license: null,
          code: 'KEY_NOT_FOUND',
          message: 'Clé de licence introuvable.',
          remainingDays: null,
          deviceRegistered: false,
        });
      }

      const currentDevice = device || { deviceId: 'unknown_device', platform: 'web' };
      const isAlreadyBound = license.activations?.some(a => a.fingerprint?.deviceId === currentDevice.deviceId);

      // If key is not bound to this device yet and is eligible for activation, bind device on server
      if (!isAlreadyBound && (license.status === 'pending_activation' || license.status === 'trial' || license.status === 'active')) {
        const activationResult = await ActivationEngine.activateKey(
          this.repository,
          cleanKey,
          holderName || license.holderName,
          currentDevice
        );
        return res.json(activationResult);
      }

      const revocationList = await this.repository.getRevocationList();
      const validation = await LicenseValidator.validateLicense(
        license,
        currentDevice,
        revocationList
      );

      return res.json(validation);
    });

    // GET /api/license/status — Public License Status Check
    this.app.get('/api/license/status', userLimiter, async (req: Request, res: Response) => {
      const active = await this.repository.getActiveLicense();
      if (!active) {
        return res.json({ isValid: false, status: 'none', message: 'Aucune licence enregistrée.' });
      }
      return res.json({
        isValid: active.status === 'active' || active.status === 'trial',
        type: active.type,
        holderName: active.holderName,
        expiresAt: active.expiresAt,
      });
    });

    // POST /api/commercial/checkout — Authority-Signed Commercial License Issuance
    this.app.post('/api/commercial/checkout', userLimiter, async (req: Request, res: Response) => {
      try {
        const { offerId, customerName, customerEmail, country, tier, maxDevices, durationDays, features } = req.body || {};
        if (!customerName || typeof customerName !== 'string' || !customerName.trim() || !offerId) {
          return res.status(400).json({ error: 'INVALID_INPUT', message: 'Nom du client et identifiant de l\'offre obligatoires.' });
        }

        const oldMode = process.env.VITE_APP_MODE;
        process.env.VITE_APP_MODE = 'admin';

        const licenseType: LicenseType = tier === 'PRO' ? 'enterprise' : (tier === 'FREE' ? 'temporary' : 'commercial');
        const tierTag = tier ? `tier:${tier.toLowerCase()}` : 'tier:premium';
        const customFeatures = Array.from(new Set([...(features || []), tierTag]));
        const license = await LicenseGenerator.generateLicense({
          holderName: String(customerName).trim(),
          holderEmail: customerEmail ? String(customerEmail).trim() : undefined,
          type: licenseType,
          durationDays: durationDays !== undefined ? durationDays : (tier === 'PRO' ? 365 : 365),
          maxDevices: maxDevices || 1,
          customFeatures,
          metadata: {
            isCommercialWeb: true,
            offerId,
            country: country || 'FR',
            commercialTier: tier || 'PREMIUM',
          },
        });

        // Set status to active for purchased commercial license
        license.status = 'active';

        process.env.VITE_APP_MODE = oldMode;

        await this.repository.saveLicense(license);

        this.recordAudit({
          who: customerEmail || customerName,
          role: 'COMMERCIAL_CHECKOUT',
          action: 'COMMERCIAL_LICENSE_ISSUED',
          target: license.id,
          ip: (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1',
          result: 'SUCCESS',
          details: `Délivrance officielle de licence commerciale signée pour ${customerName} (Offre: ${offerId}).`,
        });

        return res.status(201).json({ success: true, license });
      } catch (err: any) {
        return res.status(500).json({ error: 'ISSUANCE_FAILED', message: err.message });
      }
    });

    // ==========================================
    // 2b. COMMERCIAL ORDERS & SANDBOX PAYMENT GATEWAY
    // ==========================================

    // POST /api/commercial/orders/checkout — Initialize Sandbox Checkout Session
    this.app.post('/api/commercial/orders/checkout', userLimiter, async (req: Request, res: Response) => {
      try {
        const checkoutData = await this.commercialPaymentService.createCheckout(req.body || {});
        return res.status(201).json({ success: true, ...checkoutData });
      } catch (err: any) {
        const status = err.message.includes('NOT_FOUND') ? 404 : 400;
        return res.status(status).json({ error: 'CHECKOUT_FAILED', message: err.message });
      }
    });

    // POST /api/commercial/orders/:orderId/verify — Server-side Payment Verification
    this.app.post('/api/commercial/orders/:orderId/verify', userLimiter, async (req: Request, res: Response) => {
      try {
        const { orderId } = req.params;
        const { paymentId } = req.body || {};
        const order = this.commercialPaymentService.getOrder(orderId);
        if (!order) {
          return res.status(404).json({ error: 'NOT_FOUND', message: `Commande ${orderId} introuvable.` });
        }

        if (order.status === 'PAYMENT_PENDING') {
          order.status = 'PAID';
          order.paymentId = paymentId || `pay_verified_${Date.now()}`;
          order.paidAt = new Date().toISOString();
          await this.commercialPaymentService.fulfillOrderWithLicense(order);
        }

        return res.json({ success: true, order });
      } catch (err: any) {
        return res.status(400).json({ error: 'VERIFICATION_FAILED', message: err.message });
      }
    });

    // POST /api/commercial/webhooks/payment — Cryptographically Signed Sandbox Webhook
    this.app.post('/api/commercial/webhooks/payment', async (req: Request, res: Response) => {
      try {
        const signature = (req.headers['x-payment-signature'] as string) || (req.headers['stripe-signature'] as string) || '';
        const result = await this.commercialPaymentService.handleWebhook(req.body, signature);

        this.recordAudit({
          who: req.body?.customerEmail || 'PAYMENT_GATEWAY',
          role: 'WEBHOOK_PROCESSOR',
          action: 'PAYMENT_WEBHOOK_PROCESSED',
          target: req.body?.orderId || 'UNKNOWN',
          ip: (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1',
          result: 'SUCCESS',
          details: `Webhook validé pour commande ${req.body?.orderId} (Idempotent: ${result.idempotentReplay ? 'OUI' : 'NON'}).`,
        });

        return res.json({ ...result });
      } catch (err: any) {
        const status = err.message.includes('SIGNATURE') ? 401 : 400;
        return res.status(status).json({ error: 'WEBHOOK_FAILED', message: err.message });
      }
    });

    // GET /api/commercial/orders/:orderId — Query Order Status
    this.app.get('/api/commercial/orders/:orderId', userLimiter, (req: Request, res: Response) => {
      const order = this.commercialPaymentService.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Commande introuvable.' });
      }
      return res.json({ success: true, order });
    });

    // GET /api/commercial/orders/:orderId/delivery — Retrieve Delivery Package
    this.app.get('/api/commercial/orders/:orderId/delivery', userLimiter, (req: Request, res: Response) => {
      const order = this.commercialPaymentService.getOrder(req.params.orderId);
      if (!order) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Commande introuvable.' });
      }
      if (!order.deliveryPackage) {
        return res.status(404).json({ error: 'DELIVERY_NOT_READY', message: 'Kit de livraison non disponible ou paiement en attente.' });
      }
      return res.json({ success: true, deliveryPackage: order.deliveryPackage });
    });

    // POST /api/commercial/orders/:orderId/cancel — Cancel Order before payment
    this.app.post('/api/commercial/orders/:orderId/cancel', userLimiter, (req: Request, res: Response) => {
      try {
        const order = this.commercialPaymentService.cancelOrder(req.params.orderId, req.body?.reason);
        return res.json({ success: true, order });
      } catch (err: any) {
        return res.status(400).json({ error: 'CANCELLATION_FAILED', message: err.message });
      }
    });

    // POST /api/commercial/orders/:orderId/refund — Refund Order & Revoke License
    this.app.post('/api/commercial/orders/:orderId/refund', userLimiter, async (req: Request, res: Response) => {
      try {
        const order = await this.commercialPaymentService.refundOrder(req.params.orderId, req.body?.reason);

        this.recordAudit({
          who: order.customerEmail || 'ADMIN',
          role: 'COMMERCIAL_REFUND',
          action: 'ORDER_REFUNDED',
          target: order.orderId,
          ip: (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1',
          result: 'SUCCESS',
          details: `Remboursement de la commande ${order.orderId} et révocation de la licence associée.`,
        });

        return res.json({ success: true, order });
      } catch (err: any) {
        return res.status(400).json({ error: 'REFUND_FAILED', message: err.message });
      }
    });

    // POST /api/commercial/orders/:orderId/retry-delivery — Retry Failed Delivery
    this.app.post('/api/commercial/orders/:orderId/retry-delivery', userLimiter, async (req: Request, res: Response) => {
      try {
        const order = await this.commercialPaymentService.retryDelivery(req.params.orderId);
        return res.json({ success: true, order });
      } catch (err: any) {
        return res.status(400).json({ error: 'RETRY_FAILED', message: err.message });
      }
    });

    // ==========================================
    // 3. OFFICIAL DOWNLOAD ARTIFACTS (/downloads/*)
    // ==========================================
    const fileHashCache = new Map<string, { mtimeMs: number; size: number; sha256: string }>();

    this.app.get('/downloads/:filename', async (req: Request, res: Response) => {
      const rawParam = req.params.filename || '';
      const filename = path.basename(decodeURIComponent(rawParam));
      if (!filename || filename === '.' || filename === '..') {
        return res.status(400).json({ error: 'BAD_REQUEST', message: 'Nom de fichier invalide.' });
      }

      const rootDir = process.cwd();

      // Table stricte des artefacts officiels validés pour RC6 (avec SHA-256 et taille attendus)
      const RC6_DOWNLOAD_REGISTRY: Record<string, {
        expectedSha256: string;
        expectedSize: number;
        candidatePaths: string[];
      }> = {
        'Bird-Academy-User-Windows-Setup.exe': {
          expectedSha256: '746F6D99CF91802686D21A2F7632945730B96F2225B756AD2BF27B27B815754B',
          expectedSize: 112731374,
          candidatePaths: [
            path.join(rootDir, 'dist_binaries', 'Bird-Academy-User-Windows-Setup.exe'),
            path.join(rootDir, 'release', 'Bird-Academy-Avian-ERP-Setup.exe'),
            path.join(rootDir, 'Release', 'Bird-Academy-Avian-ERP-Setup.exe'),
            path.join(rootDir, 'public', 'downloads', 'Bird-Academy-User-Windows-Setup.exe'),
          ],
        },
        'Bird-Academy-User.exe': {
          expectedSha256: 'EDDD283D2A212B7A0155B32FC8CA7B188E28C3ED0874C509DDE395DAAD37E1BE',
          expectedSize: 111233160,
          candidatePaths: [
            path.join(rootDir, 'dist_binaries', 'Bird-Academy-User.exe'),
            path.join(rootDir, 'release', 'Bird-Academy-User.exe'),
            path.join(rootDir, 'Release', 'Bird-Academy-User.exe'),
            path.join(rootDir, 'public', 'downloads', 'Bird-Academy-User.exe'),
          ],
        },
        'Bird-Academy-User.apk': {
          expectedSha256: '061CF531C7DE55465C093874ABF9C649CA3830659EFDE1443E2F8C911E4717DB',
          expectedSize: 12043947,
          candidatePaths: [
            path.join(rootDir, 'dist_binaries', 'Bird-Academy-User.apk'),
            path.join(rootDir, 'Bird-Academy-User.apk'),
            path.join(rootDir, 'release', 'Bird-Academy-User.apk'),
            path.join(rootDir, 'public', 'downloads', 'Bird-Academy-User.apk'),
          ],
        },
        'LMSE_OWNER_GUIDE.pdf': {
          expectedSha256: '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618',
          expectedSize: 428378,
          candidatePaths: [
            path.join(rootDir, 'public', 'downloads', 'LMSE_OWNER_GUIDE.pdf'),
            path.join(rootDir, 'dist_binaries', 'LMSE_OWNER_GUIDE.pdf'),
            path.join(rootDir, 'LMSE_OWNER_GUIDE.pdf'),
          ],
        },
      };

      // Support des documents Markdown & PDF officiels du Kit Testeur
      if (filename.endsWith('.md') || filename.endsWith('.pdf')) {
        const docCandidates = [
          path.join(rootDir, 'public', 'downloads', filename),
          path.join(rootDir, 'dist', 'downloads', filename),
          path.join(rootDir, filename),
        ];
        for (const cand of docCandidates) {
          if (fs.existsSync(cand) && fs.statSync(cand).isFile()) {
            const stat = fs.statSync(cand);
            const contentType = filename.endsWith('.pdf') 
              ? 'application/pdf' 
              : 'text/markdown; charset=utf-8';
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Cache-Control', 'public, max-age=3600');
            return fs.createReadStream(cand).pipe(res);
          }
        }
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Document introuvable.' });
      }

      const artifactConfig = RC6_DOWNLOAD_REGISTRY[filename];
      if (!artifactConfig) {
        return res.status(404).json({ error: 'NOT_FOUND', message: 'Artefact introuvable.' });
      }

      let targetPath: string | null = null;
      for (const cand of artifactConfig.candidatePaths) {
        if (!fs.existsSync(cand)) continue;
        try {
          const stat = fs.statSync(cand);
          if (!stat.isFile() || stat.size !== artifactConfig.expectedSize) continue;

          // Vérification d'intégrité cryptographique SHA-256 avec cache mtime
          const cached = fileHashCache.get(cand);
          let computedSha256: string;
          if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) {
            computedSha256 = cached.sha256;
          } else {
            computedSha256 = await new Promise<string>((resolve, reject) => {
              const hash = crypto.createHash('sha256');
              const stream = fs.createReadStream(cand);
              stream.on('data', (chunk) => hash.update(chunk));
              stream.on('end', () => resolve(hash.digest('hex').toUpperCase()));
              stream.on('error', reject);
            });
            fileHashCache.set(cand, {
              mtimeMs: stat.mtimeMs,
              size: stat.size,
              sha256: computedSha256,
            });
          }

          if (computedSha256 === artifactConfig.expectedSha256) {
            targetPath = cand;
            break;
          } else {
            console.error(`[LMSE_DOWNLOAD_SECURITY] Hash mismatch for candidate of ${filename}. Expected: ${artifactConfig.expectedSha256}, got: ${computedSha256}`);
          }
        } catch (err: any) {
          console.error(`[LMSE_DOWNLOAD_SECURITY] Verification error on ${cand}:`, err.message);
        }
      }

      if (!targetPath) {
        // En environnement cloud distant (Render) où les gros binaires compilés (.exe/.apk) ne sont pas stockés dans Git,
        // redirection sécurisée vers la release GitHub officielle
        if (filename.endsWith('.exe') || filename.endsWith('.apk')) {
          const githubAssetUrl = `https://github.com/medaymenkanzari-droid/Bird-Academy/releases/download/v1.3.6/${filename}`;
          return res.redirect(302, githubAssetUrl);
        }
        console.error(`[LMSE_DOWNLOAD_SECURITY] Integrity verification failed for ${filename}: No valid RC6 candidate found matching official SHA-256.`);
        // Message propre sans fuite d'informations internes (chemins système, stack trace)
        return res.status(500).json({ error: 'INTEGRITY_CHECK_FAILED', message: "Échec de vérification d'intégrité de l'artefact." });
      }

      const stat = fs.statSync(targetPath);
      let contentType = 'application/octet-stream';
      if (filename.endsWith('.exe')) contentType = 'application/vnd.microsoft.portable-executable';
      else if (filename.endsWith('.apk')) contentType = 'application/vnd.android.package-archive';
      else if (filename.endsWith('.pdf')) contentType = 'application/pdf';
      else if (filename.endsWith('.zip')) contentType = 'application/zip';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('ETag', `"${artifactConfig.expectedSha256}"`);

      const stream = fs.createReadStream(targetPath);
      stream.pipe(res);
    });
  }
}
