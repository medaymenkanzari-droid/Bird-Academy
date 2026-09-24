# Formulaire Officiel de Remontée d'Incident (Bug Report)
**Projet :** Bird Academy Enterprise — Volière Manager  
**Version applicative :** v1.3.6  
**BUILD_ID :** BA-V1.3.6  
**Campagne :** Recette Publique et Validation Terrain  
**Document ID :** QA_PUBLIC_INCIDENT_REPORT_FORM_v1.3.6  

> [!CAUTION]
> **RÈGLE ABSOLUE D'INTÉGRITÉ DES DONNÉES :**  
> Ne tentez JAMAIS de modifier manuellement les fichiers de base de données internes ou le stockage local de l'application. Si un blocage ou une incohérence survient, documentez fidèlement l'état constaté sans forcer de modification extérieure.

---

## 1. Identifiants & Environnement de Test

| Champ | Valeur observée par le testeur |
| :--- | :--- |
| **Incident ID** | *(ex: INC-PUBLIC-202609-001)* |
| **Date du relevé** | AAAA-MM-JJ |
| **Heure du relevé** | HH:MM (Heure locale) |
| **Participant ID** | *(ex: PILOT-01)* |
| **Device ID / Modèle réel** | *(ex: DEV-01 / Samsung Galaxy A52)* |
| **Système d'exploitation** | Android (version exacte) ou Windows 10/11 |
| **Version applicative** | **v1.3.6** |
| **BUILD_ID** | **BA-V1.3.6** |
| **Langue active de l'application** | [ ] FR &nbsp;&nbsp; [ ] EN &nbsp;&nbsp; [ ] AR &nbsp;&nbsp; [ ] ES &nbsp;&nbsp; [ ] IT |
| **État du réseau au moment du bug** | [ ] Hors ligne (Offline strict) &nbsp;&nbsp; [ ] Connecté (Wi-Fi / 4G) |

---

## 2. Qualification du Module et Scénario

- **Module concerné :**  
  [ ] Cheptel (Oiseaux) &nbsp;&nbsp; [ ] Habitat (Cages & Volières) &nbsp;&nbsp; [ ] Reproduction &nbsp;&nbsp; [ ] Santé & Soins  
  [ ] Finances & Dépenses &nbsp;&nbsp; [ ] Intelligence & Génétique &nbsp;&nbsp; [ ] Sauvegarde & Import &nbsp;&nbsp; [ ] Rapports PDF  
  [ ] Traduction & RTL &nbsp;&nbsp; [ ] Démarrage / Installation &nbsp;&nbsp; [ ] Autre : ________________________

- **Scénario de test lié :** *(ex: PUBLIC-05 Limite de 20 oiseaux, PUBLIC-11 Arabe RTL, etc.)*  
  ID Scénario : `PUBLIC-____`

---

## 3. Gravité de l'Incident (Sévérité)

- [ ] **BLOCKER** : Crash immédiat de l'application, impossibilité de lancer ou d'accéder au cheptel, perte de données constatée.
- [ ] **CRITICAL** : Dépassement silencieux de quota de plan (ex: >20 oiseaux créés en plan FREE sans licence), corruption d'une fiche, calcul génétique faussé.
- [ ] **MAJOR** : Fonctionnalité indisponible ou bouton inopérant mais contournable, export PDF tronqué, filtre inopérant.
- [ ] **MINOR** : Erreur de traduction textuelle, alignement visuel imparfait, faute d'orthographe, libellé tronqué.

---

## 4. Description Détaillée de l'Anomalie

### A. Titre synthétique
*(Exemple : "Le bouton Enregistrer reste grisé lors de l'ajout d'une femelle jaune mosaïque")*

### B. Étapes pas à pas pour reproduire (Steps to Reproduce)
1. 
2. 
3. 
4. 

### C. Résultat Attendu (Expected Result)
*(Ce que l'application aurait dû faire normalement selon le guide du testeur)*

### D. Résultat Constaté (Actual Result)
*(Ce qui s'est réellement produit à l'écran, message d'erreur affiché, etc.)*

---

## 5. Preuves Réelles Jointes (Evidence Files)

- [ ] **Capture d'écran du terminal réel (Image)** :  
  Nom du fichier : `________________________________________________`
- [ ] **Vidéo d'illustration réelle (si applicable)** :  
  Nom du fichier : `________________________________________________`
- [ ] **Photo de l'appareil physique** :  
  Nom du fichier : `________________________________________________`
- [ ] **Fichier de sauvegarde exporté depuis l'application (JSON)** :  
  Nom du fichier : `________________________________________________`
- [ ] **Rapport PDF généré présentant le défaut (PDF)** :  
  Nom du fichier : `________________________________________________`

---

## 6. Statut & Traitement QA (Réservé à l'équipe Engineering)

- **Statut de l'incident :**  
  [ ] NOUVEAU &nbsp;&nbsp; [ ] EN COURS D'ANALYSE &nbsp;&nbsp; [ ] REPRODUIT &nbsp;&nbsp; [ ] CORRIGÉ &nbsp;&nbsp; [ ] REJETÉ / NON REPRODUCTIBLE
- **Ticket / Fix Commit :** `________________________________`
- **Auditeur QA référent :** `________________________________`
- **Date de clôture :** `________________________________`
