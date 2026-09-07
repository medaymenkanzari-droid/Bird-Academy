/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Shield, Users, Activity, ChevronRight, MessageSquare, AlertTriangle } from 'lucide-react';
import { Chick } from '../types';
import { ChickService } from '../services/ChickService';
import { useLanguage } from '../../../../context/LanguageContext';
import { BIO_TRANSLATIONS } from '../../utils/bioTranslations';
import { 
  AppButton, AppBadge, AppEmptyState 
} from '../../../../components/design-system';
import ChickDetailModal from './ChickDetailModal';

interface ChickGridProps {
  clutchId: string;
}

export default function ChickGrid({ clutchId }: ChickGridProps) {
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

  const [selectedChick, setSelectedChick] = useState<Chick | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const chicks = useMemo(() => {
    return ChickService.getChicksByClutch(clutchId);
  }, [clutchId, refreshCount, selectedChick]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'growth':
        return <AppBadge variant="warning">En Croissance</AppBadge>;
      case 'weaning':
        return <AppBadge variant="primary">En Sevrage</AppBadge>;
      case 'weaned':
        return <AppBadge variant="success" className="bg-emerald-100 text-emerald-800 border-emerald-200 font-extrabold">Sevré</AppBadge>;
      case 'deceased':
        return <AppBadge variant="outline" className="bg-red-50 text-red-600 border-red-100">Décédé</AppBadge>;
      case 'independent':
        return <AppBadge variant="success" className="bg-purple-100 text-purple-800 border-purple-200 font-extrabold">Promu (Oiseau)</AppBadge>;
      default:
        return <AppBadge variant="outline">{status}</AppBadge>;
    }
  };

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  return (
    <div className="space-y-4 font-sans text-left">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-amber-500" />
          Suivi biologique des Poussins ({chicks.length})
        </h4>
      </div>

      {chicks.length === 0 ? (
        <AppEmptyState
          title="Aucun poussin éclos"
          description="Pour démarrer le cycle biologique d'un poussin, ouvrez l'onglet 'Pontes & Œufs', sélectionnez un œuf fécondé arrivé à terme, puis marquez-le comme 'Éclos'."
          className="py-12"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chicks.map((chick) => {
            const ageDays = ChickService.calculateAgeInDays(chick.hatchDate);
            return (
              <div
                key={chick.id}
                onClick={() => setSelectedChick(chick)}
                className="p-4 bg-white hover:bg-slate-50/50 border border-slate-200/60 hover:border-slate-300 rounded-2xl cursor-pointer text-left transition-all hover:shadow-sm group flex flex-col justify-between h-44"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-extrabold text-slate-800 text-sm group-hover:text-amber-600 transition-colors">
                        {chick.name}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {chick.provisionalNumber}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0 mt-0.5" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mt-3 text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Âge Biologique</span>
                      <strong className="text-amber-600 font-bold">{ageDays} jours</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Poids de naissance</span>
                      <strong className="text-slate-700">{chick.birthWeight}g</strong>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                  <div className="text-[10px] text-slate-400">
                    Sexe: <span className="font-bold text-slate-600">{chick.gender}</span>
                  </div>
                  {getStatusBadge(chick.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedChick && (
        <ChickDetailModal
          isOpen={!!selectedChick}
          onClose={() => setSelectedChick(null)}
          chick={selectedChick}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
