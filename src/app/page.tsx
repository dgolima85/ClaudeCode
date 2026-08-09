import { prisma } from "@/lib/prisma";
import OcorrenciasTable from "@/components/ocorrencias/OcorrenciasTable";
import FiltroStatus from "@/components/ocorrencias/FiltroStatus";
import { isStatusOcorrencia, type StatusOcorrencia } from "@/lib/status";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; ocorrencia?: string }>;
}) {
  const sp = await searchParams;
  const statusParamBruto = sp.status;
  const statusFiltro = (
    Array.isArray(statusParamBruto) ? statusParamBruto : statusParamBruto ? [statusParamBruto] : []
  ).filter(isStatusOcorrencia);

  const [ocorrencias, tipos] = await Promise.all([
    prisma.ocorrencia.findMany({
      where: statusFiltro.length > 0 ? { status: { in: statusFiltro } } : undefined,
      include: { tipo: true, analista: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tipoOcorrencia.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  const linhas = ocorrencias.map((o) => ({
    id: o.id,
    status: o.status as StatusOcorrencia,
    titulo: o.titulo,
    ticket: o.ticket,
    createdAt: o.createdAt.toISOString(),
    resolvidoEm: o.resolvidoEm ? o.resolvidoEm.toISOString() : null,
    tipo: { id: o.tipo.id, nome: o.tipo.nome },
    analista: { id: o.analista.id, nome: o.analista.nome },
  }));

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Ocorrências</h1>
        <p className="text-sm text-gray-500">
          Registre e acompanhe as ocorrências do turno. Clique em ⤢ para abrir os detalhes.
        </p>
      </div>

      <FiltroStatus statusSelecionados={statusFiltro} />

      {tipos.length === 0 && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Nenhum tipo de ocorrência cadastrado. Cadastre ao menos um em Administração →
          Tipos de Ocorrência antes de registrar ocorrências.
        </p>
      )}

      <OcorrenciasTable ocorrencias={linhas} tipos={tipos} ocorrenciaAbertaId={sp.ocorrencia} />
    </div>
  );
}
