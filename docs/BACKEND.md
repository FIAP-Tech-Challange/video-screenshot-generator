# Documentação do Backend

Visão geral da arquitetura, fluxo e APIs do backend do Video Screenshot Generator.

---

## Arquitetura

O backend é composto por dois serviços NestJS em um monorepo:

| Serviço       | Porta | Descrição                                      |
|---------------|-------|------------------------------------------------|
| **api-bff**   | 3000  | Backend for Frontend – autenticação, jobs, upload |
| **api-consumer** | 3001 | Consumidor Kafka – processamento de vídeos, screenshots |

Ambos compartilham o mesmo banco PostgreSQL e a tabela `video_processing_jobs`.

---

## Fluxo de Processamento de Vídeo

```
┌─────────────┐    1. POST /api/video-processing-job (JWT)
│   Frontend  │       → Retorna: { job, uploadUrl }
└──────┬──────┘
       │
       │ 2. PUT do vídeo na URL presigned (MinIO)
       ▼
┌─────────────┐    3. MinIO emite evento no tópico Kafka "upload-video"
│    MinIO    │
└──────┬──────┘
       │
       │ 4. api-consumer consome o evento Kafka
       ▼
┌─────────────────┐  5. EventService.handleVideoUpload()
│  api-consumer   │       - Baixa vídeo do MinIO
│                 │       - Gera screenshots (FFmpeg)
│                 │       - Compacta em ZIP
│                 │       - Faz upload do ZIP no bucket de screenshots
│                 │       - Atualiza status do job (SUCCESS/ERROR)
└─────────────────┘
```

### Detalhes do fluxo

1. **Criação do job (api-bff):** O usuário chama `POST /api/video-processing-job` com `fileName`. O serviço cria um job (status `QUEUED`), gera URL presigned para `{userId}/{jobId}/{fileName}` e retorna ambos.
2. **Upload:** O frontend faz upload do vídeo diretamente no MinIO usando a URL presigned.
3. **Evento:** O MinIO envia um evento `put` para o tópico Kafka `upload-video`.
4. **Processamento (api-consumer):** O consumidor Kafka recebe o evento. O `EventService` baixa o vídeo, gera screenshots via FFmpeg, compacta em ZIP, faz upload no bucket de screenshots e atualiza o status do job no banco.

---

## API Reference

### api-bff (base: `http://localhost:3000/api`)

Todas as rotas têm o prefixo global `/api`.

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/health` | Não | Health check |
| POST | `/api/auth/register` | Não | Cadastro de usuário |
| POST | `/api/auth/login` | Não | Login (retorna JWT) |
| GET | `/api/video-processing-job` | JWT | Lista jobs do usuário |
| POST | `/api/video-processing-job` | JWT | Cria job e retorna URL de upload |

#### GET `/api/health`

**Resposta:** `{ "status": "ok" }`

---

#### POST `/api/auth/register`

**Body:**
```json
{
  "name": "Fulano Silva",
  "email": "fulano@email.com",
  "password": "Senha123!"
}
```

**Resposta:** `{ "id": "...", "name": "Fulano Silva", "email": "fulano@email.com" }`

---

#### POST `/api/auth/login`

**Body:**
```json
{
  "email": "fulano@email.com",
  "password": "Senha123!"
}
```

**Resposta:**
```json
{
  "accessToken": "eyJ...",
  "user": { "id": "...", "email": "...", "name": "..." }
}
```

---

#### GET `/api/video-processing-job`

**Headers:** `Authorization: Bearer <JWT>`

**Resposta:** Array de jobs do usuário, ordenados por data (mais recentes primeiro):
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "fileName": "meu-video.mp4",
    "status": "success",
    "errorReason": null,
    "createdAt": "2025-02-28T12:00:00.000Z",
    "processedAt": "2025-02-28T12:01:00.000Z"
  }
]
```

---

#### POST `/api/video-processing-job`

**Headers:** `Authorization: Bearer <JWT>`

**Body:**
```json
{
  "fileName": "meu-video.mp4"
}
```

**Resposta:**
```json
{
  "job": {
    "id": "uuid",
    "userId": "uuid",
    "fileName": "meu-video.mp4",
    "status": "queued",
    "errorReason": null,
    "createdAt": "2025-02-28T...",
    "processedAt": null
  },
  "uploadUrl": "http://minio:9000/video/..."
}
```

**Status do job:** `queued` → `processing` → `success` ou `error`

---

### api-consumer (base: `http://localhost:3001`)

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/health` | Não | Health check |
| POST | `/v1/consumer/presigned-url` | Não | URL presigned para upload |
| POST | `/v1/consumer/generate-screenshots` | Não | Gera screenshots a partir da key do vídeo |
| POST | `/v1/consumer/download-screenshots` | Não | URL presigned para download do ZIP |

#### GET `/health`

**Resposta:** `{ "message": "App is up" }`

---

#### POST `/v1/consumer/presigned-url`

Gera URL presigned para upload de vídeo (uso alternativo ao fluxo via api-bff).

**Resposta:**
```json
{
  "url": "http://minio:9000/video/...",
  "key": "20250228uuid.mp4"
}
```

---

#### POST `/v1/consumer/generate-screenshots`

**Body:**
```json
{
  "key": "userId/jobId/video.mp4",
  "count": 5
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| key | string | Sim | Key do vídeo no bucket |
| count | number | Não | Quantidade de screenshots (padrão definido internamente) |

**Resposta:**
```json
{
  "message": "Screenshots generated and uploaded successfully",
  "path": "screenshot/20250228uuid.zip",
  "key": "20250228uuid.zip"
}
```

---

#### POST `/v1/consumer/download-screenshots`

**Body:**
```json
{
  "key": "20250228uuid.zip"
}
```

**Resposta:**
```json
{
  "url": "http://minio:9000/screenshot/...?X-Amz-...",
  "expiresIn": 3600
}
```

---

## Swagger (OpenAPI)

O **api-consumer** expõe documentação Swagger em:

**URL:** `http://localhost:3001/docs`

O spec OpenAPI é gerado em `projects/api-consumer/swagger-docs.json` na inicialização.

O **api-bff** não possui Swagger configurado atualmente.

---

## Variáveis de Ambiente

### api-bff

| Variável | Descrição |
|----------|-----------|
| PORT | Porta do servidor (ex: 3000) |
| DB_URL | URL de conexão PostgreSQL |
| DB_LOGGING | Log de queries SQL |
| JWT_SECRET | Chave para assinatura do JWT |
| MINIO_URL | URL do MinIO |
| MINIO_ACCESS_KEY | Access key do MinIO |
| MINIO_SECRET_KEY | Secret key do MinIO |
| BUCKET_VIDEO_NAME | Nome do bucket de vídeos |
| BUCKET_REGION | Região do bucket |
| MAX_FILE_SIZE_MB | Tamanho máximo de arquivo (MB) |

### api-consumer

| Variável | Descrição |
|----------|-----------|
| PORT | Porta do servidor (ex: 3001) |
| DB_URL | URL de conexão PostgreSQL |
| DB_LOGGING | Log de queries SQL |
| MINIO_URL | URL do MinIO |
| MINIO_ACCESS_KEY | Access key do MinIO |
| MINIO_SECRET_KEY | Secret key do MinIO |
| BUCKET_VIDEO_NAME | Nome do bucket de vídeos |
| BUCKET_SCREENSHOT_NAME | Nome do bucket de screenshots |
| BUCKET_REGION | Região do bucket |
| KAFKA_BROKER | Endereço do broker Kafka |

---

## Executando os serviços

```bash
# Na raiz do projeto
cp .env.example .env
docker compose up -d --build
```

- api-bff: http://localhost:3000
- api-consumer: http://localhost:3001
- frontend: http://localhost:4200
- Swagger: http://localhost:3001/docs
