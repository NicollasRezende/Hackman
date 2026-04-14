# 🔍 Reverse Engineering Completo — Portal Cidadão GDF
**URL:** `https://portalcidadao.df.gov.br/#!/`
**Stack:** AngularJS (1.x) + Bootstrap 3 + CSS inline (Low-code/CITSmart platform)

---

## 1. MAPA DO SITE

```
portalcidadao.df.gov.br
├── / (Home — única rota SPA AngularJS)
│
├── Links externos (navegação principal):
│   ├── df.gov.br/category/sobre-df         → Sobre o DF
│   ├── df.gov.br/category/sobre-o-governo  → Sobre o Governo
│   ├── #servicos (âncora interna)           → Serviços
│   ├── agenciabrasilia.df.gov.br           → Notícias
│   ├── transparencia.df.gov.br             → Transparência
│   ├── df.gov.br/fale-com-o-governo/       → Fale Conosco
│   ├── pcdf.df.gov.br/...violencia-domest… → Maria da Penha
│   └── gov.br (SSO login)                  → Entrar com gov.br
│
├── Seções da Home (SPA única página):
│   ├── [Hero Banner Carousel — 3 slides]
│   ├── [Barra de Busca]
│   ├── [Serviços por Audiência — 4 tabs + agendamento]
│   │   ├── Tab: Sou cidadão   → 13 cards de categoria
│   │   ├── Tab: Sou servidor  → links externos (egov, SEI, SICOP, contracheque)
│   │   ├── Tab: Sou empresa   → Simplifica PJ + categorias
│   │   └── Tab: Sou turista   → Guia Turístico + Observatório
│   ├── [Agência Brasília — Carrossel de notícias]
│   ├── [Agenda do Governador — Carrossel diário]
│   ├── [Diário Oficial — Listagem]
│   └── [Footer — 3 colunas]
│
├── Serviços por categoria (Sou cidadão):
│   ├── Administração Regional Digital 24h
│   ├── Saúde
│   ├── Educação
│   ├── Mobilidade
│   ├── Assistência Social
│   ├── Justiça e Direitos Humanos
│   ├── Segurança Pública
│   ├── Atendimento ao Consumidor
│   ├── Receitas e Tributos
│   ├── Ouvidoria GDF
│   ├── Demais Serviços do GDF
│   ├── Habitação
│   └── Família e Juventude
│
└── Serviços externos (Sou servidor):
    ├── egov.df.gov.br
    ├── portalsei.df.gov.br
    ├── df.gov.br/sicop/
    └── gdfnet.df.gov.br (Contracheque)
```

---

## 2. DESIGN SYSTEM ESTRUTURADO

### 2.1 Paleta de Cores

```css
/* PRIMARY — Azul Institucional */
--color-primary:        #0E5AAC  /* rgb(14, 90, 172)   — cards, overlays, botões principais */
--color-primary-dark:   #166AC3  /* rgb(22, 106, 195)  — botão CTA "Entrar com gov.br" */
--color-primary-medium: #337AB7  /* rgb(51, 122, 183)  — links, social icons */
--color-primary-light:  rgba(14, 90, 172, 0.8) /* overlay semi-transparente nos cards */

/* ACCENT / ALERTA */
--color-accent:         #ED8F24  /* rgb(237, 143, 36)  — aba Agendamento (borda + texto) */
--color-yellow:         #FFFF00  /* rgb(255, 255, 0)   — texto de aviso no overlay de login */

/* NEUTROS */
--color-white:          #FFFFFF
--color-bg-light:       #F9F9F9  /* tabs inativas */
--color-bg-muted:       #F4F4F4  /* fundos alternativos */
--color-bg-gray:        #F0F2F5  /* header do dialog/modal */
--color-border:         #EEEEEE  /* borda dos cards de notícia */
--color-text-primary:   #333333  /* rgb(51, 51, 51)  — texto principal */
--color-text-secondary: #555555  /* rgb(85, 85, 85)  — labels, metadados */
--color-text-dark:      #252525  /* rgb(37, 37, 37)  — textos gerais */
--color-text-near-black:#191013  /* rgb(25, 16, 19)  — links do nav */

/* FOOTER */
--color-footer-bg:      #0E5AAC  /* azul institucional escuro */
--color-footer-text:    #FFFFFF

/* SUCCESS / STATUS */
--color-success:        #22C55E  /* rgb(34, 197, 94) — estado de sucesso */
```

### 2.2 Tipografia

```css
/* Font Principal */
font-family: "Gotham Rounded", Arial, sans-serif;

/* Escala de tamanhos */
--font-xs:   10px   /* metadados menores */
--font-sm:   12px   /* labels pequenas */
--font-base: 13px   /* body default */
--font-md:   14px   /* input, card-label, nav secundário */
--font-nav:  15px   /* botões de ação do hero */
--font-btn:  15.5px /* botões do header */
--font-nav-btn: 16px /* botões nav principais */
--font-lg:   18px   /* card-title */
--font-xl:   20px
--font-2xl:  21px
--font-3xl:  22px
--font-4xl:  24px   /* pwa_title_banner */
--font-5xl:  25px
--font-6xl:  28px

/* Pesos */
--fw-regular: 400  /* padrão geral */
--fw-bold:    700  /* .f-bold */

/* Line-height */
body: 18.57px (≈ 1.43)
card-title: 25.71px (≈ 1.43)

/* Icon fonts carregados */
- Glyphicons Halflings (Bootstrap)
- Material Icons (Google)
- Font Awesome 5 Free
- Font Awesome 5 Brands
- Font customizado: .icon-arrow (SVG inline 21×20px), .icom-mic, .icom-search
```

### 2.3 Escala de Espaçamento

```css
/* Base: múltiplos de 4-8px */
--space-1:  4px
--space-2:  8px   /* gap cards .btn-blue */
--space-3:  12px  /* padding cards, btn-secundary */
--space-4:  14px  /* padding tabs */
--space-5:  16px  /* gap card-content, overlay gap */
--space-6:  20px  /* padding hero search, header horizontal */
--space-7:  24px  /* left do btn-servico no card */
--space-8:  32px  /* padding overlay do card */
--space-9:  40px  /* padding footer columns, header padding-x: 30px */
--space-10: 50px  /* gap entre colunas do footer */
```

### 2.4 Bordas, Raios e Sombras

```css
/* Border Radius */
--radius-sm:   6px    /* botões ghost do nav */
--radius-md:   12px   /* btn-secundary (hero) */
--radius-lg:   20px   /* .btn-blue (overlay label), tabs */
--radius-xl:   24px   /* tabs (ativas/inativas) */
--radius-2xl:  34px   /* cards de notícias (.card) */
--radius-pill: 35px   /* input de busca */
--radius-full: 40px   /* botão "Entrar com gov.br", nav pills */
--radius-card: 50px   /* img-servico (card de serviços) + overlay */

/* Sombras */
--shadow-card:  rgba(0,0,0,0.1) 0px 4px 6px 0px    /* card de notícia */
--shadow-modal: rgba(0,0,0,0.1) 0px 4px 12px 0px   /* _dialog */
--shadow-dropdown: rgba(0,0,0,0.176) 0px 6px 12px 0px /* autocomplete */

/* Bordas */
--border-card:    1.25px solid #EEEEEE   /* cards de notícia */
--border-overlay: 1.25px solid #FFFFFF   /* btn-overlay no card de serviço */
--border-tab-special: 1.25px solid #ED8F24 /* aba Agendamento */
```

---

## 3. ESTRUTURA DE LAYOUT (Hierarquia Completa)

```
<body>                                              bg: #FFF
  │
  ├── <.__header> (sticky visual, height: 80px)     bg: #FFF
  │   └── <.__header__container> (flex, row, space-between, px:30px)
  │       ├── [Logo GDF] 110×64px
  │       ├── [☰ Hamburger] display:none em desktop, visible mobile
  │       ├── <.__header__nav> (ul flex row)
  │       │   ├── Sobre o DF      [.__header__btn btn-header-options]
  │       │   ├── Sobre o Governo [.__header__btn btn-header-options]
  │       │   ├── Serviços        [.__header__btn btn-header-options]
  │       │   ├── Notícias        [.__header__btn btn-header-options]
  │       │   ├── Transparência   [.__header__btn btn-header-options]
  │       │   ├── Acompanhe solic.[.__header__btn --outline] → azul ghost
  │       │   ├── Fale Conosco    [.__header__btn btn-header-options]
  │       │   └── Maria da Penha  [.__header__btn btn-header-options]
  │       └── [Entrar com gov.br] [.__header__btn--primary] → azul sólido
  │
  ├── <.carousel.slide> (HERO BANNER, 100vw × 650px)
  │   ├── [3 slides com fotos de Brasília] (carousel Bootstrap)
  │   ├── [Setas prev/next] (carousel-control, opacity:0.5)
  │   └── <.info-search-banner> (position:absolute, centered, w:800px)
  │       ├── <.pwa_title_banner> (h3, 24px white, text-shadow)
  │       ├── <.pwa_subtitle_banner>
  │       ├── <.responsive-search-container> (w:760px, h:50px)
  │       │   └── <.responsive-search-box>
  │       │       ├── <input.responsive-search-input> (pill, h:50px, radius:35px)
  │       │       ├── [.circle-mic] (40×40px circle, bg:#0E5AAC)
  │       │       └── [.custom-circle-icon search] (40×40px circle, bg:#0E5AAC)
  │       └── <.responsive-button-group> (flex, gap:8px)
  │           ├── [Serviços do Governo] .btn-secundary (bg:#0E5AAC, radius:12px)
  │           └── [Está com alguma dúvida?] .btn-secundary (bg:#0E5AAC, radius:12px)
  │
  ├── <#servicos — Seção Serviços> (bg:#FFF, centered)
  │   ├── [ℹ Serviços] — título da seção (ícone azul + texto)
  │   ├── <.tab-nav> (flex row, gap:8px, centered)
  │   │   ├── [Sou cidadão]  .tab.active  (bg:#FFF, color:#0E5AAC, radius:24px)
  │   │   ├── [Sou servidor] .tab        (bg:#F9F9F9, color:#252525, radius:24px)
  │   │   ├── [Sou empresa]  .tab        (bg:#F9F9F9, color:#252525, radius:24px)
  │   │   ├── [Sou turista]  .tab        (bg:#F9F9F9, color:#252525, radius:24px)
  │   │   └── [Agendamento]  .tab        (bg:#F9F9F9, color:#ED8F24, border:#ED8F24, radius:24px)
  │   └── <.tab-content> (flex, wrap, row, gap:16px, justify:center, p:20px)
  │       └── [13× .card-servico | .card-cidadao] (280×200px cada)
  │
  ├── <Seção Notícias — Agência Brasília>
  │   ├── [≡ Agência Brasília] — título da seção
  │   └── [Carrossel horizontal] — cards de notícia (300×300px)
  │       └── [+ Veja todas as notícias] — card especial último
  │
  ├── <Seção Agenda do Governador>
  │   ├── [📅 Agenda do Governador] — título com ícone amarelo
  │   ├── [Badge de data] "ABRIL / 14" — circulo/badge cinza
  │   ├── [Carrossel de eventos] — listagem de atividades do dia
  │   └── [VER TODA AGENDA] — botão CTA azul escuro, radius:40px
  │
  ├── <Seção Diário Oficial>
  │   └── <.container-custom-diario-oficial-page> (flex, column, gap:20px)
  │
  ├── <.cor-footer> (bg:#0E5AAC, color:#FFF)
  │   └── <.custom-secrtion-footer-info-redirect> (flex, row, gap:50px, py:40px)
  │       ├── Coluna 1: Sobre o Governo (11 links)
  │       ├── Coluna 2: Sobre Brasília (7 links)
  │       ├── Coluna 3: Ouvidoria (5 links)
  │       └── Coluna 4: GOVERNO DO DISTRITO FEDERAL (endereço + redes sociais)
  │           └── [Instagram, Facebook, X/Twitter, YouTube]
  │
  └── Widgets flutuantes (position: fixed):
      ├── [VLibras] — acessibilidade Libras, bottom:481px, right:0
      ├── [🤚 Acessibilidade] — botão mão, right:0
      ├── [🦽] — botão acessibilidade visual, right:0
      ├── [Chat GDF] #ab-init-chat — bottom:20px, right:20px
      └── [🌳 Brasília] — ícone da cidade, bottom right (link para site)
```

---

## 4. COMPONENTES UI — CATÁLOGO COMPLETO

### 4.1 Botões

```
┌─────────────────────────────────────────────────────────────────────┐
│ TIPO              │ BG           │ COLOR  │ RADIUS │ PADDING        │
├───────────────────┼──────────────┼────────┼────────┼────────────────┤
│ btn--primary      │ #166AC3      │ #FFF   │ 40px   │ 10px 20px      │
│ (Entrar gov.br)   │              │        │        │ font: 15.5px   │
├───────────────────┼──────────────┼────────┼────────┼────────────────┤
│ btn-header-options│ transparent  │ #191013│ 40px   │ 12px 8px       │
│ (Nav links)       │              │        │        │ font: 16px     │
├───────────────────┼──────────────┼────────┼────────┼────────────────┤
│ btn--outline      │ transparent  │ #0E5AAC│ 6px    │ 12px 8px       │
│ (Acompanhe solic.)│              │        │        │ font: 15.5px   │
├───────────────────┼──────────────┼────────┼────────┼────────────────┤
│ btn-secundary     │ #0E5AAC      │ #FFF   │ 12px   │ 12px           │
│ (Hero CTAs)       │              │        │        │ font: 15px     │
├───────────────────┼──────────────┼────────┼────────┼────────────────┤
│ btn-blue          │ #0E5AAC      │ #FFF   │ 20px   │ 12px gap:8px   │
│ (Overlay do card) │              │        │        │ display:flex   │
├───────────────────┼──────────────┼────────┼────────┼────────────────┤
│ btn-overlay       │ transparent  │ #FFF   │ 50px   │ 10px 20px      │
│ (Login overlay)   │ border: #FFF │        │        │ font: 16px     │
├───────────────────┼──────────────┼────────┼────────┼────────────────┤
│ tab (inativo)     │ #F9F9F9      │ #252525│ 24px   │ 14px           │
│ tab (ativo)       │ #FFFFFF      │ #0E5AAC│ 24px   │ 14px           │
│ tab (agendamento) │ #F9F9F9      │ #ED8F24│ 24px   │ 14px           │
│                   │ border:#ED8F24│       │        │                │
└───────────────────┴──────────────┴────────┴────────┴────────────────┘
```

### 4.2 Input de Busca

```css
/* Container */
.responsive-search-container { width: 760px; height: 50px; }

/* Input */
.responsive-search-input {
  background: #FFF;
  border: none;
  border-radius: 35px;
  padding: 5px 5px 5px 15px;
  font-size: 14px;
  color: #555;
  flex: 1;
  height: 50px;
}

/* Botões de ação (mic + search) */
.circle-mic, .custom-circle-icon {
  width: 40px; height: 40px;
  background: #0E5AAC;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Autocomplete dropdown */
.dropdown-menu {
  background: #F9F9F9;
  border-radius: 4px;
  box-shadow: rgba(0,0,0,0.176) 0px 6px 12px 0px;
  position: absolute;
}
```

### 4.3 Modal de Avaliação (NPS Survey)

```css
._dialog {
  width: 720px;
  background: #FFFFFF;
  border-radius: 18px;
  box-shadow: rgba(0,0,0,0.1) 0px 4px 12px 0px;
}
._dialog__header {
  background: #F0F2F5;
  padding: 14px 16px;
  display: grid;
  align-items: center;
}
._dialog__body {
  padding: [interno];
  display: flex;
  flex-direction: column;
  gap: [entre grupos];
}
._dialog__footer {
  padding: [interno];
  display: flex;
  gap: [entre botões];
  border-top: [separador];
}
```

Componentes internos: rating stars (radio 1–5), selects, textarea, botões "Enviar" e "Não quero responder".

---

## 5. CARDS — ANÁLISE DETALHADA

### Card Tipo 1: Card de Serviço (`.card-servico` / `.card-cidadao`)

```
┌────────────────────────────────────────┐  280 × 200px
│  [IMAGEM DE FUNDO full-cover]          │  border-radius: 50px (!)
│  object-fit: fill                      │  img.img-servico: w:100%, h:100%
│                                        │
│  ┌──────────────────────────┐          │  .btn-blue (absolute, bottom-left)
│  │ NOME DA CATEGORIA    [→] │          │  bg: #0E5AAC, radius: 20px
│  │ (uppercase, white, bold) │          │  padding: 12px, gap: 8px
│  └──────────────────────────┘          │  display: flex + .icon-arrow (21×20px)
└────────────────────────────────────────┘

Estado: usuário NÃO logado (overlay)
┌────────────────────────────────────────┐
│  [IMAGEM ESCURECIDA]                   │
│  ┌──────────────────────────────────┐  │  .overlay
│  │ ⚠ É necessário estar logado     │  │  bg: rgba(14, 90, 172, 0.8)
│  │   para acessar essa área         │  │  position: absolute, inset: 0
│  │                                  │  │  border-radius: 50px
│  │   [Entrar com gov.br]            │  │  padding: 32px
│  │   (btn-overlay, border white)    │  │  gap: 16px, flex-col
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### Card Tipo 2: Card de Notícia (`.card`)

```
┌────────────────────────────────────────┐  300 × 300px
│  ┌────────────────────────────────┐    │  border-radius: 34px
│  │     [IMAGEM THUMBNAIL]         │    │  border: 1.25px solid #EEE
│  │     300 × 150px                │    │  box-shadow: rgba(0,0,0,0.1) 0 4px 6px
│  │     img.img-noticia            │    │  overflow: hidden
│  └────────────────────────────────┘    │  display: flex, flex-direction: column
│                                        │
│  ┌── .card-content (padding: 16px) ──┐ │
│  │  .card-title                       │ │  font-size: 18px, color: #333
│  │  "Celina Leão indica Elie..."      │ │  line-height: 1.43
│  │                                    │ │
│  │  .card-label                       │ │  font-size: 14px, color: #555
│  │  "13/04/2026 às 20h51"            │ │
│  │                                    │ │
│  │  .card-link                        │ │  "Veja a matéria completa"
│  │  → link azul                       │ │  color: #337AB7
│  └────────────────────────────────────┘ │
└────────────────────────────────────────┘

Variação final (CTA card):
┌────────────────────────────────────────┐  300 × 300px
│                                        │  border: 1.25px solid #0E5AAC
│   ⊕  Veja todas as notícias            │  color: #0E5AAC
│                                        │  centered
└────────────────────────────────────────┘
```

### Card Tipo 3: Card de Agenda (eventos do Governador)

Estrutura de carousel horizontal com eventos listados em texto:
- **Título do evento** (uppercase, bold)
- **Onde:** (local ou link para Maps)
- **Horário:** ex. 10:00 às 11:00

---

## 6. INTERAÇÕES E ANIMAÇÕES

```
Hero Carousel:
  - Transição automática entre slides (Bootstrap carousel)
  - Fade/slide entre imagens
  - Setas prev/next com opacity: 0.5 → 1.0 on hover

Tabs de audiência (Sou cidadão / Sou servidor...):
  - Click → mudança de classe .active
  - Tab ativa: bg muda de #F9F9F9 → #FFF, color muda para #0E5AAC
  - Sem animação de transição declarada (AngularJS ng-class)

Cards de serviço:
  - Possivelmente hover para revelar overlay (não confirmado sem interação)
  - Overlay de login aparece via ng-show/ng-hide (AngularJS)

Search Autocomplete:
  - Dropdown .dropdown-menu aparece via ng-show
  - Angular UI Bootstrap Typeahead

Floating widgets:
  - VLibras: aparece em posição fixa, ativa player de Libras ao clicar
  - Chat GDF: botão flutuante bottom-right, abre iframe de atendimento
  - Acessibilidade: botões fixos na lateral direita

Modal de Satisfação (NPS):
  - Slide-in automático após interação com serviço
  - Radio buttons 1-5 + selects + textarea
  - Botões: Enviar / Não quero responder / Fechar

Scroll behavior:
  - Sem infinite scroll nem lazy load identificado
  - Carrosseis usam Bootstrap Carousel com controles prev/next
```

---

## 7. NAVEGAÇÃO — ROTAS E RELAÇÕES

```javascript
// AngularJS Routes (única rota SPA)
$routeProvider
  .when('/', {
    templateUrl: '/lowcode/forms/portal_156_dev/frm_portal_home_form.html'
  })
  .when('/loading', { ... })
  .otherwise({ redirectTo: '/' });

// Todas as funcionalidades na rota /
// Navegação por âncoras: #servicos
// Links externos abrem novas abas
```

```
Relação entre seções (fluxo vertical da home):
Header → Hero Banner → Serviços (tabs) → Notícias → Agenda → Diário Oficial → Footer
```

---

## 8. DADOS E CONTEÚDO POR COMPONENTE

```
Componente           | Tipo de dado         | Fonte
─────────────────────┼──────────────────────┼───────────────────────────
Hero Carousel        | 3 objetos slide      | CMS da plataforma (CITSmart)
Tabs de serviço      | Array de categorias  | Config por audiência
Cards de serviço     | {nome, imagem, url}  | CMS/backend da plataforma
Autocomplete busca   | Array de serviços    | API REST (/lowcode/...)
Cards de notícias    | {título, data, url}  | RSS/API agenciabrasilia.df.gov.br
Agenda Governador    | {evento, local, hora}| API df.gov.br/agenda
Diário Oficial       | Listagem de PDFs     | API do Diário Oficial DF
Footer links         | Estático/config      | JSON de configuração
```

---

## 9. PADRÕES REUTILIZÁVEIS IDENTIFICADOS

1. **SectionTitle** — ícone (info/hambúrguer/calendário) + texto título, line-height alinhado
2. **CarouselSection** — seta prev/next azul + container de items + controles
3. **AudienceTabFilter** — tabs com active state + conteúdo condicional por tab
4. **ServiceCard** — imagem de fundo + label overlay + arrow icon (estado logado/deslogado)
5. **NewsCard** — imagem topo + content (título + data + link)
6. **SearchBar** — input pill + mic button + search button + autocomplete dropdown
7. **LoginGuard** — overlay semi-transparente com CTA "Entrar com gov.br" (padrão repetido em todos os cards quando deslogado)
8. **FooterColumn** — heading bold + lista de links brancos
9. **NPSDialog** — modal de avaliação pós-serviço com rating + selects + textarea
10. **FloatingWidget** — botões fixos de acessibilidade/chat

---

## 10. OUTPUT FINAL — ARQUITETURA FRONTEND SUGERIDA (React/Next.js)

### 10.1 Estrutura de Pastas

```
/src
├── app/
│   ├── layout.tsx          ← Header + Footer + Widgets (fixed)
│   ├── page.tsx            ← Home page
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx              ← Logo + Nav + AuthButton
│   │   ├── NavLink.tsx             ← Item de navegação
│   │   ├── Footer.tsx              ← 4 colunas + socials
│   │   └── FooterColumn.tsx        ← Coluna com heading + links
│   │
│   ├── hero/
│   │   ├── HeroBanner.tsx          ← Carousel de 3 slides
│   │   └── HeroSearchBar.tsx       ← Input + mic + search + CTAs
│   │
│   ├── services/
│   │   ├── ServicesSection.tsx     ← Tabs + grid de cards
│   │   ├── AudienceTabs.tsx        ← Sou cidadão / servidor / empresa / turista / agendamento
│   │   ├── ServiceCard.tsx         ← Card 280×200 com overlay
│   │   └── LoginGuard.tsx          ← HOC/overlay para proteger cards
│   │
│   ├── news/
│   │   ├── NewsCarousel.tsx        ← Carrossel de notícias
│   │   └── NewsCard.tsx            ← Card 300×300
│   │
│   ├── agenda/
│   │   └── AgendaSection.tsx       ← Agenda do Governador
│   │
│   ├── diario/
│   │   └── DiarioOficialSection.tsx
│   │
│   ├── shared/
│   │   ├── SectionTitle.tsx        ← Ícone + título
│   │   ├── Button.tsx              ← Variantes: primary | ghost | outline | accent
│   │   ├── Tab.tsx                 ← Tab + active state
│   │   ├── Card.tsx                ← Base card com variantes
│   │   ├── Carousel.tsx            ← Wrapper de carousel reutilizável
│   │   ├── SearchAutocomplete.tsx  ← Input + dropdown
│   │   └── NPSModal.tsx            ← Modal de avaliação
│   │
│   └── widgets/
│       ├── ChatWidget.tsx          ← Botão flutuante de chat
│       ├── VLibrasWidget.tsx       ← Acessibilidade Libras
│       └── AccessibilityButtons.tsx
│
├── hooks/
│   ├── useAuth.ts          ← Estado de autenticação gov.br
│   ├── useSearch.ts        ← Lógica de busca e autocomplete
│   └── useCarousel.ts      ← Controle de slides
│
├── services/
│   ├── api.ts              ← Fetch base
│   ├── newsService.ts      ← API Agência Brasília
│   ├── agendaService.ts    ← API Agenda do Governador
│   └── servicesData.ts     ← Dados estáticos de categorias
│
├── types/
│   ├── service.ts
│   ├── news.ts
│   └── agenda.ts
│
└── styles/
    ├── tokens.css          ← CSS Custom Properties (Design Tokens)
    ├── typography.css
    └── components/
        ├── buttons.css
        ├── cards.css
        └── tabs.css
```

### 10.2 Design Tokens (CSS Variables para tokens.css)

```css
:root {
  /* Colors */
  --color-primary: #0E5AAC;
  --color-primary-dark: #166AC3;
  --color-accent: #ED8F24;
  --color-text: #333333;
  --color-text-secondary: #555555;
  --color-bg: #FFFFFF;
  --color-bg-muted: #F9F9F9;
  --color-footer-bg: #0E5AAC;

  /* Typography */
  --font-family: "Gotham Rounded", Arial, sans-serif;
  --text-base: 13px;
  --text-sm: 12px;
  --text-md: 16px;
  --text-lg: 18px;
  --text-xl: 24px;

  /* Spacing */
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-xl: 24px;
  --radius-card: 34px;
  --radius-service-card: 50px;
  --radius-pill: 40px;

  /* Shadows */
  --shadow-card: 0px 4px 6px rgba(0,0,0,0.1);
  --shadow-modal: 0px 4px 12px rgba(0,0,0,0.1);
}
```

### 10.3 Componente Button (variantes)

```tsx
// Button.tsx
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'overlay' | 'tab' | 'tab-active' | 'tab-accent';

const Button = ({ variant, children, ...props }) => (
  <button className={`btn btn--${variant}`} {...props}>
    {children}
  </button>
);
```

### 10.4 ServiceCard

```tsx
// ServiceCard.tsx
interface ServiceCardProps {
  title: string;
  imageUrl: string;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onClick: () => void;
}

// Renderiza LoginGuard overlay se !isAuthenticated
// Renderiza imagem + label com arrow icon se autenticado
```

### 10.5 Pontos de Atenção para Migração

- A plataforma atual é **CITSmart/Low-code** com AngularJS — muitos dados vêm de endpoints `/lowcode/...`
- Autenticação via **gov.br (SSO OAuth)** — implementar com NextAuth.js ou similar
- **13 categorias de serviços** com filtro por audiência (cidadão/servidor/empresa/turista) = estrutura de dados com campo `audiencia: string[]`
- O carousel de notícias consome a **API pública da Agência Brasília** (`agenciabrasilia.df.gov.br`)
- O **Diário Oficial** e **Agenda do Governador** têm APIs próprias do GDF
- Responsivo: breakpoints em `480px`, `767px`, `768px`, `992px`, `1200px` (Bootstrap 3 padrão)
- Acessibilidade: VLibras + Handtalk já integrados — manter via `<script>` externo