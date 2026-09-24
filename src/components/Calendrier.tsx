/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Egg, Activity, Sparkles, AlertCircle, CheckCircle, Clock, Printer, Download } from 'lucide-react';
import { Ponte, Sante, Canari, Couple, Reproduction } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CalendarEngine } from '../business/CalendarEngine';
import { printDocument, exportDocumentAsPDF } from '../utils/printUtils';

interface CalendrierProps {
  pontes: Ponte[];
  sante: Sante[];
  canaris: Canari[];
  couples: Couple[];
  reproductions: Reproduction[];
}

export default function CalendrierComponent({
  pontes,
  sante,
  canaris,
  couples,
  reproductions
}: CalendrierProps) {
  const { t, currentLanguage, isRtl } = useLanguage();
  const [initialDate] = useState(() => CalendarEngine.getTodayParts());
  const [currentYear, setCurrentYear] = useState(initialDate.year);
  const [currentMonth, setCurrentMonth] = useState(initialDate.month);
  const [selectedDay, setSelectedDay] = useState<number | null>(initialDate.day);

  const getMonthName = (monthIndex: number, lang: string) => {
    const date = new Date(currentYear, monthIndex, 5);
    const monthName = date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang, { month: 'long' });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  };

  const getDaysOfWeek = (lang: string) => {
    const days = [];
    // 2024-01-01 is a Monday and provides a stable locale reference week.
    for (let i = 0; i < 7; i++) {
      const d = new Date(2024, 0, 1 + i);
      let name = d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang, { weekday: 'short' });
      name = name.replace('.', '');
      name = name.charAt(0).toUpperCase() + name.slice(1);
      days.push(name);
    }
    return days;
  };

  const daysOfWeek = getDaysOfWeek(currentLanguage);

  // Helper: Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper: Get first day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    // Shift to start week with Monday (0 = Mon, 1 = Tue, ..., 6 = Sun)
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDay(null);
  };

  // Aggregate all events for calendar month
  const getEventsForDate = (year: number, month: number, day: number) => {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const isSameDay = (rawDate: any) => {
      const p = CalendarEngine.parseDate(rawDate);
      return p ? (p.year === year && p.month === month && p.day === day) : false;
    };

    const dayEvents: Array<{
      id: string;
      type: 'ponte' | 'eclosion' | 'sevrage' | 'sante';
      title: string;
      description: string;
      color: string;
    }> = [];

    // 1. Egg Layings (Pontes)
    pontes.forEach(ponte => {
      if (isSameDay(ponte.date)) {
        const repro = reproductions.find(r => r.id === ponte.reproduction_id);
        const couple = repro ? couples.find(c => c.id === repro.couple_id) : null;
        const male = couple ? canaris.find(b => b.id === couple.male_id) : null;
        const female = couple ? canaris.find(b => b.id === couple.femelle_id) : null;
        const parentLabel = (male && female)
          ? `${male.nom} x ${female.nom}`
          : t('calendarCoupleFallback', { id: repro?.couple_id ?? '?' });

        dayEvents.push({
          id: `ponte-${ponte.id}`,
          type: 'ponte',
          title: t('layingOfEggs', { oeufs: ponte.oeufs }),
          description: t('breedingCouple', { parents: parentLabel }),
          color: 'bg-yellow-500 text-yellow-900 border-yellow-200'
        });
      }

      // 2. Expected Hatching (Ponte date + 13 days)
      const hDateStr = CalendarEngine.addDays(ponte.date, 13);

      if (hDateStr && isSameDay(hDateStr)) {
        const repro = reproductions.find(r => r.id === ponte.reproduction_id);
        const couple = repro ? couples.find(c => c.id === repro.couple_id) : null;
        const male = couple ? canaris.find(b => b.id === couple.male_id) : null;
        const female = couple ? canaris.find(b => b.id === couple.femelle_id) : null;
        const parentLabel = (male && female)
          ? `${male.nom} x ${female.nom}`
          : t('calendarCoupleFallback', { id: repro?.couple_id ?? '?' });

        dayEvents.push({
          id: `eclosion-${ponte.id}`,
          type: 'eclosion',
          title: t('expectedHatch'),
          description: t('checkNestOf', { parents: parentLabel, oeufs: ponte.oeufs }),
          color: 'bg-emerald-500 text-emerald-900 border-emerald-200 font-bold'
        });
      }
    });

    // 3. Weaning Alert (Canari birth date + 30 days)
    canaris.forEach(bird => {
      if (bird.date_naissance) {
        const wDateStr = CalendarEngine.addDays(bird.date_naissance, 30);

        if (wDateStr && isSameDay(wDateStr)) {
          dayEvents.push({
            id: `wean-${bird.id}`,
            type: 'sevrage',
            title: t('weaningAdvised', { name: bird.nom || bird.bague }),
            description: t('weaningAdvisedDesc'),
            color: 'bg-rose-500 text-rose-900 border-rose-200'
          });
        }
      }
    });

    // 4. Healthcare / Treatments
    sante.forEach(record => {
      if (isSameDay(record.date)) {
        const bird = canaris.find(b => b.id === record.canari_id);
        dayEvents.push({
          id: `sante-${record.id}`,
          type: 'sante',
          title: t('healthCareTreatment', { traitement: record.traitement }),
          description: t('patientLabel', { name: bird ? bird.nom : t('canaris'), category: record.categorie }),
          color: 'bg-blue-500 text-blue-900 border-blue-200'
        });
      }
    });

    return dayEvents;
  };

  // Build Calendar grid cells
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  
  const cells: Array<{
    day: number | null;
    events: ReturnType<typeof getEventsForDate>;
  }> = [];

  // Empty cells for alignment before first day of month
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push({ day: null, events: [] });
  }

  // Active days cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = getEventsForDate(currentYear, currentMonth, day);
    cells.push({ day, events: dayEvents });
  }

  const selectedEvents = selectedDay ? getEventsForDate(currentYear, currentMonth, selectedDay) : [];

  return (
    <div id="printable-area" className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('calendarTitle')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('calendarSub')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <button
            type="button"
            onClick={async () => {
              printDocument('printable-area');
              const monthName = getMonthName(currentMonth, currentLanguage);
              const monthEvents: Array<[string, string, string]> = [];
              for (let d = 1; d <= daysInMonth; d++) {
                const evs = getEventsForDate(currentYear, currentMonth, d);
                evs.forEach(ev => {
                  monthEvents.push([`${d} ${monthName} ${currentYear}`, ev.type, ev.title]);
                });
              }

              await exportDocumentAsPDF({
                title: `${t('calendarTitle')} — ${monthName} ${currentYear}`,
                subtitle: t('calendarSub') || t('calendar.pdfTitle'),
                language: currentLanguage,
                isRtl,
                sections: [
                  {
                    title: t('calendar.secSummary'),
                    metrics: [
                      { label: t('calendar.totalEvents'), value: `${monthEvents.length}` },
                      { label: t('calendar.period'), value: `${monthName} ${currentYear}` },
                    ],
                  },
                  {
                    title: t('calendar.secEvents'),
                    table: {
                      headers: [
                        t('calendar.headerDate'),
                        t('calendar.headerCategory'),
                        t('calendar.headerEvent')
                      ],
                      columnWidths: [100, 120, 295.28],
                      alignments: ['left', 'left', 'left'],
                      rows: monthEvents,
                    },
                  },
                ],
              });
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Printer className="w-4 h-4" /> {currentLanguage === 'fr' ? 'Imprimer / PDF' : 'Print / PDF'}
          </button>
          <button
            type="button"
            onClick={() => {
              const allEvents: string[] = [];
              const headers = "Date;Type;Titre;Description\n";
              for (let d = 1; d <= daysInMonth; d++) {
                const evs = getEventsForDate(currentYear, currentMonth, d);
                const formattedMonth = String(currentMonth + 1).padStart(2, '0');
                const formattedDay = String(d).padStart(2, '0');
                const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
                evs.forEach(ev => {
                  allEvents.push(`${dateStr};"${ev.type}";"${ev.title.replace(/"/g, '""')}";"${ev.description.replace(/"/g, '""')}"`);
                });
              }
              const blob = new Blob(["\uFEFF" + headers + allEvents.join("\n")], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `calendrier_elevage_${currentYear}_${currentMonth + 1}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold px-4 py-2 rounded-xl transition-colors text-sm cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-4 h-4" /> {t('exportCSV')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Calendar Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          {/* Calendar Controller Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>{getMonthName(currentMonth, currentLanguage)} {currentYear}</span>
            </h3>
            
            <div className="flex gap-1.5">
              <button
                type="button"
                aria-label={t('calendarPreviousMonth')}
                onClick={handlePrevMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer min-h-[38px] min-w-[38px] inline-flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label={t('calendarNextMonth')}
                onClick={handleNextMonth}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors cursor-pointer min-h-[38px] min-w-[38px] inline-flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Titles */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          {/* Calendar Days cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((cell, index) => {
              const isSelected = selectedDay === cell.day;
              const hasEvents = cell.events.length > 0;
              const isToday = cell.day !== null && CalendarEngine.isToday(currentYear, currentMonth, cell.day);

              return (
                <button
                  type="button"
                  key={index}
                  disabled={!cell.day}
                  aria-label={cell.day ? t('calendarDayLabel', { day: cell.day, events: cell.events.length }) : undefined}
                  onClick={() => cell.day !== null && setSelectedDay(cell.day)}
                  className={`min-h-[52px] sm:min-h-[64px] p-1.5 rounded-xl border text-xs flex flex-col justify-between items-start transition-all ${
                    !cell.day 
                      ? 'bg-slate-50/40 dark:bg-slate-950/20 border-transparent text-transparent cursor-default' 
                      : isSelected 
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs cursor-pointer font-bold ring-1 ring-blue-500'
                      : isToday
                      ? 'bg-blue-50/40 dark:bg-slate-800 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-bold cursor-pointer'
                      : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{cell.day}</span>
                    {isToday && <span className="text-[8px] bg-blue-600 text-white px-1.5 py-0.2 rounded-full font-bold">{t('calendarToday')}</span>}
                  </div>
                  
                  {/* Event Dots */}
                  {hasEvents && (
                    <div className="flex flex-wrap gap-1 mt-1 w-full">
                      {cell.events.map((ev, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            ev.type === 'ponte' 
                              ? 'bg-amber-500' 
                              : ev.type === 'eclosion' 
                              ? 'bg-emerald-500' 
                              : ev.type === 'sevrage' 
                              ? 'bg-rose-500' 
                              : 'bg-blue-500'
                          }`}
                          title={ev.title}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Events panel for the selected day */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 pb-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span>{t('eventsOfDay')}</span>
              {selectedDay ? (
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                  {String(selectedDay).padStart(2, '0')} {getMonthName(currentMonth, currentLanguage)}
                </span>
              ) : (
                <span className="text-xs text-slate-400">{t('noDaySelected')}</span>
              )}
            </h3>

            {selectedDay === null ? (
              <p className="text-xs italic text-slate-400 dark:text-slate-500 text-center py-8">
                {t('clickCalendarPrompt')}
              </p>
            ) : selectedEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 flex flex-col justify-center items-center flex-1">
                <CheckCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{t('calmDay')}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1">{t('calmDayDesc')}</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px]">
                {selectedEvents.map((ev) => (
                  <div key={ev.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs space-y-1.5">
                    <span className="font-bold text-slate-900 dark:text-white leading-snug block">{ev.title}</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">{ev.description}</p>
                    
                    {/* Badge indicator */}
                    <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold mt-1 ${
                      ev.type === 'ponte' 
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                        : ev.type === 'eclosion' 
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                        : ev.type === 'sevrage' 
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    }`}>
                      {t(`calendarEvent_${ev.type}`)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

