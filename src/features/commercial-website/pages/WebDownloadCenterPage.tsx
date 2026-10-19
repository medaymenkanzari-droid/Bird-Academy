/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — OFFICIAL DOWNLOAD CENTER
 * Pilot testing distribution point for Windows, Android APK & Tester Field Kit.
 * Strictly configured for Volière Manager V2.0.0-RC1 (BUILD_ID: BA-V2.0.0-RC1).
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../i18n';
import { WebRoute } from '../types';
import { WebDownloadService } from '../services/WebDownloadService';
import { 
  Download, Monitor, Smartphone, FileText, Check, CheckCircle2, Copy, ShieldCheck, 
  Terminal, Fingerprint, ChevronDown, AlertTriangle, Info, BookOpen, Layers, ExternalLink, FileDown
} from 'lucide-react';

export interface WebDownloadCenterPageProps {
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebDownloadCenterPage: React.FC<WebDownloadCenterPageProps> = ({ onNavigate }) => {
  const { t, isRtl, locale } = useWebLanguage();
  const downloadService = WebDownloadService.getInstance();
  const allArtifacts = downloadService.getAllArtifacts();

  const winArtifacts = allArtifacts.filter(a => a.platform === 'windows');
  const androidArtifacts = allArtifacts.filter(a => a.platform === 'android');
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
    let effectiveFilename = filename;
    if (filename.includes('Rapport-de-test') && locale && locale !== 'fr') {
      effectiveFilename = `Rapport-de-test-Bird-Academy-V2.0.0-RC1-${locale}.pdf`;
    }
    const url = WebDownloadService.getPublicDownloadUrl(effectiveFilename);
    const a = document.createElement('a');
    a.href = url;
    a.download = effectiveFilename;
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
      <div className="max-w-4xl lg:max-w-5xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('downloadPage.officialBadge') || 'Version Officielle de Test — Distribution Pilote'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight" id="download-center-title">
          {t('downloadPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {t('downloadPage.subtitle')}
        </p>

        {/* Explicit Version / Build Identification Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-3 pt-2">
          <span className="px-3.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-bold text-xs" data-testid="official-version-badge" id="official-version-badge">
            Version : V2.0.0-RC1
          </span>
          <span className="px-3.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-300 font-mono font-bold text-xs border border-indigo-200 dark:border-indigo-800" data-testid="official-build-badge" id="official-build-badge">
            BUILD_ID : BA-V2.0.0-RC1
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
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Windows 10 / 11 (64-bit)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                        Recommandé
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 shrink-0">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                        Bird Academy Enterprise — Volière Manager
                      </h3>
                    </div>
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
                  data-testid={`download-button-${art.filename}`}
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
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Windows Portable
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
                        Portable
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 shrink-0">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                        Bird Academy Enterprise — Volière Manager
                      </h3>
                    </div>
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
                  data-testid={`download-button-${art.filename}`}
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
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Android (API 29+)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                        APK Recette
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                        Bird Academy Enterprise — Volière Manager
                      </h3>
                    </div>
                  </div>

                  {/* Mandatory Alert Warning for Android APK */}
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2" data-testid="android-apk-warning" id="android-apk-warning">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-tight">
                      <strong>Avertissement :</strong> Installation manuelle APK destinée au programme de test. Autoriser l'installation depuis cette source uniquement si nécessaire.
                    </p>
                  </div>

                  {/* 3-Step Installation Guidance */}
                  <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-xs text-slate-700 dark:text-slate-300 space-y-1.5" data-testid="android-install-guidance">
                    <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{t('downloadPage.androidStepsTitle')}</span>
                    </div>
                    <ol className="space-y-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 ps-1">
                      <li>{t('downloadPage.androidStep1')}</li>
                      <li>{t('downloadPage.androidStep2')}</li>
                      <li>{t('downloadPage.androidStep3')}</li>
                    </ol>
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

                  {/* Android SHA-256 */}
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
                  data-testid={`download-button-${art.filename}`}
                >
                  <Download className="w-4 h-4" />
                  <span>{t('downloadPage.btnDownloadApk') || 'Télécharger l\'APK'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Documentation & Rapport de Test Officiel */}
      {docArtifacts.length > 0 && (
        <section className="space-y-6 pt-4" id="section-docs" data-testid="section-docs">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white" id="docs-title">
              {t('downloadPage.docsTitle') || 'Documentation Officielle & Rapports'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docArtifacts.map((doc) => {
              const isTestReport = doc.filename.includes('Rapport-de-test');
              const isCopied = copiedSha === doc.sha256;
              const isShaOpen = openShaId === doc.filename;

              return (
                <div
                  key={doc.filename}
                  className={`p-6 rounded-3xl bg-white dark:bg-slate-800 border flex flex-col justify-between space-y-5 transition-all shadow-sm hover:shadow-md ${
                    isTestReport
                      ? 'border-indigo-300 dark:border-indigo-700/80 ring-1 ring-indigo-200 dark:ring-indigo-900/50'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                  data-testid={isTestReport ? 'download-test-report-card' : `doc-card-${doc.filename}`}
                  id={isTestReport ? 'card-rapport-de-test' : `doc-${doc.filename}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isTestReport
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {isTestReport ? (t('downloadPage.testReportTag') || 'Formulaire de testeur • V2.0.0-RC1') : 'Guide officiel de mise en route'}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                        {doc.sizeMB}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`p-3 rounded-2xl shrink-0 ${
                        isTestReport
                          ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {isTestReport ? (t('downloadPage.testReportName') || doc.name) : doc.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {isTestReport
                            ? (t('downloadPage.testReportDesc') || 'Formulaire officiel d\'évaluation et de retour terrain pour testeur humain (Windows & Android).')
                            : 'Guide complet pour la prise en main et l’activation souveraine 100% locale sans Internet.'}
                        </p>
                      </div>
                    </div>

                    {/* SHA-256 Toggle */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => toggleSha(doc.filename)}
                        className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer"
                      >
                        <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Empreinte SHA-256 certifiée</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isShaOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isShaOpen && (
                        <div className="mt-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-[10px] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                          <span className="truncate select-all">{doc.sha256}</span>
                          <button
                            type="button"
                            onClick={() => handleCopySha(doc.sha256)}
                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] font-bold text-indigo-600 shadow-sm shrink-0 cursor-pointer"
                          >
                            {isCopied ? 'Copié' : 'Copier'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => handleTriggerDownload(doc.filename)}
                      className={`w-full py-3 min-h-[44px] rounded-xl font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer ${
                        isTestReport
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                      }`}
                      data-testid={isTestReport ? 'download-test-report-btn' : `download-doc-${doc.filename}`}
                      id={`download-btn-${doc.filename}`}
                    >
                      <Download className="w-4 h-4" />
                      <span>{isTestReport ? (t('downloadPage.btnDownloadTestReport') || 'Télécharger le rapport de testeur') : 'Télécharger le guide'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
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
