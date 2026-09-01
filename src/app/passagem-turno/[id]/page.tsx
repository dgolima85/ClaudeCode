import { notFound } from "next/navigation";
import { getAnalistaLogado } from "@/lib/session";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { TURNO_LABELS } from "@/lib/turno";
import {
  STATUS_PASSAGEM_TURNO_LABELS,
  STATUS_PASSAGEM_TURNO_DOT_COLOR,
} from "@/lib/statusPassagemTurno";
import { buscarPassagemTurno } from "../actions";
import TabelaOcorrenciasFiltravel from "@/components/relatorios/TabelaOcorrenciasFiltravel";
import ConfirmarPassagemTurnoButton from "@/components/passagemTurno/ConfirmarPassagemTurnoButton";

export default async function PassagemTurnoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [passagem, analistaLogado] = await Promise.all([
    buscarPassagemTurno(id),
    getAnalistaLogado(),
  ]);
  if (!passagem) notFound();

  const isAberta = passagem.status === "ABERTA";
  const isQuemEntregou = analistaLogado?.id === passagem.analistaEntregaId;
  const podeConfirmar = isAberta && !!analistaLogado?.id && !isQuemEntregou;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {TURNO_LABELS[passagem.turnoOrigem]} → {TURNO_LABELS[passagem.turnoDestino]}
        </h1>
        <span className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span
            className={`h-2.5 w-2.5 rounded-full ${STATUS_PASSAGEM_TURNO_DOT_COLOR[passagem.status]}`}
          />
          {STATUS_PASSAGEM_TURNO_LABELS[passagem.status]}
        </span>
      </div>

      <section className="grid grid-cols-1 gap-4 rounded-md border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2 dark:border-gray-700 dark:bg-gray-800">
        <div>
          <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            Entregue por
          </span>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {passagem.analistaEntrega} em {formatarDataHoraBR(passagem.createdAt)}
          </p>
        </div>
        <div>
          <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            Recebido por
          </span>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {passagem.analistaRecebe
              ? `${passagem.analistaRecebe} em ${formatarDataHoraBR(passagem.confirmadaEm!)}`
              : "—"}
          </p>
        </div>
        {passagem.observacoes && (
          <div className="sm:col-span-2">
            <span className="block text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
              Observações
            </span>
            <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {passagem.observacoes}
            </p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Ocorrências em aberto no momento da passagem ({passagem.ocorrencias.length})
        </h2>
        <TabelaOcorrenciasFiltravel linhas={passagem.ocorrencias} />
      </section>

      {podeConfirmar && <ConfirmarPassagemTurnoButton id={passagem.id} />}
      {isAberta && isQuemEntregou && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Aguardando quem assumir o turno seguinte confirmar o recebimento. Você entregou esta
          passagem e não pode confirmá-la.
        </p>
      )}
    </div>
  );
}
