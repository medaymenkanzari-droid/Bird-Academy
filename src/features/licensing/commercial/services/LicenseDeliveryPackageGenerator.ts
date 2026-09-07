/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — LICENSE DELIVERY PACKAGE GENERATOR
 * Generates official offline multi-file delivery kits for end-users and commercial testers.
 * STRICT SECURITY: Zero private signing keys or internal administrative secrets included.
 */

import { License } from '../../types/licensing';
import { CommercialOrder } from '../types/commercialOrder';
import { LicenseDeliveryPackage, DeliveryPackageFile } from '../types/deliveryPackage';
import { OfflineBetaExporter } from '../../engines/OfflineBetaExporter';
import { SubscriptionTierResolver } from '../../../subscription/services/SubscriptionTierResolver';
import { QrCodeImageGenerator } from './QrCodeImageGenerator';
import { ZipArchiveBuilder } from './ZipArchiveBuilder';

export class LicenseDeliveryPackageGenerator {
  /**
   * Generates a complete 5-file offline delivery kit for a given license.
   */
  public static generatePackage(
    license: License,
    order?: CommercialOrder
  ): LicenseDeliveryPackage {
    const jsonStr = OfflineBetaExporter.exportLicenseJson(license);
    const qrPayload = OfflineBetaExporter.generateQrPayload(license);
    const nowIso = new Date().toISOString();

    const orderRef = order ? order.orderId : 'DIRECT-ADMIN-DELIVERY';
    const customerRef = order?.customerName || license.holderName;
    const tier = SubscriptionTierResolver.resolve(license);

    // 1. license.lmse
    const lmseFile: DeliveryPackageFile = {
      filename: `license_${license.id}.lmse`,
      contentType: 'application/json',
      content: jsonStr,
      sizeBytes: new TextEncoder().encode(jsonStr).length,
    };

    // 2. license-key.txt
    const keyContent = [
      '======================================================================',
      ' BIRD ACADEMY ENTERPRISE — CLÉ OFFICIELLE D\'ACTIVATION LMSE           ',
      '======================================================================',
      '',
      `TITULAIRE   : ${license.holderName}`,
      `PLAN        : ${tier}`,
      `COMMANDE    : ${orderRef}`,
      `ÉCHÉANCE    : ${license.expiresAt ? new Date(license.expiresAt).toLocaleDateString('fr-FR') : 'PERMANENTE (À VIE)'}`,
      '',
      'CLÉ D\'ACTIVATION (À SAISIR DANS L\'APPLICATION) :',
      '----------------------------------------------------------------------',
      license.key,
      '----------------------------------------------------------------------',
      '',
      'Conservez cette clé en lieu sûr. Elle vous permettra d\'activer votre',
      'poste de travail (Modèle : 1 appareil dédié, données 100% locales).',
      '',
      'Support officiel : support@birdacademy.com',
      '======================================================================',
    ].join('\n');

    const keyFile: DeliveryPackageFile = {
      filename: 'license-key.txt',
      contentType: 'text/plain',
      content: keyContent,
      sizeBytes: new TextEncoder().encode(keyContent).length,
    };

    // 3. license-qr.png (Real scannable PNG image)
    const qrPngBytes = QrCodeImageGenerator.generateQrPngBytes(qrPayload);
    const qrDataUrl = QrCodeImageGenerator.generateQrDataUrl(qrPayload);
    const qrFile: DeliveryPackageFile = {
      filename: 'license-qr.png',
      contentType: 'image/png',
      content: qrPngBytes,
      sizeBytes: qrPngBytes.length,
      dataUrl: qrDataUrl,
    };

    // 4. license-info.txt
    const infoContent = [
      '======================================================================',
      ' FICHE TECHNIQUE DE LICENCE COMMERCIALE — BIRD ACADEMY ENTERPRISE     ',
      '======================================================================',
      '',
      `ID Unique de Licence : ${license.id}`,
      `Clé Commerciale      : ${license.key}`,
      `Titulaire Enregistré : ${license.holderName}`,
      `Email Titulaire      : ${license.holderEmail || 'Non renseigné'}`,
      `Référence Commande   : ${orderRef}`,
      `Édition / Plan       : ${tier}`,
      `Statut Initial       : ${license.status.toUpperCase()}`,
      `Date d'Émission      : ${new Date(license.issuedAt).toLocaleString('fr-FR')}`,
      `Date d'Expiration    : ${license.expiresAt ? new Date(license.expiresAt).toLocaleString('fr-FR') : 'PERMANENTE (Sans expiration)'}`,
      `Nombre Max Appareils : ${license.policy.maxDevices}`,
      `Mode Hors-Ligne      : ${license.policy.allowOfflineActivation ? 'AUTORISÉ (100% Offline)' : 'NON'}`,
      '',
      'CARACTÉRISTIQUES CRYPTOGRAPHIQUES :',
      `Checksum SHA-256     : ${license.checksum}`,
      `Signature ECDSA      : ${license.signature.slice(0, 32)}... (Valide)`,
      '',
      'FONCTIONNALITÉS & CAPACITÉS DÉBLOQUÉES :',
      ...(license.policy.features || []).map(f => ` - ${f}`),
      '',
      '======================================================================',
    ].join('\n');

    const infoFile: DeliveryPackageFile = {
      filename: 'license-info.txt',
      contentType: 'text/plain',
      content: infoContent,
      sizeBytes: new TextEncoder().encode(infoContent).length,
    };

    // 5. README.txt
    const readmeContent = [
      '======================================================================',
      ' GUIDE D\'ACTIVATION RAPIDE HORS-LIGNE — BIRD ACADEMY ENTERPRISE        ',
      '======================================================================',
      '',
      'Félicitations pour l\'acquisition de votre licence Bird Academy !',
      'Ce kit contient tout le nécessaire pour activer votre logiciel sans',
      'nécessiter de connexion Internet.',
      '',
      'ÉTAPES D\'ACTIVATION (AU CHOIX) :',
      '',
      'MÉTHODE 1 : FICHIER .LMSE (RECOMMANDÉ SUR PC & TABLETTE)',
      '1. Ouvrez Bird Academy Enterprise sur votre appareil.',
      '2. Sur l\'écran d\'activation, cliquez sur "Importer un fichier de licence".',
      `3. Sélectionnez le fichier "${lmseFile.filename}" fourni dans ce kit.`,
      '4. Votre édition est instantanément déverrouillée.',
      '',
      'MÉTHODE 2 : SAISIE DE LA CLÉ',
      '1. Ouvrez Bird Academy Enterprise.',
      '2. Cliquez sur "Saisir une clé de licence".',
      `3. Copiez/collez la clé suivante : ${license.key}`,
      '4. Validez pour terminer l\'activation.',
      '',
      'MÉTHODE 3 : SCAN DE QR CODE',
      '1. Utilisez le fichier image "license-qr.png" ou scannez le QR code affiché.',
      '2. L\'application s\'active en quelques secondes.',
      '',
      'ASSISTANCE & SUPPORT :',
      'En cas de changement d\'appareil ou de besoin d\'assistance :',
      'Email : support@birdacademy.com',
      'Documentation : https://birdacademy.com/docs',
      '======================================================================',
    ].join('\n');

    const readmeFile: DeliveryPackageFile = {
      filename: 'README.txt',
      contentType: 'text/plain',
      content: readmeContent,
      sizeBytes: new TextEncoder().encode(readmeContent).length,
    };

    const files: DeliveryPackageFile[] = [
      lmseFile,
      keyFile,
      qrFile,
      infoFile,
      readmeFile,
    ];

    const totalSizeBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);

    return {
      packageId: `PKG-${license.id}`,
      licenseId: license.id,
      licenseKey: license.key,
      orderId: order?.orderId,
      customerName: customerRef,
      tier,
      generatedAt: nowIso,
      files,
      totalSizeBytes,
    };
  }

  /**
   * Triggers a browser download for an individual delivery file.
   */
  public static downloadSingleFile(file: DeliveryPackageFile): void {
    if (typeof window === 'undefined') return;

    let blob: Blob;
    if (file.content instanceof Uint8Array) {
      blob = new Blob([file.content], { type: file.contentType || 'application/octet-stream' });
    } else {
      blob = new Blob([file.content], { type: file.contentType || 'text/plain;charset=utf-8' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Generates a standard binary ZIP byte array for the delivery kit.
   */
  public static generatePackageZip(pkg: LicenseDeliveryPackage): Uint8Array {
    return ZipArchiveBuilder.buildZipArchive(
      pkg.files.map(f => ({
        filename: f.filename,
        content: f.content,
      }))
    );
  }

  /**
   * Generates the legacy serialized JSON representation of the full delivery package archive.
   */
  public static createPackageExportJson(pkg: LicenseDeliveryPackage): string {
    const exportPayload = {
      packageId: pkg.packageId,
      licenseId: pkg.licenseId,
      licenseKey: pkg.licenseKey,
      customerName: pkg.customerName,
      tier: pkg.tier,
      generatedAt: pkg.generatedAt,
      archiveFormat: 'LMSE_DELIVERY_BUNDLE_V1',
      metadata: {
        packageId: pkg.packageId,
        licenseId: pkg.licenseId,
        licenseKey: pkg.licenseKey,
        customerName: pkg.customerName,
        tier: pkg.tier,
        generatedAt: pkg.generatedAt,
        archiveFormat: 'LMSE_DELIVERY_BUNDLE_V1',
      },
      files: pkg.files.map(f => ({
        filename: f.filename,
        contentType: f.contentType,
        content: typeof f.content === 'string' ? f.content : (f.dataUrl || '[BINARY_PNG]'),
      })),
    };

    return JSON.stringify(exportPayload, null, 2);
  }

  /**
   * Downloads the complete delivery package as a genuine binary PKZIP archive.
   */
  public static downloadFullPackageArchive(pkg: LicenseDeliveryPackage): void {
    if (typeof window === 'undefined') return;

    const zipFilename = `bird-academy-license-package-${pkg.licenseId}.zip`;
    ZipArchiveBuilder.downloadZipArchive(
      zipFilename,
      pkg.files.map(f => ({
        filename: f.filename,
        content: f.content,
      }))
    );
  }
}
