/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — PRE-EXTERNAL-UX-FUNCTIONAL-FIX-01 TEST SUITE
 * 
 * Validates the 20 acceptance scenarios (UX-01 to UX-20) for Phase 2:
 * - UX-01 to UX-04: Responsive Navigation & Scroll Architecture (Sidebar, Mobile Drawer, no scrollbar-none)
 * - UX-05 to UX-07: Demo Generator UX Exposure & Naming (No more "Sandbox Démo", entry in Parametres)
 * - UX-08 to UX-10: Species Profile Scoping preservation in Demo Generator (mono & multi-species)
 * - UX-11 to UX-16: Notification Center & Reactive Dynamic Badge (Real click handler, popover, unreadCount)
 * - UX-17 to UX-18: Internationalization (FR, EN, AR, ES, IT) & RTL support
 * - UX-19 to UX-20: Baseline Preservation (Species Profile & User/Admin isolation)
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Setup Mock LocalStorage for Node.js test environment
const mockStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => { mockStorage[key] = String(value); },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
  };
}

// Core Services & Modules
import { SpeciesProfileService } from '../src/features/species/services/SpeciesProfileService';
import { DemoDataGenerator } from '../src/features/quality/utils/demoGenerator';
import { NotificationService } from '../src/features/platform/services/NotificationService';
import { TRANSLATIONS } from '../src/utils/translations';

describe('MISSION PRE-EXTERNAL-UX-FUNCTIONAL-FIX-01 — TEST SUITE', () => {
  const rootDir = process.cwd();
  const desktopSidebarPath = path.join(rootDir, 'src', 'components', 'ui', 'DesktopSidebar.tsx');
  const desktopTopBarPath = path.join(rootDir, 'src', 'components', 'ui', 'DesktopTopBar.tsx');
  const notificationPopoverPath = path.join(rootDir, 'src', 'components', 'ui', 'NotificationPopover.tsx');
  const appPath = path.join(rootDir, 'src', 'App.tsx');
  const parametresPath = path.join(rootDir, 'src', 'components', 'Parametres.tsx');
  const indexCssPath = path.join(rootDir, 'src', 'index.css');
  const electronMainPath = path.join(rootDir, 'electron-main.cjs');
  const demoModeTabPath = path.join(rootDir, 'src', 'features', 'quality', 'components', 'DemoModeTab.tsx');

  const desktopSidebarContent = fs.readFileSync(desktopSidebarPath, 'utf8');
  const desktopTopBarContent = fs.readFileSync(desktopTopBarPath, 'utf8');
  const notificationPopoverContent = fs.readFileSync(notificationPopoverPath, 'utf8');
  const appContent = fs.readFileSync(appPath, 'utf8');
  const parametresContent = fs.readFileSync(parametresPath, 'utf8');
  const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');
  const electronMainContent = fs.readFileSync(electronMainPath, 'utf8');
  const demoModeTabContent = fs.readFileSync(demoModeTabPath, 'utf8');

  // --------------------------------------------------------------------------
  // NAVIGATION & RESPONSIVE SCROLL (UX-01 to UX-04)
  // --------------------------------------------------------------------------
  it('UX-01 : La sidebar contient tous les modules attendus (16 modules)', () => {
    const expectedModules = [
      'dashboard', 'canaris', 'cages', 'couples', 'reproduction',
      'sante', 'alimentation', 'calendrier',
      'genetics', 'intelligence', 'statistiques', 'reference_biologique',
      'depenses', 'ventes', 'parametres', 'demo_shortcut'
    ];

    for (const mod of expectedModules) {
      assert.ok(
        desktopSidebarContent.includes(`id: '${mod}'`),
        `Le module "${mod}" doit être présent dans DesktopSidebar.tsx`
      );
    }
  });

  it('UX-02 : La sidebar possède une zone scrollable verticalement bornée', () => {
    assert.ok(
      desktopSidebarContent.includes('overflow-y-auto'),
      'DesktopSidebar.tsx doit posséder un conteneur nav avec overflow-y-auto'
    );
    assert.ok(
      desktopSidebarContent.includes('min-h-0') || desktopSidebarContent.includes('h-full'),
      'DesktopSidebar.tsx doit contraindre sa hauteur flexbox (min-h-0 ou h-full max-h-screen)'
    );
  });

  it('UX-03 : Le menu mobile est scrollable et borné', () => {
    assert.ok(
      appContent.includes('id="mobile-navigation-drawer"'),
      'App.tsx doit définir le drawer mobile'
    );
    assert.ok(
      appContent.includes('overflow-y-auto') && appContent.includes('mobile-navigation-drawer'),
      'Le tiroir mobile doit comporter une zone scrollable overflow-y-auto'
    );
  });

  it('UX-04 : Aucun scrollbar-none ne bloque la navigation concernée', () => {
    // Vérifier DesktopSidebar
    const navMatchSidebar = desktopSidebarContent.match(/<nav[^>]*className="([^"]*)"/);
    assert.ok(navMatchSidebar, 'DesktopSidebar doit posséder une balise nav');
    assert.ok(
      !navMatchSidebar[1].includes('scrollbar-none'),
      'DesktopSidebar <nav> ne doit JAMAIS contenir "scrollbar-none"'
    );
    assert.ok(
      navMatchSidebar[1].includes('scrollbar-thin'),
      'DesktopSidebar <nav> doit adopter "scrollbar-thin"'
    );

    // Vérifier App.tsx mobile nav
    const mobileNavMatches = [...appContent.matchAll(/<nav[^>]*className="([^"]*)"[^>]*aria-label=\{t\('navigation'\)\}/g)];
    for (const match of mobileNavMatches) {
      assert.ok(
        !match[1].includes('scrollbar-none'),
        'Le menu mobile ne doit pas contenir "scrollbar-none"'
      );
    }

    // Vérifier que index.css définit les styles de scrollbar
    assert.ok(
      indexCssContent.includes('::-webkit-scrollbar'),
      'index.css doit définir des règles ::-webkit-scrollbar globales'
    );
    assert.ok(
      indexCssContent.includes('.scrollbar-thin'),
      'index.css doit définir la classe utilitaire .scrollbar-thin'
    );
  });

  // --------------------------------------------------------------------------
  // DEMO GENERATOR NOMENCLATURE & EXPOSURE (UX-05 to UX-07)
  // --------------------------------------------------------------------------
  it('UX-05 : Le générateur de démonstration est présent dans le code User', () => {
    assert.ok(
      fs.existsSync(demoModeTabPath),
      'DemoModeTab.tsx doit exister dans les composants User'
    );
    assert.ok(
      appContent.includes("case 'demo_shortcut':"),
      'App.tsx doit router vers DemoModeTab sous l\'onglet demo_shortcut'
    );
  });

  it('UX-06 : Le libellé utilisateur principal n\'est plus "Sandbox Démo"', () => {
    // Vérifier les traductions
    assert.notStrictEqual(
      TRANSLATIONS.fr.demoSandbox,
      'Sandbox Démo',
      'Le libellé FR ne doit plus être "Sandbox Démo"'
    );
    assert.strictEqual(
      TRANSLATIONS.fr.demoSandbox,
      'Données de Démonstration',
      'Le libellé FR doit être "Données de Démonstration"'
    );
    assert.strictEqual(
      TRANSLATIONS.en.demoSandbox,
      'Demo Data Generator',
      'Le libellé EN doit être "Demo Data Generator"'
    );

    // Vérifier l'en-tête de DemoModeTab
    assert.ok(
      !demoModeTabContent.includes('>Mode Démonstration Isolé<'),
      'DemoModeTab ne doit plus utiliser l\'intitulé obsolète sans clé de traduction'
    );
  });

  it('UX-07 : Le générateur est accessible depuis son point d\'entrée sidebar et Paramètres', () => {
    // Sidebar
    assert.ok(
      desktopSidebarContent.includes("id: 'demo_shortcut'"),
      'DesktopSidebar doit comporter l\'entrée demo_shortcut'
    );
    // Paramètres
    assert.ok(
      parametresContent.includes("data-testid=\"btn-open-demo-generator\""),
      'Parametres.tsx doit comporter un bouton d\'accès rapide au générateur démo'
    );
    assert.ok(
      parametresContent.includes("setCurrentTab('demo_shortcut')"),
      'Le bouton dans Parametres doit rediriger vers setCurrentTab("demo_shortcut")'
    );
  });

  // --------------------------------------------------------------------------
  // DEMO GENERATOR SPECIES PROFILE SCOPING (UX-08 to UX-10)
  // --------------------------------------------------------------------------
  it('UX-08 : Le Demo Generator respecte SpeciesProfileService', () => {
    const demoGenPath = path.join(rootDir, 'src', 'features', 'quality', 'utils', 'demoGenerator.ts');
    const demoGenContent = fs.readFileSync(demoGenPath, 'utf8');
    assert.ok(
      demoGenContent.includes('SpeciesProfileService.getActiveSpeciesIds()'),
      'demoGenerator.ts doit utiliser SpeciesProfileService.getActiveSpeciesIds()'
    );
  });

  it('UX-09 : Profil Canari uniquement → 100% canaris générés (aucune espèce externe)', () => {
    globalThis.localStorage.clear();
    const data = DemoDataGenerator.generate('small', {
      activeSpecies: ['canari']
    });

    assert.ok(data.canaris.length > 0, 'Des oiseaux doivent être générés');
    const nonCanaris = data.canaris.filter(b => b.espece !== 'canari');
    assert.strictEqual(
      nonCanaris.length, 0,
      `Aucun oiseau non-canari ne doit être généré. Trouvés : ${nonCanaris.map(b => b.espece).join(', ')}`
    );

    // Vérifier les couples
    assert.ok(data.couples.length > 0, 'Des couples doivent être générés');
  });

  it('UX-10 : Profil multi-espèces → uniquement les espèces actives', () => {
    globalThis.localStorage.clear();
    const active = ['canari', 'chardonneret_elegant'];
    const data = DemoDataGenerator.generate('small', {
      activeSpecies: active
    });

    assert.ok(data.canaris.length > 0, 'Des oiseaux doivent être générés');
    const invalidBirds = data.canaris.filter(b => !active.includes(b.espece as string));
    assert.strictEqual(
      invalidBirds.length, 0,
      `Tous les oiseaux doivent appartenir à [${active.join(', ')}]. Invalides: ${invalidBirds.map(b => b.espece).join(', ')}`
    );
  });

  // --------------------------------------------------------------------------
  // NOTIFICATION CENTER & REACTIVE BADGE (UX-11 to UX-16)
  // --------------------------------------------------------------------------
  it('UX-11 : Le bouton notification possède un vrai handler interactif', () => {
    assert.ok(
      !desktopTopBarContent.includes('onClick={() => {}}'),
      'DesktopTopBar.tsx ne doit plus comporter le bouchon vide onClick={() => {}}'
    );
    assert.ok(
      desktopTopBarContent.includes('setIsNotificationsOpen'),
      'Le bouton notification doit basculer l\'état isNotificationsOpen'
    );
    assert.ok(
      desktopTopBarContent.includes('aria-expanded={isNotificationsOpen}'),
      'Le bouton notification doit exposer aria-expanded'
    );
    assert.ok(
      desktopTopBarContent.includes('aria-haspopup="dialog"'),
      'Le bouton notification doit exposer aria-haspopup="dialog"'
    );
  });

  it('UX-12 : Le badge dépend du nombre réel de notifications non lues', () => {
    assert.ok(
      desktopTopBarContent.includes('NotificationService.getUnreadCount()'),
      'DesktopTopBar doit utiliser NotificationService.getUnreadCount()'
    );
    assert.ok(
      desktopTopBarContent.includes('unreadCount > 0'),
      'Le rendu du badge doit être conditionné par unreadCount > 0'
    );
  });

  it('UX-13 : Zéro notification non lue → badge absent du code conditionnel', () => {
    // Si unreadCount est 0, le badge <span data-testid="notification-badge" ne doit pas être rendu
    assert.ok(
      desktopTopBarContent.includes('{unreadCount > 0 && ('),
      'DesktopTopBar doit masquer le badge quand unreadCount === 0'
    );
  });

  it('UX-14 : Notification non lue → badge présent conditionnellement', () => {
    assert.ok(
      desktopTopBarContent.includes('bg-amber-500 rounded-full'),
      'Le badge d\'alerte doit être stylé avec bg-amber-500 en cas de notifications non lues'
    );
  });

  it('UX-15 : Le centre de notifications est accessible depuis la cloche via NotificationPopover', () => {
    assert.ok(
      desktopTopBarContent.includes('<NotificationPopover'),
      'DesktopTopBar doit instancier NotificationPopover'
    );
    assert.ok(
      fs.existsSync(notificationPopoverPath),
      'NotificationPopover.tsx doit exister'
    );
    assert.ok(
      notificationPopoverContent.includes('data-testid="notification-popover"'),
      'NotificationPopover doit être un dialogue modal accessible'
    );
  });

  it('UX-16 : Marquer une notification comme lue actualise les écouteurs réactivement', () => {
    globalThis.localStorage.clear();
    let callCount = 0;
    const unsub = NotificationService.subscribe(() => {
      callCount++;
    });

    // Ajouter une notification de test
    NotificationService.addNotification('repro', 'Test Alert Reactivity', 'Test Content', 'medium');
    assert.ok(callCount >= 1, 'L\'ajout d\'une notification doit notifier les abonnés');

    const notifs = NotificationService.getNotifications();
    const target = notifs.find(n => n.title === 'Test Alert Reactivity');
    assert.ok(target, 'La notification créée doit exister dans les notifications');

    // Marquer comme lue
    const prevCalls = callCount;
    NotificationService.markAsRead(target.id);
    assert.ok(callCount > prevCalls, 'markAsRead doit notifier les abonnés');

    // Nettoyage
    NotificationService.archiveNotification(target.id);
    unsub();
  });

  // --------------------------------------------------------------------------
  // INTERNATIONALIZATION & RTL (UX-17 to UX-18)
  // --------------------------------------------------------------------------
  it('UX-17 : Les traductions existent pour FR, EN, AR, ES, IT', () => {
    const languages = ['fr', 'en', 'ar', 'es', 'it'] as const;
    for (const lang of languages) {
      const dict = TRANSLATIONS[lang];
      assert.ok(dict, `Le dictionnaire ${lang} doit exister`);
      assert.ok(dict.demoSandbox, `${lang}.demoSandbox doit être défini`);
      assert.ok(dict.demoGenerator, `${lang}.demoGenerator doit être défini`);
      assert.ok(dict.openDemoGenerator, `${lang}.openDemoGenerator doit être défini`);
      assert.ok(dict.notificationCenterTitle, `${lang}.notificationCenterTitle doit être défini`);
      assert.ok(
        !dict.demoSandbox.toLowerCase().includes('sandbox'),
        `Le libellé utilisateur pour ${lang} ne doit pas contenir "sandbox". Actuel : "${dict.demoSandbox}"`
      );
    }
  });

  it('UX-18 : Le mode RTL fonctionne pour le centre de notifications et le layout', () => {
    assert.ok(
      notificationPopoverContent.includes("dir={isRtl ? 'rtl' : 'ltr'}"),
      'NotificationPopover doit respecter la direction RTL'
    );
    assert.ok(
      notificationPopoverContent.includes("isRtl ? 'left-0' : 'right-0'"),
      'NotificationPopover doit s\'aligner à gauche en mode RTL'
    );
    assert.ok(
      appContent.includes("isRtl ? 'rtl' : 'ltr'"),
      'App.tsx doit appliquer la classe RTL globale'
    );
  });

  // --------------------------------------------------------------------------
  // BASELINE FUNCTIONAL PRESERVATION (UX-19 to UX-20)
  // --------------------------------------------------------------------------
  it('UX-19 : SpeciesProfileService reste fonctionnel et scellé', () => {
    globalThis.localStorage.clear();
    const active = SpeciesProfileService.getActiveSpeciesIds();
    assert.ok(Array.isArray(active), 'getActiveSpeciesIds doit renvoyer un tableau');
    assert.ok(active.length > 0, 'Au moins une espèce doit être active par défaut');
    assert.ok(SpeciesProfileService.isSpeciesActive('canari'), 'Canari doit être actif');
  });

  it('UX-20 : L\'isolation User/Admin reste fonctionnelle', () => {
    // Vérifier les chemins AppData distincts dans electron-main.cjs
    assert.ok(
      electronMainContent.includes("path.join(appDataPath, 'Bird Academy Admin')"),
      'Admin doit utiliser "Bird Academy Admin"'
    );
    assert.ok(
      electronMainContent.includes("path.join(appDataPath, APP_CANONICAL_NAME)"),
      'User doit utiliser le nom canonique distinct'
    );
  });
});
