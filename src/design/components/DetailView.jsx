import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ExternalLink, Link2, Loader, ThumbsUp } from 'lucide-react'
import { useStore } from '../store/StoreContext.jsx'
import { Stamp } from './StatusBadge.jsx'
import CommentSection from './CommentSection.jsx'
import { VERDICT, getStatus, modelTint } from './status.js'
import { hostname, initials } from './utils.js'
import { useLang } from '../i18n/LangContext.jsx'

const NO_CLAIMS = []

// Split the AI answer into plain text and highlighted claim segments.
// `claims` here are already-localized strings.
function annotate(text, claims) {
  const ranges = []
  claims.forEach((c, i) => {
    const start = text.toLowerCase().indexOf(c.text.toLowerCase())
    if (start === -1) return
    const end = start + c.text.length
    if (ranges.some((r) => start < r.end && end > r.start)) return
    ranges.push({ start, end, index: i, verdict: c.verdict })
  })
  ranges.sort((a, b) => a.start - b.start)
  const parts = []
  let cursor = 0
  ranges.forEach((r) => {
    if (r.start > cursor) parts.push({ text: text.slice(cursor, r.start) })
    parts.push({ text: text.slice(r.start, r.end), claim: r })
    cursor = r.end
  })
  if (cursor < text.length) parts.push({ text: text.slice(cursor) })
  return parts
}

function ConfidenceMeter({ value, className }) {
  const { t } = useLang()
  const filled = Math.round(value / 10)
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className={`h-3 w-2 rounded-sm ${i < filled ? className : 'bg-paper-deep'}`} />
        ))}
      </div>
      <span className="text-sm font-bold tabular-nums">{value}%</span>
      <span className="sr-only">{t('detail.confidence')}</span>
    </div>
  )
}

export default function DetailView({ id, onBack, onOpen }) {
  const { questions, comments, votes, toggleVote } = useStore()
  const { t, tNode, tx, timeAgo } = useLang()
  const item = questions.find((q) => q.id === id)
  const [activeClaim, setActiveClaim] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { window.scrollTo({ top: 0 }) }, [id])

  const rawClaims = item?.verification.claims || NO_CLAIMS
  const claims = useMemo(
    () => rawClaims.map((c) => ({ verdict: c.verdict, text: tx(c.text), note: tx(c.note) })),
    [rawClaims, tx],
  )
  const answer = item ? tx(item.aiAnswer) : ''
  const parts = useMemo(() => annotate(answer, claims), [answer, claims])

  if (!item) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-hand text-3xl text-brand">{t('detail.notFoundNote')}</p>
        <p className="mt-2 text-ink-soft">{t('detail.notFound')}</p>
        <button onClick={onBack} className="btn-ink mt-5 bg-white px-4 py-2 text-sm">{t('detail.notFoundBack')}</button>
      </div>
    )
  }

  const v = item.verification
  const s = getStatus(v.status)
  const pending = v.status === 'Pending'
  const itemComments = comments.filter((c) => c.questionId === item.id)
  const related = questions.filter((q) => q.id !== item.id && q.category === item.category).slice(0, 3)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="mx-auto min-w-0 max-w-7xl px-4 pt-5 pb-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button onClick={onBack} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-semibold text-ink-soft hover:bg-paper-deep hover:text-ink">
          <ArrowLeft className="size-4" /> <span className="whitespace-nowrap"><span className="hidden sm:inline">{t('detail.back')}</span><span className="sm:hidden">{t('detail.backShort')}</span></span>
        </button>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            onClick={() => toggleVote(item.id)}
            aria-pressed={!!votes[item.id]}
            className={`btn-ink min-w-0 px-3 py-1.5 text-sm ${votes[item.id] ? 'bg-marker' : 'bg-white'}`}
          >
            <ThumbsUp className="size-4" /> <span className="whitespace-nowrap">{t('detail.helpful', { n: item.upvotes || 0 })}</span>
          </button>
          <button onClick={copyLink} className="btn-ink min-w-0 bg-white px-3 py-1.5 text-sm" aria-label={t('detail.copyLink')}>
            {copied ? <Check className="size-4 text-true" /> : <Link2 className="size-4" />}
            <span className="hidden sm:inline">{copied ? t('detail.copied') : t('detail.share')}</span>
          </button>
        </div>
      </div>

      {/* The question */}
      <header className="animate-fade-up mt-5 max-w-4xl">
        <p className="text-sm text-ink-soft">
          {tNode('detail.asked', { model: <span className="font-semibold text-ink">{item.aiModel}</span> })}
          {item.category && <> · <span className="text-brand">{t(`categories.${item.category}`)}</span></>}
          <span className="text-ink-mute"> · {timeAgo(item.createdAt)}</span>
        </p>
        <h1 className="mt-2 break-words text-[clamp(1.5rem,6vw,2rem)] leading-tight font-extrabold tracking-tight text-balance sm:text-4xl">{tx(item.userQuestion)}</h1>
      </header>

      <div className="mt-7 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8">
        {/* LEFT: what the AI said */}
        <div className="min-w-0 space-y-6">
          <section className="animate-fade-up lg:sticky lg:top-24" aria-labelledby="ai-said">
            <div className="min-w-0 rounded-2xl border-[1.5px] border-line bg-paper-deep/60 p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <span className={`grid size-9 place-items-center rounded-full text-xs font-bold ${modelTint(item.aiModel)}`}>{item.aiModel.slice(0, 2).toUpperCase()}</span>
                <div className="leading-tight">
                  <h2 id="ai-said" className="font-bold">{t('detail.aiSaid', { model: item.aiModel })}</h2>
                  <p className="text-xs text-ink-mute">{t('detail.original')}</p>
                </div>
              </div>
              <p className="mt-4 break-words font-mono text-[13.5px] leading-7 text-ink-soft">
                {parts.map((p, i) =>
                  p.claim ? (
                    <mark
                      key={i}
                      tabIndex={0}
                      onMouseEnter={() => setActiveClaim(p.claim.index)}
                      onMouseLeave={() => setActiveClaim(null)}
                      onFocus={() => setActiveClaim(p.claim.index)}
                      onBlur={() => setActiveClaim(null)}
                      className={`cursor-help rounded-sm px-0.5 text-ink underline decoration-2 underline-offset-4 outline-none transition ${VERDICT[p.claim.verdict]?.mark} ${
                        activeClaim === p.claim.index ? 'ring-2 ring-ink' : ''
                      }`}
                    >
                      {p.text}
                      <sup className="ml-0.5 font-sans text-[10px] font-bold">{p.claim.index + 1}</sup>
                    </mark>
                  ) : (
                    <span key={i}>{p.text}</span>
                  ),
                )}
              </p>
              {claims.length > 0 && (
                <p className="mt-4 font-hand text-xl leading-tight text-brand">{t('detail.hint')}</p>
              )}
            </div>
          </section>
        </div>

        {/* RIGHT: the fact-check */}
        <div className="min-w-0">
          <section className="animate-fade-up sheet relative overflow-hidden" aria-labelledby="fact-check">
            <div className={`h-2 ${s.bg}`} aria-hidden />
            <div className="min-w-0 p-4 sm:p-7">
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <div className="min-w-0 flex-1">
                  <h2 id="fact-check" className="text-xs font-bold tracking-wider text-ink-mute uppercase">{t('detail.factCheck')}</h2>
                  <p className={`mt-1 break-words text-xl font-extrabold sm:text-3xl ${s.text}`}>{t(`status.${v.status}.tagline`)}</p>
                </div>
                {pending
                  ? <Loader className="mt-2 size-8 shrink-0 animate-spin text-ink-mute" aria-label={t('detail.checking')} />
                  : <Stamp status={v.status} size="lg" animate className="mr-1 shrink-0" />}
              </div>

              <p className="mt-4 break-words text-base leading-relaxed text-ink text-pretty sm:text-lg">{v.summary ? tx(v.summary) : t('detail.pendingSummary')}</p>
              {v.fallback && <p className="mt-3 rounded-xl border border-half bg-half-soft p-3 text-sm font-medium text-ink">{t('detail.fallbackNotice')}</p>}

              {pending ? (
                <ol className="mt-6 space-y-4 border-t-[1.5px] border-dashed border-line pt-5">
                  {t('detail.steps').map(([title, desc], i) => [title, desc, ['done', 'now', 'next'][i]]).map(([title, desc, state]) => (
                    <li key={title} className="flex gap-3">
                      <span className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${state === 'done' ? 'bg-true text-white' : state === 'now' ? 'bg-marker text-ink' : 'bg-paper-deep'}`}>
                        {state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : state === 'now' ? <Loader className="size-3.5 animate-spin" /> : null}
                      </span>
                      <div>
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-ink-soft">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <>
                  {/* Who checked it */}
                  <div className="mt-5 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3 rounded-xl bg-paper px-3 py-3 sm:px-4">
                    <span className="grid size-10 place-items-center rounded-full bg-brand text-sm font-bold text-white">{initials(v.automated ? 'AI Trust' : v.expert?.name || '')}</span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="flex flex-wrap items-center gap-1.5 break-words font-semibold">
                        {v.automated ? 'AI Trust' : v.expert?.name}
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-dark"><BadgeCheck className="size-3.5" /> {t(v.automated ? 'detail.automated' : 'detail.expert')}</span>
                      </p>
                      <p className="mt-0.5 text-sm text-ink-soft">{v.automated ? t('detail.autoRole') : tx(v.expert?.role)} · {t('detail.checkedAgo', { time: timeAgo(v.verifiedAt) })}</p>
                    </div>
                    {typeof v.confidence === 'number' && <ConfidenceMeter value={v.confidence} className={s.bg} />}
                  </div>

                  {/* Why */}
                  <h3 className="mt-7 text-xl font-extrabold"><span className="marker">{t('detail.why')}</span></h3>
                  <p className="mt-2 break-words text-[16px] leading-relaxed text-ink text-pretty">{tx(v.expertExplanation)}</p>

                  {/* Claim by claim */}
                  {claims.length > 0 && (
                    <>
                      <h3 className="mt-7 text-xl font-extrabold">{t('detail.claims')}</h3>
                      <ol className="mt-3 divide-y-[1.5px] divide-dashed divide-line">
                        {claims.map((c, i) => {
                          const d = VERDICT[c.verdict] || VERDICT.misleading
                          const Icon = d.icon
                          return (
                            <li
                              key={i}
                              onMouseEnter={() => setActiveClaim(i)}
                              onMouseLeave={() => setActiveClaim(null)}
                              className={`-mx-2 flex gap-3 rounded-lg px-2 py-3 transition ${activeClaim === i ? 'bg-marker-soft' : ''}`}
                            >
                              <span className={`grid size-7 shrink-0 place-items-center rounded-lg ${d.box}`}>
                                <Icon className="size-4" strokeWidth={3} aria-hidden />
                              </span>
                              <div className="min-w-0">
                                <p className="break-words font-medium">
                                  <span className="mr-1 text-xs font-bold text-ink-mute">{i + 1}.</span>&ldquo;{c.text}&rdquo;
                                  <span className={`ml-2 text-xs font-bold uppercase ${d.text}`}>{t(`verdict.${c.verdict}`)}</span>
                                </p>
                                <p className="mt-0.5 text-[15px] text-ink-soft">{c.note}</p>
                              </div>
                            </li>
                          )
                        })}
                      </ol>
                    </>
                  )}

                  {/* Sources */}
                  <h3 className="mt-7 text-xl font-extrabold">{t(v.automated ? 'detail.suggestedDomains' : 'detail.sources')}</h3>
                  {v.automated && <p className="mt-1 text-sm text-ink-soft">{t('detail.domainsHint')}</p>}
                  <ul className="mt-3 space-y-2">
                    {v.sources.map((src, i) => (
                      <li key={src.url}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 rounded-xl border-[1.5px] border-line p-3 transition hover:border-ink"
                        >
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-marker font-bold">{i + 1}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block break-words leading-snug font-semibold group-hover:underline">{tx(src.title)}</span>
                            <span className="block truncate text-xs text-ink-mute">
                              {hostname(src.url)}
                              {!v.automated && <span title={t('detail.sourceLang')} className="ml-1.5 rounded bg-paper-deep px-1 py-px text-[10px] font-bold text-ink-soft">EN</span>}
                            </span>
                          </span>
                          <ExternalLink className="size-4 shrink-0 text-ink-mute group-hover:text-ink" aria-hidden />
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>

          <CommentSection questionId={item.id} comments={itemComments} />

          {related.length > 0 && (
            <section className="mt-10" aria-labelledby="related">
              <h2 id="related" className="text-lg font-extrabold">{t('detail.related', { cat: t(`categories.${item.category}`) })}</h2>
              <ul className="mt-3 space-y-2">
                {related.map((q) => (
                  <li key={q.id}>
                    <button onClick={() => onOpen(q.id)} className="sheet group flex min-w-0 w-full flex-wrap items-center gap-3 p-4 text-left hover:border-ink/30">
                      <Stamp status={q.verification.status} className="shrink-0" />
                      <span className="min-w-0 flex-1 break-words font-semibold">{tx(q.userQuestion)}</span>
                      <ArrowRight className="size-4 shrink-0 text-ink-mute group-hover:text-ink" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
