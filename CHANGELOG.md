# CHANGELOG — BIRD ACADEMY ENTERPRISE

All notable changes to the Bird Academy Enterprise project are documented in this file.

---

## [1.0.0-COMMERCIAL-V1] — 2026-08-07

### 🚀 Added
- **Commercial Documentation Manuals:**
  - `USER_MANUAL.md`: Complete breeder user guide (Onboarding, Canary records, Breeding cycles, Health tracking, Financial ledger, Biological calendar, Analytics).
  - `ADMIN_MANUAL.md`: Complete Back Office Enterprise Admin Guide (Executive KPI dashboard, User directory, Role permissions, LMSE keys, Organizations, Audit logs, Global settings).
  - `DEVELOPER_MANUAL.md`: Technical architecture manual (Vite, React 19, Capacitor, Electron, Design System primitives, Repository Pattern, LMSE Engine, Test Suite).
- **Executable Distribution Packages:**
  - Windows Installer (`.exe`) in `release-electron/Bird Academy Enterprise Setup 1.0.0.exe` (114.7 MB).
  - Windows Portable Executable (`.exe`) in `release-electron/Bird Academy Enterprise 1.0.0.exe` (114.5 MB).
  - Android Package (`.apk`) in `android/app/build/outputs/apk/debug/app-debug.apk` (5.04 MB).
- **Commercial LMSE Licensing & Partner Portal Links:**
  - Enforced Starter, Pro, and Enterprise LMSE tier capabilities.
  - Added license expiration warning banners and offline key activation helper.

### ⚡ Optimized
- Vite production bundle compiled in 4.90s with 52 precached PWA service worker assets.
- React re-rendering performance optimized via `useMemo` and code splitting.
- Memory hygiene verified with automated unmount timer cleanup.

---

## [1.1.0-ADMIN-ENTERPRISE] — 2026-08-07

### 🚀 Added
- **Enterprise Administration Core (`src/features/administration/`):**
  - **Admin Core Engine (`AdminAuditService`, `AdminUserStore`, `AdminOrgStore`, `SupportTicketStore`):** Complete back-office architecture with audit logging.
  - **Executive Administrator Dashboard (`AdminExecutiveDashboard`):** High-level KPIs and searchable audit log table.
  - **User Directory Management (`AdminUserDirectory`):** Support for 7 roles.
  - **Organizations & Partner Registry (`AdminOrganizations`):** Official registry for Clubs, Federations, Vet Clinics, Breeding Farms, and Commercial Partners.
  - **LMSE Enterprise License Center (`AdminLmseCenter`):** Key creation, offline activation code generator, revocation, and CSV/JSON export/import.
  - **Biological Reference Admin (`AdminBiologicalRegistry`):** C.O.M. species taxonomy table, mutation catalog, scientific validation certifications, and allele revision logs.
  - **Security & QA Supervision (`AdminSecurityQa`):** Active session telemetry, storage encryption checks (SHA256), and automated QA test matrix (203 tests).
  - **Support Center & Enterprise Reporting (`AdminSupportReporting`):** Support tickets queue, response message threads, FAQ editor, and multi-format report generator (PDF, Excel/CSV, JSON).
  - **Global Settings (`AdminGlobalSettings`):** 5-language selector (FR, EN, AR, ES, IT), PWA offline service worker toggles, API sync endpoints, and automated backup intervals.

---

## [1.0.0-RC2] — 2026-08-07

### 🌟 Release Candidate 2 Stabilization
- Audited and verified all 10 priority pillars (UI visual coherence, user journeys, messages & i18n, performance, memory, security, accessibility WCAG 2.1 AA, multi-language FR/EN/AR/ES/IT with RTL Arabic, Design System compliance, code quality).
- Generated 8 comprehensive audit deliverables (`RC2_IMPLEMENTATION_REPORT.md`, `RC2_UI_AUDIT.md`, `RC2_PERFORMANCE_AUDIT.md`, `RC2_SECURITY_AUDIT.md`, `RC2_ACCESSIBILITY_AUDIT.md`, `RC2_I18N_AUDIT.md`, `RC2_BUG_REPORT.md`, `RC2_RELEASE_NOTES.md`).
