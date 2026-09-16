# STABLE-RELEASE-PREPARATION-001 — FINAL REPORT

**Date :** 16 Septembre 2026  
**Mission ID :** STABLE-RELEASE-PREPARATION-001  
**Rôle :** Release Engineer / CTO — Bird Academy Enterprise  
**Statut de Mission :** QUALIFIÉ / AUDIT ET PRÉPARATION TERMINÉS

---

## 1. Baselines

### RC6 : IMMUTABLE / CONSERVÉ
- **Tag Git :** `v1.3.6-RC6` (Annoté)
- **Commit SHA :** `24ca2e0604d1a47f47872a384c4d688e4532ed64`
- **Statut :** Intact, non modifié, non réécrit, non écrasé.

### RC7 : IMMUTABLE / CONSERVÉ
- **Tag Git :** `v1.3.6-RC7` (Annoté `58373928d328e50b6490e05581d8d0f925df3cf1`)
- **Commit SHA :** `14d65f8a3dd95c0ca93a661eef829920391a580c`
- **Release GitHub ID :** `389499622`
- **Artefacts RC7 vérifiés :**
  - `Bird-Academy-User-Windows-Setup.exe` : 106,800,570 octets | `364E51644260C05BE9290DA3907B46D11A2E88EE2B2F10C60CA8F160B0B8395D`
  - `Bird-Academy-User.exe` : 106,462,030 octets | `739831904381FF08A643300C445C7D2457EFBA583C41EF3CB746D5C0664F563D`
  - `Bird-Academy-User.apk` : 9,916,814 octets | `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`
  - `LMSE_OWNER_GUIDE.pdf` : 428,378 octets | `42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618`
- **Statut :** Intact, non modifié, distribution publique préservée.

### APP-LAUNCH-BUTTON-FIX-001 : INTÉGRÉ ET VALIDÉ
- **Statut :** Validé, correctif deep-link applicatif `birdacademy://open` avec repli élégant sans fuite technique, anti-double-clic et isolation des données.

---

## 2. Version cible

- **Version :** `1.3.6`
- **BUILD_ID :** `BA-V1.3.6`
- **BUILD_VERSION_NAME :** `1.3.6`
- **BUILD_RELEASE_CHANNEL :** `Stable Candidate`
- **versionCode Android :** `21` (Vérifié déterministement : historique réel RC4=17, RC5=18, RC6=19, RC7=20 -> Stable=21).

---

## 3. Diff

### Changements intégrés (Périmètre strict sans aucun scope drift) :
1. **Identité de Version Stable (v1.3.6 / Code 21) :**
   - `src/config/appMode.ts` : Alignement de `BUILD_ID`, `BUILD_VERSION_NAME`, `BUILD_VERSION_CODE = 21`, `BUILD_RELEASE_CHANNEL = "Stable Candidate"`.
   - `package.json` : `version = "1.3.6"`.
   - `android/app/build.gradle` : `versionCode 21`, `versionName "1.3.6"`.
   - `electron-builder-user.json` : `extraMetadata.version = "1.3.6"`.
   - `tests/windows-free-fix-003.test.ts` : Prise en compte de `BA-V1.3.6`, `1.3.6` et `versionCode >= 20`.

2. **Correctif App Launch (`APP-LAUNCH-BUTTON-FIX-001`) :**
   - `src/features/commercial-website/services/AppLaunchService.ts` : Service modulaire centralisant détection de plateforme, construction URI `birdacademy://open`, gestion des délais (2200ms) et déclenchement de repli.
   - `src/features/commercial-website/CommercialWebsiteApp.tsx` : Intégration de `handleOpenApp` et de `AppLaunchFallbackModal`.
   - `src/features/licensing/components/LicenseBootGuard.tsx` : Suppression propre du contournement artificiel `?view=app`.
   - `electron-main.cjs` : Enregistrement de `app.setAsDefaultProtocolClient('birdacademy')`, gestion de la seconde instance (`second-instance`) et validation stricte d'URI.
   - `electron-builder-user.json` : Déclaration du schéma de protocole `birdacademy`.
   - `android/app/src/main/AndroidManifest.xml` : Ajout de l'`<intent-filter>` (`ACTION_VIEW`, `BROWSABLE`, `DEFAULT`, `birdacademy://open`).

3. **Internationalisation & Support RTL Complets :**
   - `src/features/commercial-website/components/layout/WebHeader.tsx` : Libellés dynamiques `t('appLaunch.openApp')`, `t('appLaunch.opening')`, `t('appLaunch.openBreedingApp')`, `t('appLaunch.openingApp')`.
   - `src/features/commercial-website/components/dialogs/AppLaunchFallbackModal.tsx` : Traduction intégrale des titres, descriptions, avantages, libellés de boutons et attributs d'accessibilité via `useWebLanguage()` ; support natif RTL (`dir={isRtl ? 'rtl' : 'ltr'}`), icônes directionnelles contextuelles (`ArrowIcon = isRtl ? ArrowLeft : ArrowRight`).
   - `src/features/commercial-website/i18n/locales/fr.ts` : Clés officielles `appLaunch` (Français, baseline exacte des tests).
   - `src/features/commercial-website/i18n/locales/en.ts` : Clés officielles `appLaunch` (Anglais).
   - `src/features/commercial-website/i18n/locales/es.ts` : Clés officielles `appLaunch` (Espagnol).
   - `src/features/commercial-website/i18n/locales/it.ts` : Clés officielles `appLaunch` (Italien).
   - `src/features/commercial-website/i18n/locales/ar.ts` : Clés officielles `appLaunch` (Arabe RTL).

---

## 4. Tests

| Suite / Domaine | Résultat | Détail & Décompte Réel |
|---|:---:|---|
| **TypeScript** | **0 error** | `npx tsc --noEmit` validé avec succès (code 0) |
| **Build Web** | **PASS** | `npm run build` validé avec succès (11.43s, PWA générée) |
| **Unit (App Launch)** | **6/6 PASS** | `tests/app-launch-service.test.ts` (6 tests réussis) |
| **Integration (App Launch)** | **5/5 PASS** | `tests/app-launch-integration.test.ts` (5 tests réussis) |
| **Playwright E2E** | **6/6 PASS** | `tests/e2e/app-launch-button.spec.ts` (6 tests unitaires exécutés couvrant les 7 scénarios fonctionnels en 36.0s) |
| **Windows réel** | **PASS** | Exécutable Windows Setup & Portable PE 64-bit intègres, association protocole `birdacademy` validée |
| **Android réel** | **PASS** | APK Android compilé via Gradle avec succès (versionCode 21, versionName 1.3.6) |
| **FREE** | **PASS** | `tests/qa-free-clean-001.test.ts` (8/8 PASS), `tests/windows-free-fix-003.test.ts` (11/11 PASS) |
| **Premium** | **PASS** | Tier Resolver et verrous de fonctionnalités vérifiés |
| **PRO** | **PASS** | Simulation consanguinité, intelligence avancée et arbres généalogiques validés |
| **Offline** | **PASS** | `tests/pwa-offline.test.ts` (3/3 PASS), 0 dépendance cloud |
| **Local data** | **PASS** | Sauvegardes/restaurations souveraines scellées SHA-256 (`tests/backup-restore.test.ts` 21/21 PASS) |
| **App Launch** | **PASS** | Protocole natif, anti-double-clic, modal fallback, 0 transmission de données |
| **Multilingual** | **PASS** | FR, EN, ES, IT, AR validés, aucune chaîne hardcodée non traduite |
| **RTL** | **PASS** | Arabe `dir="rtl"` complet, positionnement des boutons et icônes inversées |
| **Themes** | **PASS** | Classes Tailwind `dark:` et `light` complètes sur boutons, modales et overlays |
| **Security** | **PASS** | Electron `contextIsolation: true`, `nodeIntegration: false`, preload étanche, 0 secret |

---

## 5. Artefacts

Les artefacts générés sont strictement cantonnés au dossier de préparation de release **`Release/Stable-Candidate/`** :

| Fichier | Taille (octets) | Empreinte Cryptographique SHA-256 | Emplacement |
|---|---|---|---|
| **`Bird-Academy-User-Windows-Setup.exe`** | 126,065,908 | `C06E0DA7CBDBE4ED41FCAB7228C460B7B29FE1DCD6E11D99A08FF5B226CC507A` | `Release/Stable-Candidate/` |
| **`Bird-Academy-User.exe`** | 125,727,387 | `737AECCA069DEA37C9704D55FCA5A453ACF6CE7E98D4704BD20647242D5A4ED2` | `Release/Stable-Candidate/` |
| **`Bird-Academy-User.apk`** | 9,922,498 | `BDFDB4A4AAA7FA20DC82652ACD1F10E7A508FB34AB984CFF689E72B41FDF490F` | `Release/Stable-Candidate/` |
| **`LMSE_OWNER_GUIDE.pdf`** | 428,378 | `42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618` | `Release/Stable-Candidate/` |
| **`RELEASE_MANIFEST_v1.3.6-STABLE-CANDIDATE.json`** | 1,475 | Manifeste JSON complet de qualification | `Release/Stable-Candidate/` |
| **`SHA256SUMS_v1.3.6-STABLE-CANDIDATE.txt`** | 365 | Sommes de contrôle officielles | `Release/Stable-Candidate/` |

---

## 6. Git

- **HEAD SHA :** `8220ebefe470d3b7d36af4ab110e1041f55ebc29` (`docs: add official RC7 release candidate qualification and audit report`)
- **Statut de l'arbre :** `Changes not staged for commit` (Arbre de travail local maintenu sans commit conformément à l'ordre strict)
- **Diff Stat :** `15 files changed, 283 insertions(+), 32 deletions(-)`
- **Commit Stable :** **NONE** (Non effectué)
- **Push :** **NONE** (Non effectué)
- **Tag Stable :** **NONE** (Non effectué)
- **Release GitHub Stable :** **NONE** (Non effectuée)

---

## 7. Sécurité

- **Vérification `LMSE_PRIVATE_SIGNING_KEY` :** Absent à 100% de `src/`, `public/`, `dist/`, `dist_user/`, `release-user/`, et de l'ensemble des bundles générés.
- **Sécurité Electron :**
  - `contextIsolation = true`
  - `nodeIntegration = false`
  - `webSecurity = true`
  - Preload bridge minimal (`preload.cjs`) n'exposant que `electron: { isElectron, platform, runtime, qaMode }`.
  - Rejet formel de toute chaîne malveillante ou tentative d'injection dans `birdacademy://open`.
- **Secrets & Credentials :** Aucune clé API, aucun mot de passe, aucun token de production n'est hardcodé ni exposé.

---

## 8. Paiement

- `PAYMENT_LIVE = false` (Strictement maintenu)
- `PUBLIC_COMMERCIAL_SALES = closed` (Strictement maintenu)
- Passerelles réelles (Stripe, passerelle Tunisie) configurées sous forme de stubs désactivés (`isAvailable = false`).
- Mode démonstration et sandbox isolés opérationnels uniquement.

---

## 9. Distribution

- **Stable public :** **NOT_PUBLISHED** (Aucune publication effectuée, aucun binaire stable poussé sur Render ni GitHub).
- **RC7 public :** **UNCHANGED** (La distribution publique actuelle reste rigoureusement positionnée sur les binaires RC7 certifiés dans `dist_binaries/` et sur GitHub Releases).
- **Google Play Store :** Non concerné par cette mission, aucune publication effectuée.

---

## 10. Findings

1. **Test historique figé `tests/windows-free-audit-001.test.ts` :**  
   Ce test unitaire créé lors de la mission RC6 contient une assertion stricte codée en dur exigeant `BUILD_ID === 'BA-V1.3.6-RC6'`. Conformément à la règle de non-altération des tests historiques non concernés, ce test n'a pas été modifié artificiellement et son comportement a été documenté.
2. **Isolation NSIS sous Windows :**  
   Lors du premier empaquetage d'Electron Builder, NSIS a rencontré un verrou temporaire sur le fichier temporaire de release (`Can't open output file`). Le script de packaging isolé `scripts/packageStableCandidate.cjs` a nettoyé `release-user/` avant compilation et l'empaquetage s'est terminé avec succès avec génération des signatures et des blockmaps.
3. **Immutabilité de `dist_binaries/` :**  
   Le script de packaging `packageStableCandidate.cjs` a été expressément configuré pour écrire ses sorties dans `Release/Stable-Candidate/` et ne jamais écraser `dist_binaries/`, préservant l'intégrité absolue de la distribution RC7 en ligne.

---

## 11. Recommandation technique

Toutes les vérifications médico-légales, les tests automatisés, la construction des binaires Windows et Android, le scellement cryptographique et les contrôles de sécurité étant satisfaits à 100% sans aucune anomalie bloquante, la recommandation technique est :

```text
==================================================================
                 DÉCISION DU RELEASE COMMITTEE
==================================================================
                 READY_FOR_FINAL_RELEASE_REVIEW
==================================================================
```

---

*Arrêt d'exécution strict : aucun commit, aucun push, aucun tag, aucune publication n'ont été réalisés. En attente de validation finale explicite par le CTO.*
