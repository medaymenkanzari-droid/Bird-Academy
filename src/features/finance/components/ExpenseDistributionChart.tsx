/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { PieChart, Utensils, HeartPulse, Wrench, Home, Tag, Info } from 'lucide-react';
import { Depense } from '../../../types';
import { CategoryExpenseBreakdown } from '../models/finance';
import { formatCurrency } from '../../../utils/currencyFormatter';

export interface ExpenseDistributionChartProps {
  expenses: Depense[];
  className?: string;
}

const CATEGORY_COLORS: Record<Depense['categorie'], { bg: string; text: string; hex: string }> = {
  'Alimentation': { bg: 'bg-emerald-500', text: 'text-emerald-400', hex: '#10b981' },
  'Santé': { bg: 'bg-blue-500', text: 'text-blue-400', hex: '#3b82f6' },
  'Matériel': { bg: 'bg-indigo-500', text: 'text-indigo-400', hex: '#6366f1' },
  'Cages': { bg: 'bg-amber-500', text: 'text-amber-400', hex: '#f59e0b' },
  'Autre': { bg: 'bg-purple-500', text: 'text-purple-400', hex: '#a855f7' }
};

export const ExpenseDistributionChart: React.FC<ExpenseDistributionChartProps> = ({
  expenses,
  className = ''
}) => {
  const totalAmount = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.montant) || 0), 0);
  }, [expenses]);

  const breakdown: CategoryExpenseBreakdown[] = useMemo(() => {
    if (totalAmount === 0) return [];

    const catMap: Record<Depense['categorie'], { amount: number; count: number }> = {
      'Alimentation': { amount: 0, count: 0 },
      'Santé': { amount: 0, count: 0 },
      'Matériel': { amount: 0, count: 0 },
      'Cages': { amount: 0, count: 0 },
      'Autre': { amount: 0, count: 0 }
    };

    expenses.forEach(e => {
      const cat = e.categorie || 'Autre';
      if (catMap[cat]) {
        catMap[cat].amount += Number(e.montant) || 0;
        catMap[cat].count += 1;
      } else {
        catMap['Autre'].amount += Number(e.montant) || 0;
        catMap['Autre'].count += 1;
      }
    });

    return (Object.keys(catMap) as Depense['categorie'][])
      .map(cat => {
        const item = catMap[cat];
        const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
        return {
          category: cat,
          amount: Number(item.amount.toFixed(2)),
          percentage: Number(percentage.toFixed(1)),
          count: item.count,
          color: CATEGORY_COLORS[cat]?.hex || '#64748b'
        };
      })
      .filter(b => b.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, totalAmount]);

  const getCategoryIcon = (cat: Depense['categorie']) => {
    switch (cat) {
      case 'Alimentation': return <Utensils className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Santé': return <HeartPulse className="w-3.5 h-3.5 text-blue-400" />;
      case 'Matériel': return <Wrench className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Cages': return <Home className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Tag className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 text-white ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-sm text-white tracking-tight">
              Répartition des Dépenses par Catégorie
            </h3>
          </div>
          <p className="text-3xs text-slate-400">
            Ventilation des coûts d'exploitation et d'entretien du cheptel.
          </p>
        </div>

        <div className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-800">
          Total : {formatCurrency(totalAmount)}
        </div>
      </div>

      {breakdown.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">
          <PieChart className="w-8 h-8 text-slate-700 mx-auto mb-2" />
          <p>Aucune dépense enregistrée pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Segmented Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex shadow-inner border border-slate-800">
            {breakdown.map((item, idx) => (
              <div
                key={idx}
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color
                }}
                className="h-full transition-all duration-300 first:rounded-l-full last:rounded-r-full hover:opacity-90"
                title={`${item.category} : ${item.percentage}% (${formatCurrency(item.amount)})`}
              />
            ))}
          </div>

          {/* Categories List Breakdown */}
          <div className="space-y-2.5 pt-1">
            {breakdown.map(item => (
              <div
                key={item.category}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex items-center gap-1.5 truncate">
                    {getCategoryIcon(item.category)}
                    <span className="font-bold text-slate-200 truncate">
                      {item.category}
                    </span>
                    <span className="text-3xs text-slate-500 font-mono">
                      ({item.count} dépense{item.count > 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-3xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                    {item.percentage}%
                  </span>
                  <span className="font-mono font-black text-white text-xs">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-3xs text-slate-400 pt-1 border-t border-slate-800">
        <span className="text-slate-500">
          Source : Registre comptable interne
        </span>
        <span className="font-mono text-emerald-400 font-semibold">
          {breakdown.length} catégorie(s) active(s)
        </span>
      </div>

    </div>
  );
};

export default ExpenseDistributionChart;
