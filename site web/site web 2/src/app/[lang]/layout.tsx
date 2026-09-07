import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { i18n, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "@/styles/globals.css";

export async function generateStaticParams() {
  return i18n.locales.map((lang) => ({ lang }));
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  const { lang } = params;
  if (!i18n.locales.includes(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang);
  const direction = i18n.localeDirections[lang] || "ltr";

  return (
    <html lang={lang} dir={direction}>
      <body className="flex flex-col min-h-screen bg-brand-surface text-brand-dark antialiased">
        <Header lang={lang} dict={dict} />
        <main className="flex-grow">{children}</main>
        <Footer lang={lang} dict={dict} />
      </body>
    </html>
  );
}