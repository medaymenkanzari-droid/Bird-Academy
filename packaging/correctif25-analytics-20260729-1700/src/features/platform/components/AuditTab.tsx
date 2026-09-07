/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getPlatformTranslation } from '../utils/translations';
import { ActivityLogger, EventType } from '../../../storage/ActivityLogger';
import { ListFilter, Search, Download, Trash2, ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { AppTable } from '../../../components/design-system/AppTable';

export const AuditTab: React.FC = () => {
  const { language } = useLanguage();
  const [logs, setLogs] = useState(() => ActivityLogger.getLogs());
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const tPlat = (key: string) => getPlatformTranslation(language, key);

  const handleClearLogs = () => {
    if (confirm("⚠️ Êtes-vous sûr de vouloir vider l'ensemble du registre d'audit ? Cette action est irréversible.")) {
      ActivityLogger.clearLogs();
      setLogs([]);
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Date,Type,Description\n";
    
    logs.forEach(log => {
      const row = [
        log.id,
        new Date(log.timestamp).toISOString(),
        log.eventType,
        `"${log.description.replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registre_audit_elevage_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(search.toLowerCase()) || 
                            log.eventType.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || log.eventType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [logs, search, typeFilter]);

  const getLogBadgeColor = (type: string) => {
    if (type.includes('ADD') || type.includes('IMPORT') || type.includes('CREATE')) return 'bg-emerald-100 text-emerald-800';
    if (type.includes('DELETE') || type.includes('REMOVE') || type.includes('DISSOLVE')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            {tPlat('auditTitle')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Registre d'audit cryptographiquement cohérent pour tracer toutes les modifications et actions sur votre cheptel.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              logs.length > 0 ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exporter CSV</span>
          </button>
          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              logs.length > 0 ? 'border border-red-100 text-red-600 hover:bg-red-50' : 'border-transparent text-slate-400 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Effacer tout</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une action d'élevage..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        {/* Action Type Filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-hidden"
        >
          <option value="all">Tous les modules</option>
          {Object.values(EventType).map(val => (
            <option key={val} value={val}>{val}</option>
          ))}
        </select>
      </div>

      {/* AUDIT LOG TABLE */}
      <AppTable<any>
        data={filteredLogs}
        keyExtractor={(row) => row.id}
        emptyState={
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <span className="text-xs font-bold text-slate-700">Aucun log d'audit trouvé</span>
            <span className="text-[10px] text-slate-400">Essayez d'ajuster vos critères de filtre ou créez des fiches pour peupler l'historique.</span>
          </div>
        }
        columns={[
          {
            key: 'date',
            header: 'Date & Heure',
            className: 'w-44 font-mono text-[10px] text-slate-400',
            render: (log) => (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-300" />
                {new Date(log.timestamp).toLocaleString('fr-FR')}
              </div>
            )
          },
          {
            key: 'module',
            header: 'Module / Niveau',
            className: 'w-40',
            render: (log) => (
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide ${getLogBadgeColor(log.eventType)}`}>
                {log.eventType}
              </span>
            )
          },
          {
            key: 'description',
            header: "Description d'action",
            className: 'font-semibold text-slate-700',
            render: (log) => log.description
          }
        ]}
      />
    </div>
  );
};
