import { AlertTriangle, BadgeCheck, CheckCircle2, Globe, Stethoscope, XCircle } from "lucide-react";

import CommunityNotes from "./CommunityNotes";
import { useLanguage } from "@/lib/language";
import { TAG_LABEL, VERDICT_LABEL, isOfficialKzSource, type FactCheckResult, type Verdict } from "@/lib/verdict";

const tone: Record<Verdict, { wrap: string; chip: string; bar: string; Icon: typeof CheckCircle2 }> = {
  VERIFIED_REAL: {
    wrap: "border-success/35",
    chip: "border-success/45 bg-success/15 text-success",
    bar: "bg-success",
    Icon: CheckCircle2,
  },
  DEBUNKED_FAKE: {
    wrap: "border-destructive/35",
    chip: "border-destructive/45 bg-destructive/15 text-destructive",
    bar: "bg-destructive",
    Icon: XCircle,
  },
  MISLEADING: {
    wrap: "border-warning/35",
    chip: "border-warning/45 bg-warning/15 text-warning",
    bar: "bg-warning",
    Icon: AlertTriangle,
  },
};

export default function VerdictCard({ result }: { result: FactCheckResult }) {
  const { language, t } = useLanguage();
  const style = tone[result.verdict];

  return (
    <article className={`panel min-w-0 animate-in fade-in slide-in-from-bottom-2 p-4 sm:p-6 ${style.wrap}`}>
      <div className="flex flex-wrap items-center gap-3">
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-display text-sm font-bold ${style.chip}`}>
          <style.Icon aria-hidden="true" className="size-4" />
          {VERDICT_LABEL[result.verdict][language]}
        </span>
        {result.local_context && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/45 bg-gold/12 px-3 py-1.5 text-xs font-semibold text-gold">
            <BadgeCheck aria-hidden="true" className="size-3.5" />
            {t("local_badge")}
          </span>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {t("checked_at")}: {new Date(result.checked_at).toLocaleString(language === "kk" ? "kk-KZ" : "ru-RU")}
        </span>
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("result_for")}</p>
      <p className="mt-1 break-words text-base leading-relaxed text-foreground">{result.query}</p>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">{t("confidence")}</span>
          <span className="font-display text-lg font-bold">{result.confidence}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
          <div className={`h-full rounded-full transition-all ${style.bar}`} style={{ width: `${result.confidence}%` }} />
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("reasoning")}</h3>
        <p className="mt-2 break-words whitespace-pre-wrap text-[15px] leading-7 text-foreground/90">{result.explanation}</p>
      </div>

      {result.autopsy_tags.length > 0 && (
        <div className="mt-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <Stethoscope aria-hidden="true" className="size-4" />
            {t("autopsy_title")}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.autopsy_tags.map((tag) => (
              <span key={tag} className="rounded-lg border border-border bg-surface-strong px-2.5 py-1 text-xs font-medium">
                {TAG_LABEL[tag][language]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">{t("sources_title")}</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {result.sources.map((source) => (
            <li key={source}>
              <a
                href={`https://${source}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm transition-colors hover:border-primary/50 hover:text-primary"
              >
                <Globe aria-hidden="true" className="size-3.5" />
                {source}
                {isOfficialKzSource(source) && (
                  <span className="ml-1 rounded bg-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-gold">KZ ✓</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <CommunityNotes noteKey={result.id} />
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
    </article>
  );
}
