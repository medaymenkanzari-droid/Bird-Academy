# STATUT DE LA CAMPAGNE

PHYSICAL VALIDATION : NOT EXECUTED

ACT-P1-02 : OPEN

Version : v1.3.6  
BUILD_ID : BA-V1.3.6  

---

# PACK DE LANCEMENT CONTRÔLÉ DE LA CAMPAGNE DE RECETTE PHYSIQUE ANDROID
## BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
### Document Opérationnel de Remise Matérielle et d'Encadrement Terrain

**Projet :** Bird Academy Enterprise — Volière Manager  
**Version cible :** `v1.3.6`  
**BUILD_ID :** `BA-V1.3.6`  
**Binaire Certifié :** `dist_binaries/Bird-Academy-User.apk`  
**Empreinte SHA-256 :** `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`  
**Taille Binaire :** `9 916 814 octets`  
**Rôle Responsable :** Senior QA / Release Manager  
**Date d'émission :** 19 Septembre 2026  
**Statut Global de Validation Physique :** **`NOT EXECUTED`**  
**Statut de Décision ACT-P1-02 :** **`OPEN`**  

---

> [!IMPORTANT]
> ### 🛑 AVERTISSEMENT FORMEL & DÉONTOLOGIE QA
> Ce document est conçu pour permettre à un **Responsable QA non technique** de remettre le matériel aux **trois éleveurs pilotes** et d'encadrer immédiatement les sessions de tests physiques sur le terrain.  
> **RÈGLE ABSOLUE :** Cette mission ne prétend en aucun cas avoir réalisé un test physique.  
> - **`PHYSICAL VALIDATION = NOT EXECUTED`**  
> - **`ACT-P1-02 = OPEN`**  
> Aucun smartphone, aucun participant et aucun résultat n'ont été pré-validés. Aucune donnée n'a été inventée. Tous les résultats doivent être observés directement entre les mains des éleveurs en volière.

---

## A. AVANT LA REMISE DU MATÉRIEL (CHECKLIST PRÉALABLE)

Le Responsable QA doit s'assurer que l'ensemble des éléments de cette liste est validé avant de confier le terminal au participant :

- [ ] APK officiel identifié (`dist_binaries/Bird-Academy-User.apk` ou via téléchargement sur le site officiel)
- [ ] SHA-256 vérifié (`20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`)
- [ ] Smartphones disponibles (au moins deux terminaux physiques chargés)
- [ ] Samsung identifié (`DEV-01`)
- [ ] Xiaomi identifié (`DEV-02`)
- [ ] Charge suffisante (batterie ≥ 80% sur chaque smartphone avant démarrage)
- [ ] Chronomètre disponible (pour la mesure du Cold Boot `< 3,0s` du contrôle `AND-004`)
- [ ] Appareil photo / capture disponible (pour l'enregistrement des preuves photographiques et vidéos)
- [ ] Fiches imprimées disponibles (Fiches de Session, d'Incidents, de Preuves et Checklist A4)
- [ ] Responsable QA présent (pour encadrer et attester chaque session)

---

## B. IDENTIFICATION DU SAMSUNG (DEV-01)

*Renseigner les informations réelles relevées directement sur l'appareil. Ne rien préremplir avec des suppositions.*

```text
DEV-01

Marque : Samsung
Modèle : ______________________
Android : _____________________
One UI : ______________________
Chrome : ______________________
Stockage disponible : _________
Date : ________________________
Vérifié par : _________________
```

---

## C. IDENTIFICATION DU XIAOMI (DEV-02)

*Renseigner les informations réelles relevées directement sur l'appareil. Ne rien préremplir avec des suppositions.*

```text
DEV-02

Marque : Xiaomi
Modèle : ______________________
Android : _____________________
HyperOS / MIUI : ______________
Chrome : ______________________
Stockage disponible : _________
Date : ________________________
Vérifié par : _________________
```

---

## D. IDENTIFICATION DES PARTICIPANTS PILOTES

*Renseigner les champs lors de la remise. Ne rien inventer.*

```text
PILOT-01
Nom / identifiant : __________________
Expérience élevage : _________________
Date de session : ____________________

PILOT-02
Nom / identifiant : __________________
Expérience élevage : _________________
Date de session : ____________________

PILOT-03
Nom / identifiant : __________________
Expérience élevage : _________________
Date de session : ____________________
```

> [!NOTE]
> ### 🔒 Règle de Confidentialité et Protection des Données Personnelles
> Afin de respecter la vie privée des participants, ne **pas** demander inutilement :
> - adresse postale,
> - numéro de téléphone personnel,
> - adresse email,
> - informations personnelles non nécessaires à la recette technique.  
> L'utilisation d'un simple **identifiant pilote** (`PILOT-01`, `PILOT-02`, `PILOT-03` ou pseudonyme d'éleveur) est strictement suffisante.

---

## E. STRUCTURE ET LOGIQUE DES 4 SESSIONS

La campagne terrain s'articule selon une matrice stricte garantissant une couverture exhaustive :

| Session ID | Participant | Terminal Attribué | Nombre de Contrôles | Statut Initial |
|:---:|:---:|:---:|:---:|:---:|
| **SESSION-01** | PILOT-01 | DEV-01 Samsung | 32 | **NOT TESTED** |
| **SESSION-02** | PILOT-02 | DEV-02 Xiaomi | 32 | **NOT TESTED** |
| **SESSION-03** | PILOT-03 | DEV-[À CONFIRMER] *(1er terminal)* | 32 | **NOT TESTED** |
| **SESSION-04** | PILOT-03 | DEV-[SECOND] *(second terminal croisé)* | 32 | **NOT TESTED** |

**Total de la campagne :** `4 × 32 = 128 contrôles`

> [!WARNING]
> ### ⚡ RÈGLE SUR SESSION-04
> **SESSION-04 n'existe réellement que si PILOT-03 teste physiquement le second terminal croisé.**  
> Si pour des contraintes logistiques ou de temps PILOT-03 ne teste qu'un seul terminal, la campagne comportera 3 sessions réelles (`3 × 32 = 96 contrôles`).  
> **Ne jamais transformer une configuration à 3 sessions en configuration à 4 sessions sans observation réelle sur le second terminal.**

---

## F. PROCÉDURE DE DÉMARRAGE EN 12 ÉTAPES

Pour chaque session opérationnelle, exécuter scrupuleusement la séquence suivante :

1. **Identifier le smartphone :** Vérifier la marque, le modèle et l'OS, puis compléter le bloc d'identification (`DEV-01` ou `DEV-02`).
2. **Vérifier son hash si nécessaire :** Vérifier que le binaire déployé correspond à `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`.
3. **Ouvrir le site officiel :** Naviguer sur le site public de l'application depuis Chrome Android.
4. **Ouvrir le Centre de téléchargement :** Accéder à la section `/download` ou `#download`.
5. **Télécharger l'APK :** Cliquer sur le bouton officiel de téléchargement de `Bird-Academy-User.apk` (taille `9 916 814 octets`).
6. **Installer l'application :** Autoriser l'installation depuis cette source si demandé par Android, puis valider l'installation du package.
7. **Ouvrir l'application :** Lancer l'application pour la première fois.
8. **Attribuer SESSION-XX :** Assigner le numéro de session au participant (`SESSION-01`, `SESSION-02`, `SESSION-03` ou `SESSION-04`).
9. **Remplir les 32 contrôles :** Parcourir chronologiquement les 32 points de contrôle de la grille `AND-001` à `AND-032`.
10. **Conserver les preuves :** Enregistrer les photos, vidéos et captures d'écran selon la convention officielle.
11. **Signaler immédiatement toute anomalie :** En cas de bug, lenteur ou comportement inattendu, suspendre le test et créer une fiche incident.
12. **Faire signer la session :** Recueillir l'avis qualitatif de l'éleveur et faire émarger la fiche de session par l'éleveur et le Responsable QA.

---

## G. RÈGLE ABSOLUE DES RÉSULTATS

Pour chaque point de contrôle `AND-001` à `AND-032`, **seuls les 4 statuts suivants sont autorisés** :

- **`PASS`** : Le comportement attendu a été **strictement observé de visu** sur le smartphone physique en volière.
- **`FAIL`** : Le comportement observé présente un dysfonctionnement, une erreur, un gel ou une non-conformité.
- **`BLOCKED`** : Le contrôle ne peut pas être exécuté en raison d'un blocage externe ou matériel préalable.
- **`NOT TESTED`** : Le contrôle n'a pas encore été tenté ou évalué par un opérateur humain.

> [!CAUTION]
> ### 🚫 INTERDICTION FORMELLE DE CONVERSION AUTOMATIQUE
> Il est formellement interdit de procéder à une conversion de statut sans observation humaine :
> - **`NOT TESTED → PASS`** : STRICTEMENT INTERDIT
> - **`BLOCKED → PASS`** : STRICTEMENT INTERDIT
> - **`FAIL → PASS`** : STRICTEMENT INTERDIT
> 
> **Les tests automatisés (scripts, émulateurs, suites Playwright) ne doivent JAMAIS être utilisés pour remplir ou remplacer les résultats physiques.**

---

## H. CONVENTION DE NOMMAGE DES PREUVES TERRAIN

Toute preuve numérique (capture d'écran, enregistrement vidéo, photo du terminal) doit obligatoirement suivre la nomenclature normalisée :

```text
[SESSION]_[DEVICE]_[TEST]_[DESCRIPTION].[ext]
```

### Exemples Officiels Conformes :
- `SESSION-01_DEV-01_AND-004_COLD_BOOT.mp4` : Vidéo chronométrée du démarrage à froid sur Samsung.
- `SESSION-01_DEV-01_AND-008_KEYBOARD.jpg` : Photo du clavier virtuel Samsung avec bouton Valider visible.
- `SESSION-02_DEV-02_AND-030_ARABIC_RTL.jpg` : Capture d'écran du basculement en Arabe RTL sur Xiaomi.
- `SESSION-03_DEV-XX_AND-021_PERSISTENCE.jpg` : Photo démontrant la persistance des données après Swipe Kill.

> [!WARNING]
> **Ne jamais fabriquer de preuve.** Une preuve doit provenir d'une capture réelle prise lors de la session physique.

---

## I. MISE EN ÉVIDENCE DES 8 CONTRÔLES CRITIQUES

Une attention particulière doit être portée sur ces 8 contrôles critiques lors de la recette en volière.  
**Pour chacun, le résultat doit être impérativement observé physiquement :**

| ID | Contrôle Critique | Description de l'Observation Physique Attendue | Critère de Succès |
|:---:|:---|:---|:---:|
| **AND-004** | **Cold Boot < 3 secondes** | Lancement de l'application depuis l'état arrêté avec chronomètre manuel. | Affichage complet du Dashboard en moins de 3,00 secondes. |
| **AND-008** | **Clavier Virtuel** | Saisie d'un texte long dans un formulaire (ex. fiche oiseau). | Le clavier constructeur (Samsung Keyboard, Gboard) ne masque pas les boutons d'action ni le bouton Valider. |
| **AND-021** | **Persistance après Swipe Kill** | Fermeture brutale via le gestionnaire des tâches récentes Android, puis réouverture. | Intégrité absolue des données créées, zéro perte de session. |
| **AND-026** | **Mode Avion Réel** | Activation manuelle du mode Avion (coupure 4G/5G, Wi-Fi et Bluetooth) puis lancement à froid. | Lancement immédiat sans blocage réseau ni écran blanc. |
| **AND-027** | **Fonctionnement Hors-Ligne** | Création et édition de données (oiseaux, couples, pontes) en mode Avion complet. | Enregistrement local instantané dans IndexedDB/SQLite. |
| **AND-028** | **Persistance Hors-Ligne** | Désactivation du mode Avion et reconnexion réseau. | Préservation de toutes les saisies effectuées hors-ligne sans duplication ni écrasement. |
| **AND-030** | **Arabe / RTL** | Sélection de la langue Arabe dans les paramètres. | Inversion directionnelle complète (droite à gauche) de l'interface, lisibilité parfaite de la typographie arabe. |
| **AND-032** | **Licence .lmse** | Import d'un fichier de licence officiel `.lmse` depuis le stockage local. | Déblocage immédiat des fonctionnalités avancées sans connexion internet. |

---

## J. GESTION DES INCIDENTS TERRAIN

En cas d'anomalie, bug, crash, comportement inattendu ou difficulté ergonomique constatée par l'éleveur :

> [!CAUTION]
> ### 🛑 LES 3 RÈGLES D'OR EN CAS DE PROBLÈME
> 1. **NE PAS CORRIGER IMMÉDIATEMENT**
> 2. **NE PAS EFFACER LA PREUVE**
> 3. **NE PAS TRANSFORMER LE TEST EN PASS**

### Procédure Opérationnelle en 8 Étapes :
1. **Arrêter immédiatement le contrôle** en cours.
2. **Conserver l'état observé** sur l'écran du smartphone sans tenter de le contourner.
3. **Faire une capture / photo / vidéo** nette de l'écran affichant l'anomalie.
4. **Noter exactement ce qui s'est passé** (geste effectué, écran affiché, message d'erreur éventuel).
5. **Noter l'identifiant du contrôle** concerné (`AND-XXX`).
6. **Noter le contexte complet** : `SESSION-XX` / `PILOT-XX` / `DEV-XX`.
7. **Créer une fiche incident** dans `QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md`.
8. **Continuer uniquement si le Responsable QA l'autorise expressément** après évaluation de l'impact sur les contrôles suivants.

---

## K. DOCUMENTS COMPLÉMENTAIRES DU KIT DE RECETTE

Le Responsable QA dispose de l'ensemble des documents certifiés suivants :

1. **`QA_ANDROID_FIELD_CAMPAIGN_003_START_CHECKLIST.pdf`** : Fiche A4 imprimable avec cases à cocher pour la remise.
2. **`QA_ANDROID_FIELD_KIT_001_GUIDE.md`** : Guide pas-à-pas de recette pour les éleveurs.
3. **`QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md`** : Grille d'évaluation des 32 contrôles par session.
4. **`QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md`** : Fiche de consignation des anomalies terrain.
5. **`QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md`** : Registre d'inventaire des photos et vidéos de test.
6. **`QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md`** : Fiche de synthèse finale multi-sessions.
7. **`QA_ANDROID_FIELD_EXECUTION_002_SESSION_MATRIX.md`** : Matrice consolidée des 128 contrôles.

---

**Approbation du Launch Pack :**

| Rôle | Nom / Référence | Date | Statut |
|---|---|---|:---:|
| **Senior QA / Release Manager** | QA Lead Bird Academy | 19/09/2026 | **PRÊT POUR REMISE PHYSIQUE** |
| **Validation Physique Terrain** | Non réalisée à ce stade | — | **NOT EXECUTED** |
| **Décision ACT-P1-02** | En attente de recette réelle | — | **OPEN** |
