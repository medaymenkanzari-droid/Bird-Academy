# RAPPORT D'AUDIT COMPLET — MISSION BIOLOGICAL-PASSPORT-AUDIT-01

**Date :** 27 Août 2026  
**Auditeur :** Antigravity AI  
**Objet :** Audit architectural, fonctionnel, multilingue et dynamique du « Passeport Biologique Bird » (Bird Biological Passport)  
**Fichier :** `BIOLOGICAL_PASSPORT_AUDIT_REPORT.md`  
**Statut :** AUDIT COMPLET TERMINÉ — CODE SOURCE STRICTEMENT INTACT  

---

## 1. COMPOSANTS RESPONSABLES DU PASSEPORT

L'inspection exhaustive du code a permis d'isoler l'architecture du Passeport :

* **Composant conteneur principal :**  
  [`BirdPassportView.tsx`](file:///d:/app%20canaris/28+/src/features/birds/components/BirdPassportView.tsx) (`src/features/birds/components/BirdPassportView.tsx`)  
  Il orchestre l'affichage du Passeport d'un oiseau individuel.
* **Composant Modale d'accès :**  
  [`BirdDetailModal.tsx`](file:///d:/app%20canaris/28+/src/components/BirdDetailModal.tsx) (`src/components/BirdDetailModal.tsx`)  
  Enveloppe `BirdPassportView` dans un `<AppModal title="Passeport Biologique Individuel" size="xl">`.
* **Sous-composants spécialisés :**
  1. [`BirdHeroPassportCard.tsx`](file:///d:/app%20canaris/28+/src/features/birds/components/BirdHeroPassportCard.tsx) : Bannière d'identité de l'oiseau (photo, bague, sexe, statut, âge, localisation/cage, actions rapides).
  2. [`BirdBiologicalKpiRow.tsx`](file:///d:/app%20canaris/28+/src/features/birds/components/BirdBiologicalKpiRow.tsx) : Ligne de 4 KPI (Consanguinité Wright COI, Statut sanitaire, Palmarès C.O.M., Descendance directe).
  3. [`BirdTabsNavigation.tsx`](file:///d:/app%20canaris/28+/src/features/birds/components/BirdTabsNavigation.tsx) : Système d'onglets (Généalogie, Standard C.O.M., Santé & Soins, Palmarès & Concours, Galerie & Documents).
  4. [`BirdStandardComTab.tsx`](file:///d:/app%20canaris/28+/src/features/birds/components/BirdStandardComTab.tsx) : Grille d'évaluation morphologique COM sur 100 points.
  5. [`BirdPalmaresTab.tsx`](file:///d:/app%20canaris/28+/src/features/birds/components/BirdPalmaresTab.tsx) : Palmarès d'exposition et certificats.
  6. [`BirdPassportHealthTab.tsx`](file:///d:/app%20canaris/28+/src/features/birds/components/BirdPassportHealthTab.tsx) / [`BirdHealthCareTab.tsx`](file:///d:/app%20canaris/28+/src/features/birds/components/BirdHealthCareTab.tsx) : Onglet santé.
  7. [`BirdQrCodeModal.tsx`](file:///d:/app%20canaris/28+/src/features/birds/components/BirdQrCodeModal.tsx) : Modale de génération et téléchargement du Smart QR Code.
  8. [`PedigreeTreeViewer.tsx`](file:///d:/app%20canaris/28+/src/components/design-system/PedigreeTreeViewer.tsx) : Arbre généalogique ascendant interactif.

---

## 2. COMPOSANTS PARENTS ET DÉCLENCHEURS

Le Passeport Biologique est déclenché depuis deux points d'entrée principaux de l'application :

1. **Module Oiseaux / Cheptel ([`Canaris.tsx`](file:///d:/app%20canaris/28+/src/components/Canaris.tsx)) :**
   * Ligne 2068 : Clic sur une carte d'oiseau (vue mobile) ou sur une ligne de tableau (vue bureau) assigne `selectedBird(bird)` et monte `<BirdDetailModal bird={selectedBird} />`.
2. **Module Habitat / Cages ([`HabitatComponent.tsx`](file:///d:/app%20canaris/28+/src/features/habitat/components/HabitatComponent.tsx)) :**
   * Ligne 1743 : Clic sur un oiseau occupant une cage monte `<BirdDetailModal bird={selectedBird} />`.
3. **Module Référence Biologique ([`ReferenceBiologique.tsx`](file:///d:/app%20canaris/28+/src/components/ReferenceBiologique.tsx)) :**
   * Composant encyclopédique global (onglet `reference_biologique` dans `App.tsx`), affichant les fiches scientifiques des espèces du catalogue.

---

## 3. SOURCES DE DONNÉES

* **Données de l'oiseau :** Propriété `bird: Canari` issue de `BirdRepository` / `BirdService.getBirds()`.
* **Cages & Localisation :** `propCages` ou `HabitatRepository.getAllLegacy()`.
* **Dossier Médical :** `propSanteRecords` ou `HealthService.getRecords()`.
* **Évaluations COM :** `PassportDataService.getComEvaluation(bird.id, bird)` dans la clé localStorage `'ba_passport_com_evaluations'`.
* **Pesées & Poids :** `PassportDataService.getWeightLogsForBird(bird.id, bird)` dans la clé localStorage `'ba_passport_weight_logs'`.
* **Palmarès & Prix :** `PassportDataService.getPalmaresForBird(bird.id, bird)` dans la clé localStorage `'ba_passport_palmares'`.

---

## 4. REGISTRES DU PROJET ET CONNEXION AU PASSEPORT

Le projet dispose de deux registres centraux :
1. **[`SPECIES_REGISTRY`](file:///d:/app%20canaris/28+/src/data/speciesRegistry.ts) :**
   Définit les espèces, catégories et races supportées (`canari`, `chardonneret_elegant`, `diamant_mandarin`, `diamant_gould`, `perruche_ondulee`, `agapornis`, `calopsitte`).
2. **[`BIOLOGICAL_SPECIES_REGISTRY`](file:///d:/app%20canaris/28+/src/reference/species/index.ts) :**
   Définit les profils biologiques complets (`identity`, `biology`, `reproduction`, `breeding`, `nutrition`, `health`, `management`, `traceability`).

### Constat critique de rupture de chaîne :
Dans tous les fichiers de `src/features/birds/components/` :
* `BIOLOGICAL_SPECIES_REGISTRY` n'est **JAMAIS IMPORTÉ NI UTILISÉ**.
* `getBiologicalProfileById` n'est **JAMAIS APPELÉ**.
* Le Passeport Biologique n'affichait jusqu'ici **AUCUNE DONNÉE BIOLOGIQUE DE L'ESPÈCE** issue du registre central. Il ne présentait que des informations généalogiques et individuelles.

---

## 5. SERVICES UTILISÉS

* **Présents :** `BirdService`, `PassportDataService`, `HealthService`, `HabitatRepository`, `BirdEngine`, `QRCodeManager`.
* **MANQUANT DANS LE PASSEPORT :** `SpeciesProfileService` (`src/features/species/services/SpeciesProfileService.ts`) et les utilitaires de `src/reference/species/index.ts`.

---

## 6. SYSTÈME DE TRADUCTION ET DIAGNOSTIC I18N

Le projet dispose d'un système centralisé éprouvé :
* Contexte : [`LanguageContext.tsx`](file:///d:/app%20canaris/28+/src/context/LanguageContext.tsx) fournissant `language`, `t()`, `isRtl`.
* Dictionnaire : [`translations.ts`](file:///d:/app%20canaris/28+/src/utils/translations.ts) supportant `fr`, `en`, `ar`, `es`, `it`.

### Cause racine du problème multilingue :
1. Aucun composant du Passeport (`BirdDetailModal`, `BirdPassportView`, `BirdHeroPassportCard`, `BirdBiologicalKpiRow`, `BirdTabsNavigation`, `BirdStandardComTab`, `BirdPalmaresTab`, `BirdQrCodeModal`) n'importe ni n'appelle `useLanguage()`.
2. 100% des chaînes visibles étaient codées en dur en français.
3. Lors d'un changement de langue de l'application, aucun de ces composants ne se ré-exécute ni ne reçoit les nouvelles traductions.

---

## 7. CLÉS DE TRADUCTION EXISTANTES VS MANQUANTES

* **Existantes :** Noms des espèces (`speciesCanari`, `speciesChardonneret`, etc.), sexes (`male`, `female`, `undetermined`), actions générales (`edit`, `delete`, `save`, `cancel`).
* **Manquantes dans `translations.ts` :**
  Toutes les clés du Passeport Biologique :
  * Titre du passeport (`biologicalPassport.title`)
  * Libellés d'onglets (Fiche biologique, Généalogie, Standard COM, Santé, Palmarès, Documents)
  * Statuts sanitaires et avertissements de consanguinité
  * Labels des KPI
  * Fiche biologique (nom scientifique, espérance de vie, dimensions, dimorphisme, maturité, incubation, ponte, sevrage, bague, température, humidité, alimentation, pathologies)
  * Fallback traduisible lorsqu'une information est non disponible.

---

## 8. DONNÉES BIOLOGIQUES STATIQUES ET HARDCODÉES

1. **Nom par défaut :** `bird.nom || \`Canari #${bird.id}\`` dans `BirdHeroPassportCard.tsx` (force le libellé « Canari » même pour un Chardonneret ou un Mandarin).
2. **Maturité sexuelle :** `ageObj.months >= 9` codé en dur au lieu d'utiliser `biology.minAgeReproduction` du profil biologique de l'espèce.
3. **Standard COM :** Texte fixe `'pour le Canari de race'` dans `BirdStandardComTab.tsx`.
4. **Pesées par défaut :** Poids fixes de `21.4g` à `22.8g` dans `PassportDataService.ts` (morphologie d'un canari, inadaptée aux autres espèces).
5. **Palmarès par défaut :** Sections hardcodées `D-01 (Canaris Lipochromes)`.

---

## 9. INVENTAIRE EXHAUSTIF DES TEXTES HARDCODÉS

* `BirdDetailModal.tsx` :
  * `"Passeport Biologique Individuel"`
* `BirdHeroPassportCard.tsx` :
  * `"Cage non assignée"`, `"Fermer le passeport"`, `"♂ Mâle"`, `"♀ Femelle"`, `"❓ Indét."`
  * `"Archivé"`, `"Actif • Reproducteur"`, `"Né le "`
  * `"Accoupler (Simulateur)"`, `"Éditer"`, `"QR Code"`
  * `"Afficher le Smart QR Code du passeport"`, `"Dupliquer le phénotype"`, `"Restaurer l'oiseau"`, `"Archiver l'oiseau"`, `"Supprimer l'oiseau"`
* `BirdBiologicalKpiRow.tsx` :
  * `"Consanguinité (COI)"`, `"Consanguinité faible (Idéal)"`, `"Consanguinité modérée (Prudence)"`, `"Consanguinité élevée (Déconseillé)"`
  * `"Optimal"`, `"Vigilance"`, `"Risque"`
  * `"Statut Santé"`, `"Quarantaine"`, `"Isolement sanitaire préventif"`, `"Soin en cours"`, `"Protocole vétérinaire actif"`, `"OK / Vacciné"`, `"Dossier vaccinal à jour"`, `"OK / Conforme"`, `"Aucune anomalie signalée"`
  * `"Palmarès & Concours"`, `"Non évalué"`, `"Standard C.O.M. disponible"`, `"Niveau Or"`, `"Niveau Argent"`, `"Niveau Bronze"`
  * `"Descendance directe"`, `"Rejetons enregistrés"`, `"Aucun jeune déclaré"`
* `BirdTabsNavigation.tsx` :
  * `"Généalogie & Pedigree"`, `"Standard C.O.M. (100 pts)"`, `"Santé & Soins"`, `"Palmarès & Concours"`, `"Galerie & Documents"`
  * `"♂ Père Biologique"`, `"Lignée Paternelle"`, `"Père biologique non renseigné (Oiseau fondateur)"`
  * `"♀ Mère Biologique"`, `"Lignée Maternelle"`, `"Mère biologique non renseignée (Oiseau fondateur)"`
  * `"Lignée Nourricière (Parents Adoptifs)"`, `"Père nourricier :"`, `"Mère nourricière :"`
  * Textes des formulaires de documents et galerie.
* `BirdStandardComTab.tsx` :
  * Tous les libellés de critères, titres, descriptions et boutons.
* `BirdPalmaresTab.tsx` :
  * Tous les en-têtes de colonnes, titres de modales, boutons et certificat imprimable.
* `BirdQrCodeModal.tsx` :
  * `"Smart QR Code Passeport"`, `"Passeport Biologique Individuel"`, `"Télécharger PNG"`, `"Télécharger SVG"`.

---

## 10. PROBLÈMES DE RAFRAÎCHISSEMENT ET DE RÉACTIVITÉ

1. **Changement d'oiseau à chaud :**
   * Dans `BirdPalmaresTab.tsx`, l'état initial est initialisé avec `useState(() => PassportDataService.getPalmaresForBird(bird.id, bird))`, mais **aucun `useEffect` n'écoute `bird.id`**. Si l'utilisateur clique sur un ancêtre dans l'arbre généalogique sans fermer la modale, le palmarès reste celui du premier oiseau.
2. **Changement de langue à chaud :**
   * Aucun composant du Passeport n'était abonné au `LanguageContext`. En changeant la langue via le sélecteur d'en-tête, le Passeport ne se mettait pas à jour.

---

## 11. MAPPING DES ESPÈCES (`speciesId`)

* Le modèle TypeScript `Canari` (`src/types/index.ts` et `src/types.ts`) définit `espece?: string`.
* Pour assurer la compatibilité ascendante avec les oiseaux historiques ou créés sans espèce explicite :
  `const resolvedSpeciesId = bird.espece || (bird as any).speciesId || (bird as any).species || 'canari';`
* La fonction doit valider si l'identifiant existe dans `BIOLOGICAL_SPECIES_REGISTRY` via `getBiologicalProfileById(resolvedSpeciesId)`.
* Si une espèce n'a pas de fiche biologique validée : **afficher un état explicite traduisible** (« Informations biologiques non disponibles ») et **JAMAIS les données du Canari**.

---

## 12. RESPECT DU SPECIES PROFILE

* `SpeciesProfileService.getActiveSpeciesIds()` gère les espèces actives de l'éleveur.
* Si l'utilisateur sélectionne un oiseau d'une espèce active, son Passeport doit s'afficher immédiatement avec les données scientifiques de cette espèce.
* Le catalogue mondial encyclopédique (`BIOLOGICAL_SPECIES_REGISTRY`) reste intact et consultable.

---

## 13. SÉCURITÉ ET ISOLATION USER / ADMIN

* Le Passeport est un composant purement User.
* Il n'appelle aucun endpoint ou service de `src/features/administration/`.
* Il ne contient aucune donnée sensible d'administration.

---

## 14. MOBILE ET DIRECTION RTL (ARABE)

1. **RTL Arabe :**
   * Le Passeport ne gérait pas `dir="rtl"` ni la classe `rtl`.
   * Les badges de genre positionnés en `-right-2` chevauchaient en mode RTL.
   * Les flèches `ChevronRight` pointaient dans la mauvaise direction.
   * L'alignement du texte doit passer en `text-right` en arabe.
2. **Affichage Mobile :**
   * `BirdHeroPassportCard` : la grille de boutons d'action doit s'adapter en largeur pleine sur écran mobile (< 768px).
   * La barre d'onglets `AppTabs` doit permettre le défilement horizontal fluide (`HorizontalScrollContainer`).
   * La grille de KPI doit basculer en 1 ou 2 colonnes sans tronquer les textes.

---

## PLAN DE CORRECTION VALIDÉ POUR L'IMPLÉMENTATION

1. **Enrichir `src/utils/translations.ts` :**
   Ajouter l'ensemble des clés nécessaires pour le Passeport Biologique en 5 langues (FR, EN, AR, ES, IT).
2. **Créer le composant de fiche biologique d'espèce :**
   [`BirdBiologicalProfileTab.tsx`](file:///d:/app%20canaris/28+/src/features/birds/components/BirdBiologicalProfileTab.tsx) affichant les données du registre central `BIOLOGICAL_SPECIES_REGISTRY` pour l'espèce de l'oiseau.
3. **Mettre à jour `BirdTabsNavigation.tsx` :**
   Ajouter l'onglet prioritaire « Fiche Biologique » (`profil_biologique`), brancher `useLanguage()`, et traduire l'intégralité des onglets et cartes.
4. **Corriger `BirdHeroPassportCard.tsx` :**
   Brancher `useLanguage()`, éliminer tous les textes hardcodés, dynamiser le nom de fallback et la maturité sexuelle selon l'espèce, supporter RTL.
5. **Corriger `BirdBiologicalKpiRow.tsx` :**
   Brancher `useLanguage()`, internationaliser tous les KPI et statuts.
6. **Corriger `BirdStandardComTab.tsx` et `BirdPalmaresTab.tsx` :**
   Brancher `useLanguage()`, corriger le rafraîchissement sur changement de `bird.id`, adapter les sections COM à l'espèce.
7. **Corriger `BirdDetailModal.tsx` et `BirdQrCodeModal.tsx` :**
   Brancher `useLanguage()`, titre multilingue dynamique et support RTL.
8. **Créer la suite de tests automatisés :**
   `tests/biological-passport-audit-01.test.ts` couvrant les scénarios BIO-PASS-01 à BIO-PASS-18.
9. **Exécuter les vérifications de non-régression :**
   `npx tsc --noEmit` et `npm test`.
10. **Effectuer la validation visuelle mobile et physique.**
