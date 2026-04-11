import type { AIResponse } from '../types'
<<<<<<< HEAD
=======
import {
  LOCATIONS_IDENTIDADE,
  LOCATIONS_CNH,
  LOCATIONS_TRABALHO,
  LOCATIONS_SOCIAL,
  LOCATIONS_PREVIDENCIA,
} from './locations'
>>>>>>> origin/main

export const DB: AIResponse[] = [
  {
    keys: ['demiti', 'seguro desemprego', 'fui mandado', 'dispensad', 'demissão', 'seguro-desemprego'],
    tag: { cls: 'tag-work', icon: 'Briefcase', txt: 'Trabalho & Renda' },
    intro: 'Você pode solicitar o <strong>Seguro-Desemprego</strong>, que garante renda enquanto você busca um novo emprego.',
    blocks: [
      { icon: 'MapPin', title: 'Onde solicitar', body: 'Agências do <strong>SINE-DF</strong> ou pelo portal <a href="#" class="text-verde font-semibold hover:underline">gov.br/seguro-desemprego</a>' },
      { icon: 'FileText', title: 'Documentos necessários', docs: ['RG ou CNH', 'CPF', 'Carteira de Trabalho', 'Termo de rescisão (TRCT)', 'Extrato FGTS'] },
    ],
    steps: [
      'Acesse gov.br/seguro-desemprego ou vá a uma agência SINE',
      'Solicite em até <strong>120 dias</strong> após a data de demissão',
      'Acompanhe o status pelo app SINE Fácil ou ligue 158',
    ],
    tip: 'Você também pode ter direito ao saque do FGTS. Quer que eu explique como funciona?',
    contact: { title: 'SINE-DF — Agência Central', addr: 'SEPN 510, Bloco A — Asa Norte, Brasília/DF', phone: '(61) 3362-1600', hours: 'Seg–Sex, 7h30–17h30' },
<<<<<<< HEAD
=======
    locations: LOCATIONS_TRABALHO,
>>>>>>> origin/main
    related: ['Como funciona o saque do FGTS?', 'Onde encontrar vagas de emprego no DF?', 'Quais são meus direitos na demissão?'],
  },
  {
    keys: ['passando mal', 'doente', 'médico', 'atendimento médico', 'consulta', 'remédio', 'ubs', 'upa', 'dor', 'agendar consulta', 'saúde'],
    tag: { cls: 'tag-health', icon: 'HeartPulse', txt: 'Saúde' },
    intro: 'Para atendimento de saúde, o caminho depende da urgência. Vou te orientar para o lugar certo.',
    blocks: [
      { icon: 'MapPin', title: 'Casos comuns — sem urgência', body: 'Procure a <strong>UBS (Unidade Básica de Saúde)</strong> do seu bairro. Gratuita, resolve a maioria dos casos.' },
      { icon: 'AlertCircle', title: 'Emergências e urgências', body: 'Vá à <strong>UPA</strong> mais próxima ou ligue <strong>192 (SAMU)</strong> — gratuito, 24 horas.' },
    ],
    steps: [
      'Para consultas: vá à UBS mais próxima com seu cartão SUS',
      'Sem cartão SUS? Leve RG e CPF — emitem na hora, gratuitamente',
      'Para agendar online: acesse o portal <a href="#" class="text-verde font-semibold hover:underline">saude.df.gov.br</a>',
    ],
    tip: 'Evite ir ao hospital para casos simples — a espera na UBS é bem menor e você é atendido por médico de família.',
    contact: { title: 'Saúde DF — Central de Regulação', addr: 'Ligue 160 para UBS mais próxima ou 192 (SAMU)', phone: '160 (regulação) · 192 (SAMU)', hours: '24 horas, 7 dias por semana' },
    related: ['Como tirar o cartão SUS?', 'Quais vacinas estão disponíveis no DF?', 'Como acessar saúde mental pelo SUS?'],
  },
  {
    keys: ['aposentar', 'aposentadoria', 'previdência', 'inss', 'me aposentar'],
    tag: { cls: 'tag-work', icon: 'ShieldCheck', txt: 'Previdência Social' },
    intro: 'A aposentadoria pelo <strong>INSS</strong> pode ser solicitada 100% online, sem precisar ir a uma agência.',
    blocks: [
      { icon: 'Globe', title: 'Como solicitar', body: 'Portal <a href="#" class="text-verde font-semibold hover:underline">Meu INSS (gov.br/meu-inss)</a> ou ligue <strong>135</strong> (gratuito, seg–sáb 7h–22h)' },
      { icon: 'FileText', title: 'Documentos básicos', docs: ['RG ou CNH', 'CPF', 'Carteira de Trabalho', 'Comprovante de residência'] },
    ],
    steps: [
      'Acesse <strong>Meu INSS</strong> e crie sua conta gov.br (CPF + celular)',
      'Clique em "Simular aposentadoria" para ver quando e quanto você receberá',
      'Se a simulação for favorável, solicite direto pelo app ou ligue 135',
    ],
    tip: 'A simulação é gratuita e mostra exatamente sua data e valor — sem precisar ir a nenhuma agência.',
    contact: { title: 'INSS — Agência Brasília', addr: 'SEPS 702/902, Conjunto B — Asa Sul, Brasília/DF', phone: '135 (gratuito)', hours: 'Seg–Sex, 7h–22h · Sáb, 7h–14h' },
<<<<<<< HEAD
=======
    locations: LOCATIONS_PREVIDENCIA,
>>>>>>> origin/main
    related: ['O que é o BPC para idosos?', 'Como funciona a aposentadoria por incapacidade?', 'Como verificar meu CNIS?'],
  },
  {
    keys: ['mãe solo', 'mãe solteira', 'auxílio', 'bolsa família', 'família', 'filho', 'benefício social'],
    tag: { cls: 'tag-social', icon: 'Users', txt: 'Benefícios Sociais' },
    intro: 'Existem vários benefícios disponíveis. Vou te mostrar os principais e como acessar cada um.',
    blocks: [
      { icon: 'HandHeart', title: 'Bolsa Família', body: 'Para famílias com renda per capita de até R$ 218/mês. Cadastro gratuito no <strong>CRAS</strong> ou pelo CadÚnico.' },
      { icon: 'Baby', title: 'Salário-maternidade', body: 'Pago pelo INSS para trabalhadoras com carteira assinada, MEI ou contribuinte individual. Duração: 4 meses.' },
    ],
    steps: [
      'Vá ao <strong>CRAS</strong> mais próximo com RG, CPF e comprovante de renda de todos da família',
      'Faça o cadastro no <strong>CadÚnico</strong> — gratuito e abre acesso a mais de 30 programas',
      'Aguarde análise do benefício — prazo médio: 45 dias',
    ],
    tip: 'O CadÚnico é a porta de entrada para dezenas de programas sociais federais e distritais.',
    contact: { title: 'CRAS — Central de Informações', addr: 'Consulte o CRAS mais próximo pelo portal SEDESTMIDH', phone: '(61) 3901-6500', hours: 'Seg–Sex, 8h–17h' },
<<<<<<< HEAD
=======
    locations: LOCATIONS_SOCIAL,
>>>>>>> origin/main
    related: ['Tenho direito ao Auxílio Gás?', 'Como atualizar o CadÚnico?', 'Quais benefícios para mãe solo no DF?'],
  },
  {
    keys: ['deficiência', 'pcd', 'deficiente', 'bpc', 'loas', 'pessoa com deficiência', 'meus direitos'],
    tag: { cls: 'tag-social', icon: 'Accessibility', txt: 'Direitos PCD' },
    intro: 'Pessoa com deficiência tem direitos garantidos por lei. Vou listar os principais e como acessar cada um.',
    blocks: [
      { icon: 'HandCoins', title: 'BPC / LOAS', body: '1 salário mínimo/mês para PCD com renda familiar per capita até 1/4 do salário mínimo. Solicite no <strong>INSS</strong> ou <strong>CRAS</strong>.' },
      { icon: 'ReceiptText', title: 'Isenções fiscais', body: 'Isenção de IPI e IOF na compra de veículos adaptados. Isenção de IPTU e IPVA em muitos casos.' },
    ],
    steps: [
      'Obtenha o laudo médico oficial comprovando a deficiência',
      'Leve o laudo ao INSS (pelo app Meu INSS ou pessoalmente) ou ao CRAS',
      'Busque isenção de IPTU na SEFAZ-DF e no DETRAN-DF',
    ],
    tip: 'Você tem direito a 5% das vagas em concursos públicos e ao saque integral do FGTS a qualquer momento.',
    contact: { title: 'GDF — Central de Atendimento PCD', addr: 'SGAS 613/614, Conjunto D — Asa Sul, Brasília/DF', phone: '(61) 3901-6500', hours: 'Seg–Sex, 8h–17h' },
    related: ['Como solicitar passe livre para PCD?', 'Tenho direito a vaga em concurso público?', 'Como funciona aposentadoria por incapacidade?'],
  },
  {
    keys: ['cnh', 'habilitação', 'carteira de motorista', 'primeira cnh', 'tirar cnh'],
    tag: { cls: 'tag-transit', icon: 'Car', txt: 'DETRAN-DF — Trânsito' },
    intro: 'Para tirar a CNH pela primeira vez, o processo começa em uma auto escola credenciada pelo DETRAN-DF.',
    blocks: [
      { icon: 'MapPin', title: 'Onde começar', body: 'Procure uma <strong>auto escola credenciada</strong> no portal <a href="#" class="text-verde font-semibold hover:underline">detran.df.gov.br</a>.' },
      { icon: 'FileText', title: 'Documentos', docs: ['RG ou CPF original', 'Comprovante de residência', 'Foto 3x4 recente (fundo branco)'] },
    ],
    steps: [
      'Escolha auto escola credenciada no portal DETRAN-DF',
      'Faça os exames médico e psicológico obrigatórios',
      'Estude para a prova teórica — simulados gratuitos no app DETRAN-DF',
      'Faça as 20 aulas práticas mínimas e a prova de direção',
    ],
    tip: 'O custo varia entre R$ 1.200 e R$ 2.000. Muitas auto escolas oferecem parcelamento.',
    contact: { title: 'DETRAN-DF — Atendimento ao Cidadão', addr: 'SEPN 515, Bloco D — Asa Norte, Brasília/DF', phone: '(61) 3901-3400', hours: 'Seg–Sex, 7h30–17h30' },
<<<<<<< HEAD
=======
    locations: LOCATIONS_CNH,
>>>>>>> origin/main
    related: ['Como renovar minha CNH vencida?', 'Como transferir veículo para meu nome?', 'Como consultar multas pelo DETRAN-DF?'],
  },
  {
    keys: ['rg', 'segunda via', 'identidade', 'documento de identidade', 'cin'],
    tag: { cls: 'tag-social', icon: 'IdCard', txt: 'Documentos e Registro' },
    intro: 'Para emitir a segunda via do RG (agora chamado CIN — Carteira de Identidade Nacional), o processo é simples e gratuito.',
    blocks: [
      { icon: 'MapPin', title: 'Onde agendar', body: 'Postos da <strong>SSP-DF</strong> — agende online pelo portal <a href="#" class="text-verde font-semibold hover:underline">portalservicos.ssp.df.gov.br</a>' },
      { icon: 'FileText', title: 'Documentos necessários', docs: ['Certidão de nascimento ou casamento (original)', 'Comprovante de residência', 'Foto 3x4 recente (se solicitado)'] },
    ],
    steps: [
      'Acesse o portal SSP-DF e escolha "Identidade — Agendamento"',
      'Selecione o posto mais próximo e um horário disponível',
      'Compareça no dia com os documentos originais',
      'O documento é entregue na hora ou em até 10 dias úteis',
    ],
    tip: 'A 1ª via e a 2ª via por roubo/furto são gratuitas. Para perda, pode haver taxa simbólica.',
    contact: { title: 'SSP-DF — Instituto de Identificação', addr: 'SEPN 514, Bloco D — Asa Norte, Brasília/DF', phone: '(61) 3449-1400', hours: 'Seg–Sex, 8h–17h' },
<<<<<<< HEAD
=======
    locations: LOCATIONS_IDENTIDADE,
>>>>>>> origin/main
    related: ['Como tirar passaporte em Brasília?', 'Como registrar um boletim de ocorrência?', 'O que é o CIN (nova carteira de identidade)?'],
  },
]

export function matchResponse(text: string): AIResponse | null {
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const r of DB) {
    const hit = r.keys.some(k =>
      t.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    )
    if (hit) return r
  }
  return null
}
