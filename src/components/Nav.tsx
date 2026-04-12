import { Landmark, LayoutGrid, MapPin, FileText, Phone, LogIn } from 'lucide-react'

const NAV_LINKS = [
  { icon: LayoutGrid, label: 'Serviços', action: 'services' as const },
  { icon: MapPin, label: 'Unidades', action: 'units' as const },
  { icon: FileText, label: 'Documentos', action: 'docs' as const },
  { icon: Phone, label: 'Contato', action: 'contact' as const },
]

interface Props {
  onServicesClick?: () => void
  onUnitsClick?: () => void
  onHomeClick?: () => void
}

export default function Nav({ onServicesClick, onUnitsClick, onHomeClick }: Props) {
  const handleLink = (action: (typeof NAV_LINKS)[number]['action']) => {
    if (action === 'services') onServicesClick?.()
    else if (action === 'units') onUnitsClick?.()
  }

  const ariaFor = (action: (typeof NAV_LINKS)[number]['action'], label: string) => {
    if (action === 'services') return 'Abrir lista de todos os serviços'
    if (action === 'units') return 'Abrir mapa e informações de hospitais'
    if (action === 'docs') return `${label} — em breve`
    return `${label} — em breve`
  }

  return (
    <nav
      className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm font-sans"
      aria-label="Navegação principal"
    >
      <div className="max-w-[1215px] mx-auto w-full">
        <div className="h-[88px] flex items-center justify-between px-4 md:px-7">
          <button
            type="button"
            onClick={onHomeClick}
            className="flex items-center gap-2 font-extrabold text-3xl tracking-tight text-[#1351b4] hover:opacity-90 transition-opacity"
            aria-label="Ir para a página inicial do Guia Cidadão"
          >
            <Landmark size={32} className="text-[#1351b4]" aria-hidden />
            <span>Guia Cidadão</span>
          </button>

          <div className="hidden lg:flex items-center gap-5 text-sm text-[#1351b4]">
            <div className="flex items-center gap-4">
              {NAV_LINKS.map(({ icon: Icon, label, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleLink(action)}
                  disabled={action === 'docs' || action === 'contact'}
                  aria-disabled={action === 'docs' || action === 'contact'}
                  aria-label={ariaFor(action, label)}
                  className="flex items-center gap-1.5 hover:underline hover:text-[#0c326f] transition-colors disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                >
                  <Icon size={16} aria-hidden />
                  {label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-2" aria-hidden />

            <button
              type="button"
              className="flex items-center gap-2 bg-[#1351b4] text-white font-bold px-6 py-2.5 rounded-full hover:bg-[#0c326f] transition-colors opacity-70 cursor-not-allowed"
              disabled
              aria-disabled="true"
              aria-label="Acessar gov.br — em breve"
            >
              <LogIn size={16} strokeWidth={2.5} aria-hidden />
              Acessar gov.br
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
