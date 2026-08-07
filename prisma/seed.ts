import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.analista.createMany({
    data: [
      { nome: "Ana Souza", email: "ana.souza@exemplo.com", turno: "MANHA" },
      { nome: "Bruno Lima", email: "bruno.lima@exemplo.com", turno: "INTERMEDIARIO" },
      { nome: "Carla Dias", email: "carla.dias@exemplo.com", turno: "NOITE" },
      { nome: "Diego Alves", email: "diego.alves@exemplo.com", turno: "MANHA" },
    ],
  });

  await prisma.tipoOcorrencia.createMany({
    data: [
      { nome: "Incidente de Rede" },
      { nome: "Indisponibilidade de Sistema" },
      { nome: "Alerta de Monitoramento" },
      { nome: "Solicitação de Acesso" },
    ],
  });

  const parcerias = await Promise.all(
    [
      { nome: "Parceiro Cloud" },
      { nome: "Parceiro Telecom" },
    ].map((p) =>
      prisma.parceria.upsert({
        where: { nome: p.nome },
        update: {},
        create: p,
      }),
    ),
  );

  await prisma.empresa.createMany({
    data: [
      { nome: "AWS", parceriaId: parcerias[0].id },
      { nome: "Azure", parceriaId: parcerias[0].id },
      { nome: "Vivo Telecom", parceriaId: parcerias[1].id },
      { nome: "Claro Telecom", parceriaId: parcerias[1].id },
    ],
  });

  await prisma.ambiente.createMany({
    data: [{ nome: "Produção" }, { nome: "Homologação" }, { nome: "Desenvolvimento" }],
  });

  await prisma.servico.createMany({
    data: [{ nome: "E-mail" }, { nome: "VPN" }, { nome: "Banco de Dados" }, { nome: "Aplicação Web" }],
  });

  await prisma.sistemaOperacional.createMany({
    data: [{ nome: "Linux" }, { nome: "Windows Server" }, { nome: "Windows 10/11" }],
  });

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
