/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  User, Edit, HeartHandshake, QrCode, Copy, Archive, RefreshCw, Trash2, 
  MapPin, Calendar, Dna, ShieldCheck, Sparkles, X, ChevronRight, Share2,
  Home, Trees, ShieldAlert
} from 'lucide-react';
import { Canari } from '../../../types';
import { BirdLocationSummary } from '../../habitat/services/HabitatService';
import { BirdEngine } from '../../../business/BirdEngine';
import { SpeciesBadge, AppButton, AppBadge } from '../../../components/design-system';
import { useLanguage } from '../../../context/LanguageContext';
import { getBiologicalProfileById } from '../../../reference/species/index';
import { getSpeciesById } from '../../../data/speciesRegistry';

export interface BirdHeroPassportCardProps {
  bird: Canari;
  cageName?: string;
  locationSummary?: BirdLocationSummary;
  onEdit?: (bird: Canari) => void;
  onPair?: (bird: Canari) => void;
  onOpenQrCode?: () => void;
  onDuplicate?: (bird: Canari) => void;
  onArchive?: (bird: Canari) => void;
  onRestore?: (bird: Canari) => void;
  onDelete?: (bird: Canari) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const BirdHeroPassportCard: React.FC<BirdHeroPassportCardProps> = ({
  bird,
  cageName,
  locationSummary,
  onEdit,
  onPair,
  onOpenQrCode,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  onClose,
  isModal = false,
}) => {
  const { t, language, isRtl } = useLanguage();

  const isMale = (bird.sexe as string) === 'Mâle' || (bird.sexe as string) === 'Male';
  const isFemale = (bird.sexe as string) === 'Femelle' || (bird.sexe as string) === 'Female';
  const ageObj = BirdEngine.calculateAge(bird.date_naissance);

  // Resolve species profile for biological maturity threshold and dynamic naming
  const resolvedSpeciesId = bird.espece || (bird as any).speciesId || (bird as any).species;
  const bioProfile = resolvedSpeciesId ? getBiologicalProfileById(resolvedSpeciesId) : undefined;
  const speciesMeta = resolvedSpeciesId ? getSpeciesById(resolvedSpeciesId) : undefined;

  // Localized species name for dynamic fallback
  const speciesCommonName = bioProfile?.identity?.names?.[language] 
    || (speciesMeta ? t(speciesMeta.nameKey) : '')
    || t('speciesCanari');

  // Dynamic biological adulthood threshold (minAgeReproduction from registry, defaults to 10 months)
  const minReproAge = bioProfile?.biology?.minAgeReproduction || 10;
  const isAdult = (ageObj && typeof ageObj.months === 'number') ? ageObj.months >= minReproAge : true;
  const isReproducteur = isAdult && !bird.archived && bird.statut_sante !== 'Quarantaine' && bird.statut_sante !== 'Malade';

  const statusLabel = bird.statut_sante || (bird.archived ? t('archivedStatus') : t('statusActive'));
  const photoSrc = bird.photo || (bird.photos && bird.photos.length > 0 ? bird.photos[0] : null);
  // Dynamic Location Visual & Name Resolution
  const resolvedLocationName = locationSummary?.nom || (cageName && cageName.trim() !== '' ? cageName : t('unassignedCage'));
  const isQuarantineLocation = locationSummary?.isQuarantine || bird.statut_sante === 'Quarantaine';
  const LocationHeroIcon = isQuarantineLocation 
    ? ShieldAlert 
    : (locationSummary?.type === 'aviary' ? Trees : (locationSummary?.type === 'cage' || locationSummary?.type === 'compartment' ? Home : MapPin));

  return (
    <div className={`relative bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Ambient background glow */}
      <div 
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isMale ? 'bg-blue-500' : isFemale ? 'bg-pink-500' : 'bg-emerald-500'
        }`} 
      />
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

      {/* Top action bar if inside modal */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer z-20 border border-slate-700/50`}
          title={t('closePassport')}
          aria-label={t('closePassport')}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
        
        {/* Left: Avatar & Identity details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 w-full md:w-auto">
          
          {/* Avatar frame with gender badge */}
          <div className="relative shrink-0">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-950 border-2 flex items-center justify-center shadow-lg transition-transform ${
              isMale 
                ? 'border-blue-500/60 shadow-blue-500/10' 
                : isFemale 
                  ? 'border-pink-500/60 shadow-pink-500/10' 
                  : 'border-slate-700 shadow-slate-900/50'
            }`}>
              {photoSrc ? (
                <img 
                  src={photoSrc} 
                  alt={bird.nom || bird.bague} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <User className={`w-12 h-12 ${isMale ? 'text-blue-400' : isFemale ? 'text-pink-400' : 'text-slate-500'}`} />
              )}
            </div>

            {/* Gender Badge */}
            <div className={`absolute -bottom-2 ${isRtl ? '-left-2' : '-right-2'} px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-md border ${
              isMale 
                ? 'bg-blue-600 text-white border-blue-400/50' 
                : isFemale 
                  ? 'bg-pink-600 text-white border-pink-400/50' 
                  : 'bg-slate-700 text-slate-200 border-slate-600'
            }`}>
              <span>{isMale ? `♂ ${t('male')}` : isFemale ? `♀ ${t('female')}` : `❓ ${t('undetermined')}`}</span>
            </div>
          </div>

          {/* Identity Info */}
          <div className="space-y-2">
            
            {/* Ring + Status Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-slate-950/80 border border-slate-800 text-emerald-400 font-mono font-black text-xs sm:text-sm rounded-xl tracking-wider shadow-inner">
                {bird.bague || 'SANS-BAGUE'}
              </span>

              {/* Status / Reproducteur badge */}
              <span className={`px-2.5 py-0.5 rounded-lg text-2xs font-bold uppercase tracking-wider border ${
                bird.archived
                  ? 'bg-slate-800/80 text-slate-400 border-slate-700'
                  : statusLabel === 'Quarantaine'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : isReproducteur
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                      : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              }`}>
                {bird.archived ? t('archivedStatus') : isReproducteur ? t('activeBreeder') : statusLabel}
              </span>

              {/* Age pill */}
              <span className="text-3xs text-slate-400 font-mono bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-800">
                {ageObj.stringVal}
              </span>
            </div>

            {/* Bird Name — dynamically uses real species name when name is unset */}
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{bird.nom || `${speciesCommonName} #${bird.id}`}</span>
            </h1>

            {/* Species, Breed & Mutation labels */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <SpeciesBadge speciesId={resolvedSpeciesId || 'canari'} size="sm" />
              
              {bird.race && (
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-200 font-semibold border border-slate-700/60">
                  {bird.race}
                </span>
              )}

              {bird.mutation && bird.mutation !== 'Classique' && (
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-950/70 text-indigo-300 font-semibold border border-indigo-800/50 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>{bird.mutation}</span>
                </span>
              )}

              {bird.couleur_base && (
                <span className="text-slate-400 text-xs font-medium">
                  • {bird.couleur_base}
                </span>
              )}
            </div>

            {/* Location & Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1 font-medium">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                isQuarantineLocation 
                  ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                  : locationSummary?.type === 'aviary'
                    ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/50'
              }`}>
                <LocationHeroIcon className={`w-3.5 h-3.5 ${
                  isQuarantineLocation ? 'text-amber-400' : locationSummary?.type === 'aviary' ? 'text-emerald-400' : 'text-slate-400'
                }`} />
                <span className="font-semibold">{resolvedLocationName}</span>
                {locationSummary?.typeLabelKey && locationSummary.type !== 'unknown' && (
                  <span className="text-3xs uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900/80 border border-slate-700/50 text-slate-400 font-mono">
                    {t(locationSummary.typeLabelKey)}
                  </span>
                )}
                {bird.compartiment && <span className="text-slate-400">({bird.compartiment})</span>}
              </div>

              {bird.date_naissance && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('bornOn', { date: bird.date_naissance })}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap md:flex-col gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0">
          
          {/* Main Pair Simulator Action */}
          {onPair && (
            <AppButton
              variant="primary"
              size="sm"
              onClick={() => onPair(bird)}
              startIcon={<HeartHandshake className="w-4 h-4 text-emerald-300" />}
              className="bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black shadow-lg shadow-emerald-950/50 flex-1 md:flex-initial"
            >
              {t('pairSimulator')}
            </AppButton>
          )}

          <div className="flex items-center gap-2 flex-wrap flex-1 md:flex-initial">
            {/* Edit Action */}
            {onEdit && (
              <AppButton
                variant="secondary"
                size="sm"
                onClick={() => onEdit(bird)}
                startIcon={<Edit className="w-3.5 h-3.5" />}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
              >
                {t('editBird')}
              </AppButton>
            )}

            {/* Smart QR Code Action */}
            {onOpenQrCode && (
              <AppButton
                variant="outline"
                size="sm"
                onClick={onOpenQrCode}
                startIcon={<QrCode className="w-3.5 h-3.5 text-indigo-400" />}
                className="border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-white"
                title={t('showQrCodeTitle')}
              >
                {t('showQrCode')}
              </AppButton>
            )}

            {/* Contextual actions */}
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(bird)}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
                title={t('duplicatePhenotype')}
                aria-label={t('duplicatePhenotype')}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}

            {bird.archived ? (
              onRestore && (
                <button
                  onClick={() => onRestore(bird)}
                  className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-slate-700/60 transition-colors cursor-pointer"
                  title={t('restoreBird')}
                  aria-label={t('restoreBird')}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )
            ) : (
              onArchive && (
                <button
                  onClick={() => onArchive(bird)}
                  className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-700/60 transition-colors cursor-pointer"
                  title={t('archiveBird')}
                  aria-label={t('archiveBird')}
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(bird)}
                className="p-2 rounded-xl bg-slate-800/60 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700/60 hover:border-red-800/60 transition-colors cursor-pointer"
                title={t('deleteBird')}
                aria-label={t('deleteBird')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BirdHeroPassportCard;
