/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Egg, Plus, Calendar, Activity, Check, HeartCrack, ChevronRight, Ban } from 'lucide-react';
import { Clutch } from '../types';
import { ClutchService } from '../services/ClutchService';
import { EggService } from '../../eggs/services/EggService';
import { IncubationService } from '../../incubation/services/IncubationService';
import { useLanguage } from '../../../../context/LanguageContext';
import { BIO_TRANSLATIONS } from '../../utils/bioTranslations';
import { 
  AppCard, AppButton, AppBadge, AppInput, AppModal, AppEmptyState, AppAlert 
} from '../../../../components/design-system';

interface ClutchListProps {
  pairId: string;
  onSelectClutch: (clutchId: string) => void;
  selectedClutchId: string | null;
}

export default function ClutchList({ pairId, onSelectClutch, selectedClutchId }: ClutchListProps) {
  const { language } = useLanguage();
  
  const t = useCallback((key: string, variables?: Record<string, string | number>): string => {
    const dict = BIO_TRANSLATIONS[language] || BIO_TRANSLATIONS['fr'];
    let text = dict[key] || BIO_TRANSLATIONS['fr'][key] || String(key);
    if (variables) {
      Object.entries(variables).forEach(([k, val]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(val));
      });
    }
    return text;
  }, [language]);

  const clutches = useMemo(() => {
    return ClutchService.getClutchesByPair(pairId);
  }, [pairId, selectedClutchId]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [obs, setObs] = useState('');

  const handleCreate = () => {
    if (!startDate) return;
    const newClutch = ClutchService.createClutch(pairId, startDate, obs);
    onSelectClutch(newClutch.id);
    setIsCreateOpen(false);
    setObs('');
  };

  const handleCloseClutch = (id: string, status: 'completed' | 'abandoned') => {
    ClutchService.updateClutchStatus(id, status);
    onSelectClutch(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
          {t('clutchesTab')}
        </h4>
        <AppButton 
          variant="outline" 
          size="sm" 
          onClick={() => setIsCreateOpen(true)}
          className="text-xs py-1"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          {t('addClutchBtn')}
        </AppButton>
      </div>

      {clutches.length === 0 ? (
        <AppEmptyState
          title={t('noClutches')}
          description={t('noClutchesDesc')}
          className="py-6"
        />
      ) : (
        <div className="space-y-2.5">
          {clutches.map((c) => {
            const isSelected = selectedClutchId === c.id;
            const stats = ClutchService.getClutchStatistics(c.id);
            const incubation = IncubationService.getIncubationByClutch(c.id);

            return (
              <div 
                key={c.id}
                onClick={() => onSelectClutch(c.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-1 ring-slate-800' 
                    : 'bg-white text-slate-700 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                      {t('clutchCreatedOn')} {c.startDate}
                    </span>
                    <h5 className="font-bold text-sm mt-0.5">
                      Ponte #{c.id.split('-')[1] || c.id}
                    </h5>
                  </div>
                  {c.status === 'active' ? (
                    <AppBadge variant="success" size="sm">{t('clutchStatusActive')}</AppBadge>
                  ) : c.status === 'completed' ? (
                    <AppBadge variant="outline" size="sm" className={isSelected ? 'bg-slate-800 border-slate-700 text-slate-300' : ''}>{t('clutchStatusCompleted')}</AppBadge>
                  ) : (
                    <AppBadge variant="text" size="sm" className="bg-red-50 text-red-600">{t('clutchStatusAbandoned')}</AppBadge>
                  )}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-2 text-center my-3 bg-slate-50/10 p-2 rounded-lg text-xs">
                  <div>
                    <span className="block text-[10px] opacity-60">Œufs</span>
                    <span className="block font-extrabold">{c.eggCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] opacity-60">Féconds</span>
                    <span className="block font-extrabold text-amber-500">{c.fertilizedCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] opacity-60">Éclos</span>
                    <span className="block font-extrabold text-emerald-500">{c.hatchedCount}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] opacity-60">Pertes</span>
                    <span className="block font-extrabold text-red-500">{c.lostCount}</span>
                  </div>
                </div>

                {/* More indices */}
                {stats && stats.totalEggs > 0 && (
                  <div className="flex items-center gap-3 text-[10px] opacity-80 border-t border-slate-100/10 pt-2">
                    <span>{t('clutchFertilityRate')}: <strong className="text-amber-400">{stats.fertilityRate}%</strong></span>
                    <span>{t('clutchHatchRate')}: <strong className="text-emerald-400">{stats.hatchRate}%</strong></span>
                    <span>{t('clutchFailureRate')}: <strong className="text-red-400">{stats.failureRate}%</strong></span>
                  </div>
                )}

                {/* Quick operations for active clutches */}
                {isSelected && c.status === 'active' && (
                  <div className="flex gap-2 mt-3.5 pt-3.5 border-t border-slate-800/80">
                    <AppButton
                      variant="success"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseClutch(c.id, 'completed');
                      }}
                      className="flex-1 py-1 text-xs"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Terminer
                    </AppButton>
                    <AppButton
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseClutch(c.id, 'abandoned');
                      }}
                      className="flex-1 py-1 text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                    >
                      <Ban className="w-3.5 h-3.5 mr-1" />
                      Abandonner
                    </AppButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Creation Modal */}
      <AppModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Nouvelle Ponte"
        size="md"
      >
        <div className="space-y-4 font-sans">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
              {t('wizardClutchDate')}
            </label>
            <AppInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">
              Observations
            </label>
            <AppInput
              type="text"
              placeholder="Éléments particuliers, météo, etc."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-3">
            <AppButton variant="text" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </AppButton>
            <AppButton variant="success" onClick={handleCreate}>
              Créer la ponte
            </AppButton>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
