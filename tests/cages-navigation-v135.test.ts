import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('V1.3.5 Cage Navigation & Unified History Strategy', () => {
  it('should maintain single source of truth for selectedType and selectedId', () => {
    let selectedType: string = 'all';
    let selectedId: string = 'all';
    const historyStack: Array<{ type: string; id: string }> = [];

    const selectNode = (type: string, id: string) => {
      selectedType = type;
      selectedId = id;
      if (type !== 'all' || id !== 'all') {
        historyStack.push({ type, id });
      }
    };

    const handlePopState = () => {
      historyStack.pop();
      const previous = historyStack[historyStack.length - 1];
      if (previous) {
        selectedType = previous.type;
        selectedId = previous.id;
      } else {
        selectedType = 'all';
        selectedId = 'all';
      }
    };

    // 1. LIST -> DETAIL
    selectNode('cage', 'cage_101');
    assert.strictEqual(selectedType, 'cage');
    assert.strictEqual(selectedId, 'cage_101');

    // 2. DETAIL -> BACK
    handlePopState();
    assert.strictEqual(selectedType, 'all');
    assert.strictEqual(selectedId, 'all');

    // 3. LIST -> DETAIL -> ANOTHER CAGE
    selectNode('cage', 'cage_101');
    selectNode('cage', 'cage_102');
    assert.strictEqual(selectedId, 'cage_102');

    // 4. BACK -> BACK
    handlePopState();
    assert.strictEqual(selectedId, 'cage_101');
    handlePopState();
    assert.strictEqual(selectedType, 'all');
    assert.strictEqual(selectedId, 'all');
  });
});
