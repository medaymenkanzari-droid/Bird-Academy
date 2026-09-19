/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — OFFICIAL DOWNLOAD CENTER
 * Pilot testing distribution point for Windows, Android APK & Tester Field Kit.
 * Strictly configured for Volière Manager v1.3.6 (BUILD_ID: BA-V1.3.6).
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../i18n';
import { WebRoute } from '../types';
import { WebDownloadService } from '../services/WebDownloadService';
import { 
  Download, Monitor, Smartphone, FileText, Check, Copy, ShieldCheck, 
  Terminal, Fingerprint, ChevronDown, AlertTriangle, Info, BookOpen, Layers, ExternalLink
} from 'lucide-react';

export interface WebDownloadCenterPageProps {
  onNavigate: (route: WebRoute) => void;
}

export const WebDownloadCenterPage: React.FC<WebDownloadCenterPageProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();
  const downloadService = WebDownloadService.getInstance();
  const allArtifacts = downloadService.getAllArtifacts();

  const winArtifacts = allArtifacts.filter(a => a.platform === 'windows');
  const androidArtifacts = allArtifacts.filter(a => a.platform === 'android');
  const kitArtifacts = allArtifacts.filter(a => a.platform === 'kit');
  const docArtifacts = allArtifacts.filter(a => a.platform === 'documentation');

  const [copiedSha, setCopiedSha] = useState<string | null>(null);
  const [openShaId, setOpenShaId] = useState<string | null>(null);

  const handleCopySha = (sha: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
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
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14"
      data-testid="web-download-center-page"
      id="official-download-center"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      
      {/* 1. Header & Version Identification Banner */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('downloadPage.officialBadge') || 'Version Officielle de Test — Distribution Pilote'}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight" id="download-center-title">
          {t('downloadPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('downloadPage.subtitle')}
        </p>

        {/* Explicit Version / Build Identification Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-2">
          <span className="px-3.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-bold text-xs" data-testid="official-version-badge" id="official-version-badge">
            Version : v1.3.6
          </span>
          <span className="px-3.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200 dark:border-indigo-800" data-testid="official-build-badge" id="official-build-badge">
            BUILD_ID : BA-V1.3.6
          </span>
          <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            Édition officielle destinée aux tests de recette
          </span>
        </div>
      </div>

      {/* 2. Separation Notice: Test Program vs Commercial Store */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 text-xs flex items-start gap-3.5">
        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-700 dark:text-slate-300">
          <p className="font-bold text-indigo-900 dark:text-indigo-200">
            Cadre de Recette & Séparation du Parcours Commercial
          </p>
          <p className="leading-relaxed">
            Ce centre de téléchargement est réservé à la distribution des artefacts officiels destinés à la recette technique et terrain (Windows & Android). Les offres commerciales (FREE, PREMIUM, PRO) sont présentées séparément dans la section Tarifs sans engagement tarifaire définitif.
          </p>
        </div>
      </div>

      {/* 3. Applications de Test (Windows & Android) */}
      <section className="space-y-6" id="section-apps">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {t('downloadPage.appSectionTitle') || 'Applications de Test & Binaires Officiels'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Windows Setup Card */}
          {winArtifacts.filter(a => a.filename.includes('Setup')).map((art) => {
            const isCopied = copiedSha === art.sha256;
            const isShaOpen = openShaId === art.filename;

            return (
              <div
                key={art.filename}
                className="p-7 rounded-3xl bg-white dark:bg-slate-800 border-2 border-emerald-600 dark:border-emerald-500 shadow-xl flex flex-col justify-between space-y-6"
                data-testid={`download-card-${art.filename}`}
                id={`card-${art.filename}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                        <Monitor className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                          Windows 10 / 11 (64-bit)
                        </span>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                          Bird Academy Enterprise — Volière Manager
                        </h3>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                      Recommandé
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Installateur officiel Windows avec intégration bureau. Version officielle destinée aux tests.
                  </p>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Version :</span>
                      <span className="font-bold text-slate-900 dark:text-white" data-testid="win-setup-version">{art.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">BUILD_ID :</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400" data-testid="win-setup-buildid">{art.buildId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fichier :</span>
                      <span className="truncate max-w-[170px] text-slate-700 dark:text-slate-300">{art.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taille :</span>
                      <span className="font-bold text-slate-900 dark:text-white">{art.sizeMB}</span>
                    </div>
                  </div>

                  {/* SHA-256 Drawer */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => toggleSha(art.filename)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
                      data-testid={`toggle-sha-${art.filename}`}
                    >
                      <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Empreinte SHA-256</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isShaOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isShaOpen && (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-[10px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1.5">
                        <span className="truncate select-all" data-testid={`sha-value-${art.filename}`}>{art.sha256}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySha(art.sha256)}
                          className="px-2 py-1 rounded bg-white dark:bg-slate-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shadow-sm shrink-0 cursor-pointer flex items-center gap-1"
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
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  id="download-btn-windows-setup"
                  data-testid="download-btn-windows-setup"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('downloadPage.btnDownloadWin') || 'Télécharger pour Windows'}</span>
                </button>
              </div>
            );
          })}

          {/* Windows Portable Card */}
          {winArtifacts.filter(a => !a.filename.includes('Setup')).map((art) => {
            const isCopied = copiedSha === art.sha256;
            const isShaOpen = openShaId === art.filename;

            return (
              <div
                key={art.filename}
                className="p-7 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-6"
                data-testid={`download-card-${art.filename}`}
                id={`card-${art.filename}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        <Monitor className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Windows Portable
                        </span>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                          Bird Academy Enterprise — Volière Manager
                        </h3>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                      Portable
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Exécutable autonome sans installation requise. Version officielle destinée aux tests.
                  </p>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Version :</span>
                      <span className="font-bold text-slate-900 dark:text-white" data-testid="win-portable-version">{art.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">BUILD_ID :</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400" data-testid="win-portable-buildid">{art.buildId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fichier :</span>
                      <span className="truncate max-w-[170px] text-slate-700 dark:text-slate-300">{art.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taille :</span>
                      <span className="font-bold text-slate-900 dark:text-white">{art.sizeMB}</span>
                    </div>
                  </div>

                  {/* SHA-256 Drawer */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => toggleSha(art.filename)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
                      data-testid={`toggle-sha-${art.filename}`}
                    >
                      <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
                      <span>Empreinte SHA-256</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isShaOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isShaOpen && (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-[10px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1.5">
                        <span className="truncate select-all" data-testid={`sha-value-${art.filename}`}>{art.sha256}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySha(art.sha256)}
                          className="px-2 py-1 rounded bg-white dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm shrink-0 cursor-pointer flex items-center gap-1"
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
                  className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  id="download-btn-windows-portable"
                  data-testid="download-btn-windows-portable"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger Version Portable</span>
                </button>
              </div>
            );
          })}

          {/* Android APK Card (STRICT COMPLIANCE WITH USER MISSION) */}
          {androidArtifacts.map((art) => {
            const isCopied = copiedSha === art.sha256;
            const isShaOpen = openShaId === art.filename;

            return (
              <div
                key={art.filename}
                className="p-7 rounded-3xl bg-white dark:bg-slate-800 border-2 border-emerald-600 dark:border-emerald-500 shadow-xl flex flex-col justify-between space-y-6"
                data-testid={`download-card-${art.filename}`}
                id={`card-${art.filename}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                          Android (API 29+)
                        </span>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                          Bird Academy Enterprise — Volière Manager
                        </h3>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                      APK Recette
                    </span>
                  </div>

                  {/* Mandatory Alert Warning for Android APK */}
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2" data-testid="android-apk-warning" id="android-apk-warning">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-tight">
                      <strong>Avertissement :</strong> Installation manuelle APK destinée au programme de test. Autoriser l'installation depuis cette source uniquement si nécessaire.
                    </p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Version :</span>
                      <span className="font-bold text-slate-900 dark:text-white" data-testid="android-apk-version">{art.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">BUILD_ID :</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400" data-testid="android-apk-buildid">{art.buildId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fichier :</span>
                      <span className="truncate max-w-[170px] text-slate-700 dark:text-slate-300">{art.filename}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taille :</span>
                      <span className="font-bold text-slate-900 dark:text-white" data-testid="android-apk-size">{art.sizeMB}</span>
                    </div>
                  </div>

                  {/* Android SHA-256 (20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63) */}
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => toggleSha(art.filename)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition cursor-pointer"
                      data-testid={`toggle-sha-${art.filename}`}
                    >
                      <Fingerprint className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Empreinte SHA-256</span>
                      <ChevronDown className={`w-3 h-3 transition-transform ${isShaOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isShaOpen && (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-[10px] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1.5">
                        <span className="truncate select-all" data-testid="android-apk-sha">{art.sha256}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySha(art.sha256)}
                          className="px-2 py-1 rounded bg-white dark:bg-slate-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shadow-sm shrink-0 cursor-pointer flex items-center gap-1"
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
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  id="download-btn-android-apk"
                  data-testid="download-btn-android-apk"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('downloadPage.btnDownloadApk') || 'Télécharger l\'APK'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Section « Kit testeur — Validation Android » */}
      <section className="space-y-6 pt-4" id="section-tester-kit" data-testid="section-tester-kit">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white" id="tester-kit-title">
              {t('downloadPage.testerKitTitle') || 'Kit testeur — Validation Android'}
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {kitArtifacts.length} documents de recette disponibles
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('downloadPage.testerKitSubtitle') || 'Téléchargez directement les documents et fiches de relevé nécessaires aux sessions de recette physique avec les smartphones Samsung et Xiaomi.'}
        </p>

        {/* Tester Kit Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitArtifacts.map((doc) => {
            const isCopied = copiedSha === doc.sha256;
            const isShaOpen = openShaId === doc.filename;

            return (
              <div
                key={doc.filename}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                data-testid={`kit-doc-card-${doc.filename}`}
                id={`kit-${doc.filename}`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {doc.name}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block truncate max-w-[200px]">
                          {doc.filename}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                      {doc.sizeMB}
                    </span>
                  </div>

                  {/* SHA-256 mini toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleSha(doc.filename)}
                      className="inline-flex items-center gap-1 text-[10px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    >
                      <Fingerprint className="w-3 h-3 text-indigo-500" />
                      <span>SHA-256</span>
                      <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isShaOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isShaOpen && (
                      <div className="mt-1.5 p-2 rounded-lg bg-slate-100 dark:bg-slate-900 font-mono text-[9px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1">
                        <span className="truncate select-all">{doc.sha256}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySha(doc.sha256)}
                          className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[9px] font-bold text-indigo-600 shadow-sm shrink-0 cursor-pointer"
                        >
                          {isCopied ? 'OK' : 'Copier'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerDownload(doc.filename)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  data-testid={`download-kit-${doc.filename}`}
                  id={`btn-${doc.filename}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Documentation LMSE Guide */}
      {docArtifacts.length > 0 && (
        <section className="space-y-4 pt-2" id="section-docs">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {t('downloadPage.docsTitle') || 'Documentation Officielle'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docArtifacts.map((doc) => (
              <div
                key={doc.filename}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4"
                data-testid={`doc-card-${doc.filename}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{doc.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.filename} • {doc.sizeMB}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerDownload(doc.filename)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  data-testid={`download-doc-${doc.filename}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Cryptographic Integrity Verification Instructions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 text-white border border-slate-800 space-y-4 shadow-xl" id="section-integrity">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Vérification d'intégrité cryptographique sous Windows PowerShell</span>
        </div>
        <div className="space-y-2">
          <pre className="p-3.5 rounded-xl bg-black/60 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto select-all" data-testid="powershell-verify-apk">
            Get-FileHash -Algorithm SHA256 .\Bird-Academy-User.apk
          </pre>
          <pre className="p-3.5 rounded-xl bg-black/60 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto select-all" data-testid="powershell-verify-win">
            Get-FileHash -Algorithm SHA256 .\Bird-Academy-User-Windows-Setup.exe
          </pre>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Comparez les condensats obtenus avec les empreintes officielles fournies ci-dessus avant de procéder à l'installation sur vos terminaux de test.
        </p>
      </div>

    </div>
  );
};
