import { Menu, Search, UserRound } from 'lucide-react'

const NAV_LINKS = [
  'Serviços',
  'Benefícios',
  'Documentos',
  'Agendamentos',
]

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gov-blue-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-[84px] max-w-6xl items-center justify-between gap-6 px-6 md:px-10">
        <button className="inline-flex items-center gap-3 text-gov-blue hover:text-gov-blue-dark">
          <Menu size={28} strokeWidth={2.2} />
          <span className="text-[2rem] font-light tracking-[-0.03em] text-gov-text">
            Serviços e Informações do Brasil
          </span>
        </button>

        <div className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map(label => (
            <button key={label} className="text-sm font-medium text-gov-muted transition-colors hover:text-gov-blue">
              {label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gov-blue-line text-gov-blue transition-colors hover:border-gov-blue hover:bg-gov-blue-soft">
            <Search size={18} />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full bg-gov-blue px-5 py-2.5 font-semibold text-white transition-colors hover:bg-gov-blue-dark">
            <UserRound size={16} />
            Área do cidadão
          </button>
        </div>
      </div>
    </nav>
  )
}
