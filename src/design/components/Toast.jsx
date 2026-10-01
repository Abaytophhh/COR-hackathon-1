import { CircleCheck, Loader, X } from 'lucide-react'
import { useLang } from '../i18n/LangContext.jsx'

export default function Toasts({ toasts, onDismiss }) {
  const { t } = useLang()
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:right-6 sm:bottom-6 sm:left-auto sm:items-end" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className="animate-pop-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border-2 border-ink bg-white p-4 shadow-[0_4px_0_var(--color-ink)]">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-marker">
            {item.kind === 'progress' ? <Loader className="size-4 animate-spin" aria-hidden /> : <CircleCheck className="size-4" aria-hidden />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold">{item.title}</p>
            {item.body && <p className="mt-0.5 text-sm text-ink-soft">{item.body}</p>}
          </div>
          <button onClick={() => onDismiss(item.id)} className="rounded-lg p-1 text-ink-mute hover:bg-paper-deep hover:text-ink" aria-label={t('toast.dismiss')}>
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
