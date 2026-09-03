"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { novaPassagemTurnoSchema } from "@/lib/validations";
import { TURNO_DESTINO_PASSAGEM, type Turno } from "@/lib/turno";
import type { StatusOcorrencia } from "@/lib/status";
import { isCriticidade } from "@/lib/criticidade";
import type { StatusPassagemTurno } from "@/lib/statusPassagemTurno";
import type { LinhaRelatorio } from "@/components/relatorios/TabelaOcorrenciasFiltravel";

const includeOcorrencia = { tipo: true, analista: true } as const;

function mapOcorrencia(o: {
  id: string;
  status: string;
  criticidade: string | null;
  titulo: string;
  ticket: string | null;
  createdAt: Date;
  resolvidoEm: Date | null;
  tipo: { nome: string };
  analista: { nome: string; turno: string };
}): LinhaRelatorio {
  return {
    id: o.id,
    status: o.status as StatusOcorrencia,
    criticidade: o.criticidade && isCriticidade(o.criticidade) ? o.criticidade : null,
    titulo: o.titulo,
    ticket: o.ticket,
    createdAt: o.createdAt.toISOString(),
    resolvidoEm: o.resolvidoEm ? o.resolvidoEm.toISOString() : null,
    tipo: o.tipo.nome,
    analista: o.analista.nome,
    turno: o.analista.turno as Turno,
  };
}

export async function buscarOcorrenciasEmAbertoPreview(): Promise<LinhaRelatorio[]> {
  await exigirAnalistaLogado();

  const ocorrencias = await prisma.ocorrencia.findMany({
    where: { status: { not: "RESOLVIDO" } },
    include: includeOcorrencia,
    orderBy: { createdAt: "asc" },
  });

  return ocorrencias.map(mapOcorrencia);
}

export type PassagemTurnoPendente = {
  id: string;
  turnoOrigem: Turno;
  turnoDestino: Turno;
  analistaEntrega: string;
  createdAt: string;
};

export async function buscarPendentesPassagemTurno(): Promise<PassagemTurnoPendente[]> {
  const analista = await exigirAnalistaLogado();

  const pendentes = await prisma.passagemTurno.findMany({
    where: { status: "ABERTA", turnoDestino: analista.turno },
    include: { analistaEntrega: true },
    orderBy: { createdAt: "desc" },
  });

  return pendentes.map((p) => ({
    id: p.id,
    turnoOrigem: p.turnoOrigem as Turno,
    turnoDestino: p.turnoDestino as Turno,
    analistaEntrega: p.analistaEntrega.nome,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function criarPassagemTurno(dados: {
  observacoes: string;
}): Promise<{ error?: string; id?: string }> {
  const analista = await exigirAnalistaLogado();
  const parsed = novaPassagemTurnoSchema.safeParse(dados);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const ocorrenciasEmAberto = await prisma.ocorrencia.findMany({
    where: { status: { not: "RESOLVIDO" } },
    select: { id: true },
  });

  const passagem = await prisma.passagemTurno.create({
    data: {
      turnoOrigem: analista.turno,
      turnoDestino: TURNO_DESTINO_PASSAGEM[analista.turno as Turno],
      observacoes: parsed.data.observacoes ? parsed.data.observacoes : null,
      analistaEntregaId: analista.id,
      ocorrencias: { connect: ocorrenciasEmAberto.map((o) => ({ id: o.id })) },
    },
  });

  revalidatePath("/");
  revalidatePath("/passagem-turno");
  return { id: passagem.id };
}

export type PassagemTurnoDetalhe = {
  id: string;
  status: StatusPassagemTurno;
  turnoOrigem: Turno;
  turnoDestino: Turno;
  observacoes: string | null;
  analistaEntregaId: string;
  analistaEntrega: string;
  analistaRecebe: string | null;
  createdAt: string;
  confirmadaEm: string | null;
  ocorrencias: LinhaRelatorio[];
};

export async function buscarPassagemTurno(id: string): Promise<PassagemTurnoDetalhe | null> {
  const analista = await exigirAnalistaLogado();

  const p = await prisma.passagemTurno.findUnique({
    where: { id },
    include: {
      analistaEntrega: true,
      analistaRecebe: true,
      ocorrencias: { include: includeOcorrencia, orderBy: { createdAt: "asc" } },
    },
  });
  if (!p) return null;
  // Só quem está do lado de origem ou destino dessa passagem pode vê-la —
  // ex: Intermediário não visualiza passagens entre Manhã e Noite.
  if (analista.turno !== p.turnoOrigem && analista.turno !== p.turnoDestino) return null;

  return {
    id: p.id,
    status: p.status as StatusPassagemTurno,
    turnoOrigem: p.turnoOrigem as Turno,
    turnoDestino: p.turnoDestino as Turno,
    observacoes: p.observacoes,
    analistaEntregaId: p.analistaEntregaId,
    analistaEntrega: p.analistaEntrega.nome,
    analistaRecebe: p.analistaRecebe?.nome ?? null,
    createdAt: p.createdAt.toISOString(),
    confirmadaEm: p.confirmadaEm ? p.confirmadaEm.toISOString() : null,
    ocorrencias: p.ocorrencias.map(mapOcorrencia),
  };
}

export async function confirmarPassagemTurno(id: string): Promise<{ error?: string }> {
  const analista = await exigirAnalistaLogado();

  const passagem = await prisma.passagemTurno.findUnique({ where: { id } });
  if (!passagem) return { error: "Passagem de turno não encontrada." };
  if (passagem.status !== "ABERTA") return { error: "Esta passagem de turno já foi confirmada." };
  if (analista.turno !== passagem.turnoDestino) {
    return { error: "Apenas o turno de destino desta passagem pode confirmar o recebimento." };
  }
  // Turno Intermediário tem turnoDestino igual ao turnoOrigem (ver
  // TURNO_DESTINO_PASSAGEM) — sem este check, quem entregou poderia
  // confirmar a própria passagem nesse caso.
  if (passagem.analistaEntregaId === analista.id) {
    return { error: "Quem entregou a passagem não pode confirmar o próprio recebimento." };
  }

  await prisma.passagemTurno.update({
    where: { id },
    data: {
      status: "CONFIRMADA",
      analistaRecebeId: analista.id,
      confirmadaEm: new Date(),
    },
  });

  revalidatePath("/");
  revalidatePath("/passagem-turno");
  revalidatePath(`/passagem-turno/${id}`);
  revalidatePath("/relatorios/passagens-turno");
  return {};
}

export type PassagemTurnoLinha = {
  id: string;
  status: StatusPassagemTurno;
  turnoOrigem: Turno;
  turnoDestino: Turno;
  analistaEntrega: string;
  analistaRecebe: string | null;
  createdAt: string;
  confirmadaEm: string | null;
};

export async function buscarHistoricoPassagensTurno(): Promise<PassagemTurnoLinha[]> {
  const analista = await exigirAnalistaLogado();

  const passagens = await prisma.passagemTurno.findMany({
    where: { OR: [{ turnoOrigem: analista.turno }, { turnoDestino: analista.turno }] },
    include: { analistaEntrega: true, analistaRecebe: true },
    orderBy: { createdAt: "desc" },
  });

  return passagens.map((p) => ({
    id: p.id,
    status: p.status as StatusPassagemTurno,
    turnoOrigem: p.turnoOrigem as Turno,
    turnoDestino: p.turnoDestino as Turno,
    analistaEntrega: p.analistaEntrega.nome,
    analistaRecebe: p.analistaRecebe?.nome ?? null,
    createdAt: p.createdAt.toISOString(),
    confirmadaEm: p.confirmadaEm ? p.confirmadaEm.toISOString() : null,
  }));
}
