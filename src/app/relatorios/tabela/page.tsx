import { prisma } from "@/lib/prisma";
import FiltrosRelatorioTabela from "@/components/relatorios/FiltrosRelatorioTabela";
import ExportCsvButton from "@/components/relatorios/ExportCsvButton";
import TabelaOcorrenciasFiltravel from "@/components/relatorios/TabelaOcorrenciasFiltravel";
import { parseFiltros, montarWhereOcorrencia, buildQueryString, type SearchParamsRelatorio } from "@/lib/relatorios";
import type { StatusOcorrencia } from "@/lib/status";
import type { Turno } from "@/lib/turno";

export default async function RelatorioTabelaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsRelatorio>;
}) {
  const sp = await searchParams;
  const filtros = parseFiltros(sp);
  const where = montarWhereOcorrencia(filtros);

  const [ocorrencias, analistas, tipos, parcerias] = await Promise.all([
    prisma.ocorrencia.findMany({
      where,
      include: { tipo: true, analista: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.analista.findMany({ orderBy: { nome: "asc" } }),
    prisma.tipoOcorrencia.findMany({ orderBy: { nome: "asc" } }),
    prisma.parceria.findMany({ orderBy: { nome: "asc" } }),
  ]);

  const linhas = ocorrencias.map((o) => ({
    id: o.id,
    status: o.status as StatusOcorrencia,
    titulo: o.titulo,
    ticket: o.ticket,
    createdAt: o.createdAt.toISOString(),
    resolvidoEm: o.resolvidoEm ? o.resolvidoEm.toISOString() : null,
    tipo: o.tipo.nome,
    analista: o.analista.nome,
    turno: o.analista.turno as Turno,
  }));

  const queryString = buildQueryString(sp);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tabela de Ocorrências</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {linhas.length} ocorrência{linhas.length === 1 ? "" : "s"} encontrada
            {linhas.length === 1 ? "" : "s"}.
          </p>
        </div>
        <ExportCsvButton href="/relatorios/tabela/export" queryString={queryString} />
      </div>

      <FiltrosRelatorioTabela analistas={analistas} tipos={tipos} parcerias={parcerias} filtros={filtros} />

      <TabelaOcorrenciasFiltravel linhas={linhas} />
    </div>
  );
}
