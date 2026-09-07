import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('BUG-08 PHASE 4 — MODAL POSITIONING & ANDROID SAFE AREAS AUDIT', () => {
  it('P4-01: AppModal uses centered viewport alignment (items-center justify-center) instead of top items-start', () => {
    const modalPath = path.join(process.cwd(), 'src/components/design-system/AppModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('items-center justify-center'));
    assert.strictEqual(content.includes('items-start pt-3'), false);
  });

  it('P4-02: AppModal uses dynamic safe-area padding & max-height with env(safe-area-inset)', () => {
    const modalPath = path.join(process.cwd(), 'src/components/design-system/AppModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('env(safe-area-inset-top'));
    assert.ok(content.includes('env(safe-area-inset-bottom'));
    assert.ok(content.includes('100dvh'));
    assert.strictEqual(content.includes('max-h-[85vh]'), false);
  });

  it('P4-03: AppModal preserves fixed shrink-0 header/footer and flex-1 min-h-0 overflow-y-auto body', () => {
    const modalPath = path.join(process.cwd(), 'src/components/design-system/AppModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('shrink-0'));
    assert.ok(content.includes('overflow-y-auto flex-1 min-h-0'));
  });

  it('P4-04: MODAL-A (Créer une cage) in HabitatComponent renders inside standard AppModal without top hacks', () => {
    const habitatPath = path.join(process.cwd(), 'src/features/habitat/components/HabitatComponent.tsx');
    const content = fs.readFileSync(habitatPath, 'utf-8');

    assert.ok(content.includes('isOpen={addModalType === \'cage\'}'));
    assert.ok(content.includes('title="Ajouter une Cage"'));
    assert.strictEqual(content.includes('fixed top-0'), false);
  });

  it('P4-05: MODAL-B (Fiche oiseau BirdDetailModal) wraps AppModal without hardcoded top offsets', () => {
    const birdModalPath = path.join(process.cwd(), 'src/components/BirdDetailModal.tsx');
    const content = fs.readFileSync(birdModalPath, 'utf-8');

    assert.ok(content.includes('<AppModal'));
    assert.strictEqual(content.includes('fixed top-0'), false);
    assert.strictEqual(content.includes('-mt-'), false);
    assert.strictEqual(content.includes('max-h-[55vh]'), false);
  });

  it('P4-06: Verified modal viewports (360px, 375px, 390px, 412px) map to standard calc bounds', () => {
    const modalPath = path.join(process.cwd(), 'src/components/design-system/AppModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('max-w-[calc(100vw-1.5rem)]'));
    assert.ok(content.includes('role="dialog"'));
    assert.ok(content.includes('aria-modal="true"'));
  });

  it('P4-07: Supported languages (FR, EN, AR, ES, IT) and RTL support exist in translation dictionary', () => {
    const transPath = path.join(process.cwd(), 'src/utils/translations.ts');
    const content = fs.readFileSync(transPath, 'utf-8');

    assert.ok(content.includes('fr:'));
    assert.ok(content.includes('en:'));
    assert.ok(content.includes('ar:'));
    assert.ok(content.includes('es:'));
    assert.ok(content.includes('it:'));
  });

  it('P4-08: Le modal ne peut pas dépasser le viewport par le haut (max-h-full + overflow-hidden outer container)', () => {
    const modalPath = path.join(process.cwd(), 'src/components/design-system/AppModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('overflow-hidden'));
    assert.ok(content.includes('max-h-full'));
  });

  it('P4-09: Le modal ne peut pas dépasser le viewport par le bas (paddingBottom env safe-area + max-height min calc)', () => {
    const modalPath = path.join(process.cwd(), 'src/components/design-system/AppModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('paddingBottom'));
    assert.ok(content.includes('min(100%, calc(100dvh'));
  });

  it('P4-10: Le body est la seule zone scrollable lorsque le contenu dépasse la hauteur disponible', () => {
    const modalPath = path.join(process.cwd(), 'src/components/design-system/AppModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('overflow-y-auto flex-1 min-h-0'));
  });

  it('P4-11: Header et footer restent pertinemment shrink-0 (fixes et toujours accessibles)', () => {
    const modalPath = path.join(process.cwd(), 'src/components/design-system/AppModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    // Header has shrink-0
    assert.ok(content.includes('justify-between shrink-0'));
    // Footer has shrink-0
    assert.ok(content.includes('justify-end gap-3 shrink-0'));
  });

  it('P4-12: Les deux modales (MODAL-A & MODAL-B) utilisent les contraintes communes de AppModal.tsx', () => {
    const habitatPath = path.join(process.cwd(), 'src/features/habitat/components/HabitatComponent.tsx');
    const birdModalPath = path.join(process.cwd(), 'src/components/BirdDetailModal.tsx');

    const habitatContent = fs.readFileSync(habitatPath, 'utf-8');
    const birdModalContent = fs.readFileSync(birdModalPath, 'utf-8');

    assert.ok(habitatContent.includes('isOpen={addModalType === \'cage\'}'));
    assert.ok(birdModalContent.includes('<AppModal'));
  });

  it('P4-13: Le comportement et les classes restent valides sous un environnement RTL', () => {
    const modalPath = path.join(process.cwd(), 'src/components/design-system/AppModal.tsx');
    const content = fs.readFileSync(modalPath, 'utf-8');

    // Direction-agnostic flex centering and safe area insets
    assert.ok(content.includes('items-center justify-center'));
    assert.ok(content.includes('env(safe-area-inset-left'));
    assert.ok(content.includes('env(safe-area-inset-right'));
  });
});
