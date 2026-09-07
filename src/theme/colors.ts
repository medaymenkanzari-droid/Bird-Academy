/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COLORS = {
  primary: '#2563EB',       // Primary Light (Blue 600)
  primaryDark: '#3B82F6',   // Primary Dark (Blue 500)
  secondary: '#10B981',     // Success/Nature (Emerald 500)
  secondaryDark: '#34D399', // Success Dark (Emerald 400)
  accent: '#6366F1',        // Alert/Info Accent (Indigo 500)
  accentDark: '#818CF8',    // Alert/Info Dark (Indigo 400)
  info: '#6366F1',          // Info Light
  infoDark: '#818CF8',      // Info Dark
  background: '#F8FAFC',    // Light canvas (Slate 50)
  backgroundDark: '#030712',// Dark canvas (Slate 950)
  surfaceLow: '#FFFFFF',    // Light surface card
  surfaceLowDark: '#0F172A',// Dark surface card (Slate 900)
  surfaceHigh: '#F1F5F9',   // Light surface high (Slate 100)
  surfaceHighDark: '#1E293B',// Dark surface high (Slate 800)
  border: '#E2E8F0',        // Light border (Slate 200)
  borderDark: '#334155',    // Dark border (Slate 700)
  textPrimary: '#0F172A',   // Light text primary (Slate 900)
  textPrimaryDark: '#F8FAFC',// Dark text primary (Slate 50)
  textSecondary: '#475569', // Light text secondary (Slate 600)
  textSecondaryDark: '#CBD5E1',// Dark text secondary (Slate 300 - WCAG AA)
  textMuted: '#64748B',     // Light muted (Slate 500)
  textMutedDark: '#94A3B8', // Dark muted (Slate 400 - WCAG AA)
  disabled: '#94A3B8',      // Light disabled
  disabledDark: '#475569',  // Dark disabled
  success: '#10B981',       // Emerald 500
  warning: '#F59E0B',       // Amber 500
  danger: '#EF4444',        // Crimson Red
};

// Semantic Tailwind mappings for safety and styling elegance
export const SEMANTIC_COLORS = {
  primary: {
    bg: 'bg-blue-600 dark:bg-blue-500',
    text: 'text-blue-600 dark:text-blue-400',
    hover: 'hover:bg-blue-700 focus:ring-blue-500/50 dark:hover:bg-blue-600 dark:focus:ring-blue-400/50',
    border: 'border-blue-600 dark:border-blue-500',
    lightBg: 'bg-blue-500/10 dark:bg-blue-500/20',
    lightText: 'text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60'
  },
  secondary: {
    bg: 'bg-slate-700 dark:bg-slate-600',
    text: 'text-slate-700 dark:text-slate-300',
    hover: 'hover:bg-slate-800 focus:ring-slate-500/50 dark:hover:bg-slate-500 dark:focus:ring-slate-400/50',
    border: 'border-slate-300 dark:border-slate-700',
    lightBg: 'bg-slate-100 dark:bg-slate-800/60',
    lightText: 'text-slate-700 dark:text-slate-300',
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700'
  },
  accent: {
    bg: 'bg-indigo-600 dark:bg-indigo-500',
    text: 'text-indigo-600 dark:text-indigo-400',
    hover: 'hover:bg-indigo-700 focus:ring-indigo-500/50 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400/50',
    border: 'border-indigo-600 dark:border-indigo-500',
    lightBg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    lightText: 'text-indigo-700 dark:text-indigo-300',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/60'
  },
  success: {
    bg: 'bg-emerald-600 dark:bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-400',
    hover: 'hover:bg-emerald-700 focus:ring-emerald-500/30 dark:hover:bg-emerald-600 dark:focus:ring-emerald-400/30',
    border: 'border-emerald-600 dark:border-emerald-500',
    lightBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    lightText: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60'
  },
  warning: {
    bg: 'bg-amber-500 dark:bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
    hover: 'hover:bg-amber-600 focus:ring-amber-500/30 dark:hover:bg-amber-500 dark:focus:ring-amber-400/30',
    border: 'border-amber-500 dark:border-amber-400',
    lightBg: 'bg-amber-500/10 dark:bg-amber-500/20',
    lightText: 'text-amber-800 dark:text-amber-300',
    badge: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60'
  },
  danger: {
    bg: 'bg-red-600 dark:bg-red-500',
    text: 'text-red-600 dark:text-red-400',
    hover: 'hover:bg-red-700 focus:ring-red-500/30 dark:hover:bg-red-600 dark:focus:ring-red-400/30',
    border: 'border-red-600 dark:border-red-500',
    lightBg: 'bg-red-500/10 dark:bg-red-500/20',
    lightText: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60'
  },
  outline: {
    bg: 'bg-transparent',
    text: 'text-slate-800 dark:text-slate-100',
    hover: 'hover:bg-slate-100 focus:ring-blue-500/20 dark:hover:bg-slate-800 dark:focus:ring-blue-400/20',
    border: 'border-slate-300 dark:border-slate-700',
    badge: 'bg-slate-100/80 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700'
  },
  text: {
    bg: 'bg-transparent',
    text: 'text-slate-600 dark:text-slate-400',
    hover: 'hover:bg-slate-100 hover:text-slate-900 focus:ring-blue-500/10 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus:ring-blue-400/10',
    border: 'border-transparent',
    badge: 'bg-transparent text-slate-600 border-transparent dark:text-slate-400'
  }
};

