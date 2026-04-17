import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  FilePlus,
  Trash2,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'

interface ArquivoUpload {
  nome: string
  tipo: string
  tamanho: string
}

const LABEL_VERSAO: Record<string, string> = {
  rascunho_1: 'Rascunho 1',
  rascunho_2: 'Rascunho 2',
  versao_final: 'Versão Final',
}

export default function NovaAnalise() {
  const navigate = useNavigate()
  const [titulo, setTitulo] = useState('')
  const [disciplina, setDisciplina] = useState('')
  const [turma, setTurma] = useState('')
  const [textoColado, setTextoColado] = useState('')
  const [modoTexto, setModoTexto] = useState(false)
  const [arquivos, setArquivos] = useState<Record<string, ArquivoUpload | null>>({
    rascunho_1: null,
    rascunho_2: null,
    versao_final: null,
  })
  const [analisando, setAnalisando] = useState(false)

  const handleFile = (versao: string) => {
    // Simula upload
    const nomes: Record<string, string> = {
      rascunho_1: 'rascunho_v1.docx',
      rascunho_2: 'rascunho_v2.docx',
      versao_final: 'trabalho_final.pdf',
    }
    setArquivos(prev => ({
      ...prev,
      [versao]: {
        nome: nomes[versao] || 'arquivo.pdf',
        tipo: versao === 'versao_final' ? 'PDF' : 'DOCX',
        tamanho: `${(Math.random() * 2 + 0.3).toFixed(1)} MB`,
      },
    }))
  }

  const removeFile = (versao: string) => {
    setArquivos(prev => ({ ...prev, [versao]: null }))
  }

  const temVersaoFinal = arquivos.versao_final || (modoTexto && textoColado.trim())
  const canSubmit = titulo.trim() && disciplina.trim() && turma.trim() && temVersaoFinal

  const handleSubmit = () => {
    if (!canSubmit) return
    setAnalisando(true)
    setTimeout(() => {
      navigate('/trilha-clara/analise/1')
    }, 2500)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Nova Análise</h1>
      <p className="mb-8 text-sm text-gray-500">
        Envie o trabalho e, se possível, versões anteriores para uma análise mais completa.
      </p>

      {/* Info do trabalho */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Informações da Atividade</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Título *</label>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Redação sobre IA"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-trilha focus:ring-2 focus:ring-trilha/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Disciplina *</label>
            <input
              value={disciplina}
              onChange={e => setDisciplina(e.target.value)}
              placeholder="Ex: Redação"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-trilha focus:ring-2 focus:ring-trilha/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Turma *</label>
            <input
              value={turma}
              onChange={e => setTurma(e.target.value)}
              placeholder="Ex: 3º Ano B"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-trilha focus:ring-2 focus:ring-trilha/20"
            />
          </div>
        </div>
      </section>

      {/* Upload */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Documentos</h2>
          <button
            onClick={() => setModoTexto(!modoTexto)}
            className="text-xs font-medium text-trilha hover:underline"
          >
            {modoTexto ? 'Enviar arquivo' : 'Colar texto manualmente'}
          </button>
        </div>

        {modoTexto ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Cole o texto do trabalho aqui
            </label>
            <textarea
              value={textoColado}
              onChange={e => setTextoColado(e.target.value)}
              rows={10}
              placeholder="Cole aqui o texto do trabalho..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-trilha focus:ring-2 focus:ring-trilha/20"
            />
            <p className="mt-1 text-xs text-gray-400">
              {textoColado.length} caracteres
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Rascunhos opcionais */}
            {(['rascunho_1', 'rascunho_2', 'versao_final'] as const).map(versao => {
              const arq = arquivos[versao]
              const obrigatorio = versao === 'versao_final'
              return (
                <div key={versao}>
                  <div className="mb-1 flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      {LABEL_VERSAO[versao]}
                    </label>
                    {obrigatorio ? (
                      <span className="text-xs text-red-500">*obrigatório</span>
                    ) : (
                      <span className="text-xs text-gray-400">opcional</span>
                    )}
                  </div>

                  {arq ? (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{arq.nome}</p>
                          <p className="text-xs text-gray-500">
                            {arq.tipo} · {arq.tamanho}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(versao)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleFile(versao)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 py-6 text-sm text-gray-500 transition hover:border-trilha hover:bg-trilha-light hover:text-trilha"
                    >
                      {obrigatorio ? <Upload size={20} /> : <FilePlus size={20} />}
                      <span>
                        Clique para enviar {LABEL_VERSAO[versao].toLowerCase()}
                      </span>
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Nota sobre versões */}
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-blue-500" />
          <p className="text-xs text-blue-700">
            Enviar rascunhos anteriores permite uma análise de evolução mais completa. Sem eles,
            a análise se limita à versão final.
          </p>
        </div>
      </section>

      {/* Formatos */}
      <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-800">Formatos aceitos</h2>
        <div className="flex flex-wrap gap-2">
          {['PDF', 'DOCX', 'DOC', 'TXT'].map(f => (
            <span
              key={f}
              className="rounded-full border border-trilha-border bg-trilha-light px-3 py-1 text-xs font-medium text-trilha"
            >
              .{f.toLowerCase()}
            </span>
          ))}
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
            Texto colado
          </span>
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => navigate('/trilha-clara')}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || analisando}
          className="inline-flex items-center gap-2 rounded-lg bg-trilha px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-trilha-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analisando ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Analisando...
            </>
          ) : (
            <>
              Analisar Trabalho <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
