/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — SUPPORT CONTACT SECTION (AVIAN PRECISION)
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../../i18n';
import { SupportTicketSubmission } from '../../types';
import { LifeBuoy, Send, CheckCircle2, MessageSquare, ShieldCheck, Mail, BookOpen, Clock, Zap, UserCheck } from 'lucide-react';

export const SupportContactSection: React.FC = () => {
  const { t, isRtl } = useWebLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'licensing' | 'activation' | 'downloads' | 'technical' | 'commercial' | 'general'>('licensing');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<SupportTicketSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Adresse email invalide.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    // Save ticket locally in offline storage
    const newTicket: SupportTicketSubmission = {
      ticketId: `TICK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      name: name.trim(),
      email: email.trim(),
      category,
      subject: subject.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'OPEN',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('bird_academy_support_tickets') || '[]');
      existing.unshift(newTicket);
      localStorage.setItem('bird_academy_support_tickets', JSON.stringify(existing));
    } catch (e) {
      console.warn('Local storage error for support tickets:', e);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedTicket(newTicket);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 300);
  };

  return (
    <section 
      id="support" 
      className="py-16 sm:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="support-contact-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black tracking-widest text-[#2e3a8c] dark:text-indigo-400 uppercase bg-[#f0f3fa] dark:bg-indigo-950 px-3.5 py-1 rounded-full">
            Support Technique & Accompagnement
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('supportPage.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('supportPage.subtitle')}
          </p>
        </div>

        {/* Success Banner */}
        {submittedTicket && (
          <div 
            className="max-w-4xl mx-auto p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3"
            data-testid="support-ticket-success"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('supportPage.successTitle')}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t('supportPage.successText')}
                </p>
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 border border-emerald-100 dark:border-emerald-900 flex justify-between items-center">
              <span>Référence du ticket : <strong>{submittedTicket.ticketId}</strong></span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Enregistré Localement</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Trust Reassurance Block */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
              
              {/* Guaranteed Response Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-black border border-amber-300">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>⚡ Temps de réponse garanti &lt; 24h ouvrées</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Engagement de Service & Confidentialité
              </h3>

              <ul className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e0e7f7] dark:bg-indigo-950 text-[#2e3a8c] dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">Documentation & Guides Pratiques</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Accédez aux fiches d'installation, tutoriels de baguage et protocoles génétiques.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e0e7f7] dark:bg-indigo-950 text-[#2e3a8c] dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">Confidentialité Respectée</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Vos coordonnées et demandes sont strictement protégées sans démarchage.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e0e7f7] dark:bg-indigo-950 text-[#2e3a8c] dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">Assistance Dédiée Aviculture</strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Support assuré par des passionnés qui comprennent les réalités du terrain.</span>
                  </div>
                </li>
              </ul>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-500 dark:text-slate-400 block">Email direct du support :</span>
                <span className="font-mono font-bold text-[#2e3a8c] dark:text-indigo-400 text-sm">contact@birdacademy.internal</span>
              </div>

            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <form 
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-5"
              data-testid="support-contact-form"
            >
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}

              {/* Dual Column Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t('supportPage.nameLabel')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Jean Dupont"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#f7f9fb] dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2e3a8c] focus:outline-none"
                    data-testid="support-input-name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t('supportPage.emailLabel')} *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: jean@exemple.fr"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#f7f9fb] dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2e3a8c] focus:outline-none"
                    data-testid="support-input-email"
                  />
                </div>
              </div>

              {/* Dual Column Category & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t('supportPage.categoryLabel')} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#f7f9fb] dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2e3a8c] focus:outline-none"
                    data-testid="support-select-category"
                  >
                    <option value="licensing">{t('supportPage.catLicensing')}</option>
                    <option value="activation">{t('supportPage.catActivation')}</option>
                    <option value="downloads">{t('supportPage.catDownloads')}</option>
                    <option value="technical">{t('supportPage.catTechnical')}</option>
                    <option value="commercial">{t('supportPage.catCommercial')}</option>
                    <option value="general">{t('supportPage.catGeneral')}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t('supportPage.subjectLabel')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Objet du message"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#f7f9fb] dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2e3a8c] focus:outline-none"
                    data-testid="support-input-subject"
                  />
                </div>
              </div>

              {/* Large Textarea for Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t('supportPage.messageLabel')} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Expliquez en détail votre demande..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-[#f7f9fb] dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2e3a8c] focus:outline-none"
                  data-testid="support-input-message"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#2e3a8c] hover:bg-[#1e265c] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-950/20 transition flex items-center justify-center gap-2 cursor-pointer"
                data-testid="support-btn-submit"
              >
                <Send className="w-4 h-4 text-[#ffc107]" />
                <span>{isSubmitting ? 'Envoi en cours...' : t('supportPage.btnSubmit')}</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
