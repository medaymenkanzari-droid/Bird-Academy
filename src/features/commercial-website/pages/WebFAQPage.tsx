/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BIRD ACADEMY COMMERCIAL WEBSITE — DEDICATED FULL FAQ PAGE
 */

import React, { useState } from 'react';
import { useWebLanguage } from '../i18n';
import { WebRoute, FAQItem } from '../types';
import { Search, HelpCircle, ChevronDown, Filter } from 'lucide-react';

export const FULL_FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-offline-1',
    category: 'offline',
    questionKey: 'L\'application nécessite-t-elle une connexion Internet en volière ?',
    answerKey: 'Non, Bird Academy est 100% hors-ligne. Toutes les données biologiques (oiseaux, cages, pontes, soins, généalogies) sont stockées localement sur votre disque dur ou smartphone.',
  },
  {
    id: 'faq-offline-2',
    category: 'offline',
    questionKey: 'Mes données d\'élevage sont-elles transmises à des serveurs cloud ?',
    answerKey: 'Jamais. Bird Academy applique une politique stricte de souveraineté locale. Aucune donnée d\'élevage n\'est envoyée à l\'extérieur. Zéro télémétrie sur vos oiseaux.',
  },
  {
    id: 'faq-pricing-1',
    category: 'pricing',
    questionKey: 'Quels sont les tarifs officiels de Bird Academy ?',
    answerKey: 'FREE Community est 100% gratuit pour toujours (jusqu\'à 20 oiseaux). PREMIUM est à 49,00 € / an (oiseaux illimités, Wright, licence mono-appareil). PRO est à 119,00 € / an (Bird Intelligence complet, licence mono-appareil). PRO À VIE est à 249,00 € (licence perpétuelle sans renouvellement).',
  },
  {
    id: 'faq-pricing-2',
    category: 'pricing',
    questionKey: 'Y a-t-il des frais cachés ou des abonnements automatiques imposés ?',
    answerKey: 'Non. Les licences annuelles s\'achètent pour 365 jours fermes sans prélèvement automatique non consenti. Vous restez maître de votre renouvellement.',
  },
  {
    id: 'faq-licensing-1',
    category: 'licensing',
    questionKey: 'Comment s\'effectue l\'activation de ma licence LMSE ?',
    answerKey: 'Après votre commande, vous recevez un kit de livraison 5 fichiers contenant votre fichier "license.lmse", votre QR code et votre clé. Vous pouvez glisser le fichier ou scanner le QR code dans l\'application pour une activation immédiate.',
  },
  {
    id: 'faq-licensing-2',
    category: 'licensing',
    questionKey: 'Que se passe-t-il lorsque ma licence annuelle arrive à expiration ?',
    answerKey: 'Vous ne perdez jamais vos données. En cas d\'expiration, l\'application bascule en mode consultation sécurisé jusqu\'à ce que vous renouveliez ou insériez une nouvelle licence.',
  },
  {
    id: 'faq-licensing-3',
    category: 'licensing',
    questionKey: 'Puis-je changer d\'ordinateur ou formater mon PC ?',
    answerKey: 'Oui. Les licences Bird Academy sont mono-appareil (1 appareil dédié, données 100% locales). Pour changer de PC, exportez simplement une sauvegarde locale au format JSON sur clé USB et restaurez-la sur votre nouvel appareil avec votre licence.',
  },
  {
    id: 'faq-ai-1',
    category: 'ai',
    questionKey: 'Comment fonctionne l\'Assistant IA sans connexion Internet ?',
    answerKey: 'L\'Assistant IA s\'appuie sur un modèle local contextualisé avec vos fiches d\'élevage pour vous fournir des réponses expertes en zootechnie sans faire fuiter vos données.',
  },
  {
    id: 'faq-genetics-1',
    category: 'general',
    questionKey: 'Comment Bird Academy calcule-t-il la consanguinité de Wright ?',
    answerKey: 'Le logiciel explore l\'arbre généalogique ascendant sur plusieurs générations pour identifier tous les ancêtres communs et applique la formule mathématique de Sewall Wright.',
  },
  {
    id: 'faq-downloads-1',
    category: 'downloads',
    questionKey: 'Quels systèmes d\'exploitation sont supportés ?',
    answerKey: 'Windows 10 et 11 (64-bit) en version installateur ou portable autonome, ainsi qu\'Android 10 ou supérieur (smartphones et tablettes).',
  },
  {
    id: 'faq-security-1',
    category: 'security',
    questionKey: 'Comment est protégée l\'intégrité des fichiers ?',
    answerKey: 'Chaque binaire publié est scellé par une empreinte cryptographique SHA-256 certifiée, et chaque licence LMSE est signée par signature électronique ECDSA.',
  },
];

export const WebFAQPage: React.FC = () => {
  const { t, isRtl } = useWebLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(FULL_FAQ_ITEMS[0]?.id || null);

  const categories = [
    { id: 'all', label: 'Toutes les questions' },
    { id: 'pricing', label: 'Tarifs & Commandes' },
    { id: 'licensing', label: 'Licences & Activation' },
    { id: 'offline', label: 'Hors-Ligne & Données' },
    { id: 'ai', label: 'Intelligence Artificielle' },
    { id: 'general', label: 'Génétique & Élevage' },
    { id: 'downloads', label: 'Téléchargements' },
    { id: 'security', label: 'Sécurité' },
  ];

  const filteredItems = FULL_FAQ_ITEMS.filter((item) => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch =
      item.questionKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answerKey.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12"
      data-testid="web-faq-page"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <span className="text-xs font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase">
          Base de Connaissances & Réponses Officielles
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('faqPage.title')}
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          {t('faqPage.subtitle')}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl mx-auto">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('faqPage.searchPlaceholder')}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          data-testid="faq-search-input"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
              data-testid={`faq-filter-${cat.id}`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* FAQ Items Accordion */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 rounded-3xl bg-slate-50 dark:bg-slate-800">
            {t('faqPage.noResults')}
          </div>
        ) : (
          filteredItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 overflow-hidden shadow-sm"
                data-testid={`faq-item-${item.id}`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{item.questionKey}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-indigo-500' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                    <p>{item.answerKey}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
