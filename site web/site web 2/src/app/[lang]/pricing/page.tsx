import { type Locale, i18n } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function PricingPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);
  const { header, tiers } = dict.pricingPage;

  return (
    <div className="py-16 container-custom space-y-12">
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
          {header.badge}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-dark">{header.title}</h1>
        <p className="text-sm text-brand-muted">{header.subtitle}</p>
        <p className="text-xs text-brand-muted italic">* {header.disclaimer}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(tiers).map(([key, t]: [string, any]) => (
          <div key={key} className="bg-white rounded-2xl border border-brand-border p-8 flex flex-col justify-between shadow-sm space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">{t.target}</span>
              <h2 className="text-2xl font-bold text-brand-dark">{t.name}</h2>
              <div className="text-3xl font-extrabold text-brand-dark">{t.price}</div>
              <div className="text-xs text-brand-muted">{t.period}</div>
            </div>
            <button className="w-full py-3 rounded-xl font-semibold text-xs bg-brand-primary text-white hover:bg-brand-primary-dark transition-colors">
              {t.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
