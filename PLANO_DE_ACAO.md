# Plano de Ação — Pontos Fracos da Avaliação

Foco nos critérios com nota abaixo de 8, priorizando o que mais impacta a percepção da banca.

---

## 1. Feedback de Impacto — 4/10 (CRÍTICO)

**Problema:** Backend pronto em `ChatController.java:33`, mas o front não envia os votos. Botões em `AIMessage.tsx:199` só mudam visualmente.

### Ações
- [ ] Criar função `sendFeedback(messageId, vote)` no serviço de chat do front
- [ ] Conectar os botões "ajudou / não funcionou" em `AIMessage.tsx:199` ao endpoint existente
- [ ] Persistir o estado do voto (evitar duplo clique / reenvio)
- [ ] Exibir confirmação visual curta ("Obrigado pelo retorno")
- [ ] Adicionar um contador agregado simples ("X pessoas acharam útil") para reforçar prova social
- [ ] Atualizar o README removendo o aviso de que o feedback ainda não está conectado

---

## 2. Navegação Direta — 7/10

**Problema:** CTA principal em `AIMessage.tsx:175` aponta para `df.gov.br` genérico em vez do serviço exato.

### Ações
- [ ] Mapear, por intenção detectada, o link oficial específico (ex.: agendamento SES, CadÚnico, CAPS, Casa da Mulher)
- [ ] Adicionar campo `officialUrl` na resposta do backend, retornado pelo `IntentDetector`
- [ ] Usar o `officialUrl` no CTA do `AIMessage.tsx`; cair no genérico só se não houver match
- [ ] Validar em QA os 10 fluxos mais comuns (saúde, trabalho, documentos, assistência, violência, trânsito)

---

## 3. Transparência Digital e Confiança — 7/10

**Problema:** Dados simulados em `Hero.tsx:246` e `locations.ts:357` aparentam ser operacionais reais.

### Ações
- [ ] Remover métricas fictícias do `Hero.tsx` (consultas, tempo médio, última atualização) OU substituir por texto neutro ("Em piloto no DF")
- [ ] Marcar dados hospitalares estáticos em `locations.ts` com flag `source: "cadastro-manual"` e data
- [ ] Na UI do mapa/ficha, exibir badge "Dado oficial" vs "Dado de referência"
- [ ] Incluir no rodapé das respostas do chat a fonte e data da informação quando vier de `ExternalDataAggregator`

---

## 4. Interpretação Humana — 8/10 (reforço)

**Problema:** Dependência forte de palavras-chave em `IntentDetector.java:46`; pouca tolerância a erro de digitação.

### Ações
- [ ] Adicionar normalização (lowercase, remoção de acento, stemming leve) antes do match de intenção
- [ ] Incluir dicionário de sinônimos populares ("tô mal", "tá ruim", "passando mal", "doente")
- [ ] Fallback para similaridade (Levenshtein ≤ 2) nas palavras-chave principais
- [ ] Cobrir em testes os 3 casos de demo: "tô passando mal", "perdi meu emprego", "preciso de ajuda com violência doméstica"

---

## 5. Eficiência de Gestão Pública — 7,5/10 (reforço)

**Problema:** Ganho para o Estado está implícito, não medido.

### Ações
- [ ] Registrar, junto ao feedback, a intenção detectada e o órgão destino (para gerar métrica de "encaminhamento correto")
- [ ] Criar endpoint simples `/metrics/summary` com: total de atendimentos, % útil, top 5 intenções
- [ ] Adicionar no pitch a fórmula explícita: menos ida errada + menos fila indevida + menos retrabalho + dado de feedback

---

## 6. Preparação da Demo (transversal)

### Ações
- [ ] Roteirizar 3 demos: saúde ("tô passando mal"), trabalho ("perdi meu emprego"), violência doméstica
- [ ] Criar slide final de aderência ao edital (tabela: critério × status)
- [ ] Separar no discurso o que é "entregue hoje" e o que é "roadmap" (integrações, feedback omnicanal)

---

## Ordem de Execução Recomendada

1. Feedback conectado ao backend (fecha requisito do edital)
2. Links oficiais específicos por intenção
3. Remoção/marcação de dados simulados
4. Normalização + sinônimos no IntentDetector
5. Métricas agregadas + slide de aderência
6. Ensaio das 3 demos
