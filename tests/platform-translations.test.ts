import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { getPlatformTranslation } from '../src/features/platform/utils/translations';

const languages = ['fr', 'en', 'ar', 'es', 'it'] as const;
const administrationKeys = [
  'monitoring',
  'backupCenter',
  'integrityTitle',
  'notificationCenter',
  'unifiedCalendar',
  'auditTitle',
  'diagnostics',
  'setV2Title',
];

test('all administration navigation labels exist in the five supported languages', () => {
  languages.forEach(language => {
    administrationKeys.forEach(key => {
      const translated = getPlatformTranslation(language, key);
      assert.notEqual(translated, key, `${language}.${key} ne doit pas afficher la clé technique`);
      assert.ok(translated.trim().length > 0, `${language}.${key} doit être renseigné`);
    });
  });
});

test('administration components never request obsolete visible translation keys', async () => {
  const componentFiles = [
    'src/features/platform/components/PlatformDashboard.tsx',
    'src/features/platform/components/IntegrityTab.tsx',
    'src/features/platform/components/NotificationTab.tsx',
  ];
  const contents = await Promise.all(componentFiles.map(path => readFile(path, 'utf8')));

  contents.forEach(content => {
    assert.equal(content.includes("tPlat('integrityCenter')"), false);
    assert.equal(content.includes("tPlat('notifCenter')"), false);
  });
});
