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

O login por senha nunca existiu neste sistema — hoje a única forma de entrar é pelo botão "Entrar com Microsoft", usando a conta corporativa (SSO via Entra ID). O login antigo, por lista de analistas sem senha, foi desativado e ficou só como backup em `src/components/login/LoginManualForm.tsx` (não usado por nenhuma página) — dá pra reativar rapidamente se for preciso, importando o componente de volta em `src/app/login/page.tsx`.

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

Sem essas variáveis configuradas, o botão "Entrar com Microsoft" continua aparecendo mas o login falha, e não há como entrar no sistema (o login manual por lista está desativado — veja a seção anterior).

## Painel de Plantonistas (Home)

Um painel só de leitura na Home mostra quem está de plantão hoje (área, analista e telefone), lido direto de uma planilha do SharePoint (`Plantao.xlsx`, aba única) — não é editável por aqui, é só um espelho do que está lá. Ele filtra sozinho as linhas cuja data bate com o dia de hoje (horário de Brasília) a cada carregamento da Home, com os dados em cache por até 5 minutos.

Como isso precisa ler a planilha para qualquer pessoa que abrir a Home (não só quando alguém está logado agora), a leitura acontece no servidor como aplicativo, não como o usuário — um fluxo diferente do login (que só confirma identidade). Isso exige um Client Secret e uma permissão de aplicativo no Entra ID, ao contrário do App Registration do login (que é público, sem secret).

### 1. Peça ao Administrador do Azure

No **mesmo** App Registration já usado no login com Microsoft:

- **API permissions → Add a permission → Microsoft Graph → Application permissions** → adicione `Sites.Selected` → **Grant admin consent**.
- **Certificates & secrets → New client secret** → copie o **Value** assim que ele aparecer (só é exibido uma vez) — esse valor é a `AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET`.

### 2. Libere o acesso a esse site específico do SharePoint

`Sites.Selected` sozinho não dá acesso a nenhum site — cada site precisa ser liberado explicitamente pra esse App Registration, e isso não tem botão no Azure Portal: é uma chamada ao Graph API, feita uma única vez por um administrador do SharePoint pelo [Graph Explorer](https://developer.microsoft.com/graph/graph-explorer) (ou qualquer cliente HTTP autenticado com uma conta de admin):

1. Descubra o ID do site:
   `GET https://graph.microsoft.com/v1.0/sites/brwatchtv.sharepoint.com:/sites/WatchLabsVOC`
   → copie o campo `id` da resposta.
2. Libere o acesso de leitura pra esse App Registration:
   `POST https://graph.microsoft.com/v1.0/sites/{id-do-passo-anterior}/permissions`
   ```json
   {
     "roles": ["read"],
     "grantedToIdentities": [
       { "application": { "id": "<Application (client) ID>", "displayName": "<nome do App Registration>" } }
     ]
   }
   ```

### 3. Configure a variável de ambiente

```bash
AUTH_MICROSOFT_ENTRA_ID_CLIENT_SECRET="..."   # Value copiado no passo 1
```

Sem essa variável (ou sem o passo 2 feito), o painel simplesmente não aparece na Home — mostra um aviso discreto no lugar, sem quebrar o resto da página.

### Sobre o layout da planilha

O painel lê a **primeira aba** da planilha e reconhece colunas pelo nome do cabeçalho (sem diferenciar maiúsculas/acentos), aceitando algumas variações comuns:

- Data do plantão: `Data` ou `Dia`
- Área/equipe: `Área`, `Equipe` ou `Time`
- Analista de plantão: `Analista`, `Nome` ou `Plantonista`
- Telefone: `Telefone`, `Contato`, `Celular`, `Fone` ou `Ramal`

Uma linha por pessoa de plantão, por área, por dia. O local do arquivo (`https://brwatchtv.sharepoint.com/sites/WatchLabsVOC` → `Plantao.xlsx`) está fixo em `src/lib/plantao.ts` — se ele algum dia mudar de lugar, é só editar as constantes no topo desse arquivo.

## Deploy

Veja [`DEPLOY.md`](./DEPLOY.md) para o passo a passo de hospedagem na Vercel (recomendado) ou em Docker em um servidor próprio.

## Acesso em produção

Por questão de segurança, a URL de produção (Vercel) é restrita: só aceita requisições vindas dos IPs de saída do ZTNA da empresa. Isso é configurado no dashboard da Vercel em **Project Settings → Firewall (Custom Rules)**, com uma regra de allow para os IPs de origem do ZTNA seguida de uma regra de deny para todo o restante. Quem não estiver conectado ao ZTNA corporativo recebe bloqueio ao tentar acessar a URL.

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- [Prisma](https://www.prisma.io) + PostgreSQL
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org) (gráficos do módulo de relatórios)
