import { Crown } from 'lucide-react'
import { POINTS, getLevel, useStore } from '../store/StoreContext.jsx'
import { SEED_LEADERS } from '../store/seed.js'
import { initials } from './utils.js'
import { useLang } from '../i18n/LangContext.jsx'

export default function RightRail({ onSubmit }) {
  const { user } = useStore()
  const { t, tx } = useLang()
  const level = getLevel(user.trustScore)
  const board = [...SEED_LEADERS, { name: user.name, field: t('rail.you'), points: user.trustScore, me: true }]
    .sort((a, b) => b.points - a.points)

  return (
    <aside className="min-w-0 space-y-5">
      {/* Your progress */}
      <section className="sheet min-w-0 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-brand text-sm font-bold text-white">{initials(user.name)}</span>
          <div>
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-ink-soft">{t(`levels.${level.name}`)} · <span className="font-semibold whitespace-nowrap text-ink tabular-nums">{user.trustScore} {t('nav.pts')}</span></p>
          </div>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-paper-deep">
          <div className="h-full rounded-full bg-marker transition-all duration-500" style={{ width: `${Math.round(level.progress * 100)}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink-soft">
          {level.next ? t('rail.toNext', { n: level.next.min - user.trustScore, level: t(`levels.${level.next.name}`) }) : t('rail.top')}
        </p>
        <ul className="mt-4 space-y-1.5 border-t-[1.5px] border-dashed border-line pt-3 text-sm text-ink-soft">
          <li className="flex justify-between"><span>{t('rail.earnSubmit')}</span><strong className="text-ink">+{POINTS.submission}</strong></li>
          <li className="flex justify-between"><span>{t('rail.earnComment')}</span><strong className="text-ink">+{POINTS.comment}</strong></li>
          <li className="flex justify-between"><span>{t('rail.earnVote')}</span><strong className="text-ink">+{POINTS.vote}</strong></li>
        </ul>
        <button onClick={onSubmit} className="btn-ink mt-4 w-full bg-marker py-2 text-sm">{t('nav.cta')}</button>
      </section>

      {/* Leaderboard */}
      <section className="sheet min-w-0 p-4 sm:p-5">
        <h2 className="flex items-center gap-2 font-bold"><Crown className="size-4 text-half" aria-hidden /> {t('rail.leaders')}</h2>
        <ol className="mt-3 space-y-1">
          {board.map((p, i) => (
            <li key={p.name} className={`flex items-center gap-3 rounded-xl px-2 py-1.5 ${p.me ? 'bg-marker-soft' : ''}`}>
              <span className={`w-5 text-center text-sm font-bold tabular-nums ${i < 3 ? 'text-ink' : 'text-ink-mute'}`}>{i + 1}</span>
              <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ${p.me ? 'bg-brand text-white' : 'bg-paper-deep text-ink-soft'}`}>{initials(p.name)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{p.me ? t('rail.you') : p.name}</span>
                <span className="block text-xs text-ink-mute">{tx(p.field)}</span>
              </span>
              <span className="text-sm font-semibold tabular-nums">{p.points.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* How it works, as a sticky note */}
      <section className="rounded-md bg-marker-soft p-4 shadow-[0_3px_0_var(--color-line)] sm:rotate-1 sm:p-5">
        <h2 className="font-hand text-2xl leading-none">{t('rail.howTitle')}</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink">
          <li>{t('rail.how1')}</li>
          <li>{t('rail.how2')}</li>
          <li>{t('rail.how3')}</li>
        </ol>
      </section>
    </aside>
  )
}
