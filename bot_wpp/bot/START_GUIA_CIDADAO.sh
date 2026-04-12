#!/bin/bash

# Script para iniciar o Guia Cidadão IA WhatsApp Bot
# Usa as mesmas credenciais do whatsapp-receiver

echo "🤖 Iniciando Guia Cidadão IA WhatsApp Bot..."
echo ""

# Verificar se o .env existe
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "⚠️  Arquivo .env não encontrado!"
        echo "📝 Criando .env a partir do .env.example..."
        cp .env.example .env
        echo "✅ .env criado! Configure suas credenciais antes de usar."
        echo ""
        echo "Edite o arquivo .env e configure:"
        echo "  - WHATSAPP_TOKEN"
        echo "  - WHATSAPP_PHONE_NUMBER_ID"
        echo "  - WHATSAPP_VERIFY_TOKEN"
        exit 1
    else
        echo "❌ Erro: arquivo .env e .env.example não encontrados!"
        exit 1
    fi
fi

# Ativar ambiente virtual (se existir)
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✅ Ambiente virtual ativado"
elif [ -d "../../whatsapp-receiver/venv" ]; then
    source ../../whatsapp-receiver/venv/bin/activate
    echo "✅ Ambiente virtual do whatsapp-receiver ativado"
fi

# Verificar dependências
echo ""
echo "📦 Verificando dependências..."
pip install -q -r requirements.txt --break-system-packages

echo ""
echo "🚀 Iniciando servidor..."
echo "📡 Porta: 8000"
echo "🌐 Webhook: http://localhost:8000/webhooks/whatsapp"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Mantenha o ngrok rodando na porta 8000"
echo "   2. ngrok: https://plainly-glowing-kodiak.ngrok-free.app"
echo "   3. Configure a URL do webhook no Meta Business"
echo "   4. URL do webhook: https://plainly-glowing-kodiak.ngrok-free.app/webhooks/whatsapp"
echo ""
echo "📝 Logs salvos em: logs/webhook.log"
echo ""
echo "Pressione Ctrl+C para parar"
echo "═══════════════════════════════════════════════"
echo ""

# Rodar webhook
python3 webhook_guia_cidadao.py
