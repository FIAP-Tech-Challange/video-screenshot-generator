#!/bin/bash

echo "🧹 ========================================="
echo "   LIMPEZA COMPLETA DO AMBIENTE"
echo "========================================="
echo ""

# Garantir que DOCKER_HOST está configurado corretamente (WSL Docker, não Minikube)
export DOCKER_HOST=unix:///var/run/docker.sock
unset MINIKUBE_ACTIVE_DOCKERD

PROJECT_ROOT= #<<project-folder>>

# 1. Parar minikube tunnel (se estiver rodando)
echo "1️⃣  Parando minikube tunnel..."
pkill -f "minikube tunnel" 2>/dev/null && echo "   ✅ Tunnel parado" || echo "   ℹ️  minikube tunnel não estava rodando"
echo ""

# 2. Deletar recursos do Kubernetes
echo "2️⃣  Deletando recursos do Kubernetes..."
kubectl delete namespace video-app --ignore-not-found=true 2>/dev/null && echo "   ✅ Namespace deletado" || echo "   ℹ️  Kubernetes não disponível ou namespace não existia"
echo ""

# 3. Deletar Minikube
echo "3️⃣  Deletando cluster Minikube..."
minikube delete 2>/dev/null && echo "   ✅ Minikube deletado" || echo "   ℹ️  Minikube não existia"
echo ""

# 4. Parar e deletar containers Docker Compose (infra)
echo "4️⃣  Parando Docker Compose (infra)..."
cd "$PROJECT_ROOT"
docker-compose -f infra/k8s/docker-compose.infra.yml --env-file .env down -v 2>/dev/null && echo "   ✅ Containers e volumes removidos" || echo "   ℹ️  Nenhum container rodando"
echo ""

# 5. Remover rede Docker (se existir)
echo "5️⃣  Removendo rede k8s_microservices..."
docker network rm k8s_microservices 2>/dev/null && echo "   ✅ Rede removida" || echo "   ℹ️  Rede não existia ou ainda tem containers conectados"
echo ""

# 6. Limpar volumes Docker não utilizados
echo "6️⃣  Limpando volumes não utilizados..."
docker volume prune -f
echo "   ✅ Volumes limpos"
echo ""

echo "✅ ========================================="
echo "   LIMPEZA COMPLETA FINALIZADA!"
echo "========================================="
echo ""
echo "Próximo passo:"
echo "   cd $PROJECT_ROOT/infra/k8s/scripts"
echo "   ./full-setup.sh"
echo ""