# RUNBOOK OPÉRATIONNEL — ACTIVATION DU PAIEMENT EN PRODUCTION
**Projet :** Bird Academy Enterprise — Volière Manager  
**Release cible :** v1.3.6-RC4 (Gelée)  
**Mission de référence :** PAYMENT-PRODUCTION-001  
**Statut Actuel :** `PAYMENT LIVE = DISABLED` | `PUBLIC SALES = CLOSED`  

> [!CAUTION]
> **AVERTISSEMENT DE SÉCURITÉ :**
> Ce document est un guide d'exploitation pour la future mise en production.
> **AUCUNE ACTIVATION RÉELLE NE DOIT ÊTRE EFFECTUÉE LORS DE LA PRÉSENTE MISSION.**
> L'activation en production réelle nécessite la validation formelle du procès-verbal de recette et l'accord unanime du comité de direction.

---

## Sommaire des Étapes Opérationnelles

1. [Étape 1 : Activation et Agrément du Compte Marchand](#étape-1--activation-et-agrément-du-compte-marchand)
2. [Étape 2 : Configuration des Secrets Côté Serveur](#étape-2--configuration-des-secrets-côté-serveur)
3. [Étape 3 : Configuration et Enregistrement du Webhook](#étape-3--configuration-et-enregistrement-du-webhook)
4. [Étape 4 : Tests Déterministes en Environnement Sandbox Réel](#étape-4--tests-déterministes-en-environnement-sandbox-réel)
5. [Étape 5 : Test Contrôlé en Environnement de Production](#étape-5--test-contrôlé-en-environnement-de-production)
6. [Étape 6 : Vérification de la Confirmation de Paiement Serveur](#étape-6--vérification-de-la-confirmation-de-paiement-serveur)
7. [Étape 7 : Vérification de la Licence Cryptographique LMSE](#étape-7--vérification-de-la-licence-cryptographique-lmse)
8. [Étape 8 : Vérification de la Livraison du Kit Client](#étape-8--vérification-de-la-livraison-du-kit-client)
9. [Étape 9 : Procédure de Rollback d'Urgence](#étape-9--procédure-de-rollback-durgence)
10. [Étape 10 : Procédure de Désactivation Immédiate (Kill Switch)](#étape-10--procédure-de-désactivation-immédiate-kill-switch)

---

### Étape 1 : Activation et Agrément du Compte Marchand
1. Finaliser l'approbation KYC/KYB auprès du prestataire sélectionné (Stripe, Konnect ou Paddle).
2. Valider l'association du compte bancaire professionnel de l'entreprise.
3. Obtenir les identifiants marchands de production :
   - Clé publique d'API (ex: `pk_live_...` ou `API_KEY_PUBLIC`)
   - Clé secrète d'API (ex: `sk_live_...` ou `API_KEY_SECRET`)

### Étape 2 : Configuration des Secrets Côté Serveur
1. Accéder à la console d'administration sécurisée de l'hébergeur de production (ex: Render Environment Variables).
2. Injecter les variables sensibles **SANS AUCUN PRÉFIXE VITE_** :
   ```bash
   PAYMENT_MODE=production
   PAYMENT_PROVIDER=STRIPE  # ou KONNECT
   PAYMENT_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxx
   PAYMENT_WEBHOOK_SECRET=whsec_live_xxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Vérifier que la clé publique pour le frontend est configurée si nécessaire :
   ```bash
   VITE_PAYMENT_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **Vérification d'absence de fuite :** Exécuter `npm run verify:user-bundle` pour confirmer qu'aucun secret n'a fuité dans le bundle client généré.

### Étape 3 : Configuration et Enregistrement du Webhook
1. Dans le tableau de bord développeur du prestataire, configurer l'URL de notification officielle :
   ```
   https://api.bird-academy.com/api/commercial/webhooks/payment
   ```
2. Sélectionner exclusivement les événements nécessaires :
   - `payment.succeeded` (ou `checkout.session.completed`)
   - `payment.failed`
   - `payment.refunded` (ou `charge.refunded`)
3. Copier le secret de signature du webhook généré par le prestataire (`Signing Secret`) et l'injecter dans `PAYMENT_WEBHOOK_SECRET`.

### Étape 4 : Tests Déterministes en Environnement Sandbox Réel
1. Exécuter un cycle complet sur le serveur de staging pointant vers le sandbox officiel du PSP :
   - Création de session de test
   - Simulation de paiement réussi avec carte de test officielle du prestataire
   - Réception du webhook signé HMAC
   - Vérification du passage de la commande au statut `PAID` puis `DELIVERED`
2. Simuler un échec de paiement (carte refusée) et vérifier qu'aucune licence n'est générée.
3. Simuler un rejeu de webhook identique et vérifier l'idempotence (`idempotentReplay: true`, zéro doublon de licence).

### Étape 5 : Test Contrôlé en Environnement de Production
1. **Fenêtre de maintenance planifiée :** Procéder durant les heures creuses.
2. Basculer `PAYMENT_MODE=production` sur une instance réservée.
3. Effectuer un achat de test contrôlé par un membre de l'équipe QA sur l'offre **PREMIUM** (49 EUR) avec une carte bancaire d'entreprise réelle.
4. **Règle absolue :** Rembourser immédiatement la transaction après confirmation de la réception du kit pour annuler l'impact financier.

### Étape 6 : Vérification de la Confirmation de Paiement Serveur
1. Vérifier dans la base de commandes LMSE que l'`orderId` associé est passé par les transitions exactes :
   `CREATED` -> `PAYMENT_PENDING` -> `PAID`.
2. Vérifier que l'identifiant de transaction du prestataire (`paymentId`) est consigné sans altération.
3. Vérifier que le montant et la devise correspondent strictement au catalogue officiel (49.00 EUR).

### Étape 7 : Vérification de la Licence Cryptographique LMSE
1. Vérifier que la licence a été émise et signée par l'autorité interne LMSE (`LicenseGenerator`).
2. Vérifier l'intégrité de la signature asymétrique ECDSA P-256 et du hachage SHA-256.
3. Vérifier que le champ `maxDevices` vaut strictement `1` (Single Device invariant).
4. Vérifier que les métadonnées de la licence comportent l'`orderId` et le `paymentId`.

### Étape 8 : Vérification de la Livraison du Kit Client
1. Télécharger le kit 5 fichiers généré pour la commande :
   - `license.lmse`
   - `license-key.txt`
   - `license-qr.png`
   - `license-info.txt`
   - `README.txt`
   - Archive binaire PKZIP
2. Importer le fichier `.lmse` dans l'application Volière Manager en mode déconnecté (mode avion) et vérifier l'activation réussie du tier commercial.

### Étape 9 : Procédure de Rollback d'Urgence
En cas d'incident critique lors du déploiement (anomalie de signature de webhook, divergence de montant, incident de génération LMSE) :
1. Dans la console de production Render, basculer immédiatement la variable :
   ```bash
   PAYMENT_MODE=sandbox
   ```
2. Redémarrer le service backend (`lmse-server`).
3. Toute tentative de paiement client en cours est redirigée vers une page d'information de maintenance commerciale sans risque de prélèvement.
4. Les commandes bloquées au statut `PAID` sont reprises manuellement via le script de diagnostic `npm run lmse:health`.

### Étape 10 : Procédure de Désactivation Immédiate (Kill Switch)
Pour verrouiller instantanément tout flux financier en cas de détection d'attaque ou de fraude :
1. Exécuter la commande ou basculer l'environnement :
   ```bash
   PAYMENT_GATE_LOCKED=true
   COMMERCIAL_SALES_OPEN=false
   ```
2. Le serveur rejette immédiatement tout appel entrant sur `/api/commercial/orders/checkout` avec le code HTTP `503 Service Unavailable` :
   ```json
   {
     "error": "PAYMENT_GATE_DISABLED",
     "message": "Le guichet de paiement en ligne est temporairement suspendu pour maintenance opérationnelle."
   }
   ```
3. Aucune transaction financière ne peut être initiée.
