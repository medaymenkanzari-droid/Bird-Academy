/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — PROBLEM & SOLUTION SECTION
 * "Du Carnet Papier à l'Excellence Avicole"
 */

import React from 'react';
import { useWebLanguage } from '../../i18n';
import { 
  XCircle, CheckCircle2, AlertTriangle, ShieldCheck, 
  FileText, Smartphone, Flame, Dna, FileCheck, ArrowRight, ArrowLeft
} from 'lucide-react';

export const ProblemSolutionSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();

  return (
    <section 
      className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="problem-solution-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="text-xs font-black tracking-widest text-[#2e3a8c] dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            {t('problemSolution.tag')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('problemSolution.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal">
            {t('problemSolution.subtitle')}
          </p>
        </div>

        {/* 2-Column Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Traditional Challenges: Handwritten Notebook */}
          <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {t('problemSolution.problemTitle')}
                  </h3>
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                    {t('problemSolution.problemSubtitle')}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/60 border border-rose-200/60 dark:border-rose-900/30 text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                « Les notes raturées sur un cahier poussiéreux ne protègent ni vos champions, ni la pérennité de votre travail de sélection génétique. »
              </div>

              <ul className="space-y-3.5 pt-2">
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{t('problemSolution.problem1')}</span>
                </li>
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{t('problemSolution.problem2')}</span>
                </li>
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span>{t('problemSolution.problem3')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs text-rose-700 dark:text-rose-400 font-bold">
              <span>Risque élevé d'extinction de souche</span>
              <span className="font-mono text-[11px] bg-rose-200/60 dark:bg-rose-900/60 px-2 py-0.5 rounded">Zéro Sauvegarde</span>
            </div>
          </div>

          {/* Bird Academy Elite Solution: Digital Mobile in Aviary */}
          <div className="p-6 sm:p-8 rounded-3xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {t('problemSolution.solutionTitle')}
                  </h3>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    {t('problemSolution.solutionSubtitle')}
                  </div>
                </div>
              </div>

              {/* In Situ Photograph of Smartphone in Aviary */}
              <div className="relative rounded-2xl overflow-hidden border border-emerald-200 dark:border-emerald-800 shadow-md">
                <img 
                  src="./assets/images/mobile-in-aviary.jpg" 
                  alt="Application Bird Academy utilisée sur smartphone directement en volière devant les cages" 
                  className="w-full h-44 object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute bottom-2 inset-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 text-white backdrop-blur-sm flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Saisie instantanée au perchoir
                  </span>
                  <span className="text-[#ffc107] font-mono text-[10px]">100% Hors-Ligne</span>
                </div>
              </div>

              <ul className="space-y-3.5 pt-1">
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t('problemSolution.solution1')}</span>
                </li>
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t('problemSolution.solution2')}</span>
                </li>
                <li className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{t('problemSolution.solution3')}</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              <span>Souveraineté totale & Sécurité des lignées</span>
              <span className="font-mono text-[11px] bg-emerald-200/60 dark:bg-emerald-900/60 px-2 py-0.5 rounded">Scellé AES-256</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
