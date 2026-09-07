/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Award, Trophy, Plus, Medal, FileCheck, Printer, Trash2, Calendar, MapPin, 
  User, CheckCircle2, Sparkles, X 
} from 'lucide-react';
import { Canari } from '../../../types';
import { BirdPalmaresEntry } from '../models/passport';
import { PassportDataService } from '../services/PassportDataService';
import { AppButton, AppInput, AppSelect, AppModal } from '../../../components/design-system';
import { useLanguage } from '../../../context/LanguageContext';

export interface BirdPalmaresTabProps {
  bird: Canari;
}

export const BirdPalmaresTab: React.FC<BirdPalmaresTabProps> = ({ bird }) => {
  const { t, language, isRtl } = useLanguage();

  const [palmares, setPalmares] = useState<BirdPalmaresEntry[]>(() => 
    PassportDataService.getPalmaresForBird(bird.id, bird)
  );

  // Reload palmares when bird id changes (fixes hot bird switch bug)
  useEffect(() => {
    setPalmares(PassportDataService.getPalmaresForBird(bird.id, bird));
  }, [bird.id]);

  // Determine appropriate default COM section based on species
  const getDefaultSection = (speciesId?: string) => {
    if (speciesId === 'chardonneret_elegant') return 'Section F (Faune Européenne)';
    if (speciesId === 'diamant_mandarin' || speciesId === 'diamant_gould') return 'Section E (Exotiques Estrildidés)';
    if (speciesId === 'perruche_ondulee' || speciesId === 'agapornis' || speciesId === 'calopsitte') return 'Section G/H (Psittacidés)';
    return 'Section D (Canaris de Couleur & Posture)';
  };

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [newShowName, setNewShowName] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLocation, setNewLocation] = useState('');
  const [newSection, setNewSection] = useState(() => getDefaultSection(bird.espece));
  const [newScore, setNewScore] = useState('91');
  const [newRank, setNewRank] = useState("1er Prix - Médaille d'Or");
  const [newMedal, setNewMedal] = useState<'Gold' | 'Silver' | 'Bronze' | 'Honorable'>('Gold');
  const [newJudge, setNewJudge] = useState('');
  const [newCertNum, setNewCertNum] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Summary counters
  const summary = PassportDataService.getPalmaresSummary(bird.id, bird);

  const handleAddPalmares = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShowName.trim()) return;

    const scoreNum = parseInt(newScore, 10) || 90;
    const added = PassportDataService.addPalmaresEntry({
      birdId: bird.id,
      date: newDate,
      showName: newShowName.trim(),
      location: newLocation.trim() || undefined,
      sectionCom: newSection,
      scorePoints: scoreNum,
      rank: newRank.trim() || undefined,
      medal: newMedal,
      judgeName: newJudge.trim() || undefined,
      certificateNumber: newCertNum.trim() || `CERT-${Date.now().toString().slice(-6)}`,
      notes: newNotes.trim() || undefined
    });

    setPalmares(prev => [added, ...prev]);
    setIsAddModalOpen(false);
    setNewShowName('');
    setNewNotes('');
  };

  const handleDeletePalmares = (id: string) => {
    PassportDataService.deletePalmaresEntry(id);
    setPalmares(prev => prev.filter(p => p.id !== id));
  };

  const handlePrintCertificate = (entry: BirdPalmaresEntry) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Certificat de Palmarès - ${bird.nom || bird.bague} (${bird.bague})</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              padding: 40px;
              text-align: center;
              color: #0f172a;
              background: #fff;
            }
            .cert-card {
              border: 8px double #b45309;
              padding: 40px;
              border-radius: 16px;
              max-width: 650px;
              margin: 0 auto;
            }
            .header-title {
              font-size: 28px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #92400e;
              margin-bottom: 8px;
            }
            .sub {
              font-size: 14px;
              font-style: italic;
              color: #64748b;
              margin-bottom: 24px;
            }
            .bird-name {
              font-size: 22px;
              font-weight: bold;
              color: #0f172a;
            }
            .ring {
              font-size: 14px;
              font-family: monospace;
              color: #059669;
              margin: 6px 0 20px 0;
            }
            .award-box {
              background: #fef3c7;
              border: 1px solid #fde68a;
              padding: 16px;
              border-radius: 12px;
              font-size: 18px;
              font-weight: bold;
              color: #b45309;
              margin: 20px 0;
            }
            .details {
              font-size: 13px;
              color: #334155;
              line-height: 1.8;
              text-align: left;
              margin-top: 20px;
              padding: 16px;
              background: #f8fafc;
              border-radius: 8px;
            }
            .footer {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              color: #64748b;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="cert-card">
            <div class="header-title">Certificat Officiel de Palmarès</div>
            <div class="sub">Confédération Ornithologique & Bird Academy</div>
            
            <div class="bird-name">${bird.nom || bird.bague}</div>
            <div class="ring">Bague : ${bird.bague} • ${bird.race || bird.espece || 'Standard'}</div>

            <div class="award-box">
              🏆 ${entry.rank || 'Distinction Ornithologique'} (${entry.scorePoints}/100 pts)
            </div>

            <div class="details">
              Exposition : <strong>${entry.showName}</strong><br/>
              Section : ${entry.sectionCom}<br/>
              Juge : ${entry.judgeName || 'OMJ/COM'}<br/>
              Date : ${entry.date}
            </div>

            <div class="footer">
              <div>N° Homologation : ${entry.certificateNumber || 'COM-CERT'}</div>
              <div>Visa & Signature</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={`space-y-6 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Top Palmarès Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
          <div className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            {t('medalGold')}
          </div>
          <div className="text-3xl font-black font-mono text-amber-400">
            {summary.goldCount}
          </div>
          <div className="text-3xs text-slate-500 mt-1">1er Prix Standard</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
          <div className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
            <Medal className="w-3.5 h-3.5 text-slate-300" />
            {t('medalSilver')}
          </div>
          <div className="text-3xl font-black font-mono text-slate-300">
            {summary.silverCount}
          </div>
          <div className="text-3xs text-slate-500 mt-1">2ème Prix</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
          <div className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            {t('medalBronze')}
          </div>
          <div className="text-3xl font-black font-mono text-amber-600">
            {summary.bronzeCount}
          </div>
          <div className="text-3xs text-slate-500 mt-1">3ème Prix</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
          <div className="text-3xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'fr' ? 'Meilleur Score' : language === 'ar' ? 'أعلى درجة' : 'Best Score'}
          </div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {summary.bestScore > 0 ? `${summary.bestScore} pts` : '—'}
          </div>
          <div className="text-3xs text-slate-500 mt-1">Record C.O.M.</div>
        </div>

      </div>

      {/* Main Exhibitions List Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-200">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{t('passportPalmaresTab')} ({palmares.length})</span>
          </div>

          <AppButton
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            startIcon={<Plus className="w-3.5 h-3.5" />}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
          >
            {t('addPalmares')}
          </AppButton>
        </div>

        {palmares.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Trophy className="w-10 h-10 text-slate-700 mx-auto mb-2" />
            <p>{t('palmaresEmpty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {palmares.map(entry => {
              const isGold = entry.medal === 'Gold' || entry.rank?.includes('Or');
              const isSilver = entry.medal === 'Silver' || entry.rank?.includes('Argent');
              const isBronze = entry.medal === 'Bronze' || entry.rank?.includes('Bronze');

              return (
                <div
                  key={entry.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Medal Icon Badge */}
                    <div className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                      isGold 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10' 
                        : isSilver 
                          ? 'bg-slate-300/20 text-slate-200 border border-slate-400/40' 
                          : isBronze 
                            ? 'bg-amber-800/20 text-amber-400 border border-amber-700/40' 
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    }`}>
                      <Trophy className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-sm text-white tracking-tight">
                          {entry.showName}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-lg text-2xs font-extrabold uppercase tracking-wider ${
                          isGold 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {entry.rank || `${entry.scorePoints} pts`}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-3xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {entry.date}
                        </span>
                        {entry.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {entry.location}
                          </span>
                        )}
                        <span>•</span>
                        <span className="font-mono text-slate-300">{entry.sectionCom}</span>
                        {entry.judgeName && (
                          <span>• {entry.judgeName}</span>
                        )}
                      </div>

                      {entry.notes && (
                        <p className="text-3xs text-slate-400 leading-snug pt-1 italic">
                          "{entry.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions & Score */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80">
                    <div className="text-right shrink-0">
                      <div className="text-xl font-black font-mono text-amber-400">
                        {entry.scorePoints} <span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                      <div className="text-4xs text-slate-500 font-mono">
                        {entry.certificateNumber || 'COM'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <AppButton
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintCertificate(entry)}
                        startIcon={<Printer className="w-3.5 h-3.5" />}
                        className="text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                        title={t('printCertificate')}
                      >
                        {t('printCertificate')}
                      </AppButton>
                      <button
                        onClick={() => handleDeletePalmares(entry.id)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-red-950 text-slate-500 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
                        title={t('delete')}
                        aria-label={t('delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal: Déclarer un résultat de concours */}
      {isAddModalOpen && (
        <AppModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={t('addPalmares')}
          size="md"
        >
          <form onSubmit={handleAddPalmares} className="space-y-4">
            <AppInput
              label={language === 'fr' ? "Nom de l'exposition / Championnat *" : language === 'ar' ? 'اسم المسابقة / المعرض *' : 'Show / Championship Name *'}
              value={newShowName}
              onChange={(e) => setNewShowName(e.target.value)}
              placeholder="ex. Championnat C.O.M."
              autoFocus
            />

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                label={language === 'fr' ? 'Date de la manifestation' : language === 'ar' ? 'التاريخ' : 'Date'}
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />

              <AppInput
                label={language === 'fr' ? 'Ville / Lieu' : language === 'ar' ? 'المدينة' : 'Location'}
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="ex. Paris"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppSelect
                label={language === 'fr' ? 'Section C.O.M.' : language === 'ar' ? 'فئة C.O.M.' : 'C.O.M. Section'}
                value={newSection}
                onChange={(e: any) => setNewSection(e.target.value)}
                options={[
                  { value: 'Section D (Canaris de Couleur)', label: 'Section D (Canaris de Couleur)' },
                  { value: 'Section E (Canaris de Posture)', label: 'Section E (Canaris de Posture)' },
                  { value: 'Section F (Faune Européenne)', label: 'Section F (Faune Européenne)' },
                  { value: 'Section G/H (Psittacidés)', label: 'Section G/H (Psittacidés)' },
                  { value: 'Section J (Exotiques)', label: 'Section J (Exotiques)' }
                ]}
              />

              <AppInput
                label={language === 'fr' ? 'Note attribuée (/100) *' : language === 'ar' ? 'الدرجة (/100) *' : 'Score (/100) *'}
                type="number"
                min="50"
                max="100"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppSelect
                label={language === 'fr' ? 'Distinction / Médaille' : language === 'ar' ? 'الميدالية' : 'Medal'}
                value={newMedal}
                onChange={(e: any) => setNewMedal(e.target.value)}
                options={[
                  { value: 'Gold', label: `🥇 ${t('medalGold')}` },
                  { value: 'Silver', label: `🥈 ${t('medalSilver')}` },
                  { value: 'Bronze', label: `🥉 ${t('medalBronze')}` },
                  { value: 'Honorable', label: `🎗️ ${t('medalHonorable')}` }
                ]}
              />

              <AppInput
                label={language === 'fr' ? 'Libellé du rang' : language === 'ar' ? 'المرتبة' : 'Rank'}
                value={newRank}
                onChange={(e) => setNewRank(e.target.value)}
                placeholder="1er Prix"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                label={language === 'fr' ? 'Juge officiel' : language === 'ar' ? 'الحكم' : 'Judge'}
                value={newJudge}
                onChange={(e) => setNewJudge(e.target.value)}
                placeholder=""
              />

              <AppInput
                label={language === 'fr' ? 'N° Certificat / Homologation' : language === 'ar' ? 'رقم الشهادة' : 'Certificate No.'}
                value={newCertNum}
                onChange={(e) => setNewCertNum(e.target.value)}
                placeholder=""
              />
            </div>

            <AppInput
              label={language === 'fr' ? 'Observations & Remarques du jury' : language === 'ar' ? 'ملاحظات' : 'Observations'}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder=""
            />

            <div className="flex justify-end gap-2 pt-2">
              <AppButton variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                {t('cancel')}
              </AppButton>
              <AppButton type="submit" variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-bold">
                {t('save')}
              </AppButton>
            </div>
          </form>
        </AppModal>
      )}

    </div>
  );
};

export default BirdPalmaresTab;
