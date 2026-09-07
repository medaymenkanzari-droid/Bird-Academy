# Architecture du Module Habitat V2

Ce document décrit les choix d'architecture, la modélisation des données et les flux de synchronisation mis en place pour le **Module Habitat V2** de Bird Academy.

## Conception Globale
Le module est conçu comme un système découplé, autonome et hautement modulaire :

```
┌────────────────────────────────────────────────────────┐
│                        VIEW LAYER                      │
│     HabitatComponent ◀───▶ Multi-lingual Dictionary    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                    │
│    HabitatService ◀───▶ QRCodeManager ◀───▶ qrcode     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                      BUSINESS LAYER                    │
│                     HabitatEngine                     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                     REPOSITORY LAYER                   │
│        HabitatRepository ◀───▶ appStorage (V2)         │
│                 │                                      │
│                 └─────────▶ Legacy Cages (Sync)        │
└────────────────────────────────────────────────────────┘
```

## Structure Hiérarchique
Les hébergements de l'élevage sont modélisés sous forme d'un arbre hiérarchique strict :

1. **Breeding Facility (Élevage / Installation) :** L'enveloppe physique supérieure (ex: "Bâtiment A", "Volières d'été").
2. **Zone :** Subdivision logique ou géographique (ex: "Zone d'accouplement", "Zone de repos", "Zone Sanitaire").
3. **Aviary (Volière) ou Cage :** Conteneur principal d'accueil. Une cage peut optionnellement appartenir à une volière.
4. **Compartment (Compartiment) :** Division fine d'une cage (ex: "Compartiment Gauche", "Compartiment Droit").
5. **QuarantineArea (Zone de Quarantaine) :** Zone d'isolement autonome rattachée à une Zone spécifique.

## Schéma Relationnel des Oiseaux
Les canaris conservent leur appartenance via des clés étrangères de localisation explicites introduites sur l'interface `Canari` :
- `facilityId?: string;`
- `zoneId?: string;`
- `aviaryId?: string;`
- `cageId?: string;` (UUID-based V2)
- `cage_id?: number;` (Legacy compatibility)
- `compartmentId?: string;`
- `quarantineId?: string;`

## Rétrocompatibilité & Synchronisation Bidirectionnelle
Afin d'éviter toute rupture dans les composants préexistants (Couple, Reproduction) qui référencent les cages par un identifiant numérique (`cage_id: number`), le dépôt `HabitatRepository` met en œuvre un double mécanisme :

1. **Migration transparente (à la demande) :** Lors du premier démarrage ou accès aux données, l'ancienne collection de cages `cages` est migrée vers le schéma de stockage `ba_cages_v2` en générant les structures parentes par défaut.
2. **Synchronisation active :** À chaque écriture, mise à jour ou suppression effectuée sur l'arborescence des cages V2, les modifications correspondantes sont ré-écrites dans le tableau de stockage historique `cages`. Les identifiants numériques sont préservés pour garantir le fonctionnement inaltéré des écrans d'accouplements et de reproduction.
