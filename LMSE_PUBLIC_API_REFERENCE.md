# Spécification Technique des Endpoints API LMSE Backend

## 1. Endpoints Publics & Authentification Client

### `GET /api/health`
- **Authentification** : Aucune (Publique)
- **Description** : Diagnostic de santé de l'API LMSE et présence du Super Admin.
- **Réponse HTTP 200** :
```json
{
  "status": "ok",
  "service": "LMSE Backend API",
  "timestamp": "2026-08-08T21:00:00.000Z",
  "hasSuperAdmin": true
}
```

### `POST /api/license/validate`
- **Authentification** : Aucune (Protégée par Rate Limiting)
- **Payload** :
```json
{
  "licenseKey": "LMSE-BETA-XXXX-XXXX-XXXX",
  "device": {
    "deviceId": "DEV_ANDROID_001",
    "platform": "Android"
  }
}
```
- **Réponse HTTP 200 OK (Succès)** :
```json
{
  "isValid": true,
  "status": "active",
  "code": "ACTIVATION_SUCCESS",
  "message": "Licence activée avec succès.",
  "deviceRegistered": true
}
```

---

## 2. Endpoints d'Administration Protégés (`/api/admin/*`)

### `POST /api/admin/auth/login`
- **Authentification** : Credentials (Email + Password)
- **Description** : Authentification d'un administrateur et génération de jeton de session Bearer.

### `POST /api/admin/licenses`
- **Authentification** : Bearer Token (`super_admin` ou `admin` uniquement)
- **Payload** :
```json
{
  "holderName": "Elevage Bêta Testeur",
  "type": "beta",
  "durationDays": 90,
  "maxDevices": 2
}
```
- **Réponse HTTP 201 Created** : Renvoie l'objet licence signé numériquement par le serveur.

### `POST /api/admin/licenses/:id/revoke`
- **Authentification** : Bearer Token (`super_admin` ou `admin` uniquement)
- **Payload** : `{ "reason": "Motif de révocation" }`
- **Réponse HTTP 200 OK** : Invalide la licence et l'ajoute à la liste de révocation serveur.
