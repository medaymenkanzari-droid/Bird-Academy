/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — FOOTER (AVIAN PRECISION)
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { WebRoute } from '../../types';
import { ShieldCheck, HardDrive, Lock, Heart } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { brandAssets } from '../../../../config/brandAssets';

export interface WebFooterProps {
  onNavigate: (route: WebRoute) => void;
}

export const WebFooter: React.FC<WebFooterProps> = ({ onNavigate }) => {
  const { t, isRtl } = useWebLanguage();

  return (
    <footer
      className="bg-slate-950 text-slate-300 border-t border-slate-800 transition-colors pt-16 pb-12 text-left"
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="web-footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={brandAssets.logoIcon}
                alt="Bird Academy"
                className="h-10 w-10 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white uppercase font-sans">
                  Bird Academy
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                  AVIAN PRECISION • BREEDING ERP
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footer.brandDesc')}
            </p>

            <div className="flex flex-wrap gap-2 pt-2 text-[11px] text-slate-400 font-medium">
              <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-amber-400" />
                Données Locales Souveraines
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Chiffrement Local AES-256
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Signatures ECDSA LMSE
              </span>
            </div>
          </div>

          {/* Column 2: Editions */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              {t('footer.editionsTitle')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('product-free')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  Bird Academy Community
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('product-premium')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  Bird Academy Passion / Premium
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('product-pro')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  Bird Academy Enterprise / Pro
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  Bird Academy Lifetime
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  {t('nav.home')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('pricing')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  {t('nav.pricing')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('download')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  {t('nav.download')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('faq')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  {t('nav.faq')}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('support')}
                  className="hover:text-indigo-400 transition cursor-pointer text-left"
                >
                  {t('nav.support')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Language & Locale */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              {t('footer.langTitle')}
            </h4>
            <div className="space-y-3">
              <LanguageSelector variant="footer" />
              <p className="text-[11px] text-slate-500 leading-tight">
                Disponible en Français, Anglais, Arabe (RTL), Espagnol et Italien.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>© 2026 Bird Academy — Identité Avian Precision. Tous droits réservés.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Distribution v1.3.6 (En Phase de Test)
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
