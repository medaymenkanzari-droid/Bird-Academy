/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { InputHTMLAttributes, ReactNode, useId } from 'react';
import { TYPOGRAPHY, BORDER_RADIUS, ANIMATIONS } from '../../theme';

export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  containerClassName?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  value?: any;
  onChange?: any;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
}

export function AppInput({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  className = '',
  disabled,
  containerClassName = '',
  ...props
}: AppInputProps) {
  const generatedId = useId();
  const inputId = props.id || generatedId;

  const radiusClass = BORDER_RADIUS.lg; // Uniform corners
  const transitionClass = ANIMATIONS.fade;

  // Semantic state classes
  const errorBorder = error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-600';
  const disabledBg = disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-white text-slate-800';

  return (
    <div className={`flex flex-col w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={inputId} className={TYPOGRAPHY.label}>
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {/* Start Icon Slot */}
        {startIcon && (
          <div className="absolute left-3.5 text-slate-400 shrink-0 pointer-events-none flex items-center">
            {startIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`
            w-full h-10 text-sm font-sans px-3.5 py-2
            border rounded-xl shadow-2xs focus:outline-none focus:ring-2
            ${startIcon ? 'pl-10' : ''}
            ${endIcon ? 'pr-10' : ''}
            ${errorBorder}
            ${disabledBg}
            ${transitionClass}
            ${className}
          `}
          {...props}
        />

        {/* End Icon Slot */}
        {endIcon && (
          <div className="absolute right-3.5 text-slate-400 shrink-0 pointer-events-none flex items-center">
            {endIcon}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <span
          id={`${inputId}-error`}
          className="text-xs font-semibold text-red-500 mt-1.5 flex items-center gap-1 font-sans animate-fadeIn"
        >
          ⚠️ {error}
        </span>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className={`${TYPOGRAPHY.caption} mt-1.5`}>
          {helperText}
        </span>
      )}
    </div>
  );
}
