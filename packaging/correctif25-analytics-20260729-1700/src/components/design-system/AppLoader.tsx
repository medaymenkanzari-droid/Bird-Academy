/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface AppLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function AppLoader({
  size = 'md',
  label,
  className = '',
}: AppLoaderProps) {
  // Size classes
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const spinnerSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`
          ${spinnerSize} rounded-full border-slate-200 border-t-emerald-600
          animate-spin shrink-0
        `}
        role="status"
        aria-label="Chargement"
      />
      {label && (
        <span className="text-xs font-semibold text-slate-500 font-sans animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}
