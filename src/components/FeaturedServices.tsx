import { ArrowRight } from 'lucide-react'
import { getIcon } from '../utils/icon'
import { FEATURED_SERVICES } from '../data/services'

const BADGE_STYLES = {
  green: 'bg-gov-blue-light text-gov-blue',
  blue: 'bg-blue-50 text-blue-700',
  ouro: 'bg-ouro-bg text-yellow-800 border border-ouro-border',
}

interface Props {
  onServiceClick: (query: string) => void
}

export default function FeaturedServices({ onServiceClick }: Props) {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-14" aria-labelledby="featured-services-heading">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 id="featured-services-heading" className="text-xl font-extrabold text-gray-900 tracking-tight">
            Serviços em destaque
          </h2>
          <p className="text-sm text-gray-600 mt-1">Os serviços mais acessados pelos cidadãos do DF</p>
        </div>
        <a
          href="https://www.df.gov.br"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gov-blue hover:underline whitespace-nowrap"
        >
          Ver todos <ArrowRight size={13} aria-hidden />
          <span className="sr-only"> (abre em nova aba no site do GDF)</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURED_SERVICES.map(s => {
          const Icon = getIcon(s.icon)
          const StatIcon = getIcon(s.stat.icon)
          const label = `${s.title}. ${s.desc}. ${s.stat.text}. Ação: ${s.cta}.`
          return (
            <button
              key={s.title}
              type="button"
              onClick={() => onServiceClick(s.query)}
              aria-label={`Abrir no assistente: ${label}`}
              className="bg-white border border-gdf-border rounded-2xl p-5 text-left hover:shadow-md hover:border-gov-blue-light hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-gov-blue-light text-gov-blue flex items-center justify-center" aria-hidden>
                  {Icon && <Icon size={20} />}
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {s.badges.map(b => (
                    <span
                      key={b.label}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_STYLES[b.variant]}`}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="font-bold text-sm text-gray-900 mb-1.5 leading-snug">{s.title}</div>
              <div className="text-xs text-gray-600 leading-relaxed flex-1">{s.desc}</div>
              <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-gdf-border">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  {StatIcon && <StatIcon size={12} aria-hidden />}
                  {s.stat.text}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-gov-blue">
                  {s.cta} <ArrowRight size={12} aria-hidden />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
