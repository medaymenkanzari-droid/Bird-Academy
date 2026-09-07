/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { ReproductionRepository } from '../../reproduction/repositories/ReproductionRepository';
import { ClutchRepository } from '../../reproduction/clutches/repositories/ClutchRepository';
import { HabitatRepository } from '../../habitat/repositories/HabitatRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { FinanceRepository } from '../../finance/repositories/FinanceRepository';
import { ChickRepository } from '../../reproduction/chicks/repositories/ChickRepository';

import { BirdIntelligenceEngine } from '../engines/BirdIntelligenceEngine';
import { RuleEngine } from '../engines/RuleEngine';
import { DataQualityEngine } from '../engines/DataQualityEngine';

import { IntelligenceScore, RuleResult, DataQualityResult, TopPerformer, MonthlyTrendPoint, IntelligenceReport } from '../types';
import { Canari, HabitatCage } from '../../../types';

export class IntelligenceService {
  
  static getAggregateData() {
    const birds = BirdRepository.getAll();
    const pairs = ReproductionRepository.getAll();
    const clutches = ClutchRepository.getAll();
    
    // Habitat: v2 cages
    const cages: HabitatCage[] = HabitatRepository.getAll<HabitatCage>('cage');
    
    const healthRecords = HealthRepository.getAll();
    const expenses = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();
    const chicks = ChickRepository.getAll();

    return {
      birds,
      pairs,
      clutches,
      cages,
      healthRecords,
      expenses,
      sales,
      chicks
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

    // Compute trends (simulated monthly summary of last 6 months based on actual dates)
    const trends = this.calculateTrends(data.expenses, data.sales, data.pairs);

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

  private static calculateTrends(expenses: any[], sales: any[], pairs: any[]): MonthlyTrendPoint[] {
    const trendMap: Record<string, { expenses: number; sales: number; rate: number; count: number }> = {};
    
    // Generate last 6 months keys
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      trendMap[key] = { expenses: 0, sales: 0, rate: 80, count: 0 }; // base rate
    }

    // Populate expenses
    expenses.forEach(e => {
      if (!e.date) return;
      const key = e.date.substring(0, 7);
      if (trendMap[key]) {
        trendMap[key].expenses += e.montant;
      }
    });

    // Populate sales
    sales.forEach(s => {
      if (!s.date) return;
      const key = s.date.substring(0, 7);
      if (trendMap[key]) {
        trendMap[key].sales += s.prix;
      }
    });

    // Estimate dynamic success rates based on breeding pairs created over time
    pairs.forEach(p => {
      if (!p.dateCreated) return;
      const key = p.dateCreated.substring(0, 7);
      if (trendMap[key]) {
        const rate = p.statistics?.successRate || 75;
        trendMap[key].rate = (trendMap[key].rate * trendMap[key].count + rate) / (trendMap[key].count + 1);
        trendMap[key].count += 1;
      }
    });

    return Object.entries(trendMap).map(([month, val]) => ({
      month,
      reproductionRate: Math.round(val.rate),
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

  static generateReport(type: 'monthly' | 'annual' | 'reproduction' | 'finance' | 'global'): IntelligenceReport {
    const data = this.getAggregateData();
    const scores = this.getGeneralScoreboard();
    const nowStr = new Date().toLocaleDateString('fr-FR');

    const report: IntelligenceReport = {
      id: `rep-${Math.random().toString(36).substring(2, 9)}`,
      title: "",
      date: nowStr,
      type,
      sections: []
    };

    if (type === 'monthly' || type === 'global') {
      report.title = type === 'monthly' ? "Rapport Décisionnel Mensuel" : "Audit Décisionnel Global";
      report.sections.push({
        title: "Synthèse des Scores DSS",
        content: `L'analyse d'aide à la décision du ${nowStr} affiche un score de santé du cheptel à ${scores.healthScore.score}/100, de reproduction à ${scores.reproductionScore.score}/100, et d'optimisation de l'habitat à ${scores.habitatScore.score}/100.`,
        metrics: [
          { label: "Santé", value: `${scores.healthScore.score}/100` },
          { label: "Reproduction", value: `${scores.reproductionScore.score}/100` },
          { label: "Qualité Données", value: `${scores.dataQualityScore.score}/100` }
        ]
      });

      report.sections.push({
        title: "Alertes Critiques Identifiées",
        content: scores.alerts.length > 0 
          ? `Le moteur de règles a levé ${scores.alerts.length} alerte(s). Priorité haute : ${scores.alerts.filter(a => a.priority === 'high').map(a => a.name).join(', ')}.`
          : "Aucune alerte critique levée. Les indicateurs biologiques fondamentaux sont conformes."
      });

      report.sections.push({
        title: "Recommandations d'Amélioration",
        content: "Nous recommandons les actions suivantes basées sur les anomalies détectées :\n" + 
          [...scores.healthScore.recommendations, ...scores.reproductionScore.recommendations]
            .slice(0, 4)
            .map(r => `• ${r}`)
            .join('\n')
      });
    } else if (type === 'reproduction') {
      report.title = "Rapport Analytique de Reproduction";
      report.sections.push({
        title: "Performance et Productivité des Couples",
        content: `Vos couples affichent une note globale de ${scores.reproductionScore.score}/100. ${scores.reproductionScore.explanation}`,
        metrics: [
          { label: "Couples Actifs", value: data.pairs.filter(p => p.status === 'active').length },
          { label: "Total Oeufs", value: data.clutches.reduce((sum, c) => sum + c.eggCount, 0) },
          { label: "Oisillons Couvés", value: data.clutches.reduce((sum, c) => sum + c.hatchedCount, 0) }
        ]
      });
    } else if (type === 'finance') {
      report.title = "Bilan Analytique d'Exploitation Financière";
      const totalExp = data.expenses.reduce((sum, e) => sum + e.montant, 0);
      const totalSal = data.sales.reduce((sum, s) => sum + s.prix, 0);
      report.sections.push({
        title: "Analyse des Marges d'Exploitation",
        content: `Le bilan affiche un solde net d'activité de ${(totalSal - totalExp).toFixed(2)}€. ${scores.financeScore.explanation}`,
        metrics: [
          { label: "Revenus Ventes", value: `${totalSal.toFixed(2)}€` },
          { label: "Charges d'Élevage", value: `${totalExp.toFixed(2)}€` },
          { label: "Balance Exploitation", value: `${(totalSal - totalExp).toFixed(2)}€` }
        ]
      });
    } else {
      report.title = "Rapport d'Activité Annuel";
      report.sections.push({
        title: "Bilan Synthétique Annuel",
        content: "Analyse complète des cycles biologiques et charges annuelles.",
        metrics: [
          { label: "Oiseaux Actifs", value: data.birds.filter(b => !b.archived).length },
          { label: "Saisons Clôturées", value: 1 },
          { label: "Qualité Archives", value: `${scores.dataQualityScore.score}%` }
        ]
      });
    }

    return report;
  }
}
