/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Activity, Check, X, ShieldAlert, HeartPulse, User, Calendar, Trash2 } from 'lucide-react';
import { Sante, Canari } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { SpeciesBadge } from './design-system';
import { HealthEngine } from '../business/HealthEngine';

interface SanteProps {
  sante: Sante[];
  canaris: Canari[];
  onAddSanteRecord: (canariId: number, date: string, traitement: string, categorie: Sante['categorie'], description: string, statut?: Sante['statut']) => true | string;
  onCompleteSanteRecord: (id: number) => true | string;
  onDeleteSanteRecord: (id: number) => true | string;
}

const CATEGORY_LABELS: Record<string, Record<Sante['categorie'], string>> = {
  fr: {
    'Traitement': "Traitement / Soin",
    'Vaccin': "Vaccin / Vitamines",
    'Visite Vétérinaire': "Visite Vétérinaire",
    'Symptôme': "Symptôme observé",
  },
  en: {
    'Traitement': "Treatment / Care",
    'Vaccin': "Vaccine / Vitamins",
    'Visite Vétérinaire': "Veterinary Visit",
    'Symptôme': "Symptom observed",
  },
  ar: {
    'Traitement': "علاج / رعاية",
    'Vaccin': "لقاح / فيتامينات",
    'Visite Vétérinaire': "زيارة بيطرية",
    'Symptôme': "أعراض ملاحظة",
  },
  es: {
    'Traitement': "Tratamiento / Cuidado",
    'Vaccin': "Vacuna / Vitaminas",
    'Visite Vétérinaire': "Visita Veterinaria",
    'Symptôme': "Síntoma observado",
  },
  it: {
    'Traitement': "Trattamento / Cura",
    'Vaccin': "Vaccino / Vitamine",
    'Visite Vétérinaire': "Visita Veterinaria",
    'Symptôme': "Sintomo osservato",
  }
};

export default function SanteComponent({
  sante,
  canaris,
  onAddSanteRecord,
  onCompleteSanteRecord,
  onDeleteSanteRecord
}: SanteProps) {
  const { t, currentLanguage } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCanariFilter, setSelectedCanariFilter] = useState<string>('Tous');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Tous');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const eligibleCanaris = useMemo(
    () => canaris.filter(HealthEngine.isEligiblePatient),
    [canaris]
  );

  // Form states
  const [canariId, setCanariId] = useState<number>(eligibleCanaris[0]?.id || 0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [traitement, setTraitement] = useState('');
  const [categorie, setCategorie] = useState<Sante['categorie']>('Traitement');
  const [description, setDescription] = useState('');
  const [statut, setStatut] = useState<Sante['statut']>('Terminé');

  const lang = CATEGORY_LABELS[currentLanguage] ? currentLanguage : 'fr';

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

  // Filter medical records
  const filteredRecords = sante.filter(record => {
    const matchesCanari = selectedCanariFilter === 'Tous' || record.canari_id === Number(selectedCanariFilter);
    const matchesCategory = selectedCategoryFilter === 'Tous' || record.categorie === selectedCategoryFilter;
    return matchesCanari && matchesCategory;
  }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // sort by date desc

  const getCategoryColor = (cat: Sante['categorie']) => {
    switch (cat) {
      case 'Traitement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Vaccin': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Visite Vétérinaire': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Symptôme': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('santeTitle')}</h2>
          <p className="text-xs text-slate-500">
            {t('santeSub')}
          </p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Filterable medical log list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 shrink-0 font-medium">{t('byBird')}</span>
              <select
                value={selectedCanariFilter}
                onChange={(e) => setSelectedCanariFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              >
                <option value="Tous">{t('allBirds')}</option>
                {canaris.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.bague})</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 shrink-0 font-medium">{t('actType')}</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
              >
                <option value="Tous">{t('allTypes')}</option>
                <option value="Traitement">{CATEGORY_LABELS[lang]['Traitement']}</option>
                <option value="Vaccin">{CATEGORY_LABELS[lang]['Vaccin']}</option>
                <option value="Visite Vétérinaire">{CATEGORY_LABELS[lang]['Visite Vétérinaire']}</option>
                <option value="Symptôme">{CATEGORY_LABELS[lang]['Symptôme']}</option>
              </select>
            </div>
          </div>

          {/* List of records */}
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
              <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">{t('noSanteFilter')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => {
                const bird = canaris.find(c => c.id === record.canari_id);
                return (
                  <div key={record.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:shadow-xs transition-all flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                        <Activity className="w-4.5 h-4.5" />
                      </div>
                      <div className="text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{record.traitement}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${getCategoryColor(record.categorie)}`}>
                            {CATEGORY_LABELS[lang][record.categorie] || record.categorie}
                          </span>
                          {record.statut === 'En attente' ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                              {t('pendingLabel')}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" />
                              {t('doneLabel')}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            {bird && <SpeciesBadge speciesId={bird.espece} size="sm" showLabel={false} />}
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {t('patientLabel', { name: bird ? `${bird.nom} (${bird.bague})` : t('delete'), category: CATEGORY_LABELS[lang][record.categorie] })}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {t('dateLabel').replace(' *', '').replace(':', '')} : <strong>{record.date}</strong>
                          </span>
                        </div>

                        {record.description && (
                          <p className="text-slate-600 mt-2 p-2 bg-slate-50 border border-slate-100 rounded-lg italic leading-relaxed">
                            {record.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {record.statut === 'En attente' && (
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
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-50 cursor-pointer"
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

        {/* Right column: Form to log health card */}
        <div>
          {isFormOpen ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-md">{t('registerSoinObs')}</h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Patient Canary */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('selectBird')}</label>
                <select
                  required
                  value={canariId}
                  onChange={(e) => setCanariId(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
                >
                  {eligibleCanaris.map(c => (
                    <option key={c.id} value={c.id}>{c.nom} ({c.bague})</option>
                  ))}
                </select>
              </div>

              {/* Date, Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">{t('dateLabel').replace(' *', '')}</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">{t('actType').replace(':', '')}</label>
                  <select
                    value={categorie}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategorie(e.target.value as Sante['categorie'])}
                    className="w-full bg-white p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Traitement">{CATEGORY_LABELS[lang]['Traitement']}</option>
                    <option value="Vaccin">{CATEGORY_LABELS[lang]['Vaccin']}</option>
                    <option value="Visite Vétérinaire">{CATEGORY_LABELS[lang]['Visite Vétérinaire']}</option>
                    <option value="Symptôme">{CATEGORY_LABELS[lang]['Symptôme']}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">{t('realizationState')}</label>
                  <select
                    value={statut}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatut(e.target.value as Sante['statut'])}
                    className="w-full bg-white p-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Terminé">{t('alreadyDone')}</option>
                    <option value="En attente">{t('pendingReminder')}</option>
                  </select>
                </div>
              </div>

              {/* Name / Treatment Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('treatmentNature')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('treatmentPlaceholder')}
                  value={traitement}
                  onChange={(e) => setTraitement(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('posologyLabel')}</label>
                <textarea
                  placeholder={t('posologyPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none h-24"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm mt-2"
              >
                <Check className="w-4.5 h-4.5" /> {t('saveSoin')}
              </button>
            </form>
          ) : (
            /* QUICK CHECKS */
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm">{t('protocolsTitle')}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('protocolsDesc')}
              </p>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                  <p className="font-bold text-amber-900">{t('protocol1Title')}</p>
                  <p className="text-slate-600 mt-0.5">{t('protocol1Desc')}</p>
                </div>

                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="font-bold text-blue-900">{t('protocol2Title')}</p>
                  <p className="text-slate-600 mt-0.5">{t('protocol2Desc')}</p>
                </div>

                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <p className="font-bold text-emerald-900">{t('protocol3Title')}</p>
                  <p className="text-slate-600 mt-0.5">{t('protocol3Desc')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
