import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { POINTS, useStore } from '../store/StoreContext.jsx'
import { initials } from './utils.js'
import { useLang } from '../i18n/LangContext.jsx'

const AVATAR_COLORS = ['bg-brand-soft text-brand-dark', 'bg-marker-soft text-ink', 'bg-true-soft text-true', 'bg-half-soft text-half']
const colorFor = (name) => AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

export default function CommentSection({ questionId, comments }) {
  const { addComment, user } = useStore()
  const { t, tx, timeAgo } = useLang()
  const [text, setText] = useState('')
  const [justAdded, setJustAdded] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    addComment(questionId, t)
    setText('')
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2200)
  }

  const sorted = [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <section className="mt-8" aria-labelledby="community">
      <h2 id="community" className="flex items-center gap-2 text-lg font-extrabold">
        <MessageSquare className="size-5 text-ink-mute" /> {t('comments.title')}
        <span className="rounded-full bg-paper-deep px-2 text-sm font-semibold text-ink-soft tabular-nums">{comments.length}</span>
      </h2>

      <form onSubmit={submit} className="sheet mt-3 p-3 focus-within:border-brand">
        <label htmlFor="comment" className="sr-only">{t('comments.label')}</label>
        <div className="flex gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand text-xs font-bold text-white">{initials(user.name)}</span>
          <textarea
            id="comment"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(e) }}
            placeholder={t('comments.placeholder')}
            className="min-w-0 flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-ink-mute"
          />
        </div>
        <div className="mt-2 flex flex-col gap-3 border-t-[1.5px] border-dashed border-line pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className={`text-xs transition ${justAdded ? 'font-semibold text-true' : 'text-ink-mute'}`}>
            {justAdded ? t('comments.posted', { n: POINTS.comment }) : t('comments.hint', { n: POINTS.comment })}
          </p>
          <button
            type="submit"
            disabled={!text.trim()}
            className="btn-ink w-full bg-ink px-3.5 py-1.5 text-sm text-white sm:w-auto"
          >
            <Send className="size-4" /> {t('comments.post')}
          </button>
        </div>
      </form>

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-2xl border-2 border-dashed border-line p-6 text-center text-ink-soft">
          <span className="font-hand text-2xl text-brand">{t('comments.emptyNote')}</span><br />{t('comments.empty')}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sorted.map((c) => (
            <li key={c.id} className="animate-fade-up sheet flex gap-3 p-4">
              <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold ${colorFor(c.author)}`}>{initials(c.author)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-semibold text-ink">{c.author}</span>
                  {c.mine && <span className="ml-1.5 rounded bg-marker px-1.5 py-0.5 text-[10px] font-bold text-ink uppercase">{t('comments.you')}</span>}
                  <span className="ml-2 text-xs text-ink-mute">{timeAgo(c.createdAt)}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed break-words whitespace-pre-line text-ink">{tx(c.text)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
