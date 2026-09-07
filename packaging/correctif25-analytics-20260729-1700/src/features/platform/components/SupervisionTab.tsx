/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getPlatformTranslation } from '../utils/translations';
import { PlatformHealthEngine } from '../engines/PlatformHealthEngine';
import { PlatformHealthReport } from '../types';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { ActivityLogger } from '../../../storage/ActivityLogger';
import { ShieldCheck, HardDrive, Cpu, AlertCircle, Sparkles, Activity, FileText } from 'lucide-react';

export const SupervisionTab: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [health, setHealth] = useState<PlatformHealthReport>(() => PlatformHealthEngine.getHealthReport());

  const tPlat = (key: string) => getPlatformTranslation(language, key);

  // Biological counters
  const birdsCount = BirdRepository.getAll().length;
  const cagesCount = HabitatRepository.getAll().length;
  const couplesCount = BreedingRepository.getCouples().length;
  const pontesCount = BreedingRepository.getPontes().length;
  const healthCount = HealthRepository.getAll().length;
  const logsCount = ActivityLogger.getLogs().length;

  const formatMb = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(3)} Mo`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  const handleRefresh = () => {
    setHealth(PlatformHealthEngine.getHealthReport());
  };

  return (
    <div className="space-y-6">
      
      {/* 1. HEALTH SCORE HERO */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left w-full md:w-auto">
          <div className={`w-16 h-16 rounded-full border flex items-center justify-center font-black text-3xl shrink-0 ${getScoreColor(health.overallScore)}`}>
            {health.overallScore}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              État général de la plateforme
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {health.overallScore >= 90 
                ? 'Excellent : Système sain, sauvegardé et réactif.' 
                : health.overallScore >= 70 
                ? 'Satisfaisant : Quelques ajustements conseillés pour la sécurité.' 
                : 'Attention requise : Des anomalies d\'intégrité ou d\'absence de sauvegarde affaiblissent votre base.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="w-full md:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer text-center"
        >
          Rafraîchir l'audit
        </button>
      </div>

      {/* 2. WARNINGS BLOCK */}
      {health.warnings.length > 0 && (
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Points de vigilance détectés ({health.warnings.length})
          </span>
          <div className="space-y-1.5">
            {health.warnings.map((warn, index) => (
              <p key={index} className="text-xs text-slate-600 pl-5 relative before:content-['•'] before:absolute before:left-1 before:text-red-500">
                {warn}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 3. METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* A. Storage usage card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-slate-400" />
            Stockage LocalStorage
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Espace consommé</span>
              <span>{formatMb(health.storageUsageBytes)} / {formatMb(health.storageQuotaBytes)}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  (health.storageUsageBytes / health.storageQuotaBytes) > 0.8 ? 'bg-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (health.storageUsageBytes / health.storageQuotaBytes) * 100)}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-400">
              Note : L'espace est alloué localement par votre navigateur Web (quota maximum d'environ 5 Mo).
            </p>
          </div>
        </div>

        {/* B. Modular Engines Status card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3.5">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-400" />
            État des moteurs d'élevage
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-50 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500">Intégrité base</span>
              <span className="font-bold text-slate-800 mt-1">{health.integrityScore}/100</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-50 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500">Sauvegarde log</span>
              <span className="font-bold text-slate-800 mt-1">{health.backupScore}/100</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-50 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500">Performance UI</span>
              <span className="font-bold text-slate-800 mt-1">{health.performanceScore}/100</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-50 flex flex-col justify-between">
              <span className="text-[10px] text-slate-500">Mode Hors-ligne</span>
              <span className="font-bold text-emerald-600 mt-1">Actif (100 %)</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. STATISTICS COUNTERS BENTO BOX */}
      <div className="space-y-3">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Volume total des registres
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Canaris', val: birdsCount, icon: Sparkles },
            { label: 'Cages/Habitats', val: cagesCount, icon: HardDrive },
            { label: 'Couples', val: couplesCount, icon: Activity },
            { label: 'Nids/Pontes', val: pontesCount, icon: FileText },
            { label: 'Fiches Sante', val: healthCount, icon: AlertCircle },
            { label: 'Lignes Audit', val: logsCount, icon: Activity },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 text-center flex flex-col items-center justify-center space-y-1">
                <Icon className="w-5 h-5 text-slate-300" />
                <span className="text-[10px] text-slate-500">{item.label}</span>
                <span className="text-lg font-black text-slate-800">{item.val}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
