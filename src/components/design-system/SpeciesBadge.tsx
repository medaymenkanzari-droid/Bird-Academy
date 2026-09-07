import React from 'react';
import { getSpeciesTheme } from '../../theme/SpeciesTheme';
import { getSpeciesById } from '../../data/speciesRegistry';
import { useLanguage } from '../../context/LanguageContext';

export interface SpeciesBadgeProps {
  speciesId?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}

export function SpeciesBadge({
  speciesId,
  size = 'md',
  className = '',
  showIcon = true,
  showLabel = true
}: SpeciesBadgeProps) {
  const { t } = useLanguage();
  const theme = getSpeciesTheme(speciesId);
  const speciesInfo = speciesId ? getSpeciesById(speciesId) : null;
  const label = speciesInfo ? t(speciesInfo.nameKey) : t('undetermined');

  let sizeClasses = '';
  if (size === 'sm') {
    sizeClasses = 'text-[10px] px-2 py-0.5 gap-1 font-bold';
  } else if (size === 'lg') {
    sizeClasses = 'text-xs px-3 py-1.5 gap-2 font-bold';
  } else {
    sizeClasses = 'text-[11px] px-2.5 py-1 gap-1.5 font-semibold';
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full border shrink-0
        ${theme.colors.bg} ${theme.colors.text} ${theme.colors.border}
        ${sizeClasses} ${className}
      `}
      title={label}
    >
      {showIcon && <span className="flex-shrink-0" aria-hidden="true">{theme.emoji}</span>}
      {showLabel && <span className="truncate max-w-[120px]">{label}</span>}
    </span>
  );
}
