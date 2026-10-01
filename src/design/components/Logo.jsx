export default function Logo({ className = 'size-9' }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M6 4h20a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4H14l-6 5v-5H6a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" fill="var(--color-ink)" />
      <path d="m10 14.5 4 4 8-8" fill="none" stroke="var(--color-marker)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
