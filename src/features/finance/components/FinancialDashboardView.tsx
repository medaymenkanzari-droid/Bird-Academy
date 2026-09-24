/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, Minus, Download, 
  FileText, Search, ArrowUpRight, ArrowDownRight, Tag, User, 
  Layers, Filter, Trash2, Printer, Coins, PieChart, BarChart3, 
  CheckCircle2, Sparkles, Scale, AlertCircle 
} from 'lucide-react';
import { Depense, Vente, Canari } from '../../../types';
import { UnifiedTransaction, TransactionType } from '../models/finance';
import { FinanceService } from '../services/FinanceService';
import { FinanceRepository } from '../repositories/FinanceRepository';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { MonthlyCashFlowChart } from './MonthlyCashFlowChart';
import { ExpenseDistributionChart } from './ExpenseDistributionChart';
import { TransferCertificateModal } from './TransferCertificateModal';
import { RecordTransactionModal } from './RecordTransactionModal';
import { AppKpiCard, AppButton } from '../../../components/design-system';
import { formatCurrency } from '../../../utils/currencyFormatter';
import { exportDocumentAsPDF } from '../../../utils/printUtils';
import { useLanguage } from '../../../context/LanguageContext';

export interface FinancialDashboardViewProps {
  depenses?: Depense[];
  ventes?: Vente[];
  canaris?: Canari[];
  onAddDepense?: (date: string, montant: number, categorie: Depense['categorie'], description: string) => true | string;
  onAddVente?: (canariId: number, prix: number, date: string, acheteur: string, description: string) => true | string;
  className?: string;
}

export const FinancialDashboardView: React.FC<FinancialDashboardViewProps> = ({
  depenses: propDepenses,
  ventes: propVentes,
  canaris: propCanaris,
  className = ''
}) => {
  const { t, isRtl } = useLanguage();
  const [expenses, setExpenses] = useState<Depense[]>(() => propDepenses || FinanceRepository.getExpenses());
  const [sales, setSales] = useState<Vente[]>(() => propVentes || FinanceRepository.getSales());
  const birds = useMemo(() => propCanaris || BirdRepository.getAll(), [propCanaris]);

  // Sync if props update
  React.useEffect(() => {
    if (propDepenses) setExpenses(propDepenses);
    if (propVentes) setSales(propVentes);
  }, [propDepenses, propVentes]);

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordModalDefaultType, setRecordModalDefaultType] = useState<TransactionType>('sale');
  const [selectedSaleForCert, setSelectedSaleForCert] = useState<{ sale: Vente; bird?: Canari } | null>(null);

  // Table filter state
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'expenses'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculate Core Financial Metrics
  const totalRevenue = useMemo(() => {
    return sales.reduce((acc, s) => acc + (Number(s.prix) || 0), 0);
  }, [sales]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((acc, e) => acc + (Number(e.montant) || 0), 0);
  }, [expenses]);

  const netMargin = totalRevenue - totalExpenses;
  const marginPercentage = totalRevenue > 0 ? ((netMargin / totalRevenue) * 100).toFixed(1) : '0';

  const activeAliveBirdsCount = useMemo(() => {
    return birds.filter(b => !b.archived && b.statut_sante !== 'Décédé' && b.statut_sante !== 'Mort' && b.statut_sante !== 'Vendu').length;
  }, [birds]);

  const unitCostPerBird = useMemo(() => {
    if (activeAliveBirdsCount === 0) return 0;
    return Number((totalExpenses / activeAliveBirdsCount).toFixed(2));
  }, [totalExpenses, activeAliveBirdsCount]);

  // 2. Build Unified Transactions Stream
  const unifiedTransactions: UnifiedTransaction[] = useMemo(() => {
    const list: UnifiedTransaction[] = [];

    // Map sales
    sales.forEach(s => {
      const linkedBird = birds.find(b => b.id === s.canari_id);
      list.push({
        id: `sale-${s.id}`,
        originalId: s.id,
        type: 'sale',
        date: s.date,
        reference: `VTE-${new Date(s.date).getFullYear()}-${s.id.toString().padStart(3, '0')}`,
        category: 'Vente & Cession',
        description: s.description || `Cession de l'oiseau #${s.canari_id}`,
        partyName: s.acheteur || 'Acquéreur particulier',
        amount: Number(s.prix) || 0,
        linkedBirdId: s.canari_id,
        linkedBird,
        status: 'completed'
      });
    });

    // Map expenses
    expenses.forEach(e => {
      list.push({
        id: `exp-${e.id}`,
        originalId: e.id,
        type: 'expense',
        date: e.date,
        reference: `DEP-${new Date(e.date).getFullYear()}-${e.id.toString().padStart(3, '0')}`,
        category: e.categorie,
        description: e.description,
        partyName: e.categorie === 'Alimentation' ? 'Fournisseur Graines' : e.categorie === 'Santé' ? 'Pharmacie Aviaire' : 'Fournisseur Matériel',
        amount: Number(e.montant) || 0,
        status: 'completed'
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, expenses, birds]);

  // Filter transactions based on tab and search
  const filteredTransactions = useMemo(() => {
    return unifiedTransactions.filter(t => {
      if (activeTab === 'sales' && t.type !== 'sale') return false;
      if (activeTab === 'expenses' && t.type !== 'expense') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.reference.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.partyName.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.linkedBird?.bague && t.linkedBird.bague.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [unifiedTransactions, activeTab, searchQuery]);

  // Handlers
  const handleDeleteTransaction = (tx: UnifiedTransaction) => {
    if (tx.type === 'sale') {
      FinanceRepository.deleteSale(tx.originalId);
      setSales(FinanceRepository.getSales());
    } else {
      FinanceRepository.deleteExpense(tx.originalId);
      setExpenses(FinanceRepository.getExpenses());
    }
  };

  const handleExportCSV = () => {
    const headers = 'Type;Reference;Date;Categorie;Tiers_ou_Bague;Description;Montant\n';
    const rows = unifiedTransactions.map(t => {
      const typeLabel = t.type === 'sale' ? 'Vente' : 'Dépense';
      const ref = (t.reference || '').replace(/"/g, '""');
      const date = (t.date || '').replace(/"/g, '""');
      const cat = (t.category || '').replace(/"/g, '""');
      const party = (t.linkedBird?.bague || t.partyName || '').replace(/"/g, '""');
      const desc = (t.description || '').replace(/"/g, '""');
      const amt = t.amount !== undefined ? `${t.amount}` : '0';
      return `"${typeLabel}";"${ref}";"${date}";"${cat}";"${party}";"${desc}";"${amt}"`;
    }).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bilan_Financier_Elevage_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-7 text-slate-100 font-sans ${className}`}>
      
      {/* 1. Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Gestion Financière & Rentabilité de l'Élevage
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Suivi des cessions d'oiseaux, dépenses d'exploitation et rentabilité globale.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <AppButton
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            startIcon={<Download className="w-3.5 h-3.5" />}
            className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
          >
            Exporter Bilan
          </AppButton>

          <AppButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setRecordModalDefaultType('expense');
              setIsRecordModalOpen(true);
            }}
            startIcon={<Minus className="w-3.5 h-3.5 text-amber-300" />}
            className="bg-amber-950/70 hover:bg-amber-900/80 text-amber-200 border border-amber-700/60 text-xs font-bold"
          >
            — Nouvelle Dépense
          </AppButton>

          <AppButton
            variant="primary"
            size="sm"
            onClick={() => {
              setRecordModalDefaultType('sale');
              setIsRecordModalOpen(true);
            }}
            startIcon={<Plus className="w-3.5 h-3.5 text-white" />}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-950/40"
          >
            + Vente / Cession
          </AppButton>
        </div>
      </div>

      {/* 2. Top 4 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* KPI 1: Chiffre d'Affaires Ventes */}
        <AppKpiCard
          title="Chiffre d'Affaires Ventes"
          value={formatCurrency(totalRevenue)}
          subtitle={`${sales.length} oiseau(x) cédé(s)`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          variant="success"
        />

        {/* KPI 2: Total Dépenses */}
        <AppKpiCard
          title={t('totalOperatingExpenses')}
          value={formatCurrency(totalExpenses)}
          subtitle={`${expenses.length} dépense(s) enregistrée(s)`}
          icon={<TrendingDown className="w-5 h-5 text-amber-400" />}
          variant="warning"
        />

        {/* KPI 3: Marge Nette Réelle */}
        <AppKpiCard
          title="Marge Nette Réelle"
          value={formatCurrency(netMargin)}
          subtitle={netMargin >= 0 ? `Bénéfice net (${marginPercentage}% du CA)` : `Déficit d'exploitation`}
          icon={<DollarSign className={`w-5 h-5 ${netMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />}
          variant={netMargin >= 0 ? 'success' : 'danger'}
        />

        {/* KPI 4: Coût Moyen par Sujet */}
        <AppKpiCard
          title="Coût Moyen par Sujet"
          value={formatCurrency(unitCostPerBird)}
          subtitle={`Pour ${activeAliveBirdsCount} oiseau(x) en élevage`}
          icon={<Scale className="w-5 h-5 text-blue-400" />}
          variant="info"
        />

      </div>

      {/* 3. Analytics Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left (7 Cols): Monthly Cash Flow Chart */}
        <div className="lg:col-span-7">
          <MonthlyCashFlowChart expenses={expenses} sales={sales} />
        </div>

        {/* Right (5 Cols): Expense Distribution by Category */}
        <div className="lg:col-span-5">
          <ExpenseDistributionChart expenses={expenses} />
        </div>

      </div>

      {/* 4. Unified Transaction Table & Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          
          {/* Tabbed Filters */}
          <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1 text-2xs font-bold">
            {[
              { id: 'all', label: `Toutes (${unifiedTransactions.length})` },
              { id: 'sales', label: `Ventes & Cessions (${sales.length})` },
              { id: 'expenses', label: `Dépenses (${expenses.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filtrer par bague, réf, tiers..."
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Coins className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p>Aucune transaction financière trouvée pour ces critères.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-3xs font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">{t('dateLabel')}</th>
                  <th className="py-3 px-3">Référence</th>
                  <th className="py-3 px-3">{t('typeAndCategory')}</th>
                  <th className="py-3 px-3">Sujet / Tiers</th>
                  <th className="py-3 px-3">Intitulé</th>
                  <th className="py-3 px-3 text-right">Montant</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map(tx => {
                  const isSale = tx.type === 'sale';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-950/40 transition-colors group">
                      
                      {/* Date */}
                      <td className="py-3.5 px-3 font-mono text-slate-400 whitespace-nowrap text-2xs">
                        {tx.date}
                      </td>

                      {/* Reference */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-300 whitespace-nowrap text-2xs">
                        {tx.reference}
                      </td>

                      {/* Type & Category Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase tracking-wider border flex items-center gap-1 w-fit ${
                          isSale
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {isSale ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-amber-400" />}
                          <span>{tx.category}</span>
                        </span>
                      </td>

                      {/* Subject / Party Name */}
                      <td className="py-3.5 px-3 text-slate-200">
                        {tx.linkedBird ? (
                          <div className="flex items-center gap-1.5 font-mono text-2xs font-bold text-blue-400">
                            <span>{tx.linkedBird.bague}</span>
                            {tx.linkedBird.nom && (
                              <span className="text-slate-400 font-sans font-normal truncate max-w-[120px]">
                                ({tx.linkedBird.nom})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 truncate max-w-[150px] inline-block font-medium">
                            {tx.partyName}
                          </span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-3 text-slate-400 text-3xs max-w-[200px] truncate">
                        {tx.description}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-mono font-black text-sm">
                        <span className={isSale ? 'text-emerald-400' : 'text-slate-300'}>
                          {isSale ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isSale && (
                            <button
                              onClick={() => {
                                const saleObj = sales.find(s => s.id === tx.originalId);
                                if (saleObj) {
                                  setSelectedSaleForCert({
                                    sale: saleObj,
                                    bird: tx.linkedBird
                                  });
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-3xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Générer l'Attestation Officielle de Cession"
                            >
                              <FileText className="w-3 h-3 text-blue-400" />
                              <span>Certificat</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteTransaction(tx)}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Supprimer la transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modal: Enregistrer une transaction */}
      {isRecordModalOpen && (
        <RecordTransactionModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          defaultType={recordModalDefaultType}
          allBirds={birds}
          onSuccess={(type) => {
            setExpenses(FinanceRepository.getExpenses());
            setSales(FinanceRepository.getSales());
          }}
        />
      )}

      {/* Modal: Certificat officiel de cession */}
      {selectedSaleForCert && (
        <TransferCertificateModal
          isOpen={Boolean(selectedSaleForCert)}
          onClose={() => setSelectedSaleForCert(null)}
          sale={selectedSaleForCert.sale}
          bird={selectedSaleForCert.bird}
        />
      )}

    </div>
  );
};

export default FinancialDashboardView;
