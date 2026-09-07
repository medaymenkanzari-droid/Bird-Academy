# Journal des Modifications — Séparation Totale de l'Administration (RC2.5)

---

## [RC2.5] - 2026-08-07

### Ajouté (Added)
- `src/config/appMode.ts` : Nouveau module centralisé de gestion du mode d'application (`user` vs `admin`) et de contrôle de garde `assertAdminContext()`.
- `tests/lmse-admin-isolation.test.ts` : Suite d'audit de sécurité comprenant 16 tests automatisés dédiés à l'isolation administrative.
- Commandes de build et de test dans `package.json` :
  - `npm run build:user`
  - `npm run build:admin`
  - `npm run test:lmse-admin-isolation`

### Modifié (Changed)
- `src/App.tsx` : Filtrage dynamique de `navigationItems` et interception des onglets administratifs en mode Utilisateur.
- `src/features/licensing/services/CryptoService.ts` : Restriction d'accès à la clé privée de signature `MASTER_SALT`.
- `src/features/licensing/engines/LicenseGenerator.ts` : Protection par `assertAdminContext()` interdisant la génération de clés dans le build utilisateur.
- `src/features/licensing/services/LicensingService.ts` : Ajout de gardes de sécurité sur `createLicense()`, `revokeLicense()`, `getAllLicenses()` et `exportLicensingData()`.
- `src/features/administration/types/admin.types.ts` : Métier et rôles administratifs séparés (`super_admin`, `admin`, `support`, `auditor`).
- `src/features/administration/components/AdminCenterView.tsx` & `LicensingAdminPage.tsx` : Composants sécurisés par le garde `assertAdminContext()`.

### Supprimé / Exclu (Removed / Excluded)
- Les onglets et menus "Administration S9", "Licences LMSE (Admin Center)", "Plateforme Admin (Legacy)" et "Tableau de bord QA" sont retirés de la navigation de l'application utilisateur.
