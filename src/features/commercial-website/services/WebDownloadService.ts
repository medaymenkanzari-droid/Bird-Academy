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
      sizeBytes: 109747064,
      sizeMB: '109 747 064 octets (104.66 Mo)',
      sha256: 'BA8EC925064FBE1AAFB53635FB1FF4277611485A5C8F1BD916B45339A3EC3EA1',
      releaseDate: '2026-10-24',
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
      sizeBytes: 109408543,
      sizeMB: '109 408 543 octets (104.34 Mo)',
      sha256: '1C7F50E6A689970B12BFF15EFD4DB769DF8138B0159A8E142617EF683032939B',
      releaseDate: '2026-10-24',
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
      sizeBytes: 20461460,
      sizeMB: '20 461 460 octets (19.51 Mo)',
      sha256: '1D3CC180339B55C2701CB3AE6CF6FC209D37720D8737B3CD8DBBD3BEFABDD290',
      releaseDate: '2026-10-24',
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
      name: 'Rapport de test — V2.0.0-RC1 — À remplir par le testeur',
      filename: 'Rapport-de-test-Bird-Academy-V2.0.0-RC1-A-remplir-par-le-testeur.pdf',
      version: 'V2.0.0-RC1',
      buildId: 'BA-V2.0.0-RC1',
      sizeBytes: 192358,
      sizeMB: '192 358 octets (187.85 Ko)',
      sha256: 'C2A05D43DAE7D69EC0CAA33CA14A850633C2457CEA463A053423C8DFA58A3D21',
      releaseDate: '2026-10-23',
      downloadUrl: '/downloads/Rapport-de-test-Bird-Academy-V2.0.0-RC1-A-remplir-par-le-testeur.pdf',
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
