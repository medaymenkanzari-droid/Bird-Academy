# Bird Academy — Guide du testeur

Bienvenue dans le programme de test public de **Bird Academy Enterprise — Volière Manager** (version **V2.0.0-RC1**, build **BA-V2.0.0-RC1**). Ce guide s'adresse aux éleveurs et passionnés participant aux essais terrain de l'application.

---

## 1. Qu'est-ce que vous allez tester ?

Bird Academy est une application de gestion d'élevage avicole (canaris et passereaux) conçue pour fonctionner **100% hors-ligne**, sans aucun stockage de vos oiseaux dans le cloud.

Vous testez la version officiellement certifiée **V2.0.0-RC1**. Son objectif est de vérifier la clarté des écrans, la précision des calculs (généalogie, consanguinité de Wright, pontes, baguage) et la robustesse de l'enregistrement souverain de vos données au quotidien.

---

## 2. Installation & Vérification des Binaires

L'application est disponible sur **Windows (Setup et Portable)** et sur **Android (APK)** depuis le Centre de Téléchargement officiel :

### A. Windows (Installateur Setup)
1. **Téléchargez** `Bird-Academy-Avian-ERP-Setup.exe` (ou `Bird-Academy-User-Windows-Setup.exe`) depuis le centre de téléchargement officiel.
   - Taille certifiée : **109 747 064 octets** (104.66 Mo)
   - SHA-256 : `BA8EC925064FBE1AAFB53635FB1FF4277611485A5C8F1BD916B45339A3EC3EA1`
2. **Double-cliquez** sur le fichier téléchargé. L'installateur configure automatiquement l'application dans votre profil local utilisateur.
3. Lancez l'application depuis le raccourci Bureau ou le menu Démarrer.

### B. Windows (Version Portable)
1. **Téléchargez** `Bird-Academy-User.exe`.
   - Taille certifiée : **109 408 543 octets** (104.34 Mo)
   - SHA-256 : `1C7F50E6A689970B12BFF15EFD4DB769DF8138B0159A8E142617EF683032939B`
2. Exécutez directement le fichier sans installation requise (idéal pour clé USB ou disque externe).

### C. Android (Smartphone / Tablette)
1. **Téléchargez** `Bird-Academy-User.apk` sur votre terminal Android (Android 10+ / API 29+).
   - Taille certifiée : **20 461 460 octets** (19.51 Mo)
   - SHA-256 : `1D3CC180339B55C2701CB3AE6CF6FC209D37720D8737B3CD8DBBD3BEFABDD290`
2. Si votre navigateur ou gestionnaire de fichiers vous invite à autoriser l'installation d'applications de sources inconnues, acceptez pour cette installation.
3. Ouvrez le fichier et suivez la procédure d'installation jusqu'à son terme.

---

## 3. Première utilisation

Dès le premier lancement :

1. **Choix de la langue** : Sélectionnez votre langue parmi les 5 supportées (Français, Anglais, Espagnol, Italien, Arabe avec support complet RTL).
2. **Plan de départ** : L'application démarre directement en **Plan GRATUIT (FREE)** vous permettant de gérer jusqu'à 20 oiseaux vivants sans clé requise.
3. **Activation de votre Licence de Test** :
   - Cliquez sur **« Activer la Licence »** (en haut à droite ou dans les Paramètres).
   - Saisissez votre clé de test fournie au format `LMSE-TEST-XXXX-XXXX-XXXX` ou importez votre fichier de licence `.lmse`.
   - Votre licence de test vous donne un accès complet aux fonctionnalités avancées pendant **30 jours**.
4. **Assistant de démarrage (Wizard)** : Suivez les 3 étapes d'initialisation pour définir vos premières cages et vos premiers pensionnaires.

---

## 4. Que devez-vous tester ?

Nous vous invitons à tester les opérations courantes d'une saison d'élevage :

- **Gestion du cheptel (Oiseaux)** :
  - Ajouter un oiseau avec son numéro de bague, sexe, variété/couleur et date de naissance.
  - Modifier la fiche d'un oiseau.
  - Déclarer des ascendants (père et mère) pour observer l'arbre généalogique.
- **Gestion des couples & reproduction** :
  - Créer un couple et vérifier l'alerte de consanguinité (coefficient de Wright).
  - Enregistrer une ponte, le mirage des œufs et les naissances.
  - Baguer les jeunes issus de la nichée.
- **Logement & cages (Habitat)** :
  - Créer une cage ou volière et y affecter des oiseaux.
  - Vérifier l'occupation des cages et les alertes de surpopulation.
- **Santé & soins** :
  - Enregistrer un événement sanitaire ou un rappel de traitement.
  - Consulter le calendrier des rappels sans connexion externe.
- **Statistiques & exports** :
  - Consulter le tableau de bord et les statistiques d'élevage.
  - Générer un export ou une sauvegarde locale dans les **Paramètres**.

---

## 5. Ce qui nous intéresse

Votre regard d'éleveur est précieux. Dites-nous très simplement :

- **Ce qui est facile** : les actions que vous avez réussies du premier coup sans hésiter.
- **Ce qui est difficile** : les étapes où vous avez dû chercher ou hésiter.
- **Ce qui est incompréhensible** : les termes, boutons ou calculs qui ne vous semblent pas clairs.
- **Ce qui manque** : un champ, une espèce ou un filtre indispensable à votre pratique.
- **Ce qui semble inutile** : les éléments qui alourdissent votre saisie au quotidien.
- **Ce qui pourrait être plus rapide** : les raccourcis ou flux à optimiser.

---

## 6. Comment signaler un problème & Transmettre vos retours ?

Vous disposez de trois canaux complémentaires pour transmettre vos retours de test :

1. **Bouton intégré dans l'application** :
   Cliquez sur le bouton **« Retour testeur »** (icône message 💬 en haut à droite ou dans l'onglet **Paramètres**).
   Choisissez la catégorie (**BUG**, **UX**, **QUESTION**, **SUGGESTION**, **MANQUE**) et le niveau de gravité.
2. **Formulaire officiel PDF à remplir** :
   Téléchargez le document `Rapport-de-test-Bird-Academy-V2.0.0-RC1-A-remplir-par-le-testeur.pdf` (disponible en 5 langues sur le centre de téléchargement), remplissez-le et renvoyez-le.
   - Taille certifiée : **192 358 octets** (187.85 Ko)
   - SHA-256 : `C2A05D43DAE7D69EC0CAA33CA14A850633C2457CEA463A053423C8DFA58A3D21`
3. **Par email direct** :
   Envoyez vos constats, suggestions et captures d'écran à : `contact@birdacademy.internal`.

---

## 7. Données personnelles & Confidentialité locale

- **Respect absolu de votre vie privée** : Bird Academy fonctionne en vase clos sur votre machine ou terminal mobile.
- Vos données d'élevage (vos oiseaux, bagues, fiches de couples, pedigree, dépenses) **ne sont jamais envoyées sur internet**.
- Lors d'un signalement, seules les informations techniques strictement utiles (version, système d'exploitation, module concerné) sont incluses.
- Aucun compte cloud ni email publicitaire n'est requis.

---

## 8. Fin du test & Règle Zero Deletion

- Votre licence de test est valable pour une durée de **30 jours**.
- À l'expiration des 30 jours, votre application **rétrograde automatiquement vers le plan FREE**.
- **Conservation intégrale de vos données (Zero Deletion)** :
  - Aucun oiseau, aucun couple, aucune donnée historique n'est supprimé à l'expiration.
  - Vous conservez l'accès en lecture et gestion de toutes vos fiches existantes.
  - En plan FREE, l'ajout de nouveaux oiseaux est plafonné à 20 individus vivants.
  - Si vous souhaitez poursuivre les tests ou renouveler votre période d'évaluation, contactez l'équipe support.

---

*Bird Academy Enterprise — Volière Manager (V2.0.0-RC1 • BUILD_ID: BA-V2.0.0-RC1)*
