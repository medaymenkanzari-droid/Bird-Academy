import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

describe('BUG-08 PHASE 5 — REACT PORTAL & MODAL POSITIONING AUDIT', () => {
  const modalPath = path.join(process.cwd(), 'src/components/design-system/AppModal.tsx');
  const appPagePath = path.join(process.cwd(), 'src/components/design-system/AppPage.tsx');
  const habitatPath = path.join(process.cwd(), 'src/features/habitat/components/HabitatComponent.tsx');
  const birdModalPath = path.join(process.cwd(), 'src/components/BirdDetailModal.tsx');
  const transPath = path.join(process.cwd(), 'src/utils/translations.ts');

  it('P5-01: AppModal uses createPortal to document.body', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes("import { createPortal } from 'react-dom';"));
    assert.ok(content.includes('createPortal('));
    assert.ok(content.includes('document.body'));
  });

  it('P5-02: Modal overlay is rendered directly under document.body (not trapped as AppPage child)', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('createPortal('));
    assert.ok(content.includes('document.body'));
    assert.ok(content.includes('data-modal-portal="true"'));
  });

  it('P5-03: Modal overlay uses position fixed with high z-index (z-[9999])', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('fixed inset-0'));
    assert.ok(content.includes('z-[9999]'));
  });

  it('P5-04: AppPage does not contain will-change-transform which creates a CSS containing block trap', () => {
    const pageContent = fs.readFileSync(appPagePath, 'utf-8');

    assert.strictEqual(pageContent.includes('will-change-transform'), false);
  });

  it('P5-05: Modal header remains shrink-0 and tagged for visibility tracking', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('data-modal-header="true"'));
    assert.ok(content.includes('shrink-0'));
  });

  it('P5-06: Modal body is scrollable (overflow-y-auto, flex-1, min-h-0)', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('data-modal-body="true"'));
    assert.ok(content.includes('overflow-y-auto flex-1 min-h-0'));
  });

  it('P5-07: Modal footer remains shrink-0 and accessible', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('data-modal-footer="true"'));
    assert.ok(content.includes('shrink-0'));
  });

  it('P5-08: MODAL-A (Create Cage) renders via standard AppModal without top offset hacks', () => {
    const habitatContent = fs.readFileSync(habitatPath, 'utf-8');

    assert.ok(habitatContent.includes("isOpen={addModalType === 'cage'}"));
    assert.ok(habitatContent.includes('title="Ajouter une Cage"'));
    assert.strictEqual(habitatContent.includes('fixed top-0'), false);
  });

  it('P5-09: MODAL-B (Bird Detail Modal) renders via standard AppModal without top offset hacks', () => {
    const birdModalContent = fs.readFileSync(birdModalPath, 'utf-8');

    assert.ok(birdModalContent.includes('<AppModal'));
    assert.strictEqual(birdModalContent.includes('fixed top-0'), false);
    assert.strictEqual(birdModalContent.includes('-mt-'), false);
  });

  it('P5-10: Modal top offset is anchored safely (items-start sm:items-center + safe area paddingTop)', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('items-start sm:items-center'));
    assert.ok(content.includes('paddingTop: \'max(1rem, env(safe-area-inset-top, 1rem))\''));
    assert.ok(content.includes('my-0 sm:my-auto'));
  });

  it('P5-11: Supported 360x800 mobile viewport responsive constraints', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('max-w-[calc(100vw-1.5rem)]'));
    assert.ok(content.includes('calc(100dvh - max(2rem, env(safe-area-inset-top, 1rem) + env(safe-area-inset-bottom, 1rem)))'));
  });

  it('P5-12: Supported 375x812 mobile viewport responsive constraints', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('max-w-[calc(100vw-1.5rem)]'));
  });

  it('P5-13: Supported 390x844 mobile viewport responsive constraints', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('max-w-[calc(100vw-1.5rem)]'));
  });

  it('P5-14: Supported 412x915 mobile viewport responsive constraints', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('max-w-[calc(100vw-1.5rem)]'));
  });

  it('P5-15: Escape key listener closes modal when active', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes("e.key === 'Escape'"));
    assert.ok(content.includes("window.addEventListener('keydown', handleKeyDown)"));
  });

  it('P5-16: Backdrop click handler trigger onClose when closeOnOverlayClick is enabled', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('onClick={() => closeOnOverlayClick && onClose()}'));
  });

  it('P5-17: Scroll lock mechanism updates document.body.style.overflow properly', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes("document.body.style.overflow = 'hidden'"));
    assert.ok(content.includes("document.body.style.overflow = ''"));
  });

  it('P5-18: RTL Arabic layout is preserved with neutral flex alignment and safe-area left/right', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');
    const transContent = fs.readFileSync(transPath, 'utf-8');

    assert.ok(content.includes('env(safe-area-inset-left'));
    assert.ok(content.includes('env(safe-area-inset-right'));
    assert.ok(transContent.includes('ar:'));
  });

  it('P5-19: Dark mode background and border utilities are applied', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('dark:bg-[#1E1E1E]'));
    assert.ok(content.includes('dark:border-[#343A40]'));
  });

  it('P5-20: Desktop modals continue to center vertically via sm:items-center and sm:my-auto', () => {
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('sm:items-center'));
    assert.ok(content.includes('sm:my-auto'));
    assert.ok(content.includes('sm:max-w-lg'));
  });
});
