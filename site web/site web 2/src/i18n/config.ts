export const i18n = {
  defaultLocale: "fr",
  locales: ["fr", "en", "ar", "es", "it"],
  localeDirections: {
    fr: "ltr",
    en: "ltr",
    ar: "rtl",
    es: "ltr",
    it: "ltr",
  },
  localeNames: {
    fr: "Français",
    en: "English",
    ar: "العربية",
    es: "Español",
    it: "Italiano",
  },
} as const;

export type Locale = (typeof i18n)["locales"][number];
