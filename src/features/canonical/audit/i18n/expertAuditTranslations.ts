/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Traductions Multilingues du Poste d'Audit Expert (FR, EN, AR RTL, ES, IT)
 * Mission : COLOR-GENETICS-V2-CONTROLLED-INTEGRATION-12
 */

export type AuditLanguage = 'fr' | 'en' | 'ar' | 'es' | 'it';

export interface AuditTranslations {
  title: string;
  subtitle: string;
  badgeShadow: string;
  controlledLockedBadge: string;
  controlledLockedTooltip: string;
  fundamentalRuleBanner: string;
  insufficientInfoWarning: string;
  operatorBadge: string;
  controlledChecklistTitle: string;
  prerequisites: {
    expertAuditCompleted: string;
    zeroUnexpectedDivergences: string;
    securityPass: string;
    completeData: string;
    explicitAuthorization: string;
    validFingerprint: string;
    rollbackAvailable: string;
    e2ePass: string;
  };
  sections: {
    context: string;
    parents: string;
    canonicalData: string;
    genotype: string;
    mutations: string;
    appliedRules: string;
    interactions: string;
    risks: string;
    standard: string;
    selection: string;
    evidence: string;
    explanation: string;
    legacyComparison: string;
    humanValidation: string;
  };
  fields: {
    speciesId: string;
    scientificName: string;
    commonName: string;
    breed: string;
    breedingObjective: string;
    selectionObjective: string;
    context: string;
    evaluationDate: string;
    contractVersion: string;
    catalogVersion: string;
    calculatorVersion: string;
    phenotype: string;
    genotype: string;
    carrierStatus: string;
    sex: string;
    age: string;
    source: string;
    epistemicStatus: string;
    confidence: string;
    provenance: string;
    mutationId: string;
    mutationName: string;
    inheritance: string;
    locus: string;
    alleles: string;
    sexLinked: string;
    dominance: string;
    calculatorStatus: string;
    evidenceIds: string;
    ruleId: string;
    ruleType: string;
    condition: string;
    outcome: string;
    reason: string;
    humanReview: string;
    embryonicMortality: string;
    welfareRisk: string;
    standardImpact: string;
    selectionRecommendation: string;
    geneticCompatibility: string;
    fertilityStatus: string;
    evidenceLevel: string;
    sourceName: string;
    claim: string;
    limitations: string;
    legacyValue: string;
    v2Value: string;
    divergenceType: string;
    unknownSpecies: string;
  };
  actions: {
    review: string;
    accept: string;
    reject: string;
    defer: string;
    submitReasonPlaceholder: string;
    saveDecision: string;
    operatorNote: string;
    historyTitle: string;
    noHistory: string;
    dossierSelect: string;
  };
  statuses: {
    notReviewed: string;
    underReview: string;
    accepted: string;
    rejected: string;
    deferred: string;
    conflictReview: string;
    confirmed: string;
    conditional: string;
    underStudy: string;
    conflicting: string;
    insufficient: string;
    expectedDivergence: string;
    legacyDefect: string;
    canonicalImprovement: string;
    unexpectedDivergence: string;
    noDivergence: string;
    humanReviewRequired: string;
  };
  explanationKeys: {
    whatWasAnalyzed: string;
    whatIsKnown: string;
    whatIsUnknown: string;
    rulesUsed: string;
    whyThisResult: string;
    risks: string;
    standardImpact: string;
    selectionImpact: string;
    evidence: string;
    limitations: string;
    humanReview: string;
  };
  controlledPreparation: {
    sectionTitle: string;
    lockedBadge: string;
    lockedBanner: string;
    readinessTitle: string;
    readinessPass: string;
    readinessFail: string;
    blockersTitle: string;
    noBlockers: string;
    blockersFound: string;
    fingerprintTitle: string;
    checkpointA: string;
    checkpointB: string;
    manifestTitle: string;
    manifestHash: string;
    approvedCount: string;
    operatorIdLabel: string;
    operatorNameLabel: string;
    operatorRoleLabel: string;
    scopeLabel: string;
    prepareAuthBtn: string;
    signAuthBtn: string;
    verifySigBtn: string;
    dryRunBtn: string;
    simulateRollbackBtn: string;
    finalActivateBtn: string;
    signatureValid: string;
    signatureInvalid: string;
    signatureMissing: string;
    dryRunReady: string;
    dryRunDenied: string;
    rollbackRestored: string;
    productionLockedNotice: string;
    activateScopedBtn: string;
    scopedActiveBadge: string;
  };
  productionReadiness: {
    sectionTitle: string;
    badgeReady: string;
    badgeNotReady: string;
    badgeBlocked: string;
    productionLockedNotice: string;
    operatorReviewTitle: string;
    btnApproveReadiness: string;
    btnRejectReadiness: string;
    btnDeferReadiness: string;
    approvalNotice: string;
    rejectionNotice: string;
    deferNotice: string;
    securityCountersTitle: string;
    fingerprintTitle: string;
    blockersTitle: string;
    noBlockers: string;
    auditDimensionsTitle: string;
    verdictLabel: string;
    reasonPlaceholder: string;
  };
  controlledProduction: {
    sectionTitle: string;
    warningNotice: string;
    badgeProductionActive: string;
    badgeProductionLocked: string;
    readinessApprovedLabel: string;
    fingerprintALabel: string;
    fingerprintBLabel: string;
    manifestHashLabel: string;
    signatureLabel: string;
    operatorLabel: string;
    scopeLabel: string;
    expirationLabel: string;
    securityCountersLabel: string;
    dryRunLabel: string;
    rollbackReadinessLabel: string;
    isolationLabel: string;
    btnAuthorizeProduction: string;
    btnExecuteDryRun: string;
    btnConfirmProduction: string;
    btnRollbackProduction: string;
    humanConfirmationNotice: string;
    productionActivatedSuccess: string;
    rollbackSuccess: string;
    errorLabel: string;
  };
}

export const EXPERT_AUDIT_TRANSLATIONS: Record<AuditLanguage, AuditTranslations> = {
  fr: {
    title: "Poste d'Audit Expert — COLOR-GENETICS-V2",
    subtitle: "Inspection approfondie, explication causale et validation humaine des décisions canoniques Shadow.",
    badgeShadow: "MODE SHADOW — OBSERVATION STRICTE",
    controlledLockedBadge: "MODE CONTROLLED VERROUILLÉ",
    controlledLockedTooltip: "Mode CONTROLLED verrouillé. Requiert autorisation formelle Mission 13.",
    fundamentalRuleBanner: "Biologiquement possible ≠ génétiquement conseillé ≠ recommandé pour la sélection ≠ compatible avec un standard d'exposition.",
    insufficientInfoWarning: "Résultat limité par information insuffisante.",
    operatorBadge: "Opérateur Qualifié",
    controlledChecklistTitle: "Conditions requises pour l'activation contrôlée future :",
    prerequisites: {
      expertAuditCompleted: "Audit expert de conformité finalisé",
      zeroUnexpectedDivergences: "Divergences inattendues = 0",
      securityPass: "Garanties de sécurité et compteurs = PASS",
      completeData: "Complétude et intégrité des données vérifiées",
      explicitAuthorization: "Autorisation explicite de l'opérateur signée",
      validFingerprint: "Fingerprint physique LevelDB vérifié",
      rollbackAvailable: "Procédure de rollback réversible testée",
      e2ePass: "Validation Playwright E2E intégrale validée"
    },
    sections: {
      context: "A. Contexte & Spécifications",
      parents: "B. Oiseaux & Parents",
      canonicalData: "C. Données Canoniques d'Entrée",
      genotype: "D. Analyse Génotypique",
      mutations: "E. Répertoire des Mutations",
      appliedRules: "F. Règles Biologiques & Génétiques Appliquées",
      interactions: "G. Interactions Géniques & Épistasie",
      risks: "H. Létalité & Risques Sanitaires",
      standard: "I. Conformité Standard COM / OMJ",
      selection: "J. Recommandations de Sélection",
      evidence: "K. Preuves Scientifiques & Provenance",
      explanation: "L. Explication Causale Structurée",
      legacyComparison: "M. Comparaison Détaillée Legacy vs V2",
      humanValidation: "N. Validation Humaine & Décision Expert"
    },
    fields: {
      speciesId: "Identifiant Espèce",
      scientificName: "Nom Scientifique",
      commonName: "Nom Commun",
      breed: "Variété / Race",
      breedingObjective: "Objectif d'Élevage",
      selectionObjective: "Objectif de Sélection",
      context: "Contexte de Calcul",
      evaluationDate: "Date d'Évaluation",
      contractVersion: "Version Contrat",
      catalogVersion: "Version Catalogue",
      calculatorVersion: "Version Moteur",
      phenotype: "Phénotype Observé",
      genotype: "Génotype",
      carrierStatus: "Statut Porteur",
      sex: "Sexe",
      age: "Âge",
      source: "Source de Donnée",
      epistemicStatus: "Statut Épistémique",
      confidence: "Indice de Confiance",
      provenance: "Provenance Traçable",
      mutationId: "Code Mutation",
      mutationName: "Nom de Mutation",
      inheritance: "Mode de Transmission",
      locus: "Locus Chromosomique",
      alleles: "Allèles Reconnus",
      sexLinked: "Lié au Sexe",
      dominance: "Degré de Dominance",
      calculatorStatus: "Statut Calculateur",
      evidenceIds: "Références de Preuves",
      ruleId: "Identifiant Règle",
      ruleType: "Type de Règle",
      condition: "Condition Déclenchante",
      outcome: "Résultat / Décision",
      reason: "Justification Biologique",
      humanReview: "Revue Humaine Requise",
      embryonicMortality: "Mortalité Embryonnaire",
      welfareRisk: "Risque Sanitaire / Bien-être",
      standardImpact: "Impact Standard",
      selectionRecommendation: "Conseil de Sélection",
      geneticCompatibility: "Compatibilité Génétique",
      fertilityStatus: "Statut de Fertilité",
      evidenceLevel: "Niveau de Preuve",
      sourceName: "Source / Publication",
      claim: "Affirmation Scientifique",
      limitations: "Limites Documentées",
      legacyValue: "Valeur Legacy Actuelle",
      v2Value: "Valeur Canonique V2",
      divergenceType: "Classification Divergence",
      unknownSpecies: "UNKNOWN"
    },
    actions: {
      review: "Mettre en Revue (REVIEW)",
      accept: "Valider l'Interprétation (ACCEPT)",
      reject: "Rejeter l'Interprétation (REJECT)",
      defer: "Ajourner pour Complément (DEFER)",
      submitReasonPlaceholder: "Saisir la justification détaillée de la décision d'audit expert...",
      saveDecision: "Consigner au Journal d'Audit",
      operatorNote: "Justification Opérateur",
      historyTitle: "Historique Traçable des Décisions",
      noHistory: "Aucune décision humaine enregistrée pour ce dossier.",
      dossierSelect: "Sélectionner un dossier d'audit :"
    },
    statuses: {
      notReviewed: "Non Audité",
      underReview: "En Cours d'Audit",
      accepted: "Interprétation Validée",
      rejected: "Interprétation Rejetée",
      deferred: "Audit Ajourné",
      conflictReview: "Revue Biologique Requise",
      confirmed: "Confirmé",
      conditional: "Conditionnel",
      underStudy: "Sous Étude",
      conflicting: "Conflictuel",
      insufficient: "Information Insuffisante",
      expectedDivergence: "Divergence Attendue",
      legacyDefect: "Défaut Legacy Corrigé",
      canonicalImprovement: "Amélioration Canonique",
      unexpectedDivergence: "Divergence Inattendue",
      noDivergence: "Concordance Parfaite",
      humanReviewRequired: "INTERVENTION HUMAINE REQUISE"
    },
    explanationKeys: {
      whatWasAnalyzed: "1. Ce qui a été analysé",
      whatIsKnown: "2. Ce qui est biologiquement établi",
      whatIsUnknown: "3. Ce qui demeure inconnu",
      rulesUsed: "4. Règles canoniques appliquées",
      whyThisResult: "5. Justification causale de la décision",
      risks: "6. Risques de létalité et sanitaires",
      standardImpact: "7. Impact sur le standard de concours",
      selectionImpact: "8. Impact sur la sélection et la souche",
      evidence: "9. Preuves scientifiques et références",
      limitations: "10. Limites épistémiques et hypothèses",
      humanReview: "11. Nécessité d'une revue humaine experte"
    },
    controlledPreparation: {
      sectionTitle: "Outil de préparation CONTROLLED",
      lockedBadge: "MODE CONTROLLED — VERROUILLÉ",
      lockedBanner: "Le mode CONTROLLED est formellement verrouillé et ne peut pas être activé en production.",
      readinessTitle: "État de préparation du système",
      readinessPass: "Prêt pour Dry Run (READINESS PASS)",
      readinessFail: "Préparation bloquée (READINESS FAIL)",
      blockersTitle: "Bloqueurs d'activation",
      noBlockers: "Aucun bloqueur détecté (0 divergence inattendue, 0 violation)",
      blockersFound: "Bloqueurs critiques détectés",
      fingerprintTitle: "Empreinte physique LevelDB réelle",
      checkpointA: "Checkpoint A (Préparation)",
      checkpointB: "Checkpoint B (Sas Final)",
      manifestTitle: "Manifeste d'activation immuable",
      manifestHash: "Empreinte SHA-256 du manifeste",
      approvedCount: "Entités approuvées",
      operatorIdLabel: "Identifiant Opérateur",
      operatorNameLabel: "Nom Opérateur",
      operatorRoleLabel: "Rôle Opérateur",
      scopeLabel: "Périmètre d'activation (Scope)",
      prepareAuthBtn: "1. Préparer l'Autorisation",
      signAuthBtn: "2. Signer l'Autorisation",
      verifySigBtn: "3. Vérifier la Signature",
      dryRunBtn: "4. Exécuter le Dry Run",
      simulateRollbackBtn: "5. Simuler le Rollback",
      finalActivateBtn: "Activer CONTROLLED en Production (Verrouillé)",
      signatureValid: "Signature valide et liée au stockage réel",
      signatureInvalid: "Signature invalide ou falsifiée",
      signatureMissing: "Signature absente",
      dryRunReady: "DRY_RUN_READY : Simulation d'activation validée avec succès",
      dryRunDenied: "DRY_RUN_DENIED : Activation refusée par les sas de sécurité",
      rollbackRestored: "Rollback simulé avec succès — Statut : SHADOW_RESTORED",
      productionLockedNotice: "CONTROLLED PRODUCTION ACTIVATION IS NOT AVAILABLE IN THIS MISSION.",
      activateScopedBtn: "6. Activer CONTROLLED (Expert Scoped)",
      scopedActiveBadge: "CONTROLLED_EXPERT_SCOPED_ACTIVE (Production Verrouillée)"
    },
    productionReadiness: {
      sectionTitle: "15. Revue Finale de Préparation à la Production (Mission 15)",
      badgeReady: "READY_FOR_PRODUCTION_AUTHORIZATION",
      badgeNotReady: "NOT_READY",
      badgeBlocked: "BLOCKED",
      productionLockedNotice: "CONTROLLED_PRODUCTION = LOCKED (Aucune activation en production dans cette mission)",
      operatorReviewTitle: "Décision Humaine de Préparation",
      btnApproveReadiness: "1. Certifier la Préparation (APPROVE_READINESS)",
      btnRejectReadiness: "2. Rejeter la Préparation (REJECT_READINESS)",
      btnDeferReadiness: "3. Ajourner la Préparation (DEFER_READINESS)",
      approvalNotice: "L'approbation certifie l'admissibilité technique à une future autorisation et NE DOIT PAS activer la production.",
      rejectionNotice: "Le rejet bloque le passage en production pour non-conformité.",
      deferNotice: "L'ajournement maintient le système en attente d'audit complémentaire.",
      securityCountersTitle: "Compteurs de Sécurité (23 / 23 stricts)",
      fingerprintTitle: "Empreinte Physique LevelDB Réel",
      blockersTitle: "Bloqueurs Détectés",
      noBlockers: "Aucun bloqueur détecté (0 divergence inattendue, 0 violation de sécurité)",
      auditDimensionsTitle: "Audit des 15 Dimensions Biologiques & Systèmes",
      verdictLabel: "Verdict Final de Préparation",
      reasonPlaceholder: "Justification obligatoire de la décision de préparation..."
    },
    controlledProduction: {
      sectionTitle: "16. Autorisation Formelle d'Activation CONTROLLED_PRODUCTION (Mission 16)",
      warningNotice: "Cette action active réellement CONTROLLED_PRODUCTION.",
      badgeProductionActive: "CONTROLLED_PRODUCTION_ACTIVE",
      badgeProductionLocked: "CONTROLLED_PRODUCTION_LOCKED",
      readinessApprovedLabel: "Préparation certifiée (M15)",
      fingerprintALabel: "Fingerprint Checkpoint A",
      fingerprintBLabel: "Fingerprint Checkpoint B",
      manifestHashLabel: "Hash SHA-256 du Manifeste",
      signatureLabel: "Signature HMAC-SHA256 (11 dimensions)",
      operatorLabel: "Opérateur Qualifié",
      scopeLabel: "Scope : CONTROLLED_PRODUCTION",
      expirationLabel: "Période de Validité",
      securityCountersLabel: "Compteurs de Sécurité (33 stricts = 0)",
      dryRunLabel: "Simulation Dry-Run (15 dimensions PASS)",
      rollbackReadinessLabel: "Réversibilité Rollback Certifiée",
      isolationLabel: "Isolation Utilisateurs Standards Active",
      btnAuthorizeProduction: "1. Préparer & Signer Autorisation M16",
      btnExecuteDryRun: "2. Exécuter Dry-Run de Production",
      btnConfirmProduction: "3. Confirmer Activation Humaine (APPROVE_PRODUCTION)",
      btnRollbackProduction: "Rollback d'Urgence (Retour SHADOW / LOCKED)",
      humanConfirmationNotice: "Action humaine explicite requise. Aucun auto-déclenchement.",
      productionActivatedSuccess: "CONTROLLED_PRODUCTION activé avec succès. Double gate et isolation validés.",
      rollbackSuccess: "Rollback exécuté avec succès. CONTROLLED_PRODUCTION verrouillé à nouveau.",
      errorLabel: "Erreur de contrôle"
    }
  },

  en: {
    title: "Expert Audit Station — COLOR-GENETICS-V2",
    subtitle: "In-depth inspection, causal explanation, and human validation of Shadow canonical decisions.",
    badgeShadow: "SHADOW MODE — STRICT OBSERVATION",
    controlledLockedBadge: "CONTROLLED MODE LOCKED",
    controlledLockedTooltip: "CONTROLLED mode locked. Requires formal Mission 13 authorization.",
    fundamentalRuleBanner: "Biologically possible ≠ genetically advisable ≠ recommended for selection ≠ compatible with an exhibition standard.",
    insufficientInfoWarning: "Result constrained by insufficient information.",
    operatorBadge: "Qualified Operator",
    controlledChecklistTitle: "Mandatory conditions for future controlled activation:",
    prerequisites: {
      expertAuditCompleted: "Expert compliance audit completed",
      zeroUnexpectedDivergences: "Unexpected divergences = 0",
      securityPass: "Security guarantees and counters = PASS",
      completeData: "Data completeness and integrity verified",
      explicitAuthorization: "Signed explicit operator authorization",
      validFingerprint: "Physical LevelDB fingerprint verified",
      rollbackAvailable: "Reversible rollback procedure tested",
      e2ePass: "Full Playwright E2E test suite passing"
    },
    sections: {
      context: "A. Context & Specifications",
      parents: "B. Birds & Parents",
      canonicalData: "C. Canonical Input Data",
      genotype: "D. Genotypic Analysis",
      mutations: "E. Mutation Catalog",
      appliedRules: "F. Applied Biological & Genetic Rules",
      interactions: "G. Gene Interactions & Epistasis",
      risks: "H. Lethality & Health Risks",
      standard: "I. COM / OMJ Standard Conformity",
      selection: "J. Selection Recommendations",
      evidence: "K. Scientific Evidence & Provenance",
      explanation: "L. Structured Causal Explanation",
      legacyComparison: "M. Detailed Comparison Legacy vs V2",
      humanValidation: "N. Human Validation & Expert Decision"
    },
    fields: {
      speciesId: "Species ID",
      scientificName: "Scientific Name",
      commonName: "Common Name",
      breed: "Breed / Variety",
      breedingObjective: "Breeding Objective",
      selectionObjective: "Selection Objective",
      context: "Calculation Context",
      evaluationDate: "Evaluation Date",
      contractVersion: "Contract Version",
      catalogVersion: "Catalog Version",
      calculatorVersion: "Engine Version",
      phenotype: "Observed Phenotype",
      genotype: "Genotype",
      carrierStatus: "Carrier Status",
      sex: "Sex",
      age: "Age",
      source: "Data Source",
      epistemicStatus: "Epistemic Status",
      confidence: "Confidence Level",
      provenance: "Traceable Provenance",
      mutationId: "Mutation Code",
      mutationName: "Mutation Name",
      inheritance: "Inheritance Mode",
      locus: "Chromosomal Locus",
      alleles: "Recognized Alleles",
      sexLinked: "Sex-Linked",
      dominance: "Dominance Degree",
      calculatorStatus: "Calculator Status",
      evidenceIds: "Evidence Citations",
      ruleId: "Rule Identifier",
      ruleType: "Rule Type",
      condition: "Trigger Condition",
      outcome: "Outcome / Decision",
      reason: "Biological Justification",
      humanReview: "Human Review Required",
      embryonicMortality: "Embryonic Mortality",
      welfareRisk: "Health / Welfare Risk",
      standardImpact: "Standard Impact",
      selectionRecommendation: "Selection Advisory",
      geneticCompatibility: "Genetic Compatibility",
      fertilityStatus: "Fertility Status",
      evidenceLevel: "Evidence Level",
      sourceName: "Source / Publication",
      claim: "Scientific Claim",
      limitations: "Documented Limitations",
      legacyValue: "Current Legacy Value",
      v2Value: "Canonical V2 Value",
      divergenceType: "Divergence Classification",
      unknownSpecies: "UNKNOWN"
    },
    actions: {
      review: "Mark for Review (REVIEW)",
      accept: "Accept Interpretation (ACCEPT)",
      reject: "Reject Interpretation (REJECT)",
      defer: "Defer Decision (DEFER)",
      submitReasonPlaceholder: "Enter detailed rationale for the expert audit decision...",
      saveDecision: "Log to Audit Journal",
      operatorNote: "Operator Justification",
      historyTitle: "Traceable Audit Decision History",
      noHistory: "No human decisions logged for this record.",
      dossierSelect: "Select an audit record:"
    },
    statuses: {
      notReviewed: "Not Reviewed",
      underReview: "Under Review",
      accepted: "Interpretation Accepted",
      rejected: "Interpretation Rejected",
      deferred: "Review Deferred",
      conflictReview: "Biological Review Required",
      confirmed: "Confirmed",
      conditional: "Conditional",
      underStudy: "Under Study",
      conflicting: "Conflicting",
      insufficient: "Insufficient Information",
      expectedDivergence: "Expected Divergence",
      legacyDefect: "Legacy Defect Corrected",
      canonicalImprovement: "Canonical Improvement",
      unexpectedDivergence: "Unexpected Divergence",
      noDivergence: "Full Match",
      humanReviewRequired: "HUMAN REVIEW REQUIRED"
    },
    explanationKeys: {
      whatWasAnalyzed: "1. What was analyzed",
      whatIsKnown: "2. What is biologically established",
      whatIsUnknown: "3. What remains unknown",
      rulesUsed: "4. Canonical rules applied",
      whyThisResult: "5. Causal justification of decision",
      risks: "6. Lethality and health risks",
      standardImpact: "7. Exhibition standard impact",
      selectionImpact: "8. Strain and selection impact",
      evidence: "9. Scientific evidence and citations",
      limitations: "10. Epistemic limitations and assumptions",
      humanReview: "11. Expert human review requirement"
    },
    controlledPreparation: {
      sectionTitle: "CONTROLLED Preparation Tool",
      lockedBadge: "CONTROLLED MODE — LOCKED",
      lockedBanner: "CONTROLLED mode is formally locked and cannot be activated in production.",
      readinessTitle: "System Readiness State",
      readinessPass: "Ready for Dry Run (READINESS PASS)",
      readinessFail: "Preparation blocked (READINESS FAIL)",
      blockersTitle: "Activation Blockers",
      noBlockers: "No blockers detected (0 unexpected divergences, 0 violations)",
      blockersFound: "Critical blockers detected",
      fingerprintTitle: "Real Physical LevelDB Fingerprint",
      checkpointA: "Checkpoint A (Preparation)",
      checkpointB: "Checkpoint B (Final Gate)",
      manifestTitle: "Immutable Activation Manifest",
      manifestHash: "Manifest SHA-256 Digest",
      approvedCount: "Approved Entities",
      operatorIdLabel: "Operator ID",
      operatorNameLabel: "Operator Name",
      operatorRoleLabel: "Operator Role",
      scopeLabel: "Activation Scope",
      prepareAuthBtn: "1. Prepare Authorization",
      signAuthBtn: "2. Sign Authorization",
      verifySigBtn: "3. Verify Signature",
      dryRunBtn: "4. Execute Dry Run",
      simulateRollbackBtn: "5. Simulate Rollback",
      finalActivateBtn: "Activate CONTROLLED in Production (Locked)",
      signatureValid: "Valid signature bound to real storage",
      signatureInvalid: "Invalid or forged signature",
      signatureMissing: "Missing signature",
      dryRunReady: "DRY_RUN_READY: Activation simulation successfully validated",
      dryRunDenied: "DRY_RUN_DENIED: Activation denied by security gates",
      rollbackRestored: "Rollback simulated successfully — Status: SHADOW_RESTORED",
      productionLockedNotice: "CONTROLLED PRODUCTION ACTIVATION IS NOT AVAILABLE IN THIS MISSION.",
      activateScopedBtn: "6. Activate CONTROLLED (Expert Scoped)",
      scopedActiveBadge: "CONTROLLED_EXPERT_SCOPED_ACTIVE (Production Locked)"
    },
    productionReadiness: {
      sectionTitle: "15. Final Production Readiness Review (Mission 15)",
      badgeReady: "READY_FOR_PRODUCTION_AUTHORIZATION",
      badgeNotReady: "NOT_READY",
      badgeBlocked: "BLOCKED",
      productionLockedNotice: "CONTROLLED_PRODUCTION = LOCKED (No production activation in this mission)",
      operatorReviewTitle: "Human Readiness Decision Gate",
      btnApproveReadiness: "1. Approve Readiness (APPROVE_READINESS)",
      btnRejectReadiness: "2. Reject Readiness (REJECT_READINESS)",
      btnDeferReadiness: "3. Defer Readiness (DEFER_READINESS)",
      approvalNotice: "Approval certifies technical readiness for future authorization and MUST NOT activate production.",
      rejectionNotice: "Rejection blocks production progression due to non-compliance.",
      deferNotice: "Deferral keeps the system awaiting further audit.",
      securityCountersTitle: "Security Counters (23 / 23 strict)",
      fingerprintTitle: "Physical Real LevelDB Fingerprint",
      blockersTitle: "Detected Blockers",
      noBlockers: "No blockers detected (0 unexpected divergences, 0 security violations)",
      auditDimensionsTitle: "Audit of 15 Biological & System Dimensions",
      verdictLabel: "Final Readiness Verdict",
      reasonPlaceholder: "Mandatory justification for production readiness decision..."
    },
    controlledProduction: {
      sectionTitle: "16. Formal CONTROLLED_PRODUCTION Activation Authorization (Mission 16)",
      warningNotice: "Cette action active réellement CONTROLLED_PRODUCTION.",
      badgeProductionActive: "CONTROLLED_PRODUCTION_ACTIVE",
      badgeProductionLocked: "CONTROLLED_PRODUCTION_LOCKED",
      readinessApprovedLabel: "Readiness Certified (M15)",
      fingerprintALabel: "Fingerprint Checkpoint A",
      fingerprintBLabel: "Fingerprint Checkpoint B",
      manifestHashLabel: "Manifest SHA-256 Hash",
      signatureLabel: "HMAC-SHA256 Signature (11 dimensions)",
      operatorLabel: "Qualified Operator",
      scopeLabel: "Scope: CONTROLLED_PRODUCTION",
      expirationLabel: "Validity Window",
      securityCountersLabel: "Security Counters (33 strict = 0)",
      dryRunLabel: "Dry-Run Simulation (15 dimensions PASS)",
      rollbackReadinessLabel: "Rollback Reversibility Certified",
      isolationLabel: "Standard User Isolation Active",
      btnAuthorizeProduction: "1. Prepare & Sign M16 Authorization",
      btnExecuteDryRun: "2. Execute Production Dry-Run",
      btnConfirmProduction: "3. Confirm Human Activation (APPROVE_PRODUCTION)",
      btnRollbackProduction: "Emergency Rollback (Return to SHADOW / LOCKED)",
      humanConfirmationNotice: "Explicit human confirmation required. No automated bypass.",
      productionActivatedSuccess: "CONTROLLED_PRODUCTION successfully activated. Double gate & isolation verified.",
      rollbackSuccess: "Rollback successfully completed. CONTROLLED_PRODUCTION locked again.",
      errorLabel: "Control Error"
    }
  },

  ar: {
    title: "محطة التدقيق الخبير — COLOR-GENETICS-V2",
    subtitle: "فحص معمق، تفسير سببي، ومصادقة بشرية لقرارات المحرك المعياري في وضع المراقبة الظلية.",
    badgeShadow: "وضع المراقبة الظلية — مراقبة صارمة",
    controlledLockedBadge: "وضع التحكم مقفل",
    controlledLockedTooltip: "وضع CONTROLLED مقفل. يتطلب تفويضاً رسمياً في المهمة 13.",
    fundamentalRuleBanner: "ممكن بيولوجياً ≠ منصوح به جينياً ≠ موصى به للانتخاب ≠ متوافق مع معايير المعارض.",
    insufficientInfoWarning: "النتيجة مقيدة بعدم كفاية المعلومات المتاحة.",
    operatorBadge: "خبير معتمد",
    controlledChecklistTitle: "الشروط الإلزامية لتفعيل وضع التحكم مستقبلاً:",
    prerequisites: {
      expertAuditCompleted: "اكتمال تدقيق المطابقة الخبير",
      zeroUnexpectedDivergences: "انعدام التباينات غير المتوقعة (0)",
      securityPass: "اجتياز اختبارات الأمان والعدادات",
      completeData: "التحقق من اكتمال وسلامة البيانات",
      explicitAuthorization: "توقيع تفويض المشغل الصريح",
      validFingerprint: "التحقق من البصمة الفيزيائية لقاعدة LevelDB",
      rollbackAvailable: "جاهزية إجراءات التراجع العكسي الآمن",
      e2ePass: "اجتياز كامل اختبارات Playwright E2E"
    },
    sections: {
      context: "أ. السياق والمواصفات",
      parents: "ب. الطيور والآباء",
      canonicalData: "ج. البيانات المعيارية المدخلة",
      genotype: "د. التحليل الوراثي والنمط الجيني",
      mutations: "هـ. دليل الطفرات الجينية",
      appliedRules: "و. القواعد الحيوية والوراثية المطبقة",
      interactions: "ز. التفاعلات الجينية والتفوق الجيني",
      risks: "ح. القتالية والمخاطر الصحية",
      standard: "ط. مطابقة المعايير الرسمية COM / OMJ",
      selection: "ي. توصيات الانتخاب والتربية",
      evidence: "ك. الأدلة العلمية والمصادر الموثقة",
      explanation: "ل. التفسير السببي الهيكلي",
      legacyComparison: "م. المقارنة التفصيلية بين القديم والجديد",
      humanValidation: "ن. المصادقة البشرية والقرار الخبير"
    },
    fields: {
      speciesId: "معرف النوع",
      scientificName: "الاسم العلمي",
      commonName: "الاسم الشائع",
      breed: "السلالة / الصنف",
      breedingObjective: "هدف التربية",
      selectionObjective: "هدف الانتخاب",
      context: "سياق الحساب",
      evaluationDate: "تاريخ التقييم",
      contractVersion: "إصدار العقد",
      catalogVersion: "إصدار الكتالوج",
      calculatorVersion: "إصدار المحرك",
      phenotype: "النمط الظاهري المرصود",
      genotype: "النمط الوراثي (الجينوتيبي)",
      carrierStatus: "حالة الحمل الجيني",
      sex: "الجنس",
      age: "العمر",
      source: "مصدر البيانات",
      epistemicStatus: "الحالة المعرفية",
      confidence: "مستوى الثقة",
      provenance: "المصدر الموثق",
      mutationId: "رمز الطفرة",
      mutationName: "اسم الطفرة",
      inheritance: "نمط التوريث",
      locus: "الموقع الصبغي (Locus)",
      alleles: "الأليلات المحددة",
      sexLinked: "مرتبط بالجنس",
      dominance: "درجة السيادة",
      calculatorStatus: "حالة الحاسبة",
      evidenceIds: "مراجع الأدلة",
      ruleId: "معرف القاعدة",
      ruleType: "نوع القاعدة",
      condition: "شرط التفعيل",
      outcome: "النتيجة / القرار",
      reason: "التبرير الحيوي",
      humanReview: "مراجعة بشرية مطلوبة",
      embryonicMortality: "وفيات الأجنة",
      welfareRisk: "المخاطر الصحية ورفاهية الطائر",
      standardImpact: "الأثر على المعيار",
      selectionRecommendation: "نصيحة الانتخاب",
      geneticCompatibility: "التوافق الوراثي",
      fertilityStatus: "حالة الخصوبة",
      evidenceLevel: "مستوى الإثبات",
      sourceName: "المصدر / المرجع العلمي",
      claim: "الدعوى العلمية",
      limitations: "القيود الموثقة",
      legacyValue: "قيمة النظام القديم",
      v2Value: "قيمة المحرك المعياري V2",
      divergenceType: "تصنيف التباين",
      unknownSpecies: "UNKNOWN"
    },
    actions: {
      review: "وضع قيد المراجعة (REVIEW)",
      accept: "اعتماد التفسير (ACCEPT)",
      reject: "رفض التفسير (REJECT)",
      defer: "تأجيل القرار (DEFER)",
      submitReasonPlaceholder: "أدخل التبرير الخبير المفصل لقرار التدقيق...",
      saveDecision: "تسجيل في سجل التدقيق",
      operatorNote: "ملاحظات الخبير",
      historyTitle: "سجل القرارات التاريخي القابل للتتبع",
      noHistory: "لم يتم تسجيل أي قرار بشري لهذا الملف.",
      dossierSelect: "اختر ملف التدقيق:"
    },
    statuses: {
      notReviewed: "غير مدقق",
      underReview: "قيد التدقيق",
      accepted: "تم اعتماد التفسير",
      rejected: "تم رفض التفسير",
      deferred: "تم تأجيل التدقيق",
      conflictReview: "مراجعة بيولوجية مطلوبة",
      confirmed: "مؤكد",
      conditional: "مشروط",
      underStudy: "قيد الدراسة",
      conflicting: "متضارب",
      insufficient: "معلومات غير كافية",
      expectedDivergence: "تباين متوقع",
      legacyDefect: "عيب في النظام القديم تم إصلاحه",
      canonicalImprovement: "تحسين معياري",
      unexpectedDivergence: "تباين غير متوقع",
      noDivergence: "تطابق تام",
      humanReviewRequired: "تدخل بشري إلزامي"
    },
    explanationKeys: {
      whatWasAnalyzed: "1. ما تم تحليله",
      whatIsKnown: "2. ما تم إثباته بيولوجياً",
      whatIsUnknown: "3. ما لا يزال مجهولاً",
      rulesUsed: "4. القواعد المعيارية المطبقة",
      whyThisResult: "5. التبرير السببي للقرار",
      risks: "6. مخاطر القتالية والصحة",
      standardImpact: "7. الأثر على معايير المعارض",
      selectionImpact: "8. الأثر على السلالة والانتخاب",
      evidence: "9. الأدلة العلمية والمراجع",
      limitations: "10. الحدود المعرفية والفرضيات",
      humanReview: "11. ضرورة المراجعة البشرية الخبيرة"
    },
    controlledPreparation: {
      sectionTitle: "أداة التحضير للوضع المنضبط (CONTROLLED)",
      lockedBadge: "الوضع المنضبط — مقفل",
      lockedBanner: "الوضع المنضبط مقفل رسميًا ولا يمكن تفعيله في بيئة الإنتاج.",
      readinessTitle: "حالة جاهزية النظام",
      readinessPass: "جاهز للمحاكاة (READINESS PASS)",
      readinessFail: "التحضير محظور (READINESS FAIL)",
      blockersTitle: "عوائق التفعيل",
      noBlockers: "لم يتم اكتشاف أي عوائق (0 تباين غير متوقع، 0 انتهاك)",
      blockersFound: "تم اكتشاف عوائق حرجة",
      fingerprintTitle: "البصمة الفعلية لقاعدة LevelDB",
      checkpointA: "نقطة التحقق أ (التحضير)",
      checkpointB: "نقطة التحقق ب (البوابة النهائية)",
      manifestTitle: "بيان التفعيل غير القابل للتغيير",
      manifestHash: "بصمة SHA-256 لبيان التفعيل",
      approvedCount: "الكيانات المعتمدة",
      operatorIdLabel: "معرف المشغل",
      operatorNameLabel: "اسم المشغل",
      operatorRoleLabel: "دور المشغل",
      scopeLabel: "نطاق التفعيل",
      prepareAuthBtn: "1. إعداد التفويض",
      signAuthBtn: "2. توقيع التفويض",
      verifySigBtn: "3. التحقق من التوقيع",
      dryRunBtn: "4. تشغيل المحاكاة التجريبية (Dry Run)",
      simulateRollbackBtn: "5. محاكاة التراجع (Rollback)",
      finalActivateBtn: "تفعيل الوضع المنضبط في الإنتاج (مقفل)",
      signatureValid: "توقيع صالح ومرتبط بالتخزين الفعلي",
      signatureInvalid: "توقيع غير صالح أو مزور",
      signatureMissing: "توقيع مفقود",
      dryRunReady: "DRY_RUN_READY: تمت محاكاة التفعيل بنجاح",
      dryRunDenied: "DRY_RUN_DENIED: تم رفض التفعيل من بوابات الأمان",
      rollbackRestored: "تمت محاكاة التراجع بنجاح — الحالة: SHADOW_RESTORED",
      productionLockedNotice: "CONTROLLED PRODUCTION ACTIVATION IS NOT AVAILABLE IN THIS MISSION.",
      activateScopedBtn: "6. تفعيل الوضع المنضبط المقيد بالخبراء (Expert Scoped)",
      scopedActiveBadge: "CONTROLLED_EXPERT_SCOPED_ACTIVE (الإنتاج مقفل)"
    },
    productionReadiness: {
      sectionTitle: "15. المراجعة النهائية للجاهزية للإنتاج (المهمة 15)",
      badgeReady: "READY_FOR_PRODUCTION_AUTHORIZATION",
      badgeNotReady: "NOT_READY",
      badgeBlocked: "BLOCKED",
      productionLockedNotice: "CONTROLLED_PRODUCTION = LOCKED (لا يوجد تفعيل للإنتاج في هذه المهمة)",
      operatorReviewTitle: "بوابة القرار البشري للجاهزية",
      btnApproveReadiness: "1. اعتماد الجاهزية (APPROVE_READINESS)",
      btnRejectReadiness: "2. رفض الجاهزية (REJECT_READINESS)",
      btnDeferReadiness: "3. تأجيل الجاهزية (DEFER_READINESS)",
      approvalNotice: "الاعتماد يشهد فقط بالجاهزية الفنية لموافقة مستقبلية ولا يقوم إطلاقاً بتفعيل الإنتاج.",
      rejectionNotice: "الرفض يحظر الانتقال إلى الإنتاج لعدم المطابقة.",
      deferNotice: "التأجيل يبقي النظام في انتظار تدقيق تكميلي.",
      securityCountersTitle: "عدادات الأمان (23 / 23 صارمة)",
      fingerprintTitle: "البصمة المادية الحقيقية لـ LevelDB",
      blockersTitle: "العوائق المكتشفة",
      noBlockers: "لم يتم اكتشاف أي عوائق (0 تباينات غير متوقعة، 0 انتهاكات أمنية)",
      auditDimensionsTitle: "تدقيق الأبعاد البيولوجية والنظامية الـ 15",
      verdictLabel: "الحكم النهائي للجاهزية",
      reasonPlaceholder: "مبرر إلزامي لقرار الجاهزية للإنتاج..."
    },
    controlledProduction: {
      sectionTitle: "16. التفويض الرسمي لتفعيل CONTROLLED_PRODUCTION (المهمة 16)",
      warningNotice: "Cette action active réellement CONTROLLED_PRODUCTION.",
      badgeProductionActive: "CONTROLLED_PRODUCTION_ACTIVE",
      badgeProductionLocked: "CONTROLLED_PRODUCTION_LOCKED",
      readinessApprovedLabel: "الجاهزية المعتمدة (المهمة 15)",
      fingerprintALabel: "بصمة نقطة التفتيش أ",
      fingerprintBLabel: "بصمة نقطة التفتيش ب",
      manifestHashLabel: "بصمة بيان التفعيل SHA-256",
      signatureLabel: "توقيع HMAC-SHA256 (11 بُعداً)",
      operatorLabel: "المشغل المؤهل",
      scopeLabel: "النطاق: CONTROLLED_PRODUCTION",
      expirationLabel: "فترة الصلاحية",
      securityCountersLabel: "عدادات الأمان (33 صارمة = 0)",
      dryRunLabel: "محاكاة التشغيل التجريبي (15 بُعداً ناجحة)",
      rollbackReadinessLabel: "جاهزية التراجع العكسي معتمدة",
      isolationLabel: "عزل المستخدمين العاديين نشط",
      btnAuthorizeProduction: "1. إعداد وتوقيع تفويض المهمة 16",
      btnExecuteDryRun: "2. تشغيل المحاكاة التجريبية للإنتاج",
      btnConfirmProduction: "3. تأكيد التفعيل البشري (APPROVE_PRODUCTION)",
      btnRollbackProduction: "تراجع طارئ (العودة إلى SHADOW / LOCKED)",
      humanConfirmationNotice: "يلزم تأكيد بشري صريح. لا يوجد تجاوز تلقائي.",
      productionActivatedSuccess: "تم تفعيل CONTROLLED_PRODUCTION بنجاح. البوابة المزدوجة والعزل معتمدان.",
      rollbackSuccess: "تم التراجع بنجاح. تم قفل CONTROLLED_PRODUCTION مجدداً.",
      errorLabel: "خطأ في التحكم"
    }
  },

  es: {
    title: "Puesto de Auditoría Experta — COLOR-GENETICS-V2",
    subtitle: "Inspección detallada, explicación causal y validación humana de decisiones canónicas Shadow.",
    badgeShadow: "MODO SHADOW — OBSERVACIÓN ESTRICTA",
    controlledLockedBadge: "MODO CONTROLLED BLOQUEADO",
    controlledLockedTooltip: "Modo CONTROLLED bloqueado. Requiere autorización formal Misión 13.",
    fundamentalRuleBanner: "Biológicamente posible ≠ genéticamente aconsejable ≠ recomendado para la selección ≠ compatible con un estándar de exposición.",
    insufficientInfoWarning: "Resultado limitado por información insuficiente.",
    operatorBadge: "Operador Cualificado",
    controlledChecklistTitle: "Condiciones requeridas para la futura activación controlada:",
    prerequisites: {
      expertAuditCompleted: "Auditoría experta de conformidad finalizada",
      zeroUnexpectedDivergences: "Divergencias inesperadas = 0",
      securityPass: "Garantías de seguridad y contadores = PASS",
      completeData: "Integridad y completitud de datos verificadas",
      explicitAuthorization: "Autorización explícita del operador firmada",
      validFingerprint: "Fingerprint físico LevelDB verificado",
      rollbackAvailable: "Procedimiento de reversión reversible probado",
      e2ePass: "Pruebas Playwright E2E aprobadas"
    },
    sections: {
      context: "A. Contexto y Especificaciones",
      parents: "B. Aves y Progenitores",
      canonicalData: "C. Datos Canónicos de Entrada",
      genotype: "D. Análisis Genotípico",
      mutations: "E. Catálogo de Mutaciones",
      appliedRules: "F. Reglas Biológicas y Genéticas Aplicadas",
      interactions: "G. Interacciones Génicas y Epistasis",
      risks: "H. Letalidad y Riesgos Sanitarios",
      standard: "I. Conformidad Estándar COM / OMJ",
      selection: "J. Recomendaciones de Selección",
      evidence: "K. Evidencias Científicas y Procedencia",
      explanation: "L. Explicación Causal Estructurada",
      legacyComparison: "M. Comparación Detallada Legacy vs V2",
      humanValidation: "N. Validación Humana y Decisión Experta"
    },
    fields: {
      speciesId: "Identificador de Especie",
      scientificName: "Nombre Científico",
      commonName: "Nombre Común",
      breed: "Raza / Variedad",
      breedingObjective: "Objetivo de Cría",
      selectionObjective: "Objetivo de Selección",
      context: "Contexto de Cálculo",
      evaluationDate: "Fecha de Evaluación",
      contractVersion: "Versión del Contrato",
      catalogVersion: "Versión del Catálogo",
      calculatorVersion: "Versión del Motor",
      phenotype: "Fenotipo Observado",
      genotype: "Genotipo",
      carrierStatus: "Estado Portador",
      sex: "Sexo",
      age: "Edad",
      source: "Fuente de Datos",
      epistemicStatus: "Estado Epistémico",
      confidence: "Nivel de Confianza",
      provenance: "Procedencia Trazable",
      mutationId: "Código de Mutación",
      mutationName: "Nombre de Mutación",
      inheritance: "Modo de Herencia",
      locus: "Locus Cromosómico",
      alleles: "Alelos Reconocidos",
      sexLinked: "Ligado al Sexo",
      dominance: "Grado de Dominancia",
      calculatorStatus: "Estado en Calculadora",
      evidenceIds: "Referencias de Evidencia",
      ruleId: "Identificador de Regla",
      ruleType: "Tipo de Regla",
      condition: "Condición Disparadora",
      outcome: "Resultado / Decisión",
      reason: "Justificación Biológica",
      humanReview: "Revisión Humana Requerida",
      embryonicMortality: "Mortalidad Embrionaria",
      welfareRisk: "Riesgo Sanitario / Bienestar",
      standardImpact: "Impacto en Estándar",
      selectionRecommendation: "Consejo de Selección",
      geneticCompatibility: "Compatibilidad Genética",
      fertilityStatus: "Estado de Fertilidad",
      evidenceLevel: "Nivel de Evidencia",
      sourceName: "Fuente / Publicación",
      claim: "Afirmación Científica",
      limitations: "Limitaciones Documentadas",
      legacyValue: "Valor Legacy Actual",
      v2Value: "Valor Canónico V2",
      divergenceType: "Clasificación de Divergencia",
      unknownSpecies: "UNKNOWN"
    },
    actions: {
      review: "Marcar para Revisión (REVIEW)",
      accept: "Aceptar Interpretación (ACCEPT)",
      reject: "Rechazar Interpretación (REJECT)",
      defer: "Aplazar Decisión (DEFER)",
      submitReasonPlaceholder: "Ingrese la justificación detallada de la decisión de auditoría experta...",
      saveDecision: "Registrar en Diario de Auditoría",
      operatorNote: "Justificación del Operador",
      historyTitle: "Historial Trazable de Decisiones",
      noHistory: "No hay decisiones humanas registradas para este expediente.",
      dossierSelect: "Seleccionar un expediente:"
    },
    statuses: {
      notReviewed: "No Auditado",
      underReview: "En Revisión",
      accepted: "Interpretación Aceptada",
      rejected: "Interpretación Rechazada",
      deferred: "Auditoría Aplazada",
      conflictReview: "Revisión Biológica Requerida",
      confirmed: "Confirmado",
      conditional: "Condicional",
      underStudy: "En Estudio",
      conflicting: "Conflictivo",
      insufficient: "Información Insuficiente",
      expectedDivergence: "Divergencia Esperada",
      legacyDefect: "Defecto Legacy Corregido",
      canonicalImprovement: "Mejora Canónica",
      unexpectedDivergence: "Divergencia Inesperada",
      noDivergence: "Concordancia Total",
      humanReviewRequired: "INTERVENCIÓN HUMANA REQUERIDA"
    },
    explanationKeys: {
      whatWasAnalyzed: "1. Lo que fue analizado",
      whatIsKnown: "2. Lo que está biológicamente establecido",
      whatIsUnknown: "3. Lo que permanece desconocido",
      rulesUsed: "4. Reglas canónicas aplicadas",
      whyThisResult: "5. Justificación causal de la decisión",
      risks: "6. Riesgos de letalidad y sanitarios",
      standardImpact: "7. Impacto en estándar de exposición",
      selectionImpact: "8. Impacto en la estirpe y selección",
      evidence: "9. Evidencias científicas y citas",
      limitations: "10. Limitaciones epistémicas e hipótesis",
      humanReview: "11. Necesidad de revisión humana experta"
    },
    controlledPreparation: {
      sectionTitle: "Herramienta de Preparación CONTROLLED",
      lockedBadge: "MODO CONTROLLED — BLOQUEADO",
      lockedBanner: "El modo CONTROLLED está formalmente bloqueado y no se puede activar en producción.",
      readinessTitle: "Estado de preparación del sistema",
      readinessPass: "Listo para simulación (READINESS PASS)",
      readinessFail: "Preparación bloqueada (READINESS FAIL)",
      blockersTitle: "Bloqueadores de activación",
      noBlockers: "Ningún bloqueador detectado (0 divergencias inesperadas, 0 violaciones)",
      blockersFound: "Bloqueadores críticos detectados",
      fingerprintTitle: "Huella física real de LevelDB",
      checkpointA: "Punto de control A (Preparación)",
      checkpointB: "Punto de control B (Puerta Final)",
      manifestTitle: "Manifiesto de activación inmutable",
      manifestHash: "Huella SHA-256 del manifiesto",
      approvedCount: "Entidades aprobadas",
      operatorIdLabel: "ID del Operador",
      operatorNameLabel: "Nombre del Operador",
      operatorRoleLabel: "Rol del Operador",
      scopeLabel: "Alcance de activación",
      prepareAuthBtn: "1. Preparar Autorización",
      signAuthBtn: "2. Firmar Autorización",
      verifySigBtn: "3. Verificar Firma",
      dryRunBtn: "4. Ejecutar Dry Run",
      simulateRollbackBtn: "5. Simular Rollback",
      finalActivateBtn: "Activar CONTROLLED en Producción (Bloqueado)",
      signatureValid: "Firma válida vinculada al almacenamiento real",
      signatureInvalid: "Firma inválida o falsificada",
      signatureMissing: "Firma ausente",
      dryRunReady: "DRY_RUN_READY: Simulación de activación validada con éxito",
      dryRunDenied: "DRY_RUN_DENIED: Activación denegada por puertas de seguridad",
      rollbackRestored: "Rollback simulado con éxito — Estado: SHADOW_RESTORED",
      productionLockedNotice: "CONTROLLED PRODUCTION ACTIVATION IS NOT AVAILABLE IN THIS MISSION.",
      activateScopedBtn: "6. Activar CONTROLLED (Expert Scoped)",
      scopedActiveBadge: "CONTROLLED_EXPERT_SCOPED_ACTIVE (Producción Bloqueada)"
    },
    productionReadiness: {
      sectionTitle: "15. Revisión Final de Preparación para Producción (Misión 15)",
      badgeReady: "READY_FOR_PRODUCTION_AUTHORIZATION",
      badgeNotReady: "NOT_READY",
      badgeBlocked: "BLOCKED",
      productionLockedNotice: "CONTROLLED_PRODUCTION = LOCKED (Sin activación en producción en esta misión)",
      operatorReviewTitle: "Decisión Humana de Preparación",
      btnApproveReadiness: "1. Aprobar Preparación (APPROVE_READINESS)",
      btnRejectReadiness: "2. Rechazar Preparación (REJECT_READINESS)",
      btnDeferReadiness: "3. Aplazar Preparación (DEFER_READINESS)",
      approvalNotice: "La aprobación certifica la preparación técnica para una futura autorización y NO DEBE activar la producción.",
      rejectionNotice: "El rechazo bloquea el paso a producción por no conformidad.",
      deferNotice: "El aplazamiento mantiene el sistema a la espera de auditoría complementaria.",
      securityCountersTitle: "Contadores de Seguridad (23 / 23 estrictos)",
      fingerprintTitle: "Huella Física Real de LevelDB",
      blockersTitle: "Bloqueadores Detectados",
      noBlockers: "No se detectaron bloqueadores (0 divergencias inesperadas, 0 violaciones de seguridad)",
      auditDimensionsTitle: "Auditoría de las 15 Dimensiones Biológicas y de Sistemas",
      verdictLabel: "Veredicto Final de Preparación",
      reasonPlaceholder: "Justificación obligatoria de la decisión de preparación..."
    },
    controlledProduction: {
      sectionTitle: "16. Autorización Formal de Activación CONTROLLED_PRODUCTION (Misión 16)",
      warningNotice: "Cette action active réellement CONTROLLED_PRODUCTION.",
      badgeProductionActive: "CONTROLLED_PRODUCTION_ACTIVE",
      badgeProductionLocked: "CONTROLLED_PRODUCTION_LOCKED",
      readinessApprovedLabel: "Preparación Certificada (M15)",
      fingerprintALabel: "Fingerprint Punto de Control A",
      fingerprintBLabel: "Fingerprint Punto de Control B",
      manifestHashLabel: "Hash SHA-256 del Manifiesto",
      signatureLabel: "Firma HMAC-SHA256 (11 dimensiones)",
      operatorLabel: "Operador Calificado",
      scopeLabel: "Ámbito: CONTROLLED_PRODUCTION",
      expirationLabel: "Período de Validez",
      securityCountersLabel: "Contadores de Seguridad (33 estrictos = 0)",
      dryRunLabel: "Simulación Dry-Run (15 dimensiones PASS)",
      rollbackReadinessLabel: "Reversibilidad de Rollback Certificada",
      isolationLabel: "Aislamiento de Usuarios Estándar Activo",
      btnAuthorizeProduction: "1. Preparar y Firmar Autorización M16",
      btnExecuteDryRun: "2. Ejecutar Dry-Run de Producción",
      btnConfirmProduction: "3. Confirmar Activación Humana (APPROVE_PRODUCTION)",
      btnRollbackProduction: "Rollback de Emergencia (Regreso a SHADOW / LOCKED)",
      humanConfirmationNotice: "Acción humana explícita obligatoria. Sin auto-disparo.",
      productionActivatedSuccess: "CONTROLLED_PRODUCTION activado con éxito. Doble gate y aislamiento validados.",
      rollbackSuccess: "Rollback ejecutado con éxito. CONTROLLED_PRODUCTION bloqueado nuevamente.",
      errorLabel: "Error de control"
    }
  },

  it: {
    title: "Postazione di Audit Esperto — COLOR-GENETICS-V2",
    subtitle: "Ispezione approfondita, spiegazione causale e convalida umana delle decisioni canoniche Shadow.",
    badgeShadow: "MODO SHADOW — OSSERVAZIONE STRETTA",
    controlledLockedBadge: "MODALITÀ CONTROLLED BLOCCATA",
    controlledLockedTooltip: "Modalità CONTROLLED bloccata. Richiede autorizzazione formale Missione 13.",
    fundamentalRuleBanner: "Biologicamente possibile ≠ geneticamente consigliato ≠ raccomandato per la selezione ≠ compatibile con uno standard di esposizione.",
    insufficientInfoWarning: "Risultato limitato da informazioni insufficienti.",
    operatorBadge: "Operatore Qualificato",
    controlledChecklistTitle: "Condizioni richieste per la futura attivazione controllata:",
    prerequisites: {
      expertAuditCompleted: "Audit esperto di conformità completato",
      zeroUnexpectedDivergences: "Divergenze inattese = 0",
      securityPass: "Garanzie di sicurezza e contatori = PASS",
      completeData: "Integrità e completezza dei dati verificate",
      explicitAuthorization: "Autorizzazione esplicita dell'operatore firmata",
      validFingerprint: "Fingerprint fisico LevelDB verificato",
      rollbackAvailable: "Procedura di rollback reversibile testata",
      e2ePass: "Test Playwright E2E superati"
    },
    sections: {
      context: "A. Contesto e Specifiche",
      parents: "B. Uccelli e Genitori",
      canonicalData: "C. Dati Canonici di Ingresso",
      genotype: "D. Analisi Genotipica",
      mutations: "E. Catalogo delle Mutazioni",
      appliedRules: "F. Regole Biologiche e Genetiche Applicate",
      interactions: "G. Interazioni Geniche ed Epistasi",
      risks: "H. Letalità e Rischi Sanitari",
      standard: "I. Conformità Standard COM / OMJ",
      selection: "J. Raccomandazioni di Selezione",
      evidence: "K. Prove Scientifiche e Provenienza",
      explanation: "L. Spiegazione Causale Strutturata",
      legacyComparison: "M. Confronto Dettagliato Legacy vs V2",
      humanValidation: "N. Convalida Umana e Decisione Esperta"
    },
    fields: {
      speciesId: "Identificativo Specie",
      scientificName: "Nome Scientifico",
      commonName: "Nome Comune",
      breed: "Razza / Varietà",
      breedingObjective: "Obiettivo di Allevamento",
      selectionObjective: "Obiettivo di Selezione",
      context: "Contesto di Calcolo",
      evaluationDate: "Data di Valutazione",
      contractVersion: "Versione Contratto",
      catalogVersion: "Versione Catalogo",
      calculatorVersion: "Versione Motore",
      phenotype: "Fenotipo Osservato",
      genotype: "Genotipo",
      carrierStatus: "Stato Portatore",
      sex: "Sesso",
      age: "Età",
      source: "Fonte Dati",
      epistemicStatus: "Stato Epistemico",
      confidence: "Livello di Fiducia",
      provenance: "Provenienza Tracciabile",
      mutationId: "Codice Mutazione",
      mutationName: "Nome Mutazione",
      inheritance: "Modalità di Trasmissione",
      locus: "Locus Cromosomico",
      alleles: "Alleli Riconosciuti",
      sexLinked: "Legato al Sesso",
      dominance: "Grado di Dominanza",
      calculatorStatus: "Stato Calcolatore",
      evidenceIds: "Riferimenti di Prova",
      ruleId: "Identificativo Regola",
      ruleType: "Tipo di Regola",
      condition: "Condizione Attivante",
      outcome: "Esito / Decisione",
      reason: "Giustificazione Biologica",
      humanReview: "Revisione Umana Richiesta",
      embryonicMortality: "Mortalità Embrionale",
      welfareRisk: "Rischio Sanitario / Benessere",
      standardImpact: "Impatto Standard",
      selectionRecommendation: "Consiglio di Selezione",
      geneticCompatibility: "Compatibilità Genetica",
      fertilityStatus: "Stato di Fertilità",
      evidenceLevel: "Livello di Prova",
      sourceName: "Fonte / Pubblicazione",
      claim: "Affermazione Scientifica",
      limitations: "Limitazioni Documentate",
      legacyValue: "Valore Legacy Attuale",
      v2Value: "Valore Canonico V2",
      divergenceType: "Classificazione Divergenza",
      unknownSpecies: "UNKNOWN"
    },
    actions: {
      review: "Contrassegna per Revisione (REVIEW)",
      accept: "Accetta Interpretazione (ACCEPT)",
      reject: "Rifiuta Interpretazione (REJECT)",
      defer: "Differisci Decisione (DEFER)",
      submitReasonPlaceholder: "Inserisci la giustificazione dettagliata della decisione di audit...",
      saveDecision: "Registra nel Registro Audit",
      operatorNote: "Giustificazione Operatore",
      historyTitle: "Cronologia Tracciabile delle Decisioni",
      noHistory: "Nessuna decisione umana registrata per questo fascicolo.",
      dossierSelect: "Seleziona un fascicolo:"
    },
    statuses: {
      notReviewed: "Non Esaminato",
      underReview: "In Esame",
      accepted: "Interpretazione Accettata",
      rejected: "Interpretazione Rifiutata",
      deferred: "Audit Differito",
      conflictReview: "Revisione Biologica Richiesta",
      confirmed: "Confermato",
      conditional: "Condizionale",
      underStudy: "Sotto Studio",
      conflicting: "Conflittuale",
      insufficient: "Informazioni Insufficienti",
      expectedDivergence: "Divergenza Attesa",
      legacyDefect: "Difetto Legacy Corretto",
      canonicalImprovement: "Miglioramento Canonico",
      unexpectedDivergence: "Divergenza Inattesa",
      noDivergence: "Piena Corrispondenza",
      humanReviewRequired: "INTERVENTO UMANO RICHIESTO"
    },
    explanationKeys: {
      whatWasAnalyzed: "1. Ciò che è stato analizzato",
      whatIsKnown: "2. Ciò che è biologicamente accertato",
      whatIsUnknown: "3. Ciò che resta sconosciuto",
      rulesUsed: "4. Regole canoniche applicate",
      whyThisResult: "5. Giustificazione causale della decisione",
      risks: "6. Rischi di letalità e sanitari",
      standardImpact: "7. Impatto sullo standard di esposizione",
      selectionImpact: "8. Impatto sul ceppo e selezione",
      evidence: "9. Prove scientifiche e citazioni",
      limitations: "10. Limitazioni epistemiche e ipotesi",
      humanReview: "11. Necessità di revisione umana esperta"
    },
    controlledPreparation: {
      sectionTitle: "Strumento di Preparazione CONTROLLED",
      lockedBadge: "MODO CONTROLLED — BLOCCATO",
      lockedBanner: "La modalità CONTROLLED è formalmente bloccata e non può essere attivata in produzione.",
      readinessTitle: "Stato di prontezza del sistema",
      readinessPass: "Pronto per la simulazione (READINESS PASS)",
      readinessFail: "Preparazione bloccata (READINESS FAIL)",
      blockersTitle: "Bloccanti di attivazione",
      noBlockers: "Nessun bloccante rilevato (0 divergenze impreviste, 0 violazioni)",
      blockersFound: "Bloccanti critici rilevati",
      fingerprintTitle: "Impronta fisica reale di LevelDB",
      checkpointA: "Checkpoint A (Preparazione)",
      checkpointB: "Checkpoint B (Porta Finale)",
      manifestTitle: "Manifest di attivazione immutabile",
      manifestHash: "Impronta SHA-256 del manifest",
      approvedCount: "Entità approvate",
      operatorIdLabel: "ID Operatore",
      operatorNameLabel: "Nome Operatore",
      operatorRoleLabel: "Ruolo Operatore",
      scopeLabel: "Ambito di attivazione",
      prepareAuthBtn: "1. Prepara Autorizzazione",
      signAuthBtn: "2. Firma Autorizzazione",
      verifySigBtn: "3. Verifica Firma",
      dryRunBtn: "4. Esegui Dry Run",
      simulateRollbackBtn: "5. Simula Rollback",
      finalActivateBtn: "Attiva CONTROLLED in Produzione (Bloccato)",
      signatureValid: "Firma valida collegata all'archiviazione reale",
      signatureInvalid: "Firma non valida o contraffatta",
      signatureMissing: "Firma mancante",
      dryRunReady: "DRY_RUN_READY: Simulazione di attivazione convalidata con successo",
      dryRunDenied: "DRY_RUN_DENIED: Attivazione negata dalle porte di sicurezza",
      rollbackRestored: "Rollback simulato con successo — Stato: SHADOW_RESTORED",
      productionLockedNotice: "CONTROLLED PRODUCTION ACTIVATION IS NOT AVAILABLE IN THIS MISSION.",
      activateScopedBtn: "6. Attiva CONTROLLED (Expert Scoped)",
      scopedActiveBadge: "CONTROLLED_EXPERT_SCOPED_ACTIVE (Produzione Bloccata)"
    },
    productionReadiness: {
      sectionTitle: "15. Revisione Finale di Prontezza per la Produzione (Missione 15)",
      badgeReady: "READY_FOR_PRODUCTION_AUTHORIZATION",
      badgeNotReady: "NOT_READY",
      badgeBlocked: "BLOCKED",
      productionLockedNotice: "CONTROLLED_PRODUCTION = LOCKED (Nessuna attivazione in produzione in questa missione)",
      operatorReviewTitle: "Decisione Umana di Prontezza",
      btnApproveReadiness: "1. Approva Prontezza (APPROVE_READINESS)",
      btnRejectReadiness: "2. Rifiuta Prontezza (REJECT_READINESS)",
      btnDeferReadiness: "3. Rinvia Prontezza (DEFER_READINESS)",
      approvalNotice: "L'approvazione certifica la prontezza tecnica per una futura autorizzazione e NON DEVE attivare la produzione.",
      rejectionNotice: "Il rifiuto blocca il passaggio in produzione per non conformità.",
      deferNotice: "Il rinvio mantiene il sistema in attesa di ulteriore audit.",
      securityCountersTitle: "Contatori di Sicurezza (23 / 23 rigidi)",
      fingerprintTitle: "Impronta Fisica Reale di LevelDB",
      blockersTitle: "Bloccanti Rilevati",
      noBlockers: "Nessun bloccante rilevato (0 divergenze impreviste, 0 violazioni di sicurezza)",
      auditDimensionsTitle: "Audit delle 15 Dimensioni Biologiche e di Sistema",
      verdictLabel: "Verdetto Finale di Prontezza",
      reasonPlaceholder: "Giustificazione obbligatoria per la decisione di prontezza..."
    },
    controlledProduction: {
      sectionTitle: "16. Autorizzazione Formale di Attivazione CONTROLLED_PRODUCTION (Missione 16)",
      warningNotice: "Cette action active réellement CONTROLLED_PRODUCTION.",
      badgeProductionActive: "CONTROLLED_PRODUCTION_ACTIVE",
      badgeProductionLocked: "CONTROLLED_PRODUCTION_LOCKED",
      readinessApprovedLabel: "Prontezza Certificata (M15)",
      fingerprintALabel: "Fingerprint Punto di Controllo A",
      fingerprintBLabel: "Fingerprint Punto di Controllo B",
      manifestHashLabel: "Hash SHA-256 del Manifesto",
      signatureLabel: "Firma HMAC-SHA256 (11 dimensioni)",
      operatorLabel: "Operatore Qualificato",
      scopeLabel: "Ambito: CONTROLLED_PRODUCTION",
      expirationLabel: "Periodo di Validità",
      securityCountersLabel: "Contatori di Sicurezza (33 rigidi = 0)",
      dryRunLabel: "Simulazione Dry-Run (15 dimensioni PASS)",
      rollbackReadinessLabel: "Reversibilità Rollback Certificata",
      isolationLabel: "Isolamento Utenti Standard Attivo",
      btnAuthorizeProduction: "1. Prepara e Firma Autorizzazione M16",
      btnExecuteDryRun: "2. Esegui Dry-Run di Produzione",
      btnConfirmProduction: "3. Conferma Attivazione Umana (APPROVE_PRODUCTION)",
      btnRollbackProduction: "Rollback di Emergenza (Ritorno a SHADOW / LOCKED)",
      humanConfirmationNotice: "Azione umana esplicita richiesta. Nessun bypass automatico.",
      productionActivatedSuccess: "CONTROLLED_PRODUCTION attivato con successo. Doppia porta e isolamento verificati.",
      rollbackSuccess: "Rollback eseguito con successo. CONTROLLED_PRODUCTION bloccato di nuovo.",
      errorLabel: "Errore di controllo"
    }
  }
};

