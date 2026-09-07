/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertOctagon, Info, 
  GitBranch, Users, HelpCircle 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export interface CommonAncestorItem {
  name: string;
  ringNumber: string;
  generation?: string;
  contribution?: number; // e.g. 12.5 (%) or 0.125
  paths?: string[];
}

export interface WrightConsanguinityGaugeProps {
  /**
   * Wright's inbreeding coefficient (F).
   * Accepts percentage (0 - 100) or decimal ratio (0 - 1).
   * If null/undefined or negative, treated as uncalculated/insufficient pedigree.
   */
  coefficient: number | null | undefined;
  /**
   * List of detected common ancestors between the pair.
   */
  commonAncestors?: CommonAncestorItem[];
  /**
   * Pedigree coverage score (0 - 100 %).
   */
  coverage?: number;
  /**
   * Max depth of pedigree evaluated (generations).
   */
  depth?: number;
  /**
   * Display size of the gauge.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Display format variant.
   */
  variant?: 'radial' | 'bar' | 'compact' | 'card';
  /**
   * Optional custom card title.
   */
  title?: string;
  /**
   * Optional custom subtitle.
   */
  subtitle?: string;
  /**
   * Whether to show common ancestors breakdown list if any exist. Default: true.
   */
  showAncestorsList?: boolean;
  /**
   * Whether to show the scientific scale legend. Default: false.
   */
  showScaleGuide?: boolean;
  /**
   * Extra container class names.
   */
  className?: string;
}

export const WrightConsanguinityGauge: React.FC<WrightConsanguinityGaugeProps> = ({
  coefficient,
  commonAncestors = [],
  coverage,
  depth,
  size = 'md',
  variant = 'card',
  title,
  subtitle,
  showAncestorsList = true,
  showScaleGuide = false,
  className = '',
}) => {
  const { currentLanguage, isRtl } = useLanguage();

  // Normalize coefficient: 0..1 ratio to 0..100 percentage, or keep 0..100 percentage
  const normalizedValue = useMemo<number | null>(() => {
    if (coefficient === null || coefficient === undefined || isNaN(coefficient) || coefficient < 0) {
      return null;
    }
    // If between 0 and 1 exclusive (and not equal to 0), treat as decimal ratio unless specified otherwise
    if (coefficient > 0 && coefficient <= 1) {
      return parseFloat((coefficient * 100).toFixed(2));
    }
    return parseFloat(coefficient.toFixed(2));
  }, [coefficient]);

  // Determine risk category & semantic tokens
  // Safe (< 5%): Emerald-500 (#10B981) with "Sécurisé" badge
  // Moderate (5% - 12.5%): Amber-500 (#F59E0B) with "Vigilance / Modéré" badge
  // Critical (> 12.5%): Rose-500 (#EF4444) with "Risque Élevé / Critique" alert
  const semantic = useMemo(() => {
    if (normalizedValue === null) {
      return {
        level: 'unknown',
        label: currentLanguage === 'fr' ? 'Données insuffisantes' : currentLanguage === 'es' ? 'Datos insuficientes' : currentLanguage === 'it' ? 'Dati insufficienti' : currentLanguage === 'ar' ? 'بيانات غير كافية' : 'Insufficient Data',
        badgeText: currentLanguage === 'fr' ? 'Non calculable' : currentLanguage === 'es' ? 'No calculable' : currentLanguage === 'it' ? 'Non calcolabile' : currentLanguage === 'ar' ? 'غير قابل للحساب' : 'Uncalculable',
        badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
        strokeColor: '#64748B', // slate-500
        textColor: 'text-slate-400',
        bgPill: 'bg-slate-800/80 text-slate-300',
        cardBorder: 'border-slate-800',
        alertBg: 'bg-slate-800/40 text-slate-300 border-slate-700/60',
        icon: HelpCircle,
        recommendation: currentLanguage === 'ar' 
          ? 'شجرة أنساب غير مكتملة للأجيال الثلاثة السابقة.' 
          : currentLanguage === 'es' 
          ? 'Árbol genealógico incompleto en las últimas 3 generaciones.' 
          : currentLanguage === 'it' 
          ? 'Albero genealogico incompleto sulle ultime 3 generazioni.' 
          : currentLanguage === 'fr' 
          ? 'Généalogie incomplète sur les 3 dernières générations.' 
          : 'Incomplete pedigree on previous generations.',
      };
    }

    if (normalizedValue < 5) {
      return {
        level: 'safe',
        label: currentLanguage === 'fr' ? 'Sécurisé' : currentLanguage === 'es' ? 'Seguro' : currentLanguage === 'it' ? 'Sicuro' : currentLanguage === 'ar' ? 'آمن' : 'Safe',
        badgeText: currentLanguage === 'fr' ? 'Sécurisé' : currentLanguage === 'es' ? 'Seguro' : currentLanguage === 'it' ? 'Sicuro' : currentLanguage === 'ar' ? 'آمن' : 'Safe',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        strokeColor: '#10B981', // emerald-500
        textColor: 'text-emerald-400',
        bgPill: 'bg-emerald-500/15 text-emerald-300',
        cardBorder: 'border-emerald-500/20',
        alertBg: 'bg-emerald-950/20 text-emerald-300 border-emerald-900/40',
        icon: ShieldCheck,
        recommendation: currentLanguage === 'ar'
          ? 'قرابة في حدها الأدنى. تزاوج موصى به بشدة للحفاظ على القوة الوراثية.'
          : currentLanguage === 'es'
          ? 'Consanguinidad mínima. Apareamiento muy recomendado para el vigor genético.'
          : currentLanguage === 'it'
          ? 'Consanguineità minima. Accoppiamento altamente raccomandato per il vigore genetico.'
          : currentLanguage === 'fr'
          ? 'Consanguinité minimale. Accouplement hautement recommandé pour la vigueur génétique.'
          : 'Minimal inbreeding. Mating highly recommended for genetic vigor.',
      };
    }

    if (normalizedValue <= 12.5) {
      return {
        level: 'moderate',
        label: currentLanguage === 'fr' ? 'Vigilance / Modéré' : currentLanguage === 'es' ? 'Vigilancia / Moderado' : currentLanguage === 'it' ? 'Vigilanza / Moderato' : currentLanguage === 'ar' ? 'حذر / معتدل' : 'Moderate / Caution',
        badgeText: currentLanguage === 'fr' ? 'Vigilance / Modéré' : currentLanguage === 'es' ? 'Vigilancia / Moderado' : currentLanguage === 'it' ? 'Vigilanza / Moderato' : currentLanguage === 'ar' ? 'حذر / معتدل' : 'Moderate / Caution',
        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        strokeColor: '#F59E0B', // amber-500
        textColor: 'text-amber-400',
        bgPill: 'bg-amber-500/15 text-amber-300',
        cardBorder: 'border-amber-500/30',
        alertBg: 'bg-amber-950/30 text-amber-200 border-amber-800/50',
        icon: AlertTriangle,
        recommendation: currentLanguage === 'ar'
          ? 'قرابة معتدلة. يلزم المراقبة لتجنب تراكم العيوب الوراثية المتنحية.'
          : currentLanguage === 'es'
          ? 'Consanguinidad moderada. Monitorear para prevenir la acumulación de defectos recesivos.'
          : currentLanguage === 'it'
          ? 'Consanguineità moderata. Monitorare per prevenire l\'accumulo di difetti recessivi.'
          : currentLanguage === 'fr'
          ? 'Consanguinité modérée. Surveillance requise pour éviter l\'accumulation de tares récessives.'
          : 'Moderate inbreeding. Monitor to prevent accumulation of deleterious alleles.',
      };
    }

    return {
      level: 'critical',
      label: currentLanguage === 'fr' ? 'Risque Élevé / Critique' : currentLanguage === 'es' ? 'Riesgo Alto / Crítico' : currentLanguage === 'it' ? 'Rischio Elevato / Critico' : currentLanguage === 'ar' ? 'خطر مرتفع / حرج' : 'High Risk / Critical',
      badgeText: currentLanguage === 'fr' ? 'Risque Élevé / Critique' : currentLanguage === 'es' ? 'Riesgo Alto / Crítico' : currentLanguage === 'it' ? 'Rischio Elevato / Critico' : currentLanguage === 'ar' ? 'خطر مرتفع / حرج' : 'High Risk / Critical',
      badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      strokeColor: '#EF4444', // rose-500
      textColor: 'text-rose-400',
      bgPill: 'bg-rose-500/15 text-rose-300',
      cardBorder: 'border-rose-500/30',
      alertBg: 'bg-rose-950/40 text-rose-200 border-rose-800/60',
      icon: AlertOctagon,
      recommendation: currentLanguage === 'ar'
        ? 'خطر مرتفع لتدهور النسل بسبب القرابة (انخفاض الخصوبة والتشوهات). غير موصى به.'
        : currentLanguage === 'es'
        ? 'Alto riesgo de depresión por consanguinidad (baja fertilidad, anomalías). No recomendado.'
        : currentLanguage === 'it'
        ? 'Alto rischio di depressione da consanguineità (bassa fertilità, anomalie). Sconsigliato.'
        : currentLanguage === 'fr'
        ? 'Risque élevé de dépression de consanguinité (baisse de fécondité, anomalies). Déconseillé.'
        : 'High risk of inbreeding depression. Not recommended.',
    };
  }, [normalizedValue, currentLanguage]);

  // Gauge dimensions
  const dimensions = {
    sm: { size: 96, strokeWidth: 7, radius: 38, fontSize: 'text-lg', labelSize: 'text-[9px]' },
    md: { size: 128, strokeWidth: 8, radius: 48, fontSize: 'text-2xl', labelSize: 'text-[10px]' },
    lg: { size: 160, strokeWidth: 10, radius: 60, fontSize: 'text-3xl', labelSize: 'text-xs' },
  }[size];

  // SVG Gauge calculations
  // Max scale to render is 25% (full circle)
  const maxDisplayCoeff = 25;
  const progressRatio = normalizedValue === null ? 0 : Math.min(1, normalizedValue / maxDisplayCoeff);
  const circumference = 2 * Math.PI * dimensions.radius;
  const strokeDashoffset = circumference - circumference * progressRatio;

  const IconComponent = semantic.icon;

  // Render Compact variant
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-xs ${className}`}>
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: semantic.strokeColor }} />
        <div className="flex items-baseline gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Wright F :</span>
          <span className={`text-xs font-black font-mono ${semantic.textColor}`}>
            {normalizedValue === null ? '—' : `${normalizedValue}%`}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${semantic.badgeClass}`}>
          {semantic.badgeText}
        </span>
      </div>
    );
  }

  // Render Linear Bar variant
  if (variant === 'bar') {
    return (
      <div className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-200 shadow-xs space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-4 h-4 ${semantic.textColor}`} />
            <span className="text-xs font-bold text-slate-200 tracking-tight">
              {title || 'Coefficient de Consanguinité (Wright)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-black font-mono ${semantic.textColor}`}>
              {normalizedValue === null ? '—' : `${normalizedValue}%`}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${semantic.badgeClass}`}>
              {semantic.badgeText}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ 
              width: `${normalizedValue === null ? 0 : Math.min(100, (normalizedValue / 25) * 100)}%`,
              backgroundColor: semantic.strokeColor
            }}
          />
        </div>

        {subtitle && (
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // Default: Full Radial Card surface
  return (
    <div className={`p-5 rounded-2xl bg-slate-900 border ${semantic.cardBorder} text-slate-200 shadow-lg relative overflow-hidden ${className}`}>
      
      {/* Background ambient gradient glow */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
        style={{ backgroundColor: semantic.strokeColor }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
            <span>{title || (currentLanguage === 'ar' ? 'معامل القرابة' : currentLanguage === 'es' ? 'Coeficiente de Consanguinidad' : currentLanguage === 'it' ? 'Coefficiente di Consanguineità' : currentLanguage === 'en' ? 'Inbreeding Coefficient' : 'Coefficient de Consanguinité')}</span>
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
        
        {/* Status Badge */}
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border shrink-0 ${semantic.badgeClass}`}>
          {semantic.badgeText}
        </span>
      </div>

      {/* Gauge Section */}
      <div className="flex flex-col items-center justify-center my-2 relative z-10">
        <div className="relative" style={{ width: dimensions.size, height: dimensions.size }}>
          <svg 
            className="w-full h-full transform -rotate-90" 
            viewBox={`0 0 ${dimensions.size} ${dimensions.size}`}
          >
            {/* Background track circle */}
            <circle
              cx={dimensions.size / 2}
              cy={dimensions.size / 2}
              r={dimensions.radius}
              className="stroke-slate-950 fill-none"
              strokeWidth={dimensions.strokeWidth}
            />
            {/* Value stroke circle */}
            <circle
              cx={dimensions.size / 2}
              cy={dimensions.size / 2}
              r={dimensions.radius}
              fill="none"
              stroke={semantic.strokeColor}
              strokeWidth={dimensions.strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`${dimensions.fontSize} font-black font-mono tracking-tight text-white`}>
              {normalizedValue === null ? '—' : `${normalizedValue}%`}
            </span>
            <span className={`${dimensions.labelSize} font-bold text-slate-400 uppercase tracking-wider mt-0.5`}>
              {currentLanguage === 'ar' ? 'مؤشر F' : 'Indice F'}
            </span>
          </div>
        </div>

        {/* Evaluation note */}
        <p className="mt-3 text-xs text-center text-slate-300 max-w-xs leading-relaxed font-medium">
          {semantic.recommendation}
        </p>

        {/* Coverage & Depth chips */}
        {(coverage !== undefined || depth !== undefined) && (
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center text-[10px] font-mono text-slate-400">
            {coverage !== undefined && (
              <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                {currentLanguage === 'ar' ? 'التغطية : ' : currentLanguage === 'en' ? 'Coverage: ' : 'Couverture : '}{coverage}%
              </span>
            )}
            {depth !== undefined && (
              <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800">
                {currentLanguage === 'ar' ? 'العمق : ' : currentLanguage === 'en' ? 'Depth: ' : 'Profondeur : '}{depth} {currentLanguage === 'ar' ? 'أجيال' : 'gén.'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Common Ancestors Warning Section */}
      {showAncestorsList && commonAncestors.length > 0 && (
        <div className={`mt-4 p-3.5 rounded-xl border ${semantic.alertBg} space-y-2.5 relative z-10`}>
          <div className="flex items-center gap-2 font-bold text-xs">
            <Users className="w-4 h-4 shrink-0" />
            <span>
              {currentLanguage === 'ar' 
                ? `سلف مشترك تم اكتشافه (${commonAncestors.length})` 
                : currentLanguage === 'fr' 
                ? `Ancêtre(s) commun(s) détecté(s) (${commonAncestors.length})` 
                : `Detected Common Ancestor(s) (${commonAncestors.length})`}
            </span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {commonAncestors.map((anc, idx) => {
              const contributionPct = anc.contribution !== undefined
                ? anc.contribution <= 1 && anc.contribution > 0
                  ? (anc.contribution * 100).toFixed(2)
                  : Number(anc.contribution).toFixed(2)
                : null;

              return (
                <div 
                  key={idx} 
                  className="p-2 bg-slate-950/70 rounded-lg border border-slate-800/80 text-[11px] space-y-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white truncate max-w-[160px]">
                      {anc.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[9px] text-slate-400">
                        {anc.ringNumber}
                      </span>
                      {contributionPct && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[9px] font-bold">
                          +{contributionPct}%
                        </span>
                      )}
                    </div>
                  </div>

                  {anc.generation && (
                    <div className="text-[10px] text-slate-400">
                      {currentLanguage === 'ar' ? `الجيل: ${anc.generation}` : currentLanguage === 'en' ? `Generation: ${anc.generation}` : currentLanguage === 'es' ? `Generación: ${anc.generation}` : currentLanguage === 'it' ? `Generazione: ${anc.generation}` : `Génération : ${anc.generation}`}
                    </div>
                  )}

                  {anc.paths && anc.paths.length > 0 && (
                    <div className="text-[9px] font-mono text-slate-400 truncate">
                      ↳ {anc.paths[0]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Scale Legend Guide */}
      {showScaleGuide && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-wider text-[9px]">
            <span>{currentLanguage === 'ar' ? 'مقياس رايت' : currentLanguage === 'en' ? 'Wright Scale' : currentLanguage === 'es' ? 'Escala Wright' : currentLanguage === 'it' ? 'Scala Wright' : 'Échelle Wright'}</span>
            <span>{currentLanguage === 'ar' ? 'مستوى الخطورة' : currentLanguage === 'en' ? 'Risk Level' : currentLanguage === 'es' ? 'Nivel de riesgo' : currentLanguage === 'it' ? 'Livello di rischio' : 'Niveau de risque'}</span>
          </div>
          <div className="flex items-center justify-between text-emerald-400">
            <span>&lt; 5 %</span>
            <span className="font-semibold">{currentLanguage === 'fr' ? 'Sécurisé' : currentLanguage === 'es' ? 'Seguro' : currentLanguage === 'it' ? 'Sicuro' : currentLanguage === 'ar' ? 'آمن' : 'Safe'}</span>
          </div>
          <div className="flex items-center justify-between text-amber-400">
            <span>5 % – 12,5 %</span>
            <span className="font-semibold">{currentLanguage === 'fr' ? 'Vigilance / Modéré' : currentLanguage === 'es' ? 'Vigilancia / Moderado' : currentLanguage === 'it' ? 'Vigilanza / Moderato' : currentLanguage === 'ar' ? 'حذر / معتدل' : 'Moderate / Caution'}</span>
          </div>
          <div className="flex items-center justify-between text-rose-400">
            <span>&gt; 12,5 %</span>
            <span className="font-semibold">{currentLanguage === 'fr' ? 'Risque Élevé / Critique' : currentLanguage === 'es' ? 'Riesgo Alto / Crítico' : currentLanguage === 'it' ? 'Rischio Elevato / Critico' : currentLanguage === 'ar' ? 'خطر مرتفع / حرج' : 'High Risk / Critical'}</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default WrightConsanguinityGauge;
