# BIRD-LOCATION-HISTORY-AUDIT-01-REPORT
## Audit de la localisation, cage et historique des déplacements dans la fiche Oiseau
**Date** : 28 Août 2026  
**Application** : Bird Academy Enterprise (v1.3.6-RC4)  
**Type de mission** : Audit architectural & diagnostique (Zéro modification de code de production)  

---

## 1. Résumé Exécutif

L'audit complet de la fiche individuelle d'un oiseau (`BirdDetailModal` et `BirdPassportView`) a révélé que les données de localisation avancée (Volières, Quarantaines, Compartiments, Zones, Élevages) et l'historique complet des déplacements (`DeplacementRecord`) existent déjà dans la base de données locale (`ba_deplacements` et `ba_*`).

Cependant, la fiche oiseau actuelle :
1. N'interroge que l'ancien système de cages plates legacy (`getAllLegacy()`), ignorant les volières et la quarantaine (affichant à tort *"Cage non assignée"* pour un oiseau en volière ou en quarantaine).
2. Ne dispose d'aucun onglet ni composant pour présenter l'historique chronologique des mouvements de l'oiseau.
3. Souffre d'une rupture de synchronisation dans `BirdService.resolveBirdLocation` qui réinitialise `zoneId` et `facilityId` lorsque l'oiseau est dans une volière sans `cageId`.

---

## 2. Architecture Actuelle

Le sous-système d'habitat et de localisation est structuré comme suit :

```
                          [ Canari Model ]
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
    [ cageId / cage_id ]    [ aviaryId ]          [ quarantineId ]
         │                       │                       │
         ▼                       ▼                       ▼
   ba_cages_v2              ba_aviaries         ba_quarantine_areas
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                             ba_zones
                                 │
                                 ▼
                           ba_facilities
```

Historique des déplacements :
```
[ HabitatService.moveBird / startQuarantine / endQuarantine ]
                                 │
                                 ▼
                     [ HabitatRepository.create ]
                                 │
                                 ▼
                        'ba_deplacements' (DeplacementRecord[])
```

---

## 3. Source de Vérité de Localisation

La localisation d'un oiseau est stockée dans les attributs directs du modèle `Canari` (clé de stockage `canaris`) :

| Champ | Type | Entité Habitat Cible | Clé de Stockage |
|---|---|---|---|
| `bird.cageId` | `string` (UUID) | `HabitatCage` | `ba_cages_v2` |
| `bird.cage_id` | `number` | `Cage` (Legacy) | `bird_academy_cages` |
| `bird.compartmentId` | `string` (UUID) | `Compartment` | `ba_compartments` |
| `bird.aviaryId` | `string` (UUID) | `Aviary` | `ba_aviaries` |
| `bird.quarantineId` | `string` (UUID) | `QuarantineArea` | `ba_quarantine_areas` |
| `bird.zoneId` | `string` (UUID) | `Zone` | `ba_zones` |
| `bird.facilityId` | `string` (UUID) | `Facility` | `ba_facilities` |
| `bird.statut_sante` | `string` | Statut ('Quarantaine', 'Sain'...) | `canaris` |
| `bird.quarantaine` | `QuarantaineInfo` | Dates & durée de quarantaine | `canaris` |

---

## 4. Source de Vérité des Mouvements

L'historique des déplacements est **déjà persisté** de manière structurée :
- **Clé de stockage** : `'ba_deplacements'` (`appStorage` / `localStorage`).
- **Modèle de données** : `DeplacementRecord` (défini dans `src/types/habitat.ts`) :
  ```typescript
  export interface DeplacementRecord {
    id: string; // UUID
    birdId: number; // ID de l'oiseau lié
    origineType: 'Facility' | 'Zone' | 'Aviary' | 'Cage' | 'Compartment' | 'Quarantine' | 'Inconnu';
    origineId: string;
    origineNom: string;
    destinationType: 'Facility' | 'Zone' | 'Aviary' | 'Cage' | 'Compartment' | 'Quarantine';
    destinationId: string;
    destinationNom: string;
    date: string; // YYYY-MM-DD
    motif: string;
    utilisateur: string;
    commentaire?: string;
    createdAt: string;
  }
  ```
- **Service d'écriture** : `HabitatService.moveBird`, `HabitatService.startQuarantine`, `HabitatService.endQuarantine`.
- **Méthode de lecture existante** : `HabitatRepository.getAll<DeplacementRecord>('deplacementRecord')`.

---

## 5. Audit de BirdDetailModal

- **Fichier** : `src/components/BirdDetailModal.tsx`
- **Rôle** : Modal conteneur (`AppModal`) enveloppant `BirdPassportView`.
- **Comportement** : Reçoit `bird: Canari`, `allBirds: Canari[]`, `cages: Cage[]` et délègue l'affichage à `BirdPassportView`.
- **Constat** : Le modal transmet des props partielles (`cages` legacy au lieu du repository d'habitat complet).

---

## 6. Audit de BirdPassportView

- **Fichier** : `src/features/birds/components/BirdPassportView.tsx`
- **Rôle** : Composant maître de la fiche / passeport biologique de l'oiseau.
- **Constats critiques** :
  1. `cagesList = propCages || HabitatRepository.getAllLegacy();` : Ignore les tables V2 (`ba_cages_v2`, `ba_aviaries`, `ba_quarantine_areas`, etc.).
  2. `getCageName = (cageId) => cagesList.find(...)` : Ne résout que les cages numériques legacy.
  3. L'oiseau en volière ou en quarantaine reçoit systématiquement `"Cage non assignée"`.
  4. Les 6 onglets de `BirdTabsNavigation` (`profil_biologique`, `genealogie`, `standard_com`, `sante`, `palmares`, `galerie_docs`) ne comportent aucun onglet ni section pour l'habitat et les déplacements.

---

## 7. État Actuel de l'Affichage

| Composant | Information Affichée | Limite / Défaut |
|---|---|---|
| `BirdHeroPassportCard` | Nom de la cage (`displayCageName`) | Affiche "Non assigné" si l'oiseau est en volière ou quarantaine. Aucun type ni capacité affichés. |
| `BirdBiologicalKpiRow` | KPI Biologiques, Santé, Consanguinité | Aucune métrique de localisation. |
| `BirdTabsNavigation` | 6 onglets (Bio, Généalogie, Standard, Santé, Palmarès, Galerie) | Zéro onglet / vue pour l'historique des déplacements et l'habitat. |

---

## 8. Données Disponibles dans l'Application

Toutes les données nécessaires sont **déjà collectées et persistées** :
- Nom et type de l'emplacement d'origine et de destination.
- Date du mouvement.
- Motif du déplacement et observations.
- Utilisateur / Opérateur ayant effectué le déplacement.
- Date d'entrée en quarantaine et durée prévue.
- Capacité maximale de la structure d'accueil.

---

## 9. Données Manquantes

Aucune donnée métier n'est manquante dans la couche de persistance.  
Le manque se situe exclusivement au niveau de l'**exposition par les services** et de l'**intégration dans l'interface utilisateur de la fiche oiseau**.

---

## 10. Problème de Synchronisation Éventuel

Deux ruptures de synchronisation ont été identifiées :
1. **Effacement de la hiérarchie dans `BirdService.resolveBirdLocation`** :
   Lorsqu'un oiseau est placé dans une volière (`bird.aviaryId = 'aviary-2'`), ses champs `cageId` et `cage_id` sont à `undefined`. `BirdService.resolveBirdLocation` réinitialise alors `zoneId = undefined` et `facilityId = undefined`, rompant le lien vers la zone et l'installation de la volière.
2. **Recherche de nom limitée aux cages legacy** :
   La fiche oiseau n'appelle pas `HabitatService.getLocationName(type, id)` pour résoudre le nom réel de la volière ou de la quarantaine.

---

## 11. Analyse Mobile

- **Espace écran** : La ligne de localisation actuelle dans `BirdHeroPassportCard` doit être responsive avec gestion d'ellipse (`truncate`) pour les noms longs.
- **Accès à l'historique** : L'historique des déplacements doit être consultable sous forme de timeline verticale optimisée pour écran tactile, avec badges d'origine/destination distincts et date lisible.
- **Performance** : Le filtrage des déplacements doit être mémoïsé (`useMemo`) sur `bird.id` pour éviter les ralentissements lors du défilement.

---

## 12. Analyse Desktop

- Sur grand écran, l'onglet ou la section d'habitat peut présenter un panneau complet :
  - **Panneau gauche / haut** : Fiche d'identité d'habitat actuelle (Structure, Type, Zone, Bâtiment, Capacité, Taux d'occupation, Date d'installation).
  - **Panneau droit / bas** : Tableau chronologique des mouvements avec tri par date, filtre par motif et détails de l'opérateur.

---

## 13. Analyse i18n & RTL

- **Langues officielles** : FR, EN, AR, ES, IT.
- Les traductions pour les structures (`cage`, `aviary`, `quarantineArea`, `zone`, `facility`, `compartment`, `moveBird`, `deplacement`) existent déjà dans `src/utils/translationsHabitat.ts`.
- **Support RTL Arabe** : Le sens des flèches de déplacement doit être inversé (`←` en RTL au lieu de `→` en LTR), avec alignement approprié des badges de date et d'emplacement.

---

## 14. Cause Racine

Le problème relève du cas **G (Plusieurs problèmes combinés)** :
1. **Manque d'UI** : `BirdPassportView` ne possède aucun onglet ni composant pour afficher l'historique des déplacements (`DeplacementRecord`).
2. **Source de données obsolète dans la fiche** : `BirdPassportView` utilise `HabitatRepository.getAllLegacy()` au lieu du résolveur de localisation unifié `HabitatService`.
3. **Réinitialisation dans `BirdService.resolveBirdLocation`** : Les attributs `zoneId` et `facilityId` sont écrasés si `cageId` est absent (cas typique des volières).

---

## 15. Proposition UX

1. **En-tête `BirdHeroPassportCard`** :
   - Remplacer l'affichage restrictif `"Cage : X"` par un composant d'emplacement enrichi :
     - Icône dynamique selon le type (Cage, Volière, Quarantaine).
     - Nom complet de l'emplacement (ex: *"Volière Paysagère Nord"* ou *"Box Sanitaire S1 (Quarantaine)"*).
     - Badge de type de structure.
2. **Nouvel onglet dans `BirdTabsNavigation`** :
   - Onglet **"Habitat & Déplacements"** (`habitat_mouvements` avec icône `Home` ou `MapPin`).
   - **Section 1 : Localisation Actuelle** (Type, Nom, Zone, Élevage, Capacité, Date d'entrée).
   - **Section 2 : Historique Chronologique des Déplacements** (Timeline avec Date, Origine `→` Destination, Motif, Opérateur, Observations).

---

## 16. Proposition Technique

1. **Extension de `HabitatService`** :
   - Ajouter `static getBirdLocationSummary(bird: Canari): BirdLocationSummary`
   - Ajouter `static getBirdDeplacements(birdId: number): DeplacementRecord[]`
2. **Ajustement de `BirdService.resolveBirdLocation`** :
   - Préserver `zoneId` et `facilityId` lorsque l'oiseau a un `aviaryId` ou `quarantineId` sans `cageId`.
3. **Création du composant `BirdLocationHistoryTab.tsx`** :
   - Composant dédié pour l'onglet d'habitat et de traçabilité des mouvements.
4. **Mise à jour de `BirdHeroPassportCard.tsx` & `BirdPassportView.tsx`** :
   - Consommer `HabitatService.getBirdLocationSummary(bird)` au lieu du lookup legacy.

---

## 17. Fichiers à Modifier (Lors de la future mission de correction)

- `src/features/birds/components/BirdPassportView.tsx`
- `src/features/birds/components/BirdHeroPassportCard.tsx`
- `src/features/birds/components/BirdTabsNavigation.tsx`
- `src/features/birds/services/BirdService.ts`
- `src/features/habitat/services/HabitatService.ts`
- `src/utils/translationsPassport.ts` (clés de localisation et d'historique dans les 5 langues)
- *Nouveau composant proposé* : `src/features/birds/components/BirdLocationHistoryTab.tsx`

---

## 18. Tests à Ajouter (Matrice de non-régression)

- **LOCATION-01** : Résolution exacte de la cage V2.
- **LOCATION-02** : Résolution exacte de la volière (`aviaryId`).
- **LOCATION-03** : Résolution exacte de la zone de quarantaine (`quarantineId`).
- **LOCATION-04** : Affichage du type et de la capacité de la structure.
- **LOCATION-05** : Chargement complet de l'historique des déplacements par `birdId`.
- **LOCATION-06** : Reflet immédiat après un déplacement contrôlé via `HabitatService.moveBird`.
- **LOCATION-07** : Changement d'oiseau à chaud sans fuite de localisation.
- **LOCATION-08** : Persistance après rechargement et redémarrage.
- **LOCATION-09** : Affichage responsive mobile sans débordement.
- **LOCATION-10** : Support multilingue (FR, EN, AR, ES, IT) et inversion RTL arabe.

---

## 19. Risques

- **Risque de rétrocompatibilité** : Les oiseaux créés avec l'ancienne version (`cage_id` numérique) doivent continuer à être résolus sans faille.
- **Risque de performance** : Le tri et le filtrage des `DeplacementRecord` doivent être effectués sur un volume maîtrisé avec pagination ou limitation aux N derniers mouvements si nécessaire.

---

## 20. Conclusion

L'infrastructure de données et de traçabilité de Bird Academy est déjà complète et mature (`DeplacementRecord` et hiérarchie `Facility > Zone > Aviary / Cage > Compartment / QuarantineArea`). La cause racine du manque de visibilité est purement un défaut d'exposition et d'intégration dans les composants de la fiche oiseau (`BirdPassportView` et `BirdTabsNavigation`), combiné à une logique de résolution d'emplacement restreinte aux cages legacy.
