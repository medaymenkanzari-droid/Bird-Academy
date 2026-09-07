/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Check, Archive, Trash2, Calendar, Heart, ShieldAlert, 
  Gift, X, CheckCheck, ExternalLink, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { NotificationService } from '../../features/platform/services/NotificationService';
import { PlatformNotification } from '../../features/platform/types';

export interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule?: (tab: string) => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  onNavigateToModule,
  anchorRef,
}) => {
  const { t, isRtl } = useLanguage();
  const [notifications, setNotifications] = useState<PlatformNotification[]>(() => 
    NotificationService.getNotifications()
  );
  const [filter, setFilter] = useState<'unread' | 'all' | 'archived'>('unread');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time notification changes
  useEffect(() => {
    const unsubscribe = NotificationService.subscribe(() => {
      setNotifications(NotificationService.getNotifications());
    });
    return unsubscribe;
  }, []);

  // Update notifications when popover opens
  useEffect(() => {
    if (isOpen) {
      setNotifications(NotificationService.getNotifications());
    }
  }, [isOpen]);

  // Click outside & Escape key listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current && 
        !popoverRef.current.contains(target) &&
        (!anchorRef?.current || !anchorRef.current.contains(target))
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    NotificationService.markAsRead(id);
  };

  const handleArchive = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    NotificationService.archiveNotification(id);
  };

  const handleArchiveAll = () => {
    NotificationService.archiveAll();
  };

  const displayedNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read && !n.archived;
    if (filter === 'archived') return n.archived;
    return !n.archived;
  });

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;
  const activeCount = notifications.filter(n => !n.archived).length;
  const archivedCount = notifications.filter(n => n.archived).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'repro':
        return (
          <div className="p-2 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
        );
      case 'treatment':
        return (
          <div className="p-2 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
            <Heart className="w-4 h-4" />
          </div>
        );
      case 'quarantine':
        return (
          <div className="p-2 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
        );
      case 'birthday':
        return (
          <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <Gift className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'high') {
      return (
        <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded text-[9px] font-bold uppercase tracking-wider">
          {t('notificationUrgent') || 'Urgent'}
        </span>
      );
    }
    if (priority === 'medium') {
      return (
        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded text-[9px] font-bold uppercase tracking-wider">
          {t('notificationMedium') || 'Moyen'}
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[9px] font-bold uppercase tracking-wider">
        {t('notificationNormal') || 'Normal'}
      </span>
    );
  };

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal="false"
      aria-label={t('notificationCenterTitle') || 'Notifications'}
      dir={isRtl ? 'rtl' : 'ltr'}
      data-testid="notification-popover"
      className={`
        absolute top-full mt-2 w-84 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[490px] animate-fadeIn
        ${isRtl ? 'left-0' : 'right-0'}
      `}
    >
      {/* Header */}
      <div className="p-3.5 px-4 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{t('notificationCenterTitle') || 'Centre de Notifications'}</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleArchiveAll}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer"
              title={t('notificationArchiveAll') || 'Tout archiver'}
            >
              {t('notificationArchiveAll') || 'Tout archiver'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 pt-2 pb-1.5 flex gap-1.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/20 shrink-0">
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          {t('notificationToProcess') || 'À traiter'} ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          {t('notificationAllActive') || 'Toutes'} ({activeCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('archived')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
            filter === 'archived'
              ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
          }`}
        >
          {t('notificationArchived') || 'Archivées'} ({archivedCount})
        </button>
      </div>

      {/* Notification Items List */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60 overflow-y-auto flex-1 p-2 space-y-1.5 scrollbar-thin">
        {displayedNotifications.length === 0 ? (
          <div className="py-10 px-4 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
            <CheckCheck className="w-8 h-8 text-emerald-500/80 mb-1" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {t('notificationNoUnread') || 'Aucune alerte en attente'}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 max-w-[240px] leading-relaxed">
              {t('notificationEmptyState') || 'Votre élevage est à jour. Aucun rappel en attente.'}
            </span>
          </div>
        ) : (
          displayedNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                !notif.read && !notif.archived
                  ? 'border-amber-200/70 bg-amber-50/20 dark:border-amber-900/40 dark:bg-amber-950/20'
                  : 'border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {getNotificationIcon(notif.type)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-bold truncate ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {notif.title}
                    </span>
                    {getPriorityBadge(notif.priority)}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug break-words">
                    {notif.content}
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono mt-1.5 block">
                    {notif.date}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 items-end shrink-0 pt-0.5">
                {!notif.read && !notif.archived && (
                  <button
                    type="button"
                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                    className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition cursor-pointer"
                    title={t('notificationMarkAllRead') || 'Marquer comme lu'}
                    aria-label="Marquer comme lu"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                {!notif.archived && (
                  <button
                    type="button"
                    onClick={(e) => handleArchive(notif.id, e)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                    title="Archiver"
                    aria-label="Archiver"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 px-3 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 text-center shrink-0">
        <span className="text-[10px] text-slate-400">
          Bird Academy Intelligent Health & Breeding Alerts
        </span>
      </div>
    </div>
  );
};

export default NotificationPopover;
