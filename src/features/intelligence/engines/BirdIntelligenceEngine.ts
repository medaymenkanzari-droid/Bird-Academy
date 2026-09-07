/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari, Sante, Depense, Vente, HabitatCage } from '../../../types';
import { BreedingPair } from '../../reproduction/types';
import { BirdIntelligenceFiche, IntelligenceBirdFinding, IntelligenceClutch, IntelligenceScore, TopPerformer } from '../types';
import { WrightCoefficientEngine } from '../../genetics/engines/WrightCoefficientEngine';
import { HabitatEngine } from '../../../business/HabitatEngine';
import { HealthEngine } from '../../../business/HealthEngine';

export class BirdIntelligenceEngine {
  
  // --- BIRD INDIVIDUAL ANALYSIS ---
  static analyzeBird(
    bird: Canari,
    allBirds: Canari[],
    healthRecords: Sante[],
    pairs: BreedingPair[]
  ): BirdIntelligenceFiche {
    // 1. Calculate age in months
    let ageMonths: number | null = null;
    if (bird.date_naissance) {
      const birthDate = new Date(bird.date_naissance);
      const now = new Date();
      if (!Number.isNaN(birthDate.getTime()) && birthDate <= now) {
        let calculatedAge = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
        if (now.getDate() < birthDate.getDate()) calculatedAge--;
        ageMonths = Math.max(0, calculatedAge);
      }
    }

    // 2. Breeding count
    const birdPairs = pairs.filter(p => p.maleId === bird.id || p.femaleId === bird.id);
    const breedingCount = birdPairs.length;

    // 3. Offspring count
    const offspringCount = allBirds.filter(b => b.pere_id === bird.id || b.mere_id === bird.id).length;

    // 4. Health incidents
    const birdHealth = healthRecords.filter(h => h.canari_id === bird.id);
    const healthRecordCount = birdHealth.length;

    // 5. Data completeness
    let filledFields = 0;
    const fieldsToCheck: (keyof Canari)[] = ['bague', 'nom', 'sexe', 'espece', 'categorie', 'race', 'mutation', 'couleur_base', 'date_naissance', 'photo'];
    fieldsToCheck.forEach(f => {
      if (bird[f]) filledFields++;
    });
    const dataCompleteness = Math.round((filledFields / fieldsToCheck.length) * 100);

    // Strengths and Weaknesses
    const strengths: IntelligenceBirdFinding[] = [];
    const weaknesses: IntelligenceBirdFinding[] = [];
    const recommendations: IntelligenceBirdFinding[] = [];

    if (offspringCount > 0) {
      strengths.push({ key: 'intelBirdOffspringRecorded', variables: { count: offspringCount } });
    }
    if (breedingCount > 0) {
      strengths.push({ key: 'intelBirdBreedingRecorded', variables: { count: breedingCount } });
    }

    if (healthRecordCount > 2) {
      weaknesses.push({ key: 'intelBirdHealthReview', variables: { count: healthRecordCount } });
      recommendations.push({ key: 'intelBirdHealthRecommendation' });
    }

    if (dataCompleteness < 70) {
      weaknesses.push({ key: 'intelBirdIncompleteRecord', variables: { score: dataCompleteness } });
      recommendations.push({ key: 'intelBirdCompleteRecord' });
    }

    if (recommendations.length === 0) {
      recommendations.push({ key: 'intelBirdNoSpecificAction' });
    }

    const reliability = dataCompleteness >= 80 ? 'high' : dataCompleteness >= 50 ? 'medium' : 'low';

    return {
      score: dataCompleteness,
      ageMonths,
      breedingCount,
      offspringCount,
      healthRecordCount,
      dataCompleteness,
      reliability,
      strengths,
      weaknesses,
      recommendations
    };
  }

  // --- GENERAL DOMAIN ANALYSES ---

  // 1. Analyse des Couples
  static analyzeBreedingPairs(pairs: BreedingPair[], clutches: IntelligenceClutch[]): IntelligenceScore {
    if (pairs.length === 0) {
      return {
        score: 0,
        label: 'medium',
        summary: "Aucun couple de reproduction enregistré.",
        explanation: "Il n'y a actuellement aucun couple déclaré pour l'évaluation. Créez des couples de reproducteurs pour débloquer les analyses décisionnelles du DSS.",
        recommendations: ["Formez vos premiers couples de reproducteurs matures (âgés d'au moins 10 mois)."],
        confidence: 'low'
      };
    }

    let knownFertilityEggs = 0;
    let totalFertile = 0;
    let knownHatchFertileEggs = 0;
    let totalHatched = 0;
    let knownWeaningHatchlings = 0;
    let totalWeaned = 0;

    clutches.forEach(clutch => {
      const eggs = Math.max(0, clutch.eggCount);
      if (clutch.fertilizedCount !== null) {
        const fertile = Math.max(0, Math.min(eggs, clutch.fertilizedCount));
        knownFertilityEggs += eggs;
        totalFertile += fertile;
        if (clutch.hatchedCount !== null) {
          const hatched = Math.max(0, Math.min(fertile, clutch.hatchedCount));
          knownHatchFertileEggs += fertile;
          totalHatched += hatched;
          if (clutch.weanedCount !== null) {
            knownWeaningHatchlings += hatched;
            totalWeaned += Math.max(0, Math.min(hatched, clutch.weanedCount));
          }
        }
      }
    });

    const fertilityRate = knownFertilityEggs > 0 ? (totalFertile / knownFertilityEggs) * 100 : null;
    const hatchRate = knownHatchFertileEggs > 0 ? (totalHatched / knownHatchFertileEggs) * 100 : null;
    const weaningRate = knownWeaningHatchlings > 0 ? (totalWeaned / knownWeaningHatchlings) * 100 : null;
    const knownRates = [fertilityRate, hatchRate, weaningRate].filter((rate): rate is number => rate !== null);
    const score = knownRates.length > 0
      ? Math.round(knownRates.reduce((sum, rate) => sum + rate, 0) / knownRates.length)
      : 0;

    let label: 'excellent' | 'good' | 'medium' | 'poor' | 'critical' = 'medium';
    if (score >= 85) label = 'excellent';
    else if (score >= 70) label = 'good';
    else if (score >= 45) label = 'medium';
    else if (score >= 25) label = 'poor';
    else label = 'critical';

    const recommendations: string[] = [];
    if (fertilityRate !== null && fertilityRate < 60) {
      recommendations.push("Le taux de fertilité mesuré est faible. Vérifiez les couples concernés et demandez un avis aviaire avant toute intervention sanitaire ou nutritionnelle.");
    }
    if (hatchRate !== null && hatchRate < 70) {
      recommendations.push("Le taux d'éclosion mesuré est faible. Contrôlez les dates, l'environnement d'incubation et les antécédents du couple avant de conclure.");
    }
    if (weaningRate !== null && weaningRate < 80) {
      recommendations.push("Le taux de sevrage mesuré nécessite une vérification des dossiers de croissance et un avis professionnel si des pertes sont constatées.");
    }

    if (recommendations.length === 0) {
      recommendations.push(knownRates.length > 0
        ? "Les indicateurs renseignés ne déclenchent pas d'alerte. Poursuivez la saisie des résultats pour confirmer la tendance."
        : "Les résultats biologiques sont insuffisants pour émettre une recommandation fiable.");
    }

    const formatRate = (rate: number | null) => rate === null ? 'Non renseigné' : `${Math.round(rate)}%`;
    const confidence: IntelligenceScore['confidence'] = knownRates.length === 3 && clutches.length >= 3
      ? 'high'
      : knownRates.length >= 2 ? 'medium' : 'low';

    return {
      score,
      label,
      summary: `Fertilité : ${formatRate(fertilityRate)} | Éclosion : ${formatRate(hatchRate)} | Sevrage : ${formatRate(weaningRate)}`,
      explanation: knownRates.length > 0
        ? `Le score de ${score}/100 est calculé uniquement à partir de ${knownRates.length} indicateur(s) réellement renseigné(s) sur ${clutches.length} ponte(s).`
        : `Aucun score biologique fiable ne peut être calculé pour les ${pairs.length} couple(s) sans résultats de ponte renseignés.`,
      recommendations,
      confidence
    };
  }

  // 2. Analyse de l'Habitat
  static analyzeHabitat(cages: HabitatCage[], birds: Canari[]): IntelligenceScore {
    if (cages.length === 0) {
      return {
        score: 0,
        label: 'medium',
        summary: "Aucun habitat enregistré dans la base.",
        explanation: "La configuration des cages et volières est manquante, empêchant le diagnostic de densité et d'occupation du DSS.",
        recommendations: ["Configurez vos volières, cages et espaces d'élevage dans le module Habitat."],
        confidence: 'low'
      };
    }

    let overloadedCount = 0;
    let totalCapacity = 0;
    let totalBirdsInCages = 0;

    cages.forEach(c => {
      const stats = HabitatEngine.calculateStats('cage', c.id, birds);
      totalCapacity += stats.capaciteTotale;
      totalBirdsInCages += stats.oiseauxPresents;
      if (stats.isOverloaded) {
        overloadedCount++;
      }
    });

    const averageOccupationRate = totalCapacity > 0 ? (totalBirdsInCages / totalCapacity) * 100 : 0;
    
    // Calculate score
    let score = 100;
    score -= (overloadedCount / cages.length) * 50; // Heavy penalty for overcrowding
    if (averageOccupationRate > 90) score -= 20;
    if (averageOccupationRate < 15) score -= 10; // Underutilized spaces is a small negative
    score = Math.max(0, Math.round(score));

    let label: 'excellent' | 'good' | 'medium' | 'poor' | 'critical' = 'excellent';
    if (score >= 90) label = 'excellent';
    else if (score >= 75) label = 'good';
    else if (score >= 50) label = 'medium';
    else if (score >= 30) label = 'poor';
    else label = 'critical';

    const recommendations: string[] = [];
    if (overloadedCount > 0) {
      recommendations.push(`Alerte : ${overloadedCount} cage(s) ou volière(s) sont en surpopulation. Veuillez transférer d'urgence les oiseaux excédentaires.`);
    }
    if (averageOccupationRate > 80) {
      recommendations.push("Le taux d'occupation général approche de la limite critique. Planifiez la cession de jeunes sevrés ou l'ajout de nouvelles volières de repos.");
    }
    if (averageOccupationRate < 20 && cages.length > 3) {
      recommendations.push("Espace sous-utilisé. Regroupez certains oiseaux calmes en volière commune pour libérer et désinfecter de petites cages d'isolement.");
    }

    if (recommendations.length === 0) {
      recommendations.push("La répartition des oiseaux est optimale et respecte scrupuleusement le bien-être animal.");
    }

    return {
      score,
      label,
      summary: `Taux d'occupation moyen : ${Math.round(averageOccupationRate)}% | Surcharges : ${overloadedCount} cage(s)`,
      explanation: `L'indice d'optimisation de l'espace s'élève à ${score}/100. ${
        overloadedCount > 0 
          ? "La présence de cages surpeuplées nécessite un rééquilibrage de vos effectifs." 
          : "Vos oiseaux bénéficient d'une excellente répartition d'espace conforme aux standards d'élevage."
      }`,
      recommendations,
      confidence: 'high'
    };
  }

  // 3. Analyse Financière
  static analyzeFinance(expenses: Depense[], sales: Vente[]): IntelligenceScore {
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number.isFinite(e.montant) && e.montant >= 0 ? e.montant : 0), 0);
    const totalSales = sales.reduce((sum, s) => sum + (Number.isFinite(s.prix) && s.prix >= 0 ? s.prix : 0), 0);
    const balance = totalSales - totalExpenses;

    if (expenses.length === 0 && sales.length === 0) {
      return {
        score: 0,
        label: 'medium',
        summary: 'Aucune opération financière enregistrée.',
        explanation: "Un score financier ne peut pas être calculé sans dépenses ni ventes.",
        recommendations: ["Enregistrez les dépenses et les ventes réelles avant d'interpréter la rentabilité."],
        confidence: 'low'
      };
    }

    const roiPercent = totalExpenses > 0 ? (totalSales / totalExpenses) * 100 : 0;

    let score = 50;
    if (totalExpenses > 0) {
      if (balance >= 0) {
        score = 50 + Math.min(50, Math.round((balance / (totalExpenses || 1)) * 25));
      } else {
        score = Math.max(10, Math.round((totalSales / totalExpenses) * 50));
      }
    } else if (totalSales > 0) {
      score = 100;
    }

    let label: 'excellent' | 'good' | 'medium' | 'poor' | 'critical' = 'medium';
    if (score >= 85) label = 'excellent';
    else if (score >= 70) label = 'good';
    else if (score >= 45) label = 'medium';
    else if (score >= 25) label = 'poor';
    else label = 'critical';

    const recommendations: string[] = [];
    if (balance < 0) {
      recommendations.push("Le bilan d'exploitation est déficitaire. Analysez le poste d'alimentation qui constitue souvent le premier levier de réduction des coûts sans impacter la qualité.");
    }
    if (totalSales === 0 && totalExpenses > 0) {
      recommendations.push("Aucune cession enregistrée cette saison. Envisagez de baguer et d'enregistrer vos jeunes d'excellence pour des expositions ou des bourses d'échange d'éleveurs.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Aucune alerte n'est déclenchée par les opérations enregistrées. Vérifiez régulièrement que toutes les charges sont saisies.");
    }

    return {
      score,
      label,
      summary: `Revenus : ${totalSales.toFixed(3)} DT | Dépenses : ${totalExpenses.toFixed(3)} DT | Solde : ${balance.toFixed(3)} DT`,
      explanation: `L'indice financier est de ${score}/100 à partir des opérations enregistrées. Le solde est de ${balance.toFixed(3)} DT et la couverture des charges de ${Math.round(roiPercent)}%.`,
      recommendations,
      confidence: expenses.length > 0 || sales.length > 0 ? 'high' : 'low'
    };
  }

  // 4. Analyse Sanitaire
  static analyzeHealth(healthRecords: Sante[], birds: Canari[]): IntelligenceScore {
    const activeBirds = birds.filter(bird => HealthEngine.isEligiblePatient(bird));
    if (activeBirds.length === 0) {
      return {
        score: 0,
        label: 'medium',
        summary: 'Aucun oiseau actif à analyser.',
        explanation: "Un score sanitaire ne peut pas être calculé sans population active.",
        recommendations: ["Ajoutez ou restaurez un oiseau actif avant de lancer l'analyse sanitaire."],
        confidence: 'low'
      };
    }

    const activeBirdIds = new Set(activeBirds.map(bird => bird.id));
    const relevantRecords = healthRecords.filter(record => activeBirdIds.has(record.canari_id));
    const activeRecords = relevantRecords.filter(r => r.statut === 'En attente');
    const treatments = relevantRecords.filter(r => r.categorie === 'Traitement');
    const vaccines = relevantRecords.filter(r => r.categorie === 'Vaccin');

    const activeIllCount = new Set(activeRecords.map(record => record.canari_id)).size;
    
    // Score calculation
    let score = 100;
    score -= activeIllCount * 15; // heavy penalty for ongoing active illness
    score -= (treatments.length / activeBirds.length) * 10; // ratio of recorded treatments
    score = Math.max(5, Math.round(score));

    let label: 'excellent' | 'good' | 'medium' | 'poor' | 'critical' = 'excellent';
    if (score >= 88) label = 'excellent';
    else if (score >= 75) label = 'good';
    else if (score >= 50) label = 'medium';
    else if (score >= 30) label = 'poor';
    else label = 'critical';

    const recommendations: string[] = [];
    if (activeIllCount > 0) {
      recommendations.push(`Alerte : ${activeIllCount} oiseau(x) est actuellement signalé souffrant ou sous traitement actif. Veillez au strict respect de la quarantaine.`);
    }
    if (treatments.length > activeBirds.length * 0.3) {
      recommendations.push("Le nombre de traitements enregistrés est élevé par rapport à la population active. Analysez les dossiers concernés avec un vétérinaire aviaire.");
    }

    if (recommendations.length === 0) {
      recommendations.push(relevantRecords.length > 0
        ? "Aucune alerte active n'est détectée dans les dossiers sanitaires renseignés."
        : "Aucun dossier sanitaire n'est disponible ; le score repose uniquement sur l'absence d'alerte déclarée et reste à interpréter avec prudence.");
    }

    return {
      score,
      label,
      summary: `Pathologies en cours : ${activeIllCount} | Total traitements : ${treatments.length} | Vaccins : ${vaccines.length}`,
      explanation: `L'indice de santé biologique globale est de ${score}/100. ${
        activeIllCount > 0 
          ? "Des oiseaux malades nécessitent un isolement thérapeutique renforcé." 
          : relevantRecords.length > 0
            ? "Aucune alerte active n'est présente dans les dossiers sanitaires renseignés."
            : "Aucun événement sanitaire n'est renseigné ; cette absence ne constitue pas une preuve de bonne santé."
      }`,
      recommendations,
      confidence: relevantRecords.length > 0 ? 'high' : 'low'
    };
  }

  // --- TOP PERFORMERS IDENTIFIER ---
  static getTopPerformers(
    birds: Canari[],
    pairs: BreedingPair[],
    clutches: IntelligenceClutch[]
  ): TopPerformer[] {
    const performers: TopPerformer[] = [];

    pairs.forEach(pair => {
      const pairClutches = clutches.filter(clutch => clutch.pairId === pair.id);
      const totalEggs = pairClutches.reduce((sum, clutch) => sum + Math.max(0, clutch.eggCount), 0);
      const knownHatched = pairClutches.filter(clutch => clutch.hatchedCount !== null);
      const hatched = knownHatched.reduce((sum, clutch) => sum + Math.max(0, Math.min(clutch.eggCount, clutch.hatchedCount ?? 0)), 0);
      const knownWeaned = pairClutches.filter(clutch => clutch.hatchedCount !== null && clutch.weanedCount !== null);
      const weaned = knownWeaned.reduce((sum, clutch) => sum + Math.max(0, Math.min(clutch.hatchedCount ?? 0, clutch.weanedCount ?? 0)), 0);
      const denominator = knownWeaned.length > 0
        ? knownWeaned.reduce((sum, clutch) => sum + Math.max(0, clutch.hatchedCount ?? 0), 0)
        : knownHatched.reduce((sum, clutch) => sum + Math.max(0, clutch.eggCount), 0);
      const successes = knownWeaned.length > 0 ? weaned : hatched;
      const successRate = denominator > 0 ? (successes / denominator) * 100 : null;

      if (successRate !== null && totalEggs >= 3 && successRate >= 60) {
        const male = birds.find(bird => bird.id === pair.maleId);
        const female = birds.find(bird => bird.id === pair.femaleId);
        performers.push({
          pairId: pair.id,
          name: pair.name || [male?.nom, female?.nom].filter(Boolean).join(' × ') || `Couple ${pair.id}`,
          type: 'pair',
          score: Math.round(successRate),
          reason: knownWeaned.length > 0
            ? `${weaned} jeune(s) sevré(s) sur ${denominator} éclosion(s) renseignée(s).`
            : `${hatched} éclosion(s) sur ${denominator} œuf(s) dont le résultat est renseigné.`
        });
      }
    });

    return performers.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  // 5. Analyse Génétique
  static analyzeGenetics(birds: Canari[], pairs: BreedingPair[]): IntelligenceScore {
    const activePairs = pairs.filter(p => p.status === 'active');
    const activeBirds = birds.filter(bird => HealthEngine.isEligiblePatient(bird));

    if (activeBirds.length === 0) {
      return {
        score: 0,
        label: 'medium',
        summary: "Aucun oiseau actif à analyser.",
        explanation: "Il n'y a actuellement aucun oiseau actif dans la base de données.",
        recommendations: ["Ajoutez des oiseaux pour commencer l'élevage."],
        confidence: 'low'
      };
    }

    const unknownParents = activeBirds.filter(b => !b.pere_id && !b.mere_id).length;
    const unknownPct = (unknownParents / activeBirds.length) * 100;

    let sumF = 0;
    let highInbreedingCount = 0;
    const memo = new Map<number, number>();

    activePairs.forEach(p => {
      const wright = WrightCoefficientEngine.calculateInbreeding(p.maleId, p.femaleId, birds, 6, memo);
      const coef = wright.coefficient ?? 0;
      sumF += coef;
      if (coef > 6.25) {
        highInbreedingCount++;
      }
    });

    const avgF = activePairs.length > 0 ? sumF / activePairs.length : 0;

    let score = 100;
    score -= (unknownPct / 100) * 30; // -30 max for unknown pedigree
    score -= Math.min(50, avgF * 4);   // -50 max for high average inbreeding
    score -= Math.min(30, highInbreedingCount * 10);
    score = Math.max(10, Math.round(score));

    let label: 'excellent' | 'good' | 'medium' | 'poor' | 'critical' = 'excellent';
    if (score >= 90) label = 'excellent';
    else if (score >= 75) label = 'good';
    else if (score >= 50) label = 'medium';
    else if (score >= 25) label = 'poor';
    else label = 'critical';

    const recommendations: string[] = [];
    if (unknownPct > 50) {
      recommendations.push("Plus de 50% de vos oiseaux n'ont pas de parents déclarés. Enregistrez systématiquement le pedigree de chaque oisillon.");
    }
    if (avgF > 6.25) {
      recommendations.push("La consanguinité moyenne de vos couples actifs est préoccupante. Introduisez de nouveaux individus d'origine différente (outcrossing) pour abaisser la consanguinité.");
    }
    if (highInbreedingCount > 0) {
      recommendations.push(`Dissolvez en priorité les ${highInbreedingCount} couple(s) actif(s) à consanguinité excessive pour protéger la vigueur de l'élevage.`);
    }

    if (recommendations.length === 0) {
      recommendations.push(activePairs.length > 0
        ? "Aucune alerte de consanguinité n'est détectée sur les couples actifs avec les pedigrees disponibles."
        : "Aucun couple actif n'est disponible pour évaluer la consanguinité ; le score reflète seulement la complétude des pedigrees.");
    }

    return {
      score,
      label,
      summary: `Consanguinité moyenne : ${avgF.toFixed(2)}% | Traçabilité : ${(100 - unknownPct).toFixed(0)}%`,
      explanation: `L'indice de qualité génétique de votre cheptel est de ${score}/100. Vos couples actifs affichent un coefficient de Wright moyen de ${avgF.toFixed(2)}% sur un historique de traçabilité généalogique de ${(100 - unknownPct).toFixed(0)}%.`,
      recommendations,
      confidence: activeBirds.length > 5 ? 'high' : 'medium'
    };
  }
}
