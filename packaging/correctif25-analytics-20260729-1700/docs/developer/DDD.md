# Domain-Driven Design (DDD) in Bird Academy

## 1. Domain Model Architecture
Bird Academy utilizes a strict Domain-Driven Design (DDD) model:

### Aggregate Roots
- **Bird Aggregate:** Represents a single bird (Canari) with its heritage, mutation profiles, and health records.
- **Breeding Pair Aggregate:** Represents a couple (Couple) of birds mated for breeding, containing reproductive nests, hatch cohorts, and weaning metrics.
- **Habitat Aggregate:** Represents a cage or volière (Cage) managing its bird occupancy capacity.

### Entities
- **Ponte:** Represents a single clutch of eggs inside a breeding cycle.
- **Jeune:** Represents a chick inside a nest.
- **Sante:** Represents a health event or veterinary treatment.

### Value Objects
- **Mutation:** Represents genetic mutation profiles (dominant, recessive, sex-linked).
- **WrightCoefficient:** Represents a biological calculation of consanguinity.

## 2. Bounded Contexts
- **Breeding Context:** Handled by `features/breeding` and `features/reproduction`.
- **Health Context:** Handled by `features/health`.
- **Finance Context:** Handled by `features/finance`.
- **Genetics Context:** Handled by `features/genetics`.
