import { AlertTriangle, ExternalLink, FileSearch, Megaphone, MessageSquare } from 'lucide-react'

const MANIFESTACOES = [
  {
    icon: AlertTriangle,
    label: 'Denúncia',
    desc: 'Irregularidade com recursos federais ou atos ilegais de agentes públicos.',
    url: 'https://portal.tcu.gov.br/ouvidoria',
  },
  {
    icon: MessageSquare,
    label: 'Reclamação',
    desc: 'Serviço público prestado com qualidade abaixo do previsto na Carta de Serviços.',
    url: 'https://portal.tcu.gov.br/ouvidoria',
  },
  {
    icon: FileSearch,
    label: 'Solicitação',
    desc: 'Solicite documentos ou processos administrativos (Lei 12.527/2011 - LAI).',
    url: 'https://portal.tcu.gov.br/ouvidoria',
  },
  {
    icon: Megaphone,
    label: 'Elogio',
    desc: 'Contribua para a melhoria dos serviços públicos ou reconheça um bom atendimento.',
    url: 'https://portal.tcu.gov.br/ouvidoria',
  },
]

export default function OuvidoriaSection() {
  return (
    <section
      className="w-full border-t border-gdf-border bg-white px-4 py-14"
      aria-labelledby="ouvidoria-title"
    >
      <div className="mx-auto max-w-5xl">
        <header className="text-center">
          <h2
            id="ouvidoria-title"
            className="text-[28px] font-bold tracking-tight text-gdf-dark sm:text-[32px]"
          >
            Ouvidoria e Acesso à Informação
          </h2>
          <p className="mt-3 text-[15px] text-[#5a667d]">
            Você pode realizar manifestações nos seguintes canais
          </p>
          <p className="mt-1 text-xs text-[#8691a8]">
            Lei 13.460/2017 · Lei 12.527/2011 (LAI) · Ouvidoria TCU
          </p>
        </header>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {MANIFESTACOES.map(({ icon: Icon, label, desc, url }) => (
            <a
              key={label}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title={desc}
              className="group flex flex-col items-center justify-center gap-3 rounded-md border border-[#d7dfef] bg-[#f0f3f8] px-4 py-8 text-center transition-colors hover:border-gov-blue/40 hover:bg-[#e8eefb] focus:outline-none focus-visible:ring-2 focus-visible:ring-gov-blue/50"
              aria-label={`${label} — abre Ouvidoria TCU em nova aba`}
            >
              <Icon size={34} strokeWidth={1.75} className="text-gov-blue" aria-hidden />
              <span className="text-sm font-bold uppercase tracking-wide text-gdf-dark">
                {label}
              </span>
            </a>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-md border border-[#d7dfef] bg-[#f0f3f8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold text-gdf-dark">Ouvidoria TCU · 0800-644-2300</p>
            <p className="mt-1 text-sm text-[#5a667d]">
              Atendimento seg-sex, 10h-18h. Manifestações anônimas aceitas.
            </p>
          </div>

          <a
            href="https://portal.tcu.gov.br/ouvidoria"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gov-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0c3c8c] focus:outline-none focus-visible:ring-2 focus-visible:ring-gov-blue/60 focus-visible:ring-offset-2"
            aria-label="Acessar Ouvidoria do TCU em nova aba"
          >
            <ExternalLink size={14} aria-hidden />
            Acessar Ouvidoria
          </a>
        </div>
      </div>
    </section>
  )
}
