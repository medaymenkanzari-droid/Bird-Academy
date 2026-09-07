/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — DELIVERY KIT DOWNLOADER
 * Handles individual file downloads and complete standard PKZIP delivery kit downloads.
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../../i18n';
import { DeliveryPackage } from '../../../licensing/commercial/types/deliveryPackage';
import { ZipArchiveBuilder } from '../../../licensing/commercial/services/ZipArchiveBuilder';
import { 
  Download, FileCode, FileText, QrCode, Info, Check, Copy, ShieldCheck, Key 
} from 'lucide-react';

export interface DeliveryKitDownloaderProps {
  deliveryPackage: DeliveryPackage;
  licenseKey?: string;
}

export const DeliveryKitDownloader: React.FC<DeliveryKitDownloaderProps> = ({
  deliveryPackage,
  licenseKey,
}) => {
  const { t, isRtl } = useWebLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyKey = () => {
    const keyFile = Array.isArray(deliveryPackage.files)
      ? deliveryPackage.files.find(f => f.filename === 'license-key.txt')?.content
      : (deliveryPackage.files as any)?.['license-key.txt'];
    const keyToCopy = licenseKey || (typeof keyFile === 'string' ? keyFile : '') || '';
    if (keyToCopy && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(keyToCopy.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadSingleFile = (filename: string, content: string | Uint8Array) => {
    let mimeType = 'text/plain;charset=utf-8';
    if (filename.endsWith('.png')) {
      mimeType = 'image/png';
    } else if (filename.endsWith('.lmse')) {
      mimeType = 'application/json;charset=utf-8';
    } else if (content instanceof Uint8Array) {
      mimeType = 'application/octet-stream';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadZipPackage = () => {
    const rawId = deliveryPackage.licenseId || deliveryPackage.packageId;
    const cleanId = rawId.replace(/^PKG-(DEMO-)?/, '');
    const zipFilename = `bird-academy-license-package-${cleanId}.zip`;

    let entries: { filename: string; content: string | Uint8Array }[] = [];
    if (Array.isArray(deliveryPackage.files)) {
      entries = deliveryPackage.files.map(f => ({
        filename: f.filename,
        content: f.content,
      }));
    }

    ZipArchiveBuilder.downloadZipArchive(zipFilename, entries);
  };

  const getFileContent = (fileName: string): string | Uint8Array | undefined => {
    if (Array.isArray(deliveryPackage.files)) {
      const found = deliveryPackage.files.find(f =>
        f.filename === fileName ||
        (f.filename.startsWith('license_') && fileName === 'license.lmse') ||
        (f.filename.endsWith('.png') && (fileName === 'license-qr.png' || fileName === 'license-qr.txt'))
      );
      return found?.content;
    }
    return (deliveryPackage.files as any)?.[fileName];
  };

  const getActualFilename = (configName: string): string => {
    if (Array.isArray(deliveryPackage.files)) {
      const found = deliveryPackage.files.find(f =>
        f.filename === configName ||
        (f.filename.startsWith('license_') && configName === 'license.lmse')
      );
      if (found) return found.filename;
    }
    return configName;
  };

  const filesConfig = [
    {
      name: 'license.lmse',
      label: t('delivery.fileLmse'),
      icon: FileCode,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40',
      isBinary: true,
    },
    {
      name: 'license-key.txt',
      label: t('delivery.fileKey'),
      icon: Key,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
      isBinary: false,
    },
    {
      name: 'license-qr.png',
      label: t('delivery.fileQr'),
      icon: QrCode,
      color: 'text-emerald-600 bg-emerald-50 dark:emerald-950/40',
      isBinary: true,
    },
    {
      name: 'license-info.txt',
      label: t('delivery.fileInfo'),
      icon: Info,
      color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40',
      isBinary: false,
    },
    {
      name: 'README.txt',
      label: t('delivery.fileReadme'),
      icon: FileText,
      color: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
      isBinary: false,
    },
  ];

  return (
    <div
      className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6"
      data-testid="delivery-kit-downloader"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 flex items-start gap-4">
        <div className="p-3 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1 text-left flex-1">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            {t('delivery.kitReadyTitle')}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {t('delivery.kitReadyDesc')}
          </p>
        </div>
      </div>

      {/* License Key Quick Copy */}
      {licenseKey && (
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-500" />
              {t('delivery.licenseKeyLabel')}
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Offline-Safe
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white select-all">
              {licenseKey}
            </span>
            <button
              type="button"
              onClick={handleCopyKey}
              className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition cursor-pointer"
              title="Copier la clé"
              data-testid="copy-license-key-btn"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* 5 Files List */}
      <div className="space-y-2.5">
        {filesConfig.map((file) => {
          const Icon = file.icon;
          const content = getFileContent(file.name);
          const hasContent = content !== undefined;
          const actualFilename = getActualFilename(file.name);

          return (
            <div
              key={file.name}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
              data-testid={`delivery-file-${actualFilename}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${file.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block">
                    {actualFilename}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {file.label}
                  </span>
                </div>
              </div>

              {hasContent && (
                <button
                  type="button"
                  onClick={() => handleDownloadSingleFile(actualFilename, content!)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
                  data-testid={`download-file-btn-${actualFilename}`}
                >
                  <Download className="w-3 h-3" />
                  <span>Télécharger</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Download Complete ZIP Package Button */}
      <button
        type="button"
        onClick={handleDownloadZipPackage}
        className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
        data-testid="download-complete-kit-btn"
      >
        <Download className="w-4 h-4" />
        <span>{t('delivery.downloadAll')} (.zip)</span>
      </button>
    </div>
  );
};
