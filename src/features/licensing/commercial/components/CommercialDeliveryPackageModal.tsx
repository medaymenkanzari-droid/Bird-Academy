/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL DELIVERY PACKAGE MODAL
 * Multi-file delivery kit viewer and standard PKZIP offline exporter.
 */

import React, { useState } from 'react';
import { LicenseDeliveryPackage, DeliveryPackageFile } from '../types/deliveryPackage';
import { LicenseDeliveryPackageGenerator } from '../services/LicenseDeliveryPackageGenerator';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppModal,
  AppButton,
  AppCard,
  AppTabs,
  AppAlert,
} from '../../../../components/design-system';
import {
  FileBox,
  Download,
  FileCode,
  FileText,
  Key,
  QrCode,
  Copy,
  Check,
  PackageCheck,
} from 'lucide-react';

export interface CommercialDeliveryPackageModalProps {
  pkg: LicenseDeliveryPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CommercialDeliveryPackageModal: React.FC<CommercialDeliveryPackageModalProps> = ({
  pkg,
  isOpen,
  onClose,
}) => {
  const { isRtl } = useLanguage();
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!pkg) return null;

  const currentFile = pkg.files[selectedFileIdx] || pkg.files[0];

  const getQrImageUrl = (file: DeliveryPackageFile): string => {
    if (file.dataUrl) return file.dataUrl;
    if (typeof file.content === 'string' && file.content.startsWith('data:image')) {
      return file.content;
    }
    if (file.content instanceof Uint8Array && typeof window !== 'undefined') {
      const blob = new Blob([file.content], { type: 'image/png' });
      return URL.createObjectURL(blob);
    }
    return '';
  };

  const handleCopyContent = () => {
    if (!currentFile) return;
    const textToCopy = typeof currentFile.content === 'string'
      ? currentFile.content
      : (currentFile.dataUrl || '[BINARY_PNG_IMAGE]');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: DeliveryPackageFile) => {
    LicenseDeliveryPackageGenerator.downloadSingleFile(file);
    setDownloadSuccess(`Fichier "${file.filename}" téléchargé.`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleDownloadAll = () => {
    LicenseDeliveryPackageGenerator.downloadFullPackageArchive(pkg);
    setDownloadSuccess(`Archive ZIP "${pkg.packageId}.zip" téléchargée avec succès.`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.lmse')) return <FileCode className="w-4 h-4 text-indigo-500" />;
    if (filename.includes('key')) return <Key className="w-4 h-4 text-emerald-500" />;
    if (filename.includes('qr') || filename.endsWith('.png')) return <QrCode className="w-4 h-4 text-amber-500" />;
    return <FileText className="w-4 h-4 text-blue-500" />;
  };

  const isImage = currentFile.filename.endsWith('.png');
  const qrImageUrl = isImage ? getQrImageUrl(currentFile) : '';

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Kit Commercial de Livraison Hors-Ligne (Delivery Package)"
      size="xl"
    >
      <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="commercial-delivery-package-modal">
        {downloadSuccess && (
          <AppAlert type="success" title="Téléchargement Réussi">
            {downloadSuccess}
          </AppAlert>
        )}

        {/* Header Summary */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <FileBox className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Package {pkg.packageId}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Destinataire : <strong>{pkg.customerName}</strong> | Plan : <strong>{pkg.tier}</strong>
              </p>
            </div>
          </div>

          <AppButton
            variant="primary"
            size="sm"
            onClick={handleDownloadAll}
            data-testid="download-all-package-btn"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Télécharger Tout le Pack (.zip)
          </AppButton>
        </div>

        {/* File Navigator & Viewer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* File List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Fichiers Inclus ({pkg.files.length}) :
            </span>
            <div className="space-y-1.5">
              {pkg.files.map((file, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition-all ${
                    selectedFileIdx === idx
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                  data-testid={`select-pkg-file-${file.filename}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(file.filename)}
                    <span className="truncate">{file.filename}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-1">
                    {file.sizeBytes} B
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* File Content Preview */}
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Aperçu : {currentFile.filename}
              </span>
              <div className="flex items-center gap-1.5">
                {!isImage && (
                  <AppButton
                    variant="outline"
                    size="sm"
                    onClick={handleCopyContent}
                    data-testid="copy-file-content-btn"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copied ? 'Copié' : 'Copier'}
                  </AppButton>
                )}
                <AppButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDownloadFile(currentFile)}
                  data-testid="download-current-file-btn"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Télécharger
                </AppButton>
              </div>
            </div>

            {isImage ? (
              <div className="p-6 bg-slate-900 dark:bg-slate-950 rounded-xl flex flex-col items-center justify-center space-y-3 border border-slate-800 h-64">
                {qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt="License QR Code"
                    className="w-40 h-40 bg-white p-2 rounded-xl object-contain shadow-lg"
                    data-testid="pkg-preview-qr-image"
                  />
                ) : (
                  <span className="text-xs text-slate-400 font-mono">Image binaire QR Code PNG ({currentFile.sizeBytes} octets)</span>
                )}
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentFile.filename} — {currentFile.sizeBytes} octets (Scannable)
                </span>
              </div>
            ) : (
              <pre className="p-3 bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-slate-200 rounded-xl font-mono text-[11px] h-64 overflow-y-auto whitespace-pre-wrap select-all border border-slate-800">
                {typeof currentFile.content === 'string' ? currentFile.content : '[Binary Data]'}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <AppButton variant="outline" size="sm" onClick={onClose}>
            Fermer
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
