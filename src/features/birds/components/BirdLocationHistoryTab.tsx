/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Home, ShieldAlert, AlertTriangle, ArrowRight, ArrowLeft, 
  Calendar, UserCheck, Layers, Building, Trees, Box, 
  HelpCircle, MapPin, Route, CheckCircle2, Clock
} from 'lucide-react';
import { Canari, DeplacementRecord } from '../../../types';
import { HabitatService, BirdLocationSummary } from '../../habitat/services/HabitatService';
import { useLanguage } from '../../../context/LanguageContext';

export interface BirdLocationHistoryTabProps {
  bird: Canari;
}

export const BirdLocationHistoryTab: React.FC<BirdLocationHistoryTabProps> = ({ bird }) => {
  const { t, isRtl } = useLanguage();

  // 1. Resolve Location Summary
  const locationSummary: BirdLocationSummary = useMemo(() => {
    return HabitatService.getBirdLocationSummary(bird);
  }, [bird]);

  // 2. Resolve Chronological Movement History
  const movements: DeplacementRecord[] = useMemo(() => {
    return HabitatService.getBirdDeplacements(bird.id);
  }, [bird.id]);

  // Resolve Icon and Accent Colors based on location type
  const getLocationVisuals = (type: BirdLocationSummary['type'], isQuarantine: boolean) => {
    if (isQuarantine || type === 'quarantineArea') {
      return {
        icon: ShieldAlert,
        colorClass: 'text-amber-400',
        bgClass: 'bg-amber-500/10 border-amber-500/30',
        glowClass: 'from-amber-500/20 to-transparent',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      };
    }
    switch (type) {
      case 'aviary':
        return {
          icon: Trees,
          colorClass: 'text-emerald-400',
          bgClass: 'bg-emerald-500/10 border-emerald-500/30',
          glowClass: 'from-emerald-500/20 to-transparent',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
        };
      case 'cage':
      case 'compartment':
        return {
          icon: Home,
          colorClass: 'text-blue-400',
          bgClass: 'bg-blue-500/10 border-blue-500/30',
          glowClass: 'from-blue-500/20 to-transparent',
          badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40'
        };
      case 'zone':
        return {
          icon: Layers,
          colorClass: 'text-purple-400',
          bgClass: 'bg-purple-500/10 border-purple-500/30',
          glowClass: 'from-purple-500/20 to-transparent',
          badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        };
      case 'facility':
        return {
          icon: Building,
          colorClass: 'text-indigo-400',
          bgClass: 'bg-indigo-500/10 border-indigo-500/30',
          glowClass: 'from-indigo-500/20 to-transparent',
          badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
        };
      default:
        return {
          icon: HelpCircle,
          colorClass: 'text-slate-400',
          bgClass: 'bg-slate-800 border-slate-700',
          glowClass: 'from-slate-800/20 to-transparent',
          badgeClass: 'bg-slate-800 text-slate-400 border-slate-700'
        };
    }
  };

  const visuals = getLocationVisuals(locationSummary.type, locationSummary.isQuarantine);
  const LocationIcon = visuals.icon;
  const DirectionArrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div className={`space-y-6 animate-fadeIn ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* 1. Current Location Card */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl overflow-hidden">
        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none bg-linear-to-b ${visuals.glowClass}`} />

        <div className="relative z-10 space-y-5">
          
          {/* Header row with Type badge and Status */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${visuals.bgClass}`}>
                <LocationIcon className={`w-6 h-6 ${visuals.colorClass}`} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>{t('currentLocationTitle')}</span>
                </h3>
                <p className="text-xs text-slate-400">{t('currentLocationSubtitle')}</p>
              </div>
            </div>

            {/* Type badge */}
            <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border shadow-sm ${visuals.badgeClass}`}>
              {t(locationSummary.typeLabelKey)}
            </span>
          </div>

          {/* Quarantine Warning Banner if applicable */}
          {locationSummary.isQuarantine && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-amber-200 text-xs shadow-inner">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-300">{t('isQuarantineAlert')}</div>
                {locationSummary.dateEntree && (
                  <div className="text-amber-400/90 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t('quarantineEntryDate', { date: locationSummary.dateEntree })}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            
            {/* Structure / Name */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-3xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{t('structureName')}</span>
              </div>
              <div className="text-sm font-bold text-white truncate" title={locationSummary.nom}>
                {locationSummary.nom}
              </div>
            </div>

            {/* Zone */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-3xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" />
                <span>{t('parentZone')}</span>
              </div>
              <div className="text-sm font-semibold text-slate-200 truncate">
                {locationSummary.zoneNom || t('unassignedLocation')}
              </div>
            </div>

            {/* Facility / Building */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-3xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-400" />
                <span>{t('parentFacility')}</span>
              </div>
              <div className="text-sm font-semibold text-slate-200 truncate">
                {locationSummary.facilityNom || t('unassignedLocation')}
              </div>
            </div>

            {/* Capacity */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-3xs uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1">
                <Box className="w-3 h-3 text-slate-400" />
                <span>{t('capacityLabel')}</span>
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {locationSummary.capaciteMax !== undefined ? `${locationSummary.capaciteMax} ${t('birds') || 'oiseaux'}` : '—'}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Movement History Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        
        {/* Timeline Title & Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Route className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-black text-white tracking-tight">
                {t('movementHistoryTitle')}
              </h3>
              <p className="text-xs text-slate-400">{t('movementHistorySubtitle')}</p>
            </div>
          </div>

          <span className="px-3 py-1 bg-slate-950 border border-slate-800 text-indigo-300 font-mono font-black text-xs rounded-xl shadow-inner">
            {t('movementCountBadge', { count: movements.length })}
          </span>
        </div>

        {/* Timeline Items or Empty State */}
        {movements.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-slate-950/50 border border-slate-800/60 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Route className="w-10 h-10 text-slate-600" />
            <p className="text-sm font-medium">{t('noMovementsRecorded')}</p>
          </div>
        ) : (
          <div className="relative space-y-4">
            
            {/* Vertical timeline bar for desktop */}
            <div className={`hidden sm:block absolute top-4 bottom-4 ${isRtl ? 'right-6' : 'left-6'} w-0.5 bg-slate-800 pointer-events-none`} />

            {movements.map((move, index) => (
              <div 
                key={move.id || `move-${index}`}
                className="relative flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/40 transition-colors shadow-md"
              >
                {/* Timeline node icon */}
                <div className={`hidden sm:flex shrink-0 w-8 h-8 rounded-full items-center justify-center z-10 shadow-md ${
                  index === 0 
                    ? 'bg-indigo-600 text-white ring-4 ring-slate-900 border border-indigo-400' 
                    : 'bg-slate-800 text-slate-300 ring-4 ring-slate-900 border border-slate-700'
                }`}>
                  {index === 0 ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-3.5 h-3.5" />}
                </div>

                {/* Content Block */}
                <div className="flex-1 space-y-3 w-full">
                  
                  {/* Top line: Date + Operator */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300 font-mono font-semibold bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{move.date}</span>
                    </div>

                    {move.utilisateur && (
                      <div className="flex items-center gap-1 text-slate-400 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                        <span>{move.utilisateur}</span>
                      </div>
                    )}
                  </div>

                  {/* Flow: Origin -> Destination */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-1">
                    
                    {/* Origin Box */}
                    <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5">
                      <span className="text-3xs uppercase tracking-wider text-slate-500">{t('movementOrigin')}:</span>
                      <span className="text-white font-bold">{move.origineNom || move.origineType}</span>
                    </div>

                    {/* Arrow */}
                    <DirectionArrow className="w-4 h-4 text-indigo-400 shrink-0" />

                    {/* Destination Box */}
                    <div className="px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      <span className="text-3xs uppercase tracking-wider text-indigo-400 font-bold">{t('movementDestination')}:</span>
                      <span className="text-white font-black">{move.destinationNom || move.destinationType}</span>
                    </div>

                  </div>

                  {/* Motif & Comments */}
                  {(move.motif || move.commentaire) && (
                    <div className="pt-2 border-t border-slate-900 space-y-1 text-xs">
                      {move.motif && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-slate-500 font-medium">{t('movementReason')}:</span>
                          <span className="text-slate-300 font-medium">{move.motif}</span>
                        </div>
                      )}
                      {move.commentaire && (
                        <div className="flex items-start gap-1.5 text-slate-400 italic">
                          <span className="text-slate-500">{t('movementComments')}:</span>
                          <span>{move.commentaire}</span>
                        </div>
                      )}
                    </div>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
};

export default BirdLocationHistoryTab;
