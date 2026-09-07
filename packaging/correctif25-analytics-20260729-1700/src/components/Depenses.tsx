/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, TrendingDown, Check, X, ShieldAlert, CreditCard, Calendar, Download } from 'lucide-react';
import { Depense } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DepensesProps {
  depenses: Depense[];
  onAddDepense: (date: string, montant: number, categorie: Depense['categorie'], description: string) => true | string;
  quickAddOpen?: boolean;
  setQuickAddOpen?: (open: boolean) => void;
}

const CATEGORY_LABELS: Record<string, Record<Depense['categorie'], string>> = {
  fr: {
    'Alimentation': "Alimentation",
    'Santé': "Santé",
    'Matériel': "Matériel",
    'Cages': "Cages",
    'Autre': "Autre"
  },
  en: {
    'Alimentation': "Food & Feed",
    'Santé': "Health",
    'Matériel': "Equipment",
    'Cages': "Cages",
    'Autre': "Other"
  },
  ar: {
    'Alimentation': "التغذية",
    'Santé': "الصحة",
    'Matériel': "المعدات",
    'Cages': "الأقفاص",
    'Autre': "أخرى"
  },
  es: {
    'Alimentation': "Alimentación",
    'Santé': "Salud",
    'Matériel': "Materiales",
    'Cages': "Jaulas",
    'Autre': "Otros"
  },
  it: {
    'Alimentation': "Alimentazione",
    'Santé': "Salute",
    'Matériel': "Attrezzatura",
    'Cages': "Gabbie",
    'Autre': "Altro"
  }
};

export default function Depenses({
  depenses,
  onAddDepense,
  quickAddOpen = false,
  setQuickAddOpen
}: DepensesProps) {
  const { t, currentLanguage } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(quickAddOpen);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [montant, setMontant] = useState<string>('');
  const [categorie, setCategorie] = useState<Depense['categorie']>('Alimentation');
  const [description, setDescription] = useState('');

  const lang = CATEGORY_LABELS[currentLanguage] ? currentLanguage : 'fr';

  // Handle Quick Add trigger from Dashboard
  React.useEffect(() => {
    if (quickAddOpen) {
      setIsFormOpen(true);
      if (setQuickAddOpen) setQuickAddOpen(false);
    }
  }, [quickAddOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const amountNum = Number(montant);
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMsg(t('amountRequired'));
      return;
    }

    if (!description.trim()) {
      setErrorMsg(t('descriptionRequired'));
      return;
    }

    const result = onAddDepense(date, amountNum, categorie, description.trim());
    if (result !== true) {
      setErrorMsg(result);
      return;
    }
    setIsFormOpen(false);
    setMontant('');
    setDescription('');
  };

  const totalCharges = depenses.reduce((acc, d) => acc + d.montant, 0);

  // Filter or group charges
  const exportToCSV = () => {
    const headers = currentLanguage === 'ar'
      ? "المعرف,التاريخ,الفئة,المبلغ,الوصف\n"
      : currentLanguage === 'en'
      ? "ID,Date,Category,Amount,Description\n"
      : currentLanguage === 'es'
      ? "ID,Fecha,Categoría,Importe,Descripción\n"
      : currentLanguage === 'it'
      ? "ID,Data,Categoria,Importo,Descrizione\n"
      : "Identifiant,Date,Categorie,Montant,Description\n";

    const rows = depenses.map(d => `${d.id},${d.date},${CATEGORY_LABELS[lang][d.categorie] || d.categorie},${d.montant},"${d.description.replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `depenses_elevage_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('depensesTitle')}</h2>
          <p className="text-xs text-slate-500">{t('depensesSub')}</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer border border-slate-200"
          >
            <Download className="w-4 h-4" /> {t('exportCSV')}
          </button>
          
          <button
            onClick={() => {
              setErrorMsg(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> {t('addExpenseButton')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Financial ledger of charges */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">{t('totalChargesCumulated')}</span>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalCharges.toFixed(3)} DT</div>
              </div>
            </div>
            
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 font-bold px-2.5 py-1 rounded text-indigo-700">
              {t('operationsCount', { count: depenses.length })}
            </span>
          </div>

          {/* Expenses history */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-50 font-semibold text-slate-700 text-sm">{t('expenseRegister')}</div>
            
            {depenses.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <TrendingDown className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">{t('noExpenseLogged')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {depenses.map((d) => (
                  <div key={d.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                    <div className="flex items-start gap-3">
                      <span className="text-slate-400 shrink-0 font-bold font-mono mt-0.5">#{d.id}</span>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{d.description}</div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-300" /> {d.date}</span>
                          <span>•</span>
                          <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {CATEGORY_LABELS[lang][d.categorie] || d.categorie}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <span className="font-bold text-slate-800 text-sm">-{d.montant.toFixed(3)} DT</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Form to record a charge */}
        <div>
          {isFormOpen ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-md">{t('registerExpense')}</h3>
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

              {/* Date & Category */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">{t('dateLabel')}</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white p-2 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">{t('category')}</label>
                  <select
                    value={categorie}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategorie(e.target.value as Depense['categorie'])}
                    className="w-full bg-white p-2 border border-slate-200 rounded"
                  >
                    <option value="Alimentation">{CATEGORY_LABELS[lang]['Alimentation']}</option>
                    <option value="Santé">{CATEGORY_LABELS[lang]['Santé']}</option>
                    <option value="Matériel">{CATEGORY_LABELS[lang]['Matériel']}</option>
                    <option value="Cages">{CATEGORY_LABELS[lang]['Cages']}</option>
                    <option value="Autre">{CATEGORY_LABELS[lang]['Autre']}</option>
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('amountDT')}</label>
                <input
                  type="number"
                  required
                  step="0.001"
                  min="0.001"
                  placeholder="ex. 45.000"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('detailMotif')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('detailPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm mt-2"
              >
                <Check className="w-4.5 h-4.5" /> {t('saveExpense')}
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-slate-400 text-xs space-y-3">
              <h4 className="font-bold text-slate-700">{t('accountingTitle')}</h4>
              <p className="leading-relaxed">
                {t('accountingDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
