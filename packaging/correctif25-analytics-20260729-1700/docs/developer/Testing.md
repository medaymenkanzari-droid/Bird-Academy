# Testing and Verification Strategy

## 1. Overview
Bird Academy features automated client-side test suites that verify the correctness of biological rules, repository integrations, and mathematical calculators.

## 2. Test Structure
- **Unit Tests:** Verify individual functions (e.g. Wright's calculations, age helpers).
- **Integration Tests:** Verify services that interact with repositories (e.g., BreedingService adding eggs to nests and validating dates).
- **UI Tests:** Simulate render correctness and WCAG keyboard focus outline configurations.

## 3. Local Test Console
The Quality Assurance Center provides a dedicated "Suites de Tests" tab where devs and users can trigger 100+ assertions synchronously, verifying the integrity of the application in real-time.
