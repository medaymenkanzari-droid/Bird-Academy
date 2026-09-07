# BIRD ACADEMY ENTERPRISE — COMMERCIAL WEBSITE PLATFORM
## Spécification Technique, Architecture & Documentation Officielle
**Document :** `BIRD-ACADEMY-COMMERCIAL-WEBSITE-PLATFORM-01.md`  
**Version :** 1.3.6-RC4  
**Date :** 30 Août 2026  
**Auteur :** Lead Developer + Software Architect + QA & Security Engineer  
**Statut :** VALIDÉ & CERTIFIÉ  

---

## 1. Executive Summary

Le projet **Bird Academy Enterprise** s'enrichit d'une plateforme web commerciale officielle, accessible publiquement, permettant aux éleveurs amateurs, semi-professionnels, professionnels et centres vétérinaires de :
1. Découvrir l'ensemble des fonctionnalités de la solution avicole d'excellence.
2. Consulter le catalogue des offres commerciales avec affichage multi-devises (EUR, TND, USD, DZD, MAD, GBP).
3. Commander en ligne de manière souveraine avec génération instantanée du kit de livraison de licence chiffré LMSE en 5 fichiers.
4. Télécharger les exécutables certifiés (Windows Installateur, Windows Portable, Android APK, Guide Propriétaire PDF).
5. Vérifier l'intégrité cryptographique des fichiers téléchargés via empreintes SHA-256.
6. Bénéficier d'une interface multilingue intégrale (Français, Anglais, Arabe avec RTL dynamique et police Cairo, Espagnol, Italien).

La plateforme respecte strictement le principe de **Souveraineté des Données** : aucune donnée privée d'élevage n'est accessible depuis le site commercial, et aucun secret ou clé privée de signature n'est exposé.

---

## 2. État Réel du Dépôt & Architecture

L'architecture globale de Bird Academy Enterprise repose sur :
- **Application Utilisateur / Éleveur :** Gestion complète de l'élevage (oiseaux, cages, pontes, santé, génétique, consanguinité de Wright, bilans financiers, intelligence avicole).
- **Application Commerciale & Administrative LMSE :** Gestion des licences cryptographiques ECDSA / SHA-256, catalogue d'offres, clients, commandes, traçabilité et révocation.
- **Site Web Commercial :** Point d'entrée public autonome (`src/features/commercial-website`), intégré au routage tout en maintenant une isolation absolue des données privées.

---

## 3. Architecture du Site Web Commercial & Routage

Le site web commercial est implémenté sous `src/features/commercial-website/` avec les modules suivants :
- `components/layout/` : En-tête (`WebHeader`), Pied de page (`WebFooter`), Sélecteur de langue (`LanguageSelector`), Sélecteur de devise (`CurrencySelector`).
- `components/sections/` : 20 sections riches (Hero, Problème/Solution, 8 fonctionnalités, Moteur Bird Intelligence, Simulateur IA Local, Tarifs, Matrice comparative, Architecture LMSE, FAQ, Support, Téléchargement).
- `components/checkout/` : Tunnel d'achat en 5 étapes (`CheckoutWizard`), Téléchargeur de kit (`DeliveryKitDownloader`), Récapitulatif (`OrderSummaryCard`).
- `pages/` : `WebHomePage`, `WebProductsPage`, `WebProductDetailPage`, `WebPricingPage`, `WebCheckoutPage`, `WebOrderConfirmationPage`, `WebDownloadCenterPage`, `WebLicenseGuidePage`, `WebFaqPage`, `WebSupportPage`, `WebAccountPage`.
- `services/` : `WebOrderCheckoutService`, `PaymentProvider`, `WebDownloadService`.
- `i18n/` : Dictionnaires FR, EN, AR, ES, IT et moteur RTL.

Le routage est activé via :
- Les paramètres d'URL `?view=website` ou `?mode=website`.
- Les routes hash : `#home`, `#products`, `#product-free`, `#product-premium`, `#product-pro`, `#pricing`, `#checkout`, `#download`, `#license`, `#faq`, `#support`, `#account`, `#order-confirmation`.
- L'écran d'activation au premier lancement (`FirstLaunchActivationScreen.tsx`), qui offre un lien direct vers la boutique commerciale.

---

## 4. Catalogue Commercial & Moteur Multi-Devises

Le catalogue officiel est structuré en 4 offres standardisées :

| ID Offre | Nom Commercial | Palier | Type Licence | Durée | Prix (EUR) | Appareils | Quota IA / Jour |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `OFFER-FREE-COMMUNITY` | Bird Academy Community | **FREE** | Temporaire | 30 jours | 0.00 € | 1 | 10 req/j |
| `OFFER-PREMIUM-ANNUAL-2026` | Bird Academy Passion | **PREMIUM** | Commerciale | 365 jours | 49.00 € | 3 | 100 req/j |
| `OFFER-PRO-ENTERPRISE-ANNUAL-2026` | Bird Academy Enterprise | **PRO** | Entreprise | 365 jours | 119.00 € | 5 | Illimité |
| `OFFER-PRO-ENTERPRISE-LIFETIME` | Bird Academy Enterprise (À vie) | **PRO** | Permanente | Illimitée | 249.00 € | 5 | Illimité |

### Devises Supportées
- **EUR (€)** : Devise de référence.
- **TND (DT)** : Dinar Tunisien (taux indicatif 3.35).
- **USD ($)** : Dollar Américain (taux indicatif 1.08).
- **DZD (DA)** : Dinar Algérien (taux indicatif 145.0).
- **MAD (DH)** : Dirham Marocain (taux indicatif 10.9).
- **GBP (£)** : Livre Sterling (taux indicatif 0.85).

---

## 5. Matrice des Fonctionnalités par Palier

| Fonctionnalité / Capacité | FREE (Gratuit) | PREMIUM (Passion) | PRO (Enterprise) |
| :--- | :---: | :---: | :---: |
| **Limite d'oiseaux** | Max 20 | Illimité | Illimité |
| **Gestion cages & habitats** | Base | Avancée | Multi-bâtiments |
| **Registre de reproduction** | Standard | Avancé + alertes | Prédictif complet |
| **Consanguinité de Wright** | ❌ Non | ✅ Standard | ✅ Arbre infini |
| **Santé & Traitements** | Fiche individuelle | Traitements par lot | Alertes intelligentes |
| **Bilans Financiers** | Vue simple | Rapports complets | Export comptable PRO |
| **Moteur Bird Intelligence** | ❌ Non | Fiches diagnostiques | Moteur d'analyse complet |
| **Assistant IA Avicole** | 10 req/jour | 100 req/jour | **Illimité 100% Offline** |
| **Exports & Rapports** | Écran | PDF standards | PDF / CSV / QR Code PRO |
| **Nombre d'appareils** | 1 | 3 | 5 |

---

## 6. Modèle de Livraison Offline & Invariants de Sécurité

1. **Génération Déterministe :** Lors de la confirmation de commande, la licence est signée numériquement et assemblée dans un kit complet.
2. **5 Fichiers Officiers Livrés :**
   - `license_<id>.lmse` : Licence cryptographique au format JSON officiel.
   - `license-key.txt` : Clé d'activation officielle au format `LMSE-XXXX-XXXX-XXXX-XXXX` avec instructions.
   - `license-qr.txt` : Charge utile compacte pour activation instantanée par QR code hors-ligne.
   - `license-info.txt` : Fiche technique complète (titulaire, plan, empreinte SHA-256, date d'émission).
   - `README.txt` : Guide de démarrage rapide étape par étape.
3. **Zéro Donnée Privée :** Aucune base d'oiseaux, de cages ou de pontes n'est interrogée ni injectée.

---

## 7. Chaîne d'Autorité Cryptographique LMSE

La hiérarchie de contrôle et de sécurité respecte scrupuleusement la chaîne :
```
LMSE LICENSE (Signature ECDSA + SHA-256)
  ↓
LICENSE VALIDATION (Vérification cryptographique locale)
  ↓
LICENSE STATUS (Active / Expired / Suspended / Revoked)
  ↓
COMMERCIAL TIER (FREE / PREMIUM / PRO)
  ↓
CAPABILITIES (Liste granulaire de permissions)
  ↓
FEATURE ACCESS (Déblocage des modules applicatifs)
  ↓
UI ACCESS (Affichage des interfaces correspondantes)
```

---

## 8. Moteur de Commande & Traitement Web

Le service `WebOrderCheckoutService` orchestre :
1. La validation rigoureuse des coordonnées client (nom, email RFC 5322, pays, notes).
2. La déduplication et liaison automatique au profil client.
3. La création de la commande `ORD-XXXXXX-XXXX` au statut `PENDING`.
4. Le traitement via la couche de paiement sélectionnée.
5. Le passage au statut `PAID`.
6. L'exécution de la commande via `CommercialOperationsService.fulfillOrder()`.
7. L'assemblage du package de livraison via `LicenseDeliveryPackageGenerator`.

---

## 9. Couche d'Abstraction des Paiements

Architecture extensible (`PaymentProvider.ts`) comportant :
1. `DemoPaymentProvider` : Simulateur instantané avec génération d'identifiant de transaction `tx_demo_...`, explicitement identifié comme mode d'évaluation.
2. `StripePaymentProviderStub` : Provider prêt pour l'intégration carte bancaire internationale.
3. `TunisianPaymentProviderStub` : Provider prêt pour les solutions locales tunisiennes (Flouci, D17, Konnect, Virement bancaire).

---

## 10. Moteur International i18n & RTL Arabe

- **5 Langues Intégrales :** Français (`fr`), Anglais (`en`), Arabe (`ar`), Espagnol (`es`), Italien (`it`).
- **Support RTL Arabe Dynamique :**
  - Application automatique de l'attribut `dir="rtl"` sur la balise `<html>`.
  - Application de la classe typographique `font-arabic` utilisant la police Google Fonts **Cairo**.
  - Inversion fluide des icônes de direction (flèches, chevrons).
- **Persistance :** Sauvegarde automatique dans `localStorage` (`bird_academy_web_locale`).

---

## 11. Interface Utilisateur & Tunnel d'Achat

Le composant `CheckoutWizard.tsx` guide l'utilisateur à travers 5 étapes claires :
- **Étape 1 :** Sélection de l'offre (FREE / PREMIUM / PRO Annuel / PRO À vie).
- **Étape 2 :** Coordonnées client (Nom/Raison sociale, Email, Pays, Notes).
- **Étape 3 :** Récapitulatif et validation financière.
- **Étape 4 :** Choix et simulation du moyen de paiement.
- **Étape 5 :** Confirmation de commande, affichage de la clé de licence avec bouton de copie, et téléchargement du kit de livraison (individuel ou archive complète).

---

## 12. Centre de Téléchargement & Empreintes SHA-256

Le service `WebDownloadService` recense les artefacts officiels :

| Fichier | Plateforme | Version | Taille | Empreinte SHA-256 Officielle |
| :--- | :--- | :--- | :--- | :--- |
| `Bird-Academy-User-Windows-Setup.exe` | Windows 10/11 | 1.3.6-RC4 | 111.88 MB | `9A7E146B832BDD28B3A4F1388ECBCA8F2C74B16F01A4E544DA544E6A7A6DB7DE` |
| `Bird-Academy-User.exe` | Windows Portable | 1.3.6-RC4 | 111.24 MB | `7CDCFCC0CEBE34FE835DF0567C794DBF2DCF02EDEF8CF6495E402D157F3A96C1` |
| `Bird-Academy-User.apk` | Android 8.0+ | 1.3.6-RC4 | 4.95 MB | `6DB56AE55CC7109E962386E0886C6A04443F86847ED696FBEAC4566F6A6E0E68` |
| `LMSE_OWNER_GUIDE.pdf` | Documentation | 1.3.6-RC4 | 1.25 MB | `27BDDCA7FE1CEEBC5EC9640FEA92BE2BCBFF5EB9D89FD579C3946E65715264EF` |

---

## 13. Résultats des Tests & Assurance Qualité

### Tests Unitaires (`tests/commercial/commercial-website-platform-01.test.ts`)
- **Total Tests :** 62
- **Passés :** 62 (100%)
- **Échecs :** 0
- **Suites :** 8 (Catalogue, Capacités, Tunnel de commande, Paiements, Kit de livraison, i18n/RTL, Téléchargements & Sécurité).

### Tests Playwright E2E (`tests/e2e/commercial-website-platform-01.spec.ts`)
- **Total Scénarios :** 85 tests de bout en bout couvrant `WEB-001` à `WEB-085`.
- **Couverture :** 100% des parcours utilisateur (Landing, Produits, Tarifs, Tunnel d'achat, Téléchargement, i18n, Espace client, Support, FAQ, Responsive).

### Suite Complète du Dépôt (`npm test`)
- **Total Tests :** 752
- **Suites :** 58
- **Passés :** 752 (100% PASS)
- **Régression :** 0

### Compilation TypeScript
- Commande : `npx tsc --noEmit`
- **Résultat :** Code de sortie 0, **0 erreur**.

### Audits de Bundles
- `npm run verify:user-bundle` : **PASS** (Zero administrative leak).
- `npm run verify:admin-bundle` : **PASS** (Admin build valid & ready).

---

## 14. Validation & Approbation

La plateforme commerciale web **Bird Academy Enterprise** satisfait à 100% des exigences fonctionnelles, ergonomiques, architecturales et de sécurité définies dans le cahier des charges.
