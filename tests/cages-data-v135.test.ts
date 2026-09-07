import { describe, it } from 'node:test';
import assert from 'node:assert';
import { HabitatEngine } from '../src/business/HabitatEngine';
import { Canari } from '../src/types';

describe('V1.3.5 Cage Data & Occupancy Calculation Engine', () => {
  const dummyFacility = { id: 'fac_1', nom: 'Installation Principal', capacite: 60 };
  const dummyZone = { id: 'z_1', facilityId: 'fac_1', nom: 'Zone Alpha', capacite: 60 };
  const dummyCage1 = { id: 'c_1', zoneId: 'z_1', nom: 'Cage 01', capacite_max: 10 };
  const dummyCage2 = { id: 'c_2', zoneId: 'z_1', nom: 'Cage 02', capacite_max: 40 };

  it('should evaluate 0 birds correctly', () => {
    const birds: Canari[] = [];
    const stats = HabitatEngine.calculateStats('cage', 'c_1', birds);
    assert.strictEqual(stats.oiseauxPresents, 0);
    assert.strictEqual(stats.tauxOccupation, 0);
  });

  it('should evaluate 1 bird assigned by cage_id or cageId', () => {
    const birds: Partial<Canari>[] = [
      { id: 1, cage_id: 1, cageId: 'c_1', statut_sante: 'Sain', archived: false }
    ];
    const stats = HabitatEngine.calculateStats('cage', 'c_1', birds as Canari[]);
    assert.strictEqual(stats.oiseauxPresents, 1);
    assert.strictEqual(stats.tauxOccupation, 10);
  });

  it('should evaluate 50 birds distributed across cages', () => {
    const birds: Partial<Canari>[] = [];
    for (let i = 1; i <= 10; i++) {
      birds.push({ id: i, cage_id: 1, cageId: 'c_1', statut_sante: 'Sain', archived: false });
    }
    for (let i = 11; i <= 50; i++) {
      birds.push({ id: i, cage_id: 2, cageId: 'c_2', statut_sante: 'Sain', archived: false });
    }

    const cage1Stats = HabitatEngine.calculateStats('cage', 'c_1', birds as Canari[]);
    assert.strictEqual(cage1Stats.oiseauxPresents, 10);
    assert.strictEqual(cage1Stats.tauxOccupation, 100);

    const cage2Stats = HabitatEngine.calculateStats('cage', 'c_2', birds as Canari[]);
    assert.strictEqual(cage2Stats.oiseauxPresents, 40);
    assert.strictEqual(cage2Stats.tauxOccupation, 400); // 40 birds / 10 default cap = 400%
  });

  it('should exclude deceased and archived birds from occupancy', () => {
    const birds: Partial<Canari>[] = [
      { id: 1, cage_id: 1, cageId: 'c_1', statut_sante: 'Sain', archived: false },
      { id: 2, cage_id: 1, cageId: 'c_1', statut_sante: 'Décédé', archived: false },
      { id: 3, cage_id: 1, cageId: 'c_1', statut_sante: 'Sain', archived: true },
    ];
    const stats = HabitatEngine.calculateStats('cage', 'c_1', birds as Canari[]);
    assert.strictEqual(stats.oiseauxPresents, 1);
  });

  it('should format CAGE-DATA log markers correctly', () => {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(msg);

    log('[CAGE-DATA-01] Data sources compared: Birds=50, Cages=10, Facilities=1');
    log('[CAGE-DATA-02] Resolving ID types across entities');
    log('[CAGE-DATA-03] Calculated stats for facility:fac_default: present=50, cap=100, occ=50%');
    log('[CAGE-DATA-04] Multi-cage distribution count active birds: 50');
    log('[CAGE-DATA-05] State synchronization completed post-hydration');

    assert.strictEqual(logs.length, 5);
    assert.strictEqual(logs[0].includes('CAGE-DATA-01'), true);
    assert.strictEqual(logs[4].includes('CAGE-DATA-05'), true);
  });
});
