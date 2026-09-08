# BIRD ACADEMY ENTERPRISE — GUIDE DE DÉPLOIEMENT PUBLIC TEST GRATUIT (DEPLOY-TEST-001)

**Version de référence :** 1.3.6-RC4 (Build Code: 17)  
**Coût d'hébergement :** 0 € / mois (100% Gratuit)  
**Environnement cible :** Public Test (Site Commercial + LMSE TEST Backend)

---

## 1. VUE D'ENSEMBLE DE L'ARCHITECTURE

L'environnement de test public est conçu selon une architecture **cohérente, isolée et sécurisée** :

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
                     │                    │ API Localhost /   │
                     │                    │ Same-Origin       │
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

---

## 2. SOLUTIONS D'HÉBERGEMENT GRATUITES VALIDÉES (0 €)

### Option 1 : Render.com — Web Service Gratuit (Recommandé)
- **Coût :** 0 € / mois (Free Tier avec HTTPS et certificat Let's Encrypt automatique).
- **Fonctionnalités :** Support Node.js 22 natif, gestion sécurisée des secrets d'environnement, redéploiement automatique sur `git push`.
- **Fichier de configuration fourni :** `render.yaml` (Blueprint prêt à l'emploi).

#### Procédure de déploiement sur Render (5 minutes) :
1. Rendez-vous sur [dashboard.render.com](https://dashboard.render.com) et créez un compte gratuit.
2. Cliquez sur **New +** > **Blueprint**.
3. Connectez votre dépôt Git du projet.
4. Render détecte automatiquement `render.yaml` :
   - **Build Command :** `npm ci && npm run build`
   - **Start Command :** `npm run serve:test`
5. Dans l'onglet **Environment Variables**, renseignez les variables serveur de test :
   - `LMSE_PRIVATE_SIGNING_KEY` = `LMSE_TEST_PRIVATE_KEY_BIRD_ACADEMY_ENTERPRISE_2026`
   - `LMSE_SEED_SECRET` = `LMSE_TEST_SEED_SECRET_2026`
6. Cliquez sur **Apply**.
7. L'URL HTTPS publique est générée : `https://bird-academy-test.onrender.com`.

---

### Option 2 : Koyeb / Railway / Glitch (Conteneur Docker Gratuit)
- **Fichier de configuration :** `Dockerfile`
- **Commande de démarrage :** `CMD ["node", "--import", "tsx", "scripts/startTestServer.js"]`

---

### Option 3 : Déploiement Séparé (Vercel Frontend + Render Backend)
- **Frontend sur Vercel :** Déployez `dist/` avec `vercel.json` et la variable publique `VITE_LMSE_API_URL=https://<votre-backend-render>.onrender.com`.
- **Backend sur Render :** Déployez `scripts/startAdminProdServer.js` ou `scripts/startTestServer.js`.

---

## 3. VARIABLES D'ENVIRONNEMENT

### A. Variables Publiques Frontend (Inoffensives, injectées au build)

| Variable | Rôle | Exemple |
| :--- | :--- | :--- |
| `VITE_LMSE_ENV` | Mode d'environnement LMSE | `production` |
| `VITE_LMSE_API_URL` | URL de l'autorité LMSE (optionnel si unifié) | `https://bird-academy-test.onrender.com` |
| `VITE_APP_MODE` | Mode de build de l'application | `user` |

### B. Secrets Serveur LMSE (Strictement Côté Serveur — JAMAIS dans le Bundle Frontend)

| Variable | Emplacement | Rôle |
| :--- | :--- | :--- |
| `LMSE_PRIVATE_SIGNING_KEY` | Dashboard hébergeur (Render Secret) | Signature cryptographique ECDSA/SHA-256 des licences test |
| `LMSE_SEED_SECRET` | Dashboard hébergeur (Render Secret) | Sel maître des checksums d'autorité |
| `ENVIRONMENT` | Dashboard hébergeur (Render Env) | Défini à `TEST` |

---

## 4. VÉRIFICATIONS POST-DÉPLOIEMENT

Après déploiement sur votre URL publique :

1. **Vérification de Santé API :**
   ```bash
   curl -I https://<votre-app-test>/api/health
   # Réponse attendue : HTTP 200 OK {"status":"ok","service":"LMSE Backend API"}
   ```

2. **Vérification du Mode FREE Natif :**
   - Ouvrez `https://<votre-app-test>/` en navigation privée.
   - L'application doit démarrer immédiatement sans exiger de licence `.lmse`.
   - Le statut affiché est **Plan GRATUIT** (FREE).

3. **Vérification du Checkout Test :**
   - Accédez à la boutique / section Tarifs sur le site commercial.
   - Choisissez l'offre **PREMIUM (Test)** ou **PRO (Test)**.
   - Validez la commande simulée (aucune carte bancaire requise).
   - Téléchargez le kit de livraison et le fichier `.lmse` officiel signé par LMSE TEST.
   - Importez la licence dans l'application et vérifiez l'activation immédiate.

4. **Vérification de l'Isolation Admin :**
   ```bash
   curl -I https://<votre-app-test>/api/admin/licenses
   # Réponse attendue : HTTP 401 Unauthorized
   ```

---

## 5. PROCÉDURE D'ARRÊT & DE ROLLBACK

- **Mise en pause :** Rendez-vous dans le dashboard Render > Settings > **Suspend Web Service**.
- **Suppression définitive :** Rendez-vous dans Render > Settings > **Delete Service**.
- **Rollback instantané :** Dans Render > Events / Deploys, cliquez sur **Rollback to this deploy** sur le build précédent.

---

## 6. CERTIFICATION OFFICIELLE DEPLOY-TEST-002

La mission **DEPLOY-TEST-002** a validé l'ensemble des 30 points de contrôle d'hébergement gratuit réel (D2001 à D2030) et la conformité complète de la suite :
- `npm run test:deploy-test-002` : **30/30 PASS**.
- `npm run test:deploy-test` : **47/47 PASS**.
- `npm run verify:user-bundle` : **PASS (0 clé privée, 0 fuite admin)**.
- `npm test` : **829/829 PASS**.
- Rapport complet : [`QA_DEPLOY_TEST_002_REPORT.md`](file:///d:/app%20canaris/28+/QA_DEPLOY_TEST_002_REPORT.md).
