/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT BreedingTimelineViewer
 * Mission V1.9.5 : Étape 2 & Étape 11 — Chronologie naturelle et lisible d'un cycle de reproduction.
 * 
 * CYCLE NATUREL :
 * COUPLE FORMÉ → REPRODUCTION → PONTE → ŒUF → INCUBATION → MIRAGE → ÉCLOSION → JEUNE → NURSERY → SEVRAGE
 * 
 * GARANTIES SCIENTIFIQUES :
 * 1. Exploite UNIQUEMENT les événements réellement enregistrés ou calculés par les règles homologuées existantes.
 * 2. Zéro faux événement inventé.
 * 3. Si une date est absente : « Date inconnue » ou « Non renseigné », sans estimation arbitraire.
 * 4. Présentation multilingue (FR, EN, AR, ES, IT) et support RTL.
 */

import React, { useMemo } from 'react';
import { 
  Heart, Calendar, Egg as EggIcon, Flame, Eye, 
  Sparkles, Users, Home, ShieldCheck, Clock, AlertTriangle, 
  HelpCircle, ArrowRight, CheckCircle2 
} from 'lucide-react';
import type { Language } from '../../../utils/translations';
import { ReproductionService } from '../services/ReproductionService';
import { ClutchService } from '../clutches/services/ClutchService';
import { EggService } from '../eggs/services/EggService';
import { IncubationService } from '../incubation/services/IncubationService';
import { HatchingService } from '../hatching/services/HatchingService';
import { ChickService } from '../chicks/services/ChickService';
import { NurseryService } from '../nursery/services/NurseryService';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { AppCard, AppBadge } from '../../../components/design-system';

export interface BreedingTimelineViewerProps {
  pairId: string;
  clutchId?: string | null;
  language?: Language;
  className?: string;
  onSelectClutch?: (clutchId: string) => void;
  'data-testid'?: string;
}

export interface TimelineMilestone {
  id: string;
  stage: 'COUPLE' | 'PONTE' | 'OEUF' | 'INCUBATION' | 'MIRAGE' | 'ECLOSION' | 'JEUNE' | 'NURSERY' | 'SEVRAGE';
  title: string;
  date?: string | null;
  isDateKnown: boolean;
  status: 'completed' | 'in_progress' | 'pending' | 'missing';
  description: string;
  details?: Record<string, any>;
  missingNotice?: string;
}

export function BreedingTimelineViewer({
  pairId,
  clutchId,
  language = 'fr',
  className = '',
  onSelectClutch,
  'data-testid': testId = 'breeding-timeline-viewer'
}: BreedingTimelineViewerProps) {
  const isRtl = language === 'ar';

  const t = {
    fr: {
      title: "Chronologie du Cycle de Reproduction",
      subtitle: "Traçabilité des jalons réels enregistrés — Zéro extrapolation arbitraire",
      noPair: "Couple introuvable",
      noClutchSelected: "Sélectionnez une ponte pour examiner sa chronologie détaillée",
      dateUnknown: "Date inconnue",
      notRecorded: "Non renseigné",
      missingData: "Information manquante",
      humanReview: "Vérification requise",
      stageCouple: "1. Formation du Couple",
      stageClutch: "2. Déclaration de Ponte",
      stageEggs: "3. Dépôt des Œufs",
      stageIncubation: "4. Incubation",
      stageCandling: "5. Mirage / Suivi",
      stageHatch: "6. Éclosion(s)",
      stageChicks: "7. Développement du Jeune",
      stageNursery: "8. Nurserie / Alimentation",
      stageWeaning: "9. Sevrage & Évolution",
      biologicalMode: "Mode naturel",
      eggSummary: "{count} œuf(s) consigné(s)",
      hatchSummary: "{count} jeune(s) éclos",
      activeNursery: "Suivi en nurserie actif",
      weanedDone: "Sevrage finalisé",
      unrecordedEggs: "Aucun œuf enregistré pour cette ponte",
      unrecordedIncubation: "Incubation non démarrée ou date de début non renseignée",
      unrecordedCandling: "Aucun mirage enregistré",
      unrecordedHatch: "Aucune éclosion enregistrée à ce stade",
      unrecordedChicks: "Aucun poussin vivant associé",
      deontologicalNotice: "Cette chronologie reflète uniquement les données consignées par l'éleveur sans prédiction spéculative."
    },
    en: {
      title: "Breeding Lifecycle Timeline",
      subtitle: "Factual chronology of recorded milestones — Zero arbitrary guesswork",
      noPair: "Breeding pair not found",
      noClutchSelected: "Select a clutch to inspect its full chronology",
      dateUnknown: "Unknown date",
      notRecorded: "Unrecorded",
      missingData: "Missing information",
      humanReview: "Review needed",
      stageCouple: "1. Pair Formation",
      stageClutch: "2. Clutch Record",
      stageEggs: "3. Egg Laying",
      stageIncubation: "4. Incubation",
      stageCandling: "5. Candling / Inspection",
      stageHatch: "6. Hatching(s)",
      stageChicks: "7. Chick Growth",
      stageNursery: "8. Nursery / Feeding",
      stageWeaning: "9. Weaning & Evolution",
      biologicalMode: "Natural mode",
      eggSummary: "{count} egg(s) recorded",
      hatchSummary: "{count} chick(s) hatched",
      activeNursery: "Nursery tracking active",
      weanedDone: "Weaning completed",
      unrecordedEggs: "No eggs recorded for this clutch",
      unrecordedIncubation: "Incubation not started or start date missing",
      unrecordedCandling: "No candling inspection recorded",
      unrecordedHatch: "No hatching recorded at this stage",
      unrecordedChicks: "No active chicks associated",
      deontologicalNotice: "This timeline strictly reflects recorded breeder data without speculative predictions."
    },
    ar: {
      title: "الجدول الزمني لدورة التكاثر",
      subtitle: "التتبع الواقعي للمراحل المسجلة — دون أي تخمين اعتباطي",
      noPair: "الزوج غير موجود",
      noClutchSelected: "اختر بطن تفريخ لعرض جدوله الزمني الكامل",
      dateUnknown: "تاريخ غير معروف",
      notRecorded: "غير مسجل",
      missingData: "معلومات ناقصة",
      humanReview: "مراجعة مطلوبة",
      stageCouple: "1. تشكيل الزوج",
      stageClutch: "2. تسجيل البطن",
      stageEggs: "3. وضع البيض",
      stageIncubation: "4. الحضانة",
      stageCandling: "5. الكشف الضوئي / الفحص",
      stageHatch: "6. التفقيس",
      stageChicks: "7. نمو الفرخ",
      stageNursery: "8. الحضانة / التغذية",
      stageWeaning: "9. الفطام والتطور",
      biologicalMode: "طبيعي",
      eggSummary: "{count} بيضة مسجلة",
      hatchSummary: "{count} فرخ فقس",
      activeNursery: "تتبع الحضانة نشط",
      weanedDone: "تم الفطام بنجاح",
      unrecordedEggs: "لم يتم تسجيل بيض لهذا البطن",
      unrecordedIncubation: "لم تبدأ الحضانة أو تاريخ البدء مفقود",
      unrecordedCandling: "لم يتم تسجيل فحص ضوئي",
      unrecordedHatch: "لم يتم تسجيل تفقيس حتى الآن",
      unrecordedChicks: "لا توجد فراخ نشطة مرتبطة",
      deontologicalNotice: "يعكس هذا المخطط فقط البيانات المسجلة دون أي تكهنات مسبقة."
    },
    es: {
      title: "Cronología del Ciclo de Reproducción",
      subtitle: "Trazabilidad de hitos reales registrados — Cero conjeturas arbitrarias",
      noPair: "Pareja no encontrada",
      noClutchSelected: "Seleccione una nidada para ver su cronología detallada",
      dateUnknown: "Fecha desconocida",
      notRecorded: "No registrado",
      missingData: "Información faltante",
      humanReview: "Revisión requerida",
      stageCouple: "1. Formación de Pareja",
      stageClutch: "2. Declaración de Nidada",
      stageEggs: "3. Puesta de Huevos",
      stageIncubation: "4. Incubación",
      stageCandling: "5. Ovoscopia / Control",
      stageHatch: "6. Eclosión(es)",
      stageChicks: "7. Crecimiento del Pichón",
      stageNursery: "8. Guardería / Alimentación",
      stageWeaning: "9. Destete y Evolución",
      biologicalMode: "Modo natural",
      eggSummary: "{count} huevo(s) registrado(s)",
      hatchSummary: "{count} pichón(es) eclosionado(s)",
      activeNursery: "Seguimiento en guardería activo",
      weanedDone: "Destete finalizado",
      unrecordedEggs: "No hay huevos registrados para esta nidada",
      unrecordedIncubation: "Incubación no iniciada o fecha de inicio ausente",
      unrecordedCandling: "Ninguna ovoscopia registrada",
      unrecordedHatch: "Ninguna eclosión registrada en esta fase",
      unrecordedChicks: "Ningún pichón activo asociado",
      deontologicalNotice: "Esta cronología refleja únicamente los datos registrados sin predicciones especulativas."
    },
    it: {
      title: "Cronologia del Ciclo Riproduttivo",
      subtitle: "Tracciabilità delle tappe reali registrate — Zero supposizioni arbitrarie",
      noPair: "Coppia non trovata",
      noClutchSelected: "Seleziona una covata per esaminare la sua cronologia",
      dateUnknown: "Data sconosciuta",
      notRecorded: "Non inserito",
      missingData: "Informazione mancante",
      humanReview: "Verifica richiesta",
      stageCouple: "1. Formazione Coppia",
      stageClutch: "2. Registrazione Covata",
      stageEggs: "3. Deposizione Uova",
      stageIncubation: "4. Incubazione",
      stageCandling: "5. Speratura / Monitoraggio",
      stageHatch: "6. Schiusa(e)",
      stageChicks: "7. Sviluppo del Pulcino",
      stageNursery: "8. Nursery / Alimentazione",
      stageWeaning: "9. Svezzamento ed Evoluzione",
      biologicalMode: "Modo naturale",
      eggSummary: "{count} uovo/a registrato/e",
      hatchSummary: "{count} pulcino/i schiuso/i",
      activeNursery: "Monitoraggio nursery attivo",
      weanedDone: "Svezzamento completato",
      unrecordedEggs: "Nessun uovo registrato per questa covata",
      unrecordedIncubation: "Incubazione non avviata o data inizio mancante",
      unrecordedCandling: "Nessuna speratura registrata",
      unrecordedHatch: "Nessuna schiusa registrata in questa fase",
      unrecordedChicks: "Nessun pulcino attivo associato",
      deontologicalNotice: "Questa cronologia riflette solo i dati registrati senza previsioni speculative."
    }
  }[language] || {
    title: "Chronologie du Cycle de Reproduction",
    subtitle: "Traçabilité des jalons réels enregistrés — Zéro extrapolation arbitraire",
    noPair: "Couple introuvable",
    noClutchSelected: "Sélectionnez une ponte pour examiner sa chronologie détaillée",
    dateUnknown: "Date inconnue",
    notRecorded: "Non renseigné",
    missingData: "Information manquante",
    humanReview: "Vérification requise",
    stageCouple: "1. Formation du Couple",
    stageClutch: "2. Déclaration de Ponte",
    stageEggs: "3. Dépôt des Œufs",
    stageIncubation: "4. Incubation",
    stageCandling: "5. Mirage / Suivi",
    stageHatch: "6. Éclosion(s)",
    stageChicks: "7. Développement du Jeune",
    stageNursery: "8. Nurserie / Alimentation",
    stageWeaning: "9. Sevrage & Évolution",
    biologicalMode: "Mode naturel",
    eggSummary: "{count} œuf(s) consigné(s)",
    hatchSummary: "{count} jeune(s) éclos",
    activeNursery: "Suivi en nurserie actif",
    weanedDone: "Sevrage finalisé",
    unrecordedEggs: "Aucun œuf enregistré pour cette ponte",
    unrecordedIncubation: "Incubation non démarrée ou date de début non renseignée",
    unrecordedCandling: "Aucun mirage enregistré",
    unrecordedHatch: "Aucune éclosion enregistrée à ce stade",
    unrecordedChicks: "Aucun poussin vivant associé",
    deontologicalNotice: "Cette chronologie reflète uniquement les données consignées par l'éleveur sans prédiction spéculative."
  };

  // Récupération des données réelles
  const pair = useMemo(() => ReproductionService.getPairById(pairId), [pairId]);
  const clutches = useMemo(() => ClutchService.getClutches().filter(c => c.pairId === pairId), [pairId]);
  const activeClutch = useMemo(() => {
    if (clutchId) return clutches.find(c => c.id === clutchId) || null;
    return clutches[0] || null;
  }, [clutchId, clutches]);

  const eggs = useMemo(() => {
    if (!activeClutch) return [];
    return EggService.getEggsByClutch(activeClutch.id);
  }, [activeClutch]);

  const incubation = useMemo(() => {
    if (!activeClutch) return null;
    return IncubationService.getIncubationByClutch(activeClutch.id) || null;
  }, [activeClutch]);

  const hatchings = useMemo(() => {
    if (!activeClutch) return [];
    return HatchingService.getHatchings().filter(h => h.clutchId === activeClutch.id);
  }, [activeClutch]);

  const chicks = useMemo(() => {
    if (!activeClutch) return [];
    return ChickService.getChicksByClutch(activeClutch.id);
  }, [activeClutch]);

  const nurseryRecords = useMemo(() => {
    try {
      const all = NurseryService.getNurseryRecords();
      return Array.isArray(all) ? all.filter(r => chicks.some(c => c.id === r.chickId)) : [];
    } catch {
      return [];
    }
  }, [chicks]);

  // Construction de la frise chronologique
  const milestones: TimelineMilestone[] = useMemo(() => {
    const list: TimelineMilestone[] = [];

    // 1. Formation du couple
    if (pair) {
      const male = BirdRepository.getById(pair.maleId);
      const female = BirdRepository.getById(pair.femaleId);
      const isDateValid = Boolean(pair.dateCreated && pair.dateCreated.trim() !== '');

      list.push({
        id: `ms-couple-${pair.id}`,
        stage: 'COUPLE',
        title: t.stageCouple,
        date: isDateValid ? pair.dateCreated : null,
        isDateKnown: isDateValid,
        status: 'completed',
        description: `Mâle : ${male?.nom || male?.bague || `#${pair.maleId}`} × Femelle : ${female?.nom || female?.bague || `#${pair.femaleId}`}`,
        details: { pairId: pair.id, maleId: pair.maleId, femaleId: pair.femaleId }
      });
    }

    if (!activeClutch) {
      return list;
    }

    // 2. Ponte
    const isClutchDateKnown = Boolean(activeClutch.startDate && activeClutch.startDate.trim() !== '');
    list.push({
      id: `ms-clutch-${activeClutch.id}`,
      stage: 'PONTE',
      title: t.stageClutch,
      date: isClutchDateKnown ? activeClutch.startDate : null,
      isDateKnown: isClutchDateKnown,
      status: 'completed',
      description: activeClutch.observations || `Ponte #${activeClutch.id.slice(-4)} (${activeClutch.eggCount} œufs)`,
      details: { clutchId: activeClutch.id, eggCount: activeClutch.eggCount }
    });

    // 3. Œufs
    if (eggs.length > 0) {
      const dates = eggs.map(e => e.layingDate).filter(Boolean);
      const firstDate = dates[0] || null;
      list.push({
        id: `ms-eggs-${activeClutch.id}`,
        stage: 'OEUF',
        title: t.stageEggs,
        date: firstDate,
        isDateKnown: Boolean(firstDate),
        status: 'completed',
        description: t.eggSummary.replace('{count}', String(eggs.length)),
        details: { eggs: eggs.map(e => ({ number: e.number, status: e.status, date: e.layingDate })) }
      });
    } else {
      list.push({
        id: `ms-eggs-empty-${activeClutch.id}`,
        stage: 'OEUF',
        title: t.stageEggs,
        date: null,
        isDateKnown: false,
        status: 'missing',
        description: t.unrecordedEggs,
        missingNotice: t.missingData
      });
    }

    // 4. Incubation
    if (incubation) {
      const isIncDateKnown = Boolean(incubation.startDate && incubation.startDate.trim() !== '');
      list.push({
        id: `ms-inc-${incubation.id}`,
        stage: 'INCUBATION',
        title: t.stageIncubation,
        date: isIncDateKnown ? incubation.startDate : null,
        isDateKnown: isIncDateKnown,
        status: 'completed',
        description: `Mode : ${incubation.mode || t.biologicalMode} — Durée théorique : ${incubation.theoreticalDuration} jours`,
        details: { mode: incubation.mode, duration: incubation.theoreticalDuration }
      });
    } else {
      list.push({
        id: `ms-inc-empty-${activeClutch.id}`,
        stage: 'INCUBATION',
        title: t.stageIncubation,
        date: null,
        isDateKnown: false,
        status: 'pending',
        description: t.unrecordedIncubation
      });
    }

    // 5. Mirage / Suivi
    const candledEggs = eggs.filter(e => e.status === 'Miré' || e.status === 'Fécondé' || e.status === 'Clair');
    if (candledEggs.length > 0) {
      list.push({
        id: `ms-candling-${activeClutch.id}`,
        stage: 'MIRAGE',
        title: t.stageCandling,
        date: null,
        isDateKnown: false,
        status: 'completed',
        description: `${candledEggs.length} œuf(s) miré(s) — Statuts : ${candledEggs.map(e => `#${e.number}: ${e.status}`).join(', ')}`,
        details: { candledCount: candledEggs.length }
      });
    } else {
      list.push({
        id: `ms-candling-pending-${activeClutch.id}`,
        stage: 'MIRAGE',
        title: t.stageCandling,
        date: null,
        isDateKnown: false,
        status: 'pending',
        description: t.unrecordedCandling
      });
    }

    // 6. Éclosion(s)
    if (hatchings.length > 0) {
      const firstHatch = hatchings[0];
      list.push({
        id: `ms-hatch-${activeClutch.id}`,
        stage: 'ECLOSION',
        title: t.stageHatch,
        date: firstHatch.hatchDate,
        isDateKnown: Boolean(firstHatch.hatchDate),
        status: 'completed',
        description: t.hatchSummary.replace('{count}', String(hatchings.length)),
        details: { hatchings: hatchings.map(h => ({ date: h.hatchDate, weight: h.weight, chickId: h.chickId })) }
      });
    } else {
      list.push({
        id: `ms-hatch-pending-${activeClutch.id}`,
        stage: 'ECLOSION',
        title: t.stageHatch,
        date: null,
        isDateKnown: false,
        status: 'pending',
        description: t.unrecordedHatch
      });
    }

    // 7. Jeunes
    if (chicks.length > 0) {
      list.push({
        id: `ms-chicks-${activeClutch.id}`,
        stage: 'JEUNE',
        title: t.stageChicks,
        date: chicks[0].hatchDate,
        isDateKnown: Boolean(chicks[0].hatchDate),
        status: 'completed',
        description: chicks.map(c => `${c.name} [${c.provisionalNumber}] (${c.status})`).join(' • '),
        details: { chicksCount: chicks.length }
      });
    } else {
      list.push({
        id: `ms-chicks-pending-${activeClutch.id}`,
        stage: 'JEUNE',
        title: t.stageChicks,
        date: null,
        isDateKnown: false,
        status: 'pending',
        description: t.unrecordedChicks
      });
    }

    // 8. Nursery
    if (nurseryRecords.length > 0) {
      list.push({
        id: `ms-nursery-${activeClutch.id}`,
        stage: 'NURSERY',
        title: t.stageNursery,
        date: nurseryRecords[0].entryDate,
        isDateKnown: Boolean(nurseryRecords[0].entryDate),
        status: 'completed',
        description: `${nurseryRecords.length} poussin(s) en nurserie — Modes : ${nurseryRecords.map(r => r.mode).join(', ')}`,
        details: { nurseryCount: nurseryRecords.length }
      });
    }

    // 9. Sevrage & Évolution
    const weanedChicks = chicks.filter(c => c.status === 'weaned' || c.status === 'independent');
    if (weanedChicks.length > 0) {
      list.push({
        id: `ms-weaning-${activeClutch.id}`,
        stage: 'SEVRAGE',
        title: t.stageWeaning,
        date: null,
        isDateKnown: false,
        status: 'completed',
        description: `${weanedChicks.length} jeune(s) sevré(s) ou promu(s) en oiseau autonome dans le registre.`,
        details: { weanedCount: weanedChicks.length }
      });
    }

    return list;
  }, [pair, activeClutch, eggs, incubation, hatchings, chicks, nurseryRecords, t]);

  if (!pair) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 italic" data-testid={testId}>
        {t.noPair}
      </div>
    );
  }

  const getStageIcon = (stage: TimelineMilestone['stage']) => {
    switch (stage) {
      case 'COUPLE': return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case 'PONTE': return <Calendar className="w-3.5 h-3.5 text-amber-500" />;
      case 'OEUF': return <EggIcon className="w-3.5 h-3.5 text-amber-600" />;
      case 'INCUBATION': return <Flame className="w-3.5 h-3.5 text-orange-500" />;
      case 'MIRAGE': return <Eye className="w-3.5 h-3.5 text-indigo-500" />;
      case 'ECLOSION': return <Sparkles className="w-3.5 h-3.5 text-emerald-500" />;
      case 'JEUNE': return <Users className="w-3.5 h-3.5 text-blue-500" />;
      case 'NURSERY': return <Home className="w-3.5 h-3.5 text-purple-500" />;
      case 'SEVRAGE': return <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div 
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-xs ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid={testId}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{t.title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        {clutches.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-2xs">
            {clutches.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectClutch?.(c.id)}
                className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                  activeClutch?.id === c.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Ponte #{idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeline Steps */}
      <div className="relative pl-6 space-y-4 border-l-2 border-slate-100 dark:border-slate-800 ml-3">
        {milestones.map((ms, index) => {
          const isDone = ms.status === 'completed';
          const isMissing = ms.status === 'missing';
          const isPending = ms.status === 'pending';

          return (
            <div 
              key={ms.id} 
              className="relative group text-xs text-left"
              data-testid={`timeline-milestone-${ms.stage.toLowerCase()}`}
            >
              {/* Bullet node on timeline line */}
              <div className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full border-2 bg-white dark:bg-slate-900 flex items-center justify-center transition-transform ${
                isDone 
                  ? 'border-emerald-500 text-emerald-600' 
                  : isMissing 
                  ? 'border-amber-500 text-amber-600' 
                  : 'border-slate-300 dark:border-slate-700 text-slate-400'
              }`}>
                {getStageIcon(ms.stage)}
              </div>

              {/* Card Content */}
              <div className={`p-3 rounded-xl border transition-all ${
                isDone
                  ? 'border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40'
                  : isMissing
                  ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10'
                  : 'border-slate-100 dark:border-slate-850 bg-transparent opacity-75'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                    {ms.title}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {ms.isDateKnown ? (
                      <span className="font-mono text-2xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {ms.date}
                      </span>
                    ) : (
                      <span className="italic text-3xs text-slate-400 dark:text-slate-500">
                        {t.dateUnknown}
                      </span>
                    )}

                    {isMissing && (
                      <AppBadge variant="warning" size="sm">
                        {t.missingData}
                      </AppBadge>
                    )}
                  </div>
                </div>

                <p className="text-2xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ms.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deontological notice */}
      <div className="text-3xs text-slate-400 dark:text-slate-500 italic text-center border-t border-slate-100 dark:border-slate-800 pt-2.5">
        {t.deontologicalNotice}
      </div>
    </div>
  );
}

export default BreedingTimelineViewer;
