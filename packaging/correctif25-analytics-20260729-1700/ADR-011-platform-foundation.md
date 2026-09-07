# ADR-011: S9 Platform Foundation

## Status
Accepted

## Context
As Bird Academy transitions into a professional enterprise platform ready for large-scale offline deployments, it requires a robust, security-hardened, and self-auditing platform foundation. 

The primary business engines (Breeding, Genetics, Habitats, etc.) are already completed and validated. Sprint 9 introduces infrastructural controls to handle:
- Safe, non-destructive, and cryptographically signed local backups.
- Dry-run pre-restoration simulation checking version compatibility and structural completeness.
- Real-time relation checks (Integrity Engine) to resolve broken foreign keys, invalid genders, or orphan data.
- Local performance telemetry monitoring calculation latency and DB sizes.
- Real-time audit logs of user modifications.
- Local DSS reminders (layings, hatches, weanings, treatment schedules).

## Decision
We establish a decoupled module within `/src/features/platform` built on top of TypeScript strict typings and decoupled engines:

1. **PlatformSettingsRepository**: Handles Settings V2 (Breeding periods, Encryption key, Language toggles, and System notifications schedules).
2. **SecurityEngine**: Encodes and signs local backups with custom deterministic checksums (`cyrb53` hashes) and integrity signatures, and prevents tampered JSON imports.
3. **IntegrityEngine**: Scans the collections without modifying them, scoring database status (0 to 100), and listing repair proposals that can be resolved individually.
4. **PerformanceEngine**: Benchmarks core procedures like KPI calculation, opening speed, and report rendering, and gives speed tips.
5. **PlatformHealthEngine**: Computes an overall Platform Health Score by assessing local storage size, backup age, and data integrity.
6. **NotificationService**: Dynamically processes clutches and treatments to alert the breeder of layings, hatching dates, weaning times, and quarantines.
7. **CalendarService**: Aggregates all database timeline events (births, veterinary cares, financial movements, and custom alerts) into a single monthly grid.
8. **Audit Dashboard**: Displays real-time auditable user actions with multi-module filtering and CSV exports.

All components are fully local, reactive, and compliant with standard React 18 / Tailwind CSS utility classes.

## Consequences
- **Safety**: No backup can be restored without a visual dry-run pre-simulation displaying item counts and requiring an explicit user validation checkbox.
- **Maintainability**: Clear separation of concerns between business models and supervision diagnostics prevents side effects on the core biological engine.
- **Performance**: High volume of local storage is warned beforehand to prevent browser quota exceptions.
- **RTL & I18n**: Full compliance with the five configured languages (FR, EN, AR, ES, IT) and fluid layout adjustments.
