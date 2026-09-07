const fs = require('fs');
const path = 'src/features/reproduction/services/ReproductionService.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('ReproductionRepository.migrate()')) {
  content = content.replace(
    "static getPairs(includeArchived = false): BreedingPair[] {",
    "static getPairs(includeArchived = false): BreedingPair[] {\n    ReproductionRepository.migrate();"
  );
  fs.writeFileSync(path, content);
}
