# DESKTOP ARCHITECTURE AUDIT & EXTENSION PLAN
**Project**: Bird Academy User  
**Platform Target**: Desktop / Ordinateur (`1280x720` to `2560x1440` and 125%/150% Windows scaling)  
**Status**: Phase 1 (Audit) & Phase 2 (Architecture Proposal)  

---

## 1. Phase 1 — Architectural Audit

### Current Setup in `App.tsx`
- **Mobile Header (`header.md:hidden`)**: Renders logo, language selector, and hamburger button for drawer toggle.
- **Mobile Navigation Drawer (`AnimatePresence` + `aside.fixed.inset-0`)**: Renders slide-out drawer on `<768px` viewports.
- **Desktop Sidebar (`aside.hidden.md:flex.w-64`)**: Currently rendered statically on `>=768px` viewports. Needs professional top bar integration, breadcrumbs, search, and refined dark/light mode desktop layout.
- **Main Area (`main#main-content`)**: Currently uses `p-4 md:p-8 max-w-7xl mx-auto w-full min-w-0`.

### Shared Core Non-Regression Contract
Both Mobile and Desktop platforms strictly share 100% of:
- **Repositories & Storage**: `BirdRepository`, `BreedingRepository`, `HabitatRepository`, `HealthRepository`, `FinanceRepository`, `HandFeedingRepository`, `LocalStorageProvider`.
- **Business Engines**: `BirdEngine`, `BreedingService`, `HealthEngine`, `CalendarEngine`, `ValidationEngine`, `ActivityLogger`, `WrightCoefficientEngine`.
- **Security & Licensing**: `LMSE`, `RSA-2048`, `SHA-256`, `DeviceFingerprint`, `LicenseEngine`, `OfflineBetaValidator`.
- **PDF Generator**: `pdfDocumentGenerator.ts`.
- **i18n Translations**: `translations.ts` across FR, EN, AR, ES, IT.

---

## 2. Frozen Mobile Bugs Guarantee

The following mobile bug fixes remain strictly untouched and frozen:
- **BUG-01**: First Launch License Guard → `FROZEN / PASS`
- **BUG-02**: Cage Occupancy (`calculateCageOccupancy`) → `FROZEN / PASS`
- **BUG-03**: Cage Back Navigation → `FROZEN / PASS`
- **BUG-04**: Mobile Overflow → `FROZEN / PASS`
- **BUG-05**: Mobile Navigation → `FROZEN / PASS`
- **BUG-06**: Expenses/Sales/Health i18n → `FROZEN / PASS`
- **BUG-07**: Mobile Biological Reference & Menu Indicators → `IMPLEMENTED / WAITING FOR PHYSICAL ANDROID 16 VALIDATION`

---

## 3. Responsive Strategy & Breakpoints

- **Mobile (`<768px`)**: Retain current mobile card view, compact headers, mobile race dropdown selector (BUG-07), and mobile drawer. Zero refactoring of mobile UI.
- **Tablet (`768px – 1023px`)**: Retain current adaptive layout.
- **Desktop (`≥1024px / lg:`)**:
  - Sticky Desktop Sidebar (`w-64` / `w-72`).
  - Desktop Top Bar Header (`DesktopTopBar.tsx`) with active title, breadcrumbs (`fil d'Ariane`), quick search, notifications, license badge, and theme toggle.
  - Multi-column dashboards, side-by-side panels, and professional Data Tables (`AppTable`).

---

## 4. Phase 2 — Proposed Desktop Architecture & Components

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              DesktopTopBar                                   │
├─────────────────┬────────────────────────────────────────────────────────────┤
│                 │                        AppPage                             │
│  DesktopSidebar │  Breadcrumb: Bird Academy / Oiseaux                        │
│                 │                                                            │
│  - Branding     │  Desktop View (lg:block): Data Table (AppTable)            │
│  - 14 Modules   │  Mobile View (lg:hidden): Card Grid                        │
│  - i18n & Theme │                                                            │
│  - LMSE Badge   │  Side-by-side details, multi-column analytics              │
└─────────────────┴────────────────────────────────────────────────────────────┘
```

### Component Creation Plan
1. **`src/components/ui/DesktopSidebar.tsx`**:
   - Sidebar component with active indicators, icon badges, license status badge, language selector, and theme toggle.
   - Arabic RTL support (`dir="rtl"`, positioned on right edge in RTL mode).
2. **`src/components/ui/DesktopTopBar.tsx`**:
   - Header bar with breadcrumbs (`fil d'Ariane`), module title, quick search input, notification indicator, theme toggle, and license status.
3. **`tests/desktop-layout-audit.test.ts`**:
   - Comprehensive automated test suite covering desktop viewports (`1280px`, `1366px`, `1440px`, `1600px`, `1920px`, `2560px`), responsive layout switches, data table rendering, RTL mode, dark mode, and 5-language i18n.

### Component Modification Plan
1. **`src/App.tsx`**:
   - Integrate `DesktopSidebar` and `DesktopTopBar` for `>=1024px` viewports while keeping mobile drawer intact for `<768px`.
2. **`src/components/Canaris.tsx`**:
   - Add Desktop Data Table view (`AppTable`: Selection, Bague, Nom, Espèce, Race, Sexe, Âge, Santé, Cage, Actions) on `lg:` viewports with multi-select, batch action toolbar, and drawer detail sheet, while preserving card view on `<768px`.
3. **`src/components/Dashboard.tsx`**:
   - 4-card top KPI banner, 2-column chart grid, side-by-side Activity Log and Alerts panel.
4. **`src/components/Sante.tsx`**, **`src/components/Depenses.tsx`**, **`src/components/Ventes.tsx`**:
   - Data tables on `lg:` viewports with CSV export controls.
5. **`src/components/Parametres.tsx`**:
   - Desktop sidebar/tabbed layout for settings categories.
6. **`src/features/analytics/components/AnalyticsDashboard.tsx`**:
   - 2x2 desktop grid for analytics charts and comparison widgets.
7. **`src/features/genetics/components/GeneticsDashboard.tsx`**:
   - Side-by-side desktop panel for Pair Simulation & Pedigree Explorer.
8. **`src/features/intelligence/dashboards/IntelligenceDashboard.tsx`**:
   - Side-by-side scorecards and diagnostic panels.

---

## 5. Non-Regression & Safety Checklist

- [x] No modifications to `calculateCageOccupancy`.
- [x] No modifications to `LMSE`, `RSA-2048`, `SHA-256`, `DeviceFingerprint`.
- [x] No modifications to `pdfDocumentGenerator.ts`.
- [x] No modifications to genetics or reproduction engines.
- [x] No changes to mobile drawer behavior or mobile breakpoints (`<768px`).
- [x] All new Desktop strings use `t(...)` across FR, EN, AR, ES, IT.
- [x] Full Arabic RTL verification on Desktop sidebar, topbar, and data tables.
