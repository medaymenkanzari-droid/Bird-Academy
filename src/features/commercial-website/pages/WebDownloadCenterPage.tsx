/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — DOWNLOAD CENTER PAGE
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../i18n';
import { WebRoute } from '../types';
import { WebDownloadService } from '../services/WebDownloadService';
import { 
  Download, Monitor, Smartphone, FileText, Check, Copy, ShieldCheck, Terminal, Fingerprint, ChevronDown
} from 'lucide-react';

export interface WebDownloadCenterPageProps {
  onNavigate: (route: WebRoute) => void;
}

export const WebDownloadCenterPage: React.FC<WebDownloadCenterPageProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const downloadService = WebDownloadService.getInstance();
  const artifacts = downloadService.getAllArtifacts();
  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [openShaId, setOpenShaId] = useState<string | null>(null);

  const handleCopySha = (sha: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(sha);
      setCopiedSha(sha);
      setTimeout(() => setCopiedSha(null), 2000);
    }
  };

  const toggleSha = (filename: string) => {
    setOpenShaId(openShaId === filename ? null : filename);
  };

  const handleTriggerDownload = (filename: string) => {
    const url = WebDownloadService.getPublicDownloadUrl(filename);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16"
      data-testid="web-download-center-page"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <span className="text-xs font-black tracking-widest text-emerald-700 dark:text-emerald-400 uppercase bg-emerald-100 dark:bg-emerald-950 px-3.5 py-1 rounded-full">
          Centre de Téléchargement & Binaires Certifiés
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('downloadPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('downloadPage.subtitle')}
        </p>
      </div>

      {/* Artifacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {artifacts.map((art) => {
          const isCopied = copiedSha === art.sha256;
          const isWindows = art.platform === 'windows';
          const isAndroid = art.platform === 'android';
          const isPrimary = art.filename.includes('Setup');
          const isShaOpen = openShaId === art.filename;

          return (
            <div
              key={art.filename}
              className={`p-8 rounded-3xl bg-white dark:bg-slate-800 border ${
                isPrimary ? 'border-2 border-emerald-600 dark:border-emerald-500 shadow-xl' : 'border-slate-200 dark:border-slate-700 shadow-sm'
              } flex flex-col justify-between space-y-6`}
              data-testid={`download-artifact-card-${art.filename}`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${
                      isWindows ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 
                      isAndroid ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {isWindows ? <Monitor className="w-6 h-6" /> : isAndroid ? <Smartphone className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-slate-900 dark:text-white">
                        {art.name}
                      </h2>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {art.filename}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Certifié
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Version</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{art.version}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('downloadPage.sizeLabel')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{art.sizeMB}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('downloadPage.dateLabel')}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{art.releaseDate}</span>
                  </div>
                </div>

                {/* Collapsible SHA-256 Drawer Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSha(art.filename)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
                  >
                    <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vérifier l'intégrité du fichier (SHA-256)</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isShaOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isShaOpen && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                      <span className="truncate select-all">{art.sha256}</span>
                      <button
                        type="button"
                        onClick={() => handleCopySha(art.sha256)}
                        className="px-2 py-1 rounded bg-white dark:bg-slate-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 shadow-sm shrink-0 cursor-pointer flex items-center gap-1"
                        title="Copier le hash"
                        data-testid={`copy-sha-${art.filename}`}
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copié' : 'Copier'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTriggerDownload(art.filename)}
                className={`w-full py-4 ${
                  isPrimary ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md' : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                } font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer`}
                data-testid={`download-button-${art.filename}`}
              >
                <Download className="w-4 h-4" />
                <span>{t('downloadPage.btnDownload')} ({art.sizeMB})</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Verification Instructions Terminal */}
      <div className="p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Vérification de l'intégrité cryptographique sous Windows PowerShell</span>
        </div>
        <pre className="p-4 rounded-xl bg-black/60 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto select-all">
          Get-FileHash -Algorithm SHA256 .\Bird-Academy-User-Windows-Setup.exe
        </pre>
        <p className="text-xs text-slate-400 leading-relaxed">
          Comparez la valeur affichée par PowerShell avec la signature SHA-256 pour vous assurer que le fichier n'a subi aucune altération.
        </p>
      </div>

    </div>
  );
};
