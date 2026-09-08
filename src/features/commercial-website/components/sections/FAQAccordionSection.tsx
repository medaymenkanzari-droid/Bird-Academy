/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — FAQ ACCORDION SECTION (AVIAN PRECISION)
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../../i18n';
import { WebRoute, FAQItem } from '../../types';
import { ChevronDown, HelpCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export interface FAQAccordionSectionProps {
  onNavigate?: (route: WebRoute) => void;
  showAll?: boolean;
}

export const FAQ_ITEMS: (FAQItem & { categoryType: 'licensing' | 'genetics' | 'security' | 'general' })[] = [
  {
    id: 'faq-offline',
    category: 'offline',
    categoryType: 'security',
    questionKey: 'L\'application nécessite-t-elle une connexion Internet constante ?',
    answerKey: 'Non, Bird Academy est 100% hors-ligne. Vos données d\'élevage sont stockées localement sur votre appareil dans une base de données SQLite scellée. Aucune connexion Internet n\'est requise au quotidien.',
  },
  {
    id: 'faq-storage',
    category: 'security',
    categoryType: 'security',
    questionKey: 'Où sont stockées les données de mes oiseaux et de mon élevage ?',
    answerKey: 'Vos données résident exclusivement sur le disque dur de votre ordinateur ou la mémoire locale de votre appareil Android. Aucune donnée n\'est transmise ni hébergée sur un cloud distant.',
  },
  {
    id: 'faq-wright',
    category: 'general',
    categoryType: 'genetics',
    questionKey: 'Qu\'est-ce que le coefficient de consanguinité de Wright calculé par le logiciel ?',
    answerKey: 'C\'est la méthode scientifique standardisée en zootechnie qui quantifie la probabilité que deux allèles à un locus soient identiques par descendance. Bird Academy calcule ce coefficient sur plusieurs générations pour sécuriser vos accouplements.',
  },
  {
    id: 'faq-free-vs-pro',
    category: 'pricing',
    categoryType: 'licensing',
    questionKey: 'Quelle est la différence principale entre les éditions FREE, PREMIUM et PRO ?',
    answerKey: 'L\'édition FREE permet de gérer jusqu\'à 50 oiseaux avec les fonctions de base. PREMIUM débloque un nombre illimité d\'oiseaux, le calcul de consanguinité de Wright et 100 requêtes IA/jour sur 1 appareil. PRO offre le moteur Bird Intelligence expert complet, l\'IA illimitée et une licence mono-appareil.',
  },
  {
    id: 'faq-upgrade',
    category: 'licensing',
    categoryType: 'licensing',
    questionKey: 'Puis-je passer de FREE à PREMIUM ou PRO sans perdre mes données ?',
    answerKey: 'Oui, absolument. Toutes vos données d\'élevage sont conservées intactes lors de l\'activation d\'une licence supérieure : aucun oiseau, accouplement ou historique médical n\'est altéré.',
  },
  {
    id: 'faq-activation',
    category: 'licensing',
    categoryType: 'licensing',
    questionKey: 'Comment activer ma licence après l\'achat ?',
    answerKey: 'Lors de votre commande, vous téléchargez un kit de livraison contenant votre fichier "license.lmse", un QR code et votre clé textuelle. Il vous suffit d\'importer ce fichier ou de scanner le QR code directement dans Bird Academy pour débloquer votre édition.',
  },
];

export const FAQAccordionSection: React.FC<FAQAccordionSectionProps> = ({ onNavigate, showAll = false }) => {
  const { t, isRtl } = useWebLanguage();
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id || null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'licensing' | 'genetics' | 'security'>('all');
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  const filteredItems = FAQ_ITEMS.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.categoryType === selectedCategory;
  });

  const displayItems = showAll ? filteredItems : filteredItems.slice(0, 5);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section 
      id="faq" 
      className="py-16 sm:py-24 bg-[#f7f9fb] dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors"
      data-testid="faq-accordion-section"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-xs font-black tracking-widest text-[#2e3a8c] dark:text-indigo-400 uppercase bg-[#f0f3fa] dark:bg-indigo-950 px-3.5 py-1 rounded-full">
            Questions Fréquentes
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('faqPage.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {t('faqPage.subtitle')}
          </p>
        </div>

        {/* Filter Categories Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#2e3a8c] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            Toutes
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'security'
                ? 'bg-[#2e3a8c] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            Sécurité & Données
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('licensing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'licensing'
                ? 'bg-[#2e3a8c] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            Licences & Activation
          </button>
          <button
            type="button"
            onClick={() => setSelectedCategory('genetics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCategory === 'genetics'
                ? 'bg-[#2e3a8c] text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            Génétique & Zootechnie
          </button>
        </div>

        {/* Accordion List (Strictly constrained to 800px max width) */}
        <div className="space-y-4">
          {displayItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 overflow-hidden shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600"
                data-testid={`faq-item-${item.id}`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-[#2e3a8c] dark:hover:text-indigo-400 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-[#2e3a8c] dark:text-indigo-400 shrink-0" />
                    <span>{item.questionKey}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#2e3a8c]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 bg-[#f7f9fb] dark:bg-slate-800">
                    <p>{item.answerKey}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Link to Full FAQ */}
        {onNavigate && !showAll && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('faq')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#2e3a8c] dark:text-indigo-400 hover:underline cursor-pointer"
              data-testid="view-full-faq-btn"
            >
              <span>Consulter toutes les questions / réponses de la FAQ</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
