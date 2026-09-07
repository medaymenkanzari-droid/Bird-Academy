/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — SUPPORT PAGE
 */

import React, { useState, useEffect } from 'react';
import { useWebLanguage } from '../i18n';
import { SupportContactSection } from '../components/sections/SupportContactSection';
import { SupportTicketSubmission } from '../types';
import { LifeBuoy, CheckCircle2, Clock, Mail, MessageSquare } from 'lucide-react';

export const WebSupportPage: React.FC = () => {
  const { t, isRtl } = useWebLanguage();
  const [localTickets, setLocalTickets] = useState<SupportTicketSubmission[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('bird_academy_support_tickets') || '[]');
      if (Array.isArray(stored)) {
        setLocalTickets(stored);
      }
    } catch (e) {
      console.warn('Error reading support tickets:', e);
    }
  }, []);

  return (
    <div className="space-y-12" data-testid="web-support-page" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Contact Form Section */}
      <SupportContactSection />

      {/* Local Tickets History */}
      {localTickets.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Historique de vos Demandes de Support Locales</span>
          </h2>

          <div className="space-y-3">
            {localTickets.map((tick) => (
              <div
                key={tick.ticketId}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-4"
                data-testid={`local-support-ticket-${tick.ticketId}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {tick.ticketId}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase font-bold">
                      {tick.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{tick.subject}</p>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Enregistré
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {new Date(tick.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
