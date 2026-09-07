/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, CheckCircle, TrendingUp, HelpCircle, Shield, Award, Heart } from 'lucide-react';

// --- CONFIDENCE BADGE ---
interface ConfidenceBadgeProps {
  level: 'high' | 'medium' | 'low';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ level }) => {
  const styles = {
    high: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      text: 'text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900',
      label: 'Élevé'
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      text: 'text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900',
      label: 'Moyen'
    },
    low: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      text: 'text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900',
      label: 'Faible'
    }
  };

  const current = styles[level] || styles.medium;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${current.bg} ${current.text}`}>
      <Shield className="w-3 h-3" />
      <span>{current.label}</span>
    </span>
  );
};

// --- HEALTH INDICATOR ---
interface HealthIndicatorProps {
  score: number;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ score }) => {
  const getColor = () => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-teal-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${getColor()}`} />
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {score >= 85 ? 'Clinique stable' : score >= 50 ? 'Surveillance légère' : 'Vigilance critique'}
      </span>
    </div>
  );
};

// --- PROGRESS SCORE ---
interface ProgressScoreProps {
  score: number;
}

export const ProgressScore: React.FC<ProgressScoreProps> = ({ score }) => {
  const getGradient = () => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 50) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-500';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        <span>Performance globale</span>
        <span>{score}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${getGradient()} transition-all duration-1000`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

// --- SCORE CARD ---
interface ScoreCardProps {
  title: string;
  score: number;
  summary: string;
  explanation: string;
  icon: React.ComponentType<any>;
  color: 'emerald' | 'amber' | 'rose' | 'indigo';
  confidence: 'high' | 'medium' | 'low';
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  score,
  summary,
  explanation,
  icon: Icon,
  color,
  confidence
}) => {
  const colors = {
    emerald: {
      border: 'border-emerald-100 dark:border-emerald-900',
      text: 'text-emerald-700 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    amber: {
      border: 'border-amber-100 dark:border-amber-900',
      text: 'text-amber-700 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/30'
    },
    rose: {
      border: 'border-rose-100 dark:border-rose-900',
      text: 'text-rose-700 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/30'
    },
    indigo: {
      border: 'border-indigo-100 dark:border-indigo-900',
      text: 'text-indigo-700 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/30'
    }
  };

  const selectedColor = colors[color] || colors.emerald;

  return (
    <div className={`p-5 bg-white dark:bg-slate-900 rounded-2xl border ${selectedColor.border} shadow-xs hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${selectedColor.iconBg} ${selectedColor.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-right">
          <div className={`text-2xl font-black ${selectedColor.text}`}>{score}%</div>
          <ConfidenceBadge level={confidence} />
        </div>
      </div>
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{title}</h3>
      <p className="text-[11px] font-semibold text-slate-500 mb-2">{summary}</p>
      <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">{explanation}</p>
    </div>
  );
};

// --- ALERT CARD ---
interface AlertCardProps {
  title: string;
  priority: 'high' | 'medium' | 'low';
  explanation: string;
  recommendation: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  priority,
  explanation,
  recommendation
}) => {
  const isHigh = priority === 'high';

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isHigh 
        ? 'bg-rose-50/60 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900' 
        : 'bg-amber-50/60 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900'
    }`}>
      <div className="flex gap-3">
        <div className={`p-1.5 rounded-lg h-fit ${isHigh ? 'text-rose-600 bg-rose-100' : 'text-amber-600 bg-amber-100'}`}>
          <AlertCircle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center gap-2 mb-1.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{title}</h4>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
              isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isHigh ? 'Critique' : 'Attention'}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 mb-2">{explanation}</p>
          <div className="p-2.5 bg-white/75 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800/80">
            <div className="text-[9px] font-bold uppercase tracking-wide text-indigo-600 mb-0.5">Action DSS recommandée</div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">{recommendation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- RECOMMENDATION CARD ---
interface RecommendationCardProps {
  title: string;
  priority: 'high' | 'medium' | 'low';
  explanation: string;
  recommendation: string;
  category: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  priority,
  explanation,
  recommendation,
  category
}) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-start gap-4">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[9px] font-bold uppercase tracking-wider">
            {category}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
            priority === 'high' ? 'bg-red-100 text-red-800' : priority === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'
          }`}>
            {priority}
          </span>
        </div>
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{title}</h4>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-2.5">{explanation}</p>
        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/10 p-2.5 rounded-lg border border-emerald-100/40">
          ✓ {recommendation}
        </div>
      </div>
    </div>
  );
};
