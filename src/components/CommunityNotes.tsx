import { useEffect, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";

import { useLanguage } from "@/lib/language";

const STORAGE_KEY = "ai-trust-community-notes";

type Vote = "yes" | "no" | null;
interface Tally {
  yes: number;
  no: number;
  vote: Vote;
}

function seedTally(key: string): Tally {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) % 100000;
  return { yes: 12 + (hash % 180), no: 2 + (hash % 27), vote: null };
}

function readAll(): Record<string, Tally> {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Record<string, Tally>) : {};
  } catch {
    return {};
  }
}

export default function CommunityNotes({ noteKey }: { noteKey: string }) {
  const { t } = useLanguage();
  const [tally, setTally] = useState<Tally>(() => seedTally(noteKey));
  const [justVoted, setJustVoted] = useState(false);

  useEffect(() => {
    const stored = readAll()[noteKey];
    setTally(stored ?? seedTally(noteKey));
    setJustVoted(false);
  }, [noteKey]);

  function vote(choice: "yes" | "no") {
    const base = { ...tally };
    if (base.vote === choice) return;
    if (base.vote === "yes") base.yes = Math.max(0, base.yes - 1);
    if (base.vote === "no") base.no = Math.max(0, base.no - 1);
    if (choice === "yes") base.yes += 1;
    else base.no += 1;
    base.vote = choice;

    setTally(base);
    setJustVoted(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [noteKey]: base }));
    } catch {
      /* storage unavailable: the vote stays in this session only */
    }
  }

  const button = "inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition-colors";

  return (
    <div className="mt-6 rounded-2xl border border-border bg-surface/70 p-4">
      <p className="text-sm font-medium text-muted-foreground">{t("notes_q")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => vote("yes")}
          aria-pressed={tally.vote === "yes"}
          className={`${button} ${
            tally.vote === "yes"
              ? "border-success/50 bg-success/15 text-success"
              : "border-border bg-card text-foreground hover:border-success/40"
          }`}
        >
          <ThumbsUp aria-hidden="true" className="size-4" />
          {t("notes_yes")} ({tally.yes})
        </button>
        <button
          type="button"
          onClick={() => vote("no")}
          aria-pressed={tally.vote === "no"}
          className={`${button} ${
            tally.vote === "no"
              ? "border-destructive/50 bg-destructive/15 text-destructive"
              : "border-border bg-card text-foreground hover:border-destructive/40"
          }`}
        >
          <ThumbsDown aria-hidden="true" className="size-4" />
          {t("notes_no")} ({tally.no})
        </button>
        {justVoted && <span className="text-xs text-primary">{t("notes_thanks")}</span>}
      </div>
    </div>
  );
}
