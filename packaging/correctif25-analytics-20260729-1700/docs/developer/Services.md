# Services Layer in Bird Academy

## 1. Overview
The Service Layer contains the procedural business logic of Bird Academy. It coordinates multiple repositories, validates constraints, and executes workflows.

## 2. Key Services
- **BreedingService:** Orchestrates the lifecycle of reproduction.
  - Manages egg incubation alerts (mirage at J+7, hatch at J+14).
  - Handles weaning of chicks and calculates hatching success rates.
- **BirdService:**
  - Standardizes bird registrations.
  - Calculates age and determines biological readiness for breeding.
- **HandFeedingService:**
  - Manages hand-feeding routines and nutrition plans.
- **HealthService:**
  - Tracks veterinary appointments and quarantines.
- **FinanceService:**
  - Summarizes cash flows, total expenses, and profit margins.
