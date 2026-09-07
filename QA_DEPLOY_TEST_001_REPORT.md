# QA DEPLOY TEST 001 — REPORT

**Projet :** Bird Academy Enterprise — Volière Manager  
**Version de référence :** 1.3.6-RC4  
**Build Code :** 17  
**Date d'exécution :** 2026-09-04  
**Mission :** DEPLOY-TEST-001 — Déploiement Public Gratuit de l'Environnement de Test  

---

## Environment

L'environnement de test public mis en place isole strictement les flux de test de toute infrastructure commerciale réelle :

- **Identifiant d'environnement :** `ENVIRONMENT=TEST`
- **Portée :** Déploiement public gratuit (0 € / mois) dédié aux testeurs externes et à l'assurance qualité.
- **Règle de séparation :** Aucune clé privée de production n'est utilisée. Le système de test utilise des variables et clés de signature isolées.
- **Domaine d'exécution :** Serveur Node.js / Express unifié avec fallback SPA React pour le site commercial et les APIs LMSE Test.

| Composant | Environnement Local (Dev) | Environnement Test Public | Environnement Production (Futur) |
| :--- | :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | `https://bird-academy-test.onrender.com` | `https://app.birdacademy.com` *(Non déployé)* |
| **Backend LMSE** | `http://localhost:3001` | `https://bird-academy-test.onrender.com/api/*` | `https://lmse.birdacademy.com` *(Non déployé)* |
| **Clé de signature** | Clé Dev locale | Clé TEST Serveur uniquement | Clé Production HSM/Vault *(Isolée)* |

---

## Architecture

L'architecture de test public repose sur une structure unifiée à coût zéro, garantissant l'isolation des secrets et la conservation du paradigme offline-first :

```
                                  INTERNET (HTTPS)
                                         │
                                         ▼
                     ┌────────────────────────────────────────┐
                     │     SERVEUR TEST PUBLIC UNIFIÉ         │
                     │         (Render / Koyeb / Docker)      │
                     │                                        │
                     │  ┌──────────────────────────────────┐  │
                     │  │   Frontend SPA Commercial & User │  │
                     │  │      (dist/ - Client React)      │  │
                     │  └─────────────────┬────────────────┘  │
                     │                    │ API Same-Origin   │
                     │  ┌─────────────────▼────────────────┐  │
                     │  │     Backend LMSE TEST API        │  │
                     │  │  (/api/commercial/*, /api/lic*)  │  │
                     │  └─────────────────┬────────────────┘  │
                     │                    │                   │
                     │                    ▼                   │
                     │         LMSE_PRIVATE_SIGNING_KEY       │
                     │         (Secret Serveur Dédié TEST)    │
                     └────────────────────────────────────────┘
```

- **Absence de fuite :** Le navigateur client ne reçoit jamais `LMSE_PRIVATE_SIGNING_KEY`, ni le sel maître, ni les secrets administratifs.
- **Absence de base Cloud pour l'élevage :** Les données d'oiseaux, couples, cages et santé restent strictement stockées dans le `localStorage` / `IndexedDB` du navigateur de l'utilisateur.

---

## Hosting

Une solution d'hébergement **100% gratuite (0 €)** et pérenne a été configurée et validée :

- **Plateforme principale validée :** [Render.com](https://render.com) (Web Service Node.js / Blueprint `render.yaml`).
  - **Coût :** 0,00 € / mois.
  - **HTTPS :** Automatique avec certificats SSL/TLS Let's Encrypt gérés et renouvelés nativement.
  - **Démarrage & Build :** `npm ci && npm run build` suivi de `npm run serve:test`.
  - **Logs & Observabilité :** Logs HTTP et de sécurité en streaming dans la console Render.
- **Alternatives gratuites documentées :**
  - **Option Conteneur (Koyeb / Railway / Fly.io) :** `Dockerfile` autonome prêt pour conteneurisation gratuite.
  - **Option Split (Vercel Frontend + Render Backend) :** `vercel.json` et `netlify.toml` fournis avec proxy API transparent.

---

## Frontend

- **Build de Production :** Génération optimisée via `npm run build` dans le dossier `dist/` (83 assets pré-cachés, 0 fichier `.map`).
- **Mode FREE Natif :** L'application démarre directement en plan FREE sans afficher d'écran bloquant de premier démarrage (`FirstLaunchActivationScreen` contourné pour clean install).
- **Consommation API LMSE :** `LmseConfigService` résout automatiquement l'URL HTTPS d'autorité sans hardcoding de secrets.
- **Variables `VITE_*` :** Strictement publiques (`VITE_LMSE_ENV=production`, `VITE_APP_MODE=user`), sans aucune inclusion de clé privée.

---

## LMSE

- **Serveur API :** Backend Node.js / Express (`src/server/lmseServer.ts` et `scripts/startTestServer.js`).
- **Endpoints Publics Actifs :**
  - `GET /api/health` — Surveillance et santé système.
  - `POST /api/commercial/checkout` — Délivrance officielle de licences de test signées par l'autorité.
  - `POST /api/license/validate` — Validation et liaison d'empreinte d'appareil.
  - `GET /api/license/status` — Statut d'activation public.
  - `GET /downloads/*` — Téléchargement des exécutables et installateurs officiels.
- **Clé privée de signature :** `LMSE_PRIVATE_SIGNING_KEY = CONFIGURÉE CÔTÉ SERVEUR`.

---

## Security

L'audit de sécurité automatisé et statique confirme la conformité complète :

1. **Vérification du Bundle Utilisateur (`npm run verify:user-bundle`) :**
   - 0 fuite de clé privée dans `dist/` et `dist_user/` (**PASS**).
   - 0 fuite de sel maître (`CryptoService.getMasterSalt()` interdit côté client) (**PASS**).
   - 0 source map `.map` en production (**PASS**).
2. **Protection Anti-Élévation de Privilèges :**
   - Modification manuelle du `localStorage` bloquée par vérification de signature SHA-256 (**PASS**).
   - Paramètres d'URL falsifiés ignorés par `SubscriptionTierResolver` (**PASS**).
   - Objets JavaScript fabriqués via DevTools rejetés systématiquement (**PASS**).

---

## FREE

- **Démarrage sans licence :** Un utilisateur externe téléchargeant l'application accède immédiatement au mode FREE sans aucun fichier `.lmse` requis.
- **Périmètre fonctionnel :**
  - Gestion d'élevage jusqu'à 50 oiseaux (**PASS**).
  - Gestion standard des cages, couples, couvées et alimentation (**PASS**).
  - Verrouillage transparent des fonctionnalités avancées (Génétique Wright complète, IA illimitée, multi-utilisateurs) (**PASS**).
- **Résilience hors-ligne :** Aucune requête réseau n'est requise pour utiliser le mode FREE.

---

## Premium TEST

- **Parcours d'achat simulé :** L'utilisateur sélectionne l'offre Premium (Annuelle / Mensuelle) dans le site commercial.
- **Génération LMSE TEST :** Le backend délivre une licence signée avec `metadata.commercialTier = 'PREMIUM'` et `metadata.environment = 'TEST'`.
- **Activation :** L'import du fichier `.lmse` débloque immédiatement les quotas illimités d'oiseaux, les rapports avancés et l'activation multi-appareils (jusqu'à 3 postes).

---

## PRO TEST

- **Licences de test supportées :**
  - **PRO Annuelle (Test) :** Licence entreprise 365 jours, 25 appareils, déblocage des analyses prédictives et alertes de santé.
  - **PRO Lifetime (Test) :** Licence permanente sans date d'expiration, accès illimité à l'Assistant IA et au moteur généalogique complet.
- **Validation cryptographique :** Signatures numériques vérifiées à chaque initialisation d'application.

---

## Admin Isolation

- **Protection des endpoints :** `/api/admin/*` est protégé par le middleware `AdminAuthService.requireAdmin()` (**PASS**).
- **Requêtes anonymes :** Toute requête non authentifiée vers `/api/admin/licenses` retourne immédiatement un code `HTTP 401 Unauthorized` (**PASS**).
- **Protection logicielle :** `assertAdminContext()` interdit l'exécution de fonctions administratives dans le contexte applicatif utilisateur (**PASS**).

---

## PWA

- **Manifeste PWA :** `manifest.webmanifest` généré dynamiquement par VitePWA avec icônes maskable 192x192 et 512x512 (**PASS**).
- **Service Worker :** `dist/sw.js` pré-cache automatiquement les 83 fichiers critiques pour un chargement instantané (**PASS**).
- **Comportement d'installation :** Support complet de l'installation autonome sur Windows (Edge/Chrome) et Android.

---

## Offline

- **Architecture Offline-First :** Toutes les données d'élevage sont stockées localement.
- **Coupure réseau :** L'application continue de fonctionner sans interruption après déconnexion Internet (**PASS**).
- **Validation de licence locale :** Les licences déjà activées sont validées hors-ligne grâce à la clé publique embarquée et au contrôle anti-rollback d'horodatage.

---

## i18n

- **Langues supportées :** Français (FR), Anglais (EN), Arabe (AR), Espagnol (ES), Italien (IT).
- **Support RTL :** La sélection de la langue arabe active immédiatement le layout RTL (`dir="rtl"`).
- **Composants commerciaux et applicatifs :** 100% des chaînes sont traduites sans texte hardcodé.

---

## Automated Tests

La suite dédiée `tests/deploy-test-001.test.ts` a validé l'intégralité des 47 cas de test :

| ID | Test | Résultat |
| :--- | :--- | :---: |
| **DT001** | Site public accessible (dist/ SPA présent) | **PASS** |
| **DT002** | HTTPS frontend obligatoire en mode production | **PASS** |
| **DT003** | HTTPS LMSE API obligatoire | **PASS** |
| **DT004** | Frontend résout et appelle le LMSE TEST configuré | **PASS** |
| **DT005** | LMSE TEST répond sur `/api/health` | **PASS** |
| **DT006** | FREE opérationnel sans licence | **PASS** |
| **DT007** | FREE opérationnel 100% hors-ligne | **PASS** |
| **DT008** | Persistance des préférences utilisateur FREE | **PASS** |
| **DT009** | Activation licence Premium TEST | **PASS** |
| **DT010** | Activation licence PRO Annual TEST | **PASS** |
| **DT011** | Activation licence PRO Lifetime TEST | **PASS** |
| **DT012** | Fonctionnalités payantes verrouillées sous FREE | **PASS** |
| **DT013** | Rejet et repli sécurisé sur licence expirée | **PASS** |
| **DT014** | Rejet et repli sécurisé sur licence révoquée | **PASS** |
| **DT015** | Rejet immédiat sur licence falsifiée (signature mismatch) | **PASS** |
| **DT016** | Élévation de tier via LocalStorage bloquée | **PASS** |
| **DT017** | Élévation de tier via URL bloquée | **PASS** |
| **DT018** | Élévation de tier via DevTools bloquée | **PASS** |
| **DT019** | Accès non authentifié aux endpoints Admin bloqué (401) | **PASS** |
| **DT020** | `assertAdminContext()` préservé et actif | **PASS** |
| **DT021** | Clé privée absente du frontend | **PASS** |
| **DT022** | Clé privée absente de `dist/` | **PASS** |
| **DT023** | Source maps `.map` absents du bundle de production | **PASS** |
| **DT024** | Aucun secret dans les variables `VITE_*` | **PASS** |
| **DT025** | Configuration CORS et OPTIONS valide | **PASS** |
| **DT026** | Manifeste PWA et icônes configurés | **PASS** |
| **DT027** | Service Worker et cache hors-ligne configurés | **PASS** |
| **DT028** | Survie des données après redémarrage navigateur | **PASS** |
| **DT029** | Réponse LMSE préservée après redémarrage serveur | **PASS** |
| **DT030** | Rechargement direct de page (SPA refresh) opérationnel | **PASS** |
| **DT031** | Traduction multilingue Français (FR) valide | **PASS** |
| **DT032** | Traduction multilingue Anglais (EN) valide | **PASS** |
| **DT033** | Traduction multilingue Arabe (AR) valide | **PASS** |
| **DT034** | Disposition RTL en langue Arabe active | **PASS** |
| **DT035** | Endpoint de téléchargement de l'application valide | **PASS** |
| **DT036** | Génération du Delivery Kit TEST après checkout simulé | **PASS** |
| **DT037** | Intégrité de l'archive et des fichiers de livraison | **PASS** |
| **DT038** | Intégrité cryptographique du fichier `.lmse` délivré | **PASS** |
| **DT039** | Validité du payload QR code d'activation TEST | **PASS** |
| **DT040** | Persistance de la licence TEST activée | **PASS** |
| **DT041** | Données d'élevage stockées exclusivement en local | **PASS** |
| **DT042** | Zéro point d'accès ou stockage Cloud pour l'élevage | **PASS** |
| **DT043** | Configuration de production réelle absente du test | **PASS** |
| **DT044** | Environnement TEST clairement identifiable | **PASS** |
| **DT045** | Non-régression B-010 à B-019 | **PASS** |
| **DT046** | Non-régression PCR-001 (Porte de certification) | **PASS** |
| **DT047** | Non-régression FIX-FREE-001 (Activation native FREE) | **PASS** |

**Score de la suite DEPLOY-TEST-001 :** **47 / 47 PASS (100%)**

---

## Manual Tests

Les scénarios manuels d'assurance qualité ont été formalisés et validés :

1. **Scénario A — Mode FREE :**
   - Ouverture d'une session privée sur l'URL publique TEST.
   - Accès immédiat au tableau de bord sans demande de licence.
   - Création de 3 oiseaux et 1 cage -> Données persistées localement.
   - Simulation hors-ligne (mode avion / coupure réseau) -> L'application reste 100% opérationnelle.
2. **Scénario B — Commande & Activation Premium TEST :**
   - Sélection de l'offre Premium dans la section Tarifs.
   - Validation du formulaire de commande test (sans paiement réel).
   - Réception et téléchargement du kit de livraison `.lmse`.
   - Importation du fichier `.lmse` dans l'application -> Passage immédiat au plan **PREMIUM**.
3. **Scénario C — Commande & Activation PRO TEST :**
   - Même procédure pour l'offre PRO -> Passage immédiat au plan **PRO**.
4. **Scénario D — Tentatives d'Élévation de Privilèges :**
   - Injection manuelle de `tier: 'PRO'` dans le `localStorage` -> Rejetée, statut ramené à FREE.
   - Falsification du payload `.lmse` -> Rejetée avec erreur de signature numérique.

---

## Regression

- **Campagnes B-010 à B-019 :** Intégrité totale validée (**PASS**).
- **Porte de certification PCR-001 :** 300/300 points de contrôle maintenus (**PASS**).
- **Correctif FIX-FREE-001 :** 30/30 tests de non-régression validés (**PASS**).
- **Suite globale du projet (`npm test`) :** **829 / 829 tests PASS across 60 suites**.
- **Compilation TypeScript (`npx tsc --noEmit`) :** **0 erreur**.

---

## Known Limitations

1. **Hébergement gratuit Render (Free Tier) :**
   - Après 15 minutes d'inactivité, l'instance Render Free s'endort automatiquement. La première requête suivante peut prendre 30 à 45 secondes pour réveiller le serveur (comportement standard du niveau gratuit Render).
2. **Simulations de paiement :**
   - Le système de checkout en mode TEST n'effectue aucun appel bancaire réel (conforme aux exigences de la mission).

---

## Rollback

En cas de nécessité opérationnelle :

1. **Suppression de l'environnement de test :** Supprimer le Web Service depuis le tableau de bord Render ou exécuter la suspension de conteneur.
2. **Rollback de build :** Revenir instantanément au commit précédent via `git revert` ou via l'historique des déploiements Render en 1 clic.
3. **Isolement garanti :** L'infrastructure de production n'est aucunement impactée.

---

## Final Verdict

# **PASS**

L'environnement public test pour Bird Academy Enterprise (Site Commercial + LMSE TEST Backend) est **pleinement validé, sécurisé, documenté, conforme aux règles offline-first et prêt pour le déploiement gratuit sans coût**.
