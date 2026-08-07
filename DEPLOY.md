# Deploy do Sistema de Passagem de Turno

O sistema está empacotado em Docker, com o banco SQLite persistido em um volume — pode rodar em qualquer máquina com Docker instalado (seu notebook para teste, um servidor/VPS do NOC, etc.).

## 1. Subir com Docker Compose

```bash
docker compose up -d --build
```

Isso builda a imagem (Next.js + Prisma) e sobe o container `app`, expondo a porta `3000`.

## 2. Popular os dados iniciais (primeira vez)

O login não usa senha — ele depende de já existir pelo menos um Analista cadastrado. Na primeira subida, rode o seed uma única vez:

```bash
docker compose exec app npx prisma db seed
```

Isso cria alguns analistas de exemplo (cobrindo os 3 turnos) e as listas auxiliares básicas (Tipos de Ocorrência, Parcerias/Empresas, Ambientes, Serviços, Sistemas Operacionais). Você pode editar/excluir esses registros de exemplo depois, em **Administração**, e cadastrar os analistas reais do seu time.

Alternativa: definir `SEED_ON_BOOT: "true"` no `docker-compose.yml` antes do primeiro `up`, subir o container, e depois voltar para `"false"` (evita rodar o seed de novo a cada restart).

## 3. Acessar

Abra no navegador:

```
http://<endereço-do-servidor>:3000
```

- Se estiver rodando na sua própria máquina para testar: `http://localhost:3000`.
- Se estiver rodando em um servidor/VPS do NOC: `http://<IP-ou-domínio-do-servidor>:3000` (garanta que a porta 3000 esteja liberada no firewall/security group, ou coloque um proxy reverso com HTTPS na frente — ver seção 5).

## 4. Persistência e atualizações

- Os dados (ocorrências, eventos, cadastros) ficam no volume Docker `db-data`, que sobrevive a `docker compose down` / restarts / rebuilds da imagem.
- Para atualizar o sistema com uma nova versão do código:
  ```bash
  git pull
  docker compose up -d --build
  ```
  As migrations do Prisma rodam automaticamente na inicialização do container (`prisma migrate deploy`), então o schema do banco é atualizado sozinho — os dados existentes são preservados.
- Para remover tudo (inclusive os dados), só se for realmente essa a intenção: `docker compose down -v`.

## 5. Colocar atrás de um domínio/HTTPS (opcional, recomendado para uso real da equipe)

O container expõe HTTP puro na porta 3000. Para um endereço público com HTTPS, coloque um proxy reverso na frente (ex: Caddy, Nginx ou Traefik) apontando para `localhost:3000`, ou use o load balancer/ingress que sua infraestrutura já tiver. Isso está fora do escopo deste pacote Docker — avise se quiser que eu prepare essa camada também.

## Alternativa: hospedar na Vercel (sem gerenciar servidor)

Se preferir não manter um servidor rodando, dá para hospedar na [Vercel](https://vercel.com) (plataforma oficial do Next.js, deploy conectando este repositório GitHub). A diferença principal é que a Vercel **não tem disco persistente**, então o SQLite (arquivo local) não funciona lá — seria necessário:

1. Trocar o `datasource` do Prisma de `sqlite` para `postgresql` em `prisma/schema.prisma`.
2. Trocar o adapter em `src/lib/prisma.ts` e `prisma/seed.ts` de `@prisma/adapter-better-sqlite3` para `@prisma/adapter-pg` (pacote `pg`).
3. Provisionar um Postgres gerenciado (ex: Neon, Supabase, ou o próprio Postgres da Vercel) e configurar `DATABASE_URL` nas variáveis de ambiente do projeto na Vercel.
4. Ajustar o script de build para rodar `prisma migrate deploy` antes do `next build`.

Essa migração não foi feita agora porque depende de decisões que só você pode tomar (qual provedor de Postgres usar, criar a conta na Vercel). Se quiser seguir por esse caminho, é só pedir que eu faço a migração e deixo pronto para você conectar sua conta.
