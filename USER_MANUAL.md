# MANUEL D'UTILISATION — BIRD ACADEMY ENTERPRISE (v1.0)

**Application :** Bird Academy Enterprise — Volière Manager  
**Version :** 1.0.0 Commercial Release  
**Public Cible :** Éleveurs passionnés, Éleveurs professionnels, Vétérinaires aviaires, Clubs et Fédérations ornithologiques

---

## 1. Introduction & Prise en Main

Bienvenue dans **Bird Academy Enterprise**, la solution logicielle de gestion d'élevage d'oiseaux (canaris de couleur, posture, chant, chardonnerets et hybrides).

### 🚀 Premier Lancement & Assistant d'Onboarding
1. **Lancement de l'application :** Disponible via navigateur web (PWA), application Windows (`.exe`) et application Android (`.apk`).
2. **Assistant d'accueil :** Lors de votre première connexion, renseignez le nom de votre élevage, votre stam d'éleveur (ex: `FR-2026-8891`) et vos préférences linguistiques.
3. **Sélection de la langue :** Disponible en 5 langues (Français, English, العربية avec support RTL, Español, Italiano).

---

## 2. Guide des Modules Métier

### 🐦 Module Oiseaux (Registre du Cheptel)
- **Ajout d'un oiseau :** Cliquez sur **Ajouter un oiseau**, saisissez la bague officielle, le nom/surnom, le sexe (♂ Mâle, ♀ Femelle, ❓ Indéterminé), la date de naissance, l'espèce (Canari, Chardonneret, Tarin, etc.), la catégorie et la mutation.
- **Gestion des photos & documents :** Ajoutez jusqu'à 6 photos par fiche et téléversez les certificats de sexage ADN ou certificats Vétérinaires.
- **Fiche détaillée :** Consultez l'âge calculé en temps réel, l'arbre généalogique sur 4 générations, l'indice de consanguinité (Wright), la cage d'affectation et l'historique médical.
- **Statut de l'oiseau :** Marquez un oiseau comme *Actif*, *Cédé/Vendu*, *Décédé* ou *Archivé*.

### 🏠 Module Habitat & Cages (Gestion des Volières)
- **Arborescence des installations :** Organisez votre élevage en *Bâtiments*, *Zones* (ex: Volière Extérieure, Pièce de Reproduction, Quarantaine) et *Cages*.
- **Affectation & Transfert :** Transférez un oiseau d'une cage à une autre en un clic.
- **Contrôle de capacité :** Visualisez le taux d'occupation (ex: 4/6 oiseaux) avec alerte visuelle en cas de surpopulation.

### 💕 Module Reproduction & Couples
- **Formation des couples :** Sélectionnez un mâle disponible (âge ≥ 10 mois) et une femelle compatible.
- **Assistant de compatibilité :** Le moteur génétique analyse l'indice de consanguinité (COI Wright) et affiche une recommandation (Recommandé, Prudence, À Éviter).
- **Gestion des pontes :**
  - Créez une nouvelle ponte et ajoutez les œufs au fur et à mesure du ponçage.
  - Saisissez le poids (g) et la position de l'œuf dans le nid.
  - **Période d'incubation :** Lancez le chronomètre biologique d'incubation (J+13).
  - **Mirage (J+6) :** Marquez chaque œuf comme *Fécondé*, *Clair* ou *Arrêt*.
- **Éclosion & Suivi des Poussins :**
  - Enregistrez les éclosions avec le poids de naissance.
  - Suivez la courbe de poids quotidienne des oisillons.
  - **Sevrage (J+30) :** Favorisez le poussin sevré en nouvel oiseau autonome du cheptel avec héritage automatique des parents.

### 🩺 Module Santé & Soins Vétérinaires
- **Registre des traitements :** Enregistrez les nettoyages, déparasitages, traitements antibiotiques et interventions chirurgicales.
- **Suivi des statuts :** Marquez les soins comme *En cours* ou *Terminé*.
- **Rapports sanitaires :** Générez le bilan sanitaire de votre élevage pour votre vétérinaire référent.

### 📊 Module Analytics & Intelligence Aviaire
- **Graphiques de productivité :** Consultez les taux de fertilité, d'éclosion et de sevrage par saison d'élevage.
- **Indicateurs financiers :** Suivez vos dépenses (graines, pâtée, cages, soins) et ventes d'oiseaux avec bilan net du résultat.
- **Bird Intelligence :** Recommandations automatisées pour optimiser la sélection génétique et repérer les meilleurs reproducteurs.

---

## 3. Clés de Licences LMSE Enterprise

- **Licence Starter :** Jusqu'à 50 oiseaux.
- **Licence Pro :** Jusqu'à 500 oiseaux.
- **Licence Enterprise :** Oiseaux illimités, mode multi-élevages, Back Office Admin.
- **Activation Hors-Ligne :** Si votre ordinateur n'est pas connecté à Internet, utilisez le code de signature offline généré par l'administrateur.

---

## 4. Sauvegarde & Restauration des Données

- **Exportation Sauvegarde :** Allez dans **Paramètres > Sauvegardes** et cliquez sur **Exporter la Sauvegarde**. Un fichier `.json` chiffré avec signature SHA256 sera téléchargé.
- **Restauration :** Sélectionnez un fichier de sauvegarde `.json` pour restaurer l'intégralité de vos données d'élevage.
