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
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: any;
  max?: any;
  autoFocus?: boolean;
  [key: string]: any;
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

  const radiusClass = BORDER_RADIUS.lg; // rounded-xl (~12px)
  const transitionClass = ANIMATIONS.fade;

  // Semantic state classes
  const errorBorder = error
    ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500 dark:border-red-500'
    : 'border-slate-300 focus:ring-blue-500/30 focus:border-blue-600 dark:border-slate-700 dark:focus:ring-blue-500/30 dark:focus:border-blue-400';
  const disabledBg = disabled
    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-800'
    : 'bg-white text-slate-900 dark:bg-slate-800 dark:text-white';

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
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-400 shrink-0 pointer-events-none flex items-center">
            {startIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`
            w-full h-11 sm:h-12 min-h-[44px] text-sm font-sans px-3.5 py-2.5
            border rounded-xl shadow-2xs focus:outline-none focus:ring-2
            placeholder-slate-400 dark:placeholder-slate-500
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
          className="text-xs font-semibold text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1 font-sans animate-fadeIn"
        >
          ⚠️ {error}
        </span>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <span id={`${inputId}-helper`} className={`${TYPOGRAPHY.caption} mt-1.5 font-medium`}>
          {helperText}
        </span>
      )}
    </div>
  );
}

export default AppInput;
