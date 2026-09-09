# CHECKLIST DE SÉCURITÉ : PAIEMENT DE PRODUCTION
## BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
### Grille d'Audit & Contrôle Pré-Lancement Commercial (22 Points de Contrôle)
**Release Cible** : `v1.3.6-RC4` | **Build ID** : `BA-V1.3.6-RC4` | **Build Code** : `17`
**Invariants** : `PAYMENT LIVE = DISABLED` | `PUBLIC COMMERCIAL SALES = CLOSED` | `RELEASE = FROZEN`

---

## 1. Grille d'Audit Formelle

| ID | Point de Contrôle | Statut | Preuve / Justification Technique |
| :--- | :--- | :---: | :--- |
| **SEC-01** | **No live secret in Git** | [x] CONFORME | Scanner de dépôt exécuté : aucun commit ne contient de clé privée ni secret marchand `sk_live_`. Fichiers `.gitignore` configurés. |
| **SEC-02** | **No payment secret in frontend** | [x] CONFORME | Bundle audit sur `dist/`, `dist_user/`, `dist_commercial/` validé avec 0 fuite de secret marchand. |
| **SEC-03** | **No webhook secret in frontend** | [x] CONFORME | Le secret de webhook n'est consommé qu'au sein de `src/server/` et n'est jamais exposé aux clients. |
| **SEC-04** | **LMSE key server-only** | [x] CONFORME | La clé de signature asymétrique ECDSA P-256 réside exclusivement dans le serveur Express. Seule la clé publique est exposée. |
| **SEC-05** | **TEST/PROD separate** | [x] CONFORME | Environnement de test public (`bird-academy-public-test.onrender.com`) et infrastructure de production totalement découplés. |
| **SEC-06** | **HTTPS enforcement** | [x] CONFORME | Redirection HTTP -> HTTPS activée, TLS 1.2/1.3 requis, absence de contenu mixte (Mixed Content). |
| **SEC-07** | **CORS strict configuration** | [x] CONFORME | Variable `CORS_ORIGINS` (avec alias `ALLOWED_ORIGINS`) spécifiée sans wildcard permissif en production. |
| **SEC-08** | **Webhook signature verification** | [x] CONFORME | Vérification HMAC-SHA256 déterministe obligatoire sur chaque notification entrante (`x-payment-signature`, `stripe-signature`). |
| **SEC-09** | **Replay protection** | [x] CONFORME | Contrôle d'horodatage strict rejetant les requêtes différant de plus de 300 secondes de l'heure serveur. |
| **SEC-10** | **Idempotence processing** | [x] CONFORME | Déduplication par `eventId` et `paymentId`. Un webhook dupliqué ne génère jamais de seconde licence. |
| **SEC-11** | **Amount verification** | [x] CONFORME | Le serveur vérifie la stricte concordance entre le montant payé et le prix catalogue officiel (49€, 119€, 249€). |
| **SEC-12** | **Currency verification** | [x] CONFORME | Contrôle de devise systématique (`EUR` ou `TND`). Rejet immédiat de toute devise non autorisée. |
| **SEC-13** | **Server confirmation authority** | [x] CONFORME | Le client ne peut pas s'auto-déclarer payé. Seul le webhook ou la notification serveur authentifiée valide l'ordre. |
| **SEC-14** | **License authority integrity** | [x] CONFORME | LMSE est l'unique autorité émettrice. Signature ECDSA P-256 infalsifiable, vérifiée localement par l'application cliente. |
| **SEC-15** | **Admin endpoint isolation** | [x] CONFORME | Les endpoints administratifs (`/api/admin/*`) exigent une authentification forte. Tout accès anonyme retourne HTTP 401. |
| **SEC-16** | **Breeding data isolation** | [x] CONFORME | Pare-feu de données avicoles : `filterBreedingData` purge tout champ biologique. Transfert réseau d'oiseaux = 0 octet garanti. |
| **SEC-17** | **Logs sanitized** | [x] CONFORME | Masquage systématique des données de carte (PAN masqué, CVV interdit, clés privées exclues des journaux d'audit). |
| **SEC-18** | **Monitoring in place** | [x] CONFORME | Sonde de santé opérationnelle (`GET /api/health`), surveillance de l'uptime et taux d'erreurs HTTP 4xx/5xx sans télémétrie avicole. |
| **SEC-19** | **Rollback plan immutable** | [x] CONFORME | Procédure de retour immédiat vers le commit gelé `8b8736380bd7580676af689f59ade38a42093095` et l'archive SHA-256 scellée. |
| **SEC-20** | **Kill switch available** | [x] CONFORME | Interrupteur d'urgence `PAYMENT_KILL_SWITCH=true` ou `PAYMENT_LIVE=false` coupant instantanément les flux de paiement sans altérer les licences existantes. |
| **SEC-21** | **Payment live disabled** | [x] CONFORME | Invariant absolu respecté : aucune passerelle réelle n'est activée en production. Mode Sandbox par défaut. |
| **SEC-22** | **Single device invariant** | [x] CONFORME | Strict respect de `policy.maxDevices === 1` sur 100% des licences émises. Aucune offre multi-postes dans le catalogue. |

---

## 2. Déclaration de Conformité Finale

L'ensemble des 22 critères de la grille de sécurité est validé par des tests automatisés déterministes au sein de `tests/live-payment-config-001.test.ts`.
Le système présente une étanchéité totale et garantit l'inviolabilité des données privées d'élevage des utilisateurs.
