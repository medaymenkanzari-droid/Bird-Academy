/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';

describe('MISSION — ARABIC I18N & FULL-WIDTH RESPONSIVE DISPLAY', () => {
  const rootDir = process.cwd();

  test('AR-01 : App.tsx main container uses expanded widescreen constraint (max-w-[1850px])', () => {
    const appPath = path.join(rootDir, 'src', 'App.tsx');
    const content = fs.readFileSync(appPath, 'utf-8');
    assert.ok(content.includes('max-w-[1850px]'), 'App.tsx should allow widescreen expansion up to 1850px');
    assert.ok(!content.includes('max-w-7xl mx-auto w-full min-w-0'), 'App.tsx should not constrain main content to 1280px max-w-7xl');
  });

  test('AR-02 : Canaris.tsx bird table takes full available width (w-full without 2/3 column restriction)', () => {
    const canarisPath = path.join(rootDir, 'src', 'components', 'Canaris.tsx');
    const content = fs.readFileSync(canarisPath, 'utf-8');
    assert.ok(content.includes('className="w-full space-y-4"'), 'Bird table container should be w-full');
    assert.ok(!content.includes('grid grid-cols-1 lg:grid-cols-3 gap-6'), 'Bird table should not be locked in a truncated 2/3 grid');
  });

  test('AR-03 : Couples.tsx displays full bird names without premature flex squeezing and has valid Arabic status badge', () => {
    const couplesPath = path.join(rootDir, 'src', 'components', 'Couples.tsx');
    const content = fs.readFileSync(couplesPath, 'utf-8');
    assert.ok(content.includes('flex-1 min-w-0'), 'Couples male and female mini cards should use flex-1 min-w-0');
    assert.ok(content.includes("'نشط'"), 'Couples status badge should support Arabic نشط');
    assert.ok(!content.includes("t('activeCouples').slice(0, -1)"), 'Couples status badge should not slice Arabic words');
  });

  test('AR-04 : Reproduction.tsx mode switcher buttons are translated into Arabic', () => {
    const reproPath = path.join(rootDir, 'src', 'components', 'Reproduction.tsx');
    const content = fs.readFileSync(reproPath, 'utf-8');
    assert.ok(content.includes('متابعة الأعشاش والحضانة'), 'Nest tracking tab button must have Arabic translation');
    assert.ok(content.includes('جميع الدورات'), 'All cycles tab button must have Arabic translation');
    assert.ok(content.includes('reproDashboardTitle: "إدارة التكاثر"'), 'LOCAL_LABELS.ar must have reproduction dashboard title');
  });

  test('AR-05 : EggMatrixCard.tsx supports Arabic egg statuses, action buttons, counters, and tip', () => {
    const eggCardPath = path.join(rootDir, 'src', 'components', 'design-system', 'EggMatrixCard.tsx');
    const content = fs.readFileSync(eggCardPath, 'utf-8');
    assert.ok(content.includes("'تم وضعه'"), 'EggMatrixCard must translate laid status to Arabic');
    assert.ok(content.includes("'مخصب'"), 'EggMatrixCard must translate fertile status to Arabic');
    assert.ok(content.includes("'فارغ'"), 'EggMatrixCard must translate clear status to Arabic');
    assert.ok(content.includes("'فقس'"), 'EggMatrixCard must translate hatched status to Arabic');
    assert.ok(content.includes('فحص ضوئي سريع'), 'EggMatrixCard quick candling button must have Arabic translation');
    assert.ok(content.includes('تعديل الحضنة'), 'EggMatrixCard edit clutch button must have Arabic translation');
    assert.ok(content.includes('💡 انقر على البيضة لتغيير حالتها'), 'EggMatrixCard must have Arabic interactive tip');
  });

  test('AR-06 : IncubationTimeline.tsx supports Arabic milestones, chips, action labels, and RTL layout', () => {
    const timelinePath = path.join(rootDir, 'src', 'components', 'design-system', 'IncubationTimeline.tsx');
    const content = fs.readFileSync(timelinePath, 'utf-8');
    assert.ok(content.includes('الجدول الزمني للحضانة'), 'IncubationTimeline header must have Arabic translation');
    assert.ok(content.includes('بدء الحضانة'), 'Laying milestone must have Arabic translation');
    assert.ok(content.includes('الفحص الضوئي الإجباري'), 'Candling milestone must have Arabic translation');
    assert.ok(content.includes('الفقس المتوقع'), 'Hatching milestone must have Arabic translation');
    assert.ok(content.includes('تحجيل الفراخ'), 'Banding milestone must have Arabic translation');
    assert.ok(content.includes('حضانة أولية'), 'Initial incubation chip must have Arabic translation');
    assert.ok(content.includes('فترة الفحص الضوئي نشطة'), 'Candling window chip must have Arabic translation');
    assert.ok(content.includes("isRtl ? 'right-[19px]' : 'left-[19px]'"), 'Connector line must adapt to RTL');
  });

  test('AR-07 : WrightConsanguinityGauge.tsx supports Arabic recommendations and labels', () => {
    const gaugePath = path.join(rootDir, 'src', 'components', 'design-system', 'WrightConsanguinityGauge.tsx');
    const content = fs.readFileSync(gaugePath, 'utf-8');
    assert.ok(content.includes('قرابة في حدها الأدنى'), 'Safe consanguinity recommendation must be in Arabic');
    assert.ok(content.includes('قرابة معتدلة'), 'Moderate consanguinity recommendation must be in Arabic');
    assert.ok(content.includes('خطر مرتفع لتدهور النسل'), 'Critical consanguinity recommendation must be in Arabic');
    assert.ok(content.includes("'معامل القرابة'"), 'Title fallback must support Arabic');
    assert.ok(content.includes("'مؤشر F'"), 'F-index badge must support Arabic');
  });

  test('AR-08 : NestTrackingView.tsx active nest section, nest cards and modals have full Arabic support', () => {
    const nestViewPath = path.join(rootDir, 'src', 'features', 'breeding', 'components', 'NestTrackingView.tsx');
    const content = fs.readFileSync(nestViewPath, 'utf-8');
    assert.ok(content.includes('الأعشاش النشطة والحضانة الجارية'), 'Active nests section header must have Arabic translation');
    assert.ok(content.includes('عش #'), 'Nest card title must support Arabic');
    assert.ok(content.includes('يوم +'), 'Elapsed days in nest card must support Arabic');
    assert.ok(content.includes('تسجيل وضع بيض جديد'), 'Ponte modal title must support Arabic');
    assert.ok(content.includes('فحص ضوئي سريع للحضنة'), 'Candling modal title must support Arabic');
    assert.ok(content.includes('تسجيل المواليد / الفقس'), 'Hatch modal title must support Arabic');
    assert.ok(content.includes('فطام الفرخ وإضافته للمزرعة'), 'Weaning modal title must support Arabic');
  });
});
