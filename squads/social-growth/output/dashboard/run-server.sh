#!/bin/bash
# Dashboard Server - Start/stop HTTP server for dashboard

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SQUAD_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PORT=8080

start() {
    echo "🚀 Iniciando servidor da dashboard na porta $PORT..."
    cd "$SQUAD_DIR"
    node scripts/serve-dashboard.mjs 2>&1 &
    sleep 2
    if curl -s http://localhost:$PORT/data.js > /dev/null 2>&1; then
        echo "✅ Servidor rodando em http://localhost:$PORT"
        echo "💬 Chat API disponível em http://localhost:$PORT/api/chat"
    else
        echo "❌ Erro ao iniciar servidor"
    fi
}

stop() {
    pkill -f "serve-dashboard.mjs" 2>/dev/null
    echo "🛑 Servidor parado"
}

case "${1:-start}" in
    start) start ;;
    stop) stop ;;
    restart) stop; start ;;
    *) echo "Usage: $0 {start|stop|restart}" ;;
esac
