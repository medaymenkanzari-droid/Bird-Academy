# Bird Academy Developer Architecture

## 1. Overview
Bird Academy is a 100% offline-first application engineered for breeders of domestic birds (canaries, finches, etc.). It operates fully client-side inside standard web containers, Progressive Web App (PWA) runtime environments, or Desktop wraps (Tauri).

## 2. Tier Structure
The application adheres to a clean, decoupled Architecture:

- **View Layer (React Components):** Modular components utilizing Tailwind CSS and Lucide Icons. Uses `useLanguage` for RTL/multi-language and local states.
- **Service Layer (`features/*/services`):** Implements complex breeding business logic, incubation timing, finance summaries, and health protocols.
- **Repository Layer (`features/*/repositories`):** Abstracts persistent storage. Interacts directly with the isolated Database Provider.
- **Domain Layer (`models/`):** Contains pure domain entities, type checkers, and math helpers (e.g., Wright coefficient calculations).
- **Storage Layer (`storage/`):** Integrates client-side `localStorage` via an abstract `IStorageProvider` interface, allowing isolated namespace routing for Demonstration Mode.

```
┌─────────────────────────────────────────┐
│           React Components              │
└────────────────────┬────────────────────┘
                     ▼
┌─────────────────────────────────────────┐
│             Service Layer               │
└────────────────────┬────────────────────┘
                     ▼
┌─────────────────────────────────────────┐
│            Repository Layer             │
└────────────────────┬────────────────────┘
                     ▼
┌─────────────────────────────────────────┐
│        Storage Layer (appStorage)       │
└─────────────────────────────────────────┘
```

## 3. Storage Isolation
Data is persisted inside local storage keys. During Demonstration Mode, a `demo_` prefix is appended to all keys, completely isolating mock data from the breeder's production records.
