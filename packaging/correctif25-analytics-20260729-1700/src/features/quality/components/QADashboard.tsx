/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getQualityTranslation } from '../utils/translations';
import { ValidationTab } from './ValidationTab';
import { ErrorCenterTab } from './ErrorCenterTab';
import { TestsTab } from './TestsTab';
import { BenchmarksTab } from './BenchmarksTab';
import { AccessibilityTab } from './AccessibilityTab';
import { MonitoringTab } from './MonitoringTab';
import { ReleaseTab } from './ReleaseTab';
import { HelpDocTab } from './HelpDocTab';
import { ImportExportPro } from './ImportExportPro';
import { DemoModeTab } from './DemoModeTab';
import { BrandingTab } from './BrandingTab';
import { EnterpriseDataIntegrityTab } from './EnterpriseDataIntegrityTab';
import { PrivateBetaReadinessTab } from './PrivateBetaReadinessTab';
import { PrivateBetaEcosystemTab } from './PrivateBetaEcosystemTab';
import { UXExcellenceTab } from './UXExcellenceTab';
import { PerformanceOptimizationTab } from './PerformanceOptimizationTab';
import { AccessibilityAAATab } from './AccessibilityAAATab';
import { ReleaseCandidateTab } from './ReleaseCandidateTab';
import { StoreDeploymentTab } from './StoreDeploymentTab';
import { ProductionReadyTab } from './ProductionReadyTab';
import { GlobalErrorEngine } from '../errors/GlobalErrorEngine';
import { 
  ShieldAlert, Bug, Gauge, Code, Eye, Layers, Settings, HelpCircle, 
  GraduationCap, FileSpreadsheet, Database, Sparkles, ShieldCheck, Award,
  Heart, Zap, Smartphone, CheckCircle2
} from 'lucide-react';

export const QADashboard: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<
    | 'validation'
    | 'errors'
    | 'tests'
    | 'benchmarks'
    | 'accessibility'
    | 'monitoring'
    | 'release'
    | 'help'
    | 'importexport'
    | 'demo'
    | 'branding'
    | 'data_integrity'
    | 'beta_readiness'
    | 'beta_ecosystem'
    | 'ux_excellence'
    | 'perf_opt'
    | 'aaa_cert'
    | 'release_candidate'
    | 'store_deployment'
    | 'production_ready'
  >('production_ready');

  const t = (key: string) => getQualityTranslation(language, key);

  // Dynamic badges
  const errorsCount = GlobalErrorEngine.getErrors().length;

  const tabs = [
    { id: 'production_ready', label: "Production v1.0", icon: CheckCircle2, badge: "FINAL" },
    { id: 'store_deployment', label: "Store Deployment", icon: Smartphone, badge: null },
    { id: 'release_candidate', label: "Release Candidate", icon: Award, badge: "RC1" },
    { id: 'aaa_cert', label: "Accessibility AAA", icon: Eye, badge: null },
    { id: 'perf_opt', label: "Performance Opt", icon: Zap, badge: null },
    { id: 'ux_excellence', label: "UX Excellence", icon: Heart, badge: null },
    { id: 'beta_ecosystem', label: "Private Beta Center", icon: Bug, badge: null },
    { id: 'beta_readiness', label: "Private Beta Readiness", icon: Award, badge: "GM" },
    { id: 'data_integrity', label: "Enterprise Data Integrity", icon: ShieldCheck, badge: null },
    { id: 'validation', label: t('navValidation'), icon: ShieldAlert, badge: null },
    { id: 'errors', label: t('navErrors'), icon: Bug, badge: errorsCount > 0 ? errorsCount : null },
    { id: 'tests', label: t('navTests'), icon: Code, badge: null },
    { id: 'benchmarks', label: t('navBenchmarks'), icon: Gauge, badge: null },
    { id: 'accessibility', label: t('navAccessibility'), icon: Eye, badge: null },
    { id: 'monitoring', label: t('navMonitoring'), icon: Layers, badge: null },
    { id: 'release', label: "Release Manager", icon: Settings, badge: null },
    { id: 'help', label: "Guides & FAQ Center", icon: HelpCircle, badge: null },
    { id: 'importexport', label: "Import/Export Pro", icon: FileSpreadsheet, badge: null },
    { id: 'demo', label: "Mode Démo", icon: Database, badge: null },
    { id: 'branding', label: "Branding & Splash", icon: Sparkles, badge: null },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8" id="qa-dashboard-main">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-indigo-600 dark:text-indigo-400 w-8 h-8" />
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl font-sans">
              BIRD ACADEMY ENTERPRISE
            </h1>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Console d'Assurance Qualité et de Certification Réglementaire • Sprint 12 • Version v1.0 Gold Master
          </p>
        </div>

        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/30">
          ● Version 1.0 GOLD MASTER (GM) - Production Ready
        </span>
      </div>

      {/* Main Tabs Navigation & Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 gap-1 lg:gap-1.5 scrollbar-thin">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  id={`qa-tab-btn-${tab.id}`}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition duration-150 shrink-0 cursor-pointer w-full text-left ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white'}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                  
                  {tab.badge !== null && (
                    <span className={`ml-auto px-1.5 py-0.5 rounded-full text-xxs font-extrabold font-mono ${isActive ? 'bg-white text-indigo-700' : 'bg-rose-500 text-white animate-pulse'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic content rendering frame */}
        <div className="lg:col-span-3">
          {activeTab === 'production_ready' && <ProductionReadyTab />}
          {activeTab === 'store_deployment' && <StoreDeploymentTab />}
          {activeTab === 'release_candidate' && <ReleaseCandidateTab />}
          {activeTab === 'aaa_cert' && <AccessibilityAAATab />}
          {activeTab === 'perf_opt' && <PerformanceOptimizationTab />}
          {activeTab === 'ux_excellence' && <UXExcellenceTab />}
          {activeTab === 'beta_ecosystem' && <PrivateBetaEcosystemTab />}
          {activeTab === 'beta_readiness' && <PrivateBetaReadinessTab />}
          {activeTab === 'data_integrity' && <EnterpriseDataIntegrityTab />}
          {activeTab === 'validation' && <ValidationTab />}
          {activeTab === 'errors' && <ErrorCenterTab />}
          {activeTab === 'tests' && <TestsTab />}
          {activeTab === 'benchmarks' && <BenchmarksTab />}
          {activeTab === 'accessibility' && <AccessibilityTab />}
          {activeTab === 'monitoring' && <MonitoringTab />}
          {activeTab === 'release' && <ReleaseTab />}
          {activeTab === 'help' && <HelpDocTab />}
          {activeTab === 'importexport' && <ImportExportPro />}
          {activeTab === 'demo' && <DemoModeTab />}
          {activeTab === 'branding' && <BrandingTab />}
        </div>
      </div>
    </div>
  );
};
