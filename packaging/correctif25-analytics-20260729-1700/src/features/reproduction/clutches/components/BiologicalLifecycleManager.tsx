/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Sparkles, Calendar, Egg as EggIcon, LayoutGrid, Users } from 'lucide-react';
import ClutchList from './ClutchList';
import EggGrid from '../../eggs/components/EggGrid';
import IncubationCalendarView from '../../incubation/components/IncubationCalendarView';
import ClutchWizard from './ClutchWizard';
import ChickGrid from '../../chicks/components/ChickGrid';
import { useLanguage } from '../../../../context/LanguageContext';
import { BIO_TRANSLATIONS } from '../../utils/bioTranslations';
import { AppCard, AppButton, AppBadge } from '../../../../components/design-system';

interface BiologicalLifecycleManagerProps {
  pairId: string;
}

export default function BiologicalLifecycleManager({ pairId }: BiologicalLifecycleManagerProps) {
  const { language } = useLanguage();

  const t = useCallback((key: string): string => {
    const dict = BIO_TRANSLATIONS[language] || BIO_TRANSLATIONS['fr'];
    return dict[key] || BIO_TRANSLATIONS['fr'][key] || String(key);
  }, [language]);

  const [selectedClutchId, setSelectedClutchId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'eggs' | 'incubation' | 'chicks'>('eggs');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectClutch = (id: string) => {
    setSelectedClutchId(id);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      {/* Left Column: List of clutches */}
      <div className="lg:col-span-1 space-y-4">
        <ClutchList 
          pairId={pairId} 
          onSelectClutch={handleSelectClutch} 
          selectedClutchId={selectedClutchId}
        />
      </div>

      {/* Right Column: Clutch details & follow-up */}
      <div className="lg:col-span-2 space-y-4">
        {selectedClutchId ? (
          <AppCard key={`${selectedClutchId}-${refreshTrigger}`} padding="md">
            {/* Tabs Selector */}
            <div className="flex border-b border-slate-100 mb-4">
              <button
                onClick={() => setActiveTab('eggs')}
                className={`flex items-center gap-2 pb-3 text-xs font-bold border-b-2 px-4 transition-all ${
                  activeTab === 'eggs' 
                    ? 'border-amber-500 text-amber-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                {t('clutchesTab')}
              </button>
              <button
                onClick={() => setActiveTab('incubation')}
                className={`flex items-center gap-2 pb-3 text-xs font-bold border-b-2 px-4 transition-all ${
                  activeTab === 'incubation' 
                    ? 'border-amber-500 text-amber-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Calendar className="w-4 h-4" />
                {t('calendarTab')}
              </button>
              <button
                onClick={() => setActiveTab('chicks')}
                className={`flex items-center gap-2 pb-3 text-xs font-bold border-b-2 px-4 transition-all ${
                  activeTab === 'chicks' 
                    ? 'border-amber-500 text-amber-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <Users className="w-4 h-4" />
                {t('chicksTab')}
              </button>
            </div>

            {/* Tab content router */}
            <div className="min-h-[300px]">
              {activeTab === 'eggs' ? (
                <EggGrid 
                  clutchId={selectedClutchId} 
                  onRefreshClutches={handleRefresh}
                />
              ) : activeTab === 'incubation' ? (
                <IncubationCalendarView 
                  clutchId={selectedClutchId} 
                  onRefreshClutches={handleRefresh}
                />
              ) : (
                <ChickGrid 
                  clutchId={selectedClutchId}
                />
              )}
            </div>
          </AppCard>
        ) : (
          <AppCard padding="lg" className="border-dashed bg-slate-50/30 text-center py-16 flex flex-col items-center justify-center h-full min-h-[320px]">
            <EggIcon className="w-12 h-12 text-slate-300 mb-3 fill-slate-100" />
            <h4 className="font-bold text-slate-600 text-sm">
              Sélectionnez une ponte ou commencez-en une
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto mb-4">
              Sélectionnez une ponte dans la colonne de gauche pour suivre le développement des œufs, mirer, ou visualiser son calendrier d'incubation.
            </p>
            <AppButton
              variant="success"
              onClick={() => setIsWizardOpen(true)}
              className="text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Lancer l'assistant de ponte
            </AppButton>
          </AppCard>
        )}
      </div>

      {/* Clutch Wizard Modal */}
      <ClutchWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={(clutchId) => {
          setSelectedClutchId(clutchId);
          handleRefresh();
        }}
        preSelectedPairId={pairId}
      />
    </div>
  );
}
