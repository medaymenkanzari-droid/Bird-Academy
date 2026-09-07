const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "<Couples couples={couples} canaris={canaris} reproductions={reproductions} onAddCouple={onAddCouple} onDissolveCouple={onDissolveCouple} onStartReproduction={onStartReproduction} />",
  "<Couples couples={couples} canaris={canaris} reproductions={reproductions} onAddCouple={onAddCouple} onDissolveCouple={onDissolveCouple} onStartReproduction={onStartReproduction} quickAddOpen={quickAddCoupleOpen} setQuickAddOpen={setQuickAddCoupleOpen} />"
);

fs.writeFileSync('src/App.tsx', content);
