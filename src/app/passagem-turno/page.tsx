import Link from "next/link";
import { formatarDataHoraBR } from "@/lib/dataHoraBR";
import { TURNO_LABELS } from "@/lib/turno";
import { buscarPendentesPassagemTurno, buscarOcorrenciasEmAbertoPreview } from "./actions";
import NovaPassagemTurnoForm from "@/components/passagemTurno/NovaPassagemTurnoForm";
import TabelaOcorrenciasFiltravel from "@/components/relatorios/TabelaOcorrenciasFiltravel";

export default async function PassagemTurnoPage() {
  const [pendentes, ocorrenciasEmAberto] = await Promise.all([
    buscarPendentesPassagemTurno(),
    buscarOcorrenciasEmAbertoPreview(),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Passagem de Turno</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Registre a passagem ao final do seu turno e confirme o recebimento de uma passagem pendente.
        </p>
      </div>

      {pendentes.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Pendentes de confirmação ({pendentes.length})
          </h2>
          <div className="flex flex-col gap-2">
            {pendentes.map((p) => (
              <Link
                key={p.id}
                href={`/passagem-turno/${p.id}`}
                className="flex items-center justify-between rounded-lg border border-yellow-500 bg-yellow-50 p-3 text-sm hover:bg-yellow-100 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60"
              >
                <span className="text-yellow-800 dark:text-yellow-300">
                  {TURNO_LABELS[p.turnoOrigem]} → {TURNO_LABELS[p.turnoDestino]} · entregue por{" "}
                  {p.analistaEntrega}
                </span>
                <span className="text-xs text-yellow-700 dark:text-yellow-400">
                  {formatarDataHoraBR(p.createdAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Fazer passagem de turno
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          As {ocorrenciasEmAberto.length} ocorrências abaixo, ainda em aberto, serão anexadas
          automaticamente para quem assumir o próximo turno revisar e confirmar o recebimento.
        </p>
        <TabelaOcorrenciasFiltravel linhas={ocorrenciasEmAberto} />
        <NovaPassagemTurnoForm />
      </section>
    </div>
  );
}
