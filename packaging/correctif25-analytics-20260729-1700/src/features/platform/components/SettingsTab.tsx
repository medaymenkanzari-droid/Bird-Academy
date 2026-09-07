/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { PLATFORM_TRANSLATIONS, getPlatformTranslation } from '../utils/translations';
import { PlatformSettingsRepository } from '../repositories/PlatformSettingsRepository';
import { PlatformSettingsV2 } from '../types';
import { Save, Check, Settings, Shield, Bell, HardDrive, Cpu, Paintbrush, Languages } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { language, setLanguage, isRtl } = useLanguage();
  const [settings, setSettings] = useState<PlatformSettingsV2>(() => PlatformSettingsRepository.getSettings());
  const [activeSubTab, setActiveSubTab] = useState<'app' | 'breeding' | 'notif' | 'backup' | 'intel' | 'security'>('app');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const tPlat = (key: string) => getPlatformTranslation(language, key);

  const handleSave = () => {
    PlatformSettingsRepository.saveSettings(settings);
    
    // Apply language globally if updated
    if (settings.app.language !== language) {
      setLanguage(settings.app.language);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const menuItems = [
    { id: 'app', label: tPlat('setV2App'), icon: Languages },
    { id: 'breeding', label: tPlat('setV2Breeding'), icon: Settings },
    { id: 'notif', label: tPlat('setV2Notif'), icon: Bell },
    { id: 'backup', label: tPlat('setV2Backup'), icon: HardDrive },
    { id: 'intel', label: tPlat('setV2Intel'), icon: Cpu },
    { id: 'security', label: tPlat('setV2Security'), icon: Shield },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            {tPlat('setV2Title')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{tPlat('setV2Desc')}</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Enregistré !</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Sauvegarder</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col md:flex-row min-h-[400px]">
        {/* Subnavigation */}
        <div className="w-full md:w-64 bg-slate-50/30 border-r border-slate-100 p-4 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-600 font-bold'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="flex-1 p-6">
          {activeSubTab === 'app' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">{tPlat('setV2Lang')}</label>
                <select
                  value={settings.app.language}
                  onChange={e => setSettings({
                    ...settings,
                    app: { ...settings.app, language: e.target.value as any }
                  })}
                  className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-hidden focus:border-amber-500"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="ar">العربية (RTL)</option>
                  <option value="es">Español</option>
                  <option value="it">Italiano</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Thème de l'application</label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {(['light', 'dark', 'system'] as const).map(th => (
                    <button
                      key={th}
                      onClick={() => setSettings({
                        ...settings,
                        app: { ...settings.app, theme: th }
                      })}
                      className={`px-4 py-3 border rounded-xl text-xs font-semibold text-center capitalize cursor-pointer transition-all ${
                        settings.app.theme === th
                          ? 'border-amber-500 bg-amber-50/50 text-amber-600 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {th}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Couleur d'accentuation</label>
                <div className="flex gap-2">
                  {['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'].map(col => (
                    <button
                      key={col}
                      onClick={() => setSettings({
                        ...settings,
                        app: { ...settings.app, accentColor: col }
                      })}
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
                        settings.app.accentColor === col ? 'border-slate-800 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Densité de l'affichage</label>
                <div className="flex gap-3">
                  {(['compact', 'comfortable'] as const).map(den => (
                    <button
                      key={den}
                      onClick={() => setSettings({
                        ...settings,
                        app: { ...settings.app, layoutDensity: den }
                      })}
                      className={`px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                        settings.app.layoutDensity === den
                          ? 'border-amber-500 bg-amber-50/50 text-amber-600 font-bold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {den}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'breeding' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durée incubation moyenne (jours)</label>
                  <input
                    type="number"
                    value={settings.breeding.incubationPeriodDays}
                    onChange={e => setSettings({
                      ...settings,
                      breeding: { ...settings.breeding, incubationPeriodDays: parseInt(e.target.value) || 13 }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durée sevrage moyenne (jours)</label>
                  <input
                    type="number"
                    value={settings.breeding.weaningPeriodDays}
                    onChange={e => setSettings({
                      ...settings,
                      breeding: { ...settings.breeding, weaningPeriodDays: parseInt(e.target.value) || 30 }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Durée quarantaine (jours)</label>
                  <input
                    type="number"
                    value={settings.breeding.quarantinePeriodDays}
                    onChange={e => setSettings({
                      ...settings,
                      breeding: { ...settings.breeding, quarantinePeriodDays: parseInt(e.target.value) || 30 }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Âge minimum reproduction (mois)</label>
                  <input
                    type="number"
                    value={settings.breeding.minBreedingAgeMonths}
                    onChange={e => setSettings({
                      ...settings,
                      breeding: { ...settings.breeding, minBreedingAgeMonths: parseInt(e.target.value) || 10 }
                    })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'notif' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Activer les alertes d'élevage</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Affiche les alertes biologiques sur le tableau de bord.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.enableAlerts}
                  onChange={e => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, enableAlerts: e.target.checked }
                  })}
                  className="w-4 h-4 text-amber-500 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Alerte de sevrage</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Signaler automatiquement les oisillons atteignant 30 jours.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.notifyOnWeaning}
                  onChange={e => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, notifyOnWeaning: e.target.checked }
                  })}
                  className="w-4 h-4 text-amber-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Alerte d'éclosion imminente</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Signaler la fin de couvée à J+13.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.notifyOnHatching}
                  onChange={e => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, notifyOnHatching: e.target.checked }
                  })}
                  className="w-4 h-4 text-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Délai de notification d'échéance (jours)</label>
                <input
                  type="number"
                  value={settings.notifications.leadTimeDays}
                  onChange={e => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, leadTimeDays: parseInt(e.target.value) || 2 }
                  })}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'backup' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Compresser les sauvegardes</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Optimise l'espace de stockage.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.backup.compressBackups}
                  onChange={e => setSettings({
                    ...settings,
                    backup: { ...settings.backup, compressBackups: e.target.checked }
                  })}
                  className="w-4 h-4 text-amber-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Chiffrer les fichiers exportés</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Protège vos données avec une clé locale.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.backup.encryptBackups}
                  onChange={e => setSettings({
                    ...settings,
                    backup: { ...settings.backup, encryptBackups: e.target.checked }
                  })}
                  className="w-4 h-4 text-amber-500"
                />
              </div>

              {settings.backup.encryptBackups && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clé de chiffrement locale</label>
                  <input
                    type="password"
                    value={settings.backup.encryptionKey}
                    onChange={e => setSettings({
                      ...settings,
                      backup: { ...settings.backup, encryptionKey: e.target.value }
                    })}
                    className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seuil d'alerte quota LocalStorage (Mo)</label>
                <input
                  type="number"
                  value={settings.backup.quotaLimitMb}
                  onChange={e => setSettings({
                    ...settings,
                    backup: { ...settings.backup, quotaLimitMb: parseInt(e.target.value) || 5 }
                  })}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'intel' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Activer les suggestions d'élevage</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">L'IA analyse le cheptel et propose des conseils.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.intelligence.enableSuggestions}
                  onChange={e => setSettings({
                    ...settings,
                    intelligence: { ...settings.intelligence, enableSuggestions: e.target.checked }
                  })}
                  className="w-4 h-4 text-amber-500"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Contrôle de consanguinité génétique automatique</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Vérifie l'apparentement lors de la formation d'un couple.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.intelligence.autoGeneticsCheck}
                  onChange={e => setSettings({
                    ...settings,
                    intelligence: { ...settings.intelligence, autoGeneticsCheck: e.target.checked }
                  })}
                  className="w-4 h-4 text-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Taux de consanguinité critique (CoI %)</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.intelligence.minConsanguinitySafety}
                  onChange={e => setSettings({
                    ...settings,
                    intelligence: { ...settings.intelligence, minConsanguinitySafety: parseFloat(e.target.value) || 12.5 }
                  })}
                  className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {activeSubTab === 'security' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Exiger les signatures de sauvegarde</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Refuse l'importation de fichiers non signés ou modifiés à l'extérieur.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.enforceSignatureVerification}
                  onChange={e => setSettings({
                    ...settings,
                    security: { ...settings.security, enforceSignatureVerification: e.target.checked }
                  })}
                  className="w-4 h-4 text-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Niveau de détail d'audit du registre</label>
                <select
                  value={settings.security.auditDetailLevel}
                  onChange={e => setSettings({
                    ...settings,
                    security: { ...settings.security, auditDetailLevel: e.target.value as any }
                  })}
                  className="w-full sm:w-72 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                >
                  <option value="standard">Standard (Actions et modifications)</option>
                  <option value="high">Élevé (Liaisons, modifications et lectures)</option>
                  <option value="paranoid">Paranoïaque (Sauvegarde, intégrité, sécurité, sessions)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
