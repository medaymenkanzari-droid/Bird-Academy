/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — SUPPORT CONTACT SECTION (AVIAN PRECISION)
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../../i18n';
import { SupportTicketSubmission } from '../../types';
import { LifeBuoy, Send, CheckCircle2, MessageSquare, ShieldCheck, Mail, BookOpen, Clock, Zap, UserCheck, AlertCircle } from 'lucide-react';

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
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  }>({});

  const validateForm = () => {
    const errors: { name?: string; email?: string; subject?: string; message?: string } = {};

    if (!name.trim()) {
      errors.name = 'Veuillez renseigner votre nom.';
    }

    if (!email.trim()) {
      errors.email = 'Veuillez renseigner votre adresse email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Adresse email invalide.';
    }

    if (!subject.trim()) {
      errors.subject = "Veuillez renseigner l'objet de votre demande.";
    }

    if (!message.trim()) {
      errors.message = 'Veuillez rédiger votre message.';
    }

    return errors;
  };

  const handleInvalid = () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.email && Object.keys(errors).length === 1) {
        setErrorMsg('Adresse email invalide.');
      } else {
        setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.email && Object.keys(errors).length === 1) {
        setErrorMsg('Adresse email invalide.');
      } else {
        setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      }
      return;
    }

    setFieldErrors({});
    setErrorMsg(null);
    setIsSubmitting(true);

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
        <div className="text-center max-w-4xl lg:max-w-5xl mx-auto space-y-3">
          <span className="text-xs font-black tracking-widest text-[#2e3a8c] dark:text-indigo-400 uppercase bg-[#f0f3fa] dark:bg-indigo-950 px-3.5 py-1 rounded-full">
            Support Technique & Accompagnement
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
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
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold uppercase">Enregistré Localement</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Trust Reassurance Block */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#f7f9fb] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
              
              {/* Guaranteed Response Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-700">
                <Clock className="w-4 h-4 text-amber-800 dark:text-amber-300" />
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
                    <span className="text-xs text-slate-600 dark:text-slate-400">Accédez aux fiches d'installation, tutoriels de baguage et protocoles génétiques.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e0e7f7] dark:bg-indigo-950 text-[#2e3a8c] dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">Confidentialité Respectée</strong>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Vos coordonnées et demandes sont strictement protégées sans démarchage.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e0e7f7] dark:bg-indigo-950 text-[#2e3a8c] dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">Assistance Dédiée Aviculture</strong>
                    <span className="text-xs text-slate-600 dark:text-slate-400">Support assuré par des passionnés qui comprennent les réalités du terrain.</span>
                  </div>
                </li>
              </ul>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-600 dark:text-slate-400 block">Email direct du support :</span>
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
                <div 
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2"
                  data-testid="support-form-error-banner"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Dual Column Contact Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="support-input-name" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t('supportPage.nameLabel')} *
                  </label>
                  <input
                    id="support-input-name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: undefined }));
                      }
                    }}
                    onInvalid={handleInvalid}
                    placeholder="Ex: Jean Dupont"
                    aria-invalid={fieldErrors.name ? 'true' : undefined}
                    aria-describedby={fieldErrors.name ? 'support-error-name' : undefined}
                    className={`w-full px-4 py-3 rounded-xl bg-[#f7f9fb] dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2e3a8c] focus:outline-none transition-colors ${
                      fieldErrors.name
                        ? 'border-2 border-rose-500 dark:border-rose-500'
                        : 'border border-slate-200 dark:border-slate-700'
                    }`}
                    data-testid="support-input-name"
                  />
                  {fieldErrors.name && (
                    <p 
                      id="support-error-name" 
                      role="alert" 
                      className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 pt-1"
                      data-testid="support-error-name"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                      <span>{fieldErrors.name}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="support-input-email" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t('supportPage.emailLabel')} *
                  </label>
                  <input
                    id="support-input-email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    onInvalid={handleInvalid}
                    placeholder="Ex: jean@exemple.fr"
                    aria-invalid={fieldErrors.email ? 'true' : undefined}
                    aria-describedby={fieldErrors.email ? 'support-error-email' : undefined}
                    className={`w-full px-4 py-3 rounded-xl bg-[#f7f9fb] dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2e3a8c] focus:outline-none transition-colors ${
                      fieldErrors.email
                        ? 'border-2 border-rose-500 dark:border-rose-500'
                        : 'border border-slate-200 dark:border-slate-700'
                    }`}
                    data-testid="support-input-email"
                  />
                  {fieldErrors.email && (
                    <p 
                      id="support-error-email" 
                      role="alert" 
                      className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 pt-1"
                      data-testid="support-error-email"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Dual Column Category & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="support-select-category" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t('supportPage.categoryLabel')} *
                  </label>
                  <select
                    id="support-select-category"
                    name="category"
                    aria-label={t('supportPage.categoryLabel')}
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
                  <label htmlFor="support-input-subject" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {t('supportPage.subjectLabel')} *
                  </label>
                  <input
                    id="support-input-subject"
                    name="subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      if (fieldErrors.subject) {
                        setFieldErrors((prev) => ({ ...prev, subject: undefined }));
                      }
                    }}
                    onInvalid={handleInvalid}
                    placeholder="Objet du message"
                    aria-invalid={fieldErrors.subject ? 'true' : undefined}
                    aria-describedby={fieldErrors.subject ? 'support-error-subject' : undefined}
                    className={`w-full px-4 py-3 rounded-xl bg-[#f7f9fb] dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2e3a8c] focus:outline-none transition-colors ${
                      fieldErrors.subject
                        ? 'border-2 border-rose-500 dark:border-rose-500'
                        : 'border border-slate-200 dark:border-slate-700'
                    }`}
                    data-testid="support-input-subject"
                  />
                  {fieldErrors.subject && (
                    <p 
                      id="support-error-subject" 
                      role="alert" 
                      className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 pt-1"
                      data-testid="support-error-subject"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                      <span>{fieldErrors.subject}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Large Textarea for Description */}
              <div className="space-y-1.5">
                <label htmlFor="support-input-message" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  {t('supportPage.messageLabel')} *
                </label>
                <textarea
                  id="support-input-message"
                  name="message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (fieldErrors.message) {
                      setFieldErrors((prev) => ({ ...prev, message: undefined }));
                    }
                  }}
                  onInvalid={handleInvalid}
                  placeholder="Expliquez en détail votre demande..."
                  aria-invalid={fieldErrors.message ? 'true' : undefined}
                  aria-describedby={fieldErrors.message ? 'support-error-message' : undefined}
                  className={`w-full px-4 py-3 rounded-xl bg-[#f7f9fb] dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2e3a8c] focus:outline-none transition-colors ${
                    fieldErrors.message
                      ? 'border-2 border-rose-500 dark:border-rose-500'
                      : 'border border-slate-200 dark:border-slate-700'
                  }`}
                  data-testid="support-input-message"
                />
                {fieldErrors.message && (
                  <p 
                    id="support-error-message" 
                    role="alert" 
                    className="text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 pt-1"
                    data-testid="support-error-message"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                    <span>{fieldErrors.message}</span>
                  </p>
                )}
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
