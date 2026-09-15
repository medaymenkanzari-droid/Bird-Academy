import React, { useState } from 'react';
import { 
  Home, Bird, Heart, Egg, Grid, Activity, Calendar, 
  TrendingDown, TrendingUp, BarChart3, Settings, Wheat, BookOpen, BrainCircuit, Dna, Sparkles,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../LanguageSelector';
import { AppLogo, AppIcon } from '../design-system';
import { LicenseStatusBadge } from '../../features/licensing/components/LicenseStatusBadge';
import { useSubscription } from '../../features/subscription/hooks/useSubscription';
import { TierBadge } from '../../features/subscription/components/TierBadge';
import { brandAssets } from '../../config/brandAssets';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export interface DesktopSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenActivationModal?: () => void;
  onOpenUpgradeModal?: () => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenActivationModal,
  onOpenUpgradeModal,
  className = '',
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggleCollapse
}) => {
  const { t, isRtl } = useLanguage();
  const { currentTier } = useSubscription();

  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;
  const toggleCollapse = externalOnToggleCollapse || (() => setInternalIsCollapsed(prev => !prev));

  const navigationSections: NavigationSection[] = [
    {
      title: t('navSectionBreeding'),
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: Home },
        { id: 'canaris', label: t('canaris'), icon: Bird },
        { id: 'cages', label: t('cages'), icon: Grid },
        { id: 'couples', label: t('couples'), icon: Heart },
        { id: 'reproduction', label: t('reproduction'), icon: Egg },
      ]
    },
    {
      title: t('navSectionCare'),
      items: [
        { id: 'sante', label: t('sante'), icon: Activity },
        { id: 'alimentation', label: t('alimentation'), icon: Wheat },
        { id: 'calendrier', label: t('calendrier'), icon: Calendar },
      ]
    },
    {
      title: t('navSectionAnalytics'),
      items: [
        { id: 'assistant', label: t('assistant') || 'Assistant IA', icon: Sparkles },
        { id: 'genetics', label: t('genetics'), icon: Dna },
        { id: 'intelligence', label: t('intelligence'), icon: BrainCircuit },
        { id: 'statistiques', label: t('statistiques'), icon: BarChart3 },
        { id: 'reference_biologique', label: t('bioReference'), icon: BookOpen },
      ]
    },
    {
      title: t('navSectionSystem'),
      items: [
        { id: 'depenses', label: t('depenses'), icon: TrendingDown },
        { id: 'ventes', label: t('ventes'), icon: TrendingUp },
        { id: 'parametres', label: t('parametres'), icon: Settings },
        { id: 'demo_shortcut', label: t('demoSandbox'), icon: Sparkles },
      ]
    }
  ];

  return (
    <aside
      data-testid="desktop-sidebar"
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`hidden lg:flex ${
        isCollapsed ? 'w-20' : 'w-64 xl:w-72'
      } bg-slate-900 text-slate-300 flex-col justify-between shrink-0 h-full max-h-screen z-40 shadow-xl transition-all duration-300 ${
        isRtl ? 'border-l border-slate-800' : 'border-r border-slate-800'
      } ${className}`}
    >
      <div className="p-4 xl:p-5 flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Header branding with collapse toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-3 gap-2 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5">
                <img
                  src={brandAssets.logoIcon}
                  alt="Bird Academy"
                  className="w-8 h-8 object-contain inline-block"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-black tracking-tight text-white uppercase font-sans">
                    Bird Academy
                  </span>
                  <span className="text-[8px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                    AVIAN ERP
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title={t('collapseSidebar')}
                aria-label={t('collapseSidebar')}
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full gap-2">
              <img
                src={brandAssets.logoIcon}
                alt="Bird Academy"
                className="w-9 h-9 object-contain"
              />
              <button
                type="button"
                onClick={toggleCollapse}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title={t('expandSidebar')}
                aria-label={t('expandSidebar')}
              >
                {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Language Selector & License Status (Shown in expanded mode, compact badge in collapsed mode) */}
        {!isCollapsed ? (
          <div className="mb-3 flex flex-col gap-2 shrink-0">
            <LanguageSelector variant="dark" />
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between gap-1.5 flex-wrap">
              <button
                type="button"
                data-testid="sidebar-tier-badge-btn"
                onClick={onOpenUpgradeModal}
                className="cursor-pointer focus:outline-none hover:opacity-90 transition-opacity"
                title={t('commercialPlanDetails')}
              >
                <TierBadge tier={currentTier} size="sm" />
              </button>
              <LicenseStatusBadge onOpenActivation={onOpenActivationModal} showDetails />
            </div>
          </div>
        ) : (
          <div className="mb-3 flex flex-col items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="cursor-pointer focus:outline-none"
              title={t('commercialPlan')}
            >
              <TierBadge tier={currentTier} size="sm" showIcon />
            </button>
          </div>
        )}

        {/* Navigation Sections List */}
        <nav
          className="space-y-4 overflow-y-auto flex-1 pe-1 scrollbar-thin"
          aria-label={t('navigation')}
        >
          {navigationSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && (
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 py-1">
                  {section.title}
                </h3>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const isDemo = item.id === 'demo_shortcut';
                return (
                  <button
                    type="button"
                    key={item.id}
                    data-testid={`nav-item-${item.id}`}
                    onClick={() => setCurrentTab(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group min-h-[38px]
                      ${
                        isActive
                          ? 'bg-[#3F51B5] text-white shadow-md shadow-indigo-900/30'
                          : isDemo
                            ? 'text-amber-400/90 hover:bg-amber-500/10 hover:text-amber-300'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : isDemo ? 'text-amber-400' : 'text-slate-400 group-hover:text-white'}`} />
                    {!isCollapsed && <span className="truncate text-start">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center text-[10px] text-slate-400 font-medium shrink-0">
        {!isCollapsed ? (
          <span>Bird Academy Enterprise</span>
        ) : (
          <span className="text-[9px] font-mono">v1.3.6</span>
        )}
      </div>
    </aside>
  );
};

export default DesktopSidebar;
