"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirAnalistaLogado } from "@/lib/session";
import {
  novaOcorrenciaSchema,
  normalizacaoOcorrenciaSchema,
  dataHoraLocalSchema,
} from "@/lib/validations";
import { isStatusOcorrencia, type StatusOcorrencia } from "@/lib/status";
import { deInputDataHoraBR } from "@/lib/dataHoraBR";
import { ordenarComNaPrimeiro } from "@/lib/ordenarListaReferencia";

export async function criarOcorrencia(dados: {
  tipoId: string;
  titulo: string;
  ticket: string;
  inicio: string;
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
      createdAt: deInputDataHoraBR(parsed.data.inicio),
    },
  });

  revalidatePath("/");
  return {};
}

export async function atualizarInicioOcorrencia(
  id: string,
  inicio: string,
): Promise<{ error?: string }> {
  await exigirAnalistaLogado();
  const parsed = dataHoraLocalSchema.safeParse(inicio);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data e hora inválidas" };

  await prisma.ocorrencia.update({
    where: { id },
    data: { createdAt: deInputDataHoraBR(parsed.data) },
  });

  revalidatePath("/");
  return {};
}

export async function atualizarFimOcorrencia(id: string, fim: string): Promise<{ error?: string }> {
  await exigirAnalistaLogado();
  const parsed = dataHoraLocalSchema.safeParse(fim);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data e hora inválidas" };

  await prisma.ocorrencia.update({
    where: { id },
    data: { resolvidoEm: deInputDataHoraBR(parsed.data) },
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
  if (status === "RESOLVIDO") {
    return {
      error: "Para marcar como resolvido, preencha a normalização da ocorrência (causa e solução).",
    };
  }

  await prisma.ocorrencia.update({
    where: { id },
    data: {
      status,
      resolvidoEm: null,
      causaId: null,
      causaOutraDescricao: null,
      solucaoId: null,
      solucaoOutraDescricao: null,
    },
  });

  revalidatePath("/");
  return {};
}

export async function normalizarOcorrencia(
  id: string,
  dados: {
    causaId: string | null;
    causaOutra: string;
    solucaoId: string | null;
    solucaoOutra: string;
    fim: string;
  },
): Promise<{ error?: string }> {
  await exigirAnalistaLogado();
  const parsed = normalizacaoOcorrenciaSchema.safeParse(dados);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  await prisma.ocorrencia.update({
    where: { id },
    data: {
      status: "RESOLVIDO",
      resolvidoEm: deInputDataHoraBR(parsed.data.fim),
      causaId: parsed.data.causaId || null,
      causaOutraDescricao: parsed.data.causaId ? null : parsed.data.causaOutra,
      solucaoId: parsed.data.solucaoId || null,
      solucaoOutraDescricao: parsed.data.solucaoId ? null : parsed.data.solucaoOutra,
    },
  });

  revalidatePath("/");
  return {};
}

export type DadosNormalizacaoOcorrencia = {
  id: string;
  titulo: string;
  afiliada: string;
  parceriaEmpresa: string | null;
  ambiente: string | null;
  recurso: string | null;
  servico: string | null;
  causas: ItemReferencia[];
  solucoes: ItemReferencia[];
};

export async function buscarDadosNormalizacaoOcorrencia(
  id: string,
): Promise<DadosNormalizacaoOcorrencia | null> {
  await exigirAnalistaLogado();

  const [o, causas, solucoes] = await Promise.all([
    prisma.ocorrencia.findUnique({
      where: { id },
      include: {
        tipo: true,
        parcerias: true,
        empresas: true,
        ambienteInfra: true,
        recursos: true,
        servicos: true,
      },
    }),
    prisma.causa.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    prisma.solucao.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);
  if (!o) return null;

  const parceriaEmpresa =
    [o.parcerias.map((p) => p.nome).join(", "), o.empresas.map((e) => e.nome).join(", ")]
      .filter(Boolean)
      .join(" / ") || null;

  return {
    id: o.id,
    titulo: o.titulo,
    afiliada: o.tipo.nome,
    parceriaEmpresa,
    ambiente: o.ambienteInfra?.nome ?? null,
    recurso: o.recursos.map((r) => r.nome).join(", ") || null,
    servico: o.servicos.map((s) => s.nome).join(", ") || null,
    causas: causas.map((c) => ({ id: c.id, nome: c.nome, ativo: c.ativo })),
    solucoes: solucoes.map((s) => ({ id: s.id, nome: s.nome, ativo: s.ativo })),
  };
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
  resolvidoEm: string | null;
  causa: string | null;
  solucao: string | null;
  tipoId: string;
  analista: { id: string; nome: string };
  parceriaIds: string[];
  empresaIds: string[];
  servicoIds: string[];
  sistemaOperacionalIds: string[];
  ambienteInfraId: string | null;
  recursoIds: string[];
  cdnId: string | null;
  plataformaIds: string[];
  canalIds: string[];
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
      causa: true,
      solucao: true,
      parcerias: true,
      empresas: true,
      servicos: true,
      sistemasOperacionais: true,
      recursos: true,
      plataformas: true,
      canais: true,
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
    resolvidoEm: o.resolvidoEm ? o.resolvidoEm.toISOString() : null,
    causa: o.causa?.nome ?? o.causaOutraDescricao ?? null,
    solucao: o.solucao?.nome ?? o.solucaoOutraDescricao ?? null,
    tipoId: o.tipoId,
    analista: { id: o.analista.id, nome: o.analista.nome },
    parceriaIds: o.parcerias.map((p) => p.id),
    empresaIds: o.empresas.map((e) => e.id),
    servicoIds: o.servicos.map((s) => s.id),
    sistemaOperacionalIds: o.sistemasOperacionais.map((s) => s.id),
    ambienteInfraId: o.ambienteInfraId,
    recursoIds: o.recursos.map((r) => r.id),
    cdnId: o.cdnId,
    plataformaIds: o.plataformas.map((p) => p.id),
    canalIds: o.canais.map((c) => c.id),
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

  const [
    tipos,
    parcerias,
    empresas,
    servicos,
    sistemasOperacionais,
    ambientesInfra,
    recursos,
    cdns,
    plataformas,
    canais,
  ] = await Promise.all([
    prisma.tipoOcorrencia.findMany({ orderBy: { nome: "asc" } }),
    prisma.parceria.findMany({ orderBy: { nome: "asc" } }),
    prisma.empresa.findMany({ orderBy: { nome: "asc" } }),
    prisma.servico.findMany({ orderBy: { nome: "asc" } }),
    prisma.sistemaOperacional.findMany({ orderBy: { nome: "asc" } }),
    prisma.ambienteInfra.findMany({ orderBy: { nome: "asc" } }),
    prisma.recurso.findMany({ orderBy: { nome: "asc" } }),
    prisma.cdn.findMany({ orderBy: { nome: "asc" } }),
    prisma.plataforma.findMany({ orderBy: { nome: "asc" } }),
    prisma.canal.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return {
    tipos: ordenarComNaPrimeiro(tipos.map((t) => ({ id: t.id, nome: t.nome, ativo: t.ativo }))),
    parcerias: parcerias.map((p) => ({ id: p.id, nome: p.nome, ativo: p.ativo })),
    empresas: empresas.map((e) => ({ id: e.id, nome: e.nome, parceriaId: e.parceriaId, ativo: e.ativo })),
    servicos: servicos.map((s) => ({ id: s.id, nome: s.nome, ativo: s.ativo })),
    sistemasOperacionais: sistemasOperacionais.map((s) => ({ id: s.id, nome: s.nome, ativo: s.ativo })),
    ambientesInfra: ambientesInfra.map((a) => ({ id: a.id, nome: a.nome, ativo: a.ativo })),
    recursos: ordenarComNaPrimeiro(
      recursos.map((r) => ({
        id: r.id,
        nome: r.nome,
        ambienteInfraId: r.ambienteInfraId,
        ativo: r.ativo,
      })),
    ),
    cdns: cdns.map((c) => ({ id: c.id, nome: c.nome, ativo: c.ativo })),
    plataformas: plataformas.map((p) => ({ id: p.id, nome: p.nome, ativo: p.ativo })),
    canais: canais.map((c) => ({ id: c.id, nome: c.nome, ativo: c.ativo })),
  };
}

export async function atualizarDetalhesOcorrencia(
  id: string,
  dados: {
    parceriaIds?: string[];
    empresaIds?: string[];
    servicoIds?: string[];
    sistemaOperacionalIds?: string[];
    ambienteInfraId?: string | null;
    recursoIds?: string[];
    cdnId?: string | null;
    plataformaIds?: string[];
    canalIds?: string[];
  },
): Promise<{ error?: string }> {
  await exigirAnalistaLogado();

  await prisma.ocorrencia.update({
    where: { id },
    data: {
      parcerias: { set: (dados.parceriaIds ?? []).map((id) => ({ id })) },
      empresas: { set: (dados.empresaIds ?? []).map((id) => ({ id })) },
      servicos: { set: (dados.servicoIds ?? []).map((id) => ({ id })) },
      sistemasOperacionais: { set: (dados.sistemaOperacionalIds ?? []).map((id) => ({ id })) },
      recursos: { set: (dados.recursoIds ?? []).map((id) => ({ id })) },
      plataformas: { set: (dados.plataformaIds ?? []).map((id) => ({ id })) },
      canais: { set: (dados.canalIds ?? []).map((id) => ({ id })) },
      ambienteInfraId: dados.ambienteInfraId || null,
      cdnId: dados.cdnId || null,
    },
  });

  revalidatePath("/");
  return {};
}
