import { type Locale } from "@/i18n/config";

export default function Footer({ dict }: { lang: Locale; dict: any }) {
  return (
    <footer className="border-t border-brand-border bg-white py-8 text-xs text-brand-muted">
      <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© 2026 Bird Academy. {dict.footer.rights}</div>
        <div className="flex gap-6">
          <span className="hover:text-brand-dark cursor-pointer">{dict.footer.privacy}</span>
          <span className="hover:text-brand-dark cursor-pointer">{dict.footer.terms}</span>
        </div>
      </div>
    </footer>
  );
}
