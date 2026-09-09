# PROCÉDURES OPÉRATIONNELLES DE SUPPORT (SOP) : PAIEMENT & LICENCES
## BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER
### Manuel d'Assistance Clientèle & Gestion des Incidents Commerciaux (11 Procédures)
**Release** : `v1.3.6-RC4` | **Build ID** : `BA-V1.3.6-RC4` | **Build Code** : `17`
**Invariants** : `PAYMENT LIVE = DISABLED` | `PUBLIC COMMERCIAL SALES = CLOSED` | `RELEASE = FROZEN`

---

## 1. Principes Généraux de Support Client

1. **Confidentialité Absolue des Données d'Élevage** : Les agents de support ne doivent **JAMAIS** solliciter ni accepter la communication de bases de données d'oiseaux, de généalogies ou de fichiers de sauvegarde privés de l'éleveur.
2. **Minimisation des Données Bancaires** : Ne jamais demander de numéro complet de carte bancaire (PAN), de date d'expiration ou de code de sécurité (CVV). L'identification se fait exclusivement via le numéro de commande (`orderId`) ou l'identifiant de paiement masqué (`paymentId`).
3. **Respect de l'Invariant Mono-Appareil** : Chaque licence est strictly liée à un appareil unique (`maxDevices = 1`). Aucune dérogation manuelle ne doit autoriser l'activation sur plusieurs postes simultanés.

---

## 2. Procédures Opérationnelles Détaillées (SUP-PAY-01 à SUP-PAY-11)

### SOP-01 : Paiement Réussi mais Licence Non Reçue ou Téléchargement Interrompu
- **Symptôme** : L'éleveur a été débité, mais n'a pas pu télécharger son kit de livraison ou la page de confirmation s'est fermée prématurément.
- **Diagnostic** : Rechercher la commande via `GET /api/commercial/orders/:orderId`. Vérifier si le statut est `PAID` ou `DELIVERED`.
- **Résolution** :
  1. Si la commande est `PAID` mais non délivrée, appeler le endpoint sécurisé :
     `POST /api/commercial/orders/:orderId/retry-delivery`.
  2. Le serveur régénère le kit de 5 fichiers sans émettre de seconde licence et renvoie le lien de téléchargement sécurisé.
  3. Transmettre le kit `.zip` scellé à l'adresse email renseignée lors de la commande.

---

### SOP-02 : Paiement Refusé par l'Émetteur Bancaire ou la Passerelle
- **Symptôme** : Le client reçoit une notification d'échec de transaction (code retour `payment_declined` ou `do_not_honor`).
- **Diagnostic** : Vérifier le motif dans le journal d'audit serveur (plafond atteint, 3D Secure non validé, carte expirée).
- **Résolution** :
  1. Rassurer l'éleveur : aucun débit n'a été effectué sur son compte.
  2. Inviter le client à contacter sa banque émettrice pour autoriser le paiement e-commerce 3D Secure.
  3. Proposer une méthode alternative selon la région (Carte CIB / e-Dinar via Konnect en Tunisie, ou virement bancaire).

---

### SOP-03 : Abandon ou Annulation de Checkout par l'Utilisateur
- **Symptôme** : Commande créée avec le statut `PAYMENT_PENDING` sans transaction bancaire initiée.
- **Diagnostic** : Le client a fermé la fenêtre de paiement avant validation.
- **Résolution** :
  1. Aucune action technique requise.
  2. L'ordre expire automatiquement après 24 heures sans conséquence.
  3. L'éleveur continue de bénéficier de son accès communautaire gratuit (Tier FREE natif).

---

### SOP-04 : Suspicion de Double Débit Bancaire
- **Symptôme** : Le client signale avoir été prélevé deux fois pour une même commande.
- **Diagnostic** : Interroger le registre des commandes par l'adresse email de l'éleveur.
- **Résolution** :
  1. Si deux commandes distinctes ont été créées par erreur, identifier la commande dupliquée.
  2. Conserver la première licence active pour l'éleveur.
  3. Déclencher le remboursement immédiat de la seconde commande via `POST /api/commercial/orders/:orderId/refund`.
  4. La licence redondante est immédiatement révoquée sans impacter la licence principale.

---

### SOP-05 : Demande de Remboursement (Droit de Rétractation 14 Jours)
- **Symptôme** : L'éleveur demande l'annulation et le remboursement dans le délai légal de rétractation.
- **Diagnostic** : Vérifier la date d'émission (`issuedAt <= 14 jours`).
- **Résolution** :
  1. Confirmer l'identité du demandeur (email de commande).
  2. Exécuter la commande de remboursement sur la passerelle marchande.
  3. Le système bascule l'ordre en `REFUNDED` et inscrit automatiquement la clé de licence dans la liste de révocation LMSE.
  4. L'application cliente de l'éleveur bascule en mode FREE sans perte de ses données avicoles locales.

---

### SOP-06 : Licence Affichée comme Invalide ou Corrompue (Code CORRUPTED)
- **Symptôme** : Lors de l'import du fichier `.lmse`, l'application cliente affiche « Intégrité compromise : signature invalide ».
- **Diagnostic** : Le fichier a été altéré lors de l'envoi ou modifié dans un éditeur de texte.
- **Résolution** :
  1. Vérifier le fichier original stocké dans l'archive du delivery kit sur le serveur.
  2. Fournir à l'éleveur l'empreinte SHA-256 officielle et lui faire retélécharger l'archive `.zip` propre.
  3. Alternativement, faire saisir la clé textuelle `LMSE-COMM-XXXX-...` dans l'interface de déverrouillage.

---

### SOP-07 : Licence Expirée (Offres Annuelles PREMIUM et PRO)
- **Symptôme** : Message informant que la période de souscription annuelle est échue.
- **Diagnostic** : Vérifier la date d'expiration (`expiresAt`).
- **Résolution** :
  1. Rappeler que Bird Academy garantit la conservation intégrale de toutes les données d'élevage (oiseaux, bagues, accouplements).
  2. L'application bascule automatiquement en mode FREE fonctionnel.
  3. Proposer le lien de renouvellement pour l'offre annuelle, ou la montée de version vers l'offre permanente `PRO Lifetime`.

---

### SOP-08 : Licence Révoquée pour Fraude ou Chargeback Bancaire
- **Symptôme** : L'éleveur ne peut plus utiliser ses fonctionnalités payantes (code `LICENSE_REVOKED`).
- **Diagnostic** : Vérifier le motif dans le registre LMSE (`revocationReason = 'CHARGEBACK_DISPUTE_INITIATED'`).
- **Résolution** :
  1. Informer le client que la révocation est consécutive à l'opposition bancaire ou au signalement de litige.
  2. Si le litige est une erreur de l'éleveur avec sa banque, inviter à régulariser la situation avec la banque.
  3. Aucune réactivation manuelle sans validation comptable préalable.

---

### SOP-09 : Remplacement de Licence (Changement de Clé Suite à Incident)
- **Symptôme** : Nécessité de remplacer une clé divulguée ou suite à un changement de politique commerciale.
- **Diagnostic** : Valider la légitimité du titulaire via le support niveau 2.
- **Résolution** :
  1. Utiliser le moteur de cycle de vie `LicenseLifecycleEngine.replace`.
  2. L'ancienne licence passe au statut immuable `replaced` (terminal).
  3. Une nouvelle licence signée avec une nouvelle clé est générée et transmise au client.

---

### SOP-10 : Changement d'Ordinateur / Panne de Disque Dur (Mono-Appareil)
- **Symptôme** : L'éleveur a changé d'ordinateur ou son disque dur a été remplacé, et sa licence mono-poste est rejetée (`deviceRegistered = false`).
- **Diagnostic** : Vérifier que l'éleveur est bien le titulaire légitime de la licence.
- **Résolution** :
  1. Expliquer la procédure standard : l'éleveur transfère sa sauvegarde locale via une clé USB (`Paramètres > Sauvegarde/Restauration`).
  2. Dans l'interface d'administration LMSE, le support autorise la réinitialisation de l'empreinte matérielle de la licence (`activations`).
  3. L'éleveur réimporte son fichier `.lmse` sur son nouvel ordinateur : l'appareil est enregistré comme appareil primaire actif.

---

### SOP-11 : Téléchargement des Installateurs Impossible (Windows Setup / Android APK)
- **Symptôme** : Le téléchargement depuis le site web échoue ou est bloqué par le navigateur.
- **Diagnostic** : Problème de connectivité réseau ou filtre antivirus local.
- **Résolution** :
  1. Fournir les URLs de téléchargement officielles miroir sécurisées.
  2. Fournir les empreintes SHA-256 officielles pour vérification locale :
     - Windows Setup : `1E965BCAA4C07EEBCEC64D248A2568B91F5B1F7E28146C29187EA675708E4813`
     - Windows Portable : `1701FB75AF19280E0A346B6F3525609516E0E801177916480E1ECB8311479A92`
     - Android APK : `8C2ACE49FA73191AB90B26615BBDD2CE591D67D16051496FE995ABC668498AC9`
  3. Rappeler la commande PowerShell de vérification :
     `Get-FileHash -Algorithm SHA256 <chemin_du_fichier>`
