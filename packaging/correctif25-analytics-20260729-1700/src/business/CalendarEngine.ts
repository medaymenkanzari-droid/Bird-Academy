/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CalendarDateParts {
  year: number;
  month: number;
  day: number;
}

export class CalendarEngine {
  static parseDate(value: string): CalendarDateParts | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const monthNumber = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, monthNumber - 1, day));

    if (
      date.getUTCFullYear() !== year
      || date.getUTCMonth() !== monthNumber - 1
      || date.getUTCDate() !== day
    ) {
      return null;
    }

    return { year, month: monthNumber - 1, day };
  }

  static addDays(value: string, days: number): string | null {
    const parsed = this.parseDate(value);
    if (!parsed || !Number.isSafeInteger(days)) return null;

    const date = new Date(Date.UTC(parsed.year, parsed.month, parsed.day));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }

  static getTodayParts(now: Date = new Date()): CalendarDateParts {
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
    };
  }

  static isToday(year: number, month: number, day: number, now: Date = new Date()): boolean {
    const today = this.getTodayParts(now);
    return today.year === year && today.month === month && today.day === day;
  }
}
