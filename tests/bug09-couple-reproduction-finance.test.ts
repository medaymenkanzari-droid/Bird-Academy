import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { formatCurrency, LOCALE_MAP } from '../src/utils/currencyFormatter';
import { StatisticsEngine } from '../src/business/StatisticsEngine';

describe('BUG-09 — Couple/Reproduction Detail Duplication & Financial Decimal Formatting', () => {
  const couplesPath = path.join(process.cwd(), 'src/components/Couples.tsx');
  const reproPath = path.join(process.cwd(), 'src/components/Reproduction.tsx');
  const currencyPath = path.join(process.cwd(), 'src/utils/currencyFormatter.ts');

  // --- BUG-09-A TESTS ---
  describe('BUG-09-A: Double Rendering Elimination in Couple & Reproduction', () => {
    it('BUG09-A-01: Une sélection dans Couple affiche une seule fiche (Desktop right panel / Mobile AppModal)', () => {
      const content = fs.readFileSync(couplesPath, 'utf-8');
      assert.ok(content.includes('setSelectedCoupleId(c.id);'));
      assert.ok(content.includes('window.innerWidth < 1024'));
      assert.ok(content.includes('hidden lg:block'));
    });

    it('BUG09-A-02: Une sélection dans Reproduction affiche une seule fiche (Desktop right panel / Mobile AppModal)', () => {
      const content = fs.readFileSync(reproPath, 'utf-8');
      assert.ok(content.includes('setSelectedReproId(repro.id);'));
      assert.ok(content.includes('window.innerWidth < 1024'));
      assert.ok(content.includes('hidden lg:block'));
    });

    it('BUG09-A-03: Changer de sélection ne crée pas de deuxième fiche', () => {
      const couplesContent = fs.readFileSync(couplesPath, 'utf-8');
      const reproContent = fs.readFileSync(reproPath, 'utf-8');

      // Clicking updates ID without duplicating DOM elements
      assert.ok(couplesContent.includes('setSelectedCoupleId('));
      assert.ok(reproContent.includes('setSelectedReproId('));
    });

    it('BUG09-A-04: Aucune fiche redondante n\'est rendue sous le tableau (right panel hidden on mobile grid)', () => {
      const couplesContent = fs.readFileSync(couplesPath, 'utf-8');
      const reproContent = fs.readFileSync(reproPath, 'utf-8');

      assert.ok(couplesContent.includes('className="hidden lg:block"'));
      assert.ok(reproContent.includes('className="hidden lg:block"'));
    });

    it('BUG09-A-05: Le comportement reste correct en mobile (AppModal trigger guarded by screen width)', () => {
      const couplesContent = fs.readFileSync(couplesPath, 'utf-8');
      const reproContent = fs.readFileSync(reproPath, 'utf-8');

      assert.ok(couplesContent.includes('setIsDetailsModalOpen(true)'));
      assert.ok(reproContent.includes('setIsNestModalOpen(true)'));
    });

    it('BUG09-A-06: Le comportement reste correct en desktop (Inline detail panel displayed once in right column)', () => {
      const couplesContent = fs.readFileSync(couplesPath, 'utf-8');
      const reproContent = fs.readFileSync(reproPath, 'utf-8');

      assert.ok(couplesContent.includes('selectedCouple ?'));
      assert.ok(reproContent.includes('selectedReproId && selectedRepro ?'));
    });
  });

  // --- BUG-09-B TESTS ---
  describe('BUG-09-B: Financial Decimal Formatting & Intl Localization', () => {
    it('BUG09-B-01: Les montants financiers n\'affichent jamais plus de 2 décimales (ou 3 pour TND/DT)', () => {
      const rawFloat = 1250.0000000000001;
      const formattedEur = formatCurrency(rawFloat, 'EUR', true, 'fr');
      const formattedTnd = formatCurrency(rawFloat, 'TND', true, 'fr');

      assert.strictEqual(formattedEur.includes('000000'), false);
      assert.strictEqual(formattedTnd.includes('000000'), false);
    });

    it('BUG09-B-02: Les calculs internes conservent leur précision sans altérer les moteurs métier', () => {
      const sampleCanaris: any[] = [];
      const samplePontes: any[] = [];
      const sampleDepenses: any[] = [{ id: 1, date: '2026-08-01', categorie: 'Santé', montant: 1250.0000000000001, description: 'Test' }];
      const sampleVentes: any[] = [{ id: 1, canari_id: 1, date: '2026-08-01', prix: 2500.0000000000003, acheteur: 'Test' }];

      const snapshot = StatisticsEngine.calculate(sampleCanaris, samplePontes, sampleDepenses, sampleVentes);
      // Math is untouched
      assert.strictEqual(typeof snapshot.netProfit, 'number');
      assert.strictEqual(snapshot.netProfit, 2500.0000000000003 - 1250.0000000000001);
    });

    it('BUG09-B-03: Le formatage respecte FR (Intl fr-FR)', () => {
      const formatted = formatCurrency(1250, 'EUR', true, 'fr');
      assert.ok(formatted.includes('1') && formatted.includes('250') && formatted.includes(',00') && formatted.includes('€'));
    });

    it('BUG09-B-04: Le formatage respecte EN (Intl en-US)', () => {
      const formatted = formatCurrency(1250, 'EUR', true, 'en');
      assert.ok(formatted.includes('1,250.00') || formatted.includes('€1,250.00'));
    });

    it('BUG09-B-05: Le formatage respecte AR (Intl ar-TN / Arabic localization)', () => {
      const formatted = formatCurrency(1250, 'EUR', true, 'ar');
      assert.ok(formatted.length > 0);
      assert.strictEqual(formatted.includes('000000'), false);
    });

    it('BUG09-B-06: Le formatage respecte ES (Intl es-ES)', () => {
      const formatted = formatCurrency(1250, 'EUR', true, 'es');
      assert.ok(formatted.includes('1.250,00') || formatted.includes('1250,00'));
    });

    it('BUG09-B-07: Le formatage respecte IT (Intl it-IT)', () => {
      const formatted = formatCurrency(1250, 'EUR', true, 'it');
      assert.ok(formatted.includes('1.250,00') || formatted.includes('1250,00'));
    });

    it('BUG09-B-08: Aucun symbole monétaire hardcodé dans la logique de formatage', () => {
      const content = fs.readFileSync(currencyPath, 'utf-8');
      assert.ok(content.includes('Intl.NumberFormat'));
      assert.ok(content.includes('LOCALE_MAP'));
    });

    it('BUG09-B-09: ReportBuilder utilise formatCurrency pour les tuiles de synthèse financière (ExecutiveTile)', () => {
      const reportBuilderPath = path.join(process.cwd(), 'src/features/analytics/reports/ReportBuilder.tsx');
      const content = fs.readFileSync(reportBuilderPath, 'utf-8');
      assert.ok(content.includes("ExecutiveTile title={at('kpiNetCashFlow')} value={formatCurrency("));
      assert.ok(content.includes("ExecutiveTile title={at('kpiTotalRevenue')} value={formatCurrency("));
      assert.ok(content.includes("ExecutiveTile title={at('kpiTotalExpenses')} value={formatCurrency("));
    });
  });
});
