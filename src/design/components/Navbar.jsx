import { Plus } from 'lucide-react'
import { getLevel, useStore } from '../store/StoreContext.jsx'
import Logo from './Logo.jsx'
import { initials } from './utils.js'
import { LangSwitch, useLang } from '../i18n/LangContext.jsx'

export default function Navbar({ onSubmit, onHome }) {
  const { user } = useStore()
  const { t } = useLang()
  const level = getLevel(user.trustScore)

  return (
    <header className="sticky top-0 z-40 border-b-[1.5px] border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 sm:h-16 sm:flex-nowrap sm:py-0 sm:px-6 lg:px-8">
        <a href="#/" onClick={onHome} className="order-1 flex min-w-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
          <Logo />
          <span className="text-lg font-extrabold tracking-tight sm:text-xl">
            ai<span className="text-brand">trust</span>
          </span>
        </a>

        <div className="order-3 flex w-full min-w-0 items-center gap-2 sm:order-2 sm:ml-auto sm:w-auto sm:gap-3">
          <LangSwitch />
          <button onClick={onSubmit} className="btn-ink min-w-0 flex-1 bg-marker px-3 py-2 text-sm sm:flex-none sm:px-4">
            <Plus className="size-4" strokeWidth={3} />
            <span className="hidden sm:inline">{t('nav.cta')}</span>
            <span className="sm:hidden">{t('nav.ctaShort')}</span>
          </button>
        </div>

        <div className="order-2 ml-auto flex min-h-11 shrink-0 items-center gap-2 rounded-full border-[1.5px] border-line bg-white py-1 pr-1 pl-3 sm:order-3 sm:ml-0" title={`${t(`levels.${level.name}`)} · ${user.trustScore} ${t('nav.points')}`}>
          <div className="hidden leading-tight md:block">
            <p className="text-[11px] font-medium text-ink-mute">{t(`levels.${level.name}`)}</p>
            <p className="text-sm font-bold tabular-nums">
              {user.trustScore}
              <span className="font-medium text-ink-soft"> {t('nav.pts')}</span>
            </p>
          </div>
          <span className="text-sm font-bold tabular-nums md:hidden">{user.trustScore}<span className="sr-only"> {t('nav.points')}</span></span>
          <span className="grid size-8 place-items-center rounded-full bg-brand text-xs font-bold text-white">
            {initials(user.name)}
          </span>
        </div>
      </div>
    </header>
  )
}
