/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { HorizontalScrollContainer } from '../ui/HorizontalScrollContainer';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }> | ReactNode;
  badge?: string | number;
  description?: string;
}

export interface AppTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'pills' | 'underline';
  className?: string;
}

export const AppTabs: React.FC<AppTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  className = '',
}) => {
  return (
    <HorizontalScrollContainer
      className={`mb-6 ${className}`}
      innerClassName={
        variant === 'pills'
          ? 'p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl gap-1.5'
          : 'border-b border-slate-200 dark:border-slate-800 gap-1 sm:gap-2 pb-0.5'
      }
    >
      <div role="tablist" className="flex items-center gap-1 sm:gap-1.5 w-full">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;

          const renderIcon = () => {
            if (!t.icon) return null;
            if (React.isValidElement(t.icon)) return t.icon;
            if (typeof t.icon === 'function') {
              const IconComp = t.icon;
              return <IconComp className="w-4 h-4 shrink-0" />;
            }
            return null;
          };

          if (variant === 'pills') {
            return (
              <button
                key={t.id}
                role="tab"
                data-testid={`tab-${t.id}`}
                aria-selected={isActive}
                onClick={() => onChange(t.id)}
                className={`
                  flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/80'
                  }
                `}
              >
                {renderIcon()}
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          }

          return (
            <button
              key={t.id}
              role="tab"
              data-testid={`tab-${t.id}`}
              aria-selected={isActive}
              onClick={() => onChange(t.id)}
              className={`
                flex items-center gap-2 px-4 py-3 min-h-[44px] font-medium text-xs sm:text-sm transition-all border-b-2 -mb-px rounded-t-lg cursor-pointer shrink-0 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-950/30'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                }
              `}
            >
              {renderIcon()}
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive
                      ? 'bg-blue-600 text-white dark:bg-blue-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </HorizontalScrollContainer>
  );
};

export default AppTabs;
