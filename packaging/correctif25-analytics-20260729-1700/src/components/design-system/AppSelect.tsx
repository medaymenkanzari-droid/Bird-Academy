/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { SelectHTMLAttributes, useId } from 'react';
import { TYPOGRAPHY, BORDER_RADIUS, ANIMATIONS } from '../../theme';

export interface AppSelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface AppSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: AppSelectOption[];
  containerClassName?: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  value?: any;
  onChange?: any;
  required?: boolean;
}

export function AppSelect({
  label,
  error,
  helperText,
  options = [],
  children,
  className = '',
  disabled,
  containerClassName = '',
  ...props
}: AppSelectProps) {
  const generatedId = useId();
  const selectId = props.id || generatedId;

  const radiusClass = BORDER_RADIUS.lg; // Uniform corners
  const transitionClass = ANIMATIONS.fade;

  const errorBorder = error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-600';
  const disabledBg = disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200' : 'bg-white text-slate-800';

  return (
    <div className={`flex flex-col w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={selectId} className={TYPOGRAPHY.label}>
          {label}
        </label>
      )}

      <div className="relative w-full">
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          className={`
            w-full h-10 text-sm font-sans px-3.5 py-2 pr-10
            border rounded-xl shadow-2xs focus:outline-none focus:ring-2
            appearance-none cursor-pointer
            ${errorBorder}
            ${disabledBg}
            ${transitionClass}
            ${className}
          `}
          {...props}
        >
          {children ? children : options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom arrow indicator */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 shrink-0">
          <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <span
          id={`${selectId}-error`}
          className="text-xs font-semibold text-red-500 mt-1.5 flex items-center gap-1 font-sans animate-fadeIn"
        >
          ⚠️ {error}
        </span>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <span id={`${selectId}-helper`} className={`${TYPOGRAPHY.caption} mt-1.5`}>
          {helperText}
        </span>
      )}
    </div>
  );
}
