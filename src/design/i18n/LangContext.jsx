import { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import ru from './ru.js'
import kk from './kk.js'

export const LANGS = { ru, kk }
const KEY = 'aitrust:lang'

const LangContext = createContext(null)

function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict)
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return LANGS[localStorage.getItem(KEY)] ? localStorage.getItem(KEY) : 'ru' } catch { return 'ru' }
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, lang) } catch { /* ignore */ }
    document.documentElement.lang = lang
    document.title = LANGS[lang].meta.title
  }, [lang])

  const value = useMemo(() => {
    const dict = LANGS[lang]
    const plural = new Intl.PluralRules(lang === 'kk' ? 'kk' : 'ru')
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })

    // t('a.b', { n: 3 }) → string. Plural objects pick a form by `n`.
    const t = (key, vars = {}) => {
      let s = lookup(dict, key) ?? lookup(ru, key) ?? key
      if (s && typeof s === 'object' && !Array.isArray(s) && 'other' in s) s = s[plural.select(vars.n ?? 0)] ?? s.other
      if (typeof s !== 'string') return s
      return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
    }

    // Like t(), but vars may be React nodes (e.g. a bold model name).
    const tNode = (key, vars = {}) => {
      const s = lookup(dict, key) ?? lookup(ru, key) ?? key
      return s.split(/(\{\w+\})/).map((part, i) => {
        const m = part.match(/^\{(\w+)\}$/)
        return <Fragment key={i}>{m ? vars[m[1]] : part}</Fragment>
      })
    }

    // Seed content is { ru, kk }; user-typed content is a plain string.
    const tx = (v) => (v && typeof v === 'object' ? v[lang] ?? v.ru : v ?? '')

    // Many browsers ship without Kazakh relative-time data, so Kazakh uses its own strings.
    const timeAgo = (iso) => {
      const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
      if (s < 60) return dict.time.now
      const units = [[31536000, 'year'], [2592000, 'month'], [86400, 'day'], [3600, 'hour'], [60, 'minute']]
      for (const [secs, u] of units) {
        if (s < secs) continue
        const n = Math.floor(s / secs)
        if (!dict.time.units) return rtf.format(-n, u)
        return u === 'day' && n === 1 ? dict.time.yesterday : `${n} ${dict.time.units[u]} ${dict.time.ago}`
      }
      return dict.time.now
    }

    return { lang, setLang, t, tNode, tx, timeAgo }
  }, [lang])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}

// Compact РУС / ҚАЗ switch.
export function LangSwitch() {
  const { lang, setLang, t } = useLang()
  return (
    <div role="group" aria-label={t('nav.language')} className="flex shrink-0 rounded-full border-[1.5px] border-line bg-white p-0.5 text-xs font-bold">
      {Object.entries(LANGS).map(([code, d]) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          title={d.meta.langName}
          lang={code}
          className={`min-h-11 rounded-full px-2.5 py-1.5 transition ${lang === code ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
        >
          {d.meta.short}
        </button>
      ))}
    </div>
  )
}
