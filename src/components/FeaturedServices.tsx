import { ArrowRight } from 'lucide-react'
import { getIcon } from '../utils/icon'
import { FEATURED_SERVICES } from '../data/services'

const BADGE_STYLES = {
<<<<<<< HEAD
  green: 'bg-gov-blue-soft text-gov-blue',
  blue: 'bg-blue-50 text-blue-700',
  ouro: 'border border-ouro-border bg-ouro-bg text-yellow-800',
=======
  green: 'bg-verde-light text-verde',
  blue:  'bg-blue-50 text-blue-700',
  ouro:  'bg-ouro-bg text-yellow-800 border border-ouro-border',
>>>>>>> origin/main
}

interface Props { onServiceClick: (query: string) => void }

export default function FeaturedServices({ onServiceClick }: Props) {
  return (
<<<<<<< HEAD
    <section className="mx-auto max-w-6xl px-6 py-14 md:px-10">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-light tracking-[-0.03em] text-gov-text md:text-4xl">Serviços para você</h2>
      </div>

      <div className="mb-6 flex items-end justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-gov-text">Mais acessados</h3>
          <p className="mt-1 text-sm text-gov-muted">Os serviços mais procurados pelos cidadãos do DF</p>
        </div>
        <a href="#" className="hidden items-center gap-1 whitespace-nowrap text-sm font-semibold text-gov-blue hover:underline sm:flex">
=======
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-14">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Serviços em destaque</h2>
          <p className="text-sm text-[#6B8B73] mt-1">Os serviços mais acessados pelos cidadãos do DF</p>
        </div>
        <a href="#" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-verde hover:underline whitespace-nowrap">
>>>>>>> origin/main
          Ver todos <ArrowRight size={13} />
        </a>
      </div>

<<<<<<< HEAD
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
=======
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
>>>>>>> origin/main
        {FEATURED_SERVICES.map(s => {
          const Icon = getIcon(s.icon)
          const StatIcon = getIcon(s.stat.icon)
          return (
            <button
              key={s.title}
              onClick={() => onServiceClick(s.query)}
<<<<<<< HEAD
              className="flex flex-col border border-[#ebebeb] bg-white p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-gov-blue-line hover:shadow-md"
            >
              <div className="mb-3.5 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gov-blue-soft text-gov-blue">
                  {Icon && <Icon size={20} />}
                </div>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {s.badges.map(b => (
                    <span key={b.label} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${BADGE_STYLES[b.variant]}`}>
=======
              className="bg-white border border-gdf-border rounded-2xl p-5 text-left hover:shadow-md hover:border-[#B8D9C5] hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-verde-light text-verde flex items-center justify-center">
                  {Icon && <Icon size={20} />}
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {s.badges.map(b => (
                    <span key={b.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_STYLES[b.variant]}`}>
>>>>>>> origin/main
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
<<<<<<< HEAD
              <div className="mb-1.5 text-base font-semibold leading-snug text-gov-text">{s.title}</div>
              <div className="flex-1 text-sm leading-relaxed text-gov-muted">{s.desc}</div>
              <div className="mt-4 flex items-center justify-between border-t border-[#ebebeb] pt-3.5">
                <span className="flex items-center gap-1 text-xs text-gov-muted">
                  {StatIcon && <StatIcon size={12} />}
                  {s.stat.text}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-gov-blue">
=======
              <div className="font-bold text-sm text-gray-900 mb-1.5 leading-snug">{s.title}</div>
              <div className="text-xs text-[#6B8B73] leading-relaxed flex-1">{s.desc}</div>
              <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-[#EAF2ED]">
                <span className="flex items-center gap-1 text-xs text-[#6B8B73]">
                  {StatIcon && <StatIcon size={12} />}
                  {s.stat.text}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-verde">
>>>>>>> origin/main
                  {s.cta} <ArrowRight size={12} />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
