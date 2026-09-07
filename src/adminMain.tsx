import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminApp } from './AdminApp.tsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ComponentErrorBoundary } from './components/ComponentErrorBoundary.tsx';

createRoot(document.getElementById('admin-root')!).render(
  <StrictMode>
    <ComponentErrorBoundary moduleName="Console Administration">
      <LanguageProvider>
        <ThemeProvider>
          <AdminApp />
        </ThemeProvider>
      </LanguageProvider>
    </ComponentErrorBoundary>
  </StrictMode>,
);
