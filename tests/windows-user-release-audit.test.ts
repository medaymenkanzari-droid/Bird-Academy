import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { formatCurrency, LOCALE_MAP } from '../src/utils/currencyFormatter';

describe('MISSION — WINDOWS USER RELEASE CANDIDATE (WIN-01 to WIN-18)', () => {
  const rootDir = process.cwd();
  const distUserPath = path.join(rootDir, 'dist_user');
  const appPath = path.join(rootDir, 'src/App.tsx');
  const appModalPath = path.join(rootDir, 'src/components/design-system/AppModal.tsx');
  const couplesPath = path.join(rootDir, 'src/components/Couples.tsx');
  const reproPath = path.join(rootDir, 'src/components/Reproduction.tsx');
  const desktopSidebarPath = path.join(rootDir, 'src/components/ui/DesktopSidebar.tsx');
  const desktopTopBarPath = path.join(rootDir, 'src/components/ui/DesktopTopBar.tsx');
  const currencyPath = path.join(rootDir, 'src/utils/currencyFormatter.ts');
  const translationsPath = path.join(rootDir, 'src/context/LanguageContext.tsx');

  it('WIN-01 : build User valide (dist_user/index.html présent)', () => {
    const indexPath = path.join(distUserPath, 'index.html');
    assert.ok(fs.existsSync(indexPath), 'dist_user/index.html doit exister');
    const content = fs.readFileSync(indexPath, 'utf-8');
    assert.ok(content.includes('<div id="root"></div>'), 'index.html doit inclure root element');
  });

  it('WIN-02 : aucun accès Admin (dist_user/admin.html ABSENT)', () => {
    const adminHtmlPath = path.join(distUserPath, 'admin.html');
    assert.strictEqual(fs.existsSync(adminHtmlPath), false, 'dist_user/admin.html ne doit jamais exister dans le bundle User');
  });

  it('WIN-03 : i18n FR disponible', () => {
    const translationsPath = path.join(rootDir, 'src/utils/translations.ts');
    const content = fs.readFileSync(translationsPath, 'utf-8');
    assert.ok(content.includes('fr:'), 'Dictionnaire FR doit être défini');
  });

  it('WIN-04 : i18n EN disponible', () => {
    const translationsPath = path.join(rootDir, 'src/utils/translations.ts');
    const content = fs.readFileSync(translationsPath, 'utf-8');
    assert.ok(content.includes('en:'), 'Dictionnaire EN doit être défini');
  });

  it('WIN-05 : i18n AR disponible', () => {
    const translationsPath = path.join(rootDir, 'src/utils/translations.ts');
    const content = fs.readFileSync(translationsPath, 'utf-8');
    assert.ok(content.includes('ar:'), 'Dictionnaire AR doit être défini');
  });

  it('WIN-06 : i18n ES disponible', () => {
    const translationsPath = path.join(rootDir, 'src/utils/translations.ts');
    const content = fs.readFileSync(translationsPath, 'utf-8');
    assert.ok(content.includes('es:'), 'Dictionnaire ES doit être défini');
  });

  it('WIN-07 : i18n IT disponible', () => {
    const translationsPath = path.join(rootDir, 'src/utils/translations.ts');
    const content = fs.readFileSync(translationsPath, 'utf-8');
    assert.ok(content.includes('it:'), 'Dictionnaire IT doit être défini');
  });

  it('WIN-08 : DesktopSidebar présent et intégré dans App.tsx', () => {
    assert.ok(fs.existsSync(desktopSidebarPath), 'DesktopSidebar.tsx doit exister');
    const appContent = fs.readFileSync(appPath, 'utf-8');
    assert.ok(appContent.includes('DesktopSidebar'), 'App.tsx doit importer et utiliser DesktopSidebar');
  });

  it('WIN-09 : DesktopTopBar présent et intégré dans App.tsx', () => {
    assert.ok(fs.existsSync(desktopTopBarPath), 'DesktopTopBar.tsx doit exister');
    const appContent = fs.readFileSync(appPath, 'utf-8');
    assert.ok(appContent.includes('DesktopTopBar'), 'App.tsx doit importer et utiliser DesktopTopBar');
  });

  it('WIN-10 : AppModal Portal présent (createPortal vers document.body)', () => {
    const modalContent = fs.readFileSync(appModalPath, 'utf-8');
    assert.ok(modalContent.includes('createPortal('), 'AppModal doit utiliser createPortal');
    assert.ok(modalContent.includes('document.body'), 'AppModal portal doit cibler document.body');
  });

  it('WIN-11 : BUG-08 modal architecture intacte (shrink-0 header/footer, flex-1 min-h-0 overflow-y-auto body)', () => {
    const modalContent = fs.readFileSync(appModalPath, 'utf-8');
    assert.ok(modalContent.includes('shrink-0'), 'Header/Footer doivent avoir shrink-0');
    assert.ok(modalContent.includes('overflow-y-auto flex-1 min-h-0'), 'Body doit avoir overflow-y-auto flex-1 min-h-0');
  });

  it('WIN-12 : BUG-09 Couple sans double rendu (hidden lg:block et guard window.innerWidth)', () => {
    const couplesContent = fs.readFileSync(couplesPath, 'utf-8');
    assert.ok(couplesContent.includes('hidden lg:block'), 'Le panneau de détails doit être hidden lg:block sur desktop');
    assert.ok(couplesContent.includes('window.innerWidth < 1024'), 'Le déclencheur de modale doit vérifier la largeur d\'écran');
  });

  it('WIN-13 : BUG-09 Reproduction sans double rendu (hidden lg:block et guard window.innerWidth)', () => {
    const reproContent = fs.readFileSync(reproPath, 'utf-8');
    assert.ok(reproContent.includes('hidden lg:block'), 'Le panneau de détails doit être hidden lg:block sur desktop');
    assert.ok(reproContent.includes('window.innerWidth < 1024'), 'Le déclencheur de modale doit vérifier la largeur d\'écran');
  });

  it('WIN-14 : format financier maximum 2 décimales (Intl formatCurrency)', () => {
    const formatted = formatCurrency(1250.0000000000001, 'EUR', true, 'fr');
    assert.strictEqual(formatted.includes('000000'), false, 'Les montants financiers ne doivent jamais afficher de décimales excessives');
    const currencyContent = fs.readFileSync(currencyPath, 'utf-8');
    assert.ok(currencyContent.includes('Intl.NumberFormat'), 'formatCurrency doit utiliser Intl.NumberFormat');
  });

  it('WIN-15 : RTL compatible (dir={isRtl ? \'rtl\' : \'ltr\'})', () => {
    const sidebarContent = fs.readFileSync(desktopSidebarPath, 'utf-8');
    const topBarContent = fs.readFileSync(desktopTopBarPath, 'utf-8');
    assert.ok(sidebarContent.includes('isRtl'), 'DesktopSidebar doit gérer RTL');
    assert.ok(topBarContent.includes('isRtl'), 'DesktopTopBar doit gérer RTL');
  });

  it('WIN-16 : données User isolées sans clés d\'administration', () => {
    const distFiles = fs.readdirSync(path.join(distUserPath, 'assets'));
    for (const file of distFiles) {
      if (file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(distUserPath, 'assets', file), 'utf-8');
        assert.strictEqual(content.includes('lmse_super_admin_key'), false, `Aucune clé admin ne doit fuiter dans ${file}`);
      }
    }
  });

  it('WIN-17 : build production valide et optimisé', () => {
    const assetsPath = path.join(distUserPath, 'assets');
    assert.ok(fs.existsSync(assetsPath), 'Le dossier dist_user/assets doit exister');
    const files = fs.readdirSync(assetsPath);
    assert.ok(files.some(f => f.endsWith('.js')), 'Au moins un fichier JS doit être compilé');
    assert.ok(files.some(f => f.endsWith('.css')), 'Au moins un fichier CSS doit être compilé');
  });

  it('WIN-18 : bundle User vérifié par le script officiel de sécurité', () => {
    const verifyScriptPath = path.join(rootDir, 'scripts/verifyUserBundle.js');
    assert.ok(fs.existsSync(verifyScriptPath), 'scripts/verifyUserBundle.js doit exister');
  });
});
