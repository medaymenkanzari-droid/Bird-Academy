/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { SEMANTIC_COLORS, BUTTON_SIZES, BORDER_RADIUS, ANIMATIONS } from '../../theme';

export interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'text';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
  [key: string]: any;
}

export function AppButton({
  children,
  variant = 'primary',
  size = 'md',
  startIcon,
  endIcon,
  fullWidth = false,
  className = '',
  disabled,
  type = 'button',
  ...props
}: AppButtonProps) {
  const colors = SEMANTIC_COLORS[variant] || SEMANTIC_COLORS.primary;
  const sizeClass = BUTTON_SIZES[size];
  const radiusClass = BORDER_RADIUS.lg; // rounded-xl (~12px)
  const animationClass = `${ANIMATIONS.fade} ${ANIMATIONS.tap}`;

  // Base layout classes (ensures min 44px on touch, font, etc.)
  const baseClasses = 'inline-flex items-center justify-center font-sans font-semibold text-xs sm:text-sm min-h-[44px] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-98 shadow-2xs';

  let colorClasses = '';
  if (variant === 'primary') {
    colorClasses = 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500 shadow-blue-500/20';
  } else if (variant === 'success') {
    colorClasses = 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500';
  } else if (variant === 'danger') {
    colorClasses = 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-500';
  } else if (variant === 'secondary') {
    colorClasses = 'bg-slate-800 hover:bg-slate-700 text-white dark:bg-slate-700 dark:hover:bg-slate-600';
  } else if (variant === 'outline') {
    colorClasses = 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600';
  } else {
    // text
    colorClasses = 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white shadow-none';
  }

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${sizeClass} ${radiusClass} ${animationClass} ${colorClasses} ${widthClass} ${className}`}
      {...props}
    >
      {startIcon && <span className="mr-2 shrink-0 flex items-center">{startIcon}</span>}
      <span>{children}</span>
      {endIcon && <span className="ml-2 shrink-0 flex items-center">{endIcon}</span>}
    </button>
  );
}

export default AppButton;
