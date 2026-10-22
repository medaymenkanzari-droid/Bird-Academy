# RAPPORT DE MISSION — BIOLOGICAL REFERENCE V2
# GAP-16 : UI BADGES & SECONDARY DISPLAY CLEANUP

**Date :** 2026-10-22  
**Mission :** GAP-16 (Correctif issu de l'audit GAP-14, suite à GAP-15)  
**Auteur :** Antigravity AI Pair Programmer  

---

## 1. STATUT FINAL

`BIO_REF_V2_GAP16_UI_BADGES_SECONDARY_DISPLAY_CLEANUP_COMPLETED`

Tous les fallbacks Canary résiduels dans l'affichage, les badges d'identité et les agrégations statistiques secondaires (GAP14-ANO-05 à GAP14-ANO-08) ont été éradiqués sans modifier aucune règle biologique, génétique ou scientifique. L'identifiant de la Colombe diamant a été canonicalisé sur `colombe_diamant` de manière déterministe et rétrocompatible.

---

## 2. FICHIERS MODIFIÉS

| Fichier | Nature de la modification | Anomalie(s) traitée(s) |
|---|---|---|
| `src/components/ReferenceBiologique.tsx` | Suppression des fallbacks `activeSpeciesIds[0] \|\| 'canari'` et `BIOLOGICAL_SPECIES_REGISTRY[0]`. État neutre guidé lorsque aucune espèce n'est active. | GAP14-ANO-05 |
| `src/features/birds/components/BirdHeroPassportCard.tsx` | Remplacement de `resolvedSpeciesId \|\| 'canari'` par `resolvedSpeciesId`. Badge neutre "Indéterminé". | GAP14-ANO-06 |
| `src/features/birds/components/BirdPassportProgressiveSummaryCard.tsx` | Remplacement de `bird.espece \|\| 'canari'` par `bird.espece`. Badge neutre "Indéterminé". | GAP14-ANO-06 |
| `src/features/analytics/services/DashboardStatisticsService.ts` | Suppression du fallback `bird.espece?.trim() \|\| 'canari'` et de l'événement `'Canari'`. Regroupement sous `Non spécifiée`. | GAP14-ANO-07 |
| `src/features/analytics/engines/AnalyticsEngine.ts` | Suppression du fallback `b.espece \|\| 'Canari'` et `b.race \|\| 'Canari de couleur'`. Regroupement sous `Non spécifiée`. | GAP14-ANO-07 |
| `src/data/speciesRegistry.ts` | Canonicalisation de l'id Colombe diamant en `colombe_diamant`. Alias `colombe` rétrocompatible dans `getSpeciesById` et migration déterministe dans `migrateBirdTaxonomy`. | GAP14-ANO-08 |
| `src/features/species/services/SpeciesProfileService.ts` | Prise en compte de l'alias `colombe` dans `isSpeciesActive` pour compatibilité totale avec les anciens enregistrements. | GAP14-ANO-08 |
| `QA_ARTIFACTS/HUMAN_REVIEW_REQUIRED_MASTER_REGISTRY.md` | Mise à jour du registre maître HRR-03 avec documentation technique GAP-16. | Traçabilité QA |
| `tests/bio-ref-v2-gap16.test.ts` | Création de la suite de tests dédiée GAP-16 (11 tests unitaires et d'intégration). | Validation QA |

---

## 3. TRAITEMENT DÉTAILLÉ DES ANOMALIES (GAP14-ANO-05 À GAP14-ANO-08)

### GAP14-ANO-05 — ReferenceBiologique.tsx
- **Problème :** En l'absence d'espèce active dans le profil utilisateur, le composant sélectionnait automatiquement le Canari (`activeSpeciesIds[0] || 'canari'`) ou s'appuyait sur le premier élément du registre biologique (`BIOLOGICAL_SPECIES_REGISTRY[0]`), forçant l'affichage du Canari.
- **Correction :** 
  - `selectedSpeciesId` est initialisé à `activeSpeciesIds[0] || ''`.
  - `selectedProfile` n'a plus de fallback `BIOLOGICAL_SPECIES_REGISTRY[0]`.
  - Si `!selectedProfile`, un écran neutre élégant s'affiche avec le message clair *"Aucune espèce active sélectionnée"* et un bouton d'action pour explorer le catalogue mondial complet.
  - Si une espèce active existe, elle est fidèlement sélectionnée. Si l'utilisateur clique explicitement sur une espèce (via le sélecteur desktop ou mobile), son profil biologique est affiché.

### GAP14-ANO-06 — Bird Passport
- **Problème :** `BirdHeroPassportCard.tsx` utilisait `<SpeciesBadge speciesId={resolvedSpeciesId || 'canari'} size="sm" />` et `BirdPassportProgressiveSummaryCard.tsx` utilisait `<SpeciesBadge speciesId={bird.espece || 'canari'} size="sm" />`. Tout oiseau sans espèce se voyait attribuer un badge jaune "Canari".
- **Correction :**
  - Dans les deux composants, la valeur brute (`resolvedSpeciesId` et `bird.espece`) est transmise directement au `SpeciesBadge`.
  - `SpeciesBadge` exploitait déjà nativement le thème fallback gris/ardoise et `t('undetermined')` ("Indéterminé").
  - Aucun oiseau sans espèce ne porte de badge Canary artificiel.

### GAP14-ANO-07 — Analytics (DashboardStatisticsService & AnalyticsEngine)
- **Problème :** `DashboardStatisticsService.ts` agrégait les oiseaux avec `bird.espece?.trim() || 'canari'` et décrivait les récents ajouts avec `${b.espece || 'Canari'}`. De même, `AnalyticsEngine.ts` regroupait les espèces sous `b.espece || 'Canari'` et les races sous `b.race || 'Canari de couleur'`. Les oiseaux sans espèce gonflaient artificiellement la démographie Canary.
- **Correction :**
  - Les oiseaux dont l'espèce est absente, vide, `UNKNOWN` ou `indéterminée` sont agrégés sous le libellé neutre `Non spécifiée`.
  - Les oiseaux avec race absente sont regroupés sous `Non spécifiée` au lieu de `Canari de couleur`.
  - La population Canary est calculée strictement à partir des oiseaux dont l'espèce est explicitement `canari`.

### GAP14-ANO-08 — Canonicalisation Colombe diamant
- **Problème :** Dans `src/data/speciesRegistry.ts`, l'entrée portait l'identifiant legacy `id: 'colombe'`, créant une divergence avec le registre biologique (`BIOLOGICAL_SPECIES_REGISTRY`) où la Colombe diamant est identifiée canoniquement par `colombe_diamant`.
- **Correction :**
  - Dans `SPECIES_REGISTRY`, l'entrée canonique est scellée avec `id: 'colombe_diamant'`.
  - Rétrocompatibilité totale : `getSpeciesById('colombe')` et `getSpeciesById('colombe-diamant')` résolvent déterministement l'entrée `colombe_diamant`.
  - Migration idempotente : `migrateBirdTaxonomy` convertit `espece: 'colombe'` en `espece: 'colombe_diamant'`. Un oiseau déjà migré reste inchangé.
  - Aucun second profil en doublon n'a été créé.

---

## 4. COMPORTEMENT AVANT / APRÈS

| Contexte | Comportement AVANT GAP-16 | Comportement APRÈS GAP-16 |
|---|---|---|
| **Référentiel biologique sans espèce active** | Affichage automatique forcé de la fiche Canari | État neutre propre avec invitation à sélectionner ou afficher le catalogue |
| **Bird Hero Passport (oiseau sans espèce)** | Badge 🐤 Canari | Badge neutre 🦅 Indéterminé |
| **Bird Passport Résumé (oiseau sans espèce)** | Badge 🐤 Canari | Badge neutre 🦅 Indéterminé |
| **Ventilation démographique (oiseau sans espèce)** | Comptabilisé comme Canari | Ventilateur sous le groupe neutre `Non spécifiée` |
| **Description d'événement récent d'oiseau sans espèce** | `"Canari • Mâle"` | `"Non spécifiée • Mâle"` |
| **Ventilation AnalyticsEngine par race** | Race inconnue forcée en `Canari de couleur` | Race inconnue ventilée en `Non spécifiée` |
| **ID espèce Colombe dans `SPECIES_REGISTRY`** | `colombe` (divergence avec bio registry) | `colombe_diamant` (alignement canonique universel) |
| **Oiseau legacy avec `espece: 'colombe'`** | Risque de non reconnaissance | Résolu via alias et migré en `colombe_diamant` |

---

## 5. STRATÉGIE UNKNOWN / INDÉTERMINÉ

1. **Non-extrapolation :** Aucune valeur par défaut n'est injectée lorsque l'espèce d'un oiseau ou d'un géniteur est inconnue.
2. **Affichage neutre :**
   - Composants UI : thème ardoise/neutre (`theme.fallback`), icône neutre, libellé `t('undetermined')` ("Indéterminé" / "Undetermined" / "غير محدد" / "Indeterminado" / "Indeterminato").
   - Agrégations statistiques : groupe `Non spécifiée` distinct, préservant l'exactitude des effectifs des espèces documentées.
3. **Persistance intacte :** Les données persistées ne subissent aucune mutation arbitraire (UNKNOWN reste UNKNOWN).

---

## 6. STRATÉGIE LEGACY `colombe` → `colombe_diamant`

1. **Point d'entrée canonique :** L'unique entrée dans `SPECIES_REGISTRY` et `BIOLOGICAL_SPECIES_REGISTRY` possède la clé `colombe_diamant`.
2. **Rétrocompatibilité :**
   - `getSpeciesById('colombe')` → renvoie la fiche canonique `colombe_diamant`.
   - `getBiologicalProfileById('colombe')` → renvoie le profil biologique `colombe_diamant`.
   - `SpeciesProfileService.isSpeciesActive('colombe')` → vérifie si `colombe_diamant` ou `colombe` est actif.
3. **Migration déterministe et idempotente :**
   - `migrateBirdTaxonomy` : `bird.espece === 'colombe'` est transformé en `colombe_diamant`.
   - Rejouer la migration sur un enregistrement déjà migré ne produit aucune modification supplémentaire.

---

## 7. RAPPORTS DE TESTS

### A. Unit & Integration (`bio-ref-v2-gap16.test.ts`)
- **Fichier de test :** `tests/bio-ref-v2-gap16.test.ts`
- **Résultat :** **11/11 tests PASS** (0 échec, durée : ~252 ms)
  1. `GAP16-01` : ReferenceBiologique ne contient plus `activeSpeciesIds[0] || 'canari'` ni `BIOLOGICAL_SPECIES_REGISTRY[0]`.
  2. `GAP16-02` : Scoping ReferenceBiologique neutre quand aucune espèce n'est configurée.
  3. `GAP16-03` : Espèce active Colombe résolue en `colombe_diamant`.
  4. `GAP16-04` : Passeport oiseau ne contient aucun fallback d'affichage Canary.
  5. `GAP16-05` : `SPECIES_REGISTRY` a pour identifiant canonique `colombe_diamant`, alias legacy `colombe` préservé, aucun doublon.
  6. `GAP16-06` : `migrateBirdTaxonomy` migre déterministement et de manière idempotente `colombe` en `colombe_diamant`.
  7. `GAP16-07` : `DashboardStatisticsService` regroupe les oiseaux sans espèce sous `Non spécifiée` sans gonfler le Canari.
  8. `GAP16-08` : Événements récents affichent `Non spécifiée` au lieu de `Canari`.
  9. `GAP16-09` : `AnalyticsEngine` regroupe espèces et races inconnues sous `Non spécifiée`.
  10. `GAP16-10` : Invariances biologiques et scientifiques préservées (incubation 13j, 10 profils dans le registre).
  11. `GAP16-11` : Zéro nouveau fallback Canary introduit dans les cibles modifiées.

### B. Non-Régression Suite Bio-Ref V2
- **Commandes exécutées :**
  - `tests/bio-ref-v2-gap15.test.ts` (10 tests) → **PASS**
  - `tests/colombe-diamant-profile.test.ts` (10 tests) → **PASS**
  - `tests/species-profile-scoping.test.ts` (18 tests) → **PASS**
  - `tests/species-taxonomy-sanity.test.ts` (18 tests) → **PASS**
  - `tests/v197-dashboard-statistics-ux.test.ts` (30 tests) → **PASS**
  - `tests/b015-analytics-dashboards-intelligence.test.ts` (50 tests) → **PASS**
  - `tests/bug07-mobile-overflow.test.ts` & `tests/mobile-overflow-audit-v136.test.ts` (29 tests) → **PASS**
- **Total combiné :** **176 tests PASS, 0 régression.**

### C. Playwright E2E
- **Tests exécutés :**
  - `tests/e2e/bibliographic-multi-species-registry.spec.ts` (10 tests)
  - `tests/e2e/bird-passport-v193-progressive.spec.ts` (3 tests)
  - `tests/e2e/v197-dashboard-statistics-ux.spec.ts` (6 tests)
- **Résultat :** **19 passed (1.0m), 0 échec.**

### D. TypeScript / Static
- **Commande :** `npx tsc --noEmit`
- **Résultat :** **PASS (Code 0, 0 erreur de typage).**

### E. Build Production
- **Commande :** `npm run build`
- **Résultat :** **PASS (Vite v6.4.3, 3102 modules transformés en 6.20s, PWA bundles OK).**

---

## 8. INVARIANCE SCIENTIFIQUE & GOUVERNANCE

- **GeneticsEngine :** Inchangé (aucun calcul génétique altéré).
- **CanaryCrossEngine & CanaryCrossBridge :** Inchangés.
- **Catalogues génétiques :** Inchangés.
- **Profils biologiques homologués :** Inchangés (poids, ponte, incubation, maturité strictement conformes).
- **GAP-12 Colombe :** Intact (incubation 13j, 2 œufs, double standard de bagues 3.5 / 3.8 mm, statut draft préservé).
- **HUMAN_REVIEW_REQUIRED :** Aucun HRR scientifique n'a été fermé. Seul le registre maître HRR-03 a été mis à jour pour documenter les résolutions techniques GAP-16.

---

## 9. ÉTAT GIT

### Fichiers modifiés :
```text
M src/components/ReferenceBiologique.tsx
M src/features/birds/components/BirdHeroPassportCard.tsx
M src/features/birds/components/BirdPassportProgressiveSummaryCard.tsx
M src/features/analytics/services/DashboardStatisticsService.ts
M src/features/analytics/engines/AnalyticsEngine.ts
M src/data/speciesRegistry.ts
M src/features/species/services/SpeciesProfileService.ts
M QA_ARTIFACTS/HUMAN_REVIEW_REQUIRED_MASTER_REGISTRY.md
?? tests/bio-ref-v2-gap16.test.ts
?? QA_ARTIFACTS/BIO_REF_V2_GAP16_UI_BADGES_SECONDARY_DISPLAY_CLEANUP.md
```

### Commit local à effectuer :
```bash
git add src/components/ReferenceBiologique.tsx src/features/birds/components/BirdHeroPassportCard.tsx src/features/birds/components/BirdPassportProgressiveSummaryCard.tsx src/features/analytics/services/DashboardStatisticsService.ts src/features/analytics/engines/AnalyticsEngine.ts src/data/speciesRegistry.ts src/features/species/services/SpeciesProfileService.ts QA_ARTIFACTS/HUMAN_REVIEW_REQUIRED_MASTER_REGISTRY.md QA_ARTIFACTS/BIO_REF_V2_GAP16_UI_BADGES_SECONDARY_DISPLAY_CLEANUP.md tests/bio-ref-v2-gap16.test.ts
git commit -m "fix(bio-ref-v2): remove Canary display fallbacks"
```

---

## 10. CRITÈRE DE CLÔTURE & ARRÊT STRICT

- [x] GAP14-ANO-05 corrigé (ReferenceBiologique neutre, zéro Canary forcé)
- [x] GAP14-ANO-06 corrigé (Bird Passport sans badge Canary pour oiseaux sans espèce)
- [x] GAP14-ANO-07 corrigé (Analytics groupe neutre 'Non spécifiée', compteur Canary intègre)
- [x] GAP14-ANO-08 corrigé (`colombe_diamant` canonique, `colombe` alias/migration)
- [x] Tests unitaires & intégration PASS (11/11)
- [x] Tests Playwright E2E PASS (19/19)
- [x] TypeScript `tsc --noEmit` PASS (0 erreur)
- [x] Build `npm run build` PASS
- [x] Aucune règle scientifique modifiée
- [x] Arrêt strict à la fin de GAP-16 (GAP-17 non démarré).
