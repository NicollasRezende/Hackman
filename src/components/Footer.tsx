import { Landmark, ShieldCheck } from 'lucide-react'

const COLS = [
  {
    title: 'Portais Oficiais',
    links: ['GOV.BR', 'DETRAN-DF', 'Secretaria de Saúde', 'Secretaria de Educação', 'Secretaria de Fazenda', 'Câmara Legislativa do DF'],
  },
  {
    title: 'Atendimento',
    links: ['Ouvidoria GDF — 162', 'SAMU — 192', 'Bombeiros — 193', 'Central 156 — GDF', 'Suporte técnico'],
  },
  {
    title: 'Acessibilidade',
    links: ['Alto contraste', 'Libras (VLibras)', 'Mapa do site', 'Política de privacidade', 'Termos de uso'],
  },
]

export default function Footer() {
  return (
    <footer className="bg-gdf-dark border-t border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 text-white font-extrabold text-base mb-3">
            <div className="w-8 h-8 rounded-lg bg-verde flex items-center justify-center" aria-hidden>
              <Landmark size={16} className="text-white" />
            </div>
            Guia Cidadão
          </div>
          <p className="text-xs text-white/40 leading-relaxed max-w-xs">
            Assistente digital oficial do Governo do Distrito Federal. Desenvolvido pela Secretaria de Ciência, Tecnologia e Inovação do GDF para simplificar o acesso aos serviços públicos.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-4 text-[11px] text-white/30 border border-white/10 px-2.5 py-1 rounded-lg">
            <ShieldCheck size={11} aria-hidden />
            Portal oficial · gov.df.br
          </div>
        </div>

        {COLS.map(col => (
          <nav key={col.title} aria-label={col.title}>
            <div className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3.5">{col.title}</div>
            <ul className="flex flex-col gap-2 list-none m-0 p-0">
              {col.links.map(l => (
                <li key={l}>
                  <a
                    href="https://www.df.gov.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/50 hover:text-white transition-colors rounded-sm inline-block"
                  >
                    {l}
                    <span className="sr-only"> (abre em nova aba)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/[0.08] max-w-6xl mx-auto px-6 md:px-10 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-white/30">
        <p className="m-0">
          © 2026 Governo do Distrito Federal · CNPJ 00.394.934/0001-04 · Todos os direitos reservados
        </p>
        <nav aria-label="Links institucionais do rodapé" className="flex gap-5 flex-wrap">
          {['Privacidade', 'Termos de Uso', 'Mapa do Site', 'v1.0.0'].map(l => (
            <a
              key={l}
              href="https://www.df.gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors rounded-sm"
            >
              {l}
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
