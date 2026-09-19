# MATRICE OPÉRATIONNELLE DES SESSIONS DE RECETTE TERRAIN ANDROID
## MISSION ANDROID-FIELD-EXECUTION-002 — VOLIÈRE MANAGER v1.3.6
### Document de Recueil des 128 Exécutions Sessionnelles

**Projet :** Bird Academy Enterprise — Volière Manager  
**Version cible :** `v1.3.6`  
**BUILD_ID :** `BA-V1.3.6`  
**Binaire Déployé :** `dist_binaries/Bird-Academy-User.apk` (SHA-256 : `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`)  
**Statut Global Initial :** Strictement `NOT TESTED` sur 100% des points de contrôle (128/128).  
**Règle d'Or QA :** Tout résultat physique doit être consigné au vu d'une observation humaine réelle. Zéro simulation logicielle.

---

## 1. REGISTRE DES SESSIONS TERRAIN (4 SESSIONS × 32 CONTRÔLES = 128 EXÉCUTIONS)

| Session ID | Participant | Terminal Attribué | Date Réelle | Heure Début | Heure Fin | Réseau / Mode | Statut Global |
|---|---|---|---|---|---|---|---|
| **SESSION-01** | PILOT-01 | DEV-01 (Samsung) | `[A_CONFIRMER]` | `[--:--]` | `[--:--]` | Mixte (4G/Wi-Fi/Avion) | **NOT TESTED** |
| **SESSION-02** | PILOT-02 | DEV-02 (Xiaomi) | `[A_CONFIRMER]` | `[--:--]` | `[--:--]` | Mixte (4G/Wi-Fi/Avion) | **NOT TESTED** |
| **SESSION-03** | PILOT-03 | DEV-[PREMIER TERMINAL] | `[A_CONFIRMER]` | `[--:--]` | `[--:--]` | Mixte (4G/Wi-Fi/Avion) | **NOT TESTED** |
| **SESSION-04** | PILOT-03 | DEV-[SECOND TERMINAL] | `[A_CONFIRMER]` | `[--:--]` | `[--:--]` | Mixte (4G/Wi-Fi/Avion) | **NOT TESTED** |

---

## 2. MATRICE D'EXÉCUTION — SESSION-01 (PILOT-01 / DEV-01 Samsung)

- **Participant ID :** `PILOT-01`
- **Device ID :** `DEV-01` (Constructeur : Samsung | Modèle Réel : `[A_CONFIRMER]` | Android : `[A_CONFIRMER]`)
- **Navigateur :** Chrome Android `[A_CONFIRMER]`
- **Empreinte APK :** `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`

| Test ID | Clé Unifiée de Traçabilité | Catégorie | Intitulé du Contrôle Terrain | Résultat | Observations & Mesures |
|---|---|---|---|:---:|---|
| **AND-001** | `SESSION-01/PILOT-01/DEV-01/AND-001` | Installation | Téléchargement direct APK via Chrome Android | NOT TESTED | |
| **AND-002** | `SESSION-01/PILOT-01/DEV-01/AND-002` | Installation | Autorisation d'installation depuis cette source | NOT TESTED | |
| **AND-003** | `SESSION-01/PILOT-01/DEV-01/AND-003` | Installation | Installation complète paquet `com.birdacademy.app` | NOT TESTED | |
| **AND-004** | `SESSION-01/PILOT-01/DEV-01/AND-004` | Démarrage | Cold Boot chronométré (< 3,0s) | NOT TESTED | *(Chrono à consigner)* |
| **AND-005** | `SESSION-01/PILOT-01/DEV-01/AND-005` | Sécurité | Vérification des permissions système (0 abusive) | NOT TESTED | |
| **AND-006** | `SESSION-01/PILOT-01/DEV-01/AND-006` | Licences | Accès direct Dashboard mode FREE natif (0 popup) | NOT TESTED | |
| **AND-007** | `SESSION-01/PILOT-01/DEV-01/AND-007` | Ergonomie | Réactivité tactile générale sous éclairage volière | NOT TESTED | |
| **AND-008** | `SESSION-01/PILOT-01/DEV-01/AND-008` | Clavier | Clavier virtuel Samsung sans masquage bouton Valider | NOT TESTED | |
| **AND-009** | `SESSION-01/PILOT-01/DEV-01/AND-009` | Ergonomie | Défilement fluide (Scroll) liste > 50 oiseaux | NOT TESTED | |
| **AND-010** | `SESSION-01/PILOT-01/DEV-01/AND-010` | Modales | Centrage et défilement interne des fenêtres modales | NOT TESTED | |
| **AND-011** | `SESSION-01/PILOT-01/DEV-01/AND-011` | Navigation | Manipulation fluide du menu latéral tiroir (Drawer) | NOT TESTED | |
| **AND-012** | `SESSION-01/PILOT-01/DEV-01/AND-012` | Système | Geste/Touche Retour (fermeture modale sans quitter) | NOT TESTED | |
| **AND-013** | `SESSION-01/PILOT-01/DEV-01/AND-013` | Affichage | Bascule Portrait / Paysage et réactivité layout | NOT TESTED | |
| **AND-014** | `SESSION-01/PILOT-01/DEV-01/AND-014` | Métier | Création complète d'une fiche oiseau avec bague | NOT TESTED | |
| **AND-015** | `SESSION-01/PILOT-01/DEV-01/AND-015` | Métier | Modification d'une fiche oiseau existante | NOT TESTED | |
| **AND-016** | `SESSION-01/PILOT-01/DEV-01/AND-016` | Métier | Création cage/volière et affectation spatiale | NOT TESTED | |
| **AND-017** | `SESSION-01/PILOT-01/DEV-01/AND-017` | Métier | Formation d'un couple et consanguinité Wright | NOT TESTED | |
| **AND-018** | `SESSION-01/PILOT-01/DEV-01/AND-018` | Métier | Enregistrement calendrier ponte, incubation, mirage | NOT TESTED | |
| **AND-019** | `SESSION-01/PILOT-01/DEV-01/AND-019` | Métier | Saisie pesées nurserie et traitement sanitaire | NOT TESTED | |
| **AND-020** | `SESSION-01/PILOT-01/DEV-01/AND-020` | Métier | Saisie d'une dépense et enregistrement cession | NOT TESTED | |
| **AND-021** | `SESSION-01/PILOT-01/DEV-01/AND-021` | Cycle de Vie | Persistance après fermeture brutale (Swipe Kill) | NOT TESTED | |
| **AND-022** | `SESSION-01/PILOT-01/DEV-01/AND-022` | Cycle de Vie | Mise en veille prolongée (30 min) sans gel ni crash | NOT TESTED | |
| **AND-023** | `SESSION-01/PILOT-01/DEV-01/AND-023` | Multitâche | Maintien de saisie lors d'un appel téléphonique | NOT TESTED | |
| **AND-024** | `SESSION-01/PILOT-01/DEV-01/AND-024` | Sauvegarde | Export sauvegarde JSON sur stockage local téléphone | NOT TESTED | |
| **AND-025** | `SESSION-01/PILOT-01/DEV-01/AND-025` | Sauvegarde | Restauration sauvegarde JSON via gestionnaire | NOT TESTED | |
| **AND-026** | `SESSION-01/PILOT-01/DEV-01/AND-026` | Offline | Démarrage à froid en Mode Avion (coupure totale) | NOT TESTED | |
| **AND-027** | `SESSION-01/PILOT-01/DEV-01/AND-027` | Offline | Navigation intégrale et calculs génétiques offline | NOT TESTED | |
| **AND-028** | `SESSION-01/PILOT-01/DEV-01/AND-028` | Offline | Rétablissement réseau sans perte ni duplication | NOT TESTED | |
| **AND-029** | `SESSION-01/PILOT-01/DEV-01/AND-029` | Documents | Visualisation native attestation de cession PDF | NOT TESTED | |
| **AND-030** | `SESSION-01/PILOT-01/DEV-01/AND-030` | Multilingue | Bascule en Arabe avec inversion directionnelle RTL | NOT TESTED | |
| **AND-031** | `SESSION-01/PILOT-01/DEV-01/AND-031` | Licences | Affichage label "Plan GRATUIT" et modale PREMIUM | NOT TESTED | |
| **AND-032** | `SESSION-01/PILOT-01/DEV-01/AND-032` | Licences | Import fichier de licence `.lmse` et déblocage | NOT TESTED | |

**Total Session-01 :** PASS : `0` | FAIL : `0` | BLOCKED : `0` | NOT TESTED : `32`

---

## 3. MATRICE D'EXÉCUTION — SESSION-02 (PILOT-02 / DEV-02 Xiaomi)

- **Participant ID :** `PILOT-02`
- **Device ID :** `DEV-02` (Constructeur : Xiaomi | Modèle Réel : `[A_CONFIRMER]` | OS : `[A_CONFIRMER]`)
- **Navigateur :** Chrome Android `[A_CONFIRMER]`
- **Empreinte APK :** `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`

| Test ID | Clé Unifiée de Traçabilité | Catégorie | Intitulé du Contrôle Terrain | Résultat | Observations & Mesures |
|---|---|---|---|:---:|---|
| **AND-001** | `SESSION-02/PILOT-02/DEV-02/AND-001` | Installation | Téléchargement direct APK via Chrome Android | NOT TESTED | |
| **AND-002** | `SESSION-02/PILOT-02/DEV-02/AND-002` | Installation | Autorisation d'installation depuis cette source | NOT TESTED | |
| **AND-003** | `SESSION-02/PILOT-02/DEV-02/AND-003` | Installation | Installation complète paquet `com.birdacademy.app` | NOT TESTED | |
| **AND-004** | `SESSION-02/PILOT-02/DEV-02/AND-004` | Démarrage | Cold Boot chronométré (< 3,0s) | NOT TESTED | *(Chrono à consigner)* |
| **AND-005** | `SESSION-02/PILOT-02/DEV-02/AND-005` | Sécurité | Vérification des permissions système (0 abusive) | NOT TESTED | |
| **AND-006** | `SESSION-02/PILOT-02/DEV-02/AND-006` | Licences | Accès direct Dashboard mode FREE natif (0 popup) | NOT TESTED | |
| **AND-007** | `SESSION-02/PILOT-02/DEV-02/AND-007` | Ergonomie | Réactivité tactile générale sous éclairage volière | NOT TESTED | |
| **AND-008** | `SESSION-02/PILOT-02/DEV-02/AND-008` | Clavier | Clavier virtuel Gboard sans masquage bouton Valider | NOT TESTED | |
| **AND-009** | `SESSION-02/PILOT-02/DEV-02/AND-009` | Ergonomie | Défilement fluide (Scroll) liste > 50 oiseaux | NOT TESTED | |
| **AND-010** | `SESSION-02/PILOT-02/DEV-02/AND-010` | Modales | Centrage et défilement interne des fenêtres modales | NOT TESTED | |
| **AND-011** | `SESSION-02/PILOT-02/DEV-02/AND-011` | Navigation | Manipulation fluide du menu latéral tiroir (Drawer) | NOT TESTED | |
| **AND-012** | `SESSION-02/PILOT-02/DEV-02/AND-012` | Système | Geste/Touche Retour (fermeture modale sans quitter) | NOT TESTED | |
| **AND-013** | `SESSION-02/PILOT-02/DEV-02/AND-013` | Affichage | Bascule Portrait / Paysage et réactivité layout | NOT TESTED | |
| **AND-014** | `SESSION-02/PILOT-02/DEV-02/AND-014` | Métier | Création complète d'une fiche oiseau avec bague | NOT TESTED | |
| **AND-015** | `SESSION-02/PILOT-02/DEV-02/AND-015` | Métier | Modification d'une fiche oiseau existante | NOT TESTED | |
| **AND-016** | `SESSION-02/PILOT-02/DEV-02/AND-016` | Métier | Création cage/volière et affectation spatiale | NOT TESTED | |
| **AND-017** | `SESSION-02/PILOT-02/DEV-02/AND-017` | Métier | Formation d'un couple et consanguinité Wright | NOT TESTED | |
| **AND-018** | `SESSION-02/PILOT-02/DEV-02/AND-018` | Métier | Enregistrement calendrier ponte, incubation, mirage | NOT TESTED | |
| **AND-019** | `SESSION-02/PILOT-02/DEV-02/AND-019` | Métier | Saisie pesées nurserie et traitement sanitaire | NOT TESTED | |
| **AND-020** | `SESSION-02/PILOT-02/DEV-02/AND-020` | Métier | Saisie d'une dépense et enregistrement cession | NOT TESTED | |
| **AND-021** | `SESSION-02/PILOT-02/DEV-02/AND-021` | Cycle de Vie | Persistance après fermeture brutale (Swipe Kill) | NOT TESTED | |
| **AND-022** | `SESSION-02/PILOT-02/DEV-02/AND-022` | Cycle de Vie | Mise en veille prolongée (30 min) sans gel ni crash | NOT TESTED | |
| **AND-023** | `SESSION-02/PILOT-02/DEV-02/AND-023` | Multitâche | Maintien de saisie lors d'un appel téléphonique | NOT TESTED | |
| **AND-024** | `SESSION-02/PILOT-02/DEV-02/AND-024` | Sauvegarde | Export sauvegarde JSON sur stockage local téléphone | NOT TESTED | |
| **AND-025** | `SESSION-02/PILOT-02/DEV-02/AND-025` | Sauvegarde | Restauration sauvegarde JSON via gestionnaire | NOT TESTED | |
| **AND-026** | `SESSION-02/PILOT-02/DEV-02/AND-026` | Offline | Démarrage à froid en Mode Avion (coupure totale) | NOT TESTED | |
| **AND-027** | `SESSION-02/PILOT-02/DEV-02/AND-027` | Offline | Navigation intégrale et calculs génétiques offline | NOT TESTED | |
| **AND-028** | `SESSION-02/PILOT-02/DEV-02/AND-028` | Offline | Rétablissement réseau sans perte ni duplication | NOT TESTED | |
| **AND-029** | `SESSION-02/PILOT-02/DEV-02/AND-029` | Documents | Visualisation native attestation de cession PDF | NOT TESTED | |
| **AND-030** | `SESSION-02/PILOT-02/DEV-02/AND-030` | Multilingue | Bascule en Arabe avec inversion directionnelle RTL | NOT TESTED | |
| **AND-031** | `SESSION-02/PILOT-02/DEV-02/AND-031` | Licences | Affichage label "Plan GRATUIT" et modale PREMIUM | NOT TESTED | |
| **AND-032** | `SESSION-02/PILOT-02/DEV-02/AND-032` | Licences | Import fichier de licence `.lmse` et déblocage | NOT TESTED | |

**Total Session-02 :** PASS : `0` | FAIL : `0` | BLOCKED : `0` | NOT TESTED : `32`

---

## 4. MATRICE D'EXÉCUTION — SESSION-03 (PILOT-03 / DEV-[PREMIER TERMINAL])

- **Participant ID :** `PILOT-03`
- **Device ID :** `DEV-[À RENSEIGNER AVANT DÉPART]` (`[A_CONFIRMER]`)
- **Empreinte APK :** `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`

| Test ID | Clé Unifiée de Traçabilité | Catégorie | Intitulé du Contrôle Terrain | Résultat | Observations & Mesures |
|---|---|---|---|:---:|---|
| **AND-001** à **AND-032** | `SESSION-03/PILOT-03/DEV-X/AND-xxx` | (Ensemble des 32 contrôles) | Identique grille officielle | **NOT TESTED** | *(32 contrôles à réaliser)* |

**Total Session-03 :** PASS : `0` | FAIL : `0` | BLOCKED : `0` | NOT TESTED : `32`

---

## 5. MATRICE D'EXÉCUTION — SESSION-04 (PILOT-03 / DEV-[SECOND TERMINAL])

- **Participant ID :** `PILOT-03`
- **Device ID :** `DEV-[SECOND TERMINAL CROISÉ]` (`[A_CONFIRMER]`)
- **Empreinte APK :** `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`

| Test ID | Clé Unifiée de Traçabilité | Catégorie | Intitulé du Contrôle Terrain | Résultat | Observations & Mesures |
|---|---|---|---|:---:|---|
| **AND-001** à **AND-032** | `SESSION-04/PILOT-03/DEV-Y/AND-xxx` | (Ensemble des 32 contrôles) | Identique grille officielle | **NOT TESTED** | *(32 contrôles à réaliser)* |

**Total Session-04 :** PASS : `0` | FAIL : `0` | BLOCKED : `0` | NOT TESTED : `32`

---

## 6. CONSOLIDATION GLOBALE DE LA CAMPAGNE TERRAIN

| Catégorie de Contrôle | Prévu (4 Sessions) | Réalisé Terrain | PASS | FAIL | BLOCKED | NOT TESTED |
|---|---:|---:|---:|---:|---:|---:|
| Installation & Boot (`AND-001` à `AND-004`) | 16 | 0 | 0 | 0 | 0 | **16** |
| Mode FREE & Ergonomie (`AND-005` à `AND-013`) | 36 | 0 | 0 | 0 | 0 | **36** |
| Métier Élevage (`AND-014` à `AND-020`) | 28 | 0 | 0 | 0 | 0 | **28** |
| Cycle de Vie & Multitâche (`AND-021` à `AND-023`) | 12 | 0 | 0 | 0 | 0 | **12** |
| Sauvegarde & Restauration (`AND-024` à `AND-025`) | 8 | 0 | 0 | 0 | 0 | **8** |
| Mode Hors-Ligne (`AND-026` à `AND-028`) | 12 | 0 | 0 | 0 | 0 | **12** |
| Documents PDF (`AND-029`) | 4 | 0 | 0 | 0 | 0 | **4** |
| Multilingue RTL (`AND-030`) | 4 | 0 | 0 | 0 | 0 | **4** |
| Licences & Upgrade (`AND-031` à `AND-032`) | 8 | 0 | 0 | 0 | 0 | **8** |
| **TOTAL GÉNÉRAL** | **128** | **0** | **0** | **0** | **0** | **128** |

**Taux de couverture physique exécutée :** **0,0%**  
**Taux de succès physique :** **0,0%**  
**Statut Global de Validation :** **`PHYSICAL VALIDATION PENDING`**
