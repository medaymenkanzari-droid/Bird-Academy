# Architecture Decision Record (ADR-012)
## Quality Assurance & Release Candidate Engineering Strategy

* **Status**: Proposed
* **Date**: 2026-07-14
* **Author**: Lead Software Engineer, Bird Academy
* **Decisions**: Implementation of a decentralized, offline-first quality suite (Validation, Error Interceptor, Benchmark Suite, Automated Test harness, WCAG settings, Release Manager).

---

## 1. Context and Problem Statement

To transform Bird Academy into an enterprise-grade platform capable of scale-out without regression, we require a systematic way to audit data, track exceptions, monitor interface latency under load (up to 10,000 birds), and compile release notes directly inside our offline single-page-application.

Existing features operate inside strict biological limits (genetics, couple matchings, nursery incubation timelines). However, there is no passive or reactive validator that score the entire database, nor are there native performance diagnostics or unit test harnesses executable on real datasets directly in-browser.

## 2. Decision and Implementation Details

We chose to implement a modular and strictly separated **Quality Engine** (non-intrusive metadata context) under `/src/features/quality` to keep the core biological modules pure and lightweight.

The architecture comprises:

1. **Validation Engine (`ValidationEngine.ts` & modules)**:
   * Translates 10 specialized domains of business validations.
   * Employs linear scoring calculations (deducting weighted points for errors and warnings) resulting in a global health score.
2. **Global Error Center (`GlobalErrorEngine.ts` & Interceptor)**:
   * Intercepts, classifies, and suggests remedies for exceptions.
   * Saves historical exceptions in browser storage up to a quota safety limit of 100 logs.
3. **Automated Test Harness (`TestRunnerEngine.ts`)**:
   * Simulates/runs actual suites checking Unit translations, Bird integration registries, egg limitations, and DOM-rendering capabilities.
   * Reports test assertions with exact actual vs expected outputs.
4. **Latency Diagnostics (`BenchmarkEngine.ts`)**:
   * Assesses real timing for KPI loads, inbreeding traversals, search queries, and backups using `performance.now()`.
   * Displays grades (A+ to F) compared against acceptable SLA thresholds.
5. **Interactive Help Center & FAQ**:
   * Retains an offline Knowledge Base with localized advice on bio-safety, nesting, and weaning parameters.

## 3. Consequences

### Positive:
* **Zero Cloud Dependencies**: The entire QA testing framework runs 100% offline, keeping in line with the client-side database rules.
* **Proactive Bug Fixing**: Developers and users can find exactly where data corruptions or gender mismatches occurred with step-by-step suggestions.
* **Predictable Latency**: Benchmarking allows instant profiling of code modifications on larger rosters.

### Neutral:
* **Storage Footprint**: Error log registers and benchmark histories are limited to 100 and 20 elements respectively to conserve LocalStorage space.
* **Test Isolation**: In-browser integrations query existing memory repository states directly; therefore, modifications made during test dry-runs are designed to operate safely on temporary structures to prevent real-data pollution.
