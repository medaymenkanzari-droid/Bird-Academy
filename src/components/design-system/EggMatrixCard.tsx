/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Egg, Sparkles, XCircle, CheckCircle2, Eye, Edit3, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type EggItemStatus = 'laid' | 'fertile' | 'clear' | 'hatched';

export interface EggItem {
  id?: string | number;
  number: number;
  status: EggItemStatus;
  layingDate?: string;
  weight?: number;
  notes?: string;
}

export interface EggMatrixCardProps {
  eggs?: EggItem[];
  totalEggs?: number;
  fertileCount?: number;
  hatchedCount?: number;
  maxEggs?: number; // default 6
  clutchId?: number | string;
  layingDate?: string;
  onEggClick?: (egg: EggItem, index: number) => void;
  onEggStatusChange?: (index: number, newStatus: EggItemStatus) => void;
  onQuickCandling?: () => void;
  onEditClutch?: () => void;
  readOnly?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

const STATUS_CONFIG: Record<EggItemStatus, {
  badgeClass: string;
  cardClass: string;
  borderClass: string;
  iconClass: string;
  icon: React.FC<{ className?: string }>;
  nextStatus: EggItemStatus;
}> = {
  laid: {
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    cardClass: 'bg-slate-900/90 hover:bg-slate-850 hover:border-slate-600',
    borderClass: 'border-slate-700 shadow-sm',
    iconClass: 'text-slate-300',
    icon: Egg,
    nextStatus: 'fertile',
  },
  fertile: {
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800/80 shadow-amber-950/50',
    cardClass: 'bg-amber-950/20 hover:bg-amber-950/30 hover:border-amber-500/60',
    borderClass: 'border-amber-500/50 shadow-amber-500/10 shadow-md',
    iconClass: 'text-amber-400',
    icon: Sparkles,
    nextStatus: 'hatched',
  },
  clear: {
    badgeClass: 'bg-slate-950/80 text-slate-400 border-slate-800',
    cardClass: 'bg-slate-950/40 hover:bg-slate-950/60 opacity-60 hover:opacity-100',
    borderClass: 'border-slate-800 border-dashed',
    iconClass: 'text-slate-500',
    icon: XCircle,
    nextStatus: 'laid',
  },
  hatched: {
    badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-800/80 shadow-emerald-950/50',
    cardClass: 'bg-emerald-950/20 hover:bg-emerald-950/30 hover:border-emerald-500/60',
    borderClass: 'border-emerald-500/50 shadow-emerald-500/10 shadow-md',
    iconClass: 'text-emerald-400',
    icon: CheckCircle2,
    nextStatus: 'clear',
  },
};

export const EggMatrixCard: React.FC<EggMatrixCardProps> = ({
  eggs,
  totalEggs = 4,
  fertileCount,
  hatchedCount,
  maxEggs = 6,
  clutchId,
  layingDate,
  onEggClick,
  onEggStatusChange,
  onQuickCandling,
  onEditClutch,
  readOnly = false,
  title,
  subtitle,
  className = '',
}) => {
  const { currentLanguage } = useLanguage();

  const getStatusLabel = (status: EggItemStatus) => {
    switch (status) {
      case 'laid':
        return currentLanguage === 'ar' ? 'تم وضعه' : currentLanguage === 'en' ? 'Laid' : currentLanguage === 'es' ? 'Puesto' : currentLanguage === 'it' ? 'Deposto' : 'Pondu';
      case 'fertile':
        return currentLanguage === 'ar' ? 'مخصب' : currentLanguage === 'en' ? 'Fertile' : currentLanguage === 'es' ? 'Fértil' : currentLanguage === 'it' ? 'Fecondo' : 'Fécondé';
      case 'clear':
        return currentLanguage === 'ar' ? 'فارغ' : currentLanguage === 'en' ? 'Clear' : currentLanguage === 'es' ? 'Claro' : currentLanguage === 'it' ? 'Chiaro' : 'Clair';
      case 'hatched':
        return currentLanguage === 'ar' ? 'فقس' : currentLanguage === 'en' ? 'Hatched' : currentLanguage === 'es' ? 'Eclosionado' : currentLanguage === 'it' ? 'Schiuso' : 'Éclos';
      default:
        return status;
    }
  };

  // Build internal egg items list if none provided
  const internalEggs: EggItem[] = React.useMemo(() => {
    if (eggs && eggs.length > 0) {
      return eggs;
    }
    const generated: EggItem[] = [];
    const count = Math.min(Math.max(totalEggs, 1), maxEggs);

    for (let i = 1; i <= count; i++) {
      let st: EggItemStatus = 'laid';
      if (hatchedCount !== undefined && i <= hatchedCount) {
        st = 'hatched';
      } else if (fertileCount !== undefined && i <= fertileCount) {
        st = 'fertile';
      }
      generated.push({
        id: `egg-${clutchId || 'temp'}-${i}`,
        number: i,
        status: st,
      });
    }
    return generated;
  }, [eggs, totalEggs, fertileCount, hatchedCount, maxEggs, clutchId]);

  const [eggList, setEggList] = useState<EggItem[]>(internalEggs);

  React.useEffect(() => {
    setEggList(internalEggs);
  }, [internalEggs]);

  const handleEggToggle = (index: number) => {
    if (readOnly) return;
    const targetEgg = internalEggs[index];
    if (!targetEgg) return;

    const currentConfig = STATUS_CONFIG[targetEgg.status] || STATUS_CONFIG.laid;
    const nextStatus = currentConfig.nextStatus;

    if (onEggStatusChange) {
      onEggStatusChange(index, nextStatus);
    }
    if (onEggClick) {
      onEggClick(targetEgg, index);
    }

    setEggList(prev => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], status: nextStatus };
      }
      return copy;
    });
  };

  // Summary counts
  const currentFertile = internalEggs.filter(e => e.status === 'fertile' || e.status === 'hatched').length;
  const currentHatched = internalEggs.filter(e => e.status === 'hatched').length;
  const currentClear = internalEggs.filter(e => e.status === 'clear').length;

  const defaultTitle = currentLanguage === 'ar' 
    ? (clutchId ? `مصفوفة البيض — الحضنة #${clutchId}` : 'مصفوفة البيض')
    : currentLanguage === 'en'
    ? (clutchId ? `Egg Matrix — Clutch #${clutchId}` : 'Egg Matrix')
    : currentLanguage === 'es'
    ? (clutchId ? `Matriz de Huevos — Puesta #${clutchId}` : 'Matriz de Huevos')
    : currentLanguage === 'it'
    ? (clutchId ? `Matrice delle Uova — Cova #${clutchId}` : 'Matrice delle Uova')
    : (clutchId ? `Matrice des Œufs — Ponte #${clutchId}` : 'Matrice des Œufs');

  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-md ${className}`}>
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Egg className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-slate-100 tracking-tight">
              {title || defaultTitle}
            </h3>
          </div>
          {subtitle ? (
            <p className="text-xs text-slate-400 mt-1">
              {subtitle}
            </p>
          ) : layingDate ? (
            <p className="text-xs text-slate-400 mt-1">
              {currentLanguage === 'ar' ? 'بداية وضع البيض في ' : currentLanguage === 'en' ? 'Laying started on ' : currentLanguage === 'es' ? 'Inicio de puesta el ' : currentLanguage === 'it' ? 'Inizio deposizione il ' : 'Début de ponte le '}
              <span className="font-semibold text-slate-300">
                {new Date(layingDate).toLocaleDateString(currentLanguage === 'ar' ? 'ar-SA' : currentLanguage === 'en' ? 'en-US' : currentLanguage === 'es' ? 'es-ES' : currentLanguage === 'it' ? 'it-IT' : 'fr-FR')}
              </span>
            </p>
          ) : null}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onQuickCandling && (
            <button
              type="button"
              onClick={onQuickCandling}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-xs active:scale-98 select-none"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentLanguage === 'ar' ? 'فحص ضوئي سريع' : currentLanguage === 'en' ? 'Quick Candling' : currentLanguage === 'es' ? 'Miraje rápido' : currentLanguage === 'it' ? 'Speratura rapida' : 'Mirage rapide'}</span>
            </button>
          )}
          {onEditClutch && (
            <button
              type="button"
              onClick={onEditClutch}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-98 select-none"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentLanguage === 'ar' ? 'تعديل الحضنة' : currentLanguage === 'en' ? 'Edit Clutch' : currentLanguage === 'es' ? 'Editar puesta' : currentLanguage === 'it' ? 'Modifica cova' : 'Éditer la ponte'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Egg Matrix Row */}
      <div className="py-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {internalEggs.map((egg, index) => {
            const config = STATUS_CONFIG[egg.status] || STATUS_CONFIG.laid;
            const IconComponent = config.icon;
            const statusLabel = getStatusLabel(egg.status);
            const nextStatusLabel = getStatusLabel(config.nextStatus);

            return (
              <div
                key={egg.id ?? index}
                onClick={() => handleEggToggle(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleEggToggle(index);
                  }
                }}
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-between min-h-[125px] relative group select-none ${
                  readOnly ? 'cursor-default' : 'cursor-pointer hover:-translate-y-0.5 active:scale-96'
                } ${config.cardClass} ${config.borderClass}`}
                title={readOnly 
                  ? (currentLanguage === 'ar' ? `بيضة رقم ${egg.number}: ${statusLabel}` : `Œuf n°${egg.number} : ${statusLabel}`) 
                  : (currentLanguage === 'ar' ? `انقر لتغيير الحالة (${statusLabel} ← ${nextStatusLabel})` : `Cliquer pour changer le statut (${statusLabel} → ${nextStatusLabel})`)}
              >
                {/* Egg Number Badge */}
                <div className="w-full flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
                  <span>{currentLanguage === 'ar' ? `رقم ${egg.number}` : `N°${egg.number}`}</span>
                  {!readOnly && (
                    <RefreshCw className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                  )}
                </div>

                {/* Egg Icon Visual */}
                <div className="my-2 p-2.5 rounded-full bg-slate-950/60 border border-slate-800/80 flex items-center justify-center relative">
                  <IconComponent className={`w-6 h-6 transition-transform group-hover:scale-110 ${config.iconClass}`} />
                </div>

                {/* Status Badge */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${config.badgeClass}`}>
                  {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>
              {currentLanguage === 'ar' ? 'الموضوع :' : currentLanguage === 'en' ? 'Laid:' : currentLanguage === 'es' ? 'Puestos:' : currentLanguage === 'it' ? 'Deposte:' : 'Pondus :'}{' '}
              <strong className="text-slate-200">{internalEggs.length}</strong>
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50" />
            <span>
              {currentLanguage === 'ar' ? 'المخصب :' : currentLanguage === 'en' ? 'Fertile:' : currentLanguage === 'es' ? 'Fértiles:' : currentLanguage === 'it' ? 'Fecondate:' : 'Fécondés :'}{' '}
              <strong className="text-amber-300">{currentFertile}</strong>
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50" />
            <span>
              {currentLanguage === 'ar' ? 'الفقس :' : currentLanguage === 'en' ? 'Hatched:' : currentLanguage === 'es' ? 'Eclosionados:' : currentLanguage === 'it' ? 'Schiuse:' : 'Éclos :'}{' '}
              <strong className="text-emerald-300">{currentHatched}</strong>
            </span>
          </span>
          {currentClear > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>
                {currentLanguage === 'ar' ? 'الفارغ :' : currentLanguage === 'en' ? 'Clear:' : currentLanguage === 'es' ? 'Claros:' : currentLanguage === 'it' ? 'Chiare:' : 'Clairs :'}{' '}
                <strong className="text-slate-400">{currentClear}</strong>
              </span>
            </span>
          )}
        </div>

        {!readOnly && (
          <div className="text-[11px] text-slate-500 italic">
            {currentLanguage === 'ar' 
              ? '💡 انقر على البيضة لتغيير حالتها' 
              : currentLanguage === 'en'
              ? '💡 Click on an egg to cycle its status'
              : currentLanguage === 'es'
              ? '💡 Haga clic en un huevo para cambiar su estado'
              : currentLanguage === 'it'
              ? '💡 Clicca su un uovo per cambiare il suo stato'
              : '💡 Cliquez sur un œuf pour faire défiler son statut'}
          </div>
        )}
      </div>
    </div>
  );
};
