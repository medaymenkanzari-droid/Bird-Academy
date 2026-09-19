/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMMERCIAL WEBSITE PLATFORM 01
 * Unified router, shell, header, and page orchestrator.
 */

import React, { useState, useEffect } from 'react';
import { WebLocale, WebRoute } from './types';
import { WebLanguageProvider, useWebLanguage } from './i18n';
import { WebHeader } from './components/layout/WebHeader';
import { WebFooter } from './components/layout/WebFooter';
import { WebMobileBottomNav } from './components/layout/WebMobileBottomNav';
import { WebLandingPage } from './pages/WebLandingPage';
import { WebProductsPage } from './pages/WebProductsPage';
import { WebProductDetailPage } from './pages/WebProductDetailPage';
import { WebPricingPage } from './pages/WebPricingPage';
import { WebCheckoutPage } from './pages/WebCheckoutPage';
import { WebOrderConfirmationPage } from './pages/WebOrderConfirmationPage';
import { WebDownloadCenterPage } from './pages/WebDownloadCenterPage';
import { WebLicenseGuidePage } from './pages/WebLicenseGuidePage';
import { WebFAQPage } from './pages/WebFAQPage';
import { WebSupportPage } from './pages/WebSupportPage';
import { WebAccountPage } from './pages/WebAccountPage';
import { WebDocumentReaderPage } from './pages/WebDocumentReaderPage';

import { ComponentErrorBoundary } from '../../components/ComponentErrorBoundary';
import { AppLaunchService, ClientPlatform } from './services/AppLaunchService';
import { AppLaunchFallbackModal } from './components/dialogs/AppLaunchFallbackModal';

export interface CommercialWebsiteAppProps {
  initialRoute?: WebRoute;
  onOpenApp?: () => void;
}

const VALID_ROUTES: WebRoute[] = [
  'home',
  'products',
  'product-free',
  'product-premium',
  'product-pro',
  'pricing',
  'checkout',
  'order-confirmation',
  'orders',
  'download',
  'download-doc',
  'license',
  'faq',
  'support',
  'account',
];

interface ResolvedRoute {
  route: WebRoute;
  param?: string;
}

const normalizeRoute = (raw: string | undefined): ResolvedRoute => {
  if (!raw) return { route: 'home' };
  const clean = raw.replace(/^#+/, '').replace(/^\/+/, '').split('?')[0].split('&')[0];
  
  if (clean.startsWith('download/kit/') || clean.startsWith('kit/')) {
    const docId = clean.replace(/^download\/kit\//, '').replace(/^kit\//, '');
    return { route: 'download-doc', param: docId };
  }

  if (VALID_ROUTES.includes(clean as WebRoute)) {
    return { route: clean as WebRoute };
  }
  return { route: 'home' };
};

const CommercialWebsiteContent: React.FC<CommercialWebsiteAppProps> = ({
  initialRoute = 'home',
  onOpenApp,
}) => {
  const { t, locale, isRtl } = useWebLanguage();
  const [currentRoute, setCurrentRoute] = useState<WebRoute>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash !== '#') {
        const parsed = normalizeRoute(hash);
        if (parsed.route !== 'home' || hash === '#home' || hash === '#/home') {
          return parsed.route;
        }
      }
      const path = window.location.pathname;
      if (path.startsWith('/download/kit/')) return 'download-doc';
      if (path === '/products') return 'products';
      if (path === '/products/free') return 'product-free';
      if (path === '/products/premium') return 'product-premium';
      if (path === '/products/pro') return 'product-pro';
      if (path === '/pricing') return 'pricing';
      if (path === '/checkout') return 'checkout';
      if (path === '/order-confirmation' || path === '/orders') return 'order-confirmation';
      if (path === '/download') return 'download';
      if (path === '/license') return 'license';
      if (path === '/faq') return 'faq';
      if (path === '/support') return 'support';
      if (path === '/account') return 'account';
    }
    return normalizeRoute(initialRoute).route;
  });

  const [routeParam, setRouteParam] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash !== '#') {
        const parsed = normalizeRoute(hash);
        if (parsed.param) return parsed.param;
      }
      const path = window.location.pathname;
      if (path.startsWith('/download/kit/')) {
        return path.replace('/download/kit/', '');
      }
    }
    return undefined;
  });

  const [isLaunchingApp, setIsLaunchingApp] = useState(false);
  const [fallbackModalOpen, setFallbackModalOpen] = useState(false);
  const [fallbackPlatform, setFallbackPlatform] = useState<ClientPlatform>('windows');
  const [fallbackDownloadUrl, setFallbackDownloadUrl] = useState('');
  const [fallbackFilename, setFallbackFilename] = useState('');

  const handleOpenApp = () => {
    if (onOpenApp) {
      onOpenApp();
      return;
    }

    if (isLaunchingApp) return;
    setIsLaunchingApp(true);

    AppLaunchService.getInstance().launchNativeApp({
      onStatusChange: (status) => {
        if (status === 'idle' || status === 'launched') {
          setIsLaunchingApp(false);
        }
      },
      onFallback: (platform, downloadUrl, filename) => {
        setIsLaunchingApp(false);
        setFallbackPlatform(platform);
        setFallbackDownloadUrl(downloadUrl);
        setFallbackFilename(filename);
        setFallbackModalOpen(true);
      },
      onSuccess: () => {
        setIsLaunchingApp(false);
      }
    });
  };

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash;
      if (rawHash) {
        const resolved = normalizeRoute(rawHash);
        setCurrentRoute(resolved.route);
        if (resolved.param) {
          setRouteParam(resolved.param);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update SEO Document Title
  useEffect(() => {
    const titles: Record<WebRoute, string> = {
      home: 'Bird Academy Enterprise — Logiciel Professionnel d\'Élevage 100% Hors-Ligne',
      products: 'Éditions & Produits — Bird Academy Enterprise',
      'product-free': 'Édition Community (Free) — Bird Academy Enterprise',
      'product-premium': 'Édition Passion (Premium) — Bird Academy Enterprise',
      'product-pro': 'Édition Enterprise (Pro) — Bird Academy Enterprise',
      pricing: 'Tarifs & Comparateur des Éditions — Bird Academy Enterprise',
      checkout: 'Commander une Licence Commerciale — Bird Academy Enterprise',
      'order-confirmation': 'Suivi de Commande & Livraison — Bird Academy Enterprise',
      orders: 'Mes Commandes — Bird Academy Enterprise',
      download: 'Centre de Téléchargement Multiplateforme — Bird Academy Enterprise',
      'download-doc': 'Lecteur de Document de Recette — Bird Academy Enterprise',
      license: 'Guide d\'Activation & Licences LMSE — Bird Academy Enterprise',
      faq: 'Foire Aux Questions (FAQ) — Bird Academy Enterprise',
      support: 'Support & Assistance Client — Bird Academy Enterprise',
      account: 'Mon Espace Commercial — Bird Academy Enterprise',
    };

    if (typeof document !== 'undefined') {
      document.title = titles[currentRoute] || titles.home;
    }
  }, [currentRoute]);

  const handleNavigate = (route: WebRoute, param?: string) => {
    if (route === 'download-doc' && param) {
      setCurrentRoute('download-doc');
      setRouteParam(param);
      if (typeof window !== 'undefined') {
        window.location.hash = `download/kit/${param}`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const clean = normalizeRoute(route);
    setCurrentRoute(clean.route);
    setRouteParam(param || clean.param);
    if (typeof window !== 'undefined') {
      window.location.hash = clean.route;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors"
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="commercial-website-app"
    >
      {/* Top Header */}
      <WebHeader
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onOpenApp={handleOpenApp}
        isLaunchingApp={isLaunchingApp}
      />

      {/* Main Content Area Protected by ErrorBoundary */}
      <main className="flex-1 pb-16 md:pb-0">
        <ComponentErrorBoundary moduleName={`Site Commercial (${currentRoute})`}>
          {currentRoute === 'home' && <WebLandingPage onNavigate={handleNavigate} />}
          {currentRoute === 'products' && <WebProductsPage onNavigate={handleNavigate} />}
          {currentRoute === 'product-free' && (
            <WebProductDetailPage tier="FREE" onNavigate={handleNavigate} />
          )}
          {currentRoute === 'product-premium' && (
            <WebProductDetailPage tier="PREMIUM" onNavigate={handleNavigate} />
          )}
          {currentRoute === 'product-pro' && (
            <WebProductDetailPage tier="PRO" onNavigate={handleNavigate} />
          )}
          {currentRoute === 'pricing' && <WebPricingPage onNavigate={handleNavigate} />}
          {currentRoute === 'checkout' && (
            <WebCheckoutPage initialOfferId={routeParam} onNavigate={handleNavigate} />
          )}
          {(currentRoute === 'order-confirmation' || currentRoute === 'orders') && (
            <WebOrderConfirmationPage orderId={routeParam} onNavigate={handleNavigate} />
          )}
          {currentRoute === 'download' && <WebDownloadCenterPage onNavigate={handleNavigate} />}
          {currentRoute === 'download-doc' && (
            <WebDocumentReaderPage docId={routeParam} onNavigate={handleNavigate} />
          )}
          {currentRoute === 'license' && <WebLicenseGuidePage onNavigate={handleNavigate} />}
          {currentRoute === 'faq' && <WebFAQPage />}
          {currentRoute === 'support' && <WebSupportPage />}
          {currentRoute === 'account' && <WebAccountPage onNavigate={handleNavigate} />}
        </ComponentErrorBoundary>
      </main>

      {/* Footer */}
      <WebFooter onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation Bar (Fixed 4 Tabs) */}
      <WebMobileBottomNav currentRoute={currentRoute} onNavigate={handleNavigate} />

      {/* App Launch Graceful Fallback Modal */}
      <AppLaunchFallbackModal
        isOpen={fallbackModalOpen}
        platform={fallbackPlatform}
        downloadUrl={fallbackDownloadUrl}
        filename={fallbackFilename}
        onClose={() => setFallbackModalOpen(false)}
        onContinueWeb={() => {
          setFallbackModalOpen(false);
          if (typeof window !== 'undefined') {
            window.location.search = '?view=app';
          }
        }}
        onNavigateToDownloads={() => {
          setFallbackModalOpen(false);
          handleNavigate('download');
        }}
      />
    </div>
  );
};

import { WebCurrencyProvider } from './context/CommercialCurrencyContext';

export const CommercialWebsiteApp: React.FC<CommercialWebsiteAppProps> = (props) => {
  return (
    <WebLanguageProvider>
      <WebCurrencyProvider>
        <CommercialWebsiteContent {...props} />
      </WebCurrencyProvider>
    </WebLanguageProvider>
  );
};

export default CommercialWebsiteApp;
