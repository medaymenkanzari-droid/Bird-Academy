/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslation } from '../utils/adminTranslations';
import { AdminAuditService } from '../services/AdminAuditService';
import { 
  AppCard, AppButton, AppInput, AppSelect, AppAlert 
} from '../../../components/design-system';
import { Settings, Save, CheckCircle, Wifi, Database, Globe, RefreshCw } from 'lucide-react';

export const AdminGlobalSettings: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const t = (key: string) => getAdminTranslation(language, key);

  const [pwaOffline, setPwaOffline] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState('https://api.birdacademy.com/v1');
  const [backupInterval, setBackupInterval] = useState('daily');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);

    AdminAuditService.logAction({
      action: 'Mise à jour des paramètres globaux',
      category: 'system',
      target: 'Configuration Enterprise',
      details: `Mode PWA: ${pwaOffline ? 'Activé' : 'Désactivé'}, Fréquence Sauvegarde: ${backupInterval}`,
      status: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {savedSuccess && (
        <AppAlert type="success" title="Paramètres enregistrés avec succès">
          Les paramètres d'administration globale ont été appliqués avec succès.
        </AppAlert>
      )}

      <AppCard padding="md">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('settingsTitle')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Configuration des paramètres système, PWA, fréquence de sauvegarde et langues.</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6 text-left max-w-3xl">
          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Langue & Région
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Langue Principale de l'Application
                </label>
                <AppSelect
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  options={[
                    { value: 'fr', label: 'Français (FR)' },
                    { value: 'en', label: 'English (EN)' },
                    { value: 'ar', label: 'العربية (AR - RTL)' },
                    { value: 'es', label: 'Español (ES)' },
                    { value: 'it', label: 'Italiano (IT)' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Réseau & PWA Offline
            </h5>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <input 
                  type="checkbox" 
                  id="pwaOffline"
                  checked={pwaOffline}
                  onChange={(e) => setPwaOffline(e.target.checked)}
                  className="w-4.5 h-4.5 accent-blue-600 rounded cursor-pointer"
                />
                <label htmlFor="pwaOffline" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  {t('pwaOfflineMode')} (Service Worker Caching & Base Locale Chiffrée)
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  {t('apiSyncEndpoint')}
                </label>
                <AppInput 
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://api.birdacademy.com/v1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 pb-1.5 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Sauvegardes Automatiques
            </h5>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                {t('backupInterval')}
              </label>
              <AppSelect
                value={backupInterval}
                onChange={(e) => setBackupInterval(e.target.value)}
                options={[
                  { value: 'hourly', label: 'Toutes les heures' },
                  { value: 'daily', label: 'Quotidienne (Recommandée)' },
                  { value: 'weekly', label: 'Hebdomadaire' },
                ]}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <AppButton type="submit" variant="primary" startIcon={<Save className="w-4 h-4" />}>
              {t('saveSettingsBtn')}
            </AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  );
};

export default AdminGlobalSettings;
