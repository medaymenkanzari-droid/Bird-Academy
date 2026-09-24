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
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 121504893,
      sizeMB: '121 504 893 octets (115.88 Mo)',
      sha256: 'EC4BE9769261943ECF93B63D05566BB671DBEC490E66E5379E292293849A41E7',
      releaseDate: '2026-09-23',
      downloadUrl: '/downloads/Bird-Academy-User-Windows-Setup.exe',
      architecture: 'x64 (64-bit)',
      minOsVersion: 'Windows 10 / 11 (64-bit)',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.winSetupDesc',
    },
    {
      platform: 'windows',
      name: 'Bird Academy Enterprise — Volière Manager (Version Portable)',
      filename: 'Bird-Academy-User.exe',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 121166366,
      sizeMB: '121 166 366 octets (115.55 Mo)',
      sha256: 'FA87FE7D758DE103D487005F3EEA60920A0FE70AD1B82C9F3DF5F0A47C941D4A',
      releaseDate: '2026-09-23',
      downloadUrl: '/downloads/Bird-Academy-User.exe',
      architecture: 'x64 (64-bit)',
      minOsVersion: 'Windows 10 / 11 (64-bit)',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.winPortableDesc',
    },
    {
      platform: 'android',
      name: 'Bird Academy Enterprise — Volière Manager (Android APK)',
      filename: 'Bird-Academy-User.apk',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 9916814,
      sizeMB: '9 916 814 octets (9.46 Mo)',
      sha256: '20AD96A27742B4A013FB13774EFFEB716A5E4672509F279AB7D60292251D4F63',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/Bird-Academy-User.apk',
      architecture: 'ARM64 / ARMv7',
      minOsVersion: 'Android 10+ (API 29+)',
      isAvailable: true,
      isTestDistribution: true,
      warning: "Installation manuelle APK destinée au programme de test. Autoriser l'installation depuis cette source uniquement si nécessaire.",
      descriptionKey: 'downloadPage.androidDesc',
    },
    // Kit testeur — Validation Android (11 official test documents)
    {
      platform: 'kit',
      name: 'Guide de Recette Terrain — Kit 001',
      filename: 'QA_ANDROID_FIELD_KIT_001_GUIDE.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 7671,
      sizeMB: '7 671 octets',
      sha256: '5AD3A86A35450694DF559EA2FB49B14A177E6CA7AB1EECB214747475A97D1146',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_KIT_001_GUIDE.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docGuide',
    },
    {
      platform: 'kit',
      name: 'Fiche de Session Opérationnelle — Kit 001',
      filename: 'QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 25550,
      sizeMB: '25 550 octets',
      sha256: '6668A4BCEA03B1093E1C55D374F78833D3A3E3089496D4B11960F66809A15E81',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_KIT_001_SESSION_FORM.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docSession',
    },
    {
      platform: 'kit',
      name: 'Fiche d\'Incident & Anomalie Terrain — Kit 001',
      filename: 'QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 4124,
      sizeMB: '4 124 octets',
      sha256: '5645B2DD3E9D0166C912F60F46946DBF2C8AE79CDE18188CAC8704F5036BF9E1',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_KIT_001_INCIDENT_FORM.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docIncident',
    },
    {
      platform: 'kit',
      name: 'Registre des Preuves Photographiques — Kit 001',
      filename: 'QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 3647,
      sizeMB: '3 647 octets',
      sha256: '576DA83C0F766AD7CBD5B659744DDCD18B1E3E11F8789A8953DBD258C3BE2A7C',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_KIT_001_EVIDENCE_FORM.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docEvidence',
    },
    {
      platform: 'kit',
      name: 'Synthèse de Campagne — Kit 001',
      filename: 'QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 3638,
      sizeMB: '3 638 octets',
      sha256: '02D92D2E59E280B0B2C2540F380807B930DB0E0590811B5835A1B1015902BEEF',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_KIT_001_CAMPAIGN_SUMMARY.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docCampaign',
    },
    {
      platform: 'kit',
      name: 'Pack de Remise du Kit de Recette Terrain — Handoff 001',
      filename: 'QA_ANDROID_FIELD_HANDOFF_001_PACK.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 11826,
      sizeMB: '11 826 octets',
      sha256: '555C69FB7EF85CE8D28DA249BF0148B5B46B264940965A7CB43AC1F4BC3B9131',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_HANDOFF_001_PACK.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docPack',
    },
    {
      platform: 'kit',
      name: 'Notice de Remise Testeurs — Handoff 001',
      filename: 'QA_ANDROID_FIELD_HANDOFF_001_README.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 4253,
      sizeMB: '4 253 octets',
      sha256: 'F1471D544FDAA658697DB034CFAD1028C4BCB2E40CA7CF4B0516C7D86D5466A8',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_HANDOFF_001_README.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docReadme',
    },
    {
      platform: 'kit',
      name: 'Rapport d\'Audit & État de Campagne — Execution 001',
      filename: 'QA_ANDROID_FIELD_EXECUTION_001_REPORT.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 12692,
      sizeMB: '12 692 octets',
      sha256: '7A948F94DDA5AF5085F3E6C67DE2D95450390EDF597E6F6335B8ACF791E97621',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_EXECUTION_001_REPORT.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docReport',
    },
    {
      platform: 'kit',
      name: 'Matrice Sessionnelle 32 Contrôles — Execution 001',
      filename: 'QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 24768,
      sizeMB: '24 768 octets',
      sha256: '28DCB83B163C88BB203DC9249E745299E7C20D1EB84CBB38CEA859F8157140B9',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_EXECUTION_001_SESSION_MATRIX.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docMatrix',
    },
    {
      platform: 'kit',
      name: 'Registre des Constats & Anomalies — Execution 001',
      filename: 'QA_ANDROID_FIELD_EXECUTION_001_FINDINGS.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 5089,
      sizeMB: '5 089 octets',
      sha256: '5CA8E7B54D3123032ADB67B3924253ED023BD24824059F06D04D477B01AC62EF',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_EXECUTION_001_FINDINGS.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docFindings',
    },
    {
      platform: 'kit',
      name: 'Index des Preuves & Traces — Execution 001',
      filename: 'QA_ANDROID_FIELD_EXECUTION_001_EVIDENCE_INDEX.md',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
      sizeBytes: 4396,
      sizeMB: '4 396 octets',
      sha256: '7EC220EAF3C5E350DDD0A0E2C3E31C339AFE14D0E4610234ED6EF47FEE95D7ED',
      releaseDate: '2026-09-19',
      downloadUrl: '/downloads/QA_ANDROID_FIELD_EXECUTION_001_EVIDENCE_INDEX.md',
      architecture: 'Markdown',
      minOsVersion: 'Tous systèmes',
      isAvailable: true,
      isTestDistribution: true,
      descriptionKey: 'downloadPage.docEvidenceIndex',
    },
    // Documentation
    {
      platform: 'documentation',
      name: 'Manuel Utilisateur & Guide d\'Activation (PDF)',
      filename: 'LMSE_OWNER_GUIDE.pdf',
      version: 'v1.3.6',
      buildId: 'BA-V1.3.6',
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
    return this.artifacts.find((a) => a.filename === filename);
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
  public static readonly DEFAULT_RELEASE_TAG = 'v1.3.6';

  /**
   * Constructs the official GitHub Release direct download URL for a binary asset
   */
  public static getGitHubReleaseUrl(filename: string, tag: string = this.DEFAULT_RELEASE_TAG): string {
    return `https://github.com/${this.GITHUB_REPO}/releases/download/${tag}/${filename}`;
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
