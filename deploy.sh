#!/bin/bash
# Dentis OS - Deploy Seguro no VPS
# Data: 2026-02-07
# Versão: 1.0

set -e  # Exit on error

echo "🚀 Dentis OS - Deploy Iniciado"
echo "================================"

# 1. Capturar estado atual para rollback
cd /home/dentis/htdocs/dentis.com.br
CURRENT_HASH=$(git rev-parse HEAD)
CURRENT_DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "📸 Estado Atual:"
echo "   Hash: $CURRENT_HASH"
echo "   Data: $CURRENT_DATE"
echo ""

# Salvar hash para rollback
echo "$CURRENT_HASH" > .last_deploy_hash
echo "$CURRENT_DATE" > .last_deploy_date

# 2. Status PM2 antes do deploy
echo "📊 Status PM2 (Antes):"
pm2 status
echo ""

# 3. Pull + Build
echo "🔄 Atualizando código..."
git pull origin main

echo "📦 Instalando dependências..."
npm ci

echo "🔨 Building aplicação..."
npm run build

# 4. Restart
echo "🔄 Reiniciando aplicação..."
pm2 restart all

# 5. Aguardar inicialização
echo "⏳ Aguardando inicialização (10s)..."
sleep 10

# 6. Smoke tests
echo "🧪 Executando smoke tests..."
echo ""

echo "  ✓ Teste 1: HTTP Status"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://dentis.com.br)
if [ "$HTTP_STATUS" = "200" ]; then
    echo "    ✅ Status: $HTTP_STATUS (OK)"
else
    echo "    ❌ Status: $HTTP_STATUS (FALHOU)"
    echo "    🔙 Executando rollback..."
    git reset --hard $CURRENT_HASH
    npm ci
    npm run build
    pm2 restart all
    exit 1
fi

echo "  ✓ Teste 2: HTML Content"
CONTENT=$(curl -s https://dentis.com.br | head -n 5)
if echo "$CONTENT" | grep -q "<!DOCTYPE html>"; then
    echo "    ✅ HTML válido detectado"
else
    echo "    ❌ HTML inválido"
    echo "    🔙 Executando rollback..."
    git reset --hard $CURRENT_HASH
    npm ci
    npm run build
    pm2 restart all
    exit 1
fi

echo "  ✓ Teste 3: API Health"
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://dentis.com.br/api/health || echo "000")
if [ "$API_STATUS" = "200" ] || [ "$API_STATUS" = "404" ]; then
    echo "    ✅ API respondendo (Status: $API_STATUS)"
else
    echo "    ⚠️  API Status: $API_STATUS (verificar logs)"
fi

echo ""

# 7. Status PM2 após deploy
echo "📊 Status PM2 (Depois):"
pm2 status
echo ""

# 8. Logs recentes
echo "📋 Logs Recentes (últimas 30 linhas):"
pm2 logs --lines 30 --nostream
echo ""

# 9. Informações do deploy
NEW_HASH=$(git rev-parse HEAD)
echo "✅ Deploy Concluído com Sucesso!"
echo "================================"
echo "   Hash Anterior: $CURRENT_HASH"
echo "   Hash Novo:     $NEW_HASH"
echo "   Data:          $(date +"%Y-%m-%d %H:%M:%S")"
echo ""
echo "🔍 Para verificar logs em tempo real:"
echo "   pm2 logs"
echo ""
echo "🔙 Para rollback (se necessário):"
echo "   bash rollback.sh"
echo ""
