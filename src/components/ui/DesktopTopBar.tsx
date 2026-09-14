/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Moon, Sun, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LicenseStatusBadge } from '../../features/licensing/components/LicenseStatusBadge';
import { useSubscription } from '../../features/subscription/hooks/useSubscription';
import { TierBadge } from '../../features/subscription/components/TierBadge';
import { NotificationPopover } from './NotificationPopover';
import { NotificationService } from '../../features/platform/services/NotificationService';
import { isQaMode } from '../../config/appMode';
import { QaResetModal } from '../../features/licensing/components/QaResetModal';

export interface DesktopTopBarProps {
  currentTab: string;
  onOpenActivationModal?: () => void;
  onOpenUpgradeModal?: () => void;
  onSearchQueryChange?: (query: string) => void;
  className?: string;
}

export const DesktopTopBar: React.FC<DesktopTopBarProps> = ({
  currentTab,
  onOpenActivationModal,
  onOpenUpgradeModal,
  onSearchQueryChange,
  className = '',
}) => {
  const { t, isRtl } = useLanguage();
  const { currentTier } = useSubscription();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQaResetModalOpen, setIsQaResetModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(() => NotificationService.getUnreadCount());
  const bellButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setUnreadCount(NotificationService.getUnreadCount());
    const unsubscribe = NotificationService.subscribe(() => {
      setUnreadCount(NotificationService.getUnreadCount());
    });
    return unsubscribe;
  }, []);

  const getModuleTitle = (tabId: string): string => {
    switch (tabId) {
      case 'dashboard': return t('dashboard');
      case 'canaris': return t('canaris');
      case 'cages': return t('cages');
      case 'couples': return t('couples');
      case 'reproduction': return t('reproduction');
      case 'sante': return t('sante');
      case 'alimentation': return t('alimentation');
      case 'calendrier': return t('calendrier');
      case 'assistant': return t('assistant');
      case 'genetics': return t('genetics');
      case 'intelligence': return t('intelligence');
      case 'statistiques': return t('statistiques');
      case 'reference_biologique': return t('bioReference');
      case 'depenses': return t('depenses');
      case 'ventes': return t('ventes');
      case 'parametres': return t('parametres');
      case 'demo_shortcut': return t('demoSandbox');
      default: return 'Bird Academy';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearchQueryChange) {
      onSearchQueryChange(val);
    }
  };

  const toggleTheme = () => {
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.toggle('dark');
      setIsDarkMode(isDark);
      try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (err) {
        // Safe localStorage fallback
      }
    }
  };

  return (
    <header
      data-testid="desktop-top-bar"
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`hidden lg:flex items-center justify-between px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-2xs shrink-0 ${className}`}
    >
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>{t('desktopBreadcrumbHome')}</span>
          <ChevronRight className={`w-3.5 h-3.5 text-slate-400 ${isRtl ? 'rotate-180' : ''}`} />
          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
            {getModuleTitle(currentTab)}
          </span>
        </nav>
        <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
          {getModuleTitle(currentTab)}
        </h2>
      </div>

      {/* Right: Quick Search, Notifications, Theme Toggle, License Badge */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Search */}
        <div className="relative w-64 xl:w-72">
          <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={t('desktopSearchPlaceholder')}
            className={`w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 rounded-xl transition-all outline-none`}
            aria-label={t('desktopQuickSearch')}
          />
        </div>

        {/* Notifications Icon Button with Popover */}
        <div className="relative">
          <button
            ref={bellButtonRef}
            type="button"
            data-testid="notification-button"
            onClick={() => setIsNotificationsOpen(prev => !prev)}
            aria-expanded={isNotificationsOpen}
            aria-haspopup="dialog"
            className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
              isNotificationsOpen
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={t('desktopNotifications')}
            aria-label={t('desktopNotifications')}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span
                data-testid="notification-badge"
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900"
              />
            )}
          </button>

          <NotificationPopover
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            anchorRef={bellButtonRef}
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title={t('desktopToggleTheme')}
          aria-label={t('desktopToggleTheme')}
        >
          {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
        </button>

        {/* License & Tier Status Badges */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          {isQaMode() && (
            <>
              <button
                type="button"
                data-testid="topbar-qa-reset-btn"
                aria-label="QA controls"
                onClick={() => setIsQaResetModalOpen(true)}
                title={t('qaResetTestEnvironment') || "🧪 Réinitialiser l'environnement de test"}
                className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1"
              >
                <span>{t('qaResetTestEnvironment') || "🧪 Réinitialiser l'environnement de test"}</span>
              </button>
              <QaResetModal
                isOpen={isQaResetModalOpen}
                onClose={() => setIsQaResetModalOpen(false)}
              />
            </>
          )}
          <button
            type="button"
            data-testid="topbar-tier-badge-btn"
            onClick={onOpenUpgradeModal}
            className="cursor-pointer focus:outline-none hover:opacity-90 transition-opacity"
            title="Cliquez pour afficher les détails du plan commercial"
          >
            <TierBadge tier={currentTier} size="sm" />
          </button>
          <LicenseStatusBadge onOpenActivation={onOpenActivationModal} showDetails={false} />
        </div>
      </div>
    </header>
  );
};

export default DesktopTopBar;
