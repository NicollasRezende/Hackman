import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

const STORAGE_HIGH_CONTRAST = 'guia-cidadao-high-contrast'
const STORAGE_FONT_SCALE = 'guia-cidadao-font-scale'
const STORAGE_UNDERLINE = 'guia-cidadao-underline-links'

export const FONT_SCALE_LEVELS = [100, 115, 130] as const
export type FontScalePercent = (typeof FONT_SCALE_LEVELS)[number]

type AccessibilityContextValue = {
  highContrast: boolean
  setHighContrast: (value: boolean) => void
  toggleHighContrast: () => void
  fontScalePercent: FontScalePercent
  increaseFont: () => void
  decreaseFont: () => void
  resetFont: () => void
  underlineLinks: boolean
  toggleUnderlineLinks: () => void
  announce: (message: string) => void
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
)

function readStoredFontScale(): FontScalePercent {
  if (typeof globalThis.window === 'undefined') return 100
  const raw = globalThis.window.localStorage.getItem(STORAGE_FONT_SCALE)
  const n = raw ? Number.parseInt(raw, 10) : 100
  return FONT_SCALE_LEVELS.includes(n as FontScalePercent)
    ? (n as FontScalePercent)
    : 100
}

function readStoredUnderline(): boolean {
  if (typeof globalThis.window === 'undefined') return false
  return globalThis.window.localStorage.getItem(STORAGE_UNDERLINE) === '1'
}

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [highContrast, setHighContrastState] = useState(() => {
    if (typeof globalThis.window === 'undefined') return false
    return globalThis.window.localStorage.getItem(STORAGE_HIGH_CONTRAST) === '1'
  })
  const [fontScalePercent, setFontScalePercent] = useState<FontScalePercent>(readStoredFontScale)
  const [underlineLinks, setUnderlineLinks] = useState(readStoredUnderline)
  const [livePolite, setLivePolite] = useState('')
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const root = document.documentElement
    if (highContrast) {
      root.classList.add('a11y-high-contrast')
      globalThis.window?.localStorage.setItem(STORAGE_HIGH_CONTRAST, '1')
    } else {
      root.classList.remove('a11y-high-contrast')
      globalThis.window?.localStorage.setItem(STORAGE_HIGH_CONTRAST, '0')
    }
  }, [highContrast])

  useEffect(() => {
    const root = document.documentElement
    root.dataset.fontScale = String(fontScalePercent)
    globalThis.window?.localStorage.setItem(STORAGE_FONT_SCALE, String(fontScalePercent))
  }, [fontScalePercent])

  useEffect(() => {
    const root = document.documentElement
    if (underlineLinks) {
      root.classList.add('a11y-underline-links')
      globalThis.window?.localStorage.setItem(STORAGE_UNDERLINE, '1')
    } else {
      root.classList.remove('a11y-underline-links')
      globalThis.window?.localStorage.setItem(STORAGE_UNDERLINE, '0')
    }
  }, [underlineLinks])

  const announce = useCallback((message: string) => {
    if (!message) return
    if (announceTimer.current) {
      clearTimeout(announceTimer.current)
    }
    setLivePolite('')
    announceTimer.current = setTimeout(() => {
      setLivePolite(message)
      announceTimer.current = setTimeout(() => setLivePolite(''), 4500)
    }, 120)
  }, [])

  const setHighContrast = useCallback((value: boolean) => {
    setHighContrastState(value)
  }, [])

  const toggleHighContrast = useCallback(() => {
    setHighContrastState(v => !v)
  }, [])

  const increaseFont = useCallback(() => {
    setFontScalePercent(prev => {
      const i = FONT_SCALE_LEVELS.indexOf(prev)
      const next = FONT_SCALE_LEVELS[Math.min(i + 1, FONT_SCALE_LEVELS.length - 1)]
      if (next !== prev) {
        queueMicrotask(() => announce(`Tamanho da fonte: ${next} por cento`))
      }
      return next
    })
  }, [announce])

  const decreaseFont = useCallback(() => {
    setFontScalePercent(prev => {
      const i = FONT_SCALE_LEVELS.indexOf(prev)
      const next = FONT_SCALE_LEVELS[Math.max(i - 1, 0)]
      if (next !== prev) {
        queueMicrotask(() => announce(`Tamanho da fonte: ${next} por cento`))
      }
      return next
    })
  }, [announce])

  const resetFont = useCallback(() => {
    setFontScalePercent(prev => {
      if (prev !== 100) {
        queueMicrotask(() => announce('Tamanho da fonte restaurado ao padrão'))
      }
      return 100
    })
  }, [announce])

  const toggleUnderlineLinks = useCallback(() => {
    setUnderlineLinks(v => {
      const next = !v
      queueMicrotask(() =>
        announce(
          next
            ? 'Sublinhado em links ativado'
            : 'Sublinhado em links desativado',
        ),
      )
      return next
    })
  }, [announce])

  const value = useMemo(
    () => ({
      highContrast,
      setHighContrast,
      toggleHighContrast,
      fontScalePercent,
      increaseFont,
      decreaseFont,
      resetFont,
      underlineLinks,
      toggleUnderlineLinks,
      announce,
    }),
    [
      highContrast,
      setHighContrast,
      toggleHighContrast,
      fontScalePercent,
      increaseFont,
      decreaseFont,
      resetFont,
      underlineLinks,
      toggleUnderlineLinks,
      announce,
    ],
  )

  return (
    <AccessibilityContext.Provider value={value}>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {livePolite}
      </div>
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext)
  if (!ctx) {
    throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider')
  }
  return ctx
}
