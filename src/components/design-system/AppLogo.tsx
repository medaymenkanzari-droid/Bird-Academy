/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light' | 'mono-dark' | 'mono-light';
  showSubline?: boolean;
  sublineText?: string;
  onClick?: () => void;
}

/**
 * Bird Academy Official Brand Header / Logo Lockup
 * Renders the new modern blue & gold shield icon (/assets/images/logo-icon.png)
 * alongside the bold typography & subline.
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'dark',
  showSubline = true,
  sublineText = 'AVIAN ERP',
  onClick
}) => {
  const isLight = variant === 'light' || variant === 'mono-light';

  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14'
  };

  const titleSizes = {
    sm: 'text-sm font-black',
    md: 'text-base font-black',
    lg: 'text-lg font-black',
    xl: 'text-xl font-black'
  };

  const sublineSizes = {
    sm: 'text-[8px] tracking-wider',
    md: 'text-[9px] tracking-widest',
    lg: 'text-[10px] tracking-widest',
    xl: 'text-xs tracking-widest'
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
      role="banner"
      aria-label="Bird Academy Avian ERP"
    >
      <img
        src="/assets/images/logo-icon.png"
        alt="Bird Academy"
        className={`${iconDimensions[size]} object-contain inline-block shrink-0`}
      />

      <div className="flex flex-col justify-center leading-tight">
        <span
          className={`tracking-tight font-black uppercase font-sans ${titleSizes[size]} ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Bird Academy
        </span>

        {showSubline && (
          <span
            className={`font-mono font-bold uppercase ${sublineSizes[size]} ${
              isLight ? 'text-[#3F51B5]' : 'text-amber-400'
            }`}
          >
            {sublineText}
          </span>
        )}
      </div>
    </div>
  );
};

export default AppLogo;
