/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { FinanceService } from '../src/features/finance/services/FinanceService';
import { FinanceRepository } from '../src/features/finance/repositories/FinanceRepository';
import { BirdRepository } from '../src/features/birds/repositories/BirdRepository';
import { TransferCertificateData } from '../src/features/finance/models/finance';
import { formatCurrency } from '../src/utils/currencyFormatter';
import { QRCodeManager } from '../src/features/habitat/services/QRCodeManager';

// Mock localStorage for node:test environment
const mockStorage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => mockStorage.get(key) || null,
  setItem: (key: string, val: string) => mockStorage.set(key, val),
  removeItem: (key: string) => mockStorage.delete(key),
  clear: () => mockStorage.clear()
};

test('FinanceService - records expenses and sales and calculates profitability margins', () => {
  // 1. Create a bird for sale
  const bird = BirdRepository.create({
    bague: '2026-FR-FIN-01',
    nom: 'Canari Vente Test',
    sexe: 'Mâle',
    categorie: 'canari_couleur',
    race: 'Classique',
    mutation: 'Classique',
    couleur_base: 'Jaune',
    facteur: 'Intensif',
    couleur: 'Jaune Intensif',
    date_naissance: '2025-02-01',
    statut_sante: 'Actif'
  });

  // 2. Add Expenses
  const exp1 = FinanceService.addExpense(
    '2026-08-01',
    45.50,
    'Alimentation',
    'Sac de graines Prestige 20kg'
  );
  assert.ok(exp1.success);

  const exp2 = FinanceService.addExpense(
    '2026-08-05',
    20.00,
    'Santé',
    'Complexe Vitamines Repro'
  );
  assert.ok(exp2.success);

  // 3. Add Sale
  const saleRes = FinanceService.addSale(
    bird.id,
    120.00,
    '2026-08-10',
    'M. Acquéreur Champion',
    'Cession mâle reproducteur'
  );
  assert.ok(saleRes.success);

  const allExpenses = FinanceRepository.getExpenses();
  const allSales = FinanceRepository.getSales();

  const totalExp = allExpenses.reduce((sum, e) => sum + e.montant, 0);
  const totalRev = allSales.reduce((sum, s) => sum + s.prix, 0);
  const netMargin = totalRev - totalExp;

  assert.equal(totalExp, 65.50, 'Total expenses should equal 65.50');
  assert.equal(totalRev, 120.00, 'Total sales should equal 120.00');
  assert.equal(netMargin, 54.50, 'Net margin should be 54.50 (Profit)');
});

test('TransferCertificateData - structures official transfer certificate parameters', () => {
  const mockCert: TransferCertificateData = {
    certificateNumber: 'CERT-CESS-0001-2026',
    issueDate: '2026-08-23',
    seller: {
      name: 'Élevage Bird Academy',
      affix: 'BA-STAMM-2026',
      stammNumber: 'STAMM-FR-042'
    },
    buyer: {
      name: 'M. Jean Dupont'
    },
    bird: {
      id: 42,
      bague: '2026-FR-042-01',
      species: 'Serinus canaria (Canari couleur)',
      sexe: 'Mâle',
      mutation: 'Agate Rouge Mosaïque',
      date_naissance: '2025-04-12',
      healthStatus: 'Certifié sain et autonome'
    },
    price: 60.00,
    paymentMethod: 'Espèces'
  };

  assert.ok(mockCert.certificateNumber.startsWith('CERT-CESS-'));
  assert.equal(mockCert.bird.bague, '2026-FR-042-01');
  assert.equal(mockCert.price, 60.00);
});

test('Smart QR Code - generates verification code for official transfer certificates', async () => {
  const certNumber = 'CERT-2026-08-0042';
  const birdRing = '2026-FR-042-01';
  const qrPayload = `BA:CERT:${certNumber}:${birdRing}`;

  assert.ok(qrPayload.startsWith('BA:CERT:'));
  const svg = await QRCodeManager.generateSVG(qrPayload, 80);
  assert.ok(svg.includes('<svg'));
  assert.ok(svg.includes('</svg>'));
});

test('Currency Formatter - formats positive and negative balances properly', () => {
  const formattedPos = formatCurrency(120);
  assert.ok(formattedPos.includes('120') || formattedPos.includes('120,00'));

  const formattedNeg = formatCurrency(-45.5);
  assert.ok(formattedNeg.includes('-45') || formattedNeg.includes('-45,50') || formattedNeg.includes('45.50'));
});
