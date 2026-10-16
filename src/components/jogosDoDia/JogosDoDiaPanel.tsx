import { idadeCurta } from "@/lib/dataHoraBR";
import type { JogoDoDiaLinha } from "@/lib/jogosDoDia/consulta";

type JogosDoDiaPanelProps = {
  jogos: JogoDoDiaLinha[];
  ultimoSucessoEm: string | null;
  ultimoErro: string | null;
};

function JogoCard({ jogo }: { jogo: JogoDoDiaLinha }) {
  return (
    <div className="rounded-md border border-gray-200 p-2 dark:border-gray-700">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 text-sm font-medium break-words text-gray-800 dark:text-gray-200">
          {jogo.mandante} x {jogo.visitante}
        </span>
        <span className="shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">{jogo.horario}</span>
      </div>
      <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
        {jogo.campeonato}
        {jogo.estadio && ` — ${jogo.estadio}`}
        {jogo.cidade && `, ${jogo.cidade}`}
      </p>
      {jogo.canais.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {jogo.canais.map((canal) => (
            <span
              key={canal}
              className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {canal}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Mesma estrutura externa do antigo IndicadoresOcorrenciasPanel (que esse
// quadro substitui nessa home — ver src/lib/ocorrencias/indicadores.ts para
// onde a lógica dele foi guardada): h-full faz o card acompanhar a altura
// do painel de Plantonistas ao lado, dentro da mesma grid.
export default function JogosDoDiaPanel({ jogos, ultimoSucessoEm, ultimoErro }: JogosDoDiaPanelProps) {
  // Só vira um aviso de erro quando NUNCA houve sincronização bem-sucedida
  // — uma falha pontual com dados antigos ainda válidos no banco não deve
  // alarmar quem está vendo o painel, só o log/monitoramento da rotina.
  const mostrarErro = jogos.length === 0 && !ultimoSucessoEm && ultimoErro;

  return (
    <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-700">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Jogos de Hoje</h2>
        {ultimoSucessoEm && (
          <span className="text-[11px] text-gray-400 dark:text-gray-500">
            atualizado há {idadeCurta(ultimoSucessoEm)}
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {mostrarErro && (
          <p className="text-xs text-red-600 dark:text-red-400">Não foi possível atualizar os jogos: {ultimoErro}</p>
        )}
        {!mostrarErro && jogos.length === 0 && (
          <p className="py-2 text-center text-sm text-gray-400 dark:text-gray-500">
            Nenhum jogo hoje nos campeonatos acompanhados.
          </p>
        )}
        {jogos.map((jogo) => (
          <JogoCard key={jogo.id} jogo={jogo} />
        ))}
      </div>
    </div>
  );
}
