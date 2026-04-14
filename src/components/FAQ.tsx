import { useId, useState } from 'react'
import { ChevronDown, IdCard, HeartPulse, HandCoins, Heart, MessageCircle } from 'lucide-react'

const FAQ_DATA = [
  {
    icon: IdCard,
    title: 'Documentos e Identificação',
    items: [
      {
        q: 'Como tirar a segunda via do RG?',
        a: 'Acesse o portal SSP-DF, agende um horário e compareça com certidão de nascimento ou casamento e comprovante de residência. A primeira emissão é gratuita.',
        query: 'como emitir segunda via do RG?',
      },
      {
        q: 'Como emitir a certidão de nascimento online?',
        a: 'Pelo Portal da Transparência dos Cartórios ou no cartório onde foi registrado. Para registros recentes, o sistema SIRC permite emissão eletrônica gratuita.',
        query: 'como emitir certidão de nascimento pela internet',
      },
      {
        q: 'Onde solicitar a Carteira de Trabalho Digital?',
        a: 'Pelo aplicativo "Carteira de Trabalho Digital" (Android e iOS) ou pelo portal gov.br. O processo é 100% online e gratuito.',
        query: 'como solicitar carteira de trabalho digital',
      },
    ],
  },
  {
    icon: HeartPulse,
    title: 'Saúde e Educação',
    items: [
      {
        q: 'Como me cadastrar no SUS no DF?',
        a: 'Compareça à UBS mais próxima com RG, CPF e comprovante de residência. O cartão SUS é emitido gratuitamente na hora.',
        query: 'como me cadastrar no SUS',
      },
      {
        q: 'Meu filho pode se matricular na escola pública a qualquer momento?',
        a: 'Sim. Fora do período regular, a família deve ir à escola mais próxima com certidão de nascimento, comprovante de residência e RG dos responsáveis.',
        query: 'como matricular filho na escola pública',
      },
      {
        q: 'Quais vacinas são oferecidas gratuitamente em 2026?',
        a: 'O calendário nacional inclui gripe, COVID-19, febre amarela, hepatite B, entre outras. Consulte a UBS mais próxima para estoque disponível na sua região.',
        query: 'quais vacinas gratuitas estão disponíveis',
      },
    ],
  },
  {
    icon: Heart,
    title: 'Direitos da Mulher',
    items: [
      {
        q: 'O que fazer em caso de violência doméstica?',
        a: 'Ligue 190 (emergência) ou 180 (Central da Mulher, 24h, gratuito e sigiloso). Vá à DEAM ou Casa da Mulher Brasileira, que funciona 24h na Asa Sul.',
        query: 'preciso de ajuda com violência doméstica',
      },
      {
        q: 'Como solicitar medida protetiva?',
        a: 'Registre um BO em qualquer delegacia ou na DEAM e solicite a medida protetiva na hora. O juiz decide em até 48h. Não é necessário advogado.',
        query: 'como solicitar medida protetiva pela Lei Maria da Penha',
      },
      {
        q: 'Onde fazer pré-natal gratuito no DF?',
        a: 'Na UBS mais próxima de casa. Leve RG, CPF e cartão SUS. O acompanhamento é 100% gratuito pelo SUS.',
        query: 'onde fazer pré-natal gratuito em Brasília',
      },
    ],
  },
  {
    icon: HandCoins,
    title: 'Benefícios e Assistência',
    items: [
      {
        q: 'Quem tem direito ao Bolsa Família?',
        a: 'Famílias com renda per capita de até R$ 218/mês. É necessário estar inscrito no CadÚnico. Prioridade para famílias com crianças, gestantes e pessoas com deficiência.',
        query: 'quero saber se tenho direito ao Bolsa Família',
      },
      {
        q: 'O que é o BPC e quem pode receber?',
        a: 'O BPC paga 1 salário mínimo a idosos com 65+ anos ou pessoas com deficiência com renda familiar per capita abaixo de 1/4 do salário mínimo.',
        query: 'tenho deficiência e quero saber sobre o BPC',
      },
      {
        q: 'Como conseguir cesta básica emergencial?',
        a: 'Procure o CRAS da sua região com RG, CPF e comprovante de residência. A assistência emergencial é avaliada pela equipe de assistência social no mesmo dia.',
        query: 'preciso de cesta básica emergencial',
      },
    ],
  },
]

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 48)
}

function FAQItem({
  q,
  a,
  query,
  onQuery,
}: {
  q: string
  a: string
  query: string
  onQuery: (q: string) => void
}) {
  const [open, setOpen] = useState(false)
  const baseId = useId()
  const panelId = `${baseId}-${slugify(q)}-panel`
  const buttonId = `${baseId}-${slugify(q)}-button`

  return (
    <div className="border-b border-gdf-border">
      <h4 className="m-0 text-inherit font-inherit">
        <button
          id={buttonId}
          type="button"
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 py-3 text-left text-sm font-medium text-gray-800 hover:text-gov-blue transition-colors rounded-md"
          aria-expanded={open}
          aria-controls={panelId}
        >
          {q}
          <ChevronDown
            size={14}
            className={`flex-shrink-0 text-gray-500 transition-transform ${open ? 'rotate-180 text-gov-blue' : ''}`}
            aria-hidden
          />
        </button>
      </h4>
      <section
        id={panelId}
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-3 text-sm text-gray-600 leading-relaxed"
      >
        {a}
        <br />
        <button
          type="button"
          onClick={() => onQuery(query)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gov-blue mt-2 hover:underline rounded-md"
        >
          <MessageCircle size={11} aria-hidden /> Perguntar ao Guia Cidadão
        </button>
      </section>
    </div>
  )
}

interface Props {
  onQuery: (q: string) => void
}

export default function FAQ({ onQuery }: Props) {
  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-14" aria-labelledby="faq-heading">
      <div className="mb-7">
        <h2 id="faq-heading" className="text-xl font-extrabold text-gray-900 tracking-tight">
          Dúvidas frequentes
        </h2>
        <p className="text-sm text-gray-600 mt-1">Expanda cada pergunta ou envie sua dúvida ao Guia Cidadão</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {FAQ_DATA.map(col => (
          <div key={col.title}>
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3 pb-3 border-b-2 border-gov-blue-light m-0">
              <col.icon size={14} className="text-gov-blue" aria-hidden />
              {col.title}
            </h3>
            {col.items.map(item => (
              <FAQItem key={item.q} {...item} onQuery={onQuery} />
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}
