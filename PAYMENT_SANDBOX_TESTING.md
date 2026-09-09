# BIRD ACADEMY ENTERPRISE — PROTOCOLE DE TEST DU PAIEMENT SANDBOX
**Mission ID :** `PAYMENT-INTEGRATION-001`  
**Version gelée :** `v1.3.6-RC4` | **Build ID :** `BA-V1.3.6-RC4` (Code 17)  
**Git Tag :** `v1.3.6-RC4` | **Git Commit :** `8b8736380bd7580676af689f59ade38a42093095`  
**Statut Paiement :** `PAYMENT LIVE = DISABLED` | `PUBLIC SALES = CLOSED`

---

## 1. Vue d'ensemble de l'Architecture Sandbox

Le système de paiement Bird Academy en environnement Sandbox garantit l'isolation totale entre le commerce et l'application locale offline-first :

```
CLIENT (Navigateur / Site Commercial)
  ↓ Demande de session (POST /api/commercial/orders/checkout)
SERVEUR COMMERCIAL (CommercialPaymentService)
  ↓ Création de commande (ORD-2026-XXXXX, status: PAYMENT_PENDING)
FOURNISSEUR DE PAIEMENT SANDBOX (SandboxPaymentProvider)
  ↓ Session de test sécurisée (checkoutUrl avec orderId)
CLIENT (Simulation de paiement test)
  ↓
WEBHOOK SANDBOX (POST /api/commercial/webhooks/payment avec HMAC SHA-256)
  ↓ Vérification de signature, horodatage, montant, devise et idempotence
SERVEUR COMMERCIAL (status: PAID)
  ↓ Appel autorité de signature (LicenseGenerator.generateLicense)
LMSE (Unique autorité cryptographique ECDSA P-256 + SHA-256)
  ↓ Licence signée (.lmse) générée (status: LICENSE_GENERATED)
GÉNÉRATEUR DE LIVRAISON (LicenseDeliveryPackageGenerator)
  ↓ Kit 5 fichiers + Archive PKZIP (status: DELIVERED)
CLIENT (Téléchargement du kit et import offline dans l'App Volière Manager)
```

---

## 2. Fournisseur de Paiement Sandbox

- **Nom :** `SandboxPaymentProvider` (`providerId: 'SANDBOX_PROVIDER'`)
- **Type :** Adaptateur abstrait conforme à l'interface `PaymentProvider` (`createCheckout`, `verifyPayment`, `handleWebhook`, `refundPayment`)
- **Mode :** `SANDBOX ONLY`
- **Statut Live :** `PAYMENT LIVE = DISABLED`
- **Authentification Webhook :** Signature HMAC-SHA256 sur payload avec clé secrète de webhook de test (`PAYMENT_WEBHOOK_SECRET`).
- **Gestion des Secrets :**
  - Aucun secret bancaire ou de paiement dans Git.
  - Aucun secret dans les bundles clients `dist/` ou variables `VITE_*`.
  - Pas de secrets en clair dans les logs d'audit.

---

## 3. Types de Credentials Sandbox

| Variable d'Environnement | Environnement | Description / Usage | Exposition Client |
|---|---|---|---|
| `PAYMENT_MODE` | `sandbox` | Force l'exécution en sandbox uniquement | Non |
| `PAYMENT_PROVIDER` | `SANDBOX_PROVIDER` | Sélectionne l'adaptateur sandbox | Non |
| `PAYMENT_API_KEY` | `<SANDBOX ONLY>` | Clé d'API du fournisseur sandbox | Non |
| `PAYMENT_WEBHOOK_SECRET` | `<SANDBOX ONLY>` | Clé secrète de signature HMAC des webhooks | Non |
| `LMSE_PRIVATE_KEY` | `<LMSE INTERNAL>` | Clé privée ECDSA P-256 hébergée côté serveur LMSE | Non |

*Avertissement : L'utilisation de clés `live` (`sk_live_`, `pk_live_`) est formellement bloquée par la politique de sécurité.*

---

## 4. Spécification des Endpoints Serveur

### 4.1. Initialisation du Checkout
- **Route :** `POST /api/commercial/orders/checkout`
- **Corps de la requête :**
  ```json
  {
    "offerId": "OFFER-PREMIUM-ANNUAL-2026",
    "customerName": "Élevage du Levant",
    "customerEmail": "contact@elevage-levant.fr"
  }
  ```
- **Réponse (HTTP 201) :**
  ```json
  {
    "order": {
      "orderId": "ORD-2026-M4...",
      "offerId": "OFFER-PREMIUM-ANNUAL-2026",
      "tier": "PREMIUM",
      "amount": 49.00,
      "currency": "EUR",
      "status": "PAYMENT_PENDING",
      "customerName": "Élevage du Levant",
      "customerEmail": "contact@elevage-levant.fr",
      "createdAt": "2026-09-08T..."
    },
    "checkoutUrl": "https://sandbox-checkout.bird-academy.test/session?orderId=ORD-2026-M4..."
  }
  ```

### 4.2. Réception du Webhook de Paiement
- **Route :** `POST /api/commercial/webhooks/payment`
- **En-tête HTTP requis :** `X-Webhook-Signature: <hex_hmac_sha256>`
- **Corps de la requête :**
  ```json
  {
    "eventId": "EVT-M4...",
    "eventType": "payment.succeeded",
    "orderId": "ORD-2026-M4...",
    "paymentId": "PAY-SANDBOX-...",
    "amount": 49.00,
    "currency": "EUR",
    "timestamp": 1788910000000
  }
  ```
- **Réponse (HTTP 200) :**
  ```json
  {
    "success": true,
    "message": "Payment verified and license generated",
    "orderId": "ORD-2026-M4...",
    "licenseId": "LIC-2026-...",
    "status": "DELIVERED"
  }
  ```

### 4.3. Consultation de Commande & Téléchargement du Kit
- **Route :** `GET /api/commercial/orders/:orderId`
- **Route Kit :** `GET /api/commercial/orders/:orderId/delivery` (Retourne le package 5 fichiers et le binaire PKZIP base64).

### 4.4. Annulation & Remboursement
- **Annulation (avant paiement) :** `POST /api/commercial/orders/:orderId/cancel`
- **Remboursement (après paiement) :** `POST /api/commercial/orders/:orderId/refund` (Déclenche automatiquement la révocation de la licence dans le registre LMSE).

---

## 5. Machine d'États de Commande

```
[ CREATED ]
    ↓
[ PAYMENT_PENDING ] ──(Échec/Annulation)──> [ FAILED ] / [ CANCELLED ]
    ↓ (Webhook de paiement réussi & vérifié)
[ PAID ]
    ↓ (Appel LMSE LicenseGenerator)
[ LICENSE_GENERATED ]
    ↓ (Génération du Kit 5 fichiers & PKZIP)
[ DELIVERED ]
    ↓ (Demande de remboursement conforme SOP)
[ REFUNDED ] (Licence révoquée dans LMSE)
```

---

## 6. Protection contre le Rejeu et Idempotence

1. **Idempotence des Événements :**
   - Chaque webhook contient un identifiant `eventId` unique.
   - Les événements déjà traités sont stockés dans un registre en mémoire (`processedWebhookEvents`).
   - La réémission du même webhook (2 fois, 3 fois ou plus) retourne immédiatement la commande déjà livrée avec un statut de non-duplication (`wasDuplicate: true`).
   - Aucune seconde licence n'est générée.
2. **Protection contre le Rejeu Temporel (Clock Skew) :**
   - Tout webhook dont l'horodatage dépasse 300 secondes (5 minutes) dans le passé ou le futur est immédiatement rejeté avec le code `REPLAY_ATTACK_DETECTED`.

---

## 7. Firewall des Données Biologiques (Breeding Data Firewall)

L'isolation stricte entre la volière locale et le système commercial est garantie au niveau applicatif et réseau :
- Le serveur filtre systématiquement tous les champs entrants pour n'accepter que les données commerciales (`offerId`, `customerName`, `customerEmail`).
- Tous les champs relatifs à l'élevage (`birds`, `flock`, `breeding`, `pedigree`, `health`, `genetics`, `cages`, etc.) sont bloqués et supprimés.
- L'application cliente exécute sa base de données (Dexie/IndexedDB) en local pur et ne transmet aucun historique de volière au serveur.

---

## 8. Procédure de Rétablissement (Failure Recovery)

- **Indisponibilité LMSE :** Si l'autorité LMSE est momentanément indisponible lors de la confirmation de paiement, la commande reste dans l'état intermédiaire sécurisé `PAID` sans générer de fausse licence. Dès le rétablissement de LMSE, la génération peut reprendre.
- **Échec de Livraison :** Si la génération du ZIP de livraison échoue, l'appel `POST /api/commercial/orders/:orderId/retry-delivery` permet de régénérer le kit en réutilisant exactement la licence signée existante (`licenseId`), évitant toute duplication de licence.

---

## 9. Résultats de Validation Automatisée

Le protocole sandbox complet est testé de manière déterministe via la suite :
```bash
npm run test:payment-integration
```
- **Nombre de contrôles :** 144 vérifications déterministes.
- **Taux de succès :** 100% (144 PASS, 0 FAIL).
- **Scénarios E2E validés :** E2E-01 à E2E-17 sans aucune régression.
