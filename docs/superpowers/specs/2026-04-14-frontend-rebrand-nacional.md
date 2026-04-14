# Spec: Rebrand Frontend — Guia Cidadão Nacional (gov.br)

**Data:** 2026-04-14  
**Status:** Aprovado

---

## Objetivo

Atualizar o frontend do Guia Cidadão para:
1. Substituir identidade GDF/verde por identidade gov.br/azul federal
2. Expandir escopo de "Distrito Federal" para "Brasil todo"
3. Adicionar tabs de audiência (Sou cidadão / Sou servidor / Sou empresa / Sou turista / Agendamento)
4. Atualizar conteúdo e links para serviços federais

O searchbar, chat AI, StatusDashboard e FAQ não mudam estruturalmente.

---

## 1. Sistema de Cores

Todos os tokens `verde*` do Tailwind são substituídos por tokens `gov-blue*`.

| Token antigo | Token novo | Valor hex |
|---|---|---|
| `verde` | `gov-blue` | `#1351B4` |
| `verde-med` | `gov-blue-dark` | `#0C326F` |
| `verde-light` | `gov-blue-light` | `#DBE8FB` |
| `verde-dim` | `gov-blue-dim` | `#EEF4FD` |
| `gdf-dark` | sem mudança (já `#071D41`) | `#071D41` |

Cores mantidas com semântica própria:
- `gov-green: #168821` — badges "Gratuito", status OK
- `ouro / #ED8F24` — tab Agendamento (intencionalmente diferente, vem do layout.md)
- `#FFCD07` — badge "NOVO" gov.br gold (novo uso)

O outline de foco em `index.css` muda de `#006633` → `#1351B4`.

---

## 2. Identidade e Textos

### IdentityBar
- `"Governo do Distrito Federal"` → `"Governo Federal · GOV.BR"`
- Subtítulo: `"Portal Oficial de Serviços ao Cidadão"` (sem mudança)

### Hero
- Subtítulo: `"Serviços federais, documentos e agendamentos — para todos os brasileiros"`
- Status pill: `"Assistente nacional · linguagem natural e voz"`
- `document.title` em `App.tsx`: `'Guia Cidadão — GOV.BR'` e `'Conversa — Guia Cidadão · GOV.BR'`

### AlertBar
Novos avisos nacionais (substituem IPTU e avisos do DF):
- IR 2026: Prazo final para declaração: 30 de maio
- Carteira de Trabalho Digital: nova versão disponível no gov.br
- Nota Fiscal ao Consumidor: consulte seu CPF na nota

### Footer
- Badge: `"Portal oficial · gov.br"` (era `gov.df.br`)
- Copyright: `"© 2026 República Federativa do Brasil · gov.br · Todos os direitos reservados"`
- CNPJ removido (era CNPJ GDF)

---

## 3. Componente AudienceTabs (novo)

**Arquivo:** `src/components/AudienceTabs.tsx`

**Props:**
```tsx
interface Props {
  active: AudienceTab
  onChange: (tab: AudienceTab) => void
}

type AudienceTab = 'cidadao' | 'servidor' | 'empresa' | 'turista' | 'agendamento'
```

**Visual:**
- Container: flex row, gap-2, justify-center, py-6, bg-white
- Tab inativa: `bg-gov-blue-dim text-gray-600 rounded-2xl px-4 py-2 text-sm`
- Tab ativa: `bg-white border border-gov-blue text-gov-blue rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm`
- Tab "Agendamento": cor `#ED8F24`, borda `#ED8F24` (independente de ativo/inativo)

**Posição no layout:** Entre `Hero` e `FeaturedServices`, visível apenas quando `!chatStarted && !showAllServices && !showHospitals`.

**Estado:** `audienceTab` vive em `App.tsx` como `useState<AudienceTab>('cidadao')`. Reset para `'cidadao'` no `handleHomeClick`.

---

## 4. FeaturedServices — Filtro por Audiência

`FeaturedServices` recebe nova prop `audience: AudienceTab` e renderiza apenas os cards da audiência ativa.

Os dados em `src/data/services.ts` passam de array flat para objeto:

```ts
export const SERVICES_BY_AUDIENCE: Record<AudienceTab, ServiceCard[]> = {
  cidadao: [...],   // 8 cards
  servidor: [...],  // 5 cards
  empresa: [...],   // 5 cards
  turista: [...],   // 5 cards
  agendamento: [...], // 5 cards (deep links para agendamento)
}
```

### Cards por audiência

**cidadao** (mantém os existentes, remove "do DF"):
- Saúde SUS (era "do DF" → "UBSs, UPAs e policlínicas do SUS")
- CNH e DETRAN (mantém)
- Documento de Identidade / CIN (mantém)
- INSS / Previdência (mantém)
- Bolsa Família e Benefícios (mantém)
- Trabalho e Emprego (mantém)
- Direitos da Mulher (mantém)
- **NOVO:** Passaporte Brasileiro
- **NOVO:** e-Título / Título de Eleitor

**servidor:**
- Contracheque (SIGEPE)
- Férias e Afastamento (SIGEPE)
- SIAPE — Dados Funcionais
- Concursos Públicos Federais
- Portal da Transparência

**empresa:**
- Abertura de MEI / CNPJ
- eSocial
- Nota Fiscal Eletrônica (NF-e)
- Licitações e Compras Gov (ComprasNet)
- INSS Empresarial / DARF

**turista:**
- Passaporte Brasileiro
- Visto de entrada (para estrangeiros)
- Câmbio — Banco Central
- Postos de Saúde / Vacinação de Viagem
- Disque Turismo — 0800 023 1313

**agendamento:**
- Agendamento de Saúde (SUS)
- Agendamento DETRAN
- Agendamento INSS
- Emissão de Passaporte (PF)
- RG / CIN (SESP estadual)

---

## 5. Footer Redesign

4 colunas sobre `bg-gdf-dark` (#071D41):

| Coluna | Conteúdo |
|---|---|
| 1 | Logo + descrição + badge "Portal oficial · gov.br" |
| 2 | **Serviços Federais:** INSS, Receita Federal, DETRAN, Ministério da Saúde, Educação, Trabalho, Previdência |
| 3 | **Atendimento Nacional:** INSS 135, Saúde 136, Violência 180, Trabalho 158, Ouvidoria 162 |
| 4 | **gov.br e Redes Sociais:** links Instagram, Facebook, YouTube, Twitter/X do Gov Federal |

Rodapé inferior: `© 2026 República Federativa do Brasil · gov.br · Todos os direitos reservados`

---

## 6. Arquivos Modificados

| Arquivo | Tipo de mudança |
|---|---|
| `tailwind.config.js` | Tokens `verde*` → `gov-blue*` |
| `src/index.css` | Foco outline, `.chip`, alto contraste tokens |
| `src/data/services.ts` | Objeto por audiência, novos cards, textos nacionais |
| `src/components/AudienceTabs.tsx` | **Arquivo novo** |
| `src/components/IdentityBar.tsx` | Texto GDF → Gov.BR |
| `src/components/AlertBar.tsx` | Avisos nacionais |
| `src/components/Hero.tsx` | Subtítulo + status pill |
| `src/components/FeaturedServices.tsx` | Prop `audience`, filtra por audiência |
| `src/components/Footer.tsx` | 4 colunas federais |
| `src/App.tsx` | Estado `audienceTab`, title, resetar em homeClick |

---

## 7. O que NÃO muda

- Searchbar (Hero input, autocomplete, mic, chips)
- Chat AI e BottomBar
- StatusDashboard (estrutura; textos podem ter ajustes menores)
- FAQ
- AllServices e Hospitals
- Sistema de acessibilidade (IdentityBar toolbar, alto contraste)
- Estrutura de rotas SPA
