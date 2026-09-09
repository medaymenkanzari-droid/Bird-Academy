# SPÉCIFICATION ET CONFIGURATION DU PRESTATAIRE DE PAIEMENT (PRODUCTION)
**Projet :** Bird Academy Enterprise — Volière Manager  
**Release :** v1.3.6-RC4 (Gelée)  
**Mission :** PAYMENT-PRODUCTION-001  
**Statut Global :** `PAYMENT LIVE = DISABLED` | `PUBLIC SALES = CLOSED`  
**Statut Sélection :** `PROVIDER SELECTION = PENDING (Formalisation & Contrats)`  

---

## 1. Provider Sélectionné & Justification

### Architecture Cible : Stratégie Hybride Dual-Gateway
1. **Passerelle Internationale (Règlement en EUR) :** **Stripe** (via entité internationale / Stripe Atlas) ou **Paddle** (Merchant of Record).
   - *Justification :* Couverture mondiale, support des cartes bancaires européennes et internationales, prélèvements SEPA, Apple Pay et Google Pay, gestion de pointe des webhooks HMAC-SHA256, automatisation des remboursements.
2. **Passerelle Nationale (Règlement en TND pour la Tunisie) :** **Konnect** (konnect.network).
   - *Justification :* Agréé par la Banque Centrale de Tunisie, acception native des cartes bancaires nationales CIB et des cartes e-Dinar de la Poste Tunisienne, commission compétitive (1.3% local / 2.9% international, 0 € d'abonnement), API REST moderne avec webhooks et environnement sandbox.

---

## 2. Endpoints du Serveur d'Application (Bird Academy)

Tous les endpoints de traitement des paiements sont hébergés sur le backend propriétaire et protégés contre les abus :

| Méthode | Endpoint | Description / Rôle | Accès & Sécurité |
|---|---|---|---|
| `POST` | `/api/commercial/orders/checkout` | Création de la commande et initialisation de la session de paiement | Public (Rate-limited: 60 req/min) |
| `POST` | `/api/commercial/webhooks/payment` | Réception et traitement des notifications serveur-à-serveur | Authentifié via signature HMAC stricte |
| `POST` | `/api/commercial/orders/:orderId/verify` | Vérification manuelle du paiement (en cas de webhook retardé) | Contrôle d'existence et vérification serveur |
| `GET` | `/api/commercial/orders/:orderId` | Consultation publique de l'état d'avancement d'une commande | Données filtrées (zéro donnée d'élevage ni secret) |
| `GET` | `/api/commercial/orders/:orderId/delivery` | Téléchargement du kit 5 fichiers et de l'archive PKZIP | Accessible uniquement après statut `DELIVERED` |
| `POST` | `/api/commercial/orders/:orderId/cancel` | Annulation avant paiement | Uniquement pour statut `PAYMENT_PENDING` |
| `POST` | `/api/commercial/orders/:orderId/refund` | Remboursement d'une commande payée et révocation de licence | Authentifié / Réservé Administrateur ou Support |
| `POST` | `/api/commercial/orders/:orderId/retry-delivery` | Régénération du kit de livraison après incident technique | Uniquement sur commande `PAID` avec `licenseId` |

---

## 3. Environnements : Isolation TEST vs PRODUCTION

Le système applique un cloisonnement strict entre les environnements :

| Paramètre | Environnement TEST (Actuel) | Environnement PRODUCTION (Cible) |
|---|---|---|
| **Mode Applicatif** | `PAYMENT_MODE=sandbox` | `PAYMENT_MODE=production` |
| **Adaptateur Actif** | `SandboxPaymentProvider` (`SANDBOX_PROVIDER`) | `StripePaymentProvider` / `KonnectPaymentProvider` |
| **Passerelle Sandbox** | Simulation locale déterministe | Sandbox officiel du PSP (`api.preprod.konnect.network`) |
| **Bannière IHM** | Avertissement visible *"TEST PUBLIC GRATUIT"* | Aucune bannière de test |
| **Base de Données Commandes** | Registre mémoire isolé / sandbox | Registre chiffré persistant / audit immuable |
| **Clés d'API** | Clés sandbox de test (`whsec_sandbox_...`) | Clés de production injectées via coffre-fort secret |
| **Statut Opérationnel** | **ACTIF (Simulé, sans transaction)** | **VERROUILLÉ (`PAYMENT LIVE = DISABLED`)** |

---

## 4. Devises et Grille Tarifaire Officielle

### Source de Vérité
La source de vérité des prix, devises, durées et fonctionnalités associées réside **strictement côté serveur** (`CommercialPaymentService.OFFICIAL_PRICES`). Tout prix ou tier transmis par le navigateur est ignoré.

| Offre Commerciale | Tier LMSE | Prix Officiel (EUR) | Équivalent Estimé (TND) | Durée de Validité | Invariant Mono-Appareil |
|---|---|---|---|---|---|
| **FREE Community** | `FREE` | 0.00 EUR | 0.000 TND | Illimitée (Local) | Single Device (1 appareil) |
| **PREMIUM Annuel** | `PREMIUM` | 49.00 EUR | ~165.000 TND | 365 jours | Single Device (1 appareil) |
| **PRO Enterprise Annuel** | `PRO` | 119.00 EUR | ~399.000 TND | 365 jours | Single Device (1 appareil) |
| **PRO Enterprise Lifetime** | `PRO` | 249.00 EUR | ~835.000 TND | Illimitée (`durationDays = null`) | Single Device (1 appareil) |

*Règle stricte sur le TND : L'acceptation du TND sera activée uniquement après officialisation du barème de conversion contractuel avec la passerelle tunisienne. Actuellement, seul EUR est accepté en direct.*

---

## 5. Flux de Checkout & Corrélation Déterministe

Le flux séquentiel garantit qu'aucune licence n'est émise sans confirmation préalable du prestataire :

```
CLIENT (Navigateur)
  │ 1. POST /api/commercial/orders/checkout { offerId: "OFFER-PREMIUM-ANNUAL-2026", customerName, customerEmail }
  ▼
SERVEUR BACKEND (CommercialPaymentService)
  │ 2. Validation de l'email, filtre des données d'élevage, recherche prix officiel (49 EUR)
  │ 3. Génération de orderId ("ORD-2026-XXXX") et statut PAYMENT_PENDING
  │ 4. Appel de la passerelle de paiement pour générer la session
  ▼
PASSERELLE DE PAIEMENT (PSP)
  │ 5. Création de checkoutSessionId ("cs_...") et paymentUrl
  ▼
CLIENT (Navigateur)
  │ 6. Redirection vers la page de paiement sécurisée du PSP (hébergée PCI-DSS)
  │ 7. Saisie des identifiants bancaires par le client (aucune donnée de carte sur notre serveur)
  ▼
PASSERELLE DE PAIEMENT (PSP)
  │ 8. Confirmation du débit bancaire
  │ 9. Envoi d'un webhook POST signé au serveur backend (/api/commercial/webhooks/payment)
```

---

## 6. Schéma et Sécurité des Webhooks

### Format Standard du Payload Webhook
```json
{
  "eventId": "evt_prod_948127391823",
  "eventType": "payment.succeeded",
  "orderId": "ORD-2026-849102-XJ7K",
  "paymentId": "pay_stripe_3Mtwx62eZvKYlo2C0Vb",
  "amount": 49.00,
  "currency": "EUR",
  "timestamp": 1788912400000
}
```

### Règles de Validation du Webhook
1. **En-tête de Signature Obligatoire :** `X-Webhook-Signature` (ou `Stripe-Signature` pour Stripe).
2. **Vérification Cryptographique HMAC :** Calcul de l'empreinte `HMAC-SHA256(payload, WEBHOOK_SECRET)` et comparaison en temps constant (`crypto.timingSafeEqual`) pour prévenir les attaques par canal auxiliaire (*timing attacks*).
3. **Protection contre le Rejeu Temporel (*Clock Skew*) :** Le timestamp de l'événement ne doit pas différer de plus de 300 secondes (5 minutes) par rapport à l'horloge système du serveur.
4. **Validation de Cohérence Commerciale :**
   - L'`orderId` doit exister dans le registre.
   - Le montant reçu (`amount`) doit correspondre au centime près au prix officiel du tier (`expectedAmount === receivedAmount`).
   - La devise reçue (`currency`) doit être strictement identique à la devise de la commande (`EUR`).

---

## 7. Idempotence et Protection Anti-Doublon

Pour prévenir les doubles facturations et la double émission de licences en cas de rejeu réseau ou de webhook dupliqué :
- **Registre des Événements Traités :** Tout `eventId` validé est consigné dans un registre immuable (`processedEvents`).
- **Comportement en cas de Webhook Rejoué :**
  - Le serveur identifie que la commande est déjà dans l'état `DELIVERED` ou `PAID`.
  - Le serveur renvoie immédiatement une réponse HTTP 200 avec `idempotentReplay: true`.
  - **Aucune seconde licence n'est générée dans LMSE.**
  - Le kit de livraison original est réutilisé.

---

## 8. Procédures de Remboursement et Révocation Synchronisée

Conformément à la gouvernance `REFUND_CANCELLATION_SOP.md` :
1. **Événement `payment.refunded` ou action Support Admin :**
   - Transition de la commande vers l'état `REFUNDED`.
   - Inscription immédiate de la licence associée (`licenseId`) dans la liste de révocation LMSE (`revocationList`).
   - Hachage de la clé (`licenseKey`) et de l'empreinte de la licence (`checksum`) ajoutés au registre des clés révoquées.
2. **Impact Client :**
   - Au prochain lancement de l'application ou lors de la réévaluation de la licence par `LicenseValidator`, le code retourné est `LICENSE_REVOKED`.
   - Le compte client repasse automatiquement au tier **FREE**.
   - **Protection des données d'élevage locales :** 100% des oiseaux, couples, généalogies et fiches de soins restent intégralement accessibles en lecture/écriture locale sous les limites du tier FREE. Aucune donnée d'élevage n'est détruite.

---

## 9. Gestion des Litiges et Chargebacks

- En cas d'événement `dispute.created` ou `chargeback` émis par la banque du porteur :
  - La commande est immédiatement signalée dans le journal d'audit de sécurité (`AUDIT_CHARGEBACK_FLAGGED`).
  - Une notification prioritaire est transmise à l'administrateur.
  - La licence n'est pas révoquée arbitrairement de manière instantanée, mais passe sous un statut d'examen (`DISPUTE_HOLD`) pendant la période d'investigation commerciale (7 jours ouvrés).

---

## 10. Variables d'Environnement et Gestion des Secrets

### Matrice des Variables d'Environnement
Toutes les variables sensibles sont **strictement réservées au serveur** et ne doivent jamais comporter de préfixe `VITE_` :

| Variable d'Environnement | Périmètre | Exemple de Format | Statut Actuel |
|---|---|---|---|
| `PAYMENT_MODE` | Serveur conteneur | `sandbox` ou `production` | Défini sur `sandbox` |
| `PAYMENT_PROVIDER` | Serveur conteneur | `SANDBOX_PROVIDER`, `STRIPE`, `KONNECT` | `SANDBOX_PROVIDER` |
| `PAYMENT_PUBLIC_KEY` | Public / Frontend | `pk_test_...` (Stripe) ou API Key publique | Non configuré |
| `PAYMENT_SECRET_KEY` | Serveur conteneur uniquement | `sk_test_...` / `sk_live_...` | **INTERDIT EN LOCAL / GIT** |
| `PAYMENT_WEBHOOK_SECRET` | Serveur conteneur uniquement | `whsec_...` | Clé sandbox de test uniquement |
| `LMSE_PRIVATE_SIGNING_KEY` | Serveur conteneur uniquement | Clé privée ECDSA P-256 PEM | Isolée côté serveur |

### Règles de Gestion des Secrets (Zero Secret Leak)
- **Zéro clé live dans Git :** Tout commit comportant `sk_live_` ou un secret de production est formellement bloqué.
- **Zéro secret dans le navigateur :** `dist/` et `localStorage` ne contiennent aucune clé privée, aucun token d'administration ni secret webhook.
- **Stockage de production :** Injection exclusive via le gestionnaire de secrets de l'hébergeur de production (ex: Render Environment Secrets avec chiffrement au repos).

---

## 11. Monitoring et Journalisation Sans Données d'Élevage

### Métriques Surveillées
- **Taux de succès du checkout :** `checkout_success_rate = (orders_paid / orders_created) * 100`
- **Taux d'échec des webhooks :** Détection d'anomalies de signature ou de rejeu temporel.
- **Latence de signature LMSE :** Durée moyenne de génération de licence (objectif < 150 ms).
- **Taux de conversion et abandons de panier.**

### Règle de Masquage des Logs
- Les identifiants de transaction (`paymentId`) sont partiellement masqués : `pay_stripe_***1823`.
- Les adresses email sont anonymisées dans les traces publiques : `e***r@example.com`.
- Aucun numéro de carte bancaire, aucun cryptogramme visuel (CVV), aucune clé secrète n'est consigné dans les logs.

---

## 12. Limitations Actuelles et Dépendances Externes

1. **Réglementation Tunisienne des Changes :** L'acceptation directe de devises étrangères (EUR/USD) pour une entreprise tunisienne exige un compte professionnel en devises ou un compte d'attente exportateur.
2. **Statut Juridique :** L'ouverture de comptes marchands de production définitifs nécessite l'immatriculation légale de l'entreprise (RNE en Tunisie pour Konnect / Paymee, ou société étrangère pour Stripe).
3. **Paiement Réel Bloqué :** Tant que les prérequis juridiques et bancaires ne sont pas réunis, le système opère à 100% sous simulation sandbox contrôlée.
