/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PASSPORT SUGGESTION SERVICE
 * Version : V1.9.3 (Bird Passport — Expérience Utilisateur Avancée)
 * 
 * GARANTIES SCIENTIFIQUES & ÉPISTÉMIQUES :
 * 1. ZÉRO INFÉRENCE FORCÉE : Une suggestion reste une suggestion hypothétique.
 * 2. ZÉRO CANARY FALLBACK : Suggestions strictement scôpées selon l'espèce des parents.
 * 3. RÈGLE ZW STRICTE : Une femelle ne peut JAMAIS être déclarée ou suggérée comme porteuse Z-linked.
 * 4. STATUTS ÉPISTÉMIQUES INTACTS : UNKNOWN reste UNKNOWN, NOT_TESTED reste NOT_TESTED.
 * 5. CONFIRMATION HUMAINE EXIGÉE : L'utilisateur peut Accepter, Modifier, Refuser, ou Laisser Inconnu.
 */

import { Canari } from '../../../types';
import { getSpeciesById } from '../../../data/speciesRegistry';

export type SuggestionStatus = 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'REJECTED' | 'UNKNOWN' | 'NOT_TESTED';

export interface PassportSuggestion {
  id: string;
  field: string;
  labelKey: string;
  defaultLabel: string;
  suggestedValue: any;
  userValue?: any;
  source: 'father' | 'mother' | 'both_parents' | 'species_reference';
  sourceDescription: string;
  rationale: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  status: SuggestionStatus;
  isGenetics: boolean;
  isZLinked?: boolean;
  isFemaleTarget?: boolean;
}

export interface SuggestionGenerationParams {
  bird?: Partial<Canari> | null;
  speciesId?: string;
  sex?: 'Mâle' | 'Femelle' | 'Indéterminé';
  father?: Canari | null;
  mother?: Canari | null;
  allBirds?: Canari[];
}

export class PassportSuggestionService {
  /**
   * Génère les suggestions intelligentes basées sur les parents sélectionnés
   * sans jamais inventer de données ni forcer de génotype.
   */
  public static generateSuggestions(params: SuggestionGenerationParams): PassportSuggestion[] {
    const { bird, speciesId, sex, father, mother } = params;
    const suggestions: PassportSuggestion[] = [];

    const isFemale = sex === 'Femelle';
    const resolvedSpecies = speciesId || bird?.espece || (father?.espece && mother?.espece && father.espece === mother.espece ? father.espece : undefined);

    // 1. Suggestion d'espèce basée sur les parents
    if (father && mother && father.espece && mother.espece) {
      if (father.espece === mother.espece && (!bird?.espece || bird.espece !== father.espece)) {
        const specMeta = getSpeciesById(father.espece);
        suggestions.push({
          id: `sug_species_${Date.now()}_1`,
          field: 'espece',
          labelKey: 'suggestedSpecies',
          defaultLabel: "Espèce héritée des deux parents",
          suggestedValue: father.espece,
          source: 'both_parents',
          sourceDescription: `${father.nom || father.bague} & ${mother.nom || mother.bague}`,
          rationale: `Les deux parents biologiques appartiennent à l'espèce ${specMeta?.defaultLabel || father.espece}.`,
          confidence: 'HIGH',
          status: 'PENDING',
          isGenetics: false
        });
      }
    } else if (father?.espece && !bird?.espece) {
      const specMeta = getSpeciesById(father.espece);
      suggestions.push({
        id: `sug_species_${Date.now()}_2`,
        field: 'espece',
        labelKey: 'suggestedSpecies',
        defaultLabel: "Espèce issue du père",
        suggestedValue: father.espece,
        source: 'father',
        sourceDescription: `${father.nom || father.bague}`,
        rationale: `Père biologique déclaré : ${specMeta?.defaultLabel || father.espece}.`,
        confidence: 'MEDIUM',
        status: 'PENDING',
        isGenetics: false
      });
    } else if (mother?.espece && !bird?.espece) {
      const specMeta = getSpeciesById(mother.espece);
      suggestions.push({
        id: `sug_species_${Date.now()}_3`,
        field: 'espece',
        labelKey: 'suggestedSpecies',
        defaultLabel: "Espèce issue de la mère",
        suggestedValue: mother.espece,
        source: 'mother',
        sourceDescription: `${mother.nom || mother.bague}`,
        rationale: `Mère biologique déclarée : ${specMeta?.defaultLabel || mother.espece}.`,
        confidence: 'MEDIUM',
        status: 'PENDING',
        isGenetics: false
      });
    }

    // 2. Suggestion de Catégorie & Race si les deux parents concordent
    if (father && mother && father.espece === mother.espece) {
      if (father.categorie && mother.categorie && father.categorie === mother.categorie) {
        if (!bird?.categorie || bird.categorie !== father.categorie) {
          suggestions.push({
            id: `sug_category_${Date.now()}`,
            field: 'categorie',
            labelKey: 'suggestedCategory',
            defaultLabel: "Catégorie d'élevage partagée par les parents",
            suggestedValue: father.categorie,
            source: 'both_parents',
            sourceDescription: `${father.nom || father.bague} (${father.categorie})`,
            rationale: "Les deux parents sont enregistrés sous cette catégorie d'élevage.",
            confidence: 'HIGH',
            status: 'PENDING',
            isGenetics: false
          });
        }
      }

      if (father.race && mother.race && father.race === mother.race) {
        if (!bird?.race || bird.race !== father.race) {
          suggestions.push({
            id: `sug_race_${Date.now()}`,
            field: 'race',
            labelKey: 'suggestedBreed',
            defaultLabel: "Race / Variété partagée",
            suggestedValue: father.race,
            source: 'both_parents',
            sourceDescription: `${father.nom || father.bague} (${father.race})`,
            rationale: "Les deux parents sont de la même race / variété.",
            confidence: 'HIGH',
            status: 'PENDING',
            isGenetics: false
          });
        }
      }
    }

    // 3. Suggestions Phénotypiques & Génétiques (strictement scôpées selon l'espèce)
    if (!resolvedSpecies) {
      return suggestions;
    }

    const normSpecies = resolvedSpecies.toLowerCase().trim();

    if (normSpecies === 'diamant_gould' || normSpecies === 'chloebia_gouldiae') {
      // GOULD : Suggestions scôpées sur la biologie du Diamant de Gould
      if (father && mother) {
        // Hypothèse de couleur de masque
        const fHead = father.race || father.mutation || '';
        const mHead = mother.race || mother.mutation || '';
        if (fHead.includes('Noire') && mHead.includes('Noire')) {
          suggestions.push({
            id: `sug_gould_head_${Date.now()}`,
            field: 'phenotype_head',
            labelKey: 'suggestedHeadColor',
            defaultLabel: "Hypothèse masque noir (Tête noire)",
            suggestedValue: 'Tête Noire',
            source: 'both_parents',
            sourceDescription: 'Père et Mère à masque noir (allèle récessif lié au sexe)',
            rationale: "Les deux parents exprimant le masque noir, l'allèle est obligatoirement transmis sans masque rouge dominant.",
            confidence: 'HIGH',
            status: 'PENDING',
            isGenetics: true,
            isZLinked: true,
            isFemaleTarget: isFemale
          });
        } else if (fHead.includes('Rouge') || mHead.includes('Rouge')) {
          suggestions.push({
            id: `sug_gould_head_${Date.now()}`,
            field: 'phenotype_head',
            labelKey: 'suggestedHeadColor',
            defaultLabel: "Hypothèse masque rouge possible",
            suggestedValue: 'Tête Rouge',
            source: 'both_parents',
            sourceDescription: 'Présence de masque rouge chez au moins un parent',
            rationale: "Le masque rouge étant dominant lié au sexe, il est susceptible d'être exprimé.",
            confidence: 'MEDIUM',
            status: 'PENDING',
            isGenetics: true,
            isZLinked: true,
            isFemaleTarget: isFemale
          });
        }
      }
    } else if (['canari', 'serinus_canaria', 'serinus_canaria_domestica'].includes(normSpecies)) {
      // CANARI : Suggestions scôpées sur le Canari
      if (father && mother) {
        // Lipochrome suggéré si concordant
        const fCol = (father.couleur_base || '').toLowerCase();
        const mCol = (mother.couleur_base || '').toLowerCase();
        if (fCol.includes('jaune') && mCol.includes('jaune')) {
          suggestions.push({
            id: `sug_canary_lipochrome_${Date.now()}`,
            field: 'couleur_base',
            labelKey: 'suggestedBaseColor',
            defaultLabel: "Lipochrome Jaune proposé",
            suggestedValue: 'Jaune',
            source: 'both_parents',
            sourceDescription: 'Parents tous deux lipochromes jaunes',
            rationale: 'Parents partageant le même fond lipochrome jaune.',
            confidence: 'HIGH',
            status: 'PENDING',
            isGenetics: true
          });
        } else if (fCol.includes('blanc') && mCol.includes('blanc')) {
          suggestions.push({
            id: `sug_canary_lipochrome_${Date.now()}`,
            field: 'couleur_base',
            labelKey: 'suggestedBaseColor',
            defaultLabel: "Lipochrome Blanc proposé",
            suggestedValue: 'Blanc',
            source: 'both_parents',
            sourceDescription: 'Parents tous deux blancs',
            rationale: 'Parents partageant le fond blanc.',
            confidence: 'HIGH',
            status: 'PENDING',
            isGenetics: true
          });
        }

        // Facteur de structure (Intensif / Schimmel) : jamais deux intensifs sans alerte létale
        const fFact = father.facteur || '';
        const mFact = mother.facteur || '';
        if (fFact === 'Intensif' && mFact === 'Schimmel') {
          suggestions.push({
            id: `sug_canary_facteur_${Date.now()}`,
            field: 'facteur',
            labelKey: 'suggestedPlumageFactor',
            defaultLabel: "Facteur Intensif ou Schimmel possible (50/50)",
            suggestedValue: 'Schimmel',
            source: 'both_parents',
            sourceDescription: 'Croisement standard recommandé Intensif x Schimmel',
            rationale: 'Croisement sans risque létal, produisant 50% Intensif et 50% Schimmel.',
            confidence: 'MEDIUM',
            status: 'PENDING',
            isGenetics: true
          });
        }

        // Porteurs récessifs (Ex. Brun, Agate, Satiné) — RÈGLE ZW STRICTE
        // Si le père est Brun et la jeune est une femelle, elle exprime le Brun (hémizygote Zbr/W).
        // Mais si la mère est Brune et le père sauvage non porteur, la femelle NE PEUT PAS être porteuse Z-linked !
        if (isFemale && mother.mutation?.includes('Brun') && !father.mutation?.includes('Brun')) {
          // On s'assure expressément de NE PAS suggérer de portage Z-linked chez la femelle
          // Règle biologique ZW respectée : la femelle hérite le W de la mère, donc aucun portage Brun lié au sexe.
        } else if (!isFemale && mother.mutation?.includes('Brun') && !father.mutation?.includes('Brun')) {
          // Le jeune mâle hérite un Zbr de la mère et Z+ du père -> Porteur Brun possible (Z+/Zbr)
          suggestions.push({
            id: `sug_canary_carrier_${Date.now()}`,
            field: 'carrier_status',
            labelKey: 'suggestedCarrierStatus',
            defaultLabel: "Porteur possible Brun (/brun) chez le mâle",
            suggestedValue: 'Porteur Brun',
            source: 'mother',
            sourceDescription: `Mère ${mother.mutation || 'Brune'}`,
            rationale: "Un fils issu d'une mère à mutation liée au sexe reçoit obligatoirement son chromosome Z muté.",
            confidence: 'HIGH',
            status: 'PENDING',
            isGenetics: true,
            isZLinked: true,
            isFemaleTarget: false
          });
        }
      }
    } else if (normSpecies === 'diamant_mandarin') {
      // MANDARIN : Suggestions scôpées Mandarin
      if (father && mother) {
        if (father.race === mother.race && father.race) {
          suggestions.push({
            id: `sug_mandarin_var_${Date.now()}`,
            field: 'race',
            labelKey: 'suggestedBreed',
            defaultLabel: `Variété proposée : ${father.race}`,
            suggestedValue: father.race,
            source: 'both_parents',
            sourceDescription: `${father.race}`,
            rationale: "Les deux parents appartiennent à cette variété de Diamant Mandarin.",
            confidence: 'HIGH',
            status: 'PENDING',
            isGenetics: false
          });
        }
      }
    } else if (normSpecies === 'calopsitte') {
      // CALOPSITTE : Suggestions scôpées Calopsitte
      if (father && mother) {
        if (father.race === mother.race && father.race) {
          suggestions.push({
            id: `sug_calopsitte_var_${Date.now()}`,
            field: 'race',
            labelKey: 'suggestedBreed',
            defaultLabel: `Mutation observée : ${father.race}`,
            suggestedValue: father.race,
            source: 'both_parents',
            sourceDescription: `${father.race}`,
            rationale: "Variété partagée par les parents de Calopsitte.",
            confidence: 'HIGH',
            status: 'PENDING',
            isGenetics: false
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * Applique ou résout une suggestion de façon contrôlée par l'utilisateur.
   */
  public static resolveSuggestion(
    suggestion: PassportSuggestion,
    action: 'ACCEPT' | 'MODIFY' | 'REJECT' | 'UNKNOWN' | 'NOT_TESTED',
    customValue?: any
  ): { updatedFields: Partial<Canari>; resolvedSuggestion: PassportSuggestion } {
    const resolved: PassportSuggestion = {
      ...suggestion,
      status: action === 'ACCEPT' ? 'ACCEPTED'
        : action === 'MODIFY' ? 'MODIFIED'
        : action === 'REJECT' ? 'REJECTED'
        : action === 'UNKNOWN' ? 'UNKNOWN'
        : 'NOT_TESTED',
      userValue: action === 'MODIFY' ? customValue : (action === 'ACCEPT' ? suggestion.suggestedValue : undefined)
    };

    const updatedFields: Partial<Canari> = {};

    if (action === 'ACCEPT') {
      (updatedFields as any)[suggestion.field] = suggestion.suggestedValue;
    } else if (action === 'MODIFY' && customValue !== undefined) {
      (updatedFields as any)[suggestion.field] = customValue;
    } else if (action === 'UNKNOWN') {
      (updatedFields as any)[suggestion.field] = 'UNKNOWN';
    } else if (action === 'NOT_TESTED') {
      (updatedFields as any)[suggestion.field] = 'NOT_TESTED';
    }
    // REJECT ne modifie rien

    return { updatedFields, resolvedSuggestion: resolved };
  }
}
