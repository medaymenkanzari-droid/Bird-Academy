/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — DOWNLOAD SECTION (AVIAN PRECISION)
 * Updated for Volière Manager v1.3.6 & BUILD_ID BA-V1.3.6.
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../../i18n';
import { WebRoute } from '../../types';
import { WebDownloadService } from '../../services/WebDownloadService';
import { Download, Monitor, Smartphone, Check, Copy, Fingerprint, ChevronDown, ShieldCheck, AlertTriangle } from 'lucide-react';

export interface DownloadSectionProps {
  onNavigate: (route: WebRoute) => void;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const downloadService = WebDownloadService.getInstance();
  const artifacts = downloadService.getAllArtifacts();
  const [isShaOpen, setIsShaOpen] = useState(false);
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const setupArt = artifacts.find(a => a.filename === 'Bird-Academy-User-Windows-Setup.exe');
  const portableArt = artifacts.find(a => a.filename === 'Bird-Academy-User.exe');
  const apkArt = artifacts.find(a => a.filename === 'Bird-Academy-User.apk');

  const handleCopySha = (sha: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sha);
      setCopiedSha(sha);
      setTimeout(() => setCopiedSha(null), 2000);
    }
  };

  const handleDirectDownload = (filename: string) => {
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
    <section 
      id="download" 
      className="py-16 sm:py-24 bg-[#f7f9fb] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="download-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-widest text-[#2e3a8c] dark:text-indigo-400 uppercase bg-[#f0f3fa] dark:bg-indigo-950 px-3.5 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>Distribution Officielle de Test • v1.3.6 (BUILD_ID BA-V1.3.6)</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('downloadPage.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('downloadPage.subtitle')}
          </p>
        </div>

        {/* 3 Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* 1. Windows Setup */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border-2 border-[#2e3a8c] dark:border-indigo-500 shadow-xl shadow-indigo-950/15 flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3.5 right-6 bg-[#2e3a8c] text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Recommandé
            </div>
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#e0e7f7] dark:bg-indigo-950/60 text-[#2e3a8c] dark:text-indigo-400 flex items-center justify-center">
                <Monitor className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Windows (Installateur Setup)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Version officielle de test Windows 10/11 (64-bit).
                </p>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono space-y-1 bg-[#f7f9fb] dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>Version : <strong>v1.3.6</strong></div>
                <div>BUILD_ID : <strong>BA-V1.3.6</strong></div>
                <div>Taille : <strong>{setupArt?.sizeMB || '106 800 570 octets'}</strong></div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setupArt && handleDirectDownload(setupArt.filename)}
                className="w-full py-4 bg-[#2e3a8c] hover:bg-[#1e265c] text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-950/25 transition flex items-center justify-center gap-2 cursor-pointer"
                data-testid="download-btn-windows-setup"
              >
                <Download className="w-4 h-4 text-[#ffc107]" />
                <span>Télécharger pour Windows (.exe)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('download')}
                className="w-full text-center text-xs text-indigo-600 hover:underline font-semibold cursor-pointer py-1"
              >
                Accéder au Centre de Téléchargement & SHA-256 →
              </button>
            </div>
          </div>

          {/* 2. Windows Portable */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center">
                <Monitor className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Windows (Version Portable)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Exécutable autonome sans installation requise. Version officielle de test.
                </p>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono space-y-1 bg-[#f7f9fb] dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>Version : <strong>v1.3.6</strong></div>
                <div>BUILD_ID : <strong>BA-V1.3.6</strong></div>
                <div>Taille : <strong>{portableArt?.sizeMB || '106 462 030 octets'}</strong></div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => portableArt && handleDirectDownload(portableArt.filename)}
                className="w-full py-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                data-testid="download-btn-windows-portable"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Télécharger la version portable (.exe)</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('download')}
                className="w-full text-center text-xs text-slate-500 hover:underline font-semibold cursor-pointer py-1"
              >
                Voir la fiche d'intégrité →
              </button>
            </div>
          </div>

          {/* 3. Android APK */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border-2 border-emerald-600 dark:border-emerald-500 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Android (Package APK)
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Application pour smartphones et tablettes destinée au programme de test terrain.
                </p>
              </div>

              {/* Warning Notice */}
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-tight">
                  Installation manuelle APK destinée au programme de test.
                </p>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 font-mono space-y-1 bg-[#f7f9fb] dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>Version : <strong>v1.3.6</strong></div>
                <div>BUILD_ID : <strong>BA-V1.3.6</strong></div>
                <div>Taille : <strong>9 916 814 octets</strong></div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => apkArt && handleDirectDownload(apkArt.filename)}
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                data-testid="download-btn-android-apk"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Télécharger l'APK</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('download')}
                className="w-full text-center text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer py-1"
              >
                Accéder au Kit Testeur & Formulaires →
              </button>
            </div>
          </div>

        </div>

        {/* Collapsible SHA-256 Drawer */}
        <div className="max-w-3xl mx-auto text-center pt-2">
          <button
            type="button"
            onClick={() => setIsShaOpen(!isShaOpen)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-300 dark:border-slate-700 transition cursor-pointer"
            aria-expanded={isShaOpen}
          >
            <Fingerprint className="w-4 h-4 text-[#2e3a8c] dark:text-indigo-400" />
            <span>Vérifier l'intégrité des fichiers (Empreintes SHA-256)</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isShaOpen ? 'rotate-180' : ''}`} />
          </button>

          {isShaOpen && (
            <div className="mt-6 text-start p-6 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-3 font-mono text-xs">
              <p className="text-slate-400 font-sans text-xs">
                Empreintes numériques officielles scellées par l'autorité cryptographique (v1.3.6) :
              </p>
              {artifacts.slice(0, 3).map((art) => (
                <div key={art.filename} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-sans font-bold text-slate-300 text-xs">{art.name} ({art.filename})</div>
                    <div className="text-[#ffc107] text-[11px] break-all select-all">{art.sha256}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySha(art.sha256)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans rounded border border-slate-700 transition flex items-center gap-1 shrink-0 self-start sm:self-center cursor-pointer"
                  >
                    {copiedSha === art.sha256 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedSha === art.sha256 ? 'Copié' : 'Copier'}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
