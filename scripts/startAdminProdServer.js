/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ADMIN — SERVEUR LOCAL DE PRODUCTION
 * Serveur HTTP autonome servant exclusivement l'application d'administration
 * compilée (dist_admin/) et l'API Backend LMSE.
 */

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { LmseBackendServer } from '../src/server/lmseServer.ts';
import { AdminUserRepository } from '../src/server/repositories/AdminUserRepository.ts';

const PORT = parseInt(process.env.PORT || '3001', 10);
const distAdminPath = path.resolve(process.cwd(), 'dist_admin');

if (!fs.existsSync(distAdminPath) || !fs.existsSync(path.join(distAdminPath, 'admin.html'))) {
  console.error(`[ADMIN PROD SERVER ERROR] Le dossier dist_admin/ est introuvable. Exécutez "npm run build:admin" d'abord.`);
  process.exit(1);
}

const lmseBackend = new LmseBackendServer();

// Serve static assets from dist_admin
lmseBackend.app.use(express.static(distAdminPath));

// Fallback for SPA routing to admin.html for non-API and non-downloads routes
lmseBackend.app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/downloads/')) {
    return next();
  }
  res.sendFile(path.join(distAdminPath, 'admin.html'));
});

const repo = AdminUserRepository.getInstance();
const hasSuperAdmin = repo.hasSuperAdmin();
const accounts = repo.getAllAccounts();
const superAdmin = accounts.find(a => a.role === 'super_admin');

const server = lmseBackend.app.listen(PORT, '0.0.0.0', () => {
  console.log('\n=============================================================');
  console.log('  BIRD ACADEMY ADMIN — SERVEUR DE PRODUCTION LOCAL LMSE ');
  console.log('=============================================================');
  console.log(`  URL du Centre Admin  : http://localhost:${PORT}/`);
  console.log(`  Port utilisé         : ${PORT}`);
  console.log(`  Dossier servi        : dist_admin/ (Exclusif Admin)`);
  console.log(`  État du backend LMSE : OPERATIONNEL (Endpoints REST /api/admin/* & /api/license/*)`);
  console.log(`  État Authentification: ${hasSuperAdmin ? 'ACTIF (Super Admin présent)' : 'INITIALISATION REQUISE'}`);
  if (superAdmin) {
    console.log(`  Compte Super Admin   : ${superAdmin.email} (${superAdmin.name})`);
    console.log(`  Statut du Compte     : ${superAdmin.status.toUpperCase()}`);
  } else {
    console.log(`  Procédure de création : npm run admin:bootstrap`);
  }
  console.log('=============================================================\n');
});

// Handle graceful shutdown signals
process.on('SIGINT', () => {
  console.log('\n[ADMIN PROD SERVER] Arrêt du serveur...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});
