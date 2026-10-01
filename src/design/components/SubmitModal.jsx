import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useLang } from '../i18n/LangContext.jsx'

const MODELS = ['ChatGPT-4', 'Claude', 'Gemini', 'Llama 3', 'Copilot', 'Other']
const CATEGORIES = ['Science', 'History', 'Health', 'Finance', 'Other']

export default function SubmitModal({ open, busy = false, initialAnswer = '', onClose, onSubmit }) {
  const { t, tNode } = useLang()
  const [form, setForm] = useState({ userQuestion: '', aiAnswer: '', aiModel: MODELS[0], category: CATEGORIES[0] })
  const [touched, setTouched] = useState(false)
  const firstField = useRef(null)
  const busyRef = useRef(busy)
  busyRef.current = busy

  useEffect(() => {
    if (!open) return
    setForm((f) => ({ ...f, userQuestion: '', aiAnswer: initialAnswer }))
    setTouched(false)
    const t = setTimeout(() => firstField.current?.focus(), 50)
    const onKey = (e) => e.key === 'Escape' && !busyRef.current && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, initialAnswer, onClose])

  if (!open) return null

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const errors = {
    userQuestion: form.userQuestion.trim().length < 5 && t('modal.errQuestion'),
    aiAnswer: form.aiAnswer.trim().length < 20 && t('modal.errAnswer'),
  }
  const valid = !errors.userQuestion && !errors.aiAnswer

  const submit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!valid || busy) return
    onSubmit({
      ...form,
      aiModel: form.aiModel === 'Other' ? t('models.Other') : form.aiModel,
      userQuestion: form.userQuestion.trim(),
      aiAnswer: form.aiAnswer.trim(),
    })
  }

  const field = 'w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-ink-mute focus:border-brand'

  return (
    <div className="fixed inset-0 z-50 flex min-w-0 items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="submit-title">
      <div className="absolute inset-0 bg-ink/40" onClick={() => !busy && onClose()} />
      <form onSubmit={submit} noValidate className="animate-pop-in relative flex max-h-[100dvh] min-w-0 w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border-2 border-ink bg-paper shadow-[0_6px_0_var(--color-ink)] sm:max-h-[92dvh] sm:rounded-2xl">
        <div className="flex items-start gap-3 border-b-[1.5px] border-line p-4 sm:p-6">
          <div className="min-w-0 flex-1">
            <p className="font-hand text-xl leading-none text-brand">{t('modal.note')}</p>
            <h2 id="submit-title" className="mt-1 text-xl font-extrabold sm:text-2xl">{t('modal.title')}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t('modal.desc')}</p>
          </div>
          <button type="button" disabled={busy} onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-lg text-ink-mute hover:bg-paper-deep hover:text-ink" aria-label={t('modal.close')}>
            <X className="size-5" />
          </button>
        </div>

        <div className="min-w-0 space-y-4 overflow-y-auto p-4 sm:p-6">
          <div>
            <label htmlFor="f-q" className="mb-1.5 block text-sm font-bold">{t('modal.question')}</label>
            <input id="f-q" ref={firstField} maxLength={350} value={form.userQuestion} onChange={set('userQuestion')} placeholder={t('modal.questionPh')} className={field} />
            {touched && errors.userQuestion && <p className="mt-1 text-xs text-fake">{errors.userQuestion}</p>}
          </div>
          <div>
            <label htmlFor="f-a" className="mb-1.5 block text-sm font-bold">{t('modal.answer')}</label>
            <textarea id="f-a" rows={6} maxLength={3600} value={form.aiAnswer} onChange={set('aiAnswer')} placeholder={t('modal.answerPh')} className={`${field} resize-y font-mono text-[13px] leading-relaxed`} />
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-fake">{touched && errors.aiAnswer}</span>
              <span className="text-ink-mute tabular-nums">{t('modal.chars', { n: form.aiAnswer.length })}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="f-m" className="mb-1.5 block text-sm font-bold">{t('modal.model')}</label>
              <select id="f-m" value={form.aiModel} onChange={set('aiModel')} className={field}>
                {MODELS.map((m) => <option key={m} value={m}>{m === 'Other' ? t('models.Other') : m}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="f-c" className="mb-1.5 block text-sm font-bold">{t('modal.topic')}</label>
              <select id="f-c" value={form.category} onChange={set('category')} className={field}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t-[1.5px] border-line bg-paper-deep/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-center text-sm text-ink-soft sm:text-left">{tNode('modal.reward', { pts: <strong className="text-ink">{t('modal.rewardPts')}</strong> })}</p>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <button type="button" disabled={busy} onClick={onClose} className="min-h-11 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-soft hover:bg-paper-deep sm:w-auto">{t('modal.cancel')}</button>
            <button type="submit" disabled={busy} className="btn-ink w-full bg-marker px-4 py-2 text-sm sm:w-auto">{busy ? t('modal.busy') : t('modal.submit')}</button>
          </div>
        </div>
      </form>
    </div>
  )
}
