import type { Locale } from "./config";

const dictionaries = {
  fr: () => import("./locales/fr.json").then((m) => m.default),
  en: () => import("./locales/en.json").then((m) => m.default),
  ar: () => import("./locales/ar.json").then((m) => m.default),
  es: () => import("./locales/es.json").then((m) => m.default),
  it: () => import("./locales/it.json").then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => {
  const loadDict = dictionaries[locale] || dictionaries.fr;
  return loadDict();
};
