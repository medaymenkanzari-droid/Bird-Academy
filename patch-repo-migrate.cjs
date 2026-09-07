const fs = require('fs');
const path = 'src/features/reproduction/repositories/ReproductionRepository.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "const hasPairs = appStorage.getItem<any[]>(this.PAIRS_KEY, null) !== null;",
  "const existingPairs = appStorage.getItem<any[]>(this.PAIRS_KEY, null);\n    const hasPairs = existingPairs !== null && existingPairs.length > 0;"
);

fs.writeFileSync(path, content);
