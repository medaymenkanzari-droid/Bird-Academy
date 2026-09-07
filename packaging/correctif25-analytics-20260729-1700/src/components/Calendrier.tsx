/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Egg, Activity, Sparkles, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Ponte, Sante, Canari, Couple, Reproduction } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { CalendarEngine } from '../business/CalendarEngine';

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
  const { t, currentLanguage } = useLanguage();
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
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    const dayEvents: Array<{
      id: string;
      type: 'ponte' | 'eclosion' | 'sevrage' | 'sante';
      title: string;
      description: string;
      color: string;
    }> = [];

    // 1. Egg Layings (Pontes)
    pontes.forEach(ponte => {
      if (ponte.date === dateStr) {
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

      if (hDateStr === dateStr) {
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
      if (bird.pere_id && bird.mere_id) { // is a junior
        const wDateStr = CalendarEngine.addDays(bird.date_naissance, 30);

        if (wDateStr === dateStr) {
          dayEvents.push({
            id: `wean-${bird.id}`,
            type: 'sevrage',
            title: t('weaningAdvised', { name: bird.nom }),
            description: t('weaningAdvisedDesc'),
            color: 'bg-rose-500 text-rose-900 border-rose-200'
          });
        }
      }
    });

    // 4. Healthcare / Treatments
    sante.forEach(record => {
      if (record.date === dateStr) {
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
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">{t('calendarTitle')}</h2>
        <p className="text-xs text-slate-500">
          {t('calendarSub')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Calendar Grid */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          {/* Calendar Controller Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>{getMonthName(currentMonth, currentLanguage)} {currentYear}</span>
            </h3>
            
            <div className="flex gap-1.5">
              <button
                type="button"
                aria-label={t('calendarPreviousMonth')}
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-slate-50 border border-slate-100 text-slate-500 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label={t('calendarNextMonth')}
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-slate-50 border border-slate-100 text-slate-500 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday Titles */}
          <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-xs font-bold text-slate-400">
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
                  className={`min-h-[50px] sm:min-h-[60px] p-1.5 rounded-xl border text-xs flex flex-col justify-between items-start transition-all ${
                    !cell.day 
                      ? 'bg-slate-50/40 border-transparent text-transparent cursor-default' 
                      : isSelected 
                      ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs cursor-pointer font-bold'
                      : isToday
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-bold cursor-pointer'
                      : 'bg-white border-slate-100 hover:border-slate-200 cursor-pointer text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span>{cell.day}</span>
                    {isToday && <span className="text-[7px] bg-blue-500 text-white px-1 py-0.2 rounded-full font-bold">{t('calendarToday')}</span>}
                  </div>
                  
                  {/* Event Dots */}
                  {hasEvents && (
                    <div className="flex flex-wrap gap-1 mt-1 w-full">
                      {cell.events.map((ev, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            ev.type === 'ponte' 
                              ? 'bg-yellow-500' 
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
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-slate-800 text-sm mb-4 pb-2 border-b border-slate-50 flex justify-between items-center">
              <span>{t('eventsOfDay')}</span>
              {selectedDay ? (
                <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {String(selectedDay).padStart(2, '0')} {getMonthName(currentMonth, currentLanguage)}
                </span>
              ) : (
                <span className="text-xs text-slate-400">{t('noDaySelected')}</span>
              )}
            </h3>

            {selectedDay === null ? (
              <p className="text-xs italic text-slate-400 text-center py-8">
                {t('clickCalendarPrompt')}
              </p>
            ) : selectedEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400 flex flex-col justify-center items-center flex-1">
                <CheckCircle className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-xs font-semibold">{t('calmDay')}</p>
                <p className="text-[11px] text-slate-400 mt-1">{t('calmDayDesc')}</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[350px]">
                {selectedEvents.map((ev) => (
                  <div key={ev.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs space-y-1.5">
                    <span className="font-bold text-slate-800 leading-snug block">{ev.title}</span>
                    <p className="text-slate-500 text-[11px] leading-relaxed">{ev.description}</p>
                    
                    {/* Badge indicator */}
                    <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded-md font-bold mt-1 ${
                      ev.type === 'ponte' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : ev.type === 'eclosion' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : ev.type === 'sevrage' 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-blue-100 text-blue-800'
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
