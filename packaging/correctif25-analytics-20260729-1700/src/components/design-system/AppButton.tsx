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
  // Grab semantic styles
  const colors = SEMANTIC_COLORS[variant] || SEMANTIC_COLORS.primary;
  const sizeClass = BUTTON_SIZES[size];
  const radiusClass = BORDER_RADIUS.lg; // Uniform radius
  const animationClass = `${ANIMATIONS.fade} ${ANIMATIONS.tap}`;

  // Base layout classes (ensures same height across variants, same font, etc.)
  const baseClasses = 'inline-flex items-center justify-center font-sans font-semibold text-xs transition-all cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-95';

  // Apply colors depending on variant
  let colorClasses = '';
  if (variant === 'primary' || variant === 'success' || variant === 'danger') {
    colorClasses = `${colors.bg} text-white ${colors.hover}`;
  } else if (variant === 'secondary') {
    colorClasses = `${colors.bg} text-emerald-800 hover:bg-emerald-400 focus:ring-emerald-300/50`;
  } else if (variant === 'outline') {
    colorClasses = 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-500/20';
  } else {
    // text
    colorClasses = 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800 focus:ring-slate-500/10';
  }

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${sizeClass} ${radiusClass} ${animationClass} ${colorClasses} ${widthClass} ${className}`}
      {...props}
    >
      {startIcon && <span className="mr-1.5 shrink-0 flex items-center">{startIcon}</span>}
      <span>{children}</span>
      {endIcon && <span className="ml-1.5 shrink-0 flex items-center">{endIcon}</span>}
    </button>
  );
}
