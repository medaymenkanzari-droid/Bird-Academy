/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — IMMERSIVE EDITION VALIDATION SUITE
 * Test suite for Avian Precision design, Split-Screen Hero, badges, Jean-Marc Valenti testimonial,
 * 4 Core Engines, Mobile Bottom Navigation Bar, and Commercial Price Masking Integrity.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { fr } from '../src/features/commercial-website/i18n/locales/fr';
import { en } from '../src/features/commercial-website/i18n/locales/en';
import { es } from '../src/features/commercial-website/i18n/locales/es';
import { it as itLocale } from '../src/features/commercial-website/i18n/locales/it';
import { ar } from '../src/features/commercial-website/i18n/locales/ar';

const LOCALES = { fr, en, es, it: itLocale, ar };

describe('MISSION WEB-IMMERSIVE-EDITION-001 — Validation Technique & Graphique', () => {

  // 1. Hero Section & Metrics
  describe('1. Hero Section Split-Screen & Métriques d\'Élite', () => {
    it('I01: Le titre H1 d\'élite est présent et valorise la précision avicole', () => {
      assert.ok(fr.hero.title.includes('sélection avicole') || fr.hero.title.includes('précision'));
      assert.ok(en.hero.title.includes('Master'));
      assert.ok(es.hero.title.includes('Domine') || es.hero.title.includes('ave'));
      assert.ok(itLocale.hero.title.includes('Padroneggia'));
      assert.ok(ar.hero.title.includes('تحكّم') || ar.hero.title.includes('تربية'));
    });

    it('I02: Les 3 métriques clés (1 200+, 50 000+, 7 Gén.) sont définies', () => {
      assert.equal(fr.hero.breedersCount, '1 200+');
      assert.equal(fr.hero.birdsCount, '50 000+');
      assert.equal(fr.hero.wrightCount, '7 Gén.');

      assert.equal(en.hero.breedersCount, '1,200+');
      assert.equal(en.hero.birdsCount, '50,000+');
      assert.equal(en.hero.wrightCount, '7 Gen.');
    });

    it('I03: Les 4 badges du canari de concours (Bague, Wright F=0.8%, AES-256, 94 pts) sont présents', () => {
      assert.ok(fr.hero.badgeRing.includes('FFO-2024-892'));
      assert.ok(fr.hero.badgeWright.includes('0.8%'));
      assert.ok(fr.hero.badgeSecurity.includes('AES-256'));
      assert.ok(fr.hero.badgeScore.includes('94 pts'));
      assert.ok(fr.hero.badgeScore.includes('Médaille d\'Or COM'));
    });

    it('I04: L\'image physique du canari de concours existe sur disque dans public/assets/images', () => {
      const canaryImgPath = path.resolve('public/assets/images/champion-canary.jpg');
      assert.ok(fs.existsSync(canaryImgPath), 'L\'image champion-canary.jpg doit exister');
      const stat = fs.statSync(canaryImgPath);
      assert.ok(stat.size > 100000, 'L\'image du canari doit être en haute résolution');
    });
  });

  // 2. Problem / Solution Comparison
  describe('2. Section Du Carnet Papier à l\'Excellence Avicole', () => {
    it('I05: Le titre et le comparatif papier vs application sont rigoureusement définis', () => {
      assert.equal(fr.problemSolution.title, 'Du Carnet Papier à l\'Excellence Avicole');
      assert.ok(fr.problemSolution.problemTitle.includes('Manuscrit') || fr.problemSolution.problemTitle.includes('Carnet'));
      assert.ok(fr.problemSolution.solutionTitle.includes('Bird Academy'));
    });

    it('I06: L\'image d\'usage in situ du smartphone en volière existe sur disque', () => {
      const aviaryMobileImg = path.resolve('public/assets/images/mobile-in-aviary.jpg');
      assert.ok(fs.existsSync(aviaryMobileImg), 'L\'image mobile-in-aviary.jpg doit exister');
      const stat = fs.statSync(aviaryMobileImg);
      assert.ok(stat.size > 50000, 'L\'image du smartphone en volière doit être présente');
    });
  });

  // 3. Expert Testimonial
  describe('3. Témoignage d\'Expert Jean-Marc Valenti (Juge & Maître Éleveur COM)', () => {
    it('I07: La citation de Jean-Marc Valenti et sa distinction COM sont présentes dans les 5 locales', () => {
      for (const [lang, dict] of Object.entries(LOCALES)) {
        assert.ok(dict.expertTestimonial, `expertTestimonial manquant en ${lang}`);
        assert.ok(dict.expertTestimonial.author.includes('Valenti'), `Auteur Jean-Marc Valenti manquant en ${lang}`);
        assert.ok(dict.expertTestimonial.role.includes('COM'), `Mention COM manquante en ${lang}`);
        assert.ok(dict.expertTestimonial.quote.length > 50, `Citation trop courte en ${lang}`);
      }
    });

    it('I08: L\'image de la volière moderne avec l\'expert existe sur disque', () => {
      const expertImgPath = path.resolve('public/assets/images/expert-aviary.jpg');
      assert.ok(fs.existsSync(expertImgPath), 'L\'image expert-aviary.jpg doit exister');
      const stat = fs.statSync(expertImgPath);
      assert.ok(stat.size > 100000, 'L\'image de la volière moderne doit être en haute résolution');
    });
  });

  // 4. Core Engines Grid
  describe('4. Grille des 4 Moteurs Métier', () => {
    it('I09: Les 4 moteurs (Wright, Pontes, Bagues, Hors-Ligne) sont définis avec leurs métriques', () => {
      for (const [lang, dict] of Object.entries(LOCALES)) {
        assert.ok(dict.coreEngines, `coreEngines manquant en ${lang}`);
        assert.ok(dict.coreEngines.engine1Title, `Moteur 1 manquant en ${lang}`);
        assert.ok(dict.coreEngines.engine2Title, `Moteur 2 manquant en ${lang}`);
        assert.ok(dict.coreEngines.engine3Title, `Moteur 3 manquant en ${lang}`);
        assert.ok(dict.coreEngines.engine4Title, `Moteur 4 manquant en ${lang}`);
      }
    });
  });

  // 5. Navbar & Mobile Navigation
  describe('5. En-tête avec Badge ENTERPRISE & Barre Mobile 4 Onglets', () => {
    it('I10: WebHeader.tsx intègre le badge ENTERPRISE officiel', () => {
      const headerContent = fs.readFileSync(
        path.resolve('src/features/commercial-website/components/layout/WebHeader.tsx'),
        'utf-8'
      );
      assert.ok(headerContent.includes('header-enterprise-badge'), 'Badge ENTERPRISE manquant dans WebHeader');
      assert.ok(headerContent.includes('ENTERPRISE'), 'Texte ENTERPRISE manquant dans WebHeader');
    });

    it('I11: WebMobileBottomNav.tsx fournit les 4 onglets (Oiseaux, Suivi, Génétique, Profil)', () => {
      const mobileNavContent = fs.readFileSync(
        path.resolve('src/features/commercial-website/components/layout/WebMobileBottomNav.tsx'),
        'utf-8'
      );
      assert.ok(mobileNavContent.includes('mobile-tab-birds'), 'Onglet Oiseaux manquant');
      assert.ok(mobileNavContent.includes('mobile-tab-tracking'), 'Onglet Suivi manquant');
      assert.ok(mobileNavContent.includes('mobile-tab-genetics'), 'Onglet Génétique manquant');
      assert.ok(mobileNavContent.includes('mobile-tab-profile'), 'Onglet Profil manquant');
    });

    it('I12: CommercialWebsiteApp.tsx intègre la barre mobile et le padding adaptatif', () => {
      const appContent = fs.readFileSync(
        path.resolve('src/features/commercial-website/CommercialWebsiteApp.tsx'),
        'utf-8'
      );
      assert.ok(appContent.includes('WebMobileBottomNav'), 'WebMobileBottomNav doit être monté dans CommercialWebsiteApp');
      assert.ok(appContent.includes('pb-16 md:pb-0'), 'Padding inférieur adaptatif pb-16 md:pb-0 manquant');
    });
  });

  // 6. Typographie & Intégrité Commerciale
  describe('6. Typographie Hanken Grotesk & Non-Régression Commerciale', () => {
    it('I13: Hanken Grotesk est importé dans index.html et configuré dans index.css', () => {
      const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');
      assert.ok(indexHtml.includes('Hanken+Grotesk'), 'Import Hanken Grotesk manquant dans index.html');

      const indexCss = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');
      assert.ok(indexCss.includes('Hanken Grotesk'), 'Font token Hanken Grotesk manquant dans index.css');
    });

    it('I14: Règle absolue de non-régression — aucun prix commercial (49, 119, 249) ou tarif ferme', () => {
      const forbiddenAmounts = ['49 €', '49€', '49,00', '119 €', '119€', '119,00', '249 €', '249€', '249,00'];
      for (const [lang, dict] of Object.entries(LOCALES)) {
        const jsonStr = JSON.stringify(dict);
        for (const amount of forbiddenAmounts) {
          assert.equal(
            jsonStr.includes(amount),
            false,
            `Régression : montant commercial "${amount}" détecté dans la locale ${lang} !`
          );
        }
      }
    });
  });

});
