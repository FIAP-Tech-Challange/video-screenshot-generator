# Portas e Swagger – Docker

Referência rápida das portas e URLs dos serviços quando executados com `docker compose up`.

---

## Serviços da aplicação

| Serviço | Porta | URL | Descrição |
|---------|-------|-----|-----------|
| **Frontend** | 4200 | http://localhost:4200 | Interface Angular |
| **api-bff** | 3000 | http://localhost:3000 | API principal (auth, jobs) |
| **api-consumer** | 3001 | http://localhost:3001 | Processamento de vídeos |

---

## Swagger (OpenAPI)

| Serviço | URL | Observação |
|---------|-----|------------|
| **api-consumer** | http://localhost:3001/docs | Documentação interativa da API |

O **api-bff** ainda não possui Swagger configurado.

---

## Infraestrutura

| Serviço | Porta | URL | Descrição |
|---------|-------|-----|-----------|
| **PostgreSQL** | 5432 | localhost:5432 | Banco de dados |
| **MinIO** | 9000 | http://localhost:9000 | Armazenamento S3-compatível |
| **MinIO Console** | 9001 | http://localhost:9001 | Interface web do MinIO |
| **Kafka** | 9092 | localhost:9092 | Message broker |
| **Kafdrop** | 19000 | http://localhost:19000 | UI para Kafka (tópicos, consumidores) |

---

## Variáveis de ambiente (portas)

As portas podem ser alteradas no `.env`:

| Variável | Padrão | Serviço |
|----------|--------|---------|
| `POSTGRES_PORT` | 5432 | PostgreSQL |
| `API_BFF_PORT` | 3000 | api-bff |
| `API_CONSUMER_PORT` | 3001 | api-consumer |
| `FRONTEND_PORT` | 4200 | Frontend |
| `MINIO_PORT` | 9000 | MinIO API |
| `MINIO_CONSOLE_PORT` | 9001 | MinIO Console |
| `KAFKA_HOST_PORT` | 9092 | Kafka |

---

## Comandos úteis

```bash
# Subir toda a stack
docker compose up -d --build

# Subir apenas frontend + api-bff (para testes)
docker compose up -d --build frontend

# Ver logs
docker compose logs -f api-bff
```
