# Genetics Engine and Inbreeding Calculations

## 1. Mutations Engine
Bird Academy models genetic transmission of traits (such as recessive, dominant, and sex-linked mutations):
- **Dominant mutations:** Transmitted if at least one parent carries it.
- **Recessive mutations:** Required from both parents to be phenotypically visible.
- **Sex-linked mutations:** Reside on the sex chromosomes ($Z$ and $W$), which means females inherit their father's trait while males require it from both parents.

## 2. Consanguinity (Wright's Coefficient $F$)
Wright's Coefficient of Inbreeding (COI) measures the probability that two alleles at a locus are identical by descent. It is calculated by traversing the ancestry tree:

$$F = \sum \left( \frac{1}{2} \right)^{n_1 + n_2 + 1} (1 + F_A)$$

Where:
- $F_A$ is the inbreeding coefficient of the common ancestor $A$.
- $n_1$ and $n_2$ are the number of generations from the father and mother to $A$.

The genetics module caches these tree traversals to allow instant feedback during mating selection.
