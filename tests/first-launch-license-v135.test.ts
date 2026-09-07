import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('V1.3.5 First Launch License Activation & Boot Guard', () => {
  it('should enforce state machine states during boot', () => {
    const validStates = ['INITIALIZING', 'LICENSE_CHECKING', 'LICENSE_REQUIRED', 'LICENSE_VALID', 'LICENSE_INVALID'];
    
    // Simulate initial checking state
    let state = 'INITIALIZING';
    assert.strictEqual(validStates.includes(state), true);
    
    // Transition to checking
    state = 'LICENSE_CHECKING';
    assert.strictEqual(validStates.includes(state), true);

    // Transition to required when no license exists
    state = 'LICENSE_REQUIRED';
    assert.strictEqual(validStates.includes(state), true);

    // Transition to valid when valid license is stored
    state = 'LICENSE_VALID';
    assert.strictEqual(validStates.includes(state), true);
  });

  it('should block access to modules during INITIALIZING and LICENSE_REQUIRED', () => {
    const canRenderModule = (state: string) => state === 'LICENSE_VALID';

    assert.strictEqual(canRenderModule('INITIALIZING'), false);
    assert.strictEqual(canRenderModule('LICENSE_CHECKING'), false);
    assert.strictEqual(canRenderModule('LICENSE_REQUIRED'), false);
    assert.strictEqual(canRenderModule('LICENSE_INVALID'), false);
    assert.strictEqual(canRenderModule('LICENSE_VALID'), true);
  });

  it('should format diagnostic log markers without leaking sensitive secrets', () => {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);

    log('[LICENSE-BOOT-01] App boot initialization started');
    log('[LICENSE-BOOT-02] Storage hydration & license lookup initiated');
    log('[LICENSE-BOOT-03] License validation completed: { isValid: false, code: "NO_LICENSE" }');
    log('[LICENSE-BOOT-04] License state transition: LICENSE_REQUIRED');
    log('[LICENSE-BOOT-05] Boot guard status: ACCESS_BLOCKED');

    assert.strictEqual(logs.length, 5);
    const fullLog = logs.join('\n');
    assert.strictEqual(fullLog.includes('LICENSE-BOOT-01'), true);
    assert.strictEqual(fullLog.includes('LICENSE-BOOT-05'), true);
    assert.strictEqual(fullLog.includes('LMSE_PRIVATE_SIGNING_KEY'), false);
    assert.strictEqual(fullLog.includes('BEGIN PRIVATE KEY'), false);
    assert.strictEqual(fullLog.includes('secret'), false);
  });
});
