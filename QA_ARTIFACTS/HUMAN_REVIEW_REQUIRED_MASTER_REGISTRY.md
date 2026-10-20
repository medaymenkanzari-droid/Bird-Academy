# HUMAN_REVIEW_REQUIRED Master Registry — Biological Reference V2

Date: 2026-10-20
Phase: Biological Reference V2
Status: Active Master Tracking

---

## Registre des Revues Humaines et Points Scientifiques Réservés

| ID | Domaine / Sujet | Statut | Mission d'origine | Résolution / Statut Actuel |
|---|---|---|---|---|
| **HRR-01** | Perruche ondulée — Profil V2 | **RÉSOLU** | GAP-01 | Homologué et intégré |
| **HRR-02** | Colombe diamant — Profil V2 | **OUVERT** (Draft) | GAP-02 | Profil canonique migré techniquement vers `colombe_diamant` (alias legacy `colombe` préservé et idempotent, zéro régression). Données biologiques strictement inchangées. Statut scientifique maintenu **HUMAN_REVIEW_REQUIRED** (`draft`) jusqu'à l'homologation documentaire (GAP-10-C). |
| **HRR-03** | Zero Canary Fallback — 10 fallbacks identifiés | **OUVERT** | GAP-06-A | Audit complété, fallbacks répertoriés pour traitement dédié |
| **HRR-04** | Agapornis — Architecture taxonomique et profils biologiques | **RÉSOLU TECHNICLEMENT** | GAP-07-A / GAP-07-B | • Résolution des trois speciesId indépendants (`agapornis_roseicollis`, `agapornis_fischeri`, `agapornis_personatus`)<br>• Profils biologiques séparés (`agapornisRoseicollis.ts`, `agapornisFischeri.ts`, `agapornisPersonatus.ts`)<br>• Migration legacy non destructive avec résolution déterministe (Fischer, Personatus, Roseicollis)<br>• Ambiguïté legacy conservée (`LEGACY_SPECIES_AMBIGUITY`) lorsqu'aucune preuve ne permet l'identification |
| **HRR-05** | Agapornis — Isolation des catalogues génétiques et migration des identifiants | **OUVERT** | GAP-07-A / GAP-08-A / GAP-08-B | Implémenté techniquement par GAP-08-B (isolation stricte Roseicollis/Personatus/Fischeri, neutralisation de la clé `agapornis`, migration pure `ar_*`). Maintenu **OUVERT** pour validation scientifique humaine des mutations sans fiches EVD formelles (Masque Orange, Parblue Roseicollis, True Blue Personatus, Ino Fischer/Personatus). |
| **HRR-06** | GeneticsEngine — Isolation interspécifique & hybridation | **RÉSOLU TECHNIQUEMENT / OUVERT SCIENTIFIQUEMENT** | GAP-07-A / GAP-09 | • Correction technique de sécurité : refus déterministe de tout croisement interspécifique (`HYBRID_CROSS_UNSUPPORTED`), des espèces inconnues/ambiguës (`INSUFFICIENT_INFORMATION`) et des espèces hors catalogue (`OUT_OF_SCOPE`).<br>• Aucune hybridation calculée : zéro règle d'hybridation inventée, zéro probabilité ou phénotype généré pour une paire interspécifique.<br>• Statut scientifique d'hybridation maintenu **UNSUPPORTED / HUMAN_REVIEW_REQUIRED** tant qu'aucun référentiel homologué n'existe. |
| **HRR-07** | Bibliographie / Preuves scientifiques & Infrastructure | **RÉSOLU TECHNIQUEMENT / OUVERT SCIENTIFIQUEMENT** | GAP-07-A / GAP-10-A / GAP-10-B1 | • Remédiation technique GAP-10-B1 achevée (0 erreur TypeScript TS2741, optionnalité de `regulatoryStatus`, réconciliation des Evidence IDs orphelins sans invention de source, isolation canonique Colombe diamant).<br>• Statut documentaire scientifique formellement maintenu **OUVERT / HUMAN_REVIEW_REQUIRED** pour la future mission GAP-10-C (aucune homologation de données biologiques réalisée lors de GAP-10-B1). |

---

## Détails HRR-04 (Résolution GAP-07-B)

- **SpeciesId canoniques :**
  - `agapornis_roseicollis` (Agapornis roseicollis)
  - `agapornis_fischeri` (Agapornis fischeri)
  - `agapornis_personatus` (Agapornis personatus)
- **Profil Roseicollis :** `identity.id = 'agapornis_roseicollis'`, bague 4.5 mm, transport des matériaux dans le croupion, incubation 23 j.
- **Profil Fischeri :** `identity.id = 'agapornis_fischeri'`, bague 4.0 mm, transport des matériaux dans le bec, incubation 22 j, statut draft.
- **Profil Personatus :** `identity.id = 'agapornis_personatus'`, bague 4.0 mm, transport des matériaux dans le bec, incubation 22 j, statut draft.
- **Résolution legacy :** `getBiologicalProfileById('agapornis')` retourne `undefined` (zéro fallback silencieux sur Roseicollis).
- **Migration `migrateBirdTaxonomy` :**
  - Si race/catégorie mentionne Fischer → `agapornis_fischeri`
  - Si race/catégorie mentionne Personatus → `agapornis_personatus`
  - Si race/catégorie mentionne Roseicollis → `agapornis_roseicollis`
  - Si `agapornis` sans précision fiable → marquage `LEGACY_SPECIES_AMBIGUITY`, conservation de l'id legacy sans attribution arbitraire.

---

## Détails HRR-05 (Isolation des Catalogues & Statut GAP-08-B)

- **HRR-05.1 Masque Orange (`ar_masque_orange`) :**
  - Scoper strictement à `agapornis_roseicollis` (autosomique récessif).
  - Maintenu sous statut **HUMAN_REVIEW_REQUIRED** dans `CanonicalDataBridgeAdapter` car aucune fiche EVD formelle homologuée n'existe à ce jour dans le référentiel de production.
  - Zéro preuve bibliographique fictive créée (GAP-10 requis pour homologation définitive).
  - Rejeté formellement pour Fischer (`agapornis_fischeri`) et Personatus (`agapornis_personatus`) avec statut `OUT_OF_SCOPE`.

- **HRR-05.2 Séparation Bleu / Parblue / True Blue :**
  - L'identifiant legacy `agap_bleu` / terme "bleu" appliqué à `agapornis_roseicollis` est scientifiquement inexact : Roseicollis ne possède pas de True Blue natif mais des allèles Parblue partiels (Aqua `ar_aqua` et Turquoise `ar_turquoise`, récessifs autosomiques multiples).
  - Résolution de `bleu` / `agap_bleu` chez Roseicollis configurée en statut **HUMAN_REVIEW_REQUIRED** (aucun mapping automatique aveugle vers `ar_aqua`, `ar_turquoise` ou `ap_blue`).
  - `ap_blue` (True Blue Personatus, autosomique récessif) déclaré dans `agapornis_personatus` avec statut **HUMAN_REVIEW_REQUIRED** (en attente de preuve formelle).
  - Zéro fuite vers Roseicollis ou Fischeri (interdiction d'attribuer `ap_blue` à Roseicollis ou d'importer une mutation issue d'introgression chez Fischer sans homologation).

- **HRR-05.3 Neutralisation du catalogue legacy `agapornis` :**
  - La clé de catalogue `agapornis` est totalement éradiquée de `CANONICAL_SPECIES_MUTATIONS`.
  - Toute requête `resolveMutation('agapornis', ...)` retourne immédiatement `status: 'INSUFFICIENT_INFORMATION'` avec la raison explicite : *"Espèce générique agapornis ambiguë. Préciser agapornis_roseicollis, agapornis_fischeri ou agapornis_personatus (LEGACY_SPECIES_AMBIGUITY)."*
  - Zéro fallback implicite `agapornis -> agapornis_roseicollis` dans le moteur génétique et les adaptateurs.

- **HRR-05.4 Isolation Fischeri et artefacts QA Dark / Violet :**
  - `agapornis_fischeri` ne possède aucun catalogue de mutations dans GAP-08-B (`OUT_OF_SCOPE`). Les mutations historiques issues d'introgression restent distinguées de la génétique native.
  - Aucun ID `af_ino` ou `ap_ino` n'a été créé sans preuve suffisante.
  - Les artefacts QA `agap_dark`, `agap_vi`, `EVD-AGAP-GEN-001` et `EVD-AGAP-GEN-002` sont strictement maintenus hors production (non promus).

---

## Détails HRR-06 (Résolution GAP-09 — Isolation interspécifique du moteur génétique)

- **Correction technique de sécurité (RÉSOLUE) :**
  - `GeneticsEngine.predictOffspringOutcomes` et `GeneticsEngine.simulatePairInheritance` appliquent une hiérarchie stricte en 6 paliers de contrôle :
    1. Espèces présentes (père et mère) ? Non → `INSUFFICIENT_INFORMATION`.
    2. Espèces reconnues et non ambiguës (rejet de `agapornis` legacy et des espèces inconnues) ? Non → `INSUFFICIENT_INFORMATION`.
    3. Espèces identiques (`maleSpecies === femaleSpecies`) ? Non → `HYBRID_CROSS_UNSUPPORTED`.
    4. Catalogue génétique disponible pour l'espèce ? Non → `OUT_OF_SCOPE`.
    5. Mutations reconnues par le catalogue homologué de l'espèce ? Non → `UNKNOWN` / `OUT_OF_SCOPE`.
    6. Calcul génétique intra-spécifique appliqué UNIQUEMENT si l'ensemble des 5 paliers précédents est validé.
  - Suppression formelle de tout couplage génétique inter-espèces par égalité textuelle de chaînes de mutations (`maleMutation === femaleMutation` hors-espèce est strictement neutralisé).
  - Aucune logique par substring (`startsWith('agapornis')` ou `includes('agapornis')`) n'est autorisée pour déduire une identité génétique.
  - `simulatePairing` émet les risques `differentSpecies` et `hybridCrossUnsupported` en bloquant toute analyse génétique interspécifique.

- **Absence de moteur d'hybridation homologué (STATUT SCIENTIFIQUE MAINTENU : UNSUPPORTED / HUMAN_REVIEW_REQUIRED) :**
  - Bird Academy ne calcule aucune hybridation interspécifique non homologuée par son référentiel scientifique.
  - Zéro probabilité, zéro pourcentage, zéro phénotype ou génotype théorique n'est généré pour un croisement entre deux espèces distinctes.
  - L'interface utilisateur affiche un état d'alerte explicite : *« Croisement inter-espèces non pris en charge par le référentiel génétique actuel. »* sans recommandations d'accouplement ni pourcentages inventés.
  - Ce point scientifique reste explicitement **HUMAN_REVIEW_REQUIRED** tant qu'un référentiel scientifique d'hybridation n'a pas été formellement validé et documenté avec preuves bibliographiques (GAP-10).

---

## Détails HRR-07 (Remédiation Technique GAP-10-B1)

- **Partie A — regulatoryStatus (RÉSOLUE TECHNIQUEMENT) :**
  - Rendu optionnel (`regulatoryStatus?: MultilingualText`) dans `src/reference/species/types.ts`.
  - Résout les 9 erreurs de typage TS2741 tout en préservant le statut réglementaire légal réel des espèces sauvages protégées (`canari`, `chardonneret_elegant`) et sans inventer de statut fictif pour les 8 espèces domestiques.
  - Zéro crash runtime : tous les composants consommateurs existants opèrent avec gardes conditionnelles ou fallbacks textuels.

- **Partie B — Réconciliation des Evidence IDs orphelins (RÉSOLUE TECHNIQUEMENT SANS INVENTION) :**
  - `EVD-AGAP-01-001` : Corrigé vers l'ID canonique scellé `EVD-AGA-01-001` dans `CanonicalColorGeneticsAuditService.ts` (Cas A - faute de frappe).
  - `EVD-REVIEW-099` : Identifié comme artefact QA / mock pour la fixture d'audit `FIX-UNEXPECTED-DEMO` (Cas C - maintenu hors du registre de production `evidenceRegistry.ts`, zéro promotion).
  - `EVD-CAN-08-007` : Rétabli comme la référence formelle primaire (`SRC-HUTT-1949`) pour la létalité homozygote de la mutation Huppé (`can_cr` / `can_huppe`) dans `CanonicalColorGeneticsContractAdapter.ts`, remplaçant la citation erronée `EVD-CAN-08-005` (Cas A).
  - `EVD-CAN-08-002`, `EVD-CAN-08-005`, `EVD-CAN-08-006` : Références orphelines retirées des définitions sans record canonique existant (Cas B - `UNRESOLVED_EVIDENCE_REFERENCE`, `evidenceIds: []`). Zéro record factice créé.
  - `SRC-COPELLO-1978` : Source bibliographique historique conservée comme inutilisée dans `sources.ts`, zéro fausse preuve inventée.

- **Partie C — Sécurisation identité Colombe diamant (RÉSOLUE TECHNIQUEMENT) :**
  - Identifiant canonique du profil fixé à `colombe_diamant` dans `src/reference/species/colombeDiamant.ts`.
  - Résolution non destructive et idempotente de l'alias legacy `colombe` dans `getBiologicalProfileById` et `CanonicalDataBridgeAdapter.normalizeSpeciesId`.
  - Ajout de la configuration de thème `colombe_diamant` dans `SpeciesTheme.ts`.
  - Données biologiques de Colombe diamant strictement préservées et inchangées (incubation 13j, ponte 2 œufs, sevrage 28j, dimorphisme périorbital, etc.).
  - Statut documentaire scientifique formellement maintenu **HUMAN_REVIEW_REQUIRED** (`draft`) jusqu'à l'homologation documentaire (GAP-10-C).



