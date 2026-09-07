# RAPPORT DE TEST DE L'ARCHITECTURE DES ENDPOINTS LMSE MOBILE

**Projet** : Bird Academy Enterprise  
**Suite de Tests** : `tests/lmse-android-endpoint.test.ts`  
**Date** : 8 août 2026  
**Résultat Global** : **100% PASS (10/10 tests réussis)**  

---

## Résultats des Tests Automatisés

| N° | Nom du Test | Statut | Durée | Description |
| :-: | :--- | :---: | :---: | :--- |
| 1 | Default development mode allows http://localhost:3001 | **PASS** | 0.8ms | Confirme que le mode dev local autorise localhost. |
| 2 | android-lan mode allows valid LAN IP address | **PASS** | 0.1ms | Valide l'acceptation d'une IP LAN (`http://192.168.1.100:3001`). |
| 3 | android-lan mode rejects localhost endpoint | **PASS** | 0.1ms | Vérifie le rejet de localhost en mode LAN mobile. |
| 4 | beta mode rejects localhost endpoint | **PASS** | 0.1ms | Vérifie le rejet strict de `http://localhost:3001` en Bêta. |
| 5 | beta mode rejects 127.0.0.1 endpoint | **PASS** | 0.1ms | Vérifie le rejet strict de `http://127.0.0.1:3001` en Bêta. |
| 6 | beta mode rejects placeholder `__LMSE_PUBLIC_URL_REQUIRED__` | **PASS** | 0.1ms | Bloque la compilation si le placeholder n'a pas été remplacé. |
| 7 | production mode rejects localhost endpoint | **PASS** | 0.1ms | Vérifie le rejet strict de localhost en Production. |
| 8 | Build Guard: `validateLmseBuildConfig` blocks invalid target configs | **PASS** | 0.8ms | Valide le blocage au moment du build CLI. |
| 9 | LicensingService: Unreachable backend returns `LMSE_BACKEND_UNREACHABLE` | **PASS** | 25.1ms | Vérifie que la coupure réseau renvoie le code d'erreur explicite. |
| 10 | LicensingService: Invalid API config returns `INVALID_API_CONFIGURATION` | **PASS** | 0.9ms | Vérifie le retour d'erreur lors d'une configuration d'URL invalide. |

---

## Rapport d'Exécution CLI

```text
✔ 1. Environment Mode: Default development mode allows http://localhost:3001 (0.82ms)
✔ 2. Environment Mode: android-lan mode allows valid LAN IP address (0.10ms)
✔ 3. Environment Mode: android-lan mode rejects localhost endpoint (0.11ms)
✔ 4. Environment Mode: beta mode rejects localhost endpoint (0.07ms)
✔ 5. Environment Mode: beta mode rejects 127.0.0.1 endpoint (0.06ms)
✔ 6. Environment Mode: beta mode rejects placeholder __LMSE_PUBLIC_URL_REQUIRED__ (0.05ms)
✔ 7. Environment Mode: production mode rejects localhost endpoint (0.05ms)
✔ 8. Build Guard: validateLmseBuildConfig blocks invalid target configurations (0.67ms)
✔ 9. LicensingService: Unreachable backend returns LMSE_BACKEND_UNREACHABLE code (25.15ms)
✔ 10. LicensingService: Invalid API configuration throws/returns INVALID_API_CONFIGURATION (0.94ms)

ℹ tests 10 | pass 10 | fail 0 | duration_ms 210ms
```
