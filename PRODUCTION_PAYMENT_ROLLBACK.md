# PLAN DE ROLLBACK & REPRISE SUR SINISTRE : PAIEMENT PRODUCTION
## BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
### Procédure de Retour Arrière Immuable en Cas d'Incident Majeur
**Release Cible** : `v1.3.6-RC4` | **Build ID** : `BA-V1.3.6-RC4` | **Build Code** : `17`
**Invariants** : `PAYMENT LIVE = DISABLED` | `PUBLIC COMMERCIAL SALES = CLOSED` | `RELEASE = FROZEN`

---

## 1. Références Immuables du Socle de Rollback

En cas de dysfonctionnement critique constaté sur l'infrastructure de production ou lors d'une tentative ultérieure d'activation, le retour arrière doit obligatoirement restaurer l'état exact défini ci-dessous :

- **Release Tag** : `v1.3.6-RC4`
- **Git Commit SHA** : `8b8736380bd7580676af689f59ade38a42093095`
- **Archive Scellée** : `Bird-Academy-Enterprise-v1.3.6-RC4.zip`
- **Empreinte SHA-256** : `7296d222303649a9f60de6e8064b52904124814bd4dc38a892528fe3b3324248`
- **Dossier d'Archivage Local** : `RELEASE_ARCHIVE_v1.3.6-RC4/`

---

## 2. Déclencheurs de Rollback (Rollback Triggers)

Le déclenchement d'un rollback complet est automatique ou ordonné sans délai dans les circonstances suivantes :

1. **Compromission de Clé Secrète** : Divulgation ou suspicion de fuite de la clé privée de signature LMSE (`LMSE_PRIVATE_SIGNING_KEY`) ou d'un secret marchand de paiement.
2. **Anomalie Financière / Fraude** : Émission de licences sans contrepartie financière vérifiée par le serveur, ou tentative de spoofing de webhook réussie.
3. **Échec d'Intégrité de Licence** : Incapacité des applications clientes à valider les licences délivrées (erreur `CORRUPTED` systématique).
4. **Indisponibilité Sévère** : Taux d'échec des requêtes du service de paiement dépassant 10% sur une fenêtre glissante de 15 minutes.
5. **Régression de l'Isolement Avicole** : Détection d'un transfert quelconque de données d'élevage vers le réseau.

---

## 3. Matrice Temporelle des Objectifs

- **RTO (Recovery Time Objective)** : Retour à un état stable en moins de **15 minutes**.
- **RPO (Recovery Point Objective)** : Aucune perte de données avicoles locales (**RPO = 0** garanti par l'architecture décentralisée).

---

## 4. Procédure d'Exécution du Rollback (Pas-à-Pas)

### Étape 1 — Coupure d'Urgence Immédiate (< 60 secondes)
Activer le Kill Switch pour bloquer toute nouvelle transaction :
```bash
# Dans le tableau de bord Render ou fichier d'environnement serveur
PAYMENT_LIVE=false
PAYMENT_KILL_SWITCH=true
PUBLIC_COMMERCIAL_SALES=closed
```

### Étape 2 — Bascule du Dépôt Git vers le Commit de Référence
```bash
# Se positionner sur le commit gelé immuable
git checkout 8b8736380bd7580676af689f59ade38a42093095

# Vérifier que le HEAD pointe rigoureusement sur le commit officiel
git rev-parse HEAD
# Résultat attendu : 8b8736380bd7580676af689f59ade38a42093095
```

### Étape 3 — Restauration depuis l'Archive Scellée (Option Hors-Ligne)
Si le dépôt Git est inaccessible ou corrompu :
```bash
# Vérifier l'empreinte SHA-256 de l'archive locale
Get-FileHash -Algorithm SHA256 Bird-Academy-Enterprise-v1.3.6-RC4.zip

# Extraire l'archive scellée pour écraser l'espace de travail corrompu
Expand-Archive -Path Bird-Academy-Enterprise-v1.3.6-RC4.zip -DestinationPath . -Force
```

### Étape 4 — Déploiement et Redémarrage du Service
1. Déclencher le redéploiement propre du service backend Node.js.
2. Vider les caches intermédiaires (CDN / Cloudflare) pour purger les bundles JS altérés.

---

## 5. Préservation des Licences Légitimes & Données Utilisateurs

- **Licences Préalablement Délivrées** : Les licences déjà acquises par des clients légitimes avant l'incident continuent de fonctionner localement grâce à la signature asymétrique stockée dans leur fichier `.lmse` scellé.
- **Données d'Élevage** : Les bases locales IndexedDB/LocalStorage des éleveurs demeurent intactes et ne subissent aucun impact lors du rollback serveur.
- **Commandes en Cours d'Exécution** : Les commandes interrompues lors du rollback sont répertoriées dans le registre d'audit pour traitement manuel par le support selon `PRODUCTION_PAYMENT_SUPPORT_SOP.md`.

---

## 6. Audit Post-Rollback & Clôture d'Incident

1. Vérifier la sonde de santé : `curl -s https://api.bird-academy.com/api/health`.
2. Exécuter la suite complète de tests de qualification : `npm run test:live-payment-config`.
3. Rédiger le rapport d'incident post-mortem consignant la cause racine et les actions correctives.
