# MATRICE OPÉRATIONNELLE DES SESSIONS DE RECETTE TERRAIN ANDROID
## MISSION ANDROID-FIELD-EXECUTION-001 — VOLIÈRE MANAGER v1.3.6
### Document de Recueil des Résultats Sessionnels

**Cadre de référence :** [`QA_COMMERCIAL_DECISION_002_ANDROID_PARTICIPANT_MATRIX.md`](file:///d:/app%20canaris/28+/QA_COMMERCIAL_DECISION_002_ANDROID_PARTICIPANT_MATRIX.md)  
**Binaire Déployé :** `dist_binaries/Bird-Academy-User.apk` (SHA-256 : `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`)  
**Statut Global Initial :** Strictement `NOT TESTED` sur 100% des points de contrôle.  
**Règle d'Or QA :** Tout résultat doit être consigné au vu d'une observation physique réelle. Zéro extrapolation depuis des tests automatisés.

---

## 1. REGISTRE DES SESSIONS TERRAIN

| Session ID | Participant | Terminal Attribué | Date Réelle | Heure Début | Heure Fin | Réseau / Mode | Statut Global |
|---|---|---|---|---|---|---|---|
| **SESSION-01** | PILOT-01 | DEV-01 (Samsung) | `[A_CONFIRMER]` | `[--:--]` | `[--:--]` | Mixte (4G/Wi-Fi/Avion) | NOT TESTED |
| **SESSION-02** | PILOT-02 | DEV-02 (Xiaomi) | `[A_CONFIRMER]` | `[--:--]` | `[--:--]` | Mixte (4G/Wi-Fi/Avion) | NOT TESTED |
| **SESSION-03** | PILOT-03 | DEV-[À CONFIRMER] | `[A_CONFIRMER]` | `[--:--]` | `[--:--]` | Mixte (4G/Wi-Fi/Avion) | NOT TESTED |
| **SESSION-04** | PILOT-03 | DEV-[SECOND TERMINAL] | `[A_CONFIRMER]` | `[--:--]` | `[--:--]` | Mixte (4G/Wi-Fi/Avion) | NOT TESTED *(Provision)* |

---

## 2. MATRICE D'EXÉCUTION — SESSION-01 (PILOT-01 / DEV-01 Samsung)

- **Participant ID :** `PILOT-01`
- **Device ID :** `DEV-01` (Constructeur : Samsung | Modèle Réel : `[A_CONFIRMER]` | OS : `[A_CONFIRMER]`)
- **Navigateur :** Chrome Android `[VERSION_CHROME]`
- **Empreinte APK :** `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`

| Test ID | Clé Unifiée de Traçabilité | Catégorie | Intitulé du Contrôle Terrain | Résultat | Observations & Mesures |
|---|---|---|---|---|---|
| **AND-001** | `SESSION-01/PILOT-01/DEV-01/AND-001` | Installation | Téléchargement direct du paquet APK via le navigateur Chrome Android | NOT TESTED | |
| **AND-002** | `SESSION-01/PILOT-01/DEV-01/AND-002` | Installation | Autorisation d'installation des applications depuis des sources inconnues | NOT TESTED | |
| **AND-003** | `SESSION-01/PILOT-01/DEV-01/AND-003` | Installation | Installation complète et sans erreur du paquet `com.birdacademy.app` | NOT TESTED | |
| **AND-004** | `SESSION-01/PILOT-01/DEV-01/AND-004` | Démarrage | Premier démarrage à froid (Cold Boot < 3s mesuré au chronomètre) | NOT TESTED | *(Mesure exacte à consigner)* |
| **AND-005** | `SESSION-01/PILOT-01/DEV-01/AND-005` | Sécurité | Vérification des permissions système (aucune permission abusive demandée) | NOT TESTED | |
| **AND-006** | `SESSION-01/PILOT-01/DEV-01/AND-006` | Accès & Licences | Accès direct au tableau de bord en mode FREE natif sans blocage | NOT TESTED | |
| **AND-007** | `SESSION-01/PILOT-01/DEV-01/AND-007` | Interface Tactile | Réactivité tactile générale des boutons et onglets de navigation | NOT TESTED | |
| **AND-008** | `SESSION-01/PILOT-01/DEV-01/AND-008` | Interface Tactile | Saisie au clavier virtuel (Samsung) sans masquage du bouton Valider | NOT TESTED | |
| **AND-009** | `SESSION-01/PILOT-01/DEV-01/AND-009` | Ergonomie | Défilement fluide (Scroll) d'une liste volumineuse (> 50 oiseaux) | NOT TESTED | |
| **AND-010** | `SESSION-01/PILOT-01/DEV-01/AND-010` | Interface Tactile | Affichage, centrage et défilement interne des fenêtres modales | NOT TESTED | |
| **AND-011** | `SESSION-01/PILOT-01/DEV-01/AND-011` | Navigation | Manipulation fluide du menu latéral tiroir (Drawer de navigation) | NOT TESTED | |
| **AND-012** | `SESSION-01/PILOT-01/DEV-01/AND-012` | Système Android | Comportement de la touche physique / geste Retour (fermeture modale sans exit) | NOT TESTED | |
| **AND-013** | `SESSION-01/PILOT-01/DEV-01/AND-013` | Ergonomie | Bascule d'orientation Portrait / Paysage et réactivité de la mise en page | NOT TESTED | |
| **AND-014** | `SESSION-01/PILOT-01/DEV-01/AND-014` | Métier Élevage | Création complète d'une fiche oiseau (bague, sexe, couleur, cage) | NOT TESTED | |
| **AND-015** | `SESSION-01/PILOT-01/DEV-01/AND-015` | Métier Élevage | Modification d'une fiche d'oiseau existante (statut, notes médicales) | NOT TESTED | |
| **AND-016** | `SESSION-01/PILOT-01/DEV-01/AND-016` | Métier Élevage | Création d'une cage/volière et affectation spatiale des oiseaux | NOT TESTED | |
| **AND-017** | `SESSION-01/PILOT-01/DEV-01/AND-017` | Métier Élevage | Formation d'un couple reproducteur et contrôle de compatibilité | NOT TESTED | |
| **AND-018** | `SESSION-01/PILOT-01/DEV-01/AND-018` | Métier Élevage | Enregistrement du calendrier de ponte, couvaison et résultat du mirage | NOT TESTED | |
| **AND-019** | `SESSION-01/PILOT-01/DEV-01/AND-019` | Métier Élevage | Saisie des pesées en nurserie et enregistrement d'un traitement sanitaire | NOT TESTED | |
| **AND-020** | `SESSION-01/PILOT-01/DEV-01/AND-020` | Métier Élevage | Saisie d'une dépense de graines et enregistrement d'une vente d'oiseau | NOT TESTED | |
| **AND-021** | `SESSION-01/PILOT-01/DEV-01/AND-021` | Persistance | Fermeture brutale (Swipe Kill) puis réouverture avec données intactes | NOT TESTED | |
| **AND-022** | `SESSION-01/PILOT-01/DEV-01/AND-022` | Cycle de Vie | Mise en veille prolongée (30 min) puis réactivation sans gel ni crash | NOT TESTED | |
| **AND-023** | `SESSION-01/PILOT-01/DEV-01/AND-023` | Multitâche | Réception d'un appel téléphonique ou notification pendant la saisie | NOT TESTED | |
| **AND-024** | `SESSION-01/PILOT-01/DEV-01/AND-024` | Sauvegarde | Export de la sauvegarde complète JSON sur le stockage local du téléphone | NOT TESTED | |
| **AND-025** | `SESSION-01/PILOT-01/DEV-01/AND-025` | Sauvegarde | Restauration d'une sauvegarde JSON depuis le gestionnaire de fichiers | NOT TESTED | |
| **AND-026** | `SESSION-01/PILOT-01/DEV-01/AND-026` | Mode Hors-Ligne | Démarrage à froid complet en Mode Avion (Wi-Fi et données coupés) | NOT TESTED | |
| **AND-027** | `SESSION-01/PILOT-01/DEV-01/AND-027` | Mode Hors-Ligne | Navigation intégrale et calculs génétiques hors-ligne (zéro blocage réseau) | NOT TESTED | |
| **AND-028** | `SESSION-01/PILOT-01/DEV-01/AND-028` | Mode Hors-Ligne | Rétablissement du réseau sans perte, sans doublon et sans conflit | NOT TESTED | |
| **AND-029** | `SESSION-01/PILOT-01/DEV-01/AND-029` | Documents & PDF | Génération et visualisation native d'un rapport PDF ou attestation de cession | NOT TESTED | |
| **AND-030** | `SESSION-01/PILOT-01/DEV-01/AND-030` | Multilingue | Bascule vers la langue Arabe avec inversion RTL correcte de l'interface | NOT TESTED | |
| **AND-031** | `SESSION-01/PILOT-01/DEV-01/AND-031` | Licences | Affichage clair du statut FREE et de la modale d'information PREMIUM | NOT TESTED | |
| **AND-032** | `SESSION-01/PILOT-01/DEV-01/AND-032` | Licences | Import d'un kit de licence `.lmse` et déblocage effectif des fonctionnalités | NOT TESTED | |

**Synthèse Session-01 :** PASS : `0` | FAIL : `0` | BLOCKED : `0` | NOT TESTED : `32`

---

## 3. MATRICE D'EXÉCUTION — SESSION-02 (PILOT-02 / DEV-02 Xiaomi)

- **Participant ID :** `PILOT-02`
- **Device ID :** `DEV-02` (Constructeur : Xiaomi | Modèle Réel : `[A_CONFIRMER]` | OS : `[A_CONFIRMER]`)
- **Navigateur :** Chrome Android `[VERSION_CHROME]`
- **Empreinte APK :** `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`

| Test ID | Clé Unifiée de Traçabilité | Catégorie | Intitulé du Contrôle Terrain | Résultat | Observations & Mesures |
|---|---|---|---|---|---|
| **AND-001** | `SESSION-02/PILOT-02/DEV-02/AND-001` | Installation | Téléchargement direct du paquet APK via le navigateur Chrome Android | NOT TESTED | |
| **AND-002** | `SESSION-02/PILOT-02/DEV-02/AND-002` | Installation | Autorisation d'installation des applications depuis des sources inconnues | NOT TESTED | |
| **AND-003** | `SESSION-02/PILOT-02/DEV-02/AND-003` | Installation | Installation complète et sans erreur du paquet `com.birdacademy.app` | NOT TESTED | |
| **AND-004** | `SESSION-02/PILOT-02/DEV-02/AND-004` | Démarrage | Premier démarrage à froid (Cold Boot < 3s mesuré au chronomètre) | NOT TESTED | *(Mesure exacte à consigner)* |
| **AND-005** | `SESSION-02/PILOT-02/DEV-02/AND-005` | Sécurité | Vérification des permissions système (aucune permission abusive demandée) | NOT TESTED | |
| **AND-006** | `SESSION-02/PILOT-02/DEV-02/AND-006` | Accès & Licences | Accès direct au tableau de bord en mode FREE natif sans blocage | NOT TESTED | |
| **AND-007** | `SESSION-02/PILOT-02/DEV-02/AND-007` | Interface Tactile | Réactivité tactile générale des boutons et onglets de navigation | NOT TESTED | |
| **AND-008** | `SESSION-02/PILOT-02/DEV-02/AND-008` | Interface Tactile | Saisie au clavier virtuel (Gboard) sans masquage du bouton Valider | NOT TESTED | |
| **AND-009** | `SESSION-02/PILOT-02/DEV-02/AND-009` | Ergonomie | Défilement fluide (Scroll) d'une liste volumineuse (> 50 oiseaux) | NOT TESTED | |
| **AND-010** | `SESSION-02/PILOT-02/DEV-02/AND-010` | Interface Tactile | Affichage, centrage et défilement interne des fenêtres modales | NOT TESTED | |
| **AND-011** | `SESSION-02/PILOT-02/DEV-02/AND-011` | Navigation | Manipulation fluide du menu latéral tiroir (Drawer de navigation) | NOT TESTED | |
| **AND-012** | `SESSION-02/PILOT-02/DEV-02/AND-012` | Système Android | Comportement de la touche physique / geste Retour (fermeture modale sans exit) | NOT TESTED | |
| **AND-013** | `SESSION-02/PILOT-02/DEV-02/AND-013` | Ergonomie | Bascule d'orientation Portrait / Paysage et réactivité de la mise en page | NOT TESTED | |
| **AND-014** | `SESSION-02/PILOT-02/DEV-02/AND-014` | Métier Élevage | Création complète d'une fiche oiseau (bague, sexe, couleur, cage) | NOT TESTED | |
| **AND-015** | `SESSION-02/PILOT-02/DEV-02/AND-015` | Métier Élevage | Modification d'une fiche d'oiseau existante (statut, notes médicales) | NOT TESTED | |
| **AND-016** | `SESSION-02/PILOT-02/DEV-02/AND-016` | Métier Élevage | Création d'une cage/volière et affectation spatiale des oiseaux | NOT TESTED | |
| **AND-017** | `SESSION-02/PILOT-02/DEV-02/AND-017` | Métier Élevage | Formation d'un couple reproducteur et contrôle de compatibilité | NOT TESTED | |
| **AND-018** | `SESSION-02/PILOT-02/DEV-02/AND-018` | Métier Élevage | Enregistrement du calendrier de ponte, couvaison et résultat du mirage | NOT TESTED | |
| **AND-019** | `SESSION-02/PILOT-02/DEV-02/AND-019` | Métier Élevage | Saisie des pesées en nurserie et enregistrement d'un traitement sanitaire | NOT TESTED | |
| **AND-020** | `SESSION-02/PILOT-02/DEV-02/AND-020` | Métier Élevage | Saisie d'une dépense de graines et enregistrement d'une vente d'oiseau | NOT TESTED | |
| **AND-021** | `SESSION-02/PILOT-02/DEV-02/AND-021` | Persistance | Fermeture brutale (Swipe Kill) puis réouverture avec données intactes | NOT TESTED | |
| **AND-022** | `SESSION-02/PILOT-02/DEV-02/AND-022` | Cycle de Vie | Mise en veille prolongée (30 min) puis réactivation sans gel ni crash | NOT TESTED | |
| **AND-023** | `SESSION-02/PILOT-02/DEV-02/AND-023` | Multitâche | Réception d'un appel téléphonique ou notification pendant la saisie | NOT TESTED | |
| **AND-024** | `SESSION-02/PILOT-02/DEV-02/AND-024` | Sauvegarde | Export de la sauvegarde complète JSON sur le stockage local du téléphone | NOT TESTED | |
| **AND-025** | `SESSION-02/PILOT-02/DEV-02/AND-025` | Sauvegarde | Restauration d'une sauvegarde JSON depuis le gestionnaire de fichiers | NOT TESTED | |
| **AND-026** | `SESSION-02/PILOT-02/DEV-02/AND-026` | Mode Hors-Ligne | Démarrage à froid complet en Mode Avion (Wi-Fi et données coupés) | NOT TESTED | |
| **AND-027** | `SESSION-02/PILOT-02/DEV-02/AND-027` | Mode Hors-Ligne | Navigation intégrale et calculs génétiques hors-ligne (zéro blocage réseau) | NOT TESTED | |
| **AND-028** | `SESSION-02/PILOT-02/DEV-02/AND-028` | Mode Hors-Ligne | Rétablissement du réseau sans perte, sans doublon et sans conflit | NOT TESTED | |
| **AND-029** | `SESSION-02/PILOT-02/DEV-02/AND-029` | Documents & PDF | Génération et visualisation native d'un rapport PDF ou attestation de cession | NOT TESTED | |
| **AND-030** | `SESSION-02/PILOT-02/DEV-02/AND-030` | Multilingue | Bascule vers la langue Arabe avec inversion RTL correcte de l'interface | NOT TESTED | |
| **AND-031** | `SESSION-02/PILOT-02/DEV-02/AND-031` | Licences | Affichage clair du statut FREE et de la modale d'information PREMIUM | NOT TESTED | |
| **AND-032** | `SESSION-02/PILOT-02/DEV-02/AND-032` | Licences | Import d'un kit de licence `.lmse` et déblocage effectif des fonctionnalités | NOT TESTED | |

**Synthèse Session-02 :** PASS : `0` | FAIL : `0` | BLOCKED : `0` | NOT TESTED : `32`

---

## 4. MATRICE D'EXÉCUTION — SESSION-03 (PILOT-03 / DEV-[À CONFIRMER])

- **Participant ID :** `PILOT-03`
- **Device ID :** `DEV-[À RENSEIGNER AVANT DÉMARRAGE]` (DEV-01 ou DEV-02)
- **Navigateur :** Chrome Android `[VERSION_CHROME]`
- **Empreinte APK :** `20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63`

| Test ID | Clé Unifiée de Traçabilité | Catégorie | Intitulé du Contrôle Terrain | Résultat | Observations & Mesures |
|---|---|---|---|---|---|
| **AND-001** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-001` | Installation | Téléchargement direct du paquet APK via le navigateur Chrome Android | NOT TESTED | |
| **AND-002** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-002` | Installation | Autorisation d'installation des applications depuis des sources inconnues | NOT TESTED | |
| **AND-003** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-003` | Installation | Installation complète et sans erreur du paquet `com.birdacademy.app` | NOT TESTED | |
| **AND-004** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-004` | Démarrage | Premier démarrage à froid (Cold Boot < 3s mesuré au chronomètre) | NOT TESTED | *(Mesure exacte à consigner)* |
| **AND-005** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-005` | Sécurité | Vérification des permissions système (aucune permission abusive demandée) | NOT TESTED | |
| **AND-006** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-006` | Accès & Licences | Accès direct au tableau de bord en mode FREE natif sans blocage | NOT TESTED | |
| **AND-007** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-007` | Interface Tactile | Réactivité tactile générale des boutons et onglets de navigation | NOT TESTED | |
| **AND-008** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-008` | Interface Tactile | Saisie au clavier virtuel sans masquage du bouton Valider | NOT TESTED | |
| **AND-009** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-009` | Ergonomie | Défilement fluide (Scroll) d'une liste volumineuse (> 50 oiseaux) | NOT TESTED | |
| **AND-010** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-010` | Interface Tactile | Affichage, centrage et défilement interne des fenêtres modales | NOT TESTED | |
| **AND-011** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-011` | Navigation | Manipulation fluide du menu latéral tiroir (Drawer de navigation) | NOT TESTED | |
| **AND-012** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-012` | Système Android | Comportement de la touche physique / geste Retour (fermeture modale sans exit) | NOT TESTED | |
| **AND-013** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-013` | Ergonomie | Bascule d'orientation Portrait / Paysage et réactivité de la mise en page | NOT TESTED | |
| **AND-014** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-014` | Métier Élevage | Création complète d'une fiche oiseau (bague, sexe, couleur, cage) | NOT TESTED | |
| **AND-015** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-015` | Métier Élevage | Modification d'une fiche d'oiseau existante (statut, notes médicales) | NOT TESTED | |
| **AND-016** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-016` | Métier Élevage | Création d'une cage/volière et affectation spatiale des oiseaux | NOT TESTED | |
| **AND-017** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-017` | Métier Élevage | Formation d'un couple reproducteur et contrôle de compatibilité | NOT TESTED | |
| **AND-018** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-018` | Métier Élevage | Enregistrement du calendrier de ponte, couvaison et résultat du mirage | NOT TESTED | |
| **AND-019** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-019` | Métier Élevage | Saisie des pesées en nurserie et enregistrement d'un traitement sanitaire | NOT TESTED | |
| **AND-020** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-020` | Métier Élevage | Saisie d'une dépense de graines et enregistrement d'une vente d'oiseau | NOT TESTED | |
| **AND-021** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-021` | Persistance | Fermeture brutale (Swipe Kill) puis réouverture avec données intactes | NOT TESTED | |
| **AND-022** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-022` | Cycle de Vie | Mise en veille prolongée (30 min) puis réactivation sans gel ni crash | NOT TESTED | |
| **AND-023** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-023` | Multitâche | Réception d'un appel téléphonique ou notification pendant la saisie | NOT TESTED | |
| **AND-024** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-024` | Sauvegarde | Export de la sauvegarde complète JSON sur le stockage local du téléphone | NOT TESTED | |
| **AND-025** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-025` | Sauvegarde | Restauration d'une sauvegarde JSON depuis le gestionnaire de fichiers | NOT TESTED | |
| **AND-026** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-026` | Mode Hors-Ligne | Démarrage à froid complet en Mode Avion (Wi-Fi et données coupés) | NOT TESTED | |
| **AND-027** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-027` | Mode Hors-Ligne | Navigation intégrale et calculs génétiques hors-ligne (zéro blocage réseau) | NOT TESTED | |
| **AND-028** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-028` | Mode Hors-Ligne | Rétablissement du réseau sans perte, sans doublon et sans conflit | NOT TESTED | |
| **AND-029** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-029` | Documents & PDF | Génération et visualisation native d'un rapport PDF ou attestation de cession | NOT TESTED | |
| **AND-030** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-030` | Multilingue | Bascule vers la langue Arabe avec inversion RTL correcte de l'interface | NOT TESTED | |
| **AND-031** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-031` | Licences | Affichage clair du statut FREE et de la modale d'information PREMIUM | NOT TESTED | |
| **AND-032** | `SESSION-03/PILOT-03/DEV-[CONF]/AND-032` | Licences | Import d'un kit de licence `.lmse` et déblocage effectif des fonctionnalités | NOT TESTED | |

**Synthèse Session-03 :** PASS : `0` | FAIL : `0` | BLOCKED : `0` | NOT TESTED : `32`

---

## 5. MATRICE D'EXÉCUTION — SESSION-04 (PROVISION MULTI-TERMINAL : PILOT-03 / DEV-02)

*(Activée uniquement si PILOT-03 teste l'application sur le second appareil)*

| Test ID | Clé Unifiée de Traçabilité | Catégorie | Intitulé du Contrôle Terrain | Résultat | Observations & Mesures |
|---|---|---|---|---|---|
| **AND-001** | `SESSION-04/PILOT-03/DEV-02/AND-001` | Installation | Téléchargement direct du paquet APK via le navigateur Chrome Android | NOT TESTED | |
| **AND-002** | `SESSION-04/PILOT-03/DEV-02/AND-002` | Installation | Autorisation d'installation des applications depuis des sources inconnues | NOT TESTED | |
| **AND-003** | `SESSION-04/PILOT-03/DEV-02/AND-003` | Installation | Installation complète et sans erreur du paquet `com.birdacademy.app` | NOT TESTED | |
| **AND-004** | `SESSION-04/PILOT-03/DEV-02/AND-004` | Démarrage | Premier démarrage à froid (Cold Boot < 3s mesuré au chronomètre) | NOT TESTED | *(Mesure exacte à consigner)* |
| **AND-005** | `SESSION-04/PILOT-03/DEV-02/AND-005` | Sécurité | Vérification des permissions système (aucune permission abusive demandée) | NOT TESTED | |
| **AND-006** | `SESSION-04/PILOT-03/DEV-02/AND-006` | Accès & Licences | Accès direct au tableau de bord en mode FREE natif sans blocage | NOT TESTED | |
| **AND-007** | `SESSION-04/PILOT-03/DEV-02/AND-007` | Interface Tactile | Réactivité tactile générale des boutons et onglets de navigation | NOT TESTED | |
| **AND-008** | `SESSION-04/PILOT-03/DEV-02/AND-008` | Interface Tactile | Saisie au clavier virtuel (Gboard) sans masquage du bouton Valider | NOT TESTED | |
| **AND-009** | `SESSION-04/PILOT-03/DEV-02/AND-009` | Ergonomie | Défilement fluide (Scroll) d'une liste volumineuse (> 50 oiseaux) | NOT TESTED | |
| **AND-010** | `SESSION-04/PILOT-03/DEV-02/AND-010` | Interface Tactile | Affichage, centrage et défilement interne des fenêtres modales | NOT TESTED | |
| **AND-011** | `SESSION-04/PILOT-03/DEV-02/AND-011` | Navigation | Manipulation fluide du menu latéral tiroir (Drawer de navigation) | NOT TESTED | |
| **AND-012** | `SESSION-04/PILOT-03/DEV-02/AND-012` | Système Android | Comportement de la touche physique / geste Retour (fermeture modale sans exit) | NOT TESTED | |
| **AND-013** | `SESSION-04/PILOT-03/DEV-02/AND-013` | Ergonomie | Bascule d'orientation Portrait / Paysage et réactivité de la mise en page | NOT TESTED | |
| **AND-014** | `SESSION-04/PILOT-03/DEV-02/AND-014` | Métier Élevage | Création complète d'une fiche oiseau (bague, sexe, couleur, cage) | NOT TESTED | |
| **AND-015** | `SESSION-04/PILOT-03/DEV-02/AND-015` | Métier Élevage | Modification d'une fiche d'oiseau existante (statut, notes médicales) | NOT TESTED | |
| **AND-016** | `SESSION-04/PILOT-03/DEV-02/AND-016` | Métier Élevage | Création d'une cage/volière et affectation spatiale des oiseaux | NOT TESTED | |
| **AND-017** | `SESSION-04/PILOT-03/DEV-02/AND-017` | Métier Élevage | Formation d'un couple reproducteur et contrôle de compatibilité | NOT TESTED | |
| **AND-018** | `SESSION-04/PILOT-03/DEV-02/AND-018` | Métier Élevage | Enregistrement du calendrier de ponte, couvaison et résultat du mirage | NOT TESTED | |
| **AND-019** | `SESSION-04/PILOT-03/DEV-02/AND-019` | Métier Élevage | Saisie des pesées en nurserie et enregistrement d'un traitement sanitaire | NOT TESTED | |
| **AND-020** | `SESSION-04/PILOT-03/DEV-02/AND-020` | Métier Élevage | Saisie d'une dépense de graines et enregistrement d'une vente d'oiseau | NOT TESTED | |
| **AND-021** | `SESSION-04/PILOT-03/DEV-02/AND-021` | Persistance | Fermeture brutale (Swipe Kill) puis réouverture avec données intactes | NOT TESTED | |
| **AND-022** | `SESSION-04/PILOT-03/DEV-02/AND-022` | Cycle de Vie | Mise en veille prolongée (30 min) puis réactivation sans gel ni crash | NOT TESTED | |
| **AND-023** | `SESSION-04/PILOT-03/DEV-02/AND-023` | Multitâche | Réception d'un appel téléphonique ou notification pendant la saisie | NOT TESTED | |
| **AND-024** | `SESSION-04/PILOT-03/DEV-02/AND-024` | Sauvegarde | Export de la sauvegarde complète JSON sur le stockage local du téléphone | NOT TESTED | |
| **AND-025** | `SESSION-04/PILOT-03/DEV-02/AND-025` | Sauvegarde | Restauration d'une sauvegarde JSON depuis le gestionnaire de fichiers | NOT TESTED | |
| **AND-026** | `SESSION-04/PILOT-03/DEV-02/AND-026` | Mode Hors-Ligne | Démarrage à froid complet en Mode Avion (Wi-Fi et données coupés) | NOT TESTED | |
| **AND-027** | `SESSION-04/PILOT-03/DEV-02/AND-027` | Mode Hors-Ligne | Navigation intégrale et calculs génétiques hors-ligne (zéro blocage réseau) | NOT TESTED | |
| **AND-028** | `SESSION-04/PILOT-03/DEV-02/AND-028` | Mode Hors-Ligne | Rétablissement du réseau sans perte, sans doublon et sans conflit | NOT TESTED | |
| **AND-029** | `SESSION-04/PILOT-03/DEV-02/AND-029` | Documents & PDF | Génération et visualisation native d'un rapport PDF ou attestation de cession | NOT TESTED | |
| **AND-030** | `SESSION-04/PILOT-03/DEV-02/AND-030` | Multilingue | Bascule vers la langue Arabe avec inversion RTL correcte de l'interface | NOT TESTED | |
| **AND-031** | `SESSION-04/PILOT-03/DEV-02/AND-031` | Licences | Affichage clair du statut FREE et de la modale d'information PREMIUM | NOT TESTED | |
| **AND-032** | `SESSION-04/PILOT-03/DEV-02/AND-032` | Licences | Import d'un kit de licence `.lmse` et déblocage effectif des fonctionnalités | NOT TESTED | |

**Synthèse Session-04 :** PASS : `0` | FAIL : `0` | BLOCKED : `0` | NOT TESTED : `32`

---

## 6. SYNTHÈSE DES VOLUMES D'EXÉCUTION

| Métrique | Configuration 3 Sessions | Configuration 4 Sessions |
|---|---:|---:|
| Nombre d'exécutions de contrôles prévues | 96 | 128 |
| Contrôles validés (PASS) | **0** | **0** |
| Contrôles en échec (FAIL) | **0** | **0** |
| Contrôles bloqués (BLOCKED) | **0** | **0** |
| Contrôles non exécutés (NOT TESTED) | **96 (100%)** | **128 (100%)** |
