import { FEATURED_SERVICES, SUGGESTIONS, CHIPS } from '../data/services'
import { NA_HORA, PCDF, DETRAN, SEDET, CRAS, INSS } from '../data/locations'

export interface SearchResult {
  type: 'service' | 'suggestion' | 'location' | 'faq' | 'chip'
  icon: string
  label: string
  detail?: string
  query: string
  score: number
}

interface SearchableItem {
  type: SearchResult['type']
  icon: string
  label: string
  detail?: string
  query: string
  keywords: string
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function buildIndex(): SearchableItem[] {
  const items: SearchableItem[] = []

  for (const s of FEATURED_SERVICES) {
    items.push({
      type: 'service',
      icon: s.icon,
      label: s.title,
      detail: s.desc,
      query: s.query,
      keywords: normalize(`${s.title} ${s.desc} ${s.cta} ${s.badges.map(b => b.label).join(' ')}`),
    })
  }

  for (const s of SUGGESTIONS) {
    items.push({
      type: 'suggestion',
      icon: s.icon,
      label: s.label,
      query: s.query,
      keywords: normalize(`${s.label} ${s.query}`),
    })
  }

  for (const c of CHIPS) {
    items.push({
      type: 'chip',
      icon: c.icon,
      label: c.label,
      query: c.query,
      keywords: normalize(`${c.label} ${c.query}`),
    })
  }

  const allLocations = [...NA_HORA, ...PCDF, ...DETRAN, ...SEDET, ...CRAS, ...INSS]
  for (const loc of allLocations) {
    items.push({
      type: 'location',
      icon: 'MapPin',
      label: loc.name,
      detail: loc.address,
      query: `onde fica ${loc.name}`,
      keywords: normalize(
        `${loc.name} ${loc.address} ${loc.services?.join(' ') ?? ''} ${loc.type}`
      ),
    })
  }

  return items
}

let cachedIndex: SearchableItem[] | null = null

function getIndex(): SearchableItem[] {
  if (!cachedIndex) cachedIndex = buildIndex()
  return cachedIndex
}

export function invalidateSearchIndex(): void {
  cachedIndex = null
}

export function spotlight(rawQuery: string, maxResults = 8): SearchResult[] {
  const q = normalize(rawQuery.trim())
  if (q.length < 2) return []

  const tokens = q.split(/\s+/)
  const index = getIndex()

  const scored: SearchResult[] = []

  for (const item of index) {
    let score = 0
    let allTokensFound = true

    for (const token of tokens) {
      if (item.keywords.includes(token)) {
        score += 10
        if (item.keywords.startsWith(token) || item.keywords.includes(` ${token}`)) {
          score += 5
        }
      } else {
        allTokensFound = false
      }
    }

    if (!allTokensFound && tokens.length > 1) {
      const joined = tokens.join(' ')
      if (item.keywords.includes(joined)) {
        score += 20
      } else {
        continue
      }
    }

    if (score === 0) continue

    // Boost by type priority
    if (item.type === 'service') score += 3
    if (item.type === 'suggestion') score += 2
    if (item.type === 'faq') score += 1

    scored.push({
      type: item.type,
      icon: item.icon,
      label: item.label,
      detail: item.detail,
      query: item.query,
      score,
    })
  }

  // Deduplicate by query
  const seen = new Set<string>()
  const unique = scored.filter(r => {
    if (seen.has(r.query)) return false
    seen.add(r.query)
    return true
  })

  return unique.sort((a, b) => b.score - a.score).slice(0, maxResults)
}
