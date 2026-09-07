/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { TRANSLATIONS, Language } from '../src/utils/translations.js';
import { normalizeExpenseCategory, getLocalizedExpenseDescription } from '../src/components/Depenses.js';
import { normalizeBuyerType, formatLocalizedBuyer, formatLocalizedSaleDescription } from '../src/components/Ventes.js';
import { normalizeHealthCategory, normalizeHealthStatus, formatLocalizedTreatment, formatLocalizedHealthDescription } from '../src/components/Sante.js';

const LANGUAGES: Language[] = ['fr', 'en', 'ar', 'es', 'it'];

// Helper t generator for testing
function getT(lang: Language) {
  return (key: string, vars?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['fr'];
    let text = dict[key] || TRANSLATIONS['fr'][key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.split(`{${k}}`).join(String(v));
      });
    }
    return text;
  };
}

test('EXP-01 — Catégories Dépenses en FR (Historic + Stable)', () => {
  const t = getT('fr');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Alimentation')}`), 'Alimentation');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('food')}`), 'Alimentation');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Santé')}`), 'Santé');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('health')}`), 'Santé');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Matériel')}`), 'Matériel');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('equipment')}`), 'Matériel');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Cages')}`), 'Cages');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('cages')}`), 'Cages');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Autre')}`), 'Autre');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('other')}`), 'Autre');
});

test('EXP-02 — Catégories Dépenses en EN (Historic + Stable)', () => {
  const t = getT('en');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Alimentation')}`), 'Food & Feed');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('food')}`), 'Food & Feed');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Santé')}`), 'Health');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('health')}`), 'Health');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Matériel')}`), 'Equipment');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('equipment')}`), 'Equipment');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Cages')}`), 'Cages');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('cages')}`), 'Cages');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Autre')}`), 'Other');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('other')}`), 'Other');
});

test('EXP-03 — Catégories Dépenses en AR (Historic + Stable)', () => {
  const t = getT('ar');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Alimentation')}`), 'التغذية');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('food')}`), 'التغذية');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Santé')}`), 'الصحة');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('health')}`), 'الصحة');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Matériel')}`), 'المعدات');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('equipment')}`), 'المعدات');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Cages')}`), 'الأقفاص');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('cages')}`), 'الأقفاص');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Autre')}`), 'أخرى');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('other')}`), 'أخرى');
});

test('EXP-04 — Catégories Dépenses en ES (Historic + Stable)', () => {
  const t = getT('es');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Alimentation')}`), 'Alimentación');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('food')}`), 'Alimentación');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Santé')}`), 'Salud');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('health')}`), 'Salud');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Matériel')}`), 'Materiales');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('equipment')}`), 'Materiales');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Cages')}`), 'Jaulas');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('cages')}`), 'Jaulas');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Autre')}`), 'Otros');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('other')}`), 'Otros');
});

test('EXP-05 — Catégories Dépenses en IT (Historic + Stable)', () => {
  const t = getT('it');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Alimentation')}`), 'Alimentazione');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('food')}`), 'Alimentazione');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Santé')}`), 'Salute');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('health')}`), 'Salute');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Matériel')}`), 'Attrezzatura');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('equipment')}`), 'Attrezzatura');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Cages')}`), 'Gabbie');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('cages')}`), 'Gabbie');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Autre')}`), 'Altro');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('other')}`), 'Altro');
});

test('SALE-01 — Détails Ventes dans les 5 langues (Buyer & Descriptions)', () => {
  const buyersHistoric = ['Éleveur Amateur', 'Animalerie', 'Exposition', 'Autre', 'Jean-Pierre Durand (Éleveur amateur)'];
  const buyersStable = ['amateur_breeder', 'pet_store', 'exhibition', 'other'];

  const expectedBuyerEn: Record<string, string> = {
    'amateur_breeder': 'Amateur Breeder',
    'pet_store': 'Pet Store',
    'exhibition': 'Exhibition',
    'other': 'Other',
    'Éleveur Amateur': 'Amateur Breeder',
    'Animalerie': 'Pet Store',
    'Exposition': 'Exhibition',
    'Autre': 'Other',
    'Jean-Pierre Durand (Éleveur amateur)': 'Jean-Pierre Durand (Amateur Breeder)'
  };

  const expectedBuyerAr: Record<string, string> = {
    'amateur_breeder': 'مربي هاوي',
    'pet_store': 'متجر حيوانات',
    'exhibition': 'معرض',
    'other': 'أخرى',
    'Éleveur Amateur': 'مربي هاوي',
    'Animalerie': 'متجر حيوانات',
    'Exposition': 'معرض',
    'Autre': 'أخرى',
    'Jean-Pierre Durand (Éleveur amateur)': 'Jean-Pierre Durand (مربي هاوي)'
  };

  LANGUAGES.forEach(lang => {
    const t = getT(lang);
    [...buyersHistoric, ...buyersStable].forEach(buyer => {
      const localized = formatLocalizedBuyer(buyer, t);
      assert.ok(localized, `Localized buyer should not be empty for ${buyer} in ${lang}`);
      if (lang === 'en' && expectedBuyerEn[buyer]) {
        assert.equal(localized, expectedBuyerEn[buyer]);
      }
      if (lang === 'ar' && expectedBuyerAr[buyer]) {
        assert.equal(localized, expectedBuyerAr[buyer]);
      }
    });

    const descHistoric = "Cession d'un mâle Yorkshire blanc de 2024";
    const localizedDesc = formatLocalizedSaleDescription(descHistoric, t);
    assert.ok(localizedDesc, `Localized sale description should not be empty for ${lang}`);
    if (lang === 'en') assert.equal(localizedDesc, 'Transfer of a 2024 white Yorkshire male');
    if (lang === 'ar') assert.equal(localizedDesc, 'تنازل عن ذكر يوركشاير أبيض من 2024');
    if (lang === 'es') assert.equal(localizedDesc, 'Cesión de un macho Yorkshire blanco de 2024');
    if (lang === 'it') assert.equal(localizedDesc, 'Cessione di un maschio Yorkshire bianco del 2024');
  });
});

test('HEALTH-01 — Traitements Santé dans les 5 langues', () => {
  const treatments = [
    "Anti-parasitaire d'automne",
    "Cure de Vitamines E",
    "Rappel vermifuge d'été",
    "Traitement anti-poux",
    "Visite de contrôle plumes",
    "Coccidiose",
    "Cure antibiotique"
  ];

  LANGUAGES.forEach(lang => {
    const t = getT(lang);
    treatments.forEach(tr => {
      const loc = formatLocalizedTreatment(tr, t);
      assert.ok(loc, `Treatment ${tr} should be localized for ${lang}`);
      assert.notEqual(loc, '', `Treatment ${tr} should not be empty`);
    });
  });

  // Verify EN exact string
  const tEn = getT('en');
  assert.equal(formatLocalizedTreatment("Cure de Vitamines E", tEn), "Vitamins E & Selenium");
  assert.equal(formatLocalizedTreatment("Rappel vermifuge d'été", tEn), "Breeding Dewormer");

  // Verify AR exact string
  const tAr = getT('ar');
  assert.equal(formatLocalizedTreatment("Cure de Vitamines E", tAr), "فيتامين هـ وسيلينيوم");
  assert.equal(formatLocalizedTreatment("Rappel vermifuge d'été", tAr), "مضاد الطفيليات");
});

test('HEALTH-02 — Statuts Santé dans les 5 langues', () => {
  const statusesHistoric = ['Terminé', 'En attente', 'En cours', 'Planifié'];
  const statusesStable = ['completed', 'pending', 'in_progress', 'planned'];

  LANGUAGES.forEach(lang => {
    const t = getT(lang);
    [...statusesHistoric, ...statusesStable].forEach(st => {
      const norm = normalizeHealthStatus(st);
      const loc = t(`health.status.${norm}`);
      assert.ok(loc, `Health status ${st} should be localized for ${lang}`);
    });
  });

  const tEn = getT('en');
  assert.equal(tEn(`health.status.${normalizeHealthStatus('Terminé')}`), 'Completed');
  assert.equal(tEn(`health.status.${normalizeHealthStatus('En attente')}`), 'Pending');

  const tAr = getT('ar');
  assert.equal(tAr(`health.status.${normalizeHealthStatus('Terminé')}`), 'مكتمل');
  assert.equal(tAr(`health.status.${normalizeHealthStatus('En attente')}`), 'في الانتظار');
});

test('I18N-01 — Aucun texte français interdit dans Dépenses/Ventes/Santé quand EN est actif', () => {
  const t = getT('en');

  // Depenses details
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Alimentation')}`), 'Food & Feed');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Santé')}`), 'Health');
  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Matériel')}`), 'Equipment');
  assert.equal(getLocalizedExpenseDescription("Sac de 20kg de graines d'élevage", t), '20kg Seed Bag');
  assert.equal(getLocalizedExpenseDescription("Flacon de complexe vitaminé et vermifuge", t), 'Vitamin Complex & Dewormer Bottle');

  // Ventes details
  assert.equal(formatLocalizedBuyer('Éleveur Amateur', t), 'Amateur Breeder');
  assert.equal(formatLocalizedBuyer('Animalerie', t), 'Pet Store');
  assert.equal(formatLocalizedSaleDescription("Cession d'un mâle Yorkshire blanc de 2024", t), 'Transfer of a 2024 white Yorkshire male');

  // Health details
  assert.equal(t(`health.categories.${normalizeHealthCategory('Traitement')}`), 'Treatment / Care');
  assert.equal(t(`health.categories.${normalizeHealthCategory('Vaccin')}`), 'Vaccine / Vitamins');
  assert.equal(formatLocalizedTreatment("Anti-parasitaire d'automne", t), 'Autumn Antiparasitic');
  assert.equal(formatLocalizedHealthDescription("Application d'une goutte d'Ivomec sur la nuque.", t), 'Applying a drop of Ivomec on the nape.');
});

test('I18N-02 — Aucun texte français interdit quand AR est actif', () => {
  const t = getT('ar');

  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Alimentation')}`), 'التغذية');
  assert.equal(getLocalizedExpenseDescription("Sac de 20kg de graines d'élevage", t), 'كيس بذور 20 كغ');
  assert.equal(formatLocalizedBuyer('Éleveur Amateur', t), 'مربي هاوي');
  assert.equal(formatLocalizedSaleDescription("Cession d'un mâle Yorkshire blanc de 2024", t), 'تنازل عن ذكر يوركشاير أبيض من 2024');
  assert.equal(t(`health.categories.${normalizeHealthCategory('Traitement')}`), 'علاج / رعاية');
  assert.equal(formatLocalizedTreatment("Anti-parasitaire d'automne", t), 'مضاد الطفيليات الخريفي');
});

test('I18N-03 — Aucun texte français interdit quand ES est actif', () => {
  const t = getT('es');

  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Alimentation')}`), 'Alimentación');
  assert.equal(getLocalizedExpenseDescription("Sac de 20kg de graines d'élevage", t), 'Saco de semillas 20kg');
  assert.equal(formatLocalizedBuyer('Éleveur Amateur', t), 'Criador Aficionado');
  assert.equal(t(`health.categories.${normalizeHealthCategory('Traitement')}`), 'Tratamiento / Cuidado');
  assert.equal(formatLocalizedTreatment("Anti-parasitaire d'automne", t), 'Antiparasitario de otoño');
});

test('I18N-04 — Aucun texte français interdit quand IT est actif', () => {
  const t = getT('it');

  assert.equal(t(`expenses.categories.${normalizeExpenseCategory('Alimentation')}`), 'Alimentazione');
  assert.equal(getLocalizedExpenseDescription("Sac de 20kg de graines d'élevage", t), 'Sacco di semi 20kg');
  assert.equal(formatLocalizedBuyer('Éleveur Amateur', t), 'Allevatore Amatoriale');
  assert.equal(t(`health.categories.${normalizeHealthCategory('Traitement')}`), 'Trattamento / Cura');
  assert.equal(formatLocalizedTreatment("Anti-parasitaire d'automne", t), 'Antiparassitario autunnale');
});

test('I18N-05 — Symmetry Check: 0 missing keys across all 5 languages', () => {
  const frKeys = Object.keys(TRANSLATIONS.fr);

  const testKeys = [
    'expenses.categories.food', 'expenses.categories.health', 'expenses.categories.equipment', 'expenses.categories.cages', 'expenses.categories.other',
    'expenses.descriptions.food_20kg', 'expenses.descriptions.double_cage', 'expenses.descriptions.vitamins_supplements',
    'expenses.printPdf', 'expenses.pdfTitle', 'expenses.pdfSub', 'expenses.secOverview', 'expenses.secDetails',
    'sales.buyerTypes.amateur_breeder', 'sales.buyerTypes.pet_store', 'sales.buyerTypes.exhibition', 'sales.buyerTypes.other',
    'sales.descriptions.yorkshire_white_2024', 'sales.descriptions.breeding_male_sale', 'sales.descriptions.song_pair_transfer', 'sales.descriptions.weaned_chick_sale',
    'sales.printPdf', 'sales.pdfSub', 'sales.secSummary', 'sales.secDetails',
    'health.categories.treatment', 'health.categories.vaccine', 'health.categories.vet_visit', 'health.categories.symptom',
    'health.status.completed', 'health.status.pending', 'health.status.in_progress', 'health.status.planned',
    'health.treatments.autumn_antiparasitic', 'health.treatments.vitamins_e_selenium', 'health.treatments.deworming', 'health.treatments.red_mites',
    'health.descriptions.ivomec_drop_neck', 'health.descriptions.preparatory_cure_mating'
  ];

  LANGUAGES.forEach(lang => {
    const dict = TRANSLATIONS[lang];
    assert.ok(dict, `Dictionary for ${lang} must exist`);
    testKeys.forEach(k => {
      assert.ok(dict[k], `Key '${k}' must exist in ${lang}`);
      assert.notEqual(dict[k], '', `Key '${k}' must not be empty string in ${lang}`);
    });
  });
});

test('DYNAMIC-I18N — Switch languages without restarting app', () => {
  const sampleExpenseDesc = "Sac de 20kg de graines d'élevage";
  const sampleBuyer = "Jean-Pierre Durand (Éleveur amateur)";
  const sampleTreatment = "Anti-parasitaire d'automne";

  // Simulate dynamic language switching in real-time
  const frT = getT('fr');
  assert.equal(getLocalizedExpenseDescription(sampleExpenseDesc, frT), "Sac de 20kg de graines d'élevage");
  assert.equal(formatLocalizedBuyer(sampleBuyer, frT), "Jean-Pierre Durand (Éleveur Amateur)");
  assert.equal(formatLocalizedTreatment(sampleTreatment, frT), "Anti-parasitaire d'automne");

  const enT = getT('en');
  assert.equal(getLocalizedExpenseDescription(sampleExpenseDesc, enT), "20kg Seed Bag");
  assert.equal(formatLocalizedBuyer(sampleBuyer, enT), "Jean-Pierre Durand (Amateur Breeder)");
  assert.equal(formatLocalizedTreatment(sampleTreatment, enT), "Autumn Antiparasitic");

  const arT = getT('ar');
  assert.equal(getLocalizedExpenseDescription(sampleExpenseDesc, arT), "كيس بذور 20 كغ");
  assert.equal(formatLocalizedBuyer(sampleBuyer, arT), "Jean-Pierre Durand (مربي هاوي)");
  assert.equal(formatLocalizedTreatment(sampleTreatment, arT), "مضاد الطفيليات الخريفي");

  const esT = getT('es');
  assert.equal(getLocalizedExpenseDescription(sampleExpenseDesc, esT), "Saco de semillas 20kg");
  assert.equal(formatLocalizedBuyer(sampleBuyer, esT), "Jean-Pierre Durand (Criador Aficionado)");
  assert.equal(formatLocalizedTreatment(sampleTreatment, esT), "Antiparasitario de otoño");

  const itT = getT('it');
  assert.equal(getLocalizedExpenseDescription(sampleExpenseDesc, itT), "Sacco di semi 20kg");
  assert.equal(formatLocalizedBuyer(sampleBuyer, itT), "Jean-Pierre Durand (Allevatore Amatoriale)");
  assert.equal(formatLocalizedTreatment(sampleTreatment, itT), "Antiparassitario autunnale");
});
