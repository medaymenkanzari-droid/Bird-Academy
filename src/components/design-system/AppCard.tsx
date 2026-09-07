/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { HTMLAttributes, ReactNode } from 'react';
import { BORDER_RADIUS, SHADOWS, ANIMATIONS } from '../../theme';

export interface AppCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
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
  borderColor = '',
  ...props
}: AppCardProps) {
  const radiusClass = BORDER_RADIUS.xl; // rounded-2xl (~16px)
  const hoverClass = hoverable ? `${ANIMATIONS.scaleHover} cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700` : '';

  // Spacing mappings
  const padMap = {
    none: 'p-0',
    sm: 'p-3 sm:p-4', // 12px-16px
    md: 'p-4 sm:p-5', // 16px-20px
    lg: 'p-5 sm:p-6', // 20px-24px
    xl: 'p-6 sm:p-8', // 24px-32px
  };

  const spacingClass = padMap[padding];

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden ${radiusClass} shadow-xs ${hoverClass} ${className}`}
      {...props}
    >
      {/* Optional Card Header */}
      {(title || subtitle || extra) && (
        <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="font-sans font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-sans text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
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
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
}

