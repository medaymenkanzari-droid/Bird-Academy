"use client";

import { usePathname, useRouter } from "next/navigation";
import { type Locale, i18n } from "@/i18n/config";

export default function LanguageSelector({ currentLang }: { currentLang: Locale }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as Locale;
    if (!pathname) return;
    const segments = pathname.split("/");
    segments[1] = newLang;
    router.push(segments.join("/"));
  };

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className="appearance-none bg-brand-surface border border-brand-border text-brand-dark text-xs font-semibold py-1.5 px-3 pe-6 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        {i18n.locales.map((loc) => (
          <option key={loc} value={loc}>
            {i18n.localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
