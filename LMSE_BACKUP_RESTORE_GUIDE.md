# Guide de Sauvegarde et de Restauration des Données LMSE

## 1. Procédure de Sauvegarde Automatique

Pour sauvegarder l'intégralité des données de licences, révocations et journaux d'audit :
```bash
npm run lmse:backup
```

Ce script effectue les actions suivantes :
1. Génère un dossier horodaté dans `backups/lmse-backup-YYYY-MM-DD-THH-mm-ss/`.
2. Copie atomique des fichiers `./data/licenses.json`, `revocations.json`, `license-state.json`, `license-audit-logs.json`, `admin-users.json`.
3. Génération d'un fichier `manifest.json` contenant les empreintes SHA-256 de chaque fichier pour la vérification d'intégrité.

---

## 2. Procédure de Restauration Atomique

Pour restaurer le dernier backup valide disponible dans `backups/` :
```bash
npm run lmse:restore
```

Pour restaurer un dossier de sauvegarde spécifique :
```bash
node --import tsx scripts/restoreLmse.js backups/lmse-backup-2026-08-08T21-00-48-382Z
```

Le script de restauration valide l'empreinte SHA-256 de chaque fichier par rapport au `manifest.json` avant d'écraser les données du dossier `./data`. Si une altération ou une corruption est détectée, la restauration est interrompue pour protéger le système.
