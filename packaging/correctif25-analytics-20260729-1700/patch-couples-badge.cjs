const fs = require('fs');
let content = fs.readFileSync('src/components/Couples.tsx', 'utf8');

if (!content.includes('SpeciesBadge')) {
  content = content.replace("import { AppCard, AppButton, AppBadge, AppAlert, AppSelect, AppEmptyState } from './design-system';", "import { AppCard, AppButton, AppBadge, AppAlert, AppSelect, AppEmptyState, SpeciesBadge } from './design-system';");
}

const malePattern = `<div className="font-bold text-slate-800 leading-tight">{male ? male.nom : labels.unknownMale}</div>`;
const maleReplacement = `<div className="flex items-center gap-1.5"><div className="font-bold text-slate-800 leading-tight">{male ? male.nom : labels.unknownMale}</div>{male && <SpeciesBadge speciesId={male.espece} size="sm" showLabel={false} />}</div>`;

const femellePattern = `<div className="font-bold text-slate-800 leading-tight">{femelle ? femelle.nom : labels.unknownFemale}</div>`;
const femelleReplacement = `<div className="flex items-center gap-1.5"><div className="font-bold text-slate-800 leading-tight">{femelle ? femelle.nom : labels.unknownFemale}</div>{femelle && <SpeciesBadge speciesId={femelle.espece} size="sm" showLabel={false} />}</div>`;

content = content.replace(malePattern, maleReplacement);
content = content.replace(femellePattern, femelleReplacement);

// There is also a list of birds in the dropdown to create couples.
// Not super easy to patch safely, but this is a good start.

fs.writeFileSync('src/components/Couples.tsx', content);
