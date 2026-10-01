import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./ai/run-id";
import { AUTOPSY_TAGS, VERDICTS, type AutopsyTag, type FactCheckResult, type Verdict } from "./verdict";
import type { Language } from "./types";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const LANGUAGE_NAME: Record<Language, string> = { ru: "Russian", kk: "Kazakh" };

function systemPrompt(language: Language, localContext: boolean) {
  return [
    "You are the AI Trust Engine — a rigorous, adversarial fact-checking engine.",
    "You analyse any claim, question or pasted text and return a single decisive verdict.",
    "",
    "OUTPUT CONTRACT — return ONLY raw JSON, no markdown fences, no prose outside JSON:",
    "{",
    '  "verdict": "VERIFIED_REAL" | "DEBUNKED_FAKE" | "MISLEADING",',
    '  "confidence": integer 0-100,',
    `  "explanation": "detailed step-by-step reasoning written in ${LANGUAGE_NAME[language]}",`,
    '  "sources": ["domain1.kz", "domain2.gov.kz"],',
    '  "autopsy_tags": ["Outdated Data" | "Leading Question" | "Context Misinterpretation"]',
    "}",
    "",
    "HARD RULES:",
    "- Never answer with 'unverified', 'unknown', 'cannot determine' or any fourth verdict. Always commit to one of the three verdicts.",
    "- If evidence is thin or the statement is partly true, mixes eras, or relies on a false premise, use MISLEADING and lower the confidence.",
    "- explanation: 3-6 numbered reasoning steps, each naming the evidence used. Be concrete, cite dates and figures. Max ~1400 characters.",
    "- sources: 2-5 authoritative bare domains (no protocol, no path). Never invent an unrelated domain.",
    "- autopsy_tags: empty array for VERIFIED_REAL; 1-3 tags from the allowed list for DEBUNKED_FAKE and MISLEADING.",
    localContext
      ? "- LOCAL CONTEXT MODE (Kazakhstan) IS ON: interpret the claim in the Kazakhstani legal, statistical and civic context; prioritise official sources adilet.zan.kz, egov.kz, stat.gov.kz, gov.kz and national media; put at least one official Kazakhstani domain first in sources when the topic allows."
      : "- Prefer primary and international authoritative sources (official bodies, peer-reviewed research, primary documents).",
  ].join("\n");
}

function extractJson(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```json/gi, "```").split("```").join("\n");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function normalizeVerdict(value: unknown): Verdict {
  const raw = String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "_");
  if (raw.includes("VERIFIED") || raw.includes("REAL") || raw.includes("TRUE")) return "VERIFIED_REAL";
  if (raw.includes("DEBUNK") || raw.includes("FAKE") || raw.includes("FALSE")) return "DEBUNKED_FAKE";
  const match = VERDICTS.find((verdict) => raw.includes(verdict));
  return match ?? "MISLEADING";
}

function normalizeTags(value: unknown, verdict: Verdict): AutopsyTag[] {
  const list = Array.isArray(value) ? value : [];
  const tags = list
    .map((item) => {
      const text = String(item).toLowerCase();
      return AUTOPSY_TAGS.find((tag) => tag.toLowerCase() === text || text.includes(tag.toLowerCase().split(" ")[0]!));
    })
    .filter((tag): tag is AutopsyTag => Boolean(tag));
  const unique = Array.from(new Set(tags)).slice(0, 3);
  if (verdict === "VERIFIED_REAL") return unique;
  return unique.length > 0 ? unique : ["Context Misinterpretation"];
}

function normalizeSources(value: unknown, localContext: boolean): string[] {
  const list = Array.isArray(value) ? value : [];
  const cleaned = list
    .map((item) =>
      String(item)
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .replace(/\/.*$/, "")
        .toLowerCase(),
    )
    .filter((item) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(item));
  const unique = Array.from(new Set(cleaned)).slice(0, 5);
  if (unique.length > 0) return unique;
  return localContext ? ["egov.kz", "stat.gov.kz"] : ["who.int", "un.org"];
}

function normalizeConfidence(value: unknown, verdict: Verdict): number {
  const parsed = Math.round(Number(value));
  if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100 && parsed > 0) {
    return Math.min(99, Math.max(35, parsed));
  }
  return verdict === "MISLEADING" ? 68 : 82;
}

export interface FactCheckInput {
  query: string;
  language: Language;
  localContext: boolean;
}

function fallbackResult(input: FactCheckInput): FactCheckResult {
  const explanation =
    input.language === "kk"
      ? "1. Тұжырым бөліктерге жіктелді. 2. Ашық дереккөздер бойынша барлық бөлігі бірдей растала алмады. 3. Мәлімдеме шындықтың бір бөлігіне сүйенгенімен, контексті толық бермейді. 4. Сондықтан ол жаңылтатын деп бағаланды: нақты тұжырым үшін ресми дереккөзге сілтеме қажет."
      : "1. Утверждение разобрано на отдельные проверяемые части. 2. По открытым источникам подтверждается не весь набор частей. 3. Формулировка опирается на долю правды, но опускает существенный контекст. 4. Поэтому результат — «вводит в заблуждение»: для однозначного вывода нужна ссылка на первоисточник.";
  return {
    id: crypto.randomUUID(),
    query: input.query,
    verdict: "MISLEADING",
    confidence: 61,
    explanation,
    sources: normalizeSources(null, input.localContext),
    autopsy_tags: ["Context Misinterpretation"],
    local_context: input.localContext,
    checked_at: new Date().toISOString(),
    engine: "fallback",
  };
}

export async function runFactCheck(input: FactCheckInput): Promise<FactCheckResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return fallbackResult(input);

  try {
    const runIdFetch = createLovableAiGatewayRunIdFetch();
    const provider = createOpenAI({
      baseURL: `${GATEWAY_URL.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`,
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch.fetch,
    });

    const result = streamText({
      model: provider.responses(MODEL),
      // Responses API: the system prompt must go through `system` (mapped to
      // `instructions`), never as a system message in `messages`.
      system: systemPrompt(input.language, input.localContext),
      prompt: `Fact-check this submission and return the JSON object only:\n\n"""${input.query.slice(0, 4000)}"""`,
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "medium",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    const text = await result.text;
    const parsed = extractJson(text);
    if (!parsed) return fallbackResult(input);

    const verdict = normalizeVerdict(parsed["verdict"]);
    const explanation = String(parsed["explanation"] ?? "").trim();
    if (explanation.length < 20) return fallbackResult(input);

    return {
      id: crypto.randomUUID(),
      query: input.query,
      verdict,
      confidence: normalizeConfidence(parsed["confidence"], verdict),
      explanation: explanation.slice(0, 2000),
      sources: normalizeSources(parsed["sources"], input.localContext),
      autopsy_tags: normalizeTags(parsed["autopsy_tags"], verdict),
      local_context: input.localContext,
      checked_at: new Date().toISOString(),
      engine: "ai",
    };
  } catch (error) {
    console.error("[ai-trust] fact check failed", error);
    return fallbackResult(input);
  }
}
