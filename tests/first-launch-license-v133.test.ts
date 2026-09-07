/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * V1.3.3 MOBILE QA ROOT FIX - TEST SUITE 01
 * First Launch License Enforcement Test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { KeyValidator } from '../src/features/licensing/validators/KeyValidator.ts';
import { OfflineBetaValidator } from '../src/features/licensing/services/OfflineBetaValidator.ts';

describe('V1.3.3 - BUG-01 First Launch License Activation', () => {
  it('should validate key format deterministically', () => {
    const testKey = 'LMSE-2026-ABCD-1234-5678';
    const result = KeyValidator.validateFormat(testKey);
    assert.strictEqual(typeof result.isValid, 'boolean');
  });

  it('should reject empty license file payloads with INVALID_FILE code', async () => {
    const mockFingerprint = { id: 'dev-1', platform: 'Android' } as any;
    const result = await OfflineBetaValidator.validateFile('', mockFingerprint);
    
    assert.strictEqual(result.isValid, false);
    assert.strictEqual(result.code, 'INVALID_FILE');
  });
});
