const fs = require('fs');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  replacements.forEach(([from, to]) => {
    content = content.split(from).join(to);
  });
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

// ReproductionService
replaceInFile('src/features/reproduction/services/ReproductionService.ts', [
  ["appStorage.getItem<any[]>('reproductions', [])", "appStorage.getItem<any[]>('bird_academy_reproductions', [])"],
  ["appStorage.getItem<any[]>('pontes', [])", "appStorage.getItem<any[]>('bird_academy_pontes', [])"]
]);

// DataIntegrityEngine
const integrityReplacements = [
  "'canaris'", "'bird_academy_canaris'",
  "'couples'", "'bird_academy_couples'",
  "'reproductions'", "'bird_academy_reproductions'",
  "'pontes'", "'bird_academy_pontes'",
  "'jeunes'", "'bird_academy_jeunes'",
  "'sante'", "'bird_academy_sante'",
  "'depenses'", "'bird_academy_depenses'",
  "'ventes'", "'bird_academy_ventes'",
  "'cages'", "'bird_academy_cages'"
];
let integrityArray = [];
for (let i = 0; i < integrityReplacements.length; i += 2) {
  integrityArray.push([`appStorage.getItem<Canari[]>(${integrityReplacements[i]},`, `appStorage.getItem<Canari[]>(${integrityReplacements[i+1]},`]);
  integrityArray.push([`appStorage.getItem<Couple[]>(${integrityReplacements[i]},`, `appStorage.getItem<Couple[]>(${integrityReplacements[i+1]},`]);
  integrityArray.push([`appStorage.getItem<Reproduction[]>(${integrityReplacements[i]},`, `appStorage.getItem<Reproduction[]>(${integrityReplacements[i+1]},`]);
  integrityArray.push([`appStorage.getItem<Ponte[]>(${integrityReplacements[i]},`, `appStorage.getItem<Ponte[]>(${integrityReplacements[i+1]},`]);
  integrityArray.push([`appStorage.getItem<Jeune[]>(${integrityReplacements[i]},`, `appStorage.getItem<Jeune[]>(${integrityReplacements[i+1]},`]);
  integrityArray.push([`appStorage.getItem<Sante[]>(${integrityReplacements[i]},`, `appStorage.getItem<Sante[]>(${integrityReplacements[i+1]},`]);
  integrityArray.push([`appStorage.getItem<Depense[]>(${integrityReplacements[i]},`, `appStorage.getItem<Depense[]>(${integrityReplacements[i+1]},`]);
  integrityArray.push([`appStorage.getItem<Vente[]>(${integrityReplacements[i]},`, `appStorage.getItem<Vente[]>(${integrityReplacements[i+1]},`]);
  integrityArray.push([`appStorage.getItem<any[]>(${integrityReplacements[i]},`, `appStorage.getItem<any[]>(${integrityReplacements[i+1]},`]);
}
replaceInFile('src/features/quality/validation/DataIntegrityEngine.ts', integrityArray);

// HabitatRepository
replaceInFile('src/features/habitat/repositories/HabitatRepository.ts', [
  ["appStorage.getItem<Cage[]>('cages', [])", "appStorage.getItem<Cage[]>('bird_academy_cages', [])"],
  ["appStorage.setItem('cages',", "appStorage.setItem('bird_academy_cages',"]
]);

