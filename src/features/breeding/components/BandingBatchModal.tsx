/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, Check, Sparkles, AlertCircle, RefreshCw, 
  Dna, Heart, ArrowRight, ShieldCheck, ChevronRight,
  Info, CheckCircle2, User, HelpCircle, Layers
} from 'lucide-react';
import { Canari, Couple, Jeune } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  AppModal, AppAvatar, SpeciesBadge, WrightConsanguinityGauge 
} from '../../../components/design-system';
import { GeneticsEngine } from '../../genetics/engines/GeneticsEngine';
import { calculateInbreedingCOI } from '../../../utils/genealogy';
import { OffspringPrediction } from '../../genetics/types';

export interface ChickBandingEntry {
  id: number;
  tempNumber: number;
  bague: string;
  nom: string;
  sexe: 'Mâle' | 'Femelle' | 'Indéterminé';
  mutation: string;
  couleur: string;
  vigor: 'Faible' | 'Normal' | 'Excellent';
  date_naissance: string;
  cage_id: number;
}

export interface BandingBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  reproductionId: number;
  sire: Canari | null;
  dam: Canari | null;
  allBirds: Canari[];
  chicks: Jeune[];
  cagesList: Array<{ id: number; nom: string }>;
  onCompleteBanding: (
    bandedBirds: Array<{
      jeuneId: number;
      bird: Omit<Canari, 'id'>;
    }>
  ) => void;
}

export function getRecommendedRingDiameter(species?: string, breed?: string): string {
  const cleanBreed = (breed || '').toLowerCase();
  const cleanSpecies = (species || '').toLowerCase();

  if (cleanSpecies.includes('chardonneret') || cleanSpecies.includes('gould') || cleanSpecies.includes('tarin')) {
    return '2.5 mm C.O.M.';
  }
  if (cleanBreed.includes('norwich') || cleanBreed.includes('yorkshire') || cleanBreed.includes('crest') || cleanBreed.includes('parisien') || cleanBreed.includes('lancashire')) {
    return '3.2 mm C.O.M.';
  }
  if (cleanBreed.includes('gloster') || cleanBreed.includes('border') || cleanBreed.includes('fife') || cleanBreed.includes('padouan')) {
    return '3.0 mm C.O.M.';
  }
  return '2.9 mm C.O.M.';
}

const BANDING_I18N = {
  fr: {
    modalMainTitle: "Baguage & Enregistrement au Cheptel",
    modalTitle: "Enregistrement de la Nichée (#{id})",
    chicksToBandBadge: "{count} oisillon(s) à baguer",
    modalSubtitle: "Attribuez les bagues officielles C.O.M. et intégrez les jeunes directement dans votre registre d'élevage.",
    diameterLabel: "Diamètre : ",
    generatorTitle: "Générateur de Série de Bagues Automatique",
    prefixLabel: "Préfixe / Fédé & Millésime",
    prefixPlaceholder: "Ex: FR-2026- ou TN-2026-",
    startNumLabel: "N° de départ",
    applySeriesBtn: "Appliquer la série",
    chickCardTitle: "Oisillon #{number}",
    bornDate: "Né le {date}",
    ringInputLabel: "Bague Officielle Fermée *",
    ringValid: "Valide",
    sexLabel: "Sexe",
    male: "♂ M",
    female: "♀ F",
    undetermined: "? Ind.",
    mutationLabel: "Mutation & Phénotype Observé",
    vigorLabel: "Vigueur / État de santé",
    vigorExcellent: "Excellent",
    vigorNormal: "Normal",
    vigorLow: "Faible",
    destCageLabel: "Cage / Emplacement de Destination",
    geneticAncestryTitle: "Ascendance Génétique",
    sireLabel: "♂ PÈRE",
    damLabel: "♀ MÈRE",
    inbreedingTitle: "Consanguinité",
    probabilitiesTitle: "Probabilités Phénotypiques",
    probability: "probabilité",
    unknownMale: "Inconnu",
    unknownFemale: "Inconnue",
    ringRequired: "Numéro de bague obligatoire",
    ringDuplicateFlock: "La bague \"{ring}\" est déjà attribuée à un oiseau du cheptel",
    ringDuplicateBatch: "Numéro de bague en doublon dans cette nichée",
    allValidReady: "Toutes les bagues sont valides et prêtes pour l'enregistrement.",
    fixErrorsWarning: "Veuillez corriger les erreurs de bagues avant d'enregistrer.",
    cancelBtn: "Annuler",
    submitBtn: "Bagner et Ajouter au Cheptel ({count})"
  },
  en: {
    modalMainTitle: "Banding & Flock Registration",
    modalTitle: "Clutch Banding Registration (#{id})",
    chicksToBandBadge: "{count} chick(s) to band",
    modalSubtitle: "Assign official closed C.O.M. rings and integrate chicks into your flock registry.",
    diameterLabel: "Diameter: ",
    generatorTitle: "Automatic Ring Series Generator",
    prefixLabel: "Prefix / Federation & Year",
    prefixPlaceholder: "e.g., FR-2026- or TN-2026-",
    startNumLabel: "Start No.",
    applySeriesBtn: "Apply series",
    chickCardTitle: "Chick #{number}",
    bornDate: "Born on {date}",
    ringInputLabel: "Official Closed Ring *",
    ringValid: "Valid",
    sexLabel: "Sex",
    male: "♂ M",
    female: "♀ F",
    undetermined: "? Ind.",
    mutationLabel: "Mutation & Observed Phenotype",
    vigorLabel: "Vigor / Health Status",
    vigorExcellent: "Excellent",
    vigorNormal: "Normal",
    vigorLow: "Weak",
    destCageLabel: "Destination Cage / Location",
    geneticAncestryTitle: "Genetic Ancestry",
    sireLabel: "♂ SIRE",
    damLabel: "♀ DAM",
    inbreedingTitle: "Inbreeding",
    probabilitiesTitle: "Phenotypic Probabilities",
    probability: "probability",
    unknownMale: "Unknown",
    unknownFemale: "Unknown",
    ringRequired: "Ring number is required",
    ringDuplicateFlock: "Ring \"{ring}\" is already assigned to a bird in your flock",
    ringDuplicateBatch: "Duplicate ring number in this clutch",
    allValidReady: "All rings are valid and ready for registration.",
    fixErrorsWarning: "Please resolve ring errors before submitting.",
    cancelBtn: "Cancel",
    submitBtn: "Ring & Add to Flock ({count})"
  },
  ar: {
    modalMainTitle: "التحجيل والتسجيل في المزرعة",
    modalTitle: "تسجيل تحجيل العش (#{id})",
    chicksToBandBadge: "{count} فرخ للتحجيل",
    modalSubtitle: "خصص الحلقات الرسمية المغلقة وأضف الفراخ مباشرة إلى سجل مزرعتك.",
    diameterLabel: "القطر: ",
    generatorTitle: "مولد سلسلة الحلقات التلقائي",
    prefixLabel: "البادئة / الاتحاد والسنة",
    prefixPlaceholder: "مثال: FR-2026- أو TN-2026-",
    startNumLabel: "رقم البداية",
    applySeriesBtn: "تطبيق السلسلة",
    chickCardTitle: "فرخ رقم #{number}",
    bornDate: "ولد في {date}",
    ringInputLabel: "الحلقة الرسمية المغلقة *",
    ringValid: "صالحة",
    sexLabel: "الجنس",
    male: "♂ ذكر",
    female: "♀ أنثى",
    undetermined: "? غير محدد",
    mutationLabel: "الطفرة والنمط الظاهري الملاحظ",
    vigorLabel: "الحيوية / الحالة الصحية",
    vigorExcellent: "ممتازة",
    vigorNormal: "عادية",
    vigorLow: "ضعيفة",
    destCageLabel: "قفص / موقع الوجهة",
    geneticAncestryTitle: "الأصل الوراثي",
    sireLabel: "♂ الأب",
    damLabel: "♀ الأم",
    inbreedingTitle: "معامل القرابة",
    probabilitiesTitle: "الاحتمالات الظاهرية",
    probability: "احتمالية",
    unknownMale: "غير معروف",
    unknownFemale: "غير معروفة",
    ringRequired: "رقم الحلقة إلزامي",
    ringDuplicateFlock: "الحلقة \"{ring}\" مخصصة بالفعل لطائر في المزرعة",
    ringDuplicateBatch: "رقم حلقة مكرر في هذا العش",
    allValidReady: "جميع الحلقات صالحة وجاهزة للتسجيل.",
    fixErrorsWarning: "يرجى تصحيح أخطاء الحلقات قبل الحفظ.",
    cancelBtn: "إلغاء",
    submitBtn: "تحجيل وإضافة للقطيع ({count})"
  },
  es: {
    modalMainTitle: "Anillado y Registro en el Criadero",
    modalTitle: "Registro de Anillado de la Nidada (#{id})",
    chicksToBandBadge: "{count} pichón(es) por anillar",
    modalSubtitle: "Asigne anillas oficiales cerradas C.O.M. e incorpore los jóvenes a su registro de cría.",
    diameterLabel: "Diámetro: ",
    generatorTitle: "Generador Automático de Series de Anillas",
    prefixLabel: "Prefijo / Federación y Año",
    prefixPlaceholder: "Ej.: FR-2026- o ES-2026-",
    startNumLabel: "N.° de inicio",
    applySeriesBtn: "Aplicar serie",
    chickCardTitle: "Pichón #{number}",
    bornDate: "Nacido el {date}",
    ringInputLabel: "Anilla Oficial Cerrada *",
    ringValid: "Válida",
    sexLabel: "Sexo",
    male: "♂ M",
    female: "♀ H",
    undetermined: "? Ind.",
    mutationLabel: "Mutación y Fenotipo Observado",
    vigorLabel: "Vigor / Estado de salud",
    vigorExcellent: "Excelente",
    vigorNormal: "Normal",
    vigorLow: "Débil",
    destCageLabel: "Jaula / Ubicación de Destino",
    geneticAncestryTitle: "Ascendencia Genética",
    sireLabel: "♂ PADRE",
    damLabel: "♀ MADRE",
    inbreedingTitle: "Consanguinidad",
    probabilitiesTitle: "Probabilidades Fenotípicas",
    probability: "probabilidad",
    unknownMale: "Desconocido",
    unknownFemale: "Desconocida",
    ringRequired: "Número de anilla obligatorio",
    ringDuplicateFlock: "La anilla \"{ring}\" ya está asignada a un ave del criadero",
    ringDuplicateBatch: "Número de anilla duplicado en esta nidada",
    allValidReady: "Todas las anillas son válidas y listas para registrar.",
    fixErrorsWarning: "Por favor corrija los errores de anillas antes de guardar.",
    cancelBtn: "Cancelar",
    submitBtn: "Anillar y Añadir al Plantel ({count})"
  },
  it: {
    modalMainTitle: "Inanellamento e Registrazione nello Stormo",
    modalTitle: "Registrazione Inanellamento della Nidiata (#{id})",
    chicksToBandBadge: "{count} pullo/i da inanellare",
    modalSubtitle: "Assegna anelli ufficiali chiusi C.O.M. e integra i giovani nel registro del tuo allevamento.",
    diameterLabel: "Diametro: ",
    generatorTitle: "Generatore Automatico di Serie di Anelli",
    prefixLabel: "Prefisso / Federazione e Anno",
    prefixPlaceholder: "Es.: FR-2026- o IT-2026-",
    startNumLabel: "N. di partenza",
    applySeriesBtn: "Applica serie",
    chickCardTitle: "Pullo #{number}",
    bornDate: "Nato il {date}",
    ringInputLabel: "Anello Ufficiale Chiuso *",
    ringValid: "Valido",
    sexLabel: "Sesso",
    male: "♂ M",
    female: "♀ F",
    undetermined: "? Ind.",
    mutationLabel: "Mutazione e Fenotipo Osservato",
    vigorLabel: "Vigore / Stato di salute",
    vigorExcellent: "Eccellente",
    vigorNormal: "Normale",
    vigorLow: "Debole",
    destCageLabel: "Gabbia / Posizione di Destinazione",
    geneticAncestryTitle: "Ascendenza Genetica",
    sireLabel: "♂ PADRE",
    damLabel: "♀ MADRE",
    inbreedingTitle: "Consanguineità",
    probabilitiesTitle: "Probabilità Fenotipiche",
    probability: "probabilità",
    unknownMale: "Sconosciuto",
    unknownFemale: "Sconosciuta",
    ringRequired: "Numero di anello obbligatorio",
    ringDuplicateFlock: "L'anello \"{ring}\" è già assegnato a un uccello dell'allevamento",
    ringDuplicateBatch: "Numero di anello duplicato in questa nidiata",
    allValidReady: "Tutti gli anelli sono validi e pronti per la registrazione.",
    fixErrorsWarning: "Correggi gli errori di inanellamento prima di salvare.",
    cancelBtn: "Annulla",
    submitBtn: "Inanella e Aggiungi allo Stormo ({count})"
  }
};

export const BandingBatchModal: React.FC<BandingBatchModalProps> = ({
  isOpen,
  onClose,
  reproductionId,
  sire,
  dam,
  allBirds,
  chicks,
  cagesList,
  onCompleteBanding,
}) => {
  const { t, currentLanguage } = useLanguage();

  const lbl = (k: keyof typeof BANDING_I18N.fr) => {
    const dict = BANDING_I18N[currentLanguage as keyof typeof BANDING_I18N] || BANDING_I18N.fr;
    return dict[k] || BANDING_I18N.fr[k];
  };

  const formatDateLocale = (d: string | Date) => {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    const locale = currentLanguage === 'ar' ? 'ar-SA' : currentLanguage === 'en' ? 'en-US' : currentLanguage === 'es' ? 'es-ES' : currentLanguage === 'it' ? 'it-IT' : 'fr-FR';
    return dateObj.toLocaleDateString(locale);
  };

  const defaultCageId = cagesList[0]?.id || 1;
  const currentYear = new Date().getFullYear();

  // Batch series generator state
  const [seriesPrefix, setSeriesPrefix] = useState<string>(`FR-${currentYear}-`);
  const [seriesStartNumber, setSeriesStartNumber] = useState<number>(1);

  // Filter unbanded or active chicks for this clutch
  const unbandedChicks = useMemo(() => {
    return chicks.filter(c => c.statut === 'En sevrage' || !c.bague);
  }, [chicks]);

  // Genetic predictions
  const geneticPredictions: OffspringPrediction | null = useMemo(() => {
    if (!sire || !dam) return null;
    try {
      return GeneticsEngine.predictOffspringOutcomes(sire, dam);
    } catch {
      return null;
    }
  }, [sire, dam]);

  // Inbreeding COI
  const coi = useMemo(() => {
    if (!sire || !dam) return 0;
    return calculateInbreedingCOI(sire.id, dam.id, allBirds);
  }, [sire, dam, allBirds]);

  // Recommended ring diameter
  const ringDiameter = useMemo(() => {
    return getRecommendedRingDiameter(sire?.espece || dam?.espece, sire?.race || dam?.race);
  }, [sire, dam]);

  // Form entries for all chicks
  const [entries, setEntries] = useState<ChickBandingEntry[]>([]);

  // Initialize entries whenever modal opens or unbandedChicks change
  useEffect(() => {
    if (isOpen) {
      const initialEntries: ChickBandingEntry[] = unbandedChicks.map((chick, idx) => {
        const defaultMutation = geneticPredictions?.phenotypes[0]?.name || sire?.mutation || dam?.mutation || 'Classique';
        const defaultColor = sire?.couleur_base || dam?.couleur_base || 'Jaune';
        const defaultSex = idx % 2 === 0 ? 'Indéterminé' : 'Indéterminé';

        return {
          id: chick.id,
          tempNumber: idx + 1,
          bague: chick.bague || `${seriesPrefix}${(seriesStartNumber + idx).toString().padStart(3, '0')}`,
          nom: `${sire?.race || 'Canari'} #${chick.id}`,
          sexe: defaultSex,
          mutation: defaultMutation,
          couleur: `${defaultMutation} ${defaultColor}`,
          vigor: 'Normal',
          date_naissance: chick.date_naissance || new Date().toISOString().split('T')[0],
          cage_id: defaultCageId,
        };
      });
      setEntries(initialEntries);
    }
  }, [isOpen, unbandedChicks, sire, dam, geneticPredictions, defaultCageId]);

  // Existing ring numbers set for conflict detection
  const existingRings = useMemo(() => {
    return new Set(allBirds.map(b => (b.bague || '').toUpperCase().trim()));
  }, [allBirds]);

  // Batch ring series applicator
  const handleApplySeries = () => {
    setEntries(prev => prev.map((entry, idx) => {
      const generatedRing = `${seriesPrefix}${(seriesStartNumber + idx).toString().padStart(3, '0')}`;
      return {
        ...entry,
        bague: generatedRing,
      };
    }));
  };

  // Update a single chick entry
  const updateEntry = (index: number, patch: Partial<ChickBandingEntry>) => {
    setEntries(prev => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  // Validation
  const validationErrors = useMemo(() => {
    const errors: Record<number, string[]> = {};
    const seenInBatch = new Set<string>();

    entries.forEach((entry, idx) => {
      const itemErrors: string[] = [];
      const cleanRing = (entry.bague || '').trim().toUpperCase();

      if (!cleanRing) {
        itemErrors.push(lbl('ringRequired'));
      } else {
        if (existingRings.has(cleanRing)) {
          itemErrors.push(lbl('ringDuplicateFlock').replace('{ring}', cleanRing));
        }
        if (seenInBatch.has(cleanRing)) {
          itemErrors.push(lbl('ringDuplicateBatch'));
        }
        seenInBatch.add(cleanRing);
      }

      if (itemErrors.length > 0) {
        errors[idx] = itemErrors;
      }
    });

    return errors;
  }, [entries, existingRings, currentLanguage]);

  const isValid = Object.keys(validationErrors).length === 0 && entries.length > 0;

  // Final submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const payload = entries.map((entry) => {
      const newBird: Omit<Canari, 'id'> = {
        bague: entry.bague.trim().toUpperCase(),
        nom: entry.nom || `${sire?.race || 'Canari'} ${entry.bague}`,
        sexe: entry.sexe,
        espece: sire?.espece || dam?.espece || 'canari',
        categorie: sire?.categorie || dam?.categorie || 'canari_couleur',
        race: sire?.race || dam?.race || 'Lipochrome',
        mutation: entry.mutation || 'Classique',
        couleur_base: sire?.couleur_base || dam?.couleur_base || 'Jaune',
        facteur: sire?.facteur || dam?.facteur || 'Intensif',
        couleur: entry.couleur || `${entry.mutation} ${sire?.couleur_base || 'Jaune'}`,
        date_naissance: entry.date_naissance,
        cage_id: entry.cage_id,
        pere_id: sire ? sire.id : null,
        mere_id: dam ? dam.id : null,
        statut_sante: entry.vigor === 'Faible' ? 'Surveillance' : 'Sain',
        observations: `Bagué en lot (Nichée #${reproductionId}). Vigueur: ${entry.vigor}. Diamètre officiel: ${ringDiameter}.`,
        archived: false,
      };

      return {
        jeuneId: entry.id,
        bird: newBird,
      };
    });

    onCompleteBanding(payload);
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={lbl('modalMainTitle')}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-slate-100">
        
        {/* Top Summary Banner */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-100 flex items-center gap-2">
                <span>{lbl('modalTitle').replace('{id}', String(reproductionId))}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold">
                  {lbl('chicksToBandBadge').replace('{count}', String(entries.length))}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lbl('modalSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              {lbl('diameterLabel')}<strong className="text-amber-300">{ringDiameter}</strong>
            </span>
          </div>
        </div>

        {/* Batch Series Quick Generator Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>{lbl('generatorTitle')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                {lbl('prefixLabel')}
              </label>
              <input
                type="text"
                value={seriesPrefix}
                onChange={(e) => setSeriesPrefix(e.target.value)}
                placeholder={lbl('prefixPlaceholder')}
                className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                {lbl('startNumLabel')}
              </label>
              <input
                type="number"
                min={1}
                value={seriesStartNumber}
                onChange={(e) => setSeriesStartNumber(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={handleApplySeries}
                className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{lbl('applySeriesBtn')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Split View Content: Left List & Right Genetics Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left 2 Columns: Chick Item Cards List */}
          <div className="lg:col-span-2 space-y-4">
            {entries.map((entry, index) => {
              const itemErrors = validationErrors[index] || [];
              const isItemValid = itemErrors.length === 0;

              return (
                <div 
                  key={entry.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isItemValid
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-slate-900 border-rose-500/60 ring-1 ring-rose-500/20'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-black font-mono">
                        #{entry.tempNumber}
                      </span>
                      <span className="text-xs font-black text-slate-200">
                        {lbl('chickCardTitle').replace('{number}', String(entry.tempNumber))}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        ({lbl('bornDate').replace('{date}', formatDateLocale(entry.date_naissance))})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                        {ringDiameter}
                      </span>
                    </div>
                  </div>

                  {/* Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    
                    {/* Ring Input */}
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1 flex items-center justify-between">
                        <span>{lbl('ringInputLabel')}</span>
                        {isItemValid && entry.bague && (
                          <span className="text-emerald-400 flex items-center gap-0.5 text-[10px] font-bold">
                            <Check className="w-3 h-3" /> {lbl('ringValid')}
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        value={entry.bague}
                        onChange={(e) => updateEntry(index, { bague: e.target.value })}
                        placeholder="Ex: FR-2026-001"
                        className={`w-full px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          itemErrors.length > 0
                            ? 'bg-rose-950/20 border border-rose-500 text-rose-200 focus:ring-1 focus:ring-rose-500'
                            : 'bg-slate-950 border border-slate-800 text-slate-100 focus:ring-1 focus:ring-indigo-500'
                        }`}
                      />
                      {itemErrors.map((err, i) => (
                        <p key={i} className="text-[10px] text-rose-400 mt-1 flex items-center gap-1 font-semibold">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{err}</span>
                        </p>
                      ))}
                    </div>

                    {/* Sex Selector */}
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                        {lbl('sexLabel')}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['Mâle', 'Femelle', 'Indéterminé'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => updateEntry(index, { sexe: s })}
                            className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              entry.sexe === s
                                ? s === 'Mâle'
                                  ? 'bg-blue-600 text-white shadow-xs font-black'
                                  : s === 'Femelle'
                                  ? 'bg-pink-600 text-white shadow-xs font-black'
                                  : 'bg-indigo-600 text-white shadow-xs font-black'
                                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>{s === 'Mâle' ? lbl('male') : s === 'Femelle' ? lbl('female') : lbl('undetermined')}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Observed Mutation Dropdown (Pre-populated from predictions) */}
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                        {lbl('mutationLabel')}
                      </label>
                      <select
                        value={entry.mutation}
                        onChange={(e) => {
                          const mut = e.target.value;
                          updateEntry(index, {
                            mutation: mut,
                            couleur: `${mut} ${sire?.couleur_base || 'Jaune'}`,
                          });
                        }}
                        className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 text-xs focus:ring-1 focus:ring-indigo-500 font-semibold"
                      >
                        {geneticPredictions?.phenotypes.map((p, pIdx) => (
                          <option key={pIdx} value={p.name}>
                            {p.name} ({p.probability}% {lbl('probability')})
                          </option>
                        ))}
                        <option value="Classique">Classique (Standard)</option>
                        <option value="Agathe">Agathe</option>
                        <option value="Isabelle">Isabelle</option>
                        <option value="Pastel">Pastel</option>
                        <option value="Opal">Opal</option>
                        <option value="Satiné">Satiné</option>
                        <option value="Ino">Ino (Albinos / Lutinos / Rubinos)</option>
                        <option value="Jaspe">Jaspe</option>
                      </select>
                    </div>

                    {/* Vigor / Health State */}
                    <div>
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                        {lbl('vigorLabel')}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['Excellent', 'Normal', 'Faible'] as const).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => updateEntry(index, { vigor: v })}
                            className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              entry.vigor === v
                                ? v === 'Excellent'
                                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                                  : v === 'Normal'
                                  ? 'bg-amber-600 text-white shadow-xs font-black'
                                  : 'bg-rose-600 text-white shadow-xs font-black'
                                : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {v === 'Excellent' ? lbl('vigorExcellent') : v === 'Normal' ? lbl('vigorNormal') : lbl('vigorLow')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Destination Cage */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                        {lbl('destCageLabel')}
                      </label>
                      <select
                        value={entry.cage_id}
                        onChange={(e) => updateEntry(index, { cage_id: Number(e.target.value) })}
                        className="w-full bg-slate-950 text-slate-100 px-3 py-2 rounded-xl border border-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                      >
                        {cagesList.map(c => (
                          <option key={c.id} value={c.id}>{c.nom}</option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Persistent Genetics & Heritage Sidebar */}
          <div className="space-y-4">
            
            {/* Parents Identity Card */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-xs font-black uppercase tracking-wider text-slate-300">
                <Dna className="w-4 h-4 text-indigo-400" />
                <span>{lbl('geneticAncestryTitle')}</span>
              </div>

              {/* Sire */}
              <div className="p-2.5 bg-blue-950/25 border border-blue-900/40 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px] font-black text-blue-400">
                  <span>{lbl('sireLabel')}</span>
                  {sire?.espece && <SpeciesBadge speciesId={sire.espece} size="sm" showLabel={false} />}
                </div>
                <div className="font-bold text-xs text-slate-200 truncate">{sire?.nom || lbl('unknownMale')}</div>
                <div className="font-mono text-[10px] text-slate-400">{lbl('ringInputLabel').replace(' *', ' : ')}{sire?.bague || '—'}</div>
                <div className="text-[10px] text-slate-400 truncate">{sire?.race} • {sire?.couleur}</div>
              </div>

              {/* Dam */}
              <div className="p-2.5 bg-pink-950/25 border border-pink-900/40 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px] font-black text-pink-400">
                  <span>{lbl('damLabel')}</span>
                  {dam?.espece && <SpeciesBadge speciesId={dam.espece} size="sm" showLabel={false} />}
                </div>
                <div className="font-bold text-xs text-slate-200 truncate">{dam?.nom || lbl('unknownFemale')}</div>
                <div className="font-mono text-[10px] text-slate-400">{lbl('ringInputLabel').replace(' *', ' : ')}{dam?.bague || '—'}</div>
                <div className="text-[10px] text-slate-400 truncate">{dam?.race} • {dam?.couleur}</div>
              </div>

              {/* Inbreeding Gauge */}
              {sire && dam && (
                <WrightConsanguinityGauge
                  coefficient={coi}
                  title={lbl('inbreedingTitle')}
                  size="sm"
                  variant="bar"
                />
              )}
            </div>

            {/* Predicted Probabilities Card */}
            {geneticPredictions && geneticPredictions.phenotypes.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-800 text-xs font-black uppercase tracking-wider text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lbl('probabilitiesTitle')}</span>
                </div>

                <div className="space-y-2">
                  {geneticPredictions.phenotypes.map((pheno, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-semibold text-slate-300 truncate max-w-[150px]">{pheno.name}</span>
                        <span className="font-mono font-bold text-indigo-400">{pheno.probability}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${pheno.probability}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer Actions Bar */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {isValid ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                {lbl('allValidReady')}
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1 font-semibold">
                <AlertCircle className="w-4 h-4" />
                {lbl('fixErrorsWarning')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              {lbl('cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Award className="w-4 h-4" />
              <span>{lbl('submitBtn').replace('{count}', String(entries.length))}</span>
            </button>
          </div>
        </div>

      </form>
    </AppModal>
  );
};
