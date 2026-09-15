/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — WEB DOWNLOAD SERVICE
 * Official multi-platform download repository and cryptographic checksum registry.
 */

import { DownloadArtifact, SupportTicketSubmission } from '../types';

export class WebDownloadService {
  private static instance: WebDownloadService | null = null;
  private supportTickets: SupportTicketSubmission[] = [];

  public static getInstance(): WebDownloadService {
    if (!this.instance) {
      this.instance = new WebDownloadService();
    }
    return this.instance;
  }

  private artifacts: DownloadArtifact[] = [
    {
      platform: 'windows',
      name: 'Bird Academy pour Windows (Installateur Setup)',
      filename: 'Bird-Academy-User-Windows-Setup.exe',
      version: '1.3.6-RC7',
      sizeBytes: 106800570,
      sizeMB: '101.85 MB',
      sha256: '364E51644260C05BE9290DA3907B46D11A2E88EE2B2F10C60CA8F160B0B8395D',
      releaseDate: '2026-09-15',
      downloadUrl: '/downloads/Bird-Academy-User-Windows-Setup.exe',
      architecture: 'x64 (64-bit)',
      minOsVersion: 'Windows 10 / 11 (64-bit)',
      isAvailable: true,
      descriptionKey: 'downloadPage.winSetupDesc',
    },
    {
      platform: 'windows',
      name: 'Bird Academy pour Windows (Édition Portable)',
      filename: 'Bird-Academy-User.exe',
      version: '1.3.6-RC7',
      sizeBytes: 106462030,
      sizeMB: '101.53 MB',
      sha256: '739831904381FF08A643300C445C7D2457EFBA583C41EF3CB746D5C0664F563D',
      releaseDate: '2026-09-15',
      downloadUrl: '/downloads/Bird-Academy-User.exe',
      architecture: 'x64 (64-bit)',
      minOsVersion: 'Windows 10 / 11 (64-bit)',
      isAvailable: true,
      descriptionKey: 'downloadPage.winPortableDesc',
    },
    {
      platform: 'android',
      name: 'Bird Academy pour Android (Package APK)',
      filename: 'Bird-Academy-User.apk',
      version: '1.3.6-RC7',
      sizeBytes: 9916814,
      sizeMB: '9.46 MB',
      sha256: '20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63',
      releaseDate: '2026-09-15',
      downloadUrl: '/downloads/Bird-Academy-User.apk',
      architecture: 'ARM64 / ARMv7',
      minOsVersion: 'Android 10+ (API 29+)',
      isAvailable: true,
      descriptionKey: 'downloadPage.androidDesc',
    },
    {
      platform: 'documentation',
      name: 'Manuel Utilisateur & Guide d\'Activation (PDF)',
      filename: 'LMSE_OWNER_GUIDE.pdf',
      version: '1.3.6',
      sizeBytes: 428378,
      sizeMB: '0.41 MB',
      sha256: '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618',
      releaseDate: '2026-09-11',
      downloadUrl: '/downloads/LMSE_OWNER_GUIDE.pdf',
      architecture: 'Universel (PDF)',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      descriptionKey: 'downloadPage.docDesc',
    },
  ];

  public getAllArtifacts(): DownloadArtifact[] {
    return [...this.artifacts];
  }

  public getArtifactsByPlatform(platform: 'windows' | 'android' | 'documentation'): DownloadArtifact[] {
    return this.artifacts.filter((a) => a.platform === platform);
  }

  public getArtifactByFilename(filename: string): DownloadArtifact | undefined {
    return this.artifacts.find((a) => a.filename === filename);
  }

  // Static convenience API
  public static getAllArtifacts(): DownloadArtifact[] {
    return this.getInstance().getAllArtifacts();
  }

  public static getArtifactsByPlatform(platform: 'windows' | 'android' | 'documentation'): DownloadArtifact[] {
    return this.getInstance().getArtifactsByPlatform(platform);
  }

  public static getArtifact(filename: string): DownloadArtifact | undefined {
    return this.getInstance().getArtifactByFilename(filename);
  }

  public static readonly GITHUB_REPO = 'medaymenkanzari-droid/Bird-Academy';
  public static readonly DEFAULT_RELEASE_TAG = 'v1.3.6-RC7';

  /**
   * Constructs the official GitHub Release direct download URL for a binary asset
   */
  public static getGitHubReleaseUrl(filename: string, tag: string = this.DEFAULT_RELEASE_TAG): string {
    return `https://github.com/${this.GITHUB_REPO}/releases/download/${tag}/${filename}`;
  }

  /**
   * Resolves the download URL according to deployment environment:
   * - If VITE_DOWNLOAD_BASE_URL is configured, prefix the filename.
   * - If filename is an external binary (.exe, .apk), route to GitHub Release.
   * - Otherwise fallback to local relative route (/downloads/filename).
   */
  public static getPublicDownloadUrl(filename: string, tag: string = this.DEFAULT_RELEASE_TAG): string {
    const envBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DOWNLOAD_BASE_URL) || '';
    if (envBase) {
      return `${envBase.replace(/\/$/, '')}/${filename}`;
    }
    const isBinary = filename.endsWith('.exe') || filename.endsWith('.apk');
    if (isBinary) {
      return this.getGitHubReleaseUrl(filename, tag);
    }
    return `/downloads/${filename}`;
  }

  public static getSha256VerificationInstructions(filename: string): string {
    return `PowerShell: Get-FileHash -Path .\\${filename} -Algorithm SHA256`;
  }

  public static submitSupportTicket(ticket: {
    name: string;
    email: string;
    subject: string;
    category: 'licensing' | 'activation' | 'downloads' | 'technical' | 'commercial' | 'general';
    message: string;
  }): SupportTicketSubmission {
    const submission: SupportTicketSubmission = {
      ticketId: `TCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: ticket.name.trim(),
      email: ticket.email.trim(),
      subject: ticket.subject.trim(),
      category: ticket.category,
      message: ticket.message.trim(),
      createdAt: new Date().toISOString(),
      status: 'OPEN',
    };
    this.getInstance().supportTickets.push(submission);
    return submission;
  }

  public static getAllSupportTickets(): SupportTicketSubmission[] {
    return [...this.getInstance().supportTickets];
  }
}
