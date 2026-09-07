/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, 
  User, Tag, FileText, Check, X, ShieldAlert, Coins, Feather, CheckCircle2 
} from 'lucide-react';
import { Canari, Depense, Vente } from '../../../types';
import { TransactionType, PaymentMethod } from '../models/finance';
import { FinanceService } from '../services/FinanceService';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { AppButton, AppInput, AppSelect } from '../../../components/design-system';

export interface RecordTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  allBirds?: Canari[];
  onSuccess?: (type: TransactionType, item: Depense | Vente) => void;
}

export const RecordTransactionModal: React.FC<RecordTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'sale',
  allBirds: propBirds,
  onSuccess
}) => {
  const [transactionType, setTransactionType] = useState<TransactionType>(defaultType);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load birds
  const birds = useMemo(() => {
    return propBirds || BirdRepository.getAll();
  }, [propBirds]);

  // Eligible birds for sale (alive, not archived, not already sold)
  const eligibleBirdsForSale = useMemo(() => {
    return birds.filter(b => FinanceService.isBirdEligibleForSale(b.id));
  }, [birds]);

  // Form Fields - Sale
  const [saleBirdId, setSaleBirdId] = useState<number>(eligibleBirdsForSale[0]?.id || 0);
  const [salePrice, setSalePrice] = useState<string>('');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [saleBuyer, setSaleBuyer] = useState<string>('');
  const [saleDesc, setSaleDesc] = useState<string>('');
  const [salePaymentMethod, setSalePaymentMethod] = useState<PaymentMethod>('Espèces');

  // Form Fields - Expense
  const [expenseDate, setExpenseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<Depense['categorie']>('Alimentation');
  const [expenseDesc, setExpenseDesc] = useState<string>('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<PaymentMethod>('Espèces');

  // Synchronize initial default type
  React.useEffect(() => {
    setTransactionType(defaultType);
  }, [defaultType]);

  // Keep sale bird ID in sync
  React.useEffect(() => {
    if (!eligibleBirdsForSale.some(b => b.id === saleBirdId) && eligibleBirdsForSale.length > 0) {
      setSaleBirdId(eligibleBirdsForSale[0].id);
    }
  }, [eligibleBirdsForSale, saleBirdId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (transactionType === 'sale') {
      const priceNum = parseFloat(salePrice);
      if (isNaN(priceNum) || priceNum <= 0) {
        setErrorMessage('Veuillez saisir un prix de vente valide supérieur à 0.');
        return;
      }
      if (!saleBuyer.trim()) {
        setErrorMessage('Le nom de l\'acquéreur est obligatoire.');
        return;
      }
      if (!saleBirdId) {
        setErrorMessage('Veuillez sélectionner un oiseau à céder.');
        return;
      }

      const res = FinanceService.addSale(
        Number(saleBirdId),
        priceNum,
        saleDate,
        saleBuyer.trim(),
        saleDesc.trim()
      );

      if (!res.success) {
        setErrorMessage(res.message || 'Erreur lors de l\'enregistrement de la vente.');
        return;
      }

      if (onSuccess && res.data) onSuccess('sale', res.data);
      onClose();

    } else {
      // Expense
      const amountNum = parseFloat(expenseAmount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setErrorMessage('Veuillez saisir un montant de dépense valide supérieur à 0.');
        return;
      }
      if (!expenseDesc.trim()) {
        setErrorMessage('La description / intitulé de la dépense est obligatoire.');
        return;
      }

      const res = FinanceService.addExpense(
        expenseDate,
        amountNum,
        expenseCategory,
        expenseDesc.trim()
      );

      if (!res.success) {
        setErrorMessage(res.message || 'Erreur lors de l\'enregistrement de la dépense.');
        return;
      }

      if (onSuccess && res.data) onSuccess('expense', res.data);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#030712]/80 backdrop-blur-md animate-fadeIn">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Coins className="w-5 h-5 text-blue-400" />
              Enregistrer une Opération Financière
            </h2>
            <p className="text-3xs text-slate-400">
              Saisie d'une vente d'oiseau ou d'une dépense d'exploitation.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Type Switcher Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400">Type d'opération *</label>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => { setTransactionType('sale'); setErrorMessage(null); }}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  transactionType === 'sale'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <span>+ Vente / Cession</span>
              </button>

              <button
                type="button"
                onClick={() => { setTransactionType('expense'); setErrorMessage(null); }}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  transactionType === 'expense'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-4 h-4 text-amber-200" />
                <span>— Dépense / Achat</span>
              </button>
            </div>
          </div>

          {/* VENTE FORM FIELDS */}
          {transactionType === 'sale' ? (
            <div className="space-y-4 pt-1">
              
              {/* Bird Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Oiseau cédé (Disponibles : {eligibleBirdsForSale.length}) *
                </label>
                {eligibleBirdsForSale.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs">
                    Aucun oiseau éligible à la vente. Vérifiez que l'oiseau n'est pas déjà archivé ou vendu.
                  </div>
                ) : (
                  <select
                    value={saleBirdId}
                    onChange={e => setSaleBirdId(Number(e.target.value))}
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 outline-none focus:border-blue-500"
                  >
                    {eligibleBirdsForSale.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.bague} - {b.nom || b.race || 'Canari'} ({b.sexe}) {b.mutation ? `[${b.mutation}]` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Price & Date */}
              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  label="Prix de cession *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={salePrice}
                  onChange={e => setSalePrice(e.target.value)}
                  placeholder="ex. 45.00"
                  autoFocus
                />

                <AppInput
                  label="Date de la vente"
                  type="date"
                  value={saleDate}
                  onChange={e => setSaleDate(e.target.value)}
                />
              </div>

              {/* Buyer Name & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  label="Nom de l'acquéreur *"
                  value={saleBuyer}
                  onChange={e => setSaleBuyer(e.target.value)}
                  placeholder="ex. M. Dupont / Animalerie"
                />

                <AppSelect
                  label="Mode de paiement"
                  value={salePaymentMethod}
                  onChange={(e: any) => setSalePaymentMethod(e.target.value)}
                  options={[
                    { value: 'Espèces', label: 'Espèces (Cash)' },
                    { value: 'Virement Bancaire', label: 'Virement Bancaire' },
                    { value: 'Carte Bancaire', label: 'Carte Bancaire' },
                    { value: 'Chèque', label: 'Chèque' }
                  ]}
                />
              </div>

              <AppInput
                label="Observations / Motif"
                value={saleDesc}
                onChange={e => setSaleDesc(e.target.value)}
                placeholder="ex. Cession jeune de l'année pour renouvellement de souche"
              />

            </div>
          ) : (
            /* DEPENSE FORM FIELDS */
            <div className="space-y-4 pt-1">
              
              <div className="grid grid-cols-2 gap-3">
                <AppSelect
                  label="Catégorie de dépense *"
                  value={expenseCategory}
                  onChange={(e: any) => setExpenseCategory(e.target.value)}
                  options={[
                    { value: 'Alimentation', label: '🌾 Alimentation (Graines & Pâtée)' },
                    { value: 'Santé', label: '💊 Santé & Soins (Traitements)' },
                    { value: 'Matériel', label: '🔧 Matériel (Bagues, Nids, Perchoirs)' },
                    { value: 'Cages', label: '🏠 Cages & Habitat (Volières)' },
                    { value: 'Autre', label: '🏷️ Autre (Expositions, etc.)' }
                  ]}
                />

                <AppInput
                  label="Montant de la dépense *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  placeholder="ex. 32.50"
                  autoFocus
                />
              </div>

              <AppInput
                label="Intitulé / Fournisseur / Référence *"
                value={expenseDesc}
                onChange={e => setExpenseDesc(e.target.value)}
                placeholder="ex. Sac de graines Prestige 20kg (Facture #042)"
              />

              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  label="Date de la dépense"
                  type="date"
                  value={expenseDate}
                  onChange={e => setExpenseDate(e.target.value)}
                />

                <AppSelect
                  label="Mode de règlement"
                  value={expensePaymentMethod}
                  onChange={(e: any) => setExpensePaymentMethod(e.target.value)}
                  options={[
                    { value: 'Espèces', label: 'Espèces' },
                    { value: 'Carte Bancaire', label: 'Carte Bancaire' },
                    { value: 'Virement Bancaire', label: 'Virement Bancaire' },
                    { value: 'Chèque', label: 'Chèque' }
                  ]}
                />
              </div>

            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <AppButton
              variant="outline"
              size="md"
              type="button"
              onClick={onClose}
              className="border-slate-700 text-slate-300 min-h-[44px]"
            >
              Annuler
            </AppButton>

            <AppButton
              variant="primary"
              size="md"
              type="submit"
              startIcon={<Check className="w-4 h-4" />}
              className={`font-bold min-h-[44px] px-5 ${
                transactionType === 'sale'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40 text-white'
              }`}
            >
              {transactionType === 'sale' ? 'Valider la Vente' : 'Enregistrer la Dépense'}
            </AppButton>
          </div>

        </form>

      </div>

    </div>
  );
};

export default RecordTransactionModal;
