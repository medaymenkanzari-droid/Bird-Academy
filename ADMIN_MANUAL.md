# MANUEL D'ADMINISTRATION ENTERPRISE — BIRD ACADEMY ENTERPRISE (v1.0)

**Guide Destiné :** Administrateurs Principaux (Owners), Responsables Fédéraux, Superviseurs Techniques  
**Module :** Back Office Enterprise (`AdminCenterView`)  
**Accès :** Onglet **Administration** ou route `/admin`

---

## 1. Vue d'Ensemble du Centre d'Administration

Le **Centre d'Administration Enterprise** est la console de gestion centrale de Bird Academy Enterprise. Il permet de piloter le système, de gérer les comptes utilisateurs, d'émettre des clés de licences LMSE, d'administrer les clubs et fédérations rattachés, de valider le référentiel scientifique et de générer les rapports d'activité.

---

## 2. Guide des Onglets d'Administration

### 📈 1. Tableau de Bord Administrateur (Executive Dashboard)
- **KPIs Globaux :**
  - Nombre total d'utilisateurs inscrits.
  - Licences LMSE actives (Starter, Pro, Enterprise).
  - Nombre d'organisations & clubs rattachés.
  - État de santé du système (100% OK).
  - Nombre total de journaux d'audit enregistrés.
  - Quota de stockage local consommé.
- **Journal des Actions Administrative (Audit Log) :**
  - Visualisation en temps réel de chaque écriture/modification.
  - Données enregistrées : *Intervenant (Nom/Rôle), Action & Cible, Détails de l'opération, Horodatage local et Statut (Succès, Attention, Erreur)*.
  - Filtres par catégorie (*Utilisateurs, Licences, Organisations, Sécurité, Système*) et recherche textuelle.

### 👥 2. Gestion des Utilisateurs (User Directory)
- **Rôles gérés :**
  - **Super Administrateur :** Accès total à toutes les fonctions de configuration et d'administration.
  - **Administrateur :** Gestion des utilisateurs, licences et organisations.
  - **Vétérinaire Référent :** Validation du référentiel biologique et signature des bilans sanitaires.
  - **Association / Club :** Gestion des membres rattachés et compétitions.
  - **Éleveur Professionnel :** Accès complet aux fonctions d'élevage commercial.
  - **Bêta-Testeur RC2 :** Accès aux fonctionnalités d'évaluation terrain.
- **Actions sur les comptes :**
  - Création de nouveaux comptes utilisateurs.
  - Modification des rôles et attribution des permissions.
  - **Suspension / Réactivation :** Bloquez temporairement un compte sans supprimer ses données.
  - **Suppression :** Suppression définitive d'un compte avec journalisation d'audit.

### 🏢 3. Gestion des Organisations & Clubs (Organizations)
- **Types d'organisations :** Clubs d'éleveurs, Fédérations/Associations, Cliniques vétérinaires, Élevages professionnels et Partenaires commerciaux.
- **Attributs :** Raison sociale, numéro d'enregistrement officiel/SIRET, pays, ville, nombre de membres et coordonnées de contact.

### 🔑 4. Centre de Licences LMSE (LMSE License Center)
- **Génération de Clés :**
  - Générez de nouvelles clés de licence au format `LMSE-XXXX-XXXX-XXXX-XXXX`.
  - Configurez le niveau de tier (*Starter*, *Pro*, *Enterprise*), la date d'expiration et le nombre de postes autorisés.
- **Révocation & Dissociation :**
  - Révoquez une licence en cas d'impayé ou de non-respect des CGU.
  - Dissociez un appareil pour autoriser la réinstallation sur un nouvel ordinateur.
- **Activation Hors-Ligne (Offline Signature Helper) :**
  - Générez la clé d'activation hors-ligne basée sur l'empreinte matérielle de l'appareil client (`DeviceFingerprintEngine`).
- **Exports & Imports :**
  - Exportez le registre complet des licences en CSV/Excel ou JSON.

### 🧬 5. Référentiel Biologique & Taxonomie (Biological Registry)
- **Registre des Espèces :** Nomenclature officielle C.O.M. des espèces aviaires.
- **Catalogue des Mutations :** Validation scientifique des nouvelles mutations génétiques (*Autosomique Récessive*, *Liée au Sexe*, *Dominante*).
- **Historique des Révisions :** Suivi des avis émis par le comité scientifique aviaire.

### 🛡️ 6. Sécurité & Qualité QA (Security & QA Supervision)
- **Supervision Sécurité :** Télémétrie des sessions actives, statut du chiffrement SHA256 du stockage local et contrôle d'isolation des clés.
- **Matrice des Tests QA :** Rapport d'exécution des 203 tests unitaires et de non-régression automatisés.

### 💬 7. Support Client & Reporting Enterprise (Support & Reporting)
- **Gestion des Tickets Support :** Traitement des demandes d'assistance envoyées par les éleveurs.
- **Éditeur FAQ :** Publiez des questions/réponses traduites dans les 5 langues.
- **Générateur de Rapports Multi-Formats :**
  - Exportation PDF mise en page pour l'impression officielle.
  - Exportation CSV / Excel pour l'analyse comptable.
  - Exportation JSON Snapshot pour l'archivage de masse.

### ⚙️ 8. Paramètres Globaux (Global Settings)
- Configuration de la langue par défaut de la plateforme.
- Activation/Désactivation du mode PWA Offline Advanced (Service Worker).
- URL du serveur de synchronisation API et fréquence des sauvegardes automatiques.
