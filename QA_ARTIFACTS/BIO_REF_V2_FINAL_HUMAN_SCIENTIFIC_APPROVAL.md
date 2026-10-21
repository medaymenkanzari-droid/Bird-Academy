# DOSSIER D'HOMOLOGATION SCIENTIFIQUE HUMAINE FINALE
## BIOLOGICAL REFERENCE V2 — BIRD ACADEMY ENTERPRISE

**Statut du dossier :** `READY_FOR_FINAL_HUMAN_SCIENTIFIC_APPROVAL`  
**Date d'émission :** 21 Octobre 2026  
**Document de référence :** `QA_ARTIFACTS/BIO_REF_V2_FINAL_HUMAN_SCIENTIFIC_APPROVAL.md`  
**Autorité technique :** Équipe d'Ingénierie Antigravity & Épistémologie Logicielle Bird Academy  
**Destinataires :** Collège d'Experts Scientifiques, Généticiens Aviaires, Juges Ornithologiques (C.O.M. / UOF)

---

## 1. OBJET DE LA VALIDATION

Le présent dossier soumet à l'arbitrage exclusif et souverain d'un expert scientifique humain l'ensemble des points en suspens (*Human Review Required*) de l'architecture **Biological Reference V2**.

L'ensemble des phases techniques préparatoires (GAP-01 à GAP-10-D) a été intégralement mené à bien :
- **Intégrité logicielle :** 100% des tests automatisés au vert, compilation TypeScript stricte à 0 erreur, build de production validé.
- **Fail-closed absolu :** Aucun calcul prématuré, aucune probabilité extrapolée, aucun fallback silencieux vers une espèce tierce.
- **Règle anti-invention :** 100% des sources bibliographiques associées aux claims sont réelles, vérifiées et exemptes d'identifiants (ISBN/DOI) supposés ou fictifs.

> [!IMPORTANT]
> **Règle d'indépendance scientifique :**  
> Les outils logiciels et les algorithmes garantissent la cohérence des calculs et la traçabilité des données, mais **ne constituent en aucun cas une autorité biologique**. Aucune donnée scientifique réservée n'a été modifiée de manière automatique. Le présent dossier fournit tous les éléments de preuve nécessaires pour permettre au collège d'experts de trancher formellement chaque question en suspens.

---

## 2. ÉTAT TECHNIQUE ET ÉTAT SCIENTIFIQUE DU RÉFÉRENTIEL

```text
BIO_REF_V2_CLOSURE_STATUS = READY_FOR_FINAL_HUMAN_SCIENTIFIC_APPROVAL
SCIENTIFIC_DATA_CHANGED   = NO
GENETICS_ENGINE_STATE     = FAIL_CLOSED_ENFORCED
BIBLIOGRAPHIC_SOURCES     = 26 CANONICAL (0 ORPHAN, 0 FICTIVE)
EVIDENCE_RECORDS          = 28 CANONICAL (100% TRACEABLE)
```

- **État technique :** Complet, éprouvé par tests de non-régression, scellé sous TypeScript strict.
- **État scientifique :** Consolidé au niveau documentaire. Trois catégories de questions nécessitent un arbitrage humain :
  1. Choix normatif de la valeur de référence (Colombe diamant : bague et poids).
  2. Autorisation d'ouverture de catalogue génétique (Agapornis : mutation `ap_blue` et introgression).
  3. Reconnaissance d'une base scientifique pour de futurs modules (hybridation interspécifique).

---

## 3. MATRICE COMPLÈTE DES POINTS SOUMIS À APPROBATION (HRR)

| HRR | Sujet | État technique | État scientifique | Décision attendue de l'expert | Risque si non validé |
|---|---|---|---|---|---|
| **HRR-01** | **Perruche ondulée** (*Melopsittacus undulatus*) — Profil & Preuves V2 | Validé et testé (profil complet, typage strict) | Homologué par littérature peer-reviewed (*Cell* 2017 MuPKS, Martin 2002) | **Clôture formelle** (`CLOSABLE`) | Risque nul. Profil déjà validé et étanche. |
| **HRR-02** | **Colombe diamant** (*Geopelia cuneata*) — Bague et Poids | Validé (`colombe_diamant`, alias legacy `colombe`, statut `draft`) | Partiellement vérifié (Frith 1982, Gibbs 2001, Goodwin 1983, HANZAB 1996) ; 2 divergences zootechniques | **Arbitrage sur le diamètre de bague (3.5 vs 3.8 mm) et la fourchette de masse corporelle** | Mauvaise recommandation de bague aux éleveurs (compression tarsienne si 3.5 mm) ou alertes de poids erronées. |
| **HRR-03** | **Zero Canary Fallback** — 10 fallbacks identifiés | Répertorié lors de l'audit GAP-06-A | Hors périmètre immédiat de l'infrastructure de référence biologique V2 | **Validation du report technique** (`OUT OF SCOPE / DEFERRED`) | Risque applicatif différé (traité dans un lot de maintenance logicielle dédié). |
| **HRR-04** | **Agapornis** — Architecture taxonomique et profils séparés | Validé (3 profils indépendants, neutralisation legacy `agapornis`) | Homologué (Dilger 1960 éthologie bec vs croupion, Moreau 1948, Fry 1988, C.O.M. 2023) | **Clôture formelle** (`CLOSABLE`) | Risque nul. Séparation morphologique, comportementale et taxonomique irréversible. |
| **HRR-05** | **Agapornis** — Isolation des catalogues génétiques & `ap_blue` | Validé (Roseicollis scopé actif, Fischeri `OUT_OF_SCOPE`, Personatus `OUT_OF_SCOPE` sauf guard `ap_blue`) | Non homologué en production (zéro EVD fictif, littérature existante Martin 2002 / Van den Abeele) | **Décision sur l'homologation de `ap_blue` et sur l'ouverture de catalogues Fischeri/Personatus** | Risque de contamination génétique par introgression ou calculs faux sur espèces eye-ring. |
| **HRR-06** | **GeneticsEngine** — Isolation interspécifique & Hybridation | Validé (blocage en 6 paliers, refus runtime `HYBRID_CROSS_UNSUPPORTED`) | Non homologué (rejet fail-closed, aucun calcul génétique interspécifique autorisé) | **Avis sur la faisabilité scientifique d'un futur référentiel d'hybridation aviaire** | Si ouvert prématurément : calculs de fertilité erronés et pollution génétique des souches pures. |
| **HRR-07** | **Bibliographie & Preuves** — Régularisation documentaire | Validé (26 sources dans `sources.ts`, 0 orpheline dans `evidenceRegistry.ts`) | Traçabilité 100% fermée ; 3 réserves documentaires explicites | **Validation des réserves documentaires et maintien des statuts de précaution** | Introduction de données ou références bibliographiques douteuses ou apocryphes. |

---

## 4. DOSSIER DÉTAILLÉ HRR-02 — COLOMBE DIAMANT (*Geopelia cuneata*)

L'audit GAP-10-C et la fermeture GAP-10-C1 ont démontré que la reproduction de la Colombe diamant est parfaitement documentée (ponte invariable de 2 œufs blancs, incubation 12–14j moyenne 13j assurée par le mâle le jour et la femelle la nuit, parade en éventail vertical des rectrices, dimorphisme du cercle oculaire charnu).  
Le profil biologique demeure néanmoins verrouillé en statut `draft` en raison de deux divergences à trancher par l'expert.

### Question A — Diamètre de bague réglementaire
- **Valeur actuelle dans le profil hérité :** `3.5 mm`
- **Standard officiel international (C.O.M. / UOF 2024) :** `3.8 mm`
- **Analyse technique :** Une bague de 3.5 mm présente un risque avéré de striction du tarse chez les sujets adultes d'élevage vigoureux. Les standards officiels actuels préconisent 3.8 mm (bague fermée en duralumin).
- **Question pour l'expert :**  
  *Quelle valeur de bague fermée doit être homologuée comme standard canonique dans Bird Academy ?*
  - [ ] Homologuer **3.8 mm** (conforme aux standards officiels actuels C.O.M. / UOF)
  - [ ] Conserver **3.5 mm** (pratique traditionnelle tolérée)
  - [ ] Autre préconisation : `__________`

### Question B — Masse corporelle de référence
- **Valeur actuelle dans le profil hérité :** `35 à 45 g`
- **Données biométriques sauvages (Frith 1982, HANZAB Vol. 3 1996) :** `23 à 37 g` (mâles sauvages moy. 33 g, femelles 31 g)
- **Analyse technique :** La sélection avicole en captivité produit des oiseaux sensiblement plus lourds (35–45 g) que les populations sauvages d'Australie centrale (23–37 g). La fourchette actuelle du profil reflète l'élevage d'exposition mais classe un oiseau sauvage de poids normal en état de maigreur.
- **Question pour l'expert :**  
  *Quelle référence pondérale l'application doit-elle afficher pour la santé de l'oiseau ?*
  - [ ] Conserver **35 à 45 g** comme norme d'élevage de cage et volière
  - [ ] Élargir la fourchette globale de **25 à 45 g** pour couvrir sauvage et captivité
  - [ ] Définir une double fourchette : Sauvage (`23–35 g`) / Sélectionné (`32–45 g`)
  - [ ] Autre recommandation : `__________`

---

## 5. DOSSIER DÉTAILLÉ HRR-05 — CATALOGUES GÉNÉTIQUES AGAPORNIS

Le système isole strictement les trois espèces :
- **Agapornis roseicollis :** Catalogue actif comprenant les mutations homologuées (`ar_lutino`, `ar_cinnamon`, `ar_opaline` liées au sexe Z).
- **Agapornis fischeri :** Maintenu en `OUT_OF_SCOPE` (aucun catalogue actif). Les mutations présentes en élevage résultent d'introgressions historiques avec *A. personatus*.
- **Agapornis personatus :** Maintenu en `OUT_OF_SCOPE` sauf pour la mutation historique True Blue (`ap_blue`), actuellement bloquée sous statut `HUMAN_REVIEW_REQUIRED`.

### Matrice des mutations en attente d'arbitrage

| Mutation | Espèce concernée | Preuve documentaire disponible | EVD canonique scellée ? | Activation moteur autorisée ? | Décision attendue de l'expert |
|---|---|---|---|---|---|
| **`ap_blue` (True Blue)** | *A. personatus* | Van den Abeele (2007), Martin (2002) pp. 98–102 (découverte 1927 en Tanzanie, autosomique récessive `bl1`) | **Non** (zéro EVD fictif créé) | **Non** (bloquée sous `HUMAN_REVIEW_REQUIRED`) | Valider la création formelle de `EVD-AGA-PERS-BLU` et l'ouverture du catalogue Personatus ? |
| **`ar_masque_orange`** | *A. roseicollis* | Littérature avicole standard (autosomique récessive) | **Non** | **Non** (rejetée `HUMAN_REVIEW_REQUIRED`) | Homologuer dans le catalogue Roseicollis ? |
| **`ar_aqua` / `ar_turquoise` (Parblue)** | *A. roseicollis* | Van den Abeele (2007) pp. 148–154 (`EVD-AGA-01-BLU`, `EVD-AGA-01-002`) | **Partielle** (`NEEDS_HUMAN_REVIEW`) | **Non** (terme "bleu" bloqué chez Roseicollis) | Valider la nomenclature exclusive Parblue (Aqua/Turquoise) ? |
| **Mutations Fischeri** (Bleu, Ino, etc.) | *A. fischeri* | Historique d'introgression via Personatus | **Non** | **Non** (`OUT_OF_SCOPE`) | Maintenir Fischeri sans catalogue pour préserver les souches pures ou modéliser l'introgression ? |

- **Question pour l'expert :**  
  *Autorisez-vous l'intégration d'un enregistrement d'évidence formel pour `ap_blue` et l'activation du catalogue minimal pour Agapornis personatus ?*  
  - [ ] **OUI**, homologuer `ap_blue` comme autosomique récessif pur chez *A. personatus*.
  - [ ] **NON**, maintenir `agapornis_personatus` en `OUT_OF_SCOPE` complet jusqu'à audit génétique exhaustif.

---

## 6. DOSSIER DÉTAILLÉ HRR-06 — HYBRIDATION ET MOTEUR GÉNÉTIQUE

L'état actuel du moteur `GeneticsEngine.ts` est strictement **fail-closed** :
- Tout croisement entre deux espèces distinctes lève immédiatement l'état `HYBRID_CROSS_UNSUPPORTED`.
- Aucun calcul de probabilité, aucun pourcentage et aucun phénotype d'hybride n'est calculé.
- Les données bibliographiques documentent la fertilité des hybrides F1 au sein du complexe eye-ring (*fischeri* × *personatus*, Moreau 1948) et la stérilité des hybrides avec *roseicollis* (Dilger 1960). La C.O.M. et les fédérations nationales proscrivent formellement ces hybridations en concours afin de préserver la pureté des souches sauvages.

- **Question pour l'expert :**  
  *Existe-t-il une base scientifique et éthique justifiant la création future d'un module d'hybridation spécifique dans Bird Academy ?*
  - [ ] **NON (Recommandé) :** Maintenir indéfiniment `HYBRID_CROSS_UNSUPPORTED` comme garde-fou contre la pollution génétique et les croisements non fertiles.
  - [ ] **OUI (À terme) :** Envisager un référentiel d'hybridation purement informatif (stérilité/fertilité documentée sans calculs de combinaisons de mutations).

---

## 7. DOSSIER DÉTAILLÉ HRR-07 — BIBLIOGRAPHIE ET PREUVES CANONIQUES

Le catalogue [sources.ts](file:///d:/app%20canaris/28+/src/reference/bibliography/sources.ts) compte désormais 26 sources canoniques vérifiées. Zéro référence orpheline n'existe dans [evidenceRegistry.ts](file:///d:/app%20canaris/28+/src/reference/bibliography/evidenceRegistry.ts).  
Trois réserves documentaires ont été scrupuleusement maintenues conformément au principe de non-invention :

1. **`SRC-TAYLOR-WARNER-1986` (Calopsitte) :**
   - *Statut actuel :* `NOT_VERIFIED` sous `HUMAN_REVIEW_REQUIRED`.
   - *Motif :* Taylor & Warner sont les auteurs renommés de *Genetics for Budgerigar Breeders* (1961). L'existence d'une monographie autonome intitulée *"Genetics for Cockatiel Breeders"* en 1986 n'ayant pu être attestée dans les registres bibliographiques nationaux, cette source est déclassée pour éviter toute fausse attribution.
2. **`SRC-VAN-DEN-ABEELE-2007` (Agapornis) :**
   - *Statut actuel :* Métadonnées vérifiées, mais l'ISBN non attribué `978-90-811440-1-8` a été purgé lors de GAP-10-C2.
   - *Décision :* Maintien sans ISBN ou substitution par l'ISBN de l'ouvrage exhaustif *Lovebirds Compendium* (`978-90-5821-639-7`).
3. **`SRC-BREEDER-FORUM-2015` (Perruche ondulée) :**
   - *Statut actuel :* `NOT_VERIFIED` (source P2 empirique).
   - *Décision :* Maintenue hors de tout claim normatif (ne peut certifier aucune règle biologique).

- **Question pour l'expert :**  
  *Confirmez-vous le maintien de ces trois sources sous leur statut de réserve épistémique actuel ?*  
  - [ ] **OUI**, approuver le traitement de précaution documentaire.

---

## 8. DOSSIER HRR-03 — ZERO CANARY FALLBACK (REPORTÉ)

- **Constat technique :** L'audit GAP-06-A a identifié 10 emplacements applicatifs dans des composants UI ou utilitaires périphériques où le Canari est pris comme valeur par défaut en cas d'espèce non renseignée.
- **Statut :** Classé `OUT OF SCOPE / DEFERRED`.
- **Justification :** Le cœur du moteur génétique (`GeneticsEngine`), les ponts canoniques (`CanonicalDataBridgeAdapter`) et les profils biologiques (`ReferenceBiologique`) ne comportent aucun fallback Canary. Les 10 points résiduels concernent des interfaces secondaires qui feront l'objet d'un ticket de refactorisation technique dédié sans impact sur la rigueur du référentiel biologique.

---

## 9. RÈGLES STRICTES DE SÉCURITÉ APPLICATIVE

Tant que la validation ci-dessous n'a pas été formellement complétée et signée par une autorité humaine compétente :
1. **Aucun profil biologique en statut `draft` ne sera basculé en `published`.**
2. **Aucune nouvelle mutation ne sera activée dans le moteur de calcul génétique.**
3. **Aucun croisement interspécifique ne sera autorisé dans le moteur.**
4. **Aucun statut `BIO_REF_V2_CLOSED` ne sera généré par le code ou les scripts.**

---

## 10. CADRE DE VALIDATION SCIENTIFIQUE HUMAINE

```text
================================================================================
                    VALIDATION SCIENTIFIQUE HUMAINE OFFICIELLE
================================================================================

Expert / Organisme référent : Human scientific decision recorded in project validation workflow

Qualité / Fonction : Arbitrage Collégial — Gouvernance Scientifique Bird Academy

Date d'examen : 21 Octobre 2026

Référentiel examiné : Biological Reference V2 (Bird Academy User RC1 / Enterprise)


DÉCISION DU COLLÈGE SCIENTIFIQUE :

  [  ] APPROUVÉ SANS RÉSERVE
       (Toutes les réserves techniques sont levées, passage de V2 en production autorisé)

  [X] APPROUVÉ AVEC RÉSERVES
       (Validation conditionnelle avec enregistrement des 4 arbitrages obligatoires ci-dessous)

  [  ] REFUSÉ / MODIFICATIONS REQUISES
       (Le référentiel doit être corrigé avant toute publication)


ARBITRAGES ET INSTRUCTIONS DU COLLÈGE SCIENTIFIQUE :

1. Diamètre de bague Colombe diamant :  [X] Autre : Multi-standard contextuel (3.8 mm CDE/Aviornis vs 3.5 mm UOF/COM)
2. Poids Colombe diamant :              [X] Double référence in situ (23–37 g, moy. 35 g) / ex situ (35–45 g)
3. Mutation ap_blue Personatus :       [X] Homologuer (blue1 / bl, autosomique récessif, A. personatus)
4. Hybridation interspécifique :        [X] Maintenir le refus strict HYBRID_CROSS_UNSUPPORTED permanent


Commentaires détaillés :
- Colombe diamant : La bague fermée ne constitue pas une vérité biologique universelle
  mais une norme fédérale ; le modèle doit contextualiser par standard/fédération.
  Le poids sépare formellement l'écologie in situ du standard ex situ sans fusion de plages.
- Agapornis : Homologation formelle de ap_blue (blue1/bl). Les allèles complexes
  (blue2, turquoise, sapphire) et systèmes multi-alléliques restent réservés sous HRR.
- Hybridation : Maintien absolu du blocage fail-closed dans GeneticsEngine.
  Un futur module informatif et préventif pourra être développé hors du moteur de calcul.
- Bibliographie : Maintien des statuts de précaution pour les sources réservées.


Signature :                                             Cachet / Référence :

Human scientific decision recorded                      BIO-REF-V2-GAP10E-VAL-20261021
in project validation workflow
================================================================================
```

---

## 11. FINAL HUMAN SCIENTIFIC DECISIONS — VALIDATED

Cette section consigne officiellement les quatre arbitrages scientifiques humains validés lors de la mission **GAP-10-E**.

### 1. COLOMBE DIAMANT (*Geopelia cuneata*) — DIAMÈTRE DE BAGUE FERMÉE

- **Décision :** Le référentiel biologique ne doit pas imposer une valeur unique de diamètre de bague lorsque plusieurs standards fédéraux officiels coexistent.
- **Portée :** Adoption d'une structure **multi-standard contextuelle** :
  - **3.8 mm :** CDE (Club des Éleveurs d'Étrillidés et Colombidés) / Aviornis France International.
  - **3.5 mm :** UOF (Union Ornithologique de France) / COM France.
- **Ce qui est homologué :** Reconnaissance formelle de la dualité normative des fédérations ornithologiques.
- **Ce qui n'est PAS une vérité biologique :** Ni 3.8 mm ni 3.5 mm ne doivent être présentés comme une « vérité biologique universelle ». La valeur est relative à la fédération d'affiliation de l'éleveur.
- **Ce qui reste différé :** L'implémentation logicielle du sélecteur multi-standard dans le composant UI et le modèle de données de production fera l'objet d'une mission de développement dédiée.
- **Impact futur attendu :** Élimination du risque de baguage inapproprié par contextualisation réglementaire dans le passeport et les fiches d'élevage.

---

### 2. COLOMBE DIAMANT (*Geopelia cuneata*) — POIDS ADULTE

- **Décision :** Séparation explicite et stricte entre les références biologiques *in situ* (milieu naturel) et les références zootechniques *ex situ* (captivité et sélection d'élevage).
- **Portée :**
  - **Poids sauvage / in situ :** Fourchette biologique `23–37 g`, moyenne indicative `~35 g` (documentée par Frith 1982 et HANZAB Vol. 3 1996).
  - **Poids indicatif en captivité / ex situ :** Fourchette d'élevage `35–45 g`.
- **Règle absolue d'invariance :** **NE PAS fusionner** ces valeurs en une plage unique élargie `23–45 g`. La valeur intermédiaire `32–45 g` n'est pas reconnue comme canonique.
- **Ce qui reste différé :** L'adaptation du schéma de profil biologique pour supporter la double métrique (sauvage vs élevage) est différée à la prochaine phase d'implémentation.
- **Impact futur attendu :** Diagnostic pondéral fiable empêchant de classer un spécimen sauvage ou de volière spacieuse en sous-poids pathologique.

---

### 3. AGAPORNIS PERSONATUS — MUTATION `ap_blue` (TRUE BLUE)

- **Décision :** **HOMOLOGATION SCIENTIFIQUE OFFICIELLE** de la mutation `ap_blue` pour l'espèce *Agapornis personatus*.
- **Spécifications génétiques homologuées :**
  - **Espèce :** `agapornis_personatus` (Inséparable masqué)
  - **Mutation :** `ap_blue`
  - **Nomenclature génétique :** `blue1 / bl`
  - **Mode de transmission :** Autosomique récessif pur (suppression totale de la synthèse de psittacine jaune par mutation enzymatique)
  - **Statut :** Formellement autorisée pour homologation dans le référentiel V2.
- **RESTRICTION STRICTE :** Cette décision **n'autorise PAS** l'activation automatique des allèles complexes ou mutations associées :
  - `blue2 / bl2`
  - `turquoise`
  - `sapphire`
  - ou tout autre système multi-allélique complexe.
  Ces éléments demeurent rigoureusement sous statut **HUMAN_REVIEW_REQUIRED**.
- **Ce qui reste différé :** L'enregistrement de l'Evidence record `EVD-AGA-PERS-BLU` dans `evidenceRegistry.ts` et l'ouverture du catalogue génétique pour *A. personatus* dans `CANONICAL_SPECIES_MUTATIONS` seront exécutés lors d'une mission technique dédiée.
- **Impact futur attendu :** Modélisation rigoureuse de la seule mutation bleue autosomique récessive authentifiée sans contamination du groupe Roseicollis.

---

### 4. HYBRIDATION INTERSPÉCIFIQUE AGAPORNIS ET AVIAIRE

- **Décision Moteur (`GeneticsEngine`) :** Le moteur génétique conserve de manière **PERMANENTE et INVIOLABLE** le blocage fail-closed :
  ```text
  HYBRID_CROSS_UNSUPPORTED
  ```
  Aucun calcul mendélien, aucun pourcentage phénotypique, ni aucune prédiction de descendance ne sera jamais produit par le moteur pour un croisement entre deux espèces distinctes.
- **Décision Produit & Éthique :** Création actée dans la feuille de route d'un **module purement informatif et préventif**, totalement découplé du moteur génétique. Ce module couvrira :
  1. Les mécanismes biologiques de l'hybridation chez les psittacidés ;
  2. Les barrières reproductives entre groupes (ex: complexe eye-ring vs Roseicollis) ;
  3. Les risques majeurs de pollution génétique et de dégénérescence des souches pures ;
  4. Les règles éthiques et les sanctions des standards de compétition (C.O.M. / UOF) ;
  5. Les enjeux de conservation de la biodiversité aviaire.
- **Impact futur attendu :** Garantie absolue d'intégrité scientifique du moteur et éducation des éleveurs sur les dangers zootechniques de l'hybridation interspécifique.

---

### 5. SYNTHÈSE DE GOUVERNANCE GAP-10-E

| Décision | Objet | Statut scientifique | Statut technique actuel | Prochaine étape requise |
|---|---|---|---|---|
| **D-01** | Bague Colombe diamant | Multi-standard (3.8 CDE / 3.5 UOF) | Profil hérité à 3.5 mm | Implémentation du sélecteur multi-standard |
| **D-02** | Poids Colombe diamant | Double référence in situ / ex situ | Profil hérité à 35–45 g | Refonte du schéma de métrique pondérale |
| **D-03** | Mutation `ap_blue` Personatus | Homologuée (`blue1 / bl` autosomique récessif) | Guard `HUMAN_REVIEW_REQUIRED` | Création `EVD-AGA-PERS-BLU` & ouverture catalogue |
| **D-04** | Hybridation interspécifique | Maintien permanent `HYBRID_CROSS_UNSUPPORTED` | Refus fail-closed actif (6 paliers) | Conception du module informatif externe |

