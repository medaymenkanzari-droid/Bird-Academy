# FIRST SALE STANDARD OPERATING PROCEDURE (FIRST-SALE-SOP)
**Projet** : Bird Academy Enterprise — Volière Manager  
**Version** : v1.3.6-RC4  
**Référence** : COMMERCIAL-LAUNCH-PREP-001 / FIRST-SALE-SOP  
**Statut** : PRÉPARATION (Simulation validée — Paiement réel désactivé)  

---

## 1. OBJECTIF
Ce document définit la procédure opérationnelle standard régissant l'exécution d'une première vente commerciale de Bird Academy Enterprise, depuis la visite initiale du client jusqu'à l'activation réussie sur son appareil, en garantissant l'intégrité cryptographique et la sanctuarisation de la vie privée.

---

## 2. RÈGLES FONDAMENTALES D'ENGAGEMENT
1. **Local-First & Zéro Cloud Élevage** : Les données d'élevage de l'utilisateur (oiseaux, couples, reproduction, santé, finances) ne transitent JAMAIS par les serveurs commerciaux.
2. **Licence Mono-Appareil (Single Device)** : 100% des licences sont délivrées avec `maxDevices = 1`. Aucune promesse de synchronisation multi-postes automatique n'est tolérée.
3. **Autorité Serveur Unique** : Aucune licence commerciale n'est générée côté client ni avant la confirmation formelle du règlement côté serveur.

---

## 3. DÉROULEMENT OPÉRATIONNEL ÉTAPE PAR ÉTAPE

### Étape 1 : Arrivée sur le site commercial
- Le prospect accède au site officiel via HTTPS (`https://birdacademy.app` ou équivalent configuré).
- Le site est servi en 5 langues (FR, EN, AR, ES, IT) avec prise en charge RTL automatique.
- L'infrastructure distribue les assets statiques sans collecter de données privées.

### Étape 2 : Choix de l'offre commerciale
Le client consulte le catalogue des offres officielles :
- **FREE Community** : 0 € (Accès natif gratuit, 20 oiseaux max, quota IA 10/j).
- **PREMIUM Avancé** : 49 €/an (Oiseaux illimités, alimentation, soins groupés).
- **PRO Enterprise Annuel** : 119 €/an (Bird Intelligence, consanguinité Wright 4 générations).
- **PRO Enterprise Lifetime** : 249 € (Achat unique définitif, licence permanente hors-ligne).

### Étape 3 : Affichage des engagements et mentions de transparence
L'interface de commande (Checkout Wizard) affiche de manière explicite et non ambiguë :
- Le tarif exact en Euros (TTC/HT selon juridiction).
- La durée de validité (1 an pour Annuel, permanente pour Lifetime).
- La mention légale : *"Licence mono-appareil (1 poste). Données 100% locales sans cloud. Migration par sauvegarde JSON manuelle."*
- L'engagement de sauvegarde sous la responsabilité de l'utilisateur.

### Étape 4 : Saisie des informations client minimales
Le client renseigne les données strictement requises pour la facturation et le licensing :
- Nom / Raison sociale du titulaire (`holderName`).
- Adresse e-mail de réception (`holderEmail`).
- Pays de résidence (`country`).
*Aucune information relative à son cheptel aviaire ou à sa pratique d'élevage n'est demandée.*

### Étape 5 : Paiement sécurisé
- **Phase de préparation actuelle** : Le paiement s'exécute en mode simulation (`PAYMENT_PENDING` → `SIMULATED_SUCCESS`).
- **Phase de commercialisation future** : Redirection vers le flux hébergé ou le composant sécurisé de la passerelle validée (Stripe / passerelle tunisienne).
- Le client saisit ses coordonnées bancaires directement sur l'infrastructure certifiée PCI-DSS de la passerelle. Zéro coordonnée bancaire ne touche le serveur LMSE.

### Étape 6 : Confirmation serveur & Contrôle d'idempotence
- Le serveur LMSE reçoit la notification de succès du paiement (webhook signé ou token vérifié).
- Le serveur vérifie l'unicité de la transaction (`orderId` / `paymentId`).
- Si la commande a déjà été traitée, le serveur renvoie l'état existant sans émettre de seconde licence (anti-double débit / anti-double émission).

### Étape 7 : Génération de la licence cryptographique
- Le serveur LMSE invoque `LicenseGenerator.generateLicense()` sous contexte sécurisé.
- La licence est signée via ECDSA P-256 avec hachage SHA-256 au moyen de la clé secrète serveur `LMSE_PRIVATE_SIGNING_KEY`.
- Le payload contient l'identifiant unique, le tier commercial, le hardware lock (`maxDevices: 1`), et la durée.

### Étape 8 : Assemblage du Delivery Kit
Le service de livraison génère l'archive client intégrant les 6 artefacts :
1. `license_<id>.lmse` : Fichier de licence scellé.
2. `license-key.txt` : Clé textuelle formatée `LMSE-COMM-XXXX-XXXX-XXXX`.
3. `license-qr.png` : Image QR Code scannable pour activation mobile/webcam.
4. `license-info.txt` : Récapitulatif clair du contrat de licence.
5. `README.txt` : Guide pas-à-pas d'installation et d'importation.
6. `archive.zip` : Archive compressée téléchargeable immédiatement.

### Étape 9 : Remise au client & Secours e-mail
- Téléchargement instantané proposé sur la page de confirmation de commande.
- Envoi simultané d'un e-mail transactionnel de secours contenant les informations d'activation et la licence en pièce jointe.

### Étape 10 : Activation de l'application cliente
- Le client ouvre son application locale Bird Academy.
- Il se rend dans `Paramètres` → `Gestion de la Licence` → `Importer une licence`.
- Il charge le fichier `.lmse` ou saisit la clé textuelle.
- `OfflineBetaValidator` vérifie la signature avec la clé publique embarquée et associe l'empreinte matérielle de la machine (`deviceId`).
- L'application bascule immédiatement dans le tier souscrit (PREMIUM ou PRO).

### Étape 11 : Assistance support post-vente
- En cas de difficulté, le client s'appuie sur la documentation d'aide (90 articles disponibles hors-ligne) ou contacte le support via le formulaire dédié.
- Les procédures de support `SUP-002` (Premium) et `SUP-003` (PRO) sont appliquées.

### Étape 12 : Journalisation d'audit commercial immuable
- Le serveur LMSE enregistre un log d'audit :
  - Identifiant de transaction / licence
  - Horodatage UTC
  - Rôle (`COMMERCIAL_CHECKOUT`)
  - Résultat (`SUCCESS`)
- Aucune donnée sensible (clé privée, mot de passe, carte bancaire) n'est consignée.
