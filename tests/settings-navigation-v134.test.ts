import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('MISSION V1.3.4 — SETTINGS NAVIGATION AUDIT', () => {
  it('SETTINGS-01: Paramètres navigation item exists in App.tsx allNavigationItems array', () => {
    const appTsx = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');

    assert.ok(
      appTsx.includes("{ id: 'parametres', label: t('parametres'), icon: Settings }"),
      'Paramètres must be included in allNavigationItems array'
    );
  });

  it('SETTINGS-02: Paramètres switch case exists in App.tsx render logic', () => {
    const appTsx = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');

    assert.ok(
      appTsx.includes("case 'parametres':"),
      'Paramètres switch case must exist in App.tsx render block'
    );
  });

  it('SETTINGS-03 & 04: Parametres component imports useLicensing and supports backup export/import', () => {
    const paramComponent = fs.readFileSync(path.resolve('src/components/Parametres.tsx'), 'utf8');

    assert.ok(paramComponent.includes('useLicensing'), 'Parametres component must connect to useLicensing hook');
    assert.ok(paramComponent.includes('onExportBackup'), 'Parametres component must expose backup export action');
    assert.ok(paramComponent.includes('onImportBackup'), 'Parametres component must expose backup import action');
  });
});
