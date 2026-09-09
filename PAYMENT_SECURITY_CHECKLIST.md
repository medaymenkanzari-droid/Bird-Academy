# CHECKLIST DE SÉCURITÉ ET DE CONFORMITÉ FINANCIÈRE
**Projet :** Bird Academy Enterprise — Volière Manager  
**Release :** v1.3.6-RC4 (Gelée)  
**Mission :** PAYMENT-PRODUCTION-001  
**Statut Global :** `PAYMENT LIVE = DISABLED` | `PUBLIC SALES = CLOSED`  

---

## Grille d'Audit de Sécurité du Système de Paiement

Tous les contrôles ci-dessous doivent être vérifiés avant et pendant toute phase d'intégration de prestataire de paiement :

| Contrôle de Sécurité | Exigence Technique | Statut Vérifié | Preuve / Mécanisme |
|---|---|---|---|
| **[x] Secrets server-only** | Les clés secrètes API et secrets de webhooks sont strictement confinés au backend Node.js | **CONFORME** | Aucune variable sensible avec préfixe `VITE_` ; injectées via Render Secrets |
| **[x] No live key in Git** | Zéro clé API réelle de production (`sk_live_`, etc.) dans le dépôt Git | **CONFORME** | Scanner regex automatisé dans les suites de tests (0 occurrence) |
| **[x] No live key in frontend** | Les bundles clients `dist/` et `dist_user/` ne contiennent aucun secret bancaire | **CONFORME** | Validé par `npm run verify:user-bundle` |
| **[x] No card data storage** | Aucun numéro de carte bancaire (PAN), date d'expiration ou CVV n'est collecté ou stocké | **CONFORME** | Flux de redirection hébergé par le PSP (PCI-DSS niveau 1 externalisé) |
| **[x] Webhook signature verification** | Tout événement webhook entrant est signé cryptographiquement et validé par HMAC | **CONFORME** | `CommercialPaymentService.verifySignature` avec HMAC-SHA256 |
| **[x] Timestamp validation** | Rejet de tout webhook dont l'horodatage dévie de plus de 300 secondes (5 min) | **CONFORME** | Protection active contre le skew d'horloge dans `handleWebhook` |
| **[x] Replay protection** | Un même webhook rejoué plusieurs fois ne déclenche aucune action secondaire | **CONFORME** | Registre `processedEvents` empêchant le double traitement |
| **[x] Idempotence** | Détection d'événements dupliqués et préservation de l'unicité de la commande | **CONFORME** | `idempotentReplay: true`, réutilisation de la commande déjà livrée |
| **[x] Amount verification** | Le montant reçu dans le webhook doit être strictement égal au prix catalogue officiel | **CONFORME** | Comparaison stricte avec `CommercialPaymentService.OFFICIAL_PRICES` |
| **[x] Currency verification** | La devise reçue doit correspondre exactement à la devise de la commande (`EUR`) | **CONFORME** | Rejet systématique avec code d'erreur si `currency !== 'EUR'` |
| **[x] Server confirmation** | Le client frontend ne peut jamais déclarer unilatéralement qu'une commande est `PAID` | **CONFORME** | Seule la réception du webhook validé côté serveur fait transiter l'état |
| **[x] LMSE authority only** | Le prestataire de paiement ne signe jamais de licence ; LMSE est l'unique autorité | **CONFORME** | `LicenseGenerator` interne avec signature asymétrique ECDSA P-256 + SHA-256 |
| **[x] Admin protected** | Les endpoints administratifs et clés de signature sont inaccessibles au public | **CONFORME** | `assertAdminContext()` et isolation stricte du bundle utilisateur |
| **[x] Logs sanitized** | Aucun numéro de carte, secret d'API ou clé privée LMSE n'apparaît dans les logs | **CONFORME** | Masquage des identifiants (`paymentId`, `customerEmail`) dans les sorties |
| **[x] Data isolation** | Zéro donnée d'élevage biologique (oiseaux, couples, cages) envoyée au prestataire | **CONFORME** | `CommercialPaymentService.filterBreedingData` filtre tous les champs de volière |
| **[x] HTTPS** | Tout le trafic commercial et API est chiffré sous TLS 1.3 / TLS 1.2 | **CONFORME** | Spécification HTTPS avec HSTS 2 ans (`includeSubDomains; preload`) |
| **[x] CORS** | Le serveur n'autorise que les requêtes originaires des domaines propriétaires | **CONFORME** | Variable conteneur `CORS_ORIGINS` restreinte aux sous-domaines officiels |
| **[x] Rate limiting** | Protection contre le brute-force et le spam de requêtes de paiement | **CONFORME** | Middleware `RateLimiter` limitant checkout et webhooks |
| **[x] Monitoring** | Métriques opérationnelles de taux de succès sans exposition de données privées | **CONFORME** | Télémétrie anonymisée orientée infrastructure et santé du service |
| **[x] Rollback** | Procédure documentée de bascule immédiate vers le mode simulation en cas d'anomalie | **CONFORME** | Détaillée à l'Étape 9 du Runbook (`PAYMENT_PRODUCTION_RUNBOOK.md`) |
| **[x] Refund procedure** | Remboursement d'une commande synchronisé avec la révocation de licence dans LMSE | **CONFORME** | Inscription automatique dans la liste de révocation (`revocationList`) |

---

## Synthèse d'Audit Sécurité
- **Total des contrôles requis :** 21 / 21
- **Contrôles validés :** 21 / 21 (100%)
- **Vulnérabilités critiques détectées :** 0
- **Statut d'approbation sécurité :** **APPROUVÉ POUR ENVIRONNEMENT SIMULATION & CADRAGE PRODUCTION**
