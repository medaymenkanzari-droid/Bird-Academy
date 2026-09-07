/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE KEY DISPLAY
 * Visual formatted display for LMSE keys with quick-copy and security indicators.
 */

import React, { useState } from 'react';
import { Copy, Check, Key } from 'lucide-react';
import { useLanguage } from '../../../../context/LanguageContext';

export interface LicenseKeyDisplayProps {
  licenseKey: string;
  masked?: boolean;
  className?: string;
}

export const LicenseKeyDisplay: React.FC<LicenseKeyDisplayProps> = ({
  licenseKey,
  masked = false,
  className = '',
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const displayKey = masked
    ? `${licenseKey.slice(0, 9)}••••-••••-${licenseKey.slice(-4)}`
    : licenseKey;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(licenseKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      data-testid="license-key-display"
      className={`inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-xs shadow-inner border border-slate-800 ${className}`}
    >
      <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span className="tracking-wider select-all font-semibold">{displayKey}</span>
      <button
        type="button"
        onClick={handleCopy}
        title={t('copyKey') || 'Copier la clé'}
        aria-label={t('copyKey') || 'Copier la clé'}
        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
};
