import Link from "next/link";
import { type Locale } from "@/i18n/config";
import LanguageSelector from "./LanguageSelector";

interface HeaderProps {
  lang: Locale;
  dict: any;
}

export default function Header({ lang, dict }: HeaderProps) {
  const navItems = [
    { href: `/${lang}/#features`, label: dict.nav.features },
    { href: `/${lang}/pricing`, label: dict.nav.pricing },
    { href: `/${lang}/#assistant`, label: dict.nav.assistant },
    { href: `/${lang}/#intelligence`, label: dict.nav.intelligence },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border">
      <div className="container-custom flex items-center justify-between h-16">
        <Link href={`/${lang}`} className="flex items-center gap-3 font-bold text-xl text-brand-dark">
          <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white font-extrabold shadow-sm">
            BA
          </div>
          <span>Bird Academy</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-dark">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-primary transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSelector currentLang={lang} />
          <Link
            href={`/${lang}/#download`}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-dark rounded-lg shadow-sm transition-all"
          >
            {dict.nav.download}
          </Link>
        </div>
      </div>
    </header>
  );
}
