/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY ENTERPRISE — TESTER FEEDBACK MODAL
 * Clean, lightweight, offline-first feedback modal for public testers.
 */

import React, { useState } from 'react';
import { 
  X, MessageSquare, Bug, HelpCircle, Layout, Lightbulb, PlusCircle, 
  Send, CheckCircle2, Copy, Check, ShieldCheck, AlertTriangle, Image as ImageIcon, Trash2
} from 'lucide-react';
import { FeedbackType, FeedbackSeverity, TesterFeedback } from '../types';
import { FeedbackService } from '../services/FeedbackService';
import { useSubscription } from '../../subscription/hooks/useSubscription';
import { BUILD_ID, BUILD_VERSION_NAME } from '../../../config/appMode';

export interface TesterFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab?: string;
}

export const TesterFeedbackModal: React.FC<TesterFeedbackModalProps> = ({
  isOpen,
  onClose,
  currentTab = 'Général',
}) => {
  const { currentTier } = useSubscription();

  const [type, setType] = useState<FeedbackType>('bug');
  const [severity, setSeverity] = useState<FeedbackSeverity>('important');
  const [moduleName, setModuleName] = useState<string>(currentTab);
  const [description, setDescription] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [screenshotName, setScreenshotName] = useState<string | undefined>(undefined);
  const [screenshotBase64, setScreenshotBase64] = useState<string | undefined>(undefined);
  
  const [submittedFeedback, setSubmittedFeedback] = useState<TesterFeedback | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('La capture d\'écran ne doit pas dépasser 2 Mo.');
      return;
    }

    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
    setErrorMsg(null);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotName(undefined);
    setScreenshotBase64(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Veuillez renseigner une description détaillée de votre retour.');
      return;
    }

    try {
      const saved = FeedbackService.save({
        type,
        severity,
        module: moduleName || currentTab,
        description,
        licenseType: currentTier === 'FREE' ? 'FREE' : 'TEST (30 jours)',
        screenshotName,
        screenshotBase64,
        contactEmail: contactEmail.trim() || undefined,
      });

      setSubmittedFeedback(saved);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg('Erreur lors de l\'enregistrement local du retour.');
    }
  };

  const handleCopyReport = () => {
    if (!submittedFeedback) return;
    const reportText = FeedbackService.getFormattedReport(submittedFeedback);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResetAndClose = () => {
    setDescription('');
    setContactEmail('');
    setScreenshotName(undefined);
    setScreenshotBase64(undefined);
    setSubmittedFeedback(null);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
      role="dialog"
      aria-modal="true"
      data-testid="tester-feedback-modal"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Retour de Test & Signalement d'Anomalie
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Version de Test v{BUILD_VERSION_NAME || '1.3.6'} • {BUILD_ID || 'BA-V1.3.6'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {submittedFeedback ? (
            /* Success confirmation */
            <div className="space-y-5 text-center py-4" data-testid="feedback-success-state">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Signalement Enregistré avec Succès
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Votre retour a été sauvegardé localement sous la référence :
                </p>
                <div className="inline-block px-3 py-1 font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  {submittedFeedback.id}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Résumé du rapport :
                </span>
                <pre className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {FeedbackService.getFormattedReport(submittedFeedback)}
                </pre>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  data-testid="feedback-btn-copy"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-indigo-200" />}
                  <span>{copied ? 'Rapport copié dans le presse-papier !' : 'Copier le rapport complet'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Feedback Form */
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="tester-feedback-form">
              
              {errorMsg && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Type de retour *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'bug', label: 'Bug / Anomalie', icon: Bug },
                    { id: 'ux', label: 'Problème UX', icon: Layout },
                    { id: 'question', label: 'Question', icon: HelpCircle },
                    { id: 'suggestion', label: 'Suggestion', icon: Lightbulb },
                    { id: 'missing_feature', label: 'Fonction manquante', icon: PlusCircle },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = type === t.id;
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setType(t.id as FeedbackType)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 font-semibold transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Gravity / Severity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Niveau de gravité *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { id: 'blocker', label: 'Bloquant', desc: 'Empêche l\'usage' },
                    { id: 'important', label: 'Important', desc: 'Gêne le travail' },
                    { id: 'minor', label: 'Mineur', desc: 'Détail d\'affichage' },
                    { id: 'idea', label: 'Idée', desc: 'Piste d\'avenir' },
                  ].map((s) => {
                    const isSelected = severity === s.id;
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setSeverity(s.id as FeedbackSeverity)}
                        className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="font-bold text-xs">{s.label}</div>
                        <div className="text-[10px] text-slate-400 opacity-80">{s.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Context pre-filled fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Module concerné</label>
                  <input
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    placeholder="Ex: Canaris, Wright, Cages, Export..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Votre email (optionnel)</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Pour recevoir un suivi"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Description détaillée du retour *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez ce qui s'est passé, les étapes pour reproduire l'anomalie, ou votre suggestion..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  data-testid="feedback-input-description"
                />
              </div>

              {/* Optional Screenshot */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Capture d'écran (optionnel, max 2 Mo)</span>
                  {screenshotName && (
                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer font-normal"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Retirer</span>
                    </button>
                  )}
                </label>
                {!screenshotName ? (
                  <label className="flex items-center gap-2 p-2.5 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-500 dark:text-slate-400">
                    <ImageIcon className="w-4 h-4 text-indigo-500" />
                    <span>Sélectionner une image (PNG, JPG, WebP)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate flex-1">{screenshotName}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Attachée</span>
                  </div>
                )}
              </div>

              {/* Privacy Reassurance Banner */}
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-850 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Protection de votre élevage :</strong> Aucune donnée réelle (oiseaux, couples, finances) n'est incluse par défaut. Seul le diagnostic technique et votre message sont consignés.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-2 cursor-pointer"
                  data-testid="feedback-btn-submit"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Enregistrer le retour</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
