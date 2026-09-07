/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  QrCode, Download, Printer, Copy, Check, ExternalLink, ShieldCheck, Share2 
} from 'lucide-react';
import { Canari } from '../../../types';
import { QRCodeManager } from '../../habitat/services/QRCodeManager';
import { AppModal, AppButton } from '../../../components/design-system';
import { useLanguage } from '../../../context/LanguageContext';

export interface BirdQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bird: Canari;
}

export const BirdQrCodeModal: React.FC<BirdQrCodeModalProps> = ({
  isOpen,
  onClose,
  bird
}) => {
  const { t, language, isRtl } = useLanguage();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const formattedCode = `BA:BIRD:${bird.bague || bird.id}`;

  useEffect(() => {
    if (isOpen) {
      QRCodeManager.generatePNGDataURL(formattedCode, 320).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [isOpen, formattedCode]);

  const handleCopy = async () => {
    const success = await QRCodeManager.copyIdentifier(formattedCode);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadPNG = () => {
    QRCodeManager.downloadPNG(formattedCode, `Passeport_QR_${bird.bague || bird.id}`);
  };

  const handleDownloadSVG = () => {
    QRCodeManager.downloadSVG(formattedCode, `Passeport_QR_${bird.bague || bird.id}`);
  };

  const handlePrint = () => {
    QRCodeManager.printQRCode(
      formattedCode,
      `${bird.nom || 'Bird'} (${bird.bague || bird.id})`,
      t('passportTitle')
    );
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('smartQrCodeTitle')}
      size="sm"
    >
      <div className={`space-y-5 text-center font-sans ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        
        {/* Subtitle */}
        <p className="text-xs text-slate-400">
          {t('qrScanDescription')}
        </p>

        {/* QR Code Container */}
        <div className="relative mx-auto w-56 h-56 p-4 rounded-3xl bg-white border-2 border-indigo-500/40 shadow-2xl flex items-center justify-center">
          {qrDataUrl ? (
            <img 
              src={qrDataUrl} 
              alt={formattedCode} 
              className="w-full h-full object-contain" 
            />
          ) : (
            <div className="animate-pulse text-slate-400 text-xs font-mono">
              ...
            </div>
          )}
        </div>

        {/* Identity Details Box */}
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl space-y-1">
          <div className="font-extrabold text-sm text-white">
            {bird.nom || `${t('speciesCanari')} #${bird.id}`}
          </div>
          <div className="font-mono text-xs font-bold text-emerald-400">
            {bird.bague || 'SANS-BAGUE'}
          </div>
          <div className="text-3xs text-slate-400 font-mono select-all">
            {formattedCode}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <AppButton
            variant="outline"
            size="sm"
            onClick={handleDownloadPNG}
            startIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            {t('downloadPNG')}
          </AppButton>

          <AppButton
            variant="outline"
            size="sm"
            onClick={handleDownloadSVG}
            startIcon={<Download className="w-3.5 h-3.5" />}
            className="text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            {t('downloadSVG')}
          </AppButton>
        </div>

        <div className="flex items-center gap-2">
          <AppButton
            variant="secondary"
            size="sm"
            fullWidth
            onClick={handleCopy}
            startIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs"
          >
            {isCopied ? (language === 'ar' ? 'تم النسخ!' : 'Copié !') : (language === 'ar' ? 'نسخ المعرف' : 'Copier ID')}
          </AppButton>

          <AppButton
            variant="primary"
            size="sm"
            fullWidth
            onClick={handlePrint}
            startIcon={<Printer className="w-3.5 h-3.5" />}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
          >
            {t('printCertificate')}
          </AppButton>
        </div>

      </div>
    </AppModal>
  );
};

export default BirdQrCodeModal;
