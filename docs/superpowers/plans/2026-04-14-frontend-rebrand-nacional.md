# Frontend Rebrand Nacional — Guia Cidadão gov.br

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir identidade GDF/verde por gov.br/azul-federal, adicionar tabs de audiência e expandir conteúdo para o Brasil todo.

**Architecture:** Renomear tokens Tailwind `verde*` → `gov-blue*`, criar `AudienceTabs.tsx`, reestruturar `services.ts` em `SERVICES_BY_AUDIENCE`, passar `audience` como prop para `FeaturedServices`. Estado `audienceTab` fica em `App.tsx`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v3, Vite, Lucide React

---

## Mapa de Arquivos

| Arquivo | Ação |
|---|---|
| `tailwind.config.js` | Modificar — renomear tokens, atualizar valores |
| `src/index.css` | Modificar — renomear classes, hardcoded `#006633` → `#1351B4` |
| `src/types/index.ts` | Modificar — adicionar `AudienceTab` type |
| `src/data/services.ts` | Modificar — flat array → objeto por audiência, novos cards |
| `src/components/AudienceTabs.tsx` | **Criar** |
| `src/components/FeaturedServices.tsx` | Modificar — aceitar prop `audience` |
| `src/components/App.tsx` | Modificar — estado `audienceTab`, title, wiring |
| `src/components/IdentityBar.tsx` | Modificar — texto GDF → Gov.BR |
| `src/components/AlertBar.tsx` | Modificar — avisos nacionais |
| `src/components/Hero.tsx` | Modificar — subtítulo + status pill |
| `src/components/Footer.tsx` | Modificar — 4 colunas federais |

---

## Task 1: Renomear tokens Tailwind

**Files:**
- Modify: `tailwind.config.js`

> Nota: o tailwind.config.js já usa `verde.DEFAULT: '#1351b4'` (azul gov.br). Só precisamos renomear as keys e ajustar 2 valores.

- [ ] **Step 1: Atualizar tailwind.config.js**

Substituir o conteúdo completo do arquivo:

```js
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'gov-blue': {
          DEFAULT: '#1351B4',
          dark: '#0C326F',
          light: '#DBE8FB',
          dim: '#EEF4FD',
        },
        'gov-green': {
          DEFAULT: '#168821',
        },
        ouro: {
          DEFAULT: '#ffcd07',
          bg: '#fff8db',
          border: '#f3d96a',
        },
        gdf: {
          dark: '#071d41',
          border: '#ededed',
          soft: '#f8f8f8',
        },
      },
      fontFamily: {
        sans: ['Rawline', 'Raleway', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
```

- [ ] **Step 2: Verificar build (vai falhar por classes quebradas — esperado)**

```bash
cd /home/sea/hacka_2026 && npm run build 2>&1 | tail -5
```

Esperado: erros de TypeScript (normal — as classes `verde*` ainda existem nos arquivos).

---

## Task 2: Renomear classes `verde*` → `gov-blue*` em todos os arquivos

**Files:**
- Modify: `src/index.css` e todos os `.tsx` que usam `verde`

> A ordem importa: renomear `verde-med` antes de `verde` para não criar `gov-blue-med`.

- [ ] **Step 1: Renomear `verde-med` → `gov-blue-dark` em todos os arquivos src**

```bash
cd /home/sea/hacka_2026 && find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  -exec sed -i 's/verde-med/gov-blue-dark/g' {} +
```

- [ ] **Step 2: Renomear `verde-light` → `gov-blue-light`**

```bash
cd /home/sea/hacka_2026 && find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  -exec sed -i 's/verde-light/gov-blue-light/g' {} +
```

- [ ] **Step 3: Renomear `verde-dim` → `gov-blue-dim`**

```bash
cd /home/sea/hacka_2026 && find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  -exec sed -i 's/verde-dim/gov-blue-dim/g' {} +
```

- [ ] **Step 4: Renomear `verde` restante → `gov-blue` (DEFAULT)**

```bash
cd /home/sea/hacka_2026 && find src -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  -exec sed -i 's/\bverde\b/gov-blue/g' {} +
```

- [ ] **Step 5: Atualizar hardcoded `#006633` → `#1351B4` em index.css**

Em `src/index.css`, localizar e substituir as 3 ocorrências de `#006633`:

```css
/* ANTES — linha ~25 (focus-visible outline) */
outline: 3px solid #006633;

/* DEPOIS */
outline: 3px solid #1351B4;
```

```css
/* ANTES — linha ~43 (skip-to-content bg) */
background-color: #006633;

/* DEPOIS */
background-color: #1351B4;
```

```css
/* ANTES — linha ~52 (skip-to-content:focus outline) */
outline: 3px solid #ff0;  /* esse não muda, já é amarelo para contraste */
```

Use o Edit tool para cada substituição individualmente.

- [ ] **Step 6: Verificar build TypeScript passa**

```bash
cd /home/sea/hacka_2026 && npm run build 2>&1 | tail -10
```

Esperado: build sem erros. Se houver erros de classe Tailwind (não TypeScript), são apenas warnings de purge — ok para continuar.

- [ ] **Step 7: Commit**

```bash
cd /home/sea/hacka_2026 && git add -A && git commit -m "feat: rebrand tokens verde→gov-blue, update hardcoded colors"
```

---

## Task 3: Adicionar `AudienceTab` type e reestruturar `services.ts`

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/data/services.ts`

- [ ] **Step 1: Adicionar `AudienceTab` ao final de `src/types/index.ts`**

```ts
export type AudienceTab = 'cidadao' | 'servidor' | 'empresa' | 'turista' | 'agendamento'
```

- [ ] **Step 2: Substituir conteúdo de `src/data/services.ts`**

Substituir o arquivo inteiro com:

```ts
import type { ServiceCard, StatusCard, AudienceTab } from '../types'

export const SERVICES_BY_AUDIENCE: Record<AudienceTab, ServiceCard[]> = {
  cidadao: [
    {
      icon: 'Stethoscope',
      title: 'Agendamento de Saúde',
      desc: 'Consultas, exames e vacinas nas UBSs, UPAs e policlínicas do SUS. Sem filas, sem complicação.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'MapPin', text: 'Unidades SUS em todo o Brasil' },
      cta: 'Agendar',
      query: 'quero agendar uma consulta médica',
    },
    {
      icon: 'Car',
      title: 'CNH e DETRAN',
      desc: 'Habilitação, licenciamento, multas e transferência de veículos no seu estado.',
      badges: [{ label: 'Online', variant: 'blue' }, { label: 'Presencial', variant: 'ouro' }],
      stat: { icon: 'Building2', text: 'Postos em todos os estados' },
      cta: 'Acessar',
      query: 'quero tirar minha primeira CNH',
    },
    {
      icon: 'IdCard',
      title: 'Documento de Identidade',
      desc: 'Emissão e renovação da carteira de identidade (RG / CIN). Agende sem sair de casa.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Presencial', variant: 'ouro' }],
      stat: { icon: 'Clock', text: 'Agendamento online disponível' },
      cta: 'Agendar',
      query: 'como emitir segunda via do RG?',
    },
    {
      icon: 'ShieldCheck',
      title: 'Previdência Social — INSS',
      desc: 'Aposentadoria, benefício por incapacidade, salário-maternidade e outros serviços do INSS.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'Phone', text: 'Meu INSS · Telefone 135' },
      cta: 'Simular',
      query: 'quero me aposentar pelo INSS',
    },
    {
      icon: 'HandHeart',
      title: 'Bolsa Família e Benefícios',
      desc: 'CadÚnico, Bolsa Família, BPC e mais de 30 programas sociais federais.',
      badges: [{ label: 'Gratuito', variant: 'green' }],
      stat: { icon: 'MapPin', text: 'CRAS mais próximo' },
      cta: 'Cadastrar',
      query: 'como me inscrever no Bolsa Família',
    },
    {
      icon: 'Briefcase',
      title: 'Trabalho e Emprego',
      desc: 'Seguro-desemprego, FGTS, vagas no SINE e Carteira de Trabalho Digital.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'Phone', text: 'Central: 158' },
      cta: 'Solicitar',
      query: 'fui demitido e preciso de ajuda com seguro desemprego',
    },
    {
      icon: 'Heart',
      title: 'Direitos da Mulher',
      desc: 'Lei Maria da Penha, medida protetiva, DEAM, Casa da Mulher Brasileira e saúde da mulher.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: '24h', variant: 'blue' }],
      stat: { icon: 'Phone', text: 'Ligue 180 — 24h' },
      cta: 'Orientar',
      query: 'preciso de ajuda com violência doméstica',
    },
    {
      icon: 'Plane',
      title: 'Passaporte Brasileiro',
      desc: 'Emissão e renovação do passaporte pela Polícia Federal. Agendamento online em todo o Brasil.',
      badges: [{ label: 'Online', variant: 'blue' }, { label: 'Presencial', variant: 'ouro' }],
      stat: { icon: 'Clock', text: 'Prazo: até 6 dias úteis' },
      cta: 'Agendar',
      query: 'como emitir ou renovar passaporte brasileiro',
    },
    {
      icon: 'Vote',
      title: 'e-Título / Título de Eleitor',
      desc: 'Emissão do e-Título, justificativa eleitoral, transferência e regularização junto ao TSE.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'TSE · App e-Título' },
      cta: 'Acessar',
      query: 'como emitir e-título ou regularizar título de eleitor',
    },
  ],

  servidor: [
    {
      icon: 'Wallet',
      title: 'Contracheque — SIGEPE',
      desc: 'Acesse seu contracheque, holerite e comprovantes de rendimento pelo portal SIGEPE.',
      badges: [{ label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'SIGEPE · Servidor Federal' },
      cta: 'Acessar',
      query: 'como acessar meu contracheque pelo SIGEPE',
    },
    {
      icon: 'Calendar',
      title: 'Férias e Afastamentos',
      desc: 'Solicite férias, afastamentos e licenças pelo SIGEPE com aprovação online.',
      badges: [{ label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'Portal do Servidor' },
      cta: 'Solicitar',
      query: 'como solicitar férias pelo SIGEPE',
    },
    {
      icon: 'User',
      title: 'SIAPE — Dados Funcionais',
      desc: 'Consulte sua situação funcional, evolução de carreira e dados cadastrais no SIAPE.',
      badges: [{ label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'SIAPE · Ministério da Gestão' },
      cta: 'Consultar',
      query: 'como consultar dados funcionais no SIAPE',
    },
    {
      icon: 'FileText',
      title: 'Concursos Públicos Federais',
      desc: 'Acompanhe editais, inscrições e resultados de concursos federais pelo gov.br.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'gov.br/concursos' },
      cta: 'Ver editais',
      query: 'quais concursos públicos federais estão abertos',
    },
    {
      icon: 'Search',
      title: 'Portal da Transparência',
      desc: 'Consulte gastos públicos, contratos, licitações e servidores do Governo Federal.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'transparencia.gov.br' },
      cta: 'Consultar',
      query: 'como consultar gastos públicos no portal da transparência',
    },
  ],

  empresa: [
    {
      icon: 'Building2',
      title: 'Abertura de MEI / CNPJ',
      desc: 'Abra seu MEI ou CNPJ gratuitamente pela Receita Federal. Processo 100% online.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'Clock', text: 'Abertura em minutos' },
      cta: 'Abrir empresa',
      query: 'como abrir MEI ou registrar CNPJ',
    },
    {
      icon: 'Users',
      title: 'eSocial',
      desc: 'Gerencie obrigações trabalhistas e previdenciárias dos seus funcionários pelo eSocial.',
      badges: [{ label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'esocial.gov.br' },
      cta: 'Acessar',
      query: 'como usar o eSocial para funcionários',
    },
    {
      icon: 'FileText',
      title: 'Nota Fiscal Eletrônica',
      desc: 'Emissão de NF-e, NFC-e e CT-e. Credenciamento e certificado digital pela SEFAZ.',
      badges: [{ label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'nfe.fazenda.gov.br' },
      cta: 'Emitir NF-e',
      query: 'como emitir nota fiscal eletrônica',
    },
    {
      icon: 'Scale',
      title: 'Licitações — ComprasNet',
      desc: 'Participe de licitações e compras do Governo Federal pelo portal ComprasNet.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'comprasnet.gov.br' },
      cta: 'Ver licitações',
      query: 'como participar de licitações federais',
    },
    {
      icon: 'Receipt',
      title: 'INSS Empresarial / DARF',
      desc: 'Guia de recolhimento do INSS, DARF e obrigações previdenciárias da empresa.',
      badges: [{ label: 'Online', variant: 'blue' }],
      stat: { icon: 'Phone', text: 'Receita Federal · 146' },
      cta: 'Gerar guia',
      query: 'como gerar DARF e pagar INSS da empresa',
    },
  ],

  turista: [
    {
      icon: 'Plane',
      title: 'Passaporte Brasileiro',
      desc: 'Emissão e renovação do passaporte pela Polícia Federal. Agendamento online.',
      badges: [{ label: 'Online', variant: 'blue' }, { label: 'Presencial', variant: 'ouro' }],
      stat: { icon: 'Clock', text: 'Prazo: até 6 dias úteis' },
      cta: 'Agendar',
      query: 'como emitir ou renovar passaporte brasileiro',
    },
    {
      icon: 'Globe',
      title: 'Visto de Entrada',
      desc: 'Informações sobre vistos para estrangeiros visitarem o Brasil e brasileiros no exterior.',
      badges: [{ label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'Itamaraty · MRE' },
      cta: 'Verificar',
      query: 'como solicitar visto para entrar no Brasil',
    },
    {
      icon: 'DollarSign',
      title: 'Câmbio — Banco Central',
      desc: 'Consulte cotações, compre câmbio e veja regulamentações do Banco Central do Brasil.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'Building2', text: 'bcb.gov.br' },
      cta: 'Consultar',
      query: 'qual a cotação do dólar e euro hoje',
    },
    {
      icon: 'Stethoscope',
      title: 'Vacinação para Viagem',
      desc: 'Vacinas obrigatórias e recomendadas para viajar. Postos de vacinação internacional.',
      badges: [{ label: 'Gratuito', variant: 'green' }],
      stat: { icon: 'Building2', text: 'ANVISA · Ministério da Saúde' },
      cta: 'Verificar',
      query: 'quais vacinas preciso para viajar ao exterior',
    },
    {
      icon: 'Phone',
      title: 'Disque Turismo',
      desc: 'Central de atendimento ao turista: informações, denúncias e emergências turísticas.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: '24h', variant: 'blue' }],
      stat: { icon: 'Phone', text: '0800 023 1313' },
      cta: 'Ligar',
      query: 'como entrar em contato com o disque turismo',
    },
  ],

  agendamento: [
    {
      icon: 'Stethoscope',
      title: 'Agendamento SUS',
      desc: 'Agende consultas, exames e vacinas nas unidades de saúde do SUS perto de você.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'MapPin', text: 'Unidades em todo o Brasil' },
      cta: 'Agendar agora',
      query: 'quero agendar uma consulta médica',
    },
    {
      icon: 'Car',
      title: 'Agendamento DETRAN',
      desc: 'Agende vistorias, provas, emissão de CNH e outros serviços no DETRAN do seu estado.',
      badges: [{ label: 'Online', variant: 'blue' }, { label: 'Presencial', variant: 'ouro' }],
      stat: { icon: 'Building2', text: 'DETRAN estadual' },
      cta: 'Agendar',
      query: 'quero agendar no DETRAN',
    },
    {
      icon: 'ShieldCheck',
      title: 'Agendamento INSS',
      desc: 'Agende atendimento presencial nas agências do INSS para aposentadoria, BPC e outros.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Online', variant: 'blue' }],
      stat: { icon: 'Phone', text: 'INSS · 135' },
      cta: 'Agendar',
      query: 'quero agendar atendimento no INSS',
    },
    {
      icon: 'Plane',
      title: 'Passaporte — Polícia Federal',
      desc: 'Agende a emissão ou renovação do passaporte nos postos da Polícia Federal.',
      badges: [{ label: 'Online', variant: 'blue' }, { label: 'Presencial', variant: 'ouro' }],
      stat: { icon: 'Clock', text: 'Prazo: até 6 dias úteis' },
      cta: 'Agendar',
      query: 'como agendar passaporte na polícia federal',
    },
    {
      icon: 'IdCard',
      title: 'RG / CIN — Identidade',
      desc: 'Agende a emissão da nova Carteira de Identidade Nacional (CIN) no instituto de identificação do seu estado.',
      badges: [{ label: 'Gratuito', variant: 'green' }, { label: 'Presencial', variant: 'ouro' }],
      stat: { icon: 'Clock', text: 'Agendamento online' },
      cta: 'Agendar',
      query: 'como agendar emissão do RG ou CIN',
    },
  ],
}

// Compatibilidade retroativa para AllServices e outros componentes
export const FEATURED_SERVICES: ServiceCard[] = SERVICES_BY_AUDIENCE.cidadao

export const STATUS_CARDS: StatusCard[] = [
  {
    icon: 'HeartPulse',
    iconBg: 'rgba(239,68,68,.12)',
    iconColor: '#F87171',
    label: 'Fila — UPAs Brasil',
    pill: { text: 'Espera moderada', variant: 'yellow' },
    value: '47 min',
    detail: 'Média nacional · Dado estimado via Ministério da Saúde',
  },
  {
    icon: 'Droplets',
    iconBg: 'rgba(34,197,94,.12)',
    iconColor: '#4ADE80',
    label: 'Abastecimento de Água',
    pill: { text: 'Normal', variant: 'green' },
    value: '98%',
    detail: 'Cobertura nacional de saneamento básico · SNIS 2025',
  },
  {
    icon: 'Wind',
    iconBg: 'rgba(234,179,8,.12)',
    iconColor: '#FDE047',
    label: 'Qualidade do Ar',
    pill: { text: 'Boa', variant: 'green' },
    value: 'IQA 42',
    detail: 'Média das capitais · IBAMA · Atualizado às 09:00',
  },
  {
    icon: 'Construction',
    iconBg: 'rgba(59,130,246,.12)',
    iconColor: '#60A5FA',
    label: 'Obras Federais',
    pill: { text: '3 alertas', variant: 'yellow' },
    value: 'BR-101',
    detail: 'Interdições em BR-101, BR-116 e BR-040. Consulte DNIT.',
  },
]

export const SUGGESTIONS = [
  { icon: 'TrendingUp', label: 'Segunda via do RG', query: 'como emitir segunda via do RG?' },
  { icon: 'TrendingUp', label: 'Agendamento de consulta', query: 'quero agendar uma consulta médica' },
  { icon: 'TrendingUp', label: 'Seguro-desemprego', query: 'como solicitar seguro desemprego' },
  { icon: 'Car', label: 'Tirar primeira CNH', query: 'quero tirar minha primeira CNH' },
  { icon: 'HandHeart', label: 'Inscrição no Bolsa Família', query: 'como me inscrever no Bolsa Família' },
  { icon: 'ShieldCheck', label: 'Aposentadoria pelo INSS', query: 'quero me aposentar pelo INSS' },
  { icon: 'Heart', label: 'Maria da Penha', query: 'como solicitar medida protetiva pela Lei Maria da Penha' },
  { icon: 'Plane', label: 'Passaporte Brasileiro', query: 'como emitir ou renovar passaporte brasileiro' },
  { icon: 'Vote', label: 'e-Título / Eleitor', query: 'como emitir e-título ou regularizar título de eleitor' },
  { icon: 'Scale', label: 'Certidão TCU', query: 'como consultar certidão negativa do TCU' },
]

export const CHIPS = [
  { icon: 'HeartPulse', label: 'Saúde', query: 'preciso de atendimento médico urgente' },
  { icon: 'Briefcase', label: 'Trabalho', query: 'fui demitido e preciso saber o que fazer' },
  { icon: 'ShieldCheck', label: 'Previdência', query: 'quero me aposentar pelo INSS' },
  { icon: 'Users', label: 'Família', query: 'sou mãe solo e preciso de auxílio' },
  { icon: 'Accessibility', label: 'PCD', query: 'tenho deficiência e quero saber meus direitos' },
  { icon: 'Car', label: 'CNH', query: 'quero tirar minha primeira CNH' },
  { icon: 'IdCard', label: 'RG / CIN', query: 'como emitir segunda via do RG?' },
  { icon: 'Heart', label: 'Mulher', query: 'preciso de ajuda com violência doméstica' },
  { icon: 'Plane', label: 'Passaporte', query: 'como emitir ou renovar passaporte brasileiro' },
]
```

- [ ] **Step 3: Verificar TypeScript compila sem erros**

```bash
cd /home/sea/hacka_2026 && npx tsc --noEmit 2>&1 | head -20
```

Esperado: sem erros. Se houver erro de `Vote` ou `Plane` icon não encontrado no Lucide, são usados via `getIcon()` em utils — OK.

- [ ] **Step 4: Commit**

```bash
cd /home/sea/hacka_2026 && git add src/types/index.ts src/data/services.ts && git commit -m "feat: restructure services data by audience, add national cards"
```

---

## Task 4: Criar componente `AudienceTabs`

**Files:**
- Create: `src/components/AudienceTabs.tsx`

- [ ] **Step 1: Criar o arquivo**

```tsx
import type { AudienceTab } from '../types'

interface Props {
  active: AudienceTab
  onChange: (tab: AudienceTab) => void
}

const TABS: { id: AudienceTab; label: string }[] = [
  { id: 'cidadao', label: 'Sou cidadão' },
  { id: 'servidor', label: 'Sou servidor' },
  { id: 'empresa', label: 'Sou empresa' },
  { id: 'turista', label: 'Sou turista' },
  { id: 'agendamento', label: 'Agendamento' },
]

export default function AudienceTabs({ active, onChange }: Props) {
  return (
    <div className="bg-white border-b border-gdf-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-4">
        <nav
          className="flex flex-wrap gap-2 justify-center"
          aria-label="Filtrar serviços por perfil"
        >
          {TABS.map(tab => {
            const isAgendamento = tab.id === 'agendamento'
            const isActive = active === tab.id

            const base = 'text-sm px-4 py-2 rounded-2xl transition-all duration-150 font-medium cursor-pointer border'

            const style = isAgendamento
              ? isActive
                ? 'bg-white text-[#ED8F24] border-[#ED8F24] font-semibold shadow-sm'
                : 'bg-[#FFF8F0] text-[#ED8F24] border-[#ED8F24]/40 hover:border-[#ED8F24]'
              : isActive
                ? 'bg-white text-gov-blue border-gov-blue font-semibold shadow-sm'
                : 'bg-gov-blue-dim text-gray-600 border-transparent hover:border-gov-blue/30 hover:text-gov-blue'

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                aria-pressed={isActive}
                aria-label={`Ver serviços para: ${tab.label}`}
                className={`${base} ${style}`}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /home/sea/hacka_2026 && npx tsc --noEmit 2>&1 | head -10
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
cd /home/sea/hacka_2026 && git add src/components/AudienceTabs.tsx && git commit -m "feat: add AudienceTabs component"
```

---

## Task 5: Atualizar `FeaturedServices` para filtrar por audiência

**Files:**
- Modify: `src/components/FeaturedServices.tsx`

- [ ] **Step 1: Substituir o conteúdo de `FeaturedServices.tsx`**

```tsx
import { ArrowRight } from 'lucide-react'
import { getIcon } from '../utils/icon'
import { SERVICES_BY_AUDIENCE } from '../data/services'
import type { AudienceTab } from '../types'

const BADGE_STYLES = {
  green: 'bg-gov-blue-light text-gov-blue',
  blue: 'bg-blue-50 text-blue-700',
  ouro: 'bg-ouro-bg text-yellow-800 border border-ouro-border',
}

const AUDIENCE_LABELS: Record<AudienceTab, string> = {
  cidadao: 'Serviços em destaque',
  servidor: 'Para servidores públicos',
  empresa: 'Para empresas e MEI',
  turista: 'Para turistas',
  agendamento: 'Agendamentos disponíveis',
}

const AUDIENCE_DESCS: Record<AudienceTab, string> = {
  cidadao: 'Os serviços mais acessados pelos brasileiros',
  servidor: 'Portais e sistemas do servidor federal',
  empresa: 'Obrigações, abertura e gestão empresarial',
  turista: 'Documentos, câmbio e informações para viagem',
  agendamento: 'Agende serviços públicos federais e estaduais',
}

interface Props {
  audience: AudienceTab
  onServiceClick: (query: string) => void
}

export default function FeaturedServices({ audience, onServiceClick }: Props) {
  const services = SERVICES_BY_AUDIENCE[audience]

  return (
    <section className="max-w-6xl mx-auto px-6 md:px-10 py-14" aria-labelledby="featured-services-heading">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 id="featured-services-heading" className="text-xl font-extrabold text-gray-900 tracking-tight">
            {AUDIENCE_LABELS[audience]}
          </h2>
          <p className="text-sm text-gray-600 mt-1">{AUDIENCE_DESCS[audience]}</p>
        </div>
        <a
          href="https://www.gov.br/pt-br/servicos"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gov-blue hover:underline whitespace-nowrap"
        >
          Ver todos <ArrowRight size={13} aria-hidden />
          <span className="sr-only"> (abre em nova aba no gov.br)</span>
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map(s => {
          const Icon = getIcon(s.icon)
          const StatIcon = getIcon(s.stat.icon)
          const label = `${s.title}. ${s.desc}. ${s.stat.text}. Ação: ${s.cta}.`
          return (
            <button
              key={s.title}
              type="button"
              onClick={() => onServiceClick(s.query)}
              aria-label={`Abrir no assistente: ${label}`}
              className="bg-white border border-gdf-border rounded-2xl p-5 text-left hover:shadow-md hover:border-gov-blue-light hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <div className="flex items-start justify-between mb-3.5">
                <div className="w-10 h-10 rounded-xl bg-gov-blue-light text-gov-blue flex items-center justify-center" aria-hidden>
                  {Icon && <Icon size={20} />}
                </div>
                <div className="flex gap-1.5 flex-wrap justify-end">
                  {s.badges.map(b => (
                    <span
                      key={b.label}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE_STYLES[b.variant]}`}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="font-bold text-sm text-gray-900 mb-1.5 leading-snug">{s.title}</div>
              <div className="text-xs text-gray-600 leading-relaxed flex-1">{s.desc}</div>
              <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-gdf-border">
                <span className="flex items-center gap-1 text-xs text-gray-600">
                  {StatIcon && <StatIcon size={12} aria-hidden />}
                  {s.stat.text}
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-gov-blue">
                  {s.cta} <ArrowRight size={12} aria-hidden />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verificar TypeScript**

```bash
cd /home/sea/hacka_2026 && npx tsc --noEmit 2>&1 | head -10
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
cd /home/sea/hacka_2026 && git add src/components/FeaturedServices.tsx && git commit -m "feat: FeaturedServices filters by audience tab"
```

---

## Task 6: Atualizar `App.tsx` — estado `audienceTab` e wiring

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Adicionar import e estado ao App.tsx**

Adicionar na linha dos imports:
```tsx
import AudienceTabs from './components/AudienceTabs'
import type { AudienceTab } from './types'
```

Adicionar dentro de `export default function App()`, junto com os outros estados:
```tsx
const [audienceTab, setAudienceTab] = useState<AudienceTab>('cidadao')
```

- [ ] **Step 2: Resetar `audienceTab` no `handleHomeClick`**

Localizar:
```tsx
const handleHomeClick = () => {
  setChatStarted(false)
  setShowAllServices(false)
  setShowHospitals(false)
}
```

Substituir por:
```tsx
const handleHomeClick = () => {
  setChatStarted(false)
  setShowAllServices(false)
  setShowHospitals(false)
  setAudienceTab('cidadao')
}
```

- [ ] **Step 3: Atualizar `document.title`**

Localizar:
```tsx
document.title = chatStarted ? 'Conversa — Guia Cidadão · GDF' : 'Guia Cidadão — GDF'
```

Substituir por:
```tsx
document.title = chatStarted ? 'Conversa — Guia Cidadão · GOV.BR' : 'Guia Cidadão — GOV.BR'
```

- [ ] **Step 4: Inserir `AudienceTabs` e passar `audience` para `FeaturedServices`**

Localizar no JSX:
```tsx
{!showAllServices && !showHospitals && (
  <Hero compact={chatStarted} onSend={send} />
)}
```

Substituir por:
```tsx
{!showAllServices && !showHospitals && (
  <>
    <Hero compact={chatStarted} onSend={send} />
    {!chatStarted && (
      <AudienceTabs active={audienceTab} onChange={setAudienceTab} />
    )}
  </>
)}
```

Localizar:
```tsx
<FeaturedServices onServiceClick={send} />
```

Substituir por:
```tsx
<FeaturedServices audience={audienceTab} onServiceClick={send} />
```

- [ ] **Step 5: Verificar TypeScript e build**

```bash
cd /home/sea/hacka_2026 && npx tsc --noEmit 2>&1 | head -10
```

Esperado: sem erros.

- [ ] **Step 6: Commit**

```bash
cd /home/sea/hacka_2026 && git add src/App.tsx && git commit -m "feat: wire audienceTab state to AudienceTabs and FeaturedServices"
```

---

## Task 7: Atualizar textos de identidade (IdentityBar, AlertBar, Hero)

**Files:**
- Modify: `src/components/IdentityBar.tsx`
- Modify: `src/components/AlertBar.tsx`
- Modify: `src/components/Hero.tsx`

- [ ] **Step 1: IdentityBar — trocar "Governo do Distrito Federal" por "Governo Federal · GOV.BR"**

Em `src/components/IdentityBar.tsx`, localizar:
```tsx
<span className="hidden sm:inline">Governo do Distrito Federal</span>
<span className="sm:hidden">GDF</span>
```

Substituir por:
```tsx
<span className="hidden sm:inline">Governo Federal · GOV.BR</span>
<span className="sm:hidden">GOV.BR</span>
```

- [ ] **Step 2: AlertBar — avisos nacionais**

Substituir o conteúdo dos 3 spans de aviso em `src/components/AlertBar.tsx`:

```tsx
<span className="flex items-center gap-1.5 text-yellow-800 whitespace-nowrap">
  <Megaphone size={13} className="text-ouro-DEFAULT flex-shrink-0" aria-hidden />
  <strong>IR 2026:</strong> Prazo final para declaração: 30 de maio.
</span>
<span className="text-ouro-border hidden md:block" aria-hidden>
  ·
</span>
<span className="hidden md:flex items-center gap-1.5 text-yellow-800 whitespace-nowrap">
  <Calendar size={13} className="text-ouro-DEFAULT flex-shrink-0" aria-hidden />
  <strong>CTPS Digital:</strong> Nova versão disponível no gov.br.
</span>
<span className="text-ouro-border hidden lg:block" aria-hidden>
  ·
</span>
<span className="hidden lg:flex items-center gap-1.5 text-yellow-800 whitespace-nowrap">
  <Info size={13} className="text-ouro-DEFAULT flex-shrink-0" aria-hidden />
  Novo: CPF na Nota — consulte seus benefícios fiscais.
</span>
```

- [ ] **Step 3: Hero — subtítulo e status pill**

Em `src/components/Hero.tsx`, localizar:
```tsx
Serviços do GDF, documentos e agendamentos — em linguagem simples, sem burocracia.
```

Substituir por:
```tsx
Serviços federais, documentos e agendamentos — para todos os brasileiros, sem burocracia.
```

Localizar:
```tsx
<span>Piloto no DF · linguagem natural e voz</span>
```

Substituir por:
```tsx
<span>Assistente nacional · linguagem natural e voz</span>
```

- [ ] **Step 4: Verificar build**

```bash
cd /home/sea/hacka_2026 && npm run build 2>&1 | tail -5
```

Esperado: `built in Xs` sem erros.

- [ ] **Step 5: Commit**

```bash
cd /home/sea/hacka_2026 && git add src/components/IdentityBar.tsx src/components/AlertBar.tsx src/components/Hero.tsx && git commit -m "feat: update identity texts to national gov.br scope"
```

---

## Task 8: Footer — 4 colunas federais

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Substituir Footer.tsx**

```tsx
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
```

- [ ] **Step 2: Verificar build final**

```bash
cd /home/sea/hacka_2026 && npm run build 2>&1 | tail -5
```

Esperado: `built in Xs` sem erros ou warnings críticos.

- [ ] **Step 3: Testar visualmente no dev server**

```bash
cd /home/sea/hacka_2026 && npm run dev
```

Verificar no navegador:
- [ ] Nav azul gov.br, sem referências a GDF
- [ ] Hero com novo subtítulo nacional
- [ ] Tabs de audiência aparecem abaixo do hero (5 tabs, Agendamento em laranja)
- [ ] Trocar tabs muda os cards
- [ ] Footer com 4 colunas e redes sociais
- [ ] Alto contraste continua funcionando (toggle na IdentityBar)

- [ ] **Step 4: Commit final**

```bash
cd /home/sea/hacka_2026 && git add src/components/Footer.tsx && git commit -m "feat: footer 4-column federal layout with social links"
```

---

## Self-Review

**Spec coverage:**
- ✅ Sistema de cores `verde*` → `gov-blue*` — Task 1 + 2
- ✅ `IdentityBar` texto GDF → Gov.BR — Task 7
- ✅ `AlertBar` avisos nacionais — Task 7
- ✅ `Hero` subtítulo + status pill — Task 7
- ✅ `Footer` badge `gov.br`, copyright sem CNPJ GDF — Task 8
- ✅ `AudienceTabs` componente novo — Task 4
- ✅ `SERVICES_BY_AUDIENCE` todos os 5 grupos — Task 3
- ✅ `FeaturedServices` prop `audience` — Task 5
- ✅ `App.tsx` estado + reset + wiring — Task 6
- ✅ `document.title` atualizado — Task 6
- ✅ Retro-compat `FEATURED_SERVICES` para AllServices — Task 3

**Sem placeholders:** verificado.

**Consistência de tipos:** `AudienceTab` definido em `types/index.ts` (Task 3 Step 1), usado em `AudienceTabs.tsx` (Task 4), `FeaturedServices.tsx` (Task 5), `App.tsx` (Task 6). Consistente.
