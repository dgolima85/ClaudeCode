import { STATUS_OCORRENCIA, STATUS_LABELS, STATUS_DOT_COLOR, type StatusOcorrencia } from "@/lib/status";

export type IndicadoresOcorrencias = {
  emAberto: number;
  porStatus: Record<StatusOcorrencia, number>;
  porOrigem: { nome: string; quantidade: number }[];
  idade: { ateTresDias: number; quatroASeteDias: number; maisDeUmaSemana: number };
  semTicket: number;
  maisAntigaDias: number | null;
};

type IndicadoresOcorrenciasPanelProps = {
  dados: IndicadoresOcorrencias;
};

export default function IndicadoresOcorrenciasPanel({ dados }: IndicadoresOcorrenciasPanelProps) {
  const origensVisiveis = dados.porOrigem.slice(0, 4);
  const origensRestantes = dados.porOrigem.length - origensVisiveis.length;
  const temRodape = dados.semTicket > 0 || dados.maisAntigaDias !== null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl leading-none font-semibold text-gray-900 dark:text-gray-100">
          {dados.emAberto}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">ocorrências em aberto</span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {STATUS_OCORRENCIA.map((status) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT_COLOR[status]}`} />
            <span className="truncate">{STATUS_LABELS[status]}</span>
            <span className="ml-auto shrink-0 font-medium text-gray-800 dark:text-gray-200">
              {dados.porStatus[status]}
            </span>
          </div>
        ))}
      </div>

      {origensVisiveis.length > 0 && (
        <div>
          <span className="block text-[11px] font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
            Por origem
          </span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {origensVisiveis.map((o) => (
              <span
                key={o.nome}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {o.nome} <span className="font-medium">{o.quantidade}</span>
              </span>
            ))}
            {origensRestantes > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                +{origensRestantes}
              </span>
            )}
          </div>
        </div>
      )}

      <div>
        <span className="block text-[11px] font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
          Tempo em aberto
        </span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            até 3 dias <span className="font-medium">{dados.idade.ateTresDias}</span>
          </span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            4–7 dias <span className="font-medium">{dados.idade.quatroASeteDias}</span>
          </span>
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] text-red-700 dark:bg-red-900/40 dark:text-red-300">
            +7 dias <span className="font-medium">{dados.idade.maisDeUmaSemana}</span>
          </span>
        </div>
      </div>

      {temRodape && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-100 pt-2 text-[11px] text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {dados.semTicket > 0 && <span>{dados.semTicket} sem ticket</span>}
          {dados.maisAntigaDias !== null && (
            <span>
              mais antiga: {dados.maisAntigaDias} {dados.maisAntigaDias === 1 ? "dia" : "dias"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
