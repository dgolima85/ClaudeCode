import { prisma } from "@/lib/prisma";
import { janelaTurno, type Turno } from "@/lib/turno";

const includeBasico = { tipo: true, analista: true } as const;

export async function buscarDadosPassagemTurno(turno: Turno, dataSelecionada: string) {
  // O turno Noite cruza a meia-noite (20:00 de um dia até 08:00 do
  // seguinte): filtrar pelo dia corrido (00:00–23:59) partia a atividade
  // desse turno em dois dias diferentes. janelaTurno() usa o horário real
  // do turno em vez do dia corrido.
  const { inicio, fim } = janelaTurno(turno, dataSelecionada);

  const [emAberto, atividade] = await Promise.all([
    prisma.ocorrencia.findMany({
      where: { status: { not: "RESOLVIDO" } },
      include: includeBasico,
      orderBy: { createdAt: "asc" },
    }),
    prisma.ocorrencia.findMany({
      where: {
        analista: { turno },
        OR: [
          { createdAt: { gte: inicio, lte: fim } },
          { updatedAt: { gte: inicio, lte: fim } },
          { eventos: { some: { createdAt: { gte: inicio, lte: fim } } } },
        ],
      },
      include: includeBasico,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { emAberto, atividade };
}
