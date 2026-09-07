/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { Depense, Vente } from '../../../types';
import { MonthlyCashFlowPoint } from '../models/finance';
import { formatCurrency } from '../../../utils/currencyFormatter';

export interface MonthlyCashFlowChartProps {
  expenses: Depense[];
  sales: Vente[];
  currency?: string;
  className?: string;
}

export const MonthlyCashFlowChart: React.FC<MonthlyCashFlowChartProps> = ({
  expenses,
  sales,
  currency,
  className = ''
}) => {
  const [timeframe, setTimeframe] = useState<'6M' | '12M'>('6M');
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyCashFlowPoint | null>(null);

  // Generate monthly aggregated cash flow points
  const monthlyData: MonthlyCashFlowPoint[] = useMemo(() => {
    const numMonths = timeframe === '6M' ? 6 : 12;
    const now = new Date();
    const points: MonthlyCashFlowPoint[] = [];

    const monthNames = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const monthLabel = `${monthNames[monthIndex]} ${String(year).slice(-2)}`;

      // Aggregate sales in this month
      const monthSales = sales
        .filter(s => s.date && s.date.startsWith(monthKey))
        .reduce((sum, s) => sum + (Number(s.prix) || 0), 0);

      // Aggregate expenses in this month
      const monthExpenses = expenses
        .filter(e => e.date && e.date.startsWith(monthKey))
        .reduce((sum, e) => sum + (Number(e.montant) || 0), 0);

      points.push({
        monthKey,
        monthLabel,
        salesAmount: Number(monthSales.toFixed(2)),
        expensesAmount: Number(monthExpenses.toFixed(2)),
        netMargin: Number((monthSales - monthExpenses).toFixed(2))
      });
    }

    return points;
  }, [expenses, sales, timeframe]);

  // Overall totals for the timeframe
  const totalSalesInPeriod = useMemo(() => 
    monthlyData.reduce((acc, p) => acc + p.salesAmount, 0), [monthlyData]);
  const totalExpensesInPeriod = useMemo(() => 
    monthlyData.reduce((acc, p) => acc + p.expensesAmount, 0), [monthlyData]);
  const totalMarginInPeriod = totalSalesInPeriod - totalExpensesInPeriod;

  // SVG Chart Computations
  const width = 600;
  const height = 230;
  const padding = { top: 25, right: 20, bottom: 40, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Maximum value for scaling Y axis
  const maxVal = useMemo(() => {
    const highest = Math.max(
      ...monthlyData.map(p => Math.max(p.salesAmount, p.expensesAmount)),
      50 // minimum scale baseline
    );
    return Math.ceil(highest * 1.15);
  }, [monthlyData]);

  const getY = (val: number) => {
    return padding.top + chartHeight - (val / maxVal) * chartHeight;
  };

  const barGroupWidth = chartWidth / monthlyData.length;
  const singleBarWidth = Math.max(8, Math.min(22, barGroupWidth * 0.32));

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 text-white ${className}`}>
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="font-extrabold text-sm text-white tracking-tight">
              Flux de Trésorerie Mensuel (Ventes vs. Dépenses)
            </h3>
          </div>
          <p className="text-3xs text-slate-400">
            Comparatif des entrées et sorties financières par période mensuelle.
          </p>
        </div>

        {/* Timeframe selector & Net margin pill */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-1 text-2xs font-bold">
            {(['6M', '12M'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tf === '6M' ? '6 Mois' : '1 An'}
              </button>
            ))}
          </div>

          <div className={`px-3 py-1 rounded-xl text-xs font-mono font-black border flex items-center gap-1 ${
            totalMarginInPeriod >= 0
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}>
            {totalMarginInPeriod >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> : <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />}
            <span>Net : {formatCurrency(totalMarginInPeriod)}</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart Area */}
      <div className="relative select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            {/* Sales gradient */}
            <linearGradient id="salesBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.7" />
            </linearGradient>

            {/* Expenses gradient */}
            <linearGradient id="expensesBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, maxVal * 0.33, maxVal * 0.66, maxVal].map((val, idx) => {
            const yPos = getY(val);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={yPos}
                  x2={width - padding.right}
                  y2={yPos}
                  stroke="#334155"
                  strokeWidth="0.5"
                  strokeDasharray={idx === 0 ? '' : '3 3'}
                  opacity="0.5"
                />
                <text
                  x={padding.left - 8}
                  y={yPos + 3}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Bar Groups */}
          {monthlyData.map((pt, idx) => {
            const groupCenterX = padding.left + (idx + 0.5) * barGroupWidth;
            const salesX = groupCenterX - singleBarWidth - 2;
            const expensesX = groupCenterX + 2;

            const salesHeight = Math.max(2, (pt.salesAmount / maxVal) * chartHeight);
            const expensesHeight = Math.max(2, (pt.expensesAmount / maxVal) * chartHeight);

            const salesY = padding.top + chartHeight - salesHeight;
            const expensesY = padding.top + chartHeight - expensesHeight;

            const isHovered = hoveredMonth?.monthKey === pt.monthKey;

            return (
              <g
                key={pt.monthKey}
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setHoveredMonth(pt)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Background hover highlight */}
                {isHovered && (
                  <rect
                    x={padding.left + idx * barGroupWidth + 2}
                    y={padding.top}
                    width={barGroupWidth - 4}
                    height={chartHeight}
                    fill="#3b82f6"
                    opacity="0.08"
                    rx="8"
                  />
                )}

                {/* Sales Bar (Emerald) */}
                <rect
                  x={salesX}
                  y={salesY}
                  width={singleBarWidth}
                  height={salesHeight}
                  fill="url(#salesBarGrad)"
                  rx="4"
                  className="transition-all duration-200"
                />

                {/* Expenses Bar (Amber) */}
                <rect
                  x={expensesX}
                  y={expensesY}
                  width={singleBarWidth}
                  height={expensesHeight}
                  fill="url(#expensesBarGrad)"
                  rx="4"
                  className="transition-all duration-200"
                />

                {/* Month Label on X-axis */}
                <text
                  x={groupCenterX}
                  y={height - 15}
                  fill={isHovered ? '#60a5fa' : '#94a3b8'}
                  fontSize="9"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {pt.monthLabel}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredMonth && (
          <div className="absolute top-2 right-2 bg-slate-950/95 border border-slate-700 p-3 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[170px] pointer-events-none animate-fadeIn">
            <div className="text-2xs font-extrabold text-blue-400 border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>{hoveredMonth.monthLabel}</span>
              <span className="text-3xs font-mono text-slate-500">{hoveredMonth.monthKey}</span>
            </div>

            <div className="flex items-center justify-between text-2xs">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Ventes :
              </span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(hoveredMonth.salesAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-2xs">
              <span className="flex items-center gap-1 text-amber-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Dépenses :
              </span>
              <span className="font-mono font-bold text-white">
                {formatCurrency(hoveredMonth.expensesAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-2xs pt-1 border-t border-slate-800">
              <span className="text-slate-400 font-bold">Marge nette :</span>
              <span className={`font-mono font-black ${
                hoveredMonth.netMargin >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {formatCurrency(hoveredMonth.netMargin)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-between text-3xs text-slate-400 pt-1 border-t border-slate-800 flex-wrap gap-3">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm" /> Ventes & Cessions ({formatCurrency(totalSalesInPeriod)})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500 shadow-sm" /> Dépenses & Achats ({formatCurrency(totalExpensesInPeriod)})
          </span>
        </div>
        <span className="font-mono text-slate-500">
          Période active : {timeframe === '6M' ? 'Derniers 6 mois' : 'Dernière année'}
        </span>
      </div>

    </div>
  );
};

export default MonthlyCashFlowChart;
