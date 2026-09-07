# LMSE-COMMERCIAL-LICENSING-IMPLEMENTATION-01
## Spécification et Implémentation du Système Commercial de Licences LMSE

**Projet :** Bird Academy Enterprise  
**Version :** 1.3.6-RC4  
**Date :** 30 Août 2026  
**Statut :** OFFICIELLEMENT VALIDÉ & DURCI  

---

## 1. Chaîne d'Autorité Commerciale Déterministe

Le système commercial de Bird Academy Enterprise repose sur une chaîne d'autorité cryptographique stricte et univoque :

```
LMSE LICENSE (Fichier .lmse, QR Code, Clé manuelle)
    ↓
LICENSE VALIDATION (SHA-256 Checksum + Vérification Signature Ed25519/HMAC)
    ↓
LICENSE STATUS (ACTIVE, EXPIRED, REVOKED, SUSPENDED, CORRUPTED)
    ↓
COMMERCIAL TIER (FREE, PREMIUM, PRO)
    ↓
CAPABILITIES (TIER_CAPABILITIES Map Déterministe)
    ↓
FEATURE ACCESS (Accès / Limitation / Verrouillage)
    ↓
UI ACCESS (Navigation, Badges, Modales, Assistant IA)
```

### Règle d'or Anti-Bypass
Aucune valeur brute telle que `localStorage.tier`, `localStorage.plan`, `localStorage.subscription` ou `localStorage.isPro` n'est acceptée comme source d'autorisation. Le tier commercial et les capacités sont recalculés dynamiquement à partir de la licence LMSE cryptographiquement vérifiée.

---

## 2. Matrice d'Attribution Commerciale

| Type de Licence LMSE | Statut de Validation | Tier Commercial Résolu | Capacités Clés |
| :--- | :--- | :--- | :--- |
| `enterprise` | ACTIVE | **PRO** | Bird Intelligence complet, Consanguinité avancée, Assistant IA illimité (∞), Multi-utilisateur |
| `beta` | ACTIVE | **PRO** | Accès complet PRO (Édition testeurs officiels) |
| `association` / `veterinary` | ACTIVE | **PRO** | Accès complet PRO + outils collaboratifs |
| `commercial` (`tier:premium`) | ACTIVE | **PREMIUM** | Oiseaux illimités, Génétique Wright standard, Assistant IA 100 req/jour avec contexte élevage |
| `commercial` (`tier:free`) | ACTIVE | **FREE** | Consultation de base, Référentiel biologique, Assistant IA 10 - Quota strict, Intelligence verrouillée |
| *Toute licence* | EXPIRED / REVOKED / INVALIDE | **FREE** | Rétrogradation automatique et gracieuse vers le plan FREE sans interruption ni perte de données |
| *Aucune licence* (Premier lancement) | NON INITIALISÉ | **UNLICENSED** | Écran d'activation initiale obligatoire (`FirstLaunchActivationScreen`) |

---

## 3. Quotas et Accès de l'Assistant IA PRO Offline

| Critère | Plan FREE | Plan PREMIUM | Plan PRO |
| :--- | :--- | :--- | :--- |
| **Quota journalier** | 10 requêtes / jour | 100 requêtes / jour | **Illimité (∞)** |
| **Contexte élevage personnel** | Désactivé (0 oiseau/cage) | Activé (Données élevage) | **Activé (Intelligence & Généalogie)** |
| **Périmètre d'expertise** | Référentiel biologique & soins | Gestion élevage, alimentation | **Génétique, Consanguinité, Analyses avancées** |
| **Mode d'exécution** | 100% Offline | 100% Offline | **100% Offline** |

---

## 4. Garantie de Conservation des Données (Data Retention Guarantee)

En cas de changement de plan ou d'expiration :
- **Aucune donnée n'est supprimée :** Les oiseaux, cages, couples, couvées, soins médicaux, transactions financières et arbres généalogiques restent intacts dans la base locale (IndexedDB / LocalStorage).
- **Verrouillage sélectif :** Seul l'accès aux interfaces et moteurs avancés (ex: moteur IA de consanguinité ou Bird Intelligence) est restreint par des cartes `FeatureLockedCard` incitant à la mise à niveau.

---

## 5. Méthodes d'Activation Prises en Charge

1. **Import de Fichier `.lmse` :** Lecture sécurisée du JSON structuré contenant l'identifiant, le titulaire, le type, la politique, le checksum SHA-256 et la signature numérique.
2. **Scanner QR Code :** Décodage immédiat des payloads de licence compressés et signés.
3. **Saisie Manuelle de Clé :** Format standardisé `LMSE-XXXX-XXXX-XXXX-XXXX` vérifié par `KeyValidator` et `CryptoService`.
4. **Défi Hors Ligne (Air-gapped) :** Génération d'empreinte machine cryptographique et validation par code de déverrouillage hors ligne.

---

## 6. Internationalisation et Accessibilité

Le système de licences et les notifications de statuts sont traduits et validés dans 5 langues :
- **Français (FR)**
- **English (EN)**
- **العربية (AR)** avec inversion directionnelle automatique RTL (`dir="rtl"`)
- **Español (ES)**
- **Italiano (IT)**

---

## 7. Sécurité et Isolation du Bundle

- **Isolation de la Clé Privée :** Aucune clé privée de signature n'est intégrée dans le bundle utilisateur final (`dist_user/`). Toute tentative d'accès déclenche une exception de sécurité `SECURITY_ERROR`.
- **Zéro Requête Réseau :** L'activation, la validation, la résolution du tier et les requêtes de l'assistant IA fonctionnent avec **0 requête externe**.
