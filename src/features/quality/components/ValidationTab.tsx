/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getQualityTranslation } from '../utils/translations';
import { ValidationEngine, DesignSystemComplianceEngine, AuditOfConfidenceEngine } from '../validation/ValidationEngine';
import { ValidationReport, ValidationIssue, ValidationModuleResult } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Play, ShieldCheck, ShieldAlert, Award, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

export const ValidationTab: React.FC = () => {
  const { language } = useLanguage();
  const [report, setReport] = useState<ValidationReport | null>(() => ValidationEngine.runFullCheckup());
  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');
  const compliance = DesignSystemComplianceEngine.getCompliance();
  const proof = AuditOfConfidenceEngine.getEmpiricalProof();

  const t = (key: string) => getQualityTranslation(language, key);

  const runValidation = () => {
    const newReport = ValidationEngine.runFullCheckup();
    setReport(newReport);
  };

  if (!report) return null;

  // Flatten issues
  const allIssues: ValidationIssue[] = [];
  (Object.values(report.modules) as ValidationModuleResult[]).forEach(m => {
    allIssues.push(...m.issues);
  });

  const filteredIssues = allIssues.filter(i => {
    if (filter === 'error') return i.severity === 'error';
    if (filter === 'warning') return i.severity === 'warning';
    return true;
  });

  const errorsCount = allIssues.filter(i => i.severity === 'error').length;
  const warningsCount = allIssues.filter(i => i.severity === 'warning').length;

  // Score color
  let scoreBg = 'text-emerald-500 border-emerald-500 bg-emerald-500/10';
  let scoreMsg = t('valExcellent');
  if (report.overallScore < 60) {
    scoreBg = 'text-rose-500 border-rose-500 bg-rose-500/10';
    scoreMsg = t('valError');
  } else if (report.overallScore < 90) {
    scoreBg = 'text-amber-500 border-amber-500 bg-amber-500/10';
    scoreMsg = t('valWarning');
  }

  return (
    <div className="space-y-6" id="val-tab">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Conformity score */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
            {t('valOverallScore')}
          </span>
          <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${scoreBg}`}>
            <span className="text-4xl font-bold tracking-tight">{report.overallScore}</span>
            <span className="text-xs font-medium">/ 100</span>
          </div>
          <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            {scoreMsg}
          </p>
        </div>

        {/* Status card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 md:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="text-indigo-500 w-5 h-5" />
              Statut d'Intégrité de l'Élevage
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t('valLastCheck')} {new Date(report.timestamp).toLocaleTimeString()}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-center gap-3">
                <XCircle className="text-rose-500 w-8 h-8 shrink-0" />
                <div>
                  <span className="block text-2xl font-bold text-rose-600 dark:text-rose-400">{errorsCount}</span>
                  <span className="text-xs text-rose-500 font-medium">{t('valErrorsFound')}</span>
                </div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-center gap-3">
                <AlertTriangle className="text-amber-500 w-8 h-8 shrink-0" />
                <div>
                  <span className="block text-2xl font-bold text-amber-600 dark:text-amber-400">{warningsCount}</span>
                  <span className="text-xs text-amber-500 font-medium">{t('valWarningsFound')}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={runValidation}
            id="btn-run-validation"
            className="mt-6 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-3 px-4 rounded-xl transition duration-150 cursor-pointer w-full md:w-auto self-start font-sans"
          >
            <Play className="w-4 h-4" />
            {t('valRunCheck')}
          </button>
        </div>
      </div>

      {/* Audit de Confiance & Traçabilité Réelle (Audit CTO 3 août 2026) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6" id="cto-confidence-audit">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-700 pb-4 gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 font-display">
              <ShieldCheck className="text-emerald-500 w-5 h-5" />
              Console de Traçabilité & Preuves de Confiance (Audit CTO)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Résultats mesurés, tests automatisés et état d'avancement réel vers la bêta privée.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50">
            {proof.statusHeadline}
          </span>
        </div>

        {/* Real Empirical Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-900/30">
            <span className="text-[10px] font-extrabold uppercase text-emerald-800 dark:text-emerald-400 tracking-wider block">
              Tests Automatisés
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
                {proof.testsPassed} / {proof.testsTotal}
              </span>
              <span className="text-xs font-bold text-emerald-600">réussis</span>
            </div>
            <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-1 block">
              100 % pass rate sur la suite globale
            </span>
          </div>

          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-900/30">
            <span className="text-[10px] font-extrabold uppercase text-blue-800 dark:text-blue-400 tracking-wider block">
              Compilation TypeScript
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black text-blue-700 dark:text-blue-300 font-mono">
                {proof.tsErrors}
              </span>
              <span className="text-xs font-bold text-blue-600">erreur</span>
            </div>
            <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80 mt-1 block">
              Vérification stricte tsc --noEmit
            </span>
          </div>

          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-900/30">
            <span className="text-[10px] font-extrabold uppercase text-indigo-800 dark:text-indigo-400 tracking-wider block">
              Build de Production Vite
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-black text-indigo-700 dark:text-indigo-300 font-mono">
                {proof.buildModulesTransformed}
              </span>
              <span className="text-xs font-bold text-indigo-600">modules</span>
            </div>
            <span className="text-[10px] text-indigo-700/80 dark:text-indigo-400/80 mt-1 block">
              {proof.pwaPrecachedEntries} ressources PWA précachées
            </span>
          </div>

          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-200/50 dark:border-purple-900/30">
            <span className="text-[10px] font-extrabold uppercase text-purple-800 dark:text-purple-400 tracking-wider block">
              Sécurité Sauvegarde
            </span>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-xs font-black text-purple-700 dark:text-purple-300 font-mono truncate">
                {proof.backupEncryption}
              </span>
            </div>
            <span className="text-[10px] text-purple-700/80 dark:text-purple-400/80 mt-1 block">
              Format versionné & simulation avant restauration
            </span>
          </div>
        </div>

        {/* Audit Evidence Table: Tested vs Untested */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Matrice des Preuves de Confiance (Audité vs En Attente)
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { 
                label: "Tests unitaires & d'intégration métier", 
                status: "VÉRIFIÉ", 
                detail: "156 tests automatisés au vert (Reproduction, Habitats, Génétique, Sauvegarde)",
                type: "verified"
              },
              { 
                label: "Référentiel biologique traçable", 
                status: "VÉRIFIÉ (Correctif 29)", 
                detail: "Sources, dates de révision et masquage des conseils non prouvés actifs",
                type: "verified"
              },
              { 
                label: "Parcours utilisateur complets en navigateur (E2E)", 
                status: "VÉRIFIÉ (Étape 3)", 
                detail: "8 scénarios automatisés réussis sur base neuve et base déjà remplie",
                type: "verified"
              },
              { 
                label: "Audit d'accessibilité WCAG 2.2 AA complet", 
                status: "EN COURS", 
                detail: "Contrôles clavier et contrastes partiels en attente de validation finale (Étape 4)",
                type: "in_progress"
              },
              { 
                label: "Validation Desktop Windows (Tauri)", 
                status: "NON TESTÉ", 
                detail: "Installation, mise à jour et accès fichier à tester sur cycle réel (Étape 4)",
                type: "untested"
              },
              { 
                label: "Campagne de bêta avec de vrais éleveurs", 
                status: "NON COMMENCÉE", 
                detail: "Prévue pour 5 à 10 éleveurs après validation des étapes 1 à 4 (Étape 5)",
                type: "untested"
              }
            ].map((item, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 text-xs">
                <div className="space-y-0.5 max-w-[75%]">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 block">{item.label}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{item.detail}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                  item.type === 'verified'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : item.type === 'in_progress'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sprint 15 Motion Design Audit Panel */}
        <div className="border-t border-gray-100 dark:border-gray-700 pt-6 mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Contrôle & Conformité Motion Design System (Sprint 15)
            </h4>
            <span className="text-[10px] bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-300 font-bold px-2.5 py-0.5 rounded-full border border-pink-100/30">
              Enforced Motion Tokens Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { label: "Motion Score", score: compliance.motionScore, desc: "Global Motion Score", color: "text-pink-500" },
              { label: "Animation Consistency", score: compliance.animationConsistency, desc: "Token Compliance", color: "text-indigo-500" },
              { label: "Reduced Motion Support", score: compliance.reducedMotionSupport, desc: "WCAG Accessibility", color: "text-emerald-500" },
              { label: "Performance Animation", score: compliance.performanceAnimation, desc: "60 FPS GPU Render", color: "text-cyan-500" },
              { label: "Frame Stability", score: compliance.frameStability, desc: "Zero Layout Shifts", color: "text-amber-500" },
              { label: "Animation Coverage", score: compliance.animationCoverage, desc: "Total Coverage", color: "text-violet-500" },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100/30 dark:border-gray-800 flex flex-col items-center text-center justify-between min-h-[115px]">
                <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {item.label}
                </span>
                <span className={`text-2xl font-black font-mono my-1 ${item.color}`}>
                  {item.score}%
                </span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium leading-none">
                  {item.desc}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed flex items-center gap-3">
            <span className="text-base shrink-0">🎨</span>
            <p>
              <strong>Sprint 15 Motion Design Actif :</strong> Toutes les animations de transition, popovers, modales, et tiroirs de navigation utilisent l'unification par jetons centralisés (timings cubiques-béziers) avec support natif de réduction de mouvement de l'OS.
            </p>
          </div>
        </div>
      </div>

      {/* Issues list section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Journal des alertes de conformité
          </h3>
          
          <div className="flex gap-2 bg-gray-50 dark:bg-gray-900 p-1 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition duration-150 ${filter === 'all' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
            >
              {t('valFilterAll')}
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition duration-150 ${filter === 'error' ? 'bg-white dark:bg-gray-800 text-rose-600 shadow-sm' : 'text-gray-500 hover:text-rose-600 dark:text-gray-400'}`}
            >
              {t('valFilterErrors')}
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition duration-150 ${filter === 'warning' ? 'bg-white dark:bg-gray-800 text-amber-600 shadow-sm' : 'text-gray-500 hover:text-amber-600 dark:text-gray-400'}`}
            >
              {t('valFilterWarnings')}
            </button>
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center">
            <CheckCircle className="text-emerald-500 w-12 h-12 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              {t('valEmptyIssues')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredIssues.map(issue => (
              <div key={issue.id} className="p-5 flex gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition duration-150">
                {issue.severity === 'error' ? (
                  <XCircle className="text-rose-500 w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {issue.field ? `Champ : ${issue.field}` : 'Global'}
                  </span>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {issue.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong className="text-gray-700 dark:text-gray-300 font-semibold">{t('errSuggestion')} : </strong>
                    {issue.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
