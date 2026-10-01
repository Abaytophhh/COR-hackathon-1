import { ArrowRight, MessageCircle, ThumbsUp } from 'lucide-react'
import { Stamp } from './StatusBadge.jsx'
import { getStatus, modelTint } from './status.js'
import { useLang } from '../i18n/LangContext.jsx'

export default function VerificationCard({ item, commentCount, onOpen }) {
  const { t, tNode, tx, timeAgo } = useLang()
  const v = item.verification
  const s = getStatus(v.status)
  return (
    <article className="animate-fade-up min-w-0">
      <button
        onClick={() => onOpen(item.id)}
        className="sheet group block min-w-0 w-full p-4 text-left transition hover:border-ink/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold ${modelTint(item.aiModel)}`}>
            {item.aiModel.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-ink-soft">
              {tNode('card.answered', { model: <span className="font-semibold text-ink">{item.aiModel}</span> })}
              {item.category && <> · <span className="text-brand">{t(`categories.${item.category}`)}</span></>}
              <span className="text-ink-mute"> · {timeAgo(item.createdAt)}</span>
            </p>
            <h3 className="mt-1 break-words text-base leading-snug font-bold text-pretty sm:text-xl">{tx(item.userQuestion)}</h3>
          </div>
          <Stamp status={v.status} className="mt-1 hidden sm:inline-flex" />
        </div>

        <blockquote className="mt-4 line-clamp-2 break-words border-l-[3px] border-line pl-3 font-mono text-[13px] leading-relaxed text-ink-soft">
          {tx(item.aiAnswer)}
        </blockquote>

        <div className={`mt-4 min-w-0 break-words rounded-xl px-3.5 py-2.5 text-[15px] leading-snug ${s.soft}`}>
          <span className={`font-bold ${s.text}`}>{t(`status.${v.status}.label`)}: </span>
          <span className="text-ink">{v.summary ? tx(v.summary) : t('detail.pendingSummary')}</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink-soft sm:gap-4">
          <Stamp status={v.status} className="sm:hidden" />
          <span className="inline-flex items-center gap-1.5"><ThumbsUp className="size-4" aria-hidden />{item.upvotes || 0}<span className="sr-only"> {t('card.helpfulSr')}</span></span>
          <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-4" aria-hidden />{commentCount}<span className="sr-only"> {t('card.commentsSr')}</span></span>
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-brand">
            <span className="hidden sm:inline">{t('card.see')}</span><span className="sm:hidden">{t('card.open')}</span>
            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </button>
    </article>
  )
}
