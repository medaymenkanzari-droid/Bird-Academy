/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { SEMANTIC_COLORS, BORDER_RADIUS } from '../../theme';

export interface AppAlertProps {
  children: ReactNode;
  type?: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  className?: string;
  onClose?: () => void;
}

export function AppAlert({
  children,
  type = 'info',
  title,
  className = '',
  onClose,
}: AppAlertProps) {
  const radiusClass = BORDER_RADIUS.lg;

  // Determine styles and icons
  const config = {
    success: {
      colors: SEMANTIC_COLORS.success,
      icon: <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />,
    },
    warning: {
      colors: SEMANTIC_COLORS.warning,
      icon: <AlertTriangle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />,
    },
    danger: {
      colors: SEMANTIC_COLORS.danger,
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    },
    info: {
      colors: SEMANTIC_COLORS.primary,
      icon: <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />,
    },
  }[type];

  const { colors, icon } = config;

  return (
    <div
      className={`
        flex gap-3.5 p-4 border rounded-xl font-sans
        ${colors.lightBg} ${colors.lightText} ${colors.border}
        ${className}
      `}
      role="alert"
    >
      {icon}

      <div className="flex-1">
        {title && (
          <h5 className="font-bold text-sm leading-tight mb-1">
            {title}
          </h5>
        )}
        <div className="text-xs leading-relaxed opacity-95">
          {children}
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 font-semibold p-1 transition-colors cursor-pointer self-start"
          aria-label="Fermer"
        >
          <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
