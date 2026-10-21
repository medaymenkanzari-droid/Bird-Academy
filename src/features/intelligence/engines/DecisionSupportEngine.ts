/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY — MISSION V1.9.2
 * BIRD INTELLIGENCE : MOTEUR D'ASSISTANCE À LA DÉCISION (DSS)
 * 
 * PRINCIPE FONDAMENTAL (Section 2) :
 * DONNÉES -> MOTEUR MÉTIER HOMOLOGUÉ -> RÉSULTAT STRUCTURÉ -> BIRD INTELLIGENCE -> EXPLICATION / AIDE À LA DÉCISION
 * 
 * INTERDICTIONS ABSOLUES :
 * - Aucun recalcul de croisement ni de génétique (zéro calculateur Mendélien concurrent).
 * - Aucune déduction de génotype ni de porteur (femelle Z-linked porteuse interdite sous ZW).
 * - Aucun contournement de blocage (BLOCKED reste BLOCKED).
 * - Aucun arbitrage unilatéral de POSSIBLE_SET.
 * - Aucune transformation d'UNKNOWN ou NOT_TESTED en certitude.
 * - Aucun diagnostic vétérinaire.
 * - Aucune recommandation de reproduction impérative ("meilleur choix" interdit).
 */

import { Canari, HabitatCage, Sante } from '../../../types';
import { BreedingPair } from '../../reproduction/types';
import { 
  AssistanceLevel, 
  DecisionSupportItem, 
  DecisionSupportSource, 
  DecisionSupportSummary, 
  EpistemicStatus, 
  IntelligenceRuleData, 
  MissingDataItem, 
  RuleResult 
} from '../types';
import { WrightCoefficientEngine } from '../../genetics/engines/WrightCoefficientEngine';
import { DataQualityEngine } from './DataQualityEngine';
import { RuleEngine } from './RuleEngine';
import { Language } from '../../../utils/translations';

export class DecisionSupportEngine {

  /**
   * 1. ASSISTANCE À LA DÉCISION POUR UN RÉSULTAT DE CROISEMENT HOMOLOGUÉ (Section 7)
   * Explique le résultat produit par CanaryCrossEngine / CanaryCrossBridge sans recalculer.
   */
  static buildCrossDecisionSupport(
    crossResult: {
      success: boolean;
      speciesId?: string;
      male?: { nom?: string; bague?: string; id?: number | string };
      female?: { nom?: string; bague?: string; id?: number | string };
      parentMale?: string;
      parentFemale?: string;
      locusResults?: Array<{
        locusId: string;
        locusName: string;
        inheritanceType?: string;
        epistemicStatus?: string;
        probabilities?: Record<string, number | 'UNKNOWN'>;
        determination?: string;
        humanReviewRequired?: boolean;
        blocked?: boolean;
        evidenceIds?: string[];
        notes?: string[];
      }>;
      lethalRisks?: Array<{
        locusId: string;
        displayName: string;
        lethalGenotype?: string;
        theoreticalProbability?: number;
        warning?: string;
      }>;
      blockedLoci?: string[];
      warnings?: string[];
      errorCode?: string;
      message?: string;
      outcomeCount?: number;
      officialSummary?: string;
    },
    language: Language = 'fr'
  ): DecisionSupportItem {
    const maleLabel = crossResult.male?.nom || crossResult.male?.bague || crossResult.parentMale || 'Père';
    const femaleLabel = crossResult.female?.nom || crossResult.female?.bague || crossResult.parentFemale || 'Mère';
    
    // Cas d'échec ou d'incompatibilité officielle
    if (!crossResult.success) {
      const isSpeciesMismatch = crossResult.errorCode === 'INVALID_SPECIES';
      const isSexViolation = crossResult.errorCode === 'ZW_VIOLATION' || crossResult.errorCode === 'INVALID_SEX';

      return {
        id: `dss-cross-failure-${Date.now()}`,
        title: language === 'fr' ? 'Analyse de croisement non réalisable' : 'Cross analysis unavailable',
        level: 'VIGILANCE',
        source: {
          domain: 'cross',
          engineOrTable: crossResult.speciesId === 'canari' ? 'CanaryCrossEngine' : 'GeneticsEngine',
          referenceKey: crossResult.errorCode || 'CROSS_FAILURE'
        },
        epistemicStatus: 'BLOCKED',
        situation: language === 'fr' 
          ? `Tentative de croisement entre ${maleLabel} et ${femaleLabel}.`
          : `Cross attempted between ${maleLabel} and ${femaleLabel}.`,
        result: language === 'fr'
          ? `Calcul rejeté par le moteur homologué : ${crossResult.message || crossResult.errorCode || 'Incompatibilité détectée'}.`
          : `Calculation rejected by homologated engine: ${crossResult.message || crossResult.errorCode || 'Incompatibility detected'}.`,
        meaning: isSpeciesMismatch
          ? (language === 'fr' 
              ? "Le moteur applique une isolation taxonomique stricte. Seuls les croisements intra-spécifiques homologués sont autorisés."
              : "The engine enforces strict taxonomic isolation. Only homologated intra-species crosses are allowed.")
          : isSexViolation
            ? (language === 'fr'
                ? (crossResult.speciesId === 'canari'
                    ? "Le système chromosomique ZW strict du canari interdit les configurations cytogénétiques impossibles (par exemple femelle avec 2 allèles Z ou femelle porteuse Z-linked)."
                    : "Le système chromosomique ZW strict interdit les configurations cytogénétiques impossibles (par exemple femelle avec 2 allèles Z ou femelle porteuse Z-linked).")
                : (crossResult.speciesId === 'canari'
                    ? "The strict ZW chromosomal system of canary forbids impossible cytogenetic configurations (e.g. female with 2 Z alleles or Z-linked carrier female)."
                    : "The strict ZW chromosomal system forbids impossible cytogenetic configurations (e.g. female with 2 Z alleles or Z-linked carrier female)."))
            : (language === 'fr'
                ? "Les données fournies ne remplissent pas les conditions de validité requises par le moteur canonique."
                : "Provided data does not meet the validity criteria required by the canonical engine."),
        vigilancePoints: [
          language === 'fr' ? "Le système ne force aucun calcul en présence d'une anomalie scientifique." : "The system never forces calculation when a scientific anomaly is present.",
          language === 'fr' ? "Aucun génotype ne peut être simulé pour ce couple." : "No genotype can be simulated for this pair."
        ],
        missingData: crossResult.errorCode === 'INSUFFICIENT_INFORMATION' 
          ? [language === 'fr' ? "Données génétiques ou parentales incomplètes." : "Incomplete genetic or parental data."]
          : [],
        nextVerification: language === 'fr'
          ? "Vérifier l'espèce, le sexe et les loci déclarés pour chacun des deux partenaires dans leur Bird Passport."
          : "Check species, sex, and declared loci for each partner in their Bird Passport."
      };
    }

    // Cas d'un croisement réussi calculé par CanaryCrossEngine
    const locusCount = crossResult.locusResults?.length ?? 0;
    const blockedCount = crossResult.blockedLoci?.length ?? 0;
    const lethalCount = crossResult.lethalRisks?.length ?? 0;
    const hasWarnings = (crossResult.warnings && crossResult.warnings.length > 0) || blockedCount > 0 || lethalCount > 0;

    const vigilancePoints: string[] = [];
    const missingData: string[] = [];

    if (lethalCount > 0) {
      crossResult.lethalRisks?.forEach(lr => {
        vigilancePoints.push(
          language === 'fr'
            ? `Risque létal in ovo identifié (${lr.displayName}) : probabilité théorique de ${Math.round((lr.theoreticalProbability ?? 0.25) * 100)}% d'embryons non viables.`
            : `Lethal risk in ovo identified (${lr.displayName}): theoretical probability of ${Math.round((lr.theoreticalProbability ?? 0.25) * 100)}% non-viable embryos.`
        );
      });
    }

    if (blockedCount > 0) {
      vigilancePoints.push(
        language === 'fr'
          ? `${blockedCount} locus bloqué(s) (ex. Ino, Satiné ou Perle) en raison d'une controverse ou d'un manque de documentation scellée. Le moteur n'invente aucun contournement.`
          : `${blockedCount} locus blocked (e.g. Ino, Satiné, or Perle) due to controversy or lack of sealed documentation. The engine does not bypass this.`
      );
    }

    // Analyse des états épistémiques des loci
    crossResult.locusResults?.forEach(lr => {
      if (lr.epistemicStatus === 'UNKNOWN') {
        missingData.push(
          language === 'fr'
            ? `Locus ${lr.locusName} : statut parental inconnu (UNKNOWN). Les probabilités pour ce locus ne peuvent être certifiées.`
            : `Locus ${lr.locusName}: unknown parental status (UNKNOWN). Probabilities for this locus cannot be certified.`
        );
      } else if (lr.epistemicStatus === 'PROVISIONAL') {
        vigilancePoints.push(
          language === 'fr'
            ? `Locus ${lr.locusName} : statut provisoire (PROVISIONAL). Hypothèse de travail soumise à confirmation par descendance.`
            : `Locus ${lr.locusName}: provisional status (PROVISIONAL). Working hypothesis subject to progeny confirmation.`
        );
      }
    });

    const level: AssistanceLevel = lethalCount > 0 || blockedCount > 0 
      ? 'VIGILANCE' 
      : missingData.length > 0 
        ? 'MISSING_DATA' 
        : 'INTERPRETATION';

    return {
      id: `dss-cross-success-${Date.now()}`,
      title: language === 'fr' ? `Assistance au croisement : ${maleLabel} × ${femaleLabel}` : `Cross assistance: ${maleLabel} × ${femaleLabel}`,
      level,
      source: {
        domain: 'cross',
        engineOrTable: crossResult.speciesId === 'canari' ? 'CanaryCrossEngine' : 'GeneticsEngine',
        evidenceIds: crossResult.locusResults?.flatMap(lr => lr.evidenceIds || [])
      },
      epistemicStatus: blockedCount > 0 ? 'BLOCKED' : missingData.length > 0 ? 'UNKNOWN' : 'CONFIRMED',
      situation: language === 'fr'
        ? `Accouplement officiel modélisé entre le mâle "${maleLabel}" et la femelle "${femaleLabel}". ${locusCount} locus pris en compte.`
        : `Official pairing modeled between male "${maleLabel}" and female "${femaleLabel}". ${locusCount} loci evaluated.`,
      result: crossResult.officialSummary || (language === 'fr'
        ? `Distribution théorique certifiée par le moteur homologué. ${blockedCount > 0 ? `${blockedCount} locus bloqué(s).` : 'Transmission calculée avec succès.'}`
        : `Theoretical distribution certified by homologated engine. ${blockedCount > 0 ? `${blockedCount} blocked loci.` : 'Transmission successfully computed.'}`),
      meaning: language === 'fr'
        ? "Ces probabilités représentent la ségrégation Mendélienne théorique par œuf fécondé. Elles ne garantissent pas la composition exacte d'une nichée particulière."
        : "These probabilities represent theoretical Mendelian segregation per fertile egg. They do not guarantee the exact composition of a specific clutch.",
      vigilancePoints: vigilancePoints.length > 0 ? vigilancePoints : [
        language === 'fr'
          ? "Aucun facteur létal ni blocage détecté sur les loci renseignés."
          : "No lethal factor or blockage detected on the evaluated loci."
      ],
      missingData,
      nextVerification: lethalCount > 0
        ? (language === 'fr' 
            ? "Vérifier si cet accouplement est indispensable au programme de sélection compte tenu des risques de mortalité embryonnaire."
            : "Verify whether this pairing is indispensable given embryonic mortality risks.")
        : missingData.length > 0
          ? (language === 'fr'
              ? "Compléter les données parentales manquantes dans les passeports génétiques pour affiner la prévision."
              : "Complete missing parental genetic data in passports to refine forecasting.")
          : (language === 'fr'
              ? "Noter et comparer le phénotype réel des oisillons à l'éclosion avec la distribution prévisionnelle."
              : "Record and compare actual chick phenotypes at hatching against forecast distribution.")
    };
  }

  /**
   * 2. ASSISTANCE À LA DÉCISION POUR UN LOCUS CANONIQUE (Section 8)
   * Explique un locus et son statut épistémique sans déduire de porteur ni modifier le référentiel.
   */
  static buildLocusDecisionSupport(
    locus: {
      locusId: string;
      locusName?: string;
      epistemicStatus?: string;
      inheritanceType?: string;
      alleles?: string[];
      possibleSet?: string[][];
      evidenceIds?: string[];
      blockedReason?: string;
      humanReviewRequired?: boolean;
    },
    birdContext?: { nom?: string; bague?: string; sexe?: string },
    language: Language = 'fr'
  ): DecisionSupportItem {
    const locusName = locus.locusName || locus.locusId;
    const rawStatus = (locus.epistemicStatus || 'UNKNOWN').toUpperCase() as EpistemicStatus;
    const birdLabel = birdContext?.nom || birdContext?.bague || 'L\'oiseau';
    const isFemale = birdContext?.sexe?.toLowerCase().includes('fem') || birdContext?.sexe?.toLowerCase().includes('female');
    const isZLinked = locus.inheritanceType === 'Z_LINKED' || ['brown', 'agate', 'pastel', 'satin', 'ivory'].some(k => locus.locusId.toLowerCase().includes(k));

    let level: AssistanceLevel = 'INFORMATION';
    let meaning = '';
    const vigilancePoints: string[] = [];
    const missingData: string[] = [];
    let nextVerification = '';

    // Gestion rigoureuse des états épistémiques (Section 4)
    switch (rawStatus) {
      case 'UNKNOWN':
        level = 'MISSING_DATA';
        meaning = language === 'fr'
          ? `L'allèle ou le génotype est actuellement inconnu pour ${locusName}. Bird Intelligence ne présume aucun allèle de type sauvage ni aucun allèle muté.`
          : `The allele or genotype is currently unknown for ${locusName}. Bird Intelligence does not assume wild-type nor mutant allele.`;
        missingData.push(
          language === 'fr'
            ? `Statut génétique non documenté pour ce locus.`
            : `Genetic status undocumented for this locus.`
        );
        vigilancePoints.push(
          language === 'fr'
            ? "Toute prédiction sur ce locus reste spéculative tant que le génotype n'est pas renseigné."
            : "Any prediction on this locus remains speculative until the genotype is recorded."
        );
        nextVerification = language === 'fr'
          ? "Renseigner l'observation phénotypique ou la traçabilité généalogique dans le Bird Passport."
          : "Record phenotypic observation or genealogical traceability in the Bird Passport.";
        break;

      case 'NOT_TESTED':
        level = 'INFORMATION';
        meaning = language === 'fr'
          ? `Ce locus n'a pas fait l'objet d'un test génétique ou d'une observation formelle. Il demeure totalement non évalué.`
          : `This locus has not undergone genetic testing or formal observation. It remains completely unevaluated.`;
        vigilancePoints.push(
          language === 'fr'
            ? "L'absence de test ne signifie pas que l'oiseau est indemne ou non porteur."
            : "Absence of testing does not imply that the bird is non-carrier or wild-type."
        );
        nextVerification = language === 'fr'
          ? "Effectuer un test ou observer la descendance lors des prochains accouplements."
          : "Conduct a test or observe progeny during upcoming pairings.";
        break;

      case 'PROVISIONAL':
        level = 'VIGILANCE';
        meaning = language === 'fr'
          ? `Statut provisoire : il s'agit d'une hypothèse de travail d'élevage (ex. mutation Ivoire ou déduction visuelle non certifiée).`
          : `Provisional status: this is a working breeding hypothesis (e.g. Ivory mutation or uncertified visual deduction).`;
        vigilancePoints.push(
          language === 'fr'
            ? "Ce résultat n'a pas valeur de certitude génétique et nécessite une validation humaine ou par descendance."
            : "This result does not constitute genetic certainty and requires human or progeny validation."
        );
        nextVerification = language === 'fr'
          ? "Valider formellement la mutation en observant les résultats de la descendance sur 2 générations."
          : "Formally validate the mutation by observing progeny results over 2 generations.";
        break;

      case 'BLOCKED':
        level = 'VIGILANCE';
        meaning = language === 'fr'
          ? `Locus bloqué : le modèle scientifique a détecté un conflit documentaire ou une controverse non résolue (ex. Ino, Satiné, Perle).`
          : `Blocked locus: the scientific model detected a documentary conflict or unresolved controversy (e.g. Ino, Satiné, Perle).`;
        vigilancePoints.push(
          locus.blockedReason || (language === 'fr'
            ? "Blocage formel : l'assistant ne résout pas ce conflit et ne force aucun calcul arbitraire."
            : "Formal block: the assistant does not resolve this conflict nor force arbitrary calculation.")
        );
        nextVerification = language === 'fr'
          ? "Consulter la documentation scientifique et réviser manuellement la déclaration génétique."
          : "Consult scientific literature and manually review the genetic declaration.";
        break;

      case 'POSSIBLE_SET':
        level = 'INTERPRETATION';
        meaning = language === 'fr'
          ? `Ensemble d'hypothèses possibles : plusieurs configurations génotypiques coexistent (ex. Isabelle en phase inconnue CIS/TRANS).`
          : `Possible set: multiple genotypic configurations coexist (e.g. Isabelle with unknown CIS/TRANS phase).`;
        vigilancePoints.push(
          language === 'fr'
            ? "Toutes les hypothèses documentées sont conservées sans sélection arbitraire de l'une d'entre elles."
            : "All documented hypotheses are preserved without arbitrary selection of one over another."
        );
        nextVerification = language === 'fr'
          ? "Vérifier la généalogie des grands-parents pour déterminer si les allèles ont été transmis en CIS ou en TRANS."
          : "Check grandparents' genealogy to determine whether alleles were transmitted in CIS or TRANS.";
        break;

      case 'CONFIRMED':
      case 'GENETICALLY_CONFIRMED':
      default:
        level = 'INFORMATION';
        meaning = language === 'fr'
          ? `Statut confirmé et validé scientifiquement par observation documentée ou test certifié.`
          : `Confirmed and scientifically validated status through documented observation or certified test.`;
        nextVerification = language === 'fr'
          ? "Conserver la documentation justificative dans les archives de l'élevage."
          : "Retain supporting evidence in flock records.";
        break;
    }

    // Règle spécifique ZW : aucune femelle porteuse Z-linked (Section 8)
    if (isFemale && isZLinked) {
      vigilancePoints.push(
        language === 'fr'
          ? "Règle biologique ZW : chez le canari, les femelles sont hémizygotes (ZW). Une femelle ne peut JAMAIS être porteuse d'une mutation liée au chromosome Z (elle est soit mutante, soit de type sauvage)."
          : "Biological rule ZW: in canaries, females are hemizygous (ZW). A female can NEVER be a carrier of a Z-linked mutation (she is either mutant or wild-type)."
      );
    }

    return {
      id: `dss-locus-${locus.locusId}-${Date.now()}`,
      title: language === 'fr' ? `Aide décisionnelle : Locus ${locusName}` : `Decision Support: Locus ${locusName}`,
      level,
      source: {
        domain: 'canonical',
        engineOrTable: 'CanonicalGeneticsModel',
        evidenceIds: locus.evidenceIds,
        referenceKey: locus.locusId
      },
      epistemicStatus: rawStatus,
      situation: language === 'fr'
        ? `${birdLabel} — Locus ${locusName} (${locus.inheritanceType || 'Transmission canonique'}).`
        : `${birdLabel} — Locus ${locusName} (${locus.inheritanceType || 'Canonical inheritance'}).`,
      result: language === 'fr'
        ? `Statut officiel enregistré : ${rawStatus}.`
        : `Official recorded status: ${rawStatus}.`,
      meaning,
      vigilancePoints: vigilancePoints.length > 0 ? vigilancePoints : [
        language === 'fr' ? "Donnée génétique conforme au référentiel." : "Genetic data compliant with canonical standard."
      ],
      missingData,
      nextVerification: nextVerification || (language === 'fr' ? "Aucune action requise." : "No action required.")
    };
  }

  /**
   * 3. ASSISTANCE À LA DÉCISION POUR LA GÉNÉALOGIE & CONSANGUINITÉ (Section 9)
   * Explique les relations et le coefficient de Wright calculé sans recalculer.
   */
  static buildInbreedingDecisionSupport(
    maleId: number,
    femaleId: number,
    birds: Canari[],
    language: Language = 'fr'
  ): DecisionSupportItem {
    const male = birds.find(b => b.id === maleId);
    const female = birds.find(b => b.id === femaleId);
    const maleLabel = male?.nom || male?.bague || `Oiseau #${maleId}`;
    const femaleLabel = female?.nom || female?.bague || `Oiseau #${femaleId}`;

    // Calcul officiel préexistant via WrightCoefficientEngine
    const wright = WrightCoefficientEngine.calculateInbreeding(maleId, femaleId, birds);
    const coefficient = wright.coefficient ?? 0;
    const isDirectInbreeding = male && female && (
      (male.pere_id && female.pere_id && male.pere_id === female.pere_id && male.mere_id === female.mere_id) ||
      (male.id === female.pere_id || female.id === male.mere_id)
    );

    const level: AssistanceLevel = coefficient > 6.25 || isDirectInbreeding ? 'VIGILANCE' : 'INFORMATION';
    const vigilancePoints: string[] = [];
    const missingData: string[] = [];

    if (isDirectInbreeding) {
      vigilancePoints.push(
        language === 'fr'
          ? "Accouplement consanguin direct détecté (frère-sœur ou parent-enfant). Risque accru de mortalité embryonnaire et d'expression de tares récessives délétères."
          : "Direct inbreeding detected (brother-sister or parent-child). High risk of embryonic mortality and expression of deleterious recessive traits."
      );
    }

    if (coefficient > 12.5) {
      vigilancePoints.push(
        language === 'fr'
          ? `Coefficient de Wright très élevé (${coefficient.toFixed(2)}%). Consanguinité sévère pouvant dégrader la vigueur immunitaire et la fertilité.`
          : `Very high Wright coefficient (${coefficient.toFixed(2)}%). Severe inbreeding likely to degrade immune vigor and fertility.`
      );
    } else if (coefficient > 6.25) {
      vigilancePoints.push(
        language === 'fr'
          ? `Coefficient de Wright modéré (${coefficient.toFixed(2)}%). Travail de lignée admissible mais à surveiller.`
          : `Moderate Wright coefficient (${coefficient.toFixed(2)}%). Linebreeding acceptable but requires close monitoring.`
      );
    }

    // Détection de parents inconnus
    if (male && (!male.pere_id || !male.mere_id)) {
      missingData.push(language === 'fr' ? `Généalogie incomplète pour le père "${maleLabel}".` : `Incomplete pedigree for sire "${maleLabel}".`);
    }
    if (female && (!female.pere_id || !female.mere_id)) {
      missingData.push(language === 'fr' ? `Généalogie incomplète pour la mère "${femaleLabel}".` : `Incomplete pedigree for dam "${femaleLabel}".`);
    }

    return {
      id: `dss-inbreeding-${maleId}-${femaleId}-${Date.now()}`,
      title: language === 'fr' ? `Analyse de parenté : ${maleLabel} × ${femaleLabel}` : `Kinship analysis: ${maleLabel} × ${femaleLabel}`,
      level,
      source: {
        domain: 'genealogy',
        engineOrTable: 'WrightCoefficientEngine'
      },
      epistemicStatus: missingData.length > 0 ? 'UNKNOWN' : 'CONFIRMED',
      situation: language === 'fr'
        ? `Évaluation généalogique du couple formé par ${maleLabel} et ${femaleLabel}.`
        : `Genealogical evaluation of pair formed by ${maleLabel} and ${femaleLabel}.`,
      result: language === 'fr'
        ? `Coefficient de consanguinité de Wright : ${coefficient.toFixed(2)}% (${wright.commonAncestors.length} ancêtre(s) commun(s) identifié(s)).`
        : `Wright inbreeding coefficient: ${coefficient.toFixed(2)}% (${wright.commonAncestors.length} common ancestor(s) identified).`,
      meaning: language === 'fr'
        ? `Ce coefficient mesure la probabilité que deux allèles à un locus quelconque soient identiques par descendance d'un même ancêtre.`
        : `This coefficient measures the probability that two alleles at any locus are identical by descent from a common ancestor.`,
      vigilancePoints: vigilancePoints.length > 0 ? vigilancePoints : [
        language === 'fr'
          ? "Le coefficient reste dans les limites de sécurité recommandées."
          : "The coefficient remains within recommended safety margins."
      ],
      missingData,
      nextVerification: isDirectInbreeding
        ? (language === 'fr'
            ? "Envisager de ré-accoupler ces sujets avec des partenaires non apparentés pour préserver la vigueur."
            : "Consider remating these subjects with unrelated partners to preserve vigor.")
        : missingData.length > 0
          ? (language === 'fr'
              ? "Rechercher et renseigner les ascendants manquants pour fiabiliser le calcul de consanguinité."
              : "Search and record missing ancestors to enhance inbreeding accuracy.")
          : (language === 'fr'
              ? "Suivre la viabilité et la vigueur des jeunes issus de ce couple."
              : "Monitor viability and vigor of chicks hatched from this pair.")
    };
  }

  /**
   * 4. DÉTECTION ET QUALIFICATION DES DONNÉES MANQUANTES (Section 11)
   * Formulations neutres et sans invention.
   */
  static detectMissingData(data: IntelligenceRuleData, language: Language = 'fr'): MissingDataItem[] {
    const items: MissingDataItem[] = [];

    // 1. Oiseaux
    data.birds.forEach(bird => {
      // Sexe inconnu
      if (!bird.sexe || (bird.sexe as string) === 'Indéterminé' || (bird.sexe as string) === 'UNKNOWN') {
        items.push({
          id: `md-bird-sex-${bird.id}`,
          entityType: 'bird',
          entityId: bird.id,
          entityLabel: bird.nom || bird.bague || `Oiseau #${bird.id}`,
          missingField: 'sexe',
          severity: 'high',
          description: language === 'fr'
            ? `Le sexe de l'oiseau "${bird.nom || bird.bague}" n'est pas renseigné (Indéterminé).`
            : `Sex for bird "${bird.nom || bird.bague}" is not recorded (Undetermined).`,
          suggestedAction: language === 'fr'
            ? "Déterminer le sexe par chant, comportement de ponte ou sexage ADN, puis compléter la fiche."
            : "Determine sex via song, laying behavior, or DNA test, then update the record."
        });
      }

      // Date de naissance manquante
      if (!bird.date_naissance) {
        items.push({
          id: `md-bird-birth-${bird.id}`,
          entityType: 'bird',
          entityId: bird.id,
          entityLabel: bird.nom || bird.bague || `Oiseau #${bird.id}`,
          missingField: 'date_naissance',
          severity: 'medium',
          description: language === 'fr'
            ? `La date d'éclosion ou de naissance de "${bird.nom || bird.bague}" n'est pas enregistrée.`
            : `Hatching or birth date for "${bird.nom || bird.bague}" is not recorded.`,
          suggestedAction: language === 'fr'
            ? "Renseigner l'année ou la date exacte de naissance pour permettre le calcul précis de la maturité."
            : "Record exact birth year or date to enable accurate maturity calculation."
        });
      }

      // Parents inconnus pour oiseau né à l'élevage
      if (!bird.acquisition && !bird.pere_id && !bird.mere_id) {
        items.push({
          id: `md-bird-parents-${bird.id}`,
          entityType: 'bird',
          entityId: bird.id,
          entityLabel: bird.nom || bird.bague || `Oiseau #${bird.id}`,
          missingField: 'parents',
          severity: 'medium',
          description: language === 'fr'
            ? `L'oiseau "${bird.nom || bird.bague}" est né à l'élevage mais ses parents direct ne sont pas enregistrés.`
            : `Bird "${bird.nom || bird.bague}" was born in the aviary but direct parents are not recorded.`,
          suggestedAction: language === 'fr'
            ? "Rattacher le père et la mère pour permettre le calcul de consanguinité et la traçabilité généalogique."
            : "Link sire and dam to enable inbreeding computation and pedigree traceability."
        });
      }

      // Numéro de bague manquant
      if (!bird.bague || bird.bague.trim().length <= 3) {
        items.push({
          id: `md-bird-ring-${bird.id}`,
          entityType: 'bird',
          entityId: bird.id,
          entityLabel: bird.nom || `Oiseau #${bird.id}`,
          missingField: 'bague',
          severity: 'high',
          description: language === 'fr'
            ? `L'oiseau "${bird.nom || 'Sans nom'}" ne possède pas de numéro de bague d'identification valide.`
            : `Bird "${bird.nom || 'Unnamed'}" lacks a valid identification ring number.`,
          suggestedAction: language === 'fr'
            ? "Renseigner le numéro officiel de bague fermée pour garantir l'identification légale de l'oiseau."
            : "Record official closed band number to ensure legal identification."
        });
      }
    });

    // 2. Couvées de reproduction (Section 10)
    data.clutches.forEach(clutch => {
      // Œufs déclarés mais aucune date d'éclosion ou résultat
      if (clutch.eggCount > 0 && clutch.status === 'active' && clutch.fertilizedCount === null && clutch.hatchedCount === null) {
        items.push({
          id: `md-clutch-result-${clutch.id}`,
          entityType: 'clutch',
          entityId: clutch.id,
          entityLabel: `Couvée #${clutch.id}`,
          missingField: 'mirage_eclosion',
          severity: 'medium',
          description: language === 'fr'
            ? `${clutch.eggCount} œuf(s) sont enregistrés pour cette couvée active mais aucun mirage ni résultat d'éclosion n'est renseigné.`
            : `${clutch.eggCount} egg(s) are recorded for this active clutch, but no candling or hatching result is documented.`,
          suggestedAction: language === 'fr'
            ? "Vérifier le nid (mirage à J+6 ou contrôle d'éclosion à J+14) et consigner le nombre d'œufs fécondés ou éclos."
            : "Inspect the nest (candling at day 6 or hatching check at day 14) and record fertile or hatched egg counts."
        });
      }
    });

    return items;
  }

  /**
   * 5. ASSISTANCE À LA DÉCISION POUR LES DOSSIERS SANITAIRES (Section 10)
   * Détecte les situations à vérifier sans JAMAIS poser de diagnostic vétérinaire.
   */
  static buildHealthDecisionSupport(
    healthRecords: Sante[],
    birds: Canari[],
    language: Language = 'fr'
  ): DecisionSupportItem[] {
    const items: DecisionSupportItem[] = [];
    const activeRecords = healthRecords.filter(r => r.statut === 'En attente');
    const treatments = healthRecords.filter(r => r.categorie === 'Traitement');

    // Oiseaux avec plusieurs soins récents
    const birdTreatments: Record<number, Sante[]> = {};
    treatments.forEach(t => {
      birdTreatments[t.canari_id] = birdTreatments[t.canari_id] || [];
      birdTreatments[t.canari_id].push(t);
    });

    Object.entries(birdTreatments).forEach(([birdIdStr, records]) => {
      const birdId = Number(birdIdStr);
      if (records.length >= 2) {
        const bird = birds.find(b => b.id === birdId);
        const birdLabel = bird?.nom || bird?.bague || `Oiseau #${birdId}`;

        items.push({
          id: `dss-health-${birdId}-${Date.now()}`,
          title: language === 'fr' ? `Suivi sanitaire : ${birdLabel}` : `Health follow-up: ${birdLabel}`,
          level: 'VIGILANCE',
          source: {
            domain: 'health',
            engineOrTable: 'HealthRepository'
          },
          situation: language === 'fr'
            ? `${records.length} interventions sanitaires ou traitements enregistrés pour ${birdLabel}.`
            : `${records.length} health interventions or treatments recorded for ${birdLabel}.`,
          result: language === 'fr'
            ? `Dossier sanitaire nécessitant un suivi particulier.`
            : `Health file requiring dedicated monitoring.`,
          meaning: language === 'fr'
            ? "La répétition de soins peut signaler une fragilité physiologique ou un déséquilibre d'hébergement. Bird Intelligence ne formule aucun diagnostic médical."
            : "Repeated care may indicate physiological weakness or housing imbalance. Bird Intelligence never provides medical diagnosis.",
          vigilancePoints: [
            language === 'fr'
              ? "Ceci ne constitue pas un diagnostic vétérinaire. Seul un vétérinaire aviaire qualifié peut établir un diagnostic et prescrire une thérapeutique."
              : "This does not constitute a veterinary diagnosis. Only a qualified avian veterinarian can establish a diagnosis and prescribe therapy.",
            language === 'fr'
              ? "Maintenir les mesures de quarantaine et d'hygiène préventive."
              : "Maintain quarantine and preventive hygiene measures."
          ],
          missingData: [],
          nextVerification: language === 'fr'
            ? "Consulter un vétérinaire aviaire en lui présentant l'historique complet des soins enregistrés."
            : "Consult an avian veterinarian presenting the full registered history of care."
        });
      }
    });

    return items;
  }

  /**
   * 6. SYNTHÈSE COMPLÈTE DE L'ÉLEVAGE (Section 6 & 10)
   * Rassemble toutes les aides à la décision calculées à partir des moteurs existants.
   */
  static getComprehensiveFlockDecisionSupport(
    data: IntelligenceRuleData,
    language: Language = 'fr'
  ): DecisionSupportSummary {
    const items: DecisionSupportItem[] = [];

    // A. Évaluation de la qualité des données (Section 11)
    const dq = DataQualityEngine.analyze(data.birds);
    if (dq.issues.length > 0) {
      items.push({
        id: `dss-data-quality-${Date.now()}`,
        title: language === 'fr' ? "Qualité globale des données d'élevage" : "Global flock data quality",
        level: 'MISSING_DATA',
        source: {
          domain: 'data_quality',
          engineOrTable: 'DataQualityEngine'
        },
        situation: language === 'fr'
          ? `${dq.checkedCount} oiseau(x) audité(s). Score de complétude : ${dq.score}%.`
          : `${dq.checkedCount} bird(s) audited. Completeness score: ${dq.score}%.`,
        result: language === 'fr'
          ? `${dq.issues.length} anomalie(s) ou donnée(s) manquante(s) identifiée(s).`
          : `${dq.issues.length} issue(s) or missing data identified.`,
        meaning: language === 'fr'
          ? "La précision des analyses décisionnelles dépend directement de l'exhaustivité des données d'identification et de généalogie."
          : "The accuracy of decision support depends directly on the completeness of identification and pedigree records.",
        vigilancePoints: dq.issues.slice(0, 3).map(i => i.description),
        missingData: dq.issues.map(i => i.recommendation).slice(0, 3),
        nextVerification: language === 'fr'
          ? "Compléter en priorité les numéros de bague et les liens parentaux manquants."
          : "Prioritize filling missing ring numbers and parental links."
      });
    }

    // B. Règles déterministes existantes (Section 12)
    const ruleResults = RuleEngine.evaluateAll(data);
    const triggeredRules = ruleResults.filter(r => r.triggered);

    triggeredRules.forEach(rule => {
      items.push({
        id: `dss-rule-${rule.ruleId}-${Date.now()}`,
        title: rule.name,
        level: rule.priority === 'high' ? 'VIGILANCE' : 'USER_ACTION',
        source: {
          domain: rule.category as DecisionSupportSource['domain'],
          engineOrTable: 'RuleEngine',
          referenceKey: rule.ruleId
        },
        situation: language === 'fr'
          ? `Règle de gestion déclenchée pour la catégorie ${rule.category}.`
          : `Management rule triggered for category ${rule.category}.`,
        result: rule.explanation,
        meaning: language === 'fr'
          ? "Cette situation correspond à un critère avicole prédéfini dans les règles d'élevage homologuées."
          : "This situation matches a predefined avicultural criterion from homologated breeding rules.",
        vigilancePoints: [rule.explanation],
        missingData: [],
        nextVerification: rule.recommendation
      });
    });

    // C. Suivi sanitaire
    const healthItems = this.buildHealthDecisionSupport(data.healthRecords, data.birds, language);
    items.push(...healthItems);

    // D. Données manquantes détaillées
    const missingDataItems = this.detectMissingData(data, language);

    return {
      flockScore: dq.score,
      items,
      missingDataItems,
      totalAlerts: triggeredRules.length,
      generatedAt: new Date().toISOString()
    };
  }
}
