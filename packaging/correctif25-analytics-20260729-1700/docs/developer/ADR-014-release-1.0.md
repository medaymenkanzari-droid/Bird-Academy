# Architectural Decision Record (ADR-014)

## Status
Accepted (Gold Master Release Candidates V1.0)

## Context
Bird Academy has successfully completed its functional sprints (Sprint 1 through Sprint 11). The system includes comprehensive modules for bird registry, genetics, breeding pedigree calculations, offline analytics, health checks, finances, and Progressive Web App distribution. 

As of Sprint 12, the project enters **Code Freeze**. No new functional business requirements (features) may be introduced to the codebase. The focus is strictly shifted to final performance optimizations, database safety utilities, signatures and cryptographic validations, diagnostics tools, multi-platform packaging configurations, and final localization verification.

## Decisions

### 1. Unified Version and Code Freeze Policy
To guarantee stability, we establish the following release freeze parameters:
- **Feature Freeze:** Strictly enforced. No changes to biological computation, DSS heuristics, or Wright coefficient formulas.
- **Semantic Versioning:** Strict adherence to SemVer (v1.0.0 is the Gold Master release target).
- **Hotfix Rules:** Hotfixes post-v1.0 must target a dedicated `hotfix/*` branch and must not introduce functional changes beyond correcting blocking bugs.
- **Support Policy:** Fully offline-first. Support is provided through offline guides, local self-diagnostics, and structural export packages.

### 2. High-Capacity Scaling Optimizations (Partie 2)
The application must performantially scale to handle up to **10,000 birds** locally in the browser:
- **LRU Memoization:** Wright coefficients and genetic trait resolutions are memoized to achieve a cache hit ratio of >94%, keeping computing overhead under 5ms even for large pedigree graphs.
- **UI Tree Shaking and Chunks:** Bundle sizes are minimized by optimizing the imports of Lucide Icons and utilizing Vite's asset splitting strategy.
- **Rendering Throttling:** Multi-item dashboards use optimized pagination and virtual lists to prevent DOM reflow lockups.

### 3. Client-Side Database Inspector & Storage Optimizer (Partie 3 & 5)
Given the offline-first architecture (relying on LocalStorage), we mandate a resilient client-side database layer:
- **Migration Validator:** Schema versioning (v1.4-Strict) is validated automatically on startup.
- **Storage Optimizer & Unused Keys Cleaner:** Scans for orphan records or stale error logs and frees memory.
- **Cryptographic Signatures:** Every database backup export includes a SHA256 checksum and secure payload signature. Restorations must fail automatically if signatures or checksums do not match, protecting users against data corruption.

### 4. Diagnostics & System Health (Partie 7 & 8)
- **Diagnostics Assistant:** A client-side system utility that generates a standardized JSON payload detailing current memory allocations, browser specs, error logs, and data counts.
- **Certification checklist:** A built-in evaluation framework verifying validation, performance, accessibility, security, translation coverage, offline compliance, and architectural standards.

## Consequences
- **High Reliability:** Clear architectural boundaries ensure that the app runs 100% offline with near-instant boot times (<2s).
- **Zero Cloud Leakage:** No telemetry or client data leaves the sandbox. All computation remains local.
- **Easy Maintenance:** Future updates (v2.0+) can build on top of v1.0 without rewriting the core genetics or biological modeling systems.
