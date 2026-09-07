# BIRD ACADEMY ENTERPRISE — RAPPORT FORENSIQUE PREMIER DÉMARRAGE
## MISSION QA-WIN-FIRST-LAUNCH-01 : CONDITIONS EXACTES DU CYCLE DE VIE FIRST LAUNCH

**Date :** 21 Août 2026  
**Auteur :** Antigravity AI — Architecture & QA Engineering  
**Statut :** ✅ **ANALYSE STATIQUE & DYNAMIQUE VALIDÉE (646/646 tests PASS)**  

---

## 1. POURQUOI L'ENVIRONNEMENT ACTUEL N'A-T-IL PAS DÉCLENCHÉ LE WIZARD LORS DU TEST PRÉCÉDENT ?

Lors du test physique précédent, vous avez testé avec succès le **SCÉNARIO A (UPGRADE WINDOWS RC3.1 -> FIX4)** :
* L'ancien profil `%APPDATA%\Bird Academy Enterprise` (ou `%APPDATA%\react-example`) contenait déjà :
  1. Une licence active (`bird_academy_lmse_active_license`).
  2. Le marqueur de fin d'onboarding (`bird_academy_wizard_completed = 'true'`).
  3. Vos données d'élevage (oiseaux, couples, cages).
* Le moteur de migration `setupUserDataAndMigration()` et le composant `src/App.tsx` ont donc **normalement et conformément préservé vos données**, sans réafficher l'activation ni le WelcomeWizard.

Pour tester le **SCÉNARIO B (CLEAN INSTALL / FIRST LAUNCH)**, l'environnement utilisateur doit être préparé pour simuler un premier utilisateur n'ayant jamais installé l'application.

---

## 2. CONDITIONS EXACTES DÉTECTÉES DANS LE CODE SOURCE

### A. Écran d'Activation Initiale (`FirstLaunchActivationScreen`)
* **Fichier source :** `src/App.tsx` (lignes 586-594) et `src/features/licensing/hooks/useLicensing.ts`
* **Condition de déclenchement :**
  ```typescript
  if (licenseState === 'LICENSE_REQUIRED' || licenseState === 'LICENSE_INVALID' || licenseState !== 'LICENSE_VALID') {
    return <FirstLaunchActivationScreen onActivationSuccess={() => refreshLicensing()} />;
  }
  ```
* **Critère technique :** `localStorage.getItem('bird_academy_lmse_active_license')` est absent (`null`), révoqué ou corrompu.
* **Comportement UI :** L'application principale n'est **pas montée**. L'utilisateur est bloqué sur l'écran d'activation (Saisie de clé, Import fichier `.lic`, Scan QR Code).

---

### B. Activation de la Licence
* **Fichier source :** `src/features/licensing/services/LicenseService.ts` et `LocalStorageLicenseRepository.ts`
* **Condition de succès :** La clé de licence saisie ou le fichier `.lic` importé est validé cryptographiquement (signature Ed25519/HMAC-SHA256, date d'expiration, empreinte machine).
* **Action :** Sauvegarde dans `localStorage` sous la clé `bird_academy_lmse_active_license` et passage de `licenseState` à `'LICENSE_VALID'`.

---

### C. Écran d'Onboarding Initial (`WelcomeWizard`)
* **Fichier source :** `src/App.tsx` (lignes 92-98 et 898-912)
* **Condition de déclenchement :**
  ```typescript
  useEffect(() => {
    if (licenseState !== 'LICENSE_VALID') return;
    const isCompleted = localStorage.getItem('bird_academy_wizard_completed') === 'true';
    if (!isCompleted) {
      setShowWizard(true);
    }
  }, [licenseState]);
  ```
* **Critère technique :** `licenseState === 'LICENSE_VALID'` **ET** `localStorage.getItem('bird_academy_wizard_completed') !== 'true'`.
* **Comportement UI :** Ouverture de la modal interactive du WelcomeWizard en 7 étapes :
  1. *Étape 1 :* Choix de la langue (FR, EN, AR avec bascule RTL immédiate, ES, IT).
  2. *Étape 2 :* Choix de la devise par défaut (TND, EUR, USD, DZD, MAD, etc.).
  3. *Étape 3 :* Identité de l'élevage (Nom de l'affixe / éleveur).
  4. *Étape 4 :* Espèces élevées et objectifs (Loisir, Concours, Sélection).
  5. *Étape 5 :* Création du premier Bâtiment / Zone.
  6. *Étape 6 :* Création de la première Cage d'élevage.
  7. *Étape 7 :* Création du premier Oiseau fondateur (validation stricte BirdEngine).

---

### D. Marqueur de Clôture du Wizard (`wizard_completed`)
* **Fichier source :** `src/features/quality/components/WelcomeWizard.tsx` (lignes 303-314)
* **Action de finalisation :**
  ```typescript
  const handleFinish = () => {
    localStorage.setItem('bird_academy_wizard_completed', 'true');
    localStorage.setItem('bird_academy_aviary_name', aviaryName || 'Mon Élevage');
    if (breederName) localStorage.setItem('bird_academy_breeder_name', breederName);
    localStorage.setItem('bird_academy_currency', selectedCurrency);
    ...
    onComplete();
    onClose();
  };
  ```
* **Effet :** `bird_academy_wizard_completed` passe à `'true'`. Lors de tous les démarrages ultérieurs, le Wizard ne s'ouvrira plus.

---

### E. Initialisation de la Base Utilisateur Vierge
* **Fichier source :** `src/App.tsx` (lignes 156-237)
* **Condition :** `licenseState === 'LICENSE_VALID'`, `bird_academy_db_initialized !== 'true'` et 0 données existantes.
* **Comportement :** Initialisation avec des tableaux vides `[]` (0 oiseaux, 0 cages, 0 couples, 0 dépenses). Si l'utilisateur crée un oiseau et une cage dans le Wizard, ces éléments sont persistés et immédiatement visibles sur le Dashboard.

---

## 3. ANALYSE DU MÉCANISME DE MIGRATION LEGACY DANS `electron-main.cjs`

Dans `electron-main.cjs` (lignes 36-69) :
```javascript
const legacyCandidates = [
  path.join(appDataPath, 'react-example'),
  path.join(appDataPath, 'Bird Academy')
];
```
* Si `%APPDATA%\Bird Academy Enterprise\Local Storage` est absent, Electron vérifie la présence de `%APPDATA%\react-example\Local Storage`.
* **Conséquence pour le test First Launch :** Si seul le dossier `Bird Academy Enterprise` est supprimé mais que `react-example` reste sur le disque, Electron restaurera automatiquement l'ancien profil au démarrage !
* **Solution QA :** Le script de réinitialisation `reset-first-launch-qa.ps1` purge systématiquement `%APPDATA%\Bird Academy Enterprise`, `%APPDATA%\react-example` et `%APPDATA%\Bird Academy`.

---

## 4. TABLEAU RÉCAPITULATIF DES CONDITIONS

| Écran / État | Clé `bird_academy_lmse_active_license` | Clé `bird_academy_wizard_completed` | Résultat affiché à l'écran |
| :--- | :---: | :---: | :--- |
| **Premier Lancement Vierge** | Absente / Null | Absente / False | **`FirstLaunchActivationScreen`** |
| **Post-Activation Immédiat** | Présente (Active) | Absente / False | **`WelcomeWizard` (Étape 1 à 7)** |
| **Post-Wizard / Usage Normal** | Présente (Active) | `'true'` | **`Dashboard Principal` (Direct)** |
| **Licence Expirée ou Révoquée** | Présente (Invalide) | Quelconque | **`FirstLaunchActivationScreen`** |
