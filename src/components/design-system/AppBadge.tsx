/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { SEMANTIC_COLORS, BORDER_RADIUS } from '../../theme';

export interface AppBadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
}

export function AppBadge({
  children,
  variant = 'outline',
  size = 'md',
  icon,
  className = '',
}: AppBadgeProps) {
  const colors = SEMANTIC_COLORS[variant] || SEMANTIC_COLORS.outline;
  const radiusClass = BORDER_RADIUS.full;

  const sizeClass = {
    sm: 'text-[10px] px-2 py-0.5 font-bold tracking-wide gap-1',
    md: 'text-[11px] px-2.5 py-1 font-semibold gap-1.5',
    lg: 'text-xs px-3 py-1.5 font-bold gap-1.5',
  }[size];

  return (
    <span
      className={`
        inline-flex items-center justify-center font-sans border shrink-0 transition-colors
        ${colors.badge}
        ${sizeClass} ${radiusClass} ${className}
      `}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

export default AppBadge;
