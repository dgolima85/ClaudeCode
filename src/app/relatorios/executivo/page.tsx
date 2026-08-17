import { prisma } from "@/lib/prisma";
import FiltrosResumoExecutivo from "@/components/relatorios/FiltrosResumoExecutivo";
import TabelaResumoExecutivo from "@/components/relatorios/TabelaResumoExecutivo";
import ExportCsvButton from "@/components/relatorios/ExportCsvButton";
import { parseFiltros, buildQueryString, type SearchParamsRelatorio } from "@/lib/relatorios";
import { listarResumosExecutivos, nomeCausa, nomeSolucao, parceriaEmpresaLabel } from "@/lib/resumoExecutivo";
import type { StatusOcorrencia } from "@/lib/status";

export default async function ResumosExecutivosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRelatorio>;
}) {
  const sp = await searchParams;
  const filtros = parseFiltros(sp);

  const [ocorrencias, analistas, tipos, parcerias] = await Promise.all([
    listarResumosExecutivos(filtros),
    prisma.analista.findMany({ orderBy: { nome: "asc" } }),
    prisma.tipoOcorrencia.findMany({ orderBy: { nome: "asc" } }),
    prisma.parceria.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const linhas = ocorrencias.map((o) => ({
    id: o.id,
    status: o.status as StatusOcorrencia,
    tipo: o.tipo.nome,
    titulo: o.titulo,
    ticket: o.ticket,
    parceriaEmpresa: parceriaEmpresaLabel(o),
    servico: o.servicos.map((s) => s.nome).join(", ") || null,
    analista: o.analista.nome,
    createdAt: o.createdAt.toISOString(),
    resolvidoEm: o.resolvidoEm ? o.resolvidoEm.toISOString() : null,
    causa: nomeCausa(o),
    solucao: nomeSolucao(o),
  }));

  const queryString = buildQueryString(sp);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Resumos Executivos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {linhas.length} ocorrência{linhas.length === 1 ? "" : "s"} encontrada
            {linhas.length === 1 ? "" : "s"}, de qualquer status.
          </p>
        </div>
        <ExportCsvButton href="/relatorios/executivo/export" queryString={queryString} />
      </div>

      <FiltrosResumoExecutivo analistas={analistas} tipos={tipos} parcerias={parcerias} filtros={filtros} />

      <TabelaResumoExecutivo linhas={linhas} />
    </div>
  );
}
