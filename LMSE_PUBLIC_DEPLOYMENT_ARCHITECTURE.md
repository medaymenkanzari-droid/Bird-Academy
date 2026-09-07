# LMSE Public Deployment Architecture — Bird Academy Enterprise (Phase Bêta RC2.5)

## 1. Overview & Topologie Système

```text
                                  INTERNET
                                     │
                                     ▼
                          HTTPS / TLS 1.2+ / TLS 1.3
                                     │
                                     ▼
                      ┌─────────────────────────────┐
                      │    LMSE PUBLIC AUTHORITY    │
                      │ (Reverse Proxy / Cloud API) │
                      └──────────────┬──────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
         Bird Academy User                       Bird Academy Admin
     Android / Web / PC / iOS                     Back Office Admin
```

---

## 2. Rôles et Responsabilités des Composants

### Backend Public LMSE
- **Autorité Unique** : Génération cryptographique, signature HMAC/SHA-256, révocation, et validation d'activation.
- **Stockage Persistant Volume** : Gestion atomique des fichiers `./data/licenses.json`, `revocations.json`, `license-audit-logs.json`, `admin-users.json`.
- **Isolation des Secrets** : Clé d'autorité `LMSE_PRIVATE_SIGNING_KEY` injectée exclusivement dans les variables d'environnement du container backend.

### Applications Client (User App)
- **Validation Offline/Online** : Interrogation initiale de l'autorité distante (`POST /api/license/validate`), puis mise en cache locale chiffrée.
- **Zéro Secret Admin** : Rejet de tout module de génération ou clé de signature dans les bundles compilés Android (`.apk`), Windows (`.exe`), PWA.

---

## 3. Matrice des Environnements

| Environnement | Endpoint LMSE | Protocoles Autorisés | Rejet Localhost |
| :--- | :--- | :---: | :---: |
| `development` | `http://localhost:3001` | HTTP / HTTPS | Non |
| `android-lan` | `http://192.168.x.x:3001` | HTTP / HTTPS | Oui |
| `beta` | `https://PUBLIC_LMSE_URL` | **HTTPS Uniquement** | **Oui (Stricte)** |
| `production` | `https://PUBLIC_LMSE_URL` | **HTTPS Uniquement** | **Oui (Stricte)** |
