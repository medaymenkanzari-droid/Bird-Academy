const fs = require('fs');
let content = fs.readFileSync('src/components/Canaris.tsx', 'utf8');

// There are three places where this happens
const badPattern = `    cage_id: undefined,
    acquisition: false,
    pere_id: null,
    mere_id: null,
    photo: '',
    photos: [],
    documents: [],
    elevage: '',
    zone: '',
    voliere: '',
    compartiment: '',
    eleveur_origine: '',
    parent_pere_nourricier_id: null,
    parent_mere_nourriciere_id: null,
    statut_sante: 'Actif',
    observations: '',
    acquisition: false`;

const goodPattern = `    cage_id: undefined,
    acquisition: false,
    pere_id: null,
    mere_id: null,
    photo: '',
    photos: [],
    documents: [],
    elevage: '',
    zone: '',
    voliere: '',
    compartiment: '',
    eleveur_origine: '',
    parent_pere_nourricier_id: null,
    parent_mere_nourriciere_id: null,
    statut_sante: 'Actif',
    observations: ''`;

content = content.replace(badPattern, goodPattern);
content = content.replace(badPattern.replace(/    /g, '        '), goodPattern.replace(/    /g, '        '));
content = content.replace(badPattern.replace(/    /g, '                '), goodPattern.replace(/    /g, '                '));

fs.writeFileSync('src/components/Canaris.tsx', content);
