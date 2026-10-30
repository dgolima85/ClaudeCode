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

// Case e acento-insensível (ex.: "graca" encontra "Graça") — o Postgres via
// Prisma não tem um jeito nativo de ignorar acento num `contains` sem a
// extensão unaccent, então normaliza dos dois lados e compara em JS.
function normalizarTitulo(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export async function listarResumosExecutivos(filtros: FiltrosRelatorio) {
  const where = montarWhereOcorrencia(filtros);
  const ocorrencias = await prisma.ocorrencia.findMany({
    where,
    include: includeCompleto,
    orderBy: { createdAt: "desc" },
  });

  if (!filtros.titulo) return ocorrencias;
  const buscaNormalizada = normalizarTitulo(filtros.titulo);
  return ocorrencias.filter((o) => normalizarTitulo(o.titulo).includes(buscaNormalizada));
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
