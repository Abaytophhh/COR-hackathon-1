import { getStatus } from './status.js'
import { useLang } from '../i18n/LangContext.jsx'

// Small inline verdict chip.
export default function StatusBadge({ status }) {
  const { t } = useLang()
  const s = getStatus(status)
  const Icon = s.icon
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${s.soft} ${s.text}`}>
      <Icon className="size-3.5" strokeWidth={3} aria-hidden />
      {t(`status.${status}.label`)}
    </span>
  )
}

// The rubber stamp. `size` = sm for lists, lg for the fact-check page.
export function Stamp({ status, size = 'sm', animate = false, className = '' }) {
  const { t } = useLang()
  const s = getStatus(status)
  const sizes = size === 'lg' ? 'px-3 py-2 text-lg sm:px-4 sm:py-2.5 sm:text-3xl' : 'px-2 py-1 text-[11px]'
  return (
    <span
      className={`stamp max-w-full break-words ${s.text} ${sizes} ${animate ? 'animate-stamp' : '-rotate-6'} ${className}`}
      aria-label={t('card.stampSr', { label: t(`status.${status}.label`) })}
    >
      {t(`status.${status}.stamp`)}
    </span>
  )
}
