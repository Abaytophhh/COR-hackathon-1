# AI Trust — architecture rules

- Fact-checking runs server-side only, through `src/lib/factcheck.server.ts` behind the `checkFact` server function in `src/lib/factcheck.functions.ts`; keeps the AI key off the client.
- The AI engine calls the Lovable AI Gateway with `openai/gpt-6-astra` on the Responses API (`system` option, never a system message) because Gemini 1.5 Flash is not available in this workspace.
- The engine must always resolve to one of three verdicts (`VERIFIED_REAL`, `DEBUNKED_FAKE`, `MISLEADING`); parse or network failures fall back via `fallbackResult` / `clientFallbackResult` so no error or "unverified" state ever reaches the UI.
- UI text lives in `src/lib/i18n.ts` (ru/kk) and is read through `useLanguage`; no hardcoded copy in components.
- Colors, fonts and shadows come from the oklch tokens in `src/styles.css`; components never hardcode color values.
- Community-notes votes and check history are localStorage-only (`ai-trust-community-notes`, `ai-trust-history`, `ai-trust-language`) — there is no database.
