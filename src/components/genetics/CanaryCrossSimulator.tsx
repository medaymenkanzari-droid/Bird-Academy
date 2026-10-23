/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — COMPOSANT CanaryCrossSimulator
 * Mission V1.7.6 : Interface de simulation utilisateur pour le Canari via CanaryCrossBridge.
 * 
 * GARANTIES D'ARCHITECTURE ET ÉPISTÉMIQUES :
 * 1. ZÉRO CALCUL DANS L'UI : Délégation intégrale au CanaryCrossBridge / CanaryCrossEngine.
 * 2. ZÉRO GOULD FALLBACK : Strictement réservé aux oiseaux 'canari' (Serinus canaria domestica).
 * 3. ZÉRO RECOMMANDATION : Zéro score de couple, zéro étoile, zéro avis d'élevage ("bon/mauvais couple" proscrits).
 * 4. ÉTATS FORMELS EXPLICITES : SUCCESS, WARNING, BLOCKED, INSUFFICIENT_INFORMATION, HUMAN_REVIEW_REQUIRED.
 * 5. LÉTHALITÉ EMBRYONNAIRE : Alerte in ovo à 25% (Duncker/Hutt) visible et découplée de la certitude individuelle.
 * 6. ISABELLE SANS ARBITRAGE : Conservation des spectres CIS et TRANS sous POSSIBLE_SET.
 * 7. LOCI BLOQUÉS ISOLÉS : Ino, Satiné, Perle clairement marqués BLOCKED sans empêcher les loci calculables.
 * 8. TRAÇABILITÉ SCELLÉE : Présentation des evidenceIds sans invention de sources.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X, Dna, Play, AlertTriangle, ShieldAlert,
  HelpCircle, Layers, CheckCircle2, ChevronDown, ChevronUp,
  Percent, AlertOctagon, User, ArrowRight, ShieldCheck, Flame
} from 'lucide-react';
import { AppAlert } from '../design-system/AppAlert';
import type { Language } from '../../utils/translations';
import { EpistemicStatusBadge } from './EpistemicStatusBadge';
import { EpistemicConfidenceBadge } from './EpistemicConfidenceBadge';
import { HumanReviewBadge } from './HumanReviewBadge';
import { useEpistemicLanguage } from './useEpistemicLanguage';
import {
  CanaryCrossBridge,
  type CanaryCrossBridgeResult,
  type CanaryCrossBridgeSuccess,
  type CanaryCrossBridgeBlocked,
  type CanaryBridgeStatus
} from '../../features/genetics/species/CanaryCrossBridge';
import type { Canari } from '../../types';

export interface CanaryCrossSimulatorProps {
  initialParentA?: Canari | null;
  initialParentB?: Canari | null;
  allBirds?: Canari[];
  open?: boolean;
  onClose?: () => void;
  language?: Language;
  'data-testid'?: string;
}

export function CanaryCrossSimulator({
  initialParentA,
  initialParentB,
  allBirds = [],
  open = true,
  onClose,
  language: explicitLanguage,
  'data-testid': testId = 'canary-cross-simulator-modal'
}: CanaryCrossSimulatorProps) {
  const { language, isRtl } = useEpistemicLanguage(explicitLanguage);

  // Filtrage strict : seuls les Canaris sont sélectionnables
  const canaryBirds = useMemo(() => {
    return allBirds.filter(b => {
      const sp = (b.espece || (b as any).speciesId || '').toLowerCase().trim();
      return sp === 'canari' || sp === 'serinus_canaria' || sp === 'canary';
    });
  }, [allBirds]);

  // État local des oiseaux sélectionnés
  const [parentAId, setParentAId] = useState<string | number>(initialParentA?.id || '');
  const [parentBId, setParentBId] = useState<string | number>(initialParentB?.id || '');

  // États du calcul
  const [calculationState, setCalculationState] = useState<'idle' | 'calculating' | 'result'>('idle');
  const [executionResult, setExecutionResult] = useState<CanaryCrossBridgeResult | null>(null);

  // Synchronisation lors de l'ouverture
  useEffect(() => {
    if (open) {
      if (initialParentA?.id) setParentAId(initialParentA.id);
      if (initialParentB?.id) setParentBId(initialParentB.id);
    }
  }, [open, initialParentA, initialParentB]);

  // Résolution des instances d'oiseaux
  const parentABird: Canari | null = useMemo(() => {
    if (initialParentA && String(initialParentA.id) === String(parentAId)) return initialParentA;
    return canaryBirds.find(b => String(b.id) === String(parentAId)) || null;
  }, [canaryBirds, initialParentA, parentAId]);

  const parentBBird: Canari | null = useMemo(() => {
    if (initialParentB && String(initialParentB.id) === String(parentBId)) return initialParentB;
    return canaryBirds.find(b => String(b.id) === String(parentBId)) || null;
  }, [canaryBirds, initialParentB, parentBId]);

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

  // Exécution du calcul via CanaryCrossBridge
  const handleCalculateCross = () => {
    setCalculationState('calculating');
    try {
      const res = CanaryCrossBridge.executeCross(parentABird, parentBBird);
      setExecutionResult(res);
      setCalculationState('result');
    } catch (err: any) {
      setExecutionResult({
        success: false,
        status: 'ERROR',
        errorCode: 'ENGINE_ERROR',
        message: err?.message || 'Erreur interne lors de la simulation de croisement.'
      });
      setCalculationState('result');
    }
  };

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      data-testid={testId}
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* HEADER */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Simulateur de Croisement Génétique Canari
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-3xs font-mono font-bold border border-amber-500/20">
                  V1.7.6 CANONICAL
                </span>
              </div>
              <p className="text-3xs text-slate-400 mt-0.5">
                Modèle canonique Serinus canaria domestica • Zéro inférence non prouvée • Registre scellé
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              data-testid="close-canary-cross-simulator-btn"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* SECTION SÉLECTION DES PARENTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PARENT A */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-400">
                  Parent A
                </span>
                {parentABird?.sexe && (
                  <span className={`text-3xs font-bold px-2 py-0.5 rounded-md ${parentABird.sexe === 'Mâle' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}`}>
                    {parentABird.sexe === 'Mâle' ? '♂ Mâle (ZZ)' : '♀ Femelle (ZW)'}
                  </span>
                )}
              </div>
              <select
                value={String(parentAId)}
                onChange={(e) => handleParentAChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                data-testid="select-canary-parent-a"
              >
                <option value="">-- Choisir un Canari --</option>
                {canaryBirds.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.nom || `Canari #${b.id}`} ({b.bague || 'Sans bague'}) - {b.sexe || 'Sexe inconnu'}
                  </option>
                ))}
              </select>
              {parentABird && (
                <div className="text-3xs text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                  <div>Couleur : <span className="text-white font-semibold">{parentABird.couleur || 'Non renseignée'}</span></div>
                  <div>Bague : <span className="font-mono text-amber-400">{parentABird.bague || 'N/A'}</span></div>
                </div>
              )}
            </div>

            {/* PARENT B */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-400">
                  Parent B
                </span>
                {parentBBird?.sexe && (
                  <span className={`text-3xs font-bold px-2 py-0.5 rounded-md ${parentBBird.sexe === 'Mâle' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'}`}>
                    {parentBBird.sexe === 'Mâle' ? '♂ Mâle (ZZ)' : '♀ Femelle (ZW)'}
                  </span>
                )}
              </div>
              <select
                value={String(parentBId)}
                onChange={(e) => handleParentBChange(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                data-testid="select-canary-parent-b"
              >
                <option value="">-- Choisir un Canari --</option>
                {canaryBirds.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.nom || `Canari #${b.id}`} ({b.bague || 'Sans bague'}) - {b.sexe || 'Sexe inconnu'}
                  </option>
                ))}
              </select>
              {parentBBird && (
                <div className="text-3xs text-slate-400 space-y-1 pt-1 border-t border-slate-800">
                  <div>Couleur : <span className="text-white font-semibold">{parentBBird.couleur || 'Non renseignée'}</span></div>
                  <div>Bague : <span className="font-mono text-amber-400">{parentBBird.bague || 'N/A'}</span></div>
                </div>
              )}
            </div>
          </div>

          {/* BOUTON D'ACTION */}
          <div className="flex justify-center">
            <button
              onClick={handleCalculateCross}
              disabled={!parentAId || !parentBId || calculationState === 'calculating'}
              className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all cursor-pointer disabled:cursor-not-allowed"
              data-testid="calculate-canary-cross-btn"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simuler le croisement canonique</span>
            </button>
          </div>

          {/* RÉSULTAT DU CALCUL */}
          {executionResult && (
            <div className="space-y-4 pt-4 border-t border-slate-800 animate-fadeIn" data-testid="canary-cross-result-container">
              
              {/* ÉCHEC / BLOCAGE COMPLET */}
              {!executionResult.success && (
                <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 space-y-2" data-testid="cross-blocked-alert">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>Croisement bloqué : [{executionResult.errorCode}]</span>
                  </div>
                  <p className="text-xs text-red-200">
                    {executionResult.message}
                  </p>
                  {executionResult.faultyParent && (
                    <div className="text-3xs text-red-300 font-mono">
                      Parent concerné : {executionResult.faultyParent}
                    </div>
                  )}
                </div>
              )}

              {/* SUCCÈS OU RÉSULTAT PARTIEL / CALCULÉ */}
              {executionResult.success && (
                <div className="space-y-4">
                  {/* BANNIÈRE DE STATUT UI */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        executionResult.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        executionResult.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        executionResult.status === 'BLOCKED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        executionResult.status === 'HUMAN_REVIEW_REQUIRED' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        'bg-slate-700/20 text-slate-300 border border-slate-700'
                      }`}>
                        {executionResult.status === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Statut du croisement :</span>
                          <span 
                            className={`px-2 py-0.5 rounded-full text-3xs font-mono font-bold ${
                              executionResult.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                              executionResult.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                              executionResult.status === 'BLOCKED' ? 'bg-red-500/20 text-red-400' :
                              executionResult.status === 'HUMAN_REVIEW_REQUIRED' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-slate-800 text-slate-300'
                            }`}
                            data-testid="bridge-status-badge"
                          >
                            {executionResult.status}
                          </span>
                        </div>
                        <p className="text-3xs text-slate-400 mt-0.5">
                          Calcul déterministe • Loci indépendants modélisés : {executionResult.locusResults.length}
                        </p>
                      </div>
                    </div>

                    {executionResult.humanReviewRequired && (
                      <div className="shrink-0" data-testid="bridge-human-review-pill">
                        <HumanReviewBadge required={true} language={language} />
                      </div>
                    )}
                  </div>

                  {/* DÉCOMPOSITION PÉDAGOGIQUE DU CROISEMENT (Étape 8) */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3" data-testid="cross-pedagogical-breakdown">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Layers className="w-4 h-4 text-amber-400" />
                      <span>Décomposition des facettes du croisement</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-3xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-bold text-slate-300 block">1. Parents analysés :</span>
                        <div className="text-slate-400">
                          <div>Parent A : <span className="text-white font-medium">{parentABird?.nom || parentABird?.bague || 'Parent A'}</span> ({parentABird?.sexe || 'Sexe non renseigné'})</div>
                          <div>Parent B : <span className="text-white font-medium">{parentBBird?.nom || parentBBird?.bague || 'Parent B'}</span> ({parentBBird?.sexe || 'Sexe non renseigné'})</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-bold text-slate-300 block">2. Loci modélisés :</span>
                        <span className="text-slate-400">
                          {executionResult.locusResults.length} locus indépendants calculés par le moteur officiel.
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-bold text-slate-300 block">3. Informations manquantes :</span>
                        <span className="text-slate-400">
                          {executionResult.warnings.length > 0
                            ? 'Certains loci non renseignés ou sous statut UNKNOWN/NOT_TESTED chez les parents limitent la précision des prévisions.'
                            : 'Tous les loci pertinents des deux parents sont documentés.'}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                        <span className="font-bold text-slate-300 block">4. Limites du calcul :</span>
                        <span className="text-slate-400">
                          Modèle génétique théorique mendélien sans prise en compte des facteurs environnementaux, de la viabilité post-natale ou de l'épigénétique.
                        </span>
                      </div>
                    </div>
                    <p className="text-3xs text-slate-400 italic pt-1 border-t border-slate-800/80">
                      Rappel déontologique : Les résultats sont purement informatifs et probabilistes. Bird Academy ne formule aucune recommandation d'accouplement ni jugement de valeur (« bon/mauvais accouplement » proscrits).
                    </p>
                  </div>

                  {/* ALERTES DE RISQUE LÉTAL (SECTION 13) */}
                  {executionResult.lethalRisks.length > 0 && (
                    <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/80 space-y-2" data-testid="lethal-risks-box">
                      <div className="flex items-center gap-2 text-red-400 font-extrabold text-xs">
                        <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                        <span>Alerte létalité embryonnaire in ovo à 25% (Duncker / Hutt)</span>
                      </div>
                      {executionResult.lethalRisks.map((risk, idx) => (
                        <div key={idx} className="text-xs text-red-200 bg-red-900/20 p-2.5 rounded-xl border border-red-800/40 space-y-1">
                          <div className="font-bold flex items-center justify-between">
                            <span>{risk.displayName} ({risk.locusId})</span>
                            <span className="font-mono text-3xs px-2 py-0.5 bg-red-950 rounded border border-red-800">
                              Génotype létal : {risk.lethalGenotype} • Risque théorique : 25%
                            </span>
                          </div>
                          <p className="text-3xs text-red-300">{risk.warning}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ALERTES DE LOCI BLOQUÉS (SECTION 9) */}
                  {executionResult.blockedLoci.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 space-y-2" data-testid="blocked-loci-box">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <ShieldAlert className="w-4 h-4" />
                        <span>Loci sous controverse ou bloqués ({executionResult.blockedLoci.length})</span>
                      </div>
                      <p className="text-3xs text-amber-200">
                        Les loci suivants font l'objet d'un conflit scientifique actif. Le moteur désactive le calcul automatique pour ces loci sans empêcher les loci indépendants calculables :
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {executionResult.blockedLoci.map(locusKey => (
                          <span key={locusKey} className="px-2.5 py-1 rounded-lg bg-amber-900/30 border border-amber-700/60 text-amber-300 font-mono text-3xs">
                            {locusKey} (BLOCKED)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AVERTISSEMENTS GLOBAUX */}
                  {executionResult.warnings.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5" data-testid="bridge-warnings-box">
                      <div className="text-3xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Avertissements et réserves scientifiques ({executionResult.warnings.length})
                      </div>
                      <ul className="text-3xs text-slate-300 space-y-1 list-disc list-inside ps-1">
                        {executionResult.warnings.map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* LISTE DES RÉSULTATS PAR LOCUS */}
                  <div className="space-y-3">
                    <div className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Résultats par locus canonique</span>
                      <span className="font-mono text-3xs text-slate-500">
                        {executionResult.locusResults.length} locus analysé(s)
                      </span>
                    </div>

                    <div className="space-y-3">
                      {executionResult.locusResults.map((locus) => (
                        <div 
                          key={locus.locusId}
                          className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3"
                          data-testid={`locus-result-${locus.locusId}`}
                        >
                          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                            <div>
                              <div className="font-bold text-xs text-white flex items-center gap-2">
                                <span>{locus.displayName}</span>
                                <span className="font-mono text-3xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  {locus.locusId}
                                </span>
                              </div>
                              <div className="text-3xs text-slate-400 mt-0.5">
                                Modèle d'hérédité : <span className="font-semibold text-slate-300">{locus.inheritanceModel}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {locus.blocked ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-3xs font-bold border border-red-500/30">
                                  BLOCKED
                                </span>
                              ) : locus.epistemicStatus === 'PROVISIONAL' ? (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-3xs font-bold border border-purple-500/30">
                                  PROVISIONAL
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-3xs font-bold border border-emerald-500/30">
                                  {locus.determination}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* DESCENDANTS POSSIBLES */}
                          {locus.possibleOffspringStates.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-3xs font-extrabold uppercase tracking-wider text-slate-400">
                                Descendance théorique :
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {locus.possibleOffspringStates.map((offspring, oIdx) => (
                                  <div 
                                    key={oIdx}
                                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 text-3xs space-y-1"
                                  >
                                    <div className="flex items-center justify-between font-bold">
                                      <span className={offspring.sex === 'MALE' ? 'text-blue-400' : offspring.sex === 'FEMALE' ? 'text-pink-400' : 'text-slate-300'}>
                                        {offspring.sex === 'MALE' ? '♂ Mâle' : offspring.sex === 'FEMALE' ? '♀ Femelle' : 'Tous sexes'}
                                      </span>
                                      <span className="font-mono text-amber-400">
                                        {typeof offspring.probability === 'number' ? `${(offspring.probability * 100).toFixed(1)}%` : offspring.probability}
                                      </span>
                                    </div>
                                    <div className="text-white font-medium">
                                      {offspring.phenotypeDescription}
                                    </div>
                                    <div className="text-slate-500 font-mono">
                                      Allèles : [{offspring.alleles.join(', ')}]
                                    </div>
                                    {offspring.scenarioPhase && (
                                      <div className="text-purple-300 font-mono text-3xs pt-0.5">
                                        Scénario Haplotype : {offspring.scenarioPhase}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* EVIDENCE IDS TRAÇABLES */}
                          {locus.evidenceIds.length > 0 && (
                            <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-3xs text-slate-400">
                              <span className="font-bold">Preuves scellées :</span>
                              <div className="flex flex-wrap gap-1">
                                {locus.evidenceIds.map(eid => (
                                  <span key={eid} className="font-mono text-3xs px-1.5 py-0.2 bg-slate-900 text-indigo-300 rounded border border-indigo-900/60">
                                    {eid}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default CanaryCrossSimulator;
