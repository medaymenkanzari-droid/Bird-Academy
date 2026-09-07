const fs = require('fs');
let content = fs.readFileSync('src/utils/translations.ts', 'utf8');

// FR
content = content.replace(/canaris: "Canaris",/, 'canaris: "Oiseaux",');
content = content.replace(/totalCanaris: "Canaris Totaux",/, 'totalCanaris: "Oiseaux Totaux",');
content = content.replace(/venduCanari: "Canari vendu",/, 'venduCanari: "Oiseau vendu",');
content = content.replace(/chooseCanari: "-- Choisir un canari --",/, 'chooseCanari: "-- Choisir un oiseau --",');
content = content.replace(/noCanariAvailable: "Aucun canari n'est actuellement disponible à la vente\.",/, "noCanariAvailable: \"Aucun oiseau n'est actuellement disponible à la vente.\",");
content = content.replace(/cessionControlDesc: "L'application garantit qu'un canari ne peut pas être cédé plusieurs fois\. Seuls les canaris vivants et présents dans votre élevage sont sélectionnables\.",/, "cessionControlDesc: \"L'application garantit qu'un oiseau ne peut pas être cédé plusieurs fois. Seuls les oiseaux vivants et présents dans votre élevage sont sélectionnables.\",");

fs.writeFileSync('src/utils/translations.ts', content);
