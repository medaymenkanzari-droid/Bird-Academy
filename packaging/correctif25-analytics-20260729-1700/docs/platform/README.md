# Bird Academy Platform Foundation (S9)

This directory contains the core platform framework introduced in Sprint 9 to scale Bird Academy into a professional, safe, and robust offline-first application.

## Directory Structure

```
/src/features/platform/
├── types/
│   └── index.ts                 # Full TypeScript strict interfaces for S9
├── utils/
│   └── translations.ts          # Translation dictionaries (FR, EN, AR, ES, IT)
├── engines/
│   ├── SecurityEngine.ts        # Backup signature & checksum generators
│   ├── IntegrityEngine.ts       # Database relational integrity auditor
│   ├── PerformanceEngine.ts     # Execution benchmarks & optimizer tips
│   └── PlatformHealthEngine.ts  # General supervision & health score model
├── services/
│   ├── BackupRestoreService.ts  # Full/selective export, Dry-run simulator
│   ├── NotificationService.ts   # Dynamic biological alert scheduler (DSS)
│   └── CalendarService.ts       # Cross-module unified calendar aggregator
└── components/
    ├── PlatformDashboard.tsx    # Central hub tab-navigation coordinator
    ├── SupervisionTab.tsx       # Supervision & storage telemetry
    ├── BackupTab.tsx            # Backup Center & simulation dry-run
    ├── IntegrityTab.tsx         # Relational checks & auto-fixes
    ├── NotificationTab.tsx      # Alerts DSS, weanings & treatments
    ├── CalendarTab.tsx          # Unified calendar month grid
    ├── AuditTab.tsx             # Cryptographic audit logs & exports
    ├── DiagnosticsTab.tsx       # Performance benchmarks & speed metrics
    └── SettingsTab.tsx          # Advanced configuration (Settings V2)
```

## System Engines

### 1. Security Engine
The security module signs local JSON backups, calculating standard checksums based on raw data inputs, salted with `birdacademy_enterprise_secure_salt_2026`. This prevents corrupted or tampered imports, ensuring that only trusted files are integrated into the system.

### 2. Integrity Engine
Checks the relational links between our data layers:
- Validates parent linkages (non-existent parent IDs).
- Detects orphaned reproductions or clutch records.
- Verifies cage allocations (checks if the cage exists and has room).
- Identifies invalid genders inside active breeding pairs.
- Audits statistical deviations (e.g., eggs hatched exceeding eggs laid).

### 3. Notification Center (DSS Alerts)
Generates smart biological alerts calculated directly from database records:
- **Expected Layings**: Flagged 7 days after couple pairing.
- **Expected Hatches**: Flagged 13 days after egg laying.
- **Weanings**: Recommended 30 days after chick birth.
- **Quarantines**: Warns for new birds with active isolation tags.
- **Birthdays**: Celebrates bird birthdates with custom tips.

### 4. Backup & Restore Center
Supports selective or complete database archives. When restoring, the file runs through a **pre-restoration dry-run simulation** to count the records to import, detect compatibility warnings, and requires explicit user checkbox validation before wiping the local database.
