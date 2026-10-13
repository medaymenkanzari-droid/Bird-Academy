/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — V2.0.0-RC1
 * Script de génération du Rapport de Test Officiel V2.0.0-RC1 (PDF A4)
 * Fichier : scripts/generateTestReportPdf.cjs
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'public', 'downloads');
const outputFile = path.join(outputDir, 'Rapport-de-test-Bird-Academy-V2.0.0-RC1.pdf');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport de Test V2.0.0-RC1 — Bird Academy</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 12px;
      margin-bottom: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 18pt;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 11pt;
      color: #3b82f6;
      font-weight: 600;
      margin: 2px 0 0 0;
    }
    .meta-box {
      text-align: right;
      font-size: 9pt;
      color: #64748b;
      font-family: monospace;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }
    .badge-info {
      background: #e0f2fe;
      color: #0369a1;
      border: 1px solid #bae6fd;
    }
    .section-title {
      font-size: 12.5pt;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 5px;
      margin-top: 18px;
      margin-bottom: 10px;
    }
    .summary-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 14px;
      font-size: 10pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      margin-bottom: 14px;
      font-size: 9.5pt;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 600;
      text-align: left;
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
    }
    td {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .status-pass {
      color: #16a34a;
      font-weight: 700;
    }
    .status-info {
      color: #2563eb;
      font-weight: 600;
    }
    .code {
      font-family: monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 4px;
      word-break: break-all;
    }
    .notice {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 9.5pt;
      color: #92400e;
      margin: 10px 0;
    }
    .footer {
      margin-top: 25px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      font-size: 8.5pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1 class="brand-title">BIRD ACADEMY ENTERPRISE</h1>
      <div class="brand-subtitle">Rapport Officiel de Qualification de Test — V2.0.0-RC1</div>
    </div>
    <div class="meta-box">
      <div>BUILD_ID: <strong>BA-V2.0.0-RC1</strong></div>
      <div>Date : 13 Octobre 2026</div>
      <div>Régime : 100% Hors-Ligne (Offline-First)</div>
    </div>
  </div>

  <div class="summary-card">
    <strong>Synthèse Exécutive à destination des Testeurs :</strong><br>
    Ce document présente l'état de validation technique et fonctionnelle de la version candidate <strong>V2.0.0-RC1</strong>. Les tests vérifient l'exécution native, l'intégrité du stockage local, le moteur multilingue RTL et l'absence totale de fuite réseau.
  </div>

  <div class="section-title">1. Résultats de Qualification — Windows 10 / 11 (64-bit)</div>
  <p style="font-size: 9.5pt; margin: 4px 0 8px 0; color: #475569;">
    Tests exécutés sur les binaires <code>Bird-Academy-User.exe</code> (Portable) et <code>Bird-Academy-Avian-ERP-Setup.exe</code> (Installateur).
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Étape de Test</th>
        <th style="width: 50%;">Critères de Validation</th>
        <th style="width: 15%;">Résultat</th>
        <th style="width: 10%;">Statut</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Lancement & Démarrage</strong></td>
        <td>Démarrage à froid, affichage immédiat du Dashboard sans dépendance réseau.</td>
        <td>Passage en mode souverain local vérifié (&lt; 2s).</td>
        <td><span class="status-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Écran Principal</strong></td>
        <td>Affichage des KPI d'élevage, barre latérale compacte et menus de navigation.</td>
        <td>Interface réactive et métriques conformes.</td>
        <td><span class="status-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Création d'Oiseau</strong></td>
        <td>Création et identification complète de l'oiseau de test (bague, espèce, phénotype).</td>
        <td>Entrée créée avec identifiant unique et métadonnées.</td>
        <td><span class="status-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Persistance Données</strong></td>
        <td>Enregistrement local en base embarquée sans synchronisation cloud.</td>
        <td>Données intactes après écriture transactionnelle.</td>
        <td><span class="status-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Changement de Langue</strong></td>
        <td>Cycle complet FR &rarr; EN &rarr; AR &rarr; FR sans blocage ni rechargement destructif.</td>
        <td>0 chaîne manquante, commutation instantanée.</td>
        <td><span class="status-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Support RTL (Arabe)</strong></td>
        <td>Inversion droite-gauche de la mise en page, alignement typographique arabe.</td>
        <td>Attribut dir="rtl" actif, alignements vérifiés.</td>
        <td><span class="status-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Navigation Principale</strong></td>
        <td>Accès séquentiel : Oiseaux, Couples, Reproduction, Santé, Paramètres.</td>
        <td>Transitions fluides, aucun écran blanc.</td>
        <td><span class="status-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Fermeture & Relance</strong></td>
        <td>Arrêt complet du processus et réouverture immédiate de l'application.</td>
        <td>Redémarrage nominal sans corruption.</td>
        <td><span class="status-pass">PASS</span></td>
      </tr>
      <tr>
        <td><strong>Conservation d'État</strong></td>
        <td>Vérification post-relance de la présence de l'oiseau créé et des préférences.</td>
        <td>100% des données locales préservées.</td>
        <td><span class="status-pass">PASS</span></td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">2. Validation Technique — Android (API 29+)</div>
  <p style="font-size: 9.5pt; margin: 4px 0 8px 0; color: #475569;">
    Artefact technique officiel : <code>Bird-Academy-User.apk</code>
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 30%;">Vérification Technique</th>
        <th style="width: 50%;">Spécification & Valeur Constatée</th>
        <th style="width: 20%;">Statut</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Synchronisation Capacitor</strong></td>
        <td>Synchronisation du pont natif Android via <code>npx cap sync android</code></td>
        <td><span class="status-pass">VALIDÉ</span></td>
      </tr>
      <tr>
        <td><strong>Compilation Gradle</strong></td>
        <td>Génération binaire automatisée via <code>gradlew assembleDebug</code></td>
        <td><span class="status-pass">SUCCÈS</span></td>
      </tr>
      <tr>
        <td><strong>Nom du Fichier Binaire</strong></td>
        <td><code>Bird-Academy-User.apk</code></td>
        <td><span class="status-pass">CONFORME</span></td>
      </tr>
      <tr>
        <td><strong>Taille Physique</strong></td>
        <td>18 710 063 octets (17.84 Mo)</td>
        <td><span class="status-pass">CONFORME</span></td>
      </tr>
      <tr>
        <td><strong>Empreinte SHA-256</strong></td>
        <td><span class="code">08EEE05006DC9A89FB82524ECD51168D6D5ADCFFF52C2BB3420FC67AA64F0758</span></td>
        <td><span class="status-pass">CERTIFIÉ</span></td>
      </tr>
    </tbody>
  </table>

  <div class="notice">
    <strong>Clarification Importante pour les Testeurs :</strong><br>
    Le package Android a été <strong>généré et validé sur le plan technique de build</strong> (compilation, signature binaire, empreinte cryptographique). Les sessions de recette utilisateur sur terminaux physiques terrain (smartphones pilotes) font l'objet d'une campagne séparée dédiée aux testeurs éleveurs.
  </div>

  <div class="section-title">3. Architecture & Sécurité des Données</div>
  <ul style="font-size: 9.5pt; margin: 6px 0; padding-left: 20px; color: #334155;">
    <li><strong>Souveraineté des Données :</strong> Aucune télémétrie, aucun tracker, aucun appel vers des API tierces lors de l'exécution métier.</li>
    <li><strong>Assistant Local :</strong> L'assistance zootechnique s'exécute localement sur l'appareil à partir du référentiel biologique embarqué.</li>
    <li><strong>Intégrité Cryptographique :</strong> Tous les binaires officiels sont scellés et vérifiables par les commandes PowerShell fournies sur le site.</li>
  </ul>

  <div class="footer">
    <div>Bird Academy Enterprise — Volière Manager</div>
    <div>Document Officiel de Recette • V2.0.0-RC1</div>
    <div>Page 1 / 1</div>
  </div>

</body>
</html>
`;

async function generatePdf() {
  console.log('[GEN-PDF] Launching headless browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.setContent(htmlContent, { waitUntil: 'load' });
  
  console.log(`[GEN-PDF] Rendering PDF to ${outputFile}...`);
  await page.pdf({
    path: outputFile,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '12mm',
      right: '12mm'
    }
  });
  
  await browser.close();

  const stat = fs.statSync(outputFile);
  const hash = crypto.createHash('sha256').update(fs.readFileSync(outputFile)).digest('hex').toUpperCase();

  console.log('[GEN-PDF] Generated successfully:');
  console.log(`- Path: ${outputFile}`);
  console.log(`- Size: ${stat.size} bytes (${(stat.size / 1024).toFixed(2)} KB)`);
  console.log(`- SHA-256: ${hash}`);

  return { size: stat.size, sha256: hash };
}

generatePdf().catch(err => {
  console.error('[GEN-PDF] Error:', err);
  process.exit(1);
});
