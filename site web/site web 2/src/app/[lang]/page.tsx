import { type Locale, i18n } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import Link from "next/link";

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function HomePage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  const { hero, offline, featuresGrid } = dict.home;

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 border-b border-brand-border bg-gradient-to-b from-white to-brand-surface pb-16">
        <div className="container-custom space-y-6 max-w-4xl text-center mx-auto">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
            {hero.badge}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-dark leading-tight">
            {hero.title}
          </h1>
          <p className="text-base sm:text-lg text-brand-muted max-w-2xl mx-auto">
            {hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <a
              href="#download"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-white bg-brand-primary hover:bg-brand-primary-dark shadow-md transition-all text-sm text-center"
            >
              {hero.ctaDownload}
            </a>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-brand-dark bg-white hover:bg-gray-50 border border-brand-border shadow-sm transition-all text-sm text-center"
            >
              {hero.ctaFeatures}
            </a>
          </div>
          <div className="pt-4 text-xs font-medium text-brand-muted">
            🛡️ {hero.offlineGuarantee}
          </div>
        </div>
      </section>

      {/* 100% Offline Section */}
      <section className="container-custom">
        <div className="bg-brand-dark text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold text-brand-secondary uppercase">{offline.badge}</span>
            <h2 className="text-2xl sm:text-3xl font-bold">{offline.title}</h2>
            <p className="text-sm text-gray-300">{offline.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offline.cards.map((card: any, idx: number) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center font-bold text-xs">
                  0{idx + 1}
                </div>
                <h3 className="font-bold text-white text-base">{card.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container-custom space-y-8">
        <div className="space-y-2 max-w-2xl">
          <span className="text-xs font-bold uppercase text-brand-primary">{featuresGrid.badge}</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">{featuresGrid.title}</h2>
          <p className="text-sm text-brand-muted">{featuresGrid.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresGrid.items.map((it: any) => (
            <div key={it.slug} className="p-6 rounded-2xl bg-white border border-brand-border shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center font-bold text-brand-primary text-sm">
                ✦
              </div>
              <h3 className="text-base font-bold text-brand-dark">{it.title}</h3>
              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Download Anchors */}
      <section id="download" className="container-custom">
        <div className="bg-white border border-brand-border rounded-3xl p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">Téléchargement Multiplateforme</h2>
          <p className="text-sm text-brand-muted max-w-xl mx-auto">
            Package binaire officiel testé et distribué avec intégrité SHA-256 garantie.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button className="px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-semibold shadow-sm">
              Windows (.exe / Setup)
            </button>
            <button className="px-5 py-3 rounded-xl bg-brand-surface border border-brand-border text-brand-dark text-xs font-semibold">
              Android (.apk)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
