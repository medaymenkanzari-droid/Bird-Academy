import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import type { Alimentation } from '../src/types';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
});

const { INITIAL_ALIMENTATION } = await import('../src/data/defaultData');
const { HandFeedingRepository } = await import('../src/features/hand-feeding/repositories/HandFeedingRepository');
const { HandFeedingService } = await import('../src/features/hand-feeding/services/HandFeedingService');

beforeEach(() => {
  localStorage.clear();
});

test('restores the three default nutrition periods when an older database has no plans', () => {
  localStorage.setItem('canaris', JSON.stringify([{ id: 1 }]));

  const plans = HandFeedingService.getOrInitializeDefaultPlans(INITIAL_ALIMENTATION);

  assert.equal(plans.length, 3);
  assert.deepEqual(plans.map(plan => plan.periode), ['Reproduction', 'Mue', 'Repos']);
  assert.deepEqual(HandFeedingRepository.getAll(), plans);
});

test('preserves existing nutrition plans instead of overwriting user data', () => {
  const customPlan: Alimentation = {
    id: 42,
    periode: 'Repos',
    type_aliment: 'Mélange personnalisé',
    quantite: '10 g',
    planning_distribution: 'Quotidien',
    stock_actuel_kg: 7,
  };
  HandFeedingRepository.saveAll([customPlan]);

  const plans = HandFeedingService.getOrInitializeDefaultPlans(INITIAL_ALIMENTATION);

  assert.deepEqual(plans, [customPlan]);
  assert.deepEqual(HandFeedingRepository.getAll(), [customPlan]);
});
