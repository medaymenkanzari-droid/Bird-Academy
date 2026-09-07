/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Activity, ShieldCheck, Clock, CheckCircle2, AlertCircle, Plus, 
  Trash2, Filter, Droplet, Pill, Syringe, Sparkles, ChevronRight, Stethoscope 
} from 'lucide-react';
import { Sante, Canari } from '../../../types';
import { MedicalTreatmentItem, AdministrationRoute, MedicalStatus } from '../models/health';
import { AppButton, AppBadge, AppModal, AppInput, AppSelect } from '../../../components/design-system';

export interface TreatmentHistoryTimelineProps {
  bird: Canari;
  records: Sante[];
  onAddRecord?: (record: Omit<Sante, 'id'>) => void;
  onCompleteRecord?: (id: number) => void;
  onDeleteRecord?: (id: number) => void;
  className?: string;
}

export const TreatmentHistoryTimeline: React.FC<TreatmentHistoryTimelineProps> = ({
  bird,
  records,
  onAddRecord,
  onCompleteRecord,
  onDeleteRecord,
  className = ''
}) => {
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New treatment form state
  const [newCategory, setNewCategory] = useState<Sante['categorie']>('Traitement');
  const [newTreatment, setNewTreatment] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRoute, setNewRoute] = useState<AdministrationRoute>('Gouttes orales (bec)');
  const [newStatus, setNewStatus] = useState<MedicalStatus>('Completed');
  const [newDescription, setNewDescription] = useState('');

  // Normalize Sante into enriched MedicalTreatmentItem
  const treatments: MedicalTreatmentItem[] = useMemo(() => {
    return records.map(r => {
      // Parse route or protocol from description if structured, or use defaults
      let route: AdministrationRoute | string = 'Gouttes orales (bec)';
      if (r.categorie === 'Vaccin') route = 'Injection sous-cutanée / Goutte';
      else if (r.description?.toLowerCase().includes('eau')) route = 'Eau de boisson';
      else if (r.description?.toLowerCase().includes('spot')) route = 'Spot-on (nuque/peau)';
      else if (r.description?.toLowerCase().includes('pâtée')) route = 'Pâtée / Aliment';

      let status: MedicalStatus = 'Completed';
      if (r.statut === 'En attente') {
        const isFuture = new Date(r.date).getTime() > Date.now();
        status = isFuture ? 'Scheduled' : 'In Progress';
      } else {
        status = 'Completed';
      }

      return {
        id: r.id,
        birdId: r.canari_id,
        name: r.traitement,
        category: r.categorie,
        protocol: r.description || 'Protocole standard d\'élevage',
        route,
        date: r.date,
        status,
        notes: r.description
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  // Filtered items
  const filteredTreatments = useMemo(() => {
    if (filterCat === 'ALL') return treatments;
    return treatments.filter(t => t.category === filterCat);
  }, [treatments, filterCat]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreatment.trim() || !onAddRecord) return;

    onAddRecord({
      canari_id: bird.id,
      date: newDate,
      categorie: newCategory,
      traitement: newTreatment.trim(),
      description: `${newRoute ? `[${newRoute}] ` : ''}${newDescription.trim()}`,
      statut: newStatus === 'Completed' ? 'Terminé' : 'En attente'
    });

    setIsAddModalOpen(false);
    setNewTreatment('');
    setNewDescription('');
  };

  // Helper to render route icon
  const getRouteIcon = (route: string) => {
    if (route.includes('Goutte') || route.includes('bec')) return <Droplet className="w-3.5 h-3.5 text-blue-400" />;
    if (route.includes('Injection')) return <Syringe className="w-3.5 h-3.5 text-pink-400" />;
    if (route.includes('Eau')) return <Droplet className="w-3.5 h-3.5 text-cyan-400" />;
    return <Pill className="w-3.5 h-3.5 text-amber-400" />;
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6 text-white ${className}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white tracking-tight">
              Chronologie des Interventions Médicales ({treatments.length})
            </h3>
          </div>
          <p className="text-3xs text-slate-400">
            Traitements curatifs, antiparasitaires, vaccins et bilans vétérinaires.
          </p>
        </div>

        {/* Filter Pills & Add Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1 text-2xs font-bold">
            {[
              { id: 'ALL', label: 'Tous' },
              { id: 'Traitement', label: 'Soins' },
              { id: 'Vaccin', label: 'Vaccins' },
              { id: 'Visite Vétérinaire', label: 'Visites' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterCat(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterCat === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {onAddRecord && (
            <AppButton
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              startIcon={<Plus className="w-3.5 h-3.5" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
            >
              Nouveau Soin
            </AppButton>
          )}
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredTreatments.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-xs">
          <ShieldCheck className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          <p>Aucune intervention médicale pour ce filtre.</p>
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-800 ml-4 space-y-6 py-2">
          {filteredTreatments.map((item, idx) => {
            const isCompleted = item.status === 'Completed';
            const isScheduled = item.status === 'Scheduled';
            const isInProgress = item.status === 'In Progress';

            return (
              <div key={item.id} className="relative pl-6 sm:pl-8 group">
                
                {/* Timeline Node Point */}
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-slate-900 shadow-md flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-emerald-500 ring-4 ring-emerald-500/20' 
                    : isScheduled
                      ? 'bg-amber-500 ring-4 ring-amber-500/20 animate-pulse'
                      : 'bg-blue-500 ring-4 ring-blue-500/20'
                }`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                {/* Card Container */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-2.5 shadow-lg">
                  
                  {/* Card Header: Name, Status Badge, Route */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-extrabold text-sm text-white tracking-tight">
                        {item.name}
                      </h4>

                      {/* Status Badges */}
                      {isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Effectué
                        </span>
                      )}

                      {isScheduled && (
                        <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          Planifié / Rappel
                        </span>
                      )}

                      {isInProgress && (
                        <span className="px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-blue-400" />
                          En cours
                        </span>
                      )}
                    </div>

                    {/* Date Tag */}
                    <div className="text-3xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0 w-fit">
                      {item.date}
                    </div>
                  </div>

                  {/* Route & Category Line */}
                  <div className="flex flex-wrap items-center gap-3 text-3xs text-slate-400 font-medium">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-semibold">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      {getRouteIcon(item.route)}
                      <span>{item.route}</span>
                    </span>
                  </div>

                  {/* Protocol & Description Content */}
                  {item.protocol && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800/60 font-sans">
                      {item.protocol}
                    </p>
                  )}

                  {/* Quick Action Footer */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60">
                    {!isCompleted && onCompleteRecord && (
                      <AppButton
                        size="sm"
                        variant="success"
                        onClick={() => onCompleteRecord(item.id)}
                        startIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                        className="text-3xs font-bold uppercase"
                      >
                        Valider comme effectué
                      </AppButton>
                    )}

                    {onDeleteRecord && (
                      <button
                        onClick={() => onDeleteRecord(item.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-900/50 transition-colors cursor-pointer"
                        title="Supprimer l'acte médical"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Nouveau Soin */}
      {isAddModalOpen && (
        <AppModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Ajouter une intervention médicale"
          size="md"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <AppSelect
              label="Catégorie d'acte *"
              value={newCategory}
              onChange={(e: any) => setNewCategory(e.target.value)}
              options={[
                { value: 'Traitement', label: 'Traitement curatif / antiparasitaire' },
                { value: 'Vaccin', label: 'Vaccination' },
                { value: 'Visite Vétérinaire', label: 'Consultation vétérinaire & Examen' },
                { value: 'Symptôme', label: 'Observation clinique / Symptôme' }
              ]}
            />

            <AppInput
              label="Intitulé du soin / Médicament *"
              value={newTreatment}
              onChange={(e) => setNewTreatment(e.target.value)}
              placeholder="ex. Vermifuge Panacur ou Baytril 10%"
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                label="Date d'administration / Début"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />

              <AppSelect
                label="Voie d'administration"
                value={newRoute}
                onChange={(e: any) => setNewRoute(e.target.value)}
                options={[
                  { value: 'Gouttes orales (bec)', label: 'Gouttes orales (bec)' },
                  { value: 'Eau de boisson', label: 'Eau de boisson' },
                  { value: 'Spot-on (nuque/peau)', label: 'Spot-on (nuque/peau)' },
                  { value: 'Pâtée / Aliment', label: 'Pâtée / Aliment' },
                  { value: 'Injection sous-cutanée', label: 'Injection sous-cutanée' },
                  { value: 'Nébulisation / Spray', label: 'Nébulisation / Spray' },
                  { value: 'Application locale', label: 'Application locale' }
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppSelect
                label="Statut"
                value={newStatus}
                onChange={(e: any) => setNewStatus(e.target.value)}
                options={[
                  { value: 'Completed', label: 'Terminé / Réalisé' },
                  { value: 'In Progress', label: 'En cours de traitement' },
                  { value: 'Scheduled', label: 'Planifié / Rappel' }
                ]}
              />

              <AppInput
                label="Posologie & Détails"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="ex. 2 gouttes pendant 3 jours"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <AppButton variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Annuler
              </AppButton>
              <AppButton type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                Enregistrer l'intervention
              </AppButton>
            </div>
          </form>
        </AppModal>
      )}

    </div>
  );
};

export default TreatmentHistoryTimeline;
