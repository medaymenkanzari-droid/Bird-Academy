# RAPPORT D'ÉVALUATION ET DE PRÉPARATION DU PAIEMENT (PAYMENT_READINESS)
**Projet** : Bird Academy Enterprise — Volière Manager  
**Version** : v1.3.6-RC4  
**Mission** : COMMERCIAL-LAUNCH-PREP-001  
**Statut Officiel** : **PAYMENT NOT CONFIGURED / PAYMENT GATE DISABLED**  
**PAYMENT LIVE = DISABLED**  
**PUBLIC COMMERCIAL SALES = CLOSED**  

---

## 1. DIRECTIVE CRITIQUE DE SÉCURITÉ
> **AVERTISSEMENT : AUCUN PAIEMENT RÉEL N'EST ACTIVÉ DANS CETTE MISSION.**  
> Aucune clé API de production (`pk_live_`, `sk_live_`), aucun compte bancaire réel, et aucune transaction financière ne sont configurés. L'application et le site commercial opèrent exclusivement en mode simulation sécurisé sans impact financier.

---

## 2. SÉPARATION ARCHITECTURALE : PAIEMENT VS LICENSING
Pour préserver l'intégrité cryptographique du système, la séparation suivante est absolue :

```
                  ┌──────────────────────┐
                  │   CLIENT (NAVIGATEUR)│
                  └──────────┬───────────┘
                             │
            1. Commande      │ 2. Saisie sécurisée carte
                             ▼
     ┌────────────────────────┐      ┌────────────────────────┐
     │   COMMERCIAL WEBSITE   │      │    PAYMENT PROVIDER    │
     │      (CHECKOUT)        │      │ (Stripe / Konnect / ...)│
     └───────────┬────────────┘      └───────────┬────────────┘
                 │                               │
                 │ 3. Attente webhook            │ 4. Webhook signé
                 └───────────────┬───────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │   LMSE AUTHORITY SERVER │
                    │   (SERVEUR DE LICENCE)  │
                    └────────────┬────────────┘
                                 │ 5. Signature ECDSA P-256
                                 ▼
                    ┌─────────────────────────┐
                    │   DELIVERY KIT (.lmse)  │
                    └─────────────────────────┘
```

**Règles strictes :**
1. Le fournisseur de paiement ne signe JAMAIS de licence.
2. Le frontend ne décide JAMAIS unilatéralement que le paiement est un succès.
3. Le serveur LMSE est le SEUL habilité à générer et signer cryptographiquement le fichier `.lmse` après réception et vérification cryptographique d'un webhook serveur-à-serveur.

---

## 3. ANALYSE COMPARATIVE DES PASSERELLES DE PAIEMENT

### Option A : Stripe (Paiement International - Cartes & SEPA)
- **Couverture géographique** : Plus de 45 pays (Europe, Amérique du Nord, etc.).
- **Devises** : Plus de 135 devises (EUR, USD, GBP, etc.). **Ne supporte pas les règlements directs ni les virements bancaires vers la Tunisie en TND sans entité juridique étrangère.**
- **Moyens de paiement** : Cartes Visa/Mastercard/Amex, Apple Pay, Google Pay, Prélèvements SEPA.
- **Tarification standard** : ~1.5% + 0.25 € pour les cartes européennes, ~2.9% + 0.30 € pour les cartes internationales.
- **Webhooks & Idempotence** : Événements `checkout.session.completed`, signatures HMAC SHA-256 (`Stripe-Signature`), rejeu automatique sécurisé.
- **Intégration technique** : Stripe Checkout (hébergé) ou Stripe Elements (intégré).
- **KYC & Conformité** : Vérification d'identité stricte, justificatif d'entreprise enregistré dans un pays supporté.
- **Évaluation pour Bird Academy** : Idéal pour les ventes internationales (Europe/Maghreb francophone disposant de cartes internationales), mais nécessite une société immatriculée à l'étranger (ex: Stripe Atlas / France / UK).

### Option B : Paddle (Merchant of Record - International)
- **Rôle** : Merchant of Record (Paddle gère la TVA intracommunautaire, la conformité fiscale et les factures).
- **Tarification standard** : 5% + 0.50 $ par transaction.
- **Avantage clé** : Décharge légale et fiscale complète pour la vente de logiciels dématérialisés dans le monde entier.
- **Contrainte** : Nécessite également une domiciliation bancaire internationale conforme.

### Option C : Passerelles Locales Tunisiennes (Konnect / Flouci / GPG ClickToPay)
- **Couverture géographique** : Tunisie.
- **Devise** : Dinar Tunisien (TND).
- **Moyens de paiement** : Cartes bancaires nationales tunisiennes (CIB), cartes e-Dinar de la Poste Tunisienne, portefeuilles électroniques (Flouci).
- **Tarification standard** : Généralement entre 1.5% et 3% par transaction selon les volumes.
- **Webhooks** : Notifications POST serveur-à-serveur avec signature secrète.
- **KYC & Conformité** : Registre National des Entreprises (RNE) tunisien ou statut personne physique / patente requis.
- **Évaluation pour Bird Academy** : Indispensable pour permettre aux éleveurs canarioles et passionnés d'oiseaux résidant en Tunisie d'acquérir les licences sans disposer de carte bancaire internationale.

---

## 4. MACHINE À ÉTATS D'UNE COMMANDE (ORDER STATE MACHINE)
Chaque transaction commerciale suit un cycle de vie déterministe stocké dans le registre de commandes LMSE :

```
     [CREATED]
         │
         ▼
 [PAYMENT_PENDING] ──(Échec / Annulation)──► [FAILED] / [CANCELLED]
         │
         ▼ (Webhook signé validé)
      [PAID]
         │
         ▼ (Génération ECDSA P-256)
 [LICENSE_GENERATED]
         │
         ▼ (Téléchargement / Email envoyé)
    [DELIVERED]
         │
         ▼ (En cas de litige / demande support)
    [REFUNDED]
```

### Définition des statuts :
- `CREATED` : Panier validé, identifiant unique `orderId` généré (ex: `ORD-2026-XXXX`).
- `PAYMENT_PENDING` : Redirection vers le prestataire ou affichage du formulaire de paiement.
- `PAID` : Règlement confirmé par webhook serveur avec identifiant `paymentId`.
- `LICENSE_GENERATED` : Fichier `.lmse` créé et scellé dans le registre LMSE avec clé `licenseId`.
- `DELIVERED` : Archive ZIP et kit de livraison mis à disposition du client.
- `CANCELLED` : Abandon ou rejet avant tout débit bancaire.
- `FAILED` : Refus bancaire, carte expirée ou incident technique.
- `REFUNDED` : Remboursement effectué, déclenchant automatiquement la révocation de la licence associée.

---

## 5. STRATÉGIE D'IDEMPOTENCE ET ANTI-DOUBLON
Pour éviter les doubles facturations et la double émission de licences lors de rejeux de requêtes ou de webhooks multiples :
1. **Clé d'idempotence unique** : Chaque tentative de commande génère une clé `Idempotency-Key` basée sur `orderId`.
2. **Corrélation stricte** :
   ```json
   {
     "orderId": "ORD-2026-94812",
     "paymentId": "ch_3Mtwx62eZvKYlo2C0Vb",
     "licenseId": "LIC-PRO-2026-XXXX",
     "customerEmail": "eleveur@example.com",
     "status": "PAID"
   }
   ```
3. **Traitement d'un webhook doublon** : Si un webhook avec le même `paymentId` est reçu une seconde fois, le serveur LMSE vérifie son existence en base et renvoie immédiatement un code HTTP 200 avec la licence déjà existante sans ré-invoquer `LicenseGenerator`.

---

## 6. CONDITIONS DU PAYMENT ACTIVATION GATE
Le passage du mode simulation au mode paiement réel restera **STRICTEMENT VERROUILLÉ** tant que les 8 critères suivants ne sont pas validés :
- [ ] Nom de domaine officiel acheté et configuré avec certificat HTTPS TLS 1.2/1.3.
- [ ] Compte marchand approuvé par le prestataire financier retenu.
- [ ] Secret du webhook (`WEBHOOK_SIGNING_SECRET`) généré et injecté dans l'environnement serveur.
- [ ] Test complet de bout en bout en mode Sandbox (achat fictif, webhook, kit généré, licence importée).
- [ ] Procédure de remboursement et de révocation synchronisée testée.
- [ ] Restrictions CORS en production limitées exclusivement aux domaines du site commercial.
- [ ] Mention des Conditions Générales de Vente (CGV) validées juridiquement.
- [ ] Accord de gestion du support client actif.
