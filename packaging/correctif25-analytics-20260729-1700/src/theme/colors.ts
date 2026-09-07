/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COLORS = {
  primary: '#4F46E5',      // Indigo
  secondary: '#8A96A8',    // Steel
  accent: '#1E2025',       // Graphite
  background: '#090A0C',   // Obsidian
  card: '#FFFFFF',         // White
  textPrimary: '#1E2025',  // Graphite
  textSecondary: '#8A96A8',// Steel
  success: '#10B981',      // Emerald Green
  warning: '#F59E0B',      // Amber Yellow
  danger: '#EF4444',       // Crimson Red
};

// Semantic Tailwind mappings for safety and styling elegance
export const SEMANTIC_COLORS = {
  primary: {
    bg: 'bg-indigo-600 dark:bg-indigo-700',
    text: 'text-indigo-600 dark:text-indigo-400',
    hover: 'hover:bg-indigo-700 focus:ring-indigo-500/50 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400/50',
    border: 'border-indigo-600 dark:border-indigo-700',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    lightText: 'text-indigo-800 dark:text-indigo-300',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
  },
  secondary: {
    bg: 'bg-slate-200 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    hover: 'hover:bg-slate-300 focus:ring-slate-300/50 dark:hover:bg-slate-700 dark:focus:ring-slate-700/50',
    border: 'border-slate-300 dark:border-slate-800',
    lightBg: 'bg-slate-50/50 dark:bg-slate-950/20',
    lightText: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800'
  },
  accent: {
    bg: 'bg-indigo-500 dark:bg-indigo-600',
    text: 'text-indigo-500 dark:text-indigo-400',
    hover: 'hover:bg-indigo-600 focus:ring-indigo-500/50 dark:hover:bg-indigo-550 dark:focus:ring-indigo-400/50',
    border: 'border-indigo-500 dark:border-indigo-600',
    lightBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    lightText: 'text-indigo-800 dark:text-indigo-300',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800'
  },
  success: {
    bg: 'bg-emerald-600 dark:bg-emerald-700',
    text: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:bg-emerald-700 focus:ring-emerald-500/30 dark:hover:bg-emerald-600 dark:focus:ring-emerald-400/30',
    border: 'border-emerald-600 dark:border-emerald-700',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    lightText: 'text-emerald-800 dark:text-emerald-300',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
  },
  warning: {
    bg: 'bg-amber-500 dark:bg-amber-600',
    text: 'text-amber-500 dark:text-amber-400',
    hover: 'hover:bg-amber-600 focus:ring-amber-500/30 dark:hover:bg-amber-500 dark:focus:ring-amber-400/30',
    border: 'border-amber-500 dark:border-amber-600',
    lightBg: 'bg-amber-50 dark:bg-amber-950/30',
    lightText: 'text-amber-800 dark:text-amber-300',
    badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800'
  },
  danger: {
    bg: 'bg-rose-500 dark:bg-rose-600',
    text: 'text-rose-500 dark:text-rose-400',
    hover: 'hover:bg-rose-600 focus:ring-rose-500/30 dark:hover:bg-rose-500 dark:focus:ring-rose-400/30',
    border: 'border-rose-500 dark:border-rose-600',
    lightBg: 'bg-rose-50 dark:bg-rose-950/30',
    lightText: 'text-rose-800 dark:text-rose-300',
    badge: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800'
  },
  outline: {
    bg: 'bg-transparent',
    text: 'text-slate-700 dark:text-slate-300',
    hover: 'hover:bg-slate-50 focus:ring-slate-500/20 dark:hover:bg-slate-800 dark:focus:ring-slate-700/20',
    border: 'border-slate-200 dark:border-slate-700',
    badge: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  },
  text: {
    bg: 'bg-transparent',
    text: 'text-slate-600 dark:text-slate-400',
    hover: 'hover:bg-slate-50 hover:text-slate-800 focus:ring-slate-500/10 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus:ring-slate-700/10',
    border: 'border-transparent',
    badge: 'bg-transparent text-slate-600 border-transparent dark:text-slate-400'
  }
};
