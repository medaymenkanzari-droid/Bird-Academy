/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Printer, Download, Copy, Check, X, ShieldCheck, User, Calendar, 
  Coins, Sparkles, Building2, Feather, QrCode, HeartPulse, Scale, 
  CheckCircle2, Award, FileCheck 
} from 'lucide-react';
import { Canari, Vente } from '../../../types';
import { TransferCertificateData } from '../models/finance';
import { AppButton, AppLogo, AppIcon } from '../../../components/design-system';
import { QRCodeManager } from '../../habitat/services/QRCodeManager';
import { calculateInbreedingCOI } from '../../../utils/genealogy';
import { BirdRepository } from '../../birds/repositories/BirdRepository';
import { printDocument, exportDocumentAsPDF } from '../../../utils/printUtils';
import { formatCurrency } from '../../../utils/currencyFormatter';

export interface TransferCertificateDocumentProps {
  sale: Vente;
  bird?: Canari;
  allBirds?: Canari[];
  onClose?: () => void;
  className?: string;
  isFloating?: boolean;
}

export const TransferCertificateDocument: React.FC<TransferCertificateDocumentProps> = ({
  sale,
  bird: propBird,
  allBirds: propAllBirds,
  onClose,
  className = '',
  isFloating = true
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  // Retrieve complete bird and pedigree ancestry
  const allBirds = useMemo(() => propAllBirds || BirdRepository.getAll(), [propAllBirds]);
  const bird = useMemo(() => {
    if (propBird) return propBird;
    return allBirds.find(b => b.id === sale.canari_id) || null;
  }, [propBird, allBirds, sale.canari_id]);

  // Parents for mini-pedigree
  const fatherBird = useMemo(() => {
    if (!bird?.pere_id) return null;
    return allBirds.find(b => b.id === bird.pere_id) || null;
  }, [bird, allBirds]);

  const motherBird = useMemo(() => {
    if (!bird?.mere_id) return null;
    return allBirds.find(b => b.id === bird.mere_id) || null;
  }, [bird, allBirds]);

  // Consanguinity calculation
  const coiScore = useMemo(() => {
    if (!bird || !bird.pere_id || !bird.mere_id) return 0;
    return calculateInbreedingCOI(Number(bird.pere_id), Number(bird.mere_id), allBirds);
  }, [bird, allBirds]);

  // Certificate Number
  const certificateNumber = useMemo(() => {
    const year = sale.date ? new Date(sale.date).getFullYear() : new Date().getFullYear();
    const month = sale.date ? String(new Date(sale.date).getMonth() + 1).padStart(2, '0') : '08';
    return `CERT-${year}-${month}-${sale.id.toString().padStart(4, '0')}`;
  }, [sale]);

  // QR Code payload & async state
  const qrCodeValue = `BA:CERT:${certificateNumber}:${bird?.bague || sale.canari_id}`;
  const [qrCodeSvg, setQrCodeSvg] = React.useState<string>('');

  React.useEffect(() => {
    let isMounted = true;
    QRCodeManager.generateSVG(qrCodeValue, 80)
      .then(svg => {
        if (isMounted) setQrCodeSvg(svg);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [qrCodeValue]);

  const handlePrint = () => {
    printDocument('transfer-cert-a4-sheet');
  };

  const handleDownloadPDF = () => {
    exportDocumentAsPDF({
      title: `Attestation_Cession_${bird?.bague || sale.canari_id}`,
      subtitle: `Certificat officiel de cession d'oiseau - ${certificateNumber}`,
      language: 'fr',
      sections: [
        {
          title: 'Détails de la cession',
          metrics: [
            { label: 'Numéro Certificat', value: certificateNumber },
            { label: 'Bague de l\'Oiseau', value: bird?.bague || `#${sale.canari_id}` },
            { label: 'Prix de Vente', value: formatCurrency(sale.prix) },
            { label: 'Acquéreur', value: sale.acheteur || 'Non renseigné' },
          ],
          table: {
            headers: ['Champ', 'Détail de l\'acte de cession'],
            rows: [
              ['Date de l\'acte', sale.date],
              ['Espèce & Variété', bird?.race || 'Canari domestique'],
              ['Sexe', bird?.sexe || 'Indéterminé'],
              ['Mutation / Couleur', bird?.mutation || bird?.couleur || 'Classique'],
              ['Père ♂', fatherBird ? `${fatherBird.bague} (${fatherBird.nom || ''})` : 'Non renseigné'],
              ['Mère ♀', motherBird ? `${motherBird.bague} (${motherBird.nom || ''})` : 'Non renseigné'],
              ['Consanguinité COI', `${coiScore}%`],
              ['Observations', sale.description || 'Oiseau sevré et bagué fermé conforme.']
            ]
          }
        }
      ]
    });
  };

  const handleCopyText = () => {
    const text = `=========================================
ATTESTATION OFFICIELLE DE CESSION D'OISEAUX
Numéro de Certificat : ${certificateNumber}
Date d'émission      : ${sale.date}
=========================================
CÉDANT (Éleveur)     : Élevage Bird Academy (BA-STAMM-2026)
ACQUÉREUR           : ${sale.acheteur || 'Particulier'}
-----------------------------------------
OISEAU CÉDÉ :
- Numéro de Bague   : ${bird?.bague || sale.canari_id}
- Espèce & Sexe     : ${bird?.race || 'Canari'} (${bird?.sexe || 'Indéterminé'})
- Phénotype/Mutation: ${bird?.mutation || bird?.couleur || 'Standard'}
- Date de Naissance : ${bird?.date_naissance || 'Inconnue'}
- Consanguinité COI : ${coiScore}%
-----------------------------------------
PRIX DE CESSION     : ${formatCurrency(sale.prix)}
=========================================`;

    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`relative ${className}`}>
      
      {/* Top Floating Action Bar (Hidden in Print) */}
      <div className="print:hidden sticky top-0 z-30 mb-6 bg-slate-900/95 border border-slate-800 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 flex-wrap text-white">
        
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white tracking-tight">
              Aperçu Format A4 • Attestation Officielle de Cession
            </h3>
            <span className="text-3xs font-mono text-slate-400">
              Réf : {certificateNumber} • Bague : {bird?.bague || `#${sale.canari_id}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <AppButton
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            startIcon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold"
          >
            {isCopied ? 'Copié !' : 'Copier Récapitulatif'}
          </AppButton>

          <AppButton
            variant="secondary"
            size="sm"
            onClick={handleDownloadPDF}
            startIcon={<Download className="w-3.5 h-3.5" />}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
          >
            Télécharger PDF
          </AppButton>

          <AppButton
            variant="primary"
            size="sm"
            onClick={handlePrint}
            startIcon={<Printer className="w-3.5 h-3.5 text-white" />}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 px-4"
          >
            Imprimer l'Attestation
          </AppButton>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>

      {/* A4 Sheet Container (Target for Printing & PDF Generation) */}
      <div className="flex justify-center select-text">
        
        <div 
          id="transfer-cert-a4-sheet"
          className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-none sm:rounded-2xl border border-slate-300 font-sans text-xs space-y-6 relative overflow-hidden print:p-0 print:border-none print:shadow-none print:m-0"
        >
          
          {/* Subtle Guilloche Watermark Emblem */}
          <div className="absolute right-12 top-24 opacity-[0.06] pointer-events-none select-none">
            <AppIcon className="w-80 h-80" variant="mono-light" />
          </div>

          {/* 1. Official Header */}
          <div className="flex items-start justify-between border-b-2 border-blue-900 pb-5">
            <div className="space-y-1.5 max-w-[70%]">
              <div className="flex items-center gap-2">
                <AppLogo size="sm" variant="light" sublineText="REGISTRE OFFICIEL DE TRAÇABILITÉ AVIAIRE" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase leading-tight font-serif">
                Attestation Officielle de Cession d'Oiseaux d'Élevage
              </h1>
              <p className="text-4xs text-slate-600 leading-snug">
                Document valant certificat de transfert de propriété et certificat sanitaire d'origine conforme aux règlements C.O.M. / F.F.O. / U.O.F.
              </p>
            </div>

            {/* Top Right: Certificate Number, Date & Dynamic QR Code */}
            <div className="flex flex-col items-end space-y-2 shrink-0">
              <div 
                className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-300 shadow-sm"
                dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                title={`Smart QR: ${qrCodeValue}`}
              />
              <div className="text-right font-mono">
                <div className="text-3xs font-black text-blue-950 uppercase tracking-wider">
                  {certificateNumber}
                </div>
                <div className="text-4xs text-slate-600">
                  Délivré le : <strong>{sale.date}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Parties Section (2-Column Grid: Cédant vs Cessionnaire) */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Cédant (Éleveur Naissance) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-sm">
              <div className="text-3xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Building2 className="w-3.5 h-3.5 text-blue-800" />
                1. Le Cédant (Éleveur / Propriétaire)
              </div>
              <div className="font-extrabold text-sm text-slate-900">
                Élevage Bird Academy
              </div>
              <div className="text-3xs text-slate-700 space-y-0.5 font-sans">
                <div>Affixe / STAMM : <strong className="font-mono text-blue-900">BA-STAMM-2026</strong></div>
                <div>Fédération : <strong>C.O.M. / FFO France</strong></div>
                <div>Immatriculation : <strong className="font-mono">STAMM-FR-042</strong></div>
                <div>Contact : <strong>contact@birdacademy.com</strong></div>
              </div>
            </div>

            {/* Cessionnaire (Acquéreur) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 shadow-sm">
              <div className="text-3xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <User className="w-3.5 h-3.5 text-blue-800" />
                2. Le Cessionnaire (Acquéreur)
              </div>
              <div className="font-extrabold text-sm text-slate-900">
                {sale.acheteur || 'Acquéreur Particulier'}
              </div>
              <div className="text-3xs text-slate-700 space-y-0.5 font-sans">
                <div>Statut : <strong>Particulier / Éleveur capacitaire</strong></div>
                <div>Date de remise : <strong>{sale.date}</strong></div>
                <div>Lieu de transfert : <strong>Station d’élevage</strong></div>
                <div>Identifiant Cession : <strong className="font-mono text-blue-900">ACQ-{sale.id.toString().padStart(4, '0')}</strong></div>
              </div>
            </div>

          </div>

          {/* 3. Bird Identification Card */}
          <div className="space-y-2">
            <div className="text-3xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-800" />
              3. Identification & Signalement de l'Oiseau
            </div>

            <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-300 text-3xs font-black uppercase tracking-wider text-slate-700">
                  <tr>
                    <th className="p-2.5">Numéro de Bague Fermée</th>
                    <th className="p-2.5">Espèce & Variété</th>
                    <th className="p-2.5">Sexe</th>
                    <th className="p-2.5">Mutation / Phénotype</th>
                    <th className="p-2.5">Date Naissance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="p-2.5 font-mono font-black text-blue-950 text-sm">
                      <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                        {bird?.bague || `BAGUE-#${sale.canari_id}`}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-slate-900">
                      {bird?.race || 'Serinus canaria (Canari)'}
                    </td>
                    <td className="p-2.5 font-bold">
                      {bird?.sexe?.startsWith('M') ? '♂ Mâle' : bird?.sexe?.startsWith('F') ? '♀ Femelle' : 'Indéterminé'}
                    </td>
                    <td className="p-2.5 font-medium text-slate-800">
                      {bird?.mutation || bird?.couleur || 'Classique'}
                    </td>
                    <td className="p-2.5 font-mono text-slate-700">
                      {bird?.date_naissance || 'Non renseignée'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Mini-Pedigree & Health Certification Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Mini Pedigree Summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-3xs font-black uppercase tracking-wider text-blue-900 flex items-center justify-between border-b border-slate-200 pb-1">
                <span className="flex items-center gap-1">
                  <Feather className="w-3 h-3 text-blue-800" />
                  4. Ascendance Génétique (F1)
                </span>
                <span className="font-mono text-4xs bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-bold">
                  COI : {coiScore}%
                </span>
              </div>

              <div className="space-y-1.5 text-3xs">
                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 font-mono">
                  <span className="font-sans font-bold text-blue-900">Père ♂ :</span>
                  <span className="font-extrabold text-slate-900">
                    {fatherBird ? `${fatherBird.bague} (${fatherBird.nom || fatherBird.race || 'Canari'})` : 'Père non renseigné / Souche externe'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 font-mono">
                  <span className="font-sans font-bold text-pink-900">Mère ♀ :</span>
                  <span className="font-extrabold text-slate-900">
                    {motherBird ? `${motherBird.bague} (${motherBird.nom || motherBird.race || 'Canari'})` : 'Mère non renseignée / Souche externe'}
                  </span>
                </div>
              </div>
            </div>

            {/* Health Certification Checklist */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-3xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-1 border-b border-slate-200 pb-1">
                <HeartPulse className="w-3 h-3 text-emerald-700" />
                5. Déclaration Sanitaire & Conformité
              </div>

              <div className="space-y-1 text-4xs text-slate-700 leading-tight">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Bague fermée inamovible de diamètre officiel réglementaire.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Sevrage complet, autonomie hydrique et alimentaire constatée.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Absence de signes cliniques visibles ou d'affections contagieuses.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>Traitements antiparasitaires et vermifuges à jour.</span>
                </div>
              </div>
            </div>

          </div>

          {/* 5. Financial Terms & Conditions */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
            <div className="flex items-center justify-between font-bold text-slate-900">
              <span className="text-3xs uppercase tracking-wider text-blue-900 font-black">
                6. Conditions Financières & Transfert de Propriété
              </span>
              <span className="text-sm font-black font-mono text-blue-950">
                Montant total : {formatCurrency(sale.prix)}
              </span>
            </div>
            <p className="text-4xs text-slate-600 leading-relaxed">
              {sale.description ? `${sale.description}. ` : ''}Le transfert de propriété est effectif dès la remise physique de l'oiseau et le complet règlement. L'acquéreur s'engage à subvenir aux besoins physiologiques de l'animal conformément aux exigences de bien-être animal en vigueur.
            </p>
          </div>

          {/* 6. Legal Notice & Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-slate-300">
            
            {/* Signature Cédant */}
            <div className="space-y-10">
              <div className="space-y-0.5">
                <div className="font-extrabold text-3xs uppercase text-slate-900">
                  Signature du Cédant (Vendeur) :
                </div>
                <div className="text-4xs text-slate-500 italic">
                  (Mention manuscrite "Bon pour cession et transfert")
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 h-8" />
            </div>

            {/* Signature Cessionnaire */}
            <div className="space-y-10">
              <div className="space-y-0.5">
                <div className="font-extrabold text-3xs uppercase text-slate-900">
                  Signature de l'Acquéreur :
                </div>
                <div className="text-4xs text-slate-500 italic">
                  (Mention manuscrite "Reçu oiseau conforme et en bon état")
                </div>
              </div>

              <div className="border-b border-dashed border-slate-400 h-8" />
            </div>

          </div>

          {/* Footer Official Stamp Line */}
          <div className="text-center pt-3 border-t border-slate-200 text-4xs text-slate-400 font-mono">
            Document généré électroniquement par Bird Academy User App • Horodatage certifié • Page 1/1
          </div>

        </div>

      </div>

    </div>
  );
};

export default TransferCertificateDocument;
