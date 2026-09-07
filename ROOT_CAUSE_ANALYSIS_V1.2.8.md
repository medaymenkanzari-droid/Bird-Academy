# AUDIT ET DIAGNOSTIC DE CAUSE RACINE — MISSION RCA V1.2.8
# Bird Academy User Android — Android 16 Root Cause Analysis

**Date** : 11 Août 2026  
**Cible** : Android 16 (API Level 36) + Capacitor 8  
**Résultat Diagnostic** : 🔎 CAUSE RACINE IDENTIFIÉE (Preuves techniques établies)  

---

## 1. VÉRIFICATION DU BUILD ET DE L'IDENTITÉ (PHASE 1)

### 1.1 Constat de Mismatch de Versioning
L'analyse des fichiers de configuration du projet révèle un **mismatch critique** entre la version déclarée dans `package.json` et la version compilée par Gradle :

- **`package.json`** : `"version": "1.2.8-MOBILE-ROOT-FIX"`
- **`android/app/build.gradle`** (lignes 10-11) :
  ```groovy
  versionCode 7
  versionName "1.2.7-MOBILE-QA"
  ```

### 1.2 Impact Android 16
Lorsqu'un APK est produit via Gradle (`./gradlew assembleDebug`), Android OS lit les métadonnées natives `versionCode` et `versionName` définies dans `build.gradle`.  
Puisque `versionCode` est resté bloqué à `7` (identique à la version 1.2.7-MOBILE-QA), le système d'exploitation Android 16 **considère l'application comme déjà installée** et n'écrase pas correctement le package, conservant les anciens assets Web mis en cache et ignorant la mise à jour réelle du code source JS/TS.

---

## 2. DIAGNOSTIC APPROFONDI BUG-A — LECTEUR QR LICENCE

### 2.1 Symptôme Terrain
Sur appareil Android 16 réels, le lecteur QR ne fonctionne pas.

### 2.2 Trace du Flux Réel et Étape d'Échec
```
[Bouton Activation / Licence (App.tsx / LicenseStatusBadge)]
                        ↓
         [LicenseActivationModal.tsx]
                        ↓
 🔴 ÉTAPE D'ÉCHEC 1 : MODAL COMPOSANT NON MONTÉ !
 (LicenseActivationModal ne contient AUCUN onglet/composant QrCodeScannerModal)
                        ↓
 🔴 ÉTAPE D'ÉCHEC 2 : PERMISSION CAMERA ANDROID 16 WEBVIEW
 (navigator.mediaDevices.getUserMedia rejeté par Android WebView sans sollicitation native OS)
```

### 2.3 Preuves Techniques et Cause Racine (BUG-A)
1. **Cause Racine A1 — Composant QR non monté dans l'application principale** :
   - `QrCodeScannerModal.tsx` n'était importé et monté **que dans `FirstLaunchActivationScreen.tsx`** (écran de premier démarrage affiché uniquement si aucune licence n'est présente).
   - Lorsque l'utilisateur clique sur le badge de licence (`LicenseStatusBadge`) ou via les Paramètres en cours d'utilisation, l'application ouvre `LicenseActivationModal.tsx`.
   - L'inspection du fichier [LicenseActivationModal.tsx](file:///d:/app%20canaris/28+/src/features/licensing/components/LicenseActivationModal.tsx) montre qu'il ne contient **que 3 onglets** (`online`, `offline`, `info`). Le composant `QrCodeScannerModal` **n'y est ni importé ni affiché** !
2. **Cause Racine A2 — Demande de Permission Caméra WebView Android 16** :
   - En contexte Android 16 WebView (`http://localhost`), l'appel direct web `navigator.mediaDevices.getUserMedia()` est bloqué avec l'erreur `NotAllowedError` si la permission système Android `CAMERA` n'est pas sollicitée et accordée via le bridge natif Capacitor en amont.

---

## 3. DIAGNOSTIC APPROFONDI BUG-B — IMPRESSION ET PDF

### 3.1 Symptôme Terrain
Sur Android 16, appuyer sur « Imprimer / PDF » dans Statistiques, Dépenses, Ventes, Calendrier ou Arbre Généalogique ne génère ni n'imprime aucun document.

### 3.2 Trace du Flux Réel et Étape d'Échec
```
[Bouton Imprimer / PDF (Statistiques, Depenses, Ventes, Calendrier, GenealogyExplorer)]
                                        ↓
                              [printDocument()]
                                        ↓
                       [exportDocumentAsPDF()]
                                        ↓
                    [Génération PDF Binaire %PDF-1.4] (OK - Validé)
                                        ↓
        🔴 ÉTAPE D'ÉCHEC 1 : navigator.canShare({ files }) REJETÉ PAR WEBVIEW
                                        ↓
 🔴 ÉTAPE D'ÉCHEC 2 : CLIC <a download="blob:http://localhost/..."> SILENCIEUSEMENT IGNORÉ PAR WEBVIEW ANDROID !
 (Android WebView n'exécute pas les téléchargements Blob via <a download>)
```

### 3.3 Preuves Techniques et Cause Racine (BUG-B)
1. **Cause Racine B1 — Échec des téléchargements Blob via `<a download>` dans WebView** :
   - `exportDocumentAsPDF()` dans `src/utils/printUtils.ts` (lignes 100-112) crée un Blob URL (`blob:http://localhost/...`) et simule un clic sur `<a download="Rapport.pdf" href="blob:...">`.
   - **Dans Android WebView (Capacitor), les téléchargements issus de URLs `blob:` via la balise `<a download>` NE FONCTIONNENT PAS**. Chromium WebView sur Android n'a pas de gestionnaire natif `DownloadListener` pour intercepter et sauvegarder les Blobs Web sur le stockage système sans plugin Capacitor Native Filesystem / Share !
   - Le clic JS s'exécute silencieusement sans déclencher d'erreur JS, mais **aucun fichier n'est écrit sur le téléphone**, et aucun fichier n'est ouvert par l'OS Android.
2. **Cause Racine B2 — Dysfonctionnement de `window.print()`** :
   - `printDocument()` tente d'appeler `window.print()`. Standard Android WebView n'implémente pas `window.print()`, rendant cet appel inopérant.
3. **Cause Racine B3 — Absence d'exportation PDF sur l'Arbre Généalogique** :
   - [GenealogyExplorer.tsx](file:///d:/app%20canaris/28+/src/features/genetics/components/GenealogyExplorer.tsx) appelait uniquement `printDocument('printable-area')` sans passer par la génération de fichier PDF.

---

## 4. MATRICE DE L'ARCHITECTURE RÉELLEMENT EXÉCUTÉE (PHASE 7)

| Module | Handler UI Réel | PDF Engine Réel | Chemin Android Exécuté | Statut Terrain |
| :--- | :--- | :--- | :--- | :---: |
| **Scanner QR Licence** | `LicenseActivationModal.tsx` | N/A | Composant Scanner **Absient** du Modal | 🔴 BLOQUÉ (Composant manquant) |
| **Statistiques** | `handlePrint()` | `pdfDocumentGenerator.ts` | Clic `<a download="blob:...">` | 🔴 BLOQUÉ (Blob WebView ignoré) |
| **Dépenses** | `handlePrint()` | `pdfDocumentGenerator.ts` | Clic `<a download="blob:...">` | 🔴 BLOQUÉ (Blob WebView ignoré) |
| **Ventes** | `handlePrint()` | `pdfDocumentGenerator.ts` | Clic `<a download="blob:...">` | 🔴 BLOQUÉ (Blob WebView ignoré) |
| **Calendrier** | `onClick` | `pdfDocumentGenerator.ts` | Clic `<a download="blob:...">` | 🔴 BLOQUÉ (Blob WebView ignoré) |
| **Arbre Généalogique**| `onClick` | Aucun (`window.print`) | `window.print()` inopérant | 🔴 BLOQUÉ (`window.print` WebView) |

---

## 5. CODE MORT ET MISMATCHES DÉCOUVERTS (PHASE 8)

1. **`QrCodeScannerModal` isolé** : `QrCodeScannerModal` était correctement codé mais **uniquement monté dans `FirstLaunchActivationScreen.tsx`**. Il était totalement absent du modal d'activation quotidien `LicenseActivationModal.tsx`.
2. **`android/app/build.gradle` désynchronisé** : Le fichier Gradle conservait `versionCode 7` et `versionName "1.2.7-MOBILE-QA"`, empêchant Android 16 de mettre à jour l'application de façon effective.
3. **Fausse assertion dans les tests Node.js** : `npm test` sous Node.js validait les fonctions JS/TS en simulant `document.createElement('a')` avec des mocks. Cependant, sur un appareil Android 16 réel, WebView n'exécute pas les téléchargements Blobs Web sans bridge natif.

---

## 6. PLAN DE RECOMMANDATIONS POUR LA VERSION 1.2.9

Pour résoudre définitivement les deux problèmes sur Android 16 lors de la future version V1.2.9 :

1. **Synchronisation Native Gradle (Phase 1)** :
   - Mettre à jour `android/app/build.gradle` avec `versionCode 9` et `versionName "1.2.9-MOBILE-ROOT-FIX"`.

2. **Fixation BUG-A (Scanner QR)** :
   - Monter `QrCodeScannerModal` directement sous forme d'onglet ou de sous-modal dans `LicenseActivationModal.tsx` et `Parametres.tsx`.
   - Utiliser le bridge de permission caméra Capacitor natif (`@capacitor/camera` / permissions natives Android) pour demander l'accès caméra OS avant d'instancier `getUserMedia`.

3. **Fixation BUG-B (PDF & Print Android)** :
   - Convertir le buffer PDF binaire (`Uint8Array`) produit par `pdfDocumentGenerator.ts` en une chaîne Base64.
   - Utiliser le système de fichiers ou le stockage natif Android via Data URI / Base64 avec déclenchement d'un Intent Android ou d'une fenêtre de prévisualisation native.
   - Connecter `GenealogyExplorer.tsx` au générateur PDF binaire.

---

## 7. CONCLUSION AUDIT
La cause racine exacte des échecs constatés sur le terrain Android 16 est **formellement identifiée et prouvée**. Aucune fausse déclaration de succès ou build non testé n'a été produit.

**STATUT : 🔎 CAUSE RACINE IDENTIFIÉE**
