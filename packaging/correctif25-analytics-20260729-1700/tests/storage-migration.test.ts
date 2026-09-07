import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length(): number {
    return this.values.size;
  }

  clear(): void {
    this.values.clear();
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, String(value));
  }
}

const memoryStorage = new MemoryStorage();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: memoryStorage,
});

const { LocalStorageProvider, MigrationManager } = await import('../src/storage/index');

beforeEach(() => {
  localStorage.clear();
});

test('isolates demo data from production data', () => {
  const storage = new LocalStorageProvider();
  storage.setItem('canaris', [{ id: 1 }]);

  localStorage.setItem('bird_academy_demo_active', 'true');
  storage.setItem('canaris', [{ id: 2 }]);

  assert.deepEqual(JSON.parse(localStorage.getItem('canaris') ?? '[]'), [{ id: 1 }]);
  assert.deepEqual(JSON.parse(localStorage.getItem('demo_canaris') ?? '[]'), [{ id: 2 }]);
  assert.deepEqual(storage.getItem('canaris', []), [{ id: 2 }]);
});

test('migrates a historical BirdBox business key to the repository canonical key', () => {
  const storage = new LocalStorageProvider();
  localStorage.setItem('birdbox_canaris', JSON.stringify([{ id: 7 }]));

  MigrationManager.migrate(storage);

  assert.deepEqual(JSON.parse(localStorage.getItem('canaris') ?? '[]'), [{ id: 7 }]);
  assert.equal(localStorage.getItem('birdbox_canaris'), null);
  assert.equal(localStorage.getItem('bird_academy_canaris'), null);
});

test('never overwrites or deletes a conflicting newer branded value', () => {
  const storage = new LocalStorageProvider();
  localStorage.setItem('birdbox_language', '"fr"');
  localStorage.setItem('bird_academy_language', '"ar"');

  MigrationManager.migrate(storage);

  assert.equal(localStorage.getItem('bird_academy_language'), '"ar"');
  assert.equal(localStorage.getItem('birdbox_language'), '"fr"');
});

test('application reset preserves storage belonging to another application on the same origin', () => {
  const storage = new LocalStorageProvider();
  localStorage.setItem('canaris', '[{"id":1}]');
  localStorage.setItem('ba_clutches', '[{"id":"c1"}]');
  localStorage.setItem('bird_academy_theme', '"dark"');
  localStorage.setItem('unrelated_host_application', 'keep-me');

  storage.clear();

  assert.equal(localStorage.getItem('canaris'), null);
  assert.equal(localStorage.getItem('ba_clutches'), null);
  assert.equal(localStorage.getItem('bird_academy_theme'), null);
  assert.equal(localStorage.getItem('unrelated_host_application'), 'keep-me');
});

test('demo reset removes demo data only', () => {
  const storage = new LocalStorageProvider();
  localStorage.setItem('bird_academy_demo_active', 'true');
  localStorage.setItem('canaris', '[{"id":1}]');
  localStorage.setItem('demo_canaris', '[{"id":2}]');

  storage.clear();

  assert.equal(localStorage.getItem('canaris'), '[{"id":1}]');
  assert.equal(localStorage.getItem('demo_canaris'), null);
});
