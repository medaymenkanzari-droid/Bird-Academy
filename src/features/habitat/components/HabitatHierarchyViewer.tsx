/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION V1.9.6
 * COMPOSANT DE NAVIGATION HIÉRARCHIQUE : ZONE -> VOLIÈRE -> CAGE -> OISEAUX
 * Fichier : src/features/habitat/components/HabitatHierarchyViewer.tsx
 */

import React, { useState } from 'react';
import { 
  Layers, ChevronRight, ChevronDown, User, ShieldAlert, 
  AlertCircle, Home, CheckCircle2, Search, ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { 
  Zone, Aviary, HabitatCage, Canari, QuarantineArea, QuarantineRecord 
} from '../../../types';
import { HabitatIntegrityService, HabitatHierarchyTree } from '../services/HabitatIntegrityService';

interface HabitatHierarchyViewerProps {
  zones: Zone[];
  aviaries: Aviary[];
  cages: HabitatCage[];
  birds: Canari[];
  quarantineAreas?: QuarantineArea[];
  quarantineRecords?: QuarantineRecord[];
  onSelectNode?: (type: 'zone' | 'aviary' | 'cage' | 'quarantineArea', id: string) => void;
  onSelectBird?: (bird: Canari) => void;
}

export const HabitatHierarchyViewer: React.FC<HabitatHierarchyViewerProps> = ({
  zones,
  aviaries,
  cages,
  birds,
  quarantineAreas = [],
  quarantineRecords = [],
  onSelectNode,
  onSelectBird
}) => {
  const { t, language, isRtl } = useLanguage();
  const [expandedZones, setExpandedZones] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    zones.forEach(z => { init[z.id] = true; });
    return init;
  });
  const [expandedAviaries, setExpandedAviaries] = useState<Record<string, boolean>>({});
  const [expandedCages, setExpandedCages] = useState<Record<string, boolean>>({});
  const [searchFilter, setSearchFilter] = useState('');

  const tree: HabitatHierarchyTree = HabitatIntegrityService.buildHierarchyTree(
    zones,
    aviaries,
    cages,
    birds,
    quarantineAreas,
    quarantineRecords,
    language as any
  );

  const toggleZone = (id: string) => {
    setExpandedZones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAviary = (id: string) => {
    setExpandedAviaries(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCage = (id: string) => {
    setExpandedCages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4" dir={isRtl ? 'rtl' : 'ltr'} data-testid="habitat-hierarchy-viewer">
      {/* Overview Header / Breadcrumb helper */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              {language === 'ar' ? "الهيكل الهرمي للمأوى : منطقة ← سلاكة ← قفص ← طيور" : "Arborescence d'Élevage : Zone → Volière → Cage → Oiseaux"}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'ar' 
              ? "متابعة دقيقة لكل طائر في موقعه الحقيقي دون طيور وهمية" 
              : "Organisation claire : identifiez immédiatement où se trouve chaque oiseau sans affectation implicite."}
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold bg-white dark:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs">
            {tree.stats.totalZones} {language === 'ar' ? 'مناطق' : 'Zones'}
          </span>
          <span className="text-[11px] font-semibold bg-white dark:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs">
            {tree.stats.totalAviaries} {language === 'ar' ? 'سلاكات' : 'Volières'}
          </span>
          <span className="text-[11px] font-semibold bg-white dark:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 shadow-2xs">
            {tree.stats.totalCages} {language === 'ar' ? 'أقفاص' : 'Cages'}
          </span>
          <span className="text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 shadow-2xs">
            {tree.stats.totalBirdsTracked} {language === 'ar' ? 'طيور موثقة' : 'Oiseaux logés'}
          </span>
        </div>
      </div>

      {/* ZONE LIST */}
      <div className="space-y-3">
        {tree.zones.map(zoneNode => {
          const isZoneOpen = expandedZones[zoneNode.zone.id] !== undefined 
            ? !!expandedZones[zoneNode.zone.id] 
            : true;

          return (
            <div 
              key={zoneNode.zone.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs overflow-hidden"
            >
              {/* ZONE HEADER */}
              <div 
                className="p-3.5 bg-slate-50/80 dark:bg-slate-800/90 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between cursor-pointer select-none"
                onClick={() => toggleZone(zoneNode.zone.id)}
              >
                <div className="flex items-center gap-2.5">
                  <button 
                    type="button"
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors text-slate-500"
                    aria-label="Toggle Zone"
                  >
                    {isZoneOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  <Home className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                      {zoneNode.zone.nom}
                    </span>
                    {zoneNode.zone.isQuarantine && (
                      <span className="ml-2 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 px-1.5 py-0.5 rounded">
                        {language === 'ar' ? 'حجر صحي' : 'Quarantaine'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {zoneNode.missingData.map((notice, idx) => (
                    <span key={idx} className="text-[10px] font-medium bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      {notice.message}
                    </span>
                  ))}
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                    {zoneNode.totalBirds} {language === 'ar' ? 'طائر' : 'oiseau(x)'}
                  </span>
                </div>
              </div>

              {/* ZONE CONTENT */}
              {isZoneOpen && (
                <div className="p-4 space-y-4">
                  {/* 1. Volières de la zone */}
                  {zoneNode.aviaries.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {language === 'ar' ? 'السلاكات التابعة للمنطقة' : 'Volières de la zone'} ({zoneNode.aviaries.length})
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {zoneNode.aviaries.map(aviaryNode => {
                          const isAviaryOpen = expandedAviaries[aviaryNode.aviary.id] !== undefined
                            ? !!expandedAviaries[aviaryNode.aviary.id]
                            : true;

                          return (
                            <div 
                              key={aviaryNode.aviary.id}
                              className="bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 rounded-lg p-3 space-y-2.5"
                            >
                              <div 
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleAviary(aviaryNode.aviary.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <button type="button" className="p-0.5 text-slate-400">
                                    {isAviaryOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    🕊️ {aviaryNode.aviary.nom}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-500 font-semibold">
                                  {aviaryNode.totalBirds} {aviaryNode.aviary.capacite_max ? `/ ${aviaryNode.aviary.capacite_max}` : ''}
                                </span>
                              </div>

                              {aviaryNode.missingData.map((m, idx) => (
                                <div key={idx} className="text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-1 rounded">
                                  ⚠️ {m.message}
                                </div>
                              ))}

                              {/* Cages de la volière */}
                              {isAviaryOpen && (
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50 space-y-2">
                                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                                    {language === 'ar' ? 'الأقفاص داخل السلاكة' : 'Cages dans la volière'} ({aviaryNode.cages.length})
                                  </span>

                                  {aviaryNode.cages.length === 0 ? (
                                    <span className="text-[11px] text-slate-400 italic block">
                                      {language === 'ar' ? 'لا توجد أقفاص محددة في هذه السلاكة' : 'Aucune cage spécifique configurée dans cette volière.'}
                                    </span>
                                  ) : (
                                    <div className="space-y-1.5">
                                      {aviaryNode.cages.map(cageNode => (
                                        <div 
                                          key={cageNode.entity.id}
                                          className="p-2 bg-white dark:bg-slate-700/60 rounded border border-slate-200 dark:border-slate-600/70"
                                        >
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                                              🕸️ {cageNode.entity.nom}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500">
                                              {cageNode.occupancyCount} {cageNode.capacity ? `/ ${cageNode.capacity}` : ''}
                                            </span>
                                          </div>

                                          {/* Oiseaux dans cette cage */}
                                          {cageNode.birds.length > 0 && (
                                            <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-600/50 flex flex-wrap gap-1.5">
                                              {cageNode.birds.map(bird => (
                                                <button
                                                  key={bird.id}
                                                  type="button"
                                                  onClick={() => onSelectBird && onSelectBird(bird)}
                                                  className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 dark:bg-slate-600 hover:bg-amber-100 dark:hover:bg-amber-900 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer"
                                                >
                                                  <User className="w-2.5 h-2.5 text-amber-500" />
                                                  <span>{bird.nom ? (bird.bague ? `${bird.nom} (${bird.bague})` : bird.nom) : (bird.bague || `Oiseau #${bird.id}`)}</span>
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. Cages autonomes de la zone (hors volière) */}
                  {zoneNode.standaloneCages.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {language === 'ar' ? 'أقفاص مستقلة في المنطقة' : 'Cages autonomes de la zone'} ({zoneNode.standaloneCages.length})
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {zoneNode.standaloneCages.map(cageNode => (
                          <div 
                            key={cageNode.entity.id}
                            className="p-2.5 bg-slate-50/70 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700/60"
                          >
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-bold text-slate-800 dark:text-slate-100">
                                🕸️ {cageNode.entity.nom}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500">
                                {cageNode.occupancyCount} {cageNode.capacity ? `/ ${cageNode.capacity}` : ''}
                              </span>
                            </div>

                            {cageNode.birds.length === 0 ? (
                              <span className="text-[10px] text-slate-400 italic block">
                                {language === 'ar' ? 'قفص فارغ' : 'Cage vide'}
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {cageNode.birds.map(bird => (
                                  <button
                                    key={bird.id}
                                    type="button"
                                    onClick={() => onSelectBird && onSelectBird(bird)}
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold bg-white dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 transition-colors cursor-pointer"
                                  >
                                    <User className="w-2.5 h-2.5 text-amber-500" />
                                    <span>{bird.nom || bird.bague || `Oiseau #${bird.id}`}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cas zone vide */}
                  {zoneNode.aviaries.length === 0 && zoneNode.standaloneCages.length === 0 && (
                    <div className="text-center py-4 text-xs text-slate-400 italic">
                      {language === 'ar' ? 'لا توجد سلاكات أو أقفاص في هذه المنطقة' : 'Aucune volière ou cage configurée dans cette zone.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* SECTION QUARANTAINE DÉDIÉE (Étape 9) */}
      {tree.quarantine.length > 0 && (
        <div className="bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                {language === 'ar' ? 'مساحة الحجر الصحي والعزل الوقائي' : 'Espace d\'Isolement et Quarantaine Sanitaire'}
              </h4>
            </div>
            <span className="text-xs font-extrabold bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full">
              {tree.stats.quarantineCount} {language === 'ar' ? 'طائر معزول' : 'oiseau(x) en quarantaine'}
            </span>
          </div>

          <p className="text-xs text-rose-700/80 dark:text-rose-300/80">
            {language === 'ar'
              ? 'موقع إيواء منفصل مخصص للعزل الصحي الوقائي أو العلاجي. لا يتم إنهاء الحجر تلقائياً دون تسجيل فعلي.'
              : 'Emplacement d\'hébergement distinct. Les statuts sanitaires et dates réelles sont scrupuleusement conservés sans validation automatique hâtive.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
            {tree.quarantine.flatMap(q => q.birds).map(bird => (
              <div 
                key={bird.id}
                className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-rose-200/80 dark:border-rose-800/40 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">
                    {bird.nom || bird.bague || `Oiseau #${bird.id}`}
                  </span>
                  <span className="text-[10px] text-rose-600 font-semibold block">
                    {bird.statut_sante || 'Quarantaine'}
                  </span>
                  {bird.quarantineId && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                      📍 {quarantineAreas.find(q => q.id === bird.quarantineId)?.nom || 'Box Quarantaine'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onSelectBird && onSelectBird(bird)}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 rounded text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Détail
                </button>
              </div>
            ))}
            {tree.stats.quarantineCount === 0 && (
              <span className="text-xs text-slate-400 italic">
                {language === 'ar' ? 'لا يوجد طيور في الحجر الصحي حالياً' : 'Aucun oiseau en quarantaine actuellement.'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* SECTION OISEAUX NON ASSIGNÉS */}
      {tree.unassignedBirds.length > 0 && (
        <div className="bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
              {tree.unassignedBirds.length} {language === 'ar' ? 'طيور غير مخصصة لأي قفص' : 'oiseau(x) sans cage ou volière assignée'}
            </span>
          </div>
          <span className="text-[11px] text-amber-800 dark:text-amber-300 italic font-medium">
            {language === 'ar' ? 'الموقع غير مسجل' : 'Emplacement non renseigné.'}
          </span>
        </div>
      )}
    </div>
  );
};
