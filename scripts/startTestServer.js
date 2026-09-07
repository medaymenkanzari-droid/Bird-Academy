/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PUBLIC TEST ENVIRONMENT SERVER
 * Unified Node.js / Express server for public test deployment:
 * 1. Serves the compiled User & Commercial Website Single Page Application (dist/)
 * 2. Mounts the LMSE Public Test Backend API (/api/commercial/*, /api/license/*, /api/health)
 * 3. Keeps Admin endpoints (/api/admin/*) strictly guarded by AdminAuthService
 * 4. Ensures zero secret leakage to the browser and offline-first compliance
 */

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { LmseBackendServer } from '../src/server/lmseServer.ts';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';
const ENVIRONMENT = process.env.ENVIRONMENT || 'TEST';

// Determine static build folder (dist/ or dist_user/)
let distPath = path.resolve(process.cwd(), 'dist');
if (!fs.existsSync(distPath) || !fs.existsSync(path.join(distPath, 'index.html'))) {
  distPath = path.resolve(process.cwd(), 'dist_user');
}

if (!fs.existsSync(distPath) || !fs.existsSync(path.join(distPath, 'index.html'))) {
  console.warn(`[TEST SERVER WARNING] Dossier dist/ ou dist_user/ introuvable. Exécutez "npm run build" d'abord.`);
}

const lmseBackend = new LmseBackendServer();

// Enable reverse proxy trust (Render.com, Cloudflare, load balancers)
lmseBackend.app.set('trust proxy', 1);

// Security Headers Middleware
lmseBackend.app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Environment-Mode', ENVIRONMENT);
  next();
});

// Serve static assets from compiled production build
if (fs.existsSync(distPath)) {
  lmseBackend.app.use(express.static(distPath, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }));
}

// Fallback for SPA routing to index.html for non-API and non-downloads routes
lmseBackend.app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/downloads/')) {
    return next();
  }
  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  res.status(404).send('Bird Academy Application Build Missing');
});

const server = lmseBackend.app.listen(PORT, HOST, () => {
  console.log('\n=============================================================');
  console.log('  BIRD ACADEMY ENTERPRISE — PUBLIC TEST ENVIRONMENT SERVER   ');
  console.log('=============================================================');
  console.log(`  Environnement         : ${ENVIRONMENT} (TEST PUBLIC GRATUIT)`);
  console.log(`  URL d'écoute          : http://${HOST}:${PORT}/`);
  console.log(`  Dossier statique      : ${path.relative(process.cwd(), distPath)}/`);
  console.log(`  Backend LMSE TEST     : OPERATIONNEL (/api/commercial/*, /api/license/*)`);
  console.log(`  Protection Admin      : ACTIF (Endpoints /api/admin/* verrouillés)`);
  console.log(`  Paiement Commercial   : SIMULATION TEST (Zero transaction réelle)`);
  console.log(`  Données d'élevage     : 100% LOCALES (Offline-First)`);
  console.log('=============================================================\n');
});

// Graceful shutdown
const handleShutdown = () => {
  console.log('\n[TEST SERVER] Arrêt propre du serveur public test...');
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

export { server, lmseBackend };
