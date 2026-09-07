/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SupportTicket, FaqItem } from '../types/admin.types';
import { AdminAuditService } from './AdminAuditService';

const TICKETS_STORAGE_KEY = 'bird_academy_admin_tickets';
const FAQ_STORAGE_KEY = 'bird_academy_admin_faq';

export class SupportTicketStore {
  public static getTickets(): SupportTicket[] {
    try {
      const data = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (!data) return this.getInitialSeedTickets();
      return JSON.parse(data);
    } catch {
      return this.getInitialSeedTickets();
    }
  }

  public static saveTickets(tickets: SupportTicket[]): void {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.error('Failed to save tickets:', e);
    }
  }

  public static addTicket(ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'messages'>, initialMessage: string): SupportTicket {
    const tickets = this.getTickets();
    const now = new Date().toISOString();
    const newTicket: SupportTicket = {
      ...ticket,
      id: 'TCK-' + Date.now().toString(36).toUpperCase(),
      ticketNumber: 'TK-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: 'MSG-' + Date.now(),
          senderName: ticket.userName,
          senderRole: 'user',
          content: initialMessage,
          timestamp: now,
        }
      ]
    };

    tickets.unshift(newTicket);
    this.saveTickets(tickets);

    AdminAuditService.logAction({
      action: 'Création d un ticket support',
      category: 'support',
      target: `${newTicket.ticketNumber} (${newTicket.subject})`,
      details: `Inscrit par ${newTicket.userEmail} avec priorité ${newTicket.priority}`,
      status: 'success',
    });

    return newTicket;
  }

  public static replyToTicket(ticketId: string, senderName: string, senderRole: 'user' | 'support' | 'admin', content: string): SupportTicket | null {
    const tickets = this.getTickets();
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    const ticket = tickets[index];
    ticket.messages.push({
      id: 'MSG-' + Date.now(),
      senderName,
      senderRole,
      content,
      timestamp: now,
    });
    ticket.updatedAt = now;
    if (senderRole !== 'user' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    tickets[index] = ticket;
    this.saveTickets(tickets);

    AdminAuditService.logAction({
      action: 'Réponse sur ticket support',
      category: 'support',
      target: ticket.ticketNumber,
      details: `Réponse ajoutée par ${senderName} (${senderRole})`,
      status: 'success',
    });

    return ticket;
  }

  public static updateTicketStatus(ticketId: string, status: SupportTicket['status']): SupportTicket | null {
    const tickets = this.getTickets();
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index === -1) return null;

    tickets[index].status = status;
    tickets[index].updatedAt = new Date().toISOString();
    this.saveTickets(tickets);

    AdminAuditService.logAction({
      action: 'Changement statut ticket',
      category: 'support',
      target: tickets[index].ticketNumber,
      details: `Nouveau statut : ${status}`,
      status: 'success',
    });

    return tickets[index];
  }

  public static getFaq(): FaqItem[] {
    try {
      const data = localStorage.getItem(FAQ_STORAGE_KEY);
      if (!data) return this.getInitialSeedFaq();
      return JSON.parse(data);
    } catch {
      return this.getInitialSeedFaq();
    }
  }

  private static getInitialSeedTickets(): SupportTicket[] {
    const now = new Date();
    return [
      {
        id: 'TCK-001',
        ticketNumber: 'TK-889102',
        userEmail: 'beta.tester12@elevage-expert.com',
        userName: 'Marc Dupont',
        subject: 'Question sur la synchronisation hors-ligne LMSE',
        category: 'Licences & Activation',
        priority: 'medium',
        status: 'in_progress',
        createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
        updatedAt: new Date(now.getTime() - 3600000 * 4).toISOString(),
        assignedTo: 'Support Enterprise',
        messages: [
          {
            id: 'MSG-1',
            senderName: 'Marc Dupont',
            senderRole: 'user',
            content: 'Bonjour, comment réactiver ma licence LMSE Pro en mode hors-ligne sans connexion internet ?',
            timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(),
          },
          {
            id: 'MSG-2',
            senderName: 'Support Technique Enterprise',
            senderRole: 'support',
            content: 'Bonjour Marc. Vous pouvez utiliser le générateur de signature d activation hors-ligne situé dans l onglet Licences.',
            timestamp: new Date(now.getTime() - 3600000 * 4).toISOString(),
          }
        ]
      },
      {
        id: 'TCK-002',
        ticketNumber: 'TK-994120',
        userEmail: 'eleveur.canari@gmail.com',
        userName: 'Lucie Bernard',
        subject: 'Demande d ajout d une nouvelle mutation de canari de posture',
        category: 'Référentiel Biologique',
        priority: 'low',
        status: 'open',
        createdAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
        updatedAt: new Date(now.getTime() - 86400000 * 1).toISOString(),
        messages: [
          {
            id: 'MSG-3',
            senderName: 'Lucie Bernard',
            senderRole: 'user',
            content: 'Bonjour, serait-il possible de valider la variété huppée allemande dans le registre des espèces ?',
            timestamp: new Date(now.getTime() - 86400000 * 1).toISOString(),
          }
        ]
      }
    ];
  }

  private static getInitialSeedFaq(): FaqItem[] {
    return [
      {
        id: 'FAQ-001',
        category: 'Licence',
        published: true,
        order: 1,
        question: {
          fr: 'Comment activer ma licence LMSE Enterprise ?',
          en: 'How to activate my LMSE Enterprise license?',
          ar: 'كيف تفعل ترخيص LMSE Enterprise الخاص بك؟',
          es: '¿Cómo activar mi licencia LMSE Enterprise?',
          it: 'Come attivare la mia licenza LMSE Enterprise?',
        },
        answer: {
          fr: 'Allez dans Paramètres > Licences LMSE, saisissez votre clé au format LMSE-XXXX-XXXX-XXXX-XXXX et cliquez sur Valider.',
          en: 'Go to Settings > LMSE Licenses, enter your key in format LMSE-XXXX-XXXX-XXXX-XXXX and click Validate.',
          ar: 'انتقل إلى الإعدادات > تراخيص LMSE، وأدخل مفتاحك وانقر على التحقق.',
          es: 'Vaya a Configuración > Licencias LMSE, ingrese su clave y haga clic en Validar.',
          it: 'Vai su Impostazioni > Licenze LMSE, inserisci la tua chiave e clicca su Conferma.',
        }
      }
    ];
  }
}
