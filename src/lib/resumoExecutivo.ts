import { prisma } from "@/lib/prisma";
import { montarWhereOcorrencia, type FiltrosRelatorio } from "@/lib/relatorios";

const includeCompleto = {
  tipo: true,
  analista: true,
  parcerias: true,
  empresas: true,
  servicos: true,
  sistemasOperacionais: true,
  ambienteInfra: true,
  recursos: true,
  cdn: true,
  plataformas: true,
  canais: true,
  causa: true,
  solucao: true,
} as const;

export async function listarResumosExecutivos(filtros: FiltrosRelatorio) {
  const where = montarWhereOcorrencia(filtros);
  return prisma.ocorrencia.findMany({
    where,
    include: includeCompleto,
    orderBy: { createdAt: "desc" },
  });
}

export async function buscarResumoExecutivo(id: string) {
  return prisma.ocorrencia.findUnique({
    where: { id },
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

export function parceriaEmpresaLabel(o: {
  parcerias: { nome: string }[];
  empresas: { nome: string }[];
}) {
  return (
    [o.parcerias.map((p) => p.nome).join(", "), o.empresas.map((e) => e.nome).join(", ")]
      .filter(Boolean)
      .join(" / ") || null
  );
}
