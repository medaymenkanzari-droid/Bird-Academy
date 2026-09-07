const fs = require('fs');
const path = 'src/features/habitat/repositories/HabitatRepository.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "const migrationDoneKey = 'ba_habitat_migration_done';\n    if (appStorage.getItem<boolean>(migrationDoneKey, false)) {\n      return;\n    }",
  "const migrationDoneKey = 'ba_habitat_migration_done';\n    const existing = appStorage.getItem<any[]>(this.KEYS.cage, []);\n    if (existing.length > 0 && appStorage.getItem<boolean>(migrationDoneKey, false)) {\n      return;\n    }"
);

fs.writeFileSync(path, content);
