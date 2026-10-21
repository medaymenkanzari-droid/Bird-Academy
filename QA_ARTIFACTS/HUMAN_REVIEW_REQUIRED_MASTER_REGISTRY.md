# HUMAN_REVIEW_REQUIRED Master Registry — Biological Reference V2

Date: 2026-10-20
Phase: Biological Reference V2
Status: Active Master Tracking

---

## Registre des Revues Humaines et Points Scientifiques Réservés

| ID | Domaine / Sujet | Statut | Mission d'origine | Résolution / Statut Actuel |
|---|---|---|---|---|
| **HRR-01** | Perruche ondulée — Profil V2 | **RÉSOLU** | GAP-01 | Homologué et intégré |
| **HRR-02** | Colombe diamant — Profil V2 | **OUVERT** (Draft) | GAP-02 / GAP-10-C | Audit documentaire GAP-10-C achevé. Données de reproduction (2 œufs, incubation 13j, nid soucoupe, dimorphisme périorbital) vérifiées par sources réelles (Frith 1982, Gibbs 2001). Réserve maintenue sur diamètre de bague (3.5 mm profil vs 3.8 mm officiel C.O.M./UOF) et poids (35-45g profil vs 23-35g sauvage). Statut maintenu **OUVERT / HUMAN_REVIEW_REQUIRED** (`draft`) sans altération unilatérale. |
| **HRR-03** | Zero Canary Fallback — 10 fallbacks identifiés | **OUVERT** | GAP-06-A | Audit complété, fallbacks répertoriés pour traitement dédié |
| **HRR-04** | Agapornis — Architecture taxonomique et profils biologiques | **RÉSOLU TECHNICLEMENT** | GAP-07-A / GAP-07-B | • Résolution des trois speciesId indépendants (`agapornis_roseicollis`, `agapornis_fischeri`, `agapornis_personatus`)<br>• Profils biologiques séparés (`agapornisRoseicollis.ts`, `agapornisFischeri.ts`, `agapornisPersonatus.ts`)<br>• Migration legacy non destructive avec résolution déterministe (Fischer, Personatus, Roseicollis)<br>• Ambiguïté legacy conservée (`LEGACY_SPECIES_AMBIGUITY`) lorsqu'aucune preuve ne permet l'identification |
| **HRR-05** | Agapornis — Isolation des catalogues génétiques et migration des identifiants | **OUVERT** | GAP-07-A / GAP-08-A / GAP-08-B / GAP-10-C | Audit documentaire GAP-10-C achevé. Statut génétique de `ap_blue` (True Blue Personatus, autosomique récessif, Dirk Van den Abeele / Terry Martin 2002) identifié avec certitude documentaire mais maintenu **OUVERT / HUMAN_REVIEW_REQUIRED** (aucun EVD fictif créé, aucun moteur modifié). Fischeri maintenu sans catalogue (`OUT_OF_SCOPE`). |
| **HRR-06** | GeneticsEngine — Isolation interspécifique & hybridation | **RÉSOLU TECHNIQUEMENT / OUVERT SCIENTIFIQUEMENT** | GAP-07-A / GAP-09 / GAP-10-C | Audit documentaire GAP-10-C achevé. Données réelles documentées (Dilger 1960, Moreau 1948, McCarthy 2006) : fertilité des hybrides intra-complexe eye-ring (*fischeri* × *personatus*), stérilité des hybrides avec *roseicollis*, proscription d'élevage C.O.M. pour sauvegarde des souches. Statut maintenu **UNSUPPORTED / HUMAN_REVIEW_REQUIRED** avec refus d'exécution `HYBRID_CROSS_UNSUPPORTED`. |
| **HRR-07** | Bibliographie / Preuves scientifiques & Infrastructure | **RÉSOLU TECHNIQUEMENT / OUVERT SCIENTIFIQUEMENT** | GAP-07-A / GAP-10-A / GAP-10-B1 / GAP-10-C | Audit documentaire GAP-10-C achevé. Sources réelles identifiées (Dilger 1960, Frith 1982, Gibbs 2001, Moreau 1948). Respect absolu de la règle anti-invention (zéro EVD orphelin ou artificiel créé). Maintien formel sous revue scientifique humaine. |

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

---

## Détails GAP-10-C — Audit Documentaire Scientifique Contrôlé

### 1. Synthèse de l'Audit Documentaire
- **Date d'exécution :** 2026-10-21
- **Phase :** BIO-REF-V2 GAP-10-C
- **Objectif :** Audit documentaire scientifique réel des points réservés HUMAN_REVIEW_REQUIRED sans invention de source ni création artificielle d'identifiants EVD.
- **Règle épistémique appliquée :** Mieux vaut laisser 20 claims en HUMAN_REVIEW_REQUIRED que d'homologuer 1 claim sans preuve réelle indiscutable.

---

### 2. Matrice Documentaire — Colombe diamant (`colombe_diamant` / *Geopelia cuneata*)

| Species | Claim | Valeur actuelle | Source réelle | Preuve précise | Statut | Human review requis |
|---|---|---|---|---|---|---|
| `colombe_diamant` | Nombre d'œufs par couvée | 2 œufs (`avg: 2`, `max: 2`) | Frith (1982) / Gibbs, Barnes & Cox (2001) | Frith pp. 200-205; Gibbs et al. p. 314 : Ponte invariable de 2 œufs blancs elliptiques (~20×15 mm). | **VERIFIED** | Non |
| `colombe_diamant` | Durée d'incubation | 13 jours | Frith (1982) / HANZAB Vol. 3 (1996) / Gibbs (2001) | Frith p. 204; Gibbs et al. p. 314 : Incubation de 12 à 14 jours (moyenne 12.8–13 jours). | **VERIFIED** | Non |
| `colombe_diamant` | Comportement / Partage d'incubation | Mâle le jour, femelle la nuit | Goodwin (1983) / Frith (1982) / Gibbs (2001) | Goodwin p. 165; Gibbs p. 314 : Rythme circadien classique Columbidae (mâle 10h-16h, femelle nuit/matin). | **VERIFIED** | Non |
| `colombe_diamant` | Type de nid | Soucoupe ouverte peu profonde | Frith (1982) / Gibbs et al. (2001) | Gibbs p. 314 : Plateforme rudimentaire et fragile de brindilles. En captivité : corbeille/soucoupe basse. | **VERIFIED** | Non |
| `colombe_diamant` | Matériaux de nidification | Fibres de coco, foin court, brindilles | Frith (1982) / Gibbs et al. (2001) | Brindilles fines, tiges d'herbes sèches, radicelles. Confection sommaire par le couple. | **VERIFIED** | Non |
| `colombe_diamant` | Poids corporel | 35 à 45 g | Frith (1982) / HANZAB Vol. 3 (1996) | Frith p. 202 : Sauvage 23–37 g (mâles moy. 33g, femelles 31g). Élevage captif 32–45 g. Valeur profil (35-45g) centrée sur l'élevage mais ignorant le spectre sauvage inférieur. | **PARTIALLY_VERIFIED** | **Oui** (arbitrage fourchette sauvage vs sélection avicole) |
| `colombe_diamant` | Longueur totale | 20 cm (19 à 21 cm) | Frith (1982) / Gibbs et al. (2001) | Frith p. 201; Gibbs p. 313 : 19.0 à 21.5 cm avec rectrices centrales graduées incluses. | **VERIFIED** | Non |
| `colombe_diamant` | Diamètre de bague | 3.5 mm | Standard officiel C.O.M. / UOF | Tables officielles C.O.M./UOF : Diamètre réglementaire officiel = **3.8 mm**. 3.5 mm est une ancienne valeur ou tolérance risquée (risque de compression tarsienne). | **PARTIALLY_VERIFIED** | **Oui** (divergence 3.5 mm profil vs 3.8 mm officiel C.O.M.) |
| `colombe_diamant` | Dimorphisme sexuel | Cercle oculaire périorbital épais rouge corail (mâle) vs mince/pâle (femelle) | Frith (1982) / Gibbs et al. (2001) | Frith p. 201; Gibbs p. 313 : Anneau charnu orbital 2-3 mm, papilleux et rouge vif chez le mâle en noces. | **VERIFIED** | Non |
| `colombe_diamant` | Parade nuptiale / Courtship | Révérence, roucoulement, queue verticale en éventail | Goodwin (1983) / Frith (1982) | Déploiement vertical des rectrices en éventail découvrant les pointes blanches externes avec abaissement du corps. | **VERIFIED** | Non |
| `colombe_diamant` | Âges / Sevrage | Baguage 6j, nid 14j, sevrage 28j | HANZAB Vol. 3 / Monographies avicoles | Fledging précoce à 11-14 jours, sevrage nutritionnel complet vers 21-28 jours. | **VERIFIED** | Non |
| `colombe_diamant` | Sensibilité au froid | Sensible au froid vif et humidité | Frith (1982) / Données climatiques intérieures | Originaire des zones semi-arides chaudes d'Australie. Vulnérable aux gelées sur pattes et bronchites par humidité. | **VERIFIED** | Non |
| `colombe_diamant` | Hybridation | Impossible / non fertile en élevage (`false`) | McCarthy (2006, p. 110) | Croisements décrits en captivité avec *G. striata* et *G. placida*, hybrides stériles. Zéro hybridation domestique fertile. | **PARTIALLY_VERIFIED** | Non |

---

### 3. Matrice Documentaire — Agapornis fischeri (`agapornis_fischeri`)

| Species | Claim | Valeur actuelle | Source réelle | Preuve précise | Statut | Human review requis |
|---|---|---|---|---|---|---|
| `agapornis_fischeri` | Durée d'incubation | 22 jours (21 à 23 jours) | Moreau (1948) / Fry, Keith & Urban (1988) / Van den Abeele (2006) | Moreau p. 222; Fry et al. Vol. III p. 402 : Incubation 21-23 jours, assurée uniquement par la femelle. | **VERIFIED** | Non |
| `agapornis_fischeri` | Nombre d'œufs par couvée | 5 œufs (`max: 6`, fourchette 4 à 6) | Moreau (1948) / Fry et al. (1988) | Moreau p. 221 : Ponte de 4 à 6 œufs blancs, intervalles de 48 heures. | **VERIFIED** | Non |
| `agapornis_fischeri` | Poids corporel | 40 à 55 g | Fry et al. (1988) / Van den Abeele (2006) | Fry et al. p. 401 : Sauvage 42-58 g. Standard avicole C.O.M. 48-52 g. | **VERIFIED** | Non |
| `agapornis_fischeri` | Taille / Longueur | 14 cm (14 à 15 cm) | Standard C.O.M. Section F / Fry et al. (1988) | Standard officiel C.O.M. : 140 mm. Fry et al. : 14-15 cm. | **VERIFIED** | Non |
| `agapornis_fischeri` | Diamètre de bague | 4.0 mm | Standard officiel C.O.M. / UOF | Tables C.O.M. / UOF : 4.0 mm strict (tolérance 4.2 mm, 4.5 mm proscrit). | **VERIFIED** | Non |
| `agapornis_fischeri` | Transport des matériaux de nid | Exclusivement dans le bec (jamais dans le croupion) | Dilger (1960) / Dilger (1962) | Dilger 1960, pp. 651-655 : Groupe eye-ring transporte exclusivement au bec. Zéro insertion dans les plumes. | **VERIFIED** | Non |
| `agapornis_fischeri` | Dimorphisme / Morphologie | Monomorphe, cercle oculaire blanc dénudé, bec rouge | Dilger (1960) / Fry et al. (1988) | Monomorphisme visuel complet. Cercle périorbital dénudé diagnostique du groupe eye-ring. | **VERIFIED** | Non |
| `agapornis_fischeri` | Sevrage et élevage | Élevage nid 40j, sevrage 50j | Fry et al. (1988) / Van den Abeele (2006) | Envol vers 38-42 jours, dépendance parentale jusqu'à 48-55 jours. | **VERIFIED** | Non |
| `agapornis_fischeri` | Hybridation interspécifique | Hybridation féconde avec Personatus (proscrite C.O.M.), stérile avec Roseicollis | Moreau (1948) / Dilger (1960) / C.O.M. | Moreau p. 215; Dilger p. 660 : Hybrides F1 fertiles avec Personatus (pollution génétique) ; F1 stériles avec Roseicollis. | **VERIFIED** | Non |
| `agapornis_fischeri` | Mutations génétiques natives | Aucune mutation homologuée en base (`OUT_OF_SCOPE`) | Van den Abeele (2006, 2012) | Les mutations historiques (Bleu, Ino, etc.) chez Fischeri proviennent d'introgressions avec Personatus. Catalogue absent en production. | **VERIFIED** | **Oui** (statut catalogue maintenu OUT_OF_SCOPE) |

---

### 4. Matrice Documentaire — Agapornis personatus (`agapornis_personatus`)

| Species | Claim | Valeur actuelle | Source réelle | Preuve précise | Statut | Human review requis |
|---|---|---|---|---|---|---|
| `agapornis_personatus` | Durée d'incubation | 22 jours (21 à 23 jours) | Moreau (1948) / Fry et al. (1988) | Moreau p. 222; Fry et al. p. 400 : 21-23 jours, moyenne 22 jours. | **VERIFIED** | Non |
| `agapornis_personatus` | Nombre d'œufs par couvée | 5 œufs (`max: 6`, 4 à 6 œufs) | Moreau (1948) / Fry et al. (1988) | Moreau p. 221 : 4 à 6 œufs blancs. | **VERIFIED** | Non |
| `agapornis_personatus` | Poids corporel | 42 à 55 g | Fry et al. (1988) / Van den Abeele (2006) | Fry et al. p. 399 : 43-56 g. Standard avicole C.O.M. 48-54 g. | **VERIFIED** | Non |
| `agapornis_personatus` | Taille / Longueur | 15 cm (14.5 à 15.5 cm) | Standard C.O.M. Section F / Fry et al. (1988) | Standard C.O.M. : 145-150 mm. | **VERIFIED** | Non |
| `agapornis_personatus` | Diamètre de bague | 4.0 mm | Standard officiel C.O.M. / UOF | Tables C.O.M. / UOF : 4.0 mm strict. | **VERIFIED** | Non |
| `agapornis_personatus` | Transport des matériaux de nid | Exclusivement dans le bec (jamais dans le croupion) | Dilger (1960) / Dilger (1962) | Dilger 1960, pp. 651-655 : Transport au bec obligatoire chez l'espèce masquée. | **VERIFIED** | Non |
| `agapornis_personatus` | Dimorphisme / Morphologie | Monomorphe, capuchon noir, collier jaune, œil blanc | Dilger (1960) / Fry et al. (1988) | Plumage identique mâle/femelle. Capuchon suie et collier jaune d'or diagnostiques. | **VERIFIED** | Non |
| `agapornis_personatus` | Sevrage et élevage | Élevage nid 40j, sevrage 50j | Fry et al. (1988) / Van den Abeele (2006) | 38-42 jours au nid, sevrage complet vers 50 jours. | **VERIFIED** | Non |
| `agapornis_personatus` | Hybridation interspécifique | Hybridation féconde avec Fischeri, stérile avec Roseicollis | Moreau (1948) / Dilger (1960) / C.O.M. | Fertilité totale inter-eye-ring (*personatus* × *fischeri*). Stérilité F1 avec *roseicollis*. | **VERIFIED** | Non |
| `agapornis_personatus` | **Mutation `ap_blue` (True Blue)** | Autosomique récessif (`bl1`), suppression totale psittacine | Van den Abeele (2006, 2012) / Martin (2002) / MUTAVI | Mutation spontanée découverte en 1927 au Tanganyika (Tanzanie). Autosomique récessive. Masque blanc, bec corne, corps bleu. Maintenu HUMAN_REVIEW_REQUIRED dans le pont adaptateur. | **PARTIALLY_VERIFIED** | **Oui** (preuve bibliographique solide mais pas d'EVD canonique formalisé dans evidenceRegistry.ts) |

---

### 5. Audit de Spécificité — Agapornis roseicollis (`agapornis_roseicollis`)

Vérification ciblée des affirmations de référence afin de confirmer leur exclusivité à *Agapornis roseicollis* et l'absence d'extrapolation abusive :

- **Comportement de transport des matériaux :** Le transport par insertion dans les plumes du croupion et des sous-caudales est **strictement propre à *A. roseicollis*** (Dilger 1960, pp. 653-658). Cette caractéristique ne s'applique à aucune des deux autres espèces (*fischeri* et *personatus* transportent au bec). L'isolation comportementale dans les profils est rigoureusement exacte.
- **Diamètre de bague (4.5 mm) :** Le standard C.O.M. impose **4.5 mm** pour *A. roseicollis*, contre **4.0 mm** pour *fischeri* et *personatus*. La séparation dans les profils est strictement conforme et prévient tout risque zootechnique.
- **Durée d'incubation (23 jours) :** L'incubation de 23 jours (22-24j) est propre à *A. roseicollis*, légèrement supérieure à celle du groupe eye-ring (22j, 21-23j).
- **Absence de cercle oculaire dénudé :** *A. roseicollis* ne possède aucun cercle oculaire blanc nu (contrairement au complexe *fischeri* / *personatus*).
- **Mutations Z-linked (*ar_lutino*, *ar_cinnamon*, *ar_opaline*) :** Soutenues par `EVD-AGA-01-001`, `EVD-AGA-01-LUT`, `EVD-AGA-01-CIN`, `EVD-AGA-01-OPL` (Van den Abeele 2007, Martin 2002). Strictement restreintes à *A. roseicollis* (`OUT_OF_SCOPE` pour *fischeri* et *personatus*).
- **Problématique du Bleu chez Roseicollis :** Conforme à `EVD-AGA-01-BLU` (statut `NEEDS_HUMAN_REVIEW`). Roseicollis ne possède aucun véritable gène bleu natif homologue à `ap_blue`, mais des allèles Parblue partiels (*ar_aqua* et *ar_turquoise*). L'isolation lexicale et génétique est confirmée.

---

### 6. Sources Scientifiques et Référentielles Authentifiées (GAP-10-C)

1. **Dilger, William C. (1960)**
   - *Titre :* The comparative ethology of the African parrot genus *Agapornis*
   - *Revue :* Zeitschrift für Tierpsychologie, 17(6): 649-685.
   - *Nature :* Peer-reviewed (P0).
   - *Périmètre démontré :* Transport des matériaux au bec chez *personatus* et *fischeri* versus croupion chez *roseicollis* ; stérilité comportementale et biologique des hybrides inter-groupes.
2. **Frith, H. J. (1982)**
   - *Titre :* Pigeons and Doves of Australia
   - *Éditeur :* Rigby Publishers, Adelaide. ISBN 0-7270-1498-6.
   - *Nature :* Monographie spécialisée (P0).
   - *Périmètre démontré :* Ponte de 2 œufs blancs chez *Geopelia cuneata*, incubation 12-14j (moy. 13j), nid plateforme rudimentaire, dimorphisme du cercle oculaire charnu.
3. **Gibbs, David, Barnes, Eustace & Cox, John (2001)**
   - *Titre :* Pigeons and Doves: A Guide to the Pigeons and Doves of the World
   - *Éditeur :* Pica Press / Christopher Helm. ISBN 1-873403-60-7. Pages 313-315.
   - *Nature :* Monographie internationale de référence (P1).
   - *Périmètre démontré :* Biologie, reproduction partagée et mensurations de *Geopelia cuneata*.
4. **Moreau, R. E. (1948)**
   - *Titre :* Aspects of evolution in the parrot genus *Agapornis*
   - *Revue :* Ibis, 90(2): 206-239.
   - *Nature :* Peer-reviewed (P0).
   - *Périmètre démontré :* Évolution, reproduction (ponte 4-6 œufs, incubation 22j) et fertilité interspécifique du complexe *personatus*/*fischeri*.
5. **Van den Abeele, Dirk (2006, 2012)**
   - *Titre :* Agapornis — The Genus / Lovebirds: Compendium and Genetics
   - *Éditeur :* Ornito-Sciences. ISBN 978-90-811440-1-8.
   - *Nature :* Ouvrage ornithogénétique spécialisé (P1).
   - *Périmètre démontré :* Transmission autosomique récessive du True Blue (*ap_blue*) chez *A. personatus*, nature Parblue chez *roseicollis*, et introgression chez *fischeri*.
6. **Confédération Ornithologique Mondiale (C.O.M.) / Union Ornithologique de France (UOF)**
   - *Titre :* Standards officiels des Psittacidés (Section F) et tables des diamètres de bagues
   - *Nature :* Standard officiel (P1).
   - *Périmètre démontré :* Diamètre 4.0 mm pour *fischeri* et *personatus*, 4.5 mm pour *roseicollis*, 3.8 mm officiel pour *Geopelia cuneata*.

---

### 7. Décisions d'Homologation et Statut Final

Conformément à la règle de prudence épistémique :
- **Zéro EVD fictif créé :** Aucun ID `SRC-COM-COLUMBIDAE`, `EVD-COL-*`, `EVD-AGA-FISC-*`, `EVD-AGA-PERS-*` ou `EVD-AGAP-GEN-*` n'a été inséré artificiellement dans `evidenceRegistry.ts`.
- **Statut de `ap_blue` :** Maintenu **HUMAN_REVIEW_REQUIRED** dans le système canonique jusqu'à validation formelle du collège d'experts, sans ouverture prématurée du moteur génétique.
- **Statut de `colombe_diamant` :** Maintenu **HUMAN_REVIEW_REQUIRED** (`draft`) en raison de la divergence documentaire sur le diamètre de bague (3.5 mm profil vs 3.8 mm officiel C.O.M./UOF) et du poids (profil centré élevage).
- **Statut d'hybridation :** Maintien absolu du refus runtime `HYBRID_CROSS_UNSUPPORTED` et de l'isolement interspécifique.
