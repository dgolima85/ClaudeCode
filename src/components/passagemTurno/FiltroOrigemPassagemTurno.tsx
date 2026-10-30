"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { ORIGENS_PASSAGEM_TURNO, ORIGEM_PASSAGEM_TURNO_LABELS, type OrigemPassagemTurno } from "@/lib/origemPassagemTurno";

type FiltroOrigemPassagemTurnoProps = {
  origemSelecionada: OrigemPassagemTurno | null;
};

const CLASSE_BOTAO_ATIVO = "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500";
const CLASSE_BOTAO_INATIVO =
  "border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800";

// Diferente do FiltroStatus/FiltroOrigem da Home, aqui não existe opção
// "Todas as Origens": o analista sempre registra a passagem de turno de uma
// origem por vez (ver criarPassagemTurno em src/app/passagem-turno/actions.ts),
// então nada começa selecionado por padrão.
export default function FiltroOrigemPassagemTurno({ origemSelecionada }: FiltroOrigemPassagemTurnoProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function selecionar(valor: OrigemPassagemTurno) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("origem", valor);
    // Navegação "dura" (recarrega a página) em vez de client-side router: ver
    // o mesmo comentário em FiltroStatus.tsx — navegações client-side que só
    // trocam querystring na mesma rota podiam reaproveitar dados de uma
    // navegação anterior por engano nessa versão do Next.js.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- ver comentário acima: é proposital, não um descuido.
    window.location.assign(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Origem da passagem:</span>
      {ORIGENS_PASSAGEM_TURNO.map((valor) => (
        <button
          key={valor}
          type="button"
          onClick={() => selecionar(valor)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            origemSelecionada === valor ? CLASSE_BOTAO_ATIVO : CLASSE_BOTAO_INATIVO
          }`}
        >
          {ORIGEM_PASSAGEM_TURNO_LABELS[valor]}
        </button>
      ))}
    </div>
  );
}
