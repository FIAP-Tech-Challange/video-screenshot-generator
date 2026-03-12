# Kubernetes Deployment - Video Screenshot Generator

Deploy da aplicação **Video Screenshot Generator** usando **Kubernetes (Minikube)** para as aplicações e **Docker Compose** para a infraestrutura.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                       Windows (Navegador)                            │
│                                                                      │
│   http://localhost:4200       http://localhost:3000                  │
│      (Frontend)                  (API BFF)                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │ minikube tunnel
┌────────────────────────────▼────────────────────────────────────────┐
│                         WSL Ubuntu                                   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │          Minikube (Kubernetes) — namespace: video-app        │   │
│  │                                                              │   │
│  │   ┌────────────┐   ┌────────────┐   ┌──────────────────┐   │   │
│  │   │  frontend  │   │  api-bff   │   │   api-consumer   │   │   │
│  │   │ :4200 LB   │   │ :3000 LB   │   │ :3001 LB + HPA   │   │   │
│  │   └────────────┘   └────────────┘   └──────────────────┘   │   │
│  └──────────────────────────┬───────────────────────────────────┘   │
│                             │ rede: k8s_microservices               │
│  ┌──────────────────────────▼───────────────────────────────────┐   │
│  │              Docker Compose (infraestrutura)                  │   │
│  │                                                               │   │
│  │  Kafka (3 brokers)   PostgreSQL   MinIO   Redis               │   │
│  │  Prometheus :9090    Grafana :3005   Kafdrop :19000           │   │
│  └───────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### Aplicações (Kubernetes)
| Serviço | Tipo | Porta |
|---------|------|-------|
| `dev-frontend` | LoadBalancer | 4200 |
| `dev-api-bff` | LoadBalancer | 3000 |
| `dev-api-consumer` | LoadBalancer + HPA (1-10 replicas) | 3001 |

### Infraestrutura (Docker Compose)
| Serviço | Porta |
|---------|-------|
| Kafka (3 brokers) | 9092-9094 |
| PostgreSQL | 5432 |
| MinIO | 9000 / 9001 (console) |
| Redis | 6379 |
| Prometheus | 9090 |
| Grafana | 3005 |
| Kafdrop | 19000 |

---

## 📋 Pré-requisitos

- **Docker** instalado no WSL
- **Minikube** instalado no WSL
- **kubectl** instalado no WSL
- Arquivo **`.env`** configurado na raiz do projeto (`video-screenshot-generator/`)

---

## 🚀 Opção 1 — Script Automatizado (Recomendado)

### Setup completo (do zero)

```bash
cd infra/k8s/scripts
chmod +x full-setup.sh cleanup-all.sh
./full-setup.sh
```

O script executa automaticamente:
1. Cria a rede Docker `k8s_microservices`
2. Sobe toda a infraestrutura via Docker Compose
3. Cria o cluster Minikube
4. Conecta o Minikube à rede Docker
5. Builda as imagens (api-bff, api-consumer, frontend) dentro do Minikube
6. Faz o deploy no Kubernetes e aguarda os pods ficarem prontos
7. Descobre o IP do Minikube e as NodePorts dinamicamente e gera o `prometheus.yml`
8. Inicia o `minikube tunnel` em background

**Tempo estimado: ~5-8 minutos**

### Limpeza completa do ambiente

```bash
./infra/k8s/scripts/cleanup-all.sh
```

O script executa:
1. Para o `minikube tunnel`
2. Deleta o namespace `video-app` do Kubernetes
3. Deleta o cluster Minikube
4. Para os containers e remove volumes do Docker Compose
5. Remove a rede `k8s_microservices`
6. Limpa volumes Docker não utilizados

---

## 🔧 Opção 2 — Passo a Passo Manual

### Pré-requisito: DOCKER_HOST correto

Sempre que abrir um novo terminal WSL, garanta:

```bash
export DOCKER_HOST=unix:///var/run/docker.sock
unset MINIKUBE_ACTIVE_DOCKERD
```

> **Atenção:** o `minikube start` sobrescreve o `DOCKER_HOST`. Sempre restaure após executá-lo.

---

### Passo 1 — Criar a rede Docker

```bash
docker network create k8s_microservices
```

---

### Passo 2 — Subir a infraestrutura (Docker Compose)

```bash
cd video-screenshot-generator   # raiz do projeto
docker-compose -f infra/k8s/docker-compose.infra.yml --env-file .env up -d
```

Aguarde ~30 segundos para o cluster Kafka sincronizar.

---

### Passo 3 — Criar o cluster Minikube

```bash
minikube start --driver=docker --cpus=2 --memory=4096

# Restaurar DOCKER_HOST após o minikube start
export DOCKER_HOST=unix:///var/run/docker.sock
unset MINIKUBE_ACTIVE_DOCKERD
```

---

### Passo 4 — Conectar o Minikube à rede Docker

```bash
docker network connect k8s_microservices minikube
```

> Isso permite que os pods acessem Kafka, PostgreSQL, Redis e MinIO pelo nome DNS do serviço.

---

### Passo 5 — Buildar as imagens dentro do Minikube

```bash
eval $(minikube docker-env)

docker build -t api-bff:latest      -f projects/api-bff/Dockerfile      projects/api-bff
docker build -t api-consumer:latest -f projects/api-consumer/Dockerfile  projects/api-consumer
docker build -t frontend:latest     -f projects/frontend/Dockerfile      projects/frontend

# Restaurar DOCKER_HOST após o minikube docker-env
export DOCKER_HOST=unix:///var/run/docker.sock
unset MINIKUBE_ACTIVE_DOCKERD
```

---

### Passo 6 — Deploy no Kubernetes

```bash
cd infra/k8s
kubectl apply -k overlays/dev/

# Aguardar pods ficarem prontos
kubectl wait --for=condition=ready pod -l project=video-screenshot-generator -n video-app --timeout=300s
```

---

### Passo 7 — Configurar o Prometheus

O Prometheus (Docker Compose) acessa as APIs via **NodePort** do container Minikube, já que ambos estão na mesma rede Docker (`k8s_microservices`).

```bash
# Descobrir o IP do Minikube na rede k8s_microservices
MINIKUBE_IP=$(docker inspect minikube | python3 -c "
import sys, json
data = json.load(sys.stdin)[0]
nets = data['NetworkSettings']['Networks']
for name, cfg in nets.items():
    if 'k8s_microservices' in name:
        print(cfg['IPAddress'])
        exit()
")

# Descobrir as NodePorts
BFF_NODEPORT=$(kubectl get svc dev-api-bff -n video-app -o jsonpath='{.spec.ports[0].nodePort}')
CONSUMER_NODEPORT=$(kubectl get svc dev-api-consumer -n video-app -o jsonpath='{.spec.ports[0].nodePort}')

echo "Minikube IP: $MINIKUBE_IP"
echo "api-bff NodePort: $BFF_NODEPORT"
echo "api-consumer NodePort: $CONSUMER_NODEPORT"
```

Atualize o arquivo `prometheus.yml` na raiz do projeto com os valores obtidos e reinicie o Prometheus:

```bash
docker restart prometheus
```

---

### Passo 8 — Iniciar o minikube tunnel

```bash
nohup minikube tunnel > /tmp/minikube-tunnel.log 2>&1 &
```

> O tunnel expõe os serviços LoadBalancer em `127.0.0.1` (acessível no Windows via `localhost`).

---

## 🌐 Serviços Disponíveis

Após o setup completo:

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| API BFF | http://localhost:3000 |
| API BFF (Swagger) | http://localhost:3000/docs |
| API Consumer | http://localhost:3001 |
| Kafdrop (Kafka UI) | http://localhost:19000 |
| MinIO Console | http://localhost:9001 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3005 |

> **Grafana:** login `admin` / senha definida em `GRAFANA_ADMIN_PASSWORD` no `.env`

---

## 📊 Monitoramento

### Verificar targets do Prometheus

```bash
curl -s http://localhost:9090/api/v1/targets | python3 -c "
import sys, json
for t in json.load(sys.stdin)['data']['activeTargets']:
    print(f\"  {t['labels']['job']}: {t['health']} {t.get('lastError','')}\")
"
```

Todos os 4 targets devem estar `up`: `api-bff`, `api-consumer`, `kafka-exporter`, `postgres-exporter`.

### Verificar pods e services

```bash
kubectl get pods -n video-app
kubectl get svc -n video-app
kubectl get hpa -n video-app
```

### Ver logs das aplicações

```bash
kubectl logs -f -n video-app -l app=api-bff
kubectl logs -f -n video-app -l app=api-consumer
kubectl logs -f -n video-app -l app=frontend
```

### Verificar infraestrutura Docker Compose

```bash
DOCKER_HOST=unix:///var/run/docker.sock docker-compose -f infra/k8s/docker-compose.infra.yml ps
```

---

## 🔄 Rebuild de imagens após mudança no código

```bash
# Apontar para o daemon do Minikube
eval $(minikube docker-env)

# Reconstruir a imagem desejada
docker build -t api-bff:latest -f projects/api-bff/Dockerfile projects/api-bff

# Recriar o pod para usar a nova imagem
kubectl rollout restart deployment dev-api-bff -n video-app

# Restaurar DOCKER_HOST
export DOCKER_HOST=unix:///var/run/docker.sock
unset MINIKUBE_ACTIVE_DOCKERD
```

---

## 📝 Comandos Úteis

```bash
# Ver eventos do cluster (útil para debug)
kubectl get events -n video-app --sort-by='.lastTimestamp'

# Descrever um pod
kubectl describe pod -n video-app <pod-name>

# Executar shell em um pod
kubectl exec -it -n video-app <pod-name> -- sh

# Ver containers conectados à rede Docker
docker network inspect k8s_microservices

# Ver log do minikube tunnel
tail -f /tmp/minikube-tunnel.log
```

---

## 📁 Estrutura de Pastas

```
infra/k8s/
├── base/                        # Manifests base Kubernetes
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml             # (gitignored)
│   ├── api-bff/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   ├── api-consumer/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── hpa.yaml
│   └── frontend/
│       ├── deployment.yaml
│       └── service.yaml
├── overlays/
│   └── dev/                     # Overlay dev (adiciona prefixo "dev-")
│       └── kustomization.yaml
├── scripts/
│   ├── full-setup.sh            # Setup completo do zero
│   └── cleanup-all.sh           # Limpeza completa do ambiente
├── docker-compose.infra.yml     # Infraestrutura (Kafka, Postgres, etc.)
└── README.md
```

---

## 🔒 Segurança

- Secrets gerenciados via `secrets.yaml` (não commitado no git)
- Credenciais configuráveis via `.env` na raiz do projeto
- Senhas Kubernetes em base64 encoding