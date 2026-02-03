# Frontend - Video Screenshot Generator

Aplicação frontend desenvolvida com Angular 17 e ng-zorro-antd (Ant Design).

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
│   ├── core/                    # Serviços singleton, guards, interceptors
│   │   ├── guards/              # Guards de autenticação
│   │   ├── interceptors/        # Interceptors HTTP
│   │   ├── models/              # Interfaces e tipos
│   │   └── services/            # Serviços core (ApiService)
│   ├── shared/                  # Componentes, pipes e diretivas compartilhados
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pipes/               # Pipes customizados
│   │   └── directives/          # Diretivas customizadas
│   ├── modules/                 # Módulos de funcionalidade (lazy loading)
│   │   ├── auth/                # Módulo de autenticação
│   │   └── dashboard/           # Módulo de dashboard
│   ├── layouts/                 # Componentes de layout
│   │   └── main-layout/         # Layout principal com sidebar
│   ├── app.component.ts         # Componente raiz
│   ├── app.config.ts            # Configuração da aplicação
│   └── app.routes.ts            # Rotas principais
├── assets/                      # Arquivos estáticos
├── environments/                # Configurações de ambiente
│   ├── environment.ts           # Desenvolvimento
│   ├── environment.prod.ts      # Produção
│   └── environment.test.ts      # Testes
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

## 🌍 Ambientes

### Desenvolvimento

- **URL da API**: `http://localhost:3000/api`
- **URL do BFF**: `http://localhost:3001/api`

### Produção

- **URL da API**: `/api` (relativo)
- **URL do BFF**: `/api` (relativo)

## 🔌 Proxy de Desenvolvimento

O projeto está configurado com um proxy para facilitar o desenvolvimento local. Todas as requisições para `/api` são redirecionadas para `http://localhost:3000`.

Configuração em: `proxy.conf.json`

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

## 🔒 Autenticação e Guards

O projeto possui um `authGuard` configurado para proteger rotas privadas.

**Nota**: A lógica de autenticação está como TODO e precisa ser implementada de acordo com o backend.

## 🚦 Rotas

### Rotas Públicas

- `/auth/login` - Página de login

### Rotas Privadas (requerem autenticação)

- `/dashboard` - Dashboard principal
- `/` - Redireciona para dashboard

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
