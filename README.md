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

O App Registration usado aqui é do tipo mais restrito possível — **cliente público**, autentica só com PKCE, sem client secret, sem permissão de aplicativo, sem acessar nada do Microsoft 365. O único uso é confirmar que a pessoa está autenticada no Entra ID da empresa e ler nome/e-mail para casar com o Analista já cadastrado.

Peça para o administrador criar o App Registration (se ainda não existir) e te passar:

- **Application (client) ID**
- **Directory (tenant) ID**
- Que ele cadastre o **Redirect URI** em Authentication → Add a platform, do tipo **"Mobile and desktop applications"** (não "Web" nem "Single-page application" — a troca do código por token é feita pelo nosso servidor, não por JavaScript rodando no navegador, e o tipo SPA aplica uma restrição de CORS no token endpoint que rejeita essa troca):
  - Produção: `https://<seu-domínio>/api/auth/callback/microsoft-entra-id`
  - Desenvolvimento local: `http://localhost:3000/api/auth/callback/microsoft-entra-id`
- Que ele habilite **"Allow public client flows"** = Yes, em Authentication → Advanced settings (no final da página). Sem isso, o Entra ID recusa a troca do código por token por não ter um client secret, mesmo com o Redirect URI correto.

Não é preciso client secret, nem permissão de API além do OIDC básico (`openid`, `profile`, `email`, já inclusos por padrão), nem consentimento de admin.

#### Se a empresa restringe login por IP/país (Conditional Access)

Times de Cyber costumam ter uma política no Entra ID que só aceita autenticação vinda de IPs de um país específico (ex: só Brasil). Isso quebra o login mesmo com tudo certo acima, porque **as Vercel Functions rodam numa região fixa dos EUA por padrão** (`iad1`, Washington D.C.) — é de lá que sai a chamada do nosso servidor para o Entra ID trocar o código por token, não da região que recebeu a requisição do navegador. O sintoma é um erro `OAuthCallbackError: invalid_grant` que só aparece depois de passar por login e MFA com sucesso.

**Solução:** mude a região das Vercel Functions para a mesma exigida pela política — em **Vercel → Settings → Functions → Function Region** (ex: "São Paulo, Brazil (gru1)"). Regiões fora do padrão (`iad1`) exigem plano **Pro** da Vercel. Depois de mudar, é preciso um novo deploy para a mudança valer.

### 2. Configure as variáveis de ambiente

No `.env` local e/ou nas Environment Variables da Vercel:

```bash
AUTH_SECRET="..."                     # gere com: npx auth secret
AUTH_MICROSOFT_ENTRA_ID_ID="..."                 # Application (client) ID
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
