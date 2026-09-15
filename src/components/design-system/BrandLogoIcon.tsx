import React from 'react';
import { brandAssets } from '../../config/brandAssets';

export const BrandLogoIcon: React.FC<{ 
  className?: string; 
  colorTheme?: 'dark' | 'light' | 'mono-dark' | 'mono-light' | 'custom';
  showConstruction?: boolean;
  customColorNodeA?: string;
  customColorNodeB?: string;
}> = ({ 
  className = "w-12 h-12"
}) => {
  return (
    <img
      src={brandAssets.logoIcon}
      alt="Bird Academy"
      className={`${className} object-contain rounded-md select-none`}
      id="bird-academy-vector-symbol"
    />
  );
};

