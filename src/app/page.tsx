import { prisma } from "@/lib/prisma";
import OcorrenciasTable from "@/components/ocorrencias/OcorrenciasTable";
import FiltroStatus from "@/components/ocorrencias/FiltroStatus";
import NovaOcorrenciaForm from "@/components/ocorrencias/NovaOcorrenciaForm";
import AvisosPanel from "@/components/avisos/AvisosPanel";
import { isStatusOcorrencia, type StatusOcorrencia } from "@/lib/status";
import { ordenarComNaPrimeiro } from "@/lib/ordenarListaReferencia";
import { isModeloAviso, type ModeloAviso } from "@/lib/aviso";
import { criarOcorrencia } from "@/app/ocorrencias/actions";

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

  const [ocorrencias, tiposBrutos, avisosBrutos] = await Promise.all([
    prisma.ocorrencia.findMany({
      where: statusFiltro.length > 0 ? { status: { in: statusFiltro } } : undefined,
      include: { tipo: true, analista: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tipoOcorrencia.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    prisma.aviso.findMany({
      where: { expiraEm: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const tipos = ordenarComNaPrimeiro(tiposBrutos);
  const avisos = avisosBrutos
    .filter((a) => isModeloAviso(a.modelo))
    .map((a) => ({
      id: a.id,
      modelo: a.modelo as ModeloAviso,
      descricao: a.descricao,
      expiraEm: a.expiraEm.toISOString(),
    }));

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
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ocorrências</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Registre e acompanhe as ocorrências do turno. Clique em ⤢ para abrir os detalhes.
        </p>
      </div>

      <FiltroStatus statusSelecionados={statusFiltro} />

      {tipos.length === 0 && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 dark:bg-yellow-900/40 dark:text-yellow-300">
          Nenhum tipo de ocorrência cadastrado. Cadastre ao menos um em Administração →
          Tipos de Ocorrência antes de registrar ocorrências.
        </p>
      )}

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <NovaOcorrenciaForm tipos={tipos} onCriar={criarOcorrencia} />
        <AvisosPanel avisos={avisos} />
      </div>

      <OcorrenciasTable ocorrencias={linhas} tipos={tipos} ocorrenciaAbertaId={sp.ocorrencia} />
    </div>
  );
}
