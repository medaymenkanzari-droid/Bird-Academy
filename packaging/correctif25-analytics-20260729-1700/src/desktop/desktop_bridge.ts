/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Native Tauri Bridge Interface for local execution (zero Electron dependency)
export interface IDesktopBridge {
  isDesktop(): boolean;
  saveBackupFile(filename: string, content: string): Promise<{ success: boolean; path?: string; error?: string }>;
  loadBackupFile(): Promise<{ success: boolean; content?: string; filename?: string; error?: string }>;
  showNotification(title: string, body: string): Promise<void>;
  setWindowSize(width: number, height: number): Promise<void>;
  checkForUpdates(): Promise<{ available: boolean; version?: string; date?: string }>;
}

export class TauriDesktopBridge implements IDesktopBridge {
  private static getTauri() {
    // @ts-ignore
    return window.__TAURI__;
  }

  isDesktop(): boolean {
    return TauriDesktopBridge.getTauri() !== undefined;
  }

  async saveBackupFile(filename: string, content: string): Promise<{ success: boolean; path?: string; error?: string }> {
    if (!this.isDesktop()) {
      return { success: false, error: "Not running in desktop context" };
    }
    try {
      const tauri = TauriDesktopBridge.getTauri();
      const path = await tauri.dialog.save({
        defaultPath: filename,
        filters: [{ name: 'Bird Academy Backup', extensions: ['json', 'zip'] }]
      });
      if (path) {
        await tauri.fs.writeTextFile(path, content);
        return { success: true, path };
      }
      return { success: false, error: "Save cancelled by user" };
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  }

  async loadBackupFile(): Promise<{ success: boolean; content?: string; filename?: string; error?: string }> {
    if (!this.isDesktop()) {
      return { success: false, error: "Not running in desktop context" };
    }
    try {
      const tauri = TauriDesktopBridge.getTauri();
      const selected = await tauri.dialog.open({
        filters: [{ name: 'Bird Academy Backup', extensions: ['json', 'zip'] }],
        multiple: false
      });
      if (selected && typeof selected === 'string') {
        const content = await tauri.fs.readTextFile(selected);
        return { success: true, content, filename: selected };
      }
      return { success: false, error: "Open cancelled by user" };
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  }

  async showNotification(title: string, body: string): Promise<void> {
    if (!this.isDesktop()) {
      console.log(`[Notification Mock] ${title}: ${body}`);
      return;
    }
    try {
      const tauri = TauriDesktopBridge.getTauri();
      const permissionGranted = await tauri.notification.isPermissionGranted();
      if (!permissionGranted) {
        const permission = await tauri.notification.requestPermission();
        if (permission !== 'granted') return;
      }
      tauri.notification.sendNotification({ title, body });
    } catch (e) {
      console.error("Failed to trigger desktop notification", e);
    }
  }

  async setWindowSize(width: number, height: number): Promise<void> {
    if (!this.isDesktop()) return;
    try {
      const tauri = TauriDesktopBridge.getTauri();
      const currentWindow = tauri.window.getCurrent();
      await currentWindow.setSize(new tauri.window.LogicalSize(width, height));
    } catch (e) {
      console.error("Failed to change desktop window size", e);
    }
  }

  async checkForUpdates(): Promise<{ available: boolean; version?: string; date?: string }> {
    if (!this.isDesktop()) {
      return { available: false };
    }
    try {
      const tauri = TauriDesktopBridge.getTauri();
      const updateResult = await tauri.updater.checkUpdate();
      return {
        available: updateResult.shouldUpdate,
        version: updateResult.manifest?.version,
        date: updateResult.manifest?.date
      };
    } catch (e) {
      console.error("Failed update checking", e);
      return { available: false };
    }
  }
}

export const desktopBridge: IDesktopBridge = new TauriDesktopBridge();
