/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLanguage } from '../../../context/LanguageContext';
import { ANALYTICS_TRANSLATIONS } from '../utils/translations';

export const useAnalyticsTranslation = () => {
  const { language, isRtl } = useLanguage();

  const at = (key: string, variables?: Record<string, string | number>): string => {
    const dict = ANALYTICS_TRANSLATIONS[language] || ANALYTICS_TRANSLATIONS['fr'];
    let text = dict[key] || ANALYTICS_TRANSLATIONS['fr'][key] || key;

    if (variables) {
      Object.entries(variables).forEach(([k, val]) => {
        text = text.split(`{${k}}`).join(String(val));
      });
    }

    return text;
  };

  return { at, language, isRtl };
};
