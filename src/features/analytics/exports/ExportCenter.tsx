/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAnalyticsTranslation } from '../hooks/useAnalyticsTranslation';
import { ExportService } from '../services/ExportService';
import { AnalyticsFilters } from '../types';
import { 
  Download, FileSpreadsheet, FileJson, FolderArchive, FileText, CheckCircle, HelpCircle, Columns 
} from 'lucide-react';

interface ExportCenterProps {
  filters: AnalyticsFilters;
}

export const ExportCenter: React.FC<ExportCenterProps> = ({ filters }) => {
  const { at } = useAnalyticsTranslation();
  
  // State management
  const [selectedModules, setSelectedModules] = useState<string[]>(['birds', 'finance', 'health']);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'excel' | 'zip'>('csv');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['id', 'bague', 'nom', 'sexe', 'race', 'mutation']);
  const [targetLang, setTargetLang] = useState<string>('fr');
  const [exportComplete, setExportComplete] = useState(false);

  // Toggle module selection
  const handleToggleModule = (mod: string) => {
    setSelectedModules(prev => 
      prev.includes(mod) ? prev.filter(x => x !== mod) : [...prev, mod]
    );
  };

  // Toggle column selection
  const handleToggleColumn = (col: string) => {
    setSelectedColumns(prev => 
      prev.includes(col) ? prev.filter(x => x !== col) : [...prev, col]
    );
  };

  const handleExport = () => {
    if (selectedModules.length === 0) return;

    ExportService.exportDataset({
      modules: selectedModules,
      period: filters,
      format: selectedFormat,
      columns: selectedColumns,
    });

    setExportComplete(true);
    setTimeout(() => setExportComplete(false), 4000);
  };

  const modulesList = [
    { id: 'birds', label: 'Population & Oiseaux' },
    { id: 'finance', label: 'Finances & Comptabilité' },
    { id: 'health', label: 'Santé & Traitements' },
    { id: 'reproduction', label: 'Reproduction & Accouplements' },
    { id: 'cages', label: 'Cages & Hébergements' },
  ];

  const columnsList = [
    { id: 'id', label: 'Identifiant interne' },
    { id: 'bague', label: 'Numéro de bague' },
    { id: 'nom', label: 'Nom d\'oiseau' },
    { id: 'sexe', label: 'Sexe' },
    { id: 'race', label: 'Race ornithologique' },
    { id: 'mutation', label: 'Mutation active' },
    { id: 'couleur', label: 'Synthèse de couleur' },
    { id: 'statut_sante', label: 'Statut médical' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Configuration Column */}
      <div className="md:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs space-y-6">
        
        {/* Module selection */}
        <div className="space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
            1. Sélectionner les modules de données
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {modulesList.map(mod => (
              <button
                key={mod.id}
                onClick={() => handleToggleModule(mod.id)}
                className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                  selectedModules.includes(mod.id)
                    ? 'bg-indigo-50/50 border-indigo-200 text-indigo-750 dark:bg-indigo-950/20 dark:border-indigo-900 dark:text-indigo-300'
                    : 'bg-slate-50/50 border-slate-100 text-slate-600 dark:bg-slate-950/30 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                <span>{mod.label}</span>
                <input
                  type="checkbox"
                  checked={selectedModules.includes(mod.id)}
                  onChange={() => {}} // handled by button click
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Column customization for birds */}
        {selectedModules.includes('birds') && (
          <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-1">
              <Columns className="w-4 h-4 text-slate-400" />
              <span>2. Personnaliser les colonnes (Registre)</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {columnsList.map(col => (
                <button
                  key={col.id}
                  onClick={() => handleToggleColumn(col.id)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all cursor-pointer ${
                    selectedColumns.includes(col.id)
                      ? 'bg-slate-800 border-slate-800 text-white dark:bg-white dark:border-white dark:text-slate-900'
                      : 'bg-slate-50 border-slate-100 text-slate-500 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                  }`}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Translation target settings */}
        <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
            3. Choisir la langue d'export
          </h4>
          <div className="grid grid-cols-5 gap-1 sm:gap-2 min-w-0 max-w-full">
            {[
              { id: 'fr', label: 'FR' },
              { id: 'en', label: 'EN' },
              { id: 'ar', label: 'العربية' },
              { id: 'es', label: 'ES' },
              { id: 'it', label: 'IT' },
            ].map(lang => (
              <button
                key={lang.id}
                onClick={() => setTargetLang(lang.id)}
                className={`py-2 px-1 rounded-xl border text-[10px] font-black text-center transition-all cursor-pointer truncate ${
                  targetLang === lang.id
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Format Selection & Trigger Panel */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xs flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
            4. Choisir le format & exporter
          </h4>
          
          <div className="space-y-2">
            {[
              { id: 'csv', label: 'Comma-Separated Values (CSV)', icon: FileText, desc: 'Idéal pour intégration dans tableurs légers' },
              { id: 'excel', label: 'Microsoft Excel (XLS)', icon: FileSpreadsheet, desc: 'Format tabulé optimisé pour les logiciels pros' },
              { id: 'json', label: 'Structured Notation (JSON)', icon: FileJson, desc: 'Sauvegarde brute parfaite pour migration' },
              { id: 'zip', label: 'Simulated ZIP text archive (ZIP)', icon: FolderArchive, desc: 'Batch consolidé de tous les tableaux' },
            ].map(fmt => (
              <button
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id as any)}
                className={`p-3 rounded-xl border text-left w-full flex gap-3 transition-all cursor-pointer ${
                  selectedFormat === fmt.id
                    ? 'bg-slate-800 border-slate-800 text-white dark:bg-white dark:border-white dark:text-slate-900'
                    : 'bg-slate-50 border-slate-100 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400'
                }`}
              >
                <fmt.icon className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h5 className="text-[10px] font-black uppercase tracking-wide">{fmt.label}</h5>
                  <p className="text-[9px] text-slate-400 leading-tight font-semibold">{fmt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {exportComplete && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60 rounded-xl flex items-center gap-2 text-[10px] text-emerald-800 dark:text-emerald-400 font-bold animate-fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{at('exportSuccess')}</span>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={selectedModules.length === 0}
            className={`w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selectedModules.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{at('exportGenerateBtn')}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
