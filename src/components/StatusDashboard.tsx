import { CheckCircle, AlertTriangle } from 'lucide-react'
import { getIcon } from '../utils/icon'
import { STATUS_CARDS } from '../data/services'
import type { StatusCard } from '../types'

const PILL = {
  green:  'bg-green-500/20 text-green-300',
  yellow: 'bg-yellow-400/20 text-yellow-200',
  red:    'bg-red-500/20 text-red-300',
}

function PillIcon({ variant }: { variant: StatusCard['pill']['variant'] }) {
  if (variant === 'green') return <CheckCircle size={10} />
  return <AlertTriangle size={10} />
}

export default function StatusDashboard() {
  return (
    <section className="bg-gdf-dark py-10 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-white/40 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-blink" />
          Painel de situação do DF — atualizado em tempo real
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_CARDS.map(card => {
            const Icon = getIcon(card.icon)
            return (
              <div key={card.label} className="bg-white/[0.06] border border-white/10 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: card.iconBg, color: card.iconColor }}
                  >
                    {Icon && <Icon size={15} />}
                  </div>
                  <span className="text-[11px] font-semibold text-white/60">{card.label}</span>
                </div>
                <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${PILL[card.pill.variant]}`}>
                  <PillIcon variant={card.pill.variant} />
                  {card.pill.text}
                </div>
                <div className="text-2xl font-extrabold text-white leading-none mb-1.5">{card.value}</div>
                <div className="text-[11px] text-white/40 leading-relaxed">{card.detail}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
