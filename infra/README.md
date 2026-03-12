# Infraestrutura - Video Screenshot Generator

Este diretório contém os recursos de infraestrutura do projeto: banco de dados, storage (MinIO), monitoramento (Grafana) e orquestração Kubernetes.

## Estrutura

```
infra/
├── database/          # Migrações TypeORM + container db-migrate
├── minio/             # Inicialização do MinIO (buckets, Kafka notifications)
├── grafana/           # Provisioning de datasources e dashboards
├── k8s/               # Deploy Kubernetes (Minikube) + scripts
└── README.md          # Este arquivo
```

## Uso

A infraestrutura é executada pelo **docker-compose na raiz** do projeto:

```bash
# Na raiz (video-screenshot-generator)
docker compose up -d
```

Cada pasta é referenciada pelo `docker-compose.yml` ou pelo `docker-compose.infra.yml` (quando usar K8s).

---

## database/

Módulo de **migrações** do banco PostgreSQL com TypeORM.

### Responsabilidades
- Executar migrations na subida do ambiente
- Tabelas: `users`, `video_processing_jobs`, `notifications`

### Estrutura

```
database/
├── Dockerfile
├── package.json
├── src/
│   ├── data-source.ts      # Configuração TypeORM
│   └── migration/
│       ├── 1770086607759-CreateUsersTable.ts
│       ├── 1770689576964-CreateVideoProcessingJobTable.ts
│       └── 1780000000000-CreateNotificationTable.ts
└── README.md
```

### Execução
- **Via Docker Compose:** o serviço `db-migrate` roda após o Postgres estar healthy
- **Local:** `npm run migration:run` (requer `DB_URL` no `.env`)

### Variáveis
| Variável | Descrição |
|----------|-----------|
| `DB_URL` | Connection string PostgreSQL |
| `DB_LOGGING` | `true` para log de queries |

---

## minio/

**Inicialização** do MinIO: buckets, notificação Kafka e eventos de upload.

### Responsabilidades
- Criar buckets `video` e `screenshot`
- Configurar notificação Kafka (put no bucket de vídeos → tópico Kafka)
- Aguardar MinIO e Kafka estarem prontos

### Estrutura

```
minio/
├── Dockerfile     # Alpine + MinIO Client (mc)
└── init.sh        # Script de inicialização (buckets + Kafka)
```

### Variáveis
| Variável | Descrição |
|----------|-----------|
| `MINIO_URL` | URL do MinIO (ex: `http://minio:9000`) |
| `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` | Credenciais |
| `BUCKET_VIDEO_NAME` / `BUCKET_SCREENSHOT_NAME` | Nomes dos buckets |
| `MINIO_KAFKA_TOPIC` | Tópico Kafka para eventos de upload |
| `KAFKA_BROKERS_INTERNAL` | Brokers Kafka para notificação |

### Fluxo
1. Conecta ao MinIO e aguarda ficar disponível
2. Configura target Kafka
3. Reinicia MinIO para aplicar config
4. Cria buckets e associa evento `put` ao bucket de vídeos

---

## grafana/

**Provisioning** de datasources e dashboards do Grafana.

### Estrutura

```
grafana/
├── provisioning/
│   ├── datasources.yml    # Datasource Prometheus
│   └── dashboards.yml     # Provider de dashboards
└── dashboards/
    ├── api.json           # Métricas das APIs (BFF, Consumer)
    ├── kafka.json         # Métricas Kafka
    └── postgres.json      # Métricas PostgreSQL
```

### Configuração
- **Datasource:** Prometheus em `http://prometheus:9090`
- **Dashboards:** carregados de `/var/lib/grafana/dashboards`
- Porta padrão: `3005` (mapeada de 3000 no container)

### Variáveis
| Variável | Descrição |
|----------|-----------|
| `GRAFANA_ADMIN_PASSWORD` | Senha do usuário admin |

---

## k8s/

Deploy das **aplicações** (frontend, api-bff, api-consumer) no **Kubernetes** (Minikube) com infraestrutura em **Docker Compose**.

### Conteúdo
- Manifests base (Kustomize)
- Overlay `dev`
- Scripts `full-setup.sh` e `cleanup-all.sh`
- `docker-compose.infra.yml` para a infraestrutura

### Documentação
Consulte **[infra/k8s/README.md](k8s/README.md)** para:
- Arquitetura (Minikube + Docker Compose)
- Setup automatizado ou manual
- Serviços disponíveis
- Monitoramento e troubleshooting

---

## Resumo dos serviços (Docker Compose raiz)

| Serviço | Origem | Descrição |
|---------|--------|-----------|
| `postgres` | imagem postgres:15 | Banco de dados |
| `db-migrate` | `infra/database` | Migrações TypeORM |
| `minio` | imagem minio/minio | Storage S3-compatible |
| `minio-init` | `infra/minio` | Criação de buckets e eventos |
| `grafana` | imagem grafana/grafana | Dashboards (volume `infra/grafana`) |
| `prometheus` | imagem prometheus | Métricas (config na raiz: `prometheus.yml`) |

O **K8s** usa `infra/k8s/docker-compose.infra.yml` para subir apenas a infraestrutura, e as aplicações rodam nos pods.
