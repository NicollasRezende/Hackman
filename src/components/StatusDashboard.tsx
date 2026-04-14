import { MessageSquare, TrendingUp, ThumbsUp, Flag, FileText, ArrowRight, Radio, ShieldCheck } from 'lucide-react'

/* ── KPIs TCU — dados mockados para demonstração ─────────────── */
const KPIs = [
  {
    value: '48.392',
    label: 'Atendimentos digitais',
    sublabel: '↑ 18% vs semana anterior',
    Icon: MessageSquare,
    iconClass: 'bg-blue-400/20 text-blue-200',
    query: 'quantos atendimentos o guia cidadão realizou?',
  },
  {
    value: 'R$ 3,2 mi',
    label: 'Economia estimada',
    sublabel: 'custo presencial evitado · R$ 66/atend.',
    Icon: TrendingUp,
    iconClass: 'bg-emerald-400/20 text-emerald-300',
    query: 'qual é a economia gerada pelo guia cidadão?',
  },
  {
    value: '94%',
    label: 'Satisfação cidadão',
    sublabel: '3.030 avaliações · nota 4,7 / 5',
    Icon: ThumbsUp,
    iconClass: 'bg-yellow-400/20 text-yellow-300',
    query: 'qual é o nível de satisfação dos cidadãos com o guia?',
  },
  {
    value: '127',
    label: 'Denúncias TCU',
    sublabel: 'encaminhadas à Ouvidoria',
    Icon: Flag,
    iconClass: 'bg-orange-400/20 text-orange-300',
    query: 'quantas denúncias foram encaminhadas à ouvidoria tcu?',
  },
  {
    value: '89',
    label: 'PAIs gerados (LAI)',
    sublabel: 'pedidos de acesso à informação',
    Icon: FileText,
    iconClass: 'bg-purple-400/20 text-purple-300',
    query: 'quantos pedidos de acesso à informação foram gerados?',
  },
]

const TRUST_TAGS = [
  { label: 'Lei 12.527/2011 (LAI) — 100% em prazo', Icon: ShieldCheck },
  { label: 'Lei 13.460/2017 — carta de serviços', Icon: ShieldCheck },
  { label: 'LGPD — sem dados pessoais em log', Icon: ShieldCheck },
  { label: '0 alertas de desatualização', Icon: Radio },
]

interface Props {
  onHospitalsClick?: () => void
  onMetricClick?: (query: string) => void
}

export default function StatusDashboard({ onMetricClick }: Props) {
  return (
    <section
      className="status-dashboard-panel bg-gradient-to-br from-[#071d41] via-[#0c326f] to-[#1351b4] py-14 px-6 md:px-10 text-center font-sans"
      aria-labelledby="status-dashboard-heading"
    >
      <div className="max-w-[1215px] mx-auto">

        {/* Badge ao vivo */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-white/15 bg-white/10 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-blink flex-shrink-0" aria-hidden />
          <span className="text-[11px] font-bold tracking-widest uppercase text-white/80">
            Painel ao vivo · Auditoria TCU
          </span>
        </div>

        <h2
          id="status-dashboard-heading"
          className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2"
        >
          Transparência e controle em tempo real
        </h2>
        <p className="text-sm text-white/60 mb-12 max-w-xl mx-auto">
          Indicadores do Guia Cidadão IA para fiscalização pelo Tribunal de Contas da União
        </p>

        {/* KPIs clicáveis */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {KPIs.map(kpi => {
            const Icon = kpi.Icon
            return (
              <button
                key={kpi.label}
                type="button"
                onClick={() => onMetricClick?.(kpi.query)}
                aria-label={`${kpi.label}: ${kpi.value}. Perguntar ao assistente.`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 hover:border-white/30 p-5 transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.iconClass}`}>
                  <Icon size={18} aria-hidden />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white leading-none mb-2 group-hover:scale-105 transition-transform tabular-nums">
                    {kpi.value}
                  </div>
                  <div className="text-sm font-semibold text-white/90 mb-1">{kpi.label}</div>
                  <div className="text-[11px] text-white/50 leading-snug">{kpi.sublabel}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Tags de conformidade legal */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10" role="list" aria-label="Conformidade legal">
          {TRUST_TAGS.map(tag => {
            const TIcon = tag.Icon
            return (
              <span
                key={tag.label}
                role="listitem"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/15 text-[11px] font-medium text-white/70"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <TIcon size={11} className="text-emerald-400 flex-shrink-0" aria-hidden />
                {tag.label}
              </span>
            )
          })}
        </div>

        {/* CTA painel completo */}
        <a
          href="#admin"
          onClick={e => {
            e.preventDefault()
            window.location.hash = 'admin'
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/30 hover:bg-white/15 text-white text-sm font-semibold transition-all group"
          aria-label="Acessar painel completo de auditoria TCU"
        >
          Acessar Painel Completo de Auditoria
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" aria-hidden />
        </a>

      </div>
    </section>
  )
}
