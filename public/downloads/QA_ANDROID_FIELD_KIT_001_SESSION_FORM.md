# FICHE SESSION IMPRIMABLE — RECETTE TERRAIN ANDROID
## Kit Opérationnel pour la Validation en Volière
### Bird Academy Enterprise — Volière Manager v1.3.6

> [!NOTE]
> **Instructions pour l'impression :** Imprimez une copie de cette fiche pour chaque session réalisée.  
> Un test ne peut recevoir qu'un seul statut : **PASS**, **FAIL**, **BLOCKED** ou **NOT TESTED**.  
> Le statut initial de départ est strictement **NOT TESTED** sur toute la grille.

---

# VOLET 1 : FICHE DE SESSION — SESSION-01 (PILOT-01 + DEV-01 Samsung)

## 1. IDENTIFICATION DU TERMINAL & DU PARTICIPANT
- **Session ID :** `SESSION-01`
- **Participant ID :** `PILOT-01` | Profil : Éleveur pilote `[A_CONFIRMER]`
- **Device ID :** `DEV-01`
- **Fabricant :** Samsung
- **Modèle exact :** `[A_CONFIRMER]` *(ex. Galaxy A54 5G SM-A546B)*
- **Version Android :** `[A_CONFIRMER]` *(ex. Android 13 ou 14)*
- **Correctif de sécurité :** `[A_CONFIRMER]`
- **Version Chrome :** `[A_CONFIRMER]`
- **Date de la session :** `[AAAA-MM-JJ]`
- **Heure de début :** `[HH:MM]`
- **Heure de fin :** `[HH:MM]`

## 2. CHECKLIST PRÉALABLE AVANT TEST
- [ ] Smartphone chargé à plus de 80%
- [ ] Fichier APK officiel disponible (`dist_binaries/Bird-Academy-User.apk`)
- [ ] Empreinte SHA-256 de l'APK vérifiée (`20AD96A27742...`)
- [ ] Navigateur Chrome installé et fonctionnel
- [ ] Espace de stockage disponible vérifié (> 500 Mo libres)
- [ ] Éleveur pilote PILOT-01 présent physiquement
- [ ] Session SESSION-01 créée sur ce document
- [ ] Conditions de test en volière réunies (éclairage naturel disponible)
- [ ] Chronomètre externe prêt pour le test AND-004
- [ ] Connexion Wi-Fi ou 4G active pour la phase d'installation

---

## 3. GRILLE DES 32 CONTRÔLES PHYSIQUES

### AND-001 — Téléchargement APK
- **Objectif :** Vérifier l'accès au fichier binaire d'installation.
- **Action à réaliser :** Ouvrir Chrome sur le téléphone et télécharger l'APK officiel.
- **Résultat attendu :** Le fichier se télécharge complètement sans coupure.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED *(par défaut)*
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non &nbsp;&nbsp;&nbsp; Nom : `SESSION-01_DEV-01_AND-001.jpg`

---

### AND-002 — Autorisation Sources Inconnues
- **Objectif :** Valider la procédure de sécurité Android.
- **Action à réaliser :** Cliquer sur l'APK téléchargé et accepter l'autorisation d'installation.
- **Résultat attendu :** Le système affiche la demande d'autorisation et permet de l'activer sans blocage.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non

---

### AND-003 — Installation Complète APK
- **Objectif :** Confirmer la pose du paquet sur le système Android.
- **Action à réaliser :** Appuyer sur "Installer" et attendre la fin du processus.
- **Résultat attendu :** Installation réussie sans message d'erreur d'analyse (`Parse Error`).
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non

---

### AND-004 — Premier Démarrage à Froid (Cold Boot < 3s)
- **Objectif :** Mesurer la rapidité du premier lancement.
- **Action à réaliser :** Fermer toutes les applications. Lancer le chronomètre au moment précis où le doigt touche l'icône de l'app. Arrêter le chronomètre dès que le tableau de bord est entièrement affiché.
- **Résultat attendu :** Affichage complet et utilisable en moins de 3,0 secondes.
- **Mesures réelles :**  
  - Heure de déclenchement : `____:____:____`  
  - Heure d'arrêt : `____:____:____`  
  - **Durée exacte mesurée :** `________ secondes` *(Obligatoire, pas d'estimation)*
- **Statut :** [ ] PASS *(si ≤ 3.0s)* &nbsp;&nbsp;&nbsp; [ ] FAIL *(si > 3.0s)* &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Preuve vidéo ou chrono :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non &nbsp;&nbsp;&nbsp; Nom : `SESSION-01_DEV-01_AND-004_BOOT.mp4`

---

### AND-005 — Permissions Système
- **Objectif :** S'assurer de la stricte conformité des permissions Android demandées.
- **Action à réaliser :** Vérifier dans les Paramètres de l'application les autorisations requises.
- **Résultat attendu :** Aucune demande intrusive ou abusive (pas de géolocalisation continue, pas de micro, etc.).
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non

---

### AND-006 — Accès Direct Tableau de Bord (Mode FREE)
- **Objectif :** Valider l'accès immédiat sans barrière commerciale.
- **Action à réaliser :** Observer l'écran après le premier démarrage.
- **Résultat attendu :** Arrivée directe sur le tableau de bord avec label "Plan GRATUIT", zéro demande de carte bancaire, zéro formulaire d'inscription bloquant.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non

---

### AND-007 — Réactivité Tactile Générale
- **Objectif :** Vérifier la sensibilité des appuis tactiles en condition réelle.
- **Action à réaliser :** Cliquer successivement sur les différents onglets de navigation et boutons.
- **Résultat attendu :** Réponse immédiate au toucher sans latence perceptible.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Commentaire éleveur :** _________________________________________________

---

### AND-008 — Saisie Clavier Virtuel & Bouton de Validation
- **Objectif :** Contrôler que le clavier virtuel ne cache pas les actions de validation.
- **Action à réaliser :** Ouvrir le formulaire d'ajout d'un oiseau et toucher un champ de saisie pour déployer le clavier Samsung.
- **Résultat attendu :** Le formulaire s'ajuste vers le haut ; le bouton "Valider" ou "Enregistrer" reste visible ou accessible en faisant défiler l'écran sans masquer le clavier.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non &nbsp;&nbsp;&nbsp; Nom : `SESSION-01_DEV-01_AND-008_KEYBOARD.jpg`

---

### AND-009 — Défilement Fluide des Listes (Scroll)
- **Objectif :** Tester la fluidité du défilement avec un cheptel important.
- **Action à réaliser :** Parcourir une liste de canaris (> 50 oiseaux) d'un geste du bas vers le haut.
- **Résultat attendu :** Défilement continu et fluide sans saccade ni saut d'image.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-010 — Fenêtres Modales
- **Objectif :** Vérifier l'affichage et le centrage des fenêtres de dialogue.
- **Action à réaliser :** Ouvrir une modale de détail (fiche oiseau ou confirmation).
- **Résultat attendu :** Fenêtre bien centrée sur l'écran, texte lisible, contenu défilable à l'intérieur.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-011 — Menu Latéral (Drawer)
- **Objectif :** Vérifier l'ouverture et la fermeture du menu tiroir.
- **Action à réaliser :** Appuyer sur l'icône de menu (les 3 traits) ou glisser le doigt depuis le bord gauche.
- **Résultat attendu :** Déploiement fluide du menu latéral et fermeture facile en touchant l'extérieur.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-012 — Touche / Geste "Retour" Android
- **Objectif :** Valider le comportement du bouton Retour système.
- **Action à réaliser :** Ouvrir une modale, puis effectuer le geste ou appuyer sur la touche Retour du téléphone.
- **Résultat attendu :** La modale se ferme ; l'application ne se ferme PAS brutalement.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-013 — Rotation Écran (Portrait / Paysage)
- **Objectif :** Vérifier l'adaptabilité visuelle lors du pivotement.
- **Action à réaliser :** Tourner le smartphone en mode horizontal puis revenir à la verticale.
- **Résultat attendu :** L'interface se réorganise proprement sans coupure d'éléments ni superposition.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-014 — Création d'une Fiche Oiseau
- **Objectif :** Exécuter l'acte de base d'enregistrement d'un canari.
- **Action à réaliser :** Saisir un oiseau complet (bague alphanumérique, sexe, couleur/variété, année).
- **Résultat attendu :** Oiseau créé avec succès et visible immédiatement dans la liste de la volière.
- **Bague de test utilisée :** `____________________`
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non &nbsp;&nbsp;&nbsp; Nom : `SESSION-01_DEV-01_AND-014_OISEAU.jpg`

---

### AND-015 — Modification d'une Fiche Oiseau
- **Objectif :** Mettre à jour une information existante.
- **Action à réaliser :** Modifier le statut d'un oiseau (ex. ajout d'une note de santé ou changement de cage).
- **Résultat attendu :** Mise à jour immédiate et sauvegarde confirmée.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-016 — Gestion des Cages & Volières
- **Objectif :** Créer un habitat et lui attribuer des oiseaux.
- **Action à réaliser :** Créer une nouvelle volière (ex. "Volière A") et y affecter deux canaris.
- **Résultat attendu :** La volière affiche correctement ses occupants et le taux d'occupation.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-017 — Formation d'un Couple Reproducteur
- **Objectif :** Créer une fiche couple et tester le calcul de consanguinité.
- **Action à réaliser :** Associer un mâle et une femelle disponibles dans le module Reproduction.
- **Résultat attendu :** Le couple est formé ; l'indicateur Wright s'affiche sans bloquer.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-018 — Suivi Ponte, Couvaison & Mirage
- **Objectif :** Saisir le calendrier biologique d'une nichée.
- **Action à réaliser :** Enregistrer la date de ponte d'un premier œuf et consigner un mirage (fécond / clair).
- **Résultat attendu :** Calcul automatique des dates d'éclosion prévisionnelles cohérentes.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-019 — Nurserie, Pesées & Soins Sanitaires
- **Objectif :** Suivre la croissance d'un pigeonneau/oisillon et ses soins.
- **Action à réaliser :** Enregistrer une pesée en grammes et un traitement préventif (vitamines).
- **Résultat attendu :** La courbe ou la valeur est enregistrée dans le carnet sanitaire.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-020 — Finances (Dépense de Graines & Vente)
- **Objectif :** Tester la comptabilité simplifiée d'élevage.
- **Action à réaliser :** Ajouter un achat de graines (ex. 25 €) et une vente d'oiseau (ex. 40 €).
- **Résultat attendu :** Le solde du journal financier se met à jour correctement.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-021 — Persistance après Fermeture Forcée (Swipe-Kill)
- **Objectif :** Prouver que les données ne sont pas perdues si l'application est fermée brutalement.
- **Action à réaliser :**  
  1. Vérifier qu'un oiseau test vient d'être créé.
  2. Balayer vers le haut pour éjecter l'application de la mémoire (*Swipe-Kill*).
  3. Relancer l'application depuis l'icône de l'écran d'accueil.
- **Résultat attendu :** L'oiseau test et toutes les données sont immédiatement présents et intacts.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non &nbsp;&nbsp;&nbsp; Nom : `SESSION-01_DEV-01_AND-021_PERSISTENCE.jpg`

---

### AND-022 — Sortie de Veille Prolongée (30 minutes)
- **Objectif :** Tester la reprise en main après un temps de repos en volière.
- **Action à réaliser :** Laisser le téléphone en veille écran éteint pendant 30 min, puis le déverrouiller.
- **Résultat attendu :** L'application reprend instantanément sans écran blanc ni rechargement infini.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-023 — Interruption par Appel ou Notification
- **Objectif :** Vérifier que les saisies en cours ne sont pas écrasées lors d'un événement externe.
- **Action à réaliser :** Commencer à remplir un formulaire, puis déclencher un appel entrant sur le téléphone.
- **Résultat attendu :** En revenant sur l'application après le rejet ou la fin de l'appel, le formulaire contient toujours les données tapées.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-024 — Export de Sauvegarde Locale (JSON)
- **Objectif :** Sauvegarder la base de données sur la mémoire du téléphone.
- **Action à réaliser :** Aller dans Paramètres > Sauvegarde > Exporter les données.
- **Résultat attendu :** Le fichier `.json` est créé et visible dans le dossier `Téléchargements` avec l'app "Mes Fichiers".
- **Nom du fichier généré :** `________________________________________________`
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-025 — Restauration de Sauvegarde (JSON)
- **Objectif :** Vérifier qu'une sauvegarde peut être réimportée avec succès.
- **Action à réaliser :** Modifier ou supprimer un oiseau, puis importer le fichier JSON exporté à l'étape précédente.
- **Résultat attendu :** Les données sauvegardées sont intégralement restaurées.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-026 — Démarrage à Froid en Mode Avion (100% Hors-Ligne)
- **Objectif :** Valider l'utilisation en volière isolée sans aucune couverture réseau.
- **Action à réaliser :**  
  1. Couper l'application.
  2. Activer le **Mode Avion** sur le téléphone (Wi-Fi et Données Mobiles coupés).
  3. Lancer l'application.
- **Résultat attendu :** Démarrage direct sur le tableau de bord, aucun message d'erreur réseau bloquant.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non &nbsp;&nbsp;&nbsp; Nom : `SESSION-01_DEV-01_AND-026_AVION.jpg`

---

### AND-027 — Calculs Génétiques Hors-Ligne
- **Objectif :** Vérifier que les moteurs de calcul fonctionnent sans connexion internet.
- **Action à réaliser :** Toujours en Mode Avion, naviguer dans les fiches génétiques et consulter un arbre généalogique.
- **Résultat attendu :** Calculs immédiats et navigation fluide sans aucune requête réseau requise.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-028 — Rétablissement du Réseau
- **Objectif :** Confirmer la stabilité lors de la reconnexion à Internet.
- **Action à réaliser :** Désactiver le Mode Avion et réactiver le Wi-Fi/4G.
- **Résultat attendu :** L'application reste stable, aucune donnée en double, aucun conflit généré.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-029 — Génération de Document PDF
- **Objectif :** Créer une attestation de cession ou fiche récapitulative au format PDF.
- **Action à réaliser :** Déclencher l'export PDF d'un certificat de cession depuis le module Ventes.
- **Résultat attendu :** Le document PDF est généré proprement et s'affiche dans le visualiseur natif.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-030 — Inversion Multilingue Arabe (RTL)
- **Objectif :** Tester la disposition de droite à gauche en langue arabe.
- **Action à réaliser :** Changer la langue pour l'Arabe dans les Paramètres de l'application.
- **Résultat attendu :** L'interface bascule de droite à gauche (menu à droite, textes alignés à droite, flèches inversées).
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non &nbsp;&nbsp;&nbsp; Nom : `SESSION-01_DEV-01_AND-030_RTL.jpg`

---

### AND-031 — Affichage Statut FREE & Modale PREMIUM
- **Objectif :** Vérifier la clarté des paliers d'abonnement.
- **Action à réaliser :** Ouvrir la fenêtre d'information sur les licences.
- **Résultat attendu :** Mention explicite du statut "Plan GRATUIT" et explication claire des fonctionnalités des plans supérieurs sans blocage agressif.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED

---

### AND-032 — Import d'un Kit de Licence Officiel (.lmse)
- **Objectif :** Valider l'activation d'une licence payante sur le terrain.
- **Action à réaliser :** Importer le kit de licence de test officiel fourni par l'équipe QA.
- **Résultat attendu :** La licence est reconnue immédiatement, le badge se met à jour sans redémarrage forcé.
- **Résultat observé :** ____________________________________________________
- **Statut :** [ ] PASS &nbsp;&nbsp;&nbsp; [ ] FAIL &nbsp;&nbsp;&nbsp; [ ] BLOCKED &nbsp;&nbsp;&nbsp; [X] NOT TESTED
- **Capture d'écran :** [ ] Oui &nbsp;&nbsp;&nbsp; [ ] Non &nbsp;&nbsp;&nbsp; Nom : `SESSION-01_DEV-01_AND-032_LICENCE.jpg`

---

## 4. QUESTIONNAIRE QUALITATIF — RETOUR DE L'ÉLEVEUR (UX)

*(Posez ces questions à l'éleveur à la fin de la séance et notez fidèlement ses réponses)*

1. L'application est-elle facile à utiliser au quotidien dans la volière ?  
   `[ ] Oui  [ ] Moyen  [ ] Non`  
   *Commentaires :* ___________________________________________________________

2. Les boutons sont-ils suffisamment grands pour vos doigts ?  
   `[ ] Oui  [ ] Trop petits`  
   *Commentaires :* ___________________________________________________________

3. Les textes et numéros de bagues sont-ils bien lisibles à la lumière du jour ?  
   `[ ] Très lisibles  [ ] Passables  [ ] Illisibles au soleil`  
   *Commentaires :* ___________________________________________________________

4. La saisie des oiseaux est-elle rapide et confortable ?  
   `[ ] Confortable  [ ] Fastidieuse`  
   *Commentaires :* ___________________________________________________________

5. Le clavier virtuel a-t-il masqué des boutons pendant votre utilisation ?  
   `[ ] Non, jamais  [ ] Oui, de temps en temps`  
   *Si oui, sur quel écran :* ___________________________________________________

6. Le défilement des listes d'oiseaux est-il agréable ?  
   `[ ] Fluide  [ ] Saccadé`

7. Les informations sur vos canaris sont-elles faciles à retrouver ?  
   `[ ] Oui  [ ] Difficiles`

8. La manipulation à une seule main est-elle pratique lorsque vous tenez un oiseau dans l'autre ?  
   `[ ] Pratique  [ ] Nécessite les deux mains`

9. Si vous utilisez l'arabe : les mots choisis sont-ils naturels pour les éleveurs ?  
   `[ ] Naturels et clairs  [ ] Traduction peu claire`

10. Quelle est la principale difficulté ou gêne que vous avez rencontrée ?  
   *Réponse :* _______________________________________________________________

---

## 5. CHECKLIST DE CLÔTURE DE LA SESSION
- [ ] Les 32 contrôles de la grille ont tous été examinés et cochés.
- [ ] Aucun test n'a été transformé en PASS sans observation physique réelle.
- [ ] Chaque constat FAIL ou BLOCKED fait l'objet d'une fiche d'incident séparée.
- [ ] Les captures d'écran et mesures sont bien nommées et enregistrées.
- [ ] Le questionnaire de l'éleveur est entièrement complété.
- [ ] L'heure de fin est inscrite en tête de document.
- [ ] La feuille est signée ci-dessous par l'éleveur et le responsable QA.

---

## 6. SIGNATURES DE VALIDATION SESSION

> [!NOTE]
> La signature confirme que la session s'est réellement déroulée et que les observations consignées sont fidèles à la réalité. Elle ne transforme pas les statuts en PASS.

**L'Éleveur Pilote (PILOT-01) :**  
Nom & Prénom : _________________________________  
Date : ____ / ____ / 2026  
Signature :  

<br><br>

**Le Responsable QA Terrain :**  
Nom & Prénom : _________________________________  
Date : ____ / ____ / 2026  
Signature :  

---
\pagebreak

# VOLET 2 : SESSION-02 (PILOT-02 + DEV-02 Xiaomi)

*(Structure identique à SESSION-01 — Utilisez la grille ci-dessus avec les paramètres ci-dessous)*

- **Session ID :** `SESSION-02`
- **Participant ID :** `PILOT-02` | Profil : Éleveur pilote `[A_CONFIRMER]`
- **Device ID :** `DEV-02`
- **Fabricant :** Xiaomi
- **Modèle exact :** `[A_CONFIRMER]` *(ex. Redmi Note 13 5G)*
- **Version Android / OS :** `[A_CONFIRMER]` *(ex. HyperOS 1.0.x / Android 14)*
- **Correctif de sécurité :** `[A_CONFIRMER]`
- **Version Chrome :** `[A_CONFIRMER]`
- **Date :** `[AAAA-MM-JJ]` | Heure début : `[HH:MM]` | Heure fin : `[HH:MM]`

*(Dérouler les 32 contrôles AND-001 à AND-032 et remplir la checklist de fin de session)*

---
\pagebreak

# VOLET 3 : SESSION-03 (PILOT-03 + DEV-[À RENSEIGNER])

- **Session ID :** `SESSION-03`
- **Participant ID :** `PILOT-03` | Profil : Éleveur pilote `[A_CONFIRMER]`
- **Device ID :** `DEV-[01 ou 02 selon affectation réelle]`
- **Fabricant :** `[Samsung ou Xiaomi]`
- **Modèle exact :** `[A_CONFIRMER]`
- **Version Android :** `[A_CONFIRMER]`
- **Date :** `[AAAA-MM-JJ]` | Heure début : `[HH:MM]` | Heure fin : `[HH:MM]`

*(Dérouler les 32 contrôles AND-001 à AND-032 et remplir la checklist de fin de session)*

---
\pagebreak

# VOLET 4 : PROVISION SESSION-04 (PILOT-03 sur Second Terminal)

*(À n'utiliser QUE si PILOT-03 teste physiquement le deuxième appareil de test)*

- **Session ID :** `SESSION-04`
- **Participant ID :** `PILOT-03`
- **Device ID :** `DEV-[Second terminal physique]`
- **Date :** `[AAAA-MM-JJ]` | Heure début : `[HH:MM]` | Heure fin : `[HH:MM]`

*(Dérouler les 32 contrôles AND-001 à AND-032 et remplir la checklist de fin de session)*
