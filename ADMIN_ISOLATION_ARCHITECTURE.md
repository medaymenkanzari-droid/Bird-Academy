# Architecture de Sécurité et Séparation Admin (RC2.5)

---

## 1. Vue d'Ensemble de l'Architecture Séparée

L'application Bird Academy Enterprise est désormais scindée en deux environnements d'exécution strictement distincts :

```
                               ┌──────────────────────────────────────────────┐
                               │           ENVIRONMENT CONFIGURATION          │
                               │             (VITE_APP_MODE env)              │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                   ┌──────────────────┴──────────────────┐
                                   ▼                                     ▼
                   ┌───────────────────────────────┐     ┌───────────────────────────────┐
                   │    USER APP (VITE_APP_MODE)    │     │   ADMIN CENTER (VITE_APP_MODE) │
                   │            = user             │     │            = admin            │
                   └───────────────┬───────────────┘     └───────────────┬───────────────┘
                                   │                                     │
           ┌───────────────────────┴───────────────┐     ┌───────────────┴───────────────────────┐
           ▼                                       ▼     ▼                                       ▼
 ┌───────────────────┐                  ┌────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
 │ Modules Elevage   │                  │   Engine LMSE      │ │ Auth Administrateur│ │ License Generator │
 │ Cages, Reproduction│                  │  VALIDATION ONLY   │ │ RBAC (SuperAdmin) │ │ Private Key Sign  │
 │ Santé, Alimentation│                  │ (Public Key Verify)│ └───────────────────┘ └───────────────────┘
 └───────────────────┘                  └────────────────────┘
```

---

## 2. Environnement A — Application Utilisateur (`VITE_APP_MODE=user`)

- **Public visé** : Éleveurs, Bêta-testeurs, Vétérinaires, Associations, Utilisateurs commerciaux.
- **Rôles applicatifs métier** : `BETA_TESTER`, `BREEDER`, `VETERINARIAN`, `ASSOCIATION`, `COMMERCIAL`.
- **Fonctions incluses** : Oiseau, couples, ponte, incubation, sevrage, habitats/cages, dossier médical/santé, alimentation/nourrissage à la main, calendrier, dépenses, ventes, analyses statistiques, génétique, rapports PDF, sauvegardes/restaurations local storage.
- **Rôle du moteur LMSE** : Validation cryptographique des licences uniquement (vérification de signature, contrôle d'expiration, device binding, vérification anti-rollback horloge).
- **Protection** : Exclus du build et gardés au runtime : pas d'accès au générateur de licences, pas d'accès aux fonctions de révocation, pas d'accès aux rôles admin, pas d'accès au secret de signature.

---

## 3. Environnement B — Centre d'Administration Enterprise (`VITE_APP_MODE=admin`)

- **Public visé** : Administrateurs Enterprise autorisés uniquement.
- **Rôles administratifs** : `SUPER_ADMIN`, `ADMIN`, `SUPPORT`, `AUDITOR`.
- **Fonctions incluses** : Création de licences, génération de clés, révocation de clés, gestion des organisations, gestion du registre biologique des espèces, support client/tickets, journalisation d'audit, tableau de bord exécutif, statistiques globales de la flotte.
- **Rôle du moteur LMSE** : Génération et signature cryptographique des licences via `LicenseGenerator` et la clé privée de signature.

---

## 4. Authentification & Préparation Serveur Distant

En préparation du déploiement sur infrastructure serveur dédiée :
- Le module `appMode.ts` et la structure `AdminRole` préparent l'intégration avec des jetons de session expirables (JWT), un contrôle RBAC strict, et l'authentification multifacteur (MFA/2FA).
