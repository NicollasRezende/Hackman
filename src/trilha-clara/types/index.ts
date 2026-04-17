export interface Professor {
  id: string
  nome: string
  email: string
}

export type TipoVersao = 'rascunho_1' | 'rascunho_2' | 'versao_final'

export interface VersaoDocumento {
  id: string
  tipoVersao: TipoVersao
  nomeArquivo: string
  textoExtraido: string
  dataUpload: string
}

export interface Trabalho {
  id: string
  titulo: string
  disciplina: string
  turma: string
  professorId: string
  dataCriacao: string
  versoes: VersaoDocumento[]
  analise?: Analise
}

export type SeveridadeEvidencia = 'baixa' | 'media' | 'alta'
export type TipoEvidencia = 'estilo' | 'fonte' | 'versao' | 'autonomia'

export interface Evidencia {
  id: string
  tipo: TipoEvidencia
  descricao: string
  trecho: string
  severidade: SeveridadeEvidencia
  explicacao: string
}

export type ClassificacaoFonte = 'alta' | 'media' | 'baixa' | 'nao_verificavel'

export interface Fonte {
  id: string
  urlOuReferencia: string
  autor: string | null
  dataPublicacao: string | null
  classificacao: ClassificacaoFonte
  dominio: string
  observacoes: string
  linkAtivo: boolean
}

export interface Analise {
  id: string
  trabalhoId: string
  resumo: string
  scoreAutonomia: number
  dataAnalise: string
  evidencias: Evidencia[]
  fontes: Fonte[]
  sugestoesMediacao: string[]
}

export interface DiffTrecho {
  tipo: 'adicionado' | 'removido' | 'mantido'
  texto: string
}

export interface ComparacaoVersoes {
  versaoOrigem: string
  versaoDestino: string
  diffs: DiffTrecho[]
  trechosNovos: number
  trechosRemovidos: number
  crescimentoPercentual: number
}
