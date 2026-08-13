// Apaga todas as Ocorrências e seus Eventos (dados de teste), preservando
// as tabelas de cadastro (Analistas, Tipos, Parcerias, Empresas, Ambientes,
// Serviços, Sistemas Operacionais, Causas, Soluções).
//
// Uso:
//   DATABASE_URL="postgresql://..." npx tsx prisma/scripts/limpar-ocorrencias.ts
//     -> só mostra quantos registros existem e onde ficaria o backup (dry-run)
//   DATABASE_URL="postgresql://..." npx tsx prisma/scripts/limpar-ocorrencias.ts --confirmar
//     -> grava o backup em JSON e apaga de verdade

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL ?? "");
const prisma = new PrismaClient({ adapter });

async function main() {
  const confirmar = process.argv.includes("--confirmar");

  const [totalOcorrencias, totalEventos] = await Promise.all([
    prisma.ocorrencia.count(),
    prisma.evento.count(),
  ]);

  console.log(`Ocorrências encontradas: ${totalOcorrencias}`);
  console.log(`Eventos encontrados: ${totalEventos}`);

  if (totalOcorrencias === 0 && totalEventos === 0) {
    console.log("Nada para apagar.");
    return;
  }

  const ocorrencias = await prisma.ocorrencia.findMany({
    include: {
      eventos: true,
      tipo: true,
      analista: true,
      parceria: true,
      empresa: true,
      ambiente: true,
      servico: true,
      sistemaOperacional: true,
      causa: true,
      solucao: true,
    },
  });

  const backupDir = join(__dirname, "..", "..", "backups");
  mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = join(backupDir, `ocorrencias-backup-${timestamp}.json`);
  writeFileSync(backupPath, JSON.stringify(ocorrencias, null, 2), "utf-8");
  console.log(`Backup gravado em: ${backupPath}`);

  if (!confirmar) {
    console.log("\nModo dry-run (nada foi apagado). Rode de novo com --confirmar para apagar de fato.");
    return;
  }

  const resultadoEventos = await prisma.evento.deleteMany({});
  const resultadoOcorrencias = await prisma.ocorrencia.deleteMany({});

  console.log(`\nEventos apagados: ${resultadoEventos.count}`);
  console.log(`Ocorrências apagadas: ${resultadoOcorrencias.count}`);

  const [restamOcorrencias, restamEventos] = await Promise.all([
    prisma.ocorrencia.count(),
    prisma.evento.count(),
  ]);
  console.log(`Conferência final -> Ocorrências: ${restamOcorrencias}, Eventos: ${restamEventos}`);
  console.log(
    "\nTabelas de cadastro (Analistas, Tipos, Parcerias, Empresas, Ambientes, Serviços, Sistemas Operacionais, Causas, Soluções) não foram tocadas.",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
