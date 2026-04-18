#!/bin/bash

# Script para iniciar o ambiente de desenvolvimento no Linux/macOS
# Equivalente ao start-dev.ps1 do Windows

set -e

# Função para carregar .env
load_env() {
    if [ -f "$1" ]; then
        echo "Carregando variáveis de ambiente de $1..."
        # Exporta variáveis ignorando comentários e linhas vazias
        export $(grep -v '^#' "$1" | xargs)
    fi
}

# Carregar variáveis de ambiente
load_env ".env"
load_env "backend/.env"

# Configurar CORS padrão
if [ -z "$CORS_ALLOWED_ORIGINS" ]; then
    export CORS_ALLOWED_ORIGINS="*"
else
    if [[ ! "$CORS_ALLOWED_ORIGINS" == "*" ]]; then
        export CORS_ALLOWED_ORIGINS="$CORS_ALLOWED_ORIGINS,*"
    fi
fi

# Verificar runner do backend
if [ -f "backend/mvnw" ]; then
    BACKEND_RUNNER="./mvnw"
    chmod +x backend/mvnw
elif command -v mvn &> /dev/null; then
    BACKEND_RUNNER="mvn"
else
    echo "Erro: Maven não encontrado. Instale o Maven ou verifique se backend/mvnw existe."
    exit 1
fi

# Verificar porta 8080
BACKEND_PORT=8080
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    BACKEND_PORT=8081
    echo "Aviso: Porta 8080 já está em uso. Iniciando backend na porta $BACKEND_PORT."
fi
export SERVER_PORT=$BACKEND_PORT

# Configurar URL base do Vite para o frontend
if [ -z "$VITE_API_BASE_URL" ]; then
    export VITE_API_BASE_URL="http://localhost:$BACKEND_PORT/api"
fi

if [ -z "$OPENROUTER_API_KEY" ]; then
    echo "Aviso: OPENROUTER_API_KEY não definida. O chat usará fallback."
fi

echo "Iniciando backend (Spring) na porta $BACKEND_PORT..."
(cd backend && $BACKEND_RUNNER spring-boot:run) &
BACKEND_PID=$!

echo "Iniciando frontend (Vite)..."
npm run dev &
FRONTEND_PID=$!

# Função para encerrar os processos ao fechar o script
cleanup() {
    echo ""
    echo "Encerrando processos..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

wait
