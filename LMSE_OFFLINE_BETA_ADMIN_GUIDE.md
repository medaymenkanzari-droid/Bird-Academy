# GUIDE D'ADMINISTRATION — LMSE OFFLINE BETA

---

## 1. OBJECTIF ET PRÉREQUIS

Ce guide s'adresse aux administrateurs du **Centre d'Administration LMSE**. Il détaille la procédure officielle de création, signature et distribution des licences autonomes hors ligne destinées aux bêta-testeurs terrain.

### Prérequis Administrateur
- Accès au Centre d'Administration (`AdminLmseCenter` / `AdminApp`).
- Environnement d'Administration avec la clé de signature active.

---

## 2. ÉTAPES DE GÉNÉRATION D'UNE LICENCE BETA OFFLINE

### Étape 1 : Créer la Licence dans le Centre Admin
1. Ouvrez le **Centre d'Administration LMSE**.
2. Cliquez sur **Générer une Licence Enterprise**.
3. Renseignez :
   - **Nom du Titulaire** (ex: `Club Canari Mourouj` ou `Jean Dupont`).
   - **Email du Titulaire** (optionnel).
   - **Type de Licence** : `BETA` / `Bêta Privée`.
   - **Durée** : 90 jours (ou durée personnalisée).
   - **Limite d'Appareils** : `1` (pour une licence individuelle).
4. Cliquez sur **Générer et Signer la Licence**.

---

## 3. EXPORTATION DES LIVRABLES BÊTA

Pour chaque licence générée dans la liste des licences :

### 1. Exporter le Fichier `.lmse`
- Cliquez sur le bouton **`.lmse`** de la ligne correspondant au testeur.
- Le fichier `BirdAcademy-License-[LICENSE_ID].lmse` est téléchargé automatiquement.

### 2. Afficher le QR Code
- Cliquez sur l'icône **QR Code**.
- La modale affiche le QR Code scannable et permet d'en copier le payload d'activation.

### 3. Générer la Fiche de Remise Testeur
- Cliquez sur l'icône **Fiche Testeur** (`FileText`).
- Le document Markdown `Fiche-Activation-[LICENSE_ID].md` est téléchargé, contenant toutes les instructions étape par étape pour le testeur.

---

## 4. DÉPÔT ET STRUCTURE DE LIVRAISON TERRAIN

Placez les livrables dans le dossier de distribution :

```
Release/Beta/OfflineLicenses/<Nom-du-Testeur>/
  ├── BirdAcademy-License-BETA-<ID>.lmse
  ├── BirdAcademy-License-BETA-<ID>-QR.png
  └── Fiche-Activation-<ID>.md
```

> [!WARNING]
> **Règle de Sécurité Absolue** : Ne placez JAMAIS de clé privée, de secret serveur ou de script d'administration dans ce dossier de remise testeur.
