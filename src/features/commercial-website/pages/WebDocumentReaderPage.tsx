/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — OFFICIAL REACT DOCUMENT READER
 * High-fidelity, mobile-responsive reader for Tester Kit documentation with real A4 PDF & Markdown exports.
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight,
  Download, 
  Printer, 
  FileText, 
  FileDown,
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Layers
} from 'lucide-react';
import { WebRoute } from '../types';
import { useWebLanguage } from '../i18n';
import { WebDownloadService } from '../services/WebDownloadService';
import { MarkdownRenderer } from '../utils/markdownRenderer';

export interface WebDocumentReaderPageProps {
  docId?: string;
  onNavigate: (route: WebRoute, param?: string) => void;
}

export const WebDocumentReaderPage: React.FC<WebDocumentReaderPageProps> = ({
  docId,
  onNavigate,
}) => {
  const { t, isRtl } = useWebLanguage();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const downloadService = WebDownloadService.getInstance();
  const allKitDocs = downloadService.getAllArtifacts().filter((a) => a.platform === 'kit');

  // Normalize document identifier
  const cleanId = (docId || '').replace(/^#\/?/, '').replace(/^download\/kit\//, '');
  const activeDoc = allKitDocs.find(
    (d) => d.filename === cleanId || d.filename.replace(/\.md$/, '') === cleanId
  ) || allKitDocs[0];

  const actualFilename = activeDoc ? activeDoc.filename : cleanId;
  const pdfFilename = actualFilename.replace(/\.md$/, '.pdf');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const docUrl = `/downloads/${actualFilename}`;
    fetch(docUrl)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`HTTP_${res.status}: Impossible de charger le document.`);
        }
        return res.text();
      })
      .then((text) => {
        if (isMounted) {
          setContent(text);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[WebDocumentReader] Échec du fetch dynamique, tentative de secours...', err);
          // Graceful fallback to basic summary if network unavailable
          setError(`Impossible de charger dynamiquement le document : ${err.message}`);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [actualFilename]);

  const handleDownloadOriginal = () => {
    const link = document.createElement('a');
    link.href = `/downloads/${actualFilename}`;
    link.download = actualFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = () => {
    const link = document.createElement('a');
    link.href = `/downloads/${pdfFilename}`;
    link.download = pdfFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div 
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
      data-testid="web-document-reader-page"
      id="web-document-reader-page"
    >
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => onNavigate('download')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer self-start"
          data-testid="back-to-download-btn"
          id="back-to-download-btn"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{t('downloadPage.backToDownloads') || '← Retour au Centre de téléchargement'}</span>
        </button>

        {/* Official Version Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>v1.3.6 • BA-V1.3.6</span>
          </span>
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Lecteur Officiel Réactif
          </span>
        </div>
      </div>

      {/* Document Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 uppercase tracking-wider">
                Kit Testeur Android
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {actualFilename}
              </span>
            </div>
            <h1 
              className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight"
              data-testid="reader-document-title"
            >
              {activeDoc?.name || actualFilename}
            </h1>
            {activeDoc?.descriptionKey && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                {t(activeDoc.descriptionKey)}
              </p>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 md:pt-0">
            {/* Download A4 PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              data-testid="download-pdf-btn"
              id="download-pdf-btn"
              title="Télécharger la fiche imprimable au format PDF A4"
            >
              <FileDown className="w-4 h-4" />
              <span>{t('downloadPage.btnDownloadPdf') || 'Fiche PDF (A4)'}</span>
            </button>

            {/* Download Original .md */}
            <button
              type="button"
              onClick={handleDownloadOriginal}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              data-testid="download-original-md-btn"
              id="download-original-md-btn"
              title="Télécharger le fichier source Markdown original"
            >
              <Download className="w-4 h-4" />
              <span>{t('downloadPage.btnDownloadOriginal') || 'Source (.md)'}</span>
            </button>

            {/* Browser Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              data-testid="print-doc-btn"
              id="print-doc-btn"
              title="Imprimer ou enregistrer via le navigateur"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>
          </div>
        </div>

        {/* Metadata info strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Source Maître :</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">Markdown (.md)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Format Terrain :</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-mono">PDF A4 Prêt</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Lecture :</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Navigateur Intégré</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Taille :</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{activeDoc?.sizeMB || 'Variable'}</span>
          </div>
        </div>
      </div>

      {/* Main Document Content Container */}
      <div 
        className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
        data-testid="rendered-markdown-content"
      >
        {loading && (
          <div className="py-16 text-center space-y-4">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Chargement du document de recette...
            </p>
          </div>
        )}

        {error && (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 space-y-3">
            <div className="flex items-center gap-2.5 font-bold">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Erreur de chargement</span>
            </div>
            <p className="text-xs leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={handleDownloadOriginal}
              className="px-4 py-2 bg-rose-700 text-white rounded-xl text-xs font-bold shadow hover:bg-rose-800 transition"
            >
              Télécharger directement le fichier .md
            </button>
          </div>
        )}

        {!loading && !error && content && (
          <article className="prose dark:prose-invert max-w-none">
            <MarkdownRenderer content={content} isRtl={isRtl} />
          </article>
        )}
      </div>

      {/* Bottom Sticky-friendly Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
        <span className="text-slate-600 dark:text-slate-400">
          Ce document fait partie du <strong>Kit Testeur — Validation Android v1.3.6</strong> (Action `ACT-P1-02`).
        </span>
        <button
          type="button"
          onClick={() => onNavigate('download')}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition cursor-pointer"
        >
          {t('downloadPage.backToDownloads') || '← Retour au Centre de téléchargement'}
        </button>
      </div>
    </div>
  );
};

export default WebDocumentReaderPage;
