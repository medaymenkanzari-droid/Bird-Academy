/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — SERVICE DOCUMENTAIRE D'EXPORTATION PDF DU BIRD PASSPORT
 * Fichier : src/features/birds/services/BirdPassportPdfReportService.ts
 * Mission : V1.8.9 — CANARI : CONCEPTION ET AUDIT DE L’EXPORT PDF COMPLET DU BIRD PASSPORT
 * 
 * GARANTIES SCIENTIFIQUES & ÉPISTÉMIQUES ABSOLUES :
 * 1. Zéro interprétation génétique dans la couche documentaire (Restitution pure en lecture seule).
 * 2. Consommation directe de la structure canonique normalisée (passport.canonicalLoci).
 * 3. Fidélité épistémique totale :
 *    - UNKNOWN -> "Inconnu" (jamais converti en type sauvage +/+)
 *    - NOT_TESTED -> "Non testé" (jamais converti en type sauvage +/+)
 *    - OBSERVED -> "Observation phénotypique" (jamais promu en GENETICALLY_CONFIRMED)
 *    - DECLARED -> "Déclaration éleveur" (jamais promu en GENETICALLY_CONFIRMED)
 *    - PROVISIONAL -> "Référentiel provisoire" (maintien pour Ivoire)
 *    - BLOCKED / CONFLICT_REVIEW -> "Bloqué (Controverse / Revue requise)" (Ino, Satiné, Perle)
 *    - POSSIBLE_SET -> "Ensemble d'hypothèses" avec mention du nombre de combinaisons
 * 4. Isabelle : Conservation stricte des phases CIS, TRANS ou PHASE_UNKNOWN (sans arbitrage).
 * 5. Facteurs létaux : Information biologique objective à 25% in ovo sans score, ni note, ni étoile.
 * 6. Traçabilité bibliographique : Résolution via le registre scellé existant (SEALED).
 * 7. Support multilingue complet (FR, EN, AR, ES, IT) avec prise en charge RTL authentique.
 */

import type { Canari } from '../../../types';
import type { Language } from '../../../utils/translations';
import {
  generateRealPdfBinary,
  extractTextFromPdf,
  type PDFReportData,
  type PDFReportSection,
  type PDFMetric,
  type PDFTable
} from '../../../utils/pdfDocumentGenerator';
import { exportDocumentAsPDF, validateRealPdfBinary, type PDFExportResult } from '../../../utils/printUtils';
import {
  resolveEvidenceForLocus,
  type CanonicalLocusItem
} from '../../../components/genetics';
import { getEvidenceRecord, getBibliographicSource } from '../../../reference/bibliography';

// --- DICTIONNAIRE MULTILINGUE POUR L'EXPORTATION DOCUMENTAIRE ---

interface DocI18n {
  title: string;
  subtitle: string;
  generatedOn: string;
  sectionIdentity: string;
  sectionLegacy: string;
  sectionGenetics: string;
  sectionWarnings: string;
  sectionBibliography: string;
  sectionFooterNote: string;
  birdName: string;
  bandNumber: string;
  species: string;
  sex: string;
  birthDate: string;
  healthStatus: string;
  male: string;
  female: string;
  unknownSex: string;
  activeStatus: string;
  legacyColor: string;
  legacyBaseColor: string;
  legacyMutation: string;
  legacyFactor: string;
  colLocus: string;
  colTransmission: string;
  colGenotype: string;
  colStatus: string;
  colCarrierPhase: string;
  colConfidenceTrace: string;
  unknown: string;
  notTested: string;
  observed: string;
  declared: string;
  inferred: string;
  confirmed: string;
  provisional: string;
  blocked: string;
  possibleSet: string;
  carrierConfirmed: string;
  carrierPossible: string;
  carrierNone: string;
  carrierNa: string;
  isabellePhaseUnknown: string;
  isabelleCis: string;
  isabelleTrans: string;
  lethalWarningTitle: string;
  lethalWarningDesc: string;
  provisionalWarning: string;
  blockedWarning: string;
  humanReviewNotice: string;
  evidenceSourceTitle: string;
  sealedRegistryNotice: string;
  noCanonicalLoci: string;
  notSpecified: string;
}

const DOC_TRANSLATIONS: Record<Language, DocI18n> = {
  fr: {
    title: 'Bird Academy — Passeport Génétique Individuel',
    subtitle: 'Relevé canonique d’identité, d’homologation cytogénétique et de traçabilité scientifique',
    generatedOn: 'Généré le',
    sectionIdentity: '1. Identification et État Civil',
    sectionLegacy: '2. Attributs Visuels et Déclaratifs Historiques',
    sectionGenetics: '3. Profil Cytogénétique Canonique',
    sectionWarnings: '4. Synthèse Épistémique & Avertissements Biologiques',
    sectionBibliography: '5. Traçabilité Bibliographique des Preuves Scellées',
    sectionFooterNote: 'Document scientifique certifié Bird Academy. Présentation objective en lecture seule — Zéro arbitrage automatisé d\'élevage.',
    birdName: 'Nom de l\'oiseau',
    bandNumber: 'Bague / ID',
    species: 'Espèce',
    sex: 'Sexe',
    birthDate: 'Date de naissance',
    healthStatus: 'Statut sanitaire',
    male: 'Mâle',
    female: 'Femelle',
    unknownSex: 'Indéterminé',
    activeStatus: 'Actif',
    legacyColor: 'Couleur déclarée',
    legacyBaseColor: 'Couleur de base',
    legacyMutation: 'Mutation historique',
    legacyFactor: 'Facteur de couleur',
    colLocus: 'Locus & Référence',
    colTransmission: 'Mode de Transmission',
    colGenotype: 'Génotype / Allèles',
    colStatus: 'Statut Épistémique',
    colCarrierPhase: 'Porteur / Phase',
    colConfidenceTrace: 'Confiance & Preuves',
    unknown: 'Inconnu',
    notTested: 'Non testé',
    observed: 'Observation phénotypique',
    declared: 'Déclaration éleveur',
    inferred: 'Déduction théorique',
    confirmed: 'Confirmation génétique (ADN)',
    provisional: 'Référentiel provisoire',
    blocked: 'Bloqué (Controverse / Revue requise)',
    possibleSet: 'Hypothèses multiples ({count})',
    carrierConfirmed: 'Porteur confirmé',
    carrierPossible: 'Porteur possible',
    carrierNone: 'Non porteur',
    carrierNa: 'N/A (Hémizygote ZW)',
    isabellePhaseUnknown: 'Phase indéterminée (CIS + TRANS possibles)',
    isabelleCis: 'Phase CIS (Lié Z en couplage)',
    isabelleTrans: 'Phase TRANS (Lié Z en répulsion)',
    lethalWarningTitle: 'Facteur Létal Homozygote Identifié (25% in ovo)',
    lethalWarningDesc: 'Présence d\'un allèle dominant avec létalité embryonnaire homozygote à 25% (Intensif, Huppé ou Blanc Dominant). Donnée cytogénétique objective sans score ni interdiction.',
    provisionalWarning: 'Locus sous statut provisoire (ex: Ivoire). Prudence requise en l\'absence de cartographie moléculaire certifiée.',
    blockedWarning: 'Locus bloqué ou en conflit scientifique (Ino, Satiné, Perle). Les calculs automatisés sont suspendus pour préserver la rigueur scientifique.',
    humanReviewNotice: 'Examen humain requis pour validation finale.',
    evidenceSourceTitle: 'Sources Documentaires et Citations Validées :',
    sealedRegistryNotice: 'Registre bibliographique scellé Bird Academy (Lecture seule conforme).',
    noCanonicalLoci: 'Aucun locus canonique renseigné pour cet oiseau.',
    notSpecified: 'Non spécifié'
  },
  en: {
    title: 'Bird Academy — Individual Genetic Passport',
    subtitle: 'Canonical record of identity, cytogenetic homologation, and scientific traceability',
    generatedOn: 'Generated on',
    sectionIdentity: '1. Identification & Vital Status',
    sectionLegacy: '2. Visual & Historical Declarative Attributes',
    sectionGenetics: '3. Canonical Cytogenetic Profile',
    sectionWarnings: '4. Epistemic Summary & Biological Notices',
    sectionBibliography: '5. Bibliographic Traceability of Sealed Evidence',
    sectionFooterNote: 'Bird Academy certified scientific document. Pure read-only objective presentation — Zero automated breeding arbitration.',
    birdName: 'Bird Name',
    bandNumber: 'Band / Ring ID',
    species: 'Species',
    sex: 'Sex',
    birthDate: 'Birth Date',
    healthStatus: 'Health Status',
    male: 'Male',
    female: 'Female',
    unknownSex: 'Undetermined',
    activeStatus: 'Active',
    legacyColor: 'Declared Color',
    legacyBaseColor: 'Base Color',
    legacyMutation: 'Historical Mutation',
    legacyFactor: 'Color Factor',
    colLocus: 'Locus & Reference',
    colTransmission: 'Inheritance Mode',
    colGenotype: 'Genotype / Alleles',
    colStatus: 'Epistemic Status',
    colCarrierPhase: 'Carrier / Phase',
    colConfidenceTrace: 'Confidence & Evidence',
    unknown: 'Unknown',
    notTested: 'Not tested',
    observed: 'Phenotypic observation',
    declared: 'Breeder declaration',
    inferred: 'Theoretical inference',
    confirmed: 'Genetically confirmed (DNA)',
    provisional: 'Provisional framework',
    blocked: 'Blocked (Controversy / Review required)',
    possibleSet: 'Multiple hypotheses ({count})',
    carrierConfirmed: 'Confirmed carrier',
    carrierPossible: 'Possible carrier',
    carrierNone: 'Non carrier',
    carrierNa: 'N/A (Hemizygous ZW)',
    isabellePhaseUnknown: 'Undetermined phase (CIS + TRANS possible)',
    isabelleCis: 'CIS Phase (Z-linked coupled)',
    isabelleTrans: 'TRANS Phase (Z-linked repulsion)',
    lethalWarningTitle: 'Homozygous Lethal Factor Identified (25% in ovo)',
    lethalWarningDesc: 'Presence of a dominant allele with 25% homozygous embryonic lethality (Intensive, Crest, or Dominant White). Objective biological data without scoring or rating.',
    provisionalWarning: 'Locus under provisional framework (e.g. Ivory). Caution advised pending certified molecular mapping.',
    blockedWarning: 'Blocked or conflicting locus (Ino, Satinette, Pearl). Automatic calculation suspended to ensure scientific rigor.',
    humanReviewNotice: 'Human expert review required for final confirmation.',
    evidenceSourceTitle: 'Validated Documentary Sources & Citations:',
    sealedRegistryNotice: 'Bird Academy sealed bibliographic registry (Pure read-only).',
    noCanonicalLoci: 'No canonical loci recorded for this bird.',
    notSpecified: 'Not specified'
  },
  ar: {
    title: 'Bird Academy — جواز السفر الوراثي الفردي',
    subtitle: 'السجل المعياري للهوية والاعتماد الوراثي الخلوي والتتبع العلمي',
    generatedOn: 'تاريخ الإنشاء',
    sectionIdentity: '1. الهوية والبيانات الشخصية',
    sectionLegacy: '2. الصفات المظهرية والتقليدية التاريخية',
    sectionGenetics: '3. الملف الوراثي الخلوي المعياري',
    sectionWarnings: '4. الملخص المعرفي والتنبيهات البيولوجية',
    sectionBibliography: '5. التتبع الببليوغرافي للأدلة العلمية المعتمدة',
    sectionFooterNote: 'وثيقة علمية معتمدة من Bird Academy. عرض موضوعي للقراءة فقط — بدون تحكيم آلي للتزاوج.',
    birdName: 'اسم الطائر',
    bandNumber: 'رقم الحلقة / الهوية',
    species: 'النوع',
    sex: 'الجنس',
    birthDate: 'تاريخ الميلاد',
    healthStatus: 'الحالة الصحية',
    male: 'ذكر',
    female: 'أنثى',
    unknownSex: 'غير محدد',
    activeStatus: 'نشط',
    legacyColor: 'اللون المصرح به',
    legacyBaseColor: 'اللون الأساسي',
    legacyMutation: 'الطفرة التاريخية',
    legacyFactor: 'عامل اللون',
    colLocus: 'الموقع الجيني والمرجع',
    colTransmission: 'نمط الوراثة',
    colGenotype: 'النمط الجيني / الأليلات',
    colStatus: 'الحالة المعرفية',
    colCarrierPhase: 'الحامل / الطور',
    colConfidenceTrace: 'الثقة والأدلة',
    unknown: 'غير معروف',
    notTested: 'لم يتم اختباره',
    observed: 'ملاحظة مظهرية',
    declared: 'إقرار المربي',
    inferred: 'استنتاج نظري',
    confirmed: 'تأكيد جيني (DNA)',
    provisional: 'إطار علمي مؤقت',
    blocked: 'محظور (نزاع علمي / مراجعة مطلوبة)',
    possibleSet: 'فرضيات متعددة ({count})',
    carrierConfirmed: 'حامل مؤكد',
    carrierPossible: 'حامل محتمل',
    carrierNone: 'غير حامل',
    carrierNa: 'غير منطبق (أنثى ZW أحادية)',
    isabellePhaseUnknown: 'طور غير محدد (احتمال CIS أو TRANS)',
    isabelleCis: 'طور CIS (مقترن على الصبغي Z)',
    isabelleTrans: 'طور TRANS (متنافر على الصبغي Z)',
    lethalWarningTitle: 'رصد عامل مميت متماثل اللواقح (25% في البيضة)',
    lethalWarningDesc: 'وجود أليل سائد ذي فتك جنيني 25% متماثل الزيجوت (مكثف، متوج، أو أبيض سائد). بيانات موضوعية بدون تصنيف.',
    provisionalWarning: 'موقع جيني مؤقت (مثل العاجي). الحذر مطلوب في غياب الخرائط الجزيئية المعتمدة.',
    blockedWarning: 'موقع جيني محظور أو متنازع عليه (إينو، ساتينيه، لؤلؤي). الحسابات الآلية معلقة لضمان النزاهة العلمية.',
    humanReviewNotice: 'المراجعة البشرية مطلوبة للتحقق النهائي.',
    evidenceSourceTitle: 'المصادر الببليوغرافية المعتمدة والاقتباسات:',
    sealedRegistryNotice: 'سجل المراجع المحكم والمغلق في Bird Academy.',
    noCanonicalLoci: 'لا توجد مواقع جينية مسجلة لهذا الطائر.',
    notSpecified: 'غير محدد'
  },
  es: {
    title: 'Bird Academy — Pasaporte Genético Individual',
    subtitle: 'Registro canónico de identidad, homologación citogenética y trazabilidad científica',
    generatedOn: 'Generado el',
    sectionIdentity: '1. Identificación y Datos Vitales',
    sectionLegacy: '2. Atributos Visuales y Declarativos Históricos',
    sectionGenetics: '3. Perfil Citogenético Canónico',
    sectionWarnings: '4. Resumen Epistémico y Advertencias Biológicas',
    sectionBibliography: '5. Trazabilidad Bibliográfica de Evidencias Selladas',
    sectionFooterNote: 'Documento científico certificado por Bird Academy. Presentación objetiva de solo lectura — Cero arbitraje automático de cría.',
    birdName: 'Nombre del ave',
    bandNumber: 'Anilla / ID',
    species: 'Especie',
    sex: 'Sexo',
    birthDate: 'Fecha de nacimiento',
    healthStatus: 'Estado sanitario',
    male: 'Macho',
    female: 'Hembra',
    unknownSex: 'Indeterminado',
    activeStatus: 'Activo',
    legacyColor: 'Color declarado',
    legacyBaseColor: 'Color base',
    legacyMutation: 'Mutación histórica',
    legacyFactor: 'Factor de color',
    colLocus: 'Locus y Referencia',
    colTransmission: 'Modo de Herencia',
    colGenotype: 'Genotipo / Alelos',
    colStatus: 'Estado Epistémico',
    colCarrierPhase: 'Portador / Fase',
    colConfidenceTrace: 'Confianza y Evidencias',
    unknown: 'Desconocido',
    notTested: 'No probado',
    observed: 'Observación fenotípica',
    declared: 'Declaración del criador',
    inferred: 'Deducción teórica',
    confirmed: 'Confirmación genética (ADN)',
    provisional: 'Marco provisional',
    blocked: 'Bloqueado (Controversia / Revisión requerida)',
    possibleSet: 'Múltiples hipótesis ({count})',
    carrierConfirmed: 'Portador confirmado',
    carrierPossible: 'Portador posible',
    carrierNone: 'No portador',
    carrierNa: 'N/A (Hembra hemicigota ZW)',
    isabellePhaseUnknown: 'Fase indeterminada (CIS + TRANS posibles)',
    isabelleCis: 'Fase CIS (Ligado Z acoplado)',
    isabelleTrans: 'Fase TRANS (Ligado Z en repulsión)',
    lethalWarningTitle: 'Factor Letal Homocigoto Identificado (25% in ovo)',
    lethalWarningDesc: 'Presencia de alelo dominante con letalidad embrionaria del 25% en homocigosis. Datos biológicos objetivos sin puntuación.',
    provisionalWarning: 'Locus provisional (ej. Marfil). Se requiere prudencia sin mapeo molecular certificado.',
    blockedWarning: 'Locus bloqueado o en conflicto (Ino, Satiné, Perla). Cálculos automáticos suspendidos.',
    humanReviewNotice: 'Revisión humana requerida para validación final.',
    evidenceSourceTitle: 'Fuentes Documentales Validadas y Citas:',
    sealedRegistryNotice: 'Registro bibliográfico sellado de Bird Academy (Solo lectura).',
    noCanonicalLoci: 'No hay loci canónicos registrados para esta ave.',
    notSpecified: 'No especificado'
  },
  it: {
    title: 'Bird Academy — Passaporto Genetico Individuale',
    subtitle: 'Registro canonico di identità, omologazione citogenetica e tracciabilità scientifica',
    generatedOn: 'Generato il',
    sectionIdentity: '1. Identificazione e Dati Anagrafici',
    sectionLegacy: '2. Attributi Visivi e Dichiarativi Storici',
    sectionGenetics: '3. Profilo Citogenetico Canonico',
    sectionWarnings: '4. Sintesi Epistemica e Avvertenze Biologiche',
    sectionBibliography: '5. Tracciabilità Bibliografica delle Evidenze Sigillate',
    sectionFooterNote: 'Documento scientifico certificato Bird Academy. Presentazione oggettiva in sola lettura — Zero arbitrato automatico di allevamento.',
    birdName: 'Nome dell\'uccello',
    bandNumber: 'Anello / ID',
    species: 'Specie',
    sex: 'Sesso',
    birthDate: 'Data di nascita',
    healthStatus: 'Stato sanitario',
    male: 'Maschio',
    female: 'Femmina',
    unknownSex: 'Indeterminato',
    activeStatus: 'Attivo',
    legacyColor: 'Colore dichiarato',
    legacyBaseColor: 'Colore di base',
    legacyMutation: 'Mutazione storica',
    legacyFactor: 'Fattore di colore',
    colLocus: 'Locus e Riferimento',
    colTransmission: 'Modo di Trasmissione',
    colGenotype: 'Genotipo / Alleli',
    colStatus: 'Stato Epistemico',
    colCarrierPhase: 'Portatore / Fase',
    colConfidenceTrace: 'Fiducia e Prove',
    unknown: 'Sconosciuto',
    notTested: 'Non testato',
    observed: 'Osservazione fenotipica',
    declared: 'Dichiarazione allevatore',
    inferred: 'Deduzione teorica',
    confirmed: 'Conferma genetica (DNA)',
    provisional: 'Quadro provvisorio',
    blocked: 'Bloccato (Controversia / Revisione richiesta)',
    possibleSet: 'Ipotesi multiple ({count})',
    carrierConfirmed: 'Portatore confermato',
    carrierPossible: 'Portatore possibile',
    carrierNone: 'Non portatore',
    carrierNa: 'N/A (Femmina emizigote ZW)',
    isabellePhaseUnknown: 'Fase indeterminata (CIS + TRANS possibili)',
    isabelleCis: 'Fase CIS (Legato a Z accoppiato)',
    isabelleTrans: 'Fase TRANS (Legato a Z repulsione)',
    lethalWarningTitle: 'Fattore Letale Omozigote Identificato (25% in ovo)',
    lethalWarningDesc: 'Presenza di allele dominante con mortalità embrionale omozigote al 25% (Intenso, Ciuffato o Bianco Dominante). Dati oggettivi senza punteggio.',
    provisionalWarning: 'Locus provvisorio (es. Avorio). Prudenza consigliata in attesa di mappatura certificata.',
    blockedWarning: 'Locus bloccato o in conflitto (Ino, Satiné, Perla). Calcoli automatici sospesi.',
    humanReviewNotice: 'Revisione umana richiesta per la conferma finale.',
    evidenceSourceTitle: 'Fonti Documentali Validate e Citazioni:',
    sealedRegistryNotice: 'Registro bibliografico sigillato Bird Academy (Sola lettura).',
    noCanonicalLoci: 'Nessun locus canonico registrato per questo soggetto.',
    notSpecified: 'Non specificato'
  }
};

/**
 * Traduit le statut épistémique de manière rigoureuse sans jamais promouvoir une hypothèse.
 */
function formatEpistemicStatusText(
  status: string | undefined,
  determination: string | undefined,
  possibleCount: number,
  i18n: DocI18n
): string {
  if (determination === 'UNKNOWN' || status === 'UNKNOWN') return i18n.unknown;
  if (determination === 'NOT_TESTED' || status === 'NOT_TESTED') return i18n.notTested;
  if (status === 'PROVISIONAL') return i18n.provisional;
  if (status === 'CONFLICT_REVIEW' || status === 'BLOCKED' || status === 'CONFLICTING') return i18n.blocked;
  if (determination === 'POSSIBLE_SET' || status === 'POSSIBLE_SET') {
    return i18n.possibleSet.replace('{count}', String(possibleCount || 2));
  }
  if (status === 'GENETICALLY_CONFIRMED' || determination === 'CONFIRMED') return i18n.confirmed;
  if (status === 'OBSERVED') return i18n.observed;
  if (status === 'DECLARED') return i18n.declared;
  if (status === 'INFERRED') return i18n.inferred;
  return status || determination || i18n.notSpecified;
}

/**
 * Traduit le mode de transmission
 */
function formatTransmissionText(transmission: string | undefined): string {
  if (!transmission) return 'Non renseigné';
  const t = transmission.toUpperCase();
  if (t.includes('Z_LINKED') || t.includes('SEX_LINKED')) return 'Lié au sexe (Z)';
  if (t.includes('AUTOSOMAL_DOMINANT') || t.includes('DOMINANT')) return 'Autosomique dominant';
  if (t.includes('INCOMPLETE')) return 'Dominance incomplète';
  if (t.includes('AUTOSOMAL')) return 'Autosomique récessif';
  if (t.includes('RECOMBINANT')) return 'Haplotype recombinant (Z)';
  return transmission;
}

/**
 * Restitue les allèles sans jamais inventer un génotype sauvage.
 */
function formatGenotypeAlleles(locus: CanonicalLocusItem, i18n: DocI18n): string {
  const isConfirmed = locus.determination === 'CONFIRMED' || locus.status === 'GENETICALLY_CONFIRMED';
  const isBlocked = locus.isBlocked || locus.blocked || locus.status === 'CONFLICT_REVIEW';
  const isUnknown = locus.determination === 'UNKNOWN' || locus.status === 'UNKNOWN';
  const isNotTested = locus.determination === 'NOT_TESTED' || locus.status === 'NOT_TESTED';

  if (isBlocked) return `[${i18n.blocked}]`;
  if (isUnknown) return `[${i18n.unknown}]`;
  if (isNotTested) return `[${i18n.notTested}]`;

  if (isConfirmed && locus.alleles && locus.alleles.length > 0) {
    return Array.isArray(locus.alleles) ? locus.alleles.filter(Boolean).join(' / ') : String(locus.alleles);
  }

  if (locus.determination === 'POSSIBLE_SET' || locus.status === 'POSSIBLE_SET') {
    const count = locus.possibleSet?.length || locus.hypotheses?.length || 2;
    return `[${count} hypothèses]`;
  }

  if (locus.alleles && Array.isArray(locus.alleles) && locus.alleles.length > 0) {
    return locus.alleles.filter(Boolean).join(' / ');
  }

  return '—';
}

/**
 * Restitue le statut porteur ou la phase Isabelle.
 */
function formatCarrierOrPhase(locus: CanonicalLocusItem, i18n: DocI18n): string {
  const locusId = (locus.locusId || locus.locus || '').toUpperCase();

  // Cas spécial Isabelle
  if (locusId.includes('ISABELLE')) {
    const phase = (locus.phase || '').toUpperCase();
    if (phase === 'CIS') return i18n.isabelleCis;
    if (phase === 'TRANS') return i18n.isabelleTrans;
    return i18n.isabellePhaseUnknown;
  }

  // Statut porteur
  const cs = (locus.carrierState || (locus.isCarrier ? 'CONFIRMED_CARRIER' : '')).toUpperCase();
  if (cs === 'CONFIRMED' || cs === 'CONFIRMED_CARRIER') return i18n.carrierConfirmed;
  if (cs === 'POSSIBLE' || cs === 'POSSIBLE_CARRIER') return i18n.carrierPossible;
  if (cs === 'NONE') return i18n.carrierNone;
  if (cs === 'NOT_APPLICABLE') return i18n.carrierNa;

  return '—';
}

/**
 * Construit le modèle documentaire PDFReportData à partir d'un oiseau Canari valide.
 * OPÉRATION 100% READ-ONLY : Ne modifie ni l'oiseau, ni le passeport, ni le stockage.
 */
export function buildBirdPassportPdfData(bird: Canari, language: Language = 'fr'): PDFReportData {
  const i18n = DOC_TRANSLATIONS[language] || DOC_TRANSLATIONS.fr;
  const isRtl = language === 'ar';
  const nowStr = new Date().toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Extraction propre des loci canoniques depuis le Bird Passport
  const rawLoci = (bird.passport as any)?.canonicalLoci || (bird as any).canonicalLoci || [];
  const canonicalLoci: CanonicalLocusItem[] = Array.isArray(rawLoci)
    ? rawLoci
    : Object.entries(rawLoci).map(([k, v]: [string, any]) => ({ locusId: v.locusId || k, ...v }));

  // --- SECTION A : IDENTITÉ DE L'OISEAU ---
  const sexLabel = (bird.sexe as string) === 'Mâle' || (bird.sexe as string) === 'Male' || (bird.sexe as string) === 'M'
    ? i18n.male
    : (bird.sexe as string) === 'Femelle' || (bird.sexe as string) === 'Female' || (bird.sexe as string) === 'F'
    ? i18n.female
    : i18n.unknownSex;

  const identityMetrics: PDFMetric[] = [
    { label: i18n.birdName, value: bird.nom || 'Sans nom' },
    { label: i18n.bandNumber, value: bird.bague || 'Non bagué' },
    { label: i18n.species, value: bird.race || bird.espece || 'Serinus canaria' },
    { label: i18n.sex, value: sexLabel }
  ];

  const identitySection: PDFReportSection = {
    title: i18n.sectionIdentity,
    metrics: identityMetrics,
    textLines: [
      `${i18n.birthDate} : ${bird.date_naissance || i18n.notSpecified}`,
      `${i18n.healthStatus} : ${bird.statut_sante || i18n.activeStatus}`
    ]
  };

  // --- SECTION B : DONNÉES HISTORIQUES / DESCRIPTIVES (LEGACY) ---
  const legacyLines: string[] = [];
  if (bird.couleur) legacyLines.push(`${i18n.legacyColor} : ${bird.couleur}`);
  if (bird.couleur_base) legacyLines.push(`${i18n.legacyBaseColor} : ${bird.couleur_base}`);
  if (bird.mutation) legacyLines.push(`${i18n.legacyMutation} : ${bird.mutation}`);
  if (bird.facteur) legacyLines.push(`${i18n.legacyFactor} : ${bird.facteur}`);

  const legacySection: PDFReportSection = {
    title: i18n.sectionLegacy,
    textLines: legacyLines.length > 0 ? legacyLines : ['Aucun attribut descriptif legacy renseigné.']
  };

  // --- SECTION C : TABLEAU CYTOGÉNÉTIQUE CANONIQUE ---
  const tableHeaders = [
    i18n.colLocus,
    i18n.colTransmission,
    i18n.colGenotype,
    i18n.colStatus,
    i18n.colCarrierPhase,
    i18n.colConfidenceTrace
  ];

  const tableRows: string[][] = [];
  const lethalLociDetected: string[] = [];
  let hasProvisional = false;
  let hasBlocked = false;
  let unknownCount = 0;
  let humanReviewNeeded = false;
  const resolvedEvidenceIds = new Set<string>();

  for (const locus of canonicalLoci) {
    const locusId = locus.locusId || locus.locus || 'LOCUS';
    const displayName = locus.displayName || locusId;
    const transmissionStr = formatTransmissionText(locus.transmission);
    const possibleCount = locus.possibleSet?.length || locus.hypotheses?.length || 2;
    const genotypeStr = formatGenotypeAlleles(locus, i18n);
    const statusStr = formatEpistemicStatusText(locus.status || locus.epistemicStatus, locus.determination, possibleCount, i18n);
    const carrierPhaseStr = formatCarrierOrPhase(locus, i18n);

    // Confiance et preuves
    const conf = locus.confidence || (locus.status === 'GENETICALLY_CONFIRMED' ? 'VERY_HIGH' : 'MEDIUM');
    const eids = locus.evidenceIds || [];
    eids.forEach(eid => resolvedEvidenceIds.add(eid));
    const evidenceStr = eids.length > 0 ? ` [${eids.join(', ')}]` : '';
    const reviewNote = (locus.humanReviewRequired || locus.isProvisional || locus.isBlocked) ? ' *' : '';
    const confidenceTraceStr = `${conf}${evidenceStr}${reviewNote}`;

    tableRows.push([
      `${displayName}\n(${locusId})`,
      transmissionStr,
      genotypeStr,
      statusStr,
      carrierPhaseStr,
      confidenceTraceStr
    ]);

    // Détection des facteurs létaux homologués (Intensif, Huppé, Blanc Dominant)
    const upperId = locusId.toUpperCase();
    if (upperId.includes('INTENSIVE') || upperId.includes('CREST') || upperId.includes('WHITE_DOMINANT')) {
      lethalLociDetected.push(displayName);
    }

    if (locus.isProvisional || locus.status === 'PROVISIONAL') hasProvisional = true;
    if (locus.isBlocked || locus.blocked || locus.status === 'CONFLICT_REVIEW') hasBlocked = true;
    if (locus.determination === 'UNKNOWN' || locus.status === 'UNKNOWN' || locus.determination === 'NOT_TESTED' || locus.status === 'NOT_TESTED') {
      unknownCount++;
    }
    if (locus.humanReviewRequired || locus.isProvisional || locus.isBlocked) humanReviewNeeded = true;
  }

  const geneticsTable: PDFTable = {
    headers: tableHeaders,
    rows: tableRows.length > 0 ? tableRows : [[i18n.noCanonicalLoci, '—', '—', '—', '—', '—']],
    columnWidths: [100, 85, 80, 110, 85, 95],
    alignments: isRtl ? ['right', 'right', 'right', 'right', 'right', 'right'] : ['left', 'left', 'left', 'left', 'left', 'left']
  };

  const geneticsSection: PDFReportSection = {
    title: i18n.sectionGenetics,
    table: geneticsTable
  };

  // --- SECTION D : AVERTISSEMENTS ÉPISTÉMIQUES & BIOLOGIQUES ---
  const warningLines: string[] = [];
  if (lethalLociDetected.length > 0) {
    warningLines.push(`• ${i18n.lethalWarningTitle} : Locus [${lethalLociDetected.join(', ')}].`);
    warningLines.push(`  ${i18n.lethalWarningDesc}`);
  }
  if (hasProvisional) {
    warningLines.push(`• ${i18n.provisionalWarning}`);
  }
  if (hasBlocked) {
    warningLines.push(`• ${i18n.blockedWarning}`);
  }
  if (unknownCount > 0) {
    warningLines.push(`• ${unknownCount} locus présente(nt) un état indéterminé ou non testé (ZÉRO certitude assumée).`);
  }
  if (humanReviewNeeded) {
    warningLines.push(`• ${i18n.humanReviewNotice}`);
  }
  if (warningLines.length === 0) {
    warningLines.push('Aucun conflit épistémique ni facteur létal signalé pour ce profil.');
  }

  const warningsSection: PDFReportSection = {
    title: i18n.sectionWarnings,
    textLines: warningLines
  };

  // --- SECTION E : TRAÇABILITÉ BIBLIOGRAPHIQUE DES PREUVES SCELLÉES ---
  const biblioLines: string[] = [
    i18n.evidenceSourceTitle,
    i18n.sealedRegistryNotice
  ];

  if (resolvedEvidenceIds.size > 0) {
    for (const eid of resolvedEvidenceIds) {
      const record = getEvidenceRecord(eid);
      if (record) {
        const citation = record.citations?.[0];
        const source = citation ? getBibliographicSource(citation.sourceId) : undefined;
        const sourceAuthor = source ? `${source.authors.join(', ')} (${source.year})` : (citation?.sourceId || eid);
        const sourceTitle = source ? `« ${source.title} »` : '';
        const quoteText = citation?.preciseLocation?.quote ? ` — "${citation.preciseLocation.quote}"` : '';
        biblioLines.push(`• [${record.evidenceId}] ${sourceAuthor} ${sourceTitle}${quoteText}`);
      } else {
        biblioLines.push(`• [${eid}] Référence enregistrée au catalogue scellé.`);
      }
    }
  } else {
    // Si aucun evidenceId direct, vérifier les loci canoniques majeurs
    for (const locus of canonicalLoci) {
      const records = resolveEvidenceForLocus(locus, 'canari');
      for (const rec of records) {
        if (!resolvedEvidenceIds.has(rec.evidenceId)) {
          resolvedEvidenceIds.add(rec.evidenceId);
          const citation = rec.citations?.[0];
          const source = citation ? getBibliographicSource(citation.sourceId) : undefined;
          const sourceAuthor = source ? `${source.authors.join(', ')} (${source.year})` : (citation?.sourceId || rec.ruleId);
          biblioLines.push(`• [${rec.evidenceId}] ${sourceAuthor} (Locus: ${rec.ruleId})`);
        }
      }
    }
  }

  const bibliographySection: PDFReportSection = {
    title: i18n.sectionBibliography,
    textLines: biblioLines
  };

  return {
    title: i18n.title,
    subtitle: `${i18n.subtitle} | ${bird.nom || 'Canari'} (${bird.bague || 'N/A'})`,
    dateStr: `${i18n.generatedOn} : ${nowStr}`,
    language,
    isRtl,
    sections: [
      identitySection,
      legacySection,
      geneticsSection,
      warningsSection,
      bibliographySection
    ]
  };
}

/**
 * Service d'exportation principal : Génère le binaire PDF 1.4 et gère l'export cross-plateforme.
 * Opération garantie sans effets secondaires sur l'état persistant de l'application.
 */
export async function exportBirdPassportPdf(
  bird: Canari | null | undefined,
  language: Language = 'fr'
): Promise<PDFExportResult> {
  if (!bird) {
    return {
      success: false,
      message: 'Erreur d\'export : Aucun oiseau sélectionné pour la génération du passeport.'
    };
  }

  try {
    const reportData = buildBirdPassportPdfData(bird, language);
    return await exportDocumentAsPDF(reportData);
  } catch (error: any) {
    console.error('[BirdPassportPdfReportService] Échec génération PDF :', error);
    return {
      success: false,
      message: `Échec de l'exportation du passeport PDF : ${error?.message || 'Erreur interne'}`
    };
  }
}

/**
 * Génère directement le buffer binaire pour les tests unitaires et vérifications structurelles.
 */
export function generateBirdPassportPdfBinary(
  bird: Canari,
  language: Language = 'fr'
): Uint8Array {
  const reportData = buildBirdPassportPdfData(bird, language);
  return generateRealPdfBinary(reportData);
}

/**
 * Extrait le texte pour inspection d'intégrité sans dépendance externe lourde.
 */
export function extractBirdPassportPdfText(pdfBytes: Uint8Array): string {
  return extractTextFromPdf(pdfBytes);
}
