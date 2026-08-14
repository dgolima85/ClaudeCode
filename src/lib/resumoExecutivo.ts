import { prisma } from "@/lib/prisma";
import { montarWhereOcorrencia, type FiltrosRelatorio } from "@/lib/relatorios";

const includeCompleto = {
  tipo: true,
  analista: true,
  parceria: true,
  empresa: true,
  servico: true,
  sistemaOperacional: true,
  ambienteInfra: true,
  recurso: true,
  cdn: true,
  plataforma: true,
  canal: true,
  causa: true,
  solucao: true,
} as const;

export async function listarResumosExecutivos(filtros: FiltrosRelatorio) {
  const where = { ...montarWhereOcorrencia(filtros), status: "RESOLVIDO" as const };
  return prisma.ocorrencia.findMany({
    where,
    include: includeCompleto,
    orderBy: { resolvidoEm: "desc" },
  });
}

export async function buscarResumoExecutivo(id: string) {
  return prisma.ocorrencia.findUnique({
    where: { id, status: "RESOLVIDO" },
    include: {
      ...includeCompleto,
      eventos: { include: { analista: true }, orderBy: { createdAt: "asc" } },
    },
  });
}

type ComCausa = { causa: { nome: string } | null; causaOutraDescricao: string | null };
type ComSolucao = { solucao: { nome: string } | null; solucaoOutraDescricao: string | null };

export function nomeCausa(o: ComCausa): string {
  return o.causa?.nome ?? o.causaOutraDescricao ?? "—";
}

export function nomeSolucao(o: ComSolucao): string {
  return o.solucao?.nome ?? o.solucaoOutraDescricao ?? "—";
}

export function parceriaEmpresaLabel(o: { parceria: { nome: string } | null; empresa: { nome: string } | null }) {
  return [o.parceria?.nome, o.empresa?.nome].filter(Boolean).join(" / ") || null;
}
