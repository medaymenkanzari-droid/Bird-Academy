/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { brandAssets } from '../../config/brandAssets';

export interface AppIconProps {
  className?: string;
  size?: number | string;
  variant?: 'default' | 'glow' | 'mono-dark' | 'mono-light' | 'emerald' | 'amber';
  id?: string;
}

/**
 * Bird Academy Official Brand Emblem
 * Renders the official brand icon mark (brandAssets.logoIcon)
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
      src={brandAssets.logoIcon}
      alt="Bird Academy"
      className={`${className} object-contain inline-block`}
      style={style}
      aria-label="Bird Academy Avian ERP Logo"
      onError={(e) => {
        // Fallback to official brand SVG if PNG fails
        if (!e.currentTarget.src.includes('logo-icon.svg')) {
          e.currentTarget.src = brandAssets.logoIconSvg;
        }
      }}
    />
  );
};

export default AppIcon;
