# ÉVALUATION COMPARATIVE DES PRESTATAIRES DE PAIEMENT
**Projet :** Bird Academy Enterprise — Volière Manager  
**Release :** v1.3.6-RC4  
**Mission :** PAYMENT-PRODUCTION-001  
**Date d'audit :** Septembre 2026  
**Statut Paiement :** PAYMENT LIVE = DISABLED | PUBLIC SALES = CLOSED  

---

## 1. Contexte Commercial & Géographique

Bird Academy est un logiciel professionnel pour éleveurs d'oiseaux (canaris, exotiques, faune européenne).
Le modèle commercial repose sur :
- **FREE :** 0 EUR (Zéro paiement, zéro licence commerciale, utilisation locale).
- **PREMIUM :** 49 EUR / an (Licence mono-appareil).
- **PRO Annual :** 119 EUR / an (Licence mono-appareil).
- **PRO Lifetime :** 249 EUR (Licence permanente mono-appareil).

Le public cible est double :
1. **Éleveurs internationaux (Europe, Maghreb, international) :** Règlement en **EUR** par cartes bancaires internationales (Visa, Mastercard, Amex, Apple Pay/Google Pay).
2. **Éleveurs résidant en Tunisie :** Règlement en **Dinars Tunisiens (TND)** via le réseau bancaire national (cartes CIB, e-Dinar de la Poste Tunisienne, virements), compte tenu du contrôle des changes de la Banque Centrale de Tunisie (BCT).

---

## 2. Tableau Comparatif des Prestataires de Paiement

Toutes les informations ci-dessous ont été vérifiées auprès des documentations officielles, grilles tarifaires publiques et portails développeurs en date de septembre 2026.

| Provider | Tunisia | TND | EUR | International cards | Webhooks | Refunds | API | KYC | Cost | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| **Konnect** (konnect.network) | **OUI** (Agréé BCT) | **OUI** (Natif) | **OUI** (Acception) | **OUI** (Visa / Mastercard) | **OUI** (HMAC / POST) | **OUI** (Dashboard / API) | REST (Docs & Sandbox) | CIN (Personne physique) ou RNE / Patente | 1.3% (CIB/e-Dinar), 2.9% (Cartes int.), 2 TND (virement). 0 € abonnement | **RECOMMANDÉ TUNISIE** (Passerelle locale moderne de référence) |
| **Paymee** (paymee.tn) | **OUI** (Fintech TN) | **OUI** (Natif) | **NON** (Règlement TND) | **OUI** (Via acquiring) | **OUI** (Checksum verification) | **OUI** (Dashboard) | REST (Docs & Sandbox) | CIN ou RNE / Patente | 1.9% (national), 2.9% (international). 0 € abonnement | **ALTERNATIVE VALIDE TUNISIE** (Solution nationale éprouvée) |
| **Flouci** (Kaoun) | **OUI** (Agrément BCT) | **OUI** (Natif) | **NON** | **LIMITÉ** (Centré sur compte national) | **OUI** (Callbacks) | **OUI** (Dashboard) | REST (Docs & Sandbox) | CIN / KYB pro | ~3% HT par transaction. 0 € abonnement | **RESTREINT** (Focalisé wallet mobile & TND uniquement) |
| **GPG ClickToPay** (Monétique TN) | **OUI** (Historique) | **OUI** (Natif) | **NON** | **OUI** (Via SMT) | **LIMITÉ** (Legacy callbacks) | Manuel (Procédure bancaire) | Protocole SMT / Soap | Contrat bancaire traditionnel, dossier physique | Frais d'adhésion (~500-1500 TND) + ~2-3% + commission fixe | **NON RETENU** (Infrastructure lourde, non adaptée au SaaS moderne) |
| **Stripe** (stripe.com) | **NON** (Pas de compte direct TN) | **NON** (Pas de payout direct TND) | **OUI** (Natif) | **OUI** (Visa, MC, Amex, Apple/Google Pay) | **OUI** (HMAC-SHA256 mature) | **OUI** (API complète & automatisée) | REST (Standard mondial) | Strict : Entité juridique dans pays supporté | 1.5% + 0.25 € (EEE), 2.9% + 0.30 € (International) | **RECOMMANDÉ INTERNATIONAL** (Nécessite entité Stripe Atlas / UE / UK) |
| **Paddle** (paddle.com) | **OUI** (Payout SWIFT / Payoneer) | **NON** (Devises int. uniquement) | **OUI** (Natif) | **OUI** (Cartes int. + PayPal) | **OUI** (HMAC-SHA256) | **OUI** (API & Dashboard) | REST (API v2 / Billing) | KYB international, vérification société / freelancer | 5% + 0.50 $ par transaction (gère TVA mondiale) | **ALTERNATIVE RECOMMANDÉE INTERNATIONAL** (Merchant of Record sans société étrangère) |

---

## 3. Analyse Détaillée par Solution

### 3.1. Konnect (Solution Privilégiée Marché Tunisien)
- **Statut réglementaire :** Établissement de paiement certifié / partenaire Banque Centrale de Tunisie (BCT).
- **Moyens de paiement supportés :** Cartes bancaires tunisiennes CIB (Visa/Mastercard nationales), carte e-Dinar de la Poste Tunisienne, cartes bancaires internationales, virements bancaires.
- **Tarification :** 1.3% sur les cartes locales tunisiennes et e-Dinar, 2.9% sur les cartes internationales, 2 TND par virement bancaire entrant. Aucun frais fixe mensuel ni coût de mise en service.
- **Environnement développeur :** Sandbox complet disponible (`api.preprod.konnect.network`), SDK et documentation REST documentée avec initiation de paiement et notification par webhooks.
- **Compatibilité Bird Academy :** Permet aux clients tunisiens d'acquérir les licences sans carte de crédit internationale ni compte en devises.

### 3.2. Stripe (Solution de Référence Marché International)
- **Statut géographique :** La Tunisie ne fait pas partie des pays supportés pour l'ouverture directe d'un compte marchand Stripe avec compte bancaire local.
- **Voie d'intégration :** Domiciliation requise via une structure légale enregistrée dans un pays supporté (via **Stripe Atlas** aux États-Unis, ou création d'une filiale en France, au Royaume-Uni ou dans l'Union Européenne) associée à un compte bancaire en devises (ex: Mercury, Wise Business ou compte bancaire européen).
- **Avantages techniques :** Standard de l'industrie, fiabilité éprouvée, Stripe Elements pour le respect PCI-DSS sans contact avec les données de carte, webhooks avec horodatage et signature `Stripe-Signature`.
- **Compatibilité Bird Academy :** Parfaitement aligné avec l'architecture `CommercialPaymentService` existante (dont les stubs et les interfaces s'inspirent directement de Stripe).

### 3.3. Paddle (Alternative Merchant of Record pour l'International)
- **Fonctionnement :** Paddle opère en tant que revendeur officiel (*Merchant of Record*), gérant la facturation, le calcul et le reversement de la TVA européenne et des taxes locales internationales.
- **Compatibilité Tunisie :** Paddle accepte les créateurs/vendeurs basés en Tunisie et reverse les fonds via virement bancaire international SWIFT ou compte Payoneer (en USD ou EUR).
- **Inconvénients :** Frais plus élevés (5% + 0.50 $ par vente) et absence totale de prise en charge des moyens de paiement locaux tunisiens en TND.

---

## 4. Stratégie Technologique Retenue : Approche Hybride Dual-Gateway

Pour répondre de manière optimale et conforme aux deux marchés cibles :

```
                                  [ CLIENT CHECKOUT ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
             [ CLIENT INTERNATIONAL ]                [ CLIENT TUNISIE ]
            (Europe, Amériques, etc.)               (Résidents Tunisie)
                        │                                     │
                 Devise : EUR                          Devise : TND
            (49 € / 119 € / 249 €)               (Équivalent officiel TND)
                        │                                     │
                        ▼                                     ▼
                [ STRIPE / PADDLE ]                      [ KONNECT ]
         (Cartes Internationales / Apple Pay)     (Cartes CIB / e-Dinar / Virement)
                        │                                     │
                        └──────────────────┬──────────────────┘
                                           ▼
                              [ SERVEUR LMSE BACKEND ]
                              (Vérification Webhook HMAC)
                                           │
                                           ▼
                                    [ STATUT: PAID ]
                                           │
                                           ▼
                              [ GÉNÉRATION LICENCE ECDSA ]
```

---

## 5. Statut Contractuel & Invariants de la Mission

- **Statut de Sélection :** `PROVIDER SELECTION = PENDING (Formalisation des Contrats Marchands)`.
- **Raison objective :** Aucun contrat marchand de production n'est encore signé, et aucune clé de production réelle n'a été délivrée.
- **Environnement de Test Actuel :** Le système conserve son moteur interne `SandboxPaymentProvider` (`providerId: 'SANDBOX_PROVIDER'`), qui simule de manière déterministe les interactions serveur-à-serveur (checkout, webhooks signés HMAC, idempotence, remboursements et génération de licences).
- **Invariants intangibles :**
  ```
  PAYMENT LIVE = DISABLED
  PUBLIC COMMERCIAL SALES = CLOSED
  RELEASE v1.3.6-RC4 = FROZEN
  ```
