# GUIDE DE PREMIER PARAMÉTRAGE & D'ADMINISTRATION
## Bird Academy Enterprise — Console Super Administrateur & LMSE

Ce guide est rédigé à l'attention du propriétaire du projet Bird Academy. Il détaille pas à pas la procédure simple pour initialiser votre compte Super Administrateur, vous connecter et gérer vos clés de licence.

---

### 1. Comment initialiser votre premier compte Super Admin (Bootstrap)

Pour créer votre accès propriétaire en tant que **Super Administrateur** :

1. Ouvrez une invite de commande (Terminal / PowerShell) dans le dossier du projet.
2. Exécutez la commande d'initialisation :
   ```bash
   npm run admin:bootstrap
   ```
3. Le programme vérifie d'abord qu'aucun Super Admin n'existe encore.
4. Saisissez les informations demandées :
   - **Email Administrateur** : Votre adresse email personnelle (ex: `proprietaire@birdacademy.tn`).
   - **Nom Affiché** : Votre nom ou pseudo d'administrateur.
   - **Mot de passe** : Un mot de passe fort d'au moins 8 caractères.
   - **Confirmation** : Saisissez à nouveau le même mot de passe.
5. Une fois validé, votre compte Super Admin est créé et le mot de passe est immédiatement haché de manière sécurisée (aucun mot de passe en clair n'est conservé).

> **Sécurité** : Si la commande est relancée après la création du premier Super Admin, le système refusera catégoriquement la création d'un second compte via ce script.

---

### 2. Comment vous connecter au Centre d'Administration

1. Lancez le serveur local ou ouvrez l'application d'administration :
   ```bash
   npm run dev
   ```
2. Accédez à l'interface d'administration dans votre navigateur :
   - URL : `http://localhost:3000/admin.html`
3. Sur la page de connexion :
   - Entrez votre **Email Administrateur**.
   - Entrez votre **Mot de Passe**.
   - Cliquez sur **Se connecter**.
4. Vous êtes redirigé vers le tableau de bord d'administration **Bird Academy Admin Center**.

---

### 3. Comment générer votre première clé Bêta-Testeur

1. Une fois connecté, rendez-vous sur le module **Gestion des Licences (LMSE License Center)**.
2. Cliquez sur **Générer une Nouvelle Licence**.
3. Remplissez le formulaire :
   - **Nom du Titulaire** : Ex: *Testeur Bêta Tunisie 01*.
   - **Type de Licence** : Sélectionnez `Bêta Testeur` (ou `Vétérinaire`, `Association`, `Commercial`, `Enterprise`).
   - **Durée de Validité** : Ex: `365` jours.
   - **Limite d'Appareils** : Ex: `3` appareils max.
4. Cliquez sur **Générer et Signer la Clé**.
5. La clé de licence formatée (ex: `BETA-2026-X8K9-M2P4-Q7Z1`) s'affiche à l'écran. Vous pouvez la copier d'un simple clic.

---

### 4. Comment créer une clé pour un nouveau testeur

1. Suivez la même procédure qu'à l'étape 3.
2. Saisissez le nom exact ou le pseudo du testeur.
3. Transmettez la clé au testeur.
4. À l'ouverture de l'application **Bird Academy User**, le testeur saisira cette clé sur l'écran d'activation initial pour débloquer l'accès complet et le mode hors-ligne.

---

### 5. Comment révoquer une clé de licence

Si un appareil est perdu ou si un testeur ne doit plus avoir accès :
1. Dans le **LMSE License Center**, localisez la licence dans la liste.
2. Cliquez sur le bouton **Révoquer**.
3. Indiquez le motif de révocation.
4. La clé est immédiatement ajoutée à la liste de révocation du serveur LMSE et l'application cliente sera bloquée lors de sa prochaine vérification.

---

### 6. Comment créer un deuxième compte administrateur

Seul un Super Administrateur peut créer d'autres comptes d'administration :
1. Dans le menu Admin, allez sur **Gestion des Utilisateurs**.
2. Cliquez sur **Ajouter un Administrateur**.
3. Saisissez son email, son nom, son rôle (`admin`, `support`, ou `auditor`) et son mot de passe initial.
4. Le nouveau compte sera immédiatement opérationnel.

---

### 7. Comment changer votre mot de passe

1. Dans la console d'administration, cliquez sur votre profil en haut à droite.
2. Choisissez **Modifier le mot de passe**.
3. Saisissez votre mot de passe actuel puis votre nouveau mot de passe.
4. Enregistrez pour appliquer la mise à jour.

---

### 8. Que faire en cas d'oubli du mot de passe

En cas de perte totale d'accès :
1. Supprimez ou réinitialisez le fichier de base d'administration `data/admin-users.json` sur le serveur.
2. Relancez la commande d'initialisation :
   ```bash
   npm run admin:bootstrap
   ```
3. Recréez votre identifiant Super Admin avec votre nouveau mot de passe.

---

### 9. Où consulter les journaux d'activité (Logs d'audit)

1. Connectez-vous à la Console d'Administration.
2. Cliquez sur l'onglet **Audit & Sécurité**.
3. Consultez l'historique en temps réel : connexions réussies, tentatives échouées, créations et révocations de licences avec les adresses IP et horodatages.
