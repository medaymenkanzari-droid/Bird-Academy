/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, TrendingUp, Check, X, ShieldAlert, Coins, Calendar, Download, User } from 'lucide-react';
import { Vente, Canari } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { FinanceService } from '../features/finance/services/FinanceService';

interface VentesProps {
  ventes: Vente[];
  canaris: Canari[];
  onAddVente: (canariId: number, prix: number, date: string, acheteur: string, description: string) => true | string;
}

export default function Ventes({
  ventes,
  canaris,
  onAddVente
}: VentesProps) {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{t('ventesTitle')}</h2>
          <p className="text-xs text-slate-500">{t('ventesSub')}</p>
        </div>
        
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: List of closed sales */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">{t('chiffreAffaires')}</span>
                <div className="text-2xl font-bold text-slate-800 mt-0.5">{totalSales.toFixed(3)} DT</div>
              </div>
            </div>
            
            <span className="text-[10px] bg-emerald-50 border border-emerald-100 font-bold px-2.5 py-1 rounded text-emerald-700">
              {ventes.length} {t('salesShort')}
            </span>
          </div>

          {/* Sales ledger list */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-50 font-semibold text-slate-700 text-sm">{t('registreVentes')}</div>
            
            {ventes.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-sm">{t('aucuneCession')}</p>
                <p className="text-xs mt-1">{t('aucuneCessionDesc')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {ventes.map((v) => {
                  const bird = canaris.find(c => c.id === v.canari_id);
                  return (
                    <div key={v.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                      <div className="flex items-start gap-3">
                        <span className="text-slate-400 font-bold font-mono mt-0.5">#{v.id}</span>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">
                            {t('venduCanari')}: {bird ? `${bird.nom} (${bird.bague})` : t('deletedBirdLabel')}
                          </div>
                          
                          <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-300" /> {t('soldOnLabel')} {v.date}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-300" /> {t('acheteurLabel')} <strong className="text-slate-600">{v.acheteur}</strong></span>
                          </div>

                          {v.description && (
                            <p className="text-slate-500 italic mt-1.5 p-1.5 bg-slate-50 rounded border border-slate-100">{v.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <span className="font-bold text-emerald-600 text-sm">+{v.prix.toFixed(3)} DT</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Form to record a sale */}
        <div>
          {isFormOpen ? (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800 text-md">{t('enregistrerVente')}</h3>
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

              {/* Select Canary to sell */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('venduCanari')} *</label>
                <select
                  required
                  value={canariId}
                  onChange={(e) => setCanariId(e.target.value)}
                  className="w-full bg-white p-2.5 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">{t('chooseCanari')}</option>
                  {availableCanaris.map(c => (
                    <option key={c.id} value={c.id}>{c.nom} ({c.bague} - {c.couleur})</option>
                  ))}
                </select>
                {availableCanaris.length === 0 && (
                  <span className="text-[10px] text-red-500 mt-1 block">⚠️ {t('noCanariAvailable')}</span>
                )}
              </div>

              {/* Date & Price */}
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
                  <label className="block font-semibold text-slate-600 mb-1">{t('prixLabel')} (DT)</label>
                  <input
                    type="number"
                    required
                    min="0.001"
                    step="0.001"
                    placeholder="ex. 50.000"
                    value={prix}
                    onChange={(e) => setPrix(e.target.value)}
                    className="w-full bg-white p-2 border border-slate-200 rounded"
                  />
                </div>
              </div>

              {/* Purchaser */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('acheteurLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('buyerPlaceholder')}
                  value={acheteur}
                  onChange={(e) => setAcheteur(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t('descriptionLabel')}</label>
                <input
                  type="text"
                  placeholder={t('saleDescriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={!canariId}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm mt-2"
              >
                <Check className="w-4.5 h-4.5" /> {t('enregistrerVente')}
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-slate-400 text-xs">
              <h4 className="font-bold text-slate-700">{t('cessionControl')}</h4>
              <p className="leading-relaxed mt-1">
                {t('cessionControlDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
