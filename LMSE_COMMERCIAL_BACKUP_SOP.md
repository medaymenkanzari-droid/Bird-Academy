# STANDARD OPERATING PROCEDURE : SAUVEGARDE & RESTAURATION DU SERVEUR LMSE (LMSE_COMMERCIAL_BACKUP_SOP)
**Projet** : Bird Academy Enterprise — Volière Manager  
**Version** : v1.3.6-RC4  
**Référence** : COMMERCIAL-LAUNCH-PREP-001 / LMSE-BACKUP-SOP  
**Statut** : PRÉPARATION PRODUCTION  

---

## 1. OBJECTIF & PÉRIMÈTRE
Ce document régit les procédures de sauvegarde, de vérification d'intégrité et de reprise sur sinistre (Disaster Recovery) du serveur d'autorité **LMSE (License Management & Security Engine)**.

> **RÈGLE FONDAMENTALE :**  
> Cette sauvegarde concerne EXCLUSIVEMENT les données administratives et commerciales de l'autorité LMSE.  
> **AUCUNE DONNÉE D'ÉLEVAGE UTILISATEUR** (oiseaux, couples, pontes, bilans génétiques, données financières privées) n'est présente sur le serveur LMSE, et par conséquent aucune donnée privée d'éleveur n'est incluse dans ces sauvegardes.

---

## 2. SÉPARATION ABSOLUE : SECRETS VS DONNÉES

```
┌───────────────────────────────────────────────────────────────┐
│                    STRATÉGIE DE SÉPARATION                    │
├───────────────────────────────┬───────────────────────────────┤
│    GESTION DES SECRETS        │     SAUVEGARDE DE DONNÉES     │
│  (SECRET & KEY MANAGEMENT)    │        (DATA BACKUP)          │
├───────────────────────────────┼───────────────────────────────┤
│ • LMSE_PRIVATE_SIGNING_KEY    │ • Registre des licences (.json│
│ • Passwords de chiffrement    │   ou base relationnelle)      │
│ • Clés de signature webhooks  │ • Liste de révocation         │
│ • Tokens de session Admin     │ • Journaux d'audit immuables  │
│                               │ • Configuration non sensible  │
├───────────────────────────────┼───────────────────────────────┤
│ STOCKAGE :                    │ STOCKAGE :                    │
│ Gestionnaire de secrets       │ Stockage d'objets chiffré     │
│ (Render Secret / AWS KMS /    │ (S3 / R2 chiffré AES-256-GCM) │
│ Coffre-fort hors-ligne)       │ Snapshots horodatés           │
│                               │                               │
│ INTERDIT : JAMAIS DANS GIT    │ INTERDIT : JAMAIS DE CLÉ      │
│ NI DANS UN BACKUP STANDARD    │ PRIVÉE DANS LE DUMP           │
└───────────────────────────────┴───────────────────────────────┘
```

---

## 3. PÉRIMÈTRE DES DONNÉES SAUVEGARDÉES
1. **Registre des licences** (`licenses.json` ou table de base de données) : Historique des licences créées, clés, titulaires, dates d'expiration, tiers et statuts (`active`, `revoked`, `replaced`).
2. **Liste de révocation** (`revocations.json`) : Empreintes hachées SHA-256 et clés révoquées.
3. **Journaux d'audit** (`auditLogs.json`) : Traces chronologiques des opérations administratives.
4. **Comptes administrateurs scellés** (`admin_users.json`) : Hachages PBKDF2/Argon2 des administrateurs autorisés.

---

## 4. CADENCE & POLITIQUE DE RÉTENTION
- **Fréquence des sauvegardes automatiques** :
  - Sauvegarde incrémentale : Toutes les 6 heures.
  - Sauvegarde complète (Full Snapshot) : Quotidienne à 02:00 UTC.
  - Sauvegarde préalable obligatoire : Avant toute opération de déploiement, mise à jour ou maintenance d'infrastructure.
- **Rétention** :
  - Sauvegardes quotidiennes : Conservées 30 jours glissants.
  - Sauvegardes mensuelles : Archivées 1 an pour conformité comptable et contractuelle.

---

## 5. PROCÉDURE TECHNIQUE DE SAUVEGARDE (EXPORT)
Le script officiel `npm run lmse:backup` (ou commande planifiée équivalente sur le serveur) exécute les opérations suivantes :
1. Extraction atomique des données du registre LMSE.
2. Vérification d'absence de la clé privée dans le flux de données exporté (`grep -v LMSE_PRIVATE_SIGNING_KEY`).
3. Chiffrement de l'archive de sauvegarde au repos via AES-256-GCM :
   ```bash
   # Commande type exécutée en tâche de fond sécurisée
   node --import tsx scripts/backupLmse.js --output /var/backups/lmse/lmse-snapshot-$(date +%Y%m%d_%H%M%S).enc
   ```
4. Transfert chiffré vers un compartiment de stockage distant isolé.

---

## 6. PROCÉDURE DE RESTAURATION EN CAS DE SINISTRE (DISASTER RECOVERY)

### Scénario : Crash complet du serveur d'hébergement
1. **Réapprovisionnement de l'infrastructure** :
   - Déploiement d'une nouvelle instance LMSE à partir du tag git figé `v1.3.6-RC4`.
   - Réinjection manuelle des variables secrètes depuis le coffre-fort d'infrastructure (`LMSE_PRIVATE_SIGNING_KEY`, etc.).
2. **Restauration des données commerciales** :
   - Récupération du dernier snapshot chiffré valide.
   - Exécution de la commande de restauration :
     ```bash
     npm run lmse:restore -- --file /var/backups/lmse/latest-snapshot.enc
     ```
3. **Vérification d'intégrité post-restauration** :
   - Appel du point de terminaison de santé : `curl -k https://api.birdacademy.app/api/health`
   - Vérification que le nombre de licences enregistrées correspond à l'état pré-sinistre.
   - Test de validation d'une licence existante via `POST /api/license/validate`.
   - Contrôle d'accès à la console Admin.
