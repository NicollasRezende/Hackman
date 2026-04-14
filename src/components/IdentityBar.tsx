import {
  Landmark,
  Contrast,
  Type,
  LogIn,
  Minus,
  Plus,
  RotateCcw,
  Underline,
} from 'lucide-react'
import { useAccessibility } from '../contexts/AccessibilityContext'

function focusVLibrasWidget() {
  const access = document.querySelector('[vw-access-button]') as HTMLElement | null
  access?.focus()
  access?.click()
}

export default function IdentityBar() {
  const {
    highContrast,
    setHighContrast,
    fontScalePercent,
    increaseFont,
    decreaseFont,
    resetFont,
    underlineLinks,
    toggleUnderlineLinks,
    announce,
  } = useAccessibility()

  const onContrastClick = () => {
    const next = !highContrast
    setHighContrast(next)
    announce(next ? 'Alto contraste ativado' : 'Alto contraste desativado')
  }

  return (
    <nav
      className="bg-gdf-soft border-b border-gdf-border px-4 md:px-10 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs text-gray-600"
      aria-label="Ferramentas de acessibilidade e identidade do portal"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
        <div className="flex items-center gap-2 font-semibold text-gdf-dark border-r border-gdf-border pr-2.5">
          <div className="w-5 h-5 rounded bg-verde flex items-center justify-center" aria-hidden>
            <Landmark size={11} className="text-white" />
          </div>
          <span className="hidden sm:inline">Governo do Distrito Federal</span>
          <span className="sm:hidden">GDF</span>
        </div>
        <span className="hidden sm:inline truncate">Portal Oficial de Serviços ao Cidadão</span>
      </div>

      <div
        className="flex flex-wrap items-center gap-2 md:gap-3"
        role="toolbar"
        aria-label="Controles de exibição e Libras"
      >
        <div
          className="flex items-center gap-0.5 rounded-lg border border-gdf-border bg-white/80 p-0.5"
          role="group"
          aria-label="Tamanho da fonte do site"
        >
          <button
            type="button"
            onClick={decreaseFont}
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:h-8 md:w-8 items-center justify-center rounded-md hover:bg-verde-light hover:text-verde text-gray-600 transition-colors"
            aria-label={`Diminuir tamanho da fonte. Atual: ${fontScalePercent} por cento`}
            disabled={fontScalePercent <= 100}
          >
            <Minus size={14} aria-hidden />
          </button>
          <span className="px-1.5 min-w-[2.5rem] text-center font-semibold text-verde tabular-nums">
            {fontScalePercent}%
          </span>
          <button
            type="button"
            onClick={increaseFont}
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:h-8 md:w-8 items-center justify-center rounded-md hover:bg-verde-light hover:text-verde text-gray-600 transition-colors"
            aria-label={`Aumentar tamanho da fonte. Atual: ${fontScalePercent} por cento`}
            disabled={fontScalePercent >= 130}
          >
            <Plus size={14} aria-hidden />
          </button>
          <button
            type="button"
            onClick={resetFont}
            className="flex h-9 w-9 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 md:h-8 md:w-8 items-center justify-center rounded-md hover:bg-verde-light hover:text-verde text-gray-600 transition-colors border-l border-gdf-border ml-0.5 pl-0.5"
            aria-label="Restaurar tamanho da fonte ao padrão"
            disabled={fontScalePercent === 100}
          >
            <RotateCcw size={13} aria-hidden />
          </button>
        </div>

        <button
          type="button"
          onClick={toggleUnderlineLinks}
          className="flex items-center gap-1 hover:text-verde transition-colors rounded-md px-2 py-1.5 min-h-[44px] md:min-h-0"
          aria-pressed={underlineLinks}
          aria-label={
            underlineLinks
              ? 'Desativar sublinhado em links'
              : 'Ativar sublinhado em links'
          }
        >
          <Underline size={12} aria-hidden />
          <span className="hidden sm:inline">Links</span>
        </button>

        <button
          type="button"
          onClick={onContrastClick}
          className="flex items-center gap-1 hover:text-verde transition-colors rounded-md px-2 py-1.5 min-h-[44px] md:min-h-0"
          aria-pressed={highContrast}
          aria-label={
            highContrast
              ? 'Desativar alto contraste'
              : 'Ativar alto contraste'
          }
        >
          <Contrast size={12} aria-hidden />
          <span className="hidden sm:inline">Contraste</span>
        </button>

        <button
          type="button"
          onClick={focusVLibrasWidget}
          className="flex items-center gap-1 hover:text-verde transition-colors rounded-md px-2 py-1.5 min-h-[44px] md:min-h-0"
          aria-label="Abrir o tradutor de Libras do VLibras"
          title="Abrir o tradutor VLibras (surdo e ouvinte)"
        >
          <Type size={12} aria-hidden />
          <span className="hidden sm:inline">Libras</span>
        </button>

        <a
          href="#admin"
          className="flex items-center gap-1 hover:text-verde transition-colors rounded-md px-2 py-1.5 min-h-[44px] md:min-h-0"
          aria-label="Entrar no painel administrativo"
          title="Entrar no painel administrativo"
        >
          <LogIn size={12} aria-hidden />
          <span className="hidden sm:inline">Entrar</span>
        </a>
      </div>
    </nav>
  )
}
