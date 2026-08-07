# Deploy do Sistema de Passagem de Turno

O sistema usa **Next.js + Prisma + PostgreSQL**. O caminho recomendado é hospedar na **Vercel** (zero servidor para gerenciar); também é possível rodar em Docker em qualquer servidor próprio, desde que aponte para um banco Postgres.

## Opção 1 — Vercel (recomendado)

### 1. Provisionar um banco Postgres

Escolha um provedor gerenciado (qualquer um serve, o Prisma só precisa de uma `DATABASE_URL` padrão Postgres):

- [Neon](https://neon.tech) — tem free tier, integra direto com a Vercel.
- [Supabase](https://supabase.com) — também tem free tier.
- Postgres da própria Vercel (Storage → Postgres, no dashboard do projeto).

Copie a connection string (formato `postgresql://usuario:senha@host:5432/banco?sslmode=require`).

### 2. Conectar o repositório na Vercel

1. Em [vercel.com/new](https://vercel.com/new), importe o repositório GitHub `dgolima85/ClaudeCode` (branch com o sistema).
2. A Vercel detecta Next.js automaticamente — não precisa mudar comandos de build.
3. Em **Environment Variables**, adicione:
   - `DATABASE_URL` = a connection string do passo 1 (marcar para Production, Preview e Development, ou pelo menos Production).
4. Clique em **Deploy**.

No build, a Vercel roda `npm install` (que já dispara `prisma generate` via `postinstall`) e depois `npm run build`, que executa `prisma migrate deploy && next build` — ou seja, o schema do banco é criado/atualizado automaticamente a cada deploy, sem passo manual.

### 3. Popular os dados iniciais (uma vez)

O login não usa senha — depende de já existir pelo menos um Analista cadastrado. Rode o seed uma única vez, apontando para o banco de produção, a partir da sua máquina:

```bash
DATABASE_URL="<a mesma connection string usada na Vercel>" npx prisma db seed
```

Isso cria analistas de exemplo (cobrindo os 3 turnos) e as listas auxiliares básicas. Edite/exclua esses registros de exemplo depois em **Administração** e cadastre os analistas reais do seu time.

### 4. Acessar

A Vercel gera uma URL pública (`https://<projeto>.vercel.app`, ou seu domínio próprio se configurar um) — abra no navegador e pronto, acessível pela equipe de qualquer lugar.

### Atualizações

Todo `git push` na branch conectada dispara um novo deploy automaticamente, que já roda as migrations pendentes antes de publicar.

## Opção 2 — Docker em servidor próprio

Para quem prefere manter a aplicação em um servidor/VPS próprio (a Vercel ainda hospedaria só o Postgres, ou você usa um Postgres em outro lugar):

```bash
DATABASE_URL="postgresql://usuario:senha@host:5432/banco?sslmode=require" docker compose up -d --build
```

Ou defina `DATABASE_URL` em um arquivo `.env` na raiz do projeto (o `docker compose` lê automaticamente) antes de rodar `docker compose up -d --build`.

Popular os dados iniciais (primeira vez):

```bash
docker compose exec app npx prisma db seed
```

Acesse em `http://<endereço-do-servidor>:3000`. O container não persiste dados por conta própria — quem persiste é o Postgres apontado por `DATABASE_URL`, então garanta que seja um banco de verdade (gerenciado ou outro container com volume próprio), não algo efêmero.

Para atualizar: `git pull && docker compose up -d --build` (as migrations rodam automaticamente na inicialização do container).

Para expor com HTTPS/domínio próprio, coloque um proxy reverso (Caddy, Nginx, Traefik) na frente apontando para `localhost:3000` — fora do escopo deste pacote Docker, avise se quiser ajuda com essa camada também.
