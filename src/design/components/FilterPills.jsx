import { Check, FlaskConical, Landmark, LayoutList, Minus, X } from 'lucide-react'
import { useLang } from '../i18n/LangContext.jsx'

export const FILTERS = [
  { id: 'All', icon: LayoutList, group: 'Browse' },
  { id: 'Science', icon: FlaskConical, type: 'category', group: 'Subjects' },
  { id: 'History', icon: Landmark, type: 'category', group: 'Subjects' },
  { id: 'Trusted', icon: Check, type: 'status', group: 'Verdict', dot: 'bg-true' },
  { id: 'Fake', icon: X, type: 'status', group: 'Verdict', dot: 'bg-fake' },
  { id: 'Partially True', icon: Minus, type: 'status', group: 'Verdict', dot: 'bg-half' },
  { id: 'Misleading', icon: Minus, type: 'status', group: 'Verdict', dot: 'bg-half' },
]

// Desktop: a subject list like a school notebook's index. Mobile: wrapping chips.
export default function FilterPills({ active, onChange, counts }) {
  const { t } = useLang()
  const groups = [...new Set(FILTERS.map((f) => f.group))]
  return (
    <>
      <nav className="hidden lg:block" aria-label={t('filters.aria')}>
        {groups.map((g) => (
          <div key={g} className="mb-6">
            <p className="mb-2 px-3 text-xs font-bold tracking-wider text-ink-mute uppercase">{t(`filters.groups.${g}`)}</p>
            <ul className="space-y-0.5">
              {FILTERS.filter((f) => f.group === g).map(({ id, icon: Icon, dot }) => {
                const on = active === id
                return (
                  <li key={id}>
                    <button
                      onClick={() => onChange(id)}
                      aria-current={on ? 'true' : undefined}
                      className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[15px] font-medium transition ${
                        on ? 'bg-ink text-white' : 'text-ink-soft hover:bg-paper-deep hover:text-ink'
                      }`}
                    >
                      {dot ? <span className={`size-2.5 rounded-full ${dot}`} /> : <Icon className="size-4" aria-hidden />}
                      <span className="flex-1">{t(`filters.${id}`)}</span>
                      <span className={`text-xs tabular-nums ${on ? 'text-white/70' : 'text-ink-mute'}`}>{counts[id] ?? 0}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex min-w-0 flex-wrap gap-2 lg:hidden" aria-label={t('filters.aria')}>
        {FILTERS.map(({ id, dot, icon: Icon }) => {
          const on = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-pressed={on}
              className={`inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-semibold ${
                on ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-soft'
              }`}
            >
              {dot ? <span className={`size-2 rounded-full ${dot}`} /> : <Icon className="size-3.5" aria-hidden />}
              {t(`filters.${id}`)}
            </button>
          )
        })}
      </div>
    </>
  )
}
