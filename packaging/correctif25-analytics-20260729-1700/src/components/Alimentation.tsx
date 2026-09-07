/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Wheat, Check, ShieldAlert, Plus, Edit, Apple, CalendarDays, BarChart, ShoppingCart, Sliders } from 'lucide-react';
import { Alimentation } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface AlimentationProps {
  alimentation: Alimentation[];
  onUpdateAlimentation: (id: number, type_aliment: string, quantite: string, planning: string, stock: number) => void;
}

export default function AlimentationComponent({
  alimentation,
  onUpdateAlimentation
}: AlimentationProps) {
  const { t } = useLanguage();
  const [selectedPeriodId, setSelectedPeriodId] = useState<number>(alimentation[0]?.id || 1);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [typeAliment, setTypeAliment] = useState('');
  const [quantite, setQuantite] = useState('');
  const [planning, setPlanning] = useState('');
  const [stock, setStock] = useState<number>(0);

  const selectedPlan = alimentation.find(p => p.id === selectedPeriodId);

  useEffect(() => {
    if (alimentation.length > 0 && !selectedPlan) {
      setSelectedPeriodId(alimentation[0].id);
    }
  }, [alimentation, selectedPlan]);

  const getTranslatedPeriod = (p: string) => {
    switch (p) {
      case 'Reproduction': return t('reproduction');
      case 'Mue': return t('phaseMueTitle');
      case 'Repos': return t('phaseReposTitle');
      default: return p;
    }
  };

  const handleEditStart = (plan: Alimentation) => {
    setTypeAliment(plan.type_aliment);
    setQuantite(plan.quantite);
    setPlanning(plan.planning_distribution);
    setStock(plan.stock_actuel_kg);
    setErrorMsg(null);
    setIsEditing(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeAliment.trim()) {
      setErrorMsg(t('typeAlimentRequired'));
      return;
    }

    onUpdateAlimentation(selectedPeriodId, typeAliment.trim(), quantite.trim(), planning.trim(), Number(stock));
    setIsEditing(false);
  };

  const getPeriodTheme = (periode: Alimentation['periode']) => {
    switch (periode) {
      case 'Reproduction': return 'from-rose-500 to-amber-500 text-white shadow-rose-100';
      case 'Mue': return 'from-amber-500 to-yellow-500 text-white shadow-amber-100';
      case 'Repos': return 'from-emerald-500 to-teal-500 text-white shadow-emerald-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t('alimentationTitle')}</h2>
        <p className="text-xs text-slate-500">
          {t('alimentationSub')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 3 Periods Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {alimentation.map((plan) => {
              const isActive = selectedPeriodId === plan.id;
              const isLowStock = plan.stock_actuel_kg <= 5;

              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPeriodId(plan.id);
                    setIsEditing(false);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-44 shadow-xs ${
                    isActive
                       ? 'bg-amber-50/50 border-amber-400'
                       : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">{t('bioPeriod')}</span>
                    <h3 className="text-lg font-bold text-slate-800">{getTranslatedPeriod(plan.periode)}</h3>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-500 truncate font-semibold">{plan.type_aliment}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isLowStock ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {t('remainingKg', { stock: plan.stock_actuel_kg })}
                      </span>
                      {isLowStock && <span className="text-[9px] text-red-600 font-bold animate-pulse">{t('lowStock')}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Period Plan Details View */}
          {selectedPlan && (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">{t('activeRegime')}</span>
                  <h3 className="text-lg font-bold text-slate-800 mt-1">{t('focusPeriod', { period: getTranslatedPeriod(selectedPlan.periode) })}</h3>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => handleEditStart(selectedPlan)}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" /> {t('adjustRegime')}
                  </button>
                )}
              </div>

              {isEditing ? (
                /* EDIT PERIOD REGIME FORM */
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {errorMsg && (
                    <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{t('typeAlimentationLabel')}</label>
                      <input
                        type="text"
                        required
                        value={typeAliment}
                        onChange={(e) => setTypeAliment(e.target.value)}
                        className="w-full bg-white p-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{t('stockActuelLabel')}</label>
                      <input
                        type="number"
                        required
                        min={0}
                        step={0.1}
                        value={stock}
                        onChange={(e) => setStock(Number(e.target.value))}
                        className="w-full bg-white p-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{t('quantiteConseilleeLabel')}</label>
                      <input
                        type="text"
                        value={quantite}
                        onChange={(e) => setQuantite(e.target.value)}
                        className="w-full bg-white p-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">{t('frequenceLabel')}</label>
                      <input
                        type="text"
                        value={planning}
                        onChange={(e) => setPlanning(e.target.value)}
                        className="w-full bg-white p-2 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl cursor-pointer font-semibold"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl cursor-pointer font-bold"
                    >
                      {t('saveAdjustments')}
                    </button>
                  </div>
                </form>
              ) : (
                /* READ-ONLY VIEW */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-700">
                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 font-medium block">{t('menuAlimentation')}</span>
                      <p className="font-bold text-slate-800 text-sm mt-1 flex items-start gap-1.5">
                        <Wheat className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                        {selectedPlan.type_aliment}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 font-medium block">{t('dosageSuggere')}</span>
                      <p className="font-bold text-slate-800 text-sm mt-1 flex items-start gap-1.5">
                        <Sliders className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                        {selectedPlan.quantite || t('notSpecified')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 font-medium block">{t('distributionFrequence')}</span>
                      <p className="font-bold text-slate-800 text-sm mt-1 flex items-start gap-1.5">
                        <CalendarDays className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                        {selectedPlan.planning_distribution}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-slate-400 font-medium block">{t('gardeManger')}</span>
                      <div className="mt-1 flex items-center justify-between">
                        <p className="font-bold text-slate-800 text-sm flex items-start gap-1.5">
                          <ShoppingCart className="w-4.5 h-4.5 text-purple-500 shrink-0 mt-0.5" />
                          {t('remainingKg', { stock: selectedPlan.stock_actuel_kg })}
                        </p>
                        {selectedPlan.stock_actuel_kg <= 5 && (
                          <span className="text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold animate-pulse">{t('refillRequired')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Info guidelines on canary nutrition */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-800 text-sm">{t('alimentationImportance')}</h3>
          <p className="text-slate-500 leading-relaxed">
            {t('alimentationImportanceDesc')}
          </p>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
              <span className="font-bold text-rose-900 block">{t('phaseReproTitle')}</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {t('phaseReproDesc')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="font-bold text-amber-900 block">{t('phaseMueTitle')}</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {t('phaseMueDesc')}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="font-bold text-emerald-900 block">{t('phaseReposTitle')}</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {t('phaseReposDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
