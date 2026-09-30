import RoteiroTestesHome from "@/components/roteiroTeste/RoteiroTestesHome";
import { listarExecucoesRoteiroTeste } from "./actions";

export default async function RoteiroTestesPage() {
  const execucoes = await listarExecucoesRoteiroTeste();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Roteiro de Testes</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Execute a rotina de testes diária (TV, Web ou Mobile) e consulte execuções anteriores.
        </p>
      </div>

      <RoteiroTestesHome execucoesIniciais={execucoes} />
    </div>
  );
}
