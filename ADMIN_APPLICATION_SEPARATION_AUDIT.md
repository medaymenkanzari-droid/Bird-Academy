# AUDIT D'ARCHITECTURE — SÉPARATION TOTALE DES APPLICATIONS
**Bird Academy Enterprise — Release Candidate 2.5 (RC2.5)**

---

## 1. ÉTAT ACTUEL DU PROJET

L'application **Bird Academy** se trouve dans un dépôt de code unique (*monorepo*).

Lors de la sous-étape précédente (durcissement RC2.5), nous avons mis en place :
1. Un garde d'environnement (`VITE_APP_MODE=user` vs `VITE_APP_MODE=admin` dans `src/config/appMode.ts`).
2. La sécurisation de `CryptoService.ts` et `LicenseGenerator.ts` pour empêcher la signature de clés côté client utilisateur.
3. Un serveur API Backend Express (`src/server/lmseServer.ts`) gérant l'authentification des administrateurs, les jetons de session, le rate limiting et la signature de licences.
4. L'interception des onglets administrateur dans `src/App.tsx`.

Cependant, sur le plan structurel du code :
- **Le Centre d'Administration est toujours hébergé comme un module interne (`src/features/administration/*`) au sein du même projet React que l'application utilisateur.**
- Les composants frontend utilisateur et administrateur partagent le même fichier principal d'entrée Vite (`index.html` et `src/App.tsx`).

---

## 2. CE QUI EST DÉJÀ SÉPARÉ ET SÉCURISÉ

1. **Isolation des Clés de Signature Cryptographique (Moteur LMSE)** :
   - La clé secrète de signature (`LMSE_PRIVATE_SIGNING_KEY`) n'est plus hardcodée dans le bundle frontend client.
   - Toute tentative d'appel à `CryptoService.generateSignature()` ou `LicenseGenerator.generateLicense()` dans le build utilisateur lève immédiatement une exception de sécurité `SECURITY_ERROR`.

2. **Serveur Backend d'Administration Indépendant** :
   - Le serveur Express (`src/server/lmseServer.ts`) constitue l'autorité centrale de création et de signature des licences.
   - Les endpoints administrateurs (`/api/admin/*`) requièrent obligatoirement un jeton d'authentification Bearer valide et vérifient le rôle RBAC (`super_admin`, `admin`, `support`, `auditor`).

3. **Protection contre la Falsification de Rôle** :
   - Les modifications manuelles de `localStorage` ou `IndexedDB` ne permettent pas d'accéder au code d'administration dans un build utilisateur (`VITE_APP_MODE=user`).

4. **Fonctionnement Hybride Online / Offline** :
   - L'application utilisateur peut vérifier la signature, l'expiration et les empreintes d'appareil en mode 100% hors ligne via son moteur local autonome `LicenseValidator`.

---

## 3. CE QUI N'EST PAS ENCORE TOTALEMENT SÉPARÉ (DÉCISION DU PROPRIÉTAIRE)

Suivant la décision de cadrage du propriétaire : **Bird Academy (Utilisateur)** et **Bird Academy Admin** doivent être deux applications web/bureau/mobiles physiquement et techniquement distinctes.

Actuellement :
1. **Point d'Entrée Unique** : `src/App.tsx` contient les routes et les composants d'import lazy-load des deux mondes (`AdminCenterView`, `LicensingAdminPage`, `PlatformDashboard`, `QADashboard`).
2. **Bundle & Compilation** : Même si les onglets sont masqués et gardés en build utilisateur, les fichiers source du Centre d'Administration résident toujours dans l'arborescence `src/features/administration/`.
3. **Distribution aux Bêta-testeurs** : Pour garantir une séparation absolue (aucune ligne de code admin dans les APK/EXE/PWA distribués aux bêta-testeurs), il convient d'isoler l'application d'administration dans son propre point d'entrée ou projet autonome.

---

## 4. RISQUES ACTUELS EN CAS DE STATU QUO

- **Risque d'Exposition Reverse Engineering** : Un attaquant très expérimenté décompilant un APK/EXE unique pourrait analyser le code React mort du Centre d'Administration si celui-ci est bundlé.
- **Risque de Confusion Opérationnelle** : Mélanger la logique métier de gestion des volières (éleveurs) et la console de supervision Enterprise (administrateurs) au sein du même point d'entrée frontend.

---

## 5. FICHIERS CONCERNÉS PAR LA SÉPARATION

### A — Application 1 : Bird Academy Utilisateur (Volière Manager)
*Destinée uniquement aux éleveurs, vétérinaires, associations et bêta-testeurs.*

- `src/App.tsx` (Application principale utilisateur)
- `src/components/*` (Dashboard, Canaris, Reproduction, Santé, Alimentation, Calendrier, Dépenses, Ventes, Paramètres)
- `src/features/birds/*`, `src/features/breeding/*`, `src/features/habitat/*`, `src/features/health/*`, `src/features/hand-feeding/*`, `src/features/finance/*`, `src/features/genetics/*`, `src/features/intelligence/*`, `src/features/analytics/*`, `src/features/quality/*`
- `src/features/licensing/components/LicenseActivationModal.tsx` & `LicenseStatusBadge.tsx`
- `src/features/licensing/engines/LicenseValidator.ts`, `LicenseEngine.ts`, `ActivationEngine.ts`, `DeviceFingerprintEngine.ts`, `IntegrityVerificationEngine.ts`, `ExpirationEngine.ts`

### B — Application 2 : Bird Academy Admin (Back-Office Enterprise)
*Destinée exclusivement aux administrateurs autorisés (SuperAdmin, Admin, Support, Auditeur).*

- `src/AdminApp.tsx` ou projet autonome `admin/` (Futur point d'entrée unique Admin)
- `src/features/administration/*` (`AdminCenterView.tsx`, `AdminUserDirectory.tsx`, `AdminOrganizations.tsx`, `AdminLmseCenter.tsx`, `AdminExecutiveDashboard.tsx`, `AdminBiologicalRegistry.tsx`, `AdminSecurityQa.tsx`, `AdminSupportReporting.tsx`, `AdminGlobalSettings.tsx`, `AdminUserStore.ts`, `AdminOrgStore.ts`, `AdminAuditService.ts`, `SupportTicketStore.ts`)
- `src/features/licensing/pages/LicensingAdminPage.tsx`
- `src/features/licensing/components/LicenseAdminCenter.tsx`, `LicenseCreationModal.tsx`, `RevocationModal.tsx`

### C — Autorité Centrate LMSE Backend (Serveur API)
*Autorité distante sécurisée.*

- `src/server/lmseServer.ts` (API Backend Express)
- `src/server/middleware/adminAuth.ts` (Session & RBAC)
- `src/server/middleware/rateLimiter.ts` (Protection Rate Limiting & Brute Force)
- `src/features/licensing/services/CryptoService.ts` (Moteur de hachage et de signature serveur)
- `src/features/licensing/engines/LicenseGenerator.ts` (Générateur de licences d'administration)

---

## 6. ARCHITECTURE CIBLE

```
                                  ┌──────────────────────────────────────────────┐
                                  │            AUTORITÉ CENTRALE LMSE            │
                                  │             LMSE BACKEND SERVER              │
                                  │        (Génération, Signature, Clé)          │
                                  └──────────────────────┬───────────────────────┘
                                                         │
                                   ┌─────────────────────┴─────────────────────┐
                                   ▼                                           ▼
                   ┌───────────────────────────────┐           ┌───────────────────────────────┐
                   │    APPLICATION 1 — USER APP   │           │    APPLICATION 2 — ADMIN APP  │
                   │         (Bird Academy)        │           │     (Bird Academy Admin)      │
                   ├───────────────────────────────┤           ├───────────────────────────────┤
                   │ • Volière & Élevage           │           │ • Back-Office Enterprise      │
                   │ • Canaris, Reproduction, Santé│           │ • Connexion Administrateur    │
                   │ • Moteur Validation LMSE      │           │ • Génération de Licences      │
                   │ • Mode 100% Offline autonome  │           │ • Révocation & Renouvellement │
                   │ • Verification Clé Publique   │           │ • Gestion Appareils & Audit   │
                   └───────────────────────────────┘           └───────────────────────────────┘
```

---

## 7. PLAN DE SÉPARATION TECHNIQUE

1. **Création de deux points d'entrée HTML & App distincts** :
   - `index.html` + `src/App.tsx` -> **Bird Academy Utilisateur** (Exclusion totale des imports admin).
   - `admin.html` + `src/AdminApp.tsx` -> **Bird Academy Admin** (Application privée dédiée aux administrateurs).
2. **Profils de Build Vite Distincts** :
   - `npm run build:user` produit l'application Volière Manager sans aucun composant admin bundlé.
   - `npm run build:admin` produit la console Back-Office d'administration.

---

## 8. PLAN DE SYNCHRONISATION LMSE

1. **Bird Academy Utilisateur** interroge l'API distante (`/api/license/validate`) s'il y a du réseau. S'il n'y a pas de réseau, elle valide la licence localement de manière autonome.
2. **Bird Academy Admin** s'authentifie sur le backend LMSE (`/api/admin/auth/login`) et utilise les endpoints d'administration pour créer, révoquer et renouveler les licences.

---

## 9. PLAN D'AUTHENTIFICATION ADMIN & SÉCURITÉ

- Authentification par identifiants (Email + Mot de Passe) + Jeton de session (Bearer JWT/Session token).
- Contrôle strict des rôles administratifs (`super_admin`, `admin`, `support`, `auditor`).
- Enregistrement des logs d'audit serveur pour chaque connexion et chaque action administrative.
- Préparation de l'intégration MFA/TOTP.

---

## 10. PLAN DE TESTS AUTOMATISÉS

Exécution des deux suites de tests dédiées :
1. `npm run test:lmse-admin-isolation` (16 tests de validation d'isolation stricte des rôles et fonctionnalités).
2. `npm run test:lmse-backend` (24 tests validant le serveur API backend, la signature, la révocation, le rate limiting, le hors-ligne et la non-régression).

---

STATUS:
AUDIT COMPLETED — WAITING FOR OWNER APPROVAL
