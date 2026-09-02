import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient<"query"> | undefined;
}

const adapter = new PrismaPg(process.env.DATABASE_URL ?? "");
const jaExistia = Boolean(global.prisma);

export const prisma =
  global.prisma ?? new PrismaClient({ adapter, log: [{ emit: "event", level: "query" }] });

// Loga no console qualquer query que passe do limiar, para dar visibilidade
// a transações lentas (ex.: updates de m-n que reescrevem tabelas de junção
// inteiras) sem precisar de uma ferramenta de APM. Ajustável via env var.
// Só registra o listener uma vez (não a cada hot-reload em dev), já que
// `prisma` é reaproveitado de `global.prisma`.
if (!jaExistia) {
  const limiarMs = Number(process.env.PRISMA_SLOW_QUERY_MS ?? 300);
  prisma.$on("query", (e) => {
    if (e.duration >= limiarMs) {
      console.warn(`[prisma] query lenta (${e.duration}ms): ${e.query}`);
    }
  });
}

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
