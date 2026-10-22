/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — BIRD PASSPORT PROGRESSIVE SUMMARY CARD
 * Synthèse de consultation des 4 niveaux du passeport et statuts épistémiques.
 * Version : V1.9.3 (Bird Passport — Expérience Utilisateur Avancée)
 */

import React, { useState } from 'react';
import { 
  Dna, Eye, ShieldCheck, CheckCircle2, AlertCircle, 
  HelpCircle, Sparkles, Edit3, Layers, BookOpen, User, 
  MapPin, ShieldAlert, FileText, ChevronRight 
} from 'lucide-react';
import { Canari } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';
import { AppButton, SpeciesBadge, AppBadge } from '../../../components/design-system';
import { AssistantPassportDrawer } from '../../assistant/components/AssistantPassportDrawer';

export interface BirdPassportProgressiveSummaryCardProps {
  bird: Canari;
  onEditPassport?: () => void;
  className?: string;
}

export const BirdPassportProgressiveSummaryCard: React.FC<BirdPassportProgressiveSummaryCardProps> = ({
  bird,
  onEditPassport,
  className = ''
}) => {
  const { t, isRtl } = useLanguage();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Évaluation du niveau de complétude des 4 niveaux
  const level1Complete = Boolean(bird.nom && (bird.bague || (bird as any).ringNotSet) && bird.espece);
  const level2Complete = Boolean(bird.categorie && bird.race);
  const level3Complete = Boolean(bird.couleur_base || bird.mutation || (bird.passport as any)?.canonicalLoci?.length);
  const level4Complete = Boolean(bird.documents?.length || bird.photos?.length || bird.observations);

  const completedLevelsCount = [level1Complete, level2Complete, level3Complete, level4Complete].filter(Boolean).length;

  // Statuts épistémiques et badges génétiques
  const carrierStatuses = (bird.passport?.genetics as any)?.carrierStatuses || [];
  const hasNotTested = carrierStatuses.includes('NOT_TESTED');
  const hasUnknownGenotype = bird.mutation === 'UNKNOWN' || (bird as any).genotypeStatus === 'UNKNOWN';

  return (
    <div 
      className={`bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 text-white shadow-xl space-y-6 ${className} ${isRtl ? 'rtl' : 'ltr'}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="passport-progressive-summary"
    >
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-3xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              V1.9.3 Expérience Avancée
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {t('passportProgressStatus', { level: completedLevelsCount })}
            </span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Dna className="w-5 h-5 text-emerald-400" />
            <span>{t('progressivePassportTitle')}</span>
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            {t('progressivePassportSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <AppButton
            variant="outline"
            size="sm"
            onClick={() => setIsAssistantOpen(true)}
            startIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
            className="border-slate-800 bg-slate-800/40 text-slate-300 text-xs"
          >
            {t('askAssistantEducational')}
          </AppButton>
          {onEditPassport && (
            <AppButton
              variant="primary"
              size="sm"
              onClick={onEditPassport}
              startIcon={<Edit3 className="w-3.5 h-3.5" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
            >
              {t('editPassportBtn')}
            </AppButton>
          )}
        </div>
      </div>

      {/* Grille des 4 niveaux de synthèse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Niveau 1 : Identité */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Niveau 1 • Identité
            </span>
            <span className={`w-2 h-2 rounded-full ${level1Complete ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <div>
            <p className="text-sm font-black text-white">{bird.nom || 'Sans nom'}</p>
            <p className="text-xs font-mono text-emerald-400">{bird.bague || 'Non bagué'}</p>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <SpeciesBadge speciesId={bird.espece} size="sm" />
            <span className="text-3xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
              {bird.sexe}
            </span>
          </div>
        </div>

        {/* Niveau 2 : Contexte Espèce */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Niveau 2 • Contexte
            </span>
            <span className={`w-2 h-2 rounded-full ${level2Complete ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-300">{bird.categorie || 'Catégorie non spécifiée'}</p>
            <p className="text-xs text-white font-black">{bird.race || 'Race standard'}</p>
          </div>
          <div className="text-3xs text-slate-400">
            {bird.pere_id || bird.mere_id ? (
              <span className="text-emerald-400 font-semibold">Parents biologiques enregistrés</span>
            ) : (
              <span>Ascendance non renseignée (Fondateur)</span>
            )}
          </div>
        </div>

        {/* Niveau 3 : Génétique & Phénotype */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-indigo-400" />
              Niveau 3 • Génétique
            </span>
            <span className={`w-2 h-2 rounded-full ${level3Complete ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-emerald-400" />
              <p className="text-xs font-bold text-white line-clamp-1">
                {bird.couleur_base || 'Phénotype standard'} {bird.facteur ? `(${bird.facteur})` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {hasUnknownGenotype && (
                <span className="text-3xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {t('unknownStatus')} (UNKNOWN)
                </span>
              )}
              {hasNotTested && (
                <span className="text-3xs px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/40 font-mono">
                  {t('notTestedStatus')} (NOT_TESTED)
                </span>
              )}
              {carrierStatuses.filter((s: string) => s !== 'NOT_TESTED').map((carrier: string, idx: number) => (
                <span key={idx} className="text-3xs px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-300 border border-indigo-800/40 font-mono">
                  {carrier}
                </span>
              ))}
              {!hasUnknownGenotype && !hasNotTested && carrierStatuses.length === 0 && (
                <span className="text-3xs px-2 py-0.5 rounded bg-slate-800/60 text-slate-400">
                  {t('noCarrierSuspected')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Niveau 4 : Avancé */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Niveau 4 • Avancé
            </span>
            <span className={`w-2 h-2 rounded-full ${level4Complete ? 'bg-emerald-400' : 'bg-slate-600'}`} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-300">
              {bird.documents?.length || 0} document(s) • {bird.photos?.length || 0} photo(s)
            </p>
            <p className="text-3xs text-slate-400 mt-1 line-clamp-1">
              {bird.observations ? bird.observations : "Aucune note complémentaire"}
            </p>
          </div>
        </div>

      </div>

      {/* Tiroir Assistant IA en mode consultation */}
      <AssistantPassportDrawer
        open={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        bird={bird}
      />
    </div>
  );
};

export default BirdPassportProgressiveSummaryCard;
