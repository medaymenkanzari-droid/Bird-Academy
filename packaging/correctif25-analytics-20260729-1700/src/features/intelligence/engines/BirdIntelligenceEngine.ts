/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Canari, Sante, Depense, Vente, HabitatCage } from '../../../types';
import { BreedingPair } from '../../reproduction/types';
import { Clutch } from '../../reproduction/clutches/types';
import { IntelligenceScore, TopPerformer } from '../types';
import { WrightCoefficientEngine } from '../../genetics/engines/WrightCoefficientEngine';
import { GeneticsEngine } from '../../genetics/engines/GeneticsEngine';

export class BirdIntelligenceEngine {
  
  // --- BIRD INDIVIDUAL ANALYSIS ---
  static analyzeBird(
    bird: Canari,
    allBirds: Canari[],
    healthRecords: Sante[],
    pairs: BreedingPair[]
  ): {
    score: number;
    ageMonths: number;
    breedingCount: number;
    offspringCount: number;
    healthIncidentCount: number;
    dataCompleteness: number;
    reliabilityLabel: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } {
    // 1. Calculate age in months
    let ageMonths = 0;
    if (bird.date_naissance) {
      const birthDate = new Date(bird.date_naissance);
      const now = new Date();
      ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
      if (ageMonths < 0) ageMonths = 0;
    }

    // 2. Breeding count
    const birdPairs = pairs.filter(p => p.maleId === bird.id || p.femaleId === bird.id);
    const breedingCount = birdPairs.length;

    // 3. Offspring count
    const offspringCount = allBirds.filter(b => b.pere_id === bird.id || b.mere_id === bird.id).length;

    // 4. Health incidents
    const birdHealth = healthRecords.filter(h => h.canari_id === bird.id);
    const healthIncidentCount = birdHealth.length;

    // 5. Data completeness
    let filledFields = 0;
    const fieldsToCheck: (keyof Canari)[] = ['bague', 'nom', 'sexe', 'espece', 'categorie', 'race', 'mutation', 'couleur_base', 'date_naissance', 'photo'];
    fieldsToCheck.forEach(f => {
      if (bird[f]) filledFields++;
    });
    const dataCompleteness = Math.round((filledFields / fieldsToCheck.length) * 100);

    // Strengths and Weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Evaluate reproduction performance
    let reproSuccessRatio = 0;
    let totalSuccessWeaned = 0;
    birdPairs.forEach(p => {
      totalSuccessWeaned += p.statistics?.weanedChicks || 0;
    });

    if (offspringCount > 0) {
      strengths.push(`Excellente descendance directe (${offspringCount} oisillons enregistrés)`);
    }
    if (breedingCount > 1 && totalSuccessWeaned > 3) {
      strengths.push("Reproducteur hautement performant avec taux de réussite éprouvé");
    }

    if (ageMonths >= 10 && ageMonths <= 48) {
      strengths.push("Dans la tranche d'âge optimale pour la reproduction (1 à 4 ans)");
    } else if (ageMonths > 60) {
      weaknesses.push("Oiseau vieillissant (> 5 ans), performances reproductives potentiellement en baisse");
      recommendations.push("Ménagez cet oiseau en limitant ses cycles de reproduction à un seul par an ou placez-le en retraite dorée.");
    }

    if (healthIncidentCount === 0) {
      strengths.push("Parfait historique sanitaire (aucun incident ou traitement enregistré)");
    } else if (healthIncidentCount > 2) {
      weaknesses.push("Sujet fragile avec antécédents médicaux fréquents");
      recommendations.push("Faites un bilan complet des compléments alimentaires (vitamines, probiotiques) pour renforcer ses défenses.");
    }

    if (dataCompleteness < 70) {
      weaknesses.push("Fiche d'identification incomplète");
      recommendations.push("Complétez les photos, la généalogie et les détails de mutation pour garantir la conformité du registre.");
    }

    // Determine final score out of 100
    let score = 75; // base score
    score += Math.min(15, offspringCount * 3);
    score -= healthIncidentCount * 8;
    if (ageMonths > 60) score -= 15;
    if (dataCompleteness < 60) score -= 10;
    score = Math.max(10, Math.min(100, score));

    return {
      score,
      ageMonths,
      breedingCount,
      offspringCount,
      healthIncidentCount,
      dataCompleteness,
      reliabilityLabel: dataCompleteness >= 80 ? 'Haute' : dataCompleteness >= 50 ? 'Moyenne' : 'Faible',
      strengths,
      weaknesses,
      recommendations: recommendations.length > 0 ? recommendations : ["Conserver le régime d'entretien habituel.", "Assurer un suivi annuel de la bague et des griffes."]
    };
  }

  // --- GENERAL DOMAIN ANALYSES ---

  // 1. Analyse des Couples
  static analyzeBreedingPairs(pairs: BreedingPair[], clutches: Clutch[]): IntelligenceScore {
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

    const activePairs = pairs.filter(p => p.status === 'active');
    
    let totalEggs = 0;
    let totalFertile = 0;
    let totalHatched = 0;
    let totalWeaned = 0;

    pairs.forEach(p => {
      totalEggs += p.statistics?.totalEggs || 0;
      totalFertile += p.statistics?.fertileEggs || 0;
      totalHatched += p.statistics?.hatchedEggs || 0;
      totalWeaned += p.statistics?.weanedChicks || 0;
    });

    const fertilityRate = totalEggs > 0 ? (totalFertile / totalEggs) * 100 : 0;
    const hatchRate = totalFertile > 0 ? (totalHatched / totalFertile) * 100 : 0;
    const weaningRate = totalHatched > 0 ? (totalWeaned / totalHatched) * 100 : 0;

    // Calculate score
    // Success index = average of rates
    let score = 50;
    if (totalEggs > 0) {
      score = Math.round((fertilityRate * 0.35) + (hatchRate * 0.35) + (weaningRate * 0.3));
    }

    let label: 'excellent' | 'good' | 'medium' | 'poor' | 'critical' = 'medium';
    if (score >= 85) label = 'excellent';
    else if (score >= 70) label = 'good';
    else if (score >= 45) label = 'medium';
    else if (score >= 25) label = 'poor';
    else label = 'critical';

    const recommendations: string[] = [];
    if (fertilityRate < 60 && totalEggs > 0) {
      recommendations.push("Taux de fertilité faible. Enrichissez la préparation à la reproduction (vitamine E, graines germées) et vérifiez la coupe des plumes autour du cloaque.");
    }
    if (hatchRate < 70 && totalFertile > 0) {
      recommendations.push("Pertes d'œufs fécondés élevées. Augmentez l'hygrométrie de la pièce (55-60%) pendant les 3 derniers jours d'incubation.");
    }
    if (weaningRate < 80 && totalHatched > 0) {
      recommendations.push("Mortalité au nid constatée. Utilisez des couples de secours (parents nourriciers) pour répartir les grosses nichées de plus de 4 poussins.");
    }

    if (recommendations.length === 0) {
      recommendations.push("Maintenez le protocole d'élevage actuel, les performances sont excellentes.");
    }

    return {
      score,
      label,
      summary: `Fertilité: ${Math.round(fertilityRate)}% | Éclosion: ${Math.round(hatchRate)}% | Sevrage: ${Math.round(weaningRate)}%`,
      explanation: `L'analyse de vos ${pairs.length} couples révèle un taux de réussite global estimé à ${score}%. ${
        score >= 70 ? "Votre cheptel affiche de solides performances de ponte et d'élevage parental." : "Des optimisations sont requises sur la phase de fécondation ou de nourrissage au nid."
      }`,
      recommendations,
      confidence: pairs.length >= 3 ? 'high' : 'medium'
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
      totalCapacity += c.capacite_max;
      const count = birds.filter(b => !b.archived && (String(b.cage_id) === c.id || b.cageId === c.id)).length;
      totalBirdsInCages += count;
      if (count > c.capacite_max) {
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
    const totalExpenses = expenses.reduce((sum, e) => sum + e.montant, 0);
    const totalSales = sales.reduce((sum, s) => sum + s.prix, 0);
    const balance = totalSales - totalExpenses;

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
    if (balance > 1000) {
      recommendations.push("Excédent financier confortable. Profitez-en pour investir dans du matériel haut de gamme (cages autonettoyantes, purificateurs d'air, éclairage à spectre solaire).");
    }

    if (recommendations.length === 0) {
      recommendations.push("Le budget de votre élevage est parfaitement équilibré.");
    }

    return {
      score,
      label,
      summary: `Revenus: ${totalSales.toFixed(2)}€ | Dépenses: ${totalExpenses.toFixed(2)}€ | Solde: ${balance.toFixed(2)}€`,
      explanation: `L'indice de viabilité financière est de ${score}/100. Votre élevage dégage un solde de ${balance.toFixed(2)}€ avec un taux de couverture des charges de ${Math.round(roiPercent)}%.`,
      recommendations,
      confidence: expenses.length > 0 || sales.length > 0 ? 'high' : 'low'
    };
  }

  // 4. Analyse Sanitaire
  static analyzeHealth(healthRecords: Sante[], birds: Canari[]): IntelligenceScore {
    const totalRecords = healthRecords.length;
    const activeRecords = healthRecords.filter(r => r.statut === 'En attente');
    const treatments = healthRecords.filter(r => r.categorie === 'Traitement');
    const vaccines = healthRecords.filter(r => r.categorie === 'Vaccin');

    const activeIllCount = activeRecords.length;
    
    // Score calculation
    let score = 100;
    score -= activeIllCount * 15; // heavy penalty for ongoing active illness
    score -= (treatments.length / Math.max(1, birds.length)) * 10; // ratio of past treatments
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
    if (vaccines.length === 0 && birds.length > 10) {
      recommendations.push("Aucune campagne vaccinale enregistrée. Pour les grands effectifs, un protocole de prévention contre la variole aviaire est fortement préconisé au printemps.");
    }
    if (treatments.length > birds.length * 0.3) {
      recommendations.push("Taux de morbidité historique élevé. Envisagez une désinfection complète de la pièce d'élevage (bactéricide/fongicide homologué) à vide sanitaire.");
    }

    if (recommendations.length === 0) {
      recommendations.push("La sécurité biologique et l'état sanitaire du cheptel sont impeccables.");
    }

    return {
      score,
      label,
      summary: `Pathologies en cours : ${activeIllCount} | Total traitements : ${treatments.length} | Vaccins : ${vaccines.length}`,
      explanation: `L'indice de santé biologique globale est de ${score}/100. ${
        activeIllCount > 0 
          ? "Des oiseaux malades nécessitent un isolement thérapeutique renforcé." 
          : "L'élevage affiche une excellente forme clinique globale."
      }`,
      recommendations,
      confidence: birds.length > 0 ? 'high' : 'low'
    };
  }

  // --- TOP PERFORMERS IDENTIFIER ---
  static getTopPerformers(
    birds: Canari[],
    pairs: BreedingPair[],
    clutches: Clutch[]
  ): TopPerformer[] {
    const performers: TopPerformer[] = [];

    // 1. Breeding Pairs Top Performers
    pairs.forEach(pair => {
      const weaned = pair.statistics?.weanedChicks || 0;
      const totalEggs = pair.statistics?.totalEggs || 0;
      const successRate = pair.statistics?.successRate || 0;

      if (weaned >= 3 && successRate >= 60) {
        performers.push({
          pairId: pair.id,
          name: pair.name || `Couple #${pair.id.substring(3)}`,
          type: 'pair',
          score: Math.round(successRate),
          reason: `Productivité remarquable : ${weaned} oisillons sevrés à partir de ${totalEggs} œufs.`
        });
      }
    });

    // 2. Individual Foster Parent Performers
    // Check birds who have parent_pere_nourricier_id or parent_mere_nourriciere_id or are linked to foster pairs
    // In our codebase, let's identify birds marked as excellent fosters.
    // If we have foster stats, let's use them, or list birds with highest offspring count
    const birdOffspringCount: Record<number, number> = {};
    birds.forEach(b => {
      if (b.pere_id) birdOffspringCount[b.pere_id] = (birdOffspringCount[b.pere_id] || 0) + 1;
      if (b.mere_id) birdOffspringCount[b.mere_id] = (birdOffspringCount[b.mere_id] || 0) + 1;
    });

    Object.entries(birdOffspringCount).forEach(([birdIdStr, count]) => {
      const birdId = parseInt(birdIdStr, 10);
      const bird = birds.find(b => b.id === birdId);
      if (bird && count >= 3) {
        performers.push({
          birdId: bird.id,
          name: bird.nom || bird.bague,
          type: 'bird',
          score: Math.min(100, 50 + count * 10),
          reason: `Patrimoine génétique florissant : ${count} descendants directs vigoureux et sevrés.`
        });
      }
    });

    return performers.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  // 5. Analyse Génétique
  static analyzeGenetics(birds: Canari[], pairs: BreedingPair[]): IntelligenceScore {
    const activePairs = pairs.filter(p => p.status === 'active');
    const activeBirds = birds.filter(b => !b.archived);

    if (activeBirds.length === 0) {
      return {
        score: 100,
        label: 'excellent',
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
      sumF += wright.coefficient;
      if (wright.coefficient > 6.25) {
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
      recommendations.push("Excellent suivi généalogique et gestion rigoureuse de la consanguinité. Poursuivez ces bonnes pratiques.");
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
