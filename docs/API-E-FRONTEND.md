# API e integração com o frontend

## Etapa 1: Validar as APIs (cadastro e login)

### Pré-requisitos
- Docker e Docker Compose instalados (Docker Desktop no Windows)
- Arquivo `.env` na raiz do projeto (copiado de `.env.example` se ainda não existir)

### Subir os serviços
Na raiz do projeto:

```bash
# Criar .env a partir do exemplo (se ainda não tiver)
cp .env.example .env

# Instalar dependências das migrations (opcional; o container também roda npm install)
cd infra/database && npm install && cd ../..

# Subir Postgres, migrations, API BFF e Minio
docker compose up -d --build
```

Aguarde os containers ficarem saudáveis (principalmente `api-bff` e `postgres`).

### Testar a API

**Health:**
```bash
curl http://localhost:3000/health
# Resposta esperada: {"status":"ok"}
```

**Cadastro (register):**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Fulano Silva\",\"email\":\"fulano@email.com\",\"password\":\"Senha123!\"}"
```
Resposta esperada: `{"id":"...","name":"Fulano Silva","email":"fulano@email.com"}`

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"fulano@email.com\",\"password\":\"Senha123!\"}"
```
Resposta esperada: `{"accessToken":"eyJ..."}`

---

## Etapa 2 e 3: Frontend integrado

- **Cadastro:** o formulário envia apenas `name`, `email` e `password` para a API. O campo **Confirmar senha** permanece no frontend (validação local).
- **Login:** o frontend chama `POST /auth/login`, armazena o `accessToken` e os dados do usuário (via JWT e resposta do registro).
- **URL da API:** configurada em `projects/frontend/src/environments/environment.ts` (`apiUrl: 'http://localhost:3000'`).

Para testar a integração:

1. Subir a API (Docker ou `npm run start:dev` em `projects/api-bff`).
2. Subir o frontend: `cd projects/frontend && npm start`.
3. Acessar http://localhost:4200, criar conta e fazer login.
