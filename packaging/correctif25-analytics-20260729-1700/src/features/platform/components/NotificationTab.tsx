/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getPlatformTranslation } from '../utils/translations';
import { NotificationService } from '../services/NotificationService';
import { PlatformNotification } from '../types';
import { Bell, Archive, CheckCircle2, Trash2, Calendar, ShieldAlert, Heart, Gift } from 'lucide-react';

export const NotificationTab: React.FC = () => {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<PlatformNotification[]>(() => NotificationService.getNotifications());
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('unread');

  const tPlat = (key: string) => getPlatformTranslation(language, key);

  const handleMarkRead = (id: string) => {
    NotificationService.markAsRead(id);
    setNotifications(NotificationService.getNotifications());
  };

  const handleArchive = (id: string) => {
    NotificationService.archiveNotification(id);
    setNotifications(NotificationService.getNotifications());
  };

  const handleArchiveAll = () => {
    NotificationService.archiveAll();
    setNotifications(NotificationService.getNotifications());
  };

  const displayedNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read && !n.archived;
    if (filter === 'archived') return n.archived;
    return !n.archived; // All active (read and unread)
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'repro':
        return <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl"><Calendar className="w-4 h-4" /></div>;
      case 'treatment':
        return <div className="p-2 bg-red-500/10 text-red-600 rounded-xl"><Heart className="w-4 h-4" /></div>;
      case 'quarantine':
        return <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl"><ShieldAlert className="w-4 h-4" /></div>;
      case 'birthday':
        return <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl"><Gift className="w-4 h-4" /></div>;
      default:
        return <div className="p-2 bg-slate-500/10 text-slate-600 rounded-xl"><Bell className="w-4 h-4" /></div>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-md text-[9px] font-bold">Urgent</span>;
    if (priority === 'medium') return <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[9px] font-bold">Moyen</span>;
    return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] font-bold">Normal</span>;
  };

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            {tPlat('notificationCenter')}
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Rappels biologiques intelligents calculés d'après vos pontes et soins actifs.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleArchiveAll}
            className="px-3.5 py-2 border border-slate-100 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Archive className="w-4 h-4" />
            <span>Tout archiver</span>
          </button>
        )}
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'unread' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          À traiter ({notifications.filter(n => !n.read && !n.archived).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Toutes actives ({notifications.filter(n => !n.archived).length})
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            filter === 'archived' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Archivées ({notifications.filter(n => n.archived).length})
        </button>
      </div>

      {/* NOTIFICATIONS CONTAINER */}
      <div className="space-y-3">
        {displayedNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center flex flex-col items-center justify-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            <span className="text-xs font-bold text-slate-700">Aucune alerte en attente</span>
            <span className="text-[10px] text-slate-400">Votre élevage est à jour. Aucun sevrage, éclosion ou soin n'est requis aujourd'hui.</span>
          </div>
        ) : (
          displayedNotifications.map(n => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-4 flex items-start justify-between gap-4 transition-all ${
                !n.read ? 'border-amber-100 bg-amber-50/5' : 'border-slate-50'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {getNotificationIcon(n.type)}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-xs font-bold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>
                      {n.title}
                    </h4>
                    {getPriorityBadge(n.priority)}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{n.content}</p>
                  <span className="text-[9px] text-slate-400 mt-2 block">{new Date(n.date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {!n.read && !n.archived && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                    title="Marquer comme lu"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </button>
                )}
                {!n.archived && (
                  <button
                    onClick={() => handleArchive(n.id)}
                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                    title="Archiver"
                  >
                    <Archive className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
