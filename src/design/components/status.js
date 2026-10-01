import { Check, Clock, CircleHelp, Minus, X } from 'lucide-react'

// Verdict styling. Words (label, stamp, tagline) live in the i18n dictionaries under `status.<key>`.
export const STATUS = {
  Trusted: {
    icon: Check,
    text: 'text-true',
    bg: 'bg-true',
    soft: 'bg-true-soft',
    border: 'border-true',
  },
  Fake: {
    icon: X,
    text: 'text-fake',
    bg: 'bg-fake',
    soft: 'bg-fake-soft',
    border: 'border-fake',
  },
  'Partially True': {
    icon: Minus,
    text: 'text-half',
    bg: 'bg-half',
    soft: 'bg-half-soft',
    border: 'border-half',
  },
  Misleading: {
    icon: Minus,
    text: 'text-half',
    bg: 'bg-half',
    soft: 'bg-half-soft',
    border: 'border-half',
  },
  Pending: {
    icon: Clock,
    text: 'text-ink-mute',
    bg: 'bg-ink-mute',
    soft: 'bg-paper-deep',
    border: 'border-ink-mute',
  },
}

export const getStatus = (s) => STATUS[s] || { ...STATUS.Pending, icon: CircleHelp }

// Per-claim verdicts used to annotate the AI's answer.
export const VERDICT = {
  correct: { icon: Check, mark: 'decoration-true bg-true-soft', box: 'bg-true text-white', text: 'text-true' },
  incorrect: { icon: X, mark: 'decoration-fake bg-fake-soft', box: 'bg-fake text-white', text: 'text-fake' },
  misleading: { icon: Minus, mark: 'decoration-half bg-half-soft', box: 'bg-half text-white', text: 'text-half' },
}

// Stable, friendly colour per AI model for its little avatar.
const MODEL_TINTS = ['bg-brand-soft text-brand-dark', 'bg-marker-soft text-ink', 'bg-true-soft text-true', 'bg-fake-soft text-fake', 'bg-half-soft text-half']
export const modelTint = (name = '') => MODEL_TINTS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % MODEL_TINTS.length]
