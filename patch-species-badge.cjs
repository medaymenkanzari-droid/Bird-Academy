const fs = require('fs');
let content = fs.readFileSync('src/components/design-system/SpeciesBadge.tsx', 'utf8');

content = content.replace("const { localT } = useLanguage();", "const { t } = useLanguage();");
content = content.replace("localT(speciesInfo.nameKey)", "t(speciesInfo.nameKey)");
content = content.replace("localT('undetermined')", "t('undetermined')");

fs.writeFileSync('src/components/design-system/SpeciesBadge.tsx', content);
