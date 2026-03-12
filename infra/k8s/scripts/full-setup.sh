#!/bin/bash

set -e  # Parar se houver erro

echo "🚀 ========================================="
echo "   SETUP COMPLETO DO AMBIENTE"
echo "========================================="
echo ""

# Garantir que DOCKER_HOST está configurado corretamente (WSL Docker, não Minikube)
export DOCKER_HOST=unix:///var/run/docker.sock
unset MINIKUBE_ACTIVE_DOCKERD

PROJECT_ROOT= #<<project-folder>>
cd "$PROJECT_ROOT"

# PASSO 1: Criar rede Docker
echo "📡 PASSO 1/8: Criando rede Docker..."
docker network create k8s_microservices 2>/dev/null || echo "   ℹ️  Rede já existe"
echo "   ✅ Rede pronta"
echo ""

# PASSO 2: Subir infraestrutura (Docker Compose)
echo "🐳 PASSO 2/8: Subindo infraestrutura (Kafka, PostgreSQL, MinIO, Redis, Prometheus, Grafana)..."
docker-compose -f infra/k8s/docker-compose.infra.yml --env-file .env up -d
echo "   ⏳ Aguardando serviços ficarem saudáveis (30s)..."
sleep 30
echo "   ✅ Infraestrutura rodando"
echo ""

# PASSO 3: Criar Minikube
echo "☸️  PASSO 3/8: Criando cluster Minikube..."
minikube start --driver=docker --cpus=2 --memory=4096
# Restaurar DOCKER_HOST após o minikube start (ele sobrescreve)
export DOCKER_HOST=unix:///var/run/docker.sock
unset MINIKUBE_ACTIVE_DOCKERD
echo "   ✅ Minikube criado"
echo ""

# PASSO 4: Conectar Minikube à rede
echo "🔗 PASSO 4/8: Conectando Minikube à rede k8s_microservices..."
MINIKUBE_CONTAINER=$(docker ps --filter "name=minikube" --format "{{.Names}}" | head -1)
docker network connect k8s_microservices "$MINIKUBE_CONTAINER" 2>/dev/null || echo "   ℹ️  Já conectado"
echo "   ✅ Minikube conectado à rede"
echo ""

# PASSO 5: Build das imagens dentro do contexto do Minikube
echo "🔨 PASSO 5/8: Buildando imagens Docker dentro do Minikube..."
eval $(minikube docker-env)
docker build -t api-bff:latest     -f projects/api-bff/Dockerfile      projects/api-bff
docker build -t api-consumer:latest -f projects/api-consumer/Dockerfile  projects/api-consumer
docker build -t frontend:latest     -f projects/frontend/Dockerfile       projects/frontend
# Restaurar DOCKER_HOST após o minikube docker-env
export DOCKER_HOST=unix:///var/run/docker.sock
unset MINIKUBE_ACTIVE_DOCKERD
echo "   ✅ Imagens buildadas"
echo ""

# PASSO 6: Deploy no Kubernetes
echo "📦 PASSO 6/8: Fazendo deploy no Kubernetes..."
cd "$PROJECT_ROOT/infra/k8s"
kubectl apply -k overlays/dev/
echo "   ⏳ Aguardando pods ficarem prontos..."
kubectl wait --for=condition=ready pod -l project=video-screenshot-generator -n video-app --timeout=300s
echo "   ✅ Aplicações deployadas"
echo ""

# PASSO 7: Atualizar prometheus.yml com o IP do Minikube na rede Docker
echo "📝 PASSO 7/8: Configurando Prometheus para acessar as APIs via NodePort..."
cd "$PROJECT_ROOT"

# Descobrir o IP do container Minikube na rede k8s_microservices usando python3 (mais confiável)
MINIKUBE_IP=$(docker inspect minikube | python3 -c "
import sys, json
data = json.load(sys.stdin)[0]
nets = data['NetworkSettings']['Networks']
# Tenta pegar o IP da rede k8s_microservices primeiro
for name, cfg in nets.items():
    if 'k8s_microservices' in name:
        print(cfg['IPAddress'])
        exit()
# Fallback: pega o segundo IP (o primeiro é a rede padrão do minikube)
ips = [cfg['IPAddress'] for cfg in nets.values() if cfg['IPAddress']]
print(ips[1] if len(ips) > 1 else ips[0])
")

if [ -z "$MINIKUBE_IP" ]; then
  echo "   ❌ Erro: não foi possível descobrir o IP do Minikube. Verifique se está conectado à rede k8s_microservices."
  exit 1
fi

echo "   🔍 IP do Minikube na rede k8s_microservices: $MINIKUBE_IP"

# Descobrir as NodePorts dos serviços (o overlay dev adiciona prefixo "dev-")
BFF_NODEPORT=$(kubectl get svc dev-api-bff -n video-app -o jsonpath='{.spec.ports[0].nodePort}')
CONSUMER_NODEPORT=$(kubectl get svc dev-api-consumer -n video-app -o jsonpath='{.spec.ports[0].nodePort}')

echo "   🔍 NodePort api-bff: $BFF_NODEPORT"
echo "   🔍 NodePort api-consumer: $CONSUMER_NODEPORT"

# Atualizar prometheus.yml
cat > prometheus.yml << EOF
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "api-bff"
    metrics_path: "/metrics"
    static_configs:
      # API BFF via NodePort do container Minikube na rede k8s_microservices
      - targets: ["${MINIKUBE_IP}:${BFF_NODEPORT}"]

  - job_name: "api-consumer"
    metrics_path: "/metrics"
    static_configs:
      # API Consumer via NodePort do container Minikube na rede k8s_microservices
      - targets: ["${MINIKUBE_IP}:${CONSUMER_NODEPORT}"]

  - job_name: "postgres-exporter"
    static_configs:
      - targets: ["postgres-exporter:9187"]

  - job_name: "kafka-exporter"
    static_configs:
      - targets: ["kafka-exporter:9308"]
EOF

echo "   ✅ prometheus.yml atualizado"

# Reiniciar Prometheus para aplicar a nova configuração
docker restart prometheus
echo "   ✅ Prometheus reiniciado"
echo ""

# PASSO 8: Iniciar minikube tunnel (background)
echo "🌐 PASSO 8/8: Iniciando minikube tunnel..."
echo "   ℹ️  O tunnel ficará rodando em background"
pkill -f "minikube tunnel" 2>/dev/null || true
nohup minikube tunnel > /tmp/minikube-tunnel.log 2>&1 &
sleep 5
echo "   ✅ Tunnel iniciado"
echo ""

echo "✅ ========================================="
echo "   SETUP COMPLETO FINALIZADO!"
echo "========================================="
echo ""
echo "🎉 Serviços disponíveis:"
echo ""
echo "📊 INFRAESTRUTURA (Docker Compose):"
echo "   - Kafdrop (Kafka UI):    http://localhost:19000"
echo "   - MinIO Console:         http://localhost:9001"
echo "   - Prometheus:            http://localhost:9090"
echo "   - Grafana:               http://localhost:3005"
echo ""
echo "🚀 APLICAÇÕES (Kubernetes):"
echo "   - Frontend:              http://localhost:4200"
echo "   - API BFF:               http://localhost:3000"
echo "   - API Consumer:          http://localhost:3001"
echo ""
echo "📝 Comandos úteis:"
echo "   - Ver pods:              kubectl get pods -n video-app"
echo "   - Ver services:          kubectl get svc -n video-app"
echo "   - Ver logs API BFF:      kubectl logs -f -l app=api-bff -n video-app"
echo "   - Ver logs API Consumer: kubectl logs -f -l app=api-consumer -n video-app"
echo "   - Ver targets Prometheus: curl -s http://localhost:9090/api/v1/targets | python3 -c \"import sys,json; [print(f\\\"  {t['labels']['job']}: {t['health']}\\\") for t in json.load(sys.stdin)['data']['activeTargets']]\""
echo ""
