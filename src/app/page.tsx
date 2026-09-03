import Link from "next/link";
import { prisma } from "@/lib/prisma";
import OcorrenciasTable from "@/components/ocorrencias/OcorrenciasTable";
import FiltroStatus from "@/components/ocorrencias/FiltroStatus";
import NovaOcorrenciaForm from "@/components/ocorrencias/NovaOcorrenciaForm";
import AvisosPanel from "@/components/avisos/AvisosPanel";
import IndicadoresOcorrenciasPanel, {
  type IndicadoresOcorrencias,
} from "@/components/ocorrencias/IndicadoresOcorrenciasPanel";
import { STATUS_OCORRENCIA, isStatusOcorrencia, type StatusOcorrencia } from "@/lib/status";
import { ordenarComNaPrimeiro } from "@/lib/ordenarListaReferencia";
import { isModeloAviso, type ModeloAviso } from "@/lib/aviso";
import { criarOcorrencia } from "@/app/ocorrencias/actions";
import { buscarPendentesPassagemTurno } from "@/app/passagem-turno/actions";
import { TURNO_LABELS } from "@/lib/turno";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; ocorrencia?: string }>;
}) {
  const sp = await searchParams;
  const statusParamBruto = sp.status;
  const statusFiltro: StatusOcorrencia[] =
    statusParamBruto === undefined
      ? ["EM_ANDAMENTO", "AGUARDANDO_VALIDACAO", "PENDENTE_CAUSA"]
      : (Array.isArray(statusParamBruto) ? statusParamBruto : [statusParamBruto]).filter(
          isStatusOcorrencia,
        );

  const [
    ocorrencias,
    tiposBrutos,
    todosOsTipos,
    avisosBrutos,
    pendentesPassagemTurno,
    statusCounts,
    origemCounts,
    ocorrenciasEmAbertoResumo,
  ] = await Promise.all([
    prisma.ocorrencia.findMany({
      where: statusFiltro.length > 0 ? { status: { in: statusFiltro } } : undefined,
      include: { tipo: true, analista: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tipoOcorrencia.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
    prisma.tipoOcorrencia.findMany({ select: { id: true, nome: true } }),
    prisma.aviso.findMany({
      where: { expiraEm: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
    buscarPendentesPassagemTurno(),
    // Indicadores da Home: independem do filtro de status aplicado à tabela
    // abaixo, então são buscados à parte, sempre sobre todas as ocorrências.
    prisma.ocorrencia.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.ocorrencia.groupBy({
      by: ["tipoId"],
      where: { status: { not: "RESOLVIDO" } },
      _count: { _all: true },
    }),
    prisma.ocorrencia.findMany({
      where: { status: { not: "RESOLVIDO" } },
      select: { createdAt: true, ticket: true },
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

  const porStatus = Object.fromEntries(
    STATUS_OCORRENCIA.map((status) => [status, 0]),
  ) as Record<StatusOcorrencia, number>;
  for (const c of statusCounts) {
    if (isStatusOcorrencia(c.status)) porStatus[c.status] = c._count._all;
  }
  const emAberto = porStatus.EM_ANDAMENTO + porStatus.AGUARDANDO_VALIDACAO + porStatus.PENDENTE_CAUSA;

  const nomeTipoPorId = new Map(todosOsTipos.map((t) => [t.id, t.nome]));
  const porOrigem = origemCounts
    .map((c) => ({ nome: nomeTipoPorId.get(c.tipoId) ?? "—", quantidade: c._count._all }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const agora = new Date().getTime();
  const idade = { ateTresDias: 0, quatroASeteDias: 0, maisDeUmaSemana: 0 };
  let semTicket = 0;
  let maisAntigaDias: number | null = null;
  for (const o of ocorrenciasEmAbertoResumo) {
    const dias = Math.floor((agora - o.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (dias <= 3) idade.ateTresDias += 1;
    else if (dias <= 7) idade.quatroASeteDias += 1;
    else idade.maisDeUmaSemana += 1;
    if (!o.ticket) semTicket += 1;
    if (maisAntigaDias === null || dias > maisAntigaDias) maisAntigaDias = dias;
  }

  const indicadores: IndicadoresOcorrencias = {
    emAberto,
    porStatus,
    porOrigem,
    idade,
    semTicket,
    maisAntigaDias,
  };

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
      {pendentesPassagemTurno.length > 0 && (
        <Link
          href="/passagem-turno"
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-yellow-500 bg-yellow-50 p-3 text-sm hover:bg-yellow-100 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60"
        >
          <span className="font-medium text-yellow-800 dark:text-yellow-300">
            {pendentesPassagemTurno.length === 1
              ? `Você tem uma passagem de turno pendente de confirmação (${TURNO_LABELS[pendentesPassagemTurno[0].turnoOrigem]} → ${TURNO_LABELS[pendentesPassagemTurno[0].turnoDestino]}, de ${pendentesPassagemTurno[0].analistaEntrega})`
              : `Você tem ${pendentesPassagemTurno.length} passagens de turno pendentes de confirmação`}
          </span>
          <span className="text-xs font-medium text-yellow-700 underline dark:text-yellow-400">
            Revisar e confirmar
          </span>
        </Link>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ocorrências</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Registre e acompanhe as ocorrências do turno. Clique em ⤢ para abrir os detalhes.
            </p>
          </div>

          <FiltroStatus
            statusSelecionados={statusFiltro}
            filtroAlteradoPeloUsuario={statusParamBruto !== undefined}
          />
        </div>

        <IndicadoresOcorrenciasPanel dados={indicadores} />
      </div>

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
