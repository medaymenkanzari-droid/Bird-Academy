/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, TrendingUp, Check, X, ShieldAlert, Coins, Calendar, Download, Printer, User, FileText, FileDown } from 'lucide-react';
import { Vente, Canari } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { FinanceService } from '../features/finance/services/FinanceService';
import { formatCurrency } from '../utils/currencyFormatter';
import { AppModal } from './design-system';
import { printDocument, exportDocumentAsPDF } from '../utils/printUtils';
import { AnalyticsSettingsRepository } from '../features/analytics/repositories/AnalyticsSettingsRepository';
import { TRANSLATIONS } from '../utils/translations';
import { TransferCertificateModal } from '../features/finance/components/TransferCertificateModal';

interface VentesProps {
  ventes: Vente[];
  canaris: Canari[];
  onAddVente: (canariId: number, prix: number, date: string, acheteur: string, description: string) => true | string;
}

export const BUYER_NAME_MAP = {};

export function normalizeBuyerType(buyer: string): string {
  if (!buyer) return 'other';
  const map: Record<string, string> = {
    'amateur_breeder': 'amateur_breeder',
    'pet_store': 'pet_store',
    'exhibition': 'exhibition',
    'other': 'other',
    'Éleveur Amateur': 'amateur_breeder',
    'Éleveur amateur': 'amateur_breeder',
    'Animalerie': 'pet_store',
    'Exposition': 'exhibition',
    'Autre': 'other'
  };
  return map[buyer] || buyer;
}

export function formatLocalizedBuyer(buyer: string, langOrT: any): string {
  if (!buyer) return '';

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

  const normKey = normalizeBuyerType(buyer);
  const knownBuyerKeys = ['amateur_breeder', 'pet_store', 'exhibition', 'other'];
  if (knownBuyerKeys.includes(normKey)) {
    return t(`sales.buyerTypes.${normKey}`);
  }

  let result = buyer;
  result = result.replace(/Éleveur [aA]mateur/g, t('sales.buyerTypes.amateur_breeder'));
  result = result.replace(/Animalerie/g, t('sales.buyerTypes.pet_store'));
  result = result.replace(/Exposition/g, t('sales.buyerTypes.exhibition'));
  result = result.replace(/Autre/g, t('sales.buyerTypes.other'));

  return result;
}

export function formatLocalizedSaleDescription(desc: string | undefined, langOrT: any): string {
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

  if (desc === "Cession d'un mâle Yorkshire blanc de 2024" || desc === "yorkshire_white_2024") {
    return t("sales.descriptions.yorkshire_white_2024");
  } else if (desc === "Vente mâle reproducteur" || desc === "breeding_male_sale") {
    return t("sales.descriptions.breeding_male_sale");
  } else if (desc === "Cession couple de chant" || desc === "song_pair_transfer") {
    return t("sales.descriptions.song_pair_transfer");
  } else if (desc === "Vente oisillon sevré" || desc === "weaned_chick_sale") {
    return t("sales.descriptions.weaned_chick_sale");
  }

  const trans = t(desc);
  return trans !== desc ? trans : desc;
}

export default function VentesComponent({
  ventes,
  canaris,
  onAddVente
}: VentesProps) {
  const { t, currentLanguage, isRtl } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSaleForCert, setSelectedSaleForCert] = useState<{ sale: Vente; bird?: Canari } | null>(null);
  const userCurrency = AnalyticsSettingsRepository.getSettings().currency || 'TND';
  const totalVentes = ventes.reduce((acc, v) => acc + (v.prix || 0), 0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [canariId, setCanariId] = useState<string>('');
  const [prix, setPrix] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [acheteur, setAcheteur] = useState('');
  const [description, setDescription] = useState('');

  // Determine available canaries for selling (must not be sold already)
  const availableCanaris = canaris.filter(bird => FinanceService.isBirdEligibleForSale(bird.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!canariId) {
      setErrorMsg(t('selectSoldBirdRequired'));
      return;
    }

    const priceNum = Number(prix);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg(t('salePriceRequired'));
      return;
    }

    if (!acheteur.trim()) {
      setErrorMsg(t('buyerRequired'));
      return;
    }

    const result = onAddVente(Number(canariId), priceNum, date, acheteur.trim(), description.trim());
    if (result !== true) {
      setErrorMsg(result);
      return;
    }
    setIsFormOpen(false);
    setCanariId('');
    setPrix('');
    setAcheteur('');
    setDescription('');
  };

  const totalSales = ventes.reduce((acc, v) => acc + v.prix, 0);

  const exportToCSV = () => {
    const headers = `${t('sales.headerId')};${t('sales.headerBird')};${t('sales.headerRing')};${t('sales.headerPrice', { currency: userCurrency })};${t('sales.headerDate')};${t('sales.headerBuyer')};${t('sales.headerDescription')}\n`;
    const rows = ventes.map(v => {
      const bird = canaris.find(c => c.id === v.canari_id);
      const bague = bird?.bague || t('noRing') || 'Sans bague';
      const nom = bird?.nom || t('bird') || 'Oiseau';
      return `${v.id};"${nom}";"${bague}";${formatCurrency(v.prix, userCurrency)};${v.date};"${(formatLocalizedBuyer(v.acheteur, t) || '').replace(/"/g, '""')}";"${(formatLocalizedSaleDescription(v.description, t) || '').replace(/"/g, '""')}"`;
    }).join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ventes_elevage_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintDOM = () => {
    printDocument('printable-area');
  };

  const handleExportPDF = async () => {
    const reportInputCount = ventes.length;
    console.log(`[Ventes] Exporting PDF with ${reportInputCount} sales`);

    await exportDocumentAsPDF({
      title: t('ventesTitle') || 'Rapport des Ventes & Cessions',
      subtitle: t('sales.pdfSub') || t('ventesSub'),
      language: currentLanguage,
      isRtl,
      sections: [
        {
          title: t('sales.secSummary'),
          metrics: [
            { label: t('totalSalesLabel') || 'Total Ventes', value: `${totalVentes} ${userCurrency}` },
            { label: t('sales.birdsTransferred'), value: `${ventes.length}` },
          ],
        },
        {
          title: t('sales.secDetails'),
          table: {
            headers: [
              t('sales.headerDate'),
              t('sales.headerRingBird'),
              t('sales.headerPrice', { currency: userCurrency }),
              t('sales.headerBuyer'),
              t('sales.headerNotes')
            ],
            rows: ventes.map(v => {
              const bird = canaris.find(c => c.id === v.canari_id);
              return [
                v.date || '',
                bird ? `${bird.bague} (${bird.nom})` : `#${v.canari_id}`,
                `${v.prix || 0} ${userCurrency}`,
                formatLocalizedBuyer(v.acheteur, t) || '-',
                formatLocalizedSaleDescription(v.description, t) || '-'
              ];
            }),
          },
        },
      ],
    });
  };

  // Backward compatibility alias
  const handlePrint = handlePrintDOM;

  return (
    <div id="printable-area" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('ventesTitle')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('ventesSub')}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            onClick={handlePrintDOM}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer border border-slate-200 dark:border-slate-700"
            title={t('print') || 'Imprimer'}
          >
            <Printer className="w-4 h-4" /> {t('print') || 'Imprimer'}
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Télécharger le PDF"
          >
            <FileDown className="w-4 h-4" /> Télécharger le PDF
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
              if (availableCanaris.length > 0) {
                setCanariId(String(availableCanaris[0].id));
              }
            }}
            disabled={availableCanaris.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> {t('enregistrerVente')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of closed sales */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">{t('chiffreAffaires')}</span>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{formatCurrency(totalSales, userCurrency)}</div>
              </div>
            </div>
            
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 font-bold px-2.5 py-1 rounded text-emerald-700 dark:text-emerald-300">
              {ventes.length} {t('salesShort')}
            </span>
          </div>

          {/* Sales ledger list */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-50 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200 text-sm">{t('registreVentes')}</div>
            
            {ventes.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <TrendingUp className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-sm">{t('aucuneCession')}</p>
                <p className="text-xs mt-1">{t('aucuneCessionDesc')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
                {ventes.map((v) => {
                  const bird = canaris.find(c => c.id === v.canari_id);
                  return (
                    <div key={v.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between text-xs">
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 font-bold font-mono mt-0.5">#{v.id}</span>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                            {t('venduCanari')}: {bird ? `${bird.nom} (${bird.bague})` : t('deletedBirdLabel')}
                          </div>
                          
                          <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-300" /> {t('soldOnLabel')} {v.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-300" /> {t('acheteurLabel')} <strong className="text-slate-600 dark:text-slate-300">{formatLocalizedBuyer(v.acheteur, t)}</strong></span>
                          </div>

                          {v.description && (
                            <p className="text-slate-500 dark:text-slate-400 italic mt-1.5 p-1.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">{formatLocalizedSaleDescription(v.description, t)}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">+{formatCurrency(v.prix, userCurrency)}</span>
                        <button
                          onClick={() => setSelectedSaleForCert({ sale: v, bird })}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Générer l'Attestation Officielle de Cession"
                        >
                          <FileText className="w-3 h-3 text-blue-500" />
                          <span>Certificat</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SALE REGISTRATION APP MODAL (BUG 10 UX FIX) */}
      <AppModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={t('enregistrerVente')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Select Canary to sell */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('venduCanari')} *</label>
            <select
              required
              value={canariId}
              onChange={(e) => setCanariId(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-100"
            >
              <option value="">{t('chooseCanari')}</option>
              {availableCanaris.map(c => (
                <option key={c.id} value={c.id}>{c.nom || 'Sans nom'} ({c.bague || 'Sans bague'} - {c.couleur || 'Inconnu'})</option>
              ))}
            </select>
            {availableCanaris.length === 0 && (
              <span className="text-[10px] text-red-500 mt-1 block">⚠️ {t('noCanariAvailable')}</span>
            )}
          </div>

          {/* Date & Price */}
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
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('prixLabel')} (TND)</label>
              <input
                type="number"
                required
                min="0.001"
                step="0.001"
                placeholder="ex: 80.000"
                value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Buyer */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('acheteurLabel')} *</label>
            <input
              type="text"
              required
              placeholder="ex: Mohamed Trabelsi"
              value={acheteur}
              onChange={(e) => setAcheteur(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Remarks */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('descriptionLabel')}</label>
            <input
              type="text"
              placeholder="Conditions ou remarques de la vente..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer text-xs shadow-sm flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> {t('validerVenteBtn')}
          </button>
        </form>
      </AppModal>

      {/* Transfer Certificate Modal */}
      {selectedSaleForCert && (
        <TransferCertificateModal
          isOpen={Boolean(selectedSaleForCert)}
          onClose={() => setSelectedSaleForCert(null)}
          sale={selectedSaleForCert.sale}
          bird={selectedSaleForCert.bird}
          allBirds={canaris}
        />
      )}
    </div>
  );
}
