/**
 * @license
 * Bird Academy Enterprise — Volière Manager
 * Service de gestion et vérification multi-plateforme des permissions Caméra.
 * Conçu pour Android (Capacitor WebView), Web standard et Electron Desktop.
 */

import { Capacitor } from '@capacitor/core';

export type CameraPermissionState = 'granted' | 'denied' | 'prompt' | 'unavailable';

export interface CameraPermissionResult {
  granted: boolean;
  state: CameraPermissionState;
  error?: string;
}

export class CameraPermissionService {
  /**
   * Détecte si l'application tourne dans l'environnement Android natif Capacitor.
   */
  static isAndroidNative(): boolean {
    try {
      return Capacitor.getPlatform() === 'android';
    } catch {
      return false;
    }
  }

  /**
   * Obtient le nom de la plateforme courante ('android', 'ios', 'web').
   */
  static getPlatform(): string {
    try {
      return Capacitor.getPlatform();
    } catch {
      return 'web';
    }
  }

  /**
   * Vérifie le statut de la permission CAMERA sans ouverture destructrice de flux temporaire.
   * Évite CAMERA_IN_USE / NotReadableError sur Android en laissant le scanner réel
   * procéder à l'unique acquisition de flux.
   * - Sur Android : vérifie via navigator.permissions.query si révoqué au niveau OS.
   * - Sur Web / Desktop : vérifie la disponibilité de navigator.mediaDevices.getUserMedia.
   */
  static async requestCameraPermission(): Promise<CameraPermissionResult> {
    // 1. Disponibilité matérielle / API de base
    if (typeof navigator === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
      return {
        granted: false,
        state: 'unavailable',
        error: 'MEDIA_DEVICES_NOT_SUPPORTED'
      };
    }

    const isAndroid = this.isAndroidNative();

    // 2. Traitement Android non destructif
    if (isAndroid) {
      if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
        try {
          const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (status.state === 'denied') {
            return {
              granted: false,
              state: 'denied',
              error: 'PERMISSION_DENIED_SYSTEM'
            };
          }
          if (status.state === 'granted') {
            return {
              granted: true,
              state: 'granted'
            };
          }
          // 'prompt' : la permission sera sollicitée nativement par l'unique getUserMedia du scanner
          return {
            granted: true,
            state: 'prompt'
          };
        } catch {
          // Si permissions.query('camera') n'est pas supporté par la WebView,
          // laisser le scanner effectuer son acquisition directe
          return {
            granted: true,
            state: 'prompt'
          };
        }
      }

      return {
        granted: true,
        state: 'prompt'
      };
    }

    // 3. Web & Desktop : prêt pour l'acquisition directe
    return {
      granted: true,
      state: 'granted'
    };
  }
}
