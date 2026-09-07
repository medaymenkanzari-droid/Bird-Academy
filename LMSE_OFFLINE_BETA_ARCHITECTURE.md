# ARCHITECTURE OFFICIELLE — LMSE OFFLINE BETA ACTIVATION

---

## 1. VUE D'ENSEMBLE

Le système **LMSE Offline Beta Activation** permet l'activation et l'utilisation intégrales de l'application **Bird Academy User** sur le terrain Android et multiplateforme en l'absence totale de connexion au serveur LMSE public HTTPS.

```
+----------------------------------+       +-----------------------------------+
|    CENTRE D'ADMINISTRATION LMSE   |       |        BIRD ACADEMY USER          |
|    (Environnement Admin Sécurisé) |       |       (Appareil Bêta-Testeur)     |
+----------------------------------+       +-----------------------------------+
                 |                                           |
    1. Génération & Signature                                |
                 |                                           |
                 v                                           v
  [ BirdAcademy-License-*.lmse ] -------- (Transfert) -------> [ FirstLaunchActivationScreen ]
  [ Payload QR Code / Fiche ]                                 |
                                                             2. Parsing & Validation Local
                                                             |  - OfflineBetaValidator
                                                             |  - SHA-256 Checksum
                                                             |  - Signature vérifiée
                                                             |  - Expiration & Statut
                                                             |  - DeviceFingerprintEngine
                                                             v
                                                   3. Storage & Persistence
                                                             |  - LocalStorageLicenseRepository
                                                             |  - App State: LICENSED (OFFLINE_BETA)
                                                             v
                                                   4. Application Activée & Fonctionnelle
```

---

## 2. MODÈLE DE DONNÉES DU FICHIER `.lmse`

Un fichier `.lmse` est un document JSON structuré et autonome (`bird-academy-lmse` version 1) contenant les métadonnées de licence, les politiques d'accès, le checksum et la signature numérique cryptographique :

```json
{
  "format": "bird-academy-lmse",
  "version": 1,
  "license": {
    "id": "lic_beta_club_mourouj_2026",
    "key": "LMSE-BETA-7F8E-3A2B-9C1D",
    "holderName": "Club Canari Mourouj",
    "holderEmail": "contact@club-mourouj.org",
    "type": "beta",
    "issuedAt": "2026-08-09T00:00:00.000Z",
    "expiresAt": "2026-11-09T00:00:00.000Z",
    "maxDevices": 1,
    "features": ["core", "beta_access", "offline_mode"],
    "allowOfflineActivation": true,
    "mode": "OFFLINE_BETA"
  },
  "checksum": "a8f3b2c1...",
  "signature": "e4f5a6b7..."
}
```

---

## 3. CHAÎNE CRYPTOGRAPHIQUE & VÉRIFICATION LOCALE

1. **Calcul du Payload Critique** :
   $$\text{payloadToSign} = \text{id} : \text{key} : \text{holderName} : \text{type} : \text{issuedAt} : \text{expiresAt} : \text{maxDevices}$$
2. **Empreinte de Contrôle Checksum** :
   $$\text{checksum} = \text{SHA256}(\text{payloadToSign})$$
3. **Vérification de Signature** :
   La signature numérique est contrôlée par `CryptoService.verifySignature(checksum, signature)` sans nécessiter la présence de la clé privée côté User. Toute modification du payload ou de la signature invalide la vérification (`INVALID_CHECKSUM` / `INVALID_SIGNATURE`).

---

## 4. EMPREINTE D'APPAREIL (`DeviceFingerprintEngine`)

L'activation d'une licence lie celle-ci à l'appareil local via son identifiant matériel stable non-PII (`deviceId`).
Pour une licence avec `maxDevices = 1` :
- Le premier appareil à importer la licence enregistre l'activation locale.
- La tentative d'importation sur un deuxième appareil distinct (si des données de binding sont présentes) est rejetée avec le code `DEVICE_LIMIT_EXCEEDED`.

---

## 5. ISOLATION DES BUNDLES USER ET ADMIN

L'architecture respecte strictement le découplage des bundles :
- **Bundle User (`dist_user`)** : Contient `OfflineBetaValidator`, `LicensingService`, `DeviceFingerprintEngine`, `CryptoService` (vérification seule).
- **Bundle Admin (`dist_admin`)** : Seul environnement autorisé à utiliser `LicenseGenerator`, la clé privée de signature `LMSE_PRIVATE_SIGNING_KEY` et `assertAdminContext()`.
