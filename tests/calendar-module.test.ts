import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CalendarEngine } from '../src/business/CalendarEngine';
import { TRANSLATIONS } from '../src/utils/translations';

test('calendar projections reject impossible dates and preserve UTC day boundaries', () => {
  assert.equal(CalendarEngine.addDays('2026-02-30', 13), null);
  assert.equal(CalendarEngine.addDays('date-invalide', 13), null);
  assert.equal(CalendarEngine.addDays('2026-07-02', 13), '2026-07-15');
  assert.equal(CalendarEngine.addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(CalendarEngine.addDays('2024-02-29', 1), '2024-03-01');
});

test('calendar focus and today marker are derived from the supplied current date', () => {
  const now = new Date(2026, 6, 29, 12, 0, 0);
  assert.deepEqual(CalendarEngine.getTodayParts(now), { year: 2026, month: 6, day: 29 });
  assert.equal(CalendarEngine.isToday(2026, 6, 29, now), true);
  assert.equal(CalendarEngine.isToday(2026, 6, 8, now), false);
});

test('calendar screens remain translated in all five supported languages', () => {
  const keys = [
    'calendarTitle', 'calendarSub', 'calendarToday', 'eventsOfDay', 'noDaySelected',
    'clickCalendarPrompt', 'calmDay', 'calmDayDesc', 'layingOfEggs', 'breedingCouple',
    'expectedHatch', 'checkNestOf', 'weaningAdvised', 'weaningAdvisedDesc',
    'healthCareTreatment', 'calendarPreviousMonth', 'calendarNextMonth',
    'calendarDayLabel', 'calendarCoupleFallback', 'calendarEvent_ponte',
    'calendarEvent_eclosion', 'calendarEvent_sevrage', 'calendarEvent_sante'
  ] as const;

  for (const language of ['fr', 'en', 'ar', 'es', 'it'] as const) {
    for (const key of keys) {
      assert.ok(TRANSLATIONS[language][key]?.trim(), `${language}.${key} must be translated`);
    }
  }
});
