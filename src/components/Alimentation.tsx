/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Wheat, Check, ShieldAlert, Plus, Edit, Apple, CalendarDays, BarChart, ShoppingCart, Sliders } from 'lucide-react';
import { Alimentation } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { INITIAL_ALIMENTATION } from '../data/defaultData';
import { SpeciesProfileService } from '../features/species/services/SpeciesProfileService';
import { SpeciesBadge } from './design-system';

interface AlimentationProps {
  alimentation: Alimentation[];
  onUpdateAlimentation: (id: number, type_aliment: string, quantite: string, planning: string, stock: number) => void;
}

export default function AlimentationComponent({
  alimentation,
  onUpdateAlimentation
}: AlimentationProps) {
  const { t, currentLanguage } = useLanguage();
  const plansList = Array.isArray(alimentation) && alimentation.length > 0 ? alimentation : INITIAL_ALIMENTATION;
  const [selectedPeriodId, setSelectedPeriodId] = useState<number>(plansList[0]?.id || 1);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [typeAliment, setTypeAliment] = useState('');
  const [quantite, setQuantite] = useState('');
  const [planning, setPlanning] = useState('');
  const [stock, setStock] = useState<number>(0);

  const FOOD_LABEL_MAP: Record<string, Record<string, string>> = {
    fr: {
      "Pâtée d'élevage + Graines enrichies + Brocoli": "Pâtée d'élevage + Graines enrichies + Brocoli",
      "Mélange de graines spécial mue + Concombre + Vitamines": "Mélange de graines spécial mue + Concombre + Vitamines",
      "Graines alpiste + Pomme (2 fois/semaine) + Bloc minéral": "Graines alpiste + Pomme (2 fois/semaine) + Bloc minéral",
      "Mélange spécial Canaris de posture (70% alpiste, 15% navette, 10% chènevis, 5% lin)": "Mélange spécial Canaris de posture (70% alpiste, 15% navette, 10% chènevis, 5% lin)",
      "Pâtée d'élevage aux œufs & germinations": "Pâtée d'élevage aux œufs & germinations",
      "Mélange plumage & vitamines de mue": "Mélange plumage & vitamines de mue",
    },
    en: {
      "Pâtée d'élevage + Graines enrichies + Brocoli": "Breeding Eggfood + Enriched Seeds + Broccoli",
      "Mélange de graines spécial mue + Concombre + Vitamines": "Special Molting Seed Mix + Cucumber + Vitamins",
      "Graines alpiste + Pomme (2 fois/semaine) + Bloc minéral": "Canary Seed + Apple (2x/week) + Mineral Block",
      "Mélange spécial Canaris de posture (70% alpiste, 15% navette, 10% chènevis, 5% lin)": "Special Canary Seed Mix (70% canary seed, 15% rape, 10% hemp, 5% flax)",
      "Pâtée d'élevage aux œufs & germinations": "Breeding Eggfood & Sprouted Seeds",
      "Mélange plumage & vitamines de mue": "Plumage Blend & Molting Vitamins",
    },
    ar: {
      "Pâtée d'élevage + Graines enrichies + Brocoli": "باتيه التزاوج + بذور مدعمة + بروكلي",
      "Mélange de graines spécial mue + Concombre + Vitamines": "خلطة بذور التبديل + خيار + فيتامينات",
      "Graines alpiste + Pomme (2 fois/semaine) + Bloc minéral": "بذور الفلارس + تفاح (مرتان/أسبوع) + كلس معدني",
      "Mélange spécial Canaris de posture (70% alpiste, 15% navette, 10% chènevis, 5% lin)": "خلطة البذور الخاصة للكاناري (70% فلارس، 15% لفت، 10% قنب، 5% كتان)",
      "Pâtée d'élevage aux œufs & germinations": "باتيه البيض والبذور المستنبتة للتزاوج",
      "Mélange plumage & vitamines de mue": "خلطة الريش وفيتامينات التبديل",
    },
    es: {
      "Pâtée d'élevage + Graines enrichies + Brocoli": "Pasta de cría + Semillas enriquecidas + Brócoli",
      "Mélange de graines spécial mue + Concombre + Vitamines": "Mezcla de semillas especial muda + Pepino + Vitaminas",
      "Graines alpiste + Pomme (2 fois/semaine) + Bloc minéral": "Alpiste + Manzana (2 veces/semana) + Bloque mineral",
      "Mélange spécial Canaris de posture (70% alpiste, 15% navette, 10% chènevis, 5% lin)": "Mezcla especial de canarios (70% alpiste, 15% nabina, 10% cañamón, 5% lino)",
      "Pâtée d'élevage aux œufs & germinations": "Pasta de cría con huevo y germinados",
      "Mélange plumage & vitamines de mue": "Mezcla para plumaje y vitaminas de muda",
    },
    it: {
      "Pâtée d'élevage + Graines enrichies + Brocoli": "Pastoncino da allevamento + Semi arricchiti + Broccoli",
      "Mélange de graines spécial mue + Concombre + Vitamines": "Miscela di semi per muta + Cetriolo + Vitamine",
      "Graines alpiste + Pomme (2 fois/semaine) + Bloc minéral": "Scagliola + Mela (2 volte/settimana) + Blocco minerale",
      "Mélange spécial Canaris de posture (70% alpiste, 15% navette, 10% chènevis, 5% lin)": "Miscela speciale per canarini (70% scagliola, 15% ravizzone, 10% canapa, 5% lino)",
      "Pâtée d'élevage aux œufs & germinations": "Pastoncino da allevamento all'uovo e semi germinati",
      "Mélange plumage & vitamines de mue": "Miscela per piumaggio e vitamine di muta",
    }
  };

  const getTranslatedFoodType = (raw: string) => {
    const lang = FOOD_LABEL_MAP[currentLanguage] ? currentLanguage : 'fr';
    return FOOD_LABEL_MAP[lang]?.[raw] || raw;
  };

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

  const selectedPlan = plansList.find(p => p.id === selectedPeriodId) || plansList[0];

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
            {plansList.map((plan) => {
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
                       ? 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600'
                       : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">{t('bioPeriod')}</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{getTranslatedPeriod(plan.periode)}</h3>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-600 dark:text-slate-300 truncate font-semibold">{getTranslatedFoodType(plan.type_aliment)}</p>
                    <div className="flex justify-between items-center pt-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        isLowStock ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        {t('remainingKg', { stock: plan.stock_actuel_kg })}
                      </span>
                      {isLowStock && <span className="text-[9px] text-red-600 dark:text-red-400 font-bold animate-pulse">{t('lowStock')}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Period Plan Details View */}
          {selectedPlan && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">{t('activeRegime')}</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{t('focusPeriod', { period: getTranslatedPeriod(selectedPlan.periode) })}</h3>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => handleEditStart(selectedPlan)}
                    className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
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
                        {getTranslatedFoodType(selectedPlan.type_aliment)}
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

        {/* Right column: Info guidelines on active species nutrition */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">{t('alimentationImportance')}</h3>
          </div>
          <p className="text-slate-500 leading-relaxed">
            {t('alimentationImportanceDesc')}
          </p>

          <div className="space-y-3">
            {SpeciesProfileService.getScopedBiologicalProfiles().map(profile => {
              const lang = (['fr', 'en', 'ar', 'es', 'it'].includes(currentLanguage) ? currentLanguage : 'fr') as 'fr' | 'en' | 'ar' | 'es' | 'it';
              const name = profile.identity.names[lang] || profile.identity.names.fr;
              const mainDiet = profile.nutrition.mainDiet[lang] || profile.nutrition.mainDiet.fr;
              const supplements = profile.nutrition.recommendedSupplements[lang] || profile.nutrition.recommendedSupplements.fr;
              const vitamins = profile.nutrition.vitaminFrequency[lang] || profile.nutrition.vitaminFrequency.fr;

              return (
                <div key={profile.identity.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <SpeciesBadge speciesId={profile.identity.id} size="sm" />
                    <span className="font-bold text-slate-800 text-xs">{name}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>
                      <span className="font-semibold text-amber-700">Régime de base : </span>
                      <span>{mainDiet}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-rose-700">Compléments conseillés : </span>
                      <span>{supplements}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-700">Vitamines : </span>
                      <span>{vitamins}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
