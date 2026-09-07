# Audit de Sécurité — Isolation Stricte de l'Administration (RC2.5)

---

## 1. Contexte & Vulnérabilités Précédentes

Avant cette mise à jour RC2.5, l'application contenaient simultanément dans le même bundle JS :
- L'application utilisateur / éleveur ;
- Le moteur de validation LMSE ;
- Le Centre d'Administration Enterprise ;
- Le générateur de clés / licences et le salt de signature numérique (`MASTER_SALT`).

Cela créait un risque élevé d'**escalade de privilèges côté client**.

---

## 2. Analyse des Vecteurs d'Attaque & Protection Apportée

| Vecteur d'Attaque | Risque Avant RC2.5 | Solution & Protection RC2.5 | Statut |
| :--- | :--- | :--- | :--- |
| **Modification de `localStorage` / `sessionStorage`** | Possible changement de rôle pour accéder aux composants admin. | Le profil de build `VITE_APP_MODE=user` n'expose pas le code d'administration et la garde `assertAdminContext()` intercepte les tentatives. | **VERIFIED** |
| **Appel direct de `LicenseGenerator.generateLicense()` dans la console DevTools** | Génération possible de clés de licence valides par l'utilisateur final. | `LicenseGenerator.generateLicense()` appelle `assertAdminContext()`, qui lève une exception `SECURITY_ERROR` en mode Utilisateur. | **VERIFIED** |
| **Extraction de la Clé Privée de Signature depuis le Bundle Client** | Clé secrète présente en clair dans `CryptoService.ts`. | L'accès à la clé secrète est restreint au build Admin (`VITE_APP_MODE=admin`). En mode Utilisateur, l'accès à la clé lève `SECURITY_ERROR`. | **VERIFIED** |
| **Navigation directe sur une route Admin (`/admin`, onglet `admin`)** | Accès à l'écran d'administration par simple manipulation du state React. | Filtrage des `navigationItems` et affichage d'un composant d'interception `Accès Refusé`. | **VERIFIED** |
| **Tampering de sauvegarde JSON** | Injecter un rôle admin dans un fichier de sauvegarde réimporté. | L'importation de sauvegarde ne modifie pas `appMode` et n'accorde aucun privilège d'administration. | **VERIFIED** |

---

## 3. Matrice de Vérité (Règle de Vérité)

| Composant / Fonction | Déclaration de Statut | Explication Technique |
| :--- | :--- | :--- |
| **Isolation du Bundle Client** | **VERIFIED** | Validé par la suite de tests automatisée `npm run test:lmse-admin-isolation` (TEST 01 à TEST 16). |
| **Protection contre la falsification de Clé Privée** | **VERIFIED** | Clé inaccessible dans le runtime utilisateur ; la signature échoue s'il n'y a pas le contexte admin. |
| **Authentification Serveur distante** | **REQUIRES PRODUCTION INFRASTRUCTURE** | L'architecture logicielle prévoit la séparation et les rôles `super_admin`, `admin`, `support`, `auditor`, mais l'authentification réseau distante nécessitera le déploiement sur infrastructure serveur dédiée avec HTTPS/OAuth2. |
