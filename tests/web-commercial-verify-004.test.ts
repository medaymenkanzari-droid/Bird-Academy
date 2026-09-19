/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — VOLIÈRE MANAGER v1.3.6
 * MISSION: WEB-COMMERCIAL-VERIFY-004
 * Unit & Integration verification for price masking, 5 locales, Render endpoint.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { fr } from '../src/features/commercial-website/i18n/locales/fr';
import { en } from '../src/features/commercial-website/i18n/locales/en';
import { es } from '../src/features/commercial-website/i18n/locales/es';
import { it } from '../src/features/commercial-website/i18n/locales/it';
import { ar } from '../src/features/commercial-website/i18n/locales/ar';

describe('MISSION WEB-COMMERCIAL-VERIFY-004 — Tests Unitaires & Intégrité Commerciale', () => {

  test('V004-U01: Aucune occurrence des montants 49, 119, 249 dans aucune des 5 locales', () => {
    const locales = [
      { name: 'FR', data: fr },
      { name: 'EN', data: en },
      { name: 'ES', data: es },
      { name: 'IT', data: it },
      { name: 'AR', data: ar },
    ];

    for (const { name, data } of locales) {
      const json = JSON.stringify(data);
      assert.strictEqual(/49[,.]00/.test(json), false, `[${name}] Contient encore 49.00`);
      assert.strictEqual(/119[,.]00/.test(json), false, `[${name}] Contient encore 119.00`);
      assert.strictEqual(/249[,.]00/.test(json), false, `[${name}] Contient encore 249.00`);
      assert.strictEqual(/49\s*€/.test(json), false, `[${name}] Contient encore 49 €`);
      assert.strictEqual(/119\s*€/.test(json), false, `[${name}] Contient encore 119 €`);
      assert.strictEqual(/249\s*€/.test(json), false, `[${name}] Contient encore 249 €`);
    }
  });

  test('V004-U02: Aucune mention de tarifs fermes ou prix définitifs dans les 5 locales', () => {
    const locales = [fr, en, es, it, ar];
    for (const l of locales) {
      const json = JSON.stringify(l);
      assert.strictEqual(json.includes('Tous les tarifs indiqués sont fermes'), false);
      assert.strictEqual(json.includes('tarifs indiqués sont fermes'), false);
      assert.strictEqual(json.includes('prix définitifs'), false);
    }
  });

  test('V004-U03: Présence rigoureuse de la formulation « Tarif en préparation » dans les 5 langues', () => {
    assert.strictEqual(fr.pricing.premPrice, 'Tarif en préparation');
    assert.strictEqual(fr.pricing.proPrice, 'Tarif en préparation');

    assert.strictEqual(en.pricing.premPrice, 'Pricing in preparation');
    assert.strictEqual(en.pricing.proPrice, 'Pricing in preparation');

    assert.strictEqual(es.pricing.premPrice, 'Tarifa en preparación');
    assert.strictEqual(es.pricing.proPrice, 'Tarifa en preparación');

    assert.strictEqual(it.pricing.premPrice, 'Tariffa in preparazione');
    assert.strictEqual(it.pricing.proPrice, 'Tariffa in preparazione');

    assert.strictEqual(ar.pricing.premPrice, 'الأسعار قيد الإعداد');
    assert.strictEqual(ar.pricing.proPrice, 'الأسعار قيد الإعداد');
  });

  test('V004-U04: Présence de l\'offre FREE gratuite dans les 5 langues', () => {
    assert.strictEqual(fr.pricing.freePrice, 'Gratuit');
    assert.strictEqual(en.pricing.freePrice, 'Free');
    assert.strictEqual(es.pricing.freePrice, 'Gratuito');
    assert.strictEqual(it.pricing.freePrice, 'Gratuito');
    assert.strictEqual(ar.pricing.freePrice, 'مجاني');
  });
});
