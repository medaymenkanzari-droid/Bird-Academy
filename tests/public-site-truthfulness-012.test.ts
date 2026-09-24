/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — MISSION 012 QA CONTRACT
 * TRUTHFULNESS & ZERO FICTITIOUS SOCIAL PROOF CONTRACT
 * 
 * Validates that all public-facing pages, locales, and components strictly respect
 * the truthfulness policy during the public test phase (v1.3.6 / BUILD_ID BA-V1.3.6).
 * Zero fake testimonials, zero fake users, zero fake ratings, zero invented metrics.
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

const FORBIDDEN_FICTITIOUS_STRINGS = [
  'Jean-Marc Valenti',
  'Valenti',
  '5.0 / 5.0',
  '35 Ans d\'Expérience',
  '35 ans d\'élevage',
  'Protocole Elite Validé',
  'Protocole Élite Validé',
  'Juge & Maître Éleveur',
  'Standard COM Certifié',
  'Témoignage de Maître Éleveur',
  'Note d\'Excellence COM',
  'Reconnu par les juges et champions internationaux',
  'Reconnue par les juges et champions internationaux',
];

describe('MISSION 012 — Public Site Truthfulness & Zero Fake Social Proof', () => {

  describe('1. Absence de faux témoignages dans les 5 dictionnaires i18n', () => {
    it('QA-012-01: Aucune chaîne fictive interdite n\'est présente dans les locales', () => {
      for (const [lang, dict] of Object.entries(LOCALES)) {
        const serialized = JSON.stringify(dict);
        for (const forbidden of FORBIDDEN_FICTITIOUS_STRINGS) {
          assert.ok(
            !serialized.toLowerCase().includes(forbidden.toLowerCase()),
            `Chaîne interdite "${forbidden}" détectée dans la locale ${lang}`
          );
        }
      }
    });

    it('QA-012-02: La section expertTestimonial affiche un statut honnête "En phase de test"', () => {
      // FR
      assert.ok(fr.expertTestimonial.tag.includes('PHASE DE TEST'));
      assert.ok(fr.expertTestimonial.title.includes('Conçu pour accompagner'));
      assert.ok(fr.expertTestimonial.text1.includes('phase de test'));
      assert.ok(fr.expertTestimonial.cardFooter.includes('retours'));

      // EN
      assert.ok(en.expertTestimonial.tag.includes('TESTING PHASE'));
      assert.ok(en.expertTestimonial.title.includes('Designed to support'));
      assert.ok(en.expertTestimonial.text1.includes('in testing'));

      // ES
      assert.ok(es.expertTestimonial.tag.includes('FASE DE PRUEBAS'));
      assert.ok(es.expertTestimonial.title.includes('Diseñado para acompañar'));

      // IT
      assert.ok(itLocale.expertTestimonial.tag.includes('FASE DI TEST'));
      assert.ok(itLocale.expertTestimonial.title.includes('Progettato per accompagnare'));

      // AR
      assert.ok(ar.expertTestimonial.tag.includes('مرحلة الاختبار'));
      assert.ok(ar.expertTestimonial.title.includes('صُمم لمرافقة'));
    });

    it('QA-012-03: Zéro statistique utilisateur ou cheptel inventée dans les métriques Hero', () => {
      for (const [lang, dict] of Object.entries(LOCALES)) {
        assert.notEqual(dict.hero.breedersCount, '1 200+', `Métrique 1200+ éleveurs fictive trouvée en ${lang}`);
        assert.notEqual(dict.hero.breedersCount, '1,200+', `Métrique 1200+ éleveurs fictive trouvée en ${lang}`);
        assert.notEqual(dict.hero.birdsCount, '50 000+', `Métrique 50000+ sujets fictive trouvée en ${lang}`);
        assert.notEqual(dict.hero.birdsCount, '50,000+', `Métrique 50000+ sujets fictive trouvée en ${lang}`);
        
        // Doit refléter 100% hors ligne et phase de test v1.3.6
        assert.equal(dict.hero.breedersCount, '100%');
        assert.equal(dict.hero.birdsCount, 'v1.3.6');
      }
    });
  });

  describe('2. Vérification structurelle du composant ExpertTestimonialSection.tsx', () => {
    const componentPath = path.resolve('src/features/commercial-website/components/sections/ExpertTestimonialSection.tsx');

    it('QA-012-04: Le composant ne contient aucun texte codé en dur lié aux faux témoignages', () => {
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      for (const forbidden of FORBIDDEN_FICTITIOUS_STRINGS) {
        assert.ok(
          !content.includes(forbidden),
          `Le composant ExpertTestimonialSection contient la chaîne interdite: ${forbidden}`
        );
      }
    });

    it('QA-012-05: Le composant a supprimé les étoiles de notation et les citations d\'expert', () => {
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      // Pas d'import ou d'utilisation de Star ou Quote dans la section
      assert.ok(!content.includes('<Star'), 'Composant Star (étoile de note) interdit');
      assert.ok(!content.includes('<Quote'), 'Composant Quote (citation attribuée) interdit');
      assert.ok(!content.includes('<blockquote>'), 'Balise blockquote (citation attribuée) interdite');
    });

    it('QA-012-06: Le composant conserve la photographie de volière et des testids fiables', () => {
      const content = fs.readFileSync(componentPath, 'utf-8');
      
      assert.ok(content.includes('data-testid="expert-testimonial-section"'));
      assert.ok(content.includes('data-testid="expert-aviary-image"'));
      assert.ok(content.includes('./assets/images/expert-aviary.jpg'));
      assert.ok(!content.includes('Jean-Marc Valenti'));
      assert.ok(content.includes('BA-V1.3.6'));
    });
  });

  describe('3. Audit exhaustif du répertoire src/features/commercial-website', () => {
    it('QA-012-07: Zéro résidu de faux témoignage dans tout le sous-système commercial', () => {
      const baseDir = path.resolve('src/features/commercial-website');
      
      const scanDir = (dir: string): string[] => {
        let files: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            files = files.concat(scanDir(fullPath));
          } else if (/\.(tsx?|json|html|md)$/.test(entry.name)) {
            files.push(fullPath);
          }
        }
        return files;
      };

      const files = scanDir(baseDir);
      assert.ok(files.length > 20, 'Le dossier commercial-website doit contenir plus de 20 fichiers');

      const violations: { file: string; match: string }[] = [];

      for (const filePath of files) {
        const text = fs.readFileSync(filePath, 'utf-8');
        for (const forbidden of FORBIDDEN_FICTITIOUS_STRINGS) {
          if (text.includes(forbidden)) {
            violations.push({ file: path.relative(process.cwd(), filePath), match: forbidden });
          }
        }
      }

      assert.deepEqual(violations, [], `Violations détectées dans commercial-website : ${JSON.stringify(violations, null, 2)}`);
    });

    it('QA-012-08: Le pied de page WebFooter.tsx affiche la version réelle v1.3.6 en test', () => {
      const footerPath = path.resolve('src/features/commercial-website/components/layout/WebFooter.tsx');
      const footerContent = fs.readFileSync(footerPath, 'utf-8');
      assert.ok(!footerContent.includes('v1.4.2'), 'Scorie v1.4.2 obsolète interdite dans WebFooter.tsx');
      assert.ok(footerContent.includes('v1.3.6'), 'Version v1.3.6 manquante dans WebFooter.tsx');
    });
  });

  describe('4. Garantie de non-remplacement d\'un faux par un autre faux', () => {
    it('QA-012-09: Aucun faux avis, fausse récompense ou faux partenaire n\'a été ajouté', () => {
      const forbiddenConcepts = [
        'avis vérifié',
        'avis certifié',
        'avis clients',
        'recommandé par la ffo',
        'recommandé par la com',
        'champion du monde 2026',
        'partenaire officiel com',
        'partenaire officiel ffo',
      ];

      for (const [lang, dict] of Object.entries(LOCALES)) {
        const text = JSON.stringify(dict).toLowerCase();
        for (const concept of forbiddenConcepts) {
          assert.ok(
            !text.includes(concept),
            `Concept trompeur "${concept}" détecté en ${lang}`
          );
        }
      }
    });
  });

});
