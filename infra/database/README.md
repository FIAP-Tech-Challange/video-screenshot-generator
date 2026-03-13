# Database - Migrações TypeORM

Módulo de migrações do banco PostgreSQL para o Video Screenshot Generator.

## Migrações

| Arquivo | Descrição |
|---------|-----------|
| `1770086607759-CreateUsersTable.ts` | Tabela `users` |
| `1770689576964-CreateVideoProcessingJobTable.ts` | Tabela `video_processing_jobs` |
| `1780000000000-CreateNotificationTable.ts` | Tabela `notifications` |

## Execução

### Via Docker Compose (recomendado)

O serviço `db-migrate` é executado automaticamente na raiz do projeto:

```bash
docker compose up -d
```

Aguarda o Postgres estar healthy e executa `npm run migration:run`.

### Local

```bash
cd infra/database
npm install
export DB_URL="postgresql://user:pass@localhost:5432/db"
npm run migration:run
```

## Scripts

```bash
npm run migration:run    # Executa migrations pendentes
npm run migration:revert # Reverte última migration
npm run migration:create # Cria nova migration (passar nome)
```

## Variáveis

| Variável | Descrição |
|----------|-----------|
| `DB_URL` | Connection string PostgreSQL |
| `DB_LOGGING` | `true` para log de queries |
