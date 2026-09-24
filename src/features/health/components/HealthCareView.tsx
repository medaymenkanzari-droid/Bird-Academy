/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  HeartPulse, ShieldCheck, AlertTriangle, Activity, Plus, ShieldAlert, 
  Calendar, Clock, CheckCircle2, Stethoscope, Droplet, Pill, Sparkles, 
  ChevronRight, RefreshCw, User, Scale, Bookmark, Layers 
} from 'lucide-react';
import { Canari, Sante } from '../../../types';
import { WeightTrackerChart } from './WeightTrackerChart';
import { TreatmentHistoryTimeline } from './TreatmentHistoryTimeline';
import { ClinicalNotesCard } from './ClinicalNotesCard';
import { STANDARD_HEALTH_PROTOCOLS, StandardHealthProtocol } from '../models/health';
import { BatchTreatmentModal } from './BatchTreatmentModal';
import { PassportDataService } from '../../birds/services/PassportDataService';
import { HealthService } from '../services/HealthService';
import { BirdService } from '../../birds/services/BirdService';
import { AppButton, AppBadge, AppModal, AppInput, AppSelect } from '../../../components/design-system';
import { useLanguage } from '../../../context/LanguageContext';

export interface HealthCareViewProps {
  bird: Canari;
  allBirds?: Canari[];
  santeRecords?: Sante[];
  onRefreshBird?: (updated: Canari) => void;
  onRefreshHealth?: () => void;
  className?: string;
}

export const HealthCareView: React.FC<HealthCareViewProps> = ({
  bird,
  allBirds = [],
  santeRecords: propSanteRecords,
  onRefreshBird,
  onRefreshHealth,
  className = ''
}) => {
  const { t, isRtl } = useLanguage();
  // Local state for records & bird
  const [currentBird, setCurrentBird] = useState<Canari>(bird);
  const [records, setRecords] = useState<Sante[]>(() => {
    return propSanteRecords || HealthService.getRecords().filter(r => r.canari_id === bird.id);
  });
  const [weightLogs, setWeightLogs] = useState(() => {
    return PassportDataService.getWeightLogsForBird(bird.id, bird);
  });

  // Modals state
  const [isAddSoinModalOpen, setIsAddSoinModalOpen] = useState(false);
  const [isAddWeightModalOpen, setIsAddWeightModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedProtocolToApply, setSelectedProtocolToApply] = useState<StandardHealthProtocol | null>(null);

  // Form for quick new treatment modal
  const [formCategory, setFormCategory] = useState<Sante['categorie']>('Traitement');
  const [formTreatment, setFormTreatment] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState<Sante['statut']>('Terminé');

  // Form for weight modal
  const [formWeight, setFormWeight] = useState('');
  const [formWeightDate, setFormWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [formWeightNotes, setFormWeightNotes] = useState('');

  // Synchronize when props change
  React.useEffect(() => {
    setCurrentBird(bird);
    setRecords(propSanteRecords || HealthService.getRecords().filter(r => r.canari_id === bird.id));
    setWeightLogs(PassportDataService.getWeightLogsForBird(bird.id, bird));
  }, [bird, propSanteRecords]);

  // Determine current health state
  const isQuarantine = currentBird.statut_sante === 'Quarantaine';
  const isSick = currentBird.statut_sante === 'Malade';
  const activeTreatmentsCount = records.filter(r => r.statut === 'En attente').length;

  const healthStatusHero = useMemo(() => {
    if (isQuarantine) {
      return {
        label: 'En Quarantaine',
        sublabel: 'Protocole d’isolement sanitaire préventif actif',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: ShieldAlert,
        iconColor: 'text-amber-400',
        glowColor: 'bg-amber-500/10'
      };
    }
    if (isSick || activeTreatmentsCount > 0) {
      return {
        label: 'Sous Traitement',
        sublabel: `${activeTreatmentsCount} soin(s) ou protocole(s) en cours de suivi`,
        badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        icon: Activity,
        iconColor: 'text-blue-400',
        glowColor: 'bg-blue-500/10'
      };
    }
    return {
      label: 'En Forme • Sain',
      sublabel: 'Aucune affection détectée, état physique optimal',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      glowColor: 'bg-emerald-500/10'
    };
  }, [isQuarantine, isSick, activeTreatmentsCount]);

  // Imminent reminders calculation (e.g. pending treatments or upcoming season protocols)
  const imminentReminders = useMemo(() => {
    const reminders: { title: string; date: string; tag: string; isUrgent?: boolean }[] = [];

    // Scheduled records
    records.filter(r => r.statut === 'En attente').forEach(r => {
      reminders.push({
        title: `Rappel : ${r.traitement}`,
        date: r.date,
        tag: r.categorie,
        isUrgent: true
      });
    });

    // If no active reminder, add a smart seasonal reminder based on the date
    if (reminders.length === 0) {
      const nextDate = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
      reminders.push({
        title: 'Rappel préventif : Vermifuge semestriel d’élevage',
        date: nextDate,
        tag: 'Prévention',
        isUrgent: false
      });
    }

    return reminders;
  }, [records]);

  // Toggle Quarantine handler
  const handleToggleQuarantine = () => {
    const newStatus = isQuarantine ? 'Actif' : 'Quarantaine';
    const updated: Canari = {
      ...currentBird,
      statut_sante: newStatus
    };
    BirdService.editBird(updated);
    setCurrentBird(updated);
    if (onRefreshBird) onRefreshBird(updated);
  };

  // Add Health Record
  const handleAddSoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTreatment.trim()) return;

    const res = HealthService.addRecord({
      canari_id: currentBird.id,
      date: formDate,
      categorie: formCategory,
      traitement: formTreatment.trim(),
      description: formDesc.trim(),
      statut: formStatus
    });

    if (res.success && res.data) {
      setRecords(prev => [res.data!, ...prev]);
      if (onRefreshHealth) onRefreshHealth();
    }

    setIsAddSoinModalOpen(false);
    setFormTreatment('');
    setFormDesc('');
  };

  // Complete Record
  const handleCompleteRecord = (id: number) => {
    HealthService.completeRecord(id);
    setRecords(prev => prev.map(r => r.id === id ? { ...r, statut: 'Terminé' } : r));
    if (onRefreshHealth) onRefreshHealth();
  };

  // Delete Record
  const handleDeleteRecord = (id: number) => {
    HealthService.deleteRecord(id);
    setRecords(prev => prev.filter(r => r.id !== id));
    if (onRefreshHealth) onRefreshHealth();
  };

  // Add Weight Submit
  const handleAddWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(formWeight);
    if (isNaN(val) || val <= 0) return;

    const added = PassportDataService.addWeightLog({
      birdId: currentBird.id,
      date: formWeightDate,
      weightGrams: val,
      context: 'routine',
      notes: formWeightNotes.trim()
    });

    setWeightLogs(prev => [added, ...prev]);
    setIsAddWeightModalOpen(false);
    setFormWeight('');
    setFormWeightNotes('');
  };

  // Quick Apply Standard Protocol
  const handleApplyProtocol = (proto: StandardHealthProtocol) => {
    const res = HealthService.addRecord({
      canari_id: currentBird.id,
      date: new Date().toISOString().split('T')[0],
      categorie: proto.category === 'Vermifuge' || proto.category === 'Antiparasitaire' || proto.category === 'Vitamines' ? 'Traitement' : 'Traitement',
      traitement: proto.title,
      description: `[${proto.defaultRoute}] Dosage: ${proto.defaultDosage}. ${proto.description}`,
      statut: 'Terminé'
    });

    if (res.success && res.data) {
      setRecords(prev => [res.data!, ...prev]);
      if (onRefreshHealth) onRefreshHealth();
    }
    setSelectedProtocolToApply(null);
  };

  return (
    <div className={`space-y-6 text-slate-100 font-sans ${className}`}>
      
      {/* 1. Top Health Status Hero */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden">
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-30 pointer-events-none ${healthStatusHero.glowColor}`} />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Left Status & Alert */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 shadow-md ${healthStatusHero.badgeBg}`}>
                <healthStatusHero.icon className="w-4 h-4" />
                {healthStatusHero.label}
              </span>
              <span className="text-3xs text-slate-400 font-mono">
                Dernier contrôle : {records.length > 0 ? records[0].date : 'Aujourd’hui'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Pôle Santé, Soins & Protocoles Médicaux
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              {healthStatusHero.sublabel} pour <strong>{currentBird.nom || currentBird.bague}</strong> ({currentBird.race || 'Canari'}).
            </p>

            {/* Imminent Reminder Alert Banner */}
            {imminentReminders.length > 0 && (
              <div className="pt-2">
                <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="font-bold text-amber-200">
                      {imminentReminders[0].title}
                    </span>
                    <span className="text-3xs font-mono text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800">
                      Échéance {imminentReminders[0].date}
                    </span>
                  </div>
                  <span className="text-3xs font-extrabold uppercase text-amber-400 tracking-wider hidden sm:inline-block">
                    {imminentReminders[0].tag}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            <AppButton
              variant="primary"
              size="sm"
              onClick={() => setIsAddSoinModalOpen(true)}
              startIcon={<Plus className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-950/40 flex-1 md:flex-initial"
            >
              + Nouveau Soin
            </AppButton>

            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => setIsBatchModalOpen(true)}
              startIcon={<Layers className="w-4 h-4 text-indigo-400" />}
              className="bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 text-xs font-bold flex-1 md:flex-initial"
            >
              Traitement Collectif
            </AppButton>

            <AppButton
              variant="outline"
              size="sm"
              onClick={handleToggleQuarantine}
              startIcon={isQuarantine ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <ShieldAlert className="w-4 h-4 text-amber-400" />}
              className={`border-slate-700 text-xs font-bold transition-all flex-1 md:flex-initial ${
                isQuarantine 
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-700' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {isQuarantine ? 'Sortir de Quarantaine' : 'Mettre en Quarantaine'}
            </AppButton>
          </div>

        </div>
      </div>

      {/* 2. Desktop Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): WeightTrackerChart & TreatmentHistoryTimeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Weight Tracker Interactive Chart */}
          <WeightTrackerChart
            logs={weightLogs}
            onAddWeightClick={() => setIsAddWeightModalOpen(true)}
          />

          {/* Medical Treatments Timeline */}
          <TreatmentHistoryTimeline
            bird={currentBird}
            records={records}
            onAddRecord={(rec) => {
              const res = HealthService.addRecord(rec);
              if (res.success && res.data) {
                setRecords(prev => [res.data!, ...prev]);
                if (onRefreshHealth) onRefreshHealth();
              }
            }}
            onCompleteRecord={handleCompleteRecord}
            onDeleteRecord={handleDeleteRecord}
          />

        </div>

        {/* Right Column (1 Col): Quick Protocols Panel & Clinical Notes */}
        <div className="space-y-6">
          
          {/* Quick Standard Health Protocols Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-sm text-white tracking-tight">
                  Protocoles Standards
                </h3>
              </div>
              <span className="text-3xs text-slate-500 font-mono">Guide Officiel</span>
            </div>

            <p className="text-3xs text-slate-400 leading-snug">
              Protocoles homologués prêts à être appliqués en un clic au dossier de l'oiseau.
            </p>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {STANDARD_HEALTH_PROTOCOLS.map(proto => (
                <div
                  key={proto.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-white leading-tight">
                        {proto.title}
                      </h4>
                      <span className="text-4xs text-amber-400 font-mono uppercase tracking-wider font-extrabold">
                        {proto.category} • {proto.defaultRoute}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedProtocolToApply(proto)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-3xs font-black uppercase transition-colors shrink-0 cursor-pointer"
                      title="Appliquer ce protocole"
                    >
                      Appliquer
                    </button>
                  </div>

                  <p className="text-3xs text-slate-400 leading-tight">
                    {proto.description}
                  </p>
                  
                  <div className="text-4xs text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                    Posologie : <span className="text-slate-300">{proto.defaultDosage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Notes Card */}
          <ClinicalNotesCard bird={currentBird} />

        </div>

      </div>

      {/* Modal: Nouveau Soin */}
      {isAddSoinModalOpen && (
        <AppModal
          isOpen={isAddSoinModalOpen}
          onClose={() => setIsAddSoinModalOpen(false)}
          title="Ajouter un soin ou traitement"
          size="md"
        >
          <form onSubmit={handleAddSoinSubmit} className="space-y-4">
            <AppSelect
              label={t('healthCategoryRequired')}
              value={formCategory}
              onChange={(e: any) => setFormCategory(e.target.value)}
              options={[
                { value: 'Traitement', label: 'Traitement antiparasitaire / antibiotique' },
                { value: 'Vaccin', label: 'Vaccin (Variole, etc.)' },
                { value: 'Visite Vétérinaire', label: 'Bilan Vétérinaire' },
                { value: 'Symptôme', label: 'Observation de symptôme' }
              ]}
            />

            <AppInput
              label={t('healthTreatmentNameRequired')}
              value={formTreatment}
              onChange={(e) => setFormTreatment(e.target.value)}
              placeholder="ex. Vermifuge Panacur"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                label={t('dateLabel')}
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />

              <AppSelect
                label="Statut"
                value={formStatus}
                onChange={(e: any) => setFormStatus(e.target.value)}
                options={[
                  { value: 'Terminé', label: 'Terminé / Effectué' },
                  { value: 'En attente', label: 'Planifié / En attente' }
                ]}
              />
            </div>

            <AppInput
              label="Posologie & Notes"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="ex. 2 gouttes par jour pendant 3 jours"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <AppButton variant="outline" size="sm" onClick={() => setIsAddSoinModalOpen(false)}>
                Annuler
              </AppButton>
              <AppButton type="submit" variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
                Enregistrer le soin
              </AppButton>
            </div>
          </form>
        </AppModal>
      )}

      {/* Modal: Enregistrer une pesée */}
      {isAddWeightModalOpen && (
        <AppModal
          isOpen={isAddWeightModalOpen}
          onClose={() => setIsAddWeightModalOpen(false)}
          title="Ajouter une pesée de contrôle"
          size="sm"
        >
          <form onSubmit={handleAddWeightSubmit} className="space-y-4">
            <AppInput
              label="Poids mesuré (grammes) *"
              type="number"
              step="0.1"
              value={formWeight}
              onChange={(e) => setFormWeight(e.target.value)}
              placeholder="ex. 22.4"
              autoFocus
            />

            <AppInput
              label={t('healthWeightDate')}
              type="date"
              value={formWeightDate}
              onChange={(e) => setFormWeightDate(e.target.value)}
            />

            <AppInput
              label="Remarques"
              value={formWeightNotes}
              onChange={(e) => setFormWeightNotes(e.target.value)}
              placeholder="ex. Pesée de routine au réveil"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <AppButton variant="outline" size="sm" onClick={() => setIsAddWeightModalOpen(false)}>
                Annuler
              </AppButton>
              <AppButton type="submit" variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-bold">
                Enregistrer
              </AppButton>
            </div>
          </form>
        </AppModal>
      )}

      {/* Modal: Confirmation application protocole standard */}
      {selectedProtocolToApply && (
        <AppModal
          isOpen={Boolean(selectedProtocolToApply)}
          onClose={() => setSelectedProtocolToApply(null)}
          title="Confirmer l'application du protocole"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Voulez-vous déclarer l'application de <strong>{selectedProtocolToApply.title}</strong> pour l'oiseau <strong>{currentBird.nom || currentBird.bague}</strong> ?
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-3xs space-y-1 text-slate-400">
              <div>Voie : <span className="text-white font-semibold">{selectedProtocolToApply.defaultRoute}</span></div>
              <div>Dosage : <span className="text-white font-semibold">{selectedProtocolToApply.defaultDosage}</span></div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <AppButton variant="outline" size="sm" onClick={() => setSelectedProtocolToApply(null)}>
                Annuler
              </AppButton>
              <AppButton 
                variant="primary" 
                size="sm" 
                onClick={() => handleApplyProtocol(selectedProtocolToApply)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
              >
                Confirmer l'acte
              </AppButton>
            </div>
          </div>
        </AppModal>
      )}

      {/* Modal: Traitement Collectif & Assainissement du Cheptel */}
      {isBatchModalOpen && (
        <BatchTreatmentModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          allBirds={allBirds && allBirds.length > 0 ? allBirds : undefined}
          onSuccess={() => {
            setRecords(HealthService.getRecords().filter(r => r.canari_id === currentBird.id));
            if (onRefreshHealth) onRefreshHealth();
          }}
        />
      )}

    </div>
  );
};

export default HealthCareView;
