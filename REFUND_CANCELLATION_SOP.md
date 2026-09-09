# STANDARD OPERATING PROCEDURE : REMBOURSEMENT & ANNULATION (REFUND_CANCELLATION_SOP)
**Projet** : Bird Academy Enterprise — Volière Manager  
**Version** : v1.3.6-RC4  
**Référence** : COMMERCIAL-LAUNCH-PREP-001 / REFUND-CANCELLATION-SOP  
**Statut** : PRÉPARATION COMMERCIALE  

---

## 1. AVERTISSEMENT JURIDIQUE
> **NOTE LÉGALE :** Ce document définit les procédures techniques et opérationnelles internes applicables à la gestion des annulations et remboursements. Les politiques commerciales contractuelles, les délais de rétractation (ex: directive européenne sur les droits des consommateurs pour les contenus numériques) et les motifs valables de remboursement doivent être formellement validés par un conseil juridique avant le lancement public officiel.  
> **Mention :** *À confirmer selon le droit applicable et les conditions commerciales finales.*

---

## 2. MACHINE À ÉTATS DE COMMANDE & ACTIONS ASSOCIÉES

```
+-------------------+------------------------------------+------------------------------------------+
| État de Commande   | Description                        | Action Technique en cas d'Annulation     |
+-------------------+------------------------------------+------------------------------------------+
| CREATED           | Panier initié, commande ouverte    | Abandon automatique, aucune action       |
| PAYMENT_PENDING   | Attente de validation bancaire     | Annulation de session de paiement        |
| PAID              | Paiement confirmé, licence en cours| Remboursement via passerelle             |
| LICENSE_GENERATED | Licence .lmse émise par LMSE       | Révocation immédiate dans LMSE           |
| DELIVERED         | Kit téléchargé / envoyé au client  | Révocation + Rétrogradation application  |
| CANCELLED         | Abandonnée avant encaissement      | État terminal d'annulation               |
| REFUNDED          | Montant restitué au client         | État terminal avec licence révoquée      |
+-------------------+------------------------------------+------------------------------------------+
```

---

## 3. PROCÉDURES OPÉRATIONNELLES PAR SITUATION

### Situation A : Annulation avant débit bancaire (`CREATED` ou `PAYMENT_PENDING`)
- **Contexte** : Le client ferme son navigateur, annule son achat ou la carte est refusée.
- **Action** :
  1. La session de paiement expire ou passe au statut `CANCELLED`.
  2. Aucune licence n'est émise par le serveur LMSE.
  3. Aucun débit n'intervient sur le compte du client.

### Situation B : Annulation immédiatement après paiement, avant délivrance du kit (`PAID` / `LICENSE_GENERATED`)
- **Contexte** : Incident de livraison ou demande immédiate d'annulation avant téléchargement du kit.
- **Action** :
  1. Déclenchement du remboursement intégral via la passerelle de paiement (Stripe / passerelle tunisienne).
  2. Appel de l'endpoint d'administration : `POST /api/admin/licenses/:id/revoke`.
  3. Motif de révocation renseigné : `"Annulation avant livraison - Remboursement commande ORD-XXXX"`.
  4. La clé et le checksum de la licence sont inscrits dans la liste de révocation (`addToRevocationList`).

### Situation C : Demande de remboursement après délivrance ou activation (`DELIVERED`)
- **Contexte** : Le client a reçu sa licence et sollicite un remboursement (ex: incompatibilité matérielle, rétractation légale).
- **Action** :
  1. **Instruction Support** : L'équipe support instruit la demande conformément aux Conditions Générales de Vente (CGV).
  2. **Remboursement financier** : Déclenchement de l'ordre de remboursement sur la passerelle.
  3. **Révocation obligatoire de la licence** :
     - Exécution de `POST /api/admin/licenses/:id/revoke`.
     - Inscription de l'empreinte et de la clé dans la liste noire immuable.
  4. **Impact sur l'application de l'éleveur** :
     - Dès la prochaine synchronisation de licence ou lors de la vérification de révocation, l'application bascule immédiatement au mode natif **FREE**.
     - Les fonctionnalités spécifiques PRO (Wright 4 générations, Bird Intelligence) et PREMIUM (oiseaux illimités) sont reverrouillées.
     - **SANCTUARISATION DES DONNÉES** : Aucune donnée d'élevage (oiseaux, fiches, pontes, historique financier) n'est détruite lors de la révocation. L'éleveur conserve l'accès complet à ses données en mode consultation/FREE.

---

## 4. GESTION DES LITIGES ET CHARGEBACKS (IMPAYÉS)
En cas de contestation bancaire ou rejet de prélèvement (chargeback) :
1. Le webhook de la passerelle transmet l'événement `charge.dispute.created`.
2. Le statut de la commande passe automatiquement à `DISPUTED`.
3. Le serveur LMSE place la licence associée sous statut `suspended` ou `revoked`.
4. Si le litige est résolu favorablement pour l'éleveur, l'administrateur peut réactiver la licence via `POST /api/admin/licenses/:id/renew` ou émettre un remplacement.
