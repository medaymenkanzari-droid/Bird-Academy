/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BORDER_RADIUS } from '../../theme';

export interface AppAvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'male' | 'female' | 'neutral' | 'accent';
  className?: string;
}

export function AppAvatar({
  name,
  size = 'md',
  variant = 'primary',
  className = '',
}: AppAvatarProps) {
  const radiusClass = BORDER_RADIUS.full;

  // Sizes map
  const sizeMap = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-14 h-14 text-lg font-bold',
  };

  const sizeClass = sizeMap[size];

  // Get initials (up to 2 characters)
  const getInitials = (text: string) => {
    if (!text) return '—';
    const cleanText = text.trim();
    if (cleanText.includes(' ')) {
      const parts = cleanText.split(/\s+/);
      return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
    }
    // Check if it starts with "Bague"
    if (cleanText.toLowerCase().startsWith('bague') && cleanText.length > 6) {
      return cleanText.substring(5).trim().substring(0, 2).toUpperCase();
    }
    return cleanText.substring(0, 2).toUpperCase();
  };

  // Color variants
  const colorMap = {
    primary: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    male: 'bg-sky-50 text-sky-800 border-sky-200',
    female: 'bg-rose-50 text-rose-800 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    accent: 'bg-amber-50 text-amber-800 border-amber-200',
  };

  const colorClass = colorMap[variant];

  return (
    <div
      className={`
        inline-flex items-center justify-center border font-sans select-none shrink-0
        ${sizeClass} ${radiusClass} ${colorClass} ${className}
      `}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}
