# PRODUCTION CONFIGURATION CHECKLIST
**Projet** : Bird Academy Enterprise — Volière Manager  
**Version** : v1.3.6-RC4 (Build Code: 17)  
**Mission** : COMMERCIAL-LAUNCH-PREP-001  
**Statut Global** : PREPARATION EN COURS (Paiement et Lancement Public non activés)  

---

## 1. RÈGLE DE VÉRITÉ & STATUTS
Toutes les cases de cette checklist doivent être accompagnées d'un statut objectif :
- `CONFIGURED` : Entièrement configuré et vérifié techniquement.
- `VERIFIED` : Contrôlé par tests automatisés ou audit statique/dynamique.
- `PENDING` : En attente d'une action externe (acquisition de domaine, validation bancaire).
- `NOT CONFIGURED` : Non configuré intentionnellement à ce stade de préparation.
- `NOT TESTED` : Non testé en condition réelle de production.
- `N/A` : Non applicable à ce stade.

---

## 2. MATRICE DE CONFIGURATION PRODUCTION

| Élément | Statut | Description & Preuve Technique |
| :--- | :--- | :--- |
| **[X] Source Tag & Commit** | `VERIFIED` | Commit figé `8b8736380bd7580676af689f59ade38a42093095` sous le tag `v1.3.6-RC4`. Vérifié par `git rev-list -n 1 v1.3.6-RC4`. |
| **[X] Build de Production** | `VERIFIED` | Bundles `dist/` et `dist_user/` compilés avec succès via Vite 6. PWA Workbox configurée. |
| **[X] Séparation TEST / PROD** | `VERIFIED` | `.env.test.example` et `.env.production.example` strictement isolés. Clés privées et URL distinctes. |
| **[ ] Nom de Domaine PROD** | `NOT CONFIGURED` | Domaine en attente d'acquisition. Domaines recommandés : `birdacademy.app`, `volieremanager.com`. Statut : `DOMAIN NOT CONFIGURED`. |
| **[ ] Configuration DNS** | `PENDING` | Enregistrements A / CNAME / ALIAS en attente de l'acquisition du domaine de production. |
| **[ ] Certificat HTTPS PROD** | `PENDING` | TLS 1.2/1.3 automatique (Let's Encrypt / Cloudflare) activable dès que le domaine pointera vers l'hôte. |
| **[X] HTTPS TEST Actif** | `VERIFIED` | `https://bird-academy-public-test.onrender.com` dispose d'un certificat SSL/TLS valide. |
| **[X] Production Website Build** | `CONFIGURED` | Multi-pages, 5 langues (FR, EN, AR, ES, IT), RTL natif arabe, catalogue 4 offres sans contradiction. |
| **[X] LMSE Backend Server** | `CONFIGURED` | `src/server/lmseServer.ts` monte `/api/commercial/checkout`, `/api/license/*`, `/api/admin/*`, `/api/health`. |
| **[X] Admin Console Privée** | `CONFIGURED` | Accès `/api/admin/*` gardé par `AdminAuthService`. Requêtes anonymes rejetées avec code HTTP 401. |
| **[ ] CORS Production Restreint**| `PENDING` | En production, `ALLOWED_ORIGINS` doit être restreint aux domaines officiels. Gabarit documenté dans `.env.production.example`. |
| **[X] Secrets Côté Serveur** | `CONFIGURED` | `LMSE_PRIVATE_SIGNING_KEY` injectable exclusivement par variable d'environnement serveur. 0 fuite dans `dist/`. |
| **[ ] Clé Privée Production** | `PENDING` | Paire de clés ECDSA P-256 dédiée à la production à générer et injecter dans l'infrastructure de production réelle. |
| **[X] Monitoring & Health Check**| `CONFIGURED` | Endpoint `/api/health` opérationnel renvoyant `{ status: 'ok', service: 'LMSE Backend API' }`. |
| **[X] Journalisation & Audit** | `CONFIGURED` | Horodatage UTC immuable (`AUD-SRV-...`) sans divulgation de secrets ni données d'élevage privées. |
| **[X] Sauvegarde État LMSE** | `CONFIGURED` | Procédure documentée dans `LMSE_COMMERCIAL_BACKUP_SOP.md`. Sauvegarde isolée des licences et logs. |
| **[X] Restauration & Rollback** | `VERIFIED` | Archive scellée `Bird-Academy-Enterprise-v1.3.6-RC4.zip` (SHA-256 : `7296d222303649a9f60de6e8064b52904124814bd4dc38a892528fe3b3324248`). |
| **[X] Rate Limiting API** | `CONFIGURED` | Middlewares `RateLimiter` actifs : 5 req/min sur login admin, 30 req/min sur admin, 60 req/min sur utilisateur. |
| **[ ] Compte Marchand Paiement** | `NOT CONFIGURED`| Aucun compte bancaire / passerelle de paiement en direct n'est connecté. Statut : `PAYMENT NOT CONFIGURED`. |
| **[ ] Webhook Paiement** | `NOT CONFIGURED`| Route webhook en attente de l'intégration de la passerelle. Signature cryptographique de webhook requise. |
| **[X] Politique de Remboursement**| `CONFIGURED` | Documentée dans `REFUND_CANCELLATION_SOP.md` avec statuts de commandes et règles de révocation. |
| **[X] Procédure Support Client** | `CONFIGURED` | 12 procédures de support (SUP-001 à SUP-012) et 90 articles de documentation multilingues. |
| **[X] Remplacement de Licence** | `CONFIGURED` | Documentée dans `LICENSE_REPLACEMENT_SOP.md`. Transition `replaced`, préservation du fingerprint matériel. |
| **[X] Procédure Première Vente** | `CONFIGURED` | Documentée dans `FIRST_SALE_SOP.md` (parcours d'achat pas-à-pas du client jusqu'à l'activation). |
| **[X] Zéro Cloud Élevage** | `VERIFIED` | Données d'élevage (oiseaux, couples, reproduction, santé, finances) 100% locales (Local-First). 0 appel réseau. |

---

## 3. PORTES DE SÉCURITÉ COMMERCIALES
1. **PAYMENT ACTIVATION GATE** : `BLOCKED / DISABLED`  
   Le paiement réel reste strictement verrouillé tant que le domaine et la passerelle financière ne sont pas approuvés.
2. **PUBLIC LAUNCH GATE** : `BLOCKED / CLOSED`  
   Le site commercial et le serveur de production ne doivent pas être ouverts au grand public sans un audit financier complet.
