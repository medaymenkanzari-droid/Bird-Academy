/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CalendarDateParts {
  year: number;
  month: number; // 0-indexed (0 = Jan, 11 = Dec)
  day: number;
}

export class CalendarEngine {
  /**
   * Robust date parser supporting YYYY-MM-DD, ISO 8601 strings, Date objects, and numeric timestamps.
   * Compares calendar dates strictly without time component or timezone offset shifts.
   */
  static parseDate(value: string | number | Date | null | undefined): CalendarDateParts | null {
    if (!value && value !== 0) return null;

    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;
      return { year: value.getFullYear(), month: value.getMonth(), day: value.getDate() };
    }

    const str = String(value).trim();
    if (!str) return null;

    // Direct YYYY-MM-DD prefix extraction (handles "YYYY-MM-DD", "YYYY-MM-DDT...", "YYYY-MM-DD HH:mm:ss")
    const match = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(str);
    if (match) {
      const year = Number(match[1]);
      const monthNumber = Number(match[2]);
      const day = Number(match[3]);
      if (monthNumber >= 1 && monthNumber <= 12 && day >= 1 && day <= 31) {
        const daysInMonth = new Date(year, monthNumber, 0).getDate();
        if (day <= daysInMonth) {
          return { year, month: monthNumber - 1, day };
        }
      }
      return null;
    }

    // Fallback: numeric timestamp or native Date parse
    const num = Number(str);
    const d = new Date(!isNaN(num) ? num : str);
    if (!isNaN(d.getTime())) {
      return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    }

    return null;
  }

  /**
   * Compares whether two dates represent the exact same calendar day.
   */
  static isSameDay(
    dateA: string | number | Date | null | undefined,
    dateB: string | number | Date | null | undefined
  ): boolean {
    const pA = this.parseDate(dateA);
    const pB = this.parseDate(dateB);
    if (!pA || !pB) return false;
    return pA.year === pB.year && pA.month === pB.month && pA.day === pB.day;
  }

  /**
   * Adds specified days to a date string and returns formatted YYYY-MM-DD.
   */
  static addDays(value: string | number | Date, days: number): string | null {
    const parsed = this.parseDate(value);
    if (!parsed || !Number.isSafeInteger(days)) return null;

    const date = new Date(Date.UTC(parsed.year, parsed.month, parsed.day));
    date.setUTCDate(date.getUTCDate() + days);
    
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
