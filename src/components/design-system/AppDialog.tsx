/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info as InfoIcon } from 'lucide-react';
import { AppModal } from './AppModal';
import { AppButton } from './AppButton';

export interface AppDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  isConfirmLoading?: boolean;
}

export function AppDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'info',
  isConfirmLoading = false,
}: AppDialogProps) {
  // Select icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-10 h-10 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-10 h-10 text-orange-500" />;
      case 'danger':
        return <AlertCircle className="w-10 h-10 text-red-500" />;
      default:
        return <InfoIcon className="w-10 h-10 text-emerald-600" />;
    }
  };

  // Select button type
  const getConfirmButtonVariant = () => {
    if (type === 'danger') return 'danger';
    if (type === 'success') return 'success';
    return 'primary';
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={!isConfirmLoading}
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className="mb-4 bg-slate-50 p-3.5 rounded-full">
          {getIcon()}
        </div>

        <h4 className="font-sans font-bold text-lg text-slate-800 tracking-tight mb-2">
          {title}
        </h4>

        <div className="font-sans text-sm text-slate-500 leading-relaxed mb-6">
          {description}
        </div>

        <div className="flex items-center gap-3 w-full">
          <AppButton
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isConfirmLoading}
          >
            {cancelText}
          </AppButton>
          <AppButton
            variant={getConfirmButtonVariant()}
            fullWidth
            onClick={onConfirm}
            disabled={isConfirmLoading}
          >
            {isConfirmLoading ? 'Chargement...' : confirmText}
          </AppButton>
        </div>
      </div>
    </AppModal>
  );
}
