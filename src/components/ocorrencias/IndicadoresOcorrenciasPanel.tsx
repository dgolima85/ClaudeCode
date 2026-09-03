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

function RotuloSecao({ children }: { children: React.ReactNode }) {
  return (
    <span className="block text-[11px] font-medium tracking-wide text-gray-400 uppercase dark:text-gray-500">
      {children}
    </span>
  );
}

export default function IndicadoresOcorrenciasPanel({ dados }: IndicadoresOcorrenciasPanelProps) {
  const origensVisiveis = dados.porOrigem.slice(0, 4);
  const origensRestantes = dados.porOrigem.length - origensVisiveis.length;
  const temRodape = dados.semTicket > 0 || dados.maisAntigaDias !== null;

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-wrap">
        <div className="flex flex-1 basis-40 items-start gap-3 p-3">
          <div className="shrink-0">
            <div className="text-2xl leading-none font-semibold text-gray-900 dark:text-gray-100">
              {dados.emAberto}
            </div>
            <div className="mt-1 text-[11px] whitespace-nowrap text-gray-500 dark:text-gray-400">em aberto</div>
          </div>
          <div className="flex flex-col gap-0.5">
            {STATUS_OCORRENCIA.map((status) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_COLOR[status]}`} />
                <span className="whitespace-nowrap">{STATUS_LABELS[status]}</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">{dados.porStatus[status]}</span>
              </div>
            ))}
          </div>
        </div>

        {origensVisiveis.length > 0 && (
          <div className="flex-1 basis-48 border-t border-gray-200 p-3 sm:border-t-0 sm:border-l dark:border-gray-700">
            <RotuloSecao>Por origem</RotuloSecao>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
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

        <div className="flex-1 basis-48 border-t border-gray-200 p-3 sm:border-t-0 sm:border-l dark:border-gray-700">
          <RotuloSecao>Tempo em aberto</RotuloSecao>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
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
      </div>

      {temRodape && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-200 px-3 py-2 text-[11px] text-gray-500 dark:border-gray-700 dark:text-gray-400">
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
