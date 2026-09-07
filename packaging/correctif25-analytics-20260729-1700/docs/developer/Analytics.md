# Analytics and Statistics Calculations

## 1. Overview
The Analytics feature calculates critical metrics and renders visual charts for aviary performance.

## 2. Core Metrics
- **Success Rate (Taux de réussite des pontes):** Calculated as `(Eclosions / Oeufs) * 100`.
- **Fecundity Rate (Taux de fécondité):** Calculated as `(Oeufs Fécondés / Oeufs) * 100`.
- **Weaning Success (Taux de sevrage):** Calculated as `(Sevré / Eclosions) * 100`.
- **Financial Balance (Bilan Financier):** Calculated as `Total Ventes - Total Dépenses`.

## 3. Tech Stack
- **D3.js & Recharts:** Used for plotting multi-series line charts, cash-flow bar charts, and category pie charts.
- **Incremental Cache:** Heavy stats computations are cached and refreshed only when new records are saved in repositories.
