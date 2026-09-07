/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ADMIN - OFFLINE BETA EXPORTER
 * Export helper for generating signed .lmse license files, QR payloads, and tester activation sheets.
 */

import { License, LmseLicenseFile, LmseFilePayload } from '../types/licensing';

export class OfflineBetaExporter {
  /**
   * Constructs the official .lmse file content structure from a signed License object
   */
  static exportLicenseFile(license: License): LmseLicenseFile {
    const payload: LmseFilePayload = {
      id: license.id,
      key: license.key,
      holderName: license.holderName,
      holderEmail: license.holderEmail,
      type: license.type,
      issuedAt: license.issuedAt,
      expiresAt: license.expiresAt,
      maxDevices: license.policy.maxDevices,
      features: license.policy.features,
      allowOfflineActivation: license.policy.allowOfflineActivation,
      mode: license.type === 'enterprise' ? 'ENTERPRISE' : (license.type === 'beta' ? 'OFFLINE_BETA' : 'COMMERCIAL'),
    };

    return {
      format: 'bird-academy-lmse',
      version: 1,
      license: payload,
      checksum: license.checksum,
      signature: license.signature,
    };
  }

  /**
   * Serializes the .lmse file object into a formatted JSON string
   */
  static exportLicenseJson(license: License): string {
    const lmseFile = this.exportLicenseFile(license);
    return JSON.stringify(lmseFile, null, 2);
  }

  /**
   * Returns the standardized export filename
   */
  static getExportFilename(license: License): string {
    const cleanId = license.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `BirdAcademy-License-${cleanId}.lmse`;
  }

  /**
   * Generates a compact payload string suitable for QR Code generation
   */
  static generateQrPayload(license: License): string {
    const lmseFile = this.exportLicenseFile(license);
    return JSON.stringify(lmseFile);
  }

  /**
   * Generates the tester activation hand-off markdown document (Fiche de remise au testeur)
   */
  static generateTesterSheet(license: License): string {
    const expirationStr = license.expiresAt 
      ? new Date(license.expiresAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'Illimitée';

    return `# FICHE D'ACTIVATION HORS LIGNE — BIRD ACADEMY ENTERPRISE (BÊTA TERRAIN)

---

### INFORMATIONS DE LICENCE

- **Titulaire** : ${license.holderName} ${license.holderEmail ? `(<${license.holderEmail}>)` : ''}
- **Type de Licence** : ${license.type.toUpperCase()} (OFFLINE BETA)
- **Identifiant Licence** : \`${license.id}\`
- **Clé de Licence** : \`${license.key}\`
- **Date d'Émission** : ${new Date(license.issuedAt).toLocaleDateString('fr-FR')}
- **Date d'Expiration** : ${expirationStr}
- **Appareils Autorisés** : ${license.policy.maxDevices} appareil(s)
- **Mode d'Activation** : 100% Hors Ligne (Cryptographique Locale)

---

### PROCÉDURE D'INSTALLATION ET D'ACTIVATION SUR ANDROID

1. **Installer l'application** : Installez l'APK **Bird Academy** sur votre téléphone ou tablette Android.
2. **Transférer le fichier de licence** : Copiez le fichier \`${this.getExportFilename(license)}\` sur votre téléphone (dans Téléchargements ou un dossier local).
3. **Ouvrir Bird Academy** : Lancez l'application. L'écran d'activation s'affiche.
4. **Choisir « Importer une licence .lmse »** : Appuyez sur le bouton d'importation de licence.
5. **Sélectionner le fichier** : Choisissez le fichier \`${this.getExportFilename(license)}\` ou scannez le QR Code fourni.
6. **Activation validée** : L'application vérifie la signature numérique locale et confirme l'activation instantanément **sans aucune connexion Internet**.

---

### ASSISTANCE ET REMONTÉE DE BUGS

En cas de difficulté ou pour remonter vos observations terrain :
- Contactez l'administrateur LMSE : \`support@birdacademy.com\`
- Précisez l'identifiant de licence \`${license.id}\` et l'empreinte de votre appareil en cas d'erreur.

*Fiche générée automatiquement par le Centre d'Administration LMSE Enterprise.*
`;
  }
}
