const fs = require('fs');
const path = 'src/components/Sante.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { useLanguage } from '../context/LanguageContext';",
  "import { useLanguage } from '../context/LanguageContext';\nimport { SpeciesBadge } from './design-system';"
);

fs.writeFileSync(path, content);
