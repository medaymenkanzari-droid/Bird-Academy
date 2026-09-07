import React, { useState } from 'react';
import { Plus, TrendingDown, Check, X, ShieldAlert, CreditCard, Calendar, Download, Printer } from 'lucide-react';
import { Depense } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/currencyFormatter';
import { AppModal } from './design-system';
import { printDocument, exportDocumentAsPDF } from '../utils/printUtils';
import { AnalyticsSettingsRepository } from '../features/analytics/repositories/AnalyticsSettingsRepository';
import { TRANSLATIONS } from '../utils/translations';

interface DepensesProps {
  depenses: Depense[];
  onAddDepense: (date: string, montant: number, categorie: Depense['categorie'], description: string) => true | string;
  quickAddOpen?: boolean;
  setQuickAddOpen?: (open: boolean) => void;
}

export const EXPENSE_DESC_MAP = {};

export function normalizeExpenseCategory(cat: string): string {
  if (!cat) return 'other';
  const map: Record<string, string> = {
    'Alimentation': 'food',
    'Santé': 'health',
    'Matériel': 'equipment',
    'Cages': 'cages',
    'Autre': 'other',
    'food': 'food',
    'health': 'health',
    'equipment': 'equipment',
    'cages': 'cages',
    'other': 'other'
  };
  return map[cat] || cat;
}

export function getLocalizedExpenseDescription(desc: string, langOrT: any): string {
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

  const invoiceMatch = desc.match(/\((?:Facture|Invoice|فاتورة|Factura|Fattura)\s*#?(\d+)\)/i);
  const baseDesc = desc.replace(/\s*\((?:Facture|Invoice|فاتورة|Factura|Fattura)\s*#?\d+\)/i, '').trim();

  let translatedBase = baseDesc;
  
  if (baseDesc === "Sac de 20kg de graines d'élevage" || baseDesc === "Sac de graines 20kg" || baseDesc === "food_20kg") {
    translatedBase = t("expenses.descriptions.food_20kg");
  } else if (baseDesc === "Achat d'une cage double d'élevage démontable" || baseDesc === "double_cage") {
    translatedBase = t("expenses.descriptions.double_cage");
  } else if (baseDesc === "Flacon de complexe vitaminé et vermifuge" || baseDesc === "vitamins_supplements" || baseDesc === "Vitamines & compléments") {
    translatedBase = t("expenses.descriptions.vitamins_supplements");
  } else if (baseDesc === "Baignoires externes, abreuvoirs et nids en plastique" || baseDesc === "new_breeding_aviary" || baseDesc === "Nouvelle volière d'élevage" || baseDesc === "equipment_accessories") {
    translatedBase = t("expenses.descriptions.equipment_accessories");
  } else if (baseDesc.includes("Alpiste pur Premium")) {
    translatedBase = t("expenses.descriptions.alpiste_versele_laga");
  } else if (baseDesc.includes("Pâtée d'élevage")) {
    translatedBase = t("expenses.descriptions.patee_oeufs_or");
  } else if (baseDesc.includes("Vitamines Nekton S")) {
    translatedBase = t("expenses.descriptions.nekton_s_calcilux");
  } else if (baseDesc.includes("Nids en cordelette")) {
    translatedBase = t("expenses.descriptions.woven_rope_nests");
  } else if (baseDesc.includes("Cage de concours")) {
    translatedBase = t("expenses.descriptions.show_cage_white");
  } else if (baseDesc.includes("Frais de transport")) {
    translatedBase = t("expenses.descriptions.bird_transport");
  } else if (baseDesc.includes("Bagues officielles")) {
    translatedBase = t("expenses.descriptions.official_rings_2026");
  } else if (baseDesc.includes("Cotisation annuelle")) {
    translatedBase = t("expenses.descriptions.annual_club_membership");
  } else {
    const trans = t(baseDesc);
    translatedBase = trans !== baseDesc ? trans : baseDesc;
  }

  if (invoiceMatch) {
    const invoiceNum = invoiceMatch[1];
    return `${translatedBase} ${t('expenses.invoiceTag', { number: invoiceNum })}`;
  }

  return translatedBase;
}

export default function Depenses({
  depenses,
  onAddDepense,
  quickAddOpen = false,
  setQuickAddOpen
}: DepensesProps) {
  const { t, currentLanguage, isRtl } = useLanguage();
  const userCurrency = AnalyticsSettingsRepository.getSettings().currency || 'TND';
  const totalExpenses = depenses.reduce((acc, d) => acc + (d.montant || 0), 0);
  const [isFormOpen, setIsFormOpen] = useState(quickAddOpen);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [montant, setMontant] = useState<string>('');
  const [categorie, setCategorie] = useState<Depense['categorie']>('food' as any);
  const [description, setDescription] = useState('');

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

  const exportToCSV = () => {
    const headers = `${t('expenses.headerId')};${t('expenses.headerDate')};${t('expenses.headerCategory')};${t('expenses.headerAmount', { currency: userCurrency })};${t('expenses.headerDescription')}\n`;

    const rows = depenses.map(d => `${d.id};${d.date};${t(`expenses.categories.${normalizeExpenseCategory(d.categorie)}`)};${formatCurrency(d.montant, userCurrency)};"${(getLocalizedExpenseDescription(d.description, t) || '').replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `depenses_elevage_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = async () => {
    printDocument('printable-area');

    await exportDocumentAsPDF({
      title: t('expenses.pdfTitle'),
      subtitle: t('expenses.pdfSub'),
      language: currentLanguage,
      isRtl,
      sections: [
        {
          title: t('expenses.secOverview'),
          metrics: [
            { label: t('expenses.totalExpenses'), value: `${totalExpenses} ${userCurrency}` },
            { label: t('expenses.opCount'), value: `${depenses.length}` },
          ],
        },
        {
          title: t('expenses.secDetails'),
          table: {
            headers: [
              t('expenses.headerDate'),
              t('expenses.headerCategory'),
              t('expenses.headerAmount', { currency: userCurrency }),
              t('expenses.headerDescription')
            ],
            rows: depenses.map(d => [
              d.date || '',
              t(`expenses.categories.${normalizeExpenseCategory(d.categorie)}`),
              `${d.montant || 0} ${userCurrency}`,
              getLocalizedExpenseDescription(d.description, t) || '-'
            ]),
          },
        },
      ],
    });
  };

  return (
    <div id="printable-area" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('depensesTitle')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('depensesSub')}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-4 h-4" /> {t('expenses.printPdf')}
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4" /> {t('exportCSV')}
          </button>
          
          <button
            onClick={() => {
              setErrorMsg(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> {t('addExpenseButton')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial ledger of charges */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">{t('totalChargesCumulated')}</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{formatCurrency(totalCharges, userCurrency)}</div>
              </div>
            </div>
            
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 font-bold px-2.5 py-1 rounded text-indigo-700 dark:text-indigo-300">
              {t('operationsCount', { count: depenses.length })}
            </span>
          </div>

          {/* Expenses history */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-50 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200 text-sm">{t('expenseRegister')}</div>
            
            {depenses.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <TrendingDown className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-sm">{t('noExpenseLogged')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                {depenses.map((d) => (
                  <div key={d.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between text-xs">
                    <div className="flex items-start gap-3">
                      <span className="text-slate-400 shrink-0 font-bold font-mono mt-0.5">#{d.id}</span>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {getLocalizedExpenseDescription(d.description, t)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-300" /> {d.date}</span>
                          <span>•</span>
                          <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {t(`expenses.categories.${normalizeExpenseCategory(d.categorie)}`)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">-{formatCurrency(d.montant, userCurrency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FORM IN APP MODAL (BUG 09 UX FIX) */}
      <AppModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={t('registerExpense')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Date & Category */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('dateLabel')}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('categoryLabel')}</label>
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100"
              >
                <option value="food">{t('expenses.categories.food')}</option>
                <option value="health">{t('expenses.categories.health')}</option>
                <option value="equipment">{t('expenses.categories.equipment')}</option>
                <option value="cages">{t('expenses.categories.cages')}</option>
                <option value="other">{t('expenses.categories.other')}</option>
              </select>
            </div>
          </div>

          {/* Montant */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('amountInTnd')}</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              required
              placeholder="ex: 45.500"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Description */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('descriptionLabel')}</label>
            <input
              type="text"
              required
              placeholder="ex: Sac de graines 25kg, Ivomec..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer text-xs shadow-sm flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> {t('saveExpense')}
          </button>
        </form>
      </AppModal>
    </div>
  );
}
