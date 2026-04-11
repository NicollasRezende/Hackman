import { Landmark, LayoutGrid, MapPin, FileText, Phone, LogIn } from 'lucide-react'

const NAV_LINKS = [
  { icon: LayoutGrid, label: 'Serviços' },
  { icon: MapPin,     label: 'Unidades' },
  { icon: FileText,   label: 'Documentos' },
  { icon: Phone,      label: 'Contato' },
]

export default function Nav() {
  return (
    <nav className="bg-verde sticky top-0 z-50 shadow-md flex items-center justify-between px-6 md:px-10 h-14">
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-2 text-white font-extrabold text-base">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Landmark size={15} className="text-white" />
          </div>
          Guia Cidadão
        </div>
        <div className="w-px h-5 bg-white/25 hidden md:block" />
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 text-white/80 hover:text-white hover:bg-white/10 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>
      <button className="flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-white/40 bg-white/10 hover:bg-white/20 transition-all">
        <LogIn size={13} />
        Acessar gov.br
      </button>
    </nav>
  )
}
