# RAPPORT D'EXÉCUTION DE LA RECETTE TERRAIN ANDROID (PILOTE PHYSIQUE)
## MISSION ANDROID-FIELD-EXECUTION-001 — VALIDATION OPERATIONNELLE ACT-P1-02
### Bird Academy Enterprise — Volière Manager v1.3.6

**Rôle :** Senior QA / Release Manager  
**Date du rapport :** 2026-09-19  
**Statut Global :** `PHYSICAL VALIDATION PENDING`  
**Statut d'Exécution Matérielle :** `PHYSICAL EXECUTION : BLOCKED — NO PHYSICAL DEVICE ACCESS`  
**Statut Décision ACT-P1-02 :** `OPEN` (En attente d'exécution physique sur le terrain)  

---

## 1. CONTEXTE & OBJECTIF DE LA MISSION

La présente mission constitue l'étape opérationnelle de validation physique de l'action :
**ACT-P1-02 — Recette Terrain Android (Volière Réelle)**

Cette campagne est encadrée par les principes méthodologiques et relationnels arrêtés dans :
- [`QA_COMMERCIAL_DECISION_001_ANDROID_PILOT_PLAN.md`](file:///d:/app%20canaris/28+/QA_COMMERCIAL_DECISION_001_ANDROID_PILOT_PLAN.md)
- [`QA_COMMERCIAL_DECISION_002_ANDROID_PARTICIPANT_MATRIX.md`](file:///d:/app%20canaris/28+/QA_COMMERCIAL_DECISION_002_ANDROID_PARTICIPANT_MATRIX.md)

L'objectif est d'effectuer la recette physique unitaire des 32 contrôles (`AND-001` à `AND-032`) sur smartphones réels entre les mains de 3 éleveurs pilotes (`PILOT-01`, `PILOT-02`, `PILOT-03`) sur deux terminaux représentatifs du marché (`DEV-01` Samsung et `DEV-02` Xiaomi).

---

## 2. AUDIT DE CAPACITÉ D'EXÉCUTION (DÉONTOLOGIE QA ABSOLUE)

> [!CAUTION]
> **CONSTAT DE BLOCAGE MATÉRIEL D'ANTIGRAVITY :**  
> Antigravity, en tant qu'agent logiciel d'assistance automatisée s'exécutant dans un conteneur Windows, **ne dispose pas d'un accès physique direct aux smartphones cibles**.  
> Aucun pont matériel USB/ADB n'est connecté et l'environnement ne possède pas d'interface biomécanique pour manipuler des écrans tactiles sous éclairage naturel de volière.

### Application stricte des règles déontologiques :
Conformément aux directives intangibles de la mission :
1. **Zéro simulation :** Aucun test physique n'est simulé par un script logiciel.
2. **Zéro équivalence trompeuse :**
   - Un test Playwright n'est **pas** une recette terrain.
   - Un émulateur Android n'est **pas** un smartphone physique.
   - Les tests unitaires Node.js ne constituent **pas** une validation ergonomique.
   - Une inspection statique d'APK ne valide **pas** le comportement tactile réel.
3. **Zéro falsification de résultats :** Aucun résultat n'a été passé à `PASS` par extrapolation ou anticipation.
4. **Conservation de l'état initial :** Tous les contrôles physiques non observés restent rigoureusement au statut **`NOT TESTED`**.

En conséquence, l'état d'exécution matériel est formellement acté :  
👉 **`PHYSICAL EXECUTION : BLOCKED — NO PHYSICAL DEVICE ACCESS`**

---

## 3. IDENTIFICATION ET VÉRIFICATION STRICTE DE LA RELEASE

Le binaire officiel a été audité sur le disque local avant tout déploiement :
- **Chemin du binaire :** `dist_binaries/Bird-Academy-User.apk`
- **Taille physique :** `9 916 814 octets`
- **Algorithme :** SHA-256

### Calcul cryptographique d'intégrité :
```powershell
Get-FileHash -Algorithm SHA256 'dist_binaries/Bird-Academy-User.apk'
```

- **Empreinte SHA-256 calculée :**  
  `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`
- **Empreinte documentée de référence :**  
  `20AD96A27742...`

**Verdict d'intégrité :** **`APK INTEGRITY : PASS`** (Conformité absolue au bit près).  
Le paquet est certifié apte et prêt pour l'installation physique par le responsable QA terrain.

---

## 4. PRÉCONDITIONS MATÉRIELLES & HUMAINES

Avant toute manipulation en volière, le responsable QA terrain doit impérativement compléter les préconditions d'identification suivantes :

### 4.1 Terminaux Physiques
- **DEV-01 (Samsung) :**
  - Marque : Samsung
  - Modèle réel : `[A_CONFIRMER]` *(À relever dans Paramètres > À propos du téléphone)*
  - Version Android : `[A_CONFIRMER]` *(Android 13 ou 14 réel)*
  - Statut : `NOT TESTED`
- **DEV-02 (Xiaomi) :**
  - Marque : Xiaomi
  - Modèle réel : `[A_CONFIRMER]` *(À relever dans Paramètres > À propos du téléphone)*
  - Version Android / OS : `[A_CONFIRMER]` *(HyperOS / MIUI réel)*
  - Statut : `NOT TESTED`

### 4.2 Participants Humains
- **PILOT-01 :** Éleveur pilote `[A_CONFIRMER]`
- **PILOT-02 :** Éleveur pilote `[A_CONFIRMER]`
- **PILOT-03 :** Éleveur pilote `[A_CONFIRMER]`

---

## 5. PROCÉDURE OPÉRATIONNELLE DÉTAILLÉE POUR LE RESPONSABLE QA HUMAIN

Le présent protocole pas-à-pas doit être rigoureusement suivi par le responsable QA et les éleveurs lors de la tenue des sessions terrain.

### Étape 1 : Relevé de configuration préalable
Sur chaque terminal (`DEV-01` et `DEV-02`), accéder à `Paramètres > À propos du téléphone` et consigner dans la fiche de session :
1. Fabricant et Modèle exact (ex. SM-A546B/DS).
2. Version Android et version du patch de sécurité.
3. Version de l'application Chrome (`Paramètres > Applications > Chrome`).
4. Capacité de stockage disponible (doit être > 500 Mo).

### Étape 2 : Installation & Contrôle du Cold Boot (AND-001 à AND-004)
1. **AND-001 :** Télécharger l'APK via Chrome Android depuis le dépôt officiel sécurisé.
2. **AND-002 :** Autoriser l'installation depuis cette source dans les paramètres de sécurité Android.
3. **AND-003 :** Lancer l'installation du paquet `com.birdacademy.app` et vérifier l'absence d'erreur d'analyse (`Parse Error`).
4. **AND-004 (Mesure Chronométrée Impérative) :**  
   - Fermer toutes les applications ouvertes.
   - Préparer un chronomètre externe physique (smartphone tiers ou montre).
   - Cliquer sur l'icône de l'application depuis le lanceur d'applications.
   - Déclencher le chronomètre au contact du doigt et l'arrêter à l'affichage complet du Tableau de Bord.
   - **Règle stricte :** Si la mesure est $\le 3,0$ secondes $\rightarrow$ `PASS`. Si $> 3,0$ secondes $\rightarrow$ `FAIL`. Ne jamais se baser sur une impression subjective de fluidité.

### Étape 3 : Mode FREE Natif & Ergonomie Tactile (AND-005 à AND-013)
1. **AND-006 :** Confirmer le montage direct du Dashboard en mode FREE sans aucune fenêtre bloquante ni demande de carte bancaire.
2. **AND-007 à AND-010 :** Évaluer la réactivité tactile sous lumière naturelle en volière. Recueillir l'avis qualitatif de l'éleveur (facilité à une main, taille des touches).
3. **AND-008 (Vérification Clavier Virtuel) :**  
   - Ouvrir un formulaire de saisie (ex. Ajout d'un oiseau).
   - Observer si le clavier virtuel (Samsung Keyboard sur DEV-01, Gboard sur DEV-02) occulte le bouton d'action principal "Valider" ou "Enregistrer".
   - Le bouton doit rester accessible soit par ajustement automatique (`adjustResize`), soit par défilement.
4. **AND-012 :** Vérifier que le geste de balayage ou la touche tactile "Retour" ferme les modales sans quitter brutalement l'application.

### Étape 4 : Gestion Métier de l'Élevage (AND-014 à AND-020)
Faire exécuter par l'éleveur les actes quotidiens de son exploitation :
1. **AND-014 :** Création d'une fiche oiseau avec bague alphanumérique réelle.
2. **AND-016 :** Création d'une cage/volière et affectation spatiale.
3. **AND-017 :** Formation d'un couple et calcul de consanguinité Wright.
4. **AND-018 :** Saisie d'une ponte, incubation et mirage d'œuf.
5. **AND-019 :** Saisie des pesées et enregistrement d'un traitement sanitaire.
6. **AND-020 :** Enregistrement d'une dépense d'alimentation et d'une cession d'oiseau.

### Étape 5 : Cycle de Vie, Persistance & Multitâche (AND-021 à AND-023)
1. **AND-021 (Persistance post Swipe-Kill) :**  
   - Saisir un oiseau de test `TEST-SWIPE-01`.
   - Ouvrir le gestionnaire de tâches Android et éjecter l'application d'un geste vers le haut (*Swipe Kill*).
   - Relancer l'application : l'oiseau `TEST-SWIPE-01` doit être immédiatement présent avec ses attributs intacts.
2. **AND-022 :** Mettre le téléphone en veille pendant 30 minutes, puis réactiver l'écran : l'application doit reprendre son état sans rechargement intempestif ni crash.
3. **AND-023 :** Simuler la réception d'un appel téléphonique ou d'une notification prioritaire pendant la saisie d'un formulaire : les champs déjà renseignés doivent être conservés.

### Étape 6 : Sauvegarde & Restauration Locale (AND-024 & AND-025)
1. **AND-024 :** Déclencher l'export d'une sauvegarde JSON depuis les Paramètres. Vérifier avec le gestionnaire de fichiers local (`Mes Fichiers` sur Samsung, `Gestionnaire de fichiers` sur Xiaomi) que le fichier JSON est accessible dans le dossier `Téléchargements` ou `Documents`.
2. **AND-025 :** Réinitialiser les données de démonstration, puis importer le fichier JSON précédemment exporté : vérifier la restauration intégrale du cheptel.

### Étape 7 : Mode Hors-Ligne Réel en Volière (AND-026 à AND-028)
1. **Procédure de coupure stricte :** Activer le **Mode Avion**, puis couper manuellement le **Wi-Fi**, le **Bluetooth** et les **Données Mobiles**.
2. **AND-026 :** Réaliser un démarrage à froid en mode avion : l'application doit démarrer instantanément en mode FREE natif avec zéro bandeau d'erreur réseau bloquant.
3. **AND-027 :** Naviguer dans les arbres généalogiques et fiches d'élevage : 100% des fonctions locales doivent opérer sans connexion.
4. **AND-028 :** Rétablir les connexions : aucune duplication de données ne doit survenir.

### Étape 8 : Multilingue RTL Arabe (AND-030)
1. Basculer la langue sur "العربية" (Arabe) dans les Paramètres.
2. Constater l'inversion directionnelle complète (RTL) : menus, flèches de navigation, formulaires et alignements textuels.

### Étape 9 : Licences & Transition Commerciale (AND-031 & AND-032)
1. **AND-031 :** Vérifier l'étiquette officielle "Plan GRATUIT" et l'accès à la modale informative de montée de version.
2. **AND-032 :** Importer un kit de licence de test officiel `.lmse` et constater le passage immédiat au statut souscrit sans redémarrage forcé.

---

## 6. SYNTHÈSE MÉTRIQUE GLOBALE DE LA MISSION

Les métriques officielles de la mission s'établissent comme suit :

| Indicateur Métrique | Valeur Prévue | Réalisé Terrain | Statut |
|---|---:|---:|---|
| Accès aux terminaux physiques | 2 | 0 | **BLOCKED (NO PHYSICAL ACCESS)** |
| Intégrité du binaire APK | SHA-256 | SHA-256 conforme | **PASS** |
| Terminaux Samsung testés (`DEV-01`) | 1 | 0 | **NOT TESTED** |
| Terminaux Xiaomi testés (`DEV-02`) | 1 | 0 | **NOT TESTED** |
| Participants éleveurs mobilisés | 3 | 0 | **NOT TESTED** |
| Sessions physiques créées | 3 (ou 4) | 0 | **NOT TESTED** |
| Contrôles physiques exécutés | 96 (ou 128) | 0 | **NOT TESTED** |
| Contrôles physiques validés (PASS) | 96 (ou 128) | **0** | **NOT TESTED** |
| Contrôles physiques en échec (FAIL) | 0 | **0** | - |
| Contrôles physiques bloqués (BLOCKED) | 0 | **0** | - |
| Contrôles physiques en attente (NOT TESTED) | - | **96** (ou 128) | **EN ATTENTE** |

> [!IMPORTANT]
> **Interdiction formelle de biais statistique :** Le taux de réussite physique est actuellement de **0%** (0 validé sur 96 ou 128 contrôles prévus). Les contrôles `NOT TESTED` ne sont en aucun cas assimilables à des succès.

---

## 7. SITUATION DE L'ACTION ACT-P1-02 & PROCHAINES ACTIONS

### Statut de ACT-P1-02 : `OPEN`
L'action **ACT-P1-02 (Android Terrain)** ne peut être déclarée `RESOLVED` tant que les contrôles physiques en volière n'ont pas été effectivement déroulés et signés par les éleveurs pilotes.

### Plan de passage de témoin (Handoff vers le Responsable QA Terrain) :
1. **Remise des Smartphones :** Le responsable logistique confie `DEV-01` et `DEV-02` aux éleveurs `PILOT-01`, `PILOT-02` et `PILOT-03`.
2. **Déroulement des Sessions :** Exécution du protocole décrit à la section 5 pour chaque session.
3. **Saisie dans la Matrice :** Renseignement des résultats réels dans [`QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md).
4. **Enregistrement des Preuves :** Indexation des captures et relevés dans [`QA_ANDROID_FIELD_EXECUTION_001_EVIDENCE_INDEX.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_EXECUTION_001_EVIDENCE_INDEX.md).
5. **Consignation des Incidents :** En cas d'anomalie, rédaction d'une fiche d'incident selon le modèle défini dans [`QA_ANDROID_FIELD_EXECUTION_001_FINDINGS.md`](file:///d:/app%20canaris/28+/QA_ANDROID_FIELD_EXECUTION_001_FINDINGS.md).
6. **Clôture Officielle :** Signature du rapport final de clôture ACT-P1-02.
