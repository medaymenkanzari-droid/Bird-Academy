/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getAdminTranslation } from '../utils/adminTranslations';
import { SupportTicketStore } from '../services/SupportTicketStore';
import { SupportTicket, TicketPriority, TicketStatus } from '../types/admin.types';
import { 
  AppCard, AppTable, AppBadge, AppButton, AppModal, AppInput, AppSelect, AppAlert, AppKpiCard 
} from '../../../components/design-system';
import { MessageSquare, FileText, Download, Send, CheckCircle, Clock, AlertTriangle, LifeBuoy, Check } from 'lucide-react';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';

export const AdminSupportReporting: React.FC = () => {
  const { language } = useLanguage();
  const t = (key: string) => getAdminTranslation(language, key);

  const [tickets, setTickets] = useState<SupportTicket[]>(() => SupportTicketStore.getTickets());
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const refreshTickets = () => {
    setTickets(SupportTicketStore.getTickets());
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyContent.trim()) return;

    const updated = SupportTicketStore.replyToTicket(
      selectedTicket.id,
      'Support Enterprise',
      'support',
      replyContent.trim()
    );

    if (updated) {
      setSelectedTicket(updated);
      setReplyContent('');
      refreshTickets();
    }
  };

  const handleCloseTicket = (ticketId: string) => {
    SupportTicketStore.updateTicketStatus(ticketId, 'closed');
    refreshTickets();
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: 'closed' });
    }
  };

  // Enterprise Reporting Generators
  const handleExportJson = () => {
    const data = {
      timestamp: new Date().toISOString(),
      birds: BirdRepository.getAll(),
      couples: BreedingRepository.getCouples(),
      tickets: SupportTicketStore.getTickets(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bird-academy-enterprise-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleExportCsv = () => {
    const headers = 'ID,Numero,Demandeur,Email,Sujet,Priorite,Statut,Date\n';
    const rows = tickets.map(tItem => 
      `"${tItem.id}","${tItem.ticketNumber}","${tItem.userName}","${tItem.userEmail}","${tItem.subject}","${tItem.priority}","${tItem.status}","${tItem.createdAt}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-support-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'critical': return <AppBadge variant="danger" icon={<AlertTriangle className="w-3 h-3" />}>Critique</AppBadge>;
      case 'high': return <AppBadge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>Haute</AppBadge>;
      case 'medium': return <AppBadge variant="primary">Moyenne</AppBadge>;
      default: return <AppBadge variant="secondary">Basse</AppBadge>;
    }
  };

  const getStatusBadge = (s: TicketStatus) => {
    switch (s) {
      case 'open': return <AppBadge variant="warning" icon={<Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />}>Ouvert</AppBadge>;
      case 'in_progress': return <AppBadge variant="primary" icon={<Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />}>En Cours</AppBadge>;
      case 'resolved': return <AppBadge variant="success" icon={<CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}>Résolu</AppBadge>;
      default: return <AppBadge variant="secondary">Fermé</AppBadge>;
    }
  };

  const ticketColumns = [
    {
      key: 'ticketNumber',
      header: t('ticketNumber'),
      sortable: true,
      render: (row: SupportTicket) => (
        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{row.ticketNumber}</span>
      )
    },
    {
      key: 'userName',
      header: 'Demandeur',
      sortable: true,
      render: (row: SupportTicket) => (
        <div>
          <div className="font-bold text-slate-900 dark:text-white">{row.userName}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{row.userEmail}</div>
        </div>
      )
    },
    {
      key: 'subject',
      header: t('ticketSubject'),
      sortable: true,
      render: (row: SupportTicket) => (
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{row.subject}</span>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{row.category}</div>
        </div>
      )
    },
    {
      key: 'priority',
      header: t('ticketPriority'),
      sortable: true,
      render: (row: SupportTicket) => getPriorityBadge(row.priority)
    },
    {
      key: 'status',
      header: t('ticketStatus'),
      sortable: true,
      render: (row: SupportTicket) => getStatusBadge(row.status)
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row: SupportTicket) => (
        <AppButton size="sm" variant="outline" onClick={() => setSelectedTicket(row)}>
          {t('replyBtn')}
        </AppButton>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Support KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AppKpiCard
          title="Total Signalements"
          value={tickets.length}
          icon={LifeBuoy}
          variant="primary"
        />
        <AppKpiCard
          title="Tickets Ouverts"
          value={tickets.filter(tItem => tItem.status === 'open').length}
          icon={Clock}
          variant="warning"
        />
        <AppKpiCard
          title="En Traitement"
          value={tickets.filter(tItem => tItem.status === 'in_progress').length}
          icon={MessageSquare}
          variant="info"
        />
        <AppKpiCard
          title="Tickets Résolus"
          value={tickets.filter(tItem => tItem.status === 'resolved').length}
          icon={CheckCircle}
          variant="success"
        />
      </div>

      {/* Enterprise Multi-Format Reporting */}
      <AppCard padding="md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {t('tabSupportReporting')} — Exports & Rapports Enterprise
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Génération des bilans analytiques consolidés en formats standardisés (JSON, CSV, Synthèses).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AppButton 
              variant="outline" 
              startIcon={<Download className="w-4 h-4" />}
              onClick={handleExportCsv}
            >
              Export CSV
            </AppButton>
            <AppButton 
              variant="primary" 
              startIcon={<Download className="w-4 h-4" />}
              onClick={handleExportJson}
            >
              Rapport JSON Global
            </AppButton>
          </div>
        </div>
      </AppCard>

      {/* Tickets Table */}
      <AppCard padding="md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              File des Demandes de Support Technique & Retours Utilisateurs
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Suivi et réponse aux demandes d'assistance des éleveurs et organisations.
            </p>
          </div>
        </div>

        <AppTable
          columns={ticketColumns}
          data={tickets}
          keyExtractor={(item) => item.id}
          searchable
          searchPlaceholder="Rechercher par numéro, demandeur, sujet..."
          searchKeys={['ticketNumber', 'userName', 'userEmail', 'subject', 'category']}
        />
      </AppCard>

      {/* Reply Modal */}
      {selectedTicket && (
        <AppModal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket ${selectedTicket.ticketNumber} — ${selectedTicket.subject}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                <span>Demandeur : <strong className="text-slate-900 dark:text-white">{selectedTicket.userName}</strong> ({selectedTicket.userEmail})</span>
                <span>{new Date(selectedTicket.createdAt).toLocaleString(language)}</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{selectedTicket.messages?.[0]?.content || selectedTicket.subject}</p>
            </div>

            {selectedTicket.messages && selectedTicket.messages.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Échanges Précédents</h5>
                {selectedTicket.messages.map((m: any, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3.5 rounded-xl text-xs ${
                      (m.senderRole || m.authorRole) === 'support' 
                        ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 ml-4' 
                        : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mr-4'
                    }`}
                  >
                    <div className="flex justify-between font-bold mb-1 text-slate-900 dark:text-white">
                      <span>{m.senderName || m.authorName} ({m.senderRole || m.authorRole})</span>
                      <span className="text-[10px] text-slate-400 font-normal">{new Date(m.timestamp).toLocaleTimeString(language)}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{m.content}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendReply} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Votre Réponse Administrateur
              </label>
              <textarea
                rows={4}
                required
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Rédigez la réponse officielle du support Enterprise..."
                className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              />

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                {selectedTicket.status !== 'closed' && (
                  <AppButton
                    variant="outline"
                    onClick={() => handleCloseTicket(selectedTicket.id)}
                  >
                    Clôturer le Ticket
                  </AppButton>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <AppButton variant="outline" onClick={() => setSelectedTicket(null)}>
                    Fermer
                  </AppButton>
                  <AppButton type="submit" variant="primary" startIcon={<Send className="w-3.5 h-3.5" />}>
                    Envoyer la Réponse
                  </AppButton>
                </div>
              </div>
            </form>
          </div>
        </AppModal>
      )}
    </div>
  );
};

export default AdminSupportReporting;
