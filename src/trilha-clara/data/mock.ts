import type {
  Trabalho,
  Analise,
  ComparacaoVersoes,
} from '../types'

const RASCUNHO_1 = `A inteligência artificial está mudando o mundo. Muitas pessoas usam IA no dia a dia. A IA pode fazer muitas coisas como escrever textos e criar imagens.

A tecnologia avança rápido. As escolas precisam se adaptar. Os professores devem aprender sobre IA.

Referências:
- https://pt.wikipedia.org/wiki/Inteligência_artificial
- https://www.youtube.com/watch?v=exemplo123`

const RASCUNHO_2 = `A inteligência artificial (IA) tem transformado significativamente diversos setores da sociedade contemporânea. Desde assistentes virtuais até sistemas de diagnóstico médico, a presença da IA é cada vez mais pervasiva no cotidiano.

No âmbito educacional, a IA apresenta tanto oportunidades quanto desafios. Ferramentas de geração de texto, como o ChatGPT, levantam questões sobre autoria, originalidade e o papel do professor na avaliação.

Segundo Floridi (2023), "a revolução da informação está transformando profundamente quem somos". Essa perspectiva reforça a necessidade de letramento digital nas escolas.

As instituições de ensino precisam desenvolver estratégias pedagógicas que integrem a IA de forma ética e produtiva, em vez de simplesmente proibi-la.

Referências:
- FLORIDI, Luciano. The Ethics of Artificial Intelligence. Oxford University Press, 2023.
- https://pt.wikipedia.org/wiki/Inteligência_artificial
- https://www.gov.br/mec/pt-br/assuntos/noticias/educacao-digital
- https://siteinexistente.fake/artigo-ia-2024`

const VERSAO_FINAL = `A inteligência artificial (IA) tem transformado significativamente diversos setores da sociedade contemporânea. Desde assistentes virtuais até sistemas de diagnóstico médico, a presença da IA é cada vez mais pervasiva no cotidiano.

No âmbito educacional, a IA apresenta tanto oportunidades quanto desafios. Ferramentas de geração de texto, como o ChatGPT, levantam questões sobre autoria, originalidade e o papel do professor na avaliação.

Segundo Floridi (2023), "a revolução da informação está transformando profundamente quem somos". Essa perspectiva reforça a necessidade de letramento digital nas escolas.

A implementação de frameworks pedagógicos que contemplem a literacia algorítmica torna-se imperativa no contexto da quarta revolução industrial. A convergência entre pedagogia crítica e computação cognitiva demanda uma reconfiguração epistêmica dos processos avaliativos tradicionais, transcendendo o paradigma binário de certo/errado em direção a uma avaliação processual e formativa.

As instituições de ensino precisam desenvolver estratégias pedagógicas que integrem a IA de forma ética e produtiva, em vez de simplesmente proibi-la. Como destaca a Base Nacional Comum Curricular, a competência digital é fundamental para o exercício da cidadania.

Referências:
- FLORIDI, Luciano. The Ethics of Artificial Intelligence. Oxford University Press, 2023.
- BRASIL. Base Nacional Comum Curricular. Ministério da Educação, 2018.
- https://pt.wikipedia.org/wiki/Inteligência_artificial
- https://www.gov.br/mec/pt-br/assuntos/noticias/educacao-digital
- https://siteinexistente.fake/artigo-ia-2024
- SILVA, J. A. Letramento Digital na Educação Básica. Revista Educar, v. 12, n. 3, 2024.`

export const MOCK_TRABALHOS: Trabalho[] = [
  {
    id: '1',
    titulo: 'Inteligência Artificial na Educação',
    disciplina: 'Redação',
    turma: '3º Ano B',
    professorId: '1',
    dataCriacao: '2026-04-15',
    versoes: [
      {
        id: 'v1',
        tipoVersao: 'rascunho_1',
        nomeArquivo: 'rascunho_ia_v1.docx',
        textoExtraido: RASCUNHO_1,
        dataUpload: '2026-04-10',
      },
      {
        id: 'v2',
        tipoVersao: 'rascunho_2',
        nomeArquivo: 'rascunho_ia_v2.docx',
        textoExtraido: RASCUNHO_2,
        dataUpload: '2026-04-13',
      },
      {
        id: 'v3',
        tipoVersao: 'versao_final',
        nomeArquivo: 'trabalho_ia_final.pdf',
        textoExtraido: VERSAO_FINAL,
        dataUpload: '2026-04-15',
      },
    ],
  },
  {
    id: '2',
    titulo: 'Mudanças Climáticas e Sustentabilidade',
    disciplina: 'Geografia',
    turma: '2º Ano A',
    professorId: '1',
    dataCriacao: '2026-04-12',
    versoes: [
      {
        id: 'v4',
        tipoVersao: 'versao_final',
        nomeArquivo: 'clima_sustentabilidade.pdf',
        textoExtraido: 'As mudanças climáticas representam um dos maiores desafios da humanidade...',
        dataUpload: '2026-04-12',
      },
    ],
  },
  {
    id: '3',
    titulo: 'Revolução Industrial e seus Impactos',
    disciplina: 'História',
    turma: '3º Ano B',
    professorId: '1',
    dataCriacao: '2026-04-08',
    versoes: [
      {
        id: 'v5',
        tipoVersao: 'rascunho_1',
        nomeArquivo: 'rev_industrial_rascunho.docx',
        textoExtraido: 'A revolução industrial começou na Inglaterra no século XVIII...',
        dataUpload: '2026-04-05',
      },
      {
        id: 'v6',
        tipoVersao: 'versao_final',
        nomeArquivo: 'rev_industrial_final.docx',
        textoExtraido: 'A Revolução Industrial, iniciada na Inglaterra durante o século XVIII, constitui um dos marcos mais significativos da história moderna...',
        dataUpload: '2026-04-08',
      },
    ],
  },
]

export const MOCK_ANALISE: Analise = {
  id: 'a1',
  trabalhoId: '1',
  resumo:
    'O trabalho apresenta evolução significativa entre as versões, com crescimento argumentativo visível. Porém, a versão final contém um trecho com complexidade vocabular e estrutural muito superior ao restante do texto, sugerindo possível inserção externa. Uma das fontes citadas não pôde ser verificada.',
  scoreAutonomia: 62,
  dataAnalise: '2026-04-15',
  evidencias: [
    {
      id: 'e1',
      tipo: 'estilo',
      descricao: 'Mudança abrupta de complexidade vocabular',
      trecho:
        'A implementação de frameworks pedagógicos que contemplem a literacia algorítmica torna-se imperativa no contexto da quarta revolução industrial. A convergência entre pedagogia crítica e computação cognitiva demanda uma reconfiguração epistêmica dos processos avaliativos tradicionais, transcendendo o paradigma binário de certo/errado em direção a uma avaliação processual e formativa.',
      severidade: 'alta',
      explicacao:
        'Este trecho apresenta vocabulário técnico-acadêmico ("literacia algorítmica", "reconfiguração epistêmica", "convergência entre pedagogia crítica e computação cognitiva") que destoa significativamente do restante do texto. O tamanho médio das palavras neste parágrafo é 40% maior que nos demais. Isso não significa necessariamente que o trecho foi copiado ou gerado, mas merece conversa com o aluno para entender a origem.',
    },
    {
      id: 'e2',
      tipo: 'estilo',
      descricao: 'Oscilação de formalidade entre versões',
      trecho: 'A IA pode fazer muitas coisas como escrever textos e criar imagens.',
      severidade: 'media',
      explicacao:
        'O rascunho 1 utiliza linguagem informal e frases curtas. O rascunho 2 apresenta salto considerável de formalidade. Embora isso possa indicar amadurecimento natural com revisão, a magnitude da mudança entre as versões é notável.',
    },
    {
      id: 'e3',
      tipo: 'versao',
      descricao: 'Parágrafo inserido sem base nas versões anteriores',
      trecho:
        'A implementação de frameworks pedagógicos que contemplem a literacia algorítmica torna-se imperativa no contexto da quarta revolução industrial.',
      severidade: 'alta',
      explicacao:
        'Este parágrafo aparece apenas na versão final, sem nenhum rascunho prévio que contenha ideias similares. Os demais parágrafos da versão final possuem antecedentes claros nos rascunhos. Isso sugere que o conteúdo foi adicionado de uma vez, sem construção gradual.',
    },
    {
      id: 'e4',
      tipo: 'fonte',
      descricao: 'Fonte não verificável',
      trecho: 'https://siteinexistente.fake/artigo-ia-2024',
      severidade: 'alta',
      explicacao:
        'O link não retorna nenhum conteúdo acessível. Não foi possível verificar se a fonte existe, se possui autoria ou se é relevante para o tema.',
    },
    {
      id: 'e5',
      tipo: 'fonte',
      descricao: 'Referência bibliográfica sem acesso verificável',
      trecho:
        'SILVA, J. A. Letramento Digital na Educação Básica. Revista Educar, v. 12, n. 3, 2024.',
      severidade: 'media',
      explicacao:
        'Não foi possível localizar esta publicação em bases acadêmicas. Isso pode indicar que a referência é fictícia ou que os dados bibliográficos estão incorretos. Recomenda-se pedir ao aluno que apresente a fonte original.',
    },
    {
      id: 'e6',
      tipo: 'autonomia',
      descricao: 'Crescimento desproporcional de complexidade',
      trecho: '',
      severidade: 'media',
      explicacao:
        'O rascunho 1 tem 3 parágrafos curtos com linguagem simples. A versão final tem 5 parágrafos longos com linguagem acadêmica. Embora evolução seja esperada, a magnitude sugere que convém conversar com o aluno sobre seu processo de pesquisa e escrita.',
    },
  ],
  fontes: [
    {
      id: 'f1',
      urlOuReferencia: 'FLORIDI, Luciano. The Ethics of Artificial Intelligence. Oxford University Press, 2023.',
      autor: 'Luciano Floridi',
      dataPublicacao: '2023',
      classificacao: 'alta',
      dominio: 'Oxford University Press',
      observacoes: 'Referência acadêmica reconhecida. Autor é professor em Oxford e Bolonha, referência mundial em ética da IA.',
      linkAtivo: true,
    },
    {
      id: 'f2',
      urlOuReferencia: 'BRASIL. Base Nacional Comum Curricular. Ministério da Educação, 2018.',
      autor: 'Ministério da Educação',
      dataPublicacao: '2018',
      classificacao: 'alta',
      dominio: 'gov.br',
      observacoes: 'Documento oficial do governo federal. Fonte primária e autoridade no tema educacional.',
      linkAtivo: true,
    },
    {
      id: 'f3',
      urlOuReferencia: 'https://pt.wikipedia.org/wiki/Inteligência_artificial',
      autor: 'Comunidade Wikipedia',
      dataPublicacao: null,
      classificacao: 'media',
      dominio: 'wikipedia.org',
      observacoes: 'Fonte colaborativa. Útil para consulta inicial, mas não recomendada como referência acadêmica principal.',
      linkAtivo: true,
    },
    {
      id: 'f4',
      urlOuReferencia: 'https://www.gov.br/mec/pt-br/assuntos/noticias/educacao-digital',
      autor: 'Ministério da Educação',
      dataPublicacao: '2025',
      classificacao: 'alta',
      dominio: 'gov.br',
      observacoes: 'Portal oficial do governo. Fonte institucional confiável.',
      linkAtivo: true,
    },
    {
      id: 'f5',
      urlOuReferencia: 'https://siteinexistente.fake/artigo-ia-2024',
      autor: null,
      dataPublicacao: null,
      classificacao: 'nao_verificavel',
      dominio: 'siteinexistente.fake',
      observacoes: 'O domínio não existe. Não foi possível acessar o conteúdo nem verificar autoria.',
      linkAtivo: false,
    },
    {
      id: 'f6',
      urlOuReferencia: 'SILVA, J. A. Letramento Digital na Educação Básica. Revista Educar, v. 12, n. 3, 2024.',
      autor: 'J. A. Silva',
      dataPublicacao: '2024',
      classificacao: 'nao_verificavel',
      dominio: 'Revista Educar',
      observacoes: 'Publicação não encontrada em bases acadêmicas (Google Scholar, Scielo, CAPES). Dados bibliográficos podem estar incorretos ou a referência pode ser fictícia.',
      linkAtivo: false,
    },
    {
      id: 'f7',
      urlOuReferencia: 'https://www.youtube.com/watch?v=exemplo123',
      autor: null,
      dataPublicacao: null,
      classificacao: 'baixa',
      dominio: 'youtube.com',
      observacoes: 'Vídeo do YouTube citado no rascunho 1 mas removido nas versões seguintes. Fonte não acadêmica, sem autoria identificada.',
      linkAtivo: false,
    },
  ],
  sugestoesMediacao: [
    'Pergunte ao aluno como ele encontrou o conceito de "literacia algorítmica" e peça que explique com as próprias palavras.',
    'Solicite que o aluno apresente a fonte "Revista Educar" — isso ajuda a verificar se ele de fato consultou a referência.',
    'Peça ao aluno que descreva seu processo de escrita: como partiu do rascunho 1 para a versão final? Quais fontes consultou em cada etapa?',
    'Converse sobre a importância de verificar se os links citados realmente funcionam antes de entregar o trabalho.',
    'Valorize a evolução visível entre as versões — o crescimento argumentativo do rascunho 1 para o rascunho 2 é genuíno e merece reconhecimento.',
    'Use este trabalho como oportunidade para discutir com a turma o que são fontes confiáveis e como verificá-las.',
  ],
}

export const MOCK_COMPARACAO: ComparacaoVersoes = {
  versaoOrigem: 'Rascunho 2',
  versaoDestino: 'Versão Final',
  trechosNovos: 3,
  trechosRemovidos: 0,
  crescimentoPercentual: 45,
  diffs: [
    { tipo: 'mantido', texto: 'A inteligência artificial (IA) tem transformado significativamente diversos setores da sociedade contemporânea. Desde assistentes virtuais até sistemas de diagnóstico médico, a presença da IA é cada vez mais pervasiva no cotidiano.' },
    { tipo: 'mantido', texto: 'No âmbito educacional, a IA apresenta tanto oportunidades quanto desafios. Ferramentas de geração de texto, como o ChatGPT, levantam questões sobre autoria, originalidade e o papel do professor na avaliação.' },
    { tipo: 'mantido', texto: 'Segundo Floridi (2023), "a revolução da informação está transformando profundamente quem somos". Essa perspectiva reforça a necessidade de letramento digital nas escolas.' },
    { tipo: 'adicionado', texto: 'A implementação de frameworks pedagógicos que contemplem a literacia algorítmica torna-se imperativa no contexto da quarta revolução industrial. A convergência entre pedagogia crítica e computação cognitiva demanda uma reconfiguração epistêmica dos processos avaliativos tradicionais, transcendendo o paradigma binário de certo/errado em direção a uma avaliação processual e formativa.' },
    { tipo: 'mantido', texto: 'As instituições de ensino precisam desenvolver estratégias pedagógicas que integrem a IA de forma ética e produtiva, em vez de simplesmente proibi-la.' },
    { tipo: 'adicionado', texto: 'Como destaca a Base Nacional Comum Curricular, a competência digital é fundamental para o exercício da cidadania.' },
    { tipo: 'adicionado', texto: 'BRASIL. Base Nacional Comum Curricular. Ministério da Educação, 2018.' },
    { tipo: 'adicionado', texto: 'SILVA, J. A. Letramento Digital na Educação Básica. Revista Educar, v. 12, n. 3, 2024.' },
  ],
}
