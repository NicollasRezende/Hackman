# Sistema de Atendimento ao Cliente via WhatsApp

Caso de uso completo: Chatbot de atendimento com menu interativo, FAQ e sistema de tickets.

## Fluxo Completo

1. **Menu Principal** → Cliente escolhe departamento
2. **FAQ Automática** → Respostas imediatas para perguntas comuns
3. **Criar Ticket** → Casos complexos viram tickets
4. **Encaminhar Humano** → Transferência para atendente

## Arquivos

- `chatbot_menu.py` - Menu interativo principal
- `ticket_system.py` - Criar e gerenciar tickets
- `faq_handler.py` - Respostas automáticas FAQ

## Como Usar

```bash
# Iniciar chatbot
python chatbot_menu.py

# Sistema funciona via webhook - cliente envia mensagem e recebe menu
```

## Features

- ✅ Menu com botões (Vendas, Suporte, Financeiro)
- ✅ FAQ automático para perguntas comuns
- ✅ Criação de tickets
- ✅ Histórico de conversas
- ✅ Horário de atendimento
- ✅ Avaliação de atendimento
