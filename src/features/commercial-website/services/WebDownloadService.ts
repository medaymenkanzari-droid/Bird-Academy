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
      name: 'Bird Academy Enterprise — Volière Manager (Windows Setup)',
      filename: 'Bird-Academy-User-Windows-Setup.exe',
      version: 'V2.0.0-RC1',
      buildId: 'BA-V2.0.0-RC1',
      sizeBytes: 109726359,
      sizeMB: '109 726 359 octets (104.64 Mo)',
      sha256: 'EEFB55F80511FFA36F10541438D1BA7A8EFBA02EAAADAAB584DB6D26A1E8FDF3',
      releaseDate: '2026-10-17',
      downloadUrl: '/downloads/Bird-Academy-User-Windows-Setup.exe',
      architecture: 'x64 (64-bit)',
      minOsVersion: 'Windows 10 / 11 (64-bit)',
      isAvailable: true,
      isTestDistribution: true,
      releaseTag: 'v2.0.0-RC1',
      descriptionKey: 'downloadPage.winSetupDesc'
    },
    {
      platform: 'windows',
      name: 'Bird Academy Enterprise — Volière Manager (Version Portable)',
      filename: 'Bird-Academy-User.exe',
      version: 'V2.0.0-RC1',
      buildId: 'BA-V2.0.0-RC1',
      sizeBytes: 109387829,
      sizeMB: '109 387 829 octets (104.32 Mo)',
      sha256: '6D302819F9C3E240484B7F5B54FB7904F004961D58444EA5373DDC763D2E372D',
      releaseDate: '2026-10-17',
      downloadUrl: '/downloads/Bird-Academy-User.exe',
      architecture: 'x64 (64-bit)',
      minOsVersion: 'Windows 10 / 11 (64-bit)',
      isAvailable: true,
      isTestDistribution: true,
      releaseTag: 'v2.0.0-RC1',
      descriptionKey: 'downloadPage.winPortableDesc'
    },
    {
      platform: 'android',
      name: 'Bird Academy Enterprise — Volière Manager (Android APK)',
      filename: 'Bird-Academy-User.apk',
      version: 'V2.0.0-RC1',
      buildId: 'BA-V2.0.0-RC1',
      sizeBytes: 18402794,
      sizeMB: '18 402 794 octets (17.55 Mo)',
      sha256: '8ABFC3F66329109F1F5A70EFE4EF0C5964795B19ED3D64C88D32EF24B9725DEC',
      releaseDate: '2026-10-17',
      downloadUrl: '/downloads/Bird-Academy-User.apk',
      architecture: 'ARM64 / ARMv7',
      minOsVersion: 'Android 10+ (API 29+)',
      isAvailable: true,
      isTestDistribution: true,
      warning: "Installation manuelle APK destinée au programme de test (versionCode 22). Autoriser l'installation depuis cette source uniquement si nécessaire.",
      releaseTag: 'v2.0.0-RC1',
      descriptionKey: 'downloadPage.androidDesc'
    },
    // Documentation
    {
      platform: 'documentation',
      name: 'Rapport de testeur V2.0.0-RC1 (PDF)',
      filename: 'Rapport-de-test-Bird-Academy-V2.0.0-RC1.pdf',
      version: 'V2.0.0-RC1',
      buildId: 'BA-V2.0.0-RC1',
      sizeBytes: 191586,
      sizeMB: '191 586 octets (187.10 Ko)',
      sha256: 'B783B4817E246B9DC34624927CDA4339952CDC36E6099C4AF4BC5DB34B87844D',
      releaseDate: '2026-10-18',
      downloadUrl: '/downloads/Rapport-de-test-Bird-Academy-V2.0.0-RC1.pdf',
      architecture: 'Universel (PDF A4)',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      descriptionKey: 'downloadPage.testReportDesc',
    },
    {
      platform: 'documentation',
      name: 'Manuel Utilisateur & Guide d\'Activation (PDF)',
      filename: 'LMSE_OWNER_GUIDE.pdf',
      version: 'V2.0.0-RC1',
      buildId: 'BA-V2.0.0-RC1',
      sizeBytes: 428378,
      sizeMB: '428 378 octets (0.41 Mo)',
      sha256: '42C1418C7B4DF75394B2C12D141E730E83DBE3416A58279A39A7C19E2D46D618',
      releaseDate: '2026-09-11',
      downloadUrl: '/downloads/LMSE_OWNER_GUIDE.pdf',
      architecture: 'Universel (PDF)',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      descriptionKey: 'downloadPage.docsDesc',
    },
  ];

  public getAllArtifacts(): DownloadArtifact[] {
    return [...this.artifacts];
  }

  public getArtifactsByPlatform(platform: 'windows' | 'android' | 'documentation' | 'kit'): DownloadArtifact[] {
    return this.artifacts.filter((a) => a.platform === platform);
  }

  public getArtifactByFilename(filename: string): DownloadArtifact | undefined {
    let art = this.artifacts.find((a) => a.filename === filename);
    if (!art && (filename === 'Bird-Academy-Avian-ERP-Setup.exe' || filename === 'Bird-Academy-User-Windows-Setup.exe')) {
      art = this.artifacts.find((a) => a.filename === 'Bird-Academy-User-Windows-Setup.exe' || a.filename === 'Bird-Academy-Avian-ERP-Setup.exe');
    }
    return art;
  }

  // Static convenience API
  public static getAllArtifacts(): DownloadArtifact[] {
    return this.getInstance().getAllArtifacts();
  }

  public static getArtifactsByPlatform(platform: 'windows' | 'android' | 'documentation' | 'kit'): DownloadArtifact[] {
    return this.getInstance().getArtifactsByPlatform(platform);
  }

  public static getArtifact(filename: string): DownloadArtifact | undefined {
    return this.getInstance().getArtifactByFilename(filename);
  }

  public static readonly GITHUB_REPO = 'medaymenkanzari-droid/Bird-Academy';
  public static readonly DEFAULT_RELEASE_TAG = 'v2.0.0-RC1';
  public static readonly RC1_RELEASE_TAG = 'v2.0.0-RC1';
  public static readonly RC6_RELEASE_TAG = 'v2.0.0-RC1';
  public static readonly RC7_RELEASE_TAG = 'v2.0.0-RC1';

  /**
   * Constructs the official GitHub Release direct download URL for a binary asset
   */
  public static getGitHubReleaseUrl(filename: string, tag?: string): string {
    const art = this.getArtifact(filename);
    const targetFilename = filename === 'Bird-Academy-Avian-ERP-Setup.exe'
      ? 'Bird-Academy-User-Windows-Setup.exe'
      : filename;
    const effectiveTag = tag || art?.releaseTag || this.DEFAULT_RELEASE_TAG;
    return `https://github.com/${this.GITHUB_REPO}/releases/download/${effectiveTag}/${targetFilename}`;
  }

  /**
   * Resolves the direct download URL for artifacts.
   * By default points to the verified local `/downloads/${filename}` route.
   */
  public static getPublicDownloadUrl(filename: string): string {
    const envBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DOWNLOAD_BASE_URL) || '';
    if (envBase) {
      return `${envBase.replace(/\/$/, '')}/${filename}`;
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
