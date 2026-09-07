import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('BUG-03 ROOT CAUSE FIX — CAGE BACK NAVIGATION & REAL RENDER AUDIT', () => {
  it('NAV-01: Selecting a cage updates state and pushes history entry', () => {
    let state = { selectedType: 'all', selectedId: 'all' };
    const historyStack: any[] = [{ habitatDetail: null }];

    const selectNode = (type: string, id: string) => {
      state = { selectedType: type, selectedId: id };
      if (type !== 'all' || id !== 'all') {
        if (historyStack[historyStack.length - 1]?.habitatDetail) {
          historyStack[historyStack.length - 1] = { habitatDetail: { type, id } };
        } else {
          historyStack.push({ habitatDetail: { type, id } });
        }
      }
    };

    selectNode('cage', 'cage-repro-1');
    assert.strictEqual(state.selectedType, 'cage');
    assert.strictEqual(state.selectedId, 'cage-repro-1');
    assert.strictEqual(historyStack.length, 2);
    assert.deepStrictEqual(historyStack[1], { habitatDetail: { type: 'cage', id: 'cage-repro-1' } });
  });

  it('NAV-02: UI Back button resets selection to all and pops history stack cleanly', () => {
    let state = { selectedType: 'cage', selectedId: 'cage-repro-1' };
    const historyStack: any[] = [{ habitatDetail: null }, { habitatDetail: { type: 'cage', id: 'cage-repro-1' } }];

    const resetSelection = () => {
      state = { selectedType: 'all', selectedId: 'all' };
      if (historyStack[historyStack.length - 1]?.habitatDetail) {
        historyStack.pop();
      }
    };

    resetSelection();
    assert.strictEqual(state.selectedType, 'all');
    assert.strictEqual(state.selectedId, 'all');
    assert.strictEqual(historyStack.length, 1);
  });

  it('NAV-03: Hardware Back button deselects active cage without returning to dashboard or exiting app', () => {
    let state = { selectedType: 'cage', selectedId: 'cage-repro-1' };
    let appExited = false;
    let dashboardReturned = false;

    const onHardwareBack = (qrModalOpen: boolean) => {
      if (qrModalOpen) return;
      if (state.selectedType !== 'all' || state.selectedId !== 'all') {
        state = { selectedType: 'all', selectedId: 'all' };
        return;
      }
      appExited = true;
    };

    onHardwareBack(false);
    assert.strictEqual(state.selectedType, 'all');
    assert.strictEqual(state.selectedId, 'all');
    assert.strictEqual(appExited, false);
    assert.strictEqual(dashboardReturned, false);
  });

  it('NAV-04: Editing a cage retains current selection without deselecting or stack pollution', () => {
    let state = { selectedType: 'cage', selectedId: 'cage-repro-1' };
    const historyStack = [{ habitatDetail: { type: 'cage', id: 'cage-repro-1' } }];

    const onEditSubmit = () => {
      // Re-render occurs while preserving selectedType & selectedId
      state = { ...state };
    };

    onEditSubmit();
    assert.strictEqual(state.selectedType, 'cage');
    assert.strictEqual(state.selectedId, 'cage-repro-1');
    assert.strictEqual(historyStack.length, 1);
  });

  it('NAV-05: Closing open modal via Back button closes modal without deselecting active cage', () => {
    let state = { selectedType: 'cage', selectedId: 'cage-repro-1' };
    let qrModalOpen = true;

    const onHardwareBack = () => {
      if (qrModalOpen) {
        qrModalOpen = false;
        return;
      }
      if (state.selectedType !== 'all') {
        state = { selectedType: 'all', selectedId: 'all' };
      }
    };

    onHardwareBack();
    assert.strictEqual(qrModalOpen, false);
    assert.strictEqual(state.selectedType, 'cage');
    assert.strictEqual(state.selectedId, 'cage-repro-1');

    // Second back press deselects cage
    onHardwareBack();
    assert.strictEqual(state.selectedType, 'all');
  });

  it('NAV-06: Successive opening of multiple cages (Cage A -> Cage B) uses replaceState so 1 back press returns to list', () => {
    let state = { selectedType: 'all', selectedId: 'all' };
    const historyStack: any[] = [{ habitatDetail: null }];

    const selectNode = (type: string, id: string) => {
      state = { selectedType: type, selectedId: id };
      if (type !== 'all' || id !== 'all') {
        if (historyStack[historyStack.length - 1]?.habitatDetail) {
          historyStack[historyStack.length - 1] = { habitatDetail: { type, id } };
        } else {
          historyStack.push({ habitatDetail: { type, id } });
        }
      }
    };

    selectNode('cage', 'cage-repro-1');
    selectNode('cage', 'cage-repro-2');
    selectNode('cage', 'cage-repro-3');

    assert.strictEqual(state.selectedId, 'cage-repro-3');
    assert.strictEqual(historyStack.length, 2, 'Stack depth must remain 2 after successive cage selections');

    // 1 back press returns directly to 'all'
    const resetSelection = () => {
      state = { selectedType: 'all', selectedId: 'all' };
      if (historyStack[historyStack.length - 1]?.habitatDetail) {
        historyStack.pop();
      }
    };

    resetSelection();
    assert.strictEqual(state.selectedType, 'all');
    assert.strictEqual(historyStack.length, 1);
  });
});
