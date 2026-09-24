/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Layers, CheckSquare, Square, Search, Droplet, Utensils, Calculator, 
  Calendar, Clock, ShieldAlert, CheckCircle2, Sparkles, X, AlertCircle, 
  Check, Info, ChevronRight, Filter 
} from 'lucide-react';
import { Canari, Cage, HabitatCage } from '../../../types';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { HealthService } from '../services/HealthService';
import { CalendarService } from '../../platform/services/CalendarService';
import { AppButton, AppInput, AppSelect } from '../../../components/design-system';
import { useLanguage } from '../../../context/LanguageContext';

export interface BatchTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (batchResult: {
    batchId: string;
    treatmentName: string;
    targetBirdsCount: number;
    affectedLocationsCount: number;
    startDate: string;
  }) => void;
  allBirds?: Canari[];
  allCages?: (Cage | HabitatCage)[];
}

export interface PresetMedication {
  id: string;
  name: string;
  category: 'Coccidiose' | 'Vermifuge' | 'Vitamines' | 'Antiparasitaire' | 'Probiotiques' | 'Autre';
  defaultRoute: 'water' | 'food';
  defaultConcentration: string;
  unit: string;
  concentrationPerUnit: number; // e.g. 2 ml/L or 5 g/kg
  recommendedDays: number;
  description: string;
  steps: { day: number; label: string; ratio: number; note: string }[];
}

export const PRESET_MEDICATIONS: PresetMedication[] = [
  {
    id: 'baycox',
    name: 'Baycox 2.5% (Toltrazuril)',
    category: 'Coccidiose',
    defaultRoute: 'water',
    defaultConcentration: '2.0 ml / Litre d’eau',
    unit: 'ml/L',
    concentrationPerUnit: 2.0,
    recommendedDays: 5,
    description: 'Traitement anticoccidien à large spectre. Éradication des oocystes intestinaux.',
    steps: [
      { day: 1, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Traitement d’attaque' },
      { day: 2, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Consolidation' },
      { day: 3, label: 'Repos eau pure (0%)', ratio: 0.0, note: 'Rinçage rénal & hydratation' },
      { day: 4, label: 'Rappel 1/2 dose (50%)', ratio: 0.5, note: 'Élimination résiduelle' },
      { day: 5, label: 'Rappel 1/2 dose (50%)', ratio: 0.5, note: 'Fin de protocole' }
    ]
  },
  {
    id: 'vermifuge_polyvalent',
    name: 'Vermifuge Polyvalent (Lévamisole)',
    category: 'Vermifuge',
    defaultRoute: 'water',
    defaultConcentration: '1.5 ml / Litre d’eau',
    unit: 'ml/L',
    concentrationPerUnit: 1.5,
    recommendedDays: 5,
    description: 'Assainissement vermifuge collectif du cheptel avant la saison de reproduction.',
    steps: [
      { day: 1, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Administration principale' },
      { day: 2, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Consolidation' },
      { day: 3, label: 'Repos eau pure (0%)', ratio: 0.0, note: 'Repos hépatique' },
      { day: 4, label: 'Probiotiques (0%)', ratio: 0.0, note: 'Régénération flore' },
      { day: 5, label: 'Bilan & Fientes (0%)', ratio: 0.0, note: 'Contrôle visuel' }
    ]
  },
  {
    id: 'vitamines_e_selenium',
    name: 'Vitamines E + Sélénium (Fertilité)',
    category: 'Vitamines',
    defaultRoute: 'water',
    defaultConcentration: '3.0 ml / Litre d’eau',
    unit: 'ml/L',
    concentrationPerUnit: 3.0,
    recommendedDays: 5,
    description: 'Stimulation de la spermatogenèse et synchronisation hormonale des reproducteurs.',
    steps: [
      { day: 1, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Début de cure' },
      { day: 2, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Cure active' },
      { day: 3, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Cure active' },
      { day: 4, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Cure active' },
      { day: 5, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Fin de cure' }
    ]
  },
  {
    id: 'complexe_mue_b',
    name: 'Complexe Vitamines B & Acides Aminés',
    category: 'Vitamines',
    defaultRoute: 'food',
    defaultConcentration: '10.0 g / kg de pâtée',
    unit: 'g/kg',
    concentrationPerUnit: 10.0,
    recommendedDays: 5,
    description: 'Apport protéique et en biotine pour la régénération du plumage et la kératine.',
    steps: [
      { day: 1, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Mélange pâtée fraîche' },
      { day: 2, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Mélange pâtée fraîche' },
      { day: 3, label: 'Pâtée simple (0%)', ratio: 0.0, note: 'Pause' },
      { day: 4, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Mélange pâtée fraîche' },
      { day: 5, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Bilan plumage' }
    ]
  },
  {
    id: 'probiotiques_electrolytes',
    name: 'Probiotiques & Électrolytes',
    category: 'Probiotiques',
    defaultRoute: 'water',
    defaultConcentration: '5.0 g / Litre d’eau',
    unit: 'g/L',
    concentrationPerUnit: 5.0,
    recommendedDays: 5,
    description: 'Régénération de la barrière intestinale et réhydratation après stress ou traitement.',
    steps: [
      { day: 1, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Ensemencement' },
      { day: 2, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Ensemencement' },
      { day: 3, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Stabilisation' },
      { day: 4, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Stabilisation' },
      { day: 5, label: 'Dose pleine (100%)', ratio: 1.0, note: 'Flore optimale' }
    ]
  }
];

export const BatchTreatmentModal: React.FC<BatchTreatmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  allBirds: propBirds,
  allCages: propCages
}) => {
  const { t, isRtl } = useLanguage();
  // Load birds and cages from props or repositories
  const birds = useMemo(() => {
    return propBirds || BirdRepository.getAll();
  }, [propBirds]);

  const cages = useMemo(() => {
    if (propCages && propCages.length > 0) return propCages;
    try {
      const habitatCages = HabitatRepository.getAll<HabitatCage>('cage');
      if (habitatCages && habitatCages.length > 0) return habitatCages;
    } catch {}
    return [];
  }, [propCages]);

  // Aggregate locations and their resident bird counts
  const locationGroups = useMemo(() => {
    // Group birds by cage_id or cageId
    const locationMap = new Map<string | number, {
      id: string | number;
      name: string;
      type: string;
      birds: Canari[];
    }>();

    // Initialize with known cages
    cages.forEach(c => {
      const cId = c.id;
      const cName = (c as any).nom || (c as any).code || `Cage #${cId}`;
      const cType = (c as any).type || 'cage';
      locationMap.set(cId, {
        id: cId,
        name: cName,
        type: cType,
        birds: []
      });
    });

    // Populate birds into locations
    const unassignedBirds: Canari[] = [];
    birds.forEach(b => {
      const targetCageId = b.cage_id ?? (b as any).cageId;
      if (targetCageId !== undefined && targetCageId !== null && locationMap.has(targetCageId)) {
        locationMap.get(targetCageId)!.birds.push(b);
      } else {
        unassignedBirds.push(b);
      }
    });

    const groups = Array.from(locationMap.values());
    if (unassignedBirds.length > 0) {
      groups.push({
        id: '__unassigned__',
        name: 'Oiseaux sans cage assignée',
        type: 'autre',
        birds: unassignedBirds
      });
    }

    return groups.sort((a, b) => b.birds.length - a.birds.length);
  }, [birds, cages]);

  // Target Location Selection State
  const [searchLocationQuery, setSearchLocationQuery] = useState('');
  const [selectedLocationIds, setSelectedLocationIds] = useState<Set<string | number>>(() => {
    // Default select all locations with birds
    return new Set(locationGroups.filter(g => g.birds.length > 0).map(g => g.id));
  });

  // Filtered Locations
  const filteredLocationGroups = useMemo(() => {
    if (!searchLocationQuery.trim()) return locationGroups;
    const q = searchLocationQuery.toLowerCase();
    return locationGroups.filter(g => g.name.toLowerCase().includes(q) || g.type.toLowerCase().includes(q));
  }, [locationGroups, searchLocationQuery]);

  // Selected Birds Calculation
  const selectedBirds = useMemo(() => {
    return locationGroups
      .filter(g => selectedLocationIds.has(g.id))
      .flatMap(g => g.birds);
  }, [locationGroups, selectedLocationIds]);

  // Protocol Configuration State
  const [selectedMedicationId, setSelectedMedicationId] = useState<string>('baycox');
  const [customMedicationName, setCustomMedicationName] = useState('');
  const [adminRoute, setAdminRoute] = useState<'water' | 'food'>('water');
  const [preparationVolume, setPreparationVolume] = useState<number>(5.0); // e.g. 5 Litres of water or 2.5 kg of food
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [syncMedicalFiles, setSyncMedicalFiles] = useState(true);
  const [syncCalendarReminders, setSyncCalendarReminders] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Selected Medication Preset
  const currentMedication = useMemo(() => {
    return PRESET_MEDICATIONS.find(m => m.id === selectedMedicationId) || PRESET_MEDICATIONS[0];
  }, [selectedMedicationId]);

  // Update route when medication changes
  React.useEffect(() => {
    setAdminRoute(currentMedication.defaultRoute);
  }, [currentMedication]);

  // Dosage Computations
  const computedDosage = useMemo(() => {
    const totalDose = Number((preparationVolume * currentMedication.concentrationPerUnit).toFixed(2));
    const perSubjectEstimate = selectedBirds.length > 0
      ? Number((totalDose / selectedBirds.length).toFixed(3))
      : 0;

    return {
      totalDose,
      unit: adminRoute === 'water' ? 'ml' : 'g',
      perSubjectEstimate
    };
  }, [preparationVolume, currentMedication, selectedBirds.length, adminRoute]);

  // 5-Day Planning Steps with actual dates
  const planningSchedule = useMemo(() => {
    const start = new Date(startDate);
    return currentMedication.steps.map(step => {
      const stepDate = new Date(start);
      stepDate.setDate(start.getDate() + (step.day - 1));
      const dateFormatted = stepDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      return {
        ...step,
        dateFormatted,
        isoDate: stepDate.toISOString().split('T')[0]
      };
    });
  }, [startDate, currentMedication]);

  // Selection handlers
  const toggleLocation = (id: string | number) => {
    setSelectedLocationIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllLocations = () => {
    setSelectedLocationIds(new Set(locationGroups.map(g => g.id)));
  };

  const clearAllLocations = () => {
    setSelectedLocationIds(new Set());
  };

  // Submit Handler
  const handleValidateProtocol = () => {
    if (selectedBirds.length === 0) return;

    const batchId = `BATCH-SANTE-${Date.now().toString(36).toUpperCase()}`;
    const treatmentName = selectedMedicationId === 'custom' 
      ? customMedicationName.trim() || 'Traitement Collectif Personnalisé' 
      : currentMedication.name;

    const protocolDesc = `[Lot #${batchId}] Voie: ${adminRoute === 'water' ? 'Eau de boisson' : 'Pâtée'}. Préparation: ${preparationVolume} ${adminRoute === 'water' ? 'L' : 'kg'} (${computedDosage.totalDose}${computedDosage.unit}). ${currentMedication.description}`;

    // 1. Batch append medical records to each bird
    if (syncMedicalFiles) {
      selectedBirds.forEach(bird => {
        HealthService.addRecord({
          canari_id: bird.id,
          date: startDate,
          categorie: 'Traitement',
          traitement: treatmentName,
          description: protocolDesc,
          statut: 'En attente'
        });
      });
    }

    // 2. Create Calendar Events for the 5-day schedule
    if (syncCalendarReminders) {
      planningSchedule.forEach(step => {
        CalendarService.addCustomEvent(
          `🏥 [J${step.day}] ${treatmentName} (${step.label})`,
          `Traitement collectif #${batchId} pour ${selectedBirds.length} sujets. Note: ${step.note}.`,
          step.isoDate,
          'treatment',
          step.ratio > 0 ? 'high' : 'medium'
        );
      });
    }

    setFeedbackToast(`Protocole validé avec succès ! ${selectedBirds.length} dossiers médicaux mis à jour.`);

    setTimeout(() => {
      if (onSuccess) {
        onSuccess({
          batchId,
          treatmentName,
          targetBirdsCount: selectedBirds.length,
          affectedLocationsCount: selectedLocationIds.size,
          startDate
        });
      }
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#030712]/80 backdrop-blur-md animate-fadeIn">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Console de Traitement Collectif & Assainissement du Cheptel
              </h2>
            </div>
            <p className="text-3xs text-slate-400">
              Paramétrez et appliquez un protocole médical simultané à un ensemble de volières ou de batteries.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns on Desktop */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Toast Notification */}
          {feedbackToast && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-lg animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{feedbackToast}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Target Selector Panel (5 Cols) */}
            <div className="lg:col-span-5 space-y-4 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5">
              
              <div className="flex items-center justify-between">
                <span className="text-3xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  1. Cibles & Volières
                </span>

                {/* Subject counter badge */}
                <div className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                  Total : {selectedBirds.length} Sujets
                </div>
              </div>

              {/* Search filter input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchLocationQuery}
                  onChange={e => setSearchLocationQuery(e.target.value)}
                  placeholder="Rechercher une volière ou cage..."
                  className="w-full text-2xs bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Select / Deselect */}
              <div className="flex items-center justify-between text-3xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={selectAllLocations}
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
                >
                  Tout sélectionner
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={clearAllLocations}
                  className="text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
                >
                  Tout désélectionner
                </button>
              </div>

              {/* Locations Checkbox List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {filteredLocationGroups.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-3xs">
                    Aucun emplacement correspondant.
                  </div>
                ) : (
                  filteredLocationGroups.map(loc => {
                    const isSelected = selectedLocationIds.has(loc.id);
                    return (
                      <div
                        key={loc.id}
                        onClick={() => toggleLocation(loc.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-600/10 border-blue-500/40 text-white'
                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <div className="truncate">
                            <div className="text-xs font-bold truncate leading-tight">
                              {loc.name}
                            </div>
                            <div className="text-4xs text-slate-500 font-mono uppercase">
                              {loc.type}
                            </div>
                          </div>
                        </div>

                        <span className={`text-3xs font-mono font-bold px-2 py-0.5 rounded-md ${
                          loc.birds.length > 0
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-slate-950 text-slate-600'
                        }`}>
                          {loc.birds.length} oiseau{loc.birds.length > 1 ? 'x' : ''}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right Column: Protocol Configuration & 5-Day Visualizer (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Protocol Configuration Box */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-4">
                <span className="text-3xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-amber-400" />
                  2. Configuration du Médicament & Posologie
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Medication Select */}
                  <AppSelect
                    label="Médicament / Molécule active *"
                    value={selectedMedicationId}
                    onChange={(e: any) => setSelectedMedicationId(e.target.value)}
                    options={PRESET_MEDICATIONS.map(m => ({
                      value: m.id,
                      label: `${m.name} (${m.category})`
                    }))}
                  />

                  {/* Start Date */}
                  <AppInput
                    label={t('batchTreatmentStartDate')}
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />

                </div>

                {/* Administration Mode Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400">Mode d'administration</label>
                  <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setAdminRoute('water')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        adminRoute === 'water'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Droplet className="w-4 h-4 text-cyan-400" />
                      <span>💧 Eau de boisson</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminRoute('food')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        adminRoute === 'food'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Utensils className="w-4 h-4 text-amber-300" />
                      <span>🍴 Pâtée / Nourriture</span>
                    </button>
                  </div>
                </div>

                {/* Volume & Dosage Calculator */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-300">
                      Volume préparé ({adminRoute === 'water' ? 'Litres d\'eau' : 'kg de pâtée'})
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 5, 10].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setPreparationVolume(v)}
                          className={`px-2 py-0.5 rounded text-3xs font-mono font-bold cursor-pointer ${
                            preparationVolume === v
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {v}{adminRoute === 'water' ? 'L' : 'kg'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={preparationVolume}
                      onChange={e => setPreparationVolume(Math.max(0.1, parseFloat(e.target.value) || 1))}
                      className="w-24 text-xs font-mono font-bold bg-slate-950 border border-slate-700 rounded-lg p-2 text-white outline-none"
                    />

                    {/* Auto Dosage Live Output */}
                    <div className="flex-1 px-3 py-2 rounded-lg bg-emerald-950/60 border border-emerald-600/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-4xs uppercase tracking-wider text-emerald-400 font-bold">
                          Dose Totale Recommandée
                        </div>
                        <div className="text-sm font-black font-mono text-emerald-300">
                          {computedDosage.totalDose} {computedDosage.unit} de {currentMedication.name.split(' ')[0]}
                        </div>
                      </div>
                      <span className="text-3xs text-emerald-400/80 font-mono">
                        ~{computedDosage.perSubjectEstimate}{computedDosage.unit}/sujet
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic 5-Day Planning Visualizer */}
              <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    3. Visualiseur de Protocole sur 5 Jours
                  </span>
                  <span className="text-3xs font-mono text-slate-500">
                    Début : {startDate}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
                  {planningSchedule.map((step) => {
                    const isFull = step.ratio === 1.0;
                    const isHalf = step.ratio === 0.5;
                    const isRest = step.ratio === 0.0;

                    return (
                      <div
                        key={step.day}
                        className={`p-2 sm:p-2.5 rounded-xl border text-center space-y-1 transition-all ${
                          isFull
                            ? 'bg-blue-950/60 border-blue-500/40 text-blue-200'
                            : isHalf
                              ? 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="text-4xs font-mono font-bold uppercase text-slate-400">
                          J{step.day} • {step.dateFormatted}
                        </div>

                        <div className={`text-2xs font-extrabold leading-tight ${
                          isFull ? 'text-blue-300' : isHalf ? 'text-amber-300' : 'text-slate-300'
                        }`}>
                          {step.label.split(' ')[0]} {step.label.split(' ')[1] || ''}
                        </div>

                        <div className="text-4xs text-slate-400 line-clamp-1">
                          {step.note}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* Safety Sync Checkbox Section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-200 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncMedicalFiles}
                onChange={e => setSyncMedicalFiles(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
              />
              <span>
                <strong>Mise à jour groupée automatique :</strong> {selectedBirds.length} dossiers médicaux individuels d'oiseaux seront modifiés et horodatés.
              </span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-400 font-medium cursor-pointer select-none pl-6">
              <input
                type="checkbox"
                checked={syncCalendarReminders}
                onChange={e => setSyncCalendarReminders(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 cursor-pointer"
              />
              <span>
                Synchroniser les 5 jalons de rappel dans le <strong>Calendrier d'Élevage</strong>.
              </span>
            </label>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-t border-slate-800 bg-slate-950/90 shrink-0 flex-wrap gap-3">
          
          <div className="text-3xs text-slate-400 font-mono">
            {selectedBirds.length > 0 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {selectedBirds.length} oiseaux sélectionnés dans {selectedLocationIds.size} emplacement(s)
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Sélectionnez au moins un emplacement pour continuer
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <AppButton
              variant="outline"
              size="md"
              onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 min-h-[44px]"
            >
              Annuler
            </AppButton>

            <AppButton
              variant="primary"
              size="md"
              disabled={selectedBirds.length === 0}
              onClick={handleValidateProtocol}
              startIcon={<Sparkles className="w-4 h-4 text-blue-300" />}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-lg shadow-blue-600/30 focus:ring-4 focus:ring-blue-500/50 min-h-[44px] px-6 text-sm"
            >
              Valider le protocole collectif
            </AppButton>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BatchTreatmentModal;
