/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { ReproductionRepository } from '../../reproduction/repositories/ReproductionRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { FinanceRepository } from '../../finance/repositories/FinanceRepository';
import { ChickRepository } from '../../reproduction/chicks/repositories/ChickRepository';
import { ReproductionAnalyticsService } from '../../reproduction/services/ReproductionAnalyticsService';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';

import { BirdIntelligenceEngine } from '../engines/BirdIntelligenceEngine';
import { RuleEngine } from '../engines/RuleEngine';
import { DataQualityEngine } from '../engines/DataQualityEngine';
import { DecisionSupportEngine } from '../engines/DecisionSupportEngine';

import { 
  IntelligenceScore, 
  RuleResult, 
  DataQualityResult, 
  TopPerformer, 
  MonthlyTrendPoint, 
  IntelligenceReport, 
  IntelligenceClutch,
  DecisionSupportItem,
  DecisionSupportSummary,
  MissingDataItem
} from '../types';
import { Canari, Depense, HabitatCage, Vente } from '../../../types';
import { HealthEngine } from '../../../business/HealthEngine';
import { Language } from '../../../utils/translations';
import { INTELLIGENCE_TRANSLATIONS } from '../../../utils/translationsIntelligence';

const INTELLIGENCE_LOCALES: Record<Language, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
  ar: 'ar-TN',
  es: 'es-ES',
  it: 'it-IT',
};

const translateIntelligence = (
  language: Language,
  key: string,
  variables: Record<string, string | number> = {}
): string => {
  let text = INTELLIGENCE_TRANSLATIONS[language]?.[key]
    ?? INTELLIGENCE_TRANSLATIONS.fr[key]
    ?? key;
  Object.entries(variables).forEach(([name, value]) => {
    text = text.split(`{${name}}`).join(String(value));
  });
  return text;
};

export class IntelligenceService {
  
  static getAggregateData() {
    const birds = BirdRepository.getAll();
    const pairs = ReproductionRepository.getAll();
    const reproductionSnapshot = ReproductionAnalyticsService.getSnapshot();
    
    // Habitat: v2 cages
    const cages: HabitatCage[] = HabitatRepository.getAll<HabitatCage>('cage');
    
    const healthRecords = HealthRepository.getAll();
    const expenses = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();
    const chicks = ChickRepository.getAll();
    const legacyClutches = BreedingRepository.getPontes();
    const clutches: IntelligenceClutch[] = reproductionSnapshot.items.map(item => {
      const legacy = item.source === 'legacy'
        ? legacyClutches.find(clutch => clutch.id === Number(item.sourceId))
        : undefined;
      const v2Weaned = item.source === 'v2'
        ? chicks.filter(chick => chick.clutchId === item.id && ['weaned', 'independent'].includes(chick.status)).length
        : null;

      return {
        id: item.id,
        pairId: item.pairId,
        startDate: item.startDate,
        status: item.status,
        eggCount: item.eggCount,
        fertilizedCount: item.fertilizedCount,
        hatchedCount: item.hatchedCount,
        weanedCount: legacy?.sevrages ?? v2Weaned,
      };
    });

    return {
      birds,
      pairs,
      clutches,
      cages,
      healthRecords,
      expenses,
      sales,
      chicks,
      reproductionSource: reproductionSnapshot.selectedSource,
      reproductionSourceConflict: reproductionSnapshot.hasSourceConflict,
    };
  }

  static getGeneralScoreboard(): {
    reproductionScore: IntelligenceScore;
    habitatScore: IntelligenceScore;
    financeScore: IntelligenceScore;
    healthScore: IntelligenceScore;
    geneticScore: IntelligenceScore;
    dataQualityScore: DataQualityResult;
    alerts: RuleResult[];
    topPerformers: TopPerformer[];
    trends: MonthlyTrendPoint[];
  } {
    const data = this.getAggregateData();

    const reproductionScore = BirdIntelligenceEngine.analyzeBreedingPairs(data.pairs, data.clutches);
    const habitatScore = BirdIntelligenceEngine.analyzeHabitat(data.cages, data.birds);
    const financeScore = BirdIntelligenceEngine.analyzeFinance(data.expenses, data.sales);
    const healthScore = BirdIntelligenceEngine.analyzeHealth(data.healthRecords, data.birds);
    const geneticScore = BirdIntelligenceEngine.analyzeGenetics(data.birds, data.pairs);
    const dataQualityScore = DataQualityEngine.analyze(data.birds);

    // Filter rules which are triggered
    const evaluatedRules = RuleEngine.evaluateAll({
      birds: data.birds,
      pairs: data.pairs,
      clutches: data.clutches,
      cages: data.cages,
      healthRecords: data.healthRecords
    });
    
    const alerts = evaluatedRules.filter(r => r.triggered);
    const topPerformers = BirdIntelligenceEngine.getTopPerformers(data.birds, data.pairs, data.clutches);

    const trends = this.calculateTrends(data.expenses, data.sales, data.clutches);

    return {
      reproductionScore,
      habitatScore,
      financeScore,
      healthScore,
      geneticScore,
      dataQualityScore,
      alerts,
      topPerformers,
      trends
    };
  }

  static calculateTrends(expenses: Depense[], sales: Vente[], clutches: IntelligenceClutch[], now = new Date()): MonthlyTrendPoint[] {
    const trendMap: Record<string, { expenses: number; sales: number; fertile: number; hatched: number }> = {};
    
    // Generate last 6 months keys
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trendMap[key] = { expenses: 0, sales: 0, fertile: 0, hatched: 0 };
    }

    // Populate expenses
    expenses.forEach(e => {
      if (!e.date) return;
      const key = e.date.substring(0, 7);
      if (trendMap[key] && Number.isFinite(e.montant) && e.montant >= 0) {
        trendMap[key].expenses += e.montant;
      }
    });

    // Populate sales
    sales.forEach(s => {
      if (!s.date) return;
      const key = s.date.substring(0, 7);
      if (trendMap[key] && Number.isFinite(s.prix) && s.prix >= 0) {
        trendMap[key].sales += s.prix;
      }
    });

    clutches.forEach(clutch => {
      const key = clutch.startDate?.substring(0, 7);
      if (trendMap[key] && clutch.fertilizedCount !== null && clutch.hatchedCount !== null) {
        const fertile = Math.max(0, Math.min(clutch.eggCount, clutch.fertilizedCount));
        trendMap[key].fertile += fertile;
        trendMap[key].hatched += Math.max(0, Math.min(fertile, clutch.hatchedCount));
      }
    });

    return Object.entries(trendMap).map(([month, val]) => ({
      month,
      reproductionRate: val.fertile > 0 ? Math.round((val.hatched / val.fertile) * 100) : null,
      salesAmount: Number(val.sales.toFixed(2)),
      expensesAmount: Number(val.expenses.toFixed(2))
    }));
  }

  static getBirdFiche(birdId: number) {
    const data = this.getAggregateData();
    const bird = data.birds.find(b => b.id === birdId);
    if (!bird) return null;

    return BirdIntelligenceEngine.analyzeBird(bird, data.birds, data.healthRecords, data.pairs);
  }

  static generateReport(
    type: 'monthly' | 'annual' | 'reproduction' | 'finance' | 'global',
    language: Language = 'fr'
  ): IntelligenceReport {
    const data = this.getAggregateData();
    const scores = this.getGeneralScoreboard();
    const nowStr = new Date().toLocaleDateString(INTELLIGENCE_LOCALES[language]);
    const t = (key: string, variables?: Record<string, string | number>) => translateIntelligence(language, key, variables);

    const reportToken = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}`;
    const report: IntelligenceReport = {
      id: `rep-${reportToken}`,
      title: "",
      date: nowStr,
      type,
      sections: []
    };

    if (type === 'monthly' || type === 'global') {
      report.title = t(type === 'monthly' ? 'intelReportMonthly' : 'intelReportGlobal');
      report.sections.push({
        title: t('intelReportScoresSection'),
        content: t('intelReportScoresContent', {
          date: nowStr,
          health: scores.healthScore.score,
          reproduction: scores.reproductionScore.score,
          habitat: scores.habitatScore.score,
        }),
        metrics: [
          { label: t('intelHealthScore'), value: `${scores.healthScore.score}/100` },
          { label: t('intelReproScore'), value: `${scores.reproductionScore.score}/100` },
          { label: t('intelDataQuality'), value: `${scores.dataQualityScore.score}/100` }
        ]
      });

      const highPriorityAlertCount = scores.alerts.filter(alert => alert.priority === 'high').length;
      report.sections.push({
        title: t('intelReportAlertsSection'),
        content: scores.alerts.length > 0 
          ? t('intelReportAlertsContent', { count: scores.alerts.length, high: highPriorityAlertCount })
          : t('intelReportNoAlertsContent')
      });

      const recommendationCount = new Set([
        ...scores.healthScore.recommendations,
        ...scores.reproductionScore.recommendations,
        ...scores.habitatScore.recommendations,
        ...scores.financeScore.recommendations,
      ]).size;
      report.sections.push({
        title: t('intelReportRecommendationsSection'),
        content: t('intelReportRecommendationsContent', { count: recommendationCount })
      });
    } else if (type === 'reproduction') {
      report.title = t('intelReportRepro');
      report.sections.push({
        title: t('intelReportReproductionSection'),
        content: t('intelReportReproductionContent', { score: scores.reproductionScore.score }),
        metrics: [
          { label: t('intelActivePairs'), value: data.pairs.filter(pair => pair.status === 'active').length },
          { label: t('intelTotalEggs'), value: data.clutches.reduce((sum, clutch) => sum + clutch.eggCount, 0) },
          { label: t('intelKnownHatchlings'), value: data.clutches.reduce((sum, clutch) => sum + (clutch.hatchedCount ?? 0), 0) }
        ]
      });
    } else if (type === 'finance') {
      report.title = t('intelReportFinance');
      const totalExp = data.expenses.reduce((sum, e) => sum + (Number.isFinite(e.montant) && e.montant >= 0 ? e.montant : 0), 0);
      const totalSal = data.sales.reduce((sum, s) => sum + (Number.isFinite(s.prix) && s.prix >= 0 ? s.prix : 0), 0);
      const balance = totalSal - totalExp;
      report.sections.push({
        title: t('intelReportFinanceSection'),
        content: t('intelReportFinanceContent', { balance: balance.toFixed(3) }),
        metrics: [
          { label: t('intelSalesRevenue'), value: `${totalSal.toFixed(3)} DT` },
          { label: t('intelBreedingExpenses'), value: `${totalExp.toFixed(3)} DT` },
          { label: t('intelNetBalance'), value: `${balance.toFixed(3)} DT` }
        ]
      });
    } else {
      report.title = t('intelReportAnnual');
      report.sections.push({
        title: t('intelReportAnnualSection'),
        content: t('intelReportAnnualContent'),
        metrics: [
          { label: t('intelActiveBirds'), value: data.birds.filter(bird => HealthEngine.isEligiblePatient(bird)).length },
          { label: t('intelRecordedClutches'), value: data.clutches.length },
          { label: t('intelArchiveQuality'), value: `${scores.dataQualityScore.score}%` }
        ]
      });
    }

    return report;
  }

  // =========================================================================
  // MISSION V1.9.2 — ASSISTANCE À LA DÉCISION (DSS) ENTRY POINTS
  // =========================================================================

  /**
   * Explique un résultat de croisement officiel issu de CanaryCrossEngine / CanaryCrossBridge
   */
  static getDecisionSupportForCross(crossResult: any, language: Language = 'fr'): DecisionSupportItem {
    return DecisionSupportEngine.buildCrossDecisionSupport(crossResult, language);
  }

  /**
   * Explique un locus canonique et son statut épistémique
   */
  static getDecisionSupportForLocus(
    locus: any,
    birdContext?: { nom?: string; bague?: string; sexe?: string },
    language: Language = 'fr'
  ): DecisionSupportItem {
    return DecisionSupportEngine.buildLocusDecisionSupport(locus, birdContext, language);
  }

  /**
   * Explique le lien généalogique et la consanguinité entre 2 oiseaux
   */
  static getDecisionSupportForPair(maleId: number, femaleId: number, language: Language = 'fr'): DecisionSupportItem {
    const data = this.getAggregateData();
    return DecisionSupportEngine.buildInbreedingDecisionSupport(maleId, femaleId, data.birds, language);
  }

  /**
   * Explique la fiche d'un oiseau avec ses points d'attention
   */
  static getDecisionSupportForBird(birdId: number, language: Language = 'fr'): DecisionSupportItem | null {
    const data = this.getAggregateData();
    const bird = data.birds.find(b => b.id === birdId);
    if (!bird) return null;

    const birdPairs = data.pairs.filter(p => p.maleId === bird.id || p.femaleId === bird.id);
    const birdHealth = data.healthRecords.filter(h => h.canari_id === bird.id);
    const offspring = data.birds.filter(b => b.pere_id === bird.id || b.mere_id === bird.id);

    const missingData: string[] = [];
    if (!bird.bague || bird.bague.length <= 3) missingData.push("Bague non renseignée");
    if (!bird.sexe || bird.sexe === 'Indéterminé') missingData.push("Sexe indéterminé");
    if (!bird.date_naissance) missingData.push("Date de naissance manquante");
    if (!bird.pere_id && !bird.mere_id && !bird.acquisition) missingData.push("Parents non déclarés");

    const vigilancePoints: string[] = [];
    if (birdHealth.filter(h => h.categorie === 'Traitement').length > 2) {
      vigilancePoints.push("Historique de soins répétés nécessitant un suivi vétérinaire.");
    }
    if (missingData.length > 0) {
      vigilancePoints.push("Traçabilité incomplète pouvant limiter la précision des prévisions.");
    }

    return {
      id: `dss-bird-${bird.id}-${Date.now()}`,
      title: `Synthèse décisionnelle : ${bird.nom || bird.bague || `Oiseau #${bird.id}`}`,
      level: missingData.length > 0 ? 'MISSING_DATA' : vigilancePoints.length > 0 ? 'VIGILANCE' : 'INFORMATION',
      source: {
        domain: 'canonical',
        engineOrTable: 'BirdRepository'
      },
      epistemicStatus: missingData.length > 0 ? 'UNKNOWN' : 'CONFIRMED',
      situation: `${bird.nom || 'Sans nom'} (${bird.bague || 'Sans bague'}) — ${bird.race || 'Race standard'} — Sexe : ${bird.sexe || 'Indéterminé'}.`,
      result: `${birdPairs.length} couple(s) associés, ${offspring.length} jeune(s) direct(s), ${birdHealth.length} fiche(s) sanitaire(s).`,
      meaning: "Cette fiche récapitule les faits biologiques et administratifs actuellement enregistrés pour cet oiseau.",
      vigilancePoints: vigilancePoints.length > 0 ? vigilancePoints : ["Aucune anomalie détectée sur ce sujet."],
      missingData,
      nextVerification: missingData.length > 0 
        ? "Compléter les données d'identification et de filiation dans le Bird Passport."
        : "Vérifier la condition physiologique avant la mise en reproduction."
    };
  }

  /**
   * Synthèse décisionnelle globale du cheptel
   */
  static getFlockDecisionSupport(language: Language = 'fr'): DecisionSupportSummary {
    const data = this.getAggregateData();
    return DecisionSupportEngine.getComprehensiveFlockDecisionSupport(
      {
        birds: data.birds,
        pairs: data.pairs,
        clutches: data.clutches,
        cages: data.cages,
        healthRecords: data.healthRecords
      },
      language
    );
  }

  /**
   * Détecte toutes les données manquantes du cheptel
   */
  static getMissingData(language: Language = 'fr'): MissingDataItem[] {
    const data = this.getAggregateData();
    return DecisionSupportEngine.detectMissingData(
      {
        birds: data.birds,
        pairs: data.pairs,
        clutches: data.clutches,
        cages: data.cages,
        healthRecords: data.healthRecords
      },
      language
    );
  }
}

