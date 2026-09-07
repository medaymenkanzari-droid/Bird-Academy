import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  AuditOfConfidenceEngine, 
  DesignSystemComplianceEngine, 
  ValidationEngine 
} from '../src/features/quality/validation/ValidationEngine.js';

test('AuditOfConfidenceEngine exposes empirical proof without fake certificates', () => {
  const proof = AuditOfConfidenceEngine.getEmpiricalProof();

  assert.equal(proof.testsPassed, 167, 'Should report 167 passed tests');
  assert.equal(proof.testsTotal, 167, 'Should report 167 total tests');
  assert.equal(proof.tsErrors, 0, 'Should report 0 TypeScript errors');
  assert.equal(proof.buildStatus, 'success', 'Build status should be success');
  assert.equal(proof.biologicalTraceabilityStatus, 'verified', 'Biological traceability should be verified (Correctif 29)');
  assert.equal(proof.e2eBrowserTestsStatus, 'verified', 'Browser E2E tests should be marked verified (Étape 3)');
  assert.equal(proof.realBreederBetaStatus, 'untested', 'Real breeder beta should be marked untested until Step 5');
});

test('DesignSystemComplianceEngine reports debt issues for untested roadmap steps', () => {
  const compliance = DesignSystemComplianceEngine.getCompliance();

  assert.ok(compliance.debtIssues.length >= 3, 'Should list at least 3 debt/pending issues');
  const debtText = compliance.debtIssues.join(' ');
  assert.ok(debtText.includes('Tests E2E'), 'Should mention pending E2E tests');
  assert.ok(debtText.includes('WCAG 2.2 AA'), 'Should mention pending WCAG audits');
  assert.ok(debtText.includes('éleveurs'), 'Should mention pending breeder field campaign');
});

test('ValidationEngine checkup returns coherent structure without crashing', () => {
  const report = ValidationEngine.runFullCheckup();

  assert.ok(report.timestamp > 0, 'Timestamp should be non-zero');
  assert.ok(report.overallScore >= 0 && report.overallScore <= 100, 'Overall score should be bounded 0-100');
  assert.ok(report.modules.designSystem, 'Design system module should be present');
});
