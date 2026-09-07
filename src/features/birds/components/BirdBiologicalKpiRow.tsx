/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Dna, ShieldCheck, Award, Users, AlertTriangle, Activity } from 'lucide-react';
import { Canari, Sante } from '../../../types';
import { AppKpiCard } from '../../../components/design-system/AppKpiCard';
import { calculateInbreedingCOI } from '../../../utils/genealogy';
import { PassportDataService } from '../services/PassportDataService';
import { HealthService } from '../../health/services/HealthService';
import { useLanguage } from '../../../context/LanguageContext';

export interface BirdBiologicalKpiRowProps {
  bird: Canari;
  allBirds?: Canari[];
  santeRecords?: Sante[];
  onTabSelect?: (tabId: string) => void;
}

export const BirdBiologicalKpiRow: React.FC<BirdBiologicalKpiRowProps> = ({
  bird,
  allBirds = [],
  santeRecords,
  onTabSelect,
}) => {
  const { t } = useLanguage();

  // 1. COI (Wright Inbreeding Coefficient)
  const coi = useMemo(() => {
    if (!bird.pere_id || !bird.mere_id || allBirds.length === 0) return 0;
    return calculateInbreedingCOI(bird.pere_id, bird.mere_id, allBirds);
  }, [bird, allBirds]);

  const coiKpi = useMemo(() => {
    const formattedVal = `${coi.toFixed(1)}%`;
    if (coi < 5.0) {
      return {
        value: formattedVal,
        subtitle: t('inbreedingLowIdeal'),
        variant: 'success' as const,
        icon: Dna,
        badgeText: t('optimal')
      };
    } else if (coi <= 12.5) {
      return {
        value: formattedVal,
        subtitle: t('inbreedingModPrudence'),
        variant: 'warning' as const,
        icon: AlertTriangle,
        badgeText: t('vigilance')
      };
    } else {
      return {
        value: formattedVal,
        subtitle: t('inbreedingHighAvoid'),
        variant: 'danger' as const,
        icon: AlertTriangle,
        badgeText: t('risk')
      };
    }
  }, [coi, t]);

  // 2. Health Status
  const healthKpi = useMemo(() => {
    const records = santeRecords || HealthService.getRecords().filter(r => r.canari_id === bird.id);
    const hasVaccine = records.some(r => r.categorie === 'Vaccin');
    const hasActiveTreatment = records.some(r => r.statut === 'En attente' || r.categorie === 'Traitement');

    if (bird.statut_sante === 'Quarantaine') {
      return {
        value: t('healthStatusQuarantine'),
        subtitle: t('healthSubQuarantine'),
        variant: 'warning' as const,
        icon: ShieldCheck
      };
    }
    if (bird.statut_sante === 'Malade' || hasActiveTreatment) {
      return {
        value: t('healthStatusTreatment'),
        subtitle: t('healthSubTreatment'),
        variant: 'danger' as const,
        icon: Activity
      };
    }
    if (hasVaccine) {
      return {
        value: t('healthStatusVaccinated'),
        subtitle: t('healthSubVaccinated'),
        variant: 'success' as const,
        icon: ShieldCheck
      };
    }
    return {
      value: t('healthStatusOk'),
      subtitle: t('healthSubOk'),
      variant: 'success' as const,
      icon: ShieldCheck
    };
  }, [bird, santeRecords, t]);

  // 3. Show Awards / Palmarès Summary
  const palmaresSummary = useMemo(() => {
    const summary = PassportDataService.getPalmaresSummary(bird.id, bird);
    const comEval = PassportDataService.getComEvaluation(bird.id, bird);
    
    const value = summary.totalShows > 0 
      ? summary.summaryLabel 
      : comEval.totalScore > 0 
        ? t('comPoints', { score: comEval.totalScore })
        : t('palmaresNotEvaluated');

    const subtitle = summary.totalShows > 0
      ? `${t('showsCount', { count: summary.totalShows })} • ${t('bestScore', { score: summary.bestScore })}`
      : comEval.medalTier && comEval.medalTier !== 'None'
        ? (comEval.medalTier === 'Gold' ? t('tierGold') : comEval.medalTier === 'Silver' ? t('tierSilver') : t('tierBronze'))
        : t('palmaresStandardAvailable');

    return {
      value,
      subtitle,
      variant: 'warning' as const,
      icon: Award
    };
  }, [bird, t]);

  // 4. Direct Descendants Count
  const directDescendantsCount = useMemo(() => {
    return allBirds.filter(b => b.pere_id === bird.id || b.mere_id === bird.id).length;
  }, [bird, allBirds]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {/* 1. COI KPI */}
      <AppKpiCard
        title={t('coiTitle') || 'Consanguinité (COI)'}
        value={coiKpi.value}
        subtitle={coiKpi.subtitle}
        variant={coiKpi.variant}
        icon={coiKpi.icon}
        onClick={() => onTabSelect && onTabSelect('genealogie')}
        className="bg-slate-900 border-slate-800"
      />

      {/* 2. Health KPI */}
      <AppKpiCard
        title={t('sante')}
        value={healthKpi.value}
        subtitle={healthKpi.subtitle}
        variant={healthKpi.variant}
        icon={healthKpi.icon}
        onClick={() => onTabSelect && onTabSelect('sante')}
        className="bg-slate-900 border-slate-800"
      />

      {/* 3. Palmarès KPI */}
      <AppKpiCard
        title={t('passportPalmaresTab')}
        value={palmaresSummary.value}
        subtitle={palmaresSummary.subtitle}
        variant={palmaresSummary.variant}
        icon={palmaresSummary.icon}
        onClick={() => onTabSelect && onTabSelect('palmares')}
        className="bg-slate-900 border-slate-800"
      />

      {/* 4. Descendants KPI */}
      <AppKpiCard
        title={t('directDescendants')}
        value={directDescendantsCount > 0 ? t('registeredOffspring', { count: directDescendantsCount }) : t('noOffspringDeclared')}
        subtitle={directDescendantsCount > 0 ? `${directDescendantsCount} F1` : t('noOffspringDeclared')}
        variant="info"
        icon={Users}
        onClick={() => onTabSelect && onTabSelect('genealogie')}
        className="bg-slate-900 border-slate-800"
      />
    </div>
  );
};

export default BirdBiologicalKpiRow;
