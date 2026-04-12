# Sistema de Notificações em Massa via WhatsApp

Caso de uso completo: Envio de notificações agendadas e em massa com rate limiting.

## Fluxo Completo

1. **Criar Campanha** → Definir mensagem e destinatários
2. **Agendar Envio** → Definir data/hora
3. **Envio em Massa** → Com rate limiting automático
4. **Relatório** → Estatísticas de envio

## Arquivos

- `notification_scheduler.py` - Agendar notificações futuras
- `bulk_sender.py` - Envio em massa com controle

## Como Usar

```bash
# Agendar notificações
python notification_scheduler.py

# Envio em massa
python bulk_sender.py
```

## Features

- ✅ Agendamento de mensagens
- ✅ Envio em massa controlado
- ✅ Rate limiting automático
- ✅ Personalização por destinatário
- ✅ Relatório de entregas
- ✅ Retry automático de falhas
- ✅ Blacklist de números
