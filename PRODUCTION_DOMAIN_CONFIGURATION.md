# PRODUCTION DOMAIN & NETWORK TOPOLOGY CONFIGURATION
**Spécifications de Domaine, DNS, HTTPS, CORS et Isolation Environnements**

**Plateforme :** Bird Academy Enterprise — Volière Manager  
**Release :** v1.3.6-RC4 (Build ID: `BA-V1.3.6-RC4`, Code: `17`)  
**Git Commit :** `8b8736380bd7580676af689f59ade38a42093095`  
**Git Tag :** `v1.3.6-RC4`  

---

## 1. État Actuel du Domaine de Production

- **Statut d'enregistrement :** `DOMAIN NOT CONFIGURED / PENDING`.
- **Nom de domaine officiel recommandé :** `bird-academy.com` (ou déclinaisons géographiques comme `bird-academy.fr`).
- **Cohérence de marque :** Le nom de domaine cible s'aligne fidèlement sur l'identité commerciale de la marque déposée : **Bird Academy Enterprise — Volière Manager**.
- **Environnement TEST existant :** `https://bird-academy-public-test.onrender.com` (opérationnel et maintenu distinctement).

---

## 2. Topologie Réseau Cible (Sous-Domaines & Routage)

Pour la production commerciale, l'architecture prévoit une répartition modulaire des responsabilités :

```
                                  [ INTERNET ]
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                 [ Cloudflare DNS ]          [ SSL / TLS Edge Term. ]
                         │                             │
        ┌────────────────┼─────────────────────────────┼────────────────┐
        │                │                             │                │
        ▼                ▼                             ▼                ▼
  www.bird-academy.com   app.bird-academy.com   api.bird-academy.com   admin.bird-academy.com
  (Site Commercial)      (Application PWA)      (Serveur LMSE API)     (Espace Gouvernance)
```

| Service | Rôle Applicatif | Sous-Domaine Recommandé | Type de Conteneur / Hôte |
|---|---|---|---|
| **Commercial Website** | Vitrine commerciale, catalogue des offres, commande sandbox/live | `https://bird-academy.com` & `https://www.bird-academy.com` | CDN Statique / Vercel / Cloudflare Pages / Render |
| **User Application** | Application de gestion d'élevage locale (PWA / Web App) | `https://app.bird-academy.com` | CDN Statique / Service Worker local |
| **LMSE Authority Backend** | Serveur d'émission de licence, traitement de webhook bancaire | `https://api.bird-academy.com` | Cluster Node.js privé (Docker / Render / AWS ECS) |
| **Admin Center** | Gouvernance, révocations, remplacements de licences | `https://admin.bird-academy.com` | Accès restreint VPN/IP + Auth RBAC PBKDF2 |
| **Downloads CDN** | Distribution des installateurs volumineux (`.exe`, `.apk`) | `https://downloads.bird-academy.com` (ou GitHub Releases direct) | GitHub Releases CDN / Cloudflare R2 |

---

## 3. Matrice de Configuration DNS

Lorsque le domaine `bird-academy.com` sera réservé auprès du registrar, les enregistrements DNS suivants devront être déployés :

| Type | Nom d'Hôte | Valeur / Cible | Rôle & Usage | Statut Actuel |
|---|---|---|---|---|
| **ALIAS / ANAME** | `@` (apex) | `bird-academy-web.onrender.com.` (ou équivalent CNAME) | Redirection vers le site web commercial principal | `PENDING` |
| **CNAME** | `www` | `bird-academy-web.onrender.com.` | Alias canonique Web mondial | `PENDING` |
| **CNAME** | `app` | `bird-academy-app.onrender.com.` | Point d'entrée de l'application PWA éleveur | `PENDING` |
| **CNAME** | `api` | `bird-academy-lmse-prod.onrender.com.` | Backend LMSE d'autorité (paiements & licences) | `PENDING` |
| **CNAME** | `admin` | `bird-academy-admin.onrender.com.` | Interface d'administration et de gouvernance | `PENDING` |
| **CNAME** | `downloads` | `medaymenkanzari-droid.github.io.` (ou R2 custom domain) | Point d'accès CDN aux installateurs de bureau | `PENDING` |
| **TXT** | `@` | `v=spf1 include:... ~all` | Authentification des emails transactionnels support | `PENDING` |

---

## 4. Spécifications HTTPS & Sécurité de Transport

Toutes les communications en production exigent une protection cryptographique maximale :
- **Protocole :** TLS 1.3 obligatoire (TLS 1.2 accepté en repli, protocoles inférieurs désactivés).
- **Certificat SSL :** Certificat Wildcard X.509 (`*.bird-academy.com` + `bird-academy.com`) émis par Let's Encrypt ou Cloudflare Universal SSL, avec renouvellement automatisé.
- **Redirection HTTP vers HTTPS :** Redirection inconditionnelle `HTTP 301 Moved Permanently` pour toute requête entrante en clair sur le port 80.
- **HSTS (HTTP Strict Transport Security) :** En-tête activé :
  `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- **Mixed-Content :** Zéro ressource non sécurisée (tous les assets JS, CSS, fonts et images sont appelés via chemins relatifs ou URLs HTTPS).

---

## 5. Audit & Résolution Définitive de la Politique CORS

L'audit transversal a analysé la gestion des en-têtes CORS dans l'ensemble des fichiers du projet :

### A. Constat d'Audit Détaillé
1. **Code Réel Actuel (`src/server/lmseServer.ts`, ligne 56) :**
   ```typescript
   res.setHeader('Access-Control-Allow-Origin', '*');
   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
   ```
   *Analyse :* Le serveur LMSE applique actuellement un wildcard (`*`). Ce réglage est parfaitement adapté à l'environnement de développement et de TEST public, mais ne doit pas être utilisé sans restriction en production commerciale.
2. **Template Documenté (`.env.production.example`, ligne 35) :**
   ```ini
   CORS_ORIGINS=https://app.bird-academy.com,https://admin.bird-academy.com,https://bird-academy.com
   ```
   *Analyse :* Spécifie la liste plurielle standard des origines autorisées, séparées par des virgules.
3. **Fichier Spécifique (`.env.production`, ligne 7) :**
   ```ini
   CORS_ORIGIN="https://app.bird-academy.fr"
   ```
   *Analyse :* Utilise la forme singulière avec une extension nationale `.fr`.

### B. Décision & Standard de Production Officiel
- **Variable Maîtresse Officielle :** `CORS_ORIGINS` (au pluriel).
- **Format Requis :** Liste des origines HTTPS valides séparées par des virgules :
  `CORS_ORIGINS=https://bird-academy.com,https://www.bird-academy.com,https://app.bird-academy.com,https://admin.bird-academy.com`
- **Comportement en Production :**
  Lors du déploiement du conteneur Node.js de production, le middleware lira `process.env.CORS_ORIGINS` :
  - Si l'en-tête `Origin` de la requête correspond à l'une des entrées de la liste, le serveur retourne cette origine exacte (`res.setHeader('Access-Control-Allow-Origin', req.headers.origin)`).
  - Si l'en-tête `Origin` est inconnu, aucun accès cross-origin n'est accordé (rejet navigateur).
- **Règle de Freeze :** Le code applicatif `v1.3.6-RC4` reste strictement gelé. Ce paramétrage relève du conteneur d'exécution de production.

---

## 6. Cloisonnement Absolu TEST / PRODUCTION

| Critère | Environnement TEST (Actuel) | Environnement PRODUCTION (Cible) |
|---|---|---|
| **URL Web** | `https://bird-academy-public-test.onrender.com` | `https://bird-academy.com` & `https://app.bird-academy.com` |
| **URL API LMSE** | `https://bird-academy-public-test.onrender.com/api/*` | `https://api.bird-academy.com/api/*` |
| **Bannière IHM** | Bannière jaune officielle `"ENVIRONNEMENT DE TEST PUBLIC GRATUIT"` | **Aucune bannière de test** (Interface commerciale épurée) |
| **Paiement** | `SANDBOX_PROVIDER` (Cartes de test `4242...`) | Passerelle Bancaire Réelle (Stripe Live) |
| **Clé Privée LMSE** | Clé de signature de test | Clé de signature maîtresse de production dédiée |
| **Registres Licences** | Base locale `data/licenses.json` de test | Registre de production isolé avec sauvegardes automatiques |
| **Partage de Secrets** | **ZÉRO secret partagé** | **ZÉRO secret partagé** |

---

## 7. Plan d'Action de Déploiement du Domaine

1. **Achat du Domaine :** Réservation de `bird-academy.com` auprès d'un bureau d'enregistrement accrédité (ex: OVH, Cloudflare Registrar, Namecheap).
2. **Délégation DNS :** Définition des serveurs DNS (recommandation : Cloudflare pour la protection DDoS et le proxy SSL Edge).
3. **Application des Enregistrements DNS :** Saisie des enregistrements CNAME/A listés dans la matrice ci-dessus.
4. **Provisionnement des Variables d'Environnement Production :**
   - `NODE_ENV=production`
   - `CORS_ORIGINS=https://bird-academy.com,https://www.bird-academy.com,https://app.bird-academy.com,https://admin.bird-academy.com`
   - `VITE_LMSE_API_URL=https://api.bird-academy.com`
   - `LMSE_PRIVATE_SIGNING_KEY=<clé_prod_générée>`
5. **Validation Finale :** Test SSL Labs (note A+ attendue) et vérification du blocage des origines tierces non autorisées.
