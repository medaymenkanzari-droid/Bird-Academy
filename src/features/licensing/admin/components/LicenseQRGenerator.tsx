/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — OFFLINE LICENSE QR GENERATOR
 * Generates local cryptographic activation QR code without remote cloud dependencies.
 */

import React, { useState, useEffect } from 'react';
import { License } from '../../types/licensing';
import { OfflineBetaExporter } from '../../engines/OfflineBetaExporter';
import { useLanguage } from '../../../../context/LanguageContext';
import { AppModal, AppButton, AppCard } from '../../../../components/design-system';
import { QrCode, Copy, Check, Download } from 'lucide-react';

export interface LicenseQRGeneratorProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseQRGenerator: React.FC<LicenseQRGeneratorProps> = ({
  license,
  isOpen,
  onClose,
}) => {
  const { t, isRtl } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrPayload, setQrPayload] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!license || !isOpen) {
      setQrDataUrl('');
      setQrPayload('');
      return;
    }

    const generateQr = async () => {
      setLoading(true);
      try {
        const payload = OfflineBetaExporter.generateQrPayload(license);
        setQrPayload(payload);
        const QRCodeModule = await import('qrcode');
        const url = await QRCodeModule.default.toDataURL(payload, {
          width: 320,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Failed to generate offline QR code', err);
      } finally {
        setLoading(false);
      }
    };

    generateQr();
  }, [license, isOpen]);

  const handleCopyPayload = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && qrPayload) {
      navigator.clipboard.writeText(qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQrImage = () => {
    if (!qrDataUrl || !license) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Activation-${license.id}.png`;
    a.click();
  };

  if (!license) return null;

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('qrCodeModalTitle') || 'QR Code d\'activation hors ligne'}
      size="md"
    >
      <div className="space-y-4 text-center" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-qr-modal">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Ce QR Code contient la licence signée cryptographiquement pour activation directe 100% hors-ligne.
        </p>

        <div className="flex justify-center p-4 bg-white rounded-2xl shadow-inner border border-slate-200 inline-block mx-auto">
          {loading ? (
            <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-xs">
              Génération du QR Code local...
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR Code d'activation LMSE"
              className="w-64 h-64 rounded-lg object-contain"
              data-testid="license-qr-image"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-xs">
              Impossible de générer le QR Code
            </div>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-left font-mono text-xs space-y-1">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Titulaire :</span>
            <span className="font-bold text-slate-900 dark:text-white">{license.holderName}</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Clé :</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{license.key}</span>
          </div>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Validité :</span>
            <span className="text-slate-700 dark:text-slate-300">{license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'Permanente'}</span>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <AppButton
            variant="secondary"
            size="sm"
            onClick={handleCopyPayload}
            data-testid="copy-qr-payload-btn"
          >
            {copied ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copié !' : 'Copier le Payload QR'}
          </AppButton>
          <AppButton
            variant="primary"
            size="sm"
            onClick={handleDownloadQrImage}
            disabled={!qrDataUrl}
            data-testid="download-qr-btn"
          >
            <Download className="w-4 h-4 mr-1" />
            Télécharger Image QR
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
