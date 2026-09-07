# MANUEL PROPRIÉTAIRE — GESTION DES APPLICATIONS & DES LICENCES LMSE
**Bird Academy Enterprise — Guide Pratique Simple (Non-Technique)**

---

## 1. LES DEUX APPLICATIONS DU PROJET

Le système se compose désormais de **deux applications distinctes** :

1. **BIRD ACADEMY (Application Utilisateur / Volière Manager)** :
   - **À qui est-elle destinée ?** Aux éleveurs, vétérinaires, associations, bêta-testeurs et futurs clients.
   - **À quoi sert-elle ?** Gérer la volière, les canaris, les couples, la reproduction, la santé, le calendrier et valider la licence d'utilisation.
   - **Est-ce qu'un utilisateur peut créer une licence ici ?** **Non, c'est impossible.** Aucun outil de création de licence n'est présent dans cette application.

2. **BIRD ACADEMY ADMIN (Console d'Administration Enterprise)** :
   - **À qui est-elle destinée ?** Uniquement au propriétaire du projet et au personnel autorisé de Bird Academy.
   - **À quoi sert-elle ?** Générer des clés de licence, révoquer des licences, prolonger des abonnements, créer des comptes administrateurs et suivre les statistiques globales.

---

## 2. COMMENT LANCER LES APPLICATIONS EN DÉVELOPPEMENT / DÉMONSTRATION

Dans votre terminal de commande :

- **Lancer l'application Utilisateur (Bird Academy)** :
  ```bash
  npm run build:user
  ```
  *(Ouvre l'application d'élevage classique)*.

- **Lancer la console d'Administration (Bird Academy Admin)** :
  ```bash
  npm run build:admin
  ```
  *(Construit et prépare l'application privée d'administration dans `dist_admin/`)*.

---

## 3. COMMENT CRÉER ET DONNER UNE LICENCE À UN BÊTA-TESTEUR

1. **Ouvrez Bird Academy Admin** (Console d'administration).
2. **Connectez-vous** avec vos identifiants administrateur.
3. Cliquez sur l'onglet **Générateur de Licences** (`Centre LMSE`).
4. Remplissez le formulaire :
   - **Nom du titulaire** : Indiquez le nom de l'éleveur ou du bêta-testeur (ex: *Jean Dupont*).
   - **Type de licence** : Sélectionnez `Bêta / Essai` ou `Commercial`.
   - **Durée** : Choisissez la durée souhaitée (ex: 30 jours pour une bêta, ou 365 jours).
   - **Nombre d'appareils autorisés** : Indiquez le nombre d'ordinateurs/smartphones (ex: 2 appareils).
5. Cliquez sur **Générer la licence**.
6. **Copiez la clé générée** (ex: `LMSE-BETA-A1B2-C3D4-E5F6`).
7. **Transmettez cette clé** au bêta-testeur par email ou message.

---

## 4. COMMENT LE BÊTA-TESTEUR ACTIVE SA LICENCE DANS SON APPLICATION

1. Le bêta-testeur ouvre son application **Bird Academy**.
2. Une fenêtre d'activation lui demande de saisir sa clé.
3. Il colle la clé `LMSE-BETA-A1B2-C3D4-E5F6` et clique sur **Activer**.
4. L'application vérifie la clé et débloque immédiatement les fonctionnalités.
5. Si le bêta-testeur n'a pas d'internet, la licence fonctionne **parfaitement hors ligne**.

---

## 5. COMMENT RÉVOQUER OU ANNULLER UNE LICENCE EN CAS D'ABUS OU DE PERTE

1. Ouvrez **Bird Academy Admin**.
2. Allez dans l'onglet **Gestion des Licences**.
3. Recherchez le nom du titulaire ou la clé dans la liste.
4. Cliquez sur le bouton rouge **Révoquer**.
5. Indiquez la raison (ex: *Fin de période bêta* ou *Paiement rejeté*).
6. Dès que l'application de l'utilisateur se connectera au réseau, sa licence sera automatiquement bloquée et son accès suspendu.

---

STATUS:
USER MANUAL COMPLETED — READY FOR OWNER USE
