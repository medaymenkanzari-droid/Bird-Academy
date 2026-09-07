/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Activity, Check, X, ShieldAlert, HeartPulse, User, Calendar, Trash2, Layers } from 'lucide-react';
import { Sante, Canari } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { SpeciesBadge, AppModal } from './design-system';
import { HealthEngine } from '../business/HealthEngine';
import { TRANSLATIONS } from '../utils/translations';
import { BatchTreatmentModal } from '../features/health/components/BatchTreatmentModal';
import { SpeciesProfileService } from '../features/species/services/SpeciesProfileService';

interface SanteProps {
  sante: Sante[];
  canaris: Canari[];
  onAddSanteRecord: (canariId: number, date: string, traitement: string, categorie: Sante['categorie'], description: string, statut?: Sante['statut']) => true | string;
  onCompleteSanteRecord: (id: number) => true | string;
  onDeleteSanteRecord: (id: number) => true | string;
}

export const TREATMENT_NAMES = {};

export function normalizeHealthCategory(cat: string): string {
  if (!cat) return 'treatment';
  const map: Record<string, string> = {
    'Traitement': 'treatment',
    'Vaccin': 'vaccine',
    'Visite Vétérinaire': 'vet_visit',
    'Symptôme': 'symptom',
    'treatment': 'treatment',
    'vaccine': 'vaccine',
    'vet_visit': 'vet_visit',
    'symptom': 'symptom'
  };
  return map[cat] || cat;
}

export function normalizeHealthStatus(st: string | undefined): string {
  if (!st) return 'completed';
  const map: Record<string, string> = {
    'Terminé': 'completed',
    'En attente': 'pending',
    'En cours': 'in_progress',
    'Planifié': 'planned',
    'completed': 'completed',
    'pending': 'pending',
    'in_progress': 'in_progress',
    'planned': 'planned'
  };
  return map[st] || st;
}

export function formatLocalizedTreatment(traitement: string, langOrT: any): string {
  if (!traitement) return '';

  const t = typeof langOrT === 'function' 
    ? langOrT 
    : (key: string, vars?: Record<string, string | number>) => {
        const lang = typeof langOrT === 'string' && TRANSLATIONS[langOrT as keyof typeof TRANSLATIONS] ? langOrT : 'fr';
        const dict = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS['fr'];
        let text = dict[key] || TRANSLATIONS['fr'][key] || key;
        if (vars) {
          Object.entries(vars).forEach(([k, v]) => { text = text.split(`{${k}}`).join(String(v)); });
        }
        return text;
      };

  if (traitement === "Anti-parasitaire d'automne" || traitement === "autumn_antiparasitic") {
    return t("health.treatments.autumn_antiparasitic");
  } else if (traitement === "Cure de Vitamines E" || traitement === "Vitamines E & Sélénium" || traitement === "vitamins_e_selenium") {
    return t("health.treatments.vitamins_e_selenium");
  } else if (traitement === "Rappel vermifuge d'été" || traitement === "Vermifuge d'élevage" || traitement === "deworming") {
    return t("health.treatments.deworming");
  } else if (traitement === "Traitement anti-poux" || traitement === "Poux rouges" || traitement === "red_mites") {
    return t("health.treatments.red_mites");
  } else if (traitement === "Visite de contrôle plumes" || traitement === "Contrôle préventif" || traitement === "preventive_checkup") {
    return t("health.treatments.preventive_checkup");
  } else if (traitement === "Coccidiose" || traitement === "coccidiosis") {
    return t("health.treatments.coccidiosis");
  } else if (traitement === "Cure antibiotique" || traitement === "antibiotic_course") {
    return t("health.treatments.antibiotic_course");
  }

  const trans = t(traitement);
  return trans !== traitement ? trans : traitement;
}

export function formatLocalizedHealthDescription(desc: string | undefined, langOrT: any): string {
  if (!desc) return '';

  const t = typeof langOrT === 'function' 
    ? langOrT 
    : (key: string, vars?: Record<string, string | number>) => {
        const lang = typeof langOrT === 'string' && TRANSLATIONS[langOrT as keyof typeof TRANSLATIONS] ? langOrT : 'fr';
        const dict = TRANSLATIONS[lang as keyof typeof TRANSLATIONS] || TRANSLATIONS['fr'];
        let text = dict[key] || TRANSLATIONS['fr'][key] || key;
        if (vars) {
          Object.entries(vars).forEach(([k, v]) => { text = text.split(`{${k}}`).join(String(v)); });
        }
        return text;
      };

  if (desc === "Application d'une goutte d'Ivomec sur la nuque." || desc === "ivomec_drop_neck") {
    return t("health.descriptions.ivomec_drop_neck");
  } else if (desc === "Préparation à l'accouplement pendant 10 jours." || desc === "Cure préparatoire avant accouplement" || desc === "preparatory_cure_mating") {
    return t("health.descriptions.preparatory_cure_mating");
  } else if (desc === "Administration de vermifuge liquide dans l'eau de boisson." || desc === "dewormer_drinking_water") {
    return t("health.descriptions.dewormer_drinking_water");
  } else if (desc === "Vaporisation des nids et perchoirs pour éliminer les acariens." || desc === "spray_nests_perches_mites") {
    return t("health.descriptions.spray_nests_perches_mites");
  } else if (desc === "Vérifier la bonne repousse des rémiges après la mue partielle." || desc === "check_remiges_molt") {
    return t("health.descriptions.check_remiges_molt");
  } else if (desc === "Traitement préventif annuel" || desc === "annual_preventive_treatment") {
    return t("health.descriptions.annual_preventive_treatment");
  } else if (desc === "Nettoyage complet fientes" || desc === "full_droppings_cleaning") {
    return t("health.descriptions.full_droppings_cleaning");
  } else if (desc === "Examen systématique plumage" || desc === "systematic_plumage_check") {
    return t("health.descriptions.systematic_plumage_check");
  }

  const trans = t(desc);
  return trans !== desc ? trans : desc;
}

export default function SanteComponent({
  sante,
  canaris,
  onAddSanteRecord,
  onCompleteSanteRecord,
  onDeleteSanteRecord
}: SanteProps) {
  const { t, currentLanguage } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [selectedCanariFilter, setSelectedCanariFilter] = useState<string>('Tous');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Tous');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const eligibleCanaris = useMemo(
    () => canaris
      .filter(HealthEngine.isEligiblePatient)
      .filter(b => !b.espece || SpeciesProfileService.isSpeciesActive(b.espece)),
    [canaris]
  );

  // Form states
  const [canariId, setCanariId] = useState<number>(eligibleCanaris[0]?.id || 0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [traitement, setTraitement] = useState('');
  const [categorie, setCategorie] = useState<Sante['categorie']>('Traitement');
  const [description, setDescription] = useState('');
  const [statut, setStatut] = useState<Sante['statut']>('Terminé');

  useEffect(() => {
    if (!eligibleCanaris.some(bird => bird.id === canariId)) {
      setCanariId(eligibleCanaris[0]?.id || 0);
    }
  }, [canariId, eligibleCanaris]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!traitement.trim()) {
      setErrorMsg(t('treatmentRequired'));
      return;
    }

    const result = onAddSanteRecord(Number(canariId), date, traitement.trim(), categorie, description.trim(), statut);
    if (result !== true) {
      setErrorMsg(result);
      return;
    }
    setIsFormOpen(false);
    setTraitement('');
    setDescription('');
    setStatut('Terminé');
  };

  // Filter medical records (strictly scoped to active species)
  const filteredRecords = sante.filter(record => {
    const bird = canaris.find(b => b.id === record.canari_id);
    if (bird && bird.espece && !SpeciesProfileService.isSpeciesActive(bird.espece)) {
      return false;
    }
    const matchesCanari = selectedCanariFilter === 'Tous' || record.canari_id === Number(selectedCanariFilter);
    const matchesCategory = selectedCategoryFilter === 'Tous' || 
      record.categorie === selectedCategoryFilter || 
      normalizeHealthCategory(record.categorie) === normalizeHealthCategory(selectedCategoryFilter);
    return matchesCanari && matchesCategory;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getCategoryColor = (cat: Sante['categorie']) => {
    const norm = normalizeHealthCategory(cat);
    switch (norm) {
      case 'treatment': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'vaccine': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'vet_visit': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'symptom': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('santeTitle')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('santeSub')}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            disabled={eligibleCanaris.length === 0}
            title={eligibleCanaris.length === 0 ? t('noEligibleHealthBird') : undefined}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Layers className="w-4 h-4" /> Traitement Collectif / Lot
          </button>
          <button
            onClick={() => {
              setErrorMsg(null);
              setIsFormOpen(true);
            }}
            disabled={eligibleCanaris.length === 0}
            title={eligibleCanaris.length === 0 ? t('noEligibleHealthBird') : undefined}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> {t('registerSoin')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Filterable medical log list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">{t('byBird')}</span>
              <select
                value={selectedCanariFilter}
                onChange={(e) => setSelectedCanariFilter(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              >
                <option value="Tous">{t('allBirds')}</option>
                {eligibleCanaris.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.bague})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 shrink-0 font-medium">{t('actType')}</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              >
                <option value="Tous">{t('allTypes')}</option>
                <option value="Traitement">{t('health.categories.treatment')}</option>
                <option value="Vaccin">{t('health.categories.vaccine')}</option>
                <option value="Visite Vétérinaire">{t('health.categories.vet_visit')}</option>
                <option value="Symptôme">{t('health.categories.symptom')}</option>
              </select>
            </div>
          </div>

          {/* List of records */}
          {filteredRecords.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
              <HeartPulse className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">{t('noSanteFilter')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => {
                const bird = canaris.find(c => c.id === record.canari_id);
                const normStatus = normalizeHealthStatus(record.statut);
                const isPending = normStatus === 'pending';

                return (
                  <div key={record.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-xs transition-all flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 mt-0.5">
                        <Activity className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            {formatLocalizedTreatment(record.traitement, t)}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getCategoryColor(record.categorie)}`}>
                            {t(`health.categories.${normalizeHealthCategory(record.categorie)}`)}
                          </span>
                          {isPending ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                              {t('health.status.pending')}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              {t('health.status.completed')}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            {bird && <SpeciesBadge speciesId={bird.espece} size="sm" showLabel={false} />}
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {t('patientLabel', { name: bird ? `${bird.nom} (${bird.bague})` : t('delete'), category: t(`health.categories.${normalizeHealthCategory(record.categorie)}`) })}
                          </span>
                          <span className="text-slate-300 dark:text-slate-700">|</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {t('dateLabel').replace(' *', '').replace(':', '')} : <strong>{record.date}</strong>
                          </span>
                        </div>

                        {record.description && (
                          <p className="text-slate-600 dark:text-slate-300 mt-2 p-2 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-lg italic leading-relaxed">
                            {formatLocalizedHealthDescription(record.description, t)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isPending && (
                        <button
                          onClick={() => {
                            const result = onCompleteSanteRecord(record.id);
                            if (result !== true) alert(result);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                          title={t('validateSoin')}
                        >
                          <Check className="w-3 h-3" /> {t('validateSoin')}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(t('santeDeleteConfirm'))) {
                            const result = onDeleteSanteRecord(record.id);
                            if (result !== true) alert(result);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Form OR Protocols */}
        <div>
          <AppModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            title={t('registerSoinObs')}
            size="lg"
          >
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-xl text-xs border border-red-200 dark:border-red-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Patient Canary */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('selectBird')}</label>
                <select
                  required
                  value={canariId}
                  onChange={(e) => setCanariId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-sm bg-white focus:outline-none"
                >
                  {eligibleCanaris.map(c => (
                    <option key={c.id} value={c.id}>{c.nom} ({c.bague})</option>
                  ))}
                </select>
              </div>

              {/* Date, Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('dateLabel').replace(' *', '')}</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('actType').replace(':', '')}</label>
                  <select
                    value={categorie}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategorie(e.target.value as Sante['categorie'])}
                    className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="Traitement">{t('health.categories.treatment')}</option>
                    <option value="Vaccin">{t('health.categories.vaccine')}</option>
                    <option value="Visite Vétérinaire">{t('health.categories.vet_visit')}</option>
                    <option value="Symptôme">{t('health.categories.symptom')}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('realizationState')}</label>
                  <select
                    value={statut}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatut(e.target.value as Sante['statut'])}
                    className="w-full bg-white dark:bg-slate-950 dark:text-slate-100 p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  >
                    <option value="Terminé">{t('alreadyDone')}</option>
                    <option value="En attente">{t('pendingReminder')}</option>
                  </select>
                </div>
              </div>

              {/* Name / Treatment Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('treatmentNature')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('treatmentPlaceholder')}
                  value={traitement}
                  onChange={(e) => setTraitement(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-sm focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('posologyLabel')}</label>
                <textarea
                  placeholder={t('posologyPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 rounded-lg text-sm focus:outline-none h-24"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" /> {t('saveSoin')}
                </button>
              </div>
            </form>
          </AppModal>

          {/* QUICK CHECKS */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('protocolsTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('protocolsDesc')}
            </p>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/40">
                <p className="font-bold text-amber-900 dark:text-amber-300">{t('protocol1Title')}</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{t('protocol1Desc')}</p>
              </div>

              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <p className="font-bold text-blue-900 dark:text-blue-300">{t('protocol2Title')}</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{t('protocol2Desc')}</p>
              </div>

              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <p className="font-bold text-emerald-900 dark:text-emerald-300">{t('protocol3Title')}</p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{t('protocol3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Batch Sanitation & Flock Treatment Modal */}
      {isBatchModalOpen && (
        <BatchTreatmentModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          allBirds={canaris}
        />
      )}
    </div>
  );
}
