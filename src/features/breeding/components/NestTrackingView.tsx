/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Egg, Plus, Sparkles, CheckCircle2, Calendar, 
  Heart, History, ArrowRight, Eye, Feather, Award, X, Trash2,
  AlertCircle, Check
} from 'lucide-react';
import { Couple, Canari, Reproduction, Ponte, Jeune } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  SpeciesBadge, AppModal, AppAvatar, 
  WrightConsanguinityGauge, EggMatrixCard, IncubationTimeline 
} from '../../../components/design-system';
import { EggItem, EggItemStatus } from '../../../components/design-system/EggMatrixCard';
import { calculateInbreedingCOI } from '../../../utils/genealogy';
import { BandingBatchModal } from './BandingBatchModal';
import { BirdRepository } from '../../birds/repositories/BirdRepository';

export interface NestTrackingViewProps {
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
  cagesList: Array<{ id: number; nom: string }>;
  selectedReproId?: number | null;
  onSelectReproId?: (id: number | null) => void;
}

const NEST_I18N = {
  fr: {
    activeNests: "Nids Actifs & Couvaisons en Cours ({count})",
    noActiveNests: "Aucun nid en cours d'incubation",
    noActiveNestsDesc: "Associez un couple reproducteur et démarrez un cycle pour suivre la couvaison.",
    nestPrefix: "NID #",
    dayPrefix: "J+",
    unknownMale: "Inconnu",
    unknownFemale: "Inconnue",
    eggs: "œufs",
    hatched: "éclos",
    eggMatrixTitle: "Matrice des Œufs — NID #{id}",
    clutchRecorded: "Ponte enregistrée le {date}",
    noClutchCycle: "Aucune ponte déclarée pour ce cycle.",
    chicksAndClutches: "Oisillons & Pontes du Cycle (#{id})",
    bandBatchBtn: "Bagner la nichée (lot)",
    addClutchBtn: "Ajouter une ponte",
    bornChicksTitle: "Oisillons nés ({count})",
    openBandingAssistant: "Ouvrir l'assistant de baguage",
    ringLabel: "Bague : {band}",
    chickNumber: "Jeune n°{id}",
    bornOn: "Né le ",
    inWeaning: "En sevrage",
    weanAction: "Sevrer",
    couplePrefix: "COUPLE #{id}",
    activeStatus: "Actif",
    maleLabel: "♂ Mâle",
    femaleLabel: "♀ Femelle",
    coupleCOITitle: "Consanguinité du Couple",
    closeCycleBtn: "Clôturer ce cycle de reproduction",
    modalPonteTitle: "Enregistrer une Nouvelle Ponte",
    modalPonteDate: "Date de début de ponte",
    modalPonteEggs: "Nombre d'œufs pondus",
    cancelBtn: "Annuler",
    savePonteBtn: "Enregistrer la ponte",
    modalCandlingTitle: "Mirage Rapide de la Ponte",
    modalCandlingDesc: "Indiquez le nombre d'œufs confirmés fécondés après mirage à J+6.",
    modalFertileEggs: "Œufs Fécondés",
    saveCandlingBtn: "Valider le mirage",
    modalHatchTitle: "Déclarer les Naissances / Éclosions",
    modalHatchedChicks: "Oisillons Éclos",
    saveHatchBtn: "Confirmer les naissances",
    modalWeanTitle: "Sevrer l'Oisillon vers l'Élevage",
    modalWeanName: "Nom / Identification",
    modalWeanBreed: "Race",
    modalWeanCage: "Cage de destination",
    saveWeanBtn: "Valider le sevrage"
  },
  en: {
    activeNests: "Active Nests & Current Incubations ({count})",
    noActiveNests: "No nests currently incubating",
    noActiveNestsDesc: "Pair a breeding couple and start a cycle to track incubation.",
    nestPrefix: "NEST #",
    dayPrefix: "D+",
    unknownMale: "Unknown",
    unknownFemale: "Unknown",
    eggs: "eggs",
    hatched: "hatched",
    eggMatrixTitle: "Egg Matrix — NEST #{id}",
    clutchRecorded: "Clutch recorded on {date}",
    noClutchCycle: "No clutch declared for this cycle.",
    chicksAndClutches: "Chicks & Clutches of Cycle (#{id})",
    bandBatchBtn: "Band clutch (batch)",
    addClutchBtn: "Add a clutch",
    bornChicksTitle: "Hatched chicks ({count})",
    openBandingAssistant: "Open banding assistant",
    ringLabel: "Ring: {band}",
    chickNumber: "Chick #{id}",
    bornOn: "Born on ",
    inWeaning: "Weaning",
    weanAction: "Wean",
    couplePrefix: "COUPLE #{id}",
    activeStatus: "Active",
    maleLabel: "♂ Male",
    femaleLabel: "♀ Female",
    coupleCOITitle: "Couple Inbreeding",
    closeCycleBtn: "Close this breeding cycle",
    modalPonteTitle: "Record a New Clutch",
    modalPonteDate: "Clutch start date",
    modalPonteEggs: "Number of eggs laid",
    cancelBtn: "Cancel",
    savePonteBtn: "Save clutch",
    modalCandlingTitle: "Quick Clutch Candling",
    modalCandlingDesc: "Specify the number of eggs confirmed fertile after candling at Day 6.",
    modalFertileEggs: "Fertile Eggs",
    saveCandlingBtn: "Validate candling",
    modalHatchTitle: "Declare Hatches / Births",
    modalHatchedChicks: "Hatched Chicks",
    saveHatchBtn: "Confirm hatches",
    modalWeanTitle: "Wean Chick into Aviary",
    modalWeanName: "Name / Identification",
    modalWeanBreed: "Breed",
    modalWeanCage: "Destination cage",
    saveWeanBtn: "Confirm weaning"
  },
  ar: {
    activeNests: "الأعشاش النشطة والحضانة الجارية ({count})",
    noActiveNests: "لا توجد أعشاش قيد الحضانة حاليًا",
    noActiveNestsDesc: "قم بربط زوج تكاثري وابدأ دورة لمتابعة الحضانة.",
    nestPrefix: "عش #",
    dayPrefix: "يوم +",
    unknownMale: "غير معروف",
    unknownFemale: "غير معروفة",
    eggs: "بيض",
    hatched: "فقس",
    eggMatrixTitle: "مصفوفة البيض — عش #{id}",
    clutchRecorded: "تم تسجيل وضع البيض في {date}",
    noClutchCycle: "لم يتم تسجيل أي بيض لهذه الدورة.",
    chicksAndClutches: "الفراخ وحضنات الدورة (#{id})",
    bandBatchBtn: "تحجيل العش (دفعة)",
    addClutchBtn: "إضافة حضنة",
    bornChicksTitle: "الفراخ المولودة ({count})",
    openBandingAssistant: "فتح مساعد التحجيل",
    ringLabel: "حلقة: {band}",
    chickNumber: "فرخ رقم {id}",
    bornOn: "ولد في ",
    inWeaning: "قيد الفطام",
    weanAction: "فطام",
    couplePrefix: "زوج #{id}",
    activeStatus: "نشط",
    maleLabel: "♂ ذكر",
    femaleLabel: "♀ أنثى",
    coupleCOITitle: "قرابة الزوج",
    closeCycleBtn: "إنهاء دورة التكاثر هذه",
    modalPonteTitle: "تسجيل وضع بيض جديد",
    modalPonteDate: "تاريخ بداية وضع البيض",
    modalPonteEggs: "عدد البيض الموضوع",
    cancelBtn: "إلغاء",
    savePonteBtn: "حفظ وضع البيض",
    modalCandlingTitle: "فحص ضوئي سريع للحضنة",
    modalCandlingDesc: "حدد عدد البيض المؤكد تخصيبه بعد الفحص الضوئي في اليوم +6.",
    modalFertileEggs: "البيض المخصب",
    saveCandlingBtn: "تأكيد الفحص الضوئي",
    modalHatchTitle: "تسجيل المواليد / الفقس",
    modalHatchedChicks: "الفراخ الفاقسة",
    saveHatchBtn: "تأكيد المواليد",
    modalWeanTitle: "فطام الفرخ وإضافته للمزرعة",
    modalWeanName: "الاسم / التعريف",
    modalWeanBreed: "السلالة",
    modalWeanCage: "قفص الوجهة",
    saveWeanBtn: "تأكيد الفطام"
  },
  es: {
    activeNests: "Nidos Activos e Incubaciones ({count})",
    noActiveNests: "Ningún nido en incubación",
    noActiveNestsDesc: "Empareje una pareja reproductora e inicie un ciclo para seguir la incubación.",
    nestPrefix: "NIDO #",
    dayPrefix: "D+",
    unknownMale: "Desconocido",
    unknownFemale: "Desconocida",
    eggs: "huevos",
    hatched: "eclosionados",
    eggMatrixTitle: "Matriz de Huevos — NIDO #{id}",
    clutchRecorded: "Puesta registrada el {date}",
    noClutchCycle: "Ninguna puesta declarada para este ciclo.",
    chicksAndClutches: "Pichones y Puestas del Ciclo (#{id})",
    bandBatchBtn: "Anillar nidada (lote)",
    addClutchBtn: "Añadir una puesta",
    bornChicksTitle: "Pichones nacidos ({count})",
    openBandingAssistant: "Abrir asistente de anillado",
    ringLabel: "Anilla: {band}",
    chickNumber: "Pichón n.° {id}",
    bornOn: "Nacido el ",
    inWeaning: "En destete",
    weanAction: "Destetar",
    couplePrefix: "PAREJA #{id}",
    activeStatus: "Activo",
    maleLabel: "♂ Macho",
    femaleLabel: "♀ Hembra",
    coupleCOITitle: "Consanguinidad de la Pareja",
    closeCycleBtn: "Cerrar este ciclo de reproducción",
    modalPonteTitle: "Registrar una Nueva Puesta",
    modalPonteDate: "Fecha de inicio de la puesta",
    modalPonteEggs: "Número de huevos puestos",
    cancelBtn: "Cancelar",
    savePonteBtn: "Guardar puesta",
    modalCandlingTitle: "Miraje Rápido de la Puesta",
    modalCandlingDesc: "Indique el número de huevos confirmados fértiles tras el miraje al Día 6.",
    modalFertileEggs: "Huevos Fértiles",
    saveCandlingBtn: "Validar miraje",
    modalHatchTitle: "Declarar Nacimientos / Eclosiones",
    modalHatchedChicks: "Pichones Eclosionados",
    saveHatchBtn: "Confirmar nacimientos",
    modalWeanTitle: "Destetar Pichón al Aviario",
    modalWeanName: "Nombre / Identificación",
    modalWeanBreed: "Raza",
    modalWeanCage: "Jaula de destino",
    saveWeanBtn: "Confirmar destete"
  },
  it: {
    activeNests: "Nidi Attivi e Cove in Corso ({count})",
    noActiveNests: "Nessun nido in cova",
    noActiveNestsDesc: "Abbina una coppia riproduttrice e avvia un ciclo per seguire la cova.",
    nestPrefix: "NIDO #",
    dayPrefix: "G+",
    unknownMale: "Sconosciuto",
    unknownFemale: "Sconosciuta",
    eggs: "uova",
    hatched: "schiusi",
    eggMatrixTitle: "Matrice delle Uova — NIDO #{id}",
    clutchRecorded: "Cova registrata il {date}",
    noClutchCycle: "Nessuna cova dichiarata per questo ciclo.",
    chicksAndClutches: "Pulli e Cove del Ciclo (#{id})",
    bandBatchBtn: "Inanella nidiata (lotto)",
    addClutchBtn: "Aggiungi una cova",
    bornChicksTitle: "Pulli nati ({count})",
    openBandingAssistant: "Apri assistente inanellamento",
    ringLabel: "Anello: {band}",
    chickNumber: "Pullo n. {id}",
    bornOn: "Nato il ",
    inWeaning: "In svezzamento",
    weanAction: "Svezza",
    couplePrefix: "COPPIA #{id}",
    activeStatus: "Attivo",
    maleLabel: "♂ Maschio",
    femaleLabel: "♀ Femmina",
    coupleCOITitle: "Consanguineità della Coppia",
    closeCycleBtn: "Chiudi questo ciclo di riproduzione",
    modalPonteTitle: "Registra una Nuova Cova",
    modalPonteDate: "Data di inizio deposizione",
    modalPonteEggs: "Numero di uova deposte",
    cancelBtn: "Annulla",
    savePonteBtn: "Salva cova",
    modalCandlingTitle: "Speratura Rapida della Cova",
    modalCandlingDesc: "Indica il numero di uova feconde confermate dopo la speratura al Giorno 6.",
    modalFertileEggs: "Uova Feconde",
    saveCandlingBtn: "Conferma speratura",
    modalHatchTitle: "Dichiara Nascite / Schiuse",
    modalHatchedChicks: "Pulli Schiusi",
    saveHatchBtn: "Conferma nascite",
    modalWeanTitle: "Svezza Pullo nell'Allevamento",
    modalWeanName: "Nome / Identificazione",
    modalWeanBreed: "Razza",
    modalWeanCage: "Gabbia di destinazione",
    saveWeanBtn: "Conferma svezzamento"
  }
};

export const NestTrackingView: React.FC<NestTrackingViewProps> = ({
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
  cagesList,
  selectedReproId: externalSelectedId,
  onSelectReproId,
}) => {
  const { t, currentLanguage } = useLanguage();

  const lbl = (k: keyof typeof NEST_I18N.fr) => {
    const dict = NEST_I18N[currentLanguage as keyof typeof NEST_I18N] || NEST_I18N.fr;
    return dict[k] || NEST_I18N.fr[k];
  };

  const formatDateLocale = (d: string | Date) => {
    const dateObj = typeof d === 'string' ? new Date(d) : d;
    const locale = currentLanguage === 'ar' ? 'ar-SA' : currentLanguage === 'en' ? 'en-US' : currentLanguage === 'es' ? 'es-ES' : currentLanguage === 'it' ? 'it-IT' : 'fr-FR';
    return dateObj.toLocaleDateString(locale);
  };

  // Active cycles list
  const activeRepros = reproductions.filter(r => r.statut === 'En cours');
  const [internalSelectedId, setInternalSelectedId] = useState<number | null>(() => {
    if (externalSelectedId !== undefined) return externalSelectedId;
    return activeRepros.length > 0 ? activeRepros[0].id : null;
  });

  const selectedId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;

  const handleSelectNest = (id: number) => {
    setInternalSelectedId(id);
    if (onSelectReproId) onSelectReproId(id);
  };

  // Laying Form State
  const [showPonteModal, setShowPonteModal] = useState(false);
  const [ponteDate, setPonteDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [oeufsCount, setOeufsCount] = useState<number>(4);

  // Quick Candling Modal State
  const [showCandlingModal, setShowCandlingModal] = useState(false);
  const [candlingPonteId, setCandlingPonteId] = useState<number | null>(null);
  const [candlingFertile, setCandlingFertile] = useState<number>(4);

  // Hatch Declaration Form State
  const [showHatchModal, setShowHatchModal] = useState(false);
  const [hatchPonteId, setHatchPonteId] = useState<number | null>(null);
  const [eggsFecondes, setEggsFecondes] = useState<number>(4);
  const [eggsEclos, setEggsEclos] = useState<number>(3);

  // Weaning Form State
  const [weaningJeuneId, setWeaningJeuneId] = useState<number | null>(null);
  const [weanNom, setWeanNom] = useState('');
  const [weanCageId, setWeanCageId] = useState<number>(cagesList[0]?.id || 1);
  const [weanRace, setWeanRace] = useState('Lipochrome');
  const [weanCouleur, setWeanCouleur] = useState('');

  // Banding Modal State & Toast Feedback
  const [showBandingModal, setShowBandingModal] = useState(false);
  const [bandingToast, setBandingToast] = useState<string | null>(null);

  const handleCompleteBanding = (
    bandedBirds: Array<{
      jeuneId: number;
      bird: Omit<Canari, 'id'>;
    }>
  ) => {
    bandedBirds.forEach(item => {
      onWeanJeuneToCanari(item.jeuneId, item.bird.nom, item.bird.cage_id || 1, item.bird.race, item.bird.couleur);
    });
    const toastMsg = currentLanguage === 'ar'
      ? `تم التحجيل بنجاح: تم تحجيل ${bandedBirds.length} فرخ وإضافتها إلى القطيع.`
      : currentLanguage === 'en'
      ? `Banding successful: ${bandedBirds.length} chick(s) ringed and added to flock.`
      : currentLanguage === 'es'
      ? `Anillado exitoso: ${bandedBirds.length} pichón(es) anillados y añadidos al plantel.`
      : currentLanguage === 'it'
      ? `Inanellamento riuscito: ${bandedBirds.length} pullo/i inanellati e aggiunti allo stormo.`
      : `Baguage réussi : ${bandedBirds.length} oisillon(s) bagués avec succès et ajoutés au cheptel.`;
    setBandingToast(toastMsg);
    setTimeout(() => setBandingToast(null), 5000);
  };

  // Currently Selected Reproduction details
  const selectedRepro = reproductions.find(r => r.id === selectedId) || activeRepros[0] || null;
  const relatedCouple = selectedRepro ? couples.find(c => c.id === selectedRepro.couple_id) : null;
  const maleBird = relatedCouple ? canaris.find(b => b.id === relatedCouple.male_id) : null;
  const femaleBird = relatedCouple ? canaris.find(b => b.id === relatedCouple.femelle_id) : null;

  // Pontes of selected cycle
  const currentPontes = selectedRepro 
    ? pontes.filter(p => p.reproduction_id === selectedRepro.id) 
    : [];
  const latestPonte = currentPontes.length > 0 ? currentPontes[currentPontes.length - 1] : null;

  // Chicks of selected cycle
  const currentPonteIds = currentPontes.map(p => p.id);
  const currentJeunes = jeunes.filter(j => currentPonteIds.includes(j.ponte_id));

  // COI calculation
  const cycleCOI = (maleBird && femaleBird) 
    ? calculateInbreedingCOI(maleBird.id, femaleBird.id, canaris) 
    : 0;

  // Handlers
  const handlePonteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRepro && oeufsCount > 0) {
      onAddPonte(selectedRepro.id, ponteDate, oeufsCount);
      setShowPonteModal(false);
    }
  };

  const handleCandlingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (candlingPonteId !== null) {
      const targetPonte = pontes.find(p => p.id === candlingPonteId);
      const eclos = targetPonte?.eclosions || 0;
      onUpdatePonteStats(candlingPonteId, candlingFertile, eclos, 0);
      setShowCandlingModal(false);
      setCandlingPonteId(null);
    }
  };

  const handleHatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hatchPonteId !== null) {
      onUpdatePonteStats(hatchPonteId, eggsFecondes, eggsEclos, 0);
      
      const targetPonte = pontes.find(p => p.id === hatchPonteId);
      const birthDate = targetPonte ? targetPonte.date : new Date().toISOString().split('T')[0];
      
      const hatchEst = new Date(birthDate);
      hatchEst.setDate(hatchEst.getDate() + 13);
      const formattedHatchDate = hatchEst.toISOString().split('T')[0];

      for (let i = 0; i < eggsEclos; i++) {
        onAddJeune(hatchPonteId, '', formattedHatchDate);
      }

      setShowHatchModal(false);
      setHatchPonteId(null);
    }
  };

  const handleWeanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weaningJeuneId !== null) {
      onWeanJeuneToCanari(weaningJeuneId, weanNom, weanCageId, weanRace, weanCouleur);
      setWeaningJeuneId(null);
      setWeanNom('');
      setWeanCouleur('');
    }
  };

  const openCandlingForm = (p: Ponte) => {
    setCandlingPonteId(p.id);
    setCandlingFertile(p.oeufs_fecondes ?? p.oeufs);
    setShowCandlingModal(true);
  };

  const openHatchDeclaration = (p: Ponte) => {
    setHatchPonteId(p.id);
    setEggsFecondes(p.oeufs_fecondes ?? p.oeufs);
    setEggsEclos(p.eclosions ?? Math.min(3, p.oeufs));
    setShowHatchModal(true);
  };

  const openWeaningForm = (j: Jeune) => {
    setWeaningJeuneId(j.id);
    if (maleBird) {
      setWeanRace(maleBird.race || 'Lipochrome');
      setWeanCouleur(maleBird.couleur + ' & ' + (femaleBird?.couleur || 'panaché'));
    }
    const defFatherName = maleBird?.nom || (currentLanguage === 'ar' ? 'الأب' : currentLanguage === 'en' ? 'Sire' : currentLanguage === 'es' ? 'Padre' : currentLanguage === 'it' ? 'Padre' : 'Père');
    const defMotherName = femaleBird?.nom || (currentLanguage === 'ar' ? 'الأم' : currentLanguage === 'en' ? 'Dam' : currentLanguage === 'es' ? 'Madre' : currentLanguage === 'it' ? 'Madre' : 'Mère');
    const defChickName = currentLanguage === 'ar'
      ? `فرخ من ${defFatherName} x ${defMotherName}`
      : currentLanguage === 'en'
      ? `Chick of ${defFatherName} x ${defMotherName}`
      : currentLanguage === 'es'
      ? `Pichón de ${defFatherName} x ${defMotherName}`
      : currentLanguage === 'it'
      ? `Pullo di ${defFatherName} x ${defMotherName}`
      : `Jeune de ${defFatherName} x ${defMotherName}`;
    setWeanNom(defChickName);
    setWeanCageId(cagesList[0]?.id || 1);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Banding Success Feedback Toast */}
      {bandingToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bandingToast}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setBandingToast(null)}
            className="text-emerald-400 hover:text-emerald-200 cursor-pointer p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Carousel / Grid of Active Nests */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Egg className="w-4 h-4" />
            </span>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">
              {lbl('activeNests').replace('{count}', String(activeRepros.length))}
            </h3>
          </div>
        </div>

        {activeRepros.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-dashed border-slate-800 text-center text-slate-400">
            <Egg className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-bold text-sm text-slate-300">
              {lbl('noActiveNests')}
            </p>
            <p className="text-xs mt-1 text-slate-500">
              {lbl('noActiveNestsDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5">
            {activeRepros.map((repro) => {
              const couple = couples.find(c => c.id === repro.couple_id);
              const m = couple ? canaris.find(b => b.id === couple.male_id) : null;
              const f = couple ? canaris.find(b => b.id === couple.femelle_id) : null;
              const reproPontes = pontes.filter(p => p.reproduction_id === repro.id);
              const countEggs = reproPontes.reduce((sum, p) => sum + p.oeufs, 0);
              const countChicks = reproPontes.reduce((sum, p) => sum + (p.eclosions || 0), 0);
              const isSelected = selectedRepro?.id === repro.id;

              // Calculate days elapsed from start date
              const startDate = new Date(repro.date_debut);
              startDate.setHours(0, 0, 0, 0);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const daysDiff = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

              return (
                <div
                  key={repro.id}
                  onClick={() => handleSelectNest(repro.id)}
                  role="button"
                  tabIndex={0}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 text-start relative select-none ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60">
                      {`${lbl('nestPrefix')}${couple?.id || repro.id}`}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700">
                      {`${lbl('dayPrefix')}${daysDiff}`}
                    </span>
                  </div>

                  {/* Parents Identity */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 truncate">
                      <span className="text-blue-400">♂ {m?.nom || lbl('unknownMale')}</span>
                      {m?.espece && <SpeciesBadge speciesId={m.espece} size="sm" showLabel={false} />}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 truncate">
                      <span className="text-pink-400">♀ {f?.nom || lbl('unknownFemale')}</span>
                      {f?.espece && <SpeciesBadge speciesId={f.espece} size="sm" showLabel={false} />}
                    </div>
                  </div>

                  {/* Egg & Chick Counts */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Egg className="w-3.5 h-3.5 text-amber-400" />
                      <strong className="text-slate-200">{countEggs}</strong> {lbl('eggs')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <strong className="text-slate-200">{countChicks}</strong> {lbl('hatched')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Workspace for the Selected Nest */}
      {selectedRepro && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Columns: Egg Matrix & Incubation Timeline */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            
            {/* 1. Egg Matrix Card */}
            <EggMatrixCard
              clutchId={latestPonte ? latestPonte.id : undefined}
              layingDate={latestPonte ? latestPonte.date : selectedRepro.date_debut}
              totalEggs={latestPonte ? latestPonte.oeufs : 4}
              fertileCount={latestPonte?.oeufs_fecondes}
              hatchedCount={latestPonte?.eclosions}
              onQuickCandling={() => latestPonte ? openCandlingForm(latestPonte) : setShowPonteModal(true)}
              onEditClutch={() => setShowPonteModal(true)}
              title={lbl('eggMatrixTitle').replace('{id}', String(relatedCouple?.id || selectedRepro.id))}
              subtitle={latestPonte 
                ? lbl('clutchRecorded').replace('{date}', formatDateLocale(latestPonte.date))
                : lbl('noClutchCycle')}
            />

            {/* 2. Incubation Milestones Timeline */}
            <IncubationTimeline
              clutchStartDate={latestPonte ? latestPonte.date : selectedRepro.date_debut}
              onCandlingAction={() => latestPonte ? openCandlingForm(latestPonte) : setShowPonteModal(true)}
              onHatchingAction={() => latestPonte ? openHatchDeclaration(latestPonte) : setShowPonteModal(true)}
              onBandingAction={() => setShowBandingModal(true)}
            />

            {/* 3. Layings and Chicks Management */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Feather className="w-4 h-4 text-emerald-400" />
                  <span>{lbl('chicksAndClutches').replace('{id}', String(selectedRepro.id))}</span>
                </h4>

                <div className="flex items-center gap-2">
                  {currentJeunes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowBandingModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20 select-none"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{lbl('bandBatchBtn')}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPonteDate(new Date().toISOString().split('T')[0]);
                      setShowPonteModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-98 select-none"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lbl('addClutchBtn')}</span>
                  </button>
                </div>
              </div>

              {/* Chicks born in this cycle */}
              {currentJeunes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-bold text-slate-400">
                      {lbl('bornChicksTitle').replace('{count}', String(currentJeunes.length))}
                    </h5>
                    <button
                      type="button"
                      onClick={() => setShowBandingModal(true)}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3 h-3" />
                      <span>{lbl('openBandingAssistant')}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentJeunes.map((j) => (
                      <div key={j.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-slate-200">
                            {j.bague 
                              ? lbl('ringLabel').replace('{band}', j.bague) 
                              : lbl('chickNumber').replace('{id}', String(j.id))}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {`${lbl('bornOn')}${formatDateLocale(j.date_naissance)} • ${j.statut === 'En sevrage' ? lbl('inWeaning') : j.statut}`}
                          </div>
                        </div>

                        {j.statut === 'En sevrage' && (
                          <button
                            type="button"
                            onClick={() => openWeaningForm(j)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[10px] cursor-pointer"
                          >
                            {lbl('weanAction')}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Nest Summary, Parents & Inbreeding Risk */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            
            {/* Pair Card */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <span className="font-mono text-xs font-bold text-indigo-400">
                  {lbl('couplePrefix').replace('{id}', String(relatedCouple?.id || selectedRepro.couple_id))}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                  {lbl('activeStatus')}
                </span>
              </div>

              {/* Male Identity */}
              <div className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">
                    {lbl('maleLabel')}
                  </span>
                  {maleBird?.espece && <SpeciesBadge speciesId={maleBird.espece} size="sm" showLabel={false} />}
                </div>
                <div className="font-bold text-slate-100 text-sm truncate">{maleBird?.nom || lbl('unknownMale')}</div>
                <div className="font-mono text-[10px] text-slate-400">
                  {lbl('ringLabel').replace('{band}', maleBird?.bague || '—')}
                </div>
                {maleBird && <div className="text-[10px] text-slate-400">{maleBird.race} • {maleBird.couleur}</div>}
              </div>

              {/* Female Identity */}
              <div className="p-3 bg-pink-950/30 border border-pink-900/50 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-pink-400 uppercase tracking-wider">
                    {lbl('femaleLabel')}
                  </span>
                  {femaleBird?.espece && <SpeciesBadge speciesId={femaleBird.espece} size="sm" showLabel={false} />}
                </div>
                <div className="font-bold text-slate-100 text-sm truncate">{femaleBird?.nom || lbl('unknownFemale')}</div>
                <div className="font-mono text-[10px] text-slate-400">
                  {lbl('ringLabel').replace('{band}', femaleBird?.bague || '—')}
                </div>
                {femaleBird && <div className="text-[10px] text-slate-400">{femaleBird.race} • {femaleBird.couleur}</div>}
              </div>

              {/* Inbreeding Risk Gauge */}
              {maleBird && femaleBird && (
                <WrightConsanguinityGauge
                  coefficient={cycleCOI}
                  title={lbl('coupleCOITitle')}
                  size="sm"
                  variant="card"
                />
              )}

              {/* Close Cycle Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onCloseReproduction(selectedRepro.id)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-400 hover:text-rose-400 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 select-none"
                >
                  <span>{lbl('closeCycleBtn')}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* --- MODALS --- */}

      {/* 1. Laying Declaration Modal */}
      <AppModal
        isOpen={showPonteModal}
        onClose={() => setShowPonteModal(false)}
        title={lbl('modalPonteTitle')}
        size="md"
      >
        <form onSubmit={handlePonteSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {lbl('modalPonteDate')}
            </label>
            <input
              type="date"
              required
              value={ponteDate}
              onChange={(e) => setPonteDate(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2 border border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {lbl('modalPonteEggs')}
            </label>
            <input
              type="number"
              required
              min={1}
              max={10}
              value={oeufsCount}
              onChange={(e) => setOeufsCount(Number(e.target.value))}
              className="w-full bg-slate-950 text-slate-100 p-2 border border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPonteModal(false)}
              className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              {lbl('cancelBtn')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-sm"
            >
              {lbl('savePonteBtn')}
            </button>
          </div>
        </form>
      </AppModal>

      {/* 2. Quick Candling Modal */}
      <AppModal
        isOpen={showCandlingModal}
        onClose={() => setShowCandlingModal(false)}
        title={lbl('modalCandlingTitle')}
        size="md"
      >
        <form onSubmit={handleCandlingSubmit} className="space-y-4 text-xs">
          <p className="text-slate-400 leading-relaxed">
            {lbl('modalCandlingDesc')}
          </p>
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {lbl('modalFertileEggs')}
            </label>
            <input
              type="number"
              required
              min={0}
              max={latestPonte?.oeufs || 10}
              value={candlingFertile}
              onChange={(e) => setCandlingFertile(Number(e.target.value))}
              className="w-full bg-slate-950 text-slate-100 p-2 border border-slate-800 rounded-xl text-xs focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowCandlingModal(false)}
              className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              {lbl('cancelBtn')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-sm"
            >
              {lbl('saveCandlingBtn')}
            </button>
          </div>
        </form>
      </AppModal>

      {/* 3. Hatch Declaration Modal */}
      <AppModal
        isOpen={showHatchModal}
        onClose={() => setShowHatchModal(false)}
        title={lbl('modalHatchTitle')}
        size="md"
      >
        <form onSubmit={handleHatchSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                {lbl('modalFertileEggs')}
              </label>
              <input
                type="number"
                required
                min={0}
                max={10}
                value={eggsFecondes}
                onChange={(e) => setEggsFecondes(Number(e.target.value))}
                className="w-full bg-slate-950 text-slate-100 p-2 border border-slate-800 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                {lbl('modalHatchedChicks')}
              </label>
              <input
                type="number"
                required
                min={0}
                max={10}
                value={eggsEclos}
                onChange={(e) => setEggsEclos(Number(e.target.value))}
                className="w-full bg-slate-950 text-slate-100 p-2 border border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowHatchModal(false)}
              className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              {lbl('cancelBtn')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-sm"
            >
              {lbl('saveHatchBtn')}
            </button>
          </div>
        </form>
      </AppModal>

      {/* 4. Weaning Modal */}
      <AppModal
        isOpen={weaningJeuneId !== null}
        onClose={() => setWeaningJeuneId(null)}
        title={lbl('modalWeanTitle')}
        size="md"
      >
        <form onSubmit={handleWeanSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              {lbl('modalWeanName')}
            </label>
            <input
              type="text"
              required
              value={weanNom}
              onChange={(e) => setWeanNom(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 p-2 border border-slate-800 rounded-xl text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                {lbl('modalWeanBreed')}
              </label>
              <input
                type="text"
                required
                value={weanRace}
                onChange={(e) => setWeanRace(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 p-2 border border-slate-800 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">
                {lbl('modalWeanCage')}
              </label>
              <select
                value={weanCageId}
                onChange={(e) => setWeanCageId(Number(e.target.value))}
                className="w-full bg-slate-950 text-slate-100 p-2 border border-slate-800 rounded-xl text-xs"
              >
                {cagesList.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setWeaningJeuneId(null)}
              className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
            >
              {lbl('cancelBtn')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black cursor-pointer shadow-sm"
            >
              {lbl('saveWeanBtn')}
            </button>
          </div>
        </form>
      </AppModal>

      {/* Batch Banding Modal */}
      {selectedRepro && (
        <BandingBatchModal
          isOpen={showBandingModal}
          onClose={() => setShowBandingModal(false)}
          reproductionId={selectedRepro.id}
          sire={maleBird ?? null}
          dam={femaleBird ?? null}
          allBirds={canaris}
          chicks={currentJeunes}
          cagesList={cagesList}
          onCompleteBanding={handleCompleteBanding}
        />
      )}
    </div>
  );
};
