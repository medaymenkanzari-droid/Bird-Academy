/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAnalyticsTranslation } from '../hooks/useAnalyticsTranslation';
import { 
  TrendingUp, TrendingDown, CheckCircle, AlertTriangle, Info, ArrowUpRight, ArrowDownRight, Minus, HelpCircle 
} from 'lucide-react';

// VariationChip: shows positive or negative changes with styling
interface VariationChipProps {
  value: number;
  invertColor?: boolean; // e.g. for mortality where negative change is good
}

export const VariationChip: React.FC<VariationChipProps> = ({ value, invertColor = false }) => {
  const isPositive = value > 0;
  const isZero = value === 0;

  let colorClass = "";
  if (isZero) {
    colorClass = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  } else if (isPositive) {
    colorClass = invertColor 
      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400" 
      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400";
  } else {
    colorClass = invertColor 
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
      : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400";
  }

  return (
    <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-0.5 w-fit ${colorClass}`}>
      {isZero ? (
        <Minus className="w-3 h-3" />
      ) : isPositive ? (
        <ArrowUpRight className="w-3 h-3 shrink-0" />
      ) : (
        <ArrowDownRight className="w-3 h-3 shrink-0" />
      )}
      <span>{isZero ? '' : isPositive ? '+' : ''}{value}%</span>
    </div>
  );
};

// KPIBadge: displays simple statuses
interface KPIBadgeProps {
  status?: 'success' | 'warning' | 'danger' | 'info';
  label: string;
}

export const KPIBadge: React.FC<KPIBadgeProps> = ({ status = 'info', label }) => {
  const classes = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900',
    warning: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900',
    danger: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900',
    info: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900'
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${classes[status]}`}>
      {label}
    </span>
  );
};

// BigNumber: prominently displays a primary stat with styling
interface BigNumberProps {
  value: string | number;
  unit?: string;
  label: string;
  description?: string;
}

export const BigNumber: React.FC<BigNumberProps> = ({ value, unit, label, description }) => {
  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono">{value}</span>
        {unit && <span className="text-sm font-bold text-slate-500">{unit}</span>}
      </div>
      {description && <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{description}</p>}
    </div>
  );
};

// MetricCard: combines icon, label, primary value and a trend badge
interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  change?: number;
  status?: 'success' | 'warning' | 'danger' | 'info';
  description?: string;
  invertColor?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon: Icon,
  change,
  status = 'info',
  description,
  invertColor = false
}) => {
  const borderColors = {
    success: 'border-l-4 border-l-emerald-500',
    warning: 'border-l-4 border-l-amber-500',
    danger: 'border-l-4 border-l-rose-500',
    info: 'border-l-4 border-l-indigo-500'
  };

  return (
    <div className={`p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between h-32 relative overflow-hidden transition-all hover:scale-[1.01] ${borderColors[status]}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate max-w-[150px]">{title}</p>
          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-mono">{value}</span>
            {unit && <span className="text-xs font-bold text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-300" />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/60">
        {change !== undefined ? (
          <VariationChip value={change} invertColor={invertColor} />
        ) : (
          <span className="text-[10px] text-slate-400 truncate leading-tight max-w-[160px]">{description}</span>
        )}
        
        {change !== undefined && description && (
          <span className="text-[9px] text-slate-400 truncate max-w-[100px]">{description}</span>
        )}
      </div>
    </div>
  );
};

// ProgressRing: circular metric progress representation
interface ProgressRingProps {
  value: number;
  targetValue: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  targetLabel?: string;
  color?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  targetValue,
  size = 70,
  strokeWidth = 6,
  label,
  targetLabel = 'Target',
  color = 'text-indigo-500'
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const pct = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90">
          {/* Track ring */}
          <circle
            className="text-slate-200 dark:text-slate-700"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress ring */}
          <circle
            className={`${color} transition-all duration-500`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-black font-mono text-slate-800 dark:text-white">
          {value}%
        </div>
      </div>
      <div className="space-y-0.5">
        <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</h5>
        <p className="text-[10px] text-slate-500 font-semibold">
          {targetLabel} : <span className="font-mono text-slate-800 dark:text-slate-200">{targetValue}%</span>
        </p>
      </div>
    </div>
  );
};

// TrendCard: traces historical progression comparing N vs N-1
interface TrendCardProps {
  title: string;
  currentValue: number | string;
  pastValue: number | string;
  changePct: number;
  unit?: string;
  invertTrendColor?: boolean;
}

export const TrendCard: React.FC<TrendCardProps> = ({
  title,
  currentValue,
  pastValue,
  changePct,
  unit = '',
  invertTrendColor = false
}) => {
  const isPositive = changePct > 0;
  const isZero = changePct === 0;

  const displayCurrent = typeof currentValue === 'number'
    ? (Number.isInteger(currentValue) ? currentValue : Number(currentValue.toFixed(unit.includes('TND') || unit.includes('DT') ? 3 : 2)))
    : currentValue;

  const displayPast = typeof pastValue === 'number'
    ? (Number.isInteger(pastValue) ? pastValue : Number(pastValue.toFixed(unit.includes('TND') || unit.includes('DT') ? 3 : 2)))
    : pastValue;

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</p>
      <div className="flex justify-between items-baseline">
        <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">
          {displayCurrent}{unit}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          Précédent : <span className="font-bold font-mono">{displayPast}{unit}</span>
        </span>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-800/40">
        <span className="text-[10px] text-slate-400 font-semibold">Évolution temporelle</span>
        <VariationChip value={changePct} invertColor={invertTrendColor} />
      </div>
    </div>
  );
};

// InsightCard: displays diagnostic panels or suggestions from DSS
interface InsightCardProps {
  title: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  message: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ title, type, message }) => {
  const config = {
    success: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/10',
      border: 'border-emerald-100 dark:border-emerald-900/40',
      text: 'text-emerald-800 dark:text-emerald-400',
      icon: CheckCircle
    },
    warning: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/10',
      border: 'border-amber-100 dark:border-amber-900/40',
      text: 'text-amber-800 dark:text-amber-400',
      icon: AlertTriangle
    },
    danger: {
      bg: 'bg-rose-50/50 dark:bg-rose-950/10',
      border: 'border-rose-100 dark:border-rose-900/40',
      text: 'text-rose-800 dark:text-rose-400',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/10',
      border: 'border-indigo-100 dark:border-indigo-900/40',
      text: 'text-indigo-800 dark:text-indigo-400',
      icon: Info
    }
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <div className={`p-4 border rounded-xl flex gap-3 ${current.bg} ${current.border}`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${current.text}`} />
      <div className="space-y-1">
        <h5 className={`text-[11px] font-black uppercase tracking-wider ${current.text}`}>{title}</h5>
        <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{message}</p>
      </div>
    </div>
  );
};

// ChartCard: standard border container with heading details
interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-4">
      <div className="space-y-0.5">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">{title}</h4>
        {subtitle && <p className="text-[10px] text-slate-400 font-semibold">{subtitle}</p>}
      </div>
      <div className="w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
};

// ExecutiveTile: simple summary panel
export const ExecutiveTile: React.FC<{ title: string; value: string | number; color?: string }> = ({
  title,
  value,
  color = 'text-indigo-600 dark:text-indigo-400'
}) => {
  return (
    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl text-center">
      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">{title}</p>
      <p className={`text-lg font-black mt-1 font-mono ${color}`}>{value}</p>
    </div>
  );
};
