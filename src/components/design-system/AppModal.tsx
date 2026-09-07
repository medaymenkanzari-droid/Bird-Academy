/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BORDER_RADIUS, SHADOWS, Z_INDEX, MOTION_VARIANTS } from '../../theme';

export interface AppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  className?: string;
}

export function AppModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}: AppModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Android Back / Popstate listener to close modal before navigation
  useEffect(() => {
    if (!isOpen) return;
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  // Size constraints with mobile responsive calc bounds
  const sizeMap = {
    sm: 'max-w-[calc(100vw-1.5rem)] sm:max-w-md',
    md: 'max-w-[calc(100vw-1.5rem)] sm:max-w-lg',
    lg: 'max-w-[calc(100vw-1.5rem)] sm:max-w-lg md:max-w-2xl',
    xl: 'max-w-[calc(100vw-1.5rem)] sm:max-w-xl md:max-w-4xl',
    full: 'max-w-full m-2 sm:m-4 h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)]',
  };

  const sizeClass = sizeMap[size];
  const radiusClass = BORDER_RADIUS.xl; // rounded-2xl (~16px)
  const shadowClass = SHADOWS.xl;
  const zClass = Z_INDEX.modal;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          data-modal-portal="true"
          className={`fixed inset-0 flex items-start sm:items-center justify-center overflow-hidden p-3 sm:p-4 z-[9999] ${zClass}`}
          style={{
            paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
            paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0.75rem))',
            paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))',
          }}
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs cursor-pointer"
            onClick={() => closeOnOverlayClick && onClose()}
          />

          {/* Modal Container */}
          <motion.div
            data-modal-card="true"
            variants={MOTION_VARIANTS.modal}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`
              relative w-full bg-white dark:bg-[#1E1E1E] dark:bg-slate-900 border border-slate-200 dark:border-[#343A40] dark:border-slate-800 flex flex-col overflow-hidden z-10 my-0 sm:my-auto max-h-full
              ${sizeClass} ${radiusClass} ${shadowClass}
            `}
            style={{
              maxHeight: 'min(100%, calc(100dvh - max(2rem, env(safe-area-inset-top, 1rem) + env(safe-area-inset-bottom, 1rem))))'
            }}
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div data-modal-header="true" className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div>
                {title && (
                  <h3 className="font-sans font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                    {title}
                  </h3>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div data-modal-body="true" className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0">
              {children}
            </div>

            {/* Modal Footer */}
            {footer && (
              <div data-modal-footer="true" className="px-5 sm:px-6 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default AppModal;
