const fs = require('fs');
const path = 'src/features/reproduction/repositories/ReproductionRepository.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "private static LEGACY_COUPLES_KEY = 'couples';",
  "private static LEGACY_COUPLES_KEY = 'bird_academy_couples';"
);

fs.writeFileSync(path, content);
