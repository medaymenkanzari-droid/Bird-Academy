# RÉPERTOIRE & INDEX DES PREUVES DE RECETTE TERRAIN ANDROID
## MISSION ANDROID-FIELD-EXECUTION-001 — VOLIÈRE MANAGER v1.3.6

**Rôle :** Senior QA / Release Manager  
**Date :** 2026-09-19  
**Statut Global des Preuves :** `AWAITING PHYSICAL ON-SITE ACQUISITION`  

---

## 1. PREUVES PRÉALABLES CERTIFIÉES (RELEASE ARTIFACT)

Avant le déploiement sur les téléphones de test, l'intégrité du binaire officiel a été formellement acquise et archivée :

| Type de Preuve | Identifiant / Fichier | Empreinte / Valeur Vérifiée | Statut |
|---|---|---|---|
| **Binaire APK Officiel** | `dist_binaries/Bird-Academy-User.apk` | Taille : `9 916 814 octets` | **VÉRIFIÉ** |
| **Empreinte SHA-256** | Log d'exécution PowerShell | `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63` | **CONFORME** |
| **Alignement Référence** | Registre `QA_COMMERCIAL_DECISION_001_REGISTER.md` | Empreinte officielle `20AD96A27742...` | **VALIDÉ** |

---

## 2. CONVENTION DE NOMMAGE DES PREUVES PHYSIQUES TERRAIN

Lors de chaque session de test en volière, le responsable QA doit archiver les preuves photographiques, captures d'écran et vidéos selon l'arborescence et la nomenclature standardisées ci-dessous :

### Structure d'archivage :
```text
evidence/
├── session_01_pilot01_dev01/
│   ├── DEV-01_about_phone.png          # Capture de Paramètres > À propos du téléphone
│   ├── DEV-01_chrome_version.png       # Capture de Paramètres > Applications > Chrome
│   ├── AND-004_cold_boot_timer.mp4     # Vidéo du déclenchement du chronomètre au démarrage
│   ├── AND-008_keyboard_input.png      # Capture du formulaire avec clavier virtuel ouvert
│   ├── AND-014_bird_created.png        # Capture de la fiche oiseau créée
│   ├── AND-021_swipe_kill.png          # Capture de la réouverture post-Swipe Kill
│   ├── AND-024_backup_file.png         # Capture du gestionnaire de fichiers avec le .json
│   ├── AND-026_airplane_mode.png       # Capture avec icône Mode Avion visible en barre d'état
│   ├── AND-030_arabic_rtl.png          # Capture de l'interface en langue arabe inversée
│   └── AND-032_license_active.png      # Capture du badge de licence après import
├── session_02_pilot02_dev02/
│   └── ... (structure identique pour Xiaomi)
├── session_03_pilot03_devXX/
│   └── ... (structure identique pour Session-03)
└── session_04_pilot03_devYY/
    └── ... (structure identique si multi-terminal)
```

---

## 3. CHECKLIST DES PREUVES REQUISES PAR SESSION

Pour qu'une session soit recevable pour la clôture officielle de l'action ACT-P1-02, les pièces probantes suivantes sont obligatoires :

| Réf. Contrôle | Pièce Probante Attendue | Format | Obligatoire |
|---|---|---|:---:|
| **Prérequis** | Photo/Capture de l'écran "À propos du téléphone" (Modèle + Version Android) | `.png` / `.jpg` | **OUI** |
| **AND-003** | Capture d'écran de l'icône de l'application installée sur le lanceur | `.png` | **OUI** |
| **AND-004** | Chronométrage précis du cold boot (< 3,0s) avec valeur numérique consignée | `.mp4` ou relevé | **OUI** |
| **AND-008** | Capture montrant la disposition du clavier virtuel lors de la saisie | `.png` | **OUI** |
| **AND-014** | Capture de la fiche d'un oiseau nouvellement créé avec sa bague | `.png` | **OUI** |
| **AND-021** | Capture démontrant la persistance des données après fermeture brutale | `.png` | **OUI** |
| **AND-024** | Fichier de sauvegarde JSON exporté ou capture de sa présence dans le stockage | `.json` / `.png` | **OUI** |
| **AND-026** | Capture d'écran du Dashboard fonctionnel avec le pictogramme "Mode Avion" | `.png` | **OUI** |
| **AND-030** | Capture d'écran de l'interface complète en arabe (RTL) | `.png` | **OUI** |
| **AND-032** | Capture de l'écran Paramètres avec licence active après import `.lmse` | `.png` | **OUI** |
| **Incidents** | Capture ou vidéo de chaque comportement `FAIL` ou `BLOCKED` | `.png` / `.mp4` | **OUI si anomalie** |

---

## 4. ÉTAT ACTUEL DU RÉPERTOIRE

- **Nombre de preuves physiques collectées à ce jour :** `0`
- **Cause :** Campagne en attente de déploiement physique par les éleveurs pilotes.
- **Statut de l'Index :** Prêt à accueillir les éléments lors du démarrage effectif des sessions.
