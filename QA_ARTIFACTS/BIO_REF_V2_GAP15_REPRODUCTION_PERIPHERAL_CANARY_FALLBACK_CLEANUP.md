# Rapport Final — Biological Reference V2
## GAP-15 — Reproduction Peripheral Canary Fallback Cleanup

**Statut Final :** `BIO_REF_V2_GAP15_REPRODUCTION_PERIPHERAL_CANARY_FALLBACK_CLEANUP_COMPLETED`  
**Date :** 2026-10-22  
**Auteur :** Antigravity AI  
**Branche :** `master`  
**Périmètre :** Éradication ciblée des fallbacks Canary résiduels dans les périphériques de reproduction (GAP14-ANO-01 à GAP14-ANO-04)  

---

## 1. Statut Final

La mission corrective **GAP-15** a été exécutée avec succès dans le respect strict des contraintes scientifiques et sans altération des moteurs protégés (`GeneticsEngine`, `CanaryCrossEngine`, catalogues canoniques, profils d'espèces homologués).

- **GAP14-ANO-01 (WeaningService) :** CORRIGÉ
- **GAP14-ANO-02 (BandingBatchModal) :** CORRIGÉ
- **GAP14-ANO-03 (HatchEggModal) :** CORRIGÉ
- **GAP14-ANO-04 (NurseryService) :** CORRIGÉ
- **Statut épistémique UNKNOWN / Indéterminé :** Strictement préservé (aucun fallback vers Canary)
- **Comportement Canary explicite :** 100% opérationnel et préservé
- **Suite de tests dédiée GAP-15 :** 10/10 PASS
- **Tests de non-régression Bio-Ref V2 :** 144/144 PASS
- **Tests E2E Playwright reproduction :** 3/3 PASS
- **Contrôle TypeScript (`tsc --noEmit`) :** PASS (zéro erreur)
- **Production Build (`vite build`) :** PASS (32.46s, zéro erreur)

---

## 2. Fichiers Modifiés

| Fichier | Nature de l'ajustement |
|---|---|
| `src/features/reproduction/weaning/services/WeaningService.ts` | Éradication des 6 constantes Canary en dur lors de la promotion d'un poussin sevré sans espèce parentale connue. |
| `src/features/breeding/components/BandingBatchModal.tsx` | Éradication du fallback `sire?.espece \|\| dam?.espece \|\| 'canari'` et des phénotypes Canary en dur (`Lipochrome`, `Jaune`, `Intensif`). |
| `src/features/reproduction/hatching/components/HatchEggModal.tsx` | Résolution de l'espèce via œuf → ponte → couple → parents. Conditionnement strict du pré-remplissage 1.5g à `eggSpecies === 'canari'`. Champ vide et placeholder neutre sinon. |
| `src/features/reproduction/nursery/services/NurseryService.ts` | Résolution de l'espèce du poussin via le couple. Restriction stricte de la courbe logistique 18g aux canaris. Pour toute autre espèce ou espèce inconnue, `expectedWeight = 0` (données observées uniquement). |
| `src/business/BirdEngine.ts` | Ajustement direct consommateur (Section 3 de la mission) : reconnaissance de `UNKNOWN`, `Indéterminé` et des espèces canoniques dans `validateSpecies` ; validation conditionnelle des races/catégories/couleurs uniquement lorsque l'espèce est connue. |
| `tests/bio-ref-v2-gap15.test.ts` | Nouvelle suite de tests unitaires et d'intégration couvrant les 10 scénarios obligatoires de la mission. |
| `QA_ARTIFACTS/HUMAN_REVIEW_REQUIRED_MASTER_REGISTRY.md` | Mise à jour de l'entrée `HRR-03` et de sa section détaillée avec les 4 remédiations périphériques GAP-15. |

---

## 3. Détail des Anomalies Corrigées (GAP14-ANO-01 à GAP14-ANO-04)

### GAP14-ANO-01 — WeaningService.ts
- **Composant :** `src/features/reproduction/weaning/services/WeaningService.ts` (`promoteToIndependentBird`)
- **Comportement AVANT :**
  ```ts
  species = fatherBird?.espece || motherBird?.espece || 'canari';
  category = fatherBird?.categorie || motherBird?.categorie || 'canari_couleur';
  breed = fatherBird?.race || motherBird?.race || 'Canari de Couleur';
  mutation = fatherBird?.mutation || motherBird?.mutation || 'Classique';
  baseColor = fatherBird?.couleur_base || motherBird?.couleur_base || 'Jaune';
  factor = fatherBird?.facteur || motherBird?.facteur || 'Intense';
  ```
  Un poussin issu de parents sans espèce devenait automatiquement un `Canari de Couleur Lipochrome Jaune Intense`.
- **Comportement APRÈS :**
  ```ts
  species = fatherBird?.espece || motherBird?.espece || undefined;
  const primaryParent = fatherBird || motherBird;
  if (primaryParent) {
    category = primaryParent.categorie || '';
    breed = primaryParent.race || '';
    mutation = primaryParent.mutation || '';
    baseColor = primaryParent.couleur_base || '';
    factor = primaryParent.facteur || '';
  }
  ```
  Si les parents ont une espèce connue, elle est fidèlement propagée. Si les parents n'ont pas d'espèce ou si le couple est inconnu, l'espèce reste `undefined` (ou `UNKNOWN`), la race/catégorie reste vide sans invention de phénotype Canary.

---

### GAP14-ANO-02 — BandingBatchModal.tsx
- **Composant :** `src/features/breeding/components/BandingBatchModal.tsx` (`initialEntries` et `handleSubmit`)
- **Comportement AVANT :**
  ```ts
  espece: sire?.espece || dam?.espece || 'canari',
  categorie: sire?.categorie || dam?.categorie || 'canari_couleur',
  race: sire?.race || dam?.race || 'Lipochrome',
  couleur_base: sire?.couleur_base || dam?.couleur_base || 'Jaune',
  facteur: sire?.facteur || dam?.facteur || 'Intensif',
  ```
- **Comportement APRÈS :**
  ```ts
  const parentSpecies = sire?.espece || dam?.espece || undefined;
  const parentCategory = sire?.categorie || dam?.categorie || '';
  const parentRace = sire?.race || dam?.race || '';
  const parentBaseColor = sire?.couleur_base || dam?.couleur_base || '';
  const parentFactor = sire?.facteur || dam?.facteur || '';
  const fallbackNamePrefix = parentRace || parentSpecies || (currentLanguage === 'ar' ? 'طائر' : currentLanguage === 'en' ? 'Bird' : 'Oiseau');
  
  const newBird: Omit<Canari, 'id'> = {
    ...
    espece: parentSpecies,
    categorie: parentCategory,
    race: parentRace,
    mutation: entry.mutation || sire?.mutation || dam?.mutation || '',
    couleur_base: parentBaseColor,
    facteur: parentFactor,
    couleur: entry.couleur || [entry.mutation, parentBaseColor].filter(Boolean).join(' '),
  };
  ```
  Le préfixe de nom par défaut utilise la race ou l'espèce parentale, ou à défaut un préfixe neutre (`Oiseau`, `Bird`, `طائر`). Zéro mention de Canari, Lipochrome, Jaune ou Intensif si les parents sont indéterminés.

---

### GAP14-ANO-03 — HatchEggModal.tsx
- **Composant :** `src/features/reproduction/hatching/components/HatchEggModal.tsx`
- **Comportement AVANT :**
  ```ts
  const [birthWeight, setBirthWeight] = useState<string>('1.5');
  ```
  Tous les œufs de toutes les espèces naissaient avec un poids pré-rempli à 1.5g (calibré spécifiquement sur le Canari).
- **Comportement APRÈS :**
  ```ts
  const eggSpecies = useMemo(() => {
    if (!egg) return undefined;
    const clutch = ClutchRepository.getById(egg.clutchId);
    if (!clutch) return undefined;
    const pair = ReproductionRepository.getById(clutch.pairId);
    if (!pair) return undefined;
    const sire = pair.maleId ? BirdService.getById(pair.maleId) : undefined;
    const dam = pair.femaleId ? BirdService.getById(pair.femaleId) : undefined;
    return sire?.espece || dam?.espece || undefined;
  }, [egg]);

  const [birthWeight, setBirthWeight] = useState<string>(() => {
    return eggSpecies === 'canari' ? '1.5' : '';
  });
  ```
  Placeholder dynamique neutre : `eggSpecies === 'canari' ? '1.5' : 'Poids en g (ex: 1.5)'`.
  Seuls les œufs dont l'espèce est explicitement et rigoureusement `canari` bénéficient du pré-remplissage homologué 1.5g. Toutes les autres espèces démarrent avec le champ vide.

---

### GAP14-ANO-04 — NurseryService.ts
- **Composant :** `src/features/reproduction/nursery/services/NurseryService.ts` (`getGrowthCurveData`)
- **Comportement AVANT :**
  ```ts
  const L = 18; // asymptotic weight Canary
  const k = 0.28;
  const t0 = 8;
  for (let age = 0; age <= 30; age++) {
    const theoreticalWeight = L / (1 + Math.exp(-k * (age - t0)));
    ...
  }
  ```
  La courbe logistique Canary 18g était injectée pour tous les poussins sans distinction d'espèce.
- **Comportement APRÈS :**
  ```ts
  const chickSpecies = (() => {
    if (!chick.pairId) return undefined;
    const pair = ReproductionRepository.getById(chick.pairId);
    if (!pair) return undefined;
    const sire = pair.maleId ? BirdService.getById(pair.maleId) : undefined;
    const dam = pair.femaleId ? BirdService.getById(pair.femaleId) : undefined;
    return sire?.espece || dam?.espece || undefined;
  })();

  const isCanary = chickSpecies === 'canari';
  const L = 18;
  const k = 0.28;
  const t0 = 8;

  for (let age = 0; age <= maxAge; age++) {
    let expectedWeight = 0;
    if (isCanary) {
      const theoreticalWeight = L / (1 + Math.exp(-k * (age - t0)));
      expectedWeight = Math.max(1.5, Math.round(theoreticalWeight * 10) / 10);
    }
    ...
  }
  ```
  Pour les poussins de canaris, le modèle logistique est fidèlement préservé. Pour toute autre espèce ou espèce indéterminée, `expectedWeight = 0` : le graphique affiche uniquement les poids réels pesés sans imposer silencieusement le gabarit Canary.

---

## 4. Preuve de Suppression des Fallbacks Canary & Gestion de UNKNOWN

1. **Suppression vérifiée :** Aucune conversion silencieuse d'une espèce inconnue ou absente vers `'canari'`.
2. **Recherche de conformité :**
   - WeaningService : `fatherBird?.espece || motherBird?.espece || undefined`
   - BandingBatchModal : `sire?.espece || dam?.espece || undefined`
   - HatchEggModal : `eggSpecies === 'canari' ? '1.5' : ''`
   - NurseryService : `const isCanary = chickSpecies === 'canari'`
3. **Statut UNKNOWN / Indéterminé préservé :**
   - Lorsqu'une espèce est `undefined` ou explicitement `'UNKNOWN'`, le système ne tente pas de dériver une mutation, une race ou une courbe de poids.
   - Les interfaces et les adaptateurs maintiennent l'état épistémique sans extrapolation désactivée.

---

## 5. Synthèse des Contrôles & Tests

### Tests Unitaires & d'Intégration GAP-15 (`tests/bio-ref-v2-gap15.test.ts`)
```text
▶ GAP-15 — REPRODUCTION PERIPHERAL CANARY FALLBACK CLEANUP
  ▶ GAP14-ANO-01: WeaningService — Éradication du fallback Canary au sevrage
    ✔ 1. Parents sans espèce -> aucun Canary automatique attribué lors de la promotion (2.89ms)
    ✔ 2. Parents avec espèce connue (ex: colombe_diamant) -> espèce et attributs fidèlement propagés (0.78ms)
    ✔ 3. Parents explicitement Canary -> comportement Canary préservé sans régression (0.56ms)
  ✔ GAP14-ANO-01: WeaningService — Éradication du fallback Canary au sevrage (4.85ms)
  ▶ GAP14-ANO-02: BandingBatchModal — Éradication du fallback Canary au baguage en lot
    ✔ 4. Géniteurs sans espèce -> aucun Canari, Lipochrome, Jaune ou Intensif inventé (0.27ms)
    ✔ 5. Géniteurs avec espèce connue (ex: perruche_ondulee) -> espèce propagée au lot de baguage (0.21ms)
  ✔ GAP14-ANO-02: BandingBatchModal — Éradication du fallback Canary au baguage en lot (0.64ms)
  ▶ GAP14-ANO-03: HatchEggModal — Résolution scientifique du poids de naissance
    ✔ 6. Œuf d’espèce non-canari ou sans parents -> aucun pré-remplissage 1.5g (0.39ms)
    ✔ 7. Œuf d’espèce explicitement canari -> pré-remplissage 1.5g conservé (0.27ms)
  ✔ GAP14-ANO-03: HatchEggModal — Résolution scientifique du poids de naissance (0.81ms)
  ▶ GAP14-ANO-04: NurseryService — Restriction de la courbe logistique au Canari
    ✔ 8. Poussin sans espèce ou non-Canary -> expectedWeight = 0, aucun modèle logistique 18g imposé (0.36ms)
    ✔ 9. Poussin explicitement Canari -> modèle logistique 18g Canary conservé (0.33ms)
    ✔ 10. Rigueur épistémique : UNKNOWN et NOT_TESTED préservés (0.23ms)
  ✔ GAP14-ANO-04: NurseryService — Restriction de la courbe logistique au Canari (1.04ms)
✔ GAP-15 — REPRODUCTION PERIPHERAL CANARY FALLBACK CLEANUP (7.74ms)
ℹ tests 10 | suites 5 | pass 10 | fail 0
```

### Tests de Non-Régression Biological Reference V2
Exécution conjointe :
- `tests/bio-ref-v2-gap13.test.ts` (15/15 PASS)
- `tests/bio-ref-v2-gap12.test.ts` (18/18 PASS)
- `tests/bio-ref-v2-gap11.test.ts` (20/20 PASS)
- `tests/species-profile-scoping.test.ts` (18/18 PASS)
- `tests/b013-biological-engine-lifecycle.test.ts` (PASS)
- `tests/reproduction-lifecycle.test.ts` (7/7 PASS)
- `tests/banding-herd-registration.test.ts` (PASS)
**Total : 144 tests exécutés, 144 passés, 0 échec.**

### Tests Playwright E2E
`npx playwright test tests/e2e/v195-reproduction-breeding-ux.spec.ts`
```text
Running 3 tests using 1 worker
  ok 1 [chromium] › E2E-V195-01 : Navigation vers la reproduction et affichage de la liste des couples (21.9s)
  ok 2 [chromium] › E2E-V195-02 : Absence absolue de scores en étoiles ou mention "Meilleur accouplement" (1.3s)
  ok 3 [chromium] › E2E-V195-03 : Support RTL en langue arabe sur la reproduction (1.3s)
  3 passed (30.5s)
```

### Contrôle TypeScript Statique
`npx tsc --noEmit`
**Résultat : Code 0 (zéro erreur).**

### Production Build
`npm run build` (`vite build --configLoader runner`)
**Résultat : Build réussi en 32.46s (zéro erreur de compilation, artefacts PWA et chunks générés).**

---

## 6. Contrôle d'Invariance Scientifique

Conformément à la Section 2 du mandat GAP-15 :
1. `GeneticsEngine.ts` : **INTACT** (aucune modification).
2. `CanaryCrossEngine.ts` : **INTACT** (aucune modification).
3. Catalogues génétiques canoniques : **INTACTS**.
4. Profils biologiques homologués : **INTACTS**.
5. Décisions GAP-12 Colombe diamant (bagues 3.5/3.8 mm, poids in situ/ex situ) : **INTACTES**.
6. Aucune nouvelle mutation inventée.
7. Aucun nouveau paramètre biologique non sourcé n'a été créé.
8. Aucun fallback vers `registry[0]` ou première espèce.

---

## 7. État Git

### Fichiers Modifiés & Créés
- `src/features/reproduction/weaning/services/WeaningService.ts`
- `src/features/breeding/components/BandingBatchModal.tsx`
- `src/features/reproduction/hatching/components/HatchEggModal.tsx`
- `src/features/reproduction/nursery/services/NurseryService.ts`
- `src/business/BirdEngine.ts`
- `tests/bio-ref-v2-gap15.test.ts`
- `QA_ARTIFACTS/HUMAN_REVIEW_REQUIRED_MASTER_REGISTRY.md`
- `QA_ARTIFACTS/BIO_REF_V2_GAP15_REPRODUCTION_PERIPHERAL_CANARY_FALLBACK_CLEANUP.md`

### Commit Local Prévu
Message : `fix(bio-ref-v2): remove peripheral Canary reproduction fallbacks`
Aucun push distant (`git push` interdit).
Aucun déploiement Cloud / Store.
Arrêt strict à la fin de GAP-15.
