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
      filename: 'Bird-Academy-Avian-ERP-Setup.exe',
      version: 'V2.0.0-RC1',
      buildId: 'BA-V2.0.0-RC1',
      sizeBytes: 121765349,
      sizeMB: '121 765 349 octets (116.12 Mo)',
      sha256: '8EDA77F7421803FD62E9D23AD2561ED509582A4E42E8A8461137E92E08F7A4B4',
      releaseDate: '2026-10-13',
      downloadUrl: '/downloads/Bird-Academy-Avian-ERP-Setup.exe',
      architecture: 'x64 (64-bit)',
      minOsVersion: 'Windows 10 / 11 (64-bit)',
      isAvailable: true,
      isTestDistribution: true,
      releaseTag: 'v2.0.0-rc1',
      descriptionKey: 'downloadPage.winSetupDesc'
    },
    {
      platform: 'windows',
      name: 'Bird Academy Enterprise — Volière Manager (Version Portable)',
      filename: 'Bird-Academy-User.exe',
      version: 'V2.0.0-RC1',
      buildId: 'BA-V2.0.0-RC1',
      sizeBytes: 121426841,
      sizeMB: '121 426 841 octets (115.80 Mo)',
      sha256: '104BBCE6B867AACEBB6A1DB104635C6427C230A2FE26930BC34342BF7D61BF90',
      releaseDate: '2026-10-13',
      downloadUrl: '/downloads/Bird-Academy-User.exe',
      architecture: 'x64 (64-bit)',
      minOsVersion: 'Windows 10 / 11 (64-bit)',
      isAvailable: true,
      isTestDistribution: true,
      releaseTag: 'v2.0.0-rc1',
      descriptionKey: 'downloadPage.winPortableDesc'
    },
    {
      platform: 'android',
      name: 'Bird Academy Enterprise — Volière Manager (Android APK)',
      filename: 'Bird-Academy-User.apk',
      version: 'V2.0.0-RC1',
      buildId: 'BA-V2.0.0-RC1',
      sizeBytes: 18710063,
      sizeMB: '18 710 063 octets (17.84 Mo)',
      sha256: '08EEE05006DC9A89FB82524ECD51168D6D5ADCFFF52C2BB3420FC67AA64F0758',
      releaseDate: '2026-10-13',
      downloadUrl: '/downloads/Bird-Academy-User.apk',
      architecture: 'ARM64 / ARMv7',
      minOsVersion: 'Android 10+ (API 29+)',
      isAvailable: true,
      isTestDistribution: true,
      warning: "Installation manuelle APK destinée au programme de test. Autoriser l'installation depuis cette source uniquement si nécessaire.",
      releaseTag: 'v2.0.0-rc1',
      descriptionKey: 'downloadPage.androidDesc'
    },
    // Documentation
    {
      platform: 'documentation',
      name: 'Rapport de test V2.0.0-RC1 (PDF)',
      filename: 'Rapport-de-test-Bird-Academy-V2.0.0-RC1.pdf',
      version: 'V2.0.0-RC1',
      buildId: 'BA-V2.0.0-RC1',
      sizeBytes: 89937,
      sizeMB: '89 937 octets (87.83 Ko)',
      sha256: '256C5A3751B5B77F704FE0B5860D4BE0EC12EB6BAD896132AD0AD8F9D84F0691',
      releaseDate: '2026-10-13',
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
    if (!art && filename === 'Bird-Academy-User-Windows-Setup.exe') {
      art = this.artifacts.find((a) => a.filename === 'Bird-Academy-Avian-ERP-Setup.exe');
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
  public static readonly DEFAULT_RELEASE_TAG = 'v2.0.0-rc1';
  public static readonly RC1_RELEASE_TAG = 'v2.0.0-rc1';
  public static readonly RC6_RELEASE_TAG = 'v1.3.6-RC6';
  public static readonly RC7_RELEASE_TAG = 'v1.3.6-RC7';

  /**
   * Constructs the official GitHub Release direct download URL for a binary asset
   */
  public static getGitHubReleaseUrl(filename: string, tag?: string): string {
    const art = this.getArtifact(filename);
    const effectiveTag = tag || art?.releaseTag || this.RC1_RELEASE_TAG;
    return `https://github.com/${this.GITHUB_REPO}/releases/download/${effectiveTag}/${filename}`;
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
