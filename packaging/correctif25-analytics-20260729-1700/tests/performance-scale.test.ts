import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
});

const { DemoDataGenerator } = await import('../src/features/quality/utils/demoGenerator');
const { BirdRepository } = await import('../src/features/birds/repositories/BirdRepository');
const { PerformanceEngine } = await import('../src/features/platform/engines/PerformanceEngine');

beforeEach(() => localStorage.clear());

test('demo profiles contain exactly 50, 300 and 1,200 valid birds', () => {
  const expected = { small: 50, medium: 300, large: 1200 } as const;
  for (const size of Object.keys(expected) as Array<keyof typeof expected>) {
    const data = DemoDataGenerator.generate(size);
    assert.equal(data.canaris.length, expected[size]);
    assert.ok(data.canaris.every(bird => bird.id > 0 && bird.bague.trim().length > 0));
  }
});

test('the 1,200-bird profile remains under the prudent 4 MiB local limit', () => {
  DemoDataGenerator.toggleDemo(true, 'large');
  let bytes = 0;
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index);
    if (key) bytes += (key.length + (localStorage.getItem(key)?.length ?? 0)) * 2;
  }
  assert.equal(BirdRepository.getAll(true).length, 1200);
  assert.ok(bytes < 4 * 1024 * 1024, `${bytes} bytes`);
});

test('performance metrics are empty until real product operations are measured', () => {
  assert.deepEqual(PerformanceEngine.getMetrics(), []);
  assert.match(PerformanceEngine.getRecommendations(10, 10).at(-1) ?? '', /Aucun benchmark réel/);
});

test('real registry, KPI, search and serialization benchmark stays below 2 seconds', () => {
  DemoDataGenerator.toggleDemo(true, 'large');
  const startedAt = performance.now();
  PerformanceEngine.runBenchmark();
  const elapsed = performance.now() - startedAt;
  const metrics = PerformanceEngine.getMetrics();

  assert.equal(metrics.length, 4);
  assert.ok(metrics.every(metric => Number.isFinite(metric.durationMs) && metric.durationMs >= 0));
  assert.ok(elapsed < 2000, `${elapsed.toFixed(2)} ms`);
});
