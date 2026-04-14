import { ArrowRight } from 'lucide-react'
import { getIcon } from '../utils/icon'
import { SERVICES_BY_AUDIENCE } from '../data/services'
import type { AudienceTab, ServiceCard } from '../types'

/* ── Labels ───────────────────────────────────────────────── */
const AUDIENCE_LABELS: Record<AudienceTab, string> = {
  cidadao:     'Serviços em destaque',
  servidor:    'Para servidores públicos',
  empresa:     'Para empresas e MEI',
  turista:     'Para turistas',
  agendamento: 'Agendamentos disponíveis',
}

const AUDIENCE_DESCS: Record<AudienceTab, string> = {
  cidadao:     'Os serviços mais acessados pelos brasileiros',
  servidor:    'Portais e sistemas do servidor federal',
  empresa:     'Obrigações, abertura e gestão empresarial',
  turista:     'Documentos, câmbio e informações para viagem',
  agendamento: 'Agende serviços públicos federais e estaduais',
}

/* ── Categorias visuais ───────────────────────────────────── */
type Category = 'health' | 'work' | 'doc' | 'transit' | 'social'

function getCategory(icon: string): Category {
  if (['Stethoscope', 'Heart', 'Cross', 'Activity'].includes(icon))   return 'health'
  if (['Briefcase', 'TrendingUp', 'DollarSign'].includes(icon))        return 'work'
  if (['IdCard', 'FileText', 'FileCheck', 'Plane', 'Vote'].includes(icon)) return 'doc'
  if (['Car', 'Bus', 'Train'].includes(icon))                           return 'transit'
  return 'social'
}

/* bg do card, bg do ícone, cor do ícone, cor do CTA, cor do badge de categoria */
const CARD_THEME: Record<Category, {
  cardBg: string
  iconBg: string
  iconColor: string
  accentTop: string
  ctaColor: string
}> = {
  health:  { cardBg: 'bg-red-50',       iconBg: 'bg-red-100',       iconColor: 'text-red-600',    accentTop: 'bg-red-400',    ctaColor: 'text-red-600' },
  work:    { cardBg: 'bg-amber-50',      iconBg: 'bg-amber-100',     iconColor: 'text-amber-700',  accentTop: 'bg-amber-400',  ctaColor: 'text-amber-700' },
  doc:     { cardBg: 'bg-indigo-50',     iconBg: 'bg-indigo-100',    iconColor: 'text-indigo-600', accentTop: 'bg-indigo-400', ctaColor: 'text-indigo-600' },
  transit: { cardBg: 'bg-sky-50',        iconBg: 'bg-sky-100',       iconColor: 'text-sky-600',    accentTop: 'bg-sky-400',    ctaColor: 'text-sky-600' },
  social:  { cardBg: 'bg-gov-blue-light',iconBg: 'bg-gov-blue-dim',  iconColor: 'text-gov-blue',   accentTop: 'bg-gov-blue',   ctaColor: 'text-gov-blue' },
}

const BADGE_STYLES: Record<'green'|'blue'|'ouro', string> = {
  green: 'bg-white/70 text-gov-blue border border-gov-blue/20',
  blue:  'bg-white/70 text-blue-700 border border-blue-200',
  ouro:  'bg-white/70 text-yellow-800 border border-ouro-border',
}

/* ── Props ────────────────────────────────────────────────── */
interface Props {
  audience: AudienceTab
  onServiceClick: (query: string) => void
}

/* ── Componente ───────────────────────────────────────────── */
export default function FeaturedServices({ audience, onServiceClick }: Props) {
  const services = SERVICES_BY_AUDIENCE[audience]

  return (
    <section
      className="max-w-6xl mx-auto px-6 md:px-10 py-14"
      aria-labelledby="featured-services-heading"
    >
      {/* Cabeçalho */}
      <div className="flex items-end justify-between mb-8">
        <div className="flex items-stretch gap-3">
          <div className="w-1 rounded-full bg-gov-blue self-stretch" aria-hidden />
          <div>
            <h2
              id="featured-services-heading"
              className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight"
            >
              {AUDIENCE_LABELS[audience]}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {AUDIENCE_DESCS[audience]}
            </p>
          </div>
        </div>

        <a
          href="https://www.gov.br/pt-br/servicos"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gov-blue hover:underline whitespace-nowrap"
        >
          Ver todos <ArrowRight size={13} aria-hidden />
          <span className="sr-only"> (abre em nova aba no gov.br)</span>
        </a>
      </div>

      {/* Grid de cards — 3 colunas desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s: ServiceCard) => {
          const Icon  = getIcon(s.icon)
          const cat   = getCategory(s.icon)
          const theme = CARD_THEME[cat]
          const label = `${s.title}. ${s.desc}. Ação: ${s.cta}.`

          return (
            <button
              key={s.title}
              type="button"
              onClick={() => onServiceClick(s.query)}
              aria-label={`Abrir no assistente: ${label}`}
              className={`group relative ${theme.cardBg} rounded-2xl p-6 text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden`}
            >
              {/* Faixa de cor no topo — identificação visual rápida */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${theme.accentTop} rounded-t-2xl`}
                aria-hidden
              />

              {/* Ícone grande + badges */}
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme.iconBg} ${theme.iconColor}`}
                  aria-hidden
                >
                  {Icon && <Icon size={26} />}
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {s.badges.slice(0, 2).map(b => (
                    <span
                      key={b.label}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${BADGE_STYLES[b.variant]}`}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Título */}
              <h3 className="font-extrabold text-base text-gray-900 leading-snug mb-2">
                {s.title}
              </h3>

              {/* Descrição — 2 linhas máx */}
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 flex-1">
                {s.desc}
              </p>

              {/* CTA */}
              <div className="mt-5 flex items-center justify-end">
                <span
                  className={`flex items-center gap-1 text-sm font-bold ${theme.ctaColor} group-hover:gap-2 transition-all`}
                >
                  {s.cta} <ArrowRight size={14} aria-hidden />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
