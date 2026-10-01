import { Search, X } from 'lucide-react'
import { Stamp } from './StatusBadge.jsx'
import { useLang } from '../i18n/LangContext.jsx'

export default function Hero({ query, onQuery, checked, caught }) {
  const { t } = useLang()
  return (
    <section className="border-b-[1.5px] border-line">
      <div className="mx-auto grid min-w-0 max-w-7xl grid-cols-1 items-center gap-8 px-4 pt-8 pb-10 sm:px-6 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:px-8 lg:pt-14 lg:pb-16">
        <div className="min-w-0">
          <p className="font-hand text-2xl text-brand -rotate-2 origin-left">{t('hero.note')}</p>
          <h1 className="mt-2 text-[clamp(2rem,8vw,3rem)] leading-[1.12] font-extrabold tracking-tight text-balance break-words sm:text-5xl xl:text-6xl">
            {t('hero.line1a')} <span>{t('hero.line1b')}</span><br className="hidden sm:block" />
            {t('hero.line2a')}<span className="marker">{t('hero.marker')}</span>{t('hero.line2b')}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-soft sm:text-lg">{t('hero.sub')}</p>

          <form role="search" onSubmit={(e) => e.preventDefault()} className="mt-7 max-w-xl">
            <label htmlFor="search" className="sr-only">{t('hero.searchLabel')}</label>
            <div className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-white p-1.5 pl-4 shadow-[0_4px_0_var(--color-ink)] focus-within:border-brand focus-within:shadow-[0_4px_0_var(--color-brand)]">
              <Search className="size-5 shrink-0 text-ink-mute" aria-hidden />
              <input
                id="search"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder={t('hero.placeholder')}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none placeholder:text-ink-mute"
                autoComplete="off"
              />
              {query && (
                <button type="button" onClick={() => onQuery('')} className="grid size-11 shrink-0 place-items-center rounded-lg text-ink-mute hover:bg-paper hover:text-ink" aria-label={t('hero.clear')}>
                  <X className="size-4" />
                </button>
              )}
            </div>
          </form>
          <p className="mt-4 text-sm text-ink-soft">
            {t('hero.checked')} <strong className="text-ink">{checked}</strong> · {t('hero.caught')} <strong className="text-fake">{caught}</strong>
          </p>
        </div>

        {/* Desk collage: two checked "notes" with stamps. Decorative. */}
        <div aria-hidden className="relative mx-auto hidden h-72 w-full max-w-sm md:block">
          <div className="absolute top-2 left-0 w-64 rotate-[-4deg] rounded-md bg-marker-soft p-5 shadow-[0_3px_0_var(--color-line)]">
            <p className="text-xs font-semibold text-ink-mute uppercase">{t('hero.saidChatGPT')}</p>
            <p className="mt-1 font-mono text-sm leading-relaxed">{t('hero.quote1')}</p>
            <Stamp status="Fake" className="absolute -top-4 -right-6 bg-white/60 !px-3 !py-1.5 !text-base" />
          </div>
          <div className="absolute right-0 bottom-0 w-60 rotate-[3deg] rounded-md border-[1.5px] border-line bg-white p-5 shadow-[0_3px_0_var(--color-line)]">
            <p className="text-xs font-semibold text-ink-mute uppercase">{t('hero.saidClaude')}</p>
            <p className="mt-1 font-mono text-sm leading-relaxed">{t('hero.quote2')}</p>
            <Stamp status="Trusted" className="absolute -top-4 -right-3 bg-white/60 !px-3 !py-1.5 !text-base" />
          </div>
          <p className="absolute bottom-6 left-1 font-hand text-2xl leading-6 text-ink-soft rotate-[-6deg]">{t('hero.byHumans1')}<br />{t('hero.byHumans2')}</p>
        </div>
      </div>
    </section>
  )
}
