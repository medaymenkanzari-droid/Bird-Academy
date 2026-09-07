/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface AppIconProps {
  className?: string;
  size?: number | string;
  variant?: 'default' | 'glow' | 'mono-dark' | 'mono-light' | 'emerald' | 'amber';
  id?: string;
}

/**
 * Bird Academy Official Brand Emblem
 * Renders the new brand icon mark /assets/images/logo-icon.png
 */
export const AppIcon: React.FC<AppIconProps> = ({
  className = 'w-9 h-9',
  size,
  variant = 'default',
  id = 'bird-academy-app-icon'
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <img
      id={id}
      src="/assets/images/logo-icon.png"
      alt="Bird Academy"
      className={`${className} object-contain inline-block`}
      style={style}
      aria-label="Bird Academy Avian ERP Logo"
      onError={(e) => {
        // Fallback to SVG if needed
        if (e.currentTarget.src.includes('logo-icon.png')) {
          e.currentTarget.src = '/icon.svg';
        }
      }}
    />
  );
};

export default AppIcon;
