# LMSE-COMMERCIAL-ADMIN-CONSOLE-01 — SPÉCIFICATION ARCHITECTURALE OFFICIELLE

**Projet :** Bird Academy Enterprise  
**Module :** LMSE Commercial Admin Console & Lifecycle Management  
**Statut :** PRODUCTION-READY & OFFICIELLEMENT VALIDÉ  
**Date d'homologation :** 30 Août 2026  
**Architecture :** 100% Offline-First, Zero Cloud Dependency, Strict Bundle Isolation  

---

## 1. VISION ET OBJECTIFS DU SYSTÈME

La console commerciale d'administration LMSE (**License Management System Enterprise**) constitue le centre de commandement cryptographique et commercial officiel de **Bird Academy Enterprise**.

Elle permet aux administrateurs de piloter l'intégralité du cycle de vie des licences pour les trois éditions commerciales officielles :
1. **FREE** (Découverte & Essai)
2. **PREMIUM** (Éleveurs confirmés & Capacités étendues)
3. **PRO** (Édition Enterprise & Intelligence Aviaire complète)

---

## 2. CHAÎNE D'AUTORITÉ STRICTE

Toutes les autorisations, fonctionnalités, quotas d'IA et composants d'interface découlent de manière unidirectionnelle et déterministe de la chaîne d'autorité LMSE suivante :

```mermaid
graph TD
    A[LMSE LICENSE (ECDSA & SHA-256)] --> B[LICENSE VALIDATION (Integrity & Signature)]
    B --> C[LICENSE STATUS (Active / Expired / Suspended / Revoked / etc.)]
    C --> D[COMMERCIAL TIER (FREE / PREMIUM / PRO)]
    D --> E[CAPABILITIES (CapabilityResolver)]
    E --> F[FEATURE ACCESS (SubscriptionContext & FeatureLockedCard)]
    F --> G[UI ACCESS (Navigation, Modals, Views, Forms)]
```

### Règle d'or :
- **Aucune variable d'état ou clé de configuration externe** (ex: `localStorage.tier = "PRO"`) ne peut contourner cette chaîne.
- Si la licence est absente, altérée ou révoquée, le système retombe immédiatement et de manière sécurisée en mode **FREE** (ou suspend l'accès applicatif selon la politique de sécurité).

---

## 3. ARCHITECTURE DES COMPOSANTS ADMIN

Tous les composants de la console d'administration sont centralisés sous `src/features/licensing/admin/` et intégrés dans l'application administrative dédiée (`dist_admin/admin.html`) :

```
src/features/licensing/admin/
├── components/
│   ├── LicenseAdminDashboard.tsx      # Dashboard exécutif (KPIs, camemberts, alertes <30j)
│   ├── LicenseList.tsx                # Table interactive des licences avec actions contextuelles
│   ├── LicenseFilterBar.tsx           # Barre de recherche temps-réel, filtres de tiers & statuts
│   ├── LicenseCreateWorkflow.tsx      # Assistant guidé de création en 4 étapes
│   ├── LicenseDetailsModal.tsx        # Inspection médico-légale (Général, Appareils, Historique, Hash)
│   ├── LicenseRenewalDialog.tsx       # Boîte de dialogue d'extension de validité
│   ├── LicenseReplacementDialog.tsx   # Remplacement à chaud avec archivage REPLACED
│   ├── LicenseUpgradeDialog.tsx       # Surclassement commercial (FREE -> PREMIUM -> PRO)
│   ├── LicenseDowngradeDialog.tsx     # Rétrogradation avec garantie 0 perte de données
│   ├── LicenseSuspensionDialog.tsx    # Suspension administrative temporaire & Réactivation
│   ├── LicenseRevocationDialog.tsx    # Révocation définitive avec confirmation & motif
│   ├── LicenseExportDialog.tsx        # Export multi-formats (.lmse, QR, Markdown, brut)
│   ├── LicenseQRGenerator.tsx         # Génération de QR Code hors-ligne
│   ├── LicenseTierBadge.tsx           # Badge visuel de tiers (FREE, PREMIUM, PRO)
│   ├── LicenseStatusBadge.tsx         # Badge des 9 statuts du cycle de vie
│   └── LicenseKeyDisplay.tsx          # Formatage segmenté de clé avec copie 1-clic
├── hooks/
│   └── useCommercialLicenseAdmin.ts   # Hook maître de synchronisation et d'orchestration
├── services/
│   └── CommercialLicenseAdminService.ts # Couche de service métier 100% offline
├── types/
│   └── adminLicensing.ts              # Types TypeScript stricts pour l'administration
└── index.ts                           # Point d'export unifié
```

---

## 4. CYCLE DE VIE DES 9 STATUTS LMSE

Le moteur `LicenseLifecycleEngine` garantit la cohérence des transitions entre les 9 statuts officiels :

| Statut | Description | Transition Possible Vers |
| :--- | :--- | :--- |
| `pending_activation` | Licence générée et signée, en attente de premier couplage | `active`, `suspended`, `revoked`, `expired` |
| `active` | Licence opérationnelle et liée à au moins une empreinte matérielle | `suspended`, `revoked`, `expired`, `grace_period`, `replaced` |
| `grace_period` | Période de grâce après échéance (accès maintenu temporairement) | `active`, `expired`, `suspended`, `revoked`, `replaced` |
| `expired` | Période de validité dépassée (rétrogradation automatique FREE) | `renewed`, `replaced`, `revoked` |
| `suspended` | Suspension administrative temporaire (accès verrouillé) | `active`, `revoked`, `replaced` |
| `revoked` | Révocation définitive pour fraude ou annulation (inscrit dans la CRL) | *État terminal absolu* (aucune transition permise) |
| `replaced` | Ancienne licence archivée après émission d'une nouvelle clé | *État terminal d'archivage* |
| `renewed` | Licence renouvelée avec nouvelle période de validité | `active`, `replaced` |
| `transfer_pending` | Demande de transfert vers une nouvelle empreinte matérielle | `active`, `suspended`, `revoked` |

---

## 5. RÈGLE CRITIQUE : 0 PERTE DE DONNÉES EN CAS DE DOWNGRADE

Lors d'un downgrade de plan (ex: `PRO` vers `PREMIUM`, ou `PREMIUM` vers `FREE`), le système applique le principe d'intégrité absolue :
- **Aucune donnée d'élevage n'est supprimée ni tronquée** : oiseaux enregistrés, couples, pontes, bilans génétiques, écritures comptables et traitements vétérinaires restent physiquement intacts dans la base locale (`localStorage` / `IndexedDB`).
- Les fonctionnalités réservées au plan supérieur sont masquées ou affublées d'un verrou élégant `FeatureLockedCard` incitant à la mise à niveau.
- La boîte de dialogue de rétrogradation `LicenseDowngradeDialog` affiche expressément le label de conformité : *"Garantie Absolue de Rétention des Données"*.

---

## 6. SÉCURITÉ ET ISOLATION STRICTE DES BUNDLES

1. **Isolation Physique du Code Source :**
   - Le build utilisateur (`dist_user/`) ne contient **aucun secret de signature privé**, aucune route administrative, et aucun composant d'administration.
   - Les appels à `CryptoService.getMasterSalt()` dans le bundle utilisateur déclenchent immédiatement une exception bloquante `SECURITY_ERROR`.
2. **Audit Automatisé des Bundles :**
   - `scripts/verifyUserBundle.js` audite chaque fichier JS/CSS dans `dist_user/` pour garantir l'absence de fuites.
   - `scripts/verifyAdminBundle.js` valide l'intégrité de `dist_admin/` et de son point d'entrée `admin.html`.
3. **Fonctionnement 100% Offline :**
   - Toutes les opérations de signature, validation d'empreinte, vérification de quotas et export de licence fonctionnent sans aucune dépendance réseau (`context.setOffline(true)` validé avec 0 requête réseau externe).
