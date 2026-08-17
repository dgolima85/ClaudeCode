import TabelaOcorrenciasFiltravel, { type LinhaRelatorio } from "./TabelaOcorrenciasFiltravel";

type PassagemTurnoResumoProps = {
  emAberto: LinhaRelatorio[];
  atividade: LinhaRelatorio[];
};

export default function PassagemTurnoResumo({ emAberto, atividade }: PassagemTurnoResumoProps) {
  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Em Aberto ({emAberto.length})
        </h2>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Todas as ocorrências não resolvidas do sistema, independente de data — leitura obrigatória
          para quem assume o turno.
        </p>
        <TabelaOcorrenciasFiltravel linhas={emAberto} />
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Atividade no Período ({atividade.length})
        </h2>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
          Ocorrências criadas, atualizadas ou com eventos registrados no turno e data selecionados.
        </p>
        <TabelaOcorrenciasFiltravel linhas={atividade} />
      </section>
    </div>
  );
}
