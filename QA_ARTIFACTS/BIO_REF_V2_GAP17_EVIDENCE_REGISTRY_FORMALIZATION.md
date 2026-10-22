# RAPPORT TECHNIQUE — MISSION BIOLOGICAL REFERENCE V2
## GAP-17 — EVIDENCE REGISTRY FORMALIZATION

---

### 1. STATUT DE LA MISSION

**Statut final :** `BIO_REF_V2_GAP17_EVIDENCE_REGISTRY_FORMALIZATION_COMPLETED`  
**Date d'exécution :** 2026-10-22  
**Type de mission :** Documentaire ciblée issue de l'audit GAP-14  
**Objectif :** Fermer les gaps de traçabilité documentaire identifiés par GAP-14, en formalisant les `EvidenceRecord` nécessaires aux décisions et profils déjà validés, **sans modifier aucune règle biologique ou génétique**.

---

### 2. ÉVIDENCE RECORDS AJOUTÉS / MODIFIÉS

Le registre canonique `src/reference/bibliography/evidenceRegistry.ts` a été complété par **11 nouveaux `EvidenceRecord`** rigoureusement vérifiés et typés, portant le total du registre de 28 à **39 EvidenceRecords**.

| Evidence ID | Espèce (speciesId) | Règle (ruleId) | Statut épistémique | Human Review | Limitations |
|---|---|---|---|---|---|
| `EVD-COL-01-TAXON` | `colombe_diamant` | `COL_TAXON_IDENTITY` | `VERIFIED` | `false` | Aucune |
| `EVD-COL-01-REPRO` | `colombe_diamant` | `COL_REPRO_CLUTCH_INCUBATION` | `VERIFIED` | `false` | Aucune |
| `EVD-COL-01-WEIGHT` | `colombe_diamant` | `COL_BIOL_WEIGHT_CONTEXTS` | `VERIFIED` | `false` | Séparation in situ / ex situ (GAP-12) |
| `EVD-COL-01-RINGS` | `colombe_diamant` | `COL_BREED_RING_STANDARDS` | `VERIFIED` | `false` | Multi-standard 3.5 / 3.8 mm sans 4.0 mm FFO |
| `EVD-COL-01-NEST` | `colombe_diamant` | `COL_BREED_NEST_TYPE` | `VERIFIED` | `false` | Aucune |
| `EVD-COL-01-HYB` | `colombe_diamant` | `COL_MGMT_HYBRID_STERILITY` | `VERIFIED` | `false` | Aucune |
| `EVD-AGAP-PERS-BLUE` | `agapornis_personatus` | `ap_blue` | `VERIFIED` | `false` | Allèles complexes exclus (restent HRR) |
| `EVD-AGAP-PERS-ETHOL` | `agapornis_personatus` | `AGAP_PERS_ETHOL_NESTING` | `VERIFIED` | `false` | Aucune |
| `EVD-AGAP-PERS-REPRO` | `agapornis_personatus` | `AGAP_PERS_REPRO_PARAMS` | `VERIFIED` | `false` | Aucune |
| `EVD-AGAP-FISC-ETHOL` | `agapornis_fischeri` | `AGAP_FISC_ETHOL_NESTING` | `VERIFIED` | `false` | Aucune |
| `EVD-AGAP-FISC-REPRO` | `agapornis_fischeri` | `AGAP_FISC_REPRO_PARAMS` | `VERIFIED` | `false` | Catalogue Fischer OUT_OF_SCOPE |

---

### 3. TABLEAU PROFILE → EVIDENCE → SOURCE

Chaîne complète et continue de résolution canonique :

```text
Species/Profile  ───>  EvidenceRecord  ───>  EvidenceCitation  ───>  BibliographicSource
```

| Profil canonique | Affirmation tracée | EvidenceId | CitationId | SourceId | Titre / Référence source |
|---|---|---|---|---|---|
| `colombe_diamant` | Longueur 19–21.5 cm & taxonomie | `EVD-COL-01-TAXON` | `CIT-COL-01-TAXON-GIBBS` | `SRC-GIBBS-2001` | *Pigeons and Doves: A Guide to Pigeons and Doves of the World* (pp. 313–315) |
| `colombe_diamant` | Dimorphisme cercle oculaire corail | `EVD-COL-01-TAXON` | `CIT-COL-01-TAXON-FRITH` | `SRC-FRITH-1982` | *Pigeons and Doves of Australia* (pp. 200–205) |
| `colombe_diamant` | Ponte 2 œufs & incubation 13j | `EVD-COL-01-REPRO` | `CIT-COL-01-REPRO-FRITH` | `SRC-FRITH-1982` | *Pigeons and Doves of Australia* (pp. 200–205) |
| `colombe_diamant` | Rythme circadien de couvaison | `EVD-COL-01-REPRO` | `CIT-COL-01-REPRO-GIBBS` | `SRC-GIBBS-2001` | *Pigeons and Doves: A Guide to Pigeons and Doves of the World* (pp. 313–315) |
| `colombe_diamant` | Développement des pigeonneaux | `EVD-COL-01-REPRO` | `CIT-COL-01-REPRO-HANZAB` | `SRC-HANZAB-1996` | *HANZAB Vol. 3: Snipe to Pigeons* (pp. 838–848) |
| `colombe_diamant` | Poids in situ (23–37 g, moy. ~35 g) | `EVD-COL-01-WEIGHT` | `CIT-COL-01-WEIGHT-HANZAB` | `SRC-HANZAB-1996` | *HANZAB Vol. 3: Snipe to Pigeons* (pp. 838–848) |
| `colombe_diamant` | Poids ex situ captivité (35–45 g) | `EVD-COL-01-WEIGHT` | `CIT-COL-01-WEIGHT-FRITH` | `SRC-FRITH-1982` | *Pigeons and Doves of Australia* (p. 202) |
| `colombe_diamant` | Multi-standard 3.5 mm / 3.8 mm | `EVD-COL-01-RINGS` | `CIT-COL-01-RINGS-UOF` | `SRC-UOF-BAGUES-2024` | *Guide officiel des bagues et diamètres réglementaires* |
| `colombe_diamant` | Nid plateforme / soucoupe | `EVD-COL-01-NEST` | `CIT-COL-01-NEST-FRITH` | `SRC-FRITH-1982` | *Pigeons and Doves of Australia* (pp. 200–205) |
| `colombe_diamant` | Parade en éventail & corbeille | `EVD-COL-01-NEST` | `CIT-COL-01-NEST-GOODWIN` | `SRC-GOODWIN-1983` | *Pigeons and Doves of the World* (pp. 164–166) |
| `colombe_diamant` | Hybrides Geopelia stériles | `EVD-COL-01-HYB` | `CIT-COL-01-HYB-MCCARTHY` | `SRC-MCCARTHY-2006` | *Handbook of Avian Hybrids of the World* (p. 110) |
| `agapornis_personatus` | ap_blue (blue1, bl, rec. aut., bl/bl) | `EVD-AGAP-PERS-BLUE` | `CIT-PERS-BLUE-VAN-DEN-ABEELE` | `SRC-VAN-DEN-ABEELE-2007` | *Lovebirds: Compendium and Genetics* (pp. 84–89) |
| `agapornis_personatus` | ap_blue hérédité mendélienne | `EVD-AGAP-PERS-BLUE` | `CIT-PERS-BLUE-MARTIN` | `SRC-MARTIN-2002` | *A Guide to Colour Mutations and Genetics in Parrots* (pp. 98–102) |
| `agapornis_personatus` | Transport matériaux dans le bec | `EVD-AGAP-PERS-ETHOL` | `CIT-PERS-ETHOL-DILGER` | `SRC-DILGER-1960` | *Zeitschrift für Tierpsychologie* (17(6): 649–685) |
| `agapornis_personatus` | Écologie de reproduction masqué | `EVD-AGAP-PERS-ETHOL` | `CIT-PERS-ETHOL-FRY` | `SRC-FRY-1988` | *The Birds of Africa — Volume III* (pp. 398–404) |
| `agapornis_personatus` | Ponte 4–6 œufs & incubation 22j | `EVD-AGAP-PERS-REPRO` | `CIT-PERS-REPRO-MOREAU` | `SRC-MOREAU-1948` | *Ibis* (90(2): 206–239) |
| `agapornis_personatus` | Standard 145–150 mm & anti-hyb | `EVD-AGAP-PERS-REPRO` | `CIT-PERS-REPRO-COM` | `SRC-COM-PSIT-2023` | *Standard Technique Mondial des Psittacidés* |
| `agapornis_personatus` | Diamètre officiel bague 4.0 mm | `EVD-AGAP-PERS-REPRO` | `CIT-PERS-REPRO-UOF` | `SRC-UOF-BAGUES-2024` | *Guide officiel des bagues et diamètres réglementaires* |
| `agapornis_fischeri` | Transport matériaux dans le bec | `EVD-AGAP-FISC-ETHOL` | `CIT-FISC-ETHOL-DILGER` | `SRC-DILGER-1960` | *Zeitschrift für Tierpsychologie* (17(6): 649–685) |
| `agapornis_fischeri` | Naturalisme & transport au bec | `EVD-AGAP-FISC-ETHOL` | `CIT-FISC-ETHOL-FRY` | `SRC-FRY-1988` | *The Birds of Africa — Volume III* (pp. 398–404) |
| `agapornis_fischeri` | Ponte 4–6 œufs & incubation 22j | `EVD-AGAP-FISC-REPRO` | `CIT-FISC-REPRO-MOREAU` | `SRC-MOREAU-1948` | *Ibis* (90(2): 206–239) |
| `agapornis_fischeri` | Standard 140 mm C.O.M. | `EVD-AGAP-FISC-REPRO` | `CIT-FISC-REPRO-COM` | `SRC-COM-PSIT-2023` | *Standard Technique Mondial des Psittacidés* |
| `agapornis_fischeri` | Diamètre officiel bague 4.0 mm | `EVD-AGAP-FISC-REPRO` | `CIT-FISC-REPRO-UOF` | `SRC-UOF-BAGUES-2024` | *Guide officiel des bagues et diamètres réglementaires* |

---

### 4. COLOMBE DIAMANT

- **Affirmations documentées et tracées :**
  - Identité taxonomique (*Geopelia cuneata*, Columbidae, Australie) et longueur 19–21.5 cm.
  - Dimorphisme périorbital (cercle oculaire charnu 2–3 mm rouge corail chez le mâle mature).
  - Incubation strictement 13 jours (12–14j) partagée au rythme circadien (mâle diurne, femelle nocturne).
  - Ponte invariable de 2 œufs blancs elliptiques (caractéristique constante des Columbidés).
  - Poids in situ sauvage : 23–37 g, moyenne indicative ~35 g (Frith 1982, HANZAB 1996).
  - Poids ex situ captivité : 35–45 g.
  - Multi-standard de baguage : 3.5 mm UOF/COM France et 3.8 mm CDE/Aviornis France International.
  - Nidification : plateforme rudimentaire de brindilles en nature, soucoupe/corbeille peu profonde en captivité.
  - Hybridation : genre *Geopelia*, croisements captifs recensés (*G. striata*, *G. placida*) produisant des hybrides stériles ; aucune hybridation fertile documentée.
- **Invariants stricts respectés :**
  - Aucune fusion de plages de poids (23–45 g banni).
  - Aucune introduction de 4.0 mm FFO comme valeur canonique.
  - Aucun changement apporté aux valeurs biologiques de `colombeDiamant.ts` ni à GAP-12.

---

### 5. AGAPORNIS PERSONATUS & AP_BLUE

- **Mutation canonique `ap_blue` :**
  - Homologuée dans GAP-10-E et GAP-11 (`status: CANONICAL`).
  - Tracée formellement par `EVD-AGAP-PERS-BLUE` (`SRC-VAN-DEN-ABEELE-2007`, `SRC-MARTIN-2002`).
  - Déterminisme : `blue1`, symbole `bl`, transmission autosomique récessive, état homozygote `bl/bl`.
  - Résolution : `CanonicalDataBridgeAdapter.resolveMutation('agapornis_personatus', 'ap_blue')` retourne `status: 'CANONICAL'`, `inheritance: 'AUTOSOMAL_RECESSIVE'`.
- **Éthologie et biologie :**
  - Transport des matériaux de nid exclusivement dans le bec (jamais dans le croupion).
  - Ponte de 4–6 œufs, incubation 22 jours, bague officielle 4.0 mm.
- **Allèles complexes réservés :**
  - `blue2`, `bl2`, `turquoise`, `sapphire` restent formellement en **`HUMAN_REVIEW_REQUIRED`** (non résolus, `resolved: false`).
  - Aucune preuve artificielle n'a été créée pour eux.

---

### 6. AGAPORNIS FISCHERI

- **Périmètre biologique uniquement :**
  - Transport des matériaux de nid exclusivement dans le bec (`EVD-AGAP-FISC-ETHOL`).
  - Ponte de 4–6 œufs, incubation 22 jours, bague officielle 4.0 mm (`EVD-AGAP-FISC-REPRO`).
- **Périmètre génétique :**
  - Le catalogue génétique d'Agapornis fischeri reste strictement **`OUT_OF_SCOPE`**.
  - Aucune mutation canonique n'a été activée (`af_ino`, `af_blue`, `lutino` retournent `status: 'OUT_OF_SCOPE'`).

---

### 7. AUDIT DES 11 SOURCES NON RATTACHÉES (GAP-14)

L'audit unitaire des 11 sources identifiées dans GAP-14 a abouti aux classifications et rattachements suivants :

| Source ID | Auteur & Année | Classification GAP-17 | Justification & Rattachement EvidenceRecord |
|---|---|---|---|
| `SRC-FRITH-1982` | H. J. Frith (1982) | `LINKED_TO_CANONICAL_CLAIM` | Rattachée à `EVD-COL-01-TAXON`, `EVD-COL-01-REPRO`, `EVD-COL-01-WEIGHT`, `EVD-COL-01-NEST` |
| `SRC-GIBBS-2001` | Gibbs et al. (2001) | `LINKED_TO_CANONICAL_CLAIM` | Rattachée à `EVD-COL-01-TAXON`, `EVD-COL-01-REPRO` |
| `SRC-GOODWIN-1983` | Derek Goodwin (1983) | `LINKED_TO_CANONICAL_CLAIM` | Rattachée à `EVD-COL-01-NEST` |
| `SRC-HANZAB-1996` | Higgins & Davies (1996) | `LINKED_TO_CANONICAL_CLAIM` | Rattachée à `EVD-COL-01-REPRO`, `EVD-COL-01-WEIGHT` |
| `SRC-MCCARTHY-2006` | Eugene M. McCarthy (2006) | `LINKED_TO_CANONICAL_CLAIM` | Rattachée à `EVD-COL-01-HYB` |
| `SRC-DILGER-1960` | William C. Dilger (1960) | `LINKED_TO_CANONICAL_CLAIM` | Rattachée à `EVD-AGAP-PERS-ETHOL`, `EVD-AGAP-FISC-ETHOL` |
| `SRC-MOREAU-1948` | R. E. Moreau (1948) | `LINKED_TO_CANONICAL_CLAIM` | Rattachée à `EVD-AGAP-PERS-REPRO`, `EVD-AGAP-FISC-REPRO` |
| `SRC-FRY-1988` | C. Hilary Fry et al. (1988) | `LINKED_TO_CANONICAL_CLAIM` | Rattachée à `EVD-AGAP-PERS-ETHOL`, `EVD-AGAP-FISC-ETHOL` |
| `SRC-COM-PSIT-2023` | OMJ / C.O.M. (2023) | `STANDARD_REFERENCE` | Standard officiel d'exposition psittacidés ; rattaché à `EVD-AGAP-PERS-REPRO`, `EVD-AGAP-FISC-REPRO` |
| `SRC-UOF-BAGUES-2024` | UOF / COM France (2024) | `STANDARD_REFERENCE` | Guide officiel des diamètres réglementaires ; rattaché à `EVD-COL-01-RINGS`, `EVD-AGAP-PERS-REPRO`, `EVD-AGAP-FISC-REPRO` |
| `SRC-COPELLO-1978` | G. Copello (1978) | `GENERAL_REFERENCE` | Traité d'ornithogénétique italienne du Canari ; référence générale conservée sans EVD artificiel |

**Bilan d'audit :**
- 10 sources rattachées à des preuves canoniques et/ou standards officiels.
- 1 source classifiée en référence générale (`SRC-COPELLO-1978`).
- 0 source orpheline créée, 0 source fictive insérée.

---

### 8. ÉLÉMENTS RESTANT HUMAN_REVIEW_REQUIRED

Le registre `QA_ARTIFACTS/HUMAN_REVIEW_REQUIRED_MASTER_REGISTRY.md` a été mis à jour sans fermeture automatique injustifiée :
- **HRR-02 (Colombe diamant) :** Maintien du statut `draft` sous gouvernance V2. Preuves formalisées, mais la clôture formelle globale est réservée à la revue d'homologation finale.
- **HRR-05 (Génétique Agapornis) :** Maintien du statut `PARTIELLEMENT HOMOLOGUÉ`. `ap_blue` est validé et tracé ; en revanche, `blue2`, `bl2`, `turquoise`, `sapphire`, `ar_masque_orange` et les mutations Fischer restent formellement en **`HUMAN_REVIEW_REQUIRED`**.
- **HRR-07 (Réserves documentaires) :** Maintien des réserves documentaires préalables (`SRC-TAYLOR-WARNER-1986`, forum, etc.) sans levée artificielle.

---

### 9. RÉSULTATS DES TESTS UNITAIRES & D'INTÉGRATION

#### Suite dédiée GAP-17 (`tests/bio-ref-v2-gap17.test.ts`)
- **Total tests :** 12
- **Passés :** 12 (100 %)
- **Échoués :** 0
- **Détail :**
  1. `GAP17-01` : Chaque EvidenceId est unique et suit les conventions de nommage (PASS)
  2. `GAP17-02` : Chaque sourceId référencé dans les citations existe réellement dans `BIBLIOGRAPHIC_SOURCES` (PASS)
  3. `GAP17-03` : Intégrité des citations et absence de référence orpheline (PASS)
  4. `GAP17-04` : Colombe diamant possède tous les EvidenceRecords canoniques attendus (PASS)
  5. `GAP17-05` : Agapornis personatus possède la traçabilité canonique de `ap_blue` et de sa biologie (PASS)
  6. `GAP17-06` : Agapornis fischeri possède uniquement les preuves biologiques documentées (PASS)
  7. `GAP17-07` : `ap_blue` reste CANONICAL dans le catalogue génétique Personatus (PASS)
  8. `GAP17-08` : Allèles complexes Personatus (`blue2`, `bl2`, `turquoise`, `sapphire`) restent non-canoniques / HRR (PASS)
  9. `GAP17-09` : Aucune mutation Fischer n'est activée (catalogue strictement OUT_OF_SCOPE) (PASS)
  10. `GAP17-10` : Aucune modification de la chaîne Canary (intégrité 100%) (PASS)
  11. `GAP17-11` : Chaîne complète Profile -> Evidence -> Citation -> Source (PASS)
  12. `GAP17-12` : Classification explicite des 11 sources non rattachées de GAP-14 (PASS)

---

### 10. STATUT PLAYWRIGHT

**Playwright :** `N/A — no UI change`  
Aucun composant d'interface utilisateur, layout ou vue graphique n'a été altéré dans cette mission purement documentaire de couche référence/bibliographie.

---

### 11. CONTRÔLE TYPESCRIPT

Exécution de `npx tsc --noEmit` :
```text
Exit code: 0
Stdout: (vide)
Stderr: (vide)
```
**Statut :** **PASS — 0 erreur TypeScript**.

---

### 12. CONTRÔLE BUILD PRODUCTION

Exécution de `npm run build` :
```text
vite v6.4.3 building for production...
✓ 3102 modules transformed.
rendering chunks...
computing gzip size...
✓ built in 6.05s
Exit code: 0
```
**Statut :** **PASS — Bundle production généré avec succès**.

---

### 13. CONTRÔLE DE NON-RÉGRESSION

Exécution conjointe des suites Biological Reference V2 :
- `tests/bio-ref-v2-gap10-b1.test.ts`
- `tests/bio-ref-v2-gap10-c.test.ts`
- `tests/bio-ref-v2-gap11.test.ts`
- `tests/bio-ref-v2-gap12.test.ts`
- `tests/bio-ref-v2-gap13.test.ts`
- `tests/bio-ref-v2-gap15.test.ts`
- `tests/bio-ref-v2-gap16.test.ts`
- `tests/bio-ref-v2-gap17.test.ts`

**Résultat :** 121 tests exécutés, **121 passés**, 0 échec (durée : 360 ms).

Suites de sanité taxonomique et profils spécifiques :
- `tests/species-taxonomy-sanity.test.ts`
- `tests/colombe-diamant-profile.test.ts`
- `tests/perruche-ondulee-profile.test.ts`

**Résultat :** 43 tests exécutés, **43 passés**, 0 échec (durée : 156 ms).

---

### 14. ÉTAT GIT

Fichiers modifiés / créés pour GAP-17 :
- `M src/reference/bibliography/evidenceRegistry.ts` (ajout des 11 EvidenceRecords et mise à jour des helpers)
- `M tests/bio-ref-v2-gap10-c.test.ts` (ajustement de l'assertion sur la taille du registre et exclusion des préfixes désormais homologués)
- `M QA_ARTIFACTS/HUMAN_REVIEW_REQUIRED_MASTER_REGISTRY.md` (mise à jour HRR-02, HRR-05, HRR-07 et section GAP-17)
- `?? tests/bio-ref-v2-gap17.test.ts` (nouvelle suite dédiée de 12 tests)
- `?? QA_ARTIFACTS/BIO_REF_V2_GAP17_EVIDENCE_REGISTRY_FORMALIZATION.md` (présent rapport)

Toutes les contraintes absolues de sécurité ont été respectées :
- Aucun `git push`
- Aucun déploiement Render
- Aucune publication Android ou Windows
