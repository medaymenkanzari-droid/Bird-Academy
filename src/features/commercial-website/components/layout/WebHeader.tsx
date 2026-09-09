/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — HEADER & NAVIGATION (AVIAN PRECISION)
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWebLanguage } from '../../i18n';
import { WebRoute } from '../../types';
import { LanguageSelector } from './LanguageSelector';
import { CurrencySelector } from './CurrencySelector';
import { 
  Menu, X, ShieldCheck, Download, Sparkles, 
  HelpCircle, LifeBuoy, Key, User, ShoppingBag, ArrowRight, ArrowLeft, Bird, ExternalLink
} from 'lucide-react';

export interface WebHeaderProps {
  currentRoute: WebRoute;
  onNavigate: (route: WebRoute) => void;
  onOpenApp?: () => void;
}

export const WebHeader: React.FC<WebHeaderProps> = ({ currentRoute, onNavigate, onOpenApp }) => {
  const { t, isRtl } = useWebLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);
  const [headerHeight, setHeaderHeight] = useState(88);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, [mobileMenuOpen]);

  // Keyboard accessibility and focus trap for mobile drawer
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        mobileMenuBtnRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks: { id: WebRoute; labelKey: string }[] = [
    { id: 'home', labelKey: 'nav.home' },
    { id: 'products', labelKey: 'nav.products' },
    { id: 'pricing', labelKey: 'nav.pricing' },
    { id: 'download', labelKey: 'nav.download' },
    { id: 'license', labelKey: 'nav.license' },
    { id: 'faq', labelKey: 'nav.faq' },
    { id: 'support', labelKey: 'nav.support' },
  ];

  const handleLinkClick = (route: WebRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <header 
      ref={headerRef}
      className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="web-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[5.5rem] py-2 flex items-center justify-between gap-4">
        
        {/* Brand Logo with Official Full Image Asset */}
        <button
          type="button"
          onClick={() => handleLinkClick('home')}
          className="flex items-center cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3F51B5] rounded-xl group transition-transform hover:opacity-95 py-1 bg-transparent border-0"
          data-testid="header-brand-logo"
          aria-label="Bird Academy Home"
        >
          <img
            src="/assets/images/logo-full.png"
            alt="Bird Academy"
            className="h-12 md:h-14 w-auto object-contain block dark:hidden"
          />
          <img
            src="/assets/images/logo-full-dark.png"
            alt="Bird Academy"
            className="h-12 md:h-14 w-auto object-contain hidden dark:block"
          />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.id || (link.id === 'products' && currentRoute.startsWith('product-'));
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link.id)}
                className={`px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f0f3fa] dark:bg-indigo-950/40 text-[#2e3a8c] dark:text-indigo-400 font-extrabold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                data-testid={`nav-link-${link.id}`}
              >
                {t(link.labelKey)}
              </button>
            );
          })}
        </nav>

        {/* Action Controls (Language, Currency, CTA) */}
        <div className="hidden sm:flex items-center gap-2.5">
          <LanguageSelector variant="header" />
          <CurrencySelector />

          <button
            type="button"
            onClick={() => handleLinkClick('account')}
            className={`p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer ${
              currentRoute === 'account' ? 'bg-[#f0f3fa] dark:bg-indigo-950/40 text-[#2e3a8c]' : ''
            }`}
            title={t('nav.account')}
            data-testid="nav-link-account"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Direct link to User Application */}
          {onOpenApp && (
            <button
              type="button"
              onClick={onOpenApp}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              title="Accéder à l'application d'élevage"
              data-testid="header-btn-open-app"
            >
              <Bird className="w-4 h-4" />
              <span>Ouvrir l'App</span>
            </button>
          )}

          {/* Indigo CTA Button */}
          <button
            type="button"
            onClick={() => handleLinkClick('pricing')}
            className="px-5 py-2.5 bg-[#2e3a8c] hover:bg-[#1e265c] text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-950/20 transition flex items-center gap-2 cursor-pointer"
            data-testid="header-btn-get-license"
          >
            <ShieldCheck className="w-4 h-4 text-[#ffc107]" />
            <span>{t('nav.ctaBuy')}</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSelector variant="header" />
          <button
            ref={mobileMenuBtnRef}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2e3a8c] cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileMenuOpen ? 'Fermer le menu de navigation' : 'Ouvrir le menu de navigation'}
            data-testid="mobile-menu-toggle-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900 dark:text-white" /> : <Menu className="w-6 h-6 text-slate-900 dark:text-white" />}
          </button>
        </div>

      </div>

      {/* Accessible Mobile Nav Drawer rendered via Portal to avoid backdrop-blur containment */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <aside 
          id="mobile-nav-drawer"
          ref={mobileDrawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation principale mobile"
          style={{ top: `${headerHeight}px` }}
          className="lg:hidden fixed inset-x-0 bottom-0 bg-white/98 dark:bg-slate-900/98 z-[9999] p-6 flex flex-col justify-between overflow-y-auto border-t border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300"
          dir={isRtl ? 'rtl' : 'ltr'}
          data-testid="mobile-nav-drawer"
        >
          <div className="space-y-4">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = currentRoute === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleLinkClick(link.id)}
                    className={`w-full py-3.5 px-4 rounded-xl text-start font-bold text-sm transition flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#f0f3fa] dark:bg-indigo-950/40 text-[#2e3a8c] dark:text-indigo-400 font-extrabold'
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    data-testid={`mobile-nav-link-${link.id}`}
                  >
                    <span>{t(link.labelKey)}</span>
                    <ArrowIcon className="w-4 h-4 opacity-50" />
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <CurrencySelector />
              {onOpenApp && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenApp();
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  data-testid="mobile-drawer-btn-open-app"
                >
                  <Bird className="w-4 h-4" />
                  <span>Ouvrir l'App Élevage</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => handleLinkClick('pricing')}
                className="w-full py-4 bg-[#2e3a8c] hover:bg-[#1e265c] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                data-testid="mobile-drawer-btn-cta"
              >
                <ShieldCheck className="w-4 h-4 text-[#ffc107]" />
                <span>{t('nav.ctaBuy')}</span>
              </button>
            </div>
          </div>
        </aside>,
        document.body
      )}
    </header>
  );
};
