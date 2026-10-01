
export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')

export const hostname = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}
