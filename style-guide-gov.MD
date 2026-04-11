---
title: "GOV.BR — Design System & Reverse Engineering Documentation"
description: "Documentação completa para recriar a landing page do portal gov.br"
---

# GOV.BR — Reverse Engineering Documentation

---

## 1. Design System

### Paleta de Cores Primárias

O design system do GOV.BR (baseado no DS do Governo Federal) utiliza uma escala de azuis como cor institucional primária e uma escala de cinzas neutras como secundária.
```css
/* --- Primárias (azul institucional) --- */
--color-primary-pastel-01: #c5d4eb;   /* rgb(197, 212, 235) */
--color-primary-pastel-02: #dbe8fb;   /* rgb(219, 232, 251) */
--color-primary-lighten-02: #5992ed;  /* rgb(89, 146, 237)  */
--color-primary-lighten-01: #2670e8;  /* rgb(38, 112, 232) — selected/hover */
--color-primary-default:    #1351b4;  /* rgb(19, 81, 180)  — COR PRINCIPAL */
--color-primary-darken-01:  #0c326f;  /* rgb(12, 50, 111) — títulos, active */
--color-primary-darken-02:  #071d41;  /* rgb(7, 29, 65)   — footer bg */
```

### Paleta de Cores Secundárias (Neutros)
```css
--color-secondary-01: #fff;                /* branco puro */
--color-secondary-02: #f8f8f8;             /* fundo sutil / search section bg */
--color-secondary-03: #ededed;             /* bordas leves */
--color-secondary-04: #ccc;                /* bordas de inputs */
--color-secondary-05: #9e9d9d;             /* texto desabilitado */
--color-secondary-06: #888;                /* texto placeholder */
--color-secondary-07: #555;                /* texto body padrão */
--color-secondary-08: #333;                /* títulos h2, h3 */
--color-secondary-09: #000;                /* preto puro */
--color-secondary-10: rgba(0,0,0,0.4);     /* overlay escuro */
--color-secondary-11: rgba(255,255,255,0.64); /* overlay claro */
--color-secondary-12: rgba(0,0,0,0.64);    /* overlay médio */
```

### Cores de Estado e Feedback
```css
--color-highlight: #268744;  /* verde — badges "Novo" */
--color-success:   #168821;  /* verde escuro */
--color-warning:   #ffcd07;  /* amarelo */
--color-danger:    #e60000;  /* vermelho */
--color-info:      #155bcb;  /* azul informativo */
```

### Cores de Suporte
```css
--color-support-01: #36a191;  /* teal */
--color-support-02: #f2e317;  /* amarelo vibrante */
--color-support-03: #d84800;  /* laranja */
--color-support-04: #a26739;  /* marrom */
```

### Cores Interativas
```css
--interactive: #1351b4;   /* links e elementos clicáveis */
--active:      #0c326f;   /* estado ativo / visitado */
--visited:     #0c326f;
--selected:    #2670e8;   /* elemento selecionado */
--hover:       0.16;      /* opacidade do hover overlay */
--pressed:     0.45;      /* opacidade do pressed overlay */
```

### Gradientes

O portal GOV.BR utiliza gradientes mínimos. O principal efeito visual é a transição entre seções com fundos sólidos distintos: branco (#fff), cinza claro (#f8f8f8) e azul escuro (#0c326f). Não foram identificados gradientes CSS explícitos no design principal.

---

## 2. Tipografia

### Fontes Utilizadas
```css
--font-family-base: "Rawline", "Raleway", sans-serif;
```

A fonte principal é **Rawline** (a fonte oficial do Governo Federal brasileiro), com fallback para **Raleway** e depois sans-serif genérica. A fonte Rawline é carregada com `@font-face` diretamente nos CSS do portal.

### Escala Tipográfica

O sistema utiliza uma escala modular baseada em `14px` como tamanho base:
```css
--font-size-scale-base:    14px;
--font-size-scale-down-01: 11.662px;
--font-size-scale-down-02: 9.716px;
--font-size-scale-down-03: 8.106px;
--font-size-scale-up-01:   16.8px;
--font-size-scale-up-02:   20.16px;
--font-size-scale-up-03:   24.192px;
--font-size-scale-up-04:   29.036px;
--font-size-scale-up-05:   34.832px;
--font-size-scale-up-06:   41.804px;
--font-size-scale-up-07:   50.162px;
```

### Tamanhos de Heading (valores computados na página)

| Heading | Font Size | Font Weight | Line Height | Cor |
|---------|-----------|-------------|-------------|-----|
| H1      | 36px      | 600 (semi-bold) | 44px    | #0c326f (primary-darken-01) |
| H2      | 36px      | 600 (semi-bold) | 54px    | #333 (secondary-08) |
| H3      | 12px      | 700 (bold)  | 44px        | #333 (secondary-08) |

O H1 é usado para o título principal "Serviços e Informações do Brasil". Os H2 são usados para títulos de seção como "Serviços para você", "Navegue por categoria", "Desempenho dos Serviços". O H3 com 12px e uppercase é usado para subtítulos como "MAIS ACESSADOS" e "DESTAQUE".

### Pesos de Fonte
```css
--font-weight-thin:        100;
--font-weight-extra-light: 200;
--font-weight-light:       300;
--font-weight-regular:     400;
--font-weight-medium:      500;
--font-weight-semi-bold:   600;
--font-weight-bold:        700;
--font-weight-extra-bold:  800;
--font-weight-black:       900;
```

### Alturas de Linha
```css
--font-line-height-low:    1.15;
--font-line-height-medium: 1.45;
--font-line-height-high:   1.85;
```

O body utiliza `line-height: 1.75` (28px com font-size 16px). Letter-spacing é `normal` em todos os headings.

---

## 3. Layout

### Container e Largura

A página utiliza o sistema de grid do Bootstrap com adaptações do DS GOV.BR. A largura total observada do viewport é ~1215px. O conteúdo principal utiliza colunas de 12 (`col-md-12`) com padding lateral de `0px 12px` em cada coluna e `0px 28px` no row-content.

### Grid System

O layout é baseado em **Flexbox** com classes do tipo Bootstrap (`row`, `column`, `col-md-12`). Não há uso de CSS Grid nativo nas seções principais.
```css
/* Row-content padrão */
.row-content {
  padding: 0 28px;
}

/* Coluna padrão */
.column.col-md-12 {
  padding: 0 12px;
}
```

### Breakpoints Responsivos

Os breakpoints identificados nos media queries do CSS são (valores principais):

| Nome | Valor |
|------|-------|
| XS   | 360px |
| SM   | 576px |
| MD   | 768px |
| LG   | 992px |
| XL   | 1200px |
| XXL  | 1440px |

Breakpoints adicionais usados: 375px, 425px, 480px, 560px, 820px, 960px, 1024px, 1100px, 1180px, 1260px, 1280px, 1600px.

---

## 4. Componentes

### Navbar (Header)

A navbar tem duas camadas visuais: a barra superior institucional e a barra secundária com menu.
Altura total: 88px
Background: #fff (branco)
Posição: sticky (classe sticky-header)