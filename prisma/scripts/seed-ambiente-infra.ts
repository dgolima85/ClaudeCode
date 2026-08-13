// Popula as opções iniciais do campo "Ambiente" (AWS, Data Center Lapa,
// Data Center Campinas). Idempotente (skipDuplicates) — pode rodar mais de
// uma vez sem erro.
//
// Uso:
//   DATABASE_URL="postgresql://..." npx tsx prisma/scripts/seed-ambiente-infra.ts

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  const resultado = await prisma.ambienteInfra.createMany({
    data: [{ nome: "AWS" }, { nome: "Data Center Lapa" }, { nome: "Data Center Campinas" }],
    skipDuplicates: true,
  });

  console.log(`Ambientes criados: ${resultado.count}`);

  const todos = await prisma.ambienteInfra.findMany({ orderBy: { nome: "asc" } });
  console.log("Ambientes cadastrados agora:", todos.map((a) => a.nome).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
