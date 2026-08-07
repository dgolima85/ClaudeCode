"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import { novaOcorrenciaSchema } from "@/lib/validations";
import { isStatusOcorrencia, type StatusOcorrencia } from "@/lib/status";

export async function criarOcorrencia(dados: {
  tipoId: string;
  titulo: string;
  ticket: string;
}): Promise<{ error?: string }> {
  const analista = await exigirAnalistaLogado();
  const parsed = novaOcorrenciaSchema.safeParse(dados);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.ocorrencia.create({
    data: {
      tipoId: parsed.data.tipoId,
      titulo: parsed.data.titulo,
      ticket: parsed.data.ticket ? parsed.data.ticket : null,
      analistaId: analista.id,
      status: "EM_ANDAMENTO",
    },
  });

  revalidatePath("/");
  return {};
}

export async function atualizarStatusOcorrencia(
  id: string,
  status: StatusOcorrencia,
): Promise<{ error?: string }> {
  await exigirAnalistaLogado();
  if (!isStatusOcorrencia(status)) return { error: "Status inválido." };

  await prisma.ocorrencia.update({
    where: { id },
    data: {
      status,
      resolvidoEm: status === "RESOLVIDO" ? new Date() : null,
    },
  });

  revalidatePath("/");
  return {};
}

export async function atualizarTituloOcorrencia(
  id: string,
  titulo: string,
): Promise<{ error?: string }> {
  await exigirAnalistaLogado();
  const tituloLimpo = titulo.trim();
  if (!tituloLimpo) return { error: "A ocorrência não pode ficar sem título." };

  await prisma.ocorrencia.update({ where: { id }, data: { titulo: tituloLimpo } });
  revalidatePath("/");
  return {};
}

export async function atualizarTicketOcorrencia(
  id: string,
  ticket: string,
): Promise<{ error?: string }> {
  await exigirAnalistaLogado();
  await prisma.ocorrencia.update({ where: { id }, data: { ticket: ticket.trim() || null } });
  revalidatePath("/");
  return {};
}

export async function atualizarTipoDaOcorrencia(
  id: string,
  tipoId: string,
): Promise<{ error?: string }> {
  await exigirAnalistaLogado();
  if (!tipoId) return { error: "Selecione um tipo válido." };

  await prisma.ocorrencia.update({ where: { id }, data: { tipoId } });
  revalidatePath("/");
  return {};
}

export type OcorrenciaDetalhe = {
  id: string;
  status: StatusOcorrencia;
  titulo: string;
  ticket: string | null;
  createdAt: string;
  tipoId: string;
  analista: { id: string; nome: string };
  parceriaId: string | null;
  empresaId: string | null;
  ambienteId: string | null;
  servicoId: string | null;
  sistemaOperacionalId: string | null;
  eventos: {
    id: string;
    comentario: string;
    createdAt: string;
    analista: { id: string; nome: string };
  }[];
};

export async function buscarOcorrenciaDetalhe(id: string): Promise<OcorrenciaDetalhe | null> {
  await exigirAnalistaLogado();

  const o = await prisma.ocorrencia.findUnique({
    where: { id },
    include: {
      analista: true,
      eventos: {
        include: { analista: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!o) return null;

  return {
    id: o.id,
    status: o.status as StatusOcorrencia,
    titulo: o.titulo,
    ticket: o.ticket,
    createdAt: o.createdAt.toISOString(),
    tipoId: o.tipoId,
    analista: { id: o.analista.id, nome: o.analista.nome },
    parceriaId: o.parceriaId,
    empresaId: o.empresaId,
    ambienteId: o.ambienteId,
    servicoId: o.servicoId,
    sistemaOperacionalId: o.sistemaOperacionalId,
    eventos: o.eventos.map((e) => ({
      id: e.id,
      comentario: e.comentario,
      createdAt: e.createdAt.toISOString(),
      analista: { id: e.analista.id, nome: e.analista.nome },
    })),
  };
}

export type ItemReferencia = { id: string; nome: string; ativo: boolean };

export async function buscarListasReferenciaOcorrencia() {
  await exigirAnalistaLogado();

  const [tipos, parcerias, empresas, ambientes, servicos, sistemasOperacionais] = await Promise.all([
    prisma.tipoOcorrencia.findMany({ orderBy: { nome: "asc" } }),
    prisma.parceria.findMany({ orderBy: { nome: "asc" } }),
    prisma.empresa.findMany({ orderBy: { nome: "asc" } }),
    prisma.ambiente.findMany({ orderBy: { nome: "asc" } }),
    prisma.servico.findMany({ orderBy: { nome: "asc" } }),
    prisma.sistemaOperacional.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return {
    tipos: tipos.map((t) => ({ id: t.id, nome: t.nome, ativo: t.ativo })),
    parcerias: parcerias.map((p) => ({ id: p.id, nome: p.nome, ativo: p.ativo })),
    empresas: empresas.map((e) => ({ id: e.id, nome: e.nome, parceriaId: e.parceriaId, ativo: e.ativo })),
    ambientes: ambientes.map((a) => ({ id: a.id, nome: a.nome, ativo: a.ativo })),
    servicos: servicos.map((s) => ({ id: s.id, nome: s.nome, ativo: s.ativo })),
    sistemasOperacionais: sistemasOperacionais.map((s) => ({ id: s.id, nome: s.nome, ativo: s.ativo })),
  };
}

export async function atualizarDetalhesOcorrencia(
  id: string,
  dados: {
    parceriaId?: string | null;
    empresaId?: string | null;
    ambienteId?: string | null;
    servicoId?: string | null;
    sistemaOperacionalId?: string | null;
  },
): Promise<{ error?: string }> {
  await exigirAnalistaLogado();

  await prisma.ocorrencia.update({
    where: { id },
    data: {
      parceriaId: dados.parceriaId || null,
      empresaId: dados.empresaId || null,
      ambienteId: dados.ambienteId || null,
      servicoId: dados.servicoId || null,
      sistemaOperacionalId: dados.sistemaOperacionalId || null,
    },
  });

  revalidatePath("/");
  return {};
}
