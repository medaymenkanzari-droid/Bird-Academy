/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — TESTER FEEDBACK TYPES
 * Standard data structures for public test bug reports, UX feedback, and feature suggestions.
 */

export type FeedbackType = 'bug' | 'question' | 'ux' | 'suggestion' | 'missing_feature';

export type FeedbackSeverity = 'blocker' | 'important' | 'minor' | 'idea';

export interface TesterFeedback {
  id: string;
  type: FeedbackType;
  severity: FeedbackSeverity;
  module: string;
  version: string;
  buildId: string;
  os: string;
  licenseType: string;
  description: string;
  screenshotName?: string;
  screenshotBase64?: string;
  contactEmail?: string;
  createdAt: string;
}

export interface FeedbackSubmissionResult {
  success: boolean;
  ticketId: string;
  message: string;
  feedback: TesterFeedback;
}
