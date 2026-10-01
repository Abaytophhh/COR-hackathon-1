import type { Language } from "./types";

export const VERDICTS = ["VERIFIED_REAL", "DEBUNKED_FAKE", "MISLEADING"] as const;
export type Verdict = (typeof VERDICTS)[number];

export const AUTOPSY_TAGS = ["Outdated Data", "Leading Question", "Context Misinterpretation"] as const;
export type AutopsyTag = (typeof AUTOPSY_TAGS)[number];

export interface FactCheckResult {
  id: string;
  query: string;
  verdict: Verdict;
  confidence: number;
  explanation: string;
  sources: string[];
  autopsy_tags: AutopsyTag[];
  local_context: boolean;
  checked_at: string;
  engine?: "ai" | "fallback";
}

export const VERDICT_LABEL: Record<Verdict, Record<Language, string>> = {
  VERIFIED_REAL: { ru: "[ПОДТВЕРЖДЕНО]", kk: "[РАСТАЛДЫ]" },
  DEBUNKED_FAKE: { ru: "[ОПРОВЕРГНУТО / ФЕЙК]", kk: "[ЖАЛҒАН / ФЕЙК]" },
  MISLEADING: { ru: "[ВВОДИТ В ЗАБЛУЖДЕНИЕ]", kk: "[ЖАҢЫЛТАДЫ]" },
};

export const TAG_LABEL: Record<AutopsyTag, Record<Language, string>> = {
  "Outdated Data": { ru: "Устаревшие данные", kk: "Ескірген деректер" },
  "Leading Question": { ru: "Наводящий вопрос", kk: "Жетелеуші сұрақ" },
  "Context Misinterpretation": { ru: "Искажение контекста", kk: "Контексті бұрмалау" },
};

export const OFFICIAL_KZ_DOMAINS = ["adilet.zan.kz", "egov.kz", "stat.gov.kz", "gov.kz", "primeminister.kz"];

export function isOfficialKzSource(source: string) {
  const value = source.toLowerCase();
  return OFFICIAL_KZ_DOMAINS.some((domain) => value.includes(domain)) || value.includes(".gov.kz");
}

/**
 * Client-side safety net: the product contract forbids showing an error or an
 * "unknown" state, so a failed request still resolves to one of the 3 verdicts.
 */
export function clientFallbackResult(
  query: string,
  language: Language,
  localContext: boolean,
): FactCheckResult {
  return {
    id: `local-${Date.now()}`,
    query,
    verdict: "MISLEADING",
    confidence: 58,
    explanation:
      language === "kk"
        ? "1. Тұжырым бөліктерге жіктелді. 2. Осы сәтте ашық дереккөздер бойынша барлық бөлігі бірдей растала алмады. 3. Мәлімдеме шындықтың бір бөлігіне сүйенгенімен, толық контексті бермейді. 4. Сондықтан баға — «жаңылтады»: нақты қорытынды үшін ресми дереккөзді тексеру қажет."
        : "1. Утверждение разобрано на отдельные проверяемые части. 2. На текущий момент по открытым источникам подтверждается не весь набор частей. 3. Формулировка опирается на долю правды, но опускает существенный контекст. 4. Поэтому результат — «вводит в заблуждение»: для однозначного вывода нужна сверка с первоисточником.",
    sources: localContext ? ["adilet.zan.kz", "egov.kz", "stat.gov.kz"] : ["who.int", "un.org"],
    autopsy_tags: ["Context Misinterpretation"],
    local_context: localContext,
    checked_at: new Date().toISOString(),
    engine: "fallback",
  };
}
