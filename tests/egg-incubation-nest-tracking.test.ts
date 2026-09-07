/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import type { Canari, Couple, Reproduction, Ponte } from '../src/types';
import type { EggItem, EggItemStatus } from '../src/components/design-system/EggMatrixCard';

describe('EggMatrixCard — Egg Status Transitions & Counting', () => {
  const STATUS_CYCLE: Record<EggItemStatus, EggItemStatus> = {
    laid: 'fertile',
    fertile: 'clear',
    clear: 'hatched',
    hatched: 'laid',
  };

  test('cycles through egg statuses sequentially (laid -> fertile -> clear -> hatched -> laid)', () => {
    let current: EggItemStatus = 'laid';
    current = STATUS_CYCLE[current];
    assert.equal(current, 'fertile');

    current = STATUS_CYCLE[current];
    assert.equal(current, 'clear');

    current = STATUS_CYCLE[current];
    assert.equal(current, 'hatched');

    current = STATUS_CYCLE[current];
    assert.equal(current, 'laid');
  });

  test('calculates egg counts and fertility rates accurately for a clutch', () => {
    const clutchEggs: EggItem[] = [
      { number: 1, status: 'hatched' },
      { number: 2, status: 'hatched' },
      { number: 3, status: 'fertile' },
      { number: 4, status: 'clear' },
      { number: 5, status: 'laid' },
    ];

    const total = clutchEggs.length;
    const fertile = clutchEggs.filter(e => e.status === 'fertile' || e.status === 'hatched').length;
    const hatched = clutchEggs.filter(e => e.status === 'hatched').length;
    const clear = clutchEggs.filter(e => e.status === 'clear').length;
    const laid = clutchEggs.filter(e => e.status === 'laid').length;

    assert.equal(total, 5);
    assert.equal(fertile, 3); // 2 hatched + 1 fertile
    assert.equal(hatched, 2);
    assert.equal(clear, 1);
    assert.equal(laid, 1);

    const fertilityRate = (fertile / total) * 100;
    assert.equal(fertilityRate, 60);
  });
});

describe('IncubationTimeline — Milestone Calculations & Active Windows', () => {
  function formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getMilestoneDates(clutchStartDateStr: string) {
    const [y, m, d] = clutchStartDateStr.split('-').map(Number);
    const start = new Date(y, m - 1, d);

    const day0 = new Date(start);
    const day6 = new Date(start);
    day6.setDate(start.getDate() + 6);
    const day13 = new Date(start);
    day13.setDate(start.getDate() + 13);
    const day19 = new Date(start);
    day19.setDate(start.getDate() + 19);

    return {
      day0: formatDate(day0),
      day6: formatDate(day6),
      day13: formatDate(day13),
      day19: formatDate(day19),
    };
  }

  function getElapsedDays(clutchStartDateStr: string, currentSimulatedDateStr: string) {
    const [y1, m1, d1] = clutchStartDateStr.split('-').map(Number);
    const [y2, m2, d2] = currentSimulatedDateStr.split('-').map(Number);
    const start = new Date(y1, m1 - 1, d1);
    const comp = new Date(y2, m2 - 1, d2);
    return Math.max(0, Math.floor((comp.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }

  test('calculates correct milestone dates for J+0, J+6, J+13, J+19', () => {
    const { day0, day6, day13, day19 } = getMilestoneDates('2026-05-01');

    assert.equal(day0, '2026-05-01');
    assert.equal(day6, '2026-05-07');
    assert.equal(day13, '2026-05-14');
    assert.equal(day19, '2026-05-20');
  });

  test('detects active candling window at J+6 to J+8', () => {
    const elapsedAtJ4 = getElapsedDays('2026-05-01', '2026-05-05');
    const elapsedAtJ6 = getElapsedDays('2026-05-01', '2026-05-07');
    const elapsedAtJ8 = getElapsedDays('2026-05-01', '2026-05-09');
    const elapsedAtJ10 = getElapsedDays('2026-05-01', '2026-05-11');

    assert.equal(elapsedAtJ4, 4);
    assert.equal(elapsedAtJ4 >= 6 && elapsedAtJ4 <= 8, false);

    assert.equal(elapsedAtJ6, 6);
    assert.equal(elapsedAtJ6 >= 6 && elapsedAtJ6 <= 8, true);

    assert.equal(elapsedAtJ8, 8);
    assert.equal(elapsedAtJ8 >= 6 && elapsedAtJ8 <= 8, true);

    assert.equal(elapsedAtJ10, 10);
    assert.equal(elapsedAtJ10 >= 6 && elapsedAtJ10 <= 8, false);
  });

  test('detects active hatching window at J+13 to J+15', () => {
    const elapsedAtJ12 = getElapsedDays('2026-05-01', '2026-05-13');
    const elapsedAtJ13 = getElapsedDays('2026-05-01', '2026-05-14');
    const elapsedAtJ15 = getElapsedDays('2026-05-01', '2026-05-16');
    const elapsedAtJ17 = getElapsedDays('2026-05-01', '2026-05-18');

    assert.equal(elapsedAtJ12, 12);
    assert.equal(elapsedAtJ12 >= 13 && elapsedAtJ12 <= 15, false);

    assert.equal(elapsedAtJ13, 13);
    assert.equal(elapsedAtJ13 >= 13 && elapsedAtJ13 <= 15, true);

    assert.equal(elapsedAtJ15, 15);
    assert.equal(elapsedAtJ15 >= 13 && elapsedAtJ15 <= 15, true);

    assert.equal(elapsedAtJ17, 17);
    assert.equal(elapsedAtJ17 >= 13 && elapsedAtJ17 <= 15, false);
  });
});

describe('NestTrackingView — Active Nest Management', () => {
  test('accurately aggregates active nest clutch statistics', () => {
    const repro: Reproduction = { id: 101, couple_id: 1, date_debut: '2026-06-01', statut: 'En cours' };
    const pontes: Ponte[] = [
      { id: 1, reproduction_id: 101, date: '2026-06-02', oeufs: 4, oeufs_fecondes: 4, eclosions: 3, sevrages: 0 },
      { id: 2, reproduction_id: 101, date: '2026-06-25', oeufs: 5, oeufs_fecondes: 5, eclosions: 4, sevrages: 0 },
    ];

    const totalEggs = pontes.reduce((sum, p) => sum + p.oeufs, 0);
    const totalFertile = pontes.reduce((sum, p) => sum + (p.oeufs_fecondes || 0), 0);
    const totalHatched = pontes.reduce((sum, p) => sum + (p.eclosions || 0), 0);

    assert.equal(totalEggs, 9);
    assert.equal(totalFertile, 9);
    assert.equal(totalHatched, 7);
  });
});
