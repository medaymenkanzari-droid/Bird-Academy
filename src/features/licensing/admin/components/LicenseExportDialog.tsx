/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE EXPORT DIALOG
 * Multi-format offline export (.lmse file, tester sheet, raw key, QR payload).
 */

import React, { useState } from 'react';
import { License } from '../../types/licensing';
import { OfflineBetaExporter } from '../../engines/OfflineBetaExporter';
import { LicenseKeyDisplay } from './LicenseKeyDisplay';
import { LicenseTierBadge } from './LicenseTierBadge';
import { LicenseStatusBadge } from './LicenseStatusBadge';
import { SubscriptionTierResolver } from '../../../subscription/services/SubscriptionTierResolver';
import { useLanguage } from '../../../../context/LanguageContext';
import {
  AppModal,
  AppButton,
  AppCard,
  AppAlert
} from '../../../../components/design-system';
import {
  Download,
  FileCode,
  FileText,
  QrCode,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';

export interface LicenseExportDialogProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onShowQr: (license: License) => void;
}

export const LicenseExportDialog: React.FC<LicenseExportDialogProps> = ({
  license,
  isOpen,
  onClose,
  onShowQr,
}) => {
  const { t, isRtl } = useLanguage();
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!license) return null;

  const tier = SubscriptionTierResolver.resolve(license);

  const handleExportLmse = () => {
    const jsonStr = OfflineBetaExporter.exportLicenseJson(license);
    const filename = OfflineBetaExporter.getExportFilename(license);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(`Fichier ${filename} téléchargé avec succès.`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleExportTesterSheet = () => {
    const mdStr = OfflineBetaExporter.generateTesterSheet(license);
    const filename = `Fiche-Remise-${license.id}.md`;
    const blob = new Blob([mdStr], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(`Fiche de remise ${filename} générée.`);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  const handleCopyRawPayload = () => {
    const jsonStr = OfflineBetaExporter.exportLicenseJson(license);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Exportation Commerciale — ${license.holderName}`}
      size="lg"
    >
      <div className="space-y-5" dir={isRtl ? 'rtl' : 'ltr'} data-testid="license-export-dialog">
        {downloadSuccess && (
          <AppAlert type="success" title="Export réussi">
            {downloadSuccess}
          </AppAlert>
        )}

        {/* LICENSE SUMMARY CARD */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <LicenseTierBadge tier={tier} />
              <LicenseStatusBadge status={license.status} />
            </div>
            <span className="text-[10px] font-mono text-slate-400">ID: {license.id}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">Titulaire :</span>
              <span className="font-bold text-sm text-slate-100">{license.holderName}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block">Clé de Licence :</span>
              <LicenseKeyDisplay licenseKey={license.key} />
            </div>
          </div>
        </div>

        {/* EXPORT ACTIONS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 1. EXPORT .LMSE FILE */}
          <AppCard className="p-4 space-y-3 flex flex-col justify-between hover:border-indigo-500 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <FileCode className="w-4 h-4 text-indigo-500" />
                Fichier Cryptographique .lmse
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fichier d'activation hors-ligne officiel contenant payload signé, SHA-256 et signature ECDSA.
              </p>
            </div>
            <AppButton
              variant="primary"
              size="sm"
              onClick={handleExportLmse}
              data-testid="export-lmse-file-btn"
            >
              <Download className="w-4 h-4 mr-1" />
              Télécharger .lmse
            </AppButton>
          </AppCard>

          {/* 2. QR CODE */}
          <AppCard className="p-4 space-y-3 flex flex-col justify-between hover:border-emerald-500 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <QrCode className="w-4 h-4 text-emerald-500" />
                QR Code d'Activation
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Génère un QR Code scannable directement par l'application mobile ou PC sans connexion réseau.
              </p>
            </div>
            <AppButton
              variant="secondary"
              size="sm"
              onClick={() => onShowQr(license)}
              data-testid="show-qr-dialog-btn"
            >
              <QrCode className="w-4 h-4 mr-1 text-emerald-500" />
              Afficher QR Code
            </AppButton>
          </AppCard>

          {/* 3. TESTER DELIVERY SHEET */}
          <AppCard className="p-4 space-y-3 flex flex-col justify-between hover:border-amber-500 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <FileText className="w-4 h-4 text-amber-500" />
                Fiche de Remise Markdown
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fiche récapitulative formatée pour remise en main propre ou email avec instructions d'activation.
              </p>
            </div>
            <AppButton
              variant="secondary"
              size="sm"
              onClick={handleExportTesterSheet}
              data-testid="export-tester-sheet-btn"
            >
              <Download className="w-4 h-4 mr-1 text-amber-500" />
              Générer Fiche .md
            </AppButton>
          </AppCard>

          {/* 4. COPY JSON PAYLOAD */}
          <AppCard className="p-4 space-y-3 flex flex-col justify-between hover:border-purple-500 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                <Copy className="w-4 h-4 text-purple-500" />
                Copier Payload JSON
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Copie le JSON cryptographique complet de la licence dans le presse-papiers.
              </p>
            </div>
            <AppButton
              variant="secondary"
              size="sm"
              onClick={handleCopyRawPayload}
              data-testid="copy-raw-payload-btn"
            >
              {copiedPayload ? <Check className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
              {copiedPayload ? 'Copié !' : 'Copier Payload'}
            </AppButton>
          </AppCard>
        </div>

        <div className="flex justify-end pt-2">
          <AppButton variant="secondary" onClick={onClose}>
            {t('close') || 'Fermer'}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
};
