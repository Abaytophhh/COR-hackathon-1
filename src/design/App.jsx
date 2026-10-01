import { useCallback, useEffect, useMemo, useState } from 'react'
import { ClipboardPaste, RotateCcw } from 'lucide-react'
import { useServerFn } from '@tanstack/react-start'
import { checkFact } from '../lib/factcheck.functions'
import { clientFallbackResult } from '../lib/verdict'
import { useStore } from './store/StoreContext.jsx'
import { useLang } from './i18n/LangContext.jsx'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import FilterPills, { FILTERS } from './components/FilterPills.jsx'
import VerificationCard from './components/VerificationCard.jsx'
import DetailView from './components/DetailView.jsx'
import SubmitModal from './components/SubmitModal.jsx'
import Toasts from './components/Toast.jsx'
import RightRail from './components/RightRail.jsx'
import Logo from './components/Logo.jsx'

// Minimal hash router: "#/" is the feed, "#/q/<id>" is a verification.
function useHashRoute() {
  const parse = () => {
    const m = window.location.hash.match(/^#\/q\/(.+)$/)
    return m ? { view: 'detail', id: decodeURIComponent(m[1]) } : { view: 'home' }
  }
  const [route, setRoute] = useState(parse)
  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

const matches = (q, filter) => {
  const f = FILTERS.find((x) => x.id === filter)
  if (!f || f.id === 'All') return true
    return f.type === 'status' ? q.verification.status === f.id : q.category === f.id
}

export default function App() {
  const { questions, comments, submitQuestion, resetDemo } = useStore()
  const route = useHashRoute()
  const { t, tx, lang } = useLang()
  const runCheck = useServerFn(checkFact)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState({ open: false, initialAnswer: '' })
  const [toasts, setToasts] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const dismissToast = useCallback((id) => setToasts((ts) => ts.filter((t) => t.id !== id)), [])
  const toast = useCallback((t) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((ts) => [...ts, { ...t, id }])
    setTimeout(() => dismissToast(id), t.duration || 4500)
  }, [dismissToast])

  const openModal = useCallback((initialAnswer = '') => setModal({ open: true, initialAnswer }), [])
  const closeModal = useCallback(() => setModal((m) => ({ ...m, open: false })), [])
  const openItem = (id) => { window.location.hash = `#/q/${encodeURIComponent(id)}` }
  const goHome = () => { window.location.hash = '#/' }

  const handleSubmit = async (data) => {
    if (submitting) return
    setSubmitting(true)
    const input = `${data.userQuestion}\n\n${data.aiAnswer}`.slice(0, 4000)
    let result
    try {
      result = await runCheck({ data: { query: input, language: lang, localContext: true } })
    } catch {
      result = clientFallbackResult(input, lang, true)
    }
    const item = submitQuestion(data, result)
    closeModal()
    setFilter('All')
    setQuery('')
    openItem(item.id)
    toast({ kind: 'success', title: t('toast.title'), body: t('toast.body') })
    setSubmitting(false)
  }

  const commentCounts = useMemo(() => {
    const m = {}
    comments.forEach((c) => { m[c.questionId] = (m[c.questionId] || 0) + 1 })
    return m
  }, [comments])

  const searched = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
    if (!words.length) return questions
    // Rank by how many search words appear, so pasted AI text still finds related checks.
    return questions
      .map((q) => {
        const v = q.verification
        const hay = [q.userQuestion, q.aiAnswer, q.aiModel, t(`categories.${q.category}`), v.expertExplanation, v.summary].map(tx).join(' ').toLowerCase()
        const hits = words.filter((w) => hay.includes(w)).length
        return { q, score: hits / words.length }
      })
      .filter((r) => r.score >= (words.length > 4 ? 0.35 : 0.99))
      .sort((a, b) => b.score - a.score)
      .map((r) => r.q)
  }, [questions, query, t, tx])

  const visible = searched.filter((q) => matches(q, filter))
  const counts = Object.fromEntries(FILTERS.map((f) => [f.id, searched.filter((q) => matches(q, f.id)).length]))

  const checked = questions.filter((q) => q.verification.status !== 'Pending').length
  const caught = questions.filter((q) => ['Fake', 'Partially True', 'Misleading'].includes(q.verification.status)).length

  return (
    <div className="design-root flex min-h-dvh min-w-0 flex-col">
      <Navbar onSubmit={() => openModal()} onHome={() => { setQuery(''); setFilter('All') }} />

      <main className="min-w-0 flex-1">
        {route.view === 'detail' ? (
          <DetailView id={route.id} onBack={goHome} onOpen={openItem} />
        ) : (
          <>
            <Hero query={query} onQuery={setQuery} checked={checked} caught={caught} />

            <div className="mx-auto grid min-w-0 max-w-7xl grid-cols-1 gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[200px_minmax(0,1fr)_300px] lg:gap-8 lg:px-8 lg:py-10">
              <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
                <FilterPills active={filter} onChange={setFilter} counts={counts} />
              </div>

              <section className="min-w-0" aria-labelledby="feed-title">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                  <h2 id="feed-title" className="min-w-0 text-xl font-extrabold tracking-tight sm:text-2xl">
                    {query ? t('feed.matching') : filter === 'All' ? t('feed.latest') : t(`filters.${filter}`)}
                  </h2>
                  <span className="text-sm text-ink-mute">{t('feed.count', { n: visible.length })}</span>
                </div>

                {visible.length > 0 ? (
                  <div className="min-w-0 space-y-4">
                    {visible.map((q) => (
                      <VerificationCard key={q.id} item={q} commentCount={commentCounts[q.id] || 0} onOpen={openItem} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-line px-6 py-12 text-center">
                    <p className="font-hand text-3xl text-brand">{t('feed.emptyTitle')}</p>
                    <p className="mx-auto mt-2 max-w-sm text-ink-soft">
                      {query ? t('feed.emptyQuery') : t('feed.emptyFilter')}
                    </p>
                    {query && (
                      <button onClick={() => openModal(query)} className="btn-ink mt-5 w-full bg-marker px-4 py-2.5 text-sm sm:w-auto">
                        <ClipboardPaste className="size-4" /> {t('feed.sendThis')}
                      </button>
                    )}
                  </div>
                )}
              </section>

              <RightRail onSubmit={() => openModal()} />
            </div>
          </>
        )}
      </main>

      <footer className="border-t-[1.5px] border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-3 px-4 py-6 text-sm text-ink-soft sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <p className="flex min-w-0 items-center gap-2 break-words"><Logo className="size-5 shrink-0" /> {t('footer.text')}</p>
          <button
            onClick={() => { if (window.confirm(t('footer.confirm'))) { resetDemo(); goHome() } }}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 py-1 font-medium hover:bg-paper-deep hover:text-ink sm:justify-start"
          >
            <RotateCcw className="size-4" /> {t('footer.reset')}
          </button>
        </div>
      </footer>

      <SubmitModal open={modal.open} busy={submitting} initialAnswer={modal.initialAnswer} onClose={closeModal} onSubmit={handleSubmit} />
      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
