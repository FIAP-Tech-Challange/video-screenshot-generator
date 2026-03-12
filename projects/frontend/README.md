# Frontend - Video Screenshot Generator

Interface web desenvolvida com Angular 17 e Ng-Zorro-Antd. Consome o **api-bff** (porta 3000) como backend principal. Faz parte de um monorepo cujas aplicações são orquestradas pelo **docker-compose na raiz** do projeto.

## Execução

### Via Docker Compose (recomendado)

Todas as aplicações do projeto são executadas pelo **docker-compose na raiz** do repositório:

```bash
# Na raiz do projeto (video-screenshot-generator)
docker compose up -d --build
```

O frontend sobe após o `api-bff` estar saudável.

- **URL:** http://localhost:4200 (ou porta definida em `FRONTEND_PORT`)
- **Proxy:** em Docker, requisições `/api` são encaminhadas para `api-bff:3000`

### Isolado (desenvolvimento)

```bash
cd projects/frontend
npm install
npm start
```

O proxy (`proxy.conf.json`) encaminha `/api` para `http://localhost:3000` (api-bff).

---

## 🚀 Tecnologias

- **Angular 17.3** - Framework principal
- **Ng-Zorro-Antd 17.4** - Biblioteca de componentes UI
- **TypeScript 5.4** - Linguagem de programação
- **SCSS** - Pré-processador CSS
- **Jest** - Framework de testes
- **ESLint** - Linter de código
- **RxJS 7.8** - Programação reativa

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── auth/                    # Autenticação (login, cadastro, guards)
│   │   ├── components/          # Login e Register
│   │   ├── guards/              # authGuard (proteção de rotas)
│   │   ├── services/            # AuthService, ValidatorsService
│   │   ├── utils/               # Validação CPF e senha
│   │   └── models/              # LoginCredentials, RegisterUser
│   ├── core/                    # Interceptors, serviços globais
│   │   ├── interceptors/        # auth.interceptor, http-error.interceptor
│   │   ├── models/              # Interfaces e tipos
│   │   └── services/            # ApiService
│   ├── shared/                  # Componentes reutilizáveis
│   │   ├── components/          # password-strength, loading
│   │   └── pipes/               # Pipes customizados
│   ├── modules/                 # Módulos de funcionalidade
│   │   ├── dashboard/           # Dashboard (cards, estatísticas, atividade)
│   │   ├── upload/              # Upload de vídeo (drag & drop, preview)
│   │   ├── videos/              # Meus Vídeos (lista)
│   │   └── settings/            # Configurações de perfil e segurança
│   ├── layouts/                 # Layout principal (sidebar VideoFlow, rotas ativas)
│   ├── app.component.ts         # Componente raiz
│   ├── app.config.ts            # Configuração (rotas, HTTP, interceptors)
│   └── app.routes.ts            # Rotas: /login, /register, /dashboard (protegido)
├── assets/                      # Arquivos estáticos
├── environments/                # Configurações de ambiente
├── index.html                   # HTML principal
├── main.ts                      # Entry point
└── styles.scss                  # Estilos globais
```

## 🔧 Configuração Inicial

### Pré-requisitos

- Node.js 20.x ou superior
- npm 10.x ou superior

### Instalação

```bash
# Instalar dependências
npm install

# Ou com legacy peer deps (recomendado para compatibilidade)
npm install --legacy-peer-deps
```

## 📜 Scripts Disponíveis

```bash
# Desenvolvimento
npm start                 # Inicia o servidor de desenvolvimento (http://localhost:4200)

# Build
npm run build             # Build de produção
npm run build:prod        # Build de produção (alias)
npm run watch             # Build em modo watch

# Testes
npm test                  # Executar testes com Jest
npm run test:watch        # Executar testes em modo watch
npm run test:coverage     # Executar testes com cobertura

# Linting
npm run lint              # Executar ESLint
npm run lint:fix          # Executar ESLint com auto-fix
```

## 🌍 Ambientes e integração

O frontend se comunica apenas com o **api-bff** (porta 3000). O **api-consumer** (porta 3001) é acionado automaticamente pelo Kafka e não é chamado pelo frontend.

| Ambiente | URL base | Descrição |
|----------|----------|-----------|
| Dev local | `/api` | Proxy encaminha para `http://localhost:3000` |
| Docker | `/api` | Proxy encaminha para `http://api-bff:3000` |
| Produção | `/api` | Relativo ao domínio da aplicação |

Configuração do proxy: `proxy.conf.json` (local) / `proxy.conf.docker.json` (Docker)

## 🎨 Biblioteca de UI (Ng-Zorro-Antd)

O projeto utiliza o Ng-Zorro-Antd com os seguintes módulos configurados:

- **Layout**: Header, Sidebar, Content, Footer
- **Forms**: Input, FormControl, Validation
- **Buttons**: Primary, Default, Dashed, Link
- **Cards**: Cards informativos
- **Statistics**: Componentes de estatísticas
- **Icons**: Suporte a ícones Ant Design
- **Grid**: Sistema de grid responsivo

### Tema e Estilos

O projeto está configurado com:

- Localização pt_BR
- Estilos customizados em `styles.scss`
- Background padrão: `#f0f2f5`

## 🧪 Testes

O projeto utiliza Jest como framework de testes, substituindo o Karma/Jasmine padrão do Angular.

### Configuração do Jest

- **Preset**: `jest-preset-angular`
- **Setup**: `setup-jest.ts` com mocks de window.matchMedia
- **Coverage**: Habilitado por padrão
- **Reporters**: HTML, Text, LCOV

### Executar Testes

```bash
# Todos os testes
npm test

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage
```

## 🔒 Autenticação (Login e Cadastro)

### Funcionalidades

- **Login** (`/login`): email e senha (mín. 8 caracteres). Validação em tempo real. Link para criar conta.
- **Cadastro** (`/register`): email, senha (8+ caracteres, 1 maiúscula, 1 especial), confirmação de senha, telefone (máscara brasileira), CPF (validação e formatação XXX.XXX.XXX-XX). Indicador visual de força da senha. Link para login.
- **Guards**: `authGuard` protege rotas privadas; redireciona para `/login` se não autenticado.
- **AuthService** (mock): login/register com delay, persistência em `localStorage`, logout com redirecionamento.
- **Interceptor**: `auth.interceptor` adiciona o token Bearer nas requisições HTTP.

### Validações

- **CPF**: válido (dígitos verificadores) e formatação automática.
- **Senha**: mínimo 8 caracteres, 1 maiúscula, 1 caractere especial.
- **Telefone**: 10 ou 11 dígitos, máscara `(XX) XXXXX-XXXX`.
- **Confirmação de senha**: validação cruzada no formulário.

## 🚦 Rotas

### Rotas Públicas

- `/login` - Página de login
- `/register` - Página de cadastro

### Rotas Privadas (requerem autenticação)

- `/dashboard` - Dashboard (cards, estatísticas, atividade recente, atalho para upload)
- `/upload` - Upload de vídeo (drag & drop, MP4/MOV/AVI/MKV/WebM, preview)
- `/videos` - Meus Vídeos (lista; empty state com link para upload)
- `/settings` - Configurações (avatar, perfil, segurança)
- `/` - Redireciona para `dashboard`

Todas as rotas privadas utilizam **lazy loading** para otimização de performance.

## 📦 Build de Produção

```bash
npm run build:prod
```

O build de produção inclui:

- ✅ Otimização de código
- ✅ Minificação
- ✅ Tree shaking
- ✅ Output hashing para cache busting
- ✅ Extração de licenças
- ✅ Source maps desabilitados

**Output**: `dist/frontend/`

### Limites de Bundle

- **Initial**: Warning: 2MB, Error: 5MB
- **Styles**: Warning: 6KB, Error: 10KB

## 🎯 Boas Práticas Implementadas

### Arquitetura

- ✅ Standalone Components (Angular 17)
- ✅ Lazy Loading para módulos de funcionalidade
- ✅ Separação clara entre Core, Shared e Feature modules
- ✅ Guards funcionais modernos
- ✅ Interceptors funcionais

### Código

- ✅ Uso de `inject()` ao invés de constructor injection
- ✅ Control Flow moderno (`@if`, `@else`) ao invés de `*ngIf`
- ✅ Tipagem forte com TypeScript
- ✅ ESLint configurado com regras do Angular
- ✅ Acessibilidade (aria-labels, keyboard events)

### Performance

- ✅ Lazy loading de rotas
- ✅ OnPush change detection (onde aplicável)
- ✅ Tree-shakeable providers
- ✅ Otimização de imports

## 🔧 Configuração do ESLint

O projeto utiliza ESLint com as seguintes configurações:

- `@eslint/js` - Configuração base
- `typescript-eslint` - Regras TypeScript
- `angular-eslint` - Regras específicas do Angular

### Regras Principais

- Uso obrigatório de `inject()` sobre constructor injection
- Uso de control flow moderno
- Acessibilidade em templates
- Convenções de nomenclatura (kebab-case para componentes, camelCase para diretivas)

## 🐛 Troubleshooting

### Erro: Could not resolve "@ctrl/tinycolor"

```bash
npm install @ctrl/tinycolor --legacy-peer-deps
```

### Conflitos de dependências

Use a flag `--legacy-peer-deps` ao instalar pacotes:

```bash
npm install <package> --legacy-peer-deps
```

### Testes falhando

Certifique-se de que todos os providers necessários estão configurados no TestBed:

```typescript
TestBed.configureTestingModule({
  imports: [YourComponent],
  providers: [provideRouter([]), provideAnimations()],
});
```

## 📝 TODOs

### Autenticação

- [ ] Implementar serviço de autenticação
- [ ] Conectar login com backend
- [ ] Implementar refresh token
- [ ] Adicionar storage de token

### Funcionalidades

- [ ] Implementar CRUD de vídeos
- [ ] Implementar geração de screenshots
- [ ] Adicionar upload de arquivos
- [ ] Implementar notificações toast

### Melhorias

- [ ] Adicionar loading states
- [ ] Implementar error handling global
- [ ] Adicionar modo dark
- [ ] Implementar internacionalização (i18n)

## 🤝 Contribuindo

1. Siga as convenções de código do ESLint
2. Escreva testes para novas funcionalidades
3. Mantenha a cobertura de testes acima de 80%
4. Use commits semânticos

## 📄 Licença

Este projeto faz parte do Video Screenshot Generator.

## 📞 Suporte

Para problemas ou dúvidas, consulte a documentação do Angular ou Ng-Zorro-Antd:

- [Angular Documentation](https://angular.dev/)
- [Ng-Zorro-Antd Documentation](https://ng.ant.design/)
