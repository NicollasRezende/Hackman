# Sistema de Confirmação de Pedidos via WhatsApp

Caso de uso completo: Notificações de pedido, rastreamento e confirmação de entrega.

## Fluxo Completo

1. **Pedido Criado** → Confirmação imediata
2. **Pagamento Aprovado** → Notificação
3. **Pedido em Separação** → Update
4. **Pedido Enviado** → Código de rastreamento
5. **Pedido Entregue** → Confirmação + Avaliação

## Arquivos

- `order_flow.py` - Fluxo completo do pedido
- `tracking_updates.py` - Atualizações de rastreamento

## Como Usar

```bash
# Fluxo completo de pedido
python order_flow.py

# Apenas tracking
python tracking_updates.py
```

## Features

- ✅ Confirmação de pedido com detalhes
- ✅ Atualizações em tempo real
- ✅ Link de rastreamento
- ✅ Notificação de entrega
- ✅ Solicitação de avaliação
- ✅ Link para nova compra
