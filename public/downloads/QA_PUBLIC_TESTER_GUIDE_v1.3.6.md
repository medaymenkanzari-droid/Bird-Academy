# Guide du Testeur Public — Bird Academy Enterprise (Volière Manager)

**Version officielle :** v1.3.6  
**BUILD_ID :** BA-V1.3.6  
**Distribution :** Campagne de Test Public & Recette Terrain  
**Statut :** READY FOR PUBLIC HUMAN EXECUTION  

---

## Bienvenue dans le Programme de Test Public

Ce guide est conçu pour vous accompagner pas à pas dans l'évaluation de **Bird Academy Enterprise — Volière Manager (v1.3.6)**.  
L'application a été conçue pour fonctionner de manière **100% autonome et hors ligne**, directement au cœur de votre élevage ou de votre volière, sans dépendance au réseau ni risque de perte de données.

En tant qu'éleveur testeur, votre rôle est d'utiliser l'application dans des conditions réelles et de nous signaler tout comportement inattendu.

---

### 1. Téléchargement et Installation de l'application

- **Sur Android (Smartphone / Tablette) :**
  1. Téléchargez le fichier officiel `Bird-Academy-User.apk` depuis le Centre de Téléchargement officiel (taille exacte : 9 916 814 octets).
  2. Ouvrez le fichier téléchargé sur votre terminal Android (Android 10 ou version supérieure).
  3. Si le système vous demande d'autoriser l'installation d'applications issues de sources inconnues pour votre navigateur ou gestionnaire de fichiers, acceptez pour cette installation.
  4. Suivez les étapes d'installation jusqu'à la fin.
- **Sur Windows (PC portable ou fixe) :**
  1. Téléchargez l'installateur `Bird-Academy-User-Windows-Setup.exe` ou l'exécutable portable `Bird-Academy-User.exe`.
  2. Lancez le fichier et laissez l'application s'installer dans votre profil local utilisateur.

---

### 2. Premier démarrage

- Au premier lancement, l'application initialise votre base de données locale sécurisée.
- **Aucune connexion Internet n'est requise** : aucune inscription sur serveur distant, aucun mot de passe cloud n'est demandé.
- Vous arrivez directement sur le Tableau de Bord (Dashboard) principal de votre élevage.

---

### 3. Choix et utilisation du Plan GRATUIT (FREE)

- Par défaut, l'application démarre sous le profil **PLAN GRATUIT** (FREE).
- Ce plan vous offre un accès complet à l'ensemble des fonctionnalités essentielles d'élevage : gestion des oiseaux, cages, accouplements, santé, finances et analyses.
- Le plan FREE est doté d'une capacité maximale de **20 oiseaux vivants** dans le cheptel actif.

---

### 4. Règle de la limite de 20 oiseaux (Plan FREE)

Pour les testeurs sous Plan Gratuit, les règles de quota sont strictement définies et garanties par l'application :

- **0 oiseau dans le cheptel :** création et ajout possibles.
- **10 oiseaux dans le cheptel :** création possible librement jusqu'à 20.
- **20 oiseaux dans le cheptel :** la 21e création est bloquée avec un message d'information explicatif.
- **20 oiseaux dans le cheptel :** la duplication d'un oiseau est bloquée.
- **20 oiseaux dans le cheptel :** l'import par lot qui dépasserait la limite de 20 est bloqué.
- **20 oiseaux dans le cheptel :** la restauration d'une sauvegarde contenant plus de 20 oiseaux vivants est bloquée.
- **297 oiseaux historiques (jeu de données existant) :** AUCUNE suppression automatique.
- **297 oiseaux historiques :** l'état spécial **OVER_ENTITLEMENT** (sur-quota) s'affiche clairement.
- **297 oiseaux historiques :** les nouvelles créations sont bloquées pour respecter le plan FREE.

---

### 5. Cas des Données Existantes & Sauvegarde du Cheptel

> **Règle fondamentale :**  
> *"Si l'application contient déjà plus de 20 oiseaux provenant d'un ancien jeu de données, l'application ne supprime pas automatiquement ces oiseaux."*

Dans cette situation :
1. **Les données existantes sont intégralement conservées :** aucun oiseau n'est effacé sans votre accord explicite.
2. **Les nouvelles créations peuvent être bloquées :** tant que le nombre total d'oiseaux dépasse la limite du plan actif.
3. **Nettoyage sécurisé des données DEMO :** si votre élevage contient des oiseaux d'exemple issus de versions de démonstration antérieures, un bouton dédié permet de purger uniquement ces données DEMO identifiées, ramenant votre cheptel sous le quota sans risque.
4. **Protection absolue des données utilisateur :** les données utilisateur réelles ne sont **JAMAIS** supprimées automatiquement.

> **Consigne essentielle de test :**  
> Ne jamais demander au testeur de supprimer ses vraies données pour faire passer un test.

---

### 6. Création et enregistrement d'un oiseau

- Rendez-vous dans le menu **Oiseaux** (Cheptel), puis cliquez sur **Ajouter un oiseau**.
- Renseignez les informations essentielles :
  - **Numéro de bague :** Identifiant officiel (ex: `FR-26-042-001`).
  - **Espèce & Variété :** Canari de couleur, Canari de posture, etc.
  - **Sexe :** Mâle, Femelle ou Indéterminé.
  - **Année de naissance :** Année de bague.
  - **Cage / Volière :** Emplacement actuel dans l'élevage.
  - **Parents :** Bagues du père et de la mère si connus.
- Cliquez sur **Enregistrer** : l'oiseau est immédiatement ajouté et sauvegardé dans le stockage local de votre appareil.

---

### 7. Gestion de l'Habitat (Cages et Volières)

- Accédez à l'onglet **Habitat** :
  - Déclarez vos cages individuelles, cages d'élevage ou volières collectives.
  - Fixez la capacité maximale conseillée par cage.
  - Assignez vos oiseaux aux cages et observez l'occupation en temps réel.
  - L'application signale automatiquement les éventuelles surpopulations pour préserver le bien-être animal.

---

### 8. Suivi de la Reproduction

- Dans l'onglet **Reproduction** :
  - Formez vos couples reproducteurs en sélectionnant un mâle et une femelle compatibles.
  - Suivez le cycle de reproduction : date de mise en couple, date de ponte du 1er œuf, nombre d'œufs pondus.
  - Mirage des œufs : cochez les œufs féconds ou clairs.
  - Suivi des éclosions et calcul automatique de la date limite de baguage (généralement au 6e jour).
  - Sevrage : conversion du jeune en oiseau indépendant avec affectation de sa bague définitive (soumis au respect du quota).

---

### 9. Carnet de Santé et Traitements

- Dans le module **Santé** :
  - Enregistrez les pesées, états sanitaires et observations vétérinaires.
  - Planifiez les traitements collectifs (vermifuge, vitamines, préparation à la mue).
  - Recevez les rappels directement dans l'application sans notification distante.

---

### 10. Finances et Bilan Économique

- Dans le module **Finances** :
  - Enregistrez vos dépenses : graines, matériel, bagues, cotisations club, soins.
  - Enregistrez vos recettes : cessions d'oiseaux, récompenses de concours.
  - Consultez le bilan financier global ou par période d'élevage.

---

### 11. Bird Intelligence & Analyse Génétique

- Dans l'onglet **Intelligence** :
  - Consultez le calcul automatique du coefficient de consanguinité de Wright sur les accouplements projetés.
  - Visualisez l'arbre généalogique complet sur plusieurs générations.
  - Consultez les alertes prédictives pour éviter les risques de tares génétiques.

---

### 12. Sauvegarde Locale et Restauration

- Vos données vous appartiennent exclusivement.
- Rendez-vous dans **Paramètres > Sauvegarde & Restauration**.
- Cliquez sur **Créer une sauvegarde locale**.
- Un fichier d'archive complet contenant l'ensemble de votre élevage est téléchargé ou enregistré sur votre appareil.
- **Conseil :** Effectuez une sauvegarde avant et après chaque session intensive d'élevage.

---

### 13. Fonctionnement 100% Hors Ligne (Offline-First)

- Vous pouvez utiliser l'application au fond de la volière, dans un sous-sol ou en déplacement sans aucune connexion Wi-Fi ni 4G/5G.
- Toutes les opérations de lecture, modification, recherche, export et calculs fonctionnent instantanément en local.

---

### 14. Changement de Langue & Support Arabe RTL

- L'application supporte 5 langues officielles : **Français (FR)**, **Anglais (EN)**, **Arabe (AR)**, **Espagnol (ES)**, **Italien (IT)**.
- Le sélecteur de langue en haut à droite bascule instantanément d'une langue à l'autre sans rechargement.
- En sélectionnant l'Arabe, l'interface s'adapte automatiquement en mode de droite à gauche (`dir="rtl"`) avec conservation de la typographie arabe et des bagues numériques.

---

### 15. Signaler un Problème ou Partager un Retour

Si vous constatez un dysfonctionnement, un affichage anormal ou si vous souhaitez suggérer une amélioration :
1. Notez l'action effectuée et prenez une capture d'écran.
2. Utilisez au choix :
   - Le formulaire rapide : `QA_PUBLIC_FEEDBACK_QUICK_FORM_v1.3.6.md`
   - Le rapport d'incident détaillé : `QA_PUBLIC_INCIDENT_REPORT_FORM_v1.3.6.md`
3. Transmettez votre fiche à l'équipe Bird Academy Enterprise.

---

Merci pour votre précieuse collaboration au succès de la campagne de test public de Bird Academy Enterprise !
