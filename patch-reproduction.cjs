const fs = require('fs');
let content = fs.readFileSync('src/components/Reproduction.tsx', 'utf8');

if (!content.includes('SpeciesBadge')) {
  content = content.replace("import { Plus, Check, X, Egg, Feather, Activity, ShieldAlert, CheckCircle2, ChevronRight, History, Calendar, Beaker } from 'lucide-react';", "import { Plus, Check, X, Egg, Feather, Activity, ShieldAlert, CheckCircle2, ChevronRight, History, Calendar, Beaker } from 'lucide-react';\nimport { SpeciesBadge } from './design-system';");
}

const parentPattern = `<div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-1">
                          <span className="text-blue-600">♂ {m ? m.nom : "—"}</span>
                          <span className="text-slate-300">x</span>
                          <span className="text-rose-600 font-semibold">♀ {f ? f.nom : "—"}</span>
                        </div>`;

const parentReplacement = `<div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-1">
                          <span className="text-blue-600 flex items-center gap-1">♂ {m ? m.nom : "—"} {m && <SpeciesBadge speciesId={m.espece} size="sm" showLabel={false} />}</span>
                          <span className="text-slate-300">x</span>
                          <span className="text-rose-600 font-semibold flex items-center gap-1">♀ {f ? f.nom : "—"} {f && <SpeciesBadge speciesId={f.espece} size="sm" showLabel={false} />}</span>
                        </div>`;

content = content.replace(parentPattern, parentReplacement);

fs.writeFileSync('src/components/Reproduction.tsx', content);
