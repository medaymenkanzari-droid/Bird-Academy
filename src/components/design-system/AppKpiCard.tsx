/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface AppKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ElementType | ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'default';
  badge?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const AppKpiCard: React.FC<AppKpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  badge,
  onClick,
  className = '',
}) => {
  const variantStyles = {
    default: {
      border: 'border-slate-200 dark:border-slate-800',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200',
      titleColor: 'text-slate-600 dark:text-slate-400',
      accentGlow: '',
    },
    primary: {
      border: 'border-blue-200/80 dark:border-blue-900/60',
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-600 dark:text-blue-400',
      accentGlow: 'hover:border-blue-400 dark:hover:border-blue-700',
    },
    success: {
      border: 'border-emerald-200/80 dark:border-emerald-900/60',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
      titleColor: 'text-emerald-600 dark:text-emerald-400',
      accentGlow: 'hover:border-emerald-400 dark:hover:border-emerald-700',
    },
    warning: {
      border: 'border-amber-200/80 dark:border-amber-900/60',
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-600 dark:text-amber-400',
      accentGlow: 'hover:border-amber-400 dark:hover:border-amber-700',
    },
    info: {
      border: 'border-indigo-200/80 dark:border-indigo-900/60',
      iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400',
      titleColor: 'text-indigo-600 dark:text-indigo-400',
      accentGlow: 'hover:border-indigo-400 dark:hover:border-indigo-700',
    },
    danger: {
      border: 'border-red-200/80 dark:border-red-900/60',
      iconBg: 'bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400',
      titleColor: 'text-red-600 dark:text-red-400',
      accentGlow: 'hover:border-red-400 dark:hover:border-red-700',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function') {
      const IconComponent = icon as React.ElementType;
      return <IconComponent className="w-5 h-5" />;
    }
    return null;
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-xs
        ${style.border} ${style.accentGlow}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider truncate ${style.titleColor}`}>
              {title}
            </span>
            {badge}
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mt-1">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium truncate">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
              {trend.isPositive ? (
                <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{trend.value}
                </span>
              ) : (
                <span className="flex items-center text-red-600 dark:text-red-400">
                  <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  {trend.value}
                </span>
              )}
              {trend.label && (
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className={`p-3 rounded-xl shrink-0 flex items-center justify-center ${style.iconBg}`}>
            {renderIcon()}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppKpiCard;
