/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslation } from '../utils/adminTranslations';
import { AdminExecutiveDashboard } from './AdminExecutiveDashboard';
import { AdminUserDirectory } from './AdminUserDirectory';
import { AdminOrganizations } from './AdminOrganizations';
import { AdminLmseCenter } from './AdminLmseCenter';
import { AdminBiologicalRegistry } from './AdminBiologicalRegistry';
import { AdminSecurityQa } from './AdminSecurityQa';
import { AdminSupportReporting } from './AdminSupportReporting';
import { AdminGlobalSettings } from './AdminGlobalSettings';
import { 
  AppPage, AppHeader 
} from '../../../components/design-system';
import { 
  LayoutDashboard, Users, Building2, Key, Dna, Shield, MessageSquare, Settings,
  Layers, Lock, SlidersHorizontal
} from 'lucide-react';

import { isUserBuild, assertAdminContext } from '../../../config/appMode';

export const AdminCenterView: React.FC = () => {
  if (isUserBuild()) {
    return (
      <AppPage>
        <div className="p-8 text-center text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900">
          Accès Refusé — Le Centre d'Administration Enterprise est totalement indépendant de l'application utilisateur.
        </div>
      </AppPage>
    );
  }

  assertAdminContext();

  const { language } = useLanguage();
  const t = (key: string) => getAdminTranslation(language, key);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeGroup, setActiveGroup] = useState<'governance' | 'system' | 'management'>('governance');

  const navGroups = [
    {
      id: 'governance',
      label: 'Gouvernance & Utilisateurs',
      icon: Layers,
      tabs: [
        { id: 'dashboard', label: t('tabExecutiveDashboard'), icon: LayoutDashboard },
        { id: 'users', label: t('tabUserDirectory'), icon: Users },
        { id: 'orgs', label: t('tabOrganizations'), icon: Building2 },
      ]
    },
    {
      id: 'system',
      label: 'Système & Sécurité',
      icon: Lock,
      tabs: [
        { id: 'lmse', label: t('tabLmseCenter'), icon: Key },
        { id: 'species', label: t('tabBiologicalRegistry'), icon: Dna },
        { id: 'security', label: t('tabSecurityQa'), icon: Shield },
      ]
    },
    {
      id: 'management',
      label: 'Support & Paramètres',
      icon: SlidersHorizontal,
      tabs: [
        { id: 'support', label: t('tabSupportReporting'), icon: MessageSquare },
        { id: 'settings', label: t('tabGlobalSettings'), icon: Settings },
      ]
    }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const parentGroup = navGroups.find(g => g.tabs.some(tItem => tItem.id === tabId));
    if (parentGroup) {
      setActiveGroup(parentGroup.id as any);
    }
  };

  const handleGroupChange = (groupId: 'governance' | 'system' | 'management') => {
    setActiveGroup(groupId);
    const targetGroup = navGroups.find(g => g.id === groupId);
    if (targetGroup && targetGroup.tabs.length > 0) {
      // If current activeTab is not in this group, select first tab of group
      const isInGroup = targetGroup.tabs.some(tItem => tItem.id === activeTab);
      if (!isInGroup) {
        setActiveTab(targetGroup.tabs[0].id);
      }
    }
  };

  return (
    <AppPage>
      <AppHeader
        title={t('adminTitle')}
        subtitle={t('adminSubtitle')}
      />

      {/* Streamlined Grouped Navigation Bar */}
      <div className="mt-6 mb-6 space-y-3">
        {/* Tier 1: Group Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
          {navGroups.map((group) => {
            const Icon = group.icon;
            const isGroupActive = activeGroup === group.id;
            return (
              <button
                key={group.id}
                data-testid={`admin-nav-group-${group.id}`}
                type="button"
                onClick={() => handleGroupChange(group.id as any)}
                className={`
                  flex-1 min-w-[160px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px]
                  ${isGroupActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{group.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tier 2: Specific Sub-modules in Active Group */}
        <div className="flex flex-wrap items-center gap-2 px-1">
          {navGroups.find(g => g.id === activeGroup)?.tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`admin-nav-tab-${tab.id}`}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[40px]
                  ${isTabActive
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-blue-500/30 dark:border-blue-500/40 shadow-xs font-bold'
                    : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/40 border border-transparent'
                  }
                `}
              >
                <TabIcon className={`w-3.5 h-3.5 ${isTabActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* View Content Body */}
      <div className="transition-all duration-200">
        {activeTab === 'dashboard' && <AdminExecutiveDashboard />}
        {activeTab === 'users' && <AdminUserDirectory />}
        {activeTab === 'orgs' && <AdminOrganizations />}
        {activeTab === 'lmse' && <AdminLmseCenter />}
        {activeTab === 'species' && <AdminBiologicalRegistry />}
        {activeTab === 'security' && <AdminSecurityQa />}
        {activeTab === 'support' && <AdminSupportReporting />}
        {activeTab === 'settings' && <AdminGlobalSettings />}
      </div>
    </AppPage>
  );
};

export default AdminCenterView;
