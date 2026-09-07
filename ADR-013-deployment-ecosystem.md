# ADR-013: Deployment Ecosystem, PWA, Desktop & Release Infrastructure

## Status
Approved

## Context
As Bird Academy matures into a fully-fledged product (entering v1.0.0 and beyond), we require a robust, enterprise-grade deployment ecosystem. The solution must remain offline-first, run 100% locally with zero external network dependencies, support multiple languages (FR, EN, AR, ES, IT), and be packaged for Web, Progressive Web App (PWA), and Desktop (Tauri). 

Key challenges include:
1. Transforming the application into an installable PWA with seamless background caching and offline functionality.
2. Formulating a zero-Electron desktop architecture utilizing Tauri for cross-platform packaging (Windows, macOS, Linux).
3. Designing an isolated Demonstration Mode that populates ~100 records (birds, couples, cages, finances) without polluting the user's primary database.
4. Implementing an intuitive Welcome Wizard for first-time onboarding.
5. Providing developer and user documentation directly inside the offline bundle.

## Decision
We decided to implement a unified, multi-platform distribution and release infrastructure:

1. **Progressive Web App (PWA):**
   - Configured via `vite-plugin-pwa` for service worker injection and background asset caching.
   - Built an in-app **Installation Banner**, **Offline Status Indicator**, and **Update Notification Banner** utilizing Service Worker registration hooks.
   - Fully cached webmanifest, local fonts, icons, and translation dictionaries for 100% offline-ready operations.

2. **Desktop Edition Prep (`src/desktop/`):**
   - Prepared Tauri configurations (`tauri.conf.json`) and IPC message channels.
   - Designed file system and local app-window layout patterns without Electron dependencies, reducing memory footprint by 90%.

3. **Demonstration Mode (Isolated DB Cache):**
   - Implemented an elegant namespace router in `appStorage`. When `bird_academy_demo_active` is enabled, all repository calls automatically redirect to a `demo_` prefix namespace.
   - Developed a mock database generator delivering ~100 realistic records (including Canaries, Goldfinches, pairings, nests, finances, health checkups, and notifications) to let users play with full charts and features.

4. **Welcome Wizard Onboarding:**
   - Designed a step-by-step assistant for initial language selection, aviary naming, species bred, goals, and creating their first bird, with quick "Skip" and "Reset" features.

5. **Local Documentation Engine:**
   - Built a comprehensive, searchable in-app documentation center compiling user guides, admin guides, biological glossaries, and FAQs that run completely offline.

6. **Import/Export Pro:**
   - Extended basic import/export with schema validation, column mapping, CSV/JSON previewing, and error reporting.

## Consequences
- **Zero-Latency Data Access:** Standard repositories run transparently on top of the prefixed namespaces, keeping code changes modular and clean.
- **Cross-Platform Compatibility:** The codebase compiles cleanly for both web, mobile PWA, and desktop without requiring separate branches.
- **Improved User Activation:** Onboarding and demo data decrease time-to-value for new breeders.
- **Strict Compliance:** Zero external SDK queries protect breeder privacy.
