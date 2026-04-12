# Sistema de Cobrança via WhatsApp

Caso de uso completo: Sistema de cobrança e recebimento de comprovantes.

## Fluxo Completo

1. **Enviar Cobrança** → Sistema envia lembrete com link de pagamento
2. **Cliente Paga** → Cliente faz pagamento e envia comprovante via WhatsApp
3. **Receber Comprovante** → Webhook recebe imagem do comprovante
4. **Confirmar Pagamento** → Sistema confirma recebimento

## Arquivos

- `send_payment_reminder.py` - Enviar cobrança para cliente
- `receive_proof.py` - Receber e processar comprovante
- `confirm_payment.py` - Confirmar pagamento processado
- `payment_flow.py` - Fluxo completo integrado

## Como Usar

```bash
# 1. Enviar cobrança
python send_payment_reminder.py

# 2. Cliente envia comprovante via WhatsApp
# (processado automaticamente pelo webhook)

# 3. Confirmar pagamento manualmente
python confirm_payment.py
```
