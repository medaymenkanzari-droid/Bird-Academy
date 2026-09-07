/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { 
  Settings, Database, Download, Upload, RefreshCw, CheckCircle2, 
  ShieldAlert, BookOpen, Key, ShieldCheck, Clock, Monitor, 
  Server, HardDrive, WifiOff, Award, Bird, Plus, Trash2, Check, Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeSelector } from './ThemeSelector';
import { CurrencySelector } from './CurrencySelector';
import { useLicensing } from '../features/licensing/hooks/useLicensing';
import { translateLicensing } from '../features/licensing/translations/licensingTranslations';
import { BirdRepository } from '../features/birds/repositories/BirdRepository';
import { HabitatRepository } from '../features/habitat/repositories/HabitatRepository';
import { BreedingRepository } from '../features/breeding/repositories/BreedingRepository';
import { BUILD_VERSION_NAME, BUILD_RELEASE_CHANNEL } from '../config/appMode';
import { SpeciesProfileService } from '../features/species/services/SpeciesProfileService';
import { SPECIES_REGISTRY, getSpeciesById } from '../data/speciesRegistry';
import { SpeciesBadge } from './design-system';

interface ParametresProps {
  onExportBackup: () => void;
  onImportBackup: (backupJson: string) => boolean | string;
  onResetDatabase: (toEmpty: boolean) => void;
  setCurrentTab?: (tab: string) => void;
}

export default function Parametres({
  onExportBackup,
  onImportBackup,
  onResetDatabase,
  setCurrentTab
}: ParametresProps) {
  const { t, currentLanguage } = useLanguage();
  const { activeLicense, validation } = useLicensing();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Species Profile Management state
  const [activeSpeciesIds, setActiveSpeciesIds] = useState<string[]>(() => {
    return SpeciesProfileService.getActiveSpeciesIds();
  });
  const [selectedSpeciesToAdd, setSelectedSpeciesToAdd] = useState<string>('');

  const handleAddSpecies = (speciesId: string) => {
    if (!speciesId) return;
    SpeciesProfileService.addSpecies(speciesId);
    setActiveSpeciesIds(SpeciesProfileService.getActiveSpeciesIds());
    setSelectedSpeciesToAdd('');
    setSuccessMsg(t('speciesAddedSuccess') || "Espèce ajoutée avec succès à votre profil d'élevage.");
    setErrorMsg(null);
  };

  const handleRemoveSpecies = (speciesId: string) => {
    if (activeSpeciesIds.length <= 1) {
      setErrorMsg(t('speciesCannotRemoveLast'));
      return;
    }
    SpeciesProfileService.removeSpecies(speciesId);
    setActiveSpeciesIds(SpeciesProfileService.getActiveSpeciesIds());
    setSuccessMsg(t('speciesRemovedSuccess'));
    setErrorMsg(null);
  };

  const handleResetSpeciesProfile = () => {
    SpeciesProfileService.resetToDefault();
    setActiveSpeciesIds(SpeciesProfileService.getActiveSpeciesIds());
    setSuccessMsg(t('speciesResetSuccess'));
    setErrorMsg(null);
  };

  const lt = (key: string, vars?: Record<string, any>) => translateLicensing(currentLanguage, key, vars);

  // Active species label summary
  const activeSpeciesSummary = useMemo(() => {
    return activeSpeciesIds
      .map(id => {
        const meta = getSpeciesById(id);
        if (!meta) return id;
        return meta.nameKey && t(meta.nameKey) ? t(meta.nameKey) : meta.defaultLabel;
      })
      .join(', ');
  }, [activeSpeciesIds, t]);

  // Live database diagnostic stats
  const dbStats = useMemo(() => {
    try {
      const birdsCount = BirdRepository.getAll(true).length;
      const cagesCount = HabitatRepository.getAllLegacy().length;
      const couplesCount = BreedingRepository.getCouples().length;
      const pontesCount = BreedingRepository.getPontes().length;
      return { birdsCount, cagesCount, couplesCount, pontesCount };
    } catch {
      return { birdsCount: 0, cagesCount: 0, couplesCount: 0, pontesCount: 0 };
    }
  }, [successMsg, activeSpeciesIds]);

  // Platform runtime detection
  const platformInfo = useMemo(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      if (ua.includes('Windows')) return 'Windows 11 / Desktop';
      if (ua.includes('Android')) return 'Android 16 (Capacitor)';
      if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS Mobile';
      return 'Web Standalone';
    }
    return 'Windows 11 / Desktop';
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        JSON.parse(content);
        const res = onImportBackup(content);
        if (res === true) {
          setSuccessMsg(t('importSuccess'));
        } else {
          setErrorMsg(typeof res === 'string' ? res : t('importError'));
        }
      } catch (err) {
        setErrorMsg(t('importFileError'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // License Calculations
  const licenseTypeDisp = (activeLicense?.type as string) === 'beta_tester' 
    ? lt('offlineBetaTitle') 
    : (activeLicense?.type ? activeLicense.type.toUpperCase() : lt('offlineBetaTitle'));

  const statusVal = validation?.status || activeLicense?.status || 'active';
  const getStatusBadge = () => {
    switch (statusVal.toLowerCase()) {
      case 'active':
      case 'valid':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> ACTIVE</span>;
      case 'expired':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500 text-white flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> EXPIRÉE</span>;
      case 'revoked':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-700 text-white flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> RÉVOQUÉE</span>;
      case 'suspended':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-white flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> SUSPENDUE</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-600 text-white flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> {statusVal.toUpperCase()}</span>;
    }
  };

  const calculateRemainingDays = () => {
    if (!activeLicense?.expiresAt) return lt('noExpirationLabel');
    const expTime = new Date(activeLicense.expiresAt).getTime();
    if (isNaN(expTime)) return lt('noExpirationLabel');
    const diff = Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? t('daysRemaining', { count: diff }) : t('expiredDaysAgo', { count: Math.abs(diff) });
  };

  const activationDateStr = activeLicense?.activations?.[0]?.activatedAt 
    ? new Date(activeLicense.activations[0].activatedAt).toISOString().slice(0, 10) 
    : (activeLicense?.issuedAt ? new Date(activeLicense.issuedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));

  const issueDateStr = activeLicense?.issuedAt 
    ? new Date(activeLicense.issuedAt).toISOString().slice(0, 10) 
    : new Date().toISOString().slice(0, 10);

  const expirationDateStr = activeLicense?.expiresAt 
    ? new Date(activeLicense.expiresAt).toISOString().slice(0, 10) 
    : lt('noExpirationLabel');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('parametresTitle')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">{t('parametresSub')}</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-800 rounded-2xl border border-rose-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* License & Certification Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-6 rounded-2xl shadow-md border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-500/40 rounded-xl text-indigo-400">
              <Key className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-white">{lt('licenseInfoSectionTitle')}</h3>
              <p className="text-[11px] text-slate-400">{lt('licenseInfoSectionSub')}</p>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs pt-1">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lt('licenseTypeLabel')}</span>
            <span className="font-bold text-amber-400 text-sm block">{licenseTypeDisp}</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lt('holderLabel')}</span>
            <span className="font-bold text-slate-100 text-sm truncate block">{activeLicense?.holderName || lt('defaultHolderName')}</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lt('remainingDaysLabel')}</span>
            <span className="font-bold text-emerald-400 text-sm flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {calculateRemainingDays()}</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lt('activationDateLabel')}</span>
            <span className="font-semibold text-slate-200 block font-mono">{activationDateStr}</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lt('issueDateLabel')}</span>
            <span className="font-semibold text-slate-200 block font-mono">{issueDateStr}</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lt('expirationDateLabel')}</span>
            <span className="font-semibold text-slate-200 block font-mono">{expirationDateStr}</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lt('maxDevicesLabel')} / {lt('devicesUsedLabel')}</span>
            <span className="font-bold text-slate-100 flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-indigo-400" /> {activeLicense?.activations?.length || 1} / {activeLicense?.policy?.maxDevices || 3} {lt('devicesUnit')}</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lt('activationModeLabel')}</span>
            <span className="font-bold text-emerald-400 block">{lt('offlineBetaActivationMode')}</span>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{lt('licenseIdLabel')}</span>
            <span className="font-mono text-[11px] text-slate-300 truncate block">{activeLicense?.id ? `${activeLicense.id.slice(0, 12)}***` : 'LIC-BETA-***'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Theme, Language, Currency & Backups */}
        <div className="lg:col-span-2 space-y-6">
          <ThemeSelector />

          <LanguageSelector />

          {/* Currency Configuration (BUG-WIN-02-C) */}
          <CurrencySelector />

          {/* Species Profile Configuration (SPECIES & BREEDS SCOPING) */}
          <div id="species-profile-section" className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                  <Bird className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">
                    {t('speciesProfileTitle')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {t('speciesProfileSub')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetSpeciesProfile}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {t('resetDefaults')}
              </button>
            </div>

            {/* Explanatory data preservation note */}
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block text-[11px]">{t('dataPreservationTitle')}</span>
                <span className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed block">
                  {t('dataPreservationDesc')}
                </span>
              </div>
            </div>

            {/* Active species list */}
            <div className="space-y-3">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('activeSpeciesCount', { count: activeSpeciesIds.length })}
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {activeSpeciesIds.map(specId => {
                  const specMeta = getSpeciesById(specId);
                  const canDelete = activeSpeciesIds.length > 1;
                  const categoriesCount = specMeta?.categories?.length || 0;
                  const totalBreedsCount = specMeta?.categories?.flatMap(c => c.breeds).length || 0;

                  return (
                    <div 
                      key={specId} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <SpeciesBadge speciesId={specId} size="md" />
                        <div>
                          <span className="font-bold text-xs text-slate-900 dark:text-white block">
                            {specMeta?.nameKey && t(specMeta.nameKey) ? t(specMeta.nameKey) : (specMeta?.defaultLabel || specId)}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {categoriesCount} {t('categoriesCount')} • {totalBreedsCount} {t('breedsCount')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {t('statusActive')}
                        </span>
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecies(specId)}
                            title={t('deactivateSpeciesTooltip')}
                            className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/50 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            {t('deactivate')}
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic px-1">
                            ({t('singleSpeciesRequired')})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add species section */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t('addNewSpeciesToProfile')}
              </label>

              {SPECIES_REGISTRY.filter(s => !activeSpeciesIds.includes(s.id)).length > 0 ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={selectedSpeciesToAdd}
                    onChange={(e) => setSelectedSpeciesToAdd(e.target.value)}
                    className="flex-1 p-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="">{t('selectSpeciesToAdd')}</option>
                    {SPECIES_REGISTRY.filter(s => !activeSpeciesIds.includes(s.id)).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameKey && t(s.nameKey) ? t(s.nameKey) : s.defaultLabel} ({s.categories.flatMap(c => c.breeds).length} {t('breedsCount')})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={!selectedSpeciesToAdd}
                    onClick={() => handleAddSpecies(selectedSpeciesToAdd)}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    {t('addToProfile')}
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {t('allSpeciesActiveMessage')}
                </div>
              )}
            </div>
          </div>

          {/* Backup / Export / Import */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
              {t('backupTitle')}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('backupDesc')}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" /> {t('exportBackup')}
              </button>

              <button
                type="button"
                onClick={handleImportClick}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
              >
                <Upload className="w-4 h-4" /> {t('importBackup')}
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Database reset operations */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/40 shadow-xs space-y-4">
            <h3 className="font-bold text-rose-800 dark:text-rose-400 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
              {t('resetOpsTitle')}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('resetOpsDesc')}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('confirmResetDemoData'))) {
                    onResetDatabase(false);
                    setSuccessMsg(t('resetDemoDataSuccess'));
                    setErrorMsg(null);
                  }
                }}
                className="flex items-center justify-center gap-1.5 border border-amber-300 hover:bg-amber-50 dark:border-amber-700 dark:hover:bg-amber-950/30 text-amber-800 dark:text-amber-300 font-bold py-2 px-3.5 rounded-xl text-xs cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> {t('loadDemoData')}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('confirmClearDatabase'))) {
                    onResetDatabase(true);
                    setSuccessMsg(t('clearDatabaseSuccess'));
                    setErrorMsg(null);
                  }
                }}
                className="flex items-center justify-center gap-1.5 border border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30 text-red-700 dark:text-red-400 font-bold py-2 px-3.5 rounded-xl text-xs cursor-pointer transition-colors"
              >
                {t('clearDatabase')}
              </button>
            </div>

            {/* Demo Data Generator Access Card */}
            {setCurrentTab && (
              <div className="mt-4 p-3.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 dark:border-indigo-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t('demoGenerator')}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{t('demoGeneratorDesc')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="btn-open-demo-generator"
                  onClick={() => setCurrentTab('demo_shortcut')}
                  className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs cursor-pointer transition-colors shrink-0 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('openDemoGenerator')}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Technical System Information (BUG-WIN-02-D) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('sysInfoTitle')}</h3>
              <p className="text-[10px] text-slate-400">{t('sysInfoSub')}</p>
            </div>
          </div>
          
          <div className="space-y-3 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{t('sysInfoAppVersion')}</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">{BUILD_VERSION_NAME || '1.3.6-RC4'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{t('sysInfoReleaseChannel')}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-right text-[11px]">
                {BUILD_RELEASE_CHANNEL || 'Pre-External QA (Windows-PreExternalUX-Fix-01)'}
              </span>
            </div>
            
            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{t('sysInfoPlatform')}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                {platformInfo}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{t('sysInfoActiveSpecies')}</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Bird className="w-3.5 h-3.5 text-amber-500" />
                {activeSpeciesSummary} ({activeSpeciesIds.length})
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{t('sysInfoStorageDriver')}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                LocalStorage + SQLite Sync
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{t('sysInfoStorageStatus')}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('sysInfoDataIntegrityOk')}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800">
              <span className="font-medium text-slate-500 dark:text-slate-400">{t('sysInfoNetwork')}</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                <WifiOff className="w-3.5 h-3.5" />
                {t('sysInfoOfflineIsolated')}
              </span>
            </div>

            <div className="py-1 space-y-1">
              <span className="font-medium text-slate-500 dark:text-slate-400 block">{t('sysInfoDatabaseRecords')}</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 block bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
                {t('sysInfoRecordsFormat', {
                  birds: dbStats.birdsCount,
                  cages: dbStats.cagesCount,
                  couples: dbStats.couplesCount,
                  pontes: dbStats.pontesCount
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* About Bird Academy Section (User-Facing / Product Focus) (BUG-WIN-02-D) */}
      <div className="mt-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('aboutTitle')}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('aboutSub')}</p>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-3">
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-500" />
              {t('aboutVisionTitle')}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('aboutVisionDesc')}
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
            <div>
              <span className="font-bold">Bird Academy Enterprise — Volière Manager</span> ({BUILD_VERSION_NAME || '1.3.6-RC4'})
            </div>
            <div className="text-slate-500 dark:text-slate-400">
              {t('aboutEthicalCommitment')}
            </div>
            <div className="text-[10px] text-slate-400 pt-1">
              {t('aboutCopyright')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
