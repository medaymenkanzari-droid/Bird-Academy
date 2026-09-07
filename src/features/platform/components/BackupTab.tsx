/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getPlatformTranslation } from '../utils/translations';
import { BackupRestoreService } from '../services/BackupRestoreService';
import { BackupHistoryEntry, RestoreSimulation } from '../types';
import { HardDrive, UploadCloud, AlertOctagon, Trash2, ShieldCheck, Download, Check, RefreshCw, FileCode } from 'lucide-react';

export const BackupTab: React.FC = () => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tPlat = (key: string) => getPlatformTranslation(language, key);

  // Backup form state
  const [backupType, setBackupType] = useState<'full' | 'selective'>('full');
  const [comment, setComment] = useState('');
  const [encrypt, setEncrypt] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [compress, setCompress] = useState(true);
  const [selectedTables, setSelectedTables] = useState<string[]>([
    'birds', 'cages', 'couples', 'repro', 'sante', 'finance', 'alim'
  ]);
  const [history, setHistory] = useState<BackupHistoryEntry[]>(() => BackupRestoreService.getBackupHistory());

  // Restore state
  const [importedContent, setImportedContent] = useState<string>('');
  const [restorePassword, setRestorePassword] = useState('');
  const [simulation, setSimulation] = useState<RestoreSimulation | null>(null);
  const [isRestoreConfirmed, setIsRestoreConfirmed] = useState(false);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState(false);
  const [operationError, setOperationError] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  const handleTableToggle = (table: string) => {
    if (selectedTables.includes(table)) {
      setSelectedTables(selectedTables.filter(t => t !== table));
    } else {
      setSelectedTables([...selectedTables, table]);
    }
  };

  const handleCreateBackup = async () => {
    setOperationError('');
    setIsWorking(true);
    const result = await BackupRestoreService.createBackup(
      comment,
      backupType,
      selectedTables,
      { encrypt, compress, password: encrypt ? backupPassword : undefined }
    );
    setIsWorking(false);

    if (result.success && result.data && result.filename) {
      // Create download anchor
      const blob = new Blob([result.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Refresh backup log
      setHistory(BackupRestoreService.getBackupHistory());
      setComment('');
      setBackupPassword('');
    } else if (result.error) {
      setOperationError(result.error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setImportedContent(text);
      setRestorePassword('');
      setOperationError('');
      const sim = await BackupRestoreService.simulateRestore(text);
      setSimulation(sim);
      setIsRestoreConfirmed(false);
    };
    reader.readAsText(file);
  };

  const handleAnalyzeRestore = async () => {
    if (!importedContent) return;
    setIsWorking(true);
    setOperationError('');
    const result = await BackupRestoreService.simulateRestore(importedContent, restorePassword);
    setSimulation(result);
    setIsRestoreConfirmed(false);
    setIsWorking(false);
    if (!result.isValid && result.error) setOperationError(result.error);
  };

  const handleExecuteRestore = async () => {
    if (!simulation?.isCompatible || !importedContent) return;

    setIsWorking(true);
    const result = await BackupRestoreService.executeRestore(importedContent, restorePassword);
    setIsWorking(false);
    if (result.success) {
      setRestoreSuccessMsg(true);
      setSimulation(null);
      setImportedContent('');
      setRestorePassword('');
      setTimeout(() => {
        setRestoreSuccessMsg(false);
        window.location.reload(); // Refresh fully to update global React state from updated repos!
      }, 2000);
    } else {
      setOperationError(result.error || tPlat('backupCryptoError'));
    }
  };

  const handleDeleteBackupLog = (id: string) => {
    BackupRestoreService.deleteBackup(id);
    setHistory(BackupRestoreService.getBackupHistory());
  };

  const formatSize = (bytes: number) => {
    return `${(bytes / 1024).toFixed(1)} Ko`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* 1. BACKUP CREATION CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-500" />
            {tPlat('backupCenter')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Générez des instantanés chiffrés et sécurisés de vos registres locaux.</p>
        </div>

        {/* Backup Type */}
        <div className="grid grid-cols-2 gap-3">
          {(['full', 'selective'] as const).map(type => (
            <button
              key={type}
              onClick={() => setBackupType(type)}
              className={`px-4 py-3 border rounded-xl text-xs font-bold text-center capitalize cursor-pointer transition-all ${
                backupType === type
                  ? 'border-amber-500 bg-amber-50/30 text-amber-600'
                  : 'border-slate-100 hover:bg-slate-50 text-slate-600'
              }`}
            >
              {tPlat(type === 'full' ? 'backupFull' : 'backupSelective')}
            </button>
          ))}
        </div>

        {/* Comment field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">{tPlat('backupComment')}</label>
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="ex. Avant appariement saison 2026, Traitement fini..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
          />
        </div>

        {/* Advanced options */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={compress}
              onChange={e => setCompress(e.target.checked)}
              className="w-4 h-4 text-amber-500"
            />
            <div>
              <span className="block text-[11px] font-bold text-slate-700">{tPlat('backupCompressed')}</span>
              <span className="text-[9px] text-slate-400">Optimisé</span>
            </div>
          </label>

          <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={encrypt}
              onChange={e => setEncrypt(e.target.checked)}
              className="w-4 h-4 text-amber-500"
            />
            <div>
              <span className="block text-[11px] font-bold text-slate-700">{tPlat('backupEncrypted')}</span>
              <span className="text-[9px] text-slate-400">Enveloppe locale</span>
            </div>
          </label>
        </div>

        {encrypt && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {tPlat('backupPassword')}
            </label>
            <input
              type="password"
              value={backupPassword}
              onChange={event => setBackupPassword(event.target.value)}
              autoComplete="new-password"
              placeholder={tPlat('backupPasswordHint')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-400 mt-1">{tPlat('backupPasswordNotice')}</p>
          </div>
        )}

        {/* Selective Table checkboxes */}
        {backupType === 'selective' && (
          <div className="p-4 border border-slate-100 rounded-xl space-y-3">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {tPlat('selectiveTableSelection')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'birds', label: tPlat('birdsTable') },
                { id: 'cages', label: tPlat('cagesTable') },
                { id: 'couples', label: tPlat('couplesTable') },
                { id: 'repro', label: tPlat('reproTable') },
                { id: 'sante', label: tPlat('santeTable') },
                { id: 'finance', label: tPlat('financeTable') },
                { id: 'alim', label: tPlat('alimTable') },
              ].map(table => (
                <label key={table.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTables.includes(table.id)}
                    onChange={() => handleTableToggle(table.id)}
                    className="w-3.5 h-3.5 text-amber-500"
                  />
                  <span className="text-xs text-slate-600">{table.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleCreateBackup}
          disabled={isWorking || (encrypt && backupPassword.length < 8)}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{tPlat('backupAction')}</span>
        </button>

        {operationError && (
          <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-700 rounded-xl">
            {operationError}
          </div>
        )}

        {/* Backup History Log */}
        <div className="border-t border-slate-100 pt-5">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            {tPlat('backupHistory')}
          </span>
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">{tPlat('backupEmpty')}</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {history.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 border border-slate-50 bg-slate-50/20 rounded-xl">
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="block text-xs font-semibold text-slate-700 truncate">{b.comments}</span>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>{new Date(b.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{formatSize(b.size)}</span>
                      <span>•</span>
                      <span className="font-mono text-[9px] bg-slate-100 px-1 rounded truncate max-w-24" title={b.checksum}>
                        {b.checksum.substring(0, 8)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteBackupLog(b.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. RESTORE ENGINE CARD */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 flex flex-col space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-amber-500" />
            {tPlat('restoreEngine')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">{tPlat('restoreDesc')}</p>
        </div>

        {/* Drag-and-drop / Select file container */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/30 flex flex-col items-center justify-center space-y-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <FileCode className="w-8 h-8 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">{tPlat('restoreSelectFile')}</span>
          <span className="text-[10px] text-slate-400">Seuls les fichiers de sauvegarde Bird Academy signés sont acceptés.</span>
        </div>

        {importedContent && simulation?.isEncrypted && (
          <div className="p-4 border border-amber-100 bg-amber-50/40 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              {tPlat('restorePassword')}
            </label>
            <input
              type="password"
              value={restorePassword}
              onChange={event => setRestorePassword(event.target.value)}
              autoComplete="current-password"
              placeholder={tPlat('restorePasswordHint')}
              className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
            />
            <button
              onClick={handleAnalyzeRestore}
              disabled={isWorking || restorePassword.length === 0}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold disabled:cursor-not-allowed"
            >
              {tPlat('restoreDecryptAction')}
            </button>
          </div>
        )}

        {importedContent && operationError && (
          <div className="p-3 bg-red-50 border border-red-100 text-xs text-red-700 rounded-xl">
            {operationError}
          </div>
        )}

        {/* Restore Simulation Block */}
        {simulation && (
          <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {tPlat('restoreSimulationTitle')}
            </span>

            {/* Validation indicators */}
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${simulation.isCompatible ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span className="text-xs font-bold text-slate-700">
                {simulation.isCompatible ? 'Sauvegarde 100 % valide' : 'Sauvegarde non compatible'}
              </span>
            </div>

            {/* Warns / Issues if any */}
            {simulation.compatibilityIssues.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-100 text-[11px] text-amber-700 rounded-xl space-y-1">
                {simulation.compatibilityIssues.map((iss, i) => (
                  <p key={i} className="flex items-start gap-1">
                    <span>{iss}</span>
                  </p>
                ))}
              </div>
            )}

            {/* Entities counters */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {tPlat('restoreCounts')}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 bg-white rounded-lg">
                  <span className="text-slate-500">{tPlat('countBirds')}</span>
                  <span className="font-bold text-slate-800">{simulation.counts.birds}</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded-lg">
                  <span className="text-slate-500">{tPlat('countCouples')}</span>
                  <span className="font-bold text-slate-800">{simulation.counts.couples}</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded-lg">
                  <span className="text-slate-500">{tPlat('countCages')}</span>
                  <span className="font-bold text-slate-800">{simulation.counts.cages}</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded-lg">
                  <span className="text-slate-500">{tPlat('countDocs')}</span>
                  <span className="font-bold text-slate-800">{simulation.counts.documents}</span>
                </div>
              </div>
            </div>

            {/* RESTORE DANGER WARNING */}
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertOctagon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-800">Zone de danger critique</h4>
                  <p className="text-[10px] text-red-700 mt-0.5">{tPlat('restoreConfirmMsg')}</p>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-2 pt-2 border-t border-red-100">
                <input
                  type="checkbox"
                  checked={isRestoreConfirmed}
                  onChange={e => setIsRestoreConfirmed(e.target.checked)}
                  className="w-4 h-4 text-red-500 focus:ring-red-500"
                />
                <span className="text-[11px] font-bold text-red-800">
                  Je confirme vouloir écraser toutes mes données actuelles.
                </span>
              </label>
            </div>

            {/* Execute restore button */}
            <button
              onClick={handleExecuteRestore}
              disabled={!isRestoreConfirmed || !simulation.isCompatible}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isRestoreConfirmed && simulation.isCompatible
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>{tPlat('restoreConfirmBtn')}</span>
            </button>
          </div>
        )}

        {restoreSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-2">
            <Check className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="text-xs font-bold text-emerald-800">{tPlat('restoreSuccess')}</h4>
            <p className="text-[10px] text-emerald-600">Rechargement de l'application en cours...</p>
          </div>
        )}
      </div>

    </div>
  );
};
