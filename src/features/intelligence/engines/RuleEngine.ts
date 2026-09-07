/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BreedingPair } from '../../reproduction/types';
import { Canari, Sante, HabitatCage } from '../../../types';
import { IntelligenceClutch, IntelligenceRuleData, Rule, RuleResult } from '../types';
import { WrightCoefficientEngine } from '../../genetics/engines/WrightCoefficientEngine';
import { GeneticsEngine } from '../../genetics/engines/GeneticsEngine';
import { GeneticsRepository } from '../../genetics/repositories/GeneticsRepository';
import { HabitatEngine } from '../../../business/HabitatEngine';
import { HealthEngine } from '../../../business/HealthEngine';

export class RuleEngine {
  private static rules: Rule[] = [
    {
      id: "rule-low-performance-couple",
      name: "Couple à performances reproductives faibles",
      description: "Détecte les couples actifs ayant réalisé au moins 3 couvées sans aucun jeune sevré.",
      priority: "high",
      category: "reproduction",
      explanation: "Ce couple est actif depuis plusieurs cycles mais n'affiche aucun succès de sevrage. Cela peut révéler une incompatibilité génétique, un problème de fertilité d'un partenaire, ou des facteurs environnementaux défavorables.",
      recommendation: "Nous recommandons de dissoudre ce couple pour la saison prochaine et de ré-accoupler les partenaires avec d'autres reproducteurs éprouvés.",
      condition: (data: IntelligenceRuleData) => {
        return data.pairs.some(pair => {
          if (pair.status !== 'active') return false;
          const pairClutches = data.clutches.filter(c => c.pairId === pair.id);
          const totalClutches = pairClutches.length;
          const totalWeaned = pair.statistics?.weanedChicks || 0;
          return totalClutches >= 3 && totalWeaned === 0;
        });
      }
    },
    {
      id: "rule-female-exhaustion-risk",
      name: "Risque d'épuisement de la femelle",
      description: "Détecte les femelles soumises à plus de 3 couvées successives dans la même saison.",
      priority: "high",
      category: "reproduction",
      explanation: "Enchaîner plus de 3 pontes ou couvées consécutives induit une décalcification sévère et un épuisement physiologique de la femelle, augmentant les risques de mal de ponte ou de mortalité.",
      recommendation: "Retirez le nid immédiatement, séparez le couple ou placez la femelle en volière de repos avec un apport enrichi en calcium (os de seiche, compléments hydrosolubles) et vitamines (AD3E).",
      condition: (data: IntelligenceRuleData) => {
        // Check if any female is linked to > 3 active or completed clutches in the current season
        const femaleClutchesCount: Record<number, number> = {};
        const currentYear = new Date().getFullYear();
        data.clutches.filter(clutch => Number(clutch.startDate?.slice(0, 4)) === currentYear).forEach(clutch => {
          const pair = data.pairs.find(p => p.id === clutch.pairId);
          if (pair) {
            femaleClutchesCount[pair.femaleId] = (femaleClutchesCount[pair.femaleId] || 0) + 1;
          }
        });
        return Object.values(femaleClutchesCount).some(count => count > 3);
      }
    },
    {
      id: "rule-cage-overcrowding",
      name: "Surcharge de cage ou volière",
      description: "Détecte les habitats dont le nombre d'oiseaux dépasse la capacité maximale définie.",
      priority: "high",
      category: "habitat",
      explanation: "La surpopulation dans une cage favorise le stress, le picage des plumes, les bagarres territoriales et accélère la propagation des pathologies parasitaires et infectieuses.",
      recommendation: "Transférez l'excédent d'oiseaux vers d'autres cages disponibles ou agrandissez l'espace d'hébergement pour rétablir une densité saine.",
      condition: (data: { cages: HabitatCage[]; birds: Canari[] }) => {
        return data.cages.some(cage => HabitatEngine.calculateStats('cage', cage.id, data.birds).isOverloaded);
      }
    },
    {
      id: "rule-conguinity-warning",
      name: "Vigilance consanguinité directe",
      description: "Détecte les couples formés de partenaires partageant des liens familiaux directs (frère/sœur, parent/enfant).",
      priority: "high",
      category: "reproduction",
      explanation: "L'accouplement consanguin direct (frère-sœur ou parent-enfant) provoque une augmentation drastique de la mortalité dans l'œuf, des tares congénitales et une baisse de la vigueur immunitaire générale du cheptel.",
      recommendation: "Dissolvez immédiatement ce couple. Si vous cherchez à fixer une mutation, préférez le retour en lignée de type 'cousins' ou oncle-nièce avec parcimonie (travail de souche contrôlé).",
      condition: (data: { pairs: BreedingPair[]; birds: Canari[] }) => {
        return data.pairs.some(pair => {
          if (pair.status !== 'active') return false;
          const male = data.birds.find(b => b.id === pair.maleId);
          const female = data.birds.find(b => b.id === pair.femaleId);
          if (!male || !female) return false;

          // Frères / Sœurs
          const shareParents = male.pere_id && male.mere_id && male.pere_id === female.pere_id && male.mere_id === female.mere_id;
          
          // Parent / Enfant
          const parentChild = male.id === female.pere_id || female.id === male.mere_id;

          return !!(shareParents || parentChild);
        });
      }
    },
    {
      id: "rule-unassigned-breeding-birds",
      name: "Potentiel de reproduction non exploité",
      description: "Détecte les oiseaux en âge de reproduire (>= 10 mois) qui ne sont pas actuellement en couple.",
      priority: "low",
      category: "reproduction",
      explanation: "Certains de vos meilleurs reproducteurs matures sont actuellement logés individuellement ou en groupe sans opportunité de ponte, ce qui retarde l'atteinte de vos objectifs d'élevage.",
      recommendation: "Consultez l'âge de ces oiseaux et planifiez la formation de nouveaux couples compatibles pour dynamiser la saison de reproduction.",
      condition: (data: { birds: Canari[]; pairs: BreedingPair[] }) => {
        const activePairBirdIds = new Set<number>();
        data.pairs.forEach(p => {
          if (p.status === 'active') {
            activePairBirdIds.add(p.maleId);
            activePairBirdIds.add(p.femaleId);
          }
        });

        return data.birds.some(b => {
          if (!HealthEngine.isEligiblePatient(b)) return false;
          const birthDateStr = b.date_naissance;
          if (!birthDateStr) return false;
          
          const birthDate = new Date(birthDateStr);
          const now = new Date();
          const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
          
          return ageMonths >= 10 && !activePairBirdIds.has(b.id) && b.sexe !== 'Indéterminé';
        });
      }
    },
    {
      id: "rule-critical-health-bird",
      name: "Oiseau sous traitement multiple ou récurrent",
      description: "Détecte les oiseaux ayant fait l'objet de plus de 2 interventions sanitaires en 30 jours.",
      priority: "high",
      category: "health",
      explanation: "La répétition de pathologies ou de traitements chez un même sujet indique une fragilité immunitaire systémique ou un environnement d'hébergement pathogène persistant.",
      recommendation: "Isolez l'oiseau en cage hôpital/quarantaine, nettoyez à fond sa cage d'origine et envisagez de consulter un vétérinaire aviaire pour un diagnostic précis (recherche de coccidiose, mycoplasmose).",
      condition: (data: { healthRecords: Sante[] }) => {
        const birdTreatments: Record<number, number> = {};
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        data.healthRecords.forEach(rec => {
          const recDate = new Date(rec.date);
          if (recDate >= thirtyDaysAgo && rec.categorie === 'Traitement') {
            birdTreatments[rec.canari_id] = (birdTreatments[rec.canari_id] || 0) + 1;
          }
        });

        return Object.values(birdTreatments).some(count => count > 2);
      }
    },
    {
      id: "rule-high-inbreeding",
      name: "Consanguinité élevée dans un couple",
      description: "Détecte si un couple actif présente un coefficient de consanguinité de Wright supérieur au seuil recommandé.",
      priority: "high",
      category: "genetics",
      explanation: "Un couple actif présente un coefficient de Wright dépassant le seuil de sécurité, ce qui accroît fortement les risques de malformations, de mortalité embryonnaire et d'affaiblissement général de la descendance.",
      recommendation: "Il est fortement conseillé de dissoudre ce couple et de ré-accoupler les sujets avec des partenaires non apparentés.",
      condition: (data: { birds: Canari[]; pairs: BreedingPair[] }) => {
        const params = GeneticsRepository.getParameters();
        return data.pairs.some(pair => {
          if (pair.status !== 'active') return false;
          const wright = WrightCoefficientEngine.calculateInbreeding(pair.maleId, pair.femaleId, data.birds);
          return (wright.coefficient ?? 0) > params.maximumRecommendedCoefficient;
        });
      }
    },
    {
      id: "rule-dominant-ancestor",
      name: "Ancêtre unique dominant",
      description: "Détecte si un couple possède un ancêtre commun dont la contribution à l'inbreeding dépasse 25%.",
      priority: "high",
      category: "genetics",
      explanation: "Un ancêtre commun est surreprésenté dans le patrimoine génétique de ce couple (contribution >= 25%), ce qui crée un goulot d'étranglement génétique et risque d'exposer des tares récessives sévères.",
      recommendation: "Diversifiez les partenaires de la descendance pour diluer l'influence de cet ancêtre unique dominant.",
      condition: (data: { birds: Canari[]; pairs: BreedingPair[] }) => {
        return data.pairs.some(pair => {
          if (pair.status !== 'active') return false;
          const wright = WrightCoefficientEngine.calculateInbreeding(pair.maleId, pair.femaleId, data.birds);
          return wright.commonAncestors.some(anc => anc.contribution >= 25);
        });
      }
    },
    {
      id: "rule-lineage-too-closed",
      name: "Lignée trop fermée",
      description: "Détecte si un oiseau actif possède un indice de diversité de lignée inférieur à 40%.",
      priority: "medium",
      category: "genetics",
      explanation: "Certains de vos oiseaux appartiennent à une lignée extrêmement consanguine ou repliée sur elle-même (indice de diversité < 40%). La poursuite de l'élevage au sein de cette même lignée provoquera un effondrement de la vigueur biologique.",
      recommendation: "Introduisez des oiseaux de souches externes ('sang neuf') pour réaliser des outcrossings salvateurs.",
      condition: (data: { birds: Canari[] }) => {
        const activeBirds = data.birds.filter(b => HealthEngine.isEligiblePatient(b));
        return activeBirds.some(b => {
          const analysis = GeneticsEngine.getLineageAnalysis(b.id, data.birds);
          return analysis.diversityIndex < 40 && analysis.generationCount > 1;
        });
      }
    },
    {
      id: "rule-lack-of-diversity",
      name: "Absence critique de diversité génétique",
      description: "Détecte si le pool global de couples de l'élevage affiche une consanguinité moyenne supérieure à 10%.",
      priority: "high",
      category: "genetics",
      explanation: "La consanguinité moyenne globale de vos couples actifs est trop élevée, ce qui menace la pérennité génétique à moyen terme de l'ensemble de votre élevage.",
      recommendation: "Planifiez l'acquisition d'oiseaux non apparentés auprès d'autres éleveurs ou limitez les accouplements en lignée serrée.",
      condition: (data: { birds: Canari[]; pairs: BreedingPair[] }) => {
        const activePairs = data.pairs.filter(p => p.status === 'active');
        if (activePairs.length === 0) return false;
        let sumF = 0;
        activePairs.forEach(p => {
          const wright = WrightCoefficientEngine.calculateInbreeding(p.maleId, p.femaleId, data.birds);
          sumF += wright.coefficient ?? 0;
        });
        const avgF = sumF / activePairs.length;
        return avgF > 10;
      }
    },
    {
      id: "rule-unknown-parents",
      name: "Traçabilité généalogique insuffisante",
      description: "Détecte si plus de 50% des oiseaux actifs ont leurs deux parents enregistrés comme inconnus.",
      priority: "low",
      category: "genetics",
      explanation: "La majorité des oiseaux actifs de votre cheptel n'ont pas de parents enregistrés. Sans généalogie fiable, le calcul des coefficients de consanguinité et la prévention des accouplements risqués sont impossibles.",
      recommendation: "Enregistrez rigoureusement le père et la mère de chaque oiseau né dans votre élevage. Pour les oiseaux achetés, tentez de récupérer leur pedigree auprès de l'éleveur d'origine.",
      condition: (data: { birds: Canari[] }) => {
        const activeBirds = data.birds.filter(b => HealthEngine.isEligiblePatient(b));
        if (activeBirds.length === 0) return false;
        const unknownParentsCount = activeBirds.filter(b => !b.pere_id && !b.mere_id).length;
        return (unknownParentsCount / activeBirds.length) > 0.5;
      }
    }
  ];

  static evaluateAll(data: {
    birds: Canari[];
    pairs: BreedingPair[];
    clutches: IntelligenceClutch[];
    cages: HabitatCage[];
    healthRecords: Sante[];
  }): RuleResult[] {
    return this.rules.map(rule => {
      let triggered = false;
      try {
        triggered = rule.condition(data);
      } catch (e) {
        console.error(`Error evaluating rule ${rule.id}:`, e);
      }

      return {
        ruleId: rule.id,
        name: rule.name,
        priority: rule.priority,
        triggered,
        explanation: rule.explanation,
        recommendation: rule.recommendation,
        category: rule.category
      };
    });
  }
}
