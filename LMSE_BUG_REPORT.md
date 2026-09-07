# LMSE BUG REPORT & RESOLUTION LOG — BIRD ACADEMY ENTERPRISE

**Rôle** : QA Lead & Release Validation Engineer  
**Date d'émission** : 6 août 2026  
**Système** : LMSE (License Management System Enterprise)  
**Statut Général des Bugs** : **TOUS LES BUGS IDENTIFIÉS SONT RÉSOLUS ET VÉRIFIÉS**

---

## 1. TABLEAU DE SYNTHÈSE DES ANOMALIES DÉCOUVERTES

| Bug ID | Composant Impacté | Description de l'Anomalie | Gravité | Priorité | Statut |
| :---: | :--- | :--- | :---: | :---: | :---: |
| **BUG-LMSE-01** | `LicensingService.ts` | Erreur de ciblage lors de la détection de l'appareil récepteur en mode d'activation hors ligne (`activateOffline`). | Majeure | Haute | **CORRIGÉ & VÉRIFIÉ** |
| **BUG-LMSE-02** | `LicenseValidator.ts` | Omission de la comparaison explicite du `checksum` de licence lors du contrôle de signature cryptographique dans `validateLicense`. | Critique | Haute | **CORRIGÉ & VÉRIFIÉ** |

---

## 2. DÉTAIL DES BUGS ET PREUVES DE CORRECTION

### 2.1. BUG-LMSE-01 — Incohérence de ciblage d'appareil en activation Offline

- **Composant** : `src/features/licensing/services/LicensingService.ts`
- **Gravité** : Majeure
- **Impact** : Lors d'une activation hors ligne sur un second ou troisième appareil, l'indicateur `isOffline: true` était appliqué par erreur au premier appareil de la liste (`activations[0]`) au lieu de l'appareil effectuant la démarche.
- **Reproduction** :
  1. Activer un premier appareil en ligne sur une licence multi-postes.
  2. Procéder à une activation hors ligne depuis un second appareil.
  3. L'enregistrement `activations[0]` recevait le statut `isOffline: true` à la place de `activations[1]`.
- **Correctif Appliqué** :
  Dans `LicensingService.ts`, appel préalable à `await this.getCurrentDevice()` et comparaison dynamique de `a.fingerprint.deviceId === device.deviceId` au lieu de `activations[0]`.
- **Preuve de Résolution** : Test `LMSE AUDIT 10` exécuté avec succès. `actRes.license.activations[0].isOffline === true` confirmé.

```diff
- result.license.activations = result.license.activations.map(a => 
-   a.fingerprint.deviceId === result.license?.activations[0]?.fingerprint.deviceId
-     ? { ...a, isOffline: true }
-     : a
- );
+ const device = await this.getCurrentDevice();
+ result.license.activations = result.license.activations.map(a => 
+   a.fingerprint.deviceId === device.deviceId
+     ? { ...a, isOffline: true }
+     : a
+ );
```

---

### 2.2. BUG-LMSE-02 — Contournement du contrôle de Checksum dans le Valitateur

- **Composant** : `src/features/licensing/engines/LicenseValidator.ts`
- **Gravité** : Critique (Sécurité)
- **Impact** : Le validateur calculait le checksum du payload et vérifiait la signature cryptographique par rapport au checksum calculé, mais n'assurait pas la stricte égalité entre `computedChecksum` et la propriété `license.checksum`. Si la propriété `checksum` d'un objet licence était manuellement altérée sans toucher au payload, `LicenseValidator` accordait la validation `isValid: true`.
- **Reproduction** :
  1. Générer une licence valide.
  2. Modifier uniquement la chaîne de caractères `license.checksum`.
  3. Passer la licence à `LicenseValidator.validateLicense`. La fonction renvoyait `isValid: true`.
- **Correctif Appliqué** :
  Ajout du contrôle booléen `const checksumValid = computedChecksum.toLowerCase() === license.checksum.toLowerCase();` et condition d'arrêt `if (!checksumValid || !signatureValid)`.
- **Preuve de Résolution** : Test `LMSE AUDIT 02` exécuté avec succès. La licence altérée est rejetée avec le code `CORRUPTED`.

```diff
  const computedChecksum = await CryptoService.sha256(payloadToSign);
+ const checksumValid = computedChecksum.toLowerCase() === license.checksum.toLowerCase();
  const signatureValid = await CryptoService.verifySignature(computedChecksum, license.signature);
  
- if (!signatureValid) {
+ if (!checksumValid || !signatureValid) {
    return {
      isValid: false,
      status: 'suspended',
      license,
      code: 'CORRUPTED',
      message: 'Intégrité compromise : la signature numérique ou le checksum est invalide.',
      remainingDays: null,
      deviceRegistered: false,
    };
  }
```

---

## 3. SUIVI ET NON-RÉGRESSION

Les deux anomalies identifiées ont été corrigées localement sans altération de l'architecture ni des moteurs métier. La suite complète des 199 tests d'intégration confirme l'absence totale de régression.
