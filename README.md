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

## Deploy

Veja [`DEPLOY.md`](./DEPLOY.md) para o passo a passo de hospedagem na Vercel (recomendado) ou em Docker em um servidor próprio.

## Acesso em produção

Por questão de segurança, a URL de produção (Vercel) é restrita: só aceita requisições vindas dos IPs de saída do ZTNA da empresa. Isso é configurado no dashboard da Vercel em **Project Settings → Firewall (Custom Rules)**, com uma regra de allow para os IPs de origem do ZTNA seguida de uma regra de deny para todo o restante. Quem não estiver conectado ao ZTNA corporativo recebe bloqueio ao tentar acessar a URL.

## Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- [Prisma](https://www.prisma.io) + PostgreSQL
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org) (gráficos do módulo de relatórios)
