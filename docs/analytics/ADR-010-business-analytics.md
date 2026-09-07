# Architecture Decision Record (ADR)

## ADR-010: Offline-First Business Analytics, Reporting & Enterprise Insights

*   **Status:** Accepted
*   **Deciders:** Lead Software Engineer, Bird Academy
*   **Date:** 2026-07-14

---

## 1. Context and Problem Statement

To transition **Bird Academy** into a professional avian enterprise resource planning (ERP) system, we must provide real-time dashboards, historical metrics, custom snapshots, reporting compilers, and tabular data exports. 

All analytics must:
1.  **Operate 100% Offline**: Work locally in the browser with local persistence.
2.  **Consolidated Read-Only Pattern**: Read from existing biology/business engines without mutating domain states.
3.  **High-Performance Execution**: Compute complex coefficients, financial aggregates, and cohort analysis under $16\text{ms}$ to maintain 60 FPS interfaces.

---

## 2. Decision Drivers

*   **Security & Local-First Sovereignty**: Breeders require strict privacy for their valuable genetic assets and transactions.
*   **Scalability**: Handling cheptels exceeding 10,000 birds without causing UI lagging or freezing.
*   **Aesthetic Alignment**: Dashboards and widgets must match our custom design system and layout standards.

---

## 3. Considered Options

*   **Option A**: Remote backend server computing the statistics on a MySQL database.
    *   *Cons*: Fails completely during remote aviary checks with zero network; introduces latency and monthly infrastructure fees.
*   **Option B**: Locally cached aggregates using decentralized state listeners.
    *   *Cons*: Multiplies state synchronization complexities.
*   **Option C**: Local Consolidated Read-Only Aggregation Engine with Memoized Memo Maps (Chosen).
    *   *Pros*: Keeps data pipelines completely decoupled; centralizes calculations into a single deterministic repository; maintains high performance via React `useMemo` hooks.

---

## 4. Decision Outcome

We chose **Option C**. All analytics calculations are centralized inside `AnalyticsEngine.ts`, reading from domain-level storage registries via a central read-only aggregation routine.

### Performance & Cache Design
1.  **Lazy Filtering & Mapping**: Filters are applied in sequence using native JavaScript $O(N)$ operations.
2.  **State Isolation**: Snapshots are persisted directly to `localStorage`, serving as stable reference markers for MoM/YoY trend rendering.
3.  **Recharts Responsive Containers**: Visual components are optimized with memoized data inputs to prevent redundant canvas repaint triggers.
