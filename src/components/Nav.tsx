<<<<<<< HEAD
import { Menu, Search, UserRound } from 'lucide-react'

const NAV_LINKS = [
  'Serviços',
  'Benefícios',
  'Documentos',
  'Agendamentos',
=======
import { Landmark, LayoutGrid, MapPin, FileText, Phone, LogIn } from 'lucide-react'

const NAV_LINKS = [
  { icon: LayoutGrid, label: 'Serviços' },
  { icon: MapPin,     label: 'Unidades' },
  { icon: FileText,   label: 'Documentos' },
  { icon: Phone,      label: 'Contato' },
>>>>>>> origin/main
]

export default function Nav() {
  return (
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main
              {label}
            </button>
          ))}
        </div>
<<<<<<< HEAD

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
=======
      </div>
      <button className="flex items-center gap-1.5 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-white/40 bg-white/10 hover:bg-white/20 transition-all">
        <LogIn size={13} />
        Acessar gov.br
      </button>
>>>>>>> origin/main
    </nav>
  )
}
