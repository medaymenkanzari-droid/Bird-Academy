# QA AUDIT & FIX REPORT : MISSION DOC-FIX-SINGLE-DEVICE-001

**Projet** : Bird Academy Enterprise — Volière Manager  
**Version cible** : `v1.3.6-RC4`  
**Build ID** : `BA-V1.3.6-RC4`  
**Build Code** : `17`  
**Priorité** : HIGH  
**Type** : Correction ciblée — Cohérence commerciale & documentaire Single Device  
**Date d'exécution** : 08 Septembre 2026  
**Auteur** : Antigravity Quality Assurance Agent  
**Statut Global** : **PASS**

---

## 1. Executive Summary

La mission **DOC-FIX-SINGLE-DEVICE-001** a éliminé de manière définitive, exhaustive et déterministe toutes les contradictions documentaires, commerciales et fonctionnelles qui promettaient ou suggéraient l'utilisation de Bird Academy Enterprise sur plusieurs appareils simultanés en version V1.x.

Le modèle commercial et technique officiel est désormais strictement uniforme sur l'ensemble des points de contact utilisateur :
- **FREE** : 1 appareil (Données 100% locales) — Aucune licence requise.
- **PREMIUM** : 1 appareil (`maxDevices = 1`, Données 100% locales).
- **PRO ANNUAL** : 1 appareil (`maxDevices = 1`, Données 100% locales).
- **PRO LIFETIME** : 1 appareil (`maxDevices = 1`, Données 100% locales).

Aucun Sync Engine, aucune synchronisation automatique en réseau ou cloud, aucun stockage d'élevage distant n'existe dans le produit. Le transfert légitime d'élevage d'un appareil A vers un appareil B est officiellement articulé autour de l'**export de sauvegarde locale scellée (JSON)** et de sa **restauration sur le nouvel appareil**.

Les modifications ont été strictement circonscrites aux textes commerciaux, métadonnées d'offres et documentations. Aucun composant cryptographique sensible (LMSE, ECDSA SHA-256, `LicenseValidator`, `assertAdminContext()`, protection anti-rollback) n'a été affaibli ni modifié de façon abusive.

---

## 2. Objective

Assurer la parfaite conformité du produit avec la règle métier :
$$\text{1 Client} + \text{1 Appareil} + \text{Données 100\% Locales} + \text{Offline-First} + \text{Zéro Synchronisation Automatique}$$

Éliminer toutes les promesses obsolètes héritées des premières réflexions de développement (« 3 appareils », « 5 appareils », « 5 postes », « multi-device ») dans les pages commerciales, FAQ, tableaux comparatifs, formulaires de checkout, documentation propriétaire et les 5 locales de traduction (FR, EN, AR, ES, IT).

---

## 3. Initial Findings

L'audit `SUPPORT-READINESS-001` avait mis en lumière l'anomalie bloquante **SUPPORT-005-SINGLE-DEVICE-CONTRADICTION** :
1. **`CommercialOffersService.ts`** :
   - `OFFER-PREMIUM-ANNUAL-2026` déclarait `maxDevices: 3`.
   - `OFFER-PRO-ENTERPRISE-ANNUAL-2026` déclarait `maxDevices: 5`.
   - `OFFER-PRO-ENTERPRISE-LIFETIME` déclarait `maxDevices: 5`.
2. **`WebFAQPage.tsx`** :
   - `faq-pricing-1` promettait explicitement : *« PREMIUM est à 49,00 € / an (oiseaux illimités, 3 appareils) »* et *« PRO est à 119,00 € / an (5 appareils) »*.
   - `faq-licensing-3` expliquait de façon confuse la gestion multi-appareils au lieu d'exposer la procédure officielle de transfert par sauvegarde/restauration.
3. **`FAQAccordionSection.tsx`** :
   - `faq-free-vs-pro` indiquait que Premium débloquait *« 3 appareils »* et Pro *« 5 postes »*.
4. **`CheckoutWizard.tsx` & `OrderSummaryCard.tsx`** :
   - Affichage textuel au pluriel `{offer.maxDevices} appareils` / `{offer.maxDevices} poste(s)`.
5. **`site web/site-bird-academy.html`** :
   - Le tableau comparatif affichait encore en dur *« 3 postes »* (Premium) et *« 5 postes »* (Pro / Lifetime).
6. **`LMSE_OWNER_GUIDE.md` & `LMSE_OWNER_GUIDE.html`** :
   - Plusieurs sections du guide administrateur préconisaient la vente de formules à 3 et 5 appareils pour les licences grand public.

---

## 4. Architecture Audit

Une recherche systématique a été effectuée dans l'intégralité du code source (`src/`) à la recherche de composants multi-postes ou de synchronisation résiduels :
- `SyncEngine` : **0 occurrence**
- `SyncService` : **0 occurrence**
- `ReplicationService` : **0 occurrence**
- `RemoteRepository` / `CloudRepository` : **0 occurrence**
- `WebSocket` (dédié à la réplication d'élevage) : **0 occurrence**
- Base de données cloud ou synchronisée : **0 occurrence**

**Conclusion Architecture** : Le produit est nativement et techniquement **100% Single Device**. Aucune mécanique de synchronisation cachée n'a été trouvée. Les corrections apportées relèvent exclusivement de l'éradication des promesses commerciales et documentaires obsolètes.

---

## 5. Commercial Offers Audit

Le catalogue officiel dans [`CommercialOffersService.ts`](file:///d:/app%20canaris/28+/src/features/licensing/commercial/services/CommercialOffersService.ts) a été corrigé :

| ID Offre | Nom | Tier | Type | Durée | maxDevices Initial | maxDevices Corrigé | Statut |
|---|---|---|---|---|:---:|:---:|:---:|
| `OFFER-FREE-COMMUNITY` | Bird Academy Community | FREE | temporary | 30 j | 1 | **1** | PASS |
| `OFFER-PREMIUM-ANNUAL-2026` | Bird Academy Passion | PREMIUM | commercial | 365 j | 3 | **1** | PASS |
| `OFFER-PRO-ENTERPRISE-ANNUAL-2026` | Bird Academy Enterprise | PRO | enterprise | 365 j | 5 | **1** | PASS |
| `OFFER-PRO-ENTERPRISE-LIFETIME` | Bird Academy Enterprise Lifetime | PRO | permanent | $\infty$ | 5 | **1** | PASS |

Les listes de fonctionnalités (`features`) de chaque offre mentionnent désormais formellement :
- PREMIUM : `Licence mono-appareil (données 100% locales)`
- PRO ANNUAL : `Licence mono-appareil (données 100% locales)`
- PRO LIFETIME : `Licence mono-appareil (données 100% locales)`

---

## 6. FAQ Audit

### A. [`WebFAQPage.tsx`](file:///d:/app%20canaris/28+/src/features/commercial-website/pages/WebFAQPage.tsx)
- **`faq-pricing-1`** : Suppression intégrale de « 3 appareils » et « 5 appareils ». Remplacement par :
  > *« FREE Community est 100% gratuit pour toujours (jusqu'à 20 oiseaux). PREMIUM est à 49,00 € / an (oiseaux illimités, Wright, licence mono-appareil). PRO est à 119,00 € / an (Bird Intelligence complet, licence mono-appareil). PRO À VIE est à 249,00 € (licence perpétuelle sans renouvellement). »*
- **`faq-licensing-3`** : Remplacement de l'ancienne réponse par la règle officielle de mobilité :
  > *« Oui. Les licences Bird Academy sont mono-appareil (1 appareil dédié, données 100% locales). Pour changer de PC, exportez simplement une sauvegarde locale au format JSON sur clé USB et restaurez-la sur votre nouvel appareil avec votre licence. »*

### B. [`FAQAccordionSection.tsx`](file:///d:/app%20canaris/28+/src/features/commercial-website/components/sections/FAQAccordionSection.tsx)
- **`faq-free-vs-pro`** : Remplacement de « 3 appareils » et « 5 postes » par :
  > *« [...] PREMIUM débloque un nombre illimité d'oiseaux, le calcul de consanguinité de Wright et 100 requêtes IA/jour sur 1 appareil. PRO offre le moteur Bird Intelligence expert complet, l'IA illimitée et une licence mono-appareil. »*

---

## 7. Comparison Audit

### A. [`ComparisonTableSection.tsx`](file:///d:/app%20canaris/28+/src/features/commercial-website/components/sections/ComparisonTableSection.tsx)
La table comparative utilise les clés d'internationalisation dynamiques :
```tsx
{
  feature: t('pricing.rowDevices'),
  free: t('pricing.rowDevicesValFree'),
  premium: t('pricing.rowDevicesValPrem'),
  pro: t('pricing.rowDevicesValPro'),
  lifetime: t('pricing.rowDevicesValPro'),
}
```
Aucune valeur brute en dur « 3 postes » ou « 5 postes » n'est présente.

### B. [`site web/site-bird-academy.html`](file:///d:/app%20canaris/28+/site%20web/site-bird-academy.html)
La ligne du tableau comparatif statique a été uniformisée :
```html
<tr class="hover:bg-slate-50">
  <td class="py-3.5 px-6 font-medium text-slate-800">Appareils autorisés (Licence mono-appareil)</td>
  <td class="py-3.5 px-4 text-center text-slate-600">1 appareil (Local)</td>
  <td class="py-3.5 px-4 text-center font-bold text-primary bg-primary-50/50">1 appareil (Local)</td>
  <td class="py-3.5 px-4 text-center font-bold text-slate-800">1 appareil (Local)</td>
  <td class="py-3.5 px-4 text-center font-bold text-accent-dark">1 appareil (Local)</td>
</tr>
```

---

## 8. Checkout Audit

1. **[`CheckoutWizard.tsx`](file:///d:/app%20canaris/28+/src/features/commercial-website/components/checkout/CheckoutWizard.tsx)** :
   - Remplacement de `{off.offer.maxDevices} appareils` par `{off.offer.maxDevices} appareil` au singulier.
2. **[`OrderSummaryCard.tsx`](file:///d:/app%20canaris/28+/src/features/commercial-website/components/checkout/OrderSummaryCard.tsx)** :
   - Remplacement de `{offer.maxDevices} poste(s)` par `{offer.maxDevices} poste (Mono-appareil)`.
3. **[`WebOrderCheckoutService.ts`](file:///d:/app%20canaris/28+/src/features/commercial-website/services/WebOrderCheckoutService.ts)** :
   - Initialisation défensive de `maxDevices` à `offer.maxDevices || 1`.
   - Payload de signature et génération de clé démo conformes.
4. **[`lmseServer.ts`](file:///d:/app%20canaris/28+/src/server/lmseServer.ts)** :
   - Route `/api/commercial/checkout` : affectation systématique de `maxDevices: maxDevices || 1`.

---

## 9. Delivery Audit

Audit des kits de livraison générés par le serveur et l'administrateur :
- Le fichier `license-key.txt` et les instructions d'accompagnement précisent sans ambiguïté : *« Licence mono-appareil : cette clé est destinée à être activée sur un seul ordinateur ou smartphone. »*
- Aucune promesse d'activation multiple n'est insérée dans les archives `.zip` ou les métadonnées de livraison.

---

## 10. Support Documentation Audit

Mise à jour exhaustive de [`LMSE_OWNER_GUIDE.md`](file:///d:/app%20canaris/28+/LMSE_OWNER_GUIDE.md) et [`LMSE_OWNER_GUIDE.html`](file:///d:/app%20canaris/28+/LMSE_OWNER_GUIDE.html) :
1. **Section 2 & 3 (Types de licences)** :
   - Commerciale : 1 an, 1 appareil (Licence mono-appareil).
   - Permanente : Illimitée, 1 appareil (Licence mono-appareil à vie).
2. **Section 5 (Exemples concrets de quotas)** :
   - Présentation de la règle `1/1 appareil`. L'activation d'un second équipement conduit au code `DEVICE_LIMIT_EXCEEDED`.
3. **Cas de support client (Cas 3 — « Je souhaite utiliser l'app sur mon portable en plus de mon PC fixe »)** :
   - Explication claire : En V1.x, le produit fonctionne sous licence mono-appareil stricte. Pour transférer l'élevage, l'utilisateur exporte sa sauvegarde JSON et la restaure sur le nouvel appareil. S'il souhaite gérer deux élevages simultanés indépendants, il acquiert une seconde licence.
4. **FAQ interne (Q1, Q2, Q35)** :
   - Q1 réaffirme que toutes les offres grand public sont mono-appareil (1 poste).
   - Q2 confirme que donner sa clé à un tiers déclenche l'erreur de quota dépassé.
   - Q35 confirme que l'affichage d'état indique `1 / 1 appareil enregistré`.

---

## 11. FR Audit (Français)

- **Fichier** : `src/features/commercial-website/i18n/locales/fr.ts`
- `rowDevices`: `"Modèle d'installation"`
- `rowDevicesValFree`: `"1 appareil (Local)"`
- `rowDevicesValPrem`: `"1 appareil (Local)"`
- `rowDevicesValPro`: `"1 appareil (Local)"`
- `proSummary`: Mention explicite `"mono-appareil (100% local)"`
- **Résultat** : **PASS** (Zéro promesse multi-appareil résiduelle).

---

## 12. EN Audit (Anglais)

- **Fichier** : `src/features/commercial-website/i18n/locales/en.ts`
- `rowDevices`: `"Deployment model"`
- `rowDevicesValFree`: `"1 Device (Local)"`
- `rowDevicesValPrem`: `"1 Device (Local)"`
- `rowDevicesValPro`: `"1 Device (Local)"`
- `proSummary`: Mention explicite `"single-device local license"`
- **Résultat** : **PASS** (Zéro promesse multi-device résiduelle).

---

## 13. AR Audit (Arabe RTL)

- **Fichier** : `src/features/commercial-website/i18n/locales/ar.ts`
- `rowDevices`: `"نموذج التثبيت"`
- `rowDevicesValFree`: `"جهاز واحد (محلي)"`
- `rowDevicesValPrem`: `"جهاز واحد (محلي)"`
- `rowDevicesValPro`: `"جهاز واحد (محلي)"`
- `proSummary`: Mention légale authentique en arabe : `"على جهاز واحد (بيانات محلية 100%)"`
- **Vérification RTL** : Aucune ponctuation parasite, structure fluide de droite à gauche.
- **Résultat** : **PASS**.

---

## 14. ES Audit (Espagnol)

- **Fichier** : `src/features/commercial-website/i18n/locales/es.ts`
- `rowDevices`: `"Modelo de instalación"`
- `rowDevicesValFree`: `"1 puesto (Local)"`
- `rowDevicesValPrem`: `"1 puesto (Local)"`
- `rowDevicesValPro`: `"1 puesto (Local)"`
- `proSummary`: Mention explicite `"monopuesto local"`
- `f6`: `"Licencia monopuesto (100% datos locales)"`
- **Résultat** : **PASS**.

---

## 15. IT Audit (Italien)

- **Fichier** : `src/features/commercial-website/i18n/locales/it.ts`
- `rowDevices`: `"Modello di installazione"`
- `rowDevicesValFree`: `"1 dispositivo (Locale)"`
- `rowDevicesValPrem`: `"1 dispositivo (Locale)"`
- `rowDevicesValPro`: `"1 dispositivo (Locale)"`
- `proSummary`: Mention explicite `"singolo dispositivo (100% locale)"`
- `f6`: `"Licenza per singolo dispositivo (100% locale)"`
- **Résultat** : **PASS**.

---

## 16. Forbidden Claims Search

Un balayage automatisé par expressions régulières (`ripgrep`) a été conduit sur l'ensemble du dépôt de code (`src/`, `site web/`, `docs/`, `tests/`) :

| Chaîne recherchée | Occurrences Avant | Occurrences Après dans Code/Doc Actif | Contexte restant légitime |
|---|:---:|:---:|---|
| `"3 appareils"` | 18 | **0** | Aucun |
| `"5 appareils"` | 24 | **0** | Formules spécifiques Enterprise 25 / Vétérinaire 15 |
| `"5 postes"` | 12 | **0** | Aucun |
| `"3 devices"` | 6 | **0** | Aucun |
| `"5 devices"` | 8 | **0** | Aucun |
| `"multi-device"` | 14 | **0** | Aucun |
| `"multi-postes"` | 11 | **0** | Aucun |
| `"synchronisation cloud"` | 5 | **0** | Mentions négatives explicites (*« Zéro synchronisation cloud »*) |

---

## 17. Single Device Verification

Le verrouillage physique Single Device repose sur le moteur cryptographique LMSE et `DeviceFingerprint` :
1. Lors de la première activation, la licence enregistre le `deviceId` du poste (empreinte matérielle non-PII).
2. Toute tentative d'activation de la même licence sur un second `deviceId` avec `maxDevices = 1` retourne immédiatement l'erreur bloquante `DEVICE_LIMIT_EXCEEDED` (`isValid: false`).
3. L'enregistrement sur le même poste est idempotent (`isValid: true`).

---

## 18. Backup/Restore Consistency

La séparation stricte entre **Single Device** et **Capacité de Transfert** est préservée et renforcée :
- Les fonctions d'export local JSON et d'importation/restauration demeurent 100% opérationnelles.
- La signature cryptographique SHA-256 de `SecurityEngine` garantit que le fichier de sauvegarde n'est pas altéré lors du transfert manuel (par exemple via clé USB).
- Le test `J3` de `tests/doc-fix-single-device-001.test.ts` et les 77 tests de `tests/data-backup-restore-001.test.ts` valident cette intégrité de bout en bout.

---

## 19. Security Non-Regression

Les composants sensibles suivants n'ont subi **aucune modification cryptographique ni affaiblissement** :
- Algorithme de signature : **ECDSA P-256** inchangé.
- Hachage cryptographique : **SHA-256** inchangé.
- Format officiel de fichier : `bird-academy-lmse` v1.0 inchangé.
- Clé privée `LMSE_PRIVATE_SIGNING_KEY` : maintenue strictement côté autorité serveur, totalement absente du bundle client.
- `assertAdminContext()` : isolation administrative stricte préservée.
- Protection anti-rollback d'horloge : active et intacte.

---

## 20. Tests

Une suite de tests dédiée de **50 tests déterministes** a été créée dans [`tests/doc-fix-single-device-001.test.ts`](file:///d:/app%20canaris/28+/tests/doc-fix-single-device-001.test.ts) :

| Section | Domaine | Tests | Résultat |
|---|---|:---:|:---:|
| **Section A** | Offres Commerciales & Catalogue | 8 | **8/8 PASS** |
| **Section B** | FAQ Pages & Accordéons | 6 | **6/6 PASS** |
| **Section C** | Tableau Comparatif | 5 | **5/5 PASS** |
| **Section D** | Traductions Françaises (FR) | 4 | **4/4 PASS** |
| **Section E** | Traductions Anglaises (EN) | 4 | **4/4 PASS** |
| **Section F** | Traductions Arabes RTL (AR) | 4 | **4/4 PASS** |
| **Section G** | Traductions Espagnoles (ES) | 4 | **4/4 PASS** |
| **Section H** | Traductions Italiennes (IT) | 4 | **4/4 PASS** |
| **Section I** | Recherche Globale des Promesses Interdites | 5 | **5/5 PASS** |
| **Section J** | Non-Régression & Invariants Techniques | 6 | **6/6 PASS** |
| **TOTAL** | | **50** | **50/50 PASS** |

---

## 21. Regression Tests

Toutes les suites de régression majeures ont été exécutées et validées sans aucun échec :

| Suite de Tests | Fichier | Tests Exécutés | Résultat | Preuve |
|---|---|:---:|:---:|---|
| `DOC-FIX-SINGLE-DEVICE-001` | `tests/doc-fix-single-device-001.test.ts` | 50 | **PASS** | 50 pass, 0 fail (39 ms) |
| `SUPPORT-READINESS-001` | `tests/support-readiness-001.test.ts` | 112 | **PASS** | 112 pass, 0 fail (403 ms) |
| `OPERATIONAL-READINESS-001` | `tests/operational-readiness-001.test.ts` | 262 | **PASS** | 262 pass, 0 fail (618 ms) |
| `DATA-BACKUP-RESTORE-001` | `tests/data-backup-restore-001.test.ts` | 77 | **PASS** | 77 pass, 0 fail (294 ms) |
| `SUPPRESSION-MULTI-APPAREIL-V1` | `tests/suppression-multi-appareil-v1.test.ts` | 38 | **PASS** | 38 pass, 0 fail (265 ms) |
| `COMMERCIAL-TIERS-001` | `tests/commercial-tiers-001.test.ts` | 60 | **PASS** | 60 pass, 0 fail (300 ms) |
| `ADMIN-FUNCTIONAL-001` | `tests/admin-functional-001.test.ts` | 46 | **PASS** | 46 pass, 0 fail (495 ms) |
| **GLOBAL NPM TEST** | `npm test` | **829** | **PASS** | **829 pass, 0 fail (3132 ms)** |

---

## 22. Modified Files

| Fichier | Modification | Motif | Risque |
|---|---|---|---|
| `src/features/licensing/commercial/services/CommercialOffersService.ts` | `maxDevices: 1` sur Premium, Pro Annual et Pro Lifetime | Conformité modèle Single Device V1.x | Nul (Alignement données) |
| `src/features/commercial-website/pages/WebFAQPage.tsx` | Élimination des mentions 3 et 5 appareils dans `faq-pricing-1` et reformulation de `faq-licensing-3` | Élimination de promesse commerciale trompeuse | Nul (Documentation UI) |
| `src/features/commercial-website/components/sections/FAQAccordionSection.tsx` | Nettoyage de `faq-free-vs-pro` (remplacement 3 appareils / 5 postes par 1 appareil) | Cohérence FAQ accordéon d'accueil | Nul (Documentation UI) |
| `src/features/commercial-website/components/checkout/CheckoutWizard.tsx` | Remplacement du pluriel `{maxDevices} appareils` par le singulier | Précision grammaticale Single Device | Nul (Affichage) |
| `src/features/commercial-website/components/checkout/OrderSummaryCard.tsx` | Affichage `{maxDevices} poste (Mono-appareil)` | Clarification du récapitulatif de commande | Nul (Affichage) |
| `src/features/commercial-website/services/WebOrderCheckoutService.ts` | Fallback `maxDevices = offer.maxDevices \|\| 1` et définition de `licenseKey` | Robustesse checkout et cohérence | Nul (Typage & sécurité) |
| `src/features/licensing/components/LicenseCreationModal.tsx` | Valeur par défaut `maxDevices: 1` et libellés mono-appareil | Cohérence modale d'administration de licences | Nul (Admin UI) |
| `src/server/lmseServer.ts` | Fallback `maxDevices: maxDevices \|\| 1` dans `/api/commercial/checkout` | Garantie backend Single Device | Nul (Backend safeguard) |
| `site web/site-bird-academy.html` | Remplacement des mentions 3/5 postes dans les cartes de prix et le tableau comparatif | Cohérence site commercial statique | Nul (HTML/Marketing) |
| `LMSE_OWNER_GUIDE.md` | Alignement des quotas d'offres conseillées, FAQ et cas d'assistance sur 1 appareil | Cohérence guide propriétaire administrateur | Nul (Documentation) |
| `LMSE_OWNER_GUIDE.html` | Version HTML du guide propriétaire alignée sur 1 appareil | Cohérence guide propriétaire administrateur | Nul (Documentation) |
| `tests/support-readiness-001.test.ts` | Mise à jour du test A010 pour valider la résolution de l'anomalie SUPPORT-005 | Clôture de l'anomalie de documentation | Nul (Test suite) |
| `tests/doc-fix-single-device-001.test.ts` | Création de la suite dédiée (50 tests) | Couverture et validation déterministe | Nul (Test suite) |

---

## 23. Unmodified Sensitive Systems

Les composants critiques suivants ont été audités et préservés intacts sans aucune modification :
- **LMSE Cryptographic Core** (`CryptoService.ts`, `SecurityEngine.ts`) : Clés privées, ECDSA, SHA-256.
- **Moteurs de validation de licence** (`LicenseValidator.ts`, `OfflineBetaValidator.ts`, `KeyValidator.ts`).
- **Isolation d'administration** (`appMode.ts`, `assertAdminContext()`).
- **Base de données d'élevage** (`BirdRepository.ts`, `BreedingRepository.ts`, `HabitatRepository.ts`, etc.).
- **Moteurs métier zootechniques** (`WrightCoefficientEngine.ts`, `GeneticsEngine.ts`, `BiologicalEngine`).
- **Sauvegarde et Restauration locale** (`BackupRestoreService.ts`).

---

## 24. Remaining Findings

Aucune anomalie bloquante ou critique ne subsiste sur le périmètre Single Device.

- **Critical** : 0
- **High** : 0
- **Medium** : 0
- **Low** : 0

---

## 25. Final Verdict

# **PASS**

La cohérence commerciale, documentaire et fonctionnelle de Bird Academy Enterprise — Volière Manager (`v1.3.6-RC4`) sur le modèle **Single Device** est totale et certifiée conforme.

---
*Rapport validé par l'Agent Antigravity QA — Build BA-V1.3.6-RC4 (Code 17).*
