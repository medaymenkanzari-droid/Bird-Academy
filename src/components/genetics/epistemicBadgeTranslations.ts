/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — TRADUCTIONS DES BADGES, CARTES, DRAWERS ET ÉDITEUR ÉPISTÉMIQUE CANONIQUE
 * Support complet FR / EN / AR / ES / IT & RTL.
 */

import type { Language } from '../../utils/translations';

export type EpistemicTranslationKey =
  // Status
  | 'status.GENETICALLY_CONFIRMED'
  | 'status.OBSERVED'
  | 'status.DECLARED'
  | 'status.INFERRED'
  | 'status.UNKNOWN'
  | 'status.NOT_TESTED'
  | 'status.CONFLICT_REVIEW'
  | 'status.REVIEW_REQUIRED'
  | 'status.POSSIBLE_SET'
  | 'status.PROVISIONAL'
  | 'status.BLOCKED'
  | 'status.NEEDS_HUMAN_REVIEW'
  | 'status.CONFLICTING'
  | 'status.INSUFFICIENT_INFORMATION'
  | 'status.CONFIRMED'
  // Pedagogy & Epistemic Distinction V1.9.4
  | 'pedagogy.phenotype_title'
  | 'pedagogy.phenotype_desc'
  | 'pedagogy.genotype_title'
  | 'pedagogy.genotype_desc'
  | 'pedagogy.carrier_title'
  | 'pedagogy.carrier_desc'
  | 'pedagogy.phenotype_not_genotype_warning'
  | 'pedagogy.zw_female_notice'
  | 'pedagogy.q_what_is_it'
  | 'pedagogy.q_what_is_observed'
  | 'pedagogy.q_what_is_certain'
  | 'pedagogy.q_what_is_unknown'
  | 'pedagogy.q_what_is_not_tested'
  | 'pedagogy.q_where_does_it_come_from'
  | 'pedagogy.q_what_is_confidence'
  | 'pedagogy.q_is_review_needed'
  // Suggestions V1.9.4
  | 'suggestion.banner_title'
  | 'suggestion.banner_desc'
  | 'suggestion.badge'
  | 'suggestion.inherited_value'
  | 'suggestion.accept'
  | 'suggestion.modify'
  | 'suggestion.reject'
  | 'suggestion.keep_unknown'
  | 'suggestion.keep_not_tested'
  | 'suggestion.not_genetically_confirmed_notice'
  // Cross Facets V1.9.4
  | 'cross.official_explanation_title'
  | 'cross.parents_used_facet'
  | 'cross.loci_analyzed_facet'
  | 'cross.official_result_facet'
  | 'cross.official_probabilities_facet'
  | 'cross.calculated_risks_facet'
  | 'cross.missing_info_facet'
  | 'cross.calculation_limits_facet'
  | 'cross.epistemic_statuses_facet'
  | 'cross.no_arbitrary_score_notice'
  // Source / Provenance
  | 'source.DNA_TEST'
  | 'source.PROGENY_TEST_CROSS'
  | 'source.PARENTAL_PEDIGREE'
  | 'source.PHENOTYPIC_OBSERVATION'
  | 'source.USER_DECLARATION'
  | 'source.SYSTEM_INFERENCE'
  | 'source.LEGACY_MIGRATION'
  // Confidence
  | 'confidence.VERY_HIGH'
  | 'confidence.HIGH'
  | 'confidence.MEDIUM'
  | 'confidence.LOW'
  | 'confidence.VERY_LOW'
  | 'confidence.UNKNOWN'
  // Human Review
  | 'review.REQUIRED'
  | 'review.CONFLICT_REVIEW'
  | 'review.RECOMMENDED'
  | 'review.REVIEWED'
  // Locus attributes
  | 'locus.provisional'
  | 'locus.provisional_warning'
  | 'transmission.Z_LINKED'
  | 'transmission.AUTOSOMAL'
  | 'transmission.CO_DOMINANT'
  | 'carrier.CONFIRMED_CARRIER'
  | 'carrier.POSSIBLE_CARRIER'
  // Card elements
  | 'card.title'
  | 'card.subtitle'
  | 'card.global_status'
  | 'card.global_confidence'
  | 'card.loci_section'
  | 'card.empty'
  | 'card.conflict_alert_title'
  | 'card.combinations_count'
  | 'card.summary_footer'
  | 'card.genotype_label'
  | 'card.export_pdf'
  | 'card.exporting_pdf'
  // Drawer elements
  | 'drawer.title'
  | 'drawer.close'
  | 'drawer.status_section'
  | 'drawer.determination_section'
  | 'drawer.confirmed_genotype'
  | 'drawer.possible_hypotheses'
  | 'drawer.hypothesis_item'
  | 'drawer.why_hypothesis'
  | 'drawer.transmission_section'
  | 'drawer.carrier_section'
  | 'drawer.not_applicable'
  | 'drawer.carrier_none'
  | 'drawer.provenance_section'
  | 'drawer.unknown_description'
  | 'drawer.not_tested_description'
  | 'drawer.conflict_title'
  | 'drawer.provisional_notice'
  // Editor elements
  | 'editor.title'
  | 'editor.add_info'
  | 'editor.choose_locus'
  | 'editor.what_i_know'
  | 'editor.mode_observed'
  | 'editor.mode_declared'
  | 'editor.mode_dna'
  | 'editor.mode_possible_set'
  | 'editor.mode_unknown'
  | 'editor.mode_not_tested'
  | 'editor.observation_label'
  | 'editor.source_label'
  | 'editor.confidence_label'
  | 'editor.confidence_hint'
  | 'editor.alleles_label'
  | 'editor.hypotheses_selection'
  | 'editor.save'
  | 'editor.cancel'
  | 'editor.summary_title'
  | 'editor.no_catalogue'
  | 'editor.not_tested_warning'
  // Cross elements
  | 'cross.title'
  | 'cross.open_simulator'
  | 'cross.parent_a'
  | 'cross.parent_b'
  | 'cross.calculate'
  | 'cross.calculating'
  | 'cross.blocked'
  | 'cross.result_title'
  | 'cross.result_hypothetical'
  | 'cross.result_confirmed'
  | 'cross.result_review_required'
  | 'cross.genotypes_section'
  | 'cross.phenotypes_section'
  | 'cross.probability_label'
  | 'cross.parental_hypotheses'
  | 'cross.data_confirmed'
  | 'cross.human_review_required'
  | 'cross.insufficient_data'
  | 'cross.invalid_species'
  | 'cross.sex_required'
  | 'cross.genetic_conflict'
  | 'cross.provisional_framework'
  | 'cross.select_partner'
  | 'cross.composite_label_notice'
  | 'cross.no_result'
  | 'cross.parents_used'
  | 'cross.parent_hypotheses_count'
  | 'cross.mode_confirmed'
  | 'cross.mode_hypothetical'
  | 'cross.mode_hypothetical_desc'
  | 'cross.phenotype_possible'
  | 'cross.probability_coverage'
  | 'cross.human_review_recommended'
  | 'cross.composite_phenotype'
  | 'cross.result_needs_human_review'
  | 'cross.detail_title'
  | 'cross.alleles_label'
  | 'cross.locus_label'
  | 'cross.transmission_label'
  | 'cross.status_label'
  | 'cross.underlying_genotypes_count'
  // Bibliographic Traceability
  | 'biblio.section_title'
  | 'biblio.button_consult'
  | 'biblio.sources_count'
  | 'biblio.conflicting_sources_count'
  | 'biblio.drawer_title'
  | 'biblio.drawer_subtitle'
  | 'biblio.rule_context'
  | 'biblio.species_label'
  | 'biblio.locus_label'
  | 'biblio.claim_label'
  | 'biblio.epistemic_status'
  | 'biblio.human_review'
  | 'biblio.human_review_required'
  | 'biblio.human_review_not_required'
  | 'biblio.limitations_label'
  | 'biblio.evidence_records_title'
  | 'biblio.no_sources_available'
  | 'biblio.evidence_id'
  | 'biblio.citations_count'
  | 'biblio.citations_title'
  | 'biblio.citation_id'
  | 'biblio.source_level'
  | 'biblio.source_level_p0'
  | 'biblio.source_level_p1'
  | 'biblio.source_level_p2'
  | 'biblio.concordance_concordant'
  | 'biblio.concordance_conflicting'
  | 'biblio.concordance_insufficient'
  | 'biblio.concordance_outdated'
  | 'biblio.concordance_not_verified'
  | 'biblio.role_primary'
  | 'biblio.role_corroborative'
  | 'biblio.role_historical'
  | 'biblio.role_challenged'
  | 'biblio.source_title'
  | 'biblio.authors'
  | 'biblio.organization'
  | 'biblio.year'
  | 'biblio.publisher'
  | 'biblio.journal'
  | 'biblio.volume_issue_pages'
  | 'biblio.location'
  | 'biblio.doi'
  | 'biblio.isbn'
  | 'biblio.url'
  | 'biblio.verification_verified'
  | 'biblio.verification_not_verified'
  | 'biblio.verification_outdated'
  | 'biblio.source_consulted_at'
  | 'biblio.notes'
  | 'biblio.warning_no_auto_winner'
  | 'biblio.warning_p1_not_verified'
  | 'biblio.close';

const fr: Record<EpistemicTranslationKey, string> = {
  'status.GENETICALLY_CONFIRMED': 'Génétiquement confirmé',
  'status.OBSERVED': 'Observation visuelle',
  'status.DECLARED': 'Déclaration éleveur',
  'status.INFERRED': 'Déduction théorique',
  'status.UNKNOWN': 'Inconnu',
  'status.NOT_TESTED': 'Non testé',
  'status.CONFLICT_REVIEW': 'Conflit à vérifier',
  'status.REVIEW_REQUIRED': 'Revue requise',
  'status.POSSIBLE_SET': 'Hypothèses possibles',
  'status.PROVISIONAL': 'Provisoire — confirmation nécessaire',
  'status.BLOCKED': 'Bloqué — règle scientifique actuellement non utilisable',
  'status.NEEDS_HUMAN_REVIEW': 'Vérification humaine nécessaire',
  'status.CONFLICTING': 'Informations contradictoires',
  'status.INSUFFICIENT_INFORMATION': 'Informations insuffisantes',
  'status.CONFIRMED': 'Confirmé',

  // Pédagogie V1.9.4
  'pedagogy.phenotype_title': 'Phénotype',
  'pedagogy.phenotype_desc': 'Ce que vous observez chez l\'oiseau.',
  'pedagogy.genotype_title': 'Génotype',
  'pedagogy.genotype_desc': 'Les informations génétiques connues ou confirmées.',
  'pedagogy.carrier_title': 'Porteur',
  'pedagogy.carrier_desc': 'Une mutation récessive qui peut être présente sans être visible.',
  'pedagogy.phenotype_not_genotype_warning': 'Un phénotype observé ne permet pas toujours de déterminer le génotype.',
  'pedagogy.zw_female_notice': 'Règle biologique ZW : chez la femelle (Z/W), les mutations récessives liées au sexe ne comportent aucun statut porteur.',
  'pedagogy.q_what_is_it': 'Qu\'est-ce que c\'est ?',
  'pedagogy.q_what_is_observed': 'Qu\'est-ce qui est observé ?',
  'pedagogy.q_what_is_certain': 'Qu\'est-ce qui est certain ?',
  'pedagogy.q_what_is_unknown': 'Qu\'est-ce qui est inconnu ?',
  'pedagogy.q_what_is_not_tested': 'Qu\'est-ce qui n\'a pas été testé ?',
  'pedagogy.q_where_does_it_come_from': 'D\'où vient l\'information ?',
  'pedagogy.q_what_is_confidence': 'Quel est son niveau de confiance ?',
  'pedagogy.q_is_review_needed': 'Une vérification humaine est-elle nécessaire ?',

  // Suggestions V1.9.4
  'suggestion.banner_title': 'Suggestions génétiques parentales',
  'suggestion.banner_desc': 'Valeurs héritées proposées issues de l\'ascendance connue.',
  'suggestion.badge': 'Suggestion',
  'suggestion.inherited_value': 'Valeur héritée proposée',
  'suggestion.accept': 'Accepter',
  'suggestion.modify': 'Modifier',
  'suggestion.reject': 'Refuser',
  'suggestion.keep_unknown': 'Conserver Inconnu',
  'suggestion.keep_not_tested': 'Conserver Non testé',
  'suggestion.not_genetically_confirmed_notice': 'Aucune suggestion ne devient automatiquement un génotype confirmé.',

  // Croisement officiel V1.9.4
  'cross.official_explanation_title': 'Présentation officielle du résultat de croisement',
  'cross.parents_used_facet': 'Parents utilisés',
  'cross.loci_analyzed_facet': 'Loci analysés',
  'cross.official_result_facet': 'Résultat officiel',
  'cross.official_probabilities_facet': 'Probabilités officielles',
  'cross.calculated_risks_facet': 'Risques déjà calculés',
  'cross.missing_info_facet': 'Informations manquantes',
  'cross.calculation_limits_facet': 'Limites du calcul',
  'cross.epistemic_statuses_facet': 'Statuts épistémiques',
  'cross.no_arbitrary_score_notice': 'Zéro score, zéro étoile, zéro recommandation d\'accouplement. Résultats issus exclusivement des moteurs scientifiques homologués.',

  'source.DNA_TEST': 'Analyse ADN',
  'source.PROGENY_TEST_CROSS': 'Preuve par descendance',
  'source.PARENTAL_PEDIGREE': 'Généalogie parentale',
  'source.PHENOTYPIC_OBSERVATION': 'Observation visuelle',
  'source.USER_DECLARATION': 'Déclaration éleveur',
  'source.SYSTEM_INFERENCE': 'Déduction du système',
  'source.LEGACY_MIGRATION': 'Donnée historique',

  'confidence.VERY_HIGH': 'Confiance très élevée',
  'confidence.HIGH': 'Confiance élevée',
  'confidence.MEDIUM': 'Confiance moyenne',
  'confidence.LOW': 'Confiance faible',
  'confidence.VERY_LOW': 'Confiance très faible',
  'confidence.UNKNOWN': 'Confiance inconnue',

  'review.REQUIRED': 'Validation humaine requise',
  'review.CONFLICT_REVIEW': 'Conflit à résoudre',
  'review.RECOMMENDED': 'Revue recommandée',
  'review.REVIEWED': 'Validé par l\'éleveur',

  'locus.provisional': 'Référentiel provisoire',
  'locus.provisional_warning': 'Locus sous étude scientifique — validation humaine recommandée',
  'transmission.Z_LINKED': 'Lié au sexe (Z)',
  'transmission.AUTOSOMAL': 'Autosomique',
  'transmission.CO_DOMINANT': 'Codominant',
  'carrier.CONFIRMED_CARRIER': 'Porteur confirmé',
  'carrier.POSSIBLE_CARRIER': 'Porteur possible',

  'card.title': 'Génétique',
  'card.subtitle': 'Synthèse des informations génétiques canoniques',
  'card.global_status': 'Statut global',
  'card.global_confidence': 'Confiance',
  'card.loci_section': 'Loci génétiques',
  'card.empty': 'Aucune information génétique renseignée',
  'card.conflict_alert_title': 'Conflits génétiques à vérifier',
  'card.combinations_count': '{count} combinaisons possibles',
  'card.summary_footer': '{total} loci renseignés · {toReview} à vérifier · {unknown} inconnus',
  'card.genotype_label': 'Génotype',
  'card.export_pdf': 'Exporter le passeport PDF',
  'card.exporting_pdf': 'Génération du PDF...',

  'drawer.title': 'Détail du locus génétique',
  'drawer.close': 'Fermer',
  'drawer.status_section': 'Statut et qualification épistémique',
  'drawer.determination_section': 'Détermination génétique',
  'drawer.confirmed_genotype': 'Génotype confirmé',
  'drawer.possible_hypotheses': 'Hypothèses possibles',
  'drawer.hypothesis_item': 'Hypothèse {index}',
  'drawer.why_hypothesis': 'Pourquoi cette hypothèse ?',
  'drawer.transmission_section': 'Mode de transmission',
  'drawer.carrier_section': 'Statut porteur',
  'drawer.not_applicable': 'Non applicable',
  'drawer.carrier_none': 'Non porteur',
  'drawer.provenance_section': 'Source et niveau de preuve',
  'drawer.unknown_description': 'Aucune donnée génétique connue enregistrée pour ce locus.',
  'drawer.not_tested_description': 'Ce locus n\'a fait l\'objet d\'aucun test. Non testé ne signifie pas absence de mutation.',
  'drawer.conflict_title': 'Conflit génétique détecté',
  'drawer.provisional_notice': 'Référentiel provisoire — Locus sous étude scientifique',

  'editor.title': 'Qualification épistémique du locus',
  'editor.add_info': 'Ajouter une information génétique',
  'editor.choose_locus': 'Choisir un locus',
  'editor.what_i_know': 'Nature de l\'information',
  'editor.mode_observed': 'Observation visuelle (plumage constaté)',
  'editor.mode_declared': 'Déclaration éleveur (mutation connue)',
  'editor.mode_dna': 'Test ADN (analyse moléculaire certifiée)',
  'editor.mode_possible_set': 'Hypothèses multiples (combinaisons possibles)',
  'editor.mode_unknown': 'Inconnu',
  'editor.mode_not_tested': 'Non testé',
  'editor.observation_label': 'Observation constatée',
  'editor.source_label': 'Source de la preuve',
  'editor.confidence_label': 'Niveau de confiance',
  'editor.confidence_hint': 'Indique la certitude dans l\'information, pas une preuve génétique formelle.',
  'editor.alleles_label': 'Allèles testés',
  'editor.hypotheses_selection': 'Sélectionnez les hypothèses compatibles',
  'editor.save': 'Enregistrer la qualification',
  'editor.cancel': 'Annuler',
  'editor.summary_title': 'Résumé avant enregistrement',
  'editor.no_catalogue': 'Aucun catalogue canonique disponible pour cette espèce.',
  'editor.not_tested_warning': 'Non testé ne signifie pas absence de mutation.',

  'cross.title': 'Simulation de croisement génétique Gould',
  'cross.open_simulator': 'Simuler un croisement',
  'cross.parent_a': 'Parent A',
  'cross.parent_b': 'Parent B',
  'cross.calculate': 'Calculer le croisement',
  'cross.calculating': 'Calcul en cours...',
  'cross.blocked': 'Croisement bloqué',
  'cross.result_title': 'Résultat du croisement',
  'cross.result_hypothetical': 'Résultat basé sur plusieurs hypothèses parentales',
  'cross.result_confirmed': 'Résultat basé sur des génotypes confirmés',
  'cross.result_review_required': 'Résultat à interpréter avec revue humaine',
  'cross.genotypes_section': 'Génotypes possibles',
  'cross.phenotypes_section': 'Phénotypes possibles',
  'cross.probability_label': 'Probabilité',
  'cross.parental_hypotheses': 'Hypothèses parentales',
  'cross.data_confirmed': 'Données confirmées',
  'cross.human_review_required': 'Revue humaine requise',
  'cross.insufficient_data': 'Données insuffisantes pour effectuer ce calcul',
  'cross.invalid_species': 'Aucun croisement Gould disponible pour cette espèce',
  'cross.sex_required': 'Le sexe du parent doit être connu pour effectuer ce croisement',
  'cross.genetic_conflict': 'Croisement bloqué : les données génétiques d\'un parent nécessitent une vérification humaine',
  'cross.provisional_framework': 'Référentiel provisoire',
  'cross.select_partner': 'Sélectionner un partenaire...',
  'cross.composite_label_notice': 'Label composite d\'exposition (non une mutation unitaire)',
  'cross.no_result': 'Aucun résultat de simulation disponible',
  'cross.parents_used': 'Parents utilisés',
  'cross.parent_hypotheses_count': '{count} hypothèse(s) génétique(s)',
  'cross.mode_confirmed': 'Mode : génotypes confirmés',
  'cross.mode_hypothetical': 'Mode : ensemble d\'hypothèses parentales',
  'cross.mode_hypothetical_desc': 'Plusieurs génotypes parentaux restent possibles. Les résultats représentent l\'ensemble des possibilités calculées par le moteur.',
  'cross.phenotype_possible': 'Phénotype possible',
  'cross.probability_coverage': 'Couverture des probabilités : {coverage}%',
  'cross.human_review_recommended': 'Revue humaine recommandée',
  'cross.composite_phenotype': 'Phénotype composite',
  'cross.result_needs_human_review': 'Ce résultat nécessite une vérification humaine.',
  'cross.detail_title': 'Détail du résultat génétique',
  'cross.alleles_label': 'Allèles',
  'cross.locus_label': 'Locus',
  'cross.transmission_label': 'Transmission',
  'cross.status_label': 'Statut',
  'cross.underlying_genotypes_count': '{count} génotype(s) sous-jacent(s)',

  // Bibliographic Traceability
  'biblio.section_title': 'Traçabilité scientifique',
  'biblio.button_consult': 'Consulter',
  'biblio.sources_count': '{count} source(s)',
  'biblio.conflicting_sources_count': '{count} source(s) contradictoire(s)',
  'biblio.drawer_title': 'Traçabilité scientifique & bibliographique',
  'biblio.drawer_subtitle': 'Justification documentaire et sources vérifiées',
  'biblio.rule_context': 'Contexte de la règle',
  'biblio.species_label': 'Espèce',
  'biblio.locus_label': 'Locus / Règle',
  'biblio.claim_label': 'Affirmation biologique',
  'biblio.epistemic_status': 'Statut épistémique',
  'biblio.human_review': 'Arbitrage humain',
  'biblio.human_review_required': 'Arbitrage humain requis',
  'biblio.human_review_not_required': 'Aucun arbitrage requis',
  'biblio.limitations_label': 'Limites scientifiques',
  'biblio.evidence_records_title': 'Dossiers de preuve (Evidence Records)',
  'biblio.no_sources_available': 'Aucune source bibliographique vérifiée disponible pour cette affirmation.',
  'biblio.evidence_id': 'Identifiant preuve',
  'biblio.citations_count': '{count} citation(s)',
  'biblio.citations_title': 'Citations & Concordance',
  'biblio.citation_id': 'Citation',
  'biblio.source_level': 'Niveau documentaire',
  'biblio.source_level_p0': 'P0 — Publication académique peer-reviewed / institutionnelle',
  'biblio.source_level_p1': 'P1 — Ouvrage spécialisé reconnu / standard officiel',
  'biblio.source_level_p2': 'P2 — Référence secondaire / élevage / observation empirique',
  'biblio.concordance_concordant': 'Concordante',
  'biblio.concordance_conflicting': 'Contradictoire (Conflit)',
  'biblio.concordance_insufficient': 'Insuffisante',
  'biblio.concordance_outdated': 'Historique (Dépassée)',
  'biblio.concordance_not_verified': 'Non vérifiée',
  'biblio.role_primary': 'Source principale',
  'biblio.role_corroborative': 'Corroborative',
  'biblio.role_historical': 'Historique',
  'biblio.role_challenged': 'Contestée',
  'biblio.source_title': 'Détails bibliographiques',
  'biblio.authors': 'Auteurs',
  'biblio.organization': 'Organisation',
  'biblio.year': 'Année',
  'biblio.publisher': 'Éditeur',
  'biblio.journal': 'Revue / Journal',
  'biblio.volume_issue_pages': 'Volume / N° / Pages',
  'biblio.location': 'Localisation dans l\'ouvrage',
  'biblio.doi': 'DOI',
  'biblio.isbn': 'ISBN',
  'biblio.url': 'Consulter en ligne',
  'biblio.verification_verified': 'Source vérifiée et consultée',
  'biblio.verification_not_verified': 'Non vérifiée unitairement',
  'biblio.verification_outdated': 'Référence historique dépassée',
  'biblio.source_consulted_at': 'Consultée le {date}',
  'biblio.notes': 'Notes d\'audit',
  'biblio.warning_no_auto_winner': '⚠️ Les sources contradictoires sont conservées sans arbitrage automatique.',
  'biblio.warning_p1_not_verified': 'ℹ️ Le niveau documentaire P1/P0 qualifie la source, mais ne constitue pas une certification biologique automatique de la règle.',
  'biblio.close': 'Fermer',
};

const en: Record<EpistemicTranslationKey, string> = {
  'status.GENETICALLY_CONFIRMED': 'Genetically confirmed',
  'status.OBSERVED': 'Visual observation',
  'status.DECLARED': 'Breeder declaration',
  'status.INFERRED': 'Theoretical deduction',
  'status.UNKNOWN': 'Unknown',
  'status.NOT_TESTED': 'Not tested',
  'status.CONFLICT_REVIEW': 'Conflict to review',
  'status.REVIEW_REQUIRED': 'Review required',
  'status.POSSIBLE_SET': 'Possible hypotheses',
  'status.PROVISIONAL': 'Provisional — confirmation required',
  'status.BLOCKED': 'Blocked — scientific rule currently unusable',
  'status.NEEDS_HUMAN_REVIEW': 'Human review required',
  'status.CONFLICTING': 'Conflicting information',
  'status.INSUFFICIENT_INFORMATION': 'Insufficient information',
  'status.CONFIRMED': 'Confirmed',

  // Pedagogy V1.9.4
  'pedagogy.phenotype_title': 'Phenotype',
  'pedagogy.phenotype_desc': 'What you observe in the bird.',
  'pedagogy.genotype_title': 'Genotype',
  'pedagogy.genotype_desc': 'Known or confirmed genetic information.',
  'pedagogy.carrier_title': 'Carrier',
  'pedagogy.carrier_desc': 'A recessive mutation that can be present without being visible.',
  'pedagogy.phenotype_not_genotype_warning': 'An observed phenotype does not always allow determining the genotype.',
  'pedagogy.zw_female_notice': 'Biological ZW rule: females (Z/W) cannot be carriers of sex-linked recessive mutations.',
  'pedagogy.q_what_is_it': 'What is it?',
  'pedagogy.q_what_is_observed': 'What is observed?',
  'pedagogy.q_what_is_certain': 'What is certain?',
  'pedagogy.q_what_is_unknown': 'What is unknown?',
  'pedagogy.q_what_is_not_tested': 'What has not been tested?',
  'pedagogy.q_where_does_it_come_from': 'Where does the information come from?',
  'pedagogy.q_what_is_confidence': 'What is its confidence level?',
  'pedagogy.q_is_review_needed': 'Is human review required?',

  // Suggestions V1.9.4
  'suggestion.banner_title': 'Parental genetic suggestions',
  'suggestion.banner_desc': 'Proposed inherited values based on known lineage.',
  'suggestion.badge': 'Suggestion',
  'suggestion.inherited_value': 'Proposed inherited value',
  'suggestion.accept': 'Accept',
  'suggestion.modify': 'Modify',
  'suggestion.reject': 'Reject',
  'suggestion.keep_unknown': 'Keep Unknown',
  'suggestion.keep_not_tested': 'Keep Not Tested',
  'suggestion.not_genetically_confirmed_notice': 'No suggestion automatically becomes a confirmed genotype.',

  // Official Cross V1.9.4
  'cross.official_explanation_title': 'Official Cross Result Presentation',
  'cross.parents_used_facet': 'Parents used',
  'cross.loci_analyzed_facet': 'Loci analyzed',
  'cross.official_result_facet': 'Official result',
  'cross.official_probabilities_facet': 'Official probabilities',
  'cross.calculated_risks_facet': 'Calculated risks',
  'cross.missing_info_facet': 'Missing information',
  'cross.calculation_limits_facet': 'Calculation limits',
  'cross.epistemic_statuses_facet': 'Epistemic statuses',
  'cross.no_arbitrary_score_notice': 'Zero scores, zero stars, zero mating recommendations. Results strictly from certified scientific engines.',

  'source.DNA_TEST': 'DNA test',
  'source.PROGENY_TEST_CROSS': 'Progeny test cross',
  'source.PARENTAL_PEDIGREE': 'Parental pedigree',
  'source.PHENOTYPIC_OBSERVATION': 'Visual observation',
  'source.USER_DECLARATION': 'Breeder declaration',
  'source.SYSTEM_INFERENCE': 'System inference',
  'source.LEGACY_MIGRATION': 'Legacy migration data',

  'confidence.VERY_HIGH': 'Very high confidence',
  'confidence.HIGH': 'High confidence',
  'confidence.MEDIUM': 'Medium confidence',
  'confidence.LOW': 'Low confidence',
  'confidence.VERY_LOW': 'Very low confidence',
  'confidence.UNKNOWN': 'Unknown confidence',

  'review.REQUIRED': 'Human review required',
  'review.CONFLICT_REVIEW': 'Conflict to resolve',
  'review.RECOMMENDED': 'Review recommended',
  'review.REVIEWED': 'Reviewed by breeder',

  'locus.provisional': 'Provisional reference',
  'locus.provisional_warning': 'Locus under scientific study — human review recommended',
  'transmission.Z_LINKED': 'Sex-linked (Z)',
  'transmission.AUTOSOMAL': 'Autosomal',
  'transmission.CO_DOMINANT': 'Codominant',
  'carrier.CONFIRMED_CARRIER': 'Confirmed carrier',
  'carrier.POSSIBLE_CARRIER': 'Possible carrier',

  'card.title': 'Genetics',
  'card.subtitle': 'Canonical genetic information summary',
  'card.global_status': 'Overall status',
  'card.global_confidence': 'Confidence',
  'card.loci_section': 'Genetic loci',
  'card.empty': 'No genetic information recorded',
  'card.conflict_alert_title': 'Genetic conflicts to review',
  'card.combinations_count': '{count} possible combinations',
  'card.summary_footer': '{total} loci recorded · {toReview} to review · {unknown} unknown',
  'card.genotype_label': 'Genotype',
  'card.export_pdf': 'Export PDF Passport',
  'card.exporting_pdf': 'Generating PDF...',

  'drawer.title': 'Genetic locus detail',
  'drawer.close': 'Close',
  'drawer.status_section': 'Status and epistemic qualification',
  'drawer.determination_section': 'Genetic determination',
  'drawer.confirmed_genotype': 'Confirmed genotype',
  'drawer.possible_hypotheses': 'Possible hypotheses',
  'drawer.hypothesis_item': 'Hypothesis {index}',
  'drawer.why_hypothesis': 'Why this hypothesis?',
  'drawer.transmission_section': 'Inheritance mode',
  'drawer.carrier_section': 'Carrier status',
  'drawer.not_applicable': 'Not applicable',
  'drawer.carrier_none': 'Non-carrier',
  'drawer.provenance_section': 'Source and evidence level',
  'drawer.unknown_description': 'No known genetic data recorded for this locus.',
  'drawer.not_tested_description': 'This locus has not been tested. Not tested does not mean absence of mutation.',
  'drawer.conflict_title': 'Genetic conflict detected',
  'drawer.provisional_notice': 'Provisional reference — Locus under scientific study',

  'editor.title': 'Epistemic locus qualification',
  'editor.add_info': 'Add genetic information',
  'editor.choose_locus': 'Select a locus',
  'editor.what_i_know': 'Nature of information',
  'editor.mode_observed': 'Visual observation (observed plumage)',
  'editor.mode_declared': 'Breeder declaration (known mutation)',
  'editor.mode_dna': 'DNA test (certified molecular analysis)',
  'editor.mode_possible_set': 'Multiple hypotheses (possible combinations)',
  'editor.mode_unknown': 'Unknown',
  'editor.mode_not_tested': 'Not tested',
  'editor.observation_label': 'Observed trait',
  'editor.source_label': 'Evidence source',
  'editor.confidence_label': 'Confidence level',
  'editor.confidence_hint': 'Indicates certainty in information, not a formal genetic proof.',
  'editor.alleles_label': 'Tested alleles',
  'editor.hypotheses_selection': 'Select compatible hypotheses',
  'editor.save': 'Save qualification',
  'editor.cancel': 'Cancel',
  'editor.summary_title': 'Summary before saving',
  'editor.no_catalogue': 'No canonical catalogue available for this species.',
  'editor.not_tested_warning': 'Not tested does not mean absence of mutation.',

  'cross.title': 'Gouldian Genetic Cross Simulation',
  'cross.open_simulator': 'Simulate cross',
  'cross.parent_a': 'Parent A',
  'cross.parent_b': 'Parent B',
  'cross.calculate': 'Calculate cross',
  'cross.calculating': 'Calculating...',
  'cross.blocked': 'Cross blocked',
  'cross.result_title': 'Cross result',
  'cross.result_hypothetical': 'Result based on multiple parental hypotheses',
  'cross.result_confirmed': 'Result based on confirmed genotypes',
  'cross.result_review_required': 'Result to interpret with human review',
  'cross.genotypes_section': 'Possible genotypes',
  'cross.phenotypes_section': 'Possible phenotypes',
  'cross.probability_label': 'Probability',
  'cross.parental_hypotheses': 'Parental hypotheses',
  'cross.data_confirmed': 'Confirmed data',
  'cross.human_review_required': 'Human review required',
  'cross.insufficient_data': 'Insufficient genetic data to perform calculation',
  'cross.invalid_species': 'No Gouldian cross available for this species',
  'cross.sex_required': 'Parent sex must be known to perform this cross',
  'cross.genetic_conflict': 'Cross blocked: genetic data for a parent requires human review',
  'cross.provisional_framework': 'Provisional reference framework',
  'cross.select_partner': 'Select a partner...',
  'cross.composite_label_notice': 'Composite exhibition label (not an autonomous mutation)',
  'cross.no_result': 'No simulation result available',
  'cross.parents_used': 'Parents used',
  'cross.parent_hypotheses_count': '{count} genetic hypothesis(es)',
  'cross.mode_confirmed': 'Mode: confirmed genotypes',
  'cross.mode_hypothetical': 'Mode: parental hypothesis set',
  'cross.mode_hypothetical_desc': 'Several parental genotypes remain possible. The results represent all possibilities calculated by the engine.',
  'cross.phenotype_possible': 'Possible phenotype',
  'cross.probability_coverage': 'Probability coverage: {coverage}%',
  'cross.human_review_recommended': 'Human review recommended',
  'cross.composite_phenotype': 'Composite phenotype',
  'cross.result_needs_human_review': 'This result requires human verification.',
  'cross.detail_title': 'Genetic result detail',
  'cross.alleles_label': 'Alleles',
  'cross.locus_label': 'Locus',
  'cross.transmission_label': 'Inheritance',
  'cross.status_label': 'Status',
  'cross.underlying_genotypes_count': '{count} underlying genotype(s)',

  // Bibliographic Traceability
  'biblio.section_title': 'Scientific Traceability',
  'biblio.button_consult': 'Consult',
  'biblio.sources_count': '{count} source(s)',
  'biblio.conflicting_sources_count': '{count} conflicting source(s)',
  'biblio.drawer_title': 'Scientific & Bibliographic Traceability',
  'biblio.drawer_subtitle': 'Documentary justification and verified sources',
  'biblio.rule_context': 'Rule Context',
  'biblio.species_label': 'Species',
  'biblio.locus_label': 'Locus / Rule',
  'biblio.claim_label': 'Biological Claim',
  'biblio.epistemic_status': 'Epistemic Status',
  'biblio.human_review': 'Human Review',
  'biblio.human_review_required': 'Human review required',
  'biblio.human_review_not_required': 'No review required',
  'biblio.limitations_label': 'Scientific Limitations',
  'biblio.evidence_records_title': 'Evidence Records',
  'biblio.no_sources_available': 'No verified bibliographic sources available for this claim.',
  'biblio.evidence_id': 'Evidence ID',
  'biblio.citations_count': '{count} citation(s)',
  'biblio.citations_title': 'Citations & Concordance',
  'biblio.citation_id': 'Citation',
  'biblio.source_level': 'Documentary Level',
  'biblio.source_level_p0': 'P0 — Peer-reviewed academic / institutional publication',
  'biblio.source_level_p1': 'P1 — Recognized specialized treatise / official standard',
  'biblio.source_level_p2': 'P2 — Secondary / breeder reference / empirical observation',
  'biblio.concordance_concordant': 'Concordant',
  'biblio.concordance_conflicting': 'Conflicting (Conflict)',
  'biblio.concordance_insufficient': 'Insufficient',
  'biblio.concordance_outdated': 'Historical (Outdated)',
  'biblio.concordance_not_verified': 'Not verified',
  'biblio.role_primary': 'Primary source',
  'biblio.role_corroborative': 'Corroborative',
  'biblio.role_historical': 'Historical',
  'biblio.role_challenged': 'Challenged',
  'biblio.source_title': 'Bibliographic Details',
  'biblio.authors': 'Authors',
  'biblio.organization': 'Organization',
  'biblio.year': 'Year',
  'biblio.publisher': 'Publisher',
  'biblio.journal': 'Journal',
  'biblio.volume_issue_pages': 'Volume / Issue / Pages',
  'biblio.location': 'Precise Location in Work',
  'biblio.doi': 'DOI',
  'biblio.isbn': 'ISBN',
  'biblio.url': 'View Online',
  'biblio.verification_verified': 'Source verified and consulted',
  'biblio.verification_not_verified': 'Not verified individually',
  'biblio.verification_outdated': 'Outdated historical reference',
  'biblio.source_consulted_at': 'Consulted on {date}',
  'biblio.notes': 'Audit Notes',
  'biblio.warning_no_auto_winner': '⚠️ Conflicting sources are preserved without automated arbitration.',
  'biblio.warning_p1_not_verified': 'ℹ️ Documentary level P1/P0 qualifies the source, but does not constitute automated biological certification of the rule.',
  'biblio.close': 'Close',
};

const ar: Record<EpistemicTranslationKey, string> = {
  'status.GENETICALLY_CONFIRMED': 'مؤكد جينياً',
  'status.OBSERVED': 'ملاحظة بصرية',
  'status.DECLARED': 'إقرار المربي',
  'status.INFERRED': 'استنتاج نظري',
  'status.UNKNOWN': 'غير معروف',
  'status.NOT_TESTED': 'لم يُختبر',
  'status.CONFLICT_REVIEW': 'تعارض بحاجة للتحقق',
  'status.REVIEW_REQUIRED': 'مراجعة مطلوبة',
  'status.POSSIBLE_SET': 'فرضيات محتملة',
  'status.PROVISIONAL': 'مؤقت — تأكيد مطلوب',
  'status.BLOCKED': 'محجوب — قاعدة علمية غير قابلة للاستخدام حالياً',
  'status.NEEDS_HUMAN_REVIEW': 'مراجعة بشرية مطلوبة',
  'status.CONFLICTING': 'معلومات متضاربة',
  'status.INSUFFICIENT_INFORMATION': 'معلومات غير كافية',
  'status.CONFIRMED': 'مؤكد',

  // Pedagogy V1.9.4
  'pedagogy.phenotype_title': 'النمط الظاهري',
  'pedagogy.phenotype_desc': 'ما تلاحظه في الطائر.',
  'pedagogy.genotype_title': 'النمط الوراثي',
  'pedagogy.genotype_desc': 'المعلومات الجينية المعروفة أو المؤكدة.',
  'pedagogy.carrier_title': 'حامل للطفرة',
  'pedagogy.carrier_desc': 'طفرة متنحية يمكن أن توجد دون أن تظهر.',
  'pedagogy.phenotype_not_genotype_warning': 'النمط الظاهري الملاحظ لا يحدد دائماً النمط الوراثي.',
  'pedagogy.zw_female_notice': 'قاعدة ZW البيولوجية: الأنثى (Z/W) لا يمكن أن تكون حاملة لطفرة مرتبطة بالجنس.',
  'pedagogy.q_what_is_it': 'ما هذا ؟',
  'pedagogy.q_what_is_observed': 'ما الذي تمت ملاحظته ؟',
  'pedagogy.q_what_is_certain': 'ما المؤكد ؟',
  'pedagogy.q_what_is_unknown': 'ما المجهول ؟',
  'pedagogy.q_what_is_not_tested': 'ما الذي لم يتم فحصه ؟',
  'pedagogy.q_where_does_it_come_from': 'من أين أتت المعلومة ؟',
  'pedagogy.q_what_is_confidence': 'ما مستوى الثقة بها ؟',
  'pedagogy.q_is_review_needed': 'هل التحقق البشري مطلوب ؟',

  // Suggestions V1.9.4
  'suggestion.banner_title': 'اقتراحات وراثية من الوالدين',
  'suggestion.banner_desc': 'قيم وراثية مقترحة مستمدة من النسب المعروف.',
  'suggestion.badge': 'اقتراح',
  'suggestion.inherited_value': 'قيمة موروثة مقترحة',
  'suggestion.accept': 'قبول',
  'suggestion.modify': 'تعديل',
  'suggestion.reject': 'رفض',
  'suggestion.keep_unknown': 'إبقاء مجهول',
  'suggestion.keep_not_tested': 'إبقاء غير مفحوص',
  'suggestion.not_genetically_confirmed_notice': 'لا يتحول أي اقتراح تلقائياً إلى نمط وراثي مؤكد.',

  // Official Cross V1.9.4
  'cross.official_explanation_title': 'عرض رسمي لنتيجة التزاوج',
  'cross.parents_used_facet': 'الآباء المستخدمون',
  'cross.loci_analyzed_facet': 'المواقع الجينية المحللة',
  'cross.official_result_facet': 'النتيجة الرسمية',
  'cross.official_probabilities_facet': 'الاحتمالات الرسمية',
  'cross.calculated_risks_facet': 'المخاطر المحسوبة مسبقاً',
  'cross.missing_info_facet': 'معلومات مفقودة',
  'cross.calculation_limits_facet': 'حدود الحساب',
  'cross.epistemic_statuses_facet': 'الحالات المعرفية',
  'cross.no_arbitrary_score_notice': 'لا نقاط ولا نجوم ولا توصية تزاوج. نتائج مستمدة حصراً من المحركات العلمية المعتمدة.',

  'source.DNA_TEST': 'فحص الحمض النووي (DNA)',
  'source.PROGENY_TEST_CROSS': 'إثبات عبر النسل',
  'source.PARENTAL_PEDIGREE': 'نسب الوالدين',
  'source.PHENOTYPIC_OBSERVATION': 'ملاحظة مظهرية',
  'source.USER_DECLARATION': 'تصريح المربي',
  'source.SYSTEM_INFERENCE': 'استنتاج النظام',
  'source.LEGACY_MIGRATION': 'بيانات تاريخية مرحلة',

  'confidence.VERY_HIGH': 'ثقة عالية جداً',
  'confidence.HIGH': 'ثقة عالية',
  'confidence.MEDIUM': 'ثقة متوسطة',
  'confidence.LOW': 'ثقة منخفضة',
  'confidence.VERY_LOW': 'ثقة منخفضة جداً',
  'confidence.UNKNOWN': 'ثقة غير محددة',

  'review.REQUIRED': 'مراجعة بشرية مطلوبة',
  'review.CONFLICT_REVIEW': 'تعارض يجب حله',
  'review.RECOMMENDED': 'مراجعة مستحسنة',
  'review.REVIEWED': 'تمت مراجعته',

  'locus.provisional': 'مرجع مؤقت',
  'locus.provisional_warning': 'موقع جيني قيد الدراسة العلمية — يُنصح بالتحقق البشري',
  'transmission.Z_LINKED': 'مرتبط بالجنس (Z)',
  'transmission.AUTOSOMAL': 'جسمي',
  'transmission.CO_DOMINANT': 'سيادة مشتركة',
  'carrier.CONFIRMED_CARRIER': 'حامل مؤكد',
  'carrier.POSSIBLE_CARRIER': 'حامل محتمل',

  'card.title': 'علم الوراثة',
  'card.subtitle': 'ملخص المعلومات الجينية المعيارية',
  'card.global_status': 'الحالة العامة',
  'card.global_confidence': 'مستوى الثقة',
  'card.loci_section': 'المواقع الجينية',
  'card.empty': 'لا توجد معلومات جينية مسجلة',
  'card.conflict_alert_title': 'تعارضات جينية بحاجة للتحقق',
  'card.combinations_count': '{count} تركيبات محتملة',
  'card.summary_footer': '{total} موقع مسجل · {toReview} للمراجعة · {unknown} غير معروف',
  'card.genotype_label': 'النمط الجيني',
  'card.export_pdf': 'تصدير جواز السفر PDF',
  'card.exporting_pdf': 'جارٍ إنشاء PDF...',

  'drawer.title': 'تفاصيل الموقع الجيني',
  'drawer.close': 'إغلاق',
  'drawer.status_section': 'الحالة والتوثيق المعرفي',
  'drawer.determination_section': 'التحديد الجيني',
  'drawer.confirmed_genotype': 'النمط الجيني المؤكد',
  'drawer.possible_hypotheses': 'الفرضيات المحتملة',
  'drawer.hypothesis_item': 'الفرضية {index}',
  'drawer.why_hypothesis': 'لماذا هذه الفرضية؟',
  'drawer.transmission_section': 'نمط التوارث',
  'drawer.carrier_section': 'حالة الحامل الجيني',
  'drawer.not_applicable': 'غير منطبق',
  'drawer.carrier_none': 'غير حامل',
  'drawer.provenance_section': 'المصدر ومستوى الإثبات',
  'drawer.unknown_description': 'لا توجد بيانات جينية معروفة مسجلة لهذا الموقع.',
  'drawer.not_tested_description': 'لم يخضع هذا الموقع لأي فحص. عدم الاختبار لا يعني غياب الطفرة.',
  'drawer.conflict_title': 'تم رصد تعارض جيني',
  'drawer.provisional_notice': 'مرجع مؤقت — موقع جيني قيد الدراسة العلمية',

  'editor.title': 'التوثيق المعرفي للموقع الجيني',
  'editor.add_info': 'إضافة معلومات جينية',
  'editor.choose_locus': 'اختيار موقع جيني',
  'editor.what_i_know': 'طبيعة المعلومة',
  'editor.mode_observed': 'ملاحظة بصرية (الريش المرصود)',
  'editor.mode_declared': 'إقرار المربي (طفرة معروفة)',
  'editor.mode_dna': 'فحص DNA (تحليل جزيئي معتمد)',
  'editor.mode_possible_set': 'فرضيات متعددة (تركيبات محتملة)',
  'editor.mode_unknown': 'غير معروف',
  'editor.mode_not_tested': 'لم يُختبر',
  'editor.observation_label': 'الملاحظة المرصودة',
  'editor.source_label': 'مصدر الإثبات',
  'editor.confidence_label': 'مستوى الثقة',
  'editor.confidence_hint': 'يدل على اليقين بالمعلومة وليس إثباتاً جينياً قاطعاً.',
  'editor.alleles_label': 'الأليلات المختبرة',
  'editor.hypotheses_selection': 'حدد الفرضيات المتوافقة',
  'editor.save': 'حفظ التوثيق',
  'editor.cancel': 'إلغاء',
  'editor.summary_title': 'الملخص قبل الحفظ',
  'editor.no_catalogue': 'لا يوجد دليل جيني معياري متاح لهذا النوع.',
  'editor.not_tested_warning': 'عدم الاختبار لا يعني غياب الطفرة.',

  'cross.title': 'محاكاة التزاوج الجيني لطيور القولديان',
  'cross.open_simulator': 'محاكاة التزاوج',
  'cross.parent_a': 'الطرف أ',
  'cross.parent_b': 'الطرف ب',
  'cross.calculate': 'حساب التزاوج',
  'cross.calculating': 'جاري الحساب...',
  'cross.blocked': 'التزاوج محظور',
  'cross.result_title': 'نتيجة التزاوج',
  'cross.result_hypothetical': 'نتيجة مبنية على فرضيات أبوية متعددة',
  'cross.result_confirmed': 'نتيجة مبنية على أنماط جينية مؤكدة',
  'cross.result_review_required': 'نتيجة تتطلب مراجعة بشرية',
  'cross.genotypes_section': 'الأنماط الجينية المحتملة',
  'cross.phenotypes_section': 'الأنماط الظاهرية المحتملة',
  'cross.probability_label': 'الاحتمال',
  'cross.parental_hypotheses': 'الفرضيات الأبوية',
  'cross.data_confirmed': 'بيانات مؤكدة',
  'cross.human_review_required': 'مراجعة بشرية مطلوبة',
  'cross.insufficient_data': 'معلومات جينية غير كافية لإجراء هذا الحساب',
  'cross.invalid_species': 'لا يوجد تزاوج قولديان متاح لهذا النوع',
  'cross.sex_required': 'يجب أن يكون جنس كلا الطرفين معروفاً لإجراء التزاوج',
  'cross.genetic_conflict': 'تزاوج محظور: البيانات الجينية لأحد الأبوين تتطلب تدقيقاً بشرياً',
  'cross.provisional_framework': 'مرجع مؤقت',
  'cross.select_partner': 'اختيار شريك...',
  'cross.composite_label_notice': 'تسمية استعراضية مركبة (ليست طفرة منفردة)',
  'cross.no_result': 'لا توجد نتيجة محاكاة متاحة',
  'cross.parents_used': 'الآباء المستخدمون',
  'cross.parent_hypotheses_count': '{count} فرضية وراثية',
  'cross.mode_confirmed': 'النمط: أنماط جينية مؤكدة',
  'cross.mode_hypothetical': 'النمط: مجموعة فرضيات الوالدين',
  'cross.mode_hypothetical_desc': 'لا تزال هناك عدة أنماط جينية أبوية محتملة. تمثل النتائج جميع الاحتمالات التي حسبها المحرك.',
  'cross.phenotype_possible': 'النمط الظاهري المحتمل',
  'cross.probability_coverage': 'تغطية الاحتمالات: {coverage}%',
  'cross.human_review_recommended': 'يوصى بالمراجعة البشرية',
  'cross.composite_phenotype': 'النمط الظاهري المركب',
  'cross.result_needs_human_review': 'تتطلب هذه النتيجة تحققًا بشريًا.',
  'cross.detail_title': 'تفاصيل النتيجة الوراثية',
  'cross.alleles_label': 'الأليلات',
  'cross.locus_label': 'الموضع الجيني',
  'cross.transmission_label': 'طريقة الانتقال',
  'cross.status_label': 'الحالة',
  'cross.underlying_genotypes_count': '{count} نمط جيني ضمني',

  // Bibliographic Traceability
  'biblio.section_title': 'التتبع العلمي والمصادر',
  'biblio.button_consult': 'اطلاع',
  'biblio.sources_count': '{count} مصدر/مصادر',
  'biblio.conflicting_sources_count': '{count} مصدر متضارب',
  'biblio.drawer_title': 'التتبع العلمي والببليوجرافي',
  'biblio.drawer_subtitle': 'التبرير الوثائقي والمصادر المعتمدة',
  'biblio.rule_context': 'سياق القاعدة',
  'biblio.species_label': 'النوع',
  'biblio.locus_label': 'الموقع / القاعدة',
  'biblio.claim_label': 'الادعاء البيولوجي',
  'biblio.epistemic_status': 'الحالة المعرفية',
  'biblio.human_review': 'المراجعة البشرية',
  'biblio.human_review_required': 'مراجعة بشرية مطلوبة',
  'biblio.human_review_not_required': 'لا يتطلب مراجعة',
  'biblio.limitations_label': 'الحدود العلمية',
  'biblio.evidence_records_title': 'سجلات الأدلة (Evidence Records)',
  'biblio.no_sources_available': 'لا توجد مصادر ببليوغرافية معتمدة متاحة لهذا الادعاء.',
  'biblio.evidence_id': 'معرّف الدليل',
  'biblio.citations_count': '{count} اقتباس/اقتباسات',
  'biblio.citations_title': 'الاقتباسات والتوافق',
  'biblio.citation_id': 'اقتباس',
  'biblio.source_level': 'المستوى الوثائقي',
  'biblio.source_level_p0': 'P0 — منشور أكاديمي محكّم / مؤسسي',
  'biblio.source_level_p1': 'P1 — كتاب متخصص معتمد / معيار رسمي',
  'biblio.source_level_p2': 'P2 — مرجع ثانوي / مربين / تجريبي',
  'biblio.concordance_concordant': 'متوافق',
  'biblio.concordance_conflicting': 'متضارب (خلاف)',
  'biblio.concordance_insufficient': 'غير كافٍ',
  'biblio.concordance_outdated': 'تاريخي (منتهي)',
  'biblio.concordance_not_verified': 'غير مدقق',
  'biblio.role_primary': 'مصدر رئيسي',
  'biblio.role_corroborative': 'معزز',
  'biblio.role_historical': 'تاريخي',
  'biblio.role_challenged': 'مطعون فيه',
  'biblio.source_title': 'التفاصيل الببليوغرافية',
  'biblio.authors': 'المؤلفون',
  'biblio.organization': 'المنظمة',
  'biblio.year': 'السنة',
  'biblio.publisher': 'الناشر',
  'biblio.journal': 'المجلة / الدورية',
  'biblio.volume_issue_pages': 'المجلد / العدد / الصفحات',
  'biblio.location': 'الموضع الدقيق في المرجع',
  'biblio.doi': 'DOI',
  'biblio.isbn': 'ISBN',
  'biblio.url': 'عرض على الإنترنت',
  'biblio.verification_verified': 'مصدر مدقق ومطلع عليه',
  'biblio.verification_not_verified': 'غير مدقق فردياً',
  'biblio.verification_outdated': 'مرجع تاريخي متجاوز',
  'biblio.source_consulted_at': 'تم الاطلاع في {date}',
  'biblio.notes': 'ملاحظات التدقيق',
  'biblio.warning_no_auto_winner': '⚠️ يتم الاحتفاظ بالمصادر المتضاربة دون ترجيح تلقائي.',
  'biblio.warning_p1_not_verified': 'ℹ️ المستوى الوثائقي P1/P0 يصنف المصدر، لكنه لا يعد اعتماداً بيولوجياً تلقائياً للقاعدة.',
  'biblio.close': 'إغلاق',
};

const es: Record<EpistemicTranslationKey, string> = {
  'status.GENETICALLY_CONFIRMED': 'Genéticamente confirmado',
  'status.OBSERVED': 'Observación visual',
  'status.DECLARED': 'Declaración del criador',
  'status.INFERRED': 'Deducción teórica',
  'status.UNKNOWN': 'Desconocido',
  'status.NOT_TESTED': 'No probado',
  'status.CONFLICT_REVIEW': 'Conflicto a revisar',
  'status.REVIEW_REQUIRED': 'Revisión requerida',
  'status.POSSIBLE_SET': 'Hipótesis posibles',
  'status.PROVISIONAL': 'Provisional — confirmación requerida',
  'status.BLOCKED': 'Bloqueado — regla científica actualmente no utilizable',
  'status.NEEDS_HUMAN_REVIEW': 'Verificación humana requerida',
  'status.CONFLICTING': 'Información contradictoria',
  'status.INSUFFICIENT_INFORMATION': 'Información insuficiente',
  'status.CONFIRMED': 'Confirmado',

  // Pedagogy V1.9.4
  'pedagogy.phenotype_title': 'Fenotipo',
  'pedagogy.phenotype_desc': 'Lo que observa en el ave.',
  'pedagogy.genotype_title': 'Genotipo',
  'pedagogy.genotype_desc': 'La información genética conocida o confirmada.',
  'pedagogy.carrier_title': 'Portador',
  'pedagogy.carrier_desc': 'Una mutación recesiva que puede estar presente sin ser visible.',
  'pedagogy.phenotype_not_genotype_warning': 'Un fenotipo observado no siempre permite determinar el genotipo.',
  'pedagogy.zw_female_notice': 'Regla biológica ZW: en las hembras (Z/W), las mutaciones recesivas ligadas al sexo no tienen estado portador.',
  'pedagogy.q_what_is_it': '¿Qué es esto?',
  'pedagogy.q_what_is_observed': '¿Qué se observa?',
  'pedagogy.q_what_is_certain': '¿Qué es seguro?',
  'pedagogy.q_what_is_unknown': '¿Qué es desconocido?',
  'pedagogy.q_what_is_not_tested': '¿Qué no ha sido probado?',
  'pedagogy.q_where_does_it_come_from': '¿De dónde proviene la información?',
  'pedagogy.q_what_is_confidence': '¿Cuál es su nivel de confianza?',
  'pedagogy.q_is_review_needed': '¿Se requiere verificación humana?',

  // Suggestions V1.9.4
  'suggestion.banner_title': 'Sugerencias genéticas parentales',
  'suggestion.banner_desc': 'Valores heredados propuestos a partir de la ascendencia conocida.',
  'suggestion.badge': 'Sugerencia',
  'suggestion.inherited_value': 'Valor heredado propuesto',
  'suggestion.accept': 'Aceptar',
  'suggestion.modify': 'Modificar',
  'suggestion.reject': 'Rechazar',
  'suggestion.keep_unknown': 'Conservar Desconocido',
  'suggestion.keep_not_tested': 'Conservar No probado',
  'suggestion.not_genetically_confirmed_notice': 'Ninguna sugerencia se convierte automáticamente en genotipo confirmado.',

  // Official Cross V1.9.4
  'cross.official_explanation_title': 'Presentación oficial del resultado del cruce',
  'cross.parents_used_facet': 'Padres utilizados',
  'cross.loci_analyzed_facet': 'Loci analizados',
  'cross.official_result_facet': 'Resultado oficial',
  'cross.official_probabilities_facet': 'Probabilidades oficiales',
  'cross.calculated_risks_facet': 'Riesgos calculados',
  'cross.missing_info_facet': 'Información faltante',
  'cross.calculation_limits_facet': 'Límites del cálculo',
  'cross.epistemic_statuses_facet': 'Estados epistémicos',
  'cross.no_arbitrary_score_notice': 'Cero puntuación, cero estrellas, cero recomendación de emparejamiento. Resultados exclusivamente de motores científicos homologados.',

  'source.DNA_TEST': 'Prueba de ADN',
  'source.PROGENY_TEST_CROSS': 'Prueba por descendencia',
  'source.PARENTAL_PEDIGREE': 'Pedigrí parental',
  'source.PHENOTYPIC_OBSERVATION': 'Observación fenotípica',
  'source.USER_DECLARATION': 'Declaración del criador',
  'source.SYSTEM_INFERENCE': 'Deducción del sistema',
  'source.LEGACY_MIGRATION': 'Dato histórico migrado',

  'confidence.VERY_HIGH': 'Confianza muy alta',
  'confidence.HIGH': 'Confianza alta',
  'confidence.MEDIUM': 'Confianza media',
  'confidence.LOW': 'Confianza baja',
  'confidence.VERY_LOW': 'Confianza muy baja',
  'confidence.UNKNOWN': 'Confianza desconocida',

  'review.REQUIRED': 'Validación humana requerida',
  'review.CONFLICT_REVIEW': 'Conflicto por resolver',
  'review.RECOMMENDED': 'Revisión recomendada',
  'review.REVIEWED': 'Revisado por criador',

  'locus.provisional': 'Referencial provisional',
  'locus.provisional_warning': 'Locus en estudio científico — validación humana recomendada',
  'transmission.Z_LINKED': 'Ligado al sexo (Z)',
  'transmission.AUTOSOMAL': 'Autosómico',
  'transmission.CO_DOMINANT': 'Codominante',
  'carrier.CONFIRMED_CARRIER': 'Portador confirmado',
  'carrier.POSSIBLE_CARRIER': 'Portador posible',

  'card.title': 'Genética',
  'card.subtitle': 'Resumen de información genética canónica',
  'card.global_status': 'Estado general',
  'card.global_confidence': 'Confianza',
  'card.loci_section': 'Loci genéticos',
  'card.empty': 'Ninguna información genética registrada',
  'card.conflict_alert_title': 'Conflictos genéticos a revisar',
  'card.combinations_count': '{count} combinaciones posibles',
  'card.summary_footer': '{total} loci registrados · {toReview} por revisar · {unknown} desconocidos',
  'card.genotype_label': 'Genotipo',
  'card.export_pdf': 'Exportar pasaporte PDF',
  'card.exporting_pdf': 'Generando PDF...',

  'drawer.title': 'Detalle del locus genético',
  'drawer.close': 'Cerrar',
  'drawer.status_section': 'Estado y calificación epistémica',
  'drawer.determination_section': 'Determinación genética',
  'drawer.confirmed_genotype': 'Genotipo confirmado',
  'drawer.possible_hypotheses': 'Hipótesis posibles',
  'drawer.hypothesis_item': 'Hipótesis {index}',
  'drawer.why_hypothesis': '¿Por qué esta hipótesis?',
  'drawer.transmission_section': 'Modo de transmisión',
  'drawer.carrier_section': 'Estado portador',
  'drawer.not_applicable': 'No aplicable',
  'drawer.carrier_none': 'No portador',
  'drawer.provenance_section': 'Fuente y nivel de evidencia',
  'drawer.unknown_description': 'Ningún dato genético conocido registrado para este locus.',
  'drawer.not_tested_description': 'Este locus no ha sido probado. No probado no significa ausencia de mutación.',
  'drawer.conflict_title': 'Conflicto genético detectado',
  'drawer.provisional_notice': 'Referencial provisional — Locus en estudio científico',

  'editor.title': 'Calificación epistémica del locus',
  'editor.add_info': 'Añadir información genética',
  'editor.choose_locus': 'Seleccionar un locus',
  'editor.what_i_know': 'Naturaleza de la información',
  'editor.mode_observed': 'Observación visual (plumaje observado)',
  'editor.mode_declared': 'Declaración del criador (mutación conocida)',
  'editor.mode_dna': 'Prueba de ADN (análisis molecular certificado)',
  'editor.mode_possible_set': 'Múltiples hipótesis (combinaciones posibles)',
  'editor.mode_unknown': 'Desconocido',
  'editor.mode_not_tested': 'No probado',
  'editor.observation_label': 'Observación constatada',
  'editor.source_label': 'Fuente de la prueba',
  'editor.confidence_label': 'Nivel de confianza',
  'editor.confidence_hint': 'Indica la certeza en la información, no una prueba genética formal.',
  'editor.alleles_label': 'Alelos probados',
  'editor.hypotheses_selection': 'Seleccione las hipótesis compatibles',
  'editor.save': 'Guardar calificación',
  'editor.cancel': 'Cancelar',
  'editor.summary_title': 'Resumen antes de guardar',
  'editor.no_catalogue': 'Ningún catálogo canónico disponible para esta especie.',
  'editor.not_tested_warning': 'No probado no significa ausencia de mutación.',

  'cross.title': 'Simulación de cruce genético Gould',
  'cross.open_simulator': 'Simular cruce',
  'cross.parent_a': 'Progenitor A',
  'cross.parent_b': 'Progenitor B',
  'cross.calculate': 'Calcular cruce',
  'cross.calculating': 'Calculando...',
  'cross.blocked': 'Cruce bloqueado',
  'cross.result_title': 'Resultado del cruce',
  'cross.result_hypothetical': 'Resultado basado en múltiples hipótesis parentales',
  'cross.result_confirmed': 'Resultado basado en genotipos confirmados',
  'cross.result_review_required': 'Resultado a interpretar con revisión humana',
  'cross.genotypes_section': 'Genotipos posibles',
  'cross.phenotypes_section': 'Fenotipos posibles',
  'cross.probability_label': 'Probabilidad',
  'cross.parental_hypotheses': 'Hipótesis parentales',
  'cross.data_confirmed': 'Datos confirmados',
  'cross.human_review_required': 'Revisión humana requerida',
  'cross.insufficient_data': 'Información genética insuficiente para realizar este cálculo',
  'cross.invalid_species': 'Ningún cruce Gould disponible para esta especie',
  'cross.sex_required': 'El sexo del progenitor debe conocerse para realizar este cruce',
  'cross.genetic_conflict': 'Cruce bloqueado: los datos genéticos de un progenitor requieren verificación humana',
  'cross.provisional_framework': 'Marco provisional',
  'cross.select_partner': 'Seleccionar pareja...',
  'cross.composite_label_notice': 'Etiqueta compuesta de exhibición (no es una mutación única)',
  'cross.no_result': 'Ningún resultado de simulación disponible',
  'cross.parents_used': 'Padres utilizados',
  'cross.parent_hypotheses_count': '{count} hipótesis genética(s)',
  'cross.mode_confirmed': 'Modo: genotipos confirmados',
  'cross.mode_hypothetical': 'Modo: conjunto de hipótesis parentales',
  'cross.mode_hypothetical_desc': 'Varios genotipos parentales siguen siendo posibles. Los resultados representan el conjunto de posibilidades calculadas por el motor.',
  'cross.phenotype_possible': 'Fenotipo posible',
  'cross.probability_coverage': 'Cobertura de probabilidades: {coverage}%',
  'cross.human_review_recommended': 'Revisión humana recomendada',
  'cross.composite_phenotype': 'Fenotipo compuesto',
  'cross.result_needs_human_review': 'Este resultado requiere verificación humana.',
  'cross.detail_title': 'Detalle del resultado genético',
  'cross.alleles_label': 'Alelos',
  'cross.locus_label': 'Locus',
  'cross.transmission_label': 'Transmisión',
  'cross.status_label': 'Estado',
  'cross.underlying_genotypes_count': '{count} genotipo(s) subyacente(s)',

  // Bibliographic Traceability
  'biblio.section_title': 'Trazabilidad científica',
  'biblio.button_consult': 'Consultar',
  'biblio.sources_count': '{count} fuente(s)',
  'biblio.conflicting_sources_count': '{count} fuente(s) contradictoria(s)',
  'biblio.drawer_title': 'Trazabilidad científica y bibliográfica',
  'biblio.drawer_subtitle': 'Justificación documental y fuentes verificadas',
  'biblio.rule_context': 'Contexto de la regla',
  'biblio.species_label': 'Especie',
  'biblio.locus_label': 'Locus / Regla',
  'biblio.claim_label': 'Afirmación biológica',
  'biblio.epistemic_status': 'Estado epistémico',
  'biblio.human_review': 'Arbitraje humano',
  'biblio.human_review_required': 'Arbitraje humano requerido',
  'biblio.human_review_not_required': 'Sin arbitraje requerido',
  'biblio.limitations_label': 'Límites científicos',
  'biblio.evidence_records_title': 'Registros de evidencia (Evidence Records)',
  'biblio.no_sources_available': 'No hay fuentes bibliográficas verificadas disponibles para esta afirmación.',
  'biblio.evidence_id': 'ID de evidencia',
  'biblio.citations_count': '{count} cita(s)',
  'biblio.citations_title': 'Citas y concordancia',
  'biblio.citation_id': 'Cita',
  'biblio.source_level': 'Nivel documental',
  'biblio.source_level_p0': 'P0 — Publicación académica revisada por pares / institucional',
  'biblio.source_level_p1': 'P1 — Tratado especializado reconocido / estándar oficial',
  'biblio.source_level_p2': 'P2 — Referencia secundaria / criadores / empírica',
  'biblio.concordance_concordant': 'Concordante',
  'biblio.concordance_conflicting': 'Contradictoria (Conflicto)',
  'biblio.concordance_insufficient': 'Insuficiente',
  'biblio.concordance_outdated': 'Histórica (Desactualizada)',
  'biblio.concordance_not_verified': 'No verificada',
  'biblio.role_primary': 'Fuente principal',
  'biblio.role_corroborative': 'Corroborativa',
  'biblio.role_historical': 'Histórica',
  'biblio.role_challenged': 'Cuestionada',
  'biblio.source_title': 'Detalles bibliográficos',
  'biblio.authors': 'Autores',
  'biblio.organization': 'Organización',
  'biblio.year': 'Año',
  'biblio.publisher': 'Editorial',
  'biblio.journal': 'Revista / Diario',
  'biblio.volume_issue_pages': 'Volumen / N° / Páginas',
  'biblio.location': 'Ubicación en la obra',
  'biblio.doi': 'DOI',
  'biblio.isbn': 'ISBN',
  'biblio.url': 'Consultar en línea',
  'biblio.verification_verified': 'Fuente verificada y consultada',
  'biblio.verification_not_verified': 'No verificada individualmente',
  'biblio.verification_outdated': 'Referencia histórica superada',
  'biblio.source_consulted_at': 'Consultada el {date}',
  'biblio.notes': 'Notas de auditoría',
  'biblio.warning_no_auto_winner': '⚠️ Las fuentes contradictorias se conservan sin arbitraje automático.',
  'biblio.warning_p1_not_verified': 'ℹ️ El nivel documental P1/P0 califica la fuente, pero no constituye una certificación biológica automática de la regla.',
  'biblio.close': 'Cerrar',
};

const it: Record<EpistemicTranslationKey, string> = {
  'status.GENETICALLY_CONFIRMED': 'Geneticamente confermato',
  'status.OBSERVED': 'Osservazione visiva',
  'status.DECLARED': 'Dichiarazione allevatore',
  'status.INFERRED': 'Deduzione teorica',
  'status.UNKNOWN': 'Sconosciuto',
  'status.NOT_TESTED': 'Non testato',
  'status.CONFLICT_REVIEW': 'Conflitto da verificare',
  'status.REVIEW_REQUIRED': 'Revisione richiesta',
  'status.POSSIBLE_SET': 'Ipotesi possibili',
  'status.PROVISIONAL': 'Provvisorio — conferma richiesta',
  'status.BLOCKED': 'Bloccato — regola scientifica attualmente inutilizzabile',
  'status.NEEDS_HUMAN_REVIEW': 'Revisione umana richiesta',
  'status.CONFLICTING': 'Informazioni contraddittorie',
  'status.INSUFFICIENT_INFORMATION': 'Informazioni insufficienti',
  'status.CONFIRMED': 'Confermato',

  // Pedagogy V1.9.4
  'pedagogy.phenotype_title': 'Fenotipo',
  'pedagogy.phenotype_desc': 'Ciò che si osserva nell\'uccello.',
  'pedagogy.genotype_title': 'Genotipo',
  'pedagogy.genotype_desc': 'Le informazioni genetiche note o confermate.',
  'pedagogy.carrier_title': 'Portatore',
  'pedagogy.carrier_desc': 'Una mutazione recessiva che può essere presente senza essere visibile.',
  'pedagogy.phenotype_not_genotype_warning': 'Un fenotipo osservato non permette sempre di determinare il genotipo.',
  'pedagogy.zw_female_notice': 'Regola biologica ZW: nelle femmine (Z/W), le mutazioni recessive legate al sesso non hanno stato portatore.',
  'pedagogy.q_what_is_it': 'Che cos\'è?',
  'pedagogy.q_what_is_observed': 'Cosa è osservato?',
  'pedagogy.q_what_is_certain': 'Cosa è certo?',
  'pedagogy.q_what_is_unknown': 'Cosa è sconosciuto?',
  'pedagogy.q_what_is_not_tested': 'Cosa non è stato testato?',
  'pedagogy.q_where_does_it_come_from': 'Da dove proviene l\'informazione?',
  'pedagogy.q_what_is_confidence': 'Qual è il livello di fiducia?',
  'pedagogy.q_is_review_needed': 'È necessaria una verifica umana?',

  // Suggestions V1.9.4
  'suggestion.banner_title': 'Suggerimenti genetici parentali',
  'suggestion.banner_desc': 'Valori ereditari proposti dalla linea di sangue nota.',
  'suggestion.badge': 'Suggerimento',
  'suggestion.inherited_value': 'Valore ereditario proposto',
  'suggestion.accept': 'Accetta',
  'suggestion.modify': 'Modifica',
  'suggestion.reject': 'Rifiuta',
  'suggestion.keep_unknown': 'Mantieni Sconosciuto',
  'suggestion.keep_not_tested': 'Mantieni Non testato',
  'suggestion.not_genetically_confirmed_notice': 'Nessun suggerimento diventa automaticamente un genotipo confermato.',

  // Official Cross V1.9.4
  'cross.official_explanation_title': 'Presentazione ufficiale del risultato dell\'incrocio',
  'cross.parents_used_facet': 'Genitori utilizzati',
  'cross.loci_analyzed_facet': 'Loci analizzati',
  'cross.official_result_facet': 'Risultato ufficiale',
  'cross.official_probabilities_facet': 'Probabilità ufficiali',
  'cross.calculated_risks_facet': 'Rischi calcolati',
  'cross.missing_info_facet': 'Informazioni mancanti',
  'cross.calculation_limits_facet': 'Limiti del calcolo',
  'cross.epistemic_statuses_facet': 'Stati epistemici',
  'cross.no_arbitrary_score_notice': 'Zero punteggi, zero stelle, zero raccomandazione di accoppiamento. Risultati esclusivamente da motori scientifici omologati.',

  'source.DNA_TEST': 'Test del DNA',
  'source.PROGENY_TEST_CROSS': 'Prova da discendenza',
  'source.PARENTAL_PEDIGREE': 'Pedigree parentale',
  'source.PHENOTYPIC_OBSERVATION': 'Osservazione fenotipica',
  'source.USER_DECLARATION': 'Dichiarazione allevatore',
  'source.SYSTEM_INFERENCE': 'Deduzione del sistema',
  'source.LEGACY_MIGRATION': 'Dato storico migrato',

  'confidence.VERY_HIGH': 'Fiducia molto alta',
  'confidence.HIGH': 'Fiducia alta',
  'confidence.MEDIUM': 'Fiducia media',
  'confidence.LOW': 'Fiducia bassa',
  'confidence.VERY_LOW': 'Fiducia molto bassa',
  'confidence.UNKNOWN': 'Fiducia sconosciuta',

  'review.REQUIRED': 'Validazione umana richiesta',
  'review.CONFLICT_REVIEW': 'Conflitto da risolvere',
  'review.RECOMMENDED': 'Revisione raccomandata',
  'review.REVIEWED': 'Verificato dall\'allevatore',

  'locus.provisional': 'Riferimento provvisorio',
  'locus.provisional_warning': 'Locus sotto studio scientifico — validazione umana raccomandata',
  'transmission.Z_LINKED': 'Legato al sesso (Z)',
  'transmission.AUTOSOMAL': 'Autosomico',
  'transmission.CO_DOMINANT': 'Codominante',
  'carrier.CONFIRMED_CARRIER': 'Portatore confermato',
  'carrier.POSSIBLE_CARRIER': 'Possibile portatore',

  'card.title': 'Genetica',
  'card.subtitle': 'Sintesi delle informazioni genetiche canoniche',
  'card.global_status': 'Stato globale',
  'card.global_confidence': 'Fiducia',
  'card.loci_section': 'Loci genetici',
  'card.empty': 'Nessuna informazione genetica registrata',
  'card.conflict_alert_title': 'Conflitti genetici da verificare',
  'card.combinations_count': '{count} combinazioni possibili',
  'card.summary_footer': '{total} loci registrati · {toReview} da verificare · {unknown} sconosciuti',
  'card.genotype_label': 'Genotipo',
  'card.export_pdf': 'Esporta passaporto PDF',
  'card.exporting_pdf': 'Generazione PDF...',

  'drawer.title': 'Dettaglio del locus genetico',
  'drawer.close': 'Chiudi',
  'drawer.status_section': 'Stato e qualificazione epistemica',
  'drawer.determination_section': 'Determinazione genetica',
  'drawer.confirmed_genotype': 'Genotipo confermato',
  'drawer.possible_hypotheses': 'Ipotesi possibili',
  'drawer.hypothesis_item': 'Ipotesi {index}',
  'drawer.why_hypothesis': 'Perché questa ipotesi?',
  'drawer.transmission_section': 'Modalità di trasmissione',
  'drawer.carrier_section': 'Stato portatore',
  'drawer.not_applicable': 'Non applicabile',
  'drawer.carrier_none': 'Non portatore',
  'drawer.provenance_section': 'Fonte e livello di prova',
  'drawer.unknown_description': 'Nessun dato genetico noto registrato per questo locus.',
  'drawer.not_tested_description': 'Questo locus non è stato testato. Non testato non significa assenza di mutazione.',
  'drawer.conflict_title': 'Conflitto genetico rilevato',
  'drawer.provisional_notice': 'Riferimento provvisorio — Locus sotto studio scientifico',

  'editor.title': 'Qualificazione epistemica del locus',
  'editor.add_info': 'Aggiungi informazioni genetiche',
  'editor.choose_locus': 'Seleziona un locus',
  'editor.what_i_know': 'Natura dell\'informazione',
  'editor.mode_observed': 'Osservazione visiva (piumaggio osservato)',
  'editor.mode_declared': 'Dichiarazione allevatore (mutazione nota)',
  'editor.mode_dna': 'Test del DNA (analisi molecolare certificata)',
  'editor.mode_possible_set': 'Ipotesi multiple (combinazioni possibili)',
  'editor.mode_unknown': 'Sconosciuto',
  'editor.mode_not_tested': 'Non testato',
  'editor.observation_label': 'Osservazione rilevata',
  'editor.source_label': 'Fonte della prova',
  'editor.confidence_label': 'Livello di fiducia',
  'editor.confidence_hint': 'Indica la certezza nell\'informazione, non una prova genetica formale.',
  'editor.alleles_label': 'Alleli testati',
  'editor.hypotheses_selection': 'Seleziona le ipotesi compatibili',
  'editor.save': 'Salva qualificazione',
  'editor.cancel': 'Annulla',
  'editor.summary_title': 'Riepilogo prima del salvataggio',
  'editor.no_catalogue': 'Nessun catalogo canonico disponibile per questa specie.',
  'editor.not_tested_warning': 'Non testato non significa assenza di mutazione.',

  'cross.title': 'Simulazione di incrocio genetico Gould',
  'cross.open_simulator': 'Simula incrocio',
  'cross.parent_a': 'Genitore A',
  'cross.parent_b': 'Genitore B',
  'cross.calculate': 'Calcola incrocio',
  'cross.calculating': 'Calcolo in corso...',
  'cross.blocked': 'Incrocio bloccato',
  'cross.result_title': 'Risultato dell\'incrocio',
  'cross.result_hypothetical': 'Risultato basato su molteplici ipotesi parentali',
  'cross.result_confirmed': 'Risultato basato su genotipi confermati',
  'cross.result_review_required': 'Risultato da interpretare con revisione umana',
  'cross.genotypes_section': 'Genotipi possibili',
  'cross.phenotypes_section': 'Fenotipi possibili',
  'cross.probability_label': 'Probabilità',
  'cross.parental_hypotheses': 'Ipotesi parentali',
  'cross.data_confirmed': 'Dati confermati',
  'cross.human_review_required': 'Revisione umana richiesta',
  'cross.insufficient_data': 'Informazioni genetiche insufficienti per eseguire il calcolo',
  'cross.invalid_species': 'Nessun incrocio Gould disponibile per questa specie',
  'cross.sex_required': 'Il sesso del genitore deve essere noto per eseguire questo incrocio',
  'cross.genetic_conflict': 'Incrocio bloccato: i dati genetici di un genitore richiedono verifica umana',
  'cross.provisional_framework': 'Quadro provvisorio',
  'cross.select_partner': 'Seleziona un partner...',
  'cross.composite_label_notice': 'Etichetta composita da esposizione (non una mutazione singola)',
  'cross.no_result': 'Nessun risultato di simulazione disponibile',
  'cross.parents_used': 'Genitori utilizzati',
  'cross.parent_hypotheses_count': '{count} ipotesi genetica/e',
  'cross.mode_confirmed': 'Modalità: genotipi confermati',
  'cross.mode_hypothetical': 'Modalità: insieme di ipotesi genitoriali',
  'cross.mode_hypothetical_desc': 'Diversi genotipi genitoriali rimangono possibili. I risultati rappresentano l\'insieme delle possibilità calcolate dal motore.',
  'cross.phenotype_possible': 'Fenotipo possibile',
  'cross.probability_coverage': 'Copertura delle probabilità: {coverage}%',
  'cross.human_review_recommended': 'Revisione umana raccomandata',
  'cross.composite_phenotype': 'Fenotipo composito',
  'cross.result_needs_human_review': 'Questo risultato richiede una verifica umana.',
  'cross.detail_title': 'Dettaglio del risultato genetico',
  'cross.alleles_label': 'Alleli',
  'cross.locus_label': 'Locus',
  'cross.transmission_label': 'Trasmissione',
  'cross.status_label': 'Stato',
  'cross.underlying_genotypes_count': '{count} genotipo/i sottostante/i',

  // Bibliographic Traceability
  'biblio.section_title': 'Tracciabilità scientifica',
  'biblio.button_consult': 'Consulta',
  'biblio.sources_count': '{count} fonte/i',
  'biblio.conflicting_sources_count': '{count} fonte/i contraddittoria/e',
  'biblio.drawer_title': 'Tracciabilità scientifica e bibliografica',
  'biblio.drawer_subtitle': 'Giustificazione documentale e fonti verificate',
  'biblio.rule_context': 'Contesto della regola',
  'biblio.species_label': 'Specie',
  'biblio.locus_label': 'Locus / Regola',
  'biblio.claim_label': 'Affermazione biologica',
  'biblio.epistemic_status': 'Stato epistemico',
  'biblio.human_review': 'Arbitrato umano',
  'biblio.human_review_required': 'Arbitrato umano richiesto',
  'biblio.human_review_not_required': 'Nessun arbitrato richiesto',
  'biblio.limitations_label': 'Limiti scientifici',
  'biblio.evidence_records_title': 'Registri delle prove (Evidence Records)',
  'biblio.no_sources_available': 'Nessuna fonte bibliografica verificata disponibile per questa affermazione.',
  'biblio.evidence_id': 'ID prova',
  'biblio.citations_count': '{count} citazione/i',
  'biblio.citations_title': 'Citazioni e concordanza',
  'biblio.citation_id': 'Citazione',
  'biblio.source_level': 'Livello documentale',
  'biblio.source_level_p0': 'P0 — Pubblicazione accademica peer-reviewed / istituzionale',
  'biblio.source_level_p1': 'P1 — Trattato specializzato riconosciuto / standard ufficiale',
  'biblio.source_level_p2': 'P2 — Riferimento secondario / allevatori / empirico',
  'biblio.concordance_concordant': 'Concordante',
  'biblio.concordance_conflicting': 'Contraddittoria (Conflitto)',
  'biblio.concordance_insufficient': 'Insufficiente',
  'biblio.concordance_outdated': 'Storica (Superata)',
  'biblio.concordance_not_verified': 'Non verificata',
  'biblio.role_primary': 'Fonte principale',
  'biblio.role_corroborative': 'Corroborativa',
  'biblio.role_historical': 'Storica',
  'biblio.role_challenged': 'Contestata',
  'biblio.source_title': 'Dettagli bibliografici',
  'biblio.authors': 'Autori',
  'biblio.organization': 'Organizzazione',
  'biblio.year': 'Anno',
  'biblio.publisher': 'Editore',
  'biblio.journal': 'Rivista',
  'biblio.volume_issue_pages': 'Volume / N° / Pagine',
  'biblio.location': 'Posizione nell\'opera',
  'biblio.doi': 'DOI',
  'biblio.isbn': 'ISBN',
  'biblio.url': 'Visualizza online',
  'biblio.verification_verified': 'Fonte verificata e consultata',
  'biblio.verification_not_verified': 'Non verificata singolarmente',
  'biblio.verification_outdated': 'Riferimento storico superato',
  'biblio.source_consulted_at': 'Consultata il {date}',
  'biblio.notes': 'Note di audit',
  'biblio.warning_no_auto_winner': '⚠️ Le fonti contraddittorie sono conservate senza arbitrato automatico.',
  'biblio.warning_p1_not_verified': 'ℹ️ Il livello documentale P1/P0 qualifica la fonte, ma non costituisce una certificazione biologica automatica della regola.',
  'biblio.close': 'Chiudi',
};

const dictionaries: Record<Language, Record<EpistemicTranslationKey, string>> = {
  fr,
  en,
  ar,
  es,
  it,
};

export function translateEpistemic(
  language: Language,
  key: EpistemicTranslationKey,
  variables?: Record<string, string | number>
): string {
  const dict = dictionaries[language] || dictionaries.fr;
  let text = dict[key] || dictionaries.fr[key] || key;

  if (variables) {
    Object.entries(variables).forEach(([name, value]) => {
      text = text.split(`{${name}}`).join(String(value));
    });
  }

  return text;
}

export interface EpistemicStatusPresentation {
  canonicalText: string;
  badgeText: string;
  description: string;
  variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'outline';
  isConfirmed: boolean;
  requiresReview: boolean;
  isBlocked: boolean;
  isProvisional: boolean;
}

/**
 * Présentation officielle et pédagogique V1.9.4 des statuts épistémiques.
 * Distingue clairement la nature, la provenance et la certitude sans modifier la donnée scientifique.
 */
export function getEpistemicStatusPresentation(
  status: string | undefined,
  language: Language = 'fr'
): EpistemicStatusPresentation {
  const norm = (status || 'UNKNOWN').toUpperCase().trim();

  switch (norm) {
    case 'UNKNOWN': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Information inconnue',
          badge: 'Inconnu',
          desc: 'Aucune donnée connue enregistrée pour ce locus. Rien n\'est présumé sans preuve.'
        },
        en: {
          canonical: 'Unknown information',
          badge: 'Unknown',
          desc: 'No known genetic data recorded for this locus. Nothing is assumed without proof.'
        },
        ar: {
          canonical: 'معلومة غير معروفة',
          badge: 'غير معروف',
          desc: 'لا توجد بيانات معروفة مسجلة لهذا الموقع الجيني. لا يتم افتراض أي شيء دون إثبات.'
        },
        es: {
          canonical: 'Información desconocida',
          badge: 'Desconocido',
          desc: 'Ningún dato conocido registrado para este locus. No se presume nada sin prueba.'
        },
        it: {
          canonical: 'Informazione sconosciuta',
          badge: 'Sconosciuto',
          desc: 'Nessun dato noto registrato per questo locus. Nulla è presunto senza prova.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'outline',
        isConfirmed: false,
        requiresReview: false,
        isBlocked: false,
        isProvisional: false
      };
    }

    case 'NOT_TESTED': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Non testé',
          badge: 'Non testé',
          desc: 'Ce locus n\'a pas été testé. Non testé ne signifie jamais absence de mutation.'
        },
        en: {
          canonical: 'Not tested',
          badge: 'Not tested',
          desc: 'This locus has not been tested. Not tested never means absence of mutation.'
        },
        ar: {
          canonical: 'غير مفحوص',
          badge: 'لم يُختبر',
          desc: 'لم يتم فحص هذا الموقع الجيني. عدم الفحص لا يعني أبداً غياب الطفرة.'
        },
        es: {
          canonical: 'No probado',
          badge: 'No probado',
          desc: 'Este locus no ha sido probado. No probado nunca significa ausencia de mutación.'
        },
        it: {
          canonical: 'Non testato',
          badge: 'Non testato',
          desc: 'Questo locus non è stato testato. Non testato non significa mai assenza di mutazione.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'outline',
        isConfirmed: false,
        requiresReview: false,
        isBlocked: false,
        isProvisional: false
      };
    }

    case 'OBSERVED': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Observé',
          badge: 'Observation visuelle',
          desc: 'Ce que vous observez chez l\'oiseau. Un phénotype observé ne permet pas toujours de déterminer le génotype.'
        },
        en: {
          canonical: 'Observed',
          badge: 'Visual observation',
          desc: 'What you observe in the bird. An observed phenotype does not always determine the genotype.'
        },
        ar: {
          canonical: 'مُلاحظ',
          badge: 'ملاحظة بصرية',
          desc: 'ما تلاحظه في الطائر. النمط الظاهري الملاحظ لا يحدد دائماً النمط الوراثي.'
        },
        es: {
          canonical: 'Observado',
          badge: 'Observación visual',
          desc: 'Lo que observa en el ave. Un fenotipo observado no siempre permite determinar el genotipo.'
        },
        it: {
          canonical: 'Osservato',
          badge: 'Osservazione visiva',
          desc: 'Ciò che si osserva nell\'uccello. Un fenotipo osservato non permette sempre di determinare il genotipo.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'warning',
        isConfirmed: false,
        requiresReview: false,
        isBlocked: false,
        isProvisional: false
      };
    }

    case 'DECLARED': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Déclaré',
          badge: 'Déclaration éleveur',
          desc: 'Information déclarée par l\'éleveur sans preuve ADN moléculaire.'
        },
        en: {
          canonical: 'Declared',
          badge: 'Breeder declaration',
          desc: 'Information declared by the breeder without molecular DNA proof.'
        },
        ar: {
          canonical: 'مُصرّح به',
          badge: 'إقرار المربي',
          desc: 'معلومة صرح بها المربي دون دليل حمض نووي جزيئي.'
        },
        es: {
          canonical: 'Declarado',
          badge: 'Declaración del criador',
          desc: 'Información declarada por el criador sin prueba molecular de ADN.'
        },
        it: {
          canonical: 'Dichiarato',
          badge: 'Dichiarazione allevatore',
          desc: 'Informazione dichiarata dall\'allevatore senza prova molecolare di DNA.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'secondary',
        isConfirmed: false,
        requiresReview: false,
        isBlocked: false,
        isProvisional: false
      };
    }

    case 'INFERRED': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Déduit par le système à partir de données autorisées',
          badge: 'Déduction théorique',
          desc: 'Déduit par le système à partir de données généalogiques et de règles autorisées.'
        },
        en: {
          canonical: 'System inferred from authorized data',
          badge: 'Theoretical deduction',
          desc: 'Inferred by the system from pedigree data and authorized biological rules.'
        },
        ar: {
          canonical: 'مستنتج من النظام وفق بيانات معتمدة',
          badge: 'استنتاج نظري',
          desc: 'مستنتج بواسطة النظام استناداً إلى بيانات النسب والقواعد المعتمدة.'
        },
        es: {
          canonical: 'Deducido por el sistema a partir de datos autorizados',
          badge: 'Deducción teórica',
          desc: 'Deducido por el sistema a partir de genealogía y reglas autorizadas.'
        },
        it: {
          canonical: 'Dedotto dal sistema da dati autorizzati',
          badge: 'Deduzione teorica',
          desc: 'Dedotto dal sistema sulla base della genealogia e di regole autorizzate.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'accent',
        isConfirmed: false,
        requiresReview: false,
        isBlocked: false,
        isProvisional: false
      };
    }

    case 'GENETICALLY_CONFIRMED':
    case 'CONFIRMED': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: norm === 'GENETICALLY_CONFIRMED' ? 'Confirmé génétiquement' : 'Confirmé',
          badge: norm === 'GENETICALLY_CONFIRMED' ? 'Génétiquement confirmé' : 'Confirmé',
          desc: 'Les informations génétiques connues ou confirmées par analyse certifiée ou preuve par descendance.'
        },
        en: {
          canonical: norm === 'GENETICALLY_CONFIRMED' ? 'Genetically confirmed' : 'Confirmed',
          badge: norm === 'GENETICALLY_CONFIRMED' ? 'Genetically confirmed' : 'Confirmed',
          desc: 'Known or confirmed genetic information validated by certified analysis or progeny test.'
        },
        ar: {
          canonical: norm === 'GENETICALLY_CONFIRMED' ? 'مؤكد جينياً' : 'مؤكد',
          badge: norm === 'GENETICALLY_CONFIRMED' ? 'مؤكد جينياً' : 'مؤكد',
          desc: 'المعلومات الجينية المعروفة أو المؤكدة بتحليل معتمد أو إثبات نسلي.'
        },
        es: {
          canonical: norm === 'GENETICALLY_CONFIRMED' ? 'Confirmado genéticamente' : 'Confirmado',
          badge: norm === 'GENETICALLY_CONFIRMED' ? 'Genéticamente confirmado' : 'Confirmado',
          desc: 'Información genética conocida o confirmada por análisis certificado o prueba de descendencia.'
        },
        it: {
          canonical: norm === 'GENETICALLY_CONFIRMED' ? 'Confermato geneticamente' : 'Confermato',
          badge: norm === 'GENETICALLY_CONFIRMED' ? 'Geneticamente confermato' : 'Confermato',
          desc: 'Informazioni genetiche note o confermate tramite analisi certificata o prova da discendenza.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'success',
        isConfirmed: true,
        requiresReview: false,
        isBlocked: false,
        isProvisional: false
      };
    }

    case 'PROVISIONAL': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Provisoire — confirmation nécessaire',
          badge: 'Provisoire — confirmation nécessaire',
          desc: 'Référentiel sous étude scientifique ou hypothèse d\'élevage en attente de confirmation formelle.'
        },
        en: {
          canonical: 'Provisional — confirmation required',
          badge: 'Provisional — confirmation required',
          desc: 'Reference under scientific study or working breeding hypothesis awaiting formal confirmation.'
        },
        ar: {
          canonical: 'مؤقت — تأكيد مطلوب',
          badge: 'مؤقت — تأكيد مطلوب',
          desc: 'مرجع قيد الدراسة العلمية أو فرضية عمل للتزاوج بانتظار التأكيد الرسمي.'
        },
        es: {
          canonical: 'Provisional — confirmación requerida',
          badge: 'Provisional — confirmación requerida',
          desc: 'Marco referencial en estudio científico o hipótesis de cría pendiente de confirmación formal.'
        },
        it: {
          canonical: 'Provvisorio — conferma richiesta',
          badge: 'Provvisorio — conferma richiesta',
          desc: 'Quadro di riferimento sotto studio scientifico o ipotesi di allevamento in attesa di conferma.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'warning',
        isConfirmed: false,
        requiresReview: true,
        isBlocked: false,
        isProvisional: true
      };
    }

    case 'BLOCKED': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Bloqué — règle scientifique actuellement non utilisable',
          badge: 'Bloqué — règle scientifique actuellement non utilisable',
          desc: 'Locus bloqué en raison d\'une controverse scientifique active ou d\'un conflit littéraire non résolu.'
        },
        en: {
          canonical: 'Blocked — scientific rule currently unusable',
          badge: 'Blocked — scientific rule currently unusable',
          desc: 'Locus blocked due to active scientific controversy or unresolved literature conflict.'
        },
        ar: {
          canonical: 'محجوب — قاعدة علمية غير قابلة للاستخدام حالياً',
          badge: 'محجوب — قاعدة علمية غير قابلة للاستخدام حالياً',
          desc: 'موقع محجوب بسبب خلاف علمي قائم أو تعارض لم يتم حسمه.'
        },
        es: {
          canonical: 'Bloqueado — regla científica actualmente no utilizable',
          badge: 'Bloqueado — regla científica actualmente no utilizable',
          desc: 'Locus bloqueado debido a controversia científica activa o conflicto documental no resuelto.'
        },
        it: {
          canonical: 'Bloccato — regola scientifica attualmente inutilizzabile',
          badge: 'Bloccato — regola scientifica attualmente inutilizzabile',
          desc: 'Locus bloccato a causa di controversia scientifica attiva o conflitto documentale irrisolto.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'danger',
        isConfirmed: false,
        requiresReview: true,
        isBlocked: true,
        isProvisional: false
      };
    }

    case 'POSSIBLE_SET': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Plusieurs hypothèses possibles',
          badge: 'Hypothèses possibles',
          desc: 'Plusieurs hypothèses génétiques coexistent sans qu\'aucune ne soit choisie arbitrairement.'
        },
        en: {
          canonical: 'Multiple possible hypotheses',
          badge: 'Possible hypotheses',
          desc: 'Multiple genetic hypotheses coexist without arbitrary selection.'
        },
        ar: {
          canonical: 'عدة فرضيات محتملة',
          badge: 'فرضيات محتملة',
          desc: 'تتعايش عدة فرضيات وراثية دون اختيار تعسفي لأي منها.'
        },
        es: {
          canonical: 'Múltiples hipótesis posibles',
          badge: 'Hipótesis posibles',
          desc: 'Múltiples hipótesis genéticas coexisten sin selección arbitraria.'
        },
        it: {
          canonical: 'Più ipotesi possibili',
          badge: 'Ipotesi possibili',
          desc: 'Più ipotesi genetiche coesistono senza selezione arbitraria.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'warning',
        isConfirmed: false,
        requiresReview: false,
        isBlocked: false,
        isProvisional: false
      };
    }

    case 'NEEDS_HUMAN_REVIEW':
    case 'REVIEW_REQUIRED': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Vérification humaine nécessaire',
          badge: 'Revue requise',
          desc: 'Une vérification humaine par l\'éleveur est obligatoire avant toute utilisation.'
        },
        en: {
          canonical: 'Human review required',
          badge: 'Review required',
          desc: 'Human verification by the breeder is required before any use.'
        },
        ar: {
          canonical: 'مراجعة بشرية مطلوبة',
          badge: 'مراجعة مطلوبة',
          desc: 'مراجعة بشرية من المربي مطلوبة قبل أي استخدام.'
        },
        es: {
          canonical: 'Verificación humana requerida',
          badge: 'Revisión requerida',
          desc: 'Se requiere verificación humana por parte del criador antes de su uso.'
        },
        it: {
          canonical: 'Revisione umana richiesta',
          badge: 'Revisione richiesta',
          desc: 'È richiesta la verifica umana da parte dell\'allevatore prima dell\'uso.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'warning',
        isConfirmed: false,
        requiresReview: true,
        isBlocked: false,
        isProvisional: false
      };
    }

    case 'CONFLICTING':
    case 'CONFLICT_REVIEW': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Informations contradictoires',
          badge: 'Conflit à vérifier',
          desc: 'Informations contradictoires détectées entre sources ou observations. Certitude bloquée.'
        },
        en: {
          canonical: 'Conflicting information',
          badge: 'Conflict to review',
          desc: 'Conflicting information detected between sources or observations. Certainty blocked.'
        },
        ar: {
          canonical: 'معلومات متضاربة',
          badge: 'تعارض بحاجة للتحقق',
          desc: 'تم اكتشاف معلومات متضاربة بين المصادر أو الملاحظات. اليقين محجوب.'
        },
        es: {
          canonical: 'Información contradictoria',
          badge: 'Conflicto a revisar',
          desc: 'Información contradictoria detectada entre fuentes u observaciones. Certeza bloqueada.'
        },
        it: {
          canonical: 'Informazioni contraddittorie',
          badge: 'Conflitto da verificare',
          desc: 'Informazioni contraddittorie rilevate tra fonti o osservazioni. Certezza bloccata.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'danger',
        isConfirmed: false,
        requiresReview: true,
        isBlocked: true,
        isProvisional: false
      };
    }

    case 'INSUFFICIENT_INFORMATION': {
      const texts: Record<Language, { canonical: string; badge: string; desc: string }> = {
        fr: {
          canonical: 'Informations insuffisantes',
          badge: 'Informations insuffisantes',
          desc: 'Données génétiques insuffisantes pour établir un résultat ou une hypothèse.'
        },
        en: {
          canonical: 'Insufficient information',
          badge: 'Insufficient information',
          desc: 'Insufficient genetic data to establish a result or hypothesis.'
        },
        ar: {
          canonical: 'معلومات غير كافية',
          badge: 'معلومات غير كافية',
          desc: 'بيانات وراثية غير كافية للوصول إلى نتيجة أو فرضية.'
        },
        es: {
          canonical: 'Información insuficiente',
          badge: 'Información insuficiente',
          desc: 'Datos genéticos insuficientes para establecer un resultado o hipótesis.'
        },
        it: {
          canonical: 'Informazioni insufficienti',
          badge: 'Informazioni insufficienti',
          desc: 'Dati genetici insufficienti per stabilire un risultato o un\'ipotesi.'
        }
      };
      const t = texts[language] || texts.fr;
      return {
        canonicalText: t.canonical,
        badgeText: t.badge,
        description: t.desc,
        variant: 'outline',
        isConfirmed: false,
        requiresReview: false,
        isBlocked: false,
        isProvisional: false
      };
    }

    default: {
      return {
        canonicalText: status || 'Information inconnue',
        badgeText: status || 'Inconnu',
        description: `Statut : ${status}`,
        variant: 'outline',
        isConfirmed: false,
        requiresReview: false,
        isBlocked: false,
        isProvisional: false
      };
    }
  }
}

