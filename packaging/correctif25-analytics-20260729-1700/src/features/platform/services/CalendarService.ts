/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CalendarEvent, CalendarEventType } from '../types';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';
import { FinanceRepository } from '../../finance/repositories/FinanceRepository';
import { appStorage } from '../../../storage';

export class CalendarService {
  private static CUSTOM_EVENTS_KEY = 'platform_custom_calendar_events';

  /**
   * Aggregates all biological and custom events from databases
   */
  static getEvents(): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    const birds = BirdRepository.getAll();
    const couples = BreedingRepository.getCouples();
    const reproductions = BreedingRepository.getReproductions();
    const pontes = BreedingRepository.getPontes();
    const health = HealthRepository.getAll();
    const expenses = FinanceRepository.getExpenses();
    const sales = FinanceRepository.getSales();

    // 1. Births (Naissances)
    birds.forEach(b => {
      if (b.date_naissance) {
        events.push({
          id: `cal-birth-${b.id}`,
          title: `🐣 Naissance : ${b.nom}`,
          description: `Oiseau #${b.id}, race : ${b.race || 'Canari'}, couleur : ${b.couleur || 'Inconnu'}.`,
          date: b.date_naissance,
          type: 'birth',
          priority: 'low'
        });
      }
    });

    // 2. Layings (Pontes)
    pontes.forEach(p => {
      if (p.date) {
        const repro = reproductions.find(r => r.id === p.reproduction_id);
        const couple = repro ? couples.find(c => c.id === repro.couple_id) : null;
        const male = couple ? birds.find(b => b.id === couple.male_id)?.nom : 'Inconnu';
        const female = couple ? birds.find(b => b.id === couple.femelle_id)?.nom : 'Inconnu';

        events.push({
          id: `cal-laying-${p.id}`,
          title: `🥚 Ponte : Couple ${male} & ${female}`,
          description: `Nid #${p.id} : Déclaration de ${p.oeufs} œuf(s) pondu(s).`,
          date: p.date,
          type: 'laying',
          priority: 'medium'
        });

        // 3. Expected Mirages (incubation Day 7 check)
        const layingDate = new Date(p.date);
        if (!isNaN(layingDate.getTime())) {
          const mirageDate = new Date(layingDate);
          mirageDate.setDate(layingDate.getDate() + 7);
          events.push({
            id: `cal-mirage-${p.id}`,
            title: `🔦 Mirage estimé : Nid de ${female}`,
            description: `Vérifiez le nid #${p.id} (à J+7) pour mirer les œufs et voir s'ils sont fécondés.`,
            date: mirageDate.toISOString().split('T')[0],
            type: 'mirage',
            priority: 'medium'
          });

          // 4. Expected Hatches (Éclosions)
          const hatchDate = new Date(layingDate);
          hatchDate.setDate(layingDate.getDate() + 13);
          events.push({
            id: `cal-hatch-${p.id}`,
            title: `🐣 Éclosion prévue : Nid de ${female}`,
            description: `Fin d'incubation théorique à J+13 pour la ponte du ${p.date}.`,
            date: hatchDate.toISOString().split('T')[0],
            type: 'hatch',
            priority: 'high'
          });
        }
      }
    });

    // 5. Weanings (Sevrages)
    const youngChicks = BreedingRepository.getJeunes();
    youngChicks.forEach(y => {
      const birthDate = new Date(y.date_naissance);
      if (!isNaN(birthDate.getTime())) {
        const weaningDate = new Date(birthDate);
        weaningDate.setDate(birthDate.getDate() + 30);
        events.push({
          id: `cal-wean-${y.id}`,
          title: `🍼 Sevrage conseillé : Bague #${y.bague || y.id}`,
          description: `L'oisillon atteint ses 30 jours de vie et doit s'alimenter seul en cage de volière.`,
          date: weaningDate.toISOString().split('T')[0],
          type: 'weaning',
          priority: 'medium'
        });
      }
    });

    // 6. Medical treatments and quarantines
    health.forEach(h => {
      if (h.date) {
        const isTreatment = h.categorie === 'Traitement' || h.categorie === 'Vaccin';
        events.push({
          id: `cal-health-${h.id}`,
          title: isTreatment ? `🏥 Soin : ${h.traitement}` : `🩺 Observation : ${h.traitement}`,
          description: `Oiseau ID #${h.canari_id} : ${h.description || 'Contrôle médical'}. État : ${h.statut}.`,
          date: h.date,
          type: 'treatment',
          priority: h.statut === 'En attente' ? 'high' : 'low'
        });
      }
    });

    // 7. Sales (Ventes)
    sales.forEach(s => {
      if (s.date) {
        const bird = birds.find(b => b.id === s.canari_id);
        events.push({
          id: `cal-sale-${s.id}`,
          title: `💸 Cession : ${bird ? bird.nom : 'Canari'}`,
          description: `Vendu à ${s.acheteur} pour un montant de ${s.prix} DT. Motif: ${s.description || 'Cession standard'}.`,
          date: s.date,
          type: 'sale',
          priority: 'medium'
        });
      }
    });

    // 8. Purchases (Achats / Acquisitions) - Omitting for simplicity since birth records cover them

    // 9. Expenses (Finances)
    expenses.forEach(e => {
      if (e.date) {
        events.push({
          id: `cal-finance-${e.id}`,
          title: `💸 Dépense : ${e.description}`,
          description: `Achat de ${e.categorie || 'matériel'} pour ${e.montant} DT.`,
          date: e.date,
          type: 'finance',
          priority: 'low'
        });
      }
    });

    // 10. Load Custom Events from Local Storage
    const customEvents = appStorage.getItem<CalendarEvent[]>(this.CUSTOM_EVENTS_KEY, []);
    events.push(...customEvents);

    // Sort chronologically
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  static addCustomEvent(title: string, description: string, date: string, type: CalendarEventType, priority: 'low' | 'medium' | 'high'): void {
    const customEvents = appStorage.getItem<CalendarEvent[]>(this.CUSTOM_EVENTS_KEY, []);
    const newEvent: CalendarEvent = {
      id: `custom-evt-${Math.random().toString(36).substring(2, 9)}`,
      title,
      description,
      date,
      type,
      priority
    };
    customEvents.push(newEvent);
    appStorage.setItem(this.CUSTOM_EVENTS_KEY, customEvents);
  }

  static deleteCustomEvent(id: string): void {
    const customEvents = appStorage.getItem<CalendarEvent[]>(this.CUSTOM_EVENTS_KEY, []);
    const filtered = customEvents.filter(e => e.id !== id);
    appStorage.setItem(this.CUSTOM_EVENTS_KEY, filtered);
  }
}
