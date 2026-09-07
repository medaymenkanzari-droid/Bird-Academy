/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ADMIN — APPLICATION D'ADMINISTRATION ENTERPRISE
 * Application web/bureau privée autonome réservée uniquement aux administrateurs.
 */

import React, { useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { AdminCenterView } from './features/administration/components/AdminCenterView';
import { ShieldCheck, Lock, LogOut, UserCheck } from 'lucide-react';
import { AppLogo, AppIcon } from './components/design-system';
import { LmseConfigService } from './config/lmseConfig';
import type { AdminSession } from './server/middleware/adminAuth';
import { ComponentErrorBoundary } from './components/ComponentErrorBoundary';

export const AdminApp: React.FC = () => {
  const { isRtl } = useLanguage();
  const [session, setSession] = useState<AdminSession | null>(() => {
    const saved = localStorage.getItem('lmse_admin_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          return parsed;
        }
      } catch (e) {
        // Fallback
      }
    }
    return null;
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Veuillez saisir votre adresse email et votre mot de passe administrateur.');
      return;
    }

    setIsSubmitting(true);

    try {
      let baseUrl = '';
      try {
        baseUrl = LmseConfigService.getLmseApiUrl();
      } catch (configErr) {
        baseUrl = typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.startsWith('file://')
          ? window.location.origin
          : 'http://localhost:3001';
      }
      const url = `${baseUrl}/api/admin/auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const text = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text };
      }

      if (response.ok && data.success && data.session) {
        setSession(data.session);
        localStorage.setItem('lmse_admin_session', JSON.stringify(data.session));
      } else {
        setError(data.message || data.error || 'Identifiants administrateur invalides.');
      }
    } catch (err: any) {
      setError(`Erreur de connexion au serveur d'administration (${err.message}). Assurez-vous que le serveur est démarré.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('lmse_admin_session');
  };

  if (!session) {
    return (
      <div className={`min-h-screen bg-slate-950 flex items-center justify-center p-4 ${isRtl ? 'rtl' : 'ltr'}`}>
        <div className="max-w-md w-full bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl">
          <div className="flex flex-col items-center justify-center text-center gap-2 mb-6">
            <AppLogo size="lg" variant="dark" sublineText="ADMINISTRATION ENTERPRISE" />
            <p className="text-xs text-slate-400 font-medium">Console d'Administration & LMSE</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs sm:text-sm leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Administrateur
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@birdacademy.tn"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mot de Passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Lock className="w-4 h-4" />
              {isSubmitting ? 'Vérification...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium">
              Accès strictement réservé aux administrateurs autorisés.
            </p>
            <p className="text-[11px] text-slate-400">
              Premier lancement ? Exécutez <code className="text-blue-400 font-mono">npm run admin:bootstrap</code> dans votre terminal.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 ${isRtl ? 'rtl' : 'ltr'}`}>
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <AppLogo size="sm" variant="dark" sublineText="ADMIN CENTER" />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 rounded-xl text-xs text-slate-200 border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">{session.name}</span>
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[10px] uppercase font-mono font-bold">
              {session.role}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs transition border border-red-500/20 cursor-pointer font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
        <ComponentErrorBoundary moduleName="Bird Academy Admin Center">
          <AdminCenterView />
        </ComponentErrorBoundary>
      </main>
    </div>
  );
};

export default AdminApp;
