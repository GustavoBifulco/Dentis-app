#!/bin/bash
# Dentis OS - Rollback Script
# Reverte para o último deploy bem-sucedido

set -e

echo "🔙 Dentis OS - Rollback Iniciado"
echo "================================"

cd /home/dentis/htdocs/dentis.com.br

# Verificar se existe hash salvo
if [ ! -f .last_deploy_hash ]; then
    echo "❌ Erro: Arquivo .last_deploy_hash não encontrado"
    echo "   Não é possível determinar versão anterior"
    exit 1
fi

ROLLBACK_HASH=$(cat .last_deploy_hash)
ROLLBACK_DATE=$(cat .last_deploy_date 2>/dev/null || echo "Data desconhecida")

echo "📸 Revertendo para:"
echo "   Hash: $ROLLBACK_HASH"
echo "   Data: $ROLLBACK_DATE"
echo ""

# Confirmar rollback
read -p "⚠️  Confirma rollback? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Rollback cancelado"
    exit 0
fi

# Executar rollback
echo "🔄 Revertendo código..."
git reset --hard $ROLLBACK_HASH

echo "📦 Reinstalando dependências..."
npm ci

echo "🔨 Rebuilding..."
npm run build

echo "🔄 Reiniciando aplicação..."
pm2 restart all

echo "⏳ Aguardando inicialização..."
sleep 10

# Verificar se funcionou
echo "🧪 Verificando rollback..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://dentis.com.br)

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Rollback concluído com sucesso!"
    echo "   Status HTTP: $HTTP_STATUS"
else
    echo "❌ Rollback falhou (Status: $HTTP_STATUS)"
    echo "   Verifique os logs: pm2 logs"
    exit 1
fi

echo ""
echo "📋 Logs recentes:"
pm2 logs --lines 20 --nostream
