# API BFF - Video Screenshot Generator

Backend for Frontend que expõe autenticação, gerenciamento de jobs de processamento de vídeo e URLs presigned para upload no MinIO.

## Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| NestJS | 11.x | Framework principal |
| TypeScript | 5.x | Linguagem |
| TypeORM | 0.3.x | ORM para PostgreSQL |
| PostgreSQL | 15 | Banco de dados |
| Redis | 8 | Cache |
| MinIO | S3-compatible | Storage de vídeos e screenshots |
| JWT | Passport | Autenticação |
| Prometheus | prom-client | Métricas |

## Arquitetura

```
src/
├── main.ts                    # Bootstrap (prefixo global /api)
├── app.module.ts
├── app.controller.ts          # GET /api/health
├── common/                    # Filtros de exceção
├── config/                    # validate-env, typeorm
└── modules/
    ├── auth/                  # JWT, login, register
    ├── users/                 # CRUD de usuários
    ├── video-processing-job/  # Criação de jobs, URL presigned, download de screenshots
    ├── storage/               # Cliente MinIO (S3)
    └── cache/                 # Cache com Redis
```

## Endpoints

| Método | Endpoint | Auth | Descrição |
|--------|----------|------|-----------|
| GET | `/api/health` | Não | Health check |
| GET | `/metrics` | Não | Métricas Prometheus |
| POST | `/api/auth/register` | Não | Cadastro de usuário |
| POST | `/api/auth/login` | Não | Login (retorna JWT) |
| GET | `/api/video-processing-job` | JWT | Lista jobs do usuário |
| POST | `/api/video-processing-job` | JWT | Cria job e retorna URL presigned para upload |
| GET | `/api/video-processing-job/:jobId/screenshots` | JWT | URL de download do ZIP de screenshots |

## Execução

### Via Docker Compose (recomendado)

Todas as aplicações do projeto são executadas pelo **docker-compose na raiz** do repositório:

```bash
# Na raiz do projeto (video-screenshot-generator)
docker compose up -d --build
```

O `api-bff` sobe automaticamente após o Postgres, migrations, Redis e Prometheus.

- **URL:** http://localhost:3000  
- **Health:** http://localhost:3000/api/health  
- **Porta:** configurável via `API_BFF_PORT` no `.env`

### Isolado (desenvolvimento)

```bash
cd projects/api-bff
npm install
npm run start:dev
```

Requisições: PostgreSQL, Redis e MinIO em execução (ex.: via `docker compose up postgres redis minio`).

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `PORT` / `API_BFF_PORT` | Porta do servidor (padrão 3000) |
| `DB_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | Chave para assinatura JWT |
| `REDIS_URL` | URL do Redis (ex: `redis://localhost:6379`) |
| `MINIO_URL` | URL do MinIO |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | Credenciais MinIO |
| `BUCKET_VIDEO_NAME` / `BUCKET_SCREENSHOT_NAME` | Nomes dos buckets |
| `MAX_FILE_SIZE_MB` | Tamanho máximo de arquivo (MB) |

## Scripts

```bash
npm run start:dev   # Desenvolvimento com watch
npm run start:prod  # Produção
npm test            # Testes unitários
npm run test:cov    # Cobertura
npm run lint        # ESLint
```

## Fluxo de dados

O frontend chama o `api-bff` diretamente. Para upload de vídeo:

1. `POST /api/video-processing-job` com `fileName` → retorna `job` e `uploadUrl`
2. O frontend faz `PUT` do vídeo na `uploadUrl` (MinIO)
3. O MinIO emite evento no Kafka; o **api-consumer** processa o vídeo e gera screenshots
4. O usuário busca o status e o download via `GET /api/video-processing-job` e `GET /api/video-processing-job/:id/screenshots`

## Licença

UNLICENSED – Video Screenshot Generator
