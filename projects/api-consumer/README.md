# API Consumer - Video Screenshot Generator

Serviço consumidor de eventos Kafka que processa vídeos enviados ao MinIO, gera screenshots via FFmpeg e notifica o usuário por e-mail.

## Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| NestJS | 11.x | Framework principal |
| TypeScript | 5.x | Linguagem |
| KafkaJS | 2.x | Consumidor Kafka |
| TypeORM | 0.3.x | ORM para PostgreSQL |
| PostgreSQL | 15 | Banco de dados (compartilhado com api-bff) |
| FFmpeg (fluent-ffmpeg) | 2.x | Geração de screenshots de vídeo |
| MinIO (S3) | AWS SDK | Storage de vídeos e screenshots |
| Nodemailer | 8.x | Envio de e-mails |
| Swagger | 11.x | Documentação da API |
| Prometheus | prom-client | Métricas |

## Arquitetura

Arquitetura hexagonal com módulos bem definidos:

```
src/
├── main.ts                    # Bootstrap + microserviço Kafka
├── app.module.ts
├── config/                    # validate-env, typeorm, health
│   └── health/                # GET /health
├── docs/                      # Swagger
└── modules/
    ├── event/                 # Consumidor Kafka, orquestra o fluxo
    │   ├── adapters/primary/  # EventController (HTTP opcional)
    │   ├── services/          # EventService (handleVideoUpload)
    │   ├── ports/             # EventServicePort
    │   └── types/             # UploadObjectEventPayload
    ├── video-processing/      # Repositório de jobs, atualização de status
    │   ├── adapters/secondary/database/  # VideoProcessingRepositoryAdapter
    │   ├── services/          # VideoProcessingService
    │   └── models/            # Entidades (job, user)
    ├── storage/               # MinIO, FFmpeg, geração de screenshots
    │   ├── adapters/secondary/  # S3StorageAdapter, FfmpegVideoAdapter
    │   ├── services/          # StorageService (generateAndSaveScreenshots)
    │   └── ports/             # FileStoragePort, VideoProcessorPort
    ├── notification/          # Notificações no banco
    └── mail/                  # E-mail (Nodemailer)
```

## Fluxo de processamento

1. **MinIO** envia evento `put` para o tópico Kafka `upload-video` quando um vídeo é enviado
2. **EventService** consome o evento e valida o payload (apenas MP4)
3. **StorageService** baixa o vídeo do MinIO, gera screenshots via FFmpeg, compacta em ZIP e faz upload no bucket de screenshots
4. **VideoProcessingService** atualiza o status do job (SUCCESS ou ERROR)
5. **MailService** envia e-mail de sucesso ou erro ao usuário
6. **NotificationService** persiste notificação no banco

## Endpoints HTTP

O serviço também expõe rotas REST (para uso alternativo ou testes):

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Health check |
| GET | `/metrics` | Métricas Prometheus |
| GET | `/docs` | Documentação Swagger interativa |

## Execução

### Via Docker Compose (recomendado)

Todas as aplicações do projeto são executadas pelo **docker-compose na raiz** do repositório:

```bash
# Na raiz do projeto (video-screenshot-generator)
docker compose up -d --build
```

O `api-consumer` sobe após Postgres, migrations, Kafka, MinIO (init) e Prometheus.

- **URL:** http://localhost:3001  
- **Health:** http://localhost:3001/health  
- **Swagger:** http://localhost:3001/docs  
- **Porta:** configurável via `API_CONSUMER_PORT` no `.env`

### Isolado (desenvolvimento)

```bash
cd projects/api-consumer
npm install
npm run start:dev
```

Requisições: PostgreSQL, Kafka, MinIO, e SMTP configurado.

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `PORT` / `API_CONSUMER_PORT` | Porta do servidor (padrão 3001) |
| `DB_URL` | Connection string PostgreSQL |
| `KAFKA_BROKER` | Brokers Kafka (ex: `kafka:9093`) |
| `MINIO_URL` | URL do MinIO |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | Credenciais MinIO |
| `BUCKET_VIDEO_NAME` / `BUCKET_SCREENSHOT_NAME` | Nomes dos buckets |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Configuração SMTP |

## Scripts

```bash
npm run start:dev   # Desenvolvimento com watch
npm run start:prod  # Produção
npm test            # Testes unitários
npm run test:cov    # Cobertura
npm run lint        # ESLint
```

## Integração com o restante do sistema

- **api-bff**: Cria jobs e URLs presigned; o frontend faz upload direto no MinIO
- **api-consumer**: Consome eventos Kafka do MinIO, processa vídeos e atualiza os mesmos jobs no banco compartilhado
- O frontend consulta o `api-bff` para listar jobs e obter o link de download das screenshots

## Licença

UNLICENSED – Video Screenshot Generator
