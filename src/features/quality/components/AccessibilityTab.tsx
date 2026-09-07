/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { getQualityTranslation } from '../utils/translations';
import { Settings, Eye, CheckSquare, Keyboard, Volume2, Maximize, Languages, Sparkles } from 'lucide-react';

export const AccessibilityTab: React.FC = () => {
  const { language } = useLanguage();
  const [focusActive, setFocusActive] = useState(() => localStorage.getItem('wcag_focus') === 'true');
  const [ariaActive, setAriaActive] = useState(() => localStorage.getItem('wcag_aria') === 'true');
  const [keyboardActive, setKeyboardActive] = useState(() => localStorage.getItem('wcag_keyboard') === 'true');
  const [tactileActive, setTactileActive] = useState(() => localStorage.getItem('wcag_tactile') === 'true');
  const [contrastActive, setContrastActive] = useState(() => localStorage.getItem('wcag_contrast') === 'true');
  const [announcement, setAnnouncement] = useState("Bienvenue dans le panneau d'accessibilité WCAG de Bird Academy.");

  const t = (key: string) => getQualityTranslation(language, key);

  // Apply visual changes in document for active toggles
  useEffect(() => {
    localStorage.setItem('wcag_focus', String(focusActive));
    if (focusActive) {
      document.body.classList.add('wcag-visible-focus');
    } else {
      document.body.classList.remove('wcag-visible-focus');
    }
  }, [focusActive]);

  useEffect(() => {
    localStorage.setItem('wcag_aria', String(ariaActive));
    setAnnouncement(ariaActive ? "Synthèse d'accessibilité ARIA vocale activée." : "Synthèse ARIA désactivée.");
  }, [ariaActive]);

  useEffect(() => {
    localStorage.setItem('wcag_keyboard', String(keyboardActive));
    setAnnouncement(keyboardActive ? "Mode de navigation au clavier strict activé (Tabulations logiques)." : "Navigation libre activée.");
  }, [keyboardActive]);

  useEffect(() => {
    localStorage.setItem('wcag_tactile', String(tactileActive));
    if (tactileActive) {
      document.body.classList.add('wcag-enlarge-targets');
    } else {
      document.body.classList.remove('wcag-enlarge-targets');
    }
    setAnnouncement(tactileActive ? "Zones d'action tactile élargies à 44 pixels minimum." : "Taille des zones tactiles par défaut réappliquée.");
  }, [tactileActive]);

  useEffect(() => {
    localStorage.setItem('wcag_contrast', String(contrastActive));
    if (contrastActive) {
      document.body.classList.add('wcag-high-contrast');
    } else {
      document.body.classList.remove('wcag-high-contrast');
    }
    setAnnouncement(contrastActive ? "Thème de couleurs à haut contraste activé." : "Contraste par défaut réinitialisé.");
  }, [contrastActive]);

  const speakMessage = (msg: string) => {
    setAnnouncement(msg);
    if (ariaActive && 'speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(msg);
      speech.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      window.speechSynthesis.speak(speech);
    }
  };

  return (
    <div className="space-y-6" id="accessibility-tab">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="flex items-center gap-3">
          <Settings className="text-indigo-500 w-6 h-6 animate-spin" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
              {t('accTitle')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t('accDesc')}
            </p>
          </div>
        </div>

        {/* Live announcer feedback screen */}
        <div className="bg-indigo-950 text-indigo-200 p-4 rounded-xl flex items-center gap-3 border border-indigo-900/50">
          <Volume2 className="w-5 h-5 animate-pulse shrink-0 text-indigo-400" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold text-indigo-400 uppercase tracking-wider block text-xxs">
              [ {t('accScreenReader')} ]
            </span>
            <p className="font-mono text-white italic">{announcement}</p>
          </div>
        </div>
      </div>

      {/* Grid of options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-5">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-500" />
            Améliorations Visuelles (WCAG AA)
          </h4>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={contrastActive}
                onChange={() => setContrastActive(!contrastActive)}
                id="toggle-high-contrast"
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1 cursor-pointer"
              />
              <div>
                <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{t('accHighContrast')}</span>
                <span className="block text-xxs text-gray-400">Renforce les contrastes de texte et les bordures de cartes pour les éleveurs malvoyants.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={focusActive}
                onChange={() => setFocusActive(!focusActive)}
                id="toggle-visible-focus"
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1 cursor-pointer"
              />
              <div>
                <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{t('accFocusStyle')}</span>
                <span className="block text-xxs text-gray-400">Dessine une bordure épaisse contrastée sur l'élément recevant la focalisation (mode accessibilité par défaut).</span>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-5">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-indigo-500" />
            Saisie & Navigation alternative
          </h4>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={keyboardActive}
                onChange={() => setKeyboardActive(!keyboardActive)}
                id="toggle-keyboard-nav"
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1 cursor-pointer"
              />
              <div>
                <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{t('accKeyboardNav')}</span>
                <span className="block text-xxs text-gray-400">Forcer l'alignement séquentiel logique de tabulation entre les volets et voiles d'interfaces.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={tactileActive}
                onChange={() => setTactileActive(!tactileActive)}
                id="toggle-tactile-min"
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1 cursor-pointer"
              />
              <div>
                <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{t('accTactileMin')}</span>
                <span className="block text-xxs text-gray-400">Agrandit les boutons d'action d'incubation pour un encodage facile au doigt sur le terrain (44x44px).</span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ariaActive}
                onChange={() => setAriaActive(!ariaActive)}
                id="toggle-aria-labels"
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1 cursor-pointer"
              />
              <div>
                <span className="block text-sm font-medium text-gray-800 dark:text-gray-200">{t('accAriaLabeling')}</span>
                <span className="block text-xxs text-gray-400">Pointe des balises ARIA invisibles pour guider les liseuses d'écrans lors d'activités complexes de génétique.</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Visual layouts simulations */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Simulateur d'Environnements Physiques d'Élevage
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Pour vérifier que les canaris et les informations d'incubation restent hautement lisibles dans toutes les configurations de terrain des éleveurs :
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => speakMessage("Simulation de lisibilité en plein soleil activée.")}
            className="p-3 text-center rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-950 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 cursor-pointer"
          >
            ☀️ Plein Soleil (Contraste +)
          </button>
          <button
            onClick={() => speakMessage("Simulation d'obscurité en volière isolée activée.")}
            className="p-3 text-center rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-950 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 cursor-pointer"
          >
            🌑 Volière obscure (Mode Sombre)
          </button>
          <button
            onClick={() => speakMessage("Simulation d'affichage sur tablette mobile de terrain activée.")}
            className="p-3 text-center rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-950 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 cursor-pointer"
          >
            📱 Tablette Tactile (Zone +)
          </button>
          <button
            onClick={() => speakMessage("Simulation de structure bidirectionnelle arabe RTL activée.")}
            className="p-3 text-center rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-950 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 cursor-pointer"
          >
            🔁 Arabe RTL (Miroir)
          </button>
        </div>
      </div>
    </div>
  );
};
