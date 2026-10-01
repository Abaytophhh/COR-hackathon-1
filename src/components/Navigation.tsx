import { Link } from "@tanstack/react-router";
import { Languages, ShieldCheck } from "lucide-react";

import { useLanguage } from "@/lib/language";

export default function Navigation() {
  const { t, toggleLanguage } = useLanguage();

  const tabs = [
    { to: "/", label: t("nav_feed") },
    { to: "/live-check", label: t("nav_live") },
    { to: "/business", label: t("nav_business") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="mr-auto flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <ShieldCheck aria-hidden="true" className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-semibold">AI Trust</span>
            <span className="block text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{t("brand_tag")}</span>
          </span>
        </Link>

        <nav className="order-3 flex w-full flex-wrap items-center gap-1 rounded-xl border border-border bg-surface p-1 sm:order-none sm:w-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.to}
              to={tab.to}
              activeOptions={{ exact: tab.to === "/" }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground hover:bg-surface-strong" }}
              className="flex min-h-11 flex-1 items-center justify-center rounded-lg px-2 py-1.5 text-center text-sm font-medium transition-colors sm:flex-none sm:px-3"
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={toggleLanguage}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Languages aria-hidden="true" className="size-4" />
          {t("lang_switch")}
        </button>
      </div>
    </header>
  );
}
