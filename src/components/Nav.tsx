import { Landmark, LayoutGrid, MapPin, FileText, Phone, LogIn } from 'lucide-react'

const NAV_LINKS = [
  { icon: LayoutGrid, label: 'Serviços', action: 'services' },
  { icon: MapPin,     label: 'Unidades', action: 'units' },
  { icon: FileText,   label: 'Documentos', action: 'docs' },
  { icon: Phone,      label: 'Contato', action: 'contact' },
]

interface Props {
  onServicesClick?: () => void
  onUnitsClick?: () => void
  onHomeClick?: () => void
}

export default function Nav({ onServicesClick, onUnitsClick, onHomeClick }: Props) {
  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm font-sans">
      <div className="max-w-[1215px] mx-auto w-full">
        <div className="h-[88px] flex items-center justify-between px-4 md:px-7">
          <button onClick={onHomeClick} className="flex items-center gap-2 font-extrabold text-3xl tracking-tight text-[#1351b4] hover:opacity-90 transition-opacity">
            <Landmark size={32} className="text-[#1351b4]" />
            <span>Guia Cidadão</span>
          </button>

          <div className="hidden lg:flex items-center gap-5 text-sm text-[#1351b4]">
            <div className="flex items-center gap-4">
              {NAV_LINKS.map(({ icon: Icon, label, action }) => (
                <button 
                  key={label} 
                  onClick={() => action === 'services' ? onServicesClick?.() : action === 'units' ? onUnitsClick?.() : undefined}
                  className="flex items-center gap-1.5 hover:underline hover:text-[#0c326f] transition-colors"
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button className="flex items-center gap-2 bg-[#1351b4] text-white font-bold px-6 py-2.5 rounded-full hover:bg-[#0c326f] transition-colors">
              <LogIn size={16} strokeWidth={2.5} />
              Acessar gov.br
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
