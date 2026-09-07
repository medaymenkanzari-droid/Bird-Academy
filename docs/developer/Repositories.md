# Repositories Pattern in Bird Academy

## 1. Design Concept
Repositories act as an abstraction layer between the business services and storage providers. This ensures that:
- The data access code is centralized and DRY.
- Business services are unaware of whether data is fetched from LocalStorage, IndexedDB, or an external Cloud database.
- We can easily mock the database for unit testing.

## 2. Standard Repository Contract
A typical repository exposes the following static interface:
- `getAll()`: Retrieves all active records.
- `getById(id)`: Retrieves a specific record by its ID.
- `create(record)`: Generates a new record with an incremental unique ID and stores it.
- `update(record)`: Replaces an existing record.
- `delete(id)`: Permanently or logically deletes a record.

## 3. Repositories Map
- `BirdRepository`: Manages canaries and other birds (`src/features/birds/repositories/BirdRepository.ts`).
- `HabitatRepository`: Manages cages and volières (`src/features/habitat/repositories/HabitatRepository.ts`).
- `BreedingRepository`: Manages pairs, reproductions, nests, and juveniles (`src/features/breeding/repositories/BreedingRepository.ts`).
- `HealthRepository`: Tracks veterinary records, medical conditions, and treatments (`src/features/health/repositories/HealthRepository.ts`).
- `FinanceRepository`: Records feed expenses, equipment costs, and bird sales (`src/features/finance/repositories/FinanceRepository.ts`).
