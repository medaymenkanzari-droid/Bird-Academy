# Notes de Version — Bird Academy Enterprise v1.3.6-RC5

## Identité de la Release
- **Release :** v1.3.6-RC5
- **Build ID :** BA-V1.3.6-RC5
- **Build Code :** 18
- **Commit de Référence RC4 :** 8b8736380bd7580676af689f59ade38a42093095
- **Statut :** FROZEN (Candidate Requalifiée)
- **Invariants Obligatoires :**
  - PAYMENT LIVE = DISABLED
  - PUBLIC COMMERCIAL SALES = CLOSED
  - RC4 = IMMUTABLE
  - 100% OFFLINE-FIRST & SINGLE DEVICE

## Correctifs Apportés
1. **Requalification Single Device :**
   - Élimination complète de la mention contradictoire "3 poste(s)".
   - Suppression des fallbacks `|| 3` et remplacement par `|| 1` dans Parametres.tsx et CommercialLicenseAdminService.ts.
   - Ajout de la clé `deviceBadge` dans les 5 dictionnaires (`fr.ts`, `en.ts`, `ar.ts`, `es.ts`, `it.ts`).
   - Alignement parfait du panier OrderSummaryCard, CheckoutWizard, WebOrderCheckoutService et du kit de livraison.
2. **Sécurité & Données d'Élevage :**
   - Zéro fuite de données avicoles ou génétiques dans les flux de commande (Firewall `filterBreedingData`).
   - Cryptographie LMSE intacte (ECDSA P-256 + SHA-256).
   - Zéro secret de production dans les bundles.
