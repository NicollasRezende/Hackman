import { AlertTriangle, FileSearch, MessageSquare, Megaphone, ExternalLink, Shield } from 'lucide-react'

const MANIFESTACOES = [
  {
    icon: AlertTriangle,
    label: 'Denúncia',
    desc: 'Irregularidade com recursos federais ou atos ilegais de agentes públicos.',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-100',
    url: 'https://portal.tcu.gov.br/ouvidoria',
  },
  {
    icon: MessageSquare,
    label: 'Reclamação',
    desc: 'Serviço público prestado com qualidade abaixo do previsto na Carta de Serviços.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    url: 'https://portal.tcu.gov.br/ouvidoria',
  },
  {
    icon: FileSearch,
    label: 'Pedido de Informação',
    desc: 'Solicite documentos ou processos administrativos (Lei 12.527/2011 — LAI).',
    color: 'text-gov-blue',
    bg: 'bg-gov-blue-light',
    border: 'border-gov-blue/20',
    url: 'https://portal.tcu.gov.br/ouvidoria',
  },
  {
    icon: Megaphone,
    label: 'Sugestão ou Elogio',
    desc: 'Contribua para melhoria dos serviços públicos ou reconheça um bom atendimento.',
    color: 'text-verde',
    bg: 'bg-verde-light',
    border: 'border-verde/20',
    url: 'https://portal.tcu.gov.br/ouvidoria',
  },
]

export default function OuvidoriaSection() {
  return (
    <section
      className="w-full bg-gdf-soft border-t border-gdf-border py-10 px-4"
      aria-labelledby="ouvidoria-title"
    >
      <div className="max-w-2xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-start gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0"
            aria-hidden
          >
            <Shield size={20} />
          </div>
          <div>
            <h2
              id="ouvidoria-title"
              className="text-base font-bold text-gdf-dark m-0 leading-tight"
            >
              Controle Social
            </h2>
            <p className="text-xs text-gray-600 mt-0.5 m-0">
              Lei 13.460/2017 · Lei 12.527/2011 (LAI) · Ouvidoria TCU
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-700 mb-5 leading-relaxed">
          Todo cidadão tem o direito de registrar manifestações sobre serviços públicos.
          Quando um serviço não cumpre o que foi prometido, você pode — e deve — denunciar.
        </p>

        {/* Cards de manifestação */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {MANIFESTACOES.map(({ icon: Icon, label, desc, color, bg, border, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start gap-3 p-3.5 rounded-xl border ${bg} ${border} hover:shadow-sm transition-all group`}
              aria-label={`${label} — abre Ouvidoria TCU em nova aba`}
            >
              <div
                className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm ${color}`}
                aria-hidden
              >
                <Icon size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold m-0 mb-0.5 ${color}`}>{label}</p>
                <p className="text-[11px] text-gray-600 m-0 leading-snug">{desc}</p>
              </div>
              <ExternalLink
                size={11}
                className="text-gray-400 flex-shrink-0 mt-1 group-hover:text-gray-600 transition-colors"
                aria-hidden
              />
            </a>
          ))}
        </div>

        {/* CTA principal */}
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-indigo-800 m-0">Ouvidoria TCU · 0800-644-2300</p>
            <p className="text-[11px] text-indigo-700 m-0 mt-0.5 leading-snug">
              Atendimento seg–sex, 10h–18h. Manifestações anônimas aceitas.
            </p>
          </div>
          <a
            href="https://portal.tcu.gov.br/ouvidoria"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all flex-shrink-0"
            aria-label="Acessar Ouvidoria do TCU (abre em nova aba)"
          >
            <ExternalLink size={11} aria-hidden /> Acessar Ouvidoria
          </a>
        </div>
      </div>
    </section>
  )
}
