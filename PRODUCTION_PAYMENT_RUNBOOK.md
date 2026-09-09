# RUNBOOK OPÉRATIONNEL : PAIEMENT DE PRODUCTION
## BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
### Manuel d'Exploitation & Déploiement en 10 Procédures
**Release Cible** : `v1.3.6-RC4` | **Build Code** : `17` | **Commit** : `8b8736380bd7580676af689f59ade38a42093095`
**Invariants d'Audit** : `PAYMENT LIVE = DISABLED` | `PUBLIC COMMERCIAL SALES = CLOSED`

---

## AVERTISSEMENT PRÉALABLE OBLIGATOIRE

> **IMPORTANT** : La présente mission `LIVE-PAYMENT-CONFIG-001` est une mission de **configuration et de qualification**. Les étapes 8 et 9 du présent Runbook (« Activer Payment » et « Vérification Ventes Réelles ») sont documentées à des fins de préparation opérationnelle mais demeurent **STRICTEMENT INACTIVES** tant que le Launch Gate final n'a pas été franchi par décision de la direction générale.

---

## Procédure 1 — Vérification du Domaine de Production

1. **Vérification de la Résolution DNS** :
   ```bash
   nslookup bird-academy.com
   nslookup api.bird-academy.com
   ```
2. **Contrôle des Enregistrements DNS Requis** :
   - `A` ou `CNAME` pour `bird-academy.com` pointant vers l'infrastructure web.
   - `A` ou `CNAME` pour `api.bird-academy.com` pointant vers le serveur LMSE/Express.
   - TTL préconisé : 300 secondes (5 minutes) en phase de lancement.
3. **Statut Attendu** : La propagation DNS globale doit être effective à 100% avant toute injection de webhook.

---

## Procédure 2 — Vérification du Certificat SSL/TLS & HTTPS

1. **Test de la Négociation Chiffrée** :
   ```bash
   curl -Iv https://bird-academy.com
   curl -Iv https://api.bird-academy.com/api/health
   ```
2. **Points de Contrôle de Sécurité** :
   - Protocole TLS 1.2 minimum requis (TLS 1.3 recommandé).
   - Certificat valide et non expiré émis par une autorité reconnue (Let's Encrypt / Cloudflare).
   - Redirection automatique `HTTP (port 80) -> HTTPS (port 443)` avec code HTTP 301.
   - Absence totale d'avertissements de contenu mixte (Mixed Content) sur les assets frontaux.

---

## Procédure 3 — Injection des Secrets en Environnement Sécurisé

1. **Règle Zéro Fuite** : Aucun secret ne doit être saisi dans un terminal partagé, consigné dans un fichier texte non chiffré, ni commité dans Git.
2. **Accès au Gestionnaire de Secrets** :
   - Se connecter à l'interface d'administration de l'hébergeur (Render Environment Variables / Cloud Vault).
3. **Variables à Définir** :
   - `LMSE_PRIVATE_SIGNING_KEY` : Clé ECDSA P-256 de production.
   - `KONNECT_API_KEY` : Clé secrète de production fournie par Konnect Network.
   - `KONNECT_WALLET_ID` : Identifiant du portefeuille marchand Konnect.
   - `KONNECT_WEBHOOK_SECRET` : Clé secrète de signature HMAC des webhooks Konnect.
   - `STRIPE_SECRET_KEY` : Clé `sk_live_...` (si passerelle internationale Stripe active).
   - `STRIPE_WEBHOOK_SECRET` : Clé `whsec_...` (si passerelle internationale Stripe active).
   - `CORS_ORIGINS` : `https://bird-academy.com,https://www.bird-academy.com`.
4. **Vérification** :
   - S'assurer que les variables d'environnement préfixées `VITE_` ne contiennent **aucun** de ces secrets.

---

## Procédure 4 — Configuration du Webhook auprès du Prestataire

1. **Connexion au Portail Marchand** (Konnect Dashboard ou Stripe Dashboard).
2. **Enregistrement de l'URL de Webhook** :
   - Saisir l'URL exacte : `https://api.bird-academy.com/api/commercial/webhooks/payment`
3. **Sélection des Événements Autorisés** :
   - `payment.succeeded` / `payment_intent.succeeded`
   - `payment.failed` / `payment_intent.payment_failed`
   - `payment.refunded` / `charge.refunded`
   - `charge.dispute.created`
4. **Récupération du Secret de Webhook** : Copier la clé générée et l'injecter dans la variable serveur correspondante.

---

## Procédure 5 — Test de Réception & Simulation Déterministe

1. **Vérification de la Sonde de Santé** :
   ```bash
   curl -s https://api.bird-academy.com/api/health
   # Réponse attendue : {"status":"ok","service":"LMSE Backend API",...}
   ```
2. **Simulation d'Événement Webhook Signé** :
   - Générer un payload sandbox d'un montant identique au catalogue officiel (ex: 49.00 EUR).
   - Calculer la signature HMAC-SHA256 avec la clé de webhook de test.
   - Émettre la requête POST vers le endpoint et vérifier le code retour HTTP 200.
3. **Contrôle d'Idempotence** :
   - Émettre immédiatement le même payload une seconde fois.
   - Vérifier que le serveur renvoie HTTP 200 sans générer de seconde licence.

---

## Procédure 6 — Vérification de l'Autorité de Licence LMSE

1. **Contrôle de Clé Publique** :
   ```bash
   curl -s https://api.bird-academy.com/api/licensing/public-key
   ```
2. **Validation Cryptographique** :
   - S'assurer que le format de clé correspond à une clé publique ECDSA P-256 standard PEM.
3. **Vérification de la Révocation** :
   - S'assurer que la liste noire de révocation est accessible et persistante.

---

## Procédure 7 — Vérification du Kit de Livraison (Delivery Package)

1. **Contrôle de Composition** :
   - Le kit généré lors de la simulation doit contenir exactement 5 artefacts :
     1. `license-<KEY>.lmse` (Fichier binaire scellé et signé)
     2. `license-key.txt` (Clé textuelle formatée `LMSE-COMM-XXXX-...`)
     3. `license-qr.png` (Image binaire PNG du QR Code d'activation)
     4. `license-info.txt` (Métadonnées de commande et titulaire)
     5. `README.txt` (Guide pas-à-pas d'importation hors-ligne)
2. **Contrôle du Fichier ZIP** :
   - L'archive générée doit respecter la signature PKZIP standard (`0x50, 0x4B`).
   - Empreinte SHA-256 calculée et vérifiable par l'éleveur via PowerShell ou terminal.

---

## Procédure 8 — Activation du Paiement (PROCÉDURE SOUMISE AU LAUNCH GATE)

> **ATTENTION** : N'exécuter cette procédure qu'après feu vert formel consigné dans le procès-verbal de lancement commercial.

1. **Vérification des Prérequis Administratifs** :
   - Contrat marchand signé et validé par les autorités bancaires.
   - Compte bancaire de reversement validé (RIB vérifié).
2. **Bascule des Variables d'Environnement** :
   - Passer `PAYMENT_ENVIRONMENT=production`.
   - Passer `PAYMENT_LIVE=true`.
   - Passer `PUBLIC_COMMERCIAL_SALES=open`.
3. **Redémarrage Ordonné du Serveur Backend** :
   - Redémarrer le service web pour prendre en compte les nouveaux paramètres.
   - Surveiller les logs de démarrage pour confirmer le statut opérationnel.

---

## Procédure 9 — Vérification Post-Activation (Test Pilote Contrôlé)

1. **Transaction "Friendly User" Unique** :
   - Réaliser un achat réel d'une licence PREMIUM (49.00 EUR) avec une carte bancaire interne de test.
   - Valider la réception du kit de livraison complet par email et écran de confirmation.
   - Importer le fichier `.lmse` dans l'application cliente et valider le déverrouillage mono-appareil.
2. **Test de la Chaîne de Remboursement** :
   - Exécuter immédiatement un remboursement test depuis l'administration marchande.
   - Confirmer la transition de l'ordre vers le statut `REFUNDED`.
   - Confirmer l'inscription immédiate de la licence dans la liste de révocation LMSE.

---

## Procédure 10 — Procédure de Rollback d'Urgence (Retour Immédiat)

En cas d'anomalie critique (fraude détectée, instabilité du webhook, corruption de licence) :

1. **Étape 1 — Activation Immédiate du Kill Switch (< 30 secondes)** :
   - Mettre `PAYMENT_LIVE=false` et `PAYMENT_KILL_SWITCH=true` dans l'environnement.
   - Les nouvelles transactions sont bloquées instantanément.
2. **Étape 2 — Restauration du Code Source de Référence** :
   ```bash
   git checkout 8b8736380bd7580676af689f59ade38a42093095
   ```
3. **Étape 3 — Déploiement de l'Archive Scellée de Rollback** :
   - Utiliser l'archive immuable `Bird-Academy-Enterprise-v1.3.6-RC4.zip` (SHA-256 : `7296d222303649a9f60de6e8064b52904124814bd4dc38a892528fe3b3324248`).
4. **Étape 4 — Préservation des Données Clients** :
   - Les données locales d'élevage restent 100% intactes sur les postes utilisateurs.
   - Aucune licence légitimement délivrée avant le problème n'est invalidée.
