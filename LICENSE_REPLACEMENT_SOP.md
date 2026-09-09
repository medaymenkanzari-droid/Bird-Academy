# STANDARD OPERATING PROCEDURE : REMPLACEMENT DE LICENCE (LICENSE_REPLACEMENT_SOP)
**Projet** : Bird Academy Enterprise — Volière Manager  
**Version** : v1.3.6-RC4  
**Référence** : COMMERCIAL-LAUNCH-PREP-001 / LICENSE-REPLACEMENT-SOP  
**Statut** : OFFICIEL & VALIDÉ  

---

## 1. CONTEXTE & JUSTIFICATION
Bird Academy Enterprise applique une politique stricte de licence mono-appareil (**Single Device**, `maxDevices = 1`), scellée par une empreinte matérielle cryptographique (**Hardware Fingerprint**).
Lorsqu'un éleveur légitime se trouve dans l'incapacité d'utiliser son poste d'origine (changement d'ordinateur, panne de disque dur, réinstallation complète de Windows, vol ou perte de machine), le système doit permettre un transfert contrôlé sans jamais désactiver les défenses anti-piratage.

---

## 2. RÈGLES DE SÉCURITÉ INVIOLABLES
1. **Gouvernance Humaine Obligatoire** : Le remplacement n'est JAMAIS automatique en libre-service. Il requiert obligatoirement une validation par le support ou l'administrateur.
2. **Préservation du Hardware Lock** : Le calcul du fingerprint matériel ne doit JAMAIS être bypassé.
3. **Statut Déterministe REPLACED** : L'ancienne licence passe irrévocablement au statut `replaced` dans le registre LMSE. Elle n'est pas simplement marquée `revoked`, ce qui garantit la traçabilité de continuité du contrat client.
4. **Zéro Transfert Cloud des Données d'Élevage** : La nouvelle licence active l'application sur la nouvelle machine. La récupération des oiseaux s'effectue exclusivement par restauration du fichier de sauvegarde JSON de l'éleveur.

---

## 3. DÉCLENCHEURS DE LA PROCÉDURE
La procédure s'applique exclusivement dans les cas suivants :
- **Cas 1 — Ordinateur renouvelé ou remplacé** : Achat d'un nouveau PC pour la volière.
- **Cas 2 — Panne matérielle majeure** : Remplacement de la carte mère ou du disque système ayant modifié l'empreinte matérielle.
- **Cas 3 — Réinstallation de l'OS** : Formatage complet de Windows sans conservation des identifiants matériels virtuels.
- **Cas 4 — Appareil perdu ou volé** : Incident justifié auprès du support.

---

## 4. DÉROULEMENT OPÉRATIONNEL ÉTAPE PAR ÉTAPE

```
  [CLIENT]                   [SUPPORT / ADMIN]                     [LMSE AUTHORITY]
     │                               │                                     │
     ├─ 1. Demande de remplacement ──►                                     │
     │     (Email + Clé d'origine)   │                                     │
     │                               ├─ 2. Contrôle preuve d'achat         │
     │                               │     & statut licence existante      │
     │                               │                                     │
     │                               ├─ 3. Requête Admin Authentifiée ─────►
     │                               │     POST /api/admin/licenses/:id/replace
     │                               │                                     │
     │                               │                                     ├─ 4. Statut ancienne = REPLACED
     │                               │                                     ├─ 5. Génération nouvelle licence
     │                               │                                     ├─ 6. Scellement ECDSA P-256
     │                               │◄─── 7. Confirmation & Nouveau Kit ──┤
     │◄─ 8. Envoi du nouveau kit ────┤
     │     (license.lmse + ZIP)      │
     │                               │
     ├─ 9. Importation sur nouveau PC
     ├─ 10. Restauration sauvegarde JSON
```

### Étape 1 : Réception de la requête client
Le client contacte le support officiel avec les éléments suivants :
- Adresse e-mail d'achat originale (`holderEmail`).
- Ancienne clé de licence (`LMSE-COMM-XXXX-...`) ou numéro de facture/commande.
- Motif du changement (ex: "Achat d'un nouvel ordinateur portable").

### Étape 2 : Vérification par l'équipe Support
L'opérateur support vérifie dans la console d'administration privée :
1. Que la licence existe bien et appartient au demandeur.
2. Que son statut est `active` (une licence déjà `revoked` pour fraude ne peut pas être remplacée).
3. Que le nombre de remplacements précédents reste raisonnable (politique anti-abus : maximum 2 remplacements par an sauf justification exceptionnelle).

### Étape 3 : Exécution administrative sur LMSE
L'administrateur authentifié exécute l'opération via l'interface Admin ou l'API sécurisée :
- **Route** : `POST /api/admin/licenses/:id/replace`
- **En-têtes** : `Authorization: Bearer <ADMIN_SESSION_TOKEN>`
- **Corps de la requête** :
  ```json
  {
    "reason": "Changement de matériel client validé par ticket SUP-8419",
    "targetTier": "PRO"
  }
  ```

### Étape 4 : Traitement par le moteur de cycle de vie (`LicenseLifecycleEngine`)
Le serveur LMSE effectue automatiquement :
1. Transition de l'ancienne licence vers le statut `replaced` avec date et motif d'archivage.
2. Génération d'une nouvelle licence scellée sous la même identité client avec un `id` et une `key` propres.
3. Injection dans les métadonnées de la nouvelle licence du champ `replacedLicenseId: "<ancien_id>"`.
4. Enregistrement d'un log d'audit immuable :
   ```json
   {
     "who": "admin@birdacademy.com",
     "action": "LICENSE_REPLACED",
     "target": "LIC-PRO-2026-NEW",
     "result": "SUCCESS"
   }
   ```

### Étape 5 : Assemblage et délivrance du nouveau kit
- Le nouveau delivery kit est généré (nouveau fichier `.lmse`, nouveau QR code, nouvelle clé).
- L'opérateur transmet le lien de téléchargement sécurisé ou le fichier compressé au client par e-mail.

### Étape 6 : Activation sur le nouvel ordinateur
- Le client installe Bird Academy sur sa nouvelle machine.
- Il importe la nouvelle licence `.lmse` dans l'application.
- Le validateur local associe le nouvel appareil.
- L'éleveur utilise la fonction `Paramètres` → `Sauvegardes` → `Restaurer une sauvegarde` pour importer son fichier de données d'élevage JSON et retrouver instantanément ses oiseaux, généalogies et historiques.
