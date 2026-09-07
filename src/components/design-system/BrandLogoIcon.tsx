import React from 'react';

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
      src="/assets/images/logo-icon.png"
      alt="Bird Academy"
      className={`${className} object-contain rounded-md select-none`}
      id="bird-academy-vector-symbol"
    />
  );
};

