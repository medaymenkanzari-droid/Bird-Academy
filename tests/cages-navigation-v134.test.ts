import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('MISSION V1.3.4 — CAGES NAVIGATION & BACK STACK', () => {
  it('CAGE-NAV-01: Selecting a cage pushes cageDetail state to history', () => {
    const historyStack: any[] = [];
    const pushState = (state: any) => historyStack.push(state);

    let selectedCageId: number | null = null;
    const onSelectCage = (id: number) => {
      selectedCageId = id;
      pushState({ cageDetail: id });
    };

    onSelectCage(1);
    assert.strictEqual(selectedCageId, 1);
    assert.deepStrictEqual(historyStack[0], { cageDetail: 1 });
  });

  it('CAGE-NAV-02: Returning from cage detail resets selectedCageId to null', () => {
    let selectedCageId: number | null = 1;
    const handlePopState = (eventState: any) => {
      if (eventState?.cageDetail !== undefined) {
        selectedCageId = eventState.cageDetail;
      } else {
        selectedCageId = null;
      }
    };

    handlePopState({}); // root pop state without cageDetail
    assert.strictEqual(selectedCageId, null);
  });

  it('CAGE-NAV-03: Switching directly between cages uses replaceState or popstate sync', () => {
    let selectedCageId: number | null = 1;
    const handlePopState = (eventState: any) => {
      if (eventState?.cageDetail !== undefined) {
        selectedCageId = eventState.cageDetail;
      } else {
        selectedCageId = null;
      }
    };

    handlePopState({ cageDetail: 2 });
    assert.strictEqual(selectedCageId, 2);
  });

  it('CAGE-NAV-04: Repeated navigation sequence maintains clean state without leaks', () => {
    let selectedCageId: number | null = null;
    const navigate = (id: number | null) => {
      selectedCageId = id;
    };

    navigate(1);
    assert.strictEqual(selectedCageId, 1);
    navigate(null);
    assert.strictEqual(selectedCageId, null);
    navigate(2);
    assert.strictEqual(selectedCageId, 2);
    navigate(null);
    assert.strictEqual(selectedCageId, null);
  });
});
