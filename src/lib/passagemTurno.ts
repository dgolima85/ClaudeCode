import { prisma } from "@/lib/prisma";
import type { Turno } from "@/lib/turno";
import { inicioDoDiaBR, fimDoDiaBR } from "@/lib/dataHoraBR";

const includeBasico = { tipo: true, analista: true } as const;

export async function buscarDadosPassagemTurno(turno: Turno, dataSelecionada: string) {
  const inicio = inicioDoDiaBR(dataSelecionada);
  const fim = fimDoDiaBR(dataSelecionada);

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
