/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE - MULTILINGUAL PDF REPORTS TRANSLATIONS (FR, EN, AR, ES, IT)
 * Architectural i18n dictionary for all binary PDF reports:
 * Expenses, Sales, Calendar, Statistics, Genealogy, Analytics, and Transfer Certificate.
 */

import type { Language } from './translations';

export const PDF_REPORTS_TRANSLATIONS: Record<Language, Record<string, string>> = {
  fr: {
    // Expenses
    "expenses.totalRowLabel": "TOTAL",
    "expenses.opCountShort": "opérations",

    // Sales
    "sales.totalRowLabel": "TOTAL",
    "sales.opCountShort": "opérations",

    // Calendar
    "calendar.pdfTitle": "Calendrier d'Élevage",
    "calendar.secSummary": "Résumé du Mois",
    "calendar.totalEvents": "Total Événements",
    "calendar.period": "Période",
    "calendar.secEvents": "Liste des Événements",
    "calendar.headerDate": "Date",
    "calendar.headerCategory": "Catégorie",
    "calendar.headerEvent": "Événement",

    // Statistics
    "statistics.secFinancial": "Synthèse Financière",
    "statistics.secReproduction": "Taux de Reproduction & Survie",

    // Genealogy
    "genealogy.pdfTitle": "Arbre Généalogique",
    "genealogy.secIdentity": "Fiche d'Identité Canari",
    "genealogy.secAscendance": "Généalogie / Ascendance",
    "genealogy.labelName": "Nom",
    "genealogy.labelRing": "Bague",
    "genealogy.labelSex": "Sexe",
    "genealogy.labelYear": "Année",
    "genealogy.labelFather": "Père",
    "genealogy.labelMother": "Mère",
    "genealogy.unknownMale": "Inconnu",
    "genealogy.unknownFemale": "Inconnue",

    // Transfer Certificate
    "transfer.certTitle": "Attestation de Cession",
    "transfer.certSubtitle": "Certificat officiel de cession d'oiseau",
    "transfer.secDetails": "Détails de la cession",
    "transfer.certNumber": "Numéro Certificat",
    "transfer.birdRing": "Bague de l'Oiseau",
    "transfer.salePrice": "Prix de Vente",
    "transfer.buyer": "Acquéreur",
    "transfer.notSpecified": "Non renseigné",
    "transfer.field": "Champ",
    "transfer.detail": "Détail de l'acte de cession",
    "transfer.deedDate": "Date de l'acte",
    "transfer.speciesBreed": "Espèce & Variété",
    "transfer.sex": "Sexe",
    "transfer.mutation": "Mutation / Couleur",
    "transfer.father": "Père ♂",
    "transfer.mother": "Mère ♀",
    "transfer.coi": "Consanguinité COI",
    "transfer.observations": "Observations",
    "transfer.obsDefault": "Oiseau sevré et bagué fermé conforme.",
    "transfer.classic": "Classique",
    "transfer.undetermined": "Indéterminé",
    "transfer.domesticCanary": "Canari domestique"
  },
  en: {
    // Expenses
    "expenses.totalRowLabel": "TOTAL",
    "expenses.opCountShort": "operations",

    // Sales
    "sales.totalRowLabel": "TOTAL",
    "sales.opCountShort": "operations",

    // Calendar
    "calendar.pdfTitle": "Breeding Calendar",
    "calendar.secSummary": "Month Summary",
    "calendar.totalEvents": "Total Events",
    "calendar.period": "Period",
    "calendar.secEvents": "Events List",
    "calendar.headerDate": "Date",
    "calendar.headerCategory": "Category",
    "calendar.headerEvent": "Event",

    // Statistics
    "statistics.secFinancial": "Financial Summary",
    "statistics.secReproduction": "Reproduction & Survival Rates",

    // Genealogy
    "genealogy.pdfTitle": "Pedigree Tree",
    "genealogy.secIdentity": "Canary Identity Sheet",
    "genealogy.secAscendance": "Genealogy / Pedigree",
    "genealogy.labelName": "Name",
    "genealogy.labelRing": "Ring",
    "genealogy.labelSex": "Sex",
    "genealogy.labelYear": "Year",
    "genealogy.labelFather": "Father",
    "genealogy.labelMother": "Mother",
    "genealogy.unknownMale": "Unknown",
    "genealogy.unknownFemale": "Unknown",

    // Transfer Certificate
    "transfer.certTitle": "Transfer Certificate",
    "transfer.certSubtitle": "Official Bird Transfer Certificate",
    "transfer.secDetails": "Transfer Details",
    "transfer.certNumber": "Certificate Number",
    "transfer.birdRing": "Bird Ring Number",
    "transfer.salePrice": "Sale Price",
    "transfer.buyer": "Buyer",
    "transfer.notSpecified": "Not specified",
    "transfer.field": "Field",
    "transfer.detail": "Transfer Deed Detail",
    "transfer.deedDate": "Deed Date",
    "transfer.speciesBreed": "Species & Breed",
    "transfer.sex": "Sex",
    "transfer.mutation": "Mutation / Color",
    "transfer.father": "Father ♂",
    "transfer.mother": "Mother ♀",
    "transfer.coi": "Inbreeding COI",
    "transfer.observations": "Observations",
    "transfer.obsDefault": "Weaned bird with compliant closed ring.",
    "transfer.classic": "Classic",
    "transfer.undetermined": "Undetermined",
    "transfer.domesticCanary": "Domestic Canary"
  },
  ar: {
    // Expenses
    "expenses.totalRowLabel": "المجموع",
    "expenses.opCountShort": "عملية",

    // Sales
    "sales.totalRowLabel": "المجموع",
    "sales.opCountShort": "عملية",

    // Calendar
    "calendar.pdfTitle": "تقويم التربية",
    "calendar.secSummary": "ملخص الشهر",
    "calendar.totalEvents": "إجمالي الأحداث",
    "calendar.period": "الفترة",
    "calendar.secEvents": "قائمة الأحداث",
    "calendar.headerDate": "التاريخ",
    "calendar.headerCategory": "الفئة",
    "calendar.headerEvent": "الحدث",

    // Statistics
    "statistics.secFinancial": "الملخص المالي",
    "statistics.secReproduction": "معدلات التكاثر والبقاء",

    // Genealogy
    "genealogy.pdfTitle": "شجرة النسب",
    "genealogy.secIdentity": "بطاقة هوية الكناري",
    "genealogy.secAscendance": "النسب / السلالة",
    "genealogy.labelName": "الاسم",
    "genealogy.labelRing": "الحلقة",
    "genealogy.labelSex": "الجنس",
    "genealogy.labelYear": "السنة",
    "genealogy.labelFather": "الأب",
    "genealogy.labelMother": "الأم",
    "genealogy.unknownMale": "غير معروف",
    "genealogy.unknownFemale": "غير معروفة",

    // Transfer Certificate
    "transfer.certTitle": "شهادة التنازل",
    "transfer.certSubtitle": "الشهادة الرسمية للتنازل عن الطيور",
    "transfer.secDetails": "تفاصيل التنازل",
    "transfer.certNumber": "رقم الشهادة",
    "transfer.birdRing": "حلقة الطائر",
    "transfer.salePrice": "سعر البيع",
    "transfer.buyer": "المشتري",
    "transfer.notSpecified": "غير محدد",
    "transfer.field": "الحقل",
    "transfer.detail": "تفاصيل عقد التنازل",
    "transfer.deedDate": "تاريخ العقد",
    "transfer.speciesBreed": "النوع والسلالة",
    "transfer.sex": "الجنس",
    "transfer.mutation": "الطفرة / اللون",
    "transfer.father": "الأب ♂",
    "transfer.mother": "الأم ♀",
    "transfer.coi": "معامل زواج الأقارب COI",
    "transfer.observations": "ملاحظات",
    "transfer.obsDefault": "طائر مفطوم ومحلق بحلقة مغلقة مطابقة.",
    "transfer.classic": "كلاسيكي",
    "transfer.undetermined": "غير محدد",
    "transfer.domesticCanary": "كناري منزلي"
  },
  es: {
    // Expenses
    "expenses.totalRowLabel": "TOTAL",
    "expenses.opCountShort": "operaciones",

    // Sales
    "sales.totalRowLabel": "TOTAL",
    "sales.opCountShort": "operaciones",

    // Calendar
    "calendar.pdfTitle": "Calendario de Cría",
    "calendar.secSummary": "Resumen del Mes",
    "calendar.totalEvents": "Total Eventos",
    "calendar.period": "Período",
    "calendar.secEvents": "Lista de Eventos",
    "calendar.headerDate": "Fecha",
    "calendar.headerCategory": "Categoría",
    "calendar.headerEvent": "Evento",

    // Statistics
    "statistics.secFinancial": "Resumen Financiero",
    "statistics.secReproduction": "Tasas de Reproducción y Supervivencia",

    // Genealogy
    "genealogy.pdfTitle": "Árbol Genealógico",
    "genealogy.secIdentity": "Ficha de Identidad del Canario",
    "genealogy.secAscendance": "Genealogía / Ascendencia",
    "genealogy.labelName": "Nombre",
    "genealogy.labelRing": "Anilla",
    "genealogy.labelSex": "Sexo",
    "genealogy.labelYear": "Año",
    "genealogy.labelFather": "Padre",
    "genealogy.labelMother": "Madre",
    "genealogy.unknownMale": "Desconocido",
    "genealogy.unknownFemale": "Desconocida",

    // Transfer Certificate
    "transfer.certTitle": "Certificado de Cesión",
    "transfer.certSubtitle": "Certificado oficial de cesión de aves",
    "transfer.secDetails": "Detalles de la cesión",
    "transfer.certNumber": "Número de Certificado",
    "transfer.birdRing": "Anilla del Ave",
    "transfer.salePrice": "Precio de Venta",
    "transfer.buyer": "Comprador",
    "transfer.notSpecified": "No especificado",
    "transfer.field": "Campo",
    "transfer.detail": "Detalle del acta de cesión",
    "transfer.deedDate": "Fecha del acta",
    "transfer.speciesBreed": "Especie y Variedad",
    "transfer.sex": "Sexo",
    "transfer.mutation": "Mutación / Color",
    "transfer.father": "Padre ♂",
    "transfer.mother": "Madre ♀",
    "transfer.coi": "Consanguinidad COI",
    "transfer.observations": "Observaciones",
    "transfer.obsDefault": "Ave destetada y anillada cerrada conforme.",
    "transfer.classic": "Clásico",
    "transfer.undetermined": "Indeterminado",
    "transfer.domesticCanary": "Canario doméstico"
  },
  it: {
    // Expenses
    "expenses.totalRowLabel": "TOTAL",
    "expenses.opCountShort": "operazioni",

    // Sales
    "sales.totalRowLabel": "TOTAL",
    "sales.opCountShort": "operazioni",

    // Calendar
    "calendar.pdfTitle": "Calendario di Allevamento",
    "calendar.secSummary": "Riepilogo del Mese",
    "calendar.totalEvents": "Totale Eventi",
    "calendar.period": "Periodo",
    "calendar.secEvents": "Elenco Eventi",
    "calendar.headerDate": "Data",
    "calendar.headerCategory": "Categoria",
    "calendar.headerEvent": "Evento",

    // Statistics
    "statistics.secFinancial": "Sintesi Finanziaria",
    "statistics.secReproduction": "Tassi di Riproduzione e Sopravvivenza",

    // Genealogy
    "genealogy.pdfTitle": "Albero Genealogico",
    "genealogy.secIdentity": "Scheda Identificativa del Canarino",
    "genealogy.secAscendance": "Genealogia / Ascendenza",
    "genealogy.labelName": "Nome",
    "genealogy.labelRing": "Anello",
    "genealogy.labelSex": "Sesso",
    "genealogy.labelYear": "Anno",
    "genealogy.labelFather": "Padre",
    "genealogy.labelMother": "Madre",
    "genealogy.unknownMale": "Sconosciuto",
    "genealogy.unknownFemale": "Sconosciuta",

    // Transfer Certificate
    "transfer.certTitle": "Certificato di Cessione",
    "transfer.certSubtitle": "Certificato ufficiale di cessione di uccelli",
    "transfer.secDetails": "Dettagli della cessione",
    "transfer.certNumber": "Numero Certificato",
    "transfer.birdRing": "Anello dell'Uccello",
    "transfer.salePrice": "Prezzo di Vendita",
    "transfer.buyer": "Acquirente",
    "transfer.notSpecified": "Non specificato",
    "transfer.field": "Campo",
    "transfer.detail": "Dettaglio dell'atto di cessione",
    "transfer.deedDate": "Data dell'atto",
    "transfer.speciesBreed": "Specie e Varietà",
    "transfer.sex": "Sesso",
    "transfer.mutation": "Mutazione / Colore",
    "transfer.father": "Padre ♂",
    "transfer.mother": "Madre ♀",
    "transfer.coi": "Consanguinità COI",
    "transfer.observations": "Osservazioni",
    "transfer.obsDefault": "Uccello svezzato e anellato chiuso conforme.",
    "transfer.classic": "Classico",
    "transfer.undetermined": "Indeterminato",
    "transfer.domesticCanary": "Canarino domestico"
  }
};
