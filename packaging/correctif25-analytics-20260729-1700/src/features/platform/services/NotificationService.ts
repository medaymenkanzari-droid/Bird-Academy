/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { appStorage } from '../../../storage';
import { PlatformNotification, PlatformNotificationType } from '../types';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { BreedingRepository } from '../../breeding/repositories/BreedingRepository';
import { HealthRepository } from '../../health/repositories/HealthRepository';

export class NotificationService {
  private static STORAGE_KEY = 'platform_notifications';

  /**
   * Retrieves all notifications, generating dynamic biological alerts if needed
   */
  static getNotifications(): PlatformNotification[] {
    const userNotifications = appStorage.getItem<PlatformNotification[]>(this.STORAGE_KEY, []);
    
    // Generate dynamic alerts based on live biological data
    const dynamicAlerts = this.generateDynamicAlerts();
    
    // Deduplicate: don't append dynamic alerts if they already exist in the user's registry
    const existingTitles = new Set(userNotifications.map(n => n.title + n.date));
    const newAlerts = dynamicAlerts.filter(a => !existingTitles.has(a.title + a.date));
    
    if (newAlerts.length > 0) {
      const updated = [...newAlerts, ...userNotifications];
      appStorage.setItem(this.STORAGE_KEY, updated);
      return updated;
    }
    
    return userNotifications;
  }

  static markAsRead(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    appStorage.setItem(this.STORAGE_KEY, updated);
  }

  static archiveNotification(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => n.id === id ? { ...n, archived: true } : n);
    appStorage.setItem(this.STORAGE_KEY, updated);
  }

  static archiveAll(): void {
    const notifs = this.getNotifications();
    const updated = notifs.map(n => ({ ...n, archived: true }));
    appStorage.setItem(this.STORAGE_KEY, updated);
  }

  static addNotification(type: PlatformNotificationType, title: string, content: string, priority: 'low' | 'medium' | 'high'): void {
    const notifs = this.getNotifications();
    const newNotif: PlatformNotification = {
      id: Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      title,
      content,
      type,
      priority,
      read: false,
      archived: false
    };
    notifs.unshift(newNotif);
    appStorage.setItem(this.STORAGE_KEY, notifs);
  }

  /**
   * Scans live databases to dynamically flag pending events
   */
  private static generateDynamicAlerts(): PlatformNotification[] {
    const alerts: PlatformNotification[] = [];
    
    // Fetch current state
    const birds = BirdRepository.getAll();
    const couples = BreedingRepository.getCouples();
    const reproductions = BreedingRepository.getReproductions();
    const pontes = BreedingRepository.getPontes();
    const health = HealthRepository.getAll();
    
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date();

    // 1. Scan for expected hatches (Éclosions attendues)
    pontes.forEach(p => {
      // Clutches are mapped back. If eclosions are 0 or not set, and laying date is within last 14 days
      const layingDate = new Date(p.date);
      if (!isNaN(layingDate.getTime())) {
        const expectedHatchDate = new Date(layingDate);
        expectedHatchDate.setDate(expectedHatchDate.getDate() + 13);
        
        // If hatch date is around today (-2 to +5 days) and no hatch recorded
        if (p.eclosions === 0 || !p.eclosions) {
          const daysDiff = Math.round((expectedHatchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysDiff >= -5 && daysDiff <= 5) {
            const repro = reproductions.find(r => r.id === p.reproduction_id);
            const couple = repro ? couples.find(c => c.id === repro.couple_id) : null;
            const male = couple ? birds.find(b => b.id === couple.male_id)?.nom : 'Inconnu';
            const female = couple ? birds.find(b => b.id === couple.femelle_id)?.nom : 'Inconnu';

            alerts.push({
              id: `dyn-hatch-${p.id}`,
              date: expectedHatchDate.toISOString().split('T')[0],
              title: `🐣 Éclosion attendue : Couple ${male} & ${female}`,
              content: `L'incubation touche à sa fin pour la ponte du ${p.date} (Nid #${p.id}). Préparez la pâtée d'élevage !`,
              type: 'repro',
              priority: 'high',
              read: false,
              archived: false
            });
          }
        }
      }
    });

    // 2. Scan for recommended weanings (Sevrages conseillés)
    const youngChicks = BreedingRepository.getJeunes();
    youngChicks.forEach(y => {
      // If chick was born around 30 days ago
      const birthDate = new Date(y.date_naissance);
      if (!isNaN(birthDate.getTime()) && y.statut !== 'Sevré') {
        const expectedWeanDate = new Date(birthDate);
        expectedWeanDate.setDate(expectedWeanDate.getDate() + 30);
        
        const daysDiff = Math.round((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 28) {
          alerts.push({
            id: `dyn-wean-${y.id}`,
            date: expectedWeanDate.toISOString().split('T')[0],
            title: `🐣 Sevrage recommandé : Bague #${y.bague || y.id}`,
            content: `Le jeune oisillon a atteint ${daysDiff} jours. Il est temps de l'isoler en cage de volière et de l'habituer aux graines dures.`,
            type: 'repro',
            priority: 'medium',
            read: false,
            archived: false
          });
        }
      }
    });

    // 3. Scan for medical treatments and pending reminders (Traitements & rappels)
    health.forEach(h => {
      if (h.statut === 'En attente') {
        alerts.push({
          id: `dyn-health-${h.id}`,
          date: h.date,
          title: `🏥 Traitement médical requis : ${h.traitement}`,
          content: `Le soin est planifié pour l'oiseau #${h.canari_id}. Nature de l'acte : ${h.description || 'Suivi standard'}.`,
          type: 'treatment',
          priority: 'high',
          read: false,
          archived: false
        });
      }
    });

    // 4. Scan for upcoming layings (Pontes attendues) for active reproductions without pontes yet
    reproductions.forEach(r => {
      const hasPonte = pontes.some(p => p.reproduction_id === r.id);
      if (!hasPonte && r.statut === 'En cours') {
        const pairingDate = new Date(r.date_debut);
        if (!isNaN(pairingDate.getTime())) {
          const expectedLaying = new Date(pairingDate);
          expectedLaying.setDate(pairingDate.getDate() + 7);
          
          if (today >= pairingDate) {
            const couple = couples.find(c => c.id === r.couple_id);
            const female = couple ? birds.find(b => b.id === couple.femelle_id)?.nom : 'Inconnu';
            
            alerts.push({
              id: `dyn-laying-${r.id}`,
              date: expectedLaying.toISOString().split('T')[0],
              title: `🍳 Ponte attendue : ${female}`,
              content: `Le couple a été formé le ${r.date_debut}. Prévoyez l'installation du nid et de la charpie de coton.`,
              type: 'repro',
              priority: 'medium',
              read: false,
              archived: false
            });
          }
        }
      }
    });

    // 5. Scan for birds in quarantine (Fin de quarantaine) - Omitting notes search as not part of model
    // 6. Bird birthdays (Anniversaires)
    birds.forEach(b => {
      if (b.date_naissance) {
        const birth = new Date(b.date_naissance);
        if (!isNaN(birth.getTime()) && birth.getMonth() === today.getMonth() && birth.getDate() === today.getDate()) {
          const ageYears = today.getFullYear() - birth.getFullYear();
          if (ageYears > 0) {
            alerts.push({
              id: `dyn-bday-${b.id}`,
              date: todayStr,
              title: `🎂 Anniversaire : ${b.nom} (${ageYears} an${ageYears > 1 ? 's' : ''})`,
              content: `Aujourd'hui est le jour anniversaire de ${b.nom} (${b.race || b.sexe}). Un petit régal de graines de millet ou une pomme serait un joli cadeau !`,
              type: 'birthday',
              priority: 'low',
              read: false,
              archived: false
            });
          }
        }
      }
    });

    return alerts;
  }
}
