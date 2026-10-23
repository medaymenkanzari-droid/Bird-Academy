/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT GouldCrossSimulator
 * Mission V1.6.6.10 : Connexion Passport -> GouldianCrossEngine.
 * 
 * GARANTIES D'ARCHITECTURE ET ÉPISTÉMIQUES :
 * 1. Zéro calcul génétique dans le composant : délégation totale à GouldCrossBridge / GouldianCrossEngine.
 * 2. Zéro Canary Fallback : Strictement réservé à 'diamant_gould'.
 * 3. Sexe formellement requis : Mâle (ZZ) et Femelle (ZW).
 * 4. CONFLICT_REVIEW bloque le calcul et affiche l'alerte explicite.
 * 5. Respect strict des probabilités fournies par le moteur.
 * 6. Zéro score de couple, zéro conseil d'accouplement.
 * 7. Support i18n (FR, EN, AR, ES, IT) et RTL.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Dna, Play, AlertTriangle, ShieldAlert,
  HelpCircle, Layers, CheckCircle2, ChevronDown, ChevronUp,
  Percent, AlertOctagon, User, ArrowRight
} from 'lucide-react';
import { AppAlert } from '../design-system/AppAlert';
import type { Language } from '../../utils/translations';
import { EpistemicStatusBadge } from './EpistemicStatusBadge';
import { EpistemicConfidenceBadge } from './EpistemicConfidenceBadge';
import { HumanReviewBadge } from './HumanReviewBadge';
import { translateEpistemic } from './epistemicBadgeTranslations';
import { useEpistemicLanguage } from './useEpistemicLanguage';
import { GouldCrossBridge, GouldCrossExecutionResult, GouldCrossExecutionSuccess, GouldCrossExecutionBlocked } from '../../features/genetics/species/GouldCrossBridge';
import { GouldCrossResultCard } from './GouldCrossResultCard';
import type { Canari } from '../../types';

export interface GouldCrossSimulatorProps {
  initialParentA?: Canari | null;
  initialParentB?: Canari | null;
  allBirds?: Canari[];
  open?: boolean;
  onClose?: () => void;
  language?: Language;
  'data-testid'?: string;
}

export function GouldCrossSimulator({
  initialParentA,
  initialParentB,
  allBirds = [],
  open = true,
  onClose,
  language: explicitLanguage,
  'data-testid': testId = 'gould-cross-simulator'
}: GouldCrossSimulatorProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);

  // État local des oiseaux sélectionnés
  const [parentAId, setParentAId] = useState<string | number>(initialParentA?.id || '');
  const [parentBId, setParentBId] = useState<string | number>(initialParentB?.id || '');

  // États du calcul : 'idle' | 'calculating' | 'success' | 'blocked' | 'error'
  const [calculationState, setCalculationState] = useState<'idle' | 'calculating' | 'success' | 'blocked' | 'error'>('idle');
  const [executionResult, setExecutionResult] = useState<GouldCrossExecutionResult | null>(null);
  const [showGenotypesDetails, setShowGenotypesDetails] = useState<boolean>(false);

  // Synchronisation lors de l'ouverture ou du changement des props
  useEffect(() => {
    if (open) {
      if (initialParentA?.id) setParentAId(initialParentA.id);
      if (initialParentB?.id) setParentBId(initialParentB.id);
    }
  }, [open, initialParentA, initialParentB]);

  // Résolution des instances d'oiseaux
  const parentABird: Canari | null = useMemo(() => {
    if (initialParentA && String(initialParentA.id) === String(parentAId)) return initialParentA;
    return allBirds.find(b => String(b.id) === String(parentAId)) || null;
  }, [allBirds, initialParentA, parentAId]);

  const parentBBird: Canari | null = useMemo(() => {
    if (initialParentB && String(initialParentB.id) === String(parentBId)) return initialParentB;
    return allBirds.find(b => String(b.id) === String(parentBId)) || null;
  }, [allBirds, initialParentB, parentBId]);

  // Réinitialiser les résultats si les parents changent
  const handleParentAChange = (newId: string | number) => {
    setParentAId(newId);
    setCalculationState('idle');
    setExecutionResult(null);
  };

  const handleParentBChange = (newId: string | number) => {
    setParentBId(newId);
    setCalculationState('idle');
    setExecutionResult(null);
  };

  // Exécution du calcul de croisement via GouldCrossBridge
  const handleCalculateCross = () => {
    setCalculationState('calculating');

    // Petit délai asynchrone pour la transition UI
    setTimeout(() => {
      const res = GouldCrossBridge.executeCross(parentABird, parentBBird);
      setExecutionResult(res);

      if (res.success) {
        setCalculationState('success');
      } else {
        setCalculationState('blocked');
      }
    }, 50);
  };

  // Fermeture par la touche Échap
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const successResult = executionResult?.success ? (executionResult as GouldCrossExecutionSuccess) : null;
  const blockedResult = !executionResult?.success ? (executionResult as GouldCrossExecutionBlocked) : null;

  // Titre épistémique selon la nature des parents
  const getEpistemicResultTitle = () => {
    if (!successResult) return translateEpistemic(language, 'cross.result_title');
    if (successResult.isParentHypothesisSet) {
      return translateEpistemic(language, 'cross.result_hypothetical');
    }
    return translateEpistemic(language, 'cross.result_confirmed');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={translateEpistemic(language, 'cross.title')}
      data-testid={testId}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        
        {/* EN-TÊTE MODALE */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Dna className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{translateEpistemic(language, 'cross.title')}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                GouldianCrossEngine · Connexion contrôlée Bird Passport
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label={translateEpistemic(language, 'drawer.close')}
              data-testid="cross-close-button"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* CORPS PRINCIPAL */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* SÉLECTION DES DEUX PARENTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* PARENT A */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {translateEpistemic(language, 'cross.parent_a')}
                </label>
                {parentABird && (
                  <span className="text-3xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {parentABird.sexe || 'Sexe inconnu'}
                  </span>
                )}
              </div>

              <select
                value={parentAId}
                onChange={(e) => handleParentAChange(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                data-testid="parent-a-select"
              >
                <option value="">{translateEpistemic(language, 'cross.select_partner')}</option>
                {allBirds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nom || b.bague} ({b.espece || 'Espèce inconnue'} · {b.sexe || '?'})
                  </option>
                ))}
              </select>

              {parentABird && (
                <div className="text-3xs text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                  <div><span className="font-semibold">Bague :</span> {parentABird.bague}</div>
                  <div><span className="font-semibold">Espèce :</span> {parentABird.espece}</div>
                  <div><span className="font-semibold">Phénotype :</span> {parentABird.couleur || 'Non renseigné'}</div>
                  <div><span className="font-semibold">Loci canoniques :</span> {(parentABird.passport as any)?.canonicalLoci?.length || 0} renseigné(s)</div>
                </div>
              )}
            </div>

            {/* PARENT B */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {translateEpistemic(language, 'cross.parent_b')}
                </label>
                {parentBBird && (
                  <span className="text-3xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {parentBBird.sexe || 'Sexe inconnu'}
                  </span>
                )}
              </div>

              <select
                value={parentBId}
                onChange={(e) => handleParentBChange(e.target.value)}
                className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                data-testid="parent-b-select"
              >
                <option value="">{translateEpistemic(language, 'cross.select_partner')}</option>
                {allBirds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nom || b.bague} ({b.espece || 'Espèce inconnue'} · {b.sexe || '?'})
                  </option>
                ))}
              </select>

              {parentBBird && (
                <div className="text-3xs text-slate-500 dark:text-slate-400 space-y-0.5 pt-1">
                  <div><span className="font-semibold">Bague :</span> {parentBBird.bague}</div>
                  <div><span className="font-semibold">Espèce :</span> {parentBBird.espece}</div>
                  <div><span className="font-semibold">Phénotype :</span> {parentBBird.couleur || 'Non renseigné'}</div>
                  <div><span className="font-semibold">Loci canoniques :</span> {(parentBBird.passport as any)?.canonicalLoci?.length || 0} renseigné(s)</div>
                </div>
              )}
            </div>

          </div>

          {/* ACTION : LANCER LE CALCUL */}
          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              onClick={handleCalculateCross}
              disabled={!parentABird || !parentBBird || calculationState === 'calculating'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
              data-testid="calculate-cross-btn"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {calculationState === 'calculating'
                  ? translateEpistemic(language, 'cross.calculating')
                  : translateEpistemic(language, 'cross.calculate')}
              </span>
            </button>
          </div>

          {/* ÉTATS D'ERREUR OU DE BLOCAGE ÉPISTÉMIQUE */}
          {blockedResult && (
            <div className="space-y-3" data-testid="cross-blocked-panel">
              {blockedResult.errorCode === 'CONFLICT_REVIEW' && (
                <AppAlert
                  type="danger"
                  title={translateEpistemic(language, 'cross.blocked')}
                  className="text-xs"
                  data-testid="cross-conflict-alert"
                >
                  <p>{blockedResult.message}</p>
                  <p className="mt-1 font-semibold text-rose-700 dark:text-rose-300">
                    {translateEpistemic(language, 'cross.genetic_conflict')}
                  </p>
                </AppAlert>
              )}

              {blockedResult.errorCode === 'INVALID_SPECIES' && (
                <AppAlert
                  type="danger"
                  title="Espèce incompatible"
                  className="text-xs"
                  data-testid="cross-invalid-species-alert"
                >
                  <p>{blockedResult.message}</p>
                </AppAlert>
              )}

              {blockedResult.errorCode === 'INVALID_SEX' && (
                <AppAlert
                  type="danger"
                  title="Sexe requis ou incompatible"
                  className="text-xs"
                  data-testid="cross-invalid-sex-alert"
                >
                  <p>{blockedResult.message}</p>
                </AppAlert>
              )}

              {blockedResult.errorCode === 'ZW_VIOLATION' && (
                <AppAlert
                  type="danger"
                  title="Incompatibilité cytogénétique Z/W"
                  className="text-xs"
                  data-testid="cross-zw-violation-alert"
                >
                  <p>{blockedResult.message}</p>
                </AppAlert>
              )}

              {blockedResult.errorCode === 'INSUFFICIENT_DATA' && (
                <AppAlert
                  type="warning"
                  title={translateEpistemic(language, 'cross.insufficient_data')}
                  className="text-xs"
                  data-testid="cross-insufficient-data-alert"
                >
                  <p>{blockedResult.message}</p>
                </AppAlert>
              )}
            </div>
          )}

          {/* RÉSULTATS DU CROISEMENT EN CAS DE SUCCÈS */}
          {successResult && (
            <div className="space-y-5 animate-fadeIn" data-testid="cross-results-panel">
              <div data-testid="cross-result-container">
                <GouldCrossResultCard
                  result={successResult.result}
                  father={successResult.father}
                  mother={successResult.mother}
                  parentABird={parentABird}
                  parentBBird={parentBBird}
                  language={language}
                />
              </div>
            </div>
          )}


        </div>

        {/* PIED DE MODALE */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              data-testid="cross-modal-close-btn"
            >
              {translateEpistemic(language, 'drawer.close')}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default GouldCrossSimulator;
