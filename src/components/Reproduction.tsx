/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Egg, Plus, Check, Play, Square, AlertCircle, Info, Calendar, Sparkles, CheckCircle, ArrowRight, X, Trash2, History } from 'lucide-react';
import { Couple, Canari, Reproduction, Ponte, Jeune } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { SpeciesBadge, AppModal, WrightConsanguinityGauge, AppAvatar, EggMatrixCard, IncubationTimeline, BandingBatchModal } from './design-system';
import { NestTrackingView } from '../features/breeding/components/NestTrackingView';
import { calculateInbreedingCOI } from '../utils/genealogy';
import { SpeciesProfileService } from '../features/species/services/SpeciesProfileService';

interface ReproductionProps {
  reproductions: Reproduction[];
  couples: Couple[];
  canaris: Canari[];
  pontes: Ponte[];
  jeunes: Jeune[];
  onAddPonte: (reproductionId: number, date: string, oeufs: number) => void;
  onUpdatePonteStats: (ponteId: number, fecondes: number, eclosions: number, sevrages: number) => void;
  onCloseReproduction: (id: number) => void;
  onAddJeune: (ponteId: number, bague: string, dateNaissance: string) => void;
  onWeanJeuneToCanari: (jeuneId: number, nom: string, cageId: number, race: string, couleur: string) => void;
  cagesList: Array<{ id: number, nom: string }>;
}

const LOCAL_LABELS: Record<string, Record<string, string>> = {
  fr: {
    race: "Race",
    couleur: "Couleur",
    bague: "Bague",
    nom: "Nom",
    weanSuccess: "Le jeune a été sevré avec succès et ajouté à votre effectif !",
    closeCycleConfirm: "Êtes-vous sûr de vouloir clôturer ce cycle de reproduction ? Cette action est définitive.",
    reproDashboardTitle: "Gestion de la Reproduction",
    reproDashboardSubtitle: "Supervisez vos cycles d'élevage, pontes, mirages, éclosions et sevrages en temps réel.",
    activeCyclesTitle: "Cycles Actifs",
    newCycleButton: "Nouveau Cycle",
    cycleDetailsTitle: "Détails du Cycle",
    selectCyclePrompt: "Sélectionnez un cycle de reproduction dans la liste de gauche pour afficher ses détails, pontes et jeunes.",
    noActiveCycles: "Aucun cycle actif actuellement",
    startReproInCouples: "Démarrez un cycle depuis l'onglet 'Couples'",
    closedCyclesHistory: "Historique des cycles clôturés",
    closeCycle: "Clôturer le cycle",
    coupleLabel: "Couple :",
    startDateLabel: "Date de début :",
    statusLabel: "Statut :",
    inbreedingRate: "Taux de consanguinité :",
    inbreedingWarning: "Attention : Risque élevé de dépression de consanguinité",
    pontesAndChicksTitle: "Pontes & Éclosions",
    declarePonteButton: "Déclarer une ponte",
    chicksWeaned: "Jeunes / Poussins à sevrer",
    bandingBatchButton: "Baguage groupé",
    declareHatchingButton: "Déclarer l'éclosion",
    weanButton: "Sevrer l'oiseau",
    eggSummary: "{eggs} œuf(s) • {fertile} fécondé(s) • {hatched} éclos",
    chickBirthLabel: "Né le {date}",
    chickBandLabel: "Bague : {band}",
    chickNoBand: "Non bagué",
    chickStatusPending: "En nid",
    chickStatusWeaned: "Sevré",
    declarePonteModalTitle: "Déclaration d'une nouvelle ponte",
    ponteDateLabel: "Date de la ponte (1er œuf) *",
    oeufsCountLabel: "Nombre d'œufs pondus *",
    cancelButton: "Annuler",
    savePonteButton: "Enregistrer la ponte",
    declareHatchModalTitle: "Déclaration des éclosions",
    fertileEggsLabel: "Œufs fécondés (mirage réussi) *",
    hatchedEggsLabel: "Poussins éclos *",
    saveHatchButton: "Valider l'éclosion",
    weanModalTitle: "Sevrage & Intégration à l'Effectif",
    weanInstructions: "Ce jeune oiseau va être ajouté à votre liste d'oiseaux principale.",
    birdNameLabel: "Nom de l'oiseau *",
    cageLabel: "Cage d'attribution *",
    saveWeanButton: "Confirmer le sevrage"
  },
  en: {
    race: "Breed",
    couleur: "Color",
    bague: "Ring",
    nom: "Name",
    weanSuccess: "The chick has been successfully weaned and added to your flock!",
    closeCycleConfirm: "Are you sure you want to close this breeding cycle? This action is permanent.",
    reproDashboardTitle: "Breeding Management",
    reproDashboardSubtitle: "Supervise your breeding cycles, clutches, candling, hatchings, and weaning in real-time.",
    activeCyclesTitle: "Active Cycles",
    newCycleButton: "New Cycle",
    cycleDetailsTitle: "Cycle Details",
    selectCyclePrompt: "Select a breeding cycle from the left list to display its details, clutches, and chicks.",
    noActiveCycles: "No active cycles currently",
    startReproInCouples: "Start a cycle from the 'Couples' tab",
    closedCyclesHistory: "Closed cycles history",
    closeCycle: "Close cycle",
    coupleLabel: "Pair:",
    startDateLabel: "Start date:",
    statusLabel: "Status:",
    inbreedingRate: "Inbreeding coefficient:",
    inbreedingWarning: "Warning: High risk of inbreeding depression",
    pontesAndChicksTitle: "Clutches & Hatches",
    declarePonteButton: "Record a clutch",
    chicksWeaned: "Chicks to wean",
    bandingBatchButton: "Batch banding",
    declareHatchingButton: "Declare hatching",
    weanButton: "Wean bird",
    eggSummary: "{eggs} egg(s) • {fertile} fertile • {hatched} hatched",
    chickBirthLabel: "Born on {date}",
    chickBandLabel: "Ring: {band}",
    chickNoBand: "Unringed",
    chickStatusPending: "In nest",
    chickStatusWeaned: "Weaned",
    declarePonteModalTitle: "Declare a new clutch",
    ponteDateLabel: "Laying date (1st egg) *",
    oeufsCountLabel: "Number of eggs laid *",
    cancelButton: "Cancel",
    savePonteButton: "Save clutch",
    declareHatchModalTitle: "Hatching declaration",
    fertileEggsLabel: "Fertile eggs (candling successful) *",
    hatchedEggsLabel: "Hatched chicks *",
    saveHatchButton: "Validate hatching",
    weanModalTitle: "Weaning & Flock Integration",
    weanInstructions: "This young bird will be added to your main bird registry.",
    birdNameLabel: "Bird name *",
    cageLabel: "Assigned cage *",
    saveWeanButton: "Confirm weaning",
    targetCage: "Destination cage"
  },
  ar: {
    race: "السلالة",
    couleur: "اللون",
    bague: "الحلقة",
    nom: "الاسم",
    weanSuccess: "تم فطام الفرخ بنجاح وإضافته إلى قائمة طيورك!",
    closeCycleConfirm: "هل أنت متأكد من رغبتك في إنهاء دورة التكاثر هذه؟ هذا الإجراء نهائي.",
    reproDashboardTitle: "إدارة التكاثر",
    reproDashboardSubtitle: "راقب دورات الإنتاج، وضع البيض، الفحص الضوئي، الفقس والفطام لحظيًا.",
    activeCyclesTitle: "الدورات النشطة",
    newCycleButton: "دورة جديدة",
    cycleDetailsTitle: "تفاصيل الدورة",
    selectCyclePrompt: "اختر دورة تكاثر من القائمة لعرض تفاصيلها وحضناتها وفراخها.",
    noActiveCycles: "لا توجد دورات نشطة حالياً",
    startReproInCouples: "ابدأ دورة من علامة تبويب 'الأزواج'",
    closedCyclesHistory: "سجل الدورات المنتهية",
    closeCycle: "إنهاء الدورة",
    coupleLabel: "الزوج :",
    startDateLabel: "تاريخ البدء :",
    statusLabel: "الحالة :",
    inbreedingRate: "معامل القرابة :",
    inbreedingWarning: "تحذير: خطر مرتفع لتدهور النسل بسبب القرابة",
    pontesAndChicksTitle: "الحضنات والفقس",
    declarePonteButton: "تسجيل وضع بيض",
    chicksWeaned: "فراخ تنتظر الفطام",
    bandingBatchButton: "تحجيل جماعي",
    declareHatchingButton: "تسجيل الفقس",
    weanButton: "فطام الطائر",
    eggSummary: "{eggs} بيض • {fertile} مخصب • {hatched} فقس",
    chickBirthLabel: "ولد في {date}",
    chickBandLabel: "حلقة : {band}",
    chickNoBand: "بدون حلقة",
    chickStatusPending: "في العش",
    chickStatusWeaned: "مفطوم",
    declarePonteModalTitle: "تسجيل وضع بيض جديد",
    ponteDateLabel: "تاريخ وضع البيض (البيضة الأولى) *",
    oeufsCountLabel: "عدد البيض الموضوع *",
    cancelButton: "إلغاء",
    savePonteButton: "حفظ وضع البيض",
    declareHatchModalTitle: "تسجيل المواليد والفقس",
    fertileEggsLabel: "البيض المخصب (نجاح الفحص الضوئي) *",
    hatchedEggsLabel: "الفراخ الفاقسة *",
    saveHatchButton: "تأكيد الفقس",
    weanModalTitle: "الفطام والإدراج في القطيع",
    weanInstructions: "سيتم إضافة هذا الفرخ إلى قائمة الطيور الرئيسية الخاصة بك.",
    birdNameLabel: "اسم الطائر *",
    cageLabel: "قفص التخصيص *",
    saveWeanButton: "تأكيد الفطام",
    targetCage: "قفص الوجهة"
  },
  es: {
    race: "Raza",
    couleur: "Color",
    bague: "Anilla",
    nom: "Nombre",
    weanSuccess: "¡El pichón se ha destetado con éxito y se ha añadido a su plantel!",
    closeCycleConfirm: "¿Está seguro de querer cerrar este ciclo de reproducción? Esta acción es definitiva.",
    reproDashboardTitle: "Gestión de la Reproducción",
    reproDashboardSubtitle: "Supervise sus ciclos de cría, puestas, mirajes, eclosiones y destetes en tiempo real.",
    activeCyclesTitle: "Ciclos Activos",
    newCycleButton: "Nuevo Ciclo",
    cycleDetailsTitle: "Detalles del Ciclo",
    selectCyclePrompt: "Seleccione un ciclo de reproducción de la lista izquierda para ver sus detalles, puestas y pichones.",
    noActiveCycles: "Ningún ciclo activo actualmente",
    startReproInCouples: "Inicie un ciclo desde la pestaña 'Parejas'",
    closedCyclesHistory: "Historial de ciclos cerrados",
    closeCycle: "Cerrar ciclo",
    coupleLabel: "Pareja:",
    startDateLabel: "Fecha de inicio:",
    statusLabel: "Estado:",
    inbreedingRate: "Coeficiente de consanguinidad:",
    inbreedingWarning: "Atención: Alto riesgo de depresión por consanguinidad",
    pontesAndChicksTitle: "Puestas y Eclosiones",
    declarePonteButton: "Registrar una puesta",
    chicksWeaned: "Pichones por destetar",
    bandingBatchButton: "Anillado por lote",
    declareHatchingButton: "Declarar eclosión",
    weanButton: "Destetar ave",
    eggSummary: "{eggs} huevo(s) • {fertile} fértil(es) • {hatched} eclosionado(s)",
    chickBirthLabel: "Nacido el {date}",
    chickBandLabel: "Anilla: {band}",
    chickNoBand: "Sin anilla",
    chickStatusPending: "En nido",
    chickStatusWeaned: "Destetado",
    declarePonteModalTitle: "Declaración de una nueva puesta",
    ponteDateLabel: "Fecha de puesta (1.er huevo) *",
    oeufsCountLabel: "Número de huevos puestos *",
    cancelButton: "Cancelar",
    savePonteButton: "Guardar puesta",
    declareHatchModalTitle: "Declaración de eclosiones",
    fertileEggsLabel: "Huevos fértiles (miraje exitoso) *",
    hatchedEggsLabel: "Pichones eclosionados *",
    saveHatchButton: "Validar eclosión",
    weanModalTitle: "Destete e Integración al Plantel",
    weanInstructions: "Este pichón se añadirá a su registro principal de aves.",
    birdNameLabel: "Nombre del ave *",
    cageLabel: "Jaula asignada *",
    saveWeanButton: "Confirmar destete",
    targetCage: "Jaula de destino"
  },
  it: {
    race: "Razza",
    couleur: "Colore",
    bague: "Anello",
    nom: "Nome",
    weanSuccess: "Il pullo è stato svezzato con successo e aggiunto al tuo stormo!",
    closeCycleConfirm: "Sei sicuro di voler chiudere questo ciclo di riproduzione? Questa azione è definitiva.",
    reproDashboardTitle: "Gestione della Riproduzione",
    reproDashboardSubtitle: "Supervisiona i cicli di allevamento, deposizioni, speratura, schiuse e svezzamento in tempo reale.",
    activeCyclesTitle: "Cicli Attivi",
    newCycleButton: "Nuovo Ciclo",
    cycleDetailsTitle: "Dettagli del Ciclo",
    selectCyclePrompt: "Seleziona un ciclo di riproduzione dall'elenco a sinistra per visualizzare dettagli, cove e pulli.",
    noActiveCycles: "Nessun ciclo attivo attualmente",
    startReproInCouples: "Avvia un ciclo dalla scheda 'Coppie'",
    closedCyclesHistory: "Storico dei cicli chiusi",
    closeCycle: "Chiudi ciclo",
    coupleLabel: "Coppia:",
    startDateLabel: "Data di inizio:",
    statusLabel: "Stato:",
    inbreedingRate: "Tasso di consanguineità:",
    inbreedingWarning: "Attenzione: Alto rischio di depressione da consanguineità",
    pontesAndChicksTitle: "Cove e Schiuse",
    declarePonteButton: "Registra una cova",
    chicksWeaned: "Pulli da svezzare",
    bandingBatchButton: "Inanellamento a lotti",
    declareHatchingButton: "Dichiara schiusa",
    weanButton: "Svezza uccello",
    eggSummary: "{eggs} uovo/a • {fertile} fecondo/e • {hatched} schiuso/e",
    chickBirthLabel: "Nato il {date}",
    chickBandLabel: "Anello: {band}",
    chickNoBand: "Non inanellato",
    chickStatusPending: "Nel nido",
    chickStatusWeaned: "Svezzato",
    declarePonteModalTitle: "Dichiarazione di una nuova cova",
    ponteDateLabel: "Data di deposizione (1° uovo) *",
    oeufsCountLabel: "Numero di uova deposte *",
    cancelButton: "Annulla",
    savePonteButton: "Salva cova",
    declareHatchModalTitle: "Dichiarazione delle schiuse",
    fertileEggsLabel: "Uova feconde (speratura riuscita) *",
    hatchedEggsLabel: "Pulli schiusi *",
    saveHatchButton: "Conferma schiusa",
    weanModalTitle: "Svezzamento e Integrazione nello Stormo",
    weanInstructions: "Questo giovane uccello verrà aggiunto al registro principale dei tuoi uccelli.",
    birdNameLabel: "Nome dell'uccello *",
    cageLabel: "Gabbia assegnata *",
    saveWeanButton: "Conferma svezzamento",
    targetCage: "Gabbia di destinazione"
  }
};

export default function ReproductionComponent({
  reproductions,
  couples,
  canaris,
  pontes,
  jeunes,
  onAddPonte,
  onUpdatePonteStats,
  onCloseReproduction,
  onAddJeune,
  onWeanJeuneToCanari,
  cagesList
}: ReproductionProps) {
  const { t, currentLanguage } = useLanguage();
  // Navigation view mode: Nest Tracking vs Cycles List
  const [reproViewMode, setReproViewMode] = useState<'nest_tracking' | 'cycles_list'>('nest_tracking');
  // Navigation tabs inside reproduction: Active Cycles vs All
  const [activeCycleTab, setActiveCycleTab] = useState<'En cours' | 'Clôturé'>('En cours');
  const [selectedReproId, setSelectedReproId] = useState<number | null>(() => {
    const active = reproductions.find(r => r.statut === 'En cours');
    return active ? active.id : (reproductions[0]?.id || null);
  });
  const [isNestModalOpen, setIsNestModalOpen] = useState<boolean>(false);
  const [isBandingModalOpen, setIsBandingModalOpen] = useState<boolean>(false);

  // Laying Form
  const [showPonteForm, setShowPonteForm] = useState(false);
  const [ponteDate, setPonteDate] = useState('2026-07-08');
  const [oeufsCount, setOeufsCount] = useState<number>(4);

  // Birth/Hatching declaration form
  const [showHatchForm, setShowHatchForm] = useState(false);
  const [hatchPonteId, setHatchPonteId] = useState<number | null>(null);
  const [eggsFecondes, setEggsFecondes] = useState<number>(4);
  const [eggsEclos, setEggsEclos] = useState<number>(3);

  // Weaning Form
  const defaultSpeciesBreeds = SpeciesProfileService.getActiveBreeds(SpeciesProfileService.getActiveSpeciesIds()[0]);
  const defaultBreedName = defaultSpeciesBreeds[0]?.defaultLabel || defaultSpeciesBreeds[0]?.id || 'Gloster Fancy';
  const [weaningJeuneId, setWeaningJeuneId] = useState<number | null>(null);
  const [weanNom, setWeanNom] = useState('');
  const [weanCageId, setWeanCageId] = useState<number>(cagesList[0]?.id || 1);
  const [weanRace, setWeanRace] = useState(defaultBreedName);
  const [weanCouleur, setWeanCouleur] = useState('');

  // Selected reproduction and related models
  const selectedRepro = reproductions.find(r => r.id === selectedReproId);
  const relatedCouple = selectedRepro ? couples.find(c => c.id === selectedRepro.couple_id) : null;
  const maleBird = relatedCouple ? canaris.find(b => b.id === relatedCouple.male_id) : null;
  const femaleBird = relatedCouple ? canaris.find(b => b.id === relatedCouple.femelle_id) : null;

  // Filter layings (pontes) for selected cycle
  const currentPontes = selectedReproId 
    ? pontes.filter(p => p.reproduction_id === selectedReproId)
    : [];

  // Filter young birds (jeunes) born from these layings
  const currentPonteIds = currentPontes.map(p => p.id);
  const currentJeunes = jeunes.filter(j => currentPonteIds.includes(j.ponte_id));

  // COI calculation for the reproductive pair
  const cycleCOI = (maleBird && femaleBird) 
    ? calculateInbreedingCOI(maleBird.id, femaleBird.id, canaris) 
    : 0;

  const labels = LOCAL_LABELS[currentLanguage] || LOCAL_LABELS.fr;

  const handlePonteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedReproId && oeufsCount > 0) {
      onAddPonte(selectedReproId, ponteDate, oeufsCount);
      setShowPonteForm(false);
    }
  };

  const handleHatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hatchPonteId !== null) {
      // 1. Update stats in the laying object
      onUpdatePonteStats(hatchPonteId, eggsFecondes, eggsEclos, 0);
      
      // 2. Insert Jeune chick entries into database (pre-weaning)
      const targetPonte = pontes.find(p => p.id === hatchPonteId);
      const birthDate = targetPonte ? targetPonte.date : '2026-07-08';
      
      // Calculate hatching date using dynamic species incubation period
      const speciesId = maleBird?.espece || femaleBird?.espece || 'canari';
      const incDays = SpeciesProfileService.getIncubationDays(speciesId);
      const hatchEst = new Date(birthDate);
      hatchEst.setDate(hatchEst.getDate() + incDays);
      const formattedHatchDate = hatchEst.toISOString().split('T')[0];

      for (let i = 0; i < eggsEclos; i++) {
        onAddJeune(hatchPonteId, '', formattedHatchDate);
      }

      setShowHatchForm(false);
      setHatchPonteId(null);
    }
  };

  const handleWeanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weaningJeuneId !== null) {
      onWeanJeuneToCanari(weaningJeuneId, weanNom, weanCageId, weanRace, weanCouleur);
      
      // Reset
      setWeaningJeuneId(null);
      setWeanNom('');
      setWeanCouleur('');
    }
  };

  const openHatchDeclaration = (p: Ponte) => {
    setHatchPonteId(p.id);
    setEggsFecondes(p.oeufs_fecondes || p.oeufs);
    setEggsEclos(p.eclosions || 0);
    setShowHatchForm(true);
  };

  const openWeaningForm = (j: Jeune) => {
    setWeaningJeuneId(j.id);
    
    // Auto-detect parents breed/color for prepopulating
    if (maleBird) {
      setWeanRace(maleBird.race);
      setWeanCouleur(maleBird.couleur + " & " + (femaleBird?.couleur || "panaché"));
    }
    const defaultWeanName = currentLanguage === 'ar'
      ? `فرخ من ${maleBird?.nom || "أب"} x ${femaleBird?.nom || "أم"}`
      : currentLanguage === 'en'
      ? `Young of ${maleBird?.nom || "Father"} x ${femaleBird?.nom || "Mother"}`
      : currentLanguage === 'es'
      ? `Pichón de ${maleBird?.nom || "Padre"} x ${femaleBird?.nom || "Madre"}`
      : currentLanguage === 'it'
      ? `Pullo di ${maleBird?.nom || "Padre"} x ${femaleBird?.nom || "Madre"}`
      : `Jeune de ${maleBird?.nom || "Père"} x ${femaleBird?.nom || "Mère"}`;

    setWeanNom(defaultWeanName);
    setWeanCageId(cagesList[0]?.id || 1);
  };

  // Filter cycles list based on active/clôturé filter tab and active species profile
  const filteredRepros = reproductions.filter(r => {
    if (r.statut !== activeCycleTab) return false;
    const couple = couples.find(c => c.id === r.couple_id);
    if (!couple) return true;
    const male = canaris.find(b => b.id === couple.male_id);
    const female = canaris.find(b => b.id === couple.femelle_id);
    const maleActive = !male?.espece || SpeciesProfileService.isSpeciesActive(male.espece);
    const femaleActive = !female?.espece || SpeciesProfileService.isSpeciesActive(female.espece);
    return maleActive && femaleActive;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#212529] dark:text-[#F8F9FA]">{t('reproductionTitle')}</h2>
          <p className="text-xs text-[#6C757D] dark:text-[#ADB5BD]">
            {t('reproductionSub')}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setReproViewMode('nest_tracking')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              reproViewMode === 'nest_tracking'
                ? 'bg-indigo-600 text-white shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Egg className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentLanguage === 'ar' ? 'متابعة الأعشاش والحضانة' : currentLanguage === 'en' ? 'Nest & Incubation Tracking' : currentLanguage === 'es' ? 'Seguimiento de Nidos' : currentLanguage === 'it' ? 'Monitoraggio Nidi' : 'Suivi des Nids & Couvaison'}</span>
          </button>
          <button
            type="button"
            onClick={() => setReproViewMode('cycles_list')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              reproViewMode === 'cycles_list'
                ? 'bg-indigo-600 text-white shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{currentLanguage === 'ar' ? 'جميع الدورات' : currentLanguage === 'en' ? 'All Breeding Cycles' : currentLanguage === 'es' ? 'Todos los Ciclos' : currentLanguage === 'it' ? 'Tutti i Cicli' : 'Tous les Cycles'}</span>
          </button>
        </div>
      </div>

      {reproViewMode === 'nest_tracking' ? (
        <NestTrackingView
          reproductions={reproductions}
          couples={couples}
          canaris={canaris}
          pontes={pontes}
          jeunes={jeunes}
          onAddPonte={onAddPonte}
          onUpdatePonteStats={onUpdatePonteStats}
          onCloseReproduction={onCloseReproduction}
          onAddJeune={onAddJeune}
          onWeanJeuneToCanari={onWeanJeuneToCanari}
          cagesList={cagesList}
          selectedReproId={selectedReproId}
          onSelectReproId={setSelectedReproId}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left columns: Cycles filtering & Selection */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-xl border border-slate-100 dark:border-[#343A40] p-4">
              <div className="flex gap-2 bg-slate-100 dark:bg-[#2A2A2A] p-1 rounded-xl text-xs font-semibold mb-4 w-fit">
              {(['En cours', 'Clôturé'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveCycleTab(tab);
                    setSelectedReproId(null);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    activeCycleTab === tab ? 'bg-white dark:bg-[#1E1E1E] text-slate-800 dark:text-[#F8F9FA] shadow-xs font-bold' : 'text-slate-500 dark:text-[#ADB5BD] hover:text-slate-800'
                  }`}
                >
                  {t('cyclesTab', { status: tab === 'En cours' ? t('pendingLabel') : t('doneLabel') })}
                </button>
              ))}
            </div>

            {filteredRepros.length === 0 ? (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <Egg className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">
                  {t('noCycle', { status: activeCycleTab === 'En cours' ? t('pendingLabel').toLowerCase() : t('doneLabel').toLowerCase() })}
                </p>
                <p className="text-xs mt-1">
                  {activeCycleTab === 'En cours' 
                    ? t('noCycleInProgressDesc')
                    : t('noCycleClosedDesc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredRepros.map((repro) => {
                  const couple = couples.find(c => c.id === repro.couple_id);
                  const m = couple ? canaris.find(b => b.id === couple.male_id) : null;
                  const f = couple ? canaris.find(b => b.id === couple.femelle_id) : null;
                  const countEggs = pontes.filter(p => p.reproduction_id === repro.id).reduce((sum, p) => sum + p.oeufs, 0);
                  const countChicks = pontes.filter(p => p.reproduction_id === repro.id).reduce((sum, p) => sum + (p.eclosions || 0), 0);
                  const isSelected = selectedReproId === repro.id;

                  return (
                    <div
                      key={repro.id}
                      onClick={() => {
                        setSelectedReproId(repro.id);
                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          setIsNestModalOpen(true);
                        }
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected 
                          ? 'bg-yellow-50 border-yellow-300 shadow-xs' 
                          : 'bg-white border-slate-100 hover:border-slate-200 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center text-xs mb-2">
                          <span className="font-mono text-slate-400 font-bold">Repro #{repro.id}</span>
                          <span className="text-slate-500">{t('openedOn', { date: repro.date_debut })}</span>
                        </div>
                        
                        {/* Parent Names */}
                        <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5 mt-1">
                          <span className="text-blue-600 flex items-center gap-1">♂ {m ? m.nom : "—"} {m && <SpeciesBadge speciesId={m.espece} size="sm" showLabel={false} />}</span>
                          <span className="text-slate-300">x</span>
                          <span className="text-rose-600 font-semibold flex items-center gap-1">♀ {f ? f.nom : "—"} {f && <SpeciesBadge speciesId={f.espece} size="sm" showLabel={false} />}</span>
                        </div>
                      </div>

                      {/* Nest Summary Stats */}
                      <div className="bg-white/80 p-2 rounded-lg border border-slate-100 flex justify-between items-center text-xs text-slate-600 mt-2">
                        <span className="flex items-center gap-1"><Egg className="w-3.5 h-3.5 text-yellow-500" /> {t('nestSummaryEggs', { count: countEggs })}</span>
                        <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-blue-500" /> {t('nestSummaryHatches', { count: countChicks })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Reproduction detail panel with egg tracking & baby weaning */}
        <div className="hidden lg:block">
          {selectedReproId && selectedRepro ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
              {/* Couple Header */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Cycle #{selectedRepro.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedRepro.statut === 'En cours' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedRepro.statut === 'En cours' ? t('pendingLabel') : t('doneLabel')}
                  </span>
                </div>
                
                <h3 className="font-bold text-slate-800 text-sm mt-1.5">
                  {t('nestOf', { male: maleBird?.nom || "♂", female: femaleBird?.nom || "♀" })}
                </h3>
              </div>

              {/* Inbreeding Risk Gauge for Active Cycle */}
              {maleBird && femaleBird && (
                <WrightConsanguinityGauge
                  coefficient={cycleCOI}
                  title={currentLanguage === 'ar' ? 'قرابة الزوج' : currentLanguage === 'en' ? 'Couple Inbreeding' : currentLanguage === 'es' ? 'Consanguinidad de la pareja' : currentLanguage === 'it' ? 'Consanguineità della coppia' : 'Consanguinité du Couple'}
                  size="sm"
                  variant="bar"
                />
              )}

              {/* Egg Matrix & Incubation Timeline for active cycle */}
              {currentPontes.length > 0 && (
                <div className="space-y-4">
                  <EggMatrixCard
                    clutchId={currentPontes[currentPontes.length - 1].id}
                    layingDate={currentPontes[currentPontes.length - 1].date}
                    totalEggs={currentPontes[currentPontes.length - 1].oeufs}
                    fertileCount={currentPontes[currentPontes.length - 1].oeufs_fecondes}
                    hatchedCount={currentPontes[currentPontes.length - 1].eclosions}
                    onQuickCandling={() => openHatchDeclaration(currentPontes[currentPontes.length - 1])}
                    onEditClutch={() => {
                      setPonteDate(currentPontes[currentPontes.length - 1].date);
                      setShowPonteForm(true);
                    }}
                    title={currentLanguage === 'ar' ? 'مصفوفة البيض' : currentLanguage === 'en' ? 'Egg Matrix' : currentLanguage === 'es' ? 'Matriz de huevos' : currentLanguage === 'it' ? 'Matrice delle uova' : 'Matrice des Œufs'}
                  />
                  <IncubationTimeline
                    clutchStartDate={currentPontes[currentPontes.length - 1].date}
                    onCandlingAction={() => openHatchDeclaration(currentPontes[currentPontes.length - 1])}
                    onHatchingAction={() => openHatchDeclaration(currentPontes[currentPontes.length - 1])}
                    onBandingAction={() => setIsBandingModalOpen(true)}
                  />
                </div>
              )}

              {/* Nest Layings Tracker */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('cycleLayingTitle')}</h4>
                  {selectedRepro.statut === 'En cours' && !showPonteForm && (
                    <button
                      onClick={() => {
                        setPonteDate(new Date().toISOString().split('T')[0]);
                        setShowPonteForm(true);
                      }}
                      className="text-xs font-semibold text-yellow-600 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> {t('registerPonte')}
                    </button>
                  )}
                </div>

                {/* Ponte adding Form */}
                {showPonteForm && (
                  <form onSubmit={handlePonteSubmit} className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl space-y-3">
                    <div className="text-xs font-bold text-yellow-800 mb-1">{t('registerPonteTitle')}</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">{t('dateLaying')}</label>
                        <input
                          type="date"
                          required
                          value={ponteDate}
                          onChange={(e) => setPonteDate(e.target.value)}
                          className="w-full bg-white p-1.5 border border-slate-200 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-semibold">{t('eggsNumber')}</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={10}
                          value={oeufsCount}
                          onChange={(e) => setOeufsCount(Number(e.target.value))}
                          className="w-full bg-white p-1.5 border border-slate-200 rounded text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowPonteForm(false)}
                        className="px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded text-xs cursor-pointer font-semibold"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-1 bg-yellow-600 text-white rounded text-xs cursor-pointer font-bold"
                      >
                        {t('save')}
                      </button>
                    </div>
                  </form>
                )}

                {/* Layings list */}
                {currentPontes.length === 0 ? (
                  <p className="text-xs italic text-slate-400 py-3 text-center bg-slate-50 rounded-xl border">
                    {t('noPonteDeclared')}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {currentPontes.map((p) => {
                      // Estimate hatch date (Laying date + 13 days)
                      const lDate = new Date(p.date);
                      const hatchEst = new Date(lDate);
                      hatchEst.setDate(lDate.getDate() + 13);
                      const formattedHatch = hatchEst.toLocaleDateString(currentLanguage, { day: 'numeric', month: 'short' });

                      return (
                        <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                          <div className="flex justify-between items-start font-semibold">
                            <span className="text-slate-800">{t('layingOfDate', { date: p.date })}</span>
                            <span className="bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                              {t('eggsCountBadge', { count: p.oeufs })}
                            </span>
                          </div>
                          
                          {/* Timings */}
                          <div className="mt-2 text-slate-500 space-y-1">
                            <div className="flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {t('estimatedHatching', { date: formattedHatch })}
                            </div>
                            
                            {p.eclosions !== undefined && p.eclosions > 0 ? (
                              <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] mt-1.5">
                                <CheckCircle className="w-3.5 h-3.5" /> {t('chicksBorn', { eclosions: p.eclosions, fecondes: p.oeufs_fecondes || 0 })}
                              </div>
                            ) : (
                              <div className="text-amber-600 font-semibold text-[10px] mt-1.5 flex items-center gap-1">
                                <Info className="w-3.5 h-3.5" /> {t('incubationInProgress')}
                              </div>
                            )}
                          </div>

                          {/* Hatch declaration button */}
                          {selectedRepro.statut === 'En cours' && (!p.eclosions || p.eclosions === 0) && (
                            <button
                              type="button"
                              onClick={() => openHatchDeclaration(p)}
                              className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-2.5 rounded text-[10px] cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> {t('declareBirth')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Hatchings Births Declaration Modal / Overlay inside panel */}
              {showHatchForm && (
                <form onSubmit={handleHatchSubmit} className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> {t('declareBirthTitle')}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {t('declareBirthDesc')}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{t('eggsFecondes')}</label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={10}
                        value={eggsFecondes}
                        onChange={(e) => setEggsFecondes(Number(e.target.value))}
                        className="w-full bg-white p-1.5 border border-slate-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{t('eggsEclos')}</label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={eggsFecondes}
                        value={eggsEclos}
                        onChange={(e) => setEggsEclos(Number(e.target.value))}
                        className="w-full bg-white p-1.5 border border-slate-200 rounded"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowHatchForm(false)}
                      className="px-2 py-1 bg-white border border-slate-200 text-slate-500 rounded text-xs cursor-pointer font-semibold"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs cursor-pointer font-bold"
                    >
                      {t('validateBirth')}
                    </button>
                  </div>
                </form>
              )}

              {/* Young chicks before weaning tracking (Pre-Weaning) */}
              {currentJeunes.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('chicksFollowUp', { count: currentJeunes.length })}</h4>
                  
                  <div className="space-y-2">
                    {currentJeunes.map((j) => (
                      <div key={j.id} className="p-2.5 bg-yellow-50/40 rounded-xl border border-yellow-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-amber-950">{t('chickBadge', { id: j.id })}</span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{t('bornOn', { date: j.date_naissance })}</span>
                        </div>

                        {j.statut === 'En sevrage' && selectedRepro.statut === 'En cours' ? (
                          <button
                            onClick={() => openWeaningForm(j)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer flex items-center gap-0.5 font-sans"
                          >
                            {t('weanAndSeparate')} <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            {j.statut}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weaning form overlay */}
              {weaningJeuneId && (
                <form onSubmit={handleWeanSubmit} className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 text-xs">
                  <div className="font-bold text-amber-800 flex items-center justify-between">
                    <span>{t('convertChickToAdult')}</span>
                    <button type="button" onClick={() => setWeaningJeuneId(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
                  </div>
                  
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    {t('weanChickDesc')}
                  </p>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{t('usualName')}</label>
                      <input
                        type="text"
                        required
                        value={weanNom}
                        onChange={(e) => setWeanNom(e.target.value)}
                        className="w-full bg-white p-2 border border-slate-200 rounded"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">{labels.race}</label>
                        <input
                          type="text"
                          required
                          value={weanRace}
                          onChange={(e) => setWeanRace(e.target.value)}
                          className="w-full bg-white p-2 border border-slate-200 rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-1 font-semibold">{labels.couleur}</label>
                        <input
                          type="text"
                          required
                          value={weanCouleur}
                          onChange={(e) => setWeanCouleur(e.target.value)}
                          className="w-full bg-white p-2 border border-slate-200 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{labels.targetCage}</label>
                      <select
                        value={weanCageId}
                        onChange={(e) => setWeanCageId(Number(e.target.value))}
                        className="w-full bg-white p-2 border border-slate-200 rounded"
                      >
                        {cagesList.map(c => (
                          <option key={c.id} value={c.id}>{c.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded text-xs cursor-pointer mt-1"
                  >
                    {t('weanAndRegister')}
                  </button>
                </form>
              )}

              {/* Close cycle button */}
              {selectedRepro.statut === 'En cours' && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t('closeReproConfirm'))) {
                      onCloseReproduction(selectedRepro.id);
                    }
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <Square className="w-3.5 h-3.5" /> {t('closeReproCycle')}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 flex flex-col justify-center items-center h-full min-h-[300px]">
              <Egg className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">{t('nestDetails')}</p>
              <p className="text-xs mt-1">{t('nestDetailsDesc')}</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Mobile & Responsive Modal for Nest Details */}
      {selectedRepro && (
        <AppModal
          isOpen={isNestModalOpen}
          onClose={() => setIsNestModalOpen(false)}
          title={t('nestOf', { male: maleBird?.nom || "♂", female: femaleBird?.nom || "♀" })}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Cycle Status Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-mono text-slate-400 font-bold">Cycle #{selectedRepro.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                selectedRepro.statut === 'En cours' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {selectedRepro.statut === 'En cours' ? t('pendingLabel') : t('doneLabel')}
              </span>
            </div>

            {/* Inbreeding Risk Gauge for Active Cycle */}
            {maleBird && femaleBird && (
              <WrightConsanguinityGauge
                coefficient={cycleCOI}
                title="Consanguinité du Couple"
                size="sm"
                variant="card"
              />
            )}

            {/* Egg Matrix & Incubation Timeline for active cycle */}
            {currentPontes.length > 0 && (
              <div className="space-y-4">
                <EggMatrixCard
                  clutchId={currentPontes[currentPontes.length - 1].id}
                  layingDate={currentPontes[currentPontes.length - 1].date}
                  totalEggs={currentPontes[currentPontes.length - 1].oeufs}
                  fertileCount={currentPontes[currentPontes.length - 1].oeufs_fecondes}
                  hatchedCount={currentPontes[currentPontes.length - 1].eclosions}
                  onQuickCandling={() => openHatchDeclaration(currentPontes[currentPontes.length - 1])}
                  onEditClutch={() => {
                    setPonteDate(currentPontes[currentPontes.length - 1].date);
                    setShowPonteForm(true);
                  }}
                  title="Matrice des Œufs"
                />
                <IncubationTimeline
                  clutchStartDate={currentPontes[currentPontes.length - 1].date}
                  onCandlingAction={() => openHatchDeclaration(currentPontes[currentPontes.length - 1])}
                  onHatchingAction={() => openHatchDeclaration(currentPontes[currentPontes.length - 1])}
                  onBandingAction={() => setIsBandingModalOpen(true)}
                />
              </div>
            )}

            {/* Nest Layings Tracker */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{t('cycleLayingTitle')}</h4>
                {selectedRepro.statut === 'En cours' && !showPonteForm && (
                  <button
                    onClick={() => {
                      setPonteDate(new Date().toISOString().split('T')[0]);
                      setShowPonteForm(true);
                    }}
                    className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> {t('registerPonte')}
                  </button>
                )}
              </div>

              {/* Laying form */}
              {showPonteForm && (
                <form onSubmit={handlePonteSubmit} className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/60 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-yellow-800 dark:text-yellow-300 mb-1">{t('registerPonteTitle')}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">{t('dateLaying')}</label>
                      <input
                        type="date"
                        required
                        value={ponteDate}
                        onChange={(e) => setPonteDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-1.5 border border-slate-200 dark:border-slate-800 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">{t('eggsNumber')}</label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={10}
                        value={oeufsCount}
                        onChange={(e) => setOeufsCount(Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-1.5 border border-slate-200 dark:border-slate-800 rounded text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowPonteForm(false)}
                      className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 rounded text-xs cursor-pointer font-semibold"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-yellow-600 text-white rounded text-xs cursor-pointer font-bold"
                    >
                      {t('save')}
                    </button>
                  </div>
                </form>
              )}

              {/* Layings list */}
              {currentPontes.length === 0 ? (
                <p className="text-xs italic text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  {t('noPonteDeclared')}
                </p>
              ) : (
                <div className="space-y-3">
                  {currentPontes.map((p) => {
                    const lDate = new Date(p.date);
                    const hatchEst = new Date(lDate);
                    hatchEst.setDate(lDate.getDate() + 13);
                    const formattedHatch = hatchEst.toLocaleDateString(currentLanguage, { day: 'numeric', month: 'short' });

                    return (
                      <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                        <div className="flex justify-between items-start font-semibold">
                          <span className="text-slate-800 dark:text-slate-200">{t('layingOfDate', { date: p.date })}</span>
                          <span className="bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                            {t('eggsCountBadge', { count: p.oeufs })}
                          </span>
                        </div>
                        
                        <div className="mt-2 text-slate-500 dark:text-slate-400 space-y-1">
                          <div className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" /> {t('estimatedHatching', { date: formattedHatch })}
                          </div>
                          
                          {p.eclosions !== undefined && p.eclosions > 0 ? (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] mt-1.5">
                              <CheckCircle className="w-3.5 h-3.5" /> {t('chicksBorn', { eclosions: p.eclosions, fecondes: p.oeufs_fecondes || 0 })}
                            </div>
                          ) : (
                            <div className="text-amber-600 dark:text-amber-400 font-semibold text-[10px] mt-1.5 flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" /> {t('incubationInProgress')}
                            </div>
                          )}
                        </div>

                        {selectedRepro.statut === 'En cours' && (!p.eclosions || p.eclosions === 0) && (
                          <button
                            type="button"
                            onClick={() => openHatchDeclaration(p)}
                            className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-1 px-2.5 rounded text-[10px] cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> {t('declareBirth')}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hatchings Births Declaration Form inside Modal */}
            {showHatchForm && (
              <form onSubmit={handleHatchSubmit} className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 rounded-xl space-y-3">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> {t('declareBirthTitle')}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('declareBirthDesc')}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">{t('eggsFecondes')}</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={10}
                      value={eggsFecondes}
                      onChange={(e) => setEggsFecondes(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-1.5 border border-slate-200 dark:border-slate-800 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">{t('eggsEclos')}</label>
                    <input
                      type="number"
                      required
                      min={0}
                      max={eggsFecondes}
                      value={eggsEclos}
                      onChange={(e) => setEggsEclos(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-1.5 border border-slate-200 dark:border-slate-800 rounded"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowHatchForm(false)}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 rounded text-xs cursor-pointer font-semibold"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs cursor-pointer font-bold"
                  >
                    {t('validateBirth')}
                  </button>
                </div>
              </form>
            )}

            {/* Young chicks pre-weaning tracking */}
            {currentJeunes.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('chicksFollowUp', { count: currentJeunes.length })}</h4>
                
                <div className="space-y-2">
                  {currentJeunes.map((j) => (
                    <div key={j.id} className="p-2.5 bg-yellow-50/40 dark:bg-yellow-950/20 rounded-xl border border-yellow-100 dark:border-yellow-900/40 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-amber-950 dark:text-amber-200">{t('chickBadge', { id: j.id })}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{t('bornOn', { date: j.date_naissance })}</span>
                      </div>

                      {j.statut === 'En sevrage' && selectedRepro.statut === 'En cours' ? (
                        <button
                          onClick={() => openWeaningForm(j)}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-1 rounded text-[10px] cursor-pointer flex items-center gap-0.5 font-sans"
                        >
                          {t('weanAndSeparate')} <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                          {j.statut}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weaning form inside modal */}
            {weaningJeuneId && (
              <form onSubmit={handleWeanSubmit} className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 rounded-xl space-y-3 text-xs">
                <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                  <span>{t('convertChickToAdult')}</span>
                  <button type="button" onClick={() => setWeaningJeuneId(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
                </div>
                
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {t('weanChickDesc')}
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">{t('usualName')}</label>
                    <input
                      type="text"
                      required
                      value={weanNom}
                      onChange={(e) => setWeanNom(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-2 border border-slate-200 dark:border-slate-800 rounded"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">{labels.race}</label>
                      <input
                        type="text"
                        required
                        value={weanRace}
                        onChange={(e) => setWeanRace(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-2 border border-slate-200 dark:border-slate-800 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">{labels.couleur}</label>
                      <input
                        type="text"
                        required
                        value={weanCouleur}
                        onChange={(e) => setWeanCouleur(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-2 border border-slate-200 dark:border-slate-800 rounded"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-semibold">{labels.targetCage}</label>
                    <select
                      value={weanCageId}
                      onChange={(e) => setWeanCageId(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-2 border border-slate-200 dark:border-slate-800 rounded"
                    >
                      {cagesList.map(c => (
                        <option key={c.id} value={c.id}>{c.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded text-xs cursor-pointer mt-1"
                >
                  {t('weanAndRegister')}
                </button>
              </form>
            )}

            {/* Close Cycle Action */}
            {selectedRepro.statut === 'En cours' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(t('closeReproConfirm'))) {
                      onCloseReproduction(selectedRepro.id);
                      setIsNestModalOpen(false);
                    }
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                >
                  <Square className="w-3.5 h-3.5" /> {t('closeReproCycle')}
                </button>
              </div>
            )}
          </div>
        </AppModal>
      )}

      {/* Batch Banding Modal */}
      {selectedRepro && (
        <BandingBatchModal
          isOpen={isBandingModalOpen}
          onClose={() => setIsBandingModalOpen(false)}
          reproductionId={selectedRepro.id}
          sire={maleBird || null}
          dam={femaleBird || null}
          allBirds={canaris}
          chicks={currentJeunes}
          cagesList={cagesList}
          onCompleteBanding={(banded) => {
            banded.forEach(item => {
              onWeanJeuneToCanari(item.jeuneId, item.bird.nom, item.bird.cage_id || 1, item.bird.race, item.bird.couleur);
            });
          }}
        />
      )}
    </div>
  );
}
