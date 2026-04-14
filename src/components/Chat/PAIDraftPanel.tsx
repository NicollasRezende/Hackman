/**
 * PAIDraftPanel — gera rascunho de Pedido de Acesso à Informação (Lei 12.527/2011)
 * com base na resposta da IA. Puramente frontend, sem chamada de API.
 */
import { useState, useCallback, useMemo } from 'react'
import { Copy, Check, ExternalLink, FileSearch } from 'lucide-react'
import { useAccessibility } from '../../contexts/AccessibilityContext'
import type { AIResponse } from '../../types'

interface Props {
  data: AIResponse
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function today(): string {
  return new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function PAIDraftPanel({ data }: Props) {
  const { announce } = useAccessibility()
  const [copied, setCopied] = useState(false)

  const orgao = data.contact?.title ?? data.provenance?.source ?? 'órgão público responsável'
  const tema = data.tag.txt
  const descricao = stripHtml(data.intro)

  const draft = useMemo(
    () =>
      [
        'PEDIDO DE ACESSO À INFORMAÇÃO',
        'Lei Federal nº 12.527/2011 (LAI)',
        '',
        `Para: ${orgao}`,
        `Data: ${today()}`,
        '',
        'Prezados(as),',
        '',
        `Com fundamento na Lei Federal nº 12.527/2011 (Lei de Acesso à Informação), `,
        `solicito acesso às informações relacionadas ao tema: ${tema}.`,
        '',
        'Contexto da solicitação:',
        descricao,
        '',
        'Solicito, especificamente:',
        '1. Documentos, relatórios ou processos administrativos relacionados ao tema acima;',
        '2. Dados públicos disponíveis sobre o serviço, incluindo prazos, requisitos e estatísticas de atendimento;',
        '3. Informações sobre a Carta de Serviços ao Usuário do órgão (conforme Lei 13.460/2017).',
        '',
        'Solicito resposta no prazo de 20 dias úteis conforme previsto em lei.',
        '',
        'Atenciosamente,',
        '[Seu nome completo]',
        '[CPF — opcional]',
        '[E-mail para resposta]',
      ].join('\n'),
    [orgao, tema, descricao],
  )

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      announce('Rascunho copiado para a área de transferência.')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      announce('Não foi possível copiar. Selecione o texto manualmente.')
    }
  }, [draft, announce])

  return (
    <section
      className="mt-3 border border-gdf-border rounded-xl overflow-hidden"
      aria-label="Rascunho de Pedido de Acesso à Informação"
    >
      {/* Cabeçalho */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gdf-soft border-b border-gdf-border">
        <FileSearch size={13} className="text-gov-blue flex-shrink-0" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-gdf-dark m-0 leading-none">
            Rascunho — Pedido de Acesso à Informação
          </p>
          <p className="text-[10px] text-gray-500 m-0 mt-0.5">
            Lei 12.527/2011 · preencha os campos entre colchetes antes de enviar
          </p>
        </div>
      </div>

      {/* Texto do rascunho */}
      <pre
        className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap font-sans m-0 px-3.5 py-3 bg-white max-h-52 overflow-y-auto"
        tabIndex={0}
        aria-label="Texto do rascunho do pedido de acesso à informação"
      >
        {draft}
      </pre>

      {/* Ações */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-gdf-soft border-t border-gdf-border flex-wrap">
        <button
          type="button"
          onClick={() => void handleCopy()}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
            copied
              ? 'bg-verde-light border-verde text-verde'
              : 'bg-white border-gdf-border text-gray-700 hover:border-gov-blue hover:text-gov-blue hover:bg-gov-blue-light'
          }`}
          aria-label={copied ? 'Rascunho copiado' : 'Copiar rascunho'}
        >
          {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
          {copied ? 'Copiado!' : 'Copiar rascunho'}
        </button>

        <a
          href="https://esic.cgu.gov.br"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-gov-blue px-3 py-1.5 rounded-lg hover:bg-gov-blue-dark transition-all"
          aria-label="Abrir sistema e-SIC para enviar o pedido (abre em nova aba)"
        >
          <ExternalLink size={12} aria-hidden /> Enviar no e-SIC
        </a>

        <span className="text-[10px] text-gray-400 ml-auto hidden sm:block">
          Prazo de resposta: 20 dias úteis
        </span>
      </div>
    </section>
  )
}
