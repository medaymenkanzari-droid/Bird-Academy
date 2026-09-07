/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SeverityLevel = 'info' | 'warning' | 'minor' | 'critical';

export interface CapturedError {
  id: string;
  timestamp: number;
  module: string;
  classification: string;
  severity: SeverityLevel;
  message: string;
  stack?: string;
  suggestion: string;
}

export interface ValidationIssue {
  id: string;
  field?: string;
  severity: 'warning' | 'error';
  message: string;
  suggestion: string;
}

export interface ValidationModuleResult {
  moduleName: string;
  score: number; // 0 to 100
  issues: ValidationIssue[];
}

export interface ValidationReport {
  timestamp: number;
  overallScore: number;
  modules: Record<string, ValidationModuleResult>;
}

export interface TestAssertion {
  description: string;
  passed: boolean;
  expected?: string;
  actual?: string;
}

export interface TestResult {
  id: string;
  name: string;
  category: 'unit' | 'integration' | 'business_rule' | 'repository' | 'engine' | 'snapshot' | 'ui';
  passed: boolean;
  durationMs: number;
  assertions: TestAssertion[];
  errorMessage?: string;
}

export interface TestSuiteResult {
  timestamp: number;
  passedCount: number;
  failedCount: number;
  coverage: number; // Percentage, e.g. 94%
  results: TestResult[];
}

export interface BenchmarkMeasurement {
  id: string;
  name: string;
  durationMs: number;
  description: string;
}

export interface BenchmarkReport {
  timestamp: number;
  measurements: BenchmarkMeasurement[];
  averageResponseTimeMs: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
}

export interface ReleaseNotes {
  version: string;
  date: string;
  type: 'Major' | 'Minor' | 'Patch' | 'Release Candidate';
  highlights: string[];
  bugFixes: string[];
  technicalImprovements: string[];
}

export interface ReleaseInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  schemaVersion: string;
  dbType: string;
  gitCommit?: string;
  gitBranch?: string;
  modules: { name: string; status: 'active' | 'deprecated' | 'experimental'; count: number }[];
  releaseNotes: ReleaseNotes[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'breeding' | 'genetics' | 'data' | 'troubleshooting';
}

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
}

export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  targetSelector?: string;
}
