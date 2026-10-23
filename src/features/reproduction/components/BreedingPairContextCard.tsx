/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT BreedingPairContextCard
 * Mission V1.9.5 : Étape 3 — Présentation contextuelle et neutre des partenaires lors de la formation d'un couple.
 * 
 * GARANTIES DÉONTOLOGIQUES & ÉPISTÉMIQUES :
 * 1. ZÉRO score d'accouplement, ZÉRO étoile, ZÉRO note de compatibilité.
 * 2. ZÉRO mention « Couple compatible » ou « Couple recommandé ».
 * 3. Présentation honnête des 2 oiseaux : mâle, femelle, espèce, identification, statut, parents, génétique, santé.
 * 4. Détection neutre des informations manquantes : « Certaines informations sont manquantes pour une analyse complète. »
 * 5. Support multilingue (FR, EN, AR, ES, IT) et mode RTL.
 */

import React from 'react';
import { 
  Heart, AlertTriangle, ShieldAlert, CheckCircle2, 
  HelpCircle, Dna, Activity, User, ShieldCheck, Sparkles 
} from 'lucide-react';
import type { Canari } from '../../../types';
import type { Language } from '../../../utils/translations';
import { AppCard, AppBadge } from '../../../components/design-system';

export interface BreedingPairContextCardProps {
  male: Canari | null;
  female: Canari | null;
  language?: Language;
  className?: string;
  onOpenAssistant?: (prompt?: string) => void;
  'data-testid'?: string;
}

export function BreedingPairContextCard({
  male,
  female,
  language = 'fr',
  className = '',
  onOpenAssistant,
  'data-testid': testId = 'breeding-pair-context-card'
}: BreedingPairContextCardProps) {
  const isRtl = language === 'ar';

  // Dictionnaires localisés
  const t = {
    fr: {
      title: "Contexte des Partenaires de Reproduction",
      subtitle: "Examen factuel des données disponibles sans arbitrage ni note de couple.",
      maleTitle: "♂ Partenaire Mâle",
      femaleTitle: "♀ Partenaire Femelle",
      species: "Espèce",
      ring: "Bague",
      status: "Statut",
      parents: "Parents connus",
      genetics: "Génétique enregistrée",
      health: "Données sanitaires",
      missingDataNotice: "Certaines informations sont manquantes pour une analyse complète.",
      missingDetails: "Données non renseignées :",
      healthy: "Aucun traitement ni symptôme actif",
      noGenetics: "Aucun locus canonique renseigné (statut Inconnu/Non testé)",
      unknownParents: "Parents non enregistrés dans l'académie",
      activePairNotice: "Les informations ci-dessus sont présentées à titre purement indicatif sans préjuger de la fertilité future.",
      askAi: "Demander à l'assistant",
      missingInfoBadge: "Information manquante",
      humanReviewNotice: "Une vérification humaine est nécessaire si des données critiques font défaut."
    },
    en: {
      title: "Breeding Partners Context",
      subtitle: "Factual review of available data without rating or pairing score.",
      maleTitle: "♂ Male Partner",
      femaleTitle: "♀ Female Partner",
      species: "Species",
      ring: "Ring",
      status: "Status",
      parents: "Known parents",
      genetics: "Recorded genetics",
      health: "Health data",
      missingDataNotice: "Some information is missing for a complete analysis.",
      missingDetails: "Unrecorded data:",
      healthy: "No active symptoms or treatment",
      noGenetics: "No canonical locus recorded (status Unknown/Not tested)",
      unknownParents: "Parents not registered in the academy",
      activePairNotice: "Information above is presented for context only without assuming future fertility.",
      askAi: "Ask Assistant",
      missingInfoBadge: "Missing information",
      humanReviewNotice: "Human review is required if critical data is lacking."
    },
    ar: {
      title: "سياق شريكي التكاثر",
      subtitle: "مراجعة واقعية للبيانات المتاحة دون تقييم أو نقاط توافق.",
      maleTitle: "♂ الشريك الذكر",
      femaleTitle: "♀ الشريكة الأنثى",
      species: "النوع",
      ring: "الحلقة",
      status: "الحالة",
      parents: "الآباء المعروفون",
      genetics: "البيانات الجينية المسجلة",
      health: "البيانات الصحية",
      missingDataNotice: "بعض المعلومات مفقودة لإجراء تحليل كامل.",
      missingDetails: "البيانات غير المسجلة:",
      healthy: "لا توجد أعراض أو علاجات نشطة",
      noGenetics: "لا توجد مواقع جينية مسجلة (حالة غير معروف / غير مختبر)",
      unknownParents: "الآباء غير مسجلين في الأكاديمية",
      activePairNotice: "تُعرض المعلومات أعلاه كمرجع واقعي دون التنبؤ بالخصوبة.",
      askAi: "اسأل المساعد",
      missingInfoBadge: "معلومات ناقصة",
      humanReviewNotice: "المراجعة البشرية مطلوبة عند غياب البيانات الأساسية."
    },
    es: {
      title: "Contexto de la Pareja Reproductora",
      subtitle: "Revisión objetiva de datos disponibles sin puntuaciones de compatibilidad.",
      maleTitle: "♂ Pareja Macho",
      femaleTitle: "♀ Pareja Hembra",
      species: "Especie",
      ring: "Anilla",
      status: "Estado",
      parents: "Padres conocidos",
      genetics: "Genética registrada",
      health: "Datos sanitarios",
      missingDataNotice: "Faltan algunas informaciones para un análisis completo.",
      missingDetails: "Datos no registrados:",
      healthy: "Sin tratamientos ni síntomas activos",
      noGenetics: "Ningún locus canónico registrado (desconocido / no probado)",
      unknownParents: "Padres no registrados en la academia",
      activePairNotice: "Información presentada con fines contextuales sin garantizar fertilidad.",
      askAi: "Consultar al Asistente",
      missingInfoBadge: "Información faltante",
      humanReviewNotice: "Se requiere verificación humana si faltan datos críticos."
    },
    it: {
      title: "Contesto della Coppia Riproduttrice",
      subtitle: "Rassegna oggettiva dei dati disponibili senza punteggi di compatibilità.",
      maleTitle: "♂ Partner Maschio",
      femaleTitle: "♀ Partner Femmina",
      species: "Specie",
      ring: "Anello",
      status: "Stato",
      parents: "Genitori noti",
      genetics: "Genetica registrata",
      health: "Dati sanitari",
      missingDataNotice: "Alcune informazioni mancano per un'analisi completa.",
      missingDetails: "Dati non inseriti:",
      healthy: "Nessun trattamento o sintomo attivo",
      noGenetics: "Nessun locus canonico registrato (sconosciuto / non testato)",
      unknownParents: "Genitori non registrati nell'accademia",
      activePairNotice: "Informazioni presentate solo come contesto senza presumere fertilità.",
      askAi: "Chiedi all'Assistente",
      missingInfoBadge: "Informazione mancante",
      humanReviewNotice: "Verifica umana richiesta se mancano dati critici."
    }
  }[language] || {
    title: "Contexte des Partenaires de Reproduction",
    subtitle: "Examen factuel des données disponibles sans arbitrage ni note de couple.",
    maleTitle: "♂ Partenaire Mâle",
    femaleTitle: "♀ Partenaire Femelle",
    species: "Espèce",
    ring: "Bague",
    status: "Statut",
    parents: "Parents connus",
    genetics: "Génétique enregistrée",
    health: "Données sanitaires",
    missingDataNotice: "Certaines informations sont manquantes pour une analyse complète.",
    missingDetails: "Données non renseignées :",
    healthy: "Aucun traitement ni symptôme actif",
    noGenetics: "Aucun locus canonique renseigné (statut Inconnu/Non testé)",
    unknownParents: "Parents non enregistrés dans l'académie",
    activePairNotice: "Les informations ci-dessus sont présentées à titre purement indicatif sans préjuger de la fertilité future.",
    askAi: "Demander à l'assistant",
    missingInfoBadge: "Information manquante",
    humanReviewNotice: "Une vérification humaine est nécessaire si des données critiques font défaut."
  };

  // Détection des données manquantes
  const missingItems: string[] = [];
  if (!male) missingItems.push("Partenaire mâle non sélectionné");
  if (!female) missingItems.push("Partenaire femelle non sélectionnée");
  if (male && !male.bague) missingItems.push("Numéro de bague du mâle manquant");
  if (female && !female.bague) missingItems.push("Numéro de bague de la femelle manquant");
  if (male && (!male.pere_id && !male.mere_id)) missingItems.push("Ascendance du mâle non renseignée");
  if (female && (!female.pere_id && !female.mere_id)) missingItems.push("Ascendance de la femelle non renseignée");
  if (male && !(male as any).passport?.canonicalLoci?.length) missingItems.push("Génétique du mâle non renseignée (statuts Inconnu / Non testé)");
  if (female && !(female as any).passport?.canonicalLoci?.length) missingItems.push("Génétique de la femelle non renseignée (statuts Inconnu / Non testé)");

  const hasMissingData = missingItems.length > 0;

  const renderBirdCard = (bird: Canari | null, isMalePartner: boolean) => {
    if (!bird) {
      return (
        <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-850/50 text-center">
          <p className="text-xs text-slate-400 italic">
            {isMalePartner ? "Aucun mâle sélectionné" : "Aucune femelle sélectionnée"}
          </p>
        </div>
      );
    }

    const lociCount = (bird as any)?.passport?.canonicalLoci?.length || 0;
    const hasParents = Boolean(bird.pere_id || bird.mere_id);

    return (
      <div 
        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 text-xs shadow-xs"
        data-testid={isMalePartner ? "context-partner-male" : "context-partner-female"}
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-2xs ${
              isMalePartner ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
            }`}>
              {isMalePartner ? '♂' : '♀'}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {bird.nom || bird.bague || `#${bird.id}`}
            </span>
          </div>
          <AppBadge variant="outline" size="sm">
            {bird.bague || t.missingInfoBadge}
          </AppBadge>
        </div>

        <div className="space-y-1.5 text-slate-600 dark:text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-400">{t.species} :</span>
            <strong className="text-slate-700 dark:text-slate-200 capitalize">{bird.espece || bird.race || 'Non spécifiée'}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t.parents} :</span>
            <span>
              {hasParents ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Père #{bird.pere_id || '?'} / Mère #{bird.mere_id || '?'}</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 italic">{t.unknownParents}</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t.genetics} :</span>
            <span>
              {lociCount > 0 ? (
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{lociCount} locus renseigné(s)</span>
              ) : (
                <span className="text-slate-400 italic">{t.noGenetics}</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">{t.health} :</span>
            <span className="text-slate-600 dark:text-slate-400">
              {t.healthy}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid={testId}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            <span>{t.title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subtitle}
          </p>
        </div>

        {onOpenAssistant && (
          <button
            type="button"
            onClick={() => onOpenAssistant("Explique-moi les données de ce couple.")}
            className="px-2.5 py-1 text-2xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            data-testid="pair-context-ask-ai-button"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.askAi}</span>
          </button>
        )}
      </div>

      {/* Grid of Partners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <span className="block font-bold text-2xs uppercase tracking-wider text-slate-400 mb-1.5">
            {t.maleTitle}
          </span>
          {renderBirdCard(male, true)}
        </div>
        <div>
          <span className="block font-bold text-2xs uppercase tracking-wider text-slate-400 mb-1.5">
            {t.femaleTitle}
          </span>
          {renderBirdCard(female, false)}
        </div>
      </div>

      {/* Missing Data Notification Banner (Neutral, no automatic scoring) */}
      {hasMissingData && (
        <div 
          className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200 space-y-1.5"
          data-testid="pair-missing-data-banner"
        >
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t.missingDataNotice}</span>
          </div>
          <ul className="list-disc list-inside text-2xs space-y-0.5 text-amber-800/90 dark:text-amber-300/90 pl-1">
            {missingItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <p className="text-3xs text-amber-700/80 dark:text-amber-400 italic pt-0.5">
            {t.humanReviewNotice}
          </p>
        </div>
      )}

      {/* Deontological reminder: Zero scoring / Zero mating advice */}
      <div className="text-3xs text-slate-400 dark:text-slate-500 italic text-center border-t border-slate-100 dark:border-slate-800 pt-2.5">
        {t.activePairNotice}
      </div>
    </div>
  );
}

export default BreedingPairContextCard;
