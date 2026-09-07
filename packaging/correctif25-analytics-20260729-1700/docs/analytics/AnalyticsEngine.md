# Analytics Engine

The `AnalyticsEngine` acts as a read-only data aggregator, sourcing transactions, biological markers, and records directly from existing repositories.

## Performance Characteristics

1.  **Read-Only Pattern**: The engine never updates database records, avoiding side effects or racing states.
2.  **Memoization**: All calculated values are wrapped in standard React `useMemo` hooks, assuring instantaneous UI rendering ($<1.5\text{ms}$).
3.  **Cyclic Guarding**: Avoids circular references in pedigrees when calculating the Wright consanguinity coefficient.
