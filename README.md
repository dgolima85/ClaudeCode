Sistema de Passagem de Turno para times de NOC/VOC (turnos 12x36) — Next.js + Prisma + PostgreSQL.

## Rodando localmente

Requer um banco PostgreSQL acessível (local ou remoto).

```bash
cp .env.example .env
# edite .env com a sua DATABASE_URL (postgresql://...)

npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) — a tela de login lista os analistas cadastrados pelo seed.

## Login com Microsoft Entra ID (Azure AD)

O login por senha nunca existiu neste sistema — hoje dá pra entrar de duas formas: escolhendo o nome numa lista (sem senha) ou, se configurado, pelo botão "Entrar com Microsoft" usando a conta corporativa (SSO via Entra ID). As duas continuam disponíveis ao mesmo tempo; a lista fica como plano B caso o login Microsoft esteja fora do ar ou ainda não configurado no seu ambiente.

**Como funciona:** o e-mail da conta Microsoft precisa bater (sem diferenciar maiúsculas/minúsculas) com o e-mail de um Analista já cadastrado e ativo em **Administração → Analistas**. O sistema não cria Analista automaticamente — se o e-mail não estiver cadastrado, o login é recusado com uma mensagem explicando o motivo. Cadastre a pessoa (com o e-mail exato da conta Microsoft dela) antes de ela tentar entrar pela primeira vez.

### 1. Peça ao Administrador do Azure (App Registration no Entra ID)

Se ainda não existe um App Registration para este sistema, peça para o administrador criar um e te passar:

- **Application (client) ID**
- **Directory (tenant) ID**
- Um **Client secret** (Certificates & secrets → New client secret) — copie o *value* na hora, ele some depois
- Que ele cadastre o **Redirect URI** (tipo **Web**, não SPA) em Authentication → Add a platform:
  - Produção: `https://<seu-domínio>/api/auth/callback/microsoft-entra-id`
  - Desenvolvimento local: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
- Permissão de API `User.Read` (Microsoft Graph, delegada) — geralmente já vem por padrão no App Registration; se pedir consentimento do admin, ele precisa aprovar.

### 2. Configure as variáveis de ambiente

No `.env` local e/ou nas Environment Variables da Vercel:

```bash
AUTH_SECRET="..."                     # gere com: npx auth secret
AUTH_MICROSOFT_ENTRA_ID_ID="..."                 # Application (client) ID
AUTH_MICROSOFT_ENTRA_ID_SECRET="..."             # Client secret value
AUTH_MICROSOFT_ENTRA_ID_ISSUER="https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0"
```

O `AUTH_MICROSOFT_ENTRA_ID_ISSUER` com o Tenant ID específico da sua organização restringe o login só a contas do seu diretório — sem essa variável, qualquer conta Microsoft (pessoal, escola ou trabalho) conseguiria autenticar.

Sem essas variáveis configuradas, o botão "Entrar com Microsoft" continua aparecendo mas o login falha — a lista de analistas continua funcionando normalmente enquanto isso.

## Deploy

Veja [`DEPLOY.md`](./DEPLOY.md) para o passo a passo de hospedagem na Vercel (recomendado) ou em Docker em um servidor próprio.

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- [Prisma](https://www.prisma.io) + PostgreSQL
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org) (gráficos do módulo de relatórios)
