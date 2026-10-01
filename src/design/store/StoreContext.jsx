import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { SEED_COMMENTS, SEED_QUESTIONS, SEED_USER } from './seed.js'

// localStorage acts as the "backend" for the hackathon demo.
const KEYS = {
  questions: 'aitrust:v2:questions',
  comments: 'aitrust:v2:comments',
  user: 'aitrust:v2:user',
  votes: 'aitrust:v2:votes',
}

export const POINTS = { comment: 5, submission: 10, vote: 1 }

// `name` is a key into the `levels` translations.
const LEVELS = [
  { min: 0, name: 'newcomer' },
  { min: 100, name: 'finder' },
  { min: 250, name: 'seeker' },
  { min: 500, name: 'verifier' },
  { min: 1000, name: 'guardian' },
]

export function getLevel(score) {
  let idx = 0
  LEVELS.forEach((l, i) => { if (score >= l.min) idx = i })
  const current = LEVELS[idx]
  const next = LEVELS[idx + 1]
  const progress = next ? (score - current.min) / (next.min - current.min) : 1
  return { ...current, next, progress }
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage full or blocked — the demo keeps working in memory.
    }
  }, [key, value])
  return [value, setValue]
}

const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [questions, setQuestions] = usePersistentState(KEYS.questions, SEED_QUESTIONS)
  const [comments, setComments] = usePersistentState(KEYS.comments, SEED_COMMENTS)
  const [user, setUser] = usePersistentState(KEYS.user, SEED_USER)
  const [votes, setVotes] = usePersistentState(KEYS.votes, {})

  const addPoints = useCallback((n) => {
    setUser((u) => ({ ...u, trustScore: Math.max(0, u.trustScore + n) }))
  }, [setUser])

  const addComment = useCallback((questionId, text) => {
    const comment = { id: uid('c'), questionId, author: user.name, text, createdAt: new Date().toISOString(), mine: true }
    setComments((cs) => [...cs, comment])
    addPoints(POINTS.comment)
    return comment
  }, [user.name, setComments, addPoints])

  const submitQuestion = useCallback(({ userQuestion, aiAnswer, aiModel, category }, result) => {
    const status = {
      VERIFIED_REAL: 'Trusted',
      DEBUNKED_FAKE: 'Fake',
      MISLEADING: 'Misleading',
    }[result.verdict] || 'Misleading'
    const item = {
      id: uid('q'),
      userQuestion,
      aiAnswer,
      aiModel,
      category,
      createdAt: new Date().toISOString(),
      submittedBy: user.name,
      upvotes: 0,
      verification: {
        status,
        automated: true,
        fallback: result.engine === 'fallback',
        summary: { ru: 'Автоматическая оценка готова. Проверьте объяснение и первоисточники.', kk: 'Автоматты бағалау дайын. Түсіндірме мен бастапқы дереккөздерді тексеріңіз.' },
        expertExplanation: result.explanation,
        confidence: result.confidence,
        verifiedAt: result.checked_at,
        claims: [],
        sources: result.sources.map((domain) => ({ url: `https://${domain}`, title: domain })),
      },
    }
    setQuestions((qs) => [item, ...qs])
    addPoints(POINTS.submission)
    return item
  }, [user.name, setQuestions, addPoints])

  const toggleVote = useCallback((questionId) => {
    const voted = !!votes[questionId]
    setVotes((v) => ({ ...v, [questionId]: !voted }))
    setQuestions((qs) => qs.map((q) => (q.id === questionId ? { ...q, upvotes: (q.upvotes || 0) + (voted ? -1 : 1) } : q)))
    addPoints(voted ? -POINTS.vote : POINTS.vote)
  }, [votes, setVotes, setQuestions, addPoints])

  const resetDemo = useCallback(() => {
    setQuestions(SEED_QUESTIONS)
    setComments(SEED_COMMENTS)
    setUser(SEED_USER)
    setVotes({})
  }, [setQuestions, setComments, setUser, setVotes])

  const value = useMemo(() => ({
    questions, comments, user, votes,
    addComment, submitQuestion, toggleVote, resetDemo,
  }), [questions, comments, user, votes, addComment, submitQuestion, toggleVote, resetDemo])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
