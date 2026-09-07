import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { LicenseProvider } from './features/licensing/context/LicenseContext.tsx';
import { SubscriptionProvider } from './features/subscription/context/SubscriptionContext.tsx';
import { LicenseBootGuard } from './features/licensing/components/LicenseBootGuard.tsx';
import { BUILD_ID } from './config/appMode.ts';

console.log(`[BOOT-01] main.tsx mounted: BUILD_ID=${BUILD_ID} | time=${new Date().toISOString()}`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <ThemeProvider>
        <LicenseProvider>
          <SubscriptionProvider>
            <LicenseBootGuard>
              <App />
            </LicenseBootGuard>
          </SubscriptionProvider>
        </LicenseProvider>
      </ThemeProvider>
    </LanguageProvider>
  </StrictMode>,
);

