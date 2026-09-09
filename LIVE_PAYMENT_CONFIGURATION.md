# CONFIGURATION OFFICIELLE DU PAIEMENT DE PRODUCTION
## BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
### Document de Référence Infrastructure & Passerelle Commerciale
**Release** : `v1.3.6-RC4` | **Build ID** : `BA-V1.3.6-RC4` | **Code** : `17`
**Invariants Obligatoires** : `PAYMENT LIVE = DISABLED` | `PUBLIC COMMERCIAL SALES = CLOSED` | `RELEASE = FROZEN`

---

## 1. Vue d'Ensemble & Principes Directeurs

Ce document formalise les spécifications techniques de configuration du système de paiement de production de Bird Academy Enterprise.
Conformément aux exigences strictes de sécurité et de conformité :
- **Zéro Clé Secrète dans le Dépôt ou le Code Source** : Tous les secrets sont injectés exclusivement au runtime via l'environnement sécurisé du serveur d'hébergement.
- **Séparation Stricte entre Frontend et Backend** : Le client web (SPA React/Vite) ne reçoit aucun secret de paiement ni clé privée de signature.
- **Souveraineté des Données Avicoles** : Le système de paiement ne collecte et ne transmet aucune donnée d'élevage (oiseaux, volières, accouplements, consanguinité). Le transfert réseau de données biologiques est garanti à **0 octet**.

---

## 2. Prestataires de Paiement (Dual-Gateway Architecture)

Pour concilier les spécificités réglementaires tunisiennes (contrôle des changes, cartes nationales CIB et e-Dinar) et l'accès au marché international (Europe, Maghreb, Amériques), l'architecture repose sur une double passerelle :

| Paramètre | Passerelle Nationale (Tunisie) | Passerelle Internationale (Export / Monde) |
| :--- | :--- | :--- |
| **Prestataire Retenu** | **Konnect Network** (Konnect SAS) | **Paddle** (Merchant of Record) ou **Stripe** |
| **Statut Contractuel** | `PENDING_SIGNATURE` (Convention marchande BCT en cours) | `PENDING_SETUP` (Entité MoR ou filiale UE requise) |
| **Zone Géographique** | Tunisie (Utilisateurs locaux) | International (Union Européenne, Diaspora, Monde) |
| **Moyens de Paiement** | Cartes bancaires CIB, Carte e-Dinar (La Poste), Virements | Visa, Mastercard, CB, Apple Pay, Google Pay, SEPA |
| **Devise Principale** | Dinars Tunisiens (`TND`) | Euros (`EUR` par défaut), `USD`, `GBP` |
| **Reversement (Payouts)** | Direct sur RIB bancaire tunisien sous 24h-48h | Virement bancaire SWIFT ou Payoneer vers compte devises |
| **Conformité & Sécurité** | Agrément BCT, PCI-DSS Level 1 via SMT | PCI-DSS Level 1, 3D Secure 2.2 obligatoire (DSP2/SCA) |

---

## 3. Environnements & Cloisonnement

| Caractéristique | Environnement TEST / SANDBOX | Environnement PRODUCTION |
| :--- | :--- | :--- |
| **Domaine Public** | `https://bird-academy-public-test.onrender.com` | `https://bird-academy.com` / `https://api.bird-academy.com` |
| **Mode Système** | `PAYMENT_MODE=sandbox` | `PAYMENT_MODE=production` (Verrouillé : `PAYMENT_LIVE=false`) |
| **Fournisseur Actif** | `SandboxPaymentProvider` (Simulateur déterministe) | Passerelles réelles Konnect / Stripe (Désactivées) |
| **Bannière IHM** | Bannière visible : `TEST PUBLIC GRATUIT` | Aucune bannière de test |
| **Clé Privée LMSE** | Clé asymétrique de test locale | Clé asymétrique de production sécurisée |
| **Impact Financier** | **Strictement 0.00 EUR / 0.00 TND garanti** | **Strictement 0.00 EUR / 0.00 TND (Ventes fermées)** |

---

## 4. Spécifications du Catalogue & Règle de Prix Serveur

Le serveur Node/Express (`CommercialPaymentService`) constitue l'unique autorité de calcul des prix. Le frontend transmet uniquement l'`offerId`. Toute tentative de falsifier le prix, la devise ou le tier est bloquée et auditée côté serveur.

```
+------------------------------------+-----------+---------------+-------------+
| Offre                              | Prix      | Durée         | maxDevices  |
+------------------------------------+-----------+---------------+-------------+
| OFFER-FREE-COMMUNITY               | 0 EUR     | Illimitée     | 1           |
| OFFER-PREMIUM-ANNUAL-2026          | 49 EUR    | 365 jours     | 1           |
| OFFER-PRO-ENTERPRISE-ANNUAL-2026   | 119 EUR   | 365 jours     | 1           |
| OFFER-PRO-ENTERPRISE-LIFETIME-2026 | 249 EUR   | Permanente    | 1           |
+------------------------------------+-----------+---------------+-------------+
```
*Note Invariant : Le catalogue ne propose aucune formule multi-postes. Toutes les licences produites imposent strictement `policy.maxDevices === 1`.*

---

## 5. Spécifications du Webhook de Production

Le webhook est le point d'entrée critique par lequel la passerelle de paiement notifie le serveur de la complétion d'un règlement.

- **URL de Production** : `https://api.bird-academy.com/api/commercial/webhooks/payment`
- **Méthode HTTP** : `POST`
- **En-têtes de Sécurité Attendus** :
  - Pour Konnect : `x-konnect-signature: <hex_signature>`
  - Pour Stripe : `stripe-signature: t=<timestamp>,v1=<hmac_sha256>`
  - Format interne standard : `x-payment-signature: <hmac_sha256>`
- **Payload Schema Requis** :
  ```json
  {
    "eventId": "evt_live_xxxxxxxxxxxx",
    "eventType": "payment.succeeded",
    "orderId": "ORD-XXXXXXXX-XXXX",
    "paymentId": "PAY-XXXXXXXX",
    "amount": 49.00,
    "currency": "EUR",
    "timestamp": 1757421800000
  }
  ```
- **Contrôles de Sécurité Réalisés à la Réception** :
  1. **Validation Signature HMAC** : Rejet HTTP 400/401 si la signature est invalide ou falsifiée.
  2. **Fenêtre Temporelle Anti-Rejeu** : Rejet si `timestamp` diffère de plus de 300 secondes de l'heure serveur.
  3. **Idempotence Stricte** : Vérification dans le registre `processedEventIds`. Si l'événement a déjà été traité, le serveur retourne HTTP 200 avec l'ordre existant sans jamais émettre de deuxième licence.
  4. **Concordance Montant & Devise** : Le montant du webhook doit correspondre exactement au prix de l'ordre initial.
  5. **Pare-Feu Avicole** : Rejet immédiat si le payload contient des champs de données d'élevage (`birds`, `cages`, etc.).

---

## 6. Variables d'Environnement et Secrets Requis

Les variables suivantes doivent être définies exclusivement dans le gestionnaire de secrets de l'hébergeur de production (ex: Render Dashboard / Vault) :

```bash
# Configuration Système
NODE_ENV=production
PORT=10000
VITE_APP_MODE=user

# Domaine & CORS
PRODUCTION_DOMAIN=bird-academy.com
API_DOMAIN=api.bird-academy.com
CORS_ORIGINS=https://bird-academy.com,https://www.bird-academy.com
ALLOWED_ORIGINS=https://bird-academy.com,https://www.bird-academy.com

# Autorité de Licence LMSE
LMSE_AUTHORITY_URL=https://api.bird-academy.com
LMSE_PRIVATE_SIGNING_KEY=-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----
LMSE_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----

# Passerelle de Paiement (Restent désactivées jusqu'au Launch Gate)
PAYMENT_ENVIRONMENT=sandbox
PAYMENT_LIVE=false
PUBLIC_COMMERCIAL_SALES=closed
PAYMENT_KILL_SWITCH=false

# Secrets Marchands (Injection sécurisée au runtime)
KONNECT_API_KEY=kn_prod_secret_xxxxxxxxxxxxxxxxxxxxxxxx
KONNECT_WALLET_ID=60xxxxxxxxxxxxxxxxxxxxxx
KONNECT_WEBHOOK_SECRET=whsec_konnect_xxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_stripe_xxxxxxxxxxxxxxxxxxxxx
```

---

## 7. Gestion des Remboursements & Litiges (Chargebacks)

- **Remboursement (Refund)** :
  - Déclenché via interface d'administration protégée ou événement webhook `payment.refunded`.
  - Transition de l'ordre : `DELIVERED` ou `PAID` → `REFUNDED`.
  - Révocation automatique et synchrone de la licence associée dans le registre LMSE (`status = 'revoked'`, `revocationReason = 'CUSTOMER_REFUND'`).
  - Ajout de la clé de licence dans la liste noire globale de révocation.
- **Chargeback / Litige Bancaire** :
  - Événement webhook `dispute.created` ou notification bancaire manuelle.
  - Révocation conservatoire immédiate de la licence associée.
  - Notification automatique du support client via `PRODUCTION_PAYMENT_SUPPORT_SOP.md`.
  - Assainissement strict des journaux : aucun PAN complet ni CVV n'est consigné dans les logs d'audit.

---

## 8. Mécanisme de Coupure d'Urgence (Kill Switch)

En cas d'anomalie financière, de tentative de fraude de masse ou de dysfonctionnement du webhook :
1. **Activation du Kill Switch** : Mettre la variable `PAYMENT_KILL_SWITCH=true` ou `PAYMENT_LIVE=false` dans les variables d'environnement.
2. **Effet Immédiat** : Toute tentative de créer un checkout commercial renvoie une réponse HTTP 503 `PAYMENT_SYSTEM_CURRENTLY_UNAVAILABLE`.
3. **Préservation Totale** :
   - Les licences clients existantes demeurent 100% valides.
   - Les données d'élevage stockées en local dans le navigateur ne sont en aucun cas affectées.
   - Le moteur de vérification hors-ligne continue d'autoriser les éleveurs légitimes.

---

## 9. Procédure d'Activation Post-Launch Gate (Future)

Cette procédure restera **inactivée** jusqu'à la validation formelle du Launch Gate commercial :
1. Signature finale du contrat marchand Konnect Network / Banque Centrale de Tunisie.
2. Déclaration du compte de séquestre / reversement bancaire.
3. Injection des secrets réels dans l'environnement de production.
4. Validation du test pilote "Friendly User" (1 transaction réelle de 49 € suivie de remboursement immédiat).
5. Bascule officielle : `PAYMENT_LIVE=true` et `PUBLIC_COMMERCIAL_SALES=open`.
