# Genetics & Genealogy Engine Documentation

This folder documents the scientific guidelines, data structures, and algorithms powering the Genetics & Genealogy module in **Bird Academy**.

## 1. Directory Structure

The module is structured as follows:

```text
/src/features/genetics/
├── components/
│   ├── GenealogyExplorer.tsx    # Interactive pedigree tree (horizontal/vertical)
│   ├── PairSimulation.tsx       # Predictive pairing simulator & DSS advice
│   ├── LineageAnalysis.tsx      # Comprehensive individual genetic health & diversity
│   ├── GeneticsParameters.tsx   # Configurable thresholds for coefficients & limits
│   ├── GeneticsDashboard.tsx    # Main unified layout with sub-tabs
│   └── index.ts                 # Clean export layer
├── engines/
│   ├── GeneticsEngine.ts        # Primary pipeline for tree structure & branches analysis
│   └── WrightCoefficientEngine.ts # Sewall Wright COI calculation with path-finding
├── repositories/
│   └── GeneticsRepository.ts    # Persistent localStorage settings repository
├── types/
│   └── index.ts                 # Unified TypeScript interfaces
└── widgets/
    └── GeneticsWidgets.tsx      # Reusable visual dials, scorecards, and gauges
```

## 2. Core Concepts & Scientific Formulae

### Sewall Wright's Coefficient ($F$)
Measures the probability that two alleles at a given locus are identical by descent. It is calculated dynamically based on common ancestors shared between selected paternal and maternal lines:

$$F = \sum \left( \frac{1}{2} \right)^{n_1 + n_2 + 1} (1 + F_A)$$

### Individual Diversity Index
Calculated dynamically based on:
- **Pedigree Completeness**: Ratio of filled ancestral nodes over the theoretical maximum ($2^d - 2$) across 5 generations.
- **Gene Pool Rarity**: The number of unique ancestral strains/founders still present in active branches.

## 3. Threshold Guidelines

The system leverages the configurable genetics parameters to classify pairings into four threat levels:

| Threshold ($F$) | Risk Classification | Recommended Action |
| :--- | :--- | :--- |
| **$0.0\%$** | Aucun (No relationship) | **Recommandé** (Ideal for line vigor) |
| **$< 6.25\%$** | Faible (Low) | **Acceptable** (Cousins, minor inbreeding) |
| **$6.25\% - 12.5\%$** | Modéré (Moderate) | **Prudence** (Careful selection of traits required) |
| **$12.5\% - 25.0\%$** | Élevé (High) | **Déconseillé** (Half-siblings, parent-offspring) |
| **$> 25.0\%$** | Critique (Critical) | **À Éviter** (Full-siblings, severe inbreeding depression) |

## 4. Circular Reference Guard

To maintain a Directed Acyclic Graph (DAG) state, the `GeneticsEngine` verifies that no bird can be saved as its own ancestor. Cyclic graph detection is performed at save-time, ensuring zero recursion infinite-loop failures.
