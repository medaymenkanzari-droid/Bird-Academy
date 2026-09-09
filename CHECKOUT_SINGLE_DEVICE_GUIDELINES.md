# DIRECTIVES COMMERCIALES & TECHNIQUES : POLITIQUE "SINGLE DEVICE"
## Référence d'Implémentation & Garde-fous Produit — Bird Academy Enterprise

---

### 1. PRINCIPE FONDATEUR DU MODÈLE LOCAL-FIRST

Bird Academy Enterprise est conçu sur une architecture **Local-First, Offline-First, Single-Device**.

Toutes les offres commerciales sans exception appliquent la règle stricte :
```text
maxDevices = 1
```

| Offre | Prix Officiel | Durée | Max Appareils | Synchronisation Cloud |
| :--- | :--- | :--- | :--- | :--- |
| **FREE** | 0 € | Illimitée | **1 appareil** | Non (100% Locale) |
| **PREMIUM** | 49 € / an | 365 jours | **1 appareil** | Non (100% Locale) |
| **PRO ANNUAL** | 119 € / an | 365 jours | **1 appareil** | Non (100% Locale) |
| **PRO LIFETIME** | 249 € | Permanente | **1 appareil** | Non (100% Locale) |

> [!IMPORTANT]
> Le transfert de données ou de licence entre deux ordinateurs/appareils s'effectue **exclusivement de manière manuelle** par le mécanisme de Sauvegarde et Restauration (`Backup & Restore`).
> Aucune synchronisation automatique dans le cloud n'est promise ni autorisée.

---

### 2. GARDE-FOUS D'IMPLÉMENTATION CODE ET SERVICES

#### A. Catalogue d'offres (`CommercialOffersService.ts`)
- Chaque définition d'offre doit comporter expressément :
  ```typescript
  maxDevices: 1
  ```
- Aucune mention textuelle ne doit promettre "3 postes", "5 postes" ou "multi-postes".

#### B. Fallbacks défensifs
- **Interdiction absolue** de recourir à des fallbacks historiques du type :
  ```typescript
  // INTERDIT
  const devices = offer.maxDevices || 3;
  ```
- **Règle obligatoire** :
  ```typescript
  // OBLIGATOIRE
  const devices = offer.maxDevices || 1;
  ```

#### C. Internationalisation et Affichage UI (`OrderSummaryCard.tsx`)
- Ne jamais concaténer du texte français brut (`{devices} poste(s)`) dans un parcours multilingue.
- Utiliser la clé de traduction standardisée :
  ```typescript
  t('checkout.deviceBadge')
  ```
- Valeurs traduites officielles :
  - **FR** : `1 appareil (Mono-poste)`
  - **EN** : `1 device (Single-device)`
  - **AR** : `جهاز واحد (أحادي)`
  - **ES** : `1 dispositivo (Mono-puesto)`
  - **IT** : `1 dispositivo (Mono-dispositivo)`

#### D. Autorité Serveur & Anti-Falsification (`WebOrderCheckoutService.ts`)
- Le client ne peut en aucun cas injecter `maxDevices`, `price` ou `tier`.
- Le serveur reconstruit la licence et la session de paiement uniquement à partir de `offerId` validé contre le catalogue officiel en mémoire.

#### E. Moteur Cryptographique LMSE
- Toute licence émise (`.lmse`) doit comporter :
  ```json
  "policy": {
    "maxDevices": 1,
    "allowVirtualMachine": false
  }
  ```

#### F. Documents du Kit de Livraison (`DeliveryKit`)
- `license-info.txt`, `README.txt`, `license-key.txt` doivent mentionner strictement `1 appareil (Mono-poste)`.

---

### 3. PROTOCOLE DE PURGE DE CACHE ET DÉPLOIEMENT PWA

Pour éviter que des clients ne conservent une version d'un bundle antérieur affichant une ancienne configuration :

1. **Versionnage du Service Worker** :
   - Chaque release doit incrémenter le `buildId` et la configuration Workbox afin de forcer `skipWaiting()` et la purge des anciens assets.
2. **Purge CDN & Cache Hébergeur** :
   - Après chaque déploiement sur Render ou Cloudflare, vider le cache applicatif pour servir immédiatement les nouveaux chunks JS.
3. **Réinitialisation Locale Client** :
   - Si un utilisateur signale un affichage incohérent, lui faire exécuter un rechargement forcé (`Ctrl + F5` ou `Cmd + Shift + R`) pour rafraîchir le Service Worker.
