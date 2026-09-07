/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getPlatformTranslation } from '../utils/translations';
import { CalendarService } from '../services/CalendarService';
import { CalendarEvent, CalendarEventType } from '../types';
import { Calendar, ChevronLeft, ChevronRight, Plus, Trash2, Tag, Info, ListTodo } from 'lucide-react';

export const CalendarTab: React.FC = () => {
  const { language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [events, setEvents] = useState<CalendarEvent[]>(() => CalendarService.getEvents());

  // Filter keys
  const [activeFilters, setActiveFilters] = useState<CalendarEventType[]>([
    'birth', 'laying', 'mirage', 'hatch', 'weaning', 'treatment', 'quarantine', 'sale', 'purchase', 'finance', 'custom'
  ]);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<CalendarEventType>('custom');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const tPlat = (key: string) => getPlatformTranslation(language, key);

  // Month information
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayIndex = useMemo(() => {
    let day = new Date(year, month, 1).getDay(); // Sun = 0, Mon = 1...
    return day === 0 ? 6 : day - 1; // convert so Mon = 0, Sun = 6
  }, [year, month]);

  // Generate calendar cells (days)
  const calendarCells = useMemo(() => {
    const cells: (Date | null)[] = [];
    // Padding for previous month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }
    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  }, [year, month, daysInMonth, firstDayIndex]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleFilterToggle = (type: CalendarEventType) => {
    if (activeFilters.includes(type)) {
      setActiveFilters(activeFilters.filter(f => f !== type));
    } else {
      setActiveFilters([...activeFilters, type]);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => activeFilters.includes(e.type));
  }, [events, activeFilters]);

  // Group events by day string
  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach(evt => {
      if (!map[evt.date]) {
        map[evt.date] = [];
      }
      map[evt.date].push(evt);
    });
    return map;
  }, [filteredEvents]);

  // Selected day events
  const selectedDayEvents = useMemo(() => {
    return eventsByDay[selectedDateStr] || [];
  }, [eventsByDay, selectedDateStr]);

  const handleCreateCustomEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    CalendarService.addCustomEvent(newTitle, newDesc, selectedDateStr, newType, newPriority);
    setEvents(CalendarService.getEvents());

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (id.startsWith('custom-evt-')) {
      CalendarService.deleteCustomEvent(id);
      setEvents(CalendarService.getEvents());
    }
  };

  const getEventBgColor = (type: CalendarEventType) => {
    switch (type) {
      case 'birth': return 'bg-emerald-500';
      case 'laying': return 'bg-amber-500';
      case 'mirage': return 'bg-purple-500';
      case 'hatch': return 'bg-yellow-400';
      case 'weaning': return 'bg-blue-500';
      case 'treatment': return 'bg-red-500';
      case 'quarantine': return 'bg-teal-600';
      case 'sale': return 'bg-sky-500';
      case 'purchase': return 'bg-rose-500';
      case 'finance': return 'bg-emerald-600';
      default: return 'bg-slate-500';
    }
  };

  const getEventNameFR = (type: CalendarEventType) => {
    switch (type) {
      case 'birth': return 'Naissance';
      case 'laying': return 'Ponte';
      case 'mirage': return 'Mirage';
      case 'hatch': return 'Éclosion';
      case 'weaning': return 'Sevrage';
      case 'treatment': return 'Soin/Médicament';
      case 'quarantine': return 'Quarantaine';
      case 'sale': return 'Cession/Vente';
      case 'purchase': return 'Achat/Ajout';
      case 'finance': return 'Dépense';
      default: return 'Personnel';
    }
  };

  const filtersLegend: { id: CalendarEventType; label: string }[] = [
    { id: 'birth', label: 'Naissances' },
    { id: 'laying', label: 'Pontes' },
    { id: 'mirage', label: 'Mirages' },
    { id: 'hatch', label: 'Éclosions' },
    { id: 'weaning', label: 'Sevrages' },
    { id: 'treatment', label: 'Traitements' },
    { id: 'quarantine', label: 'Quarantaines' },
    { id: 'sale', label: 'Ventes' },
    { id: 'purchase', label: 'Achats' },
    { id: 'finance', label: 'Finances' },
    { id: 'custom', label: 'Personnels' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT & CENTER PANEL: CALENDAR GRID & LEGEND */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* MONTH HEADER */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              {monthNames[month]} {year}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 border border-slate-100 hover:bg-slate-50 rounded-lg text-slate-600 cursor-pointer transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CALENDAR GRID */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          {/* Week days labels */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 text-center py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 auto-rows-[80px]">
            {calendarCells.map((cell, idx) => {
              if (cell === null) {
                return <div key={`empty-${idx}`} className="border-r border-b border-slate-50 bg-slate-50/10" />;
              }

              const dateStr = cell.toISOString().split('T')[0];
              const isSelected = selectedDateStr === dateStr;
              const cellEvents = eventsByDay[dateStr] || [];
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`border-r border-b border-slate-100 p-1.5 text-left relative flex flex-col justify-between transition-all group cursor-pointer hover:bg-amber-50/20 ${
                    isSelected ? 'bg-amber-500/5 ring-2 ring-amber-500/30' : ''
                  }`}
                >
                  <span className={`text-xs font-bold ${
                    isToday 
                      ? 'bg-amber-500 text-white w-5 h-5 flex items-center justify-center rounded-full font-black' 
                      : isSelected 
                      ? 'text-amber-600' 
                      : 'text-slate-600'
                  }`}>
                    {cell.getDate()}
                  </span>

                  {/* Dots representing events */}
                  <div className="flex flex-wrap gap-1 max-h-10 overflow-hidden mt-1">
                    {cellEvents.slice(0, 4).map(e => (
                      <div
                        key={e.id}
                        className={`w-1.5 h-1.5 rounded-full ${getEventBgColor(e.type)}`}
                        title={e.title}
                      />
                    ))}
                    {cellEvents.length > 4 && (
                      <span className="text-[8px] font-black text-slate-400">+{cellEvents.length - 4}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* FILTERS LEGEND */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-3">
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Filtrer par type d'événement
          </span>
          <div className="flex flex-wrap gap-2">
            {filtersLegend.map(item => {
              const isActive = activeFilters.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => handleFilterToggle(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'border-transparent text-slate-400 bg-slate-50/40 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${getEventBgColor(item.id)}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: SELECTED DAY DETAILS & EVENT CREATION */}
      <div className="space-y-6">
        
        {/* EVENTS LIST */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="block text-[10px] font-black text-amber-500 uppercase tracking-wider">Jour inspecté</span>
              <span className="text-xs font-bold text-slate-800">
                {new Date(selectedDateStr).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add custom event inline form */}
          {showAddForm && (
            <form onSubmit={handleCreateCustomEvent} className="p-3.5 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase">Titre de l'événement</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="ex. Nettoyer les nids de volière"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden mt-1"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase">Description / Notes</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  placeholder="Notes additionnelles..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase">Catégorie</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs mt-1"
                  >
                    <option value="custom">Personnel</option>
                    <option value="treatment">Soin</option>
                    <option value="finance">Dépense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase">Urgence</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs mt-1"
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyen</option>
                    <option value="high">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-2.5 py-1 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </form>
          )}

          {/* Events listed */}
          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8 space-y-1">
                <ListTodo className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400">{tPlat('calendarNoEvents')}</p>
              </div>
            ) : (
              selectedDayEvents.map(evt => (
                <div key={evt.id} className="p-3 border border-slate-50 bg-slate-50/30 rounded-xl relative group flex items-start gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${getEventBgColor(evt.type)}`} />
                  <div className="flex-1 min-w-0 pr-6">
                    <span className="block text-xs font-bold text-slate-700">{evt.title}</span>
                    {evt.description && (
                      <p className="text-[10px] text-slate-500 mt-0.5">{evt.description}</p>
                    )}
                    <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md mt-2 inline-block">
                      {getEventNameFR(evt.type)}
                    </span>
                  </div>

                  {evt.id.startsWith('custom-evt-') && (
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="absolute top-2.5 right-2.5 p-1 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
