import { Bird, Feather } from 'lucide-react';
import React from 'react';

export interface SpeciesThemeConfig {
  id: string;
  colors: {
    bg: string;
    text: string;
    border: string;
    icon: string;
  };
  icon: React.ElementType;
  emoji: string;
}

export const SPECIES_THEMES: Record<string, SpeciesThemeConfig> = {
  canari: {
    id: 'canari',
    colors: {
      bg: 'bg-amber-100 dark:bg-amber-900/40',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/50',
      icon: 'text-amber-600 dark:text-amber-400',
    },
    icon: Bird,
    emoji: '🐤'
  },
  perruche_ondulee: {
    id: 'perruche_ondulee',
    colors: {
      bg: 'bg-blue-100 dark:bg-blue-900/40',
      text: 'text-blue-800 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800/50',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    icon: Bird,
    emoji: '🐦'
  },
  agapornis: {
    id: 'agapornis',
    colors: {
      bg: 'bg-emerald-100 dark:bg-emerald-900/40',
      text: 'text-emerald-800 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      icon: 'text-emerald-600 dark:text-emerald-400',
    },
    icon: Bird,
    emoji: '🦜'
  },
  chardonneret_elegant: {
    id: 'chardonneret_elegant',
    colors: {
      bg: 'bg-purple-100 dark:bg-purple-900/40',
      text: 'text-purple-800 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800/50',
      icon: 'text-purple-600 dark:text-purple-400',
    },
    icon: Feather,
    emoji: '🪶'
  },
  diamant_mandarin: {
    id: 'diamant_mandarin',
    colors: {
      bg: 'bg-orange-100 dark:bg-orange-900/40',
      text: 'text-orange-800 dark:text-orange-300',
      border: 'border-orange-200 dark:border-orange-800/50',
      icon: 'text-orange-600 dark:text-orange-400',
    },
    icon: Bird,
    emoji: '🏵️'
  },
  diamant_gould: {
    id: 'diamant_gould',
    colors: {
      bg: 'bg-rose-100 dark:bg-rose-900/40',
      text: 'text-rose-800 dark:text-rose-300',
      border: 'border-rose-200 dark:border-rose-800/50',
      icon: 'text-rose-600 dark:text-rose-400',
    },
    icon: Bird,
    emoji: '🌸'
  },
  calopsitte: {
    id: 'calopsitte',
    colors: {
      bg: 'bg-teal-100 dark:bg-teal-900/40',
      text: 'text-teal-800 dark:text-teal-300',
      border: 'border-teal-200 dark:border-teal-800/50',
      icon: 'text-teal-600 dark:text-teal-400',
    },
    icon: Bird,
    emoji: '🦚'
  },
  colombe: {
    id: 'colombe',
    colors: {
      bg: 'bg-stone-100 dark:bg-stone-900/40',
      text: 'text-stone-800 dark:text-stone-300',
      border: 'border-stone-200 dark:border-stone-800/50',
      icon: 'text-stone-600 dark:text-stone-400',
    },
    icon: Bird,
    emoji: '🕊️'
  },
  fallback: {
    id: 'fallback',
    colors: {
      bg: 'bg-slate-100 dark:bg-slate-900/40',
      text: 'text-slate-800 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-800/50',
      icon: 'text-slate-600 dark:text-slate-400',
    },
    icon: Bird,
    emoji: '🦅'
  }
};

export const getSpeciesTheme = (speciesId?: string): SpeciesThemeConfig => {
  if (!speciesId) return SPECIES_THEMES.fallback;
  return SPECIES_THEMES[speciesId] || SPECIES_THEMES.fallback;
};
