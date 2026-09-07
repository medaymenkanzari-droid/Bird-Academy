# JOURNAL DES MODIFICATIONS (CHANGELOG)
**Bird Academy Enterprise — Release Candidate 2.5 (RC2.5)**

---

## [RC2.5] - 2026-08-07

### 🚀 Séparation Physique des Applications
- **Création de Bird Academy Admin (`admin.html`, `src/adminMain.tsx`, `src/AdminApp.tsx`)** : Console d'administration autonome avec écran de connexion sécurisé, gestion des rôles administratifs, génération et suivi des licences LMSE.
- **Purger l'Application Utilisateur (`src/App.tsx`)** : Suppression intégrale de tous les imports lazy et composants administratifs (`AdminCenterView`, `LicensingAdminPage`, etc.) et retrait des onglets d'administration du menu utilisateur.
- **Configuration Multi-Entry Vite (`vite.config.ts`, `scripts/buildApp.js`)** : Mise en place des scripts de compilation indépendants `npm run build:user` (output `dist_user/`) et `npm run build:admin` (output `dist_admin/`).

### 🛡️ Durcissement Sécurité & Moteur LMSE Backend
- **Express Backend API (`src/server/lmseServer.ts`)** : Serveur d'administration gérant les sessions, le hachage cryptographique et les endpoints sécurisés.
- **Moteur d'Authentification & RBAC (`src/server/middleware/adminAuth.ts`)** : Validation des sessions administrateurs et rejet des rôles non autorisés.
- **Protection Brute Force & Rate Limiting (`src/server/middleware/rateLimiter.ts`)** : Interception automatique après franchissement des seuils de sécurité.
- **Strict User Build Safeguard (`src/features/licensing/services/CryptoService.ts`)** : Levée d'exception `SECURITY_ERROR` si tentative d'accès à la clé privée depuis l'application utilisateur.

### 🧪 Qualité & Tests Automatisés
- **17 Tests d'Isolation d'Administration (`tests/lmse-admin-isolation.test.ts`)** : Validation de l'étanchéité des rôles, de l'absence d'imports admin dans `App.tsx` et du comportement hors ligne.
- **24 Tests Backend LMSE (`tests/lmse-backend.test.ts`)** : Test du cycle de vie complet des licences, validation online/offline, expiration, révocation, renouvellement et multilingue.
- **244/244 Tests Passing** : Aucune régression sur le cœur métier d'élevage d'oiseaux.

---

STATUS:
CHANGELOG UPDATED — RELEASE CANDIDATE 2.5 READY
