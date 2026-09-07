# COMPTE-RENDU DE SÉPARATION PHYSIQUE DES APPLICATIONS
**Bird Academy Enterprise — RC2.5**

---

## 1. RÉSUMÉ EXÉCUTIF

Conformément à la directive d'architecture transmise et validée par le propriétaire du projet, **Bird Academy** et **Bird Academy Admin** ont été physiquement et techniquement séparées en deux applications web/bureau/mobiles autonomes.

L'application utilisateur **Bird Academy** ne contient désormais plus **aucune ligne de code**, **aucun composant**, **aucun import** et **aucun écran** rattaché au Centre d'Administration Enterprise.

---

## 2. STRUCTURE DES APPLICATIONS SÉPARÉES

### A — Application 1 : Bird Academy (Application Utilisateur)
- **Point d'entrée** : `index.html` -> `src/main.tsx` -> `src/App.tsx`
- **Output Build** : `dist_user/` via `npm run build:user`
- **Utilisateurs** : Éleveurs, Vétérinaires, Associations, Bêta-testeurs, Clients Commerciaux.
- **Fonctionnalités incluses** : Volière, Canaris, Couples, Reproduction, Santé, Alimentation, Calendrier, Dépenses, Ventes, Statistiques, Génétique, Intelligence IA, Registre Biologique, Moteur de Validation local LMSE.
- **Code Admin inclus** : **STRICTEMENT ZERO (0%)**.

### B — Application 2 : Bird Academy Admin (Application Administrateur Enterprise)
- **Point d'entrée** : `admin.html` -> `src/adminMain.tsx` -> `src/AdminApp.tsx`
- **Output Build** : `dist_admin/` via `npm run build:admin`
- **Utilisateurs** : Personnel autorisé Enterprise (`super_admin`, `admin`, `support`, `auditor`).
- **Fonctionnalités incluses** : Authentification Admin, Répertoire des Utilisateurs, Gestion des Organisations, Génération & Signature de Licences, Révocation, Renouvellement, supervision LMSE, Audit logs.

### C — Autorité Centrate LMSE Backend (Serveur API)
- **Point d'entrée** : `src/server/lmseServer.ts`
- **Rôle** : Autorité distante unique détenant la clé privée de signature.

---

## 3. GARANTIES D'ISOLATION ET DE SÉCURITÉ

1. **Isolation des Bundles** : `npm run build:user` produit uniquement `dist_user/`. Les audits par recherche textuelle (ripgrep) sur les chunks JS de `dist_user/` ont confirmé l'absence totale de `AdminCenterView`, `LicenseGenerator`, `AdminLmseCenter`, `AdminUserDirectory`.
2. **Signature Cryptographique** : La méthode `CryptoService.getMasterSalt()` lève systématiquement une exception `SECURITY_ERROR` lorsque `VITE_APP_MODE === 'user'`.
3. **Protection Réseau / API** : Les endpoints `/api/admin/*` exigent un jeton de session administrateur valide et rejettent toutes les requêtes des rôles utilisateurs (`401 Unauthorized` / `403 Forbidden`).

---

## 4. IMPACT SUR L'UTILISATEUR FINAL

- Aucune fonctionnalité métier d'élevage n'a été altérée ou cassée.
- La validation des licences et le fonctionnement hors ligne autonome restent opérationnels à 100%.

---

STATUS:
SÉPARATION PHYSIQUE DES APPLICATIONS — VALIDÉE ET CONFORME
