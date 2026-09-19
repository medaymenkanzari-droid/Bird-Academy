/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — MOBILE BOTTOM NAVIGATION BAR
 * Fixed 4-tab mobile navigation with glassmorphism & safe-area padding.
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { WebRoute } from '../../types';
import { Bird, Egg, Dna, User } from 'lucide-react';

export interface WebMobileBottomNavProps {
  currentRoute: WebRoute;
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebMobileBottomNav: React.FC<WebMobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const { t, isRtl } = useWebLanguage();

  const tabs = [
    {
      id: 'birds',
      label: t('mobileNav.tabBirds') || 'Oiseaux',
      route: 'products' as WebRoute,
      icon: Bird,
      activeRoutes: ['products', 'product-free', 'product-premium', 'product-pro'],
      testId: 'mobile-tab-birds',
    },
    {
      id: 'tracking',
      label: t('mobileNav.tabTracking') || 'Suivi',
      route: 'download' as WebRoute,
      icon: Egg,
      activeRoutes: ['download', 'download-doc'],
      testId: 'mobile-tab-tracking',
    },
    {
      id: 'genetics',
      label: t('mobileNav.tabGenetics') || 'Génétique',
      route: 'pricing' as WebRoute,
      icon: Dna,
      activeRoutes: ['pricing', 'checkout'],
      testId: 'mobile-tab-genetics',
    },
    {
      id: 'profile',
      label: t('mobileNav.tabProfile') || 'Profil',
      route: 'account' as WebRoute,
      icon: User,
      activeRoutes: ['account', 'license', 'order-confirmation', 'orders'],
      testId: 'mobile-tab-profile',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
      dir={isRtl ? 'rtl' : 'ltr'}
      aria-label="Navigation mobile principale"
      data-testid="web-mobile-bottom-nav"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto items-center px-1">
        {tabs.map((tab) => {
          const isActive = tab.activeRoutes.includes(currentRoute);
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onNavigate(tab.route);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center h-full w-full py-1.5 transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#2e3a8c] dark:text-indigo-400 font-extrabold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              data-testid={tab.testId}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-full bg-[#2e3a8c] dark:bg-indigo-400 shadow-sm" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-2'}`} />
                {isActive && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[#ffc107] ring-2 ring-white dark:ring-slate-900" />
                )}
              </div>

              <span className="text-[11px] tracking-tight mt-1 truncate max-w-[70px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
