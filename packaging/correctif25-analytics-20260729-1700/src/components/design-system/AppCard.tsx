/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { HTMLAttributes, ReactNode } from 'react';
import { BORDER_RADIUS, SHADOWS, ANIMATIONS } from '../../theme';

export interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  title?: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  footer?: ReactNode;
  borderColor?: string;
  className?: string;
  key?: any;
  onClick?: any;
}

export function AppCard({
  children,
  hoverable = false,
  padding = 'lg',
  title,
  subtitle,
  extra,
  footer,
  className = '',
  borderColor = 'border-slate-100',
  ...props
}: AppCardProps) {
  const radiusClass = BORDER_RADIUS.xl; // Uniform corner rounding
  const shadowClass = SHADOWS.md; // Uniform shadows
  const hoverClass = hoverable ? `${ANIMATIONS.scaleHover} cursor-pointer` : '';

  // Spacing mappings
  const padMap = {
    none: 'p-0',
    sm: 'p-3', // 12px
    md: 'p-4', // 16px
    lg: 'p-5 sm:p-6', // 20px-24px
    xl: 'p-6 sm:p-8', // 24px-32px
  };

  const spacingClass = padMap[padding];

  return (
    <div
      className={`bg-white border ${borderColor} overflow-hidden ${radiusClass} ${shadowClass} ${hoverClass} ${className}`}
      {...props}
    >
      {/* Optional Card Header */}
      {(title || subtitle || extra) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="font-sans font-bold text-sm sm:text-base text-slate-800 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-sans text-xs text-slate-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {extra && <div className="shrink-0">{extra}</div>}
        </div>
      )}

      {/* Main content body */}
      <div className={spacingClass}>
        {children}
      </div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
          {footer}
        </div>
      )}
    </div>
  );
}
