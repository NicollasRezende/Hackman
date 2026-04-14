import { Landmark, ShieldCheck, Instagram, Facebook, Youtube, Twitter } from 'lucide-react'

const COLS = [
  {
    title: 'Serviços Federais',
    links: [
      { label: 'INSS — Previdência Social', href: 'https://www.gov.br/inss' },
      { label: 'Receita Federal', href: 'https://www.gov.br/receitafederal' },
      { label: 'DETRAN (estadual)', href: 'https://www.gov.br/pt-br/servicos/tirar-cnh' },
      { label: 'Ministério da Saúde', href: 'https://www.gov.br/saude' },
      { label: 'Ministério da Educação', href: 'https://www.gov.br/mec' },
      { label: 'Ministério do Trabalho', href: 'https://www.gov.br/trabalho-e-emprego' },
    ],
  },
  {
    title: 'Atendimento Nacional',
    links: [
      { label: 'INSS — 135', href: 'https://www.gov.br/inss' },
      { label: 'Saúde — 136', href: 'https://www.gov.br/saude' },
      { label: 'Violência — 180', href: 'https://www.gov.br/mdh' },
      { label: 'Trabalho — 158', href: 'https://www.gov.br/trabalho-e-emprego' },
      { label: 'Ouvidoria — 162', href: 'https://www.gov.br/ouvidorias' },
      { label: 'Disque Turismo — 0800 023 1313', href: 'https://www.gov.br/turismo' },
    ],
  },
]

const SOCIAL = [
  { Icon: Instagram, label: 'Instagram do Governo Federal', href: 'https://www.instagram.com/govbr' },
  { Icon: Facebook, label: 'Facebook do Governo Federal', href: 'https://www.facebook.com/governofederal' },
  { Icon: Youtube, label: 'YouTube do Governo Federal', href: 'https://www.youtube.com/@govbr' },
  { Icon: Twitter, label: 'X (Twitter) do Governo Federal', href: 'https://x.com/govbr' },
]

export default function Footer() {
  return (
    <footer className="bg-gdf-dark border-t border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Coluna 1: Identidade */}
        <div>
          <div className="flex items-center gap-2.5 text-white font-extrabold text-base mb-3">
            <div className="w-8 h-8 rounded-lg bg-gov-blue flex items-center justify-center" aria-hidden>
              <Landmark size={16} className="text-white" />
            </div>
            Guia Cidadão
          </div>
          <p className="text-xs text-white/40 leading-relaxed max-w-xs">
            Assistente digital do Governo Federal. Desenvolvido para simplificar o acesso aos serviços públicos para todos os brasileiros.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-4 text-[11px] text-white/30 border border-white/10 px-2.5 py-1 rounded-lg">
            <ShieldCheck size={11} aria-hidden />
            Portal oficial · gov.br
          </div>

          {/* Redes sociais */}
          <div className="flex gap-3 mt-5">
            {SOCIAL.map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (abre em nova aba)`}
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                <Icon size={16} aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {/* Colunas 2 e 3: Links */}
        {COLS.map(col => (
          <nav key={col.title} aria-label={col.title}>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3.5">{col.title}</div>
            <ul className="flex flex-col gap-2 list-none m-0 p-0">
              {col.links.map(l => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/50 hover:text-white transition-colors rounded-sm inline-block"
                  >
                    {l.label}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Coluna 4: gov.br */}
        <div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3.5">gov.br</div>
          <p className="text-xs text-white/40 leading-relaxed mb-4">
            O portal único do Governo Federal com serviços, notícias e informações para o cidadão brasileiro.
          </p>
          <a
            href="https://www.gov.br"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-all"
          >
            Acessar gov.br
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </div>
      </div>

      <div className="border-t border-white/[0.08] max-w-6xl mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-white/30">
        <p className="m-0">
          © 2026 República Federativa do Brasil · gov.br · Todos os direitos reservados
        </p>
        <nav aria-label="Links institucionais do rodapé" className="flex gap-5 flex-wrap">
          {[
            { label: 'Privacidade', href: 'https://www.gov.br/governodigital/pt-br/lgpd' },
            { label: 'Termos de Uso', href: 'https://www.gov.br/pt-br/termos-de-uso' },
            { label: 'Mapa do Site', href: 'https://www.gov.br/pt-br/mapa-do-site' },
            { label: 'v1.0.0', href: '#' },
          ].map(l => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors rounded-sm"
            >
              {l.label}
              {l.label !== 'v1.0.0' && <span className="sr-only"> (abre em nova aba)</span>}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
