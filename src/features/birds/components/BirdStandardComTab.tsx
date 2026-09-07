/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Award, CheckCircle2, Sliders, Save, RotateCcw, ShieldAlert, Sparkles, FileText, Calendar } from 'lucide-react';
import { Canari } from '../../../types';
import { COM_CRITERIA_DEFINITIONS, ComEvaluation } from '../models/passport';
import { PassportDataService } from '../services/PassportDataService';
import { AppButton, AppInput, AppCard } from '../../../components/design-system';
import { useLanguage } from '../../../context/LanguageContext';
import { getBiologicalProfileById } from '../../../reference/species/index';
import { getSpeciesById } from '../../../data/speciesRegistry';

export interface BirdStandardComTabProps {
  bird: Canari;
}

export const BirdStandardComTab: React.FC<BirdStandardComTabProps> = ({ bird }) => {
  const { t, language, isRtl } = useLanguage();
  const [evaluation, setEvaluation] = useState<ComEvaluation>(() => 
    PassportDataService.getComEvaluation(bird.id, bird)
  );
  const [isSavedToast, setIsSavedToast] = useState(false);

  // Reload when bird id changes
  useEffect(() => {
    setEvaluation(PassportDataService.getComEvaluation(bird.id, bird));
  }, [bird.id]);

  // Resolve species name for dynamic homologation text
  const resolvedSpeciesId = bird.espece || (bird as any).speciesId || (bird as any).species;
  const bioProfile = resolvedSpeciesId ? getBiologicalProfileById(resolvedSpeciesId) : undefined;
  const speciesMeta = resolvedSpeciesId ? getSpeciesById(resolvedSpeciesId) : undefined;
  const speciesName = bioProfile?.identity?.names?.[language] 
    || (speciesMeta ? t(speciesMeta.nameKey) : '')
    || t('speciesCanari');

  const totalScore = useMemo(() => {
    return Object.values(evaluation.scores).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0);
  }, [evaluation.scores]);

  const medalTier = useMemo(() => {
    return PassportDataService.computeMedalTier(totalScore);
  }, [totalScore]);

  const handleScoreChange = (criteriaId: string, value: number, maxPoints: number) => {
    const clamped = Math.max(0, Math.min(maxPoints, value));
    setEvaluation(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [criteriaId]: clamped
      }
    }));
  };

  const handleSave = () => {
    PassportDataService.saveComEvaluation(evaluation);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const handleResetToDefault = () => {
    const defaultScores = PassportDataService.getDefaultCriteriaScores(bird);
    const total = Object.values(defaultScores).reduce((acc, s) => acc + s, 0);
    setEvaluation({
      birdId: bird.id,
      date: new Date().toISOString().split('T')[0],
      judgeName: 'Juge C.O.M.',
      showName: 'Standard',
      scores: defaultScores,
      totalScore: total,
      medalTier: PassportDataService.computeMedalTier(total),
      comments: '',
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Overview Banner with Total Score & Medal Tier */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-2xs font-extrabold uppercase tracking-widest flex items-center gap-1">
                <Award className="w-3 h-3" />
                {t('officialComStandard')}
              </span>
              <span className="text-3xs text-slate-400 font-mono">
                {t('scoringScale')}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {t('scoringGrid')}
            </h3>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              {t('scoreComForSpecies', { species: speciesName, breed: bird.race || speciesName })}
            </p>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shrink-0">
            <div className="text-center">
              <div className="text-4xl font-black font-mono tracking-tight text-white flex items-baseline justify-center">
                <span className={totalScore >= 90 ? 'text-amber-400' : totalScore >= 85 ? 'text-emerald-400' : 'text-slate-200'}>
                  {totalScore}
                </span>
                <span className="text-base text-slate-400 font-normal ml-1">/100</span>
              </div>
              <div className="text-3xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                {t('score')} C.O.M.
              </div>
            </div>

            <div className="h-12 w-px bg-slate-800" />

            <div className="text-center">
              <div className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider border flex items-center gap-1.5 ${
                medalTier === 'Gold'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-lg shadow-amber-500/10'
                  : medalTier === 'Silver'
                    ? 'bg-slate-300/20 text-slate-200 border-slate-400/50'
                    : medalTier === 'Bronze'
                      ? 'bg-amber-700/20 text-amber-400 border-amber-600/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                <Award className="w-4 h-4" />
                <span>
                  {medalTier === 'Gold' ? `${t('tierGold')} (>=90)` : medalTier === 'Silver' ? `${t('tierSilver')} (88-89)` : medalTier === 'Bronze' ? `${t('tierBronze')} (85-87)` : t('tierNone')}
                </span>
              </div>
              <div className="text-3xs text-slate-400 font-mono mt-1">
                {medalTier !== 'None' ? t('optimal') : t('tierNone')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Criteria Breakdown Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>{t('scoringGrid')} (7 rubriques)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t('resetStandard')}
            </button>
            <AppButton
              variant="primary"
              size="sm"
              onClick={handleSave}
              startIcon={<Save className="w-3.5 h-3.5" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              {t('saveEvaluation')}
            </AppButton>
          </div>
        </div>

        {/* Criteria Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {COM_CRITERIA_DEFINITIONS.map(criteria => {
            const currentPoints = evaluation.scores[criteria.id] !== undefined ? evaluation.scores[criteria.id] : criteria.maxPoints * 0.9;
            const percentage = Math.round((currentPoints / criteria.maxPoints) * 100);

            return (
              <div 
                key={criteria.id} 
                className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs text-white leading-tight">
                      {criteria.name}
                    </h4>
                    <p className="text-3xs text-slate-400 mt-0.5 leading-snug">
                      {criteria.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-black font-mono text-emerald-400">
                      {currentPoints}
                    </span>
                    <span className="text-xs font-mono text-slate-400"> / {criteria.maxPoints} pts</span>
                  </div>
                </div>

                {/* Range Slider & Progress Bar */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min="0"
                    max={criteria.maxPoints}
                    step="1"
                    value={currentPoints}
                    onChange={(e) => handleScoreChange(criteria.id, parseInt(e.target.value, 10), criteria.maxPoints)}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-3xs font-mono text-slate-400">
                    <span>0 pt</span>
                    <span>{percentage}%</span>
                    <span>Max {criteria.maxPoints} pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Judge Notes & Metadata Form */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <AppInput
            label={language === 'fr' ? 'Juge évaluateur / Référent' : language === 'ar' ? 'الحكم / المقيم' : 'Evaluating Judge'}
            value={evaluation.judgeName || ''}
            onChange={(e) => setEvaluation(prev => ({ ...prev, judgeName: e.target.value }))}
            placeholder="ex. OMJ/COM Judge"
          />

          <AppInput
            label={language === 'fr' ? 'Événement / Exposition' : language === 'ar' ? 'المسابقة / المعرض' : 'Show / Event'}
            value={evaluation.showName || ''}
            onChange={(e) => setEvaluation(prev => ({ ...prev, showName: e.target.value }))}
            placeholder="ex. National Show"
          />

          <AppInput
            label={language === 'fr' ? "Date d'évaluation" : language === 'ar' ? 'تاريخ التقييم' : 'Evaluation Date'}
            type="date"
            value={evaluation.date || ''}
            onChange={(e) => setEvaluation(prev => ({ ...prev, date: e.target.value }))}
          />

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-400">
              {language === 'fr' ? 'Commentaires et observations du juge' : language === 'ar' ? 'ملاحظات وتعليقات الحكم' : 'Judge Comments & Observations'}
            </label>
            <textarea
              value={evaluation.comments || ''}
              onChange={(e) => setEvaluation(prev => ({ ...prev, comments: e.target.value }))}
              rows={3}
              placeholder=""
              className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-xl p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Save confirmation toast */}
        {isSavedToast && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t('evaluationSaved')}</span>
          </div>
        )}

      </div>

    </div>
  );
};

export default BirdStandardComTab;
