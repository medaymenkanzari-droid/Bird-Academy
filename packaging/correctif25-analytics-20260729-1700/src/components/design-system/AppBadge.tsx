/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { SEMANTIC_COLORS, BORDER_RADIUS } from '../../theme';

export interface AppBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' | 'text';
  size?: 'sm' | 'md';
  className?: string;
}

export function AppBadge({
  children,
  variant = 'outline',
  size = 'md',
  className = '',
}: AppBadgeProps) {
  const colors = SEMANTIC_COLORS[variant] || SEMANTIC_COLORS.outline;
  const radiusClass = BORDER_RADIUS.full;

  const sizeClass = size === 'sm'
    ? 'text-[10px] px-2 py-0.5 font-bold tracking-wide'
    : 'text-[11px] px-2.5 py-1 font-semibold';

  return (
    <span
      className={`
        inline-flex items-center justify-center font-sans border shrink-0
        ${colors.badge}
        ${sizeClass} ${radiusClass} ${className}
      `}
    >
      {children}
    </span>
  );
}
