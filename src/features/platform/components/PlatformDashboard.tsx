/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getPlatformTranslation } from '../utils/translations';
import { SupervisionTab } from './SupervisionTab';
import { BackupTab } from './BackupTab';
import { IntegrityTab } from './IntegrityTab';
import { NotificationTab } from './NotificationTab';
import { CalendarTab } from './CalendarTab';
import { AuditTab } from './AuditTab';
import { DiagnosticsTab } from './DiagnosticsTab';
import { SettingsTab } from './SettingsTab';
import { ShieldCheck, HardDrive, ShieldAlert, Bell, Calendar, Activity, Cpu, Settings, Layout } from 'lucide-react';

export const PlatformDashboard: React.FC = () => {
  const { language, isRtl } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('supervision');

  const tPlat = (key: string) => getPlatformTranslation(language, key);

  const tabsConfig = [
    { id: 'supervision', label: tPlat('monitoring'), icon: Layout },
    { id: 'backup', label: tPlat('backupCenter'), icon: HardDrive },
    { id: 'integrity', label: tPlat('integrityTitle'), icon: ShieldAlert },
    { id: 'notifications', label: tPlat('notificationCenter'), icon: Bell },
    { id: 'calendar', label: tPlat('unifiedCalendar'), icon: Calendar },
    { id: 'audit', label: tPlat('auditTitle'), icon: Activity },
    { id: 'diagnostics', label: tPlat('diagnostics'), icon: Cpu },
    { id: 'settings', label: tPlat('setV2Title'), icon: Settings },
  ];

  const handleNavigateFromSupervision = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 text-left" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. ENTERPRISE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-500 text-slate-900 rounded-md text-[10px] font-black uppercase tracking-wider">
              Sprint 9 Enterprise
            </span>
            <span className="text-[10px] text-slate-400">• v1.2 Offline-First</span>
          </div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            BIRD ACADEMY : PLATFORM FOUNDATION
          </h1>
          <p className="text-xs text-slate-300">
            Console d'administration sécurisée, d'audit relationnel, d'optimisation locale et de planification biologique.
          </p>
        </div>
      </div>

      {/* 2. HORIZONTAL SCROLLABLE TAB NAVIGATION */}
      <div className="border-b border-slate-100 flex overflow-x-auto gap-2 pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
        {tabsConfig.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-50/50 hover:bg-slate-100 text-slate-600 border border-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. DYNAMIC CONTENT PANEL */}
      <div className="transition-all duration-200">
        {activeTab === 'supervision' && <SupervisionTab onNavigate={handleNavigateFromSupervision} />}
        {activeTab === 'backup' && <BackupTab />}
        {activeTab === 'integrity' && <IntegrityTab />}
        {activeTab === 'notifications' && <NotificationTab />}
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'audit' && <AuditTab />}
        {activeTab === 'diagnostics' && <DiagnosticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

    </div>
  );
};
