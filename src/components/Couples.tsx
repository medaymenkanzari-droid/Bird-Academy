import React, { useState } from 'react';
import { Plus, Heart, HeartCrack, Check, X, ShieldAlert, History, ArrowRight, User, Info } from 'lucide-react';
import { Canari, Couple, Reproduction } from '../types';
import { calculateInbreedingCOI, getInbreedingCategory, getRelationshipLabel } from '../utils/genealogy';
import { useLanguage } from '../context/LanguageContext';
import { SpeciesBadge, AppModal, WrightConsanguinityGauge, AppAvatar } from './design-system';
import { SpeciesProfileService } from '../features/species/services/SpeciesProfileService';

interface CouplesProps {
  couples: Couple[];
  canaris: Canari[];
  reproductions: Reproduction[];
  onAddCouple: (maleId: number, femelleId: number) => boolean | string;
  onDissolveCouple: (id: number) => void;
  onStartReproduction: (coupleId: number) => void;
  quickAddOpen?: boolean;
  setQuickAddOpen?: (open: boolean) => void;
}

const LOCAL_LABELS: Record<string, Record<string, string>> = {
  fr: {
    couplesTitle: "Couples de Reproducteurs",
    couplesSub: "Formez des couples d'élevage, suivez leurs cycles et gérez la complémentarité.",
    formCoupleButton: "Former un couple",
    couplesListTitle: "Liste des couples",
    noCoupleFormed: "Aucun couple formé",
    noCoupleFormedDesc: "Cliquez sur « Former un couple » pour associer un mâle et une femelle.",
    maleLabel: "♂ Mâle",
    femaleLabel: "♀ Femelle",
    unknownMale: "Inconnu",
    unknownFemale: "Inconnue",
    reproductionsCount: "{count} reproduction{plural}",
    dissolveConfirm: "Voulez-vous dissoudre ce couple ? Cela libèrera les deux canaris pour former d'autres couples.",
    dissolveTooltip: "Dissoudre le couple",
    formCoupleTitle: "Former un Couple",
    formCoupleDesc: "Associez deux canaris non appariés de sexe opposé pour débuter des cycles de ponte.",
    selectMaleLabel: "Sélectionner le Mâle (♂)",
    selectFemaleLabel: "Sélectionner la Femelle (♀)",
    chooseMaleOption: "-- Choisir un mâle libre --",
    chooseFemaleOption: "-- Choisir une femelle libre --",
    noMaleAvailable: "⚠️ Aucun mâle disponible sans couple.",
    noFemaleAvailable: "⚠️ Aucune femelle disponible sans couple.",
    saveCoupleButton: "Enregistrer le couple",
    coupleCardTitle: "Fiche Couple #{id}",
    formedOnLabel: "Formé le :",
    cycleReadyTitle: "Cycle de ponte prêt",
    cycleReadyDesc: "Vous pouvez ouvrir une nouvelle ponte pour ce couple reproducteur.",
    newReproButton: "Nouvelle reproduction",
    historyLabel: "Historique ({count})",
    noReproHistory: "Aucun cycle de reproduction enregistré pour le moment.",
    placeholderTitle: "Détails d'un couple",
    placeholderDesc: "Sélectionnez un couple dans la liste pour voir l'historique complet de ses cycles de reproduction, ses descendants ou y associer un nid.",
    invalidSelection: "Sélection invalide.",
    complementarySexError: "Le couple doit obligatoirement être composé d'un mâle et d'une femelle.",
    alreadyCoupledError: "L'un des canaris fait déjà partie d'un couple actif.",
    selectBothError: "Veuillez sélectionner un mâle et une femelle."
  },
  en: {
    couplesTitle: "Breeding Couples",
    couplesSub: "Form breeding couples, follow their cycles and manage complementary traits.",
    formCoupleButton: "Form a couple",
    couplesListTitle: "List of couples",
    noCoupleFormed: "No couples formed yet",
    noCoupleFormedDesc: "Click on 'Form a couple' to link a male and a female.",
    maleLabel: "♂ Male",
    femaleLabel: "♀ Female",
    unknownMale: "Unknown",
    unknownFemale: "Unknown",
    reproductionsCount: "{count} breeding cycle{plural}",
    dissolveConfirm: "Do you want to dissolve this couple? This will free both canaries to form other couples.",
    dissolveTooltip: "Dissolve the couple",
    formCoupleTitle: "Form a Couple",
    formCoupleDesc: "Pair two unpaired canaries of opposite sexes to begin laying cycles.",
    selectMaleLabel: "Select Male (♂)",
    selectFemaleLabel: "Select Female (♀)",
    chooseMaleOption: "-- Choose an available male --",
    chooseFemaleOption: "-- Choose an available female --",
    noMaleAvailable: "⚠️ No available males without a couple.",
    noFemaleAvailable: "⚠️ No available females without a couple.",
    saveCoupleButton: "Record Couple",
    coupleCardTitle: "Couple File #{id}",
    formedOnLabel: "Formed on:",
    cycleReadyTitle: "Laying cycle ready",
    cycleReadyDesc: "You can start a new breeding cycle for this reproductive couple.",
    newReproButton: "New Breeding Cycle",
    historyLabel: "History ({count})",
    noReproHistory: "No breeding cycle recorded yet.",
    placeholderTitle: "Couple Details",
    placeholderDesc: "Select a couple from the list to view its complete history, descendants or pair it with a nest.",
    invalidSelection: "Invalid selection.",
    complementarySexError: "The couple must consist of one male and one female.",
    alreadyCoupledError: "One of the canaries is already part of an active couple.",
    selectBothError: "Please select a male and a female."
  },
  ar: {
    couplesTitle: "أزواج التكاثر",
    couplesSub: "شكل أزواج التكاثر، وتابع دوراتهم وأدر تكامل الصفات.",
    formCoupleButton: "تكوين زوج",
    couplesListTitle: "قائمة الأزواج",
    noCoupleFormed: "لم يتم تكوين أي زوج بعد",
    noCoupleFormedDesc: "انقر على 'تكوين زوج' لربط ذكر وأنثى.",
    maleLabel: "♂ ذكر",
    femaleLabel: "♀ أنثى",
    unknownMale: "غير معروف",
    unknownFemale: "غير معروفة",
    reproductionsCount: "{count} دورة{plural} تكاثر",
    dissolveConfirm: "هل تريد فك هذا الزوج؟ سيؤدي ذلك إلى تحرير كلا الطائرين لتكوين أزواج أخرى.",
    dissolveTooltip: "فك الزوجين",
    formCoupleTitle: "تكوين زوج تكاثر",
    formCoupleDesc: "اربط ذكرين غير متزاوجين من جنسين مختلفين لبدء دورات وضع البيض.",
    selectMaleLabel: "اختر الذكر (♂)",
    selectFemaleLabel: "اختر الأنثى (♀)",
    chooseMaleOption: "-- اختر ذكرًا متاحًا --",
    chooseFemaleOption: "-- اختر أنثى متاحة --",
    noMaleAvailable: "⚠️ لا يوجد ذكور متاحون بدون أزواج.",
    noFemaleAvailable: "⚠️ لا توجد إناث متاحة بدون أزواج.",
    saveCoupleButton: "تسجيل الزوج",
    coupleCardTitle: "بطاقة الزوج #{id}",
    formedOnLabel: "تم التكوين في:",
    cycleReadyTitle: "دورة وضع البيض جاهزة",
    cycleReadyDesc: "يمكنك بدء دورة وضع بيض جديدة لهذا الزوج التكاثري.",
    newReproButton: "تكاثر جديد",
    historyLabel: "السجل التاريخي ({count})",
    noReproHistory: "لا توجد دورات تكاثر مسجلة بعد.",
    placeholderTitle: "تفاصيل الزوج",
    placeholderDesc: "اختر زوجًا من القائمة لعرض سجل دورات التكاثر بالكامل، أو سلالتهم، أو ربط عش بهم.",
    invalidSelection: "اختيار غير صالح.",
    complementarySexError: "يجب أن يتكون الزوج من ذكر وأنثى.",
    alreadyCoupledError: "أحد الكناريين موجود بالفعل في زوج نشط.",
    selectBothError: "يرجى تحديد ذكر وأنثى."
  },
  es: {
    couplesTitle: "Parejas de Cría",
    couplesSub: "Forme parejas de cría, siga sus ciclos y gestione la complementariedad.",
    formCoupleButton: "Formar una pareja",
    couplesListTitle: "Lista de parejas",
    noCoupleFormed: "Ninguna pareja formada",
    noCoupleFormedDesc: "Haga clic en «Formar una pareja» para asociar un macho y una hembra.",
    maleLabel: "♂ Macho",
    femaleLabel: "♀ Hembra",
    unknownMale: "Desconocido",
    unknownFemale: "Desconocida",
    reproductionsCount: "{count} reproducción{plural}",
    dissolveConfirm: "¿Desea disolver esta pareja? Esto liberará a ambos canarios para formar otras parejas.",
    dissolveTooltip: "Disolver la pareja",
    formCoupleTitle: "Formar una Pareja",
    formCoupleDesc: "Asocie dos canarios no emparejados de sexo opuesto para comenzar ciclos de puesta.",
    selectMaleLabel: "Seleccionar el Macho (♂)",
    selectFemaleLabel: "Seleccionar la Hembra (♀)",
    chooseMaleOption: "-- Elegir un macho libre --",
    chooseFemaleOption: "-- Elegir una hembra libre --",
    noMaleAvailable: "⚠️ Ningún macho disponible sin pareja.",
    noFemaleAvailable: "⚠️ Ninguna hembra disponible sin pareja.",
    saveCoupleButton: "Registrar la pareja",
    coupleCardTitle: "Ficha Pareja #{id}",
    formedOnLabel: "Formada el:",
    cycleReadyTitle: "Ciclo de puesta listo",
    cycleReadyDesc: "Puede abrir una nueva puesta para esta pareja reproductora.",
    newReproButton: "Nueva reproducción",
    historyLabel: "Historial ({count})",
    noReproHistory: "Ningún ciclo de reproducción registrado de momento.",
    placeholderTitle: "Detalles de una pareja",
    placeholderDesc: "Seleccione una pareja en la lista para ver el historial completo de sus ciclos de reproducción, sus descendientes o asociar un nido.",
    invalidSelection: "Selección inválida.",
    complementarySexError: "La pareja debe consistir obligatoriamente en un macho y una hembra.",
    alreadyCoupledError: "Uno de los canarios ya forma parte de una pareja activa.",
    selectBothError: "Por favor seleccione un macho y una hembra."
  },
  it: {
    couplesTitle: "Coppie di Riproduttori",
    couplesSub: "Forma coppie di riproduzione, segui i loro cicli e gestisci la complementarità.",
    formCoupleButton: "Formare una coppia",
    couplesListTitle: "Elenco delle coppie",
    noCoupleFormed: "Nessuna coppia formata",
    noCoupleFormedDesc: "Clicca su «Formare una coppia» per associare un maschio e una femmina.",
    maleLabel: "♂ Maschio",
    femaleLabel: "♀ Femmina",
    unknownMale: "Sconosciuto",
    unknownFemale: "Sconosciuta",
    reproductionsCount: "{count} riproduzione{plural}",
    dissolveConfirm: "Vuoi sciogliere questa coppia? Questo libererà entrambi i canarini per formarne altre.",
    dissolveTooltip: "Sciogliere la coppia",
    formCoupleTitle: "Formare una Coppia",
    formCoupleDesc: "Associa due canarini non accoppiati di sesso opposto per iniziare i cicli di deposizione.",
    selectMaleLabel: "Selezionare il Maschio (♂)",
    selectFemaleLabel: "Selezionare la Femmina (♀)",
    chooseMaleOption: "-- Scegliere un maschio libero --",
    chooseFemaleOption: "-- Scegliere una femmina libera --",
    noMaleAvailable: "⚠️ Nessun maschio disponibile senza coppia.",
    noFemaleAvailable: "⚠️ Nessuna femmina disponibile senza coppia.",
    saveCoupleButton: "Registra la coppia",
    coupleCardTitle: "Scheda Coppia #{id}",
    formedOnLabel: "Formata il:",
    cycleReadyTitle: "Ciclo di deposizione pronto",
    cycleReadyDesc: "Puoi aprire una nuova riproduzione per questa coppia riproduttiva.",
    newReproButton: "Nuova riproduzione",
    historyLabel: "Cronologia ({count})",
    noReproHistory: "Nessun ciclo di riproduzione registrato per il momento.",
    placeholderTitle: "Dettagli di una coppia",
    placeholderDesc: "Seleziona una coppia nell'elenco per vedere la cronologia completa dei suoi cicli, i discendenti o associare un nido.",
    invalidSelection: "Selezione non valida.",
    complementarySexError: "La coppia deve essere composta obbligatoriamente da un maschio e una femmina.",
    alreadyCoupledError: "Uno dei canarini fa già parte di una coppia attiva.",
    selectBothError: "Seleziona un maschio e una femmina."
  }
};

export default function Couples({
  couples,
  canaris,
  reproductions,
  onAddCouple,
  onDissolveCouple,
  onStartReproduction,
  quickAddOpen = false,
  setQuickAddOpen
}: CouplesProps) {
  const { t, currentLanguage } = useLanguage();

  const labels = LOCAL_LABELS[currentLanguage] || LOCAL_LABELS.fr;

  const getTranslatedRiskLevel = (level: string) => {
    switch (level) {
      case 'Aucun': return t('riskNone');
      case 'Faible': return t('riskLow');
      case 'Modéré': return t('riskMedium');
      case 'Élevé': return t('riskHigh');
      case 'Très élevé': return t('riskVeryHigh');
      default: return level;
    }
  };

  const getTranslatedRecommendation = (rec: string) => {
    switch (rec) {
      case 'Recommandé': return t('recRecommended');
      case 'Acceptable': return t('recAcceptable');
      case 'Prudence': return t('recPrudence');
      case 'Déconseillé': return t('recNotRecommended');
      case 'À éviter': return t('recAvoid');
      default: return rec;
    }
  };

  const [isFormOpen, setIsFormOpen] = useState(quickAddOpen);
  const [selectedMaleId, setSelectedMaleId] = useState<string>('');
  const [selectedFemelleId, setSelectedFemelleId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCoupleId, setSelectedCoupleId] = useState<number | null>(() => {
    return (couples && couples.length > 0) ? couples[0].id : null;
  });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [showScaleInfo, setShowScaleInfo] = useState(false);

  // Sync quickAddOpen from Dashboard
  React.useEffect(() => {
    if (quickAddOpen) {
      setIsFormOpen(true);
      if (setQuickAddOpen) setQuickAddOpen(false);
    }
  }, [quickAddOpen]);

  const safeCanaris = Array.isArray(canaris) ? canaris : [];
  const safeCouples = Array.isArray(couples) ? couples : [];
  const safeReproductions = Array.isArray(reproductions) ? reproductions : [];

  // Determine available males and females for new couples
  const activeCoupledBirdIds = safeCouples
    .filter(c => c && c.statut === 'Actif')
    .flatMap(c => [c.male_id, c.femelle_id]);

  const availableMales = safeCanaris.filter(bird => 
    bird && bird.sexe === 'Mâle' && !activeCoupledBirdIds.includes(bird.id) &&
    (!bird.espece || SpeciesProfileService.isSpeciesActive(bird.espece))
  );

  const availableFemales = safeCanaris.filter(bird => 
    bird && bird.sexe === 'Femelle' && !activeCoupledBirdIds.includes(bird.id) &&
    (!bird.espece || SpeciesProfileService.isSpeciesActive(bird.espece))
  );

  // Filter visible couples to only include pairs belonging to active species
  const visibleCouples = safeCouples.filter(c => {
    const male = safeCanaris.find(b => b.id === c.male_id);
    const femelle = safeCanaris.find(b => b.id === c.femelle_id);
    const maleActive = !male?.espece || SpeciesProfileService.isSpeciesActive(male.espece);
    const femaleActive = !femelle?.espece || SpeciesProfileService.isSpeciesActive(femelle.espece);
    return maleActive && femaleActive;
  });

  // Consanguinity calculation variables
  const showCOI = isFormOpen && Boolean(selectedMaleId) && Boolean(selectedFemelleId);
  const maleIdNum = Number(selectedMaleId);
  const femaleIdNum = Number(selectedFemelleId);
  const coi = (showCOI && !isNaN(maleIdNum) && !isNaN(femaleIdNum) && maleIdNum > 0 && femaleIdNum > 0)
    ? calculateInbreedingCOI(maleIdNum, femaleIdNum, safeCanaris)
    : 0;
  const coiCategory = getInbreedingCategory(coi);
  const relationship = (showCOI && !isNaN(maleIdNum) && !isNaN(femaleIdNum) && maleIdNum > 0 && femaleIdNum > 0)
    ? getRelationshipLabel(maleIdNum, femaleIdNum, safeCanaris, t)
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedMaleId || !selectedFemelleId) {
      setErrorMsg(labels.selectBothError);
      return;
    }

    const maleIdNum = Number(selectedMaleId);
    const femelleIdNum = Number(selectedFemelleId);

    // Business Rules Verification
    const maleBird = canaris.find(c => c.id === maleIdNum);
    const femelleBird = canaris.find(c => c.id === femelleIdNum);

    if (!maleBird || !femelleBird) {
      setErrorMsg(labels.invalidSelection);
      return;
    }

    // Complementary sex check (Rule 2)
    if (maleBird.sexe !== 'Mâle' || femelleBird.sexe !== 'Femelle') {
      setErrorMsg(labels.complementarySexError);
      return;
    }

    // Active couple check (Rule 3)
    const maleAlreadyCoupled = couples.some(c => c.statut === 'Actif' && c.male_id === maleIdNum);
    const femaleAlreadyCoupled = couples.some(c => c.statut === 'Actif' && c.femelle_id === femelleIdNum);

    if (maleAlreadyCoupled || femaleAlreadyCoupled) {
      setErrorMsg(labels.alreadyCoupledError);
      return;
    }

    // Call state modifier
    const result = onAddCouple(maleIdNum, femelleIdNum);
    if (typeof result === 'string') {
      setErrorMsg(result);
    } else {
      setIsFormOpen(false);
      setSelectedMaleId('');
      setSelectedFemelleId('');
    }
  };

  // Select a couple to inspect details/history (fall back to first visible couple if none selected)
  const activeSelectedId = selectedCoupleId !== null ? selectedCoupleId : (visibleCouples[0]?.id || null);
  const selectedCouple = couples.find(c => c.id === activeSelectedId);

  const selectedCoupleCOI = selectedCouple
    ? calculateInbreedingCOI(selectedCouple.male_id, selectedCouple.femelle_id, canaris)
    : 0;
  const selectedCoupleCOICat = getInbreedingCategory(selectedCoupleCOI);
  const selectedCoupleRelation = selectedCouple
    ? getRelationshipLabel(selectedCouple.male_id, selectedCouple.femelle_id, canaris, t)
    : '';
  
  const coupleReproductions = selectedCoupleId
    ? reproductions.filter(r => r.couple_id === selectedCoupleId)
    : [];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{labels.couplesTitle}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{labels.couplesSub}</p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer shadow-sm w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> {labels.formCoupleButton}
        </button>
      </div>

      {/* FORM MODAL - Opens at the top immediately on mobile */}
      <AppModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-50" />
            <span>{labels.formCoupleTitle}</span>
          </div>
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200 flex items-start gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed">
            {labels.formCoupleDesc}
          </p>

          {/* Select Male */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{labels.selectMaleLabel}</label>
            <select
              required
              value={selectedMaleId}
              onChange={(e) => setSelectedMaleId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="">{labels.chooseMaleOption}</option>
              {availableMales.map(m => (
                <option key={m.id} value={m.id}>{m.nom} ({m.bague} - {m.couleur})</option>
              ))}
            </select>
            {availableMales.length === 0 && (
              <span className="text-[10px] text-amber-600 font-semibold mt-1 block">{labels.noMaleAvailable}</span>
            )}
          </div>

          {/* Select Female */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{labels.selectFemaleLabel}</label>
            <select
              required
              value={selectedFemelleId}
              onChange={(e) => setSelectedFemelleId(e.target.value)}
              className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            >
              <option value="">{labels.chooseFemaleOption}</option>
              {availableFemales.map(f => (
                <option key={f.id} value={f.id}>{f.nom} ({f.bague} - {f.couleur})</option>
              ))}
            </select>
            {availableFemales.length === 0 && (
              <span className="text-[10px] text-amber-600 font-semibold mt-1 block">{labels.noFemaleAvailable}</span>
            )}
          </div>

          {selectedMaleId && selectedFemelleId && (
            <div className="space-y-3">
              <WrightConsanguinityGauge
                coefficient={coi}
                title="Consanguinité Estimée (Wright)"
                subtitle={relationship ? `Lien de parenté : ${relationship}` : undefined}
                size="sm"
                variant="card"
              />

              <div className={`p-4 rounded-xl border ${coiCategory.bgClass} ${coiCategory.borderClass} space-y-3`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    🧬 {t('coiTitle')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${coiCategory.badgeClass}`}>
                    {getTranslatedRiskLevel(coiCategory.level)} ({coi.toFixed(2)} %)
                  </span>
                </div>

                {coi > 0 ? (
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <p>
                      ⚠️ {t('coiWarning')
                        .replace('{relationship}', relationship)
                        .replace('{coi}', coi.toFixed(2))
                        .replace('{recommendation}', getTranslatedRecommendation(coiCategory.recommendation))
                      }
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <p>
                      🟢 {t('coiSuccess')}
                    </p>
                  </div>
                )}

                {/* Quick Scale Guide */}
                <div className="pt-2 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setShowScaleInfo(!showScaleInfo)}
                    className="text-[10px] text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1"
                  >
                    <Info className="w-3.5 h-3.5" /> {t('coiScaleTitle')}
                  </button>
                  {showScaleInfo && (
                    <div className="mt-2 bg-white/80 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-[10px] space-y-1.5">
                      <div className="grid grid-cols-3 font-bold text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-1">
                        <span>{t('coiLabel')}</span>
                        <span>{t('relationshipLabel')}</span>
                        <span>{t('category') === 'Category' ? 'Recommendation' : t('category') === 'الفئة' ? 'توصية' : t('category') === 'Categoría' ? 'Recomendación' : t('category') === 'Categoria' ? 'Raccomandazione' : 'Recommandation'}</span>
                      </div>
                      <div className="grid grid-cols-3 text-emerald-700 dark:text-emerald-400 font-medium">
                        <span>0 %</span>
                        <span>{t('riskNone')}</span>
                        <span>{t('recRecommended')}</span>
                      </div>
                      <div className="grid grid-cols-3 text-green-700 dark:text-green-400 font-medium">
                        <span>&gt; 0 - 6,25 %</span>
                        <span>{t('riskLow')}</span>
                        <span>{t('recAcceptable')}</span>
                      </div>
                      <div className="grid grid-cols-3 text-amber-700 dark:text-amber-400 font-medium">
                        <span>6,25 - 12,5 %</span>
                        <span>{t('riskMedium')}</span>
                        <span>{t('recPrudence')}</span>
                      </div>
                      <div className="grid grid-cols-3 text-orange-700 dark:text-orange-400 font-medium">
                        <span>12,5 - 25 %</span>
                        <span>{t('riskHigh')}</span>
                        <span>{t('recNotRecommended')}</span>
                      </div>
                      <div className="grid grid-cols-3 text-red-700 dark:text-red-400 font-bold">
                        <span>&gt; 25 %</span>
                        <span>{t('riskVeryHigh')}</span>
                        <span>{t('recAvoid')}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedMaleId || !selectedFemelleId}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm mt-2 font-sans"
          >
            <Check className="w-4.5 h-4.5" /> {labels.saveCoupleButton}
          </button>
        </form>
      </AppModal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left columns: Active Couples List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">{labels.couplesListTitle}</h3>
            
            {visibleCouples.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-150 dark:border-slate-800 rounded-xl">
                <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">{labels.noCoupleFormed}</p>
                <p className="text-xs mt-1">{labels.noCoupleFormedDesc}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleCouples.map((c) => {
                  const male = canaris.find(b => b.id === c.male_id);
                  const femelle = canaris.find(b => b.id === c.femelle_id);
                  const isSelected = selectedCoupleId === c.id;
                  const repCount = reproductions.filter(r => r.couple_id === c.id).length;

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCoupleId(c.id);
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          setIsDetailsModalOpen(true);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 shadow-xs' 
                          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Couple Birds Representation - Mobile Stack & Wrap */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto min-w-0 overflow-hidden flex-1">
                        {/* Male Card Mini */}
                        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-lg p-2.5 flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded shrink-0">{labels.maleLabel}</span>
                          <div className="text-xs min-w-0 overflow-hidden flex-1">
                            <div className="flex items-center gap-1.5"><div className="font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">{male ? male.nom : labels.unknownMale}</div>{male && <SpeciesBadge speciesId={male.espece} size="sm" showLabel={false} />}</div>
                            <div className="font-mono text-[9px] text-slate-400 truncate">{male ? male.bague : "—"}</div>
                          </div>
                        </div>

                        {/* Heart Link icon */}
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 self-center ${c.statut === 'Actif' ? 'text-rose-500 fill-rose-50' : 'text-slate-300'}`} />

                        {/* Female Card Mini */}
                        <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 rounded-lg p-2.5 flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 rounded shrink-0">{labels.femaleLabel}</span>
                          <div className="text-xs min-w-0 overflow-hidden flex-1">
                            <div className="flex items-center gap-1.5"><div className="font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">{femelle ? femelle.nom : labels.unknownFemale}</div>{femelle && <SpeciesBadge speciesId={femelle.espece} size="sm" showLabel={false} />}</div>
                            <div className="font-mono text-[9px] text-slate-400 truncate">{femelle ? femelle.bague : "—"}</div>
                          </div>
                        </div>
                      </div>

                      {/* Right Meta Info & Quick Actions */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-0 border-slate-50 dark:border-slate-800 shrink-0">
                        <div className="text-left sm:text-right text-xs">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            c.statut === 'Actif' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {c.statut === 'Actif' ? (currentLanguage === 'ar' ? 'نشط' : currentLanguage === 'en' ? 'Active' : currentLanguage === 'es' ? 'Activo' : currentLanguage === 'it' ? 'Attivo' : 'Actif') : c.statut}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                            {labels.reproductionsCount
                              .replace('{count}', repCount.toString())
                              .replace('{plural}', repCount > 1 ? 's' : '')}
                          </div>
                        </div>

                        {c.statut === 'Actif' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(labels.dissolveConfirm)) {
                                onDissolveCouple(c.id);
                                if (selectedCoupleId === c.id) setSelectedCoupleId(null);
                              }
                            }}
                            className="p-2 hover:bg-rose-100 hover:text-rose-600 text-slate-400 rounded-lg transition-colors cursor-pointer"
                            title={labels.dissolveTooltip}
                          >
                            <HeartCrack className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: DETAILS PANEL */}
        <div className="hidden lg:block">
          {selectedCouple ? (
            /* COUPLE DETAILS & REPRODUCTION HISTORY */
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{labels.coupleCardTitle.replace('{id}', selectedCouple.id.toString())}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedCouple.statut === 'Actif' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {selectedCouple.statut === 'Actif' ? (currentLanguage === 'ar' ? 'نشط' : currentLanguage === 'en' ? 'Active' : currentLanguage === 'es' ? 'Activo' : currentLanguage === 'it' ? 'Attivo' : 'Actif') : selectedCouple.statut}
                </span>
              </div>

              {/* Active Couple Header info */}
              <div className="space-y-3 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex justify-between items-center">
                  <span className="text-slate-500">{labels.formedOnLabel}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {new Date(selectedCouple.date_creation).toLocaleDateString(currentLanguage)}
                  </span>
                </div>

                <WrightConsanguinityGauge
                  coefficient={selectedCoupleCOI}
                  title="Consanguinité de la Lignée"
                  size="sm"
                  variant="bar"
                />
                
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex justify-between items-center">
                  <span className="text-slate-500">{t('coiLabel')} :</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${selectedCoupleCOICat.badgeClass}`}>
                    {selectedCoupleCOI.toFixed(2)} % ({getTranslatedRiskLevel(selectedCoupleCOICat.level)})
                  </span>
                </div>
                
                {selectedCoupleCOI > 0 && (
                  <div className={`p-2.5 rounded-xl border text-[10px] leading-tight ${selectedCoupleCOICat.bgClass} ${selectedCoupleCOICat.borderClass} ${selectedCoupleCOICat.textClass}`}>
                    🧬 <span className="font-bold">{t('relationshipLabel')} ({selectedCoupleRelation}) :</span> {getTranslatedRecommendation(selectedCoupleCOICat.recommendation)}
                  </div>
                )}
              </div>

              {/* Nest Management Shortcut */}
              {selectedCouple.statut === 'Actif' && (
                <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/40 text-xs">
                  <p className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {labels.cycleReadyTitle}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">{labels.cycleReadyDesc}</p>
                  
                  <button
                    type="button"
                    onClick={() => onStartReproduction(selectedCouple.id)}
                    className="mt-3 w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 font-sans"
                  >
                    <Plus className="w-3.5 h-3.5" /> {labels.newReproButton}
                  </button>
                </div>
              )}

              {/* Reproduction History for this couple */}
              <div className="pt-3 border-t border-slate-50 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <History className="w-4 h-4 text-slate-400" /> {labels.historyLabel.replace('{count}', coupleReproductions.length.toString())}
                </h4>

                {coupleReproductions.length === 0 ? (
                  <p className="text-xs italic text-slate-400 py-4 text-center">
                    {labels.noReproHistory}
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {coupleReproductions.map((r) => (
                      <div key={r.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">Reproduction #{r.id}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{t('openedOn', { date: r.date_debut })}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          r.statut === 'En cours' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {r.statut === 'En cours' ? t('pendingLabel') : t('doneLabel')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* PLACEHOLDER NOT SELECTED */
            <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 flex flex-col justify-center items-center h-full min-h-[300px]">
              <Heart className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">{labels.placeholderTitle}</p>
              <p className="text-xs mt-1">{labels.placeholderDesc}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile & Responsive Modal for Couple Details */}
      {selectedCouple && (
        <AppModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={labels.coupleCardTitle.replace('{id}', selectedCouple.id.toString())}
          size="md"
        >
          <div className="space-y-4 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                selectedCouple.statut === 'Actif' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {selectedCouple.statut === 'Actif' ? (currentLanguage === 'ar' ? 'نشط' : currentLanguage === 'en' ? 'Active' : currentLanguage === 'es' ? 'Activo' : currentLanguage === 'it' ? 'Attivo' : 'Actif') : selectedCouple.statut}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {labels.formedOnLabel} {new Date(selectedCouple.date_creation).toLocaleDateString(currentLanguage)}
              </span>
            </div>

            {/* Male & Female Birds identity breakdown */}
            {(() => {
              const m = canaris.find(b => b.id === selectedCouple.male_id);
              const f = canaris.find(b => b.id === selectedCouple.femelle_id);
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{labels.maleLabel}</span>
                      {m && <SpeciesBadge speciesId={m.espece} size="sm" showLabel={false} />}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{m ? m.nom : labels.unknownMale}</div>
                    <div className="font-mono text-[10px] text-slate-500">Bague: {m ? m.bague : "—"}</div>
                    {m && <div className="text-[10px] text-slate-400">{m.race} • {m.couleur}</div>}
                  </div>

                  <div className="p-3 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">{labels.femaleLabel}</span>
                      {f && <SpeciesBadge speciesId={f.espece} size="sm" showLabel={false} />}
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{f ? f.nom : labels.unknownFemale}</div>
                    <div className="font-mono text-[10px] text-slate-500">Bague: {f ? f.bague : "—"}</div>
                    {f && <div className="text-[10px] text-slate-400">{f.race} • {f.couleur}</div>}
                  </div>
                </div>
              );
            })()}

            {/* Inbreeding COI report */}
            <WrightConsanguinityGauge
              coefficient={selectedCoupleCOI}
              title="Consanguinité de la Lignée"
              size="sm"
              variant="card"
            />

            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2 text-xs border border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-semibold">{t('coiLabel')} :</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${selectedCoupleCOICat.badgeClass}`}>
                  {selectedCoupleCOI.toFixed(2)} % ({getTranslatedRiskLevel(selectedCoupleCOICat.level)})
                </span>
              </div>
              {selectedCoupleCOI > 0 && (
                <div className={`p-2 rounded-lg border text-[10px] ${selectedCoupleCOICat.bgClass} ${selectedCoupleCOICat.borderClass} ${selectedCoupleCOICat.textClass}`}>
                  🧬 <span className="font-bold">{t('relationshipLabel')} ({selectedCoupleRelation}) :</span> {getTranslatedRecommendation(selectedCoupleCOICat.recommendation)}
                </div>
              )}
            </div>

            {/* Quick Action for starting a new reproduction */}
            {selectedCouple.statut === 'Actif' && (
              <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/40 text-xs space-y-2">
                <p className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {labels.cycleReadyTitle}
                </p>
                <p className="text-slate-600 dark:text-slate-400">{labels.cycleReadyDesc}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    onStartReproduction(selectedCouple.id);
                  }}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 font-sans shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> {labels.newReproButton}
                </button>
              </div>
            )}

            {/* Reproduction history */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <History className="w-4 h-4 text-slate-400" /> {labels.historyLabel.replace('{count}', coupleReproductions.length.toString())}
              </h4>
              {coupleReproductions.length === 0 ? (
                <p className="text-xs italic text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">{labels.noReproHistory}</p>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {coupleReproductions.map((r) => (
                    <div key={r.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-700 dark:text-slate-200">Reproduction #{r.id}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{t('openedOn', { date: r.date_debut })}</span>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        r.statut === 'En cours' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {r.statut === 'En cours' ? t('pendingLabel') : t('doneLabel')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AppModal>
      )}
    </div>
  );
}

