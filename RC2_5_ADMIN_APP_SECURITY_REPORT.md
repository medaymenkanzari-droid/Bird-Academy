# RAPPORT DE SÉCURITÉ — APPLICATION ADMIN (BIRD ACADEMY ADMIN)
**Bird Academy Enterprise — RC2.5**

---

## 1. STRATÉGIE DE SÉCURISATION ADMINISTRATIVE

L'application **Bird Academy Admin** est une console privée destinée exclusivement aux administrateurs Enterprise autorisés.

---

## 2. MODÈLE D'AUTHENTIFICATION ET RBAC

- **Écran d'authentification dédié** (`src/AdminApp.tsx`).
- **Contrôle strict des rôles** : Seuls les comptes possédant un rôle valide (`super_admin`, `admin`, `support`, `auditor`) peuvent créer une session d'administration.
- **Blocage des rôles utilisateurs** : Les tentatives de connexion avec un rôle utilisateur (`breeder`, `beta_tester`, `veterinarian`, `association`) sont rejetées avec une erreur `403 Forbidden`.
- **Sessions & Jetons** : Génération de jetons de session cryptographiques avec expiration automatique (8 heures) et possibilité de révocation/déconnexion immédiate.

---

## 3. INTERACTIONS AVEC LE BACKEND LMSE

- L'application Admin communique avec le serveur API Backend Express (`src/server/lmseServer.ts`).
- Toute création, signature, renouvellement ou révocation de licence s'effectue côté serveur via les endpoints sécurisés `/api/admin/*`.
- Tous les événements administratifs sont enregistrés dans le journal d'audit serveur immutable (`AuditServerLog`).

---

STATUS:
SECURITY VERIFIED — ADMIN APP SECURED & AUTHENTICATED
